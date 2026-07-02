import { describe, it, expect, vi, afterEach } from 'vitest'
import { makeBuilder, createMockReq, createMockRes, MOCK_USER, mockAuthedUser } from './testHelpers'
import type {
  ContextContent,
  GoalContent,
  ConstraintsContent,
  FinalDecisionContent,
} from '@/core/decision/Decision.types'

vi.mock('@/lib/supabase/admin', () => ({ adminClient: { from: vi.fn() } }))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/core/ai/call', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/ai/call')>()
  return { ...actual, callAI: vi.fn() }
})

async function loadHandler() {
  vi.resetModules()
  const mod = await import('../../../pages/api/decision/state')
  return mod.default
}

const DECISION_ID = 'decision-uuid-1'

async function authedReq(body: unknown) {
  const { createClient } = await import('@/lib/supabase/server')
  ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))
  return createMockReq({ method: 'POST', body })
}

const context: ContextContent = {
  background: 'Looking to switch software vendors',
  current_situation: 'Using vendor X, unhappy with support',
  prior_attempts: null,
  timing_constraints: null,
  geographic_market: 'Dublin',
  currency: 'EUR',
}
const goal: GoalContent = { primary: 'Reduce monthly cost', success_criteria: null, time_horizon: null, secondary_goals: [] }
const constraints: ConstraintsContent = { hard: [], soft: [] }
const chosenAlt: FinalDecisionContent = {
  chosen_alternative_id: 'alt-1',
  chosen_alternative_name: 'Option A',
  matches_recommendation: true,
  divergence_reason: null,
  confidence: 'confident',
  recorded_at: '2026-01-01T00:00:00Z',
}

const componentRowsForActionPlan = [
  { component: '8_final_decision', content: chosenAlt },
  { component: '1_context', content: context },
  { component: '2_goal', content: goal },
  { component: '3_constraints', content: constraints },
]

const validActionPlanJSON = JSON.stringify({
  based_on_alternative_id: 'alt-1',
  based_on_alternative_name: 'Option A',
  action_items: [
    { sequence: 1, title: 'A', detail: 'a', estimated_effort: 'low', time_estimate: '1 day', completed: false, completed_at: null },
    { sequence: 2, title: 'B', detail: 'b', estimated_effort: 'low', time_estimate: '1 day', completed: false, completed_at: null },
    { sequence: 3, title: 'C', detail: 'c', estimated_effort: 'low', time_estimate: '1 day', completed: false, completed_at: null },
  ],
})

describe('POST /api/decision/state', () => {
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
    const req = createMockReq({ method: 'POST', body: { decision_id: DECISION_ID, to_status: 'archived' } })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 400 when decision_id is missing', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ to_status: 'archived' })
    const res = createMockRes()
    await handler(req, res)
    expect(res.json).toHaveBeenCalledWith({ error: 'decision_id is required' })
  })

  it('returns 400 when to_status is missing', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID })
    const res = createMockRes()
    await handler(req, res)
    expect(res.json).toHaveBeenCalledWith({ error: 'to_status is required' })
  })

  it('returns 400 for a system-only to_status (not user-initiatable)', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'in_analysis' })
    const res = createMockRes()
    await handler(req, res)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid to_status: in_analysis' })
  })

  it('returns 404 when the decision does not exist or is not owned', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any).mockReturnValueOnce(makeBuilder({ data: null, error: null }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'archived' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 409 for a transition not allowed from the current state', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any).mockReturnValueOnce(
      makeBuilder({ data: { id: DECISION_ID, status: 'draft', category: 'financial' }, error: null })
    )

    const handler = await loadHandler()
    // draft only allows -> archived, not -> executing
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'executing' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid state transition: draft → executing' })
  })

  it('returns 409 when advancing to decision_made without a recorded Final Decision', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'waiting_for_user', category: 'financial' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: null })) // no 8_final_decision component

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'decision_made' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Final Decision must be recorded before advancing to decision_made',
    })
  })

  it('performs a simple transition (draft -> archived) with no Action Plan Engine involved', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const updateBuilder = makeBuilder({ data: { id: DECISION_ID, status: 'archived', updated_at: 'x' }, error: null })
    const transitionBuilder = makeBuilder({
      data: { from_status: 'draft', to_status: 'archived', trigger: 'user_action', created_at: 'x' },
      error: null,
    })

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'draft', category: 'financial' }, error: null }))
      .mockReturnValueOnce(updateBuilder)
      .mockReturnValueOnce(transitionBuilder)

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'archived' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.action_plan).toBeNull()
    expect(body.action_plan_error).toBeUndefined()
  })

  it('returns 500 when updating the decision status fails', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'draft', category: 'financial' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: null, error: new Error('db error') }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'archived' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('returns 500 when inserting the state transition fails', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'draft', category: 'financial' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'archived', updated_at: 'x' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: null, error: new Error('db error') }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'archived' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })

  // -------------------------------------------------------------------------
  // decision_made -> Action Plan Engine
  // -------------------------------------------------------------------------

  it('generates and stores an Action Plan when advancing to decision_made', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(callAI as any).mockResolvedValue({ text: validActionPlanJSON, inputTokens: 1, outputTokens: 1 })

    const insertBuilder = makeBuilder({ error: null })

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'waiting_for_user', category: 'financial' }, error: null })) // ownership
      .mockReturnValueOnce(makeBuilder({ data: { id: 'comp8-id' } })) // final decision exists
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'decision_made', updated_at: 'x' }, error: null })) // update status
      .mockReturnValueOnce(makeBuilder({ data: { from_status: 'waiting_for_user', to_status: 'decision_made', trigger: 'user_action', created_at: 'x' }, error: null })) // transition insert
      .mockReturnValueOnce(makeBuilder({ data: componentRowsForActionPlan, error: null })) // compRows for action plan
      .mockReturnValueOnce(makeBuilder({ error: null })) // mark old plan not current
      .mockReturnValueOnce(makeBuilder({ data: null })) // max version
      .mockReturnValueOnce(insertBuilder) // insert new plan

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'decision_made' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.action_plan).not.toBeNull()
    expect(body.action_plan.action_items).toHaveLength(3)
    expect(body.action_plan_error).toBeUndefined()
    expect(insertBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ component: '9_action_plan' }))
  })

  it('reports action_plan_error (but still 200) when required components are missing', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'waiting_for_user', category: 'financial' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { id: 'comp8-id' } }))
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'decision_made', updated_at: 'x' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { from_status: 'waiting_for_user', to_status: 'decision_made', trigger: 'user_action', created_at: 'x' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: [], error: null })) // no components found at all

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'decision_made' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.action_plan).toBeNull()
    expect(body.action_plan_error).toBe('The action plan could not be generated. The state transition was successful.')
  })

  it('reports action_plan_error (but still 200) when the Action Plan Engine call fails', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(callAI as any).mockRejectedValue(new Error('AI_TIMEOUT'))

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'waiting_for_user', category: 'financial' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { id: 'comp8-id' } }))
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'decision_made', updated_at: 'x' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { from_status: 'waiting_for_user', to_status: 'decision_made', trigger: 'user_action', created_at: 'x' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: componentRowsForActionPlan, error: null }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'decision_made' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.action_plan_error).toBe('The action plan could not be generated. The state transition was successful.')
  })

  it('reports action_plan_error when the AI output fails validation (wrong item count)', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(callAI as any).mockResolvedValue({
      text: JSON.stringify({ based_on_alternative_id: 'alt-1', based_on_alternative_name: 'A', action_items: [{ sequence: 1 }] }),
      inputTokens: 1,
      outputTokens: 1,
    })

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'waiting_for_user', category: 'financial' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { id: 'comp8-id' } }))
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'decision_made', updated_at: 'x' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { from_status: 'waiting_for_user', to_status: 'decision_made', trigger: 'user_action', created_at: 'x' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: componentRowsForActionPlan, error: null }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'decision_made' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.action_plan_error).toBe('The action plan could not be generated. The state transition was successful.')
  })

  it('reports action_plan_error when the AI returns non-JSON output', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const { callAI } = await import('@/core/ai/call')
    ;(callAI as any).mockResolvedValue({ text: 'sorry, I cannot help with that', inputTokens: 1, outputTokens: 1 })

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'waiting_for_user', category: 'financial' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { id: 'comp8-id' } }))
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, status: 'decision_made', updated_at: 'x' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { from_status: 'waiting_for_user', to_status: 'decision_made', trigger: 'user_action', created_at: 'x' }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: componentRowsForActionPlan, error: null }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, to_status: 'decision_made' })
    const res = createMockRes()
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.action_plan_error).toBe('The action plan could not be generated. The state transition was successful.')
  })
})
