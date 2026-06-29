import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'DELETE') return res.status(405).end() // implemented in IR01-032
  return res.status(405).end()
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  // 1. Auth check — need session OR anonymous_token
  const supabase = createClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()
  const { id: decisionId, anonymous_token, include_history } = req.query

  if (!user && !anonymous_token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // 2. Fetch the decision row
  let decisionQuery = adminClient
    .from('decisions')
    .select('id, owner_id, anonymous_token, category, status, title, created_at, updated_at, expires_at')
    .eq('id', decisionId as string)

  if (user) {
    decisionQuery = decisionQuery.eq('owner_id', user.id)
  } else {
    decisionQuery = decisionQuery.eq('anonymous_token', anonymous_token as string)
  }

  const { data: decision, error: decisionError } = await decisionQuery.single()

  if (decisionError || !decision) {
    return res.status(404).json({ error: 'Decision not found' })
  }

  // 3. Fetch current components (is_current = true)
  const { data: componentRows, error: componentsError } = await adminClient
    .from('decision_components')
    .select('component, version, content, created_at, prompt_version')
    .eq('decision_id', decision.id)
    .eq('is_current', true)

  if (componentsError) {
    console.error('[GET /api/decision/[id]] components', componentsError)
    return res.status(500).json({ error: 'Failed to fetch decision.' })
  }

  // 4. Fetch state transitions ordered by created_at asc
  const { data: transitions, error: transitionsError } = await adminClient
    .from('decision_state_transitions')
    .select('from_status, to_status, trigger, created_at')
    .eq('decision_id', decision.id)
    .order('created_at', { ascending: true })

  if (transitionsError) {
    console.error('[GET /api/decision/[id]] transitions', transitionsError)
    return res.status(500).json({ error: 'Failed to fetch decision.' })
  }

  // 5. Assemble components map
  const components: Record<string, {
    version: number
    content: unknown
    updated_at: string
    prompt_version?: string
    history?: Array<{ version: number; content: unknown; created_at: string; prompt_version?: string }>
  }> = {}

  for (const row of componentRows ?? []) {
    components[row.component] = {
      version: row.version,
      content: row.content,
      updated_at: row.created_at,
      ...(row.prompt_version ? { prompt_version: row.prompt_version } : {}),
    }
  }

  // 6. If include_history=true, fetch all versions per component
  if (include_history === 'true') {
    const { data: historyRows, error: historyError } = await adminClient
      .from('decision_components')
      .select('component, version, content, created_at, prompt_version, is_current')
      .eq('decision_id', decision.id)
      .eq('is_current', false)
      .order('version', { ascending: false })

    if (historyError) {
      console.error('[GET /api/decision/[id]] history', historyError)
      return res.status(500).json({ error: 'Failed to fetch decision.' })
    }

    for (const row of historyRows ?? []) {
      if (components[row.component]) {
        if (!components[row.component].history) {
          components[row.component].history = []
        }
        components[row.component].history!.push({
          version: row.version,
          content: row.content,
          created_at: row.created_at,
          ...(row.prompt_version ? { prompt_version: row.prompt_version } : {}),
        })
      }
    }
  }

  return res.status(200).json({
    decision: {
      id: decision.id,
      category: decision.category,
      status: decision.status,
      title: decision.title,
      created_at: decision.created_at,
      updated_at: decision.updated_at,
      ...(decision.expires_at ? { expires_at: decision.expires_at } : {}),
      components,
      state_transitions: transitions ?? [],
    },
  })
}
