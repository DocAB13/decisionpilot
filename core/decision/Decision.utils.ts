import { isValidUserTransition } from './Decision.constants'
import type { AlternativesContent } from './Decision.types'

export function validateStateTransition(from: string, to: string): boolean {
  return isValidUserTransition(from, to)
}

export function hasMinimumAlternatives(content: AlternativesContent, min = 2): boolean {
  return Array.isArray(content.alternatives) && content.alternatives.length >= min
}

export function isClientWritable(component: string): boolean {
  const CLIENT = [
    '0_identity', '1_context', '2_goal', '3_constraints', '4_alternatives',
    '8_final_decision', '10_outcome', '11_reflection', '12_lessons_learned',
  ]
  return CLIENT.includes(component)
}

export function isServerGenerated(component: string): boolean {
  return ['5_ai_analysis', '6_risks', '7_recommendation', '9_action_plan'].includes(component)
}
