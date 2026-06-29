import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

const CHAT_ALLOWED_STATES = new Set(['draft', 'waiting_for_user', 'decision_made'])

// Phase 4 IR01-051 replaces this stub with the real Chat Engine call
const STUB_RESPONSE = 'This is a placeholder AI response. The AI Chat Engine will be integrated in Phase 4.'

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
  const { decision_id, message } = req.body ?? {}

  if (!decision_id) {
    return res.status(400).json({ error: 'decision_id is required' })
  }
  if (!message) {
    return res.status(400).json({ error: 'message is required' })
  }
  if (typeof message === 'string' && message.length > 1000) {
    return res.status(400).json({ error: 'Message exceeds maximum length of 1000 characters' })
  }

  // 4. Verify Decision ownership
  const { data: decision, error: fetchError } = await adminClient
    .from('decisions')
    .select('id, status')
    .eq('id', decision_id)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !decision) {
    return res.status(404).json({ error: 'Decision not found' })
  }

  // 5. Verify user plan is Pro or Premium
  const { data: subscription } = await adminClient
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan = subscription?.plan ?? 'free'
  if (plan === 'free') {
    return res.status(403).json({ error: 'AI Chat requires a Pro or Premium subscription' })
  }

  // 6. Verify Decision is in an allowed state
  if (!CHAT_ALLOWED_STATES.has(decision.status)) {
    return res.status(409).json({
      error: `Chat is not available for decisions in ${decision.status} state`,
    })
  }

  // 7. Sanitize message (basic trim for stub; full sanitizeForPrompt added in IR01-041)
  const sanitizedMessage = String(message).trim()

  // 8. Stub AI call — returns fixed response; Phase 4 IR01-051 wires the real Chat Engine
  const aiResponse = STUB_RESPONSE

  // 9. Insert user message and AI response atomically via DB function
  try {
    const { error: rpcError } = await adminClient.rpc('insert_chat_exchange', {
      p_decision_id: decision.id,
      p_user_content: sanitizedMessage,
      p_assistant_content: aiResponse,
    })

    if (rpcError) throw rpcError

    return res.status(200).json({
      response: aiResponse,
      material_change_detected: false,
      material_change_summary: null,
      component_to_update: null,
      // insert_chat_exchange returns void; IDs populated when real AI call is wired in IR01-051
      message_id: null,
      response_id: null,
    })
  } catch (err) {
    console.error('[POST /api/decision/chat]', err)
    return res.status(503).json({ error: 'The AI could not respond at this time. Please try again.' })
  }
}
