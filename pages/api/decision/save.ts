import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { CLIENT_WRITABLE_COMPONENTS, SERVER_GENERATED_COMPONENTS } from '@/core/decision/Decision.constants'

const CLIENT_WRITABLE = CLIENT_WRITABLE_COMPONENTS as readonly string[]
const SERVER_GENERATED = SERVER_GENERATED_COMPONENTS as readonly string[]

// 9_action_plan is server-generated, but the owner may toggle `completed`/`completed_at`
// on existing items (IR01-075b, FR-05.7). Every other field — including item order and
// count — must match the current version exactly, or the write is rejected.
function isActionPlanCompletionToggle(previous: unknown, next: unknown): boolean {
  if (typeof previous !== 'object' || previous === null) return false
  if (typeof next !== 'object' || next === null) return false
  const prev = previous as Record<string, unknown>
  const nxt = next as Record<string, unknown>

  if (prev.based_on_alternative_id !== nxt.based_on_alternative_id) return false
  if (prev.based_on_alternative_name !== nxt.based_on_alternative_name) return false

  const prevItems = prev.action_items
  const nextItems = nxt.action_items
  if (!Array.isArray(prevItems) || !Array.isArray(nextItems)) return false
  if (prevItems.length !== nextItems.length) return false

  return prevItems.every((prevItem, i) => {
    const nextItem = nextItems[i]
    if (typeof prevItem !== 'object' || prevItem === null) return false
    if (typeof nextItem !== 'object' || nextItem === null) return false
    const p = prevItem as Record<string, unknown>
    const n = nextItem as Record<string, unknown>

    const unchangedFieldsMatch =
      p.sequence === n.sequence &&
      p.title === n.title &&
      p.detail === n.detail &&
      p.estimated_effort === n.estimated_effort &&
      p.time_estimate === n.time_estimate

    const completedIsValid = typeof n.completed === 'boolean'
    const completedAtIsValid = n.completed_at === null || typeof n.completed_at === 'string'

    return unchangedFieldsMatch && completedIsValid && completedAtIsValid
  })
}

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

  // Server-generated check comes before client-writable — gives the more specific error,
  // except for 9_action_plan's narrow completion-toggle exception (IR01-075b).
  const isActionPlan = component === '9_action_plan'
  if (SERVER_GENERATED.includes(component) && !isActionPlan) {
    return res.status(400).json({
      error: `Component ${component} is server-generated and cannot be written by the client`,
    })
  }
  if (!isActionPlan && !CLIENT_WRITABLE.includes(component)) {
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

  if (isActionPlan) {
    const { data: currentPlan } = await adminClient
      .from('decision_components')
      .select('content')
      .eq('decision_id', decision.id)
      .eq('component', '9_action_plan')
      .eq('is_current', true)
      .maybeSingle()

    if (!currentPlan || !isActionPlanCompletionToggle(currentPlan.content, content)) {
      return res.status(400).json({
        error:
          'Component 9_action_plan is server-generated; only `completed` and `completed_at` on existing items may be changed',
      })
    }
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
