import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { callAI, parseAIJSON } from '@/core/ai/call'
import { buildConflictDetectionPrompt } from '@/core/ai/prompts'
import type { GoalContent, ConstraintsContent, AlternativesContent } from '@/core/decision/Decision.types'

interface ConflictOutput {
  conflict_detected: boolean
  conflict_description: string | null
  conflict_type: 'mathematical' | 'logical' | 'likely' | null
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
  const { decision_id } = req.body ?? {}
  if (!decision_id) {
    return res.status(400).json({ error: 'decision_id is required' })
  }

  // 4. Verify Decision ownership
  const { data: decision, error: fetchError } = await adminClient
    .from('decisions')
    .select('id')
    .eq('id', decision_id)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !decision) {
    return res.status(404).json({ error: 'Decision not found' })
  }

  try {
    // 5. Fetch goal, constraints, and alternatives components from DB
    const { data: componentRows, error: componentsError } = await adminClient
      .from('decision_components')
      .select('component, content')
      .eq('decision_id', decision.id)
      .in('component', ['2_goal', '3_constraints', '4_alternatives'])
      .eq('is_current', true)

    if (componentsError) throw componentsError

    let goal: GoalContent | undefined
    let hardConstraints: ConstraintsContent['hard'] = []
    let alternatives: Array<{ name: string; user_notes: string | null }> = []

    for (const row of componentRows ?? []) {
      if (row.component === '2_goal') {
        goal = row.content as GoalContent
      }
      if (row.component === '3_constraints') {
        const constraints = row.content as ConstraintsContent
        hardConstraints = constraints.hard ?? []
      }
      if (row.component === '4_alternatives') {
        const alts = row.content as AlternativesContent
        alternatives = (alts.alternatives ?? []).map(a => ({
          name: a.name,
          user_notes: a.user_notes,
        }))
      }
    }

    // Without goal or hard constraints, there is nothing to conflict-check
    if (!goal || hardConstraints.length === 0) {
      return res.status(200).json({
        conflict_detected: false,
        conflict_description: null,
        conflict_type: null,
      })
    }

    // 6. Build prompt and call Conflict Detection Engine (max 200 tokens, H11 §4.5)
    const { system, user: userPrompt } = buildConflictDetectionPrompt({
      decision_id: decision.id,
      goal,
      hard_constraints: hardConstraints,
      alternatives: alternatives.length > 0 ? alternatives : undefined,
    })

    const result = await callAI({ system, user: userPrompt, maxTokens: 200 })

    // 7. Parse and return conflict assessment
    const output = parseAIJSON<ConflictOutput>(result.text)

    return res.status(200).json({
      conflict_detected: output.conflict_detected ?? false,
      conflict_description: output.conflict_description ?? null,
      conflict_type: output.conflict_type ?? null,
    })
  } catch (err) {
    console.error('[POST /api/decision/conflict]', err)
    return res.status(503).json({ error: 'The AI could not assess the conflict at this time. Please try again.' })
  }
}
