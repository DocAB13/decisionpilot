import { vi } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'

// Shared test-only helpers for __tests__/api/decision/*.test.ts. Not a test
// file itself (no .test.ts suffix), so Vitest does not run it as a suite.
//
// This directory lives outside `pages/` deliberately: Next.js's Pages Router
// treats every file under `pages/` as a route, so a `pages/api/**/*.test.ts`
// file would build and ship as a live (if empty) production API route.

/**
 * A chainable, thenable mock query builder mimicking the subset of the
 * Supabase JS query builder these routes use. Every chain method returns
 * the same builder; `.single()`/`.maybeSingle()` and awaiting the builder
 * directly (via `.eq()`, `.limit()`, etc. as the last call) all resolve to
 * the configured `result`.
 */
export function makeBuilder(result: { data?: unknown; error?: unknown } = { data: null, error: null }) {
  const builder: any = {}
  const chainMethods = ['select', 'eq', 'order', 'limit', 'update', 'insert', 'delete', 'in', 'upsert']
  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder)
  }
  builder.single = vi.fn(() => Promise.resolve(result))
  builder.maybeSingle = vi.fn(() => Promise.resolve(result))
  builder.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject)
  return builder
}

export function createMockReq(
  opts: {
    method?: string
    body?: unknown
    query?: Record<string, string>
    headers?: Record<string, string>
  } = {}
): NextApiRequest {
  return {
    method: opts.method ?? 'POST',
    body: opts.body,
    query: opts.query ?? {},
    headers: opts.headers ?? {},
  } as unknown as NextApiRequest
}

export function createMockRes(): NextApiResponse & {
  status: ReturnType<typeof vi.fn>
  json: ReturnType<typeof vi.fn>
  end: ReturnType<typeof vi.fn>
} {
  const res: any = {}
  res.status = vi.fn(() => res)
  res.json = vi.fn(() => res)
  res.end = vi.fn(() => res)
  res.redirect = vi.fn(() => res)
  return res
}

/** A builder whose terminal awaited call rejects — for simulating a thrown/rejected DB call. */
export function makeRejectingBuilder(error: unknown) {
  const builder: any = {}
  const chainMethods = ['select', 'eq', 'order', 'limit', 'update', 'insert', 'delete', 'in', 'upsert']
  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder)
  }
  builder.single = vi.fn(() => Promise.reject(error))
  builder.maybeSingle = vi.fn(() => Promise.reject(error))
  builder.then = (_resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.reject(error).catch((e: unknown) => {
      if (reject) return reject(e)
      throw e
    })
  return builder
}

/** Queues an ordered sequence of return values for successive `adminClient.from(...)` calls. */
export function enqueueBuilders(fromMock: ReturnType<typeof vi.fn>, builders: unknown[]) {
  for (const builder of builders) {
    ;(fromMock as any).mockReturnValueOnce(builder)
  }
}

export const MOCK_USER = { id: 'user-uuid-1' }

export function mockAuthedUser(user: { id: string } | null = MOCK_USER) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  }
}
