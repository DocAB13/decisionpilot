import { describe, it, expect } from 'vitest'
import { validateAnalysisOutput, validateRecommendationOutput } from './validate'

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
    market_data_caveat: null,
    professional_advice_disclaimer: null,
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
