import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { callAI, parseAIJSON } from '@/core/ai/call'
import { buildSuggestionPrompt } from '@/core/ai/prompts'
import type { GoalContent } from '@/core/decision/Decision.types'

interface SuggestionItem {
  name: string
  one_line_rationale: string
}

interface SuggestionOutput {
  suggestions: SuggestionItem[]
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
  const { decision_id, alternatives } = req.body ?? {}
  if (!decision_id) {
    return res.status(400).json({ error: 'decision_id is required' })
  }
  if (!Array.isArray(alternatives)) {
    return res.status(400).json({ error: 'alternatives must be an array' })
  }

  // 4. Verify Decision ownership
  const { data: decision, error: fetchError } = await adminClient
    .from('decisions')
    .select('id, category')
    .eq('id', decision_id)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !decision) {
    return res.status(404).json({ error: 'Decision not found' })
  }

  try {
    // 5. Fetch goal (2_goal) and context (1_context) from DB if already saved
    const { data: componentRows } = await adminClient
      .from('decision_components')
      .select('component, content')
      .eq('decision_id', decision.id)
      .in('component', ['1_context', '2_goal'])
      .eq('is_current', true)

    let goal: GoalContent | undefined
    let contextSummary: string | undefined

    for (const row of componentRows ?? []) {
      if (row.component === '2_goal') {
        goal = row.content as GoalContent
      }
      if (row.component === '1_context') {
        const ctx = row.content as { background?: string }
        if (typeof ctx.background === 'string') {
          contextSummary = ctx.background.slice(0, 200)
        }
      }
    }

    // 6. Build SuggestionInput — only include alternatives with valid names (H11 §10.2)
    const existingAlternatives = (alternatives as unknown[])
      .filter((a): a is { name: string } =>
        typeof a === 'object' && a !== null && typeof (a as { name?: unknown }).name === 'string'
      )
      .map(a => ({ name: a.name }))

    const { system, user: userPrompt } = buildSuggestionPrompt({
      decision_id: decision.id,
      category: decision.category,
      goal,
      context_summary: contextSummary,
      existing_alternatives: existingAlternatives,
    })

    // 7. Call AI — max 300 tokens per H11 §4.5; 29-second timeout via callAI
    const result = await callAI({ system, user: userPrompt, maxTokens: 300 })

    // 8. Parse and validate response
    const output = parseAIJSON<SuggestionOutput>(result.text)
    const suggestions = Array.isArray(output.suggestions)
      ? output.suggestions.slice(0, 3)
      : []

    return res.status(200).json({ suggestions })
  } catch (err) {
    console.error('[POST /api/decision/suggest]', err)
    return res.status(503).json({ error: 'The AI could not generate suggestions at this time. Please try again.' })
  }
}
