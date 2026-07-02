import { describe, it, expect, vi, afterEach } from 'vitest'
import { makeBuilder, createMockReq, createMockRes, MOCK_USER, mockAuthedUser } from './testHelpers'

vi.mock('@/lib/supabase/admin', () => ({ adminClient: { from: vi.fn() } }))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

async function loadHandler() {
  vi.resetModules()
  const mod = await import('../../../pages/api/decision/save')
  return mod.default
}

const DECISION_ID = 'decision-uuid-1'

async function authedReq(body: unknown) {
  const { createClient } = await import('@/lib/supabase/server')
  ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))
  return createMockReq({ method: 'POST', body })
}

describe('POST /api/decision/save', () => {
  afterEach(async () => {
    // mockReturnValueOnce queues are not cleared by clearAllMocks(); reset explicitly
    // so a queue misconfigured in one test can never leak into the next.
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any).mockReset()
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
    const req = createMockReq({ method: 'POST', body: { decision_id: DECISION_ID, component: '1_context', content: {} } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  // -------------------------------------------------------------------------
  // Input validation
  // -------------------------------------------------------------------------

  it('returns 400 when decision_id is missing', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ component: '1_context', content: {} })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'decision_id is required' })
  })

  it('returns 400 when component is missing', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, content: {} })
    const res = createMockRes()

    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith({ error: 'component is required' })
  })

  it('returns 400 when content is missing', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '1_context' })
    const res = createMockRes()

    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith({ error: 'content is required' })
  })

  it('returns 400 when content is null', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '1_context', content: null })
    const res = createMockRes()

    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith({ error: 'content is required' })
  })

  it('rejects a server-generated component that is not 9_action_plan', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '5_ai_analysis', content: { x: 1 } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Component 5_ai_analysis is server-generated and cannot be written by the client',
    })
  })

  it('rejects a component name that is neither client-writable nor 9_action_plan', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: 'not_a_real_component', content: { x: 1 } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid component: not_a_real_component' })
  })

  it('rejects content that is an array', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '1_context', content: [1, 2] })
    const res = createMockRes()

    await handler(req, res)

    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid content for component 1_context: content must be a non-null object',
    })
  })

  it('rejects content that is a primitive', async () => {
    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '1_context', content: 'a string' })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  // -------------------------------------------------------------------------
  // Ownership
  // -------------------------------------------------------------------------

  it('returns 404 when the decision does not exist or is not owned', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any).mockReturnValueOnce(makeBuilder({ data: null, error: null }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '1_context', content: { background: 'x' } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  // -------------------------------------------------------------------------
  // Successful write path (client-writable component)
  // -------------------------------------------------------------------------

  it('saves a new version of a client-writable component and touches the parent decision', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const markOldBuilder = makeBuilder({ error: null })
    const maxVersionBuilder = makeBuilder({ data: { version: 2 } })
    const insertedComponent = { decision_id: DECISION_ID, component: '1_context', version: 3, is_current: true, created_at: 'x' }
    const insertBuilder = makeBuilder({ data: insertedComponent, error: null })
    const touchDecisionBuilder = makeBuilder({ error: null })

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID }, error: null })) // ownership
      .mockReturnValueOnce(markOldBuilder) // mark old not current
      .mockReturnValueOnce(maxVersionBuilder) // compute next version
      .mockReturnValueOnce(insertBuilder) // insert new version
      .mockReturnValueOnce(touchDecisionBuilder) // touch parent decision

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '1_context', content: { background: 'x' } })
    const res = createMockRes()

    await handler(req, res)

    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ decision_id: DECISION_ID, component: '1_context', version: 3, is_current: true })
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ component: insertedComponent })
  })

  it('uses version 1 when no prior version exists', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const insertBuilder = makeBuilder({ data: { version: 1 }, error: null })

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID }, error: null }))
      .mockReturnValueOnce(makeBuilder({ error: null }))
      .mockReturnValueOnce(makeBuilder({ data: null })) // no maxRow
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(makeBuilder({ error: null }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '2_goal', content: { primary: 'x' } })
    const res = createMockRes()

    await handler(req, res)

    expect(insertBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ version: 1 }))
  })

  it('returns 500 when the insert fails', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID }, error: null }))
      .mockReturnValueOnce(makeBuilder({ error: null }))
      .mockReturnValueOnce(makeBuilder({ data: null }))
      .mockReturnValueOnce(makeBuilder({ data: null, error: new Error('insert failed') }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '2_goal', content: { primary: 'x' } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to save component. Please try again.' })
  })

  it('returns 500 when touching the parent decision fails', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID }, error: null }))
      .mockReturnValueOnce(makeBuilder({ error: null }))
      .mockReturnValueOnce(makeBuilder({ data: null }))
      .mockReturnValueOnce(makeBuilder({ data: { version: 1 }, error: null }))
      .mockReturnValueOnce(makeBuilder({ error: new Error('touch failed') }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '2_goal', content: { primary: 'x' } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })

  // -------------------------------------------------------------------------
  // 9_action_plan completion-toggle exception (IR01-075b)
  // -------------------------------------------------------------------------

  const basePlan = {
    based_on_alternative_id: 'alt-1',
    based_on_alternative_name: 'Option A',
    action_items: [
      { sequence: 1, title: 'Do X', detail: 'Detail', estimated_effort: 'low', time_estimate: '1 day', completed: false, completed_at: null },
    ],
  }

  it('rejects an action-plan write when no current plan exists to toggle against', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID }, error: null })) // ownership
      .mockReturnValueOnce(makeBuilder({ data: null })) // no current plan

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '9_action_plan', content: basePlan })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Component 9_action_plan is server-generated; only `completed` and `completed_at` on existing items may be changed',
    })
  })

  it('rejects an action-plan write that changes an immutable field', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const tamperedPlan = {
      ...basePlan,
      action_items: [{ ...basePlan.action_items[0], title: 'Tampered title' }],
    }

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: { content: basePlan } }))

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '9_action_plan', content: tamperedPlan })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('accepts an action-plan write that only toggles completed/completed_at', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const toggledPlan = {
      ...basePlan,
      action_items: [{ ...basePlan.action_items[0], completed: true, completed_at: '2026-01-01T00:00:00Z' }],
    }
    const insertBuilder = makeBuilder({ data: { version: 2 }, error: null })

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID }, error: null })) // ownership
      .mockReturnValueOnce(makeBuilder({ data: { content: basePlan } })) // current plan
      .mockReturnValueOnce(makeBuilder({ error: null })) // mark old not current
      .mockReturnValueOnce(makeBuilder({ data: { version: 1 } })) // max version
      .mockReturnValueOnce(insertBuilder) // insert
      .mockReturnValueOnce(makeBuilder({ error: null })) // touch decision

    const handler = await loadHandler()
    const req = await authedReq({ decision_id: DECISION_ID, component: '9_action_plan', content: toggledPlan })
    const res = createMockRes()

    await handler(req, res)

    expect(insertBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ content: toggledPlan }))
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
