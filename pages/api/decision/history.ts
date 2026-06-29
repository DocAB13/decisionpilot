import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

const VALID_STATUSES = new Set([
  'draft', 'in_analysis', 'waiting_for_user', 'decision_made',
  'executing', 'completed', 'archived',
])

function isValidIso8601(value: string): boolean {
  const date = new Date(value)
  return !isNaN(date.getTime())
}

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

  // 3. Parse and validate query params
  const {
    status: rawStatus,
    category,
    created_from,
    created_to,
    page: rawPage,
    limit: rawLimit,
    order: rawOrder,
  } = req.query

  const statusValues = rawStatus
    ? (Array.isArray(rawStatus) ? rawStatus : [rawStatus])
    : []

  for (const s of statusValues) {
    if (!VALID_STATUSES.has(s)) {
      return res.status(400).json({ error: `Invalid status: ${s}` })
    }
  }

  const limitParam = rawLimit ? parseInt(String(rawLimit), 10) : 20
  if (rawLimit && (limitParam < 1 || limitParam > 50)) {
    return res.status(400).json({ error: 'limit must be between 1 and 50' })
  }

  if (created_from && !isValidIso8601(String(created_from))) {
    return res.status(400).json({ error: 'Invalid created_from format' })
  }
  if (created_to && !isValidIso8601(String(created_to))) {
    return res.status(400).json({ error: 'Invalid created_to format' })
  }

  const page = rawPage ? Math.max(1, parseInt(String(rawPage), 10) || 1) : 1
  const order = rawOrder ? String(rawOrder) : 'updated_desc'

  // 4. Resolve user plan
  const { data: subscription } = await adminClient
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const plan = subscription?.plan ?? 'free'
  const isFree = plan === 'free'

  try {
    type DecisionRow = {
      id: string
      category: string
      status: string
      title: string | null
      created_at: string
      updated_at: string
    }

    let decisions: DecisionRow[] = []
    let total = 0
    let effectiveLimit = limitParam
    let effectivePage = page
    let plan_limit = false

    if (isFree) {
      // Free tier: get total count to determine plan_limit, then fetch 10 most recent
      const { count: totalCount, error: countError } = await adminClient
        .from('decisions')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)

      if (countError) throw countError

      const actualTotal = totalCount ?? 0
      plan_limit = actualTotal > 10
      effectiveLimit = 10
      effectivePage = 1

      const { data, error } = await adminClient
        .from('decisions')
        .select('id, category, status, title, created_at, updated_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      decisions = data ?? []
      total = decisions.length
    } else {
      // Pro/Premium: apply all filters and paginate
      effectiveLimit = Math.min(limitParam, 50)
      effectivePage = page

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let countQuery: any = adminClient
        .from('decisions')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dataQuery: any = adminClient
        .from('decisions')
        .select('id, category, status, title, created_at, updated_at')
        .eq('owner_id', user.id)

      if (statusValues.length > 0) {
        countQuery = countQuery.in('status', statusValues)
        dataQuery = dataQuery.in('status', statusValues)
      }
      if (category) {
        const cat = String(category)
        countQuery = countQuery.eq('category', cat)
        dataQuery = dataQuery.eq('category', cat)
      }
      if (created_from) {
        const cf = String(created_from)
        countQuery = countQuery.gte('created_at', cf)
        dataQuery = dataQuery.gte('created_at', cf)
      }
      if (created_to) {
        const ct = String(created_to)
        countQuery = countQuery.lte('created_at', ct)
        dataQuery = dataQuery.lte('created_at', ct)
      }

      switch (order) {
        case 'created_asc':
          dataQuery = dataQuery.order('created_at', { ascending: true })
          break
        case 'created_desc':
          dataQuery = dataQuery.order('created_at', { ascending: false })
          break
        default:
          dataQuery = dataQuery.order('updated_at', { ascending: false })
          break
      }

      const from = (effectivePage - 1) * effectiveLimit
      dataQuery = dataQuery.range(from, from + effectiveLimit - 1)

      const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

      if (countResult.error) throw countResult.error
      if (dataResult.error) throw dataResult.error

      total = countResult.count ?? 0
      decisions = dataResult.data ?? []
      plan_limit = false
    }

    // 5. Fetch summary components for all decisions in a single query
    const decisionIds = decisions.map((d) => d.id)
    const summaryMap: Record<string, {
      alternatives_count: number | null
      has_recommendation: boolean
      outcome_satisfaction: number | null
    }> = {}

    for (const id of decisionIds) {
      summaryMap[id] = { alternatives_count: null, has_recommendation: false, outcome_satisfaction: null }
    }

    if (decisionIds.length > 0) {
      const { data: components, error: compError } = await adminClient
        .from('decision_components')
        .select('decision_id, component, content')
        .in('decision_id', decisionIds)
        .in('component', ['4_alternatives', '7_recommendation', '10_outcome'])
        .eq('is_current', true)

      if (compError) throw compError

      for (const comp of components ?? []) {
        const summary = summaryMap[comp.decision_id]
        if (!summary) continue

        if (comp.component === '4_alternatives') {
          const alts = comp.content?.alternatives
          summary.alternatives_count = Array.isArray(alts) ? alts.length : null
        } else if (comp.component === '7_recommendation') {
          summary.has_recommendation = true
        } else if (comp.component === '10_outcome') {
          summary.outcome_satisfaction = comp.content?.satisfaction_rating ?? null
        }
      }
    }

    // 6. Assemble response
    const has_more = isFree
      ? false
      : (effectivePage - 1) * effectiveLimit + decisions.length < total

    return res.status(200).json({
      decisions: decisions.map((d) => ({
        id: d.id,
        category: d.category,
        status: d.status,
        title: d.title,
        created_at: d.created_at,
        updated_at: d.updated_at,
        summary: summaryMap[d.id] ?? {
          alternatives_count: null,
          has_recommendation: false,
          outcome_satisfaction: null,
        },
      })),
      total,
      page: effectivePage,
      limit: effectiveLimit,
      has_more,
      plan_limit,
    })
  } catch (err) {
    console.error('[GET /api/decision/history]', err)
    return res.status(500).json({ error: 'Failed to fetch decision history. Please try again.' })
  }
}
