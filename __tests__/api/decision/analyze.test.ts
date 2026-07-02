import { describe, it, expect, vi, afterEach } from 'vitest'
import { makeBuilder, createMockReq, createMockRes, MOCK_USER, mockAuthedUser, enqueueBuilders } from './testHelpers'
import type {
  ContextContent,
  GoalContent,
  ConstraintsContent,
  AlternativesContent,
} from '@/core/decision/Decision.types'

vi.mock('@/lib/supabase/admin', () => ({ adminClient: { from: vi.fn() } }))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/core/ai/call', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/ai/call')>()
  return { ...actual, callAI: vi.fn() }
})

async function loadHandler() {
  vi.resetModules()
  const mod = await import('../../../pages/api/decision/analyze')
  return mod.default
}

const DECISION_ID = 'decision-uuid-1'

async function authedReq(body: unknown) {
  const { createClient } = await import('@/lib/supabase/server')
  ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))
  return createMockReq({ method: 'POST', body })
}

// ---------------------------------------------------------------------------
// Fixtures — real inputs for the real (unmocked) prompts.ts / validate.ts.
// Only callAI (the network boundary) and the Supabase admin client are mocked.
// ---------------------------------------------------------------------------

const context: ContextContent = {
  background: 'Comparing two SaaS vendors for the team',
  current_situation: 'On a monthly plan with vendor X, unhappy with support',
  prior_attempts: null,
  timing_constraints: 'Need to decide within 2 weeks',
  geographic_market: 'Dublin',
  currency: 'EUR',
}
const goal: GoalContent = {
  primary: 'Minimize monthly cost while keeping required features',
  success_criteria: null,
  time_horizon: null,
  secondary_goals: [],
}
const constraints: ConstraintsContent = {
  hard: [{ type: 'budget', description: 'Max monthly budget', value: '400', unit: 'EUR' }],
  soft: [],
}
const alternatives: AlternativesContent = {
  alternatives: [
    { id: 'alt-1', name: 'Option A', source: 'user_provided', user_notes: null, attributes: {} },
    { id: 'alt-2', name: 'Option B', source: 'user_provided', user_notes: null, attributes: {} },
  ],
  do_nothing_included: false,
}

const componentRows = [
  { component: '1_context', content: context },
  { component: '2_goal', content: goal },
  { component: '3_constraints', content: constraints },
  { component: '4_alternatives', content: alternatives },
]

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
          { title: 'Limited features', detail: 'Does not support advanced reporting', specific_to_user: true },
          { title: 'No local office', detail: 'No support office in your stated market (Dublin)', specific_to_user: true },
        ],
        risks: [
          { title: 'Vendor lock-in', detail: 'Migration costs estimated at 3+ months', severity: 'medium', likelihood: 'medium', mitigation: 'Request data export clause' },
        ],
        goal_fit_assessment: 'Strong fit for minimizing monthly cost within your €400 budget',
        constraint_compliance: {
          hard_constraints_satisfied: true,
          hard_constraint_violations: [],
          soft_constraints_satisfied: [],
          soft_constraints_compromised: [],
        },
      },
      {
        alternative_id: 'alt-2',
        alternative_name: 'Option B',
        pros: [
          { title: 'Full feature set', detail: 'Includes advanced reporting', specific_to_user: true },
          { title: 'Local support', detail: 'Has an office in Dublin', specific_to_user: true },
        ],
        cons: [
          { title: 'Higher monthly cost', detail: 'At €450/month it exceeds your €400 budget hard constraint', specific_to_user: true },
          { title: 'Longer setup', detail: 'Typical onboarding is 4–6 weeks, exceeding your 2-week deadline', specific_to_user: true },
        ],
        risks: [
          { title: 'Budget overrun', detail: 'At €450/month this violates your hard budget constraint', severity: 'high', likelihood: 'high', mitigation: null },
        ],
        goal_fit_assessment: 'Poor fit — violates your primary budget hard constraint',
        constraint_compliance: {
          hard_constraints_satisfied: false,
          hard_constraint_violations: ['Monthly cost €450 exceeds hard budget constraint of €400'],
          soft_constraints_satisfied: [],
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
    confidence_rationale: 'Budget, timeline, and geography are all clearly specified.',
  }
}

function makeValidRecommendation() {
  return {
    recommended_alternative_id: 'alt-1',
    recommended_alternative_name: 'Option A',
    primary_reasoning:
      'Option A is the strongest fit for minimizing monthly cost within your €400 budget. At €300/month it is the only alternative that satisfies your hard budget constraint.',
    supporting_factors: ['Meets your 2-week setup deadline', 'Monthly cost €300 is within your €400 hard budget constraint'],
    honest_tradeoffs: 'Option A forgoes the advanced reporting and local Dublin support offered by Option B.',
    runner_up_id: null,
    runner_up_name: null,
    margin_description: null,
    conditions_for_change: 'If your budget increases above €450/month, Option B becomes viable.',
    tie_detected: false,
    tie_explanation: null,
    confidence_level: 'high',
    confidence_rationale: 'Option B violates the hard budget constraint, leaving Option A as the clear choice.',
    information_request: null,
  }
}

const noop = () => makeBuilder({})

/** The `.from()` queue for: ownership select, alt-count check, transition-to-in_analysis, load-components. */
function preAnalysisQueue() {
  return [
    makeBuilder({ data: { id: DECISION_ID, status: 'draft', category: 'career' }, error: null }), // ownership
    makeBuilder({ data: { content: alternatives } }), // 4_alternatives check
    noop(), noop(), // transition draft -> in_analysis
    makeBuilder({ data: componentRows, error: null }), // load all current components
  ]
}

function saveComponentQueue() {
  return [noop(), makeBuilder({ data: null }), makeBuilder({ error: null })] // update, maxRow, insert
}

describe('POST /api/decision/analyze', () => {
  afterEach(async () => {
    // mockReturnValueOnce queues are not cleared by clearAllMocks(); reset explicitly
    // so a queue misconfigured in one test can never leak into the next.
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(adminClient.from as any).mockReset()
    ;(callAI as any).mockReset()
    vi.clearAllMocks()
  })

  it('returns 405 for non-POST methods', async () => {
    const handler = await loadHandler()
    const req = createMockReq({ method: 'GET' })
    const res = createMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('returns 401 when unauthenticated', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    ;(createClient as any).mockReturnValue(mockAuthedUser(null))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'POST', body: { decision_id: DECISION_ID } })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 400 when decision_id is missing', async () => {
    const handler = await loadHandler()
    const req = await authedReq({})
    const res = createMockRes()
    await handler(req, res)
    expect(res.json).toHaveBeenCalledWith({ error: 'decision_id is required' })
  })

  it('returns 404 when the decision does not exist or is not owned', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any).mockReturnValueOnce(makeBuilder({ data: null, error: null }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 409 when the decision is not in draft state', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any).mockReturnValueOnce(
      makeBuilder({ data: { id: DECISION_ID, status: 'waiting_for_user', category: 'career' }, error: null })
    )

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ error: 'Decision must be in draft state to run analysis' })
  })

  it('returns 400 when fewer than 2 alternatives are recorded', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const oneAlt = { alternatives: [alternatives.alternatives[0]], do_nothing_included: false }
    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'draft', category: 'career' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { content: oneAlt } }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'At least 2 alternatives are required to run analysis' })
  })

  it('reverts to draft and returns 503 when required input components are missing', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    enqueueBuilders((adminClient.from as any), [
      makeBuilder({ data: { id: DECISION_ID, status: 'draft', category: 'career' }, error: null }),
      makeBuilder({ data: { content: alternatives } }),
      noop(), noop(), // transition draft -> in_analysis
      makeBuilder({ data: [{ component: '4_alternatives', content: alternatives }], error: null }), // no context/goal/constraints
      noop(), noop(), // revert to draft
    ])

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.json).toHaveBeenCalledWith({
      error: 'The analysis did not complete. Your inputs are saved. Please try again.',
    })
  })

  it('reverts to draft and returns 503 when the Analysis Engine call fails (H10 §11.3)', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(callAI as any).mockRejectedValueOnce(new Error('AI_TIMEOUT'))

    enqueueBuilders((adminClient.from as any), [
      ...preAnalysisQueue(),
      noop(), noop(), // revert to draft
    ])

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.json).toHaveBeenCalledWith({
      error: 'The analysis did not complete. Your inputs are saved. Please try again.',
    })
  })

  it('reverts to draft and returns 503 when the analysis is still invalid after one regeneration', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(callAI as any)
      .mockResolvedValueOnce({ text: JSON.stringify({ per_alternative: [] }), inputTokens: 1, outputTokens: 1 }) // invalid
      .mockResolvedValueOnce({ text: JSON.stringify({ per_alternative: [] }), inputTokens: 1, outputTokens: 1 }) // still invalid after regen

    enqueueBuilders((adminClient.from as any), [
      ...preAnalysisQueue(),
      noop(), noop(), // revert to draft
    ])

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)

    expect(callAI).toHaveBeenCalledTimes(2)
    expect(res.status).toHaveBeenCalledWith(503)
  })

  it('recovers via one regeneration when the first analysis attempt is invalid, then succeeds fully', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(callAI as any)
      .mockResolvedValueOnce({ text: JSON.stringify({ per_alternative: [] }), inputTokens: 1, outputTokens: 1 }) // invalid
      .mockResolvedValueOnce({ text: JSON.stringify(makeValidAnalysis()), inputTokens: 1, outputTokens: 1 }) // valid on regen
      .mockResolvedValueOnce({ text: JSON.stringify(makeValidRecommendation()), inputTokens: 1, outputTokens: 1 })

    enqueueBuilders((adminClient.from as any), [
      ...preAnalysisQueue(),
      ...saveComponentQueue(), // 5_ai_analysis
      ...saveComponentQueue(), // 6_risks
      ...saveComponentQueue(), // 7_recommendation
      noop(), noop(), // transition in_analysis -> waiting_for_user
    ])

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)

    expect(callAI).toHaveBeenCalledTimes(3)
    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.recommendation_available).toBe(true)
  })

  it('returns 200 with a full recommendation on the first-try happy path', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(callAI as any)
      .mockResolvedValueOnce({ text: JSON.stringify(makeValidAnalysis()), inputTokens: 1, outputTokens: 1 })
      .mockResolvedValueOnce({ text: JSON.stringify(makeValidRecommendation()), inputTokens: 1, outputTokens: 1 })

    enqueueBuilders((adminClient.from as any), [
      ...preAnalysisQueue(),
      ...saveComponentQueue(),
      ...saveComponentQueue(),
      ...saveComponentQueue(),
      noop(), noop(),
    ])

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)

    expect(callAI).toHaveBeenCalledTimes(2)
    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.recommendation_available).toBe(true)
    expect(body.decision_status).toBe('waiting_for_user')
    expect(body.recommendation.recommended_alternative_id).toBe('alt-1')
  })

  it('returns a partial success (200, recommendation unavailable) when the Recommendation Engine call fails', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(callAI as any)
      .mockResolvedValueOnce({ text: JSON.stringify(makeValidAnalysis()), inputTokens: 1, outputTokens: 1 })
      .mockRejectedValueOnce(new Error('AI_TIMEOUT'))

    enqueueBuilders((adminClient.from as any), [
      ...preAnalysisQueue(),
      ...saveComponentQueue(), // 5_ai_analysis
      ...saveComponentQueue(), // 6_risks
      noop(), noop(), // transition in_analysis -> waiting_for_user (partial success)
    ])

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.recommendation).toBeNull()
    expect(body.recommendation_available).toBe(false)
    expect(body.decision_status).toBe('waiting_for_user')
    expect(body.recommendation_error).toBeTruthy()
  })

  it('returns a partial success when the recommendation is still invalid after one regeneration', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(callAI as any)
      .mockResolvedValueOnce({ text: JSON.stringify(makeValidAnalysis()), inputTokens: 1, outputTokens: 1 })
      .mockResolvedValueOnce({ text: JSON.stringify({ recommended_alternative_id: 'not-a-real-alt' }), inputTokens: 1, outputTokens: 1 })
      .mockResolvedValueOnce({ text: JSON.stringify({ recommended_alternative_id: 'still-invalid' }), inputTokens: 1, outputTokens: 1 })

    enqueueBuilders((adminClient.from as any), [
      ...preAnalysisQueue(),
      ...saveComponentQueue(),
      ...saveComponentQueue(),
      noop(), noop(),
    ])

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)

    expect(callAI).toHaveBeenCalledTimes(3)
    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.recommendation_available).toBe(false)
  })
})
