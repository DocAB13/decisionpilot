import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Method guard
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  // 2. Auth check
  const supabase = createClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  // 3. Parse path and query params
  const { id, limit: rawLimit, before: rawBefore } = req.query
  const decisionId = Array.isArray(id) ? id[0] : id

  const limit = rawLimit
    ? Math.min(Math.max(1, parseInt(String(rawLimit), 10) || 100), 500)
    : 100
  const before = rawBefore ? String(rawBefore) : null

  // 4. Verify Decision ownership
  const { data: decision, error: fetchError } = await adminClient
    .from('decisions')
    .select('id')
    .eq('id', decisionId)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !decision) {
    return res.status(404).json({ error: 'Decision not found' })
  }

  try {
    // 5. Resolve `before` cursor to a created_at timestamp for the WHERE clause
    let beforeCreatedAt: string | null = null
    if (before) {
      const { data: cursorMsg } = await adminClient
        .from('decision_chat_messages')
        .select('created_at')
        .eq('id', before)
        .eq('decision_id', decision.id)
        .maybeSingle()

      beforeCreatedAt = cursorMsg?.created_at ?? null
    }

    // 6. Count total messages for this decision (for the total field)
    const { count: totalCount, error: countError } = await adminClient
      .from('decision_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('decision_id', decision.id)

    if (countError) throw countError

    // 7. Fetch messages ordered chronologically; fetch limit+1 to detect has_more
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = adminClient
      .from('decision_chat_messages')
      .select('id, role, content, created_at')
      .eq('decision_id', decision.id)
      .order('created_at', { ascending: true })
      .limit(limit + 1)

    if (beforeCreatedAt) {
      query = query.lt('created_at', beforeCreatedAt)
    }

    const { data: rows, error: rowsError } = await query
    if (rowsError) throw rowsError

    const allRows = rows ?? []
    const hasMore = allRows.length > limit
    const messages = allRows.slice(0, limit)

    return res.status(200).json({
      messages,
      total: totalCount ?? 0,
      has_more: hasMore,
    })
  } catch (err) {
    console.error('[GET /api/decision/chat/[id]]', err)
    return res.status(500).json({ error: 'Failed to fetch chat history. Please try again.' })
  }
}
