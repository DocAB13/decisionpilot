import type { DecisionStatus, DecisionCategory, ComponentName } from './Decision.constants'

export interface DecisionRow {
  id: string
  owner_id: string | null
  anonymous_token: string | null
  category: DecisionCategory
  status: DecisionStatus
  title: string | null
  created_at: string
  updated_at: string
  expires_at: string | null
}

export interface ComponentRow {
  id: string
  decision_id: string
  component: ComponentName
  version: number
  content: unknown
  is_current: boolean
  created_at: string
  prompt_version: string | null
}

export interface ContextContent {
  background: string
  current_situation: string
  prior_attempts: string | null
  timing_constraints: string | null
  geographic_market: string
  currency: string
}

export interface GoalContent {
  primary: string
  success_criteria: string | null
  time_horizon: string | null
  secondary_goals: string[]
}

export interface ConstraintItem {
  type: 'budget' | 'time' | 'geographic' | 'personal' | 'legal' | 'other'
  description: string
  value: string | null
  unit: string | null
}

export interface ConstraintsContent {
  hard: ConstraintItem[]
  soft: ConstraintItem[]
}

export interface AlternativeItem {
  id: string
  name: string
  source: 'user_provided' | 'ai_suggested' | 'do_nothing'
  user_notes: string | null
  attributes: Record<string, unknown>
}

export interface AlternativesContent {
  alternatives: AlternativeItem[]
  do_nothing_included: boolean
}

export interface FinalDecisionContent {
  chosen_alternative_id: string
  chosen_alternative_name: string
  matches_recommendation: boolean
  divergence_reason: string | null
  confidence: 'confident' | 'uncertain' | 'reluctant'
  recorded_at: string
}

export interface DecisionObject extends DecisionRow {
  components: Partial<Record<ComponentName, {
    version: number
    content: unknown
    updated_at: string
    prompt_version?: string
  }>>
  state_transitions: Array<{
    from_status: string | null
    to_status: string
    trigger: string
    created_at: string
  }>
}
