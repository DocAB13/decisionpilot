import type { DecisionCategory } from '@/core/decision/Decision.constants'
import type {
  AlternativeItem,
  AlternativesContent,
  ConstraintItem,
  ConstraintsContent,
  ContextContent,
  FinalDecisionContent,
  GoalContent,
} from '@/core/decision/Decision.types'
import { sanitizeForPrompt } from './sanitize'

export const PROMPT_VERSIONS = {
  interview_suggestions: 'interview-suggestions-v1.0',
  interview_conflict:    'interview-conflict-v1.0',
  analysis:              'analysis-v1.0',
  recommendation:        'recommendation-v1.0',
  action_plan:           'action-plan-v1.0',
  chat:                  'chat-v1.0',
} as const

export type PromptVersionKey = keyof typeof PROMPT_VERSIONS
export type PromptVersionString = typeof PROMPT_VERSIONS[PromptVersionKey]

export interface PromptPair {
  system: string
  user: string
  version: PromptVersionString
}

// Interview Engine — Alternative Enrichment (H11 §2.1)
export interface SuggestionInput {
  readonly decision_id: string
  readonly category: DecisionCategory
  readonly goal: GoalContent
  readonly existing_alternatives: ReadonlyArray<Pick<AlternativeItem, 'name'>>
}

// Interview Engine — Conflict Detection (H11 §2.6)
export interface ConflictInput {
  readonly decision_id: string
  readonly goal: GoalContent
  readonly hard_constraints: ReadonlyArray<ConstraintItem>
}

// Analysis Engine (H11 §2.2, §3.1): category, context, goal, constraints, alternatives
export interface DecisionAnalysisInput {
  readonly decision_id: string
  readonly category: DecisionCategory
  readonly context: ContextContent
  readonly goal: GoalContent
  readonly constraints: ConstraintsContent
  readonly alternatives: AlternativesContent
}

// Recommendation Engine (H11 §2.3, §3.1): goal, constraints, alternatives, analysis output
export interface RecommendationInput {
  readonly decision_id: string
  readonly category: DecisionCategory
  readonly goal: GoalContent
  readonly constraints: ConstraintsContent
  readonly alternatives: AlternativesContent
  readonly analysis: unknown
}

// Action Plan Engine (H11 §2.4, §3.1): category, chosen alternative, context, goal, constraints
export interface ActionPlanInput {
  readonly decision_id: string
  readonly category: DecisionCategory
  readonly chosen_alternative: FinalDecisionContent
  readonly context: ContextContent
  readonly goal: GoalContent
  readonly constraints: ConstraintsContent
}

// ---------------------------------------------------------------------------
// Professional advice disclaimer constants (H11 §8.3)
// Must not be modified without a major version increment and an ADR.
// ---------------------------------------------------------------------------

export const PROFESSIONAL_DISCLAIMER_FINANCIAL =
  'This analysis supports a personal decision and is not financial advice. For decisions involving significant financial commitments, consult a qualified financial advisor.'

export const PROFESSIONAL_DISCLAIMER_HEALTH =
  'This analysis supports a personal decision about health services or products. It is not medical advice. Consult a qualified healthcare professional before making health decisions.'

export const PROFESSIONAL_DISCLAIMER_INSURANCE =
  'This analysis supports a personal decision about insurance products. It is not professional insurance advice. Review policy terms carefully and consider consulting an independent insurance broker.'

export const PROFESSIONAL_DISCLAIMER_LEGAL =
  'This analysis supports a personal decision and is not legal advice. For decisions with legal implications, consult a qualified legal professional.'

// ---------------------------------------------------------------------------
// Analysis Engine prompt builder (H11 §2.2, §3.1, §4.3, §8.3, §9.2, §9.3)
// ---------------------------------------------------------------------------

// Shorthand so every user-supplied string is sanitized before injection.
function s(text: string): string {
  return sanitizeForPrompt(text)
}

function formatContext(ctx: ContextContent): string {
  return [
    `Background: ${s(ctx.background)}`,
    `Current situation: ${s(ctx.current_situation)}`,
    ctx.prior_attempts ? `Prior attempts: ${s(ctx.prior_attempts)}` : null,
    ctx.timing_constraints ? `Timing constraints: ${s(ctx.timing_constraints)}` : null,
    `Geographic market: ${s(ctx.geographic_market)}`,
    `Currency: ${s(ctx.currency)}`,
  ]
    .filter((x): x is string => x !== null)
    .join('\n')
}

function formatGoal(goal: GoalContent): string {
  return [
    `Primary goal: ${s(goal.primary)}`,
    goal.success_criteria ? `Success criteria: ${s(goal.success_criteria)}` : null,
    goal.time_horizon ? `Time horizon: ${s(goal.time_horizon)}` : null,
    goal.secondary_goals.length > 0
      ? `Secondary goals: ${goal.secondary_goals.map(g => s(g)).join('; ')}`
      : null,
  ]
    .filter((x): x is string => x !== null)
    .join('\n')
}

function formatConstraintItem(c: ConstraintItem, idx: number): string {
  const base = `${idx}. [${c.type.toUpperCase()}] ${s(c.description)}`
  const value = c.value
    ? `   Value: ${s(c.value)}${c.unit ? ' ' + s(c.unit) : ''}`
    : null
  return [base, value].filter(Boolean).join('\n')
}

function formatConstraints(constraints: ConstraintsContent): string {
  const hard = constraints.hard.length > 0
    ? `Hard constraints (must be satisfied):\n${constraints.hard.map((c, i) => formatConstraintItem(c, i + 1)).join('\n')}`
    : 'Hard constraints: None'
  const soft = constraints.soft.length > 0
    ? `Soft constraints (preferences):\n${constraints.soft.map((c, i) => formatConstraintItem(c, i + 1)).join('\n')}`
    : 'Soft constraints: None'
  return `${hard}\n\n${soft}`
}

function formatAlternatives(alternatives: AlternativesContent): string {
  return alternatives.alternatives.map((a, idx) => {
    const lines = [`Alternative ${idx + 1}: ${s(a.name)} (id: ${a.id})`]
    if (a.user_notes) lines.push(`  Notes: ${s(a.user_notes)}`)
    return lines.join('\n')
  }).join('\n')
}

// No-real-time-data instruction (H11 §9.3) — verbatim
const MARKET_DATA_CAVEAT_INSTRUCTION =
  "You do not have real-time data. You do not know today's mortgage rates, current smartphone prices, or live insurance premiums. If your analysis involves market-sensitive information, set market_data_caveat to a non-empty string explaining what current data the user should verify before finalizing their decision."

function buildCategoryRules(category: DecisionCategory): string {
  const rules: string[] = []

  // market_data_caveat required for financial, technology, insurance (H11 §9.3)
  if (category === 'financial' || category === 'technology' || category === 'insurance') {
    rules.push(MARKET_DATA_CAVEAT_INSTRUCTION)
  }

  // Professional disclaimer required for financial, health, insurance, legal (H11 §8.3)
  const disclaimerMap: Partial<Record<DecisionCategory, string>> = {
    financial: PROFESSIONAL_DISCLAIMER_FINANCIAL,
    health:    PROFESSIONAL_DISCLAIMER_HEALTH,
    insurance: PROFESSIONAL_DISCLAIMER_INSURANCE,
  }
  const disclaimer = disclaimerMap[category]
  if (disclaimer) {
    rules.push(`Set professional_advice_disclaimer to exactly: "${disclaimer}"`)
  }

  if (rules.length === 0) return ''
  return `CATEGORY-SPECIFIC RULES (${category.toUpperCase()}):\n${rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
}

// Output schema spec embedded in the system prompt (H11 §4.3 §5 OUTPUT FORMAT)
const ANALYSIS_OUTPUT_SCHEMA = `OUTPUT FORMAT:
Respond with valid JSON only. The first character of your response must be '{'. Do not include any text before or after the JSON object.

Required schema:
{
  "per_alternative": [
    {
      "alternative_id": "<uuid from input>",
      "alternative_name": "<name from input>",
      "pros": [
        { "title": "<brief title>", "detail": "<specific to this user's inputs>", "specific_to_user": true }
      ],
      "cons": [
        { "title": "<brief title>", "detail": "<specific to this user's inputs>", "specific_to_user": true }
      ],
      "risks": [
        { "title": "<brief title>", "detail": "<specific detail>", "severity": "low | medium | high", "likelihood": "low | medium | high", "mitigation": "<string or null>" }
      ],
      "goal_fit_assessment": "<how well this alternative fits the primary goal>",
      "constraint_compliance": {
        "hard_constraints_satisfied": true,
        "hard_constraint_violations": [],
        "soft_constraints_satisfied": ["<constraint description>"],
        "soft_constraints_compromised": ["<constraint description>"]
      }
    }
  ],
  "cross_alternative": {
    "key_differentiators": ["<what separates these alternatives on the user's key dimensions>"],
    "commonly_overlooked_risks": ["<risks users in this category often miss>"],
    "information_gaps": [
      { "missing_information": "<what is missing>", "impact_on_analysis": "<why it matters>", "component_to_update": "context | goal | constraints | alternatives" }
    ]
  },
  "market_data_caveat": "<string or null>",
  "professional_advice_disclaimer": "<string or null>",
  "analysis_confidence": "high | medium | low",
  "confidence_rationale": "<explanation of confidence level>"
}`

export function buildAnalysisPrompt(input: DecisionAnalysisInput): PromptPair {
  const categoryRules = buildCategoryRules(input.category)

  const systemPrompt = [
    // 1. IDENTITY AND SCOPE (H11 §4.3)
    `IDENTITY AND SCOPE:
You are the Analysis Engine for DecisionOS. Your role is to evaluate each alternative against the user's context, goal, and constraints, and to produce the factual basis for a recommendation.
You are a thinking partner — not a decision-maker. The human is the decision-maker. This order is permanent.
You operate only within the Decision Object provided. You have no access to external data, the internet, or information the user has not explicitly provided.`,

    // 2. DECISION CONTEXT (H11 §4.3, §4.4) — all user text sanitized
    `DECISION CONTEXT:
Category: ${input.category}

CONTEXT:
${formatContext(input.context)}

GOAL:
${formatGoal(input.goal)}

CONSTRAINTS:
${formatConstraints(input.constraints)}

ALTERNATIVES TO ANALYZE:
${formatAlternatives(input.alternatives)}`,

    // 3. RULES (H11 §3.3, §7.5, §9.2, §9.3)
    `RULES:
1. Evaluate every alternative listed. Do not omit any alternative.
2. For each alternative: evaluate against every hard constraint (pass/fail), every soft constraint (degree of satisfaction), and the primary goal.
3. Generate a minimum of 2 pros and 2 cons per alternative. Generate a minimum of 1 risk per alternative.
4. Every pro, con, and risk must be specific to THIS user's inputs. If you could write the same point for a different user making a different decision in this category, it is not specific enough. Set specific_to_user to false for that point. It will be rejected and you will be asked to replace it with a user-specific point.
5. Cite the user. Every conclusion must reference something the user explicitly provided. "your stated budget of €X" is correct. "A reasonable budget" is not — it is an inference.
6. Acknowledge uncertainty. When the analysis cannot be confident, say so with specificity in confidence_rationale.
7. Separate facts from inferences. Distinguish between what the user stated and what you inferred. Inferences must be labeled as such in the detail text.
8. ${MARKET_DATA_CAVEAT_INSTRUCTION}
9. Identify a maximum of 3 information gaps in cross_alternative.information_gaps. If more than 3 exist, select the 3 most impactful. Set analysis_confidence to "low" when multiple important inputs are missing.
10. confidence_rationale is required regardless of confidence level. A "high" confidence output still requires a rationale.`,

    // 4. CATEGORY-SPECIFIC RULES (H11 §4.3, §8.3, §9.3)
    categoryRules,

    // 5. OUTPUT FORMAT (H11 §4.3)
    ANALYSIS_OUTPUT_SCHEMA,
  ].filter(Boolean).join('\n\n')

  return {
    system: systemPrompt,
    user:   'Analyze this decision and produce the required JSON output. The first character of your response must be \'{\'.',
    version: PROMPT_VERSIONS.analysis,
  }
}
