import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Stripe from 'stripe'

// H10 §11.3 explicitly requires this route's Stripe webhook signature validation
// to be tested. `@/lib/supabase/admin` throws at import time without real
// Supabase credentials, so it is mocked entirely — this also keeps every test
// free of real network/database calls.
//
// This file lives outside `pages/` deliberately: Next.js's Pages Router treats
// every file under `pages/` as a route, so a `pages/api/**/*.test.ts` file
// would build and ship as a live (if empty) production API route.
vi.mock('@/lib/supabase/admin', () => ({
  adminClient: { from: vi.fn() },
}))

const WEBHOOK_SECRET = 'whsec_test_secret'
// Only used locally to generate a valid `stripe-signature` header — never makes
// a network call.
const stripeForSigning = new Stripe('sk_test_dummy_for_signing')

function signPayload(payload: string): string {
  return stripeForSigning.webhooks.generateTestHeaderString({
    payload,
    secret: WEBHOOK_SECRET,
  })
}

function makeQueryBuilder(result: { data?: unknown; error?: unknown }) {
  const builder: any = {
    upsert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    select: vi.fn(() => builder),
    then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  }
  return builder
}

function createMockReq(rawBody: string, headers: Record<string, string> = {}, method = 'POST') {
  const payload = Buffer.from(rawBody)
  return {
    method,
    headers,
    [Symbol.asyncIterator]: async function* () {
      yield payload
    },
  } as any
}

function createMockRes() {
  const res: any = {}
  res.status = vi.fn(() => res)
  res.end = vi.fn(() => res)
  res.json = vi.fn(() => res)
  return res
}

async function loadHandler() {
  vi.resetModules()
  const mod = await import('../../../pages/api/billing/webhook')
  return mod.default
}

const checkoutCompletedEvent = (metadata: Record<string, string>) =>
  JSON.stringify({
    id: 'evt_checkout_1',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_1',
        customer: 'cus_123',
        subscription: 'sub_123',
        metadata,
      },
    },
  })

const subscriptionDeletedEvent = JSON.stringify({
  id: 'evt_sub_deleted_1',
  object: 'event',
  type: 'customer.subscription.deleted',
  data: { object: { id: 'sub_123', customer: 'cus_123' } },
})

describe('POST /api/billing/webhook', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.STRIPE_WEBHOOK_SECRET
  })

  // -------------------------------------------------------------------------
  // Method guard
  // -------------------------------------------------------------------------

  it('returns 405 for non-POST methods', async () => {
    const handler = await loadHandler()
    const req = createMockReq('{}', {}, 'GET')
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.end).toHaveBeenCalled()
  })

  it('reads a raw body delivered as string chunks (not just Buffer chunks)', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const builder = makeQueryBuilder({ error: null })
    ;(adminClient.from as any).mockReturnValue(builder)

    const handler = await loadHandler()
    const payload = checkoutCompletedEvent({ user_id: 'user-uuid-1' })
    const req = {
      method: 'POST',
      headers: { 'stripe-signature': signPayload(payload) },
      [Symbol.asyncIterator]: async function* () {
        yield payload // string chunk, not Buffer
      },
    } as any
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  // -------------------------------------------------------------------------
  // Signature validation (H10 §11.3, H14 §8)
  // -------------------------------------------------------------------------

  it('returns 400 when the stripe-signature header is missing', async () => {
    const handler = await loadHandler()
    const req = createMockReq(checkoutCompletedEvent({ user_id: 'u1' }), {})
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when the signature does not match the payload (tampered body)', async () => {
    const handler = await loadHandler()
    const payload = checkoutCompletedEvent({ user_id: 'u1' })
    // Sign a different payload than the one actually sent.
    const signatureForOtherPayload = signPayload(checkoutCompletedEvent({ user_id: 'attacker' }))
    const req = createMockReq(payload, { 'stripe-signature': signatureForOtherPayload })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when the signature was generated with the wrong secret', async () => {
    const handler = await loadHandler()
    const payload = checkoutCompletedEvent({ user_id: 'u1' })
    const wrongSecretSig = stripeForSigning.webhooks.generateTestHeaderString({
      payload,
      secret: 'whsec_wrong_secret',
    })
    const req = createMockReq(payload, { 'stripe-signature': wrongSecretSig })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('does not echo the verification error message in the response body (H14 §"Do not echo")', async () => {
    const handler = await loadHandler()
    const req = createMockReq(checkoutCompletedEvent({ user_id: 'u1' }), {})
    const res = createMockRes()

    await handler(req, res)

    expect(res.json).not.toHaveBeenCalled()
    expect(res.end).toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // checkout.session.completed
  // -------------------------------------------------------------------------

  it('upserts an active subscription when checkout.session.completed carries a user_id', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const builder = makeQueryBuilder({ error: null })
    ;(adminClient.from as any).mockReturnValue(builder)

    const handler = await loadHandler()
    const payload = checkoutCompletedEvent({ user_id: 'user-uuid-1', plan: 'pro' })
    const req = createMockReq(payload, { 'stripe-signature': signPayload(payload) })
    const res = createMockRes()

    await handler(req, res)

    expect(adminClient.from).toHaveBeenCalledWith('subscriptions')
    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-uuid-1',
        stripe_customer_id: 'cus_123',
        stripe_subscription_id: 'sub_123',
        plan: 'pro',
        status: 'active',
      }),
      { onConflict: 'user_id' }
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ received: true })
  })

  it('defaults plan to "pro" when metadata.plan is absent', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const builder = makeQueryBuilder({ error: null })
    ;(adminClient.from as any).mockReturnValue(builder)

    const handler = await loadHandler()
    const payload = checkoutCompletedEvent({ user_id: 'user-uuid-1' })
    const req = createMockReq(payload, { 'stripe-signature': signPayload(payload) })
    const res = createMockRes()

    await handler(req, res)

    expect(builder.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'pro' }),
      expect.anything()
    )
  })

  it('does not write to the database when checkout.session.completed has no user_id (still returns 200)', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')

    const handler = await loadHandler()
    const payload = checkoutCompletedEvent({})
    const req = createMockReq(payload, { 'stripe-signature': signPayload(payload) })
    const res = createMockRes()

    await handler(req, res)

    expect(adminClient.from).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ received: true })
  })

  it('returns 500 when the subscriptions upsert fails', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const builder = makeQueryBuilder({ error: new Error('db unavailable') })
    ;(adminClient.from as any).mockReturnValue(builder)

    const handler = await loadHandler()
    const payload = checkoutCompletedEvent({ user_id: 'user-uuid-1' })
    const req = createMockReq(payload, { 'stripe-signature': signPayload(payload) })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Webhook processing failed' })
  })

  // -------------------------------------------------------------------------
  // customer.subscription.deleted
  // -------------------------------------------------------------------------

  it('downgrades the matching subscription to free/cancelled on customer.subscription.deleted', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const builder = makeQueryBuilder({ data: [{ user_id: 'user-uuid-1' }], error: null })
    ;(adminClient.from as any).mockReturnValue(builder)

    const handler = await loadHandler()
    const req = createMockReq(subscriptionDeletedEvent, {
      'stripe-signature': signPayload(subscriptionDeletedEvent),
    })
    const res = createMockRes()

    await handler(req, res)

    expect(adminClient.from).toHaveBeenCalledWith('subscriptions')
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'free', status: 'cancelled' })
    )
    expect(builder.eq).toHaveBeenCalledWith('stripe_customer_id', 'cus_123')
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('still returns 200 when no subscription row matches the deleted customer', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const builder = makeQueryBuilder({ data: [], error: null })
    ;(adminClient.from as any).mockReturnValue(builder)

    const handler = await loadHandler()
    const req = createMockReq(subscriptionDeletedEvent, {
      'stripe-signature': signPayload(subscriptionDeletedEvent),
    })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ received: true })
  })

  it('returns 500 when the subscription downgrade update fails', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')
    const builder = makeQueryBuilder({ error: new Error('db unavailable') })
    ;(adminClient.from as any).mockReturnValue(builder)

    const handler = await loadHandler()
    const req = createMockReq(subscriptionDeletedEvent, {
      'stripe-signature': signPayload(subscriptionDeletedEvent),
    })
    const res = createMockRes()

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
  })

  // -------------------------------------------------------------------------
  // Unhandled event types
  // -------------------------------------------------------------------------

  it('returns 200 without touching the database for an event type it does not handle', async () => {
    const { adminClient } = await import('@/lib/supabase/admin')

    const handler = await loadHandler()
    const payload = JSON.stringify({
      id: 'evt_other',
      object: 'event',
      type: 'invoice.paid',
      data: { object: {} },
    })
    const req = createMockReq(payload, { 'stripe-signature': signPayload(payload) })
    const res = createMockRes()

    await handler(req, res)

    expect(adminClient.from).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ received: true })
  })
})
