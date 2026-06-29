export const DecisionStatus = {
  DRAFT:            'draft',
  IN_ANALYSIS:      'in_analysis',
  WAITING_FOR_USER: 'waiting_for_user',
  DECISION_MADE:    'decision_made',
  EXECUTING:        'executing',
  COMPLETED:        'completed',
  ARCHIVED:         'archived',
} as const

export type DecisionStatus = typeof DecisionStatus[keyof typeof DecisionStatus]

export const DecisionCategory = {
  FINANCIAL:   'financial',
  TECHNOLOGY:  'technology',
  HEALTH:      'health',
  TRAVEL:      'travel',
  CAREER:      'career',
  INSURANCE:   'insurance',
  HOME:        'home',
  EDUCATION:   'education',
  LIFESTYLE:   'lifestyle',
} as const

export type DecisionCategory = typeof DecisionCategory[keyof typeof DecisionCategory]

export const CLIENT_WRITABLE_COMPONENTS = [
  '0_identity', '1_context', '2_goal', '3_constraints', '4_alternatives',
  '8_final_decision', '10_outcome', '11_reflection', '12_lessons_learned',
] as const

export const SERVER_GENERATED_COMPONENTS = [
  '5_ai_analysis', '6_risks', '7_recommendation', '9_action_plan',
] as const

export const ALL_COMPONENTS = [
  ...CLIENT_WRITABLE_COMPONENTS,
  ...SERVER_GENERATED_COMPONENTS,
] as const

export type ComponentName = typeof ALL_COMPONENTS[number]

export const VALID_USER_TRANSITIONS: Record<string, string[]> = {
  waiting_for_user:          ['draft', 'decision_made'],
  decision_made:             ['executing'],
  executing:                 ['completed'],
  completed:                 ['archived'],
  draft:                     ['archived'],
  in_analysis:               ['archived'],
  waiting_for_user_archived: ['archived'],
}

// Any state → archived is always valid
export function isValidUserTransition(from: string, to: string): boolean {
  if (to === 'archived') return true
  return VALID_USER_TRANSITIONS[from]?.includes(to) ?? false
}
