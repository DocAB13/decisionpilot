import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { DecisionCategory } from '@/core/decision/Decision.constants'

const VALID_CATEGORIES = Object.values(DecisionCategory)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Method guard
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  // 2. Auth check (optional for this endpoint)
  const supabase = createClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Input validation
  const { category } = req.body ?? {}

  if (!category) {
    return res.status(400).json({ error: 'category is required' })
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category: ${category}` })
  }

  try {
    if (user) {
      // 4. Authenticated: enforce < 100 non-archived decisions (FR-09.7)
      const { count, error: countError } = await adminClient
        .from('decisions')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .neq('status', 'archived')

      if (countError) throw countError

      if ((count ?? 0) >= 100) {
        return res.status(409).json({
          error: 'You have reached the maximum of 100 active decisions. Archive some decisions to create new ones.',
        })
      }

      // 5. Insert authenticated decision
      const { data: decision, error: insertError } = await adminClient
        .from('decisions')
        .insert({ owner_id: user.id, category, status: 'draft' })
        .select('id, category, status, title, created_at, updated_at')
        .single()

      if (insertError) throw insertError

      // 6. Insert initial state transition
      const { error: transitionError } = await adminClient
        .from('decision_state_transitions')
        .insert({
          decision_id: decision.id,
          from_status: null,
          to_status: 'draft',
          trigger: 'user_action',
        })

      if (transitionError) throw transitionError

      return res.status(201).json({ decision })
    } else {
      // 7. Anonymous: generate token and insert with 48h expiry
      const anonymous_token = crypto.randomUUID()

      const { data: decision, error: insertError } = await adminClient
        .from('decisions')
        .insert({
          anonymous_token,
          category,
          status: 'draft',
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        })
        .select('id, category, status, title, created_at, updated_at, expires_at')
        .single()

      if (insertError) throw insertError

      // 8. Insert initial state transition
      const { error: transitionError } = await adminClient
        .from('decision_state_transitions')
        .insert({
          decision_id: decision.id,
          from_status: null,
          to_status: 'draft',
          trigger: 'user_action',
        })

      if (transitionError) throw transitionError

      return res.status(201).json({ decision, anonymous_token })
    }
  } catch (err) {
    console.error('[POST /api/decision/create]', err)
    return res.status(500).json({ error: 'Failed to create decision. Please try again.' })
  }
}
