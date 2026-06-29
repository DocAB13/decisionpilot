import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { validateStateTransition } from '@/core/decision/Decision.utils'
import { callAI, parseAIJSON } from '@/core/ai/call'
import { buildActionPlanPrompt, PROMPT_VERSIONS, type ActionPlanInput } from '@/core/ai/prompts'
import type {
  ContextContent,
  ConstraintsContent,
  FinalDecisionContent,
  GoalContent,
} from '@/core/decision/Decision.types'
import type { DecisionCategory } from '@/core/decision/Decision.constants'

// User-initiated target states only — system states (in_analysis, waiting_for_user)
// are not user-requestable per H13 §3.5
const USER_INITIATABLE = new Set(['draft', 'decision_made', 'executing', 'completed', 'archived'])

// Validates Action Plan output per H11 §AAC-03: action_items must be 3–5 items.
function validateActionPlanOutput(output: unknown): boolean {
  if (typeof output !== 'object' || output === null || Array.isArray(output)) return false
  const items = (output as Record<string, unknown>).action_items
  return Array.isArray(items) && items.length >= 3 && items.length <= 5
}

// Append-only save for 9_action_plan (mirrors pattern in save.ts and analyze.ts).
async function saveActionPlan(
  decisionId: string,
  content: unknown
): Promise<void> {
  await adminClient
    .from('decision_components')
    .update({ is_current: false })
    .eq('decision_id', decisionId)
    .eq('component', '9_action_plan')
    .eq('is_current', true)

  const { data: maxRow } = await adminClient
    .from('decision_components')
    .select('version')
    .eq('decision_id', decisionId)
    .eq('component', '9_action_plan')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextVersion = maxRow ? maxRow.version + 1 : 1

  const { error } = await adminClient
    .from('decision_components')
    .insert({
      decision_id: decisionId,
      component: '9_action_plan',
      version: nextVersion,
      content,
      is_current: true,
      prompt_version: PROMPT_VERSIONS.action_plan,
    })

  if (error) throw error
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

  // 4. Ownership verify — also fetch category for Action Plan Engine
  const { data: decision, error: fetchError } = await adminClient
    .from('decisions')
    .select('id, status, category')
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

    // ── State has committed. Action Plan Engine runs post-commit (H13 §3.5 steps 10–11). ──

    let action_plan: unknown = null
    let action_plan_error: string | undefined

    if (to_status === 'decision_made') {
      const decisionId = decision.id
      try {
        // Load components needed for Action Plan Engine
        const { data: compRows } = await adminClient
          .from('decision_components')
          .select('component, content')
          .eq('decision_id', decisionId)
          .in('component', ['8_final_decision', '1_context', '2_goal', '3_constraints'])
          .eq('is_current', true)

        const compMap: Record<string, unknown> = {}
        for (const row of compRows ?? []) {
          compMap[row.component] = row.content
        }

        const chosenAlt = compMap['8_final_decision'] as FinalDecisionContent | undefined
        const context   = compMap['1_context']        as ContextContent        | undefined
        const goal      = compMap['2_goal']            as GoalContent           | undefined
        const constraints = compMap['3_constraints']   as ConstraintsContent    | undefined

        if (!chosenAlt || !context || !goal || !constraints) {
          throw new Error('Missing required components for Action Plan Engine')
        }

        const actionPlanInput: ActionPlanInput = {
          decision_id:        decisionId,
          category:           decision.category as DecisionCategory,
          chosen_alternative: chosenAlt,
          context,
          goal,
          constraints,
        }

        const prompt = buildActionPlanPrompt(actionPlanInput)

        const aiResult = await callAI({
          system:    prompt.system,
          user:      prompt.user,
          maxTokens: 600,
        })

        let parsedPlan: unknown
        try {
          parsedPlan = parseAIJSON(aiResult.text)
        } catch {
          throw new Error('Action Plan Engine returned non-JSON output')
        }

        if (!validateActionPlanOutput(parsedPlan)) {
          throw new Error('Action Plan output failed validation: action_items must contain 3–5 items')
        }

        await saveActionPlan(decisionId, parsedPlan)
        action_plan = parsedPlan
      } catch (err) {
        console.error('[POST /api/decision/state] Action Plan Engine failed', err)
        action_plan_error = 'The action plan could not be generated. The state transition was successful.'
      }
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
