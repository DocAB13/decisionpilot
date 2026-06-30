import { describe, it, expect } from 'vitest'
import { validateAnalysisOutput, validateRecommendationOutput, validateActionPlanOutput } from './validate'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ALT_IDS = ['alt-1', 'alt-2']

function makeValidAnalysis() {
  return {
    per_alternative: [
      {
        alternative_id: 'alt-1',
        alternative_name: 'Option A',
        pros: [
          { title: 'Lower cost', detail: 'Monthly cost is €300, within your stated €400 budget', specific_to_user: true },
          { title: 'Quick setup', detail: 'Operational within your 2-week timing constraint', specific_to_user: true },
        ],
        cons: [
          { title: 'Limited features', detail: 'Does not support the advanced reporting you mentioned', specific_to_user: true },
          { title: 'No local office', detail: 'No support office in your stated geographic market (Dublin)', specific_to_user: true },
        ],
        risks: [
          { title: 'Vendor lock-in', detail: 'Migration costs estimated at 3+ months based on your integration requirements', severity: 'medium', likelihood: 'medium', mitigation: 'Request data export clause in contract' },
        ],
        goal_fit_assessment: 'Strong fit for your primary goal of minimizing monthly cost within your €400 budget',
        constraint_compliance: {
          hard_constraints_satisfied: true,
          hard_constraint_violations: [],
          soft_constraints_satisfied: ['local support preference'],
          soft_constraints_compromised: [],
        },
      },
      {
        alternative_id: 'alt-2',
        alternative_name: 'Option B',
        pros: [
          { title: 'Full feature set', detail: 'Includes the advanced reporting you specified as a requirement', specific_to_user: true },
          { title: 'Local support', detail: 'Has an office in your stated market (Dublin)', specific_to_user: true },
        ],
        cons: [
          { title: 'Higher monthly cost', detail: 'At €450/month it exceeds your stated €400 budget hard constraint', specific_to_user: true },
          { title: 'Longer setup', detail: 'Typical onboarding is 4–6 weeks, exceeding your 2-week deadline', specific_to_user: true },
        ],
        risks: [
          { title: 'Budget overrun', detail: 'At €450/month this alternative violates your hard budget constraint', severity: 'high', likelihood: 'high', mitigation: null },
        ],
        goal_fit_assessment: 'Poor fit — violates your primary budget hard constraint',
        constraint_compliance: {
          hard_constraints_satisfied: false,
          hard_constraint_violations: ['Monthly cost €450 exceeds hard budget constraint of €400'],
          soft_constraints_satisfied: ['local support', 'advanced reporting'],
          soft_constraints_compromised: [],
        },
      },
    ],
    cross_alternative: {
      key_differentiators: ['Cost: Option A is €150/month cheaper, satisfying your budget constraint'],
      commonly_overlooked_risks: ['Auto-renewal contract clauses are common in SaaS agreements'],
      information_gaps: [],
    },
    market_data_caveat: null as string | null,
    professional_advice_disclaimer: null as string | null,
    analysis_confidence: 'high',
    confidence_rationale: 'All four input components are well-specified with clear budget, timeline, and geographic constraints.',
  }
}

function makeValidRecommendation() {
  return {
    recommended_alternative_id: 'alt-1',
    recommended_alternative_name: 'Option A',
    primary_reasoning:
      'Option A is the strongest fit for your stated goal of minimizing monthly cost within your €400 budget. At €300 per month it is the only alternative that satisfies your hard budget constraint.',
    supporting_factors: [
      'Meets your 2-week setup deadline',
      'Monthly cost €300 is within your stated €400 hard budget constraint',
    ],
    honest_tradeoffs:
      'Option A requires forgoing the advanced reporting features and local Dublin support offered by Option B. If either of these becomes a hard requirement, that would change this recommendation.',
    runner_up_id: null,
    runner_up_name: null,
    margin_description: null,
    conditions_for_change:
      'If your budget increases above €450/month or advanced reporting becomes a hard constraint, Option B becomes the only viable choice.',
    tie_detected: false,
    tie_explanation: null,
    confidence_level: 'high',
    confidence_rationale:
      'All input components are well-specified. The margin between alternatives is substantial — Option B violates your hard budget constraint, leaving Option A as the clear choice.',
    information_request: null,
  }
}

// ---------------------------------------------------------------------------
// validateAnalysisOutput — valid output
// ---------------------------------------------------------------------------

describe('validateAnalysisOutput — valid output', () => {
  it('passes a complete, valid analysis output', () => {
    const result = validateAnalysisOutput(makeValidAnalysis(), ALT_IDS)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('passes when hard_constraints_satisfied is false and violations is non-empty', () => {
    const output = makeValidAnalysis()
    // alt-2 already has hard_constraints_satisfied: false with a violation — should pass
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(true)
  })

  it('passes when information_gaps descriptions are ≥ 20 chars', () => {
    const output = makeValidAnalysis()
    output.cross_alternative.information_gaps = [
      {
        missing_information: 'Whether the budget is inclusive or exclusive of VAT',
        impact_on_analysis: 'VAT inclusion changes the effective monthly cost comparison between alternatives',
        component_to_update: 'constraints',
      } as never,
    ]
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateAnalysisOutput — acceptance criterion: specific_to_user: false
// ---------------------------------------------------------------------------

describe('validateAnalysisOutput — specific_to_user', () => {
  it('rejects a pro with specific_to_user: false', () => {
    const output = makeValidAnalysis()
    output.per_alternative[0].pros[0].specific_to_user = false
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('specific_to_user'))).toBe(true)
  })

  it('rejects a con with specific_to_user: false', () => {
    const output = makeValidAnalysis()
    output.per_alternative[0].cons[1].specific_to_user = false
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('specific_to_user'))).toBe(true)
  })

  it('passes when all pros and cons have specific_to_user: true', () => {
    const output = makeValidAnalysis()
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateAnalysisOutput — structural rules
// ---------------------------------------------------------------------------

describe('validateAnalysisOutput — structural rules', () => {
  it('rejects non-object output', () => {
    const result = validateAnalysisOutput('not an object', ALT_IDS)
    expect(result.valid).toBe(false)
  })

  it('rejects output with missing per_alternative', () => {
    const result = validateAnalysisOutput({}, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('per_alternative'))).toBe(true)
  })

  it('rejects when an input alternative has no entry', () => {
    const result = validateAnalysisOutput(makeValidAnalysis(), ['alt-1', 'alt-2', 'alt-3'])
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('alt-3'))).toBe(true)
  })

  it('rejects when fewer than 2 pros', () => {
    const output = makeValidAnalysis()
    output.per_alternative[0].pros = [output.per_alternative[0].pros[0]]
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('minimum 2 pros'))).toBe(true)
  })

  it('rejects when fewer than 2 cons', () => {
    const output = makeValidAnalysis()
    output.per_alternative[0].cons = [output.per_alternative[0].cons[0]]
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('minimum 2 cons'))).toBe(true)
  })

  it('rejects when no risks', () => {
    const output = makeValidAnalysis()
    output.per_alternative[0].risks = []
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('minimum 1 risk'))).toBe(true)
  })

  it('rejects hard_constraints_satisfied = false with empty violations array', () => {
    const output = makeValidAnalysis()
    output.per_alternative[0].constraint_compliance.hard_constraints_satisfied = false
    output.per_alternative[0].constraint_compliance.hard_constraint_violations = []
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('hard_constraint_violations is empty'))).toBe(true)
  })

  it('accepts hard_constraints_satisfied = false with non-empty violations', () => {
    const output = makeValidAnalysis()
    output.per_alternative[0].constraint_compliance.hard_constraints_satisfied = false
    ;(output.per_alternative[0].constraint_compliance.hard_constraint_violations as string[]) = [
      'Monthly cost €450 exceeds budget constraint of €400',
    ]
    const result = validateAnalysisOutput(output, ALT_IDS)
    // Other violations from alt-2 are fine (it already has non-empty violations)
    expect(result.valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateAnalysisOutput — confidence and information gaps
// ---------------------------------------------------------------------------

describe('validateAnalysisOutput — confidence and information gaps', () => {
  it('rejects invalid analysis_confidence value', () => {
    const output = makeValidAnalysis()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(output as any).analysis_confidence = 'very high'
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('analysis_confidence'))).toBe(true)
  })

  it('rejects empty confidence_rationale', () => {
    const output = makeValidAnalysis()
    output.confidence_rationale = ''
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('confidence_rationale'))).toBe(true)
  })

  it('rejects information_gap with missing_information < 20 chars', () => {
    const output = makeValidAnalysis()
    output.cross_alternative.information_gaps = [
      {
        missing_information: 'VAT details',
        impact_on_analysis: 'Affects the effective monthly cost comparison between the two alternatives',
        component_to_update: 'constraints',
      } as never,
    ]
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('missing_information too vague'))).toBe(true)
  })

  it('rejects information_gap with impact_on_analysis < 20 chars', () => {
    const output = makeValidAnalysis()
    output.cross_alternative.information_gaps = [
      {
        missing_information: 'Whether the budget includes or excludes VAT',
        impact_on_analysis: 'Changes costs',
        component_to_update: 'constraints',
      } as never,
    ]
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('impact_on_analysis too vague'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateRecommendationOutput — valid output
// ---------------------------------------------------------------------------

describe('validateRecommendationOutput — valid output', () => {
  it('passes a complete, valid recommendation output', () => {
    const result = validateRecommendationOutput(makeValidRecommendation(), makeValidAnalysis())
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('passes when tie_detected is true and recommended_alternative_id is null', () => {
    const rec = makeValidRecommendation()
    rec.tie_detected = true
    rec.recommended_alternative_id = null as never
    rec.recommended_alternative_name = null as never
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateRecommendationOutput — acceptance criterion: hard constraint violation
// ---------------------------------------------------------------------------

describe('validateRecommendationOutput — hard constraint enforcement', () => {
  it('rejects a recommendation for an alternative with hard_constraints_satisfied = false', () => {
    const rec = makeValidRecommendation()
    // Recommend alt-2, which has hard_constraints_satisfied: false in the analysis
    rec.recommended_alternative_id = 'alt-2'
    rec.recommended_alternative_name = 'Option B'
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('hard constraint'))).toBe(true)
  })

  it('passes when recommended alternative has hard_constraints_satisfied = true', () => {
    // Default fixture recommends alt-1 which passes constraints
    const result = validateRecommendationOutput(makeValidRecommendation(), makeValidAnalysis())
    expect(result.valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateRecommendationOutput — Recommendation Contract terms (H11 §12.1)
// ---------------------------------------------------------------------------

describe('validateRecommendationOutput — Recommendation Contract terms', () => {
  it('rejects when recommended_alternative_id is missing and tie_detected is false', () => {
    const rec = makeValidRecommendation()
    rec.recommended_alternative_id = null as never
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('recommended_alternative_id'))).toBe(true)
  })

  it('rejects primary_reasoning shorter than 50 characters', () => {
    const rec = makeValidRecommendation()
    rec.primary_reasoning = 'Option A is best.'
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('primary_reasoning'))).toBe(true)
  })

  it('rejects empty honest_tradeoffs', () => {
    const rec = makeValidRecommendation()
    rec.honest_tradeoffs = ''
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('honest_tradeoffs'))).toBe(true)
  })

  it('rejects empty conditions_for_change', () => {
    const rec = makeValidRecommendation()
    rec.conditions_for_change = '   '
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('conditions_for_change'))).toBe(true)
  })

  it('rejects invalid confidence_level', () => {
    const rec = makeValidRecommendation()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(rec as any).confidence_level = 'very_high'
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('confidence_level'))).toBe(true)
  })

  it('rejects empty confidence_rationale', () => {
    const rec = makeValidRecommendation()
    rec.confidence_rationale = ''
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('confidence_rationale'))).toBe(true)
  })

  it('rejects non-object output', () => {
    const result = validateRecommendationOutput(null, makeValidAnalysis())
    expect(result.valid).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// validateAnalysisOutput — category-specific enforcement (H11 AAC-01)
// ---------------------------------------------------------------------------

describe('validateAnalysisOutput — category-specific fields', () => {
  it('passes financial analysis with non-empty market_data_caveat and professional_advice_disclaimer', () => {
    const output = makeValidAnalysis()
    output.market_data_caveat = 'Verify current Irish mortgage rates before signing — rates may have changed since this analysis.'
    output.professional_advice_disclaimer = 'This analysis supports a personal decision and is not financial advice. For decisions involving significant financial commitments, consult a qualified financial advisor.'
    const result = validateAnalysisOutput(output, ALT_IDS, 'financial')
    expect(result.valid).toBe(true)
  })

  it('rejects financial analysis with null market_data_caveat', () => {
    const output = makeValidAnalysis() // market_data_caveat is null in base fixture
    output.professional_advice_disclaimer = 'Not financial advice — consult a qualified advisor.'
    const result = validateAnalysisOutput(output, ALT_IDS, 'financial')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('market_data_caveat'))).toBe(true)
  })

  it('rejects financial analysis with empty market_data_caveat', () => {
    const output = makeValidAnalysis()
    output.market_data_caveat = '   '
    output.professional_advice_disclaimer = 'Not financial advice — consult a qualified advisor.'
    const result = validateAnalysisOutput(output, ALT_IDS, 'financial')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('market_data_caveat'))).toBe(true)
  })

  it('rejects financial analysis with empty professional_advice_disclaimer', () => {
    const output = makeValidAnalysis()
    output.market_data_caveat = 'Verify current rates before finalizing.'
    output.professional_advice_disclaimer = ''
    const result = validateAnalysisOutput(output, ALT_IDS, 'financial')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('professional_advice_disclaimer'))).toBe(true)
  })

  it('passes technology analysis with non-empty market_data_caveat (no disclaimer required)', () => {
    const output = makeValidAnalysis()
    output.market_data_caveat = 'Verify current software pricing — subscriptions may have changed since this analysis.'
    const result = validateAnalysisOutput(output, ALT_IDS, 'technology')
    expect(result.valid).toBe(true)
  })

  it('rejects technology analysis with null market_data_caveat', () => {
    const output = makeValidAnalysis() // market_data_caveat is null
    const result = validateAnalysisOutput(output, ALT_IDS, 'technology')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('market_data_caveat'))).toBe(true)
  })

  it('rejects health analysis with empty professional_advice_disclaimer', () => {
    const output = makeValidAnalysis()
    output.professional_advice_disclaimer = ''
    const result = validateAnalysisOutput(output, ALT_IDS, 'health')
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('professional_advice_disclaimer'))).toBe(true)
  })

  it('passes non-financial, non-technology analysis with null market_data_caveat (no requirement)', () => {
    const output = makeValidAnalysis() // market_data_caveat is null
    const result = validateAnalysisOutput(output, ALT_IDS, 'career')
    expect(result.valid).toBe(true)
  })

  it('passes when no category is provided (no category-specific checks)', () => {
    const output = makeValidAnalysis() // market_data_caveat and disclaimer are null
    const result = validateAnalysisOutput(output, ALT_IDS)
    expect(result.valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateRecommendationOutput — conditions_for_change ≥30 chars (H11 AAC-02)
// ---------------------------------------------------------------------------

describe('validateRecommendationOutput — conditions_for_change length', () => {
  it('rejects conditions_for_change shorter than 30 characters', () => {
    const rec = makeValidRecommendation()
    rec.conditions_for_change = 'Budget changes.'
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('conditions_for_change'))).toBe(true)
  })

  it('passes conditions_for_change that is exactly 30 characters', () => {
    const rec = makeValidRecommendation()
    rec.conditions_for_change = 'If your budget exceeds €450/mo.' // 31 chars
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateRecommendationOutput — conflict-resolution path (H11 AAC-05)
// All alternatives violate hard constraints → null recommended_alternative_id allowed
// ---------------------------------------------------------------------------

describe('validateRecommendationOutput — all-alternatives-violate conflict resolution', () => {
  function makeAllViolateAnalysis() {
    const a = makeValidAnalysis()
    // Make alt-1 also violate constraints (alt-2 already does in the base fixture)
    a.per_alternative[0].constraint_compliance.hard_constraints_satisfied = false
    a.per_alternative[0].constraint_compliance.hard_constraint_violations = [
      'Monthly cost €300 still exceeds the revised €200 hard budget constraint',
    ]
    return a
  }

  it('passes when recommended_alternative_id is null and all alternatives violate constraints', () => {
    const rec = makeValidRecommendation()
    rec.recommended_alternative_id = null as never
    rec.recommended_alternative_name = null as never
    rec.primary_reasoning =
      'All of your alternatives conflict with your stated hard constraints. Please review your constraints or add new alternatives.'
    const result = validateRecommendationOutput(rec, makeAllViolateAnalysis())
    expect(result.valid).toBe(true)
  })

  it('still rejects null recommended_alternative_id when only SOME alternatives violate constraints', () => {
    // Base makeValidAnalysis has alt-1 compliant and alt-2 non-compliant
    const rec = makeValidRecommendation()
    rec.recommended_alternative_id = null as never
    rec.recommended_alternative_name = null as never
    const result = validateRecommendationOutput(rec, makeValidAnalysis())
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('recommended_alternative_id'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// validateActionPlanOutput — AAC-03
// ---------------------------------------------------------------------------

function makeValidActionPlan(count = 3) {
  return {
    based_on_alternative_id: 'alt-1',
    based_on_alternative_name: 'Option A',
    action_items: Array.from({ length: count }, (_, i) => ({
      sequence: i + 1,
      title: `Step ${i + 1}: Take action`,
      detail: `Specific detail for step ${i + 1}, referencing the user's chosen alternative Option A and their stated context.`,
      estimated_effort: 'medium',
      time_estimate: '1 week',
      completed: false,
      completed_at: null,
    })),
  }
}

describe('validateActionPlanOutput — valid outputs', () => {
  it('passes a plan with exactly 3 items', () => {
    const result = validateActionPlanOutput(makeValidActionPlan(3))
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('passes a plan with exactly 5 items', () => {
    const result = validateActionPlanOutput(makeValidActionPlan(5))
    expect(result.valid).toBe(true)
  })

  it('passes a plan with 4 items (mid-range)', () => {
    const result = validateActionPlanOutput(makeValidActionPlan(4))
    expect(result.valid).toBe(true)
  })
})

describe('validateActionPlanOutput — item count enforcement (H11 AAC-03)', () => {
  it('rejects a plan with fewer than 3 items', () => {
    const result = validateActionPlanOutput(makeValidActionPlan(2))
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('3–5 items'))).toBe(true)
  })

  it('rejects a plan with more than 5 items', () => {
    const result = validateActionPlanOutput(makeValidActionPlan(6))
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('3–5 items'))).toBe(true)
  })

  it('rejects a plan with 0 items', () => {
    const result = validateActionPlanOutput(makeValidActionPlan(0))
    expect(result.valid).toBe(false)
  })
})

describe('validateActionPlanOutput — per-item field validation', () => {
  it('rejects an item with missing title', () => {
    const plan = makeValidActionPlan(3)
    plan.action_items[1].title = ''
    const result = validateActionPlanOutput(plan)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('title'))).toBe(true)
  })

  it('rejects an item with missing detail', () => {
    const plan = makeValidActionPlan(3)
    plan.action_items[0].detail = ''
    const result = validateActionPlanOutput(plan)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('detail'))).toBe(true)
  })

  it('rejects an item with invalid estimated_effort', () => {
    const plan = makeValidActionPlan(3)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(plan.action_items[0] as any).estimated_effort = 'very_high'
    const result = validateActionPlanOutput(plan)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('estimated_effort'))).toBe(true)
  })

  it('rejects an item with completed = true (not initial state)', () => {
    const plan = makeValidActionPlan(3)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(plan.action_items[0] as any).completed = true
    const result = validateActionPlanOutput(plan)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('completed'))).toBe(true)
  })

  it('rejects an item with non-null completed_at', () => {
    const plan = makeValidActionPlan(3)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(plan.action_items[0] as any).completed_at = '2024-01-01T00:00:00Z'
    const result = validateActionPlanOutput(plan)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('completed_at'))).toBe(true)
  })

  it('rejects non-object output', () => {
    const result = validateActionPlanOutput('not an object')
    expect(result.valid).toBe(false)
  })

  it('rejects output without action_items array', () => {
    const result = validateActionPlanOutput({ based_on_alternative_id: 'alt-1' })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('action_items'))).toBe(true)
  })
})
