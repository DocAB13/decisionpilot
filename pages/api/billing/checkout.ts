import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

const PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Method guard
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  // 2. Validate plan
  const { plan, return_path } = req.body ?? {}

  if (!plan) {
    return res.status(400).json({ error: 'plan is required' })
  }
  if (plan !== 'pro' && plan !== 'premium') {
    return res.status(400).json({ error: `Invalid plan: ${plan}. Must be 'pro' or 'premium'` })
  }

  // 3. Resolve user_id from session cookie (auth is optional for this endpoint)
  const supabase = createClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  // 4. Select Price ID from env vars
  const priceId = PRICE_IDS[plan]

  // 5. Build URLs
  const origin = req.headers.origin || `https://${req.headers.host}`
  const returnPath = return_path || '/dashboard'

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&return=${returnPath}`,
      cancel_url: `${origin}${returnPath}`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        user_id: userId ?? '',
        plan,
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    if (err instanceof Stripe.errors.StripeConnectionError) {
      return res.status(503).json({ error: 'Payment service unavailable. Please try again.' })
    }
    console.error('[POST /api/billing/checkout]', err)
    return res.status(500).json({ error: 'Failed to create checkout session. Please try again.' })
  }
}
