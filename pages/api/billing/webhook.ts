import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { adminClient } from '@/lib/supabase/admin'

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Method guard
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  // 2. Read raw body and verify Stripe signature
  const rawBody = await readRawBody(req)
  const sig = req.headers['stripe-signature'] as string

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch {
    // Do not echo the error message — could aid forgery attempts
    return res.status(400).end()
  }

  // 3. Process relevant events
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id ?? ''
      const plan = session.metadata?.plan ?? 'pro'
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (userId) {
        const { error } = await adminClient
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan,
              status: 'active',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
        if (error) throw error
      } else {
        console.warn('[webhook] checkout.session.completed without user_id — logged for manual review', {
          session_id: session.id,
        })
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data, error } = await adminClient
        .from('subscriptions')
        .update({ plan: 'free', status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('stripe_customer_id', customerId)
        .select('user_id')

      if (error) throw error

      if (!data || data.length === 0) {
        console.warn('[webhook] customer.subscription.deleted — no matching row for stripe_customer_id', {
          customerId,
        })
      }
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('[POST /api/billing/webhook]', err)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
