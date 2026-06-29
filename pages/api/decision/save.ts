import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { CLIENT_WRITABLE_COMPONENTS, SERVER_GENERATED_COMPONENTS } from '@/core/decision/Decision.constants'

const CLIENT_WRITABLE = CLIENT_WRITABLE_COMPONENTS as readonly string[]
const SERVER_GENERATED = SERVER_GENERATED_COMPONENTS as readonly string[]

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
  const { decision_id, component, content } = req.body ?? {}

  if (!decision_id) {
    return res.status(400).json({ error: 'decision_id is required' })
  }
  if (!component) {
    return res.status(400).json({ error: 'component is required' })
  }
  if (content === undefined || content === null) {
    return res.status(400).json({ error: 'content is required' })
  }

  // Server-generated check comes before client-writable — gives the more specific error
  if (SERVER_GENERATED.includes(component)) {
    return res.status(400).json({
      error: `Component ${component} is server-generated and cannot be written by the client`,
    })
  }
  if (!CLIENT_WRITABLE.includes(component)) {
    return res.status(400).json({ error: `Invalid component: ${component}` })
  }

  // Basic content schema validation — must be a non-null object
  if (typeof content !== 'object' || Array.isArray(content)) {
    return res.status(400).json({
      error: `Invalid content for component ${component}: content must be a non-null object`,
    })
  }

  // 4. Ownership verify
  const { data: decision, error: decisionError } = await adminClient
    .from('decisions')
    .select('id')
    .eq('id', decision_id)
    .eq('owner_id', user.id)
    .single()

  if (decisionError || !decision) {
    return res.status(404).json({ error: 'Decision not found' })
  }

  try {
    // 5. Mark existing current version as not current
    await adminClient
      .from('decision_components')
      .update({ is_current: false })
      .eq('decision_id', decision.id)
      .eq('component', component)
      .eq('is_current', true)

    // 6. Compute next version number
    const { data: maxRow } = await adminClient
      .from('decision_components')
      .select('version')
      .eq('decision_id', decision.id)
      .eq('component', component)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextVersion = maxRow ? maxRow.version + 1 : 1

    // 7. Insert new current version
    const { data: newComponent, error: insertError } = await adminClient
      .from('decision_components')
      .insert({
        decision_id: decision.id,
        component,
        version: nextVersion,
        content,
        is_current: true,
      })
      .select('decision_id, component, version, is_current, created_at')
      .single()

    if (insertError) throw insertError

    // 8. Update parent decision's updated_at
    const { error: updateError } = await adminClient
      .from('decisions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', decision.id)

    if (updateError) throw updateError

    return res.status(200).json({ component: newComponent })
  } catch (err) {
    console.error('[POST /api/decision/save]', err)
    return res.status(500).json({ error: 'Failed to save component. Please try again.' })
  }
}
