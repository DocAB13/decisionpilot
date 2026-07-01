import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { createElement, type ReactNode } from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { DecisionProvider, useDecision } from './DecisionContext'
import type { DecisionObject } from '@/core/decision/Decision.types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeDecision(overrides: Partial<DecisionObject> = {}): DecisionObject {
  return {
    id: 'dec-1',
    owner_id: 'user-1',
    anonymous_token: null,
    category: 'career',
    status: 'draft',
    title: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    expires_at: null,
    components: {},
    state_transitions: [],
    ...overrides,
  }
}

function wrapper({ children }: { children: ReactNode }) {
  return createElement(DecisionProvider, { decisionId: 'dec-1', children })
}

// ---------------------------------------------------------------------------
// MSW server — default handlers reset after every test via server.resetHandlers()
// ---------------------------------------------------------------------------

const server = setupServer(
  http.get('/api/decision/:id', () => HttpResponse.json({ decision: makeDecision() })),
  http.post('/api/decision/save', () => HttpResponse.json({ component: '1_context', version: 1 })),
  http.post('/api/decision/state', () => HttpResponse.json({}))
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// ---------------------------------------------------------------------------
// Initial load
// ---------------------------------------------------------------------------

describe('DecisionProvider — initial load', () => {
  it('fetches the decision on mount and clears isLoading', async () => {
    const { result } = renderHook(() => useDecision(), { wrapper })
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.decision?.id).toBe('dec-1')
    expect(result.current.error).toBeNull()
  })

  it('sets error and leaves decision null when the fetch returns an error', async () => {
    server.use(http.get('/api/decision/:id', () => HttpResponse.json({ error: 'Decision not found' })))

    const { result } = renderHook(() => useDecision(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Decision not found')
    expect(result.current.decision).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// updateComponent — optimistic local update
// ---------------------------------------------------------------------------

describe('DecisionProvider — updateComponent optimistic update', () => {
  it('updates local decision state immediately, before the debounced save fires', async () => {
    const { result } = renderHook(() => useDecision(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.updateComponent('1_context', { background: 'Updated background' })
    })

    expect(result.current.decision?.components['1_context']?.content).toEqual({
      background: 'Updated background',
    })
    expect(result.current.decision?.components['1_context']?.version).toBe(1)
    expect(result.current.saveState).toBe('saving')
  })
})

// ---------------------------------------------------------------------------
// updateComponent — auto-save debounce (IR01-079 acceptance criterion)
// ---------------------------------------------------------------------------

describe('DecisionProvider — auto-save debounce', () => {
  it('makes no /api/decision/save call within 800ms and exactly one call after', async () => {
    let saveCallCount = 0
    server.use(
      http.post('/api/decision/save', () => {
        saveCallCount++
        return HttpResponse.json({ component: '1_context', version: 1 })
      })
    )

    const { result } = renderHook(() => useDecision(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.updateComponent('1_context', { background: 'test' })
    })

    // No call within the 800ms debounce window.
    await new Promise(resolve => setTimeout(resolve, 700))
    expect(saveCallCount).toBe(0)

    // Exactly one call once the debounce window has elapsed.
    await waitFor(() => expect(saveCallCount).toBe(1), { timeout: 1000 })
  }, 3000)

  it('collapses rapid successive updates into a single save call', async () => {
    let saveCallCount = 0
    server.use(
      http.post('/api/decision/save', () => {
        saveCallCount++
        return HttpResponse.json({ component: '1_context', version: 1 })
      })
    )

    const { result } = renderHook(() => useDecision(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.updateComponent('1_context', { background: 'first' })
    })
    await new Promise(resolve => setTimeout(resolve, 300))
    act(() => {
      result.current.updateComponent('1_context', { background: 'second' })
    })

    await waitFor(() => expect(saveCallCount).toBe(1), { timeout: 1500 })
  }, 3000)
})

// ---------------------------------------------------------------------------
// saveState transitions
// ---------------------------------------------------------------------------

describe('DecisionProvider — saveState transitions', () => {
  it('transitions from "saving" to "saved" after a successful save', async () => {
    const { result } = renderHook(() => useDecision(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.updateComponent('1_context', { background: 'test' })
    })
    expect(result.current.saveState).toBe('saving')

    await waitFor(() => expect(result.current.saveState).toBe('saved'), { timeout: 2000 })
  }, 3000)

  it('sets saveState to "error" after three consecutive save failures', async () => {
    let saveCallCount = 0
    server.use(
      http.post('/api/decision/save', () => {
        saveCallCount++
        return new HttpResponse(null, { status: 500 })
      })
    )

    const { result } = renderHook(() => useDecision(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.updateComponent('1_context', { background: 'test' })
    })

    await waitFor(() => expect(result.current.saveState).toBe('error'), { timeout: 7000 })
    expect(saveCallCount).toBe(3)
  }, 8000)
})

// ---------------------------------------------------------------------------
// advanceState
// ---------------------------------------------------------------------------

describe('DecisionProvider — advanceState', () => {
  it('updates decision.status on a successful transition', async () => {
    server.use(http.post('/api/decision/state', () => HttpResponse.json({})))

    const { result } = renderHook(() => useDecision(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.advanceState('decision_made')
    })

    expect(result.current.decision?.status).toBe('decision_made')
  })

  it('merges a returned action_plan into components["9_action_plan"]', async () => {
    const actionPlan = { based_on_alternative_id: 'alt-1', based_on_alternative_name: 'Option A', action_items: [] }
    server.use(http.post('/api/decision/state', () => HttpResponse.json({ action_plan: actionPlan })))

    const { result } = renderHook(() => useDecision(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.advanceState('decision_made')
    })

    expect(result.current.decision?.components['9_action_plan']?.content).toEqual(actionPlan)
  })

  it('rejects and leaves decision.status unchanged when the API returns an error', async () => {
    server.use(http.post('/api/decision/state', () => HttpResponse.json({ error: 'Invalid transition' })))

    const { result } = renderHook(() => useDecision(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(
      act(async () => {
        await result.current.advanceState('decision_made')
      })
    ).rejects.toThrow('Invalid transition')

    expect(result.current.decision?.status).toBe('draft')
  })
})
