import type { DecisionCategory } from '@/core/decision/Decision.constants'
import type {
  AlternativeItem,
  AlternativesContent,
  ConstraintItem,
  ConstraintsContent,
  ContextContent,
  DecisionObject,
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

// Interview Engine — Alternative Enrichment (H11 §2.1, IR01-052)
export interface SuggestionInput {
  readonly decision_id: string
  readonly category: DecisionCategory
  readonly goal?: GoalContent
  readonly context_summary?: string   // First 200 chars of context background (H11 §4.2)
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

// ---------------------------------------------------------------------------
// Recommendation Engine prompt builder (H11 §12.1, §12.2, §12.3, §4.3)
// ---------------------------------------------------------------------------

// Output schema for the Recommendation Engine (H12 §6.7 component 7)
const RECOMMENDATION_OUTPUT_SCHEMA = `OUTPUT FORMAT:
Respond with valid JSON only. The first character of your response must be '{'. Do not include any text before or after the JSON object.

Required schema:
{
  "recommended_alternative_id": "<uuid of the recommended alternative, or null if tie>",
  "recommended_alternative_name": "<name of the recommended alternative, or null if tie>",
  "primary_reasoning": "<at least 50 characters; must reference at least two specific user inputs>",
  "supporting_factors": ["<concrete reason specific to user inputs>"],
  "honest_tradeoffs": "<what the winning alternative gives up relative to alternatives not chosen>",
  "runner_up_id": "<uuid of the runner-up alternative, or null>",
  "runner_up_name": "<name of the runner-up alternative, or null>",
  "margin_description": "<description of the margin between winner and runner-up, or null>",
  "conditions_for_change": "<specific, concrete conditions under which a different alternative would be recommended>",
  "tie_detected": false,
  "tie_explanation": "<required and non-null when tie_detected is true; null otherwise>",
  "confidence_level": "high | medium | low",
  "confidence_rationale": "<required regardless of confidence level>",
  "information_request": "<specific question for the user when confidence is medium or low; null otherwise>"
}`

export function buildRecommendationPrompt(input: RecommendationInput): PromptPair {
  const systemPrompt = [
    // 1. IDENTITY AND SCOPE (H11 §4.3)
    `IDENTITY AND SCOPE:
You are the Recommendation Engine for DecisionOS. Your role is to synthesize the structured analysis provided and produce a single clear recommendation with explained reasoning, honest trade-offs, and concrete conditions for change.
You are a thinking partner — not a decision-maker. The human is the decision-maker. This order is permanent.
You operate only on the Analysis output and Decision Object provided. You do not browse external data sources.`,

    // 2. DECISION CONTEXT (H11 §4.3, §4.4) — user text sanitized
    `DECISION CONTEXT:
Category: ${input.category}

GOAL:
${formatGoal(input.goal)}

CONSTRAINTS:
${formatConstraints(input.constraints)}

ALTERNATIVES:
${formatAlternatives(input.alternatives)}`,

    // 3. ANALYSIS RESULTS — AI-generated, no sanitization required
    `ANALYSIS RESULTS:
The following structured analysis was produced by the Analysis Engine. Use it as the factual basis for your recommendation.

${JSON.stringify(input.analysis, null, 2)}`,

    // 4. RULES — five Recommendation Contract terms + hard constraint enforcement (H11 §12.1, §12.2, §12.3)
    `RULES:
1. NEVER recommend an alternative that has hard_constraints_satisfied = false. This rule is absolute and cannot be overridden by any other consideration, including goal fit or soft constraint satisfaction.
2. If all alternatives have hard_constraints_satisfied = false, set recommended_alternative_id to null and set primary_reasoning to exactly: "All of your alternatives conflict with your stated hard constraints. Please review your constraints or add new alternatives."
3. Recommendation Contract — all five terms are required in every output:
   a. Named winner: identify one alternative as the best fit, or declare an explicit tie.
   b. Referenced reasoning: primary_reasoning must reference at least two specific inputs the user provided (e.g. "your stated budget of €X", "your 2-week deadline"). Generic reasoning violates this contract.
   c. Honest trade-offs: honest_tradeoffs must acknowledge what the winning alternative gives up relative to the alternatives not chosen.
   d. Conditions for change: conditions_for_change must state the specific, concrete conditions under which a different alternative would be recommended.
   e. Confidence with rationale: confidence_level and confidence_rationale are always required. A "high" confidence output still requires a rationale.
4. Tie detection: declare a tie only when two alternatives are genuinely indistinguishable on the dimensions that matter for the user's goal and constraints. Do not declare a tie because you are uncertain (that is low confidence, not a tie). Do not declare a tie when one alternative is slightly better on most dimensions (that is a margin decision).
5. Cite the user. Every conclusion must reference something the user explicitly provided.
6. confidence_rationale is required regardless of confidence level.
7. When confidence is medium or low, populate information_request with a specific question naming the exact variable and its impact on the analysis.`,

    // 5. OUTPUT FORMAT (H11 §4.3)
    RECOMMENDATION_OUTPUT_SCHEMA,
  ].join('\n\n')

  return {
    system:  systemPrompt,
    user:    'Synthesize the analysis and produce the recommendation in the required JSON format. The first character of your response must be \'{\'.',
    version: PROMPT_VERSIONS.recommendation,
  }
}

// ---------------------------------------------------------------------------
// Action Plan Engine prompt builder (H11 §2.4, §3.1, §4.3)
// Based on the chosen alternative from component 8, not the recommended
// alternative from component 7 (BR-03).
// ---------------------------------------------------------------------------

// Output schema for the Action Plan Engine (H12 §6.7 component 9)
const ACTION_PLAN_OUTPUT_SCHEMA = `OUTPUT FORMAT:
Respond with valid JSON only. The first character of your response must be '{'. Do not include any text before or after the JSON object.

Required schema:
{
  "based_on_alternative_id": "<uuid of the chosen alternative>",
  "based_on_alternative_name": "<name of the chosen alternative>",
  "action_items": [
    {
      "sequence": 1,
      "title": "<concise action title>",
      "detail": "<specific detail describing exactly what to do, referenced to the user's situation>",
      "estimated_effort": "low | medium | high",
      "time_estimate": "<human-readable estimate such as '2 days' or '1 week', or null>",
      "completed": false,
      "completed_at": null
    }
  ]
}

Constraints: action_items must contain between 3 and 5 items (inclusive). completed and completed_at are always false and null respectively in the initial plan.`

export function buildActionPlanPrompt(input: ActionPlanInput): PromptPair {
  const chosen = input.chosen_alternative

  const systemPrompt = [
    // 1. IDENTITY AND SCOPE (H11 §4.3)
    `IDENTITY AND SCOPE:
You are the Action Plan Engine for DecisionOS. The user has recorded their Final Decision and chosen an alternative. Your role is to generate 3–5 concrete, sequenced next steps specific to the chosen alternative and the user's situation.
You are planning for the CHOSEN alternative only: "${s(chosen.chosen_alternative_name)}". This is the alternative the user decided to pursue — it may or may not match the AI recommendation. Your plan must be based on this chosen alternative, not on any other alternative.
You are a thinking partner — not a decision-maker. The human has already decided.`,

    // 2. DECISION CONTEXT (H11 §4.3, §4.4) — all user text sanitized
    `DECISION CONTEXT:
Category: ${input.category}
Chosen alternative: ${s(chosen.chosen_alternative_name)} (id: ${chosen.chosen_alternative_id})
${chosen.divergence_reason ? `Divergence reason: ${s(chosen.divergence_reason)}` : ''}

CONTEXT:
${formatContext(input.context)}

GOAL:
${formatGoal(input.goal)}

CONSTRAINTS:
${formatConstraints(input.constraints)}`,

    // 3. RULES (H11 §2.4, §3.1)
    `RULES:
1. Generate between 3 and 5 action items. No fewer than 3, no more than 5.
2. Each action item must be specific to this user's chosen alternative ("${s(chosen.chosen_alternative_name)}") and their specific context, goal, and constraints. Generic steps that could apply to anyone in this category are not acceptable.
3. Sequence items by logical dependency — steps that must happen before others come first.
4. Each step must be concrete: name exactly what the user should do, referencing their specific situation where relevant.
5. Cite the user. Reference the user's actual context, goal, or constraints when explaining why each step matters.
6. Set estimated_effort to "low", "medium", or "high" based on the likely effort for this specific user.
7. Set time_estimate to a human-readable estimate (e.g. "1–2 days", "1 week") when you can reasonably estimate it, or null when the duration depends on factors outside the user's control.
8. Set completed to false and completed_at to null for all items — these are tracked by the user after the plan is generated.`,

    // 4. OUTPUT FORMAT (H11 §4.3)
    ACTION_PLAN_OUTPUT_SCHEMA,
  ].filter(Boolean).join('\n\n')

  return {
    system:  systemPrompt,
    user:    `Generate the action plan for the chosen alternative "${s(chosen.chosen_alternative_name)}" in the required JSON format. The first character of your response must be '{'.`,
    version: PROMPT_VERSIONS.action_plan,
  }
}

// ---------------------------------------------------------------------------
// Interview Engine — Alternative Suggestion prompt builder (H11 §2.1, §4.2, §4.3, §4.5)
// Triggered when the user has entered at least one alternative in the Wizard.
// ---------------------------------------------------------------------------

const SUGGESTION_OUTPUT_SCHEMA = `OUTPUT FORMAT:
Respond with valid JSON only. The first character of your response must be '{'. Do not include any text before or after the JSON object.

Required schema:
{
  "suggestions": [
    {
      "name": "<concise alternative name, 2–8 words>",
      "one_line_rationale": "<one sentence: why this alternative fits this user's specific situation>"
    }
  ]
}

Constraints: suggestions must contain between 0 and 3 items. Return fewer if you cannot identify meaningful distinct options — 1 strong suggestion is better than 3 weak ones. Never include alternatives that duplicate or closely overlap with the alternatives already listed.`

export function buildSuggestionPrompt(input: SuggestionInput): PromptPair {
  const existingList = input.existing_alternatives.length > 0
    ? input.existing_alternatives.map((a, i) => `${i + 1}. ${s(a.name)}`).join('\n')
    : 'None yet'

  const contextSection = input.context_summary
    ? `CONTEXT SUMMARY:\n${s(input.context_summary)}`
    : null

  const goalSection = input.goal
    ? `GOAL:\n${formatGoal(input.goal)}`
    : null

  const systemPrompt = [
    // 1. IDENTITY AND SCOPE (H11 §4.3)
    `IDENTITY AND SCOPE:
You are the Interview Engine for DecisionOS. Your role is to suggest up to 3 additional alternatives the user may not have considered, given their decision category and current inputs.
You are a thinking partner — not a decision-maker. The human is the decision-maker.
You operate only within the information provided. Do not invent specifics, claim real-time data, or reference external sources.`,

    // 2. DECISION CONTEXT (H11 §4.3, §4.4) — all user text sanitized
    [
      `DECISION CONTEXT:
Category: ${input.category}`,
      contextSection,
      goalSection,
      `EXISTING ALTERNATIVES (do not duplicate these):
${existingList}`,
    ].filter(Boolean).join('\n\n'),

    // 3. RULES (H11 §1.1, §1.3, §9.2)
    `RULES:
1. Suggest between 0 and 3 alternatives. Return an empty array if no meaningful additional options exist.
2. Never suggest an alternative that duplicates or closely overlaps with an existing alternative — even if named differently.
3. Each suggestion must be realistic and specific to the ${input.category} decision category.
4. Each suggestion must be distinct from every other suggestion in your response.
5. The one_line_rationale must reference something specific to this user's situation. Do not write generic rationales that could apply to anyone in this category.
6. Do not invent facts. Do not claim current prices, rates, or availability you cannot know.`,

    // 4. OUTPUT FORMAT (H11 §4.3)
    SUGGESTION_OUTPUT_SCHEMA,
  ].filter(Boolean).join('\n\n')

  return {
    system:  systemPrompt,
    user:    `Suggest up to 3 additional alternatives for this ${input.category} decision that are not already listed. The first character of your response must be '{'.`,
    version: PROMPT_VERSIONS.interview_suggestions,
  }
}

// ---------------------------------------------------------------------------
// Chat Engine system prompt builder (H11 §2.5, §6.1, §6.4, §7.2 FR-07.4, §8.4)
// Reconstructed on every API call from the current Decision Object state.
// Returns a string (not a PromptPair) — the Chat Engine manages user messages
// separately as a history array (H11 §4.2).
// ---------------------------------------------------------------------------

export function buildChatSystemPrompt(decision: DecisionObject): string {
  const components = decision.components

  // ── Component formatters — "Not yet provided" when component is absent ──

  function contextBlock(): string {
    const raw = components['1_context']?.content
    if (!raw) return 'CONTEXT: Not yet provided'
    const ctx = raw as ContextContent
    return `CONTEXT:\n${formatContext(ctx)}`
  }

  function goalBlock(): string {
    const raw = components['2_goal']?.content
    if (!raw) return 'GOAL: Not yet provided'
    const goal = raw as GoalContent
    return `GOAL:\n${formatGoal(goal)}`
  }

  function constraintsBlock(): string {
    const raw = components['3_constraints']?.content
    if (!raw) return 'CONSTRAINTS: Not yet provided'
    const constraints = raw as ConstraintsContent
    return `CONSTRAINTS:\n${formatConstraints(constraints)}`
  }

  function alternativesBlock(): string {
    const raw = components['4_alternatives']?.content
    if (!raw) return 'ALTERNATIVES: Not yet provided'
    const alts = raw as AlternativesContent
    return `ALTERNATIVES:\n${formatAlternatives(alts)}`
  }

  function recommendationBlock(): string {
    const raw = components['7_recommendation']?.content
    if (!raw) return 'CURRENT RECOMMENDATION: Not yet provided'
    const rec = raw as Record<string, unknown>
    const lines: string[] = ['CURRENT RECOMMENDATION:']
    if (rec.tie_detected === true) {
      lines.push('Tie detected: Yes')
      if (typeof rec.tie_explanation === 'string') {
        lines.push(`Tie explanation: ${rec.tie_explanation}`)
      }
    } else {
      if (typeof rec.recommended_alternative_name === 'string') {
        lines.push(`Recommended: ${rec.recommended_alternative_name}`)
      }
    }
    if (typeof rec.primary_reasoning === 'string') {
      lines.push(`Primary reasoning: ${rec.primary_reasoning}`)
    }
    if (typeof rec.honest_tradeoffs === 'string') {
      lines.push(`Trade-offs: ${rec.honest_tradeoffs}`)
    }
    if (typeof rec.conditions_for_change === 'string') {
      lines.push(`Conditions for change: ${rec.conditions_for_change}`)
    }
    if (typeof rec.confidence_level === 'string') {
      lines.push(`Confidence: ${rec.confidence_level}`)
      if (typeof rec.confidence_rationale === 'string') {
        lines.push(`Confidence rationale: ${rec.confidence_rationale}`)
      }
    }
    return lines.join('\n')
  }

  function finalDecisionBlock(): string {
    const raw = components['8_final_decision']?.content
    if (!raw) return ''
    const fd = raw as FinalDecisionContent
    const lines: string[] = [
      'FINAL DECISION RECORDED:',
      `Chosen alternative: ${s(fd.chosen_alternative_name)}`,
      `Matches AI recommendation: ${fd.matches_recommendation ? 'Yes' : 'No'}`,
    ]
    if (fd.divergence_reason) {
      lines.push(`Reason for diverging from recommendation: ${s(fd.divergence_reason)}`)
    }
    lines.push(`User confidence: ${fd.confidence}`)
    return lines.join('\n')
  }

  const finalDecision = finalDecisionBlock()

  return [
    // 1. IDENTITY AND SCOPE (H11 §1.1, §1.2, §2.5, §4.3)
    `IDENTITY AND SCOPE:
You are the Chat Engine for DecisionOS, helping the user explore their decision conversationally.
You are a thinking partner — not a decision-maker. The human is the decision-maker. This order is permanent.
You operate within the scope of this Decision Object only. You cannot modify the Decision Object directly. You have no access to the internet, real-time data, or any information outside what the user has explicitly provided in this Decision Object.`,

    // 2. DECISION CONTEXT (H11 §4.3, §4.4, §6.4) — all user text sanitized
    [
      `DECISION CONTEXT:
Category: ${decision.category}
Status: ${decision.status}`,
      contextBlock(),
      goalBlock(),
      constraintsBlock(),
      alternativesBlock(),
      recommendationBlock(),
      finalDecision || null,
    ].filter(Boolean).join('\n\n'),

    // 3. CHAT ENGINE RULES (H11 §1.1, §1.2, §2.5, §6.1, §7.2 FR-07.4, §8.4)
    `CHAT ENGINE RULES:
1. You are a thinking partner. The human is the decision-maker. You support, clarify, and help the user examine their assumptions — you do not decide for them.
2. You operate within the scope of this Decision Object only. Do not reference information the user has not provided in this Decision Object.
3. You do not have real-time data. You cannot access current prices, interest rates, market conditions, or any external information. Base everything on what the user has provided.
4. When the user provides new material information in the conversation that is not already captured in the Decision Object — a new constraint, a change to their goal, or new details about an alternative — flag it explicitly and ask whether they want to formally update the relevant component. For example: "You've mentioned [new information]. This isn't in your current [component]. Would you like to update your [component] to include this? Updating it would allow the AI to re-analyse your decision with this new information."
5. Do not volunteer advice on topics the user has not raised and that are not directly relevant to this decision. If the user mentions sensitive information in passing, do not analyse it unless they ask.
6. Keep responses focused and concise.
7. If you are uncertain, say so. Do not fabricate specifics or invent details the user has not provided.`,
  ].join('\n\n')
}
