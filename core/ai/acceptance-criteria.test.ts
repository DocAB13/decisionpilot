/**
 * IR01-055 — Phase 4 AI Acceptance Criteria verification tests
 * Per H11 §14 AAC-01 through AAC-06.
 *
 * Tests in validate.test.ts already cover:
 *   AAC-01: specific_to_user enforcement, all alternatives present
 *   AAC-01: market_data_caveat (financial/tech/insurance), professional_advice_disclaimer (fin/health/ins)
 *   AAC-02: hard constraint enforcement, primary_reasoning length, honest_tradeoffs, conditions_for_change ≥30
 *   AAC-03: validateActionPlanOutput (3-5 items, required fields)
 *   AAC-05: conflict-resolution null recommended_alternative_id when all alternatives violate constraints
 *
 * This file covers:
 *   AAC-04: Chat Engine allowed states (FR-07.1)
 *   AAC-06: AI timeout (callAI) and consecutive validation failures
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isChatAllowedForStatus, CHAT_ALLOWED_STATES } from '@/core/decision/Decision.utils'
import { parseAIJSON } from '@/core/ai/call'

// ---------------------------------------------------------------------------
// AAC-04 — Chat Engine allowed states (H11 §14, FR-07.1)
// Chat is accessible ONLY in draft, waiting_for_user, and decision_made.
// ---------------------------------------------------------------------------

describe('AAC-04 — isChatAllowedForStatus', () => {
  it('allows chat in "draft" state', () => {
    expect(isChatAllowedForStatus('draft')).toBe(true)
  })

  it('allows chat in "waiting_for_user" state', () => {
    expect(isChatAllowedForStatus('waiting_for_user')).toBe(true)
  })

  it('allows chat in "decision_made" state', () => {
    expect(isChatAllowedForStatus('decision_made')).toBe(true)
  })

  it('blocks chat in "completed" state — returns 409 (FR-07.1)', () => {
    expect(isChatAllowedForStatus('completed')).toBe(false)
  })

  it('blocks chat in "in_analysis" state', () => {
    expect(isChatAllowedForStatus('in_analysis')).toBe(false)
  })

  it('blocks chat in "executing" state', () => {
    expect(isChatAllowedForStatus('executing')).toBe(false)
  })

  it('blocks chat in "archived" state', () => {
    expect(isChatAllowedForStatus('archived')).toBe(false)
  })

  it('CHAT_ALLOWED_STATES set contains exactly the three allowed states', () => {
    expect(CHAT_ALLOWED_STATES.size).toBe(3)
    expect(CHAT_ALLOWED_STATES.has('draft')).toBe(true)
    expect(CHAT_ALLOWED_STATES.has('waiting_for_user')).toBe(true)
    expect(CHAT_ALLOWED_STATES.has('decision_made')).toBe(true)
    expect(CHAT_ALLOWED_STATES.has('completed')).toBe(false)
    expect(CHAT_ALLOWED_STATES.has('in_analysis')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// AAC-06 — AI timeout: callAI rejects with AI_TIMEOUT after 29 seconds
// Simulates a slow/unresponsive Anthropic API response (H11 §14 AAC-06)
// ---------------------------------------------------------------------------

describe('AAC-06 — callAI 29-second timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    process.env.ANTHROPIC_API_KEY = 'test-key-aac06'
    // Mock fetch to return a promise that never resolves (simulates a hung API call)
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}) as never)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    delete process.env.ANTHROPIC_API_KEY
  })

  it('rejects with AI_TIMEOUT when the Anthropic API does not respond within 29 seconds', async () => {
    const { callAI } = await import('@/core/ai/call')

    const callPromise = callAI({ system: 'test', user: 'test', maxTokens: 100 })
    // Pre-attach handler so Node.js does not flag this as an unhandled rejection
    // before the timer advances and our expect(...).rejects catches it.
    callPromise.catch(() => {})

    // Advance past the 29-second timeout
    await vi.advanceTimersByTimeAsync(30_000)

    await expect(callPromise).rejects.toThrow('AI_TIMEOUT')
  })

  it('does NOT reject before 29 seconds have elapsed', async () => {
    const { callAI } = await import('@/core/ai/call')

    let rejected = false
    const callPromise = callAI({ system: 'test', user: 'test', maxTokens: 100 })
    callPromise.catch(() => { rejected = true })

    // Advance to just before the timeout
    await vi.advanceTimersByTimeAsync(28_000)
    await Promise.resolve() // Flush microtasks

    expect(rejected).toBe(false)

    // Advance past the timeout and consume the rejection cleanly
    await vi.advanceTimersByTimeAsync(2_000)
    await expect(callPromise).rejects.toThrow('AI_TIMEOUT')
  })
})

// ---------------------------------------------------------------------------
// AAC-06 — parseAIJSON: rejects non-JSON responses (H11 §14 AAC-06)
// Provider errors that return prose instead of JSON must not silently proceed.
// ---------------------------------------------------------------------------

describe('AAC-06 — parseAIJSON rejects non-JSON AI responses', () => {
  it('throws AI_RESPONSE_NOT_JSON when response starts with plain text', () => {
    expect(() => parseAIJSON('I am sorry, I cannot help with that.')).toThrow('AI_RESPONSE_NOT_JSON')
  })

  it('throws AI_RESPONSE_NOT_JSON when response is an empty string', () => {
    expect(() => parseAIJSON('')).toThrow('AI_RESPONSE_NOT_JSON')
  })

  it('throws AI_RESPONSE_NOT_JSON when response starts with markdown code fence', () => {
    // cleanJSON in callAI strips fences before parseAIJSON, but raw text reaching
    // parseAIJSON directly must still be rejected
    expect(() => parseAIJSON('```json\n{"key": "value"}\n```')).toThrow('AI_RESPONSE_NOT_JSON')
  })

  it('parses valid JSON object without throwing', () => {
    expect(() => parseAIJSON<object>('{"valid": true}')).not.toThrow()
  })

  it('parses valid JSON array without throwing', () => {
    expect(() => parseAIJSON<unknown[]>('[1, 2, 3]')).not.toThrow()
  })
})
