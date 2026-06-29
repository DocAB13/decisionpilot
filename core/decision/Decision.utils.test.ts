import { describe, it, expect } from 'vitest'
import {
  validateStateTransition,
  hasMinimumAlternatives,
  isClientWritable,
  isServerGenerated,
} from './Decision.utils'
import type { AlternativesContent } from './Decision.types'

// ---------------------------------------------------------------------------
// validateStateTransition
// ---------------------------------------------------------------------------

describe('validateStateTransition', () => {
  it.each([
    ['waiting_for_user', 'draft'],
    ['waiting_for_user', 'decision_made'],
    ['decision_made',    'executing'],
    ['executing',        'completed'],
    ['completed',        'archived'],
  ])('%s → %s is valid', (from, to) => {
    expect(validateStateTransition(from, to)).toBe(true)
  })

  it.each([
    ['draft',            'archived'],
    ['in_analysis',      'archived'],
    ['waiting_for_user', 'archived'],
    ['decision_made',    'archived'],
    ['executing',        'archived'],
    ['completed',        'archived'],
  ])('any state → archived is always valid (%s → archived)', (from) => {
    expect(validateStateTransition(from, 'archived')).toBe(true)
  })

  it.each([
    ['completed',        'draft'],
    ['completed',        'decision_made'],
    ['completed',        'executing'],
    ['draft',            'decision_made'],
    ['draft',            'in_analysis'],
    ['draft',            'waiting_for_user'],
    ['executing',        'draft'],
    ['executing',        'waiting_for_user'],
    ['in_analysis',      'waiting_for_user'],
    ['in_analysis',      'draft'],
    ['decision_made',    'draft'],
    ['decision_made',    'waiting_for_user'],
  ])('%s → %s is invalid', (from, to) => {
    expect(validateStateTransition(from, to)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// hasMinimumAlternatives
// ---------------------------------------------------------------------------

const alt = (n: number): AlternativesContent['alternatives'] =>
  Array.from({ length: n }, (_, i) => ({
    id: `id-${i}`,
    name: `Alt ${i}`,
    source: 'user_provided' as const,
    user_notes: null,
    attributes: {},
  }))

describe('hasMinimumAlternatives', () => {
  it('returns true for exactly 2 alternatives (default min)', () => {
    expect(hasMinimumAlternatives({ alternatives: alt(2), do_nothing_included: false })).toBe(true)
  })

  it('returns true for 3 alternatives', () => {
    expect(hasMinimumAlternatives({ alternatives: alt(3), do_nothing_included: false })).toBe(true)
  })

  it('returns false for exactly 1 alternative', () => {
    expect(hasMinimumAlternatives({ alternatives: alt(1), do_nothing_included: false })).toBe(false)
  })

  it('returns false for zero alternatives', () => {
    expect(hasMinimumAlternatives({ alternatives: alt(0), do_nothing_included: false })).toBe(false)
  })

  it('respects a custom min of 3', () => {
    expect(hasMinimumAlternatives({ alternatives: alt(2), do_nothing_included: false }, 3)).toBe(false)
    expect(hasMinimumAlternatives({ alternatives: alt(3), do_nothing_included: false }, 3)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// isClientWritable
// ---------------------------------------------------------------------------

describe('isClientWritable', () => {
  it.each([
    '0_identity', '1_context', '2_goal', '3_constraints', '4_alternatives',
    '8_final_decision', '10_outcome', '11_reflection', '12_lessons_learned',
  ])('%s is client-writable', (component) => {
    expect(isClientWritable(component)).toBe(true)
  })

  it.each(['5_ai_analysis', '6_risks', '7_recommendation', '9_action_plan'])(
    '%s is not client-writable', (component) => {
      expect(isClientWritable(component)).toBe(false)
    }
  )

  it('returns false for an unknown component', () => {
    expect(isClientWritable('unknown')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isServerGenerated
// ---------------------------------------------------------------------------

describe('isServerGenerated', () => {
  it.each(['5_ai_analysis', '6_risks', '7_recommendation', '9_action_plan'])(
    '%s is server-generated', (component) => {
      expect(isServerGenerated(component)).toBe(true)
    }
  )

  it.each([
    '0_identity', '1_context', '2_goal', '3_constraints', '4_alternatives',
    '8_final_decision', '10_outcome', '11_reflection', '12_lessons_learned',
  ])('%s is not server-generated', (component) => {
    expect(isServerGenerated(component)).toBe(false)
  })

  it('returns false for an unknown component', () => {
    expect(isServerGenerated('unknown')).toBe(false)
  })
})
