import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { validateStateTransition } from '@/core/decision/Decision.utils'

// User-initiated target states only — system states (in_analysis, waiting_for_user)
// are not user-requestable per H13 §3.5
const USER_INITIATABLE = new Set(['draft', 'decision_made', 'executing', 'completed', 'archived'])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Method guard
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  // 2. Auth check
  const supabase = createClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // 3. Input validation
  const { decision_id, to_status } = req.body ?? {}

  if (!decision_id) {
    return res.status(400).json({ error: 'decision_id is required' })
  }
  if (!to_status) {
    return res.status(400).json({ error: 'to_status is required' })
  }
  if (!USER_INITIATABLE.has(to_status)) {
    return res.status(400).json({ error: `Invalid to_status: ${to_status}` })
  }

  // 4. Ownership verify
  const { data: decision, error: fetchError } = await adminClient
    .from('decisions')
    .select('id, status')
    .eq('id', decision_id)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !decision) {
    return res.status(404).json({ error: 'Decision not found' })
  }

  // 5. Validate transition
  const from_status = decision.status
  if (!validateStateTransition(from_status, to_status)) {
    return res.status(409).json({
      error: `Invalid state transition: ${from_status} → ${to_status}`,
    })
  }

  // 6. Pre-condition for decision_made: component 8 must exist and be current
  if (to_status === 'decision_made') {
    const { data: comp8, error: comp8Error } = await adminClient
      .from('decision_components')
      .select('id')
      .eq('decision_id', decision.id)
      .eq('component', '8_final_decision')
      .eq('is_current', true)
      .maybeSingle()

    if (comp8Error || !comp8) {
      return res.status(409).json({
        error: 'Final Decision must be recorded before advancing to decision_made',
      })
    }
  }

  try {
    // 7. Update decision status
    const now = new Date().toISOString()

    const { data: updatedDecision, error: updateError } = await adminClient
      .from('decisions')
      .update({ status: to_status, updated_at: now })
      .eq('id', decision.id)
      .select('id, status, updated_at')
      .single()

    if (updateError) throw updateError

    // 8. Insert state transition
    const { data: transition, error: transitionError } = await adminClient
      .from('decision_state_transitions')
      .insert({
        decision_id: decision.id,
        from_status,
        to_status,
        trigger: 'user_action',
      })
      .select('from_status, to_status, trigger, created_at')
      .single()

    if (transitionError) throw transitionError

    // 9. Action Plan Engine stub (Phase 4 wires the real call in IR01-050)
    let action_plan: unknown = null
    let action_plan_error: string | undefined

    if (to_status === 'decision_made') {
      // Stub: real implementation in IR01-050
      action_plan = null
    }

    return res.status(200).json({
      decision: updatedDecision,
      transition,
      action_plan,
      ...(action_plan_error ? { action_plan_error } : {}),
    })
  } catch (err) {
    console.error('[POST /api/decision/state]', err)
    return res.status(500).json({ error: 'Failed to update state. Please try again.' })
  }
}
