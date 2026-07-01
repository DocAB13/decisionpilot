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

// AI-generated components — H12 §6.5–6.7, H11 §3.1, §12.1

export interface AnalysisProCon {
  title: string
  detail: string
  specific_to_user: boolean
}

export interface AnalysisRisk {
  title: string
  detail: string
  severity: 'low' | 'medium' | 'high'
  likelihood: 'low' | 'medium' | 'high'
  mitigation: string | null
}

export interface ConstraintCompliance {
  hard_constraints_satisfied: boolean
  hard_constraint_violations: string[]
  soft_constraints_satisfied: string[]
  soft_constraints_compromised: string[]
}

export interface AnalysisPerAlternative {
  alternative_id: string
  alternative_name: string
  pros: AnalysisProCon[]
  cons: AnalysisProCon[]
  goal_fit_assessment: string
  constraint_compliance: ConstraintCompliance
}

export interface AIAnalysisContent {
  per_alternative: AnalysisPerAlternative[]
  cross_alternative: {
    key_differentiators: string[]
    commonly_overlooked_risks: string[]
    information_gaps: Array<{
      missing_information: string
      impact_on_analysis: string
      component_to_update: string
    }>
  }
  market_data_caveat: string | null
  professional_advice_disclaimer: string | null
  analysis_confidence: 'high' | 'medium' | 'low'
  confidence_rationale: string
  analysis_version: string
}

export interface RisksPerAlternative {
  alternative_id: string
  alternative_name: string
  risks: AnalysisRisk[]
}

export interface RisksContent {
  per_alternative: RisksPerAlternative[]
}

export interface RecommendationContent {
  recommended_alternative_id: string | null
  recommended_alternative_name: string | null
  primary_reasoning: string
  supporting_factors: string[]
  honest_tradeoffs: string
  runner_up_id: string | null
  runner_up_name: string | null
  margin_description: string | null
  conditions_for_change: string
  tie_detected: boolean
  tie_explanation: string | null
  confidence_level: 'high' | 'medium' | 'low'
  confidence_rationale: string
  information_request: string | null
}

export interface ActionPlanItem {
  sequence: number
  title: string
  detail: string
  estimated_effort: 'low' | 'medium' | 'high'
  time_estimate: string | null
  completed: boolean
  completed_at: string | null
}

export interface ActionPlanContent {
  based_on_alternative_id: string
  based_on_alternative_name: string
  action_items: ActionPlanItem[]
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
