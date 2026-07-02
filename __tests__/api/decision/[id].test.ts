import { describe, it, expect, vi, afterEach } from 'vitest'
import { makeBuilder, createMockReq, createMockRes, MOCK_USER, mockAuthedUser } from './testHelpers'

vi.mock('@/lib/supabase/admin', () => ({ adminClient: { from: vi.fn() } }))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

async function loadHandler() {
  vi.resetModules()
  const mod = await import('../../../pages/api/decision/[id]')
  return mod.default
}

const DECISION_ID = 'decision-uuid-1'

describe('GET /api/decision/[id]', () => {
  afterEach(async () => {
    // mockReturnValueOnce queues are not cleared by clearAllMocks(); reset explicitly
    // so a queue misconfigured in one test can never leak into the next.
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any).mockReset()
    vi.clearAllMocks()
  })

  it('returns 401 when there is no session and no anonymous_token', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    ;(createClient as any).mockReturnValue(mockAuthedUser(null))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'GET', query: { id: DECISION_ID } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 404 when the decision does not exist or is not owned', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))
    ;(adminClient.from as any).mockReturnValueOnce(makeBuilder({ data: null, error: { message: 'not found' } }))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'GET', query: { id: DECISION_ID } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns the full decision with components and transitions for an authenticated owner', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))

    const decisionRow = {
      id: DECISION_ID,
      owner_id: MOCK_USER.id,
      category: 'financial',
      status: 'draft',
      title: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
      expires_at: null,
    }
    const componentRows = [
      { component: '1_context', version: 1, content: { background: 'x' }, created_at: '2026-01-01T00:00:00Z', prompt_version: null },
    ]
    const transitions = [{ from_status: 'draft', to_status: 'draft', trigger: 'user_action', created_at: '2026-01-01T00:00:00Z' }]

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: decisionRow, error: null })) // decisions
      .mockReturnValueOnce(makeBuilder({ data: componentRows, error: null })) // decision_components
      .mockReturnValueOnce(makeBuilder({ data: transitions, error: null })) // decision_state_transitions

    const handler = await loadHandler()
    const req = createMockReq({ method: 'GET', query: { id: DECISION_ID } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.decision.id).toBe(DECISION_ID)
    expect(body.decision.components['1_context'].content).toEqual({ background: 'x' })
    expect(body.decision.state_transitions).toEqual(transitions)
    expect(body.decision).not.toHaveProperty('expires_at')
  })

  it('includes expires_at in the response when it is set', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(createClient as any).mockReturnValue(mockAuthedUser(null))

    const decisionRow = {
      id: DECISION_ID,
      owner_id: null,
      category: 'financial',
      status: 'draft',
      title: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      expires_at: '2026-01-03T00:00:00Z',
    }

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: decisionRow, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: [], error: null }))
      .mockReturnValueOnce(makeBuilder({ data: [], error: null }))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'GET', query: { id: DECISION_ID, anonymous_token: 'anon-token-1' } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    const body = (res.json as any).mock.calls[0][0]
    expect(body.decision.expires_at).toBe('2026-01-03T00:00:00Z')
  })

  it('returns 500 when fetching components fails', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, category: 'financial', status: 'draft', created_at: 'x', updated_at: 'x', title: null, expires_at: null }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: null, error: { message: 'db error' } }))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'GET', query: { id: DECISION_ID } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('returns 500 when fetching state transitions fails', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID, category: 'financial', status: 'draft', created_at: 'x', updated_at: 'x', title: null, expires_at: null }, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: [], error: null }))
      .mockReturnValueOnce(makeBuilder({ data: null, error: { message: 'db error' } }))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'GET', query: { id: DECISION_ID } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('merges prior versions into each component\'s history when include_history=true', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))

    const decisionRow = { id: DECISION_ID, category: 'financial', status: 'draft', created_at: 'x', updated_at: 'x', title: null, expires_at: null }
    const componentRows = [{ component: '1_context', version: 2, content: { background: 'new' }, created_at: 'x', prompt_version: null }]
    const historyRows = [{ component: '1_context', version: 1, content: { background: 'old' }, created_at: 'y', prompt_version: null, is_current: false }]

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: decisionRow, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: componentRows, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: [], error: null }))
      .mockReturnValueOnce(makeBuilder({ data: historyRows, error: null }))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'GET', query: { id: DECISION_ID, include_history: 'true' } })
    const res = createMockRes()

    await handler(req, res)

    const body = (res.json as any).mock.calls[0][0]
    expect(body.decision.components['1_context'].history).toEqual([
      { version: 1, content: { background: 'old' }, created_at: 'y' },
    ])
  })

  it('returns 500 when fetching history fails', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))

    const decisionRow = { id: DECISION_ID, category: 'financial', status: 'draft', created_at: 'x', updated_at: 'x', title: null, expires_at: null }

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: decisionRow, error: null }))
      .mockReturnValueOnce(makeBuilder({ data: [], error: null }))
      .mockReturnValueOnce(makeBuilder({ data: [], error: null }))
      .mockReturnValueOnce(makeBuilder({ data: null, error: { message: 'db error' } }))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'GET', query: { id: DECISION_ID, include_history: 'true' } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })
})

describe('DELETE /api/decision/[id]', () => {
  afterEach(async () => {
    // mockReturnValueOnce queues are not cleared by clearAllMocks(); reset explicitly
    // so a queue misconfigured in one test can never leak into the next.
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(adminClient.from as any).mockReset()
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    ;(createClient as any).mockReturnValue(mockAuthedUser(null))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'DELETE', query: { id: DECISION_ID } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 404 when the decision does not exist or belongs to another user', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))
    ;(adminClient.from as any).mockReturnValueOnce(makeBuilder({ data: null, error: null }))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'DELETE', query: { id: DECISION_ID } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('deletes the decision and returns 204 for the owner', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))

    const deleteBuilder = makeBuilder({ error: null })
    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID }, error: null }))
      .mockReturnValueOnce(deleteBuilder)

    const handler = await loadHandler()
    const req = createMockReq({ method: 'DELETE', query: { id: DECISION_ID } })
    const res = createMockRes()

    await handler(req, res)

    expect(deleteBuilder.delete).toHaveBeenCalled()
    expect(deleteBuilder.eq).toHaveBeenCalledWith('id', DECISION_ID)
    expect(deleteBuilder.eq).toHaveBeenCalledWith('owner_id', MOCK_USER.id)
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.end).toHaveBeenCalled()
  })

  it('returns 500 when the delete fails', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { adminClient } = await import('@/lib/supabase/admin')
    ;(createClient as any).mockReturnValue(mockAuthedUser(MOCK_USER))

    ;(adminClient.from as any)
      .mockReturnValueOnce(makeBuilder({ data: { id: DECISION_ID }, error: null }))
      .mockReturnValueOnce(makeBuilder({ error: new Error('db unavailable') }))

    const handler = await loadHandler()
    const req = createMockReq({ method: 'DELETE', query: { id: DECISION_ID } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })
})

describe('other methods on /api/decision/[id]', () => {
  it('returns 405 for unsupported methods', async () => {
    const handler = await loadHandler()
    const req = createMockReq({ method: 'PUT', query: { id: DECISION_ID } })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.end).toHaveBeenCalled()
  })
})
