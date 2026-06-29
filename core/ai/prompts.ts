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
