import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { callAI, parseAIJSON } from '@/core/ai/call'
import {
  buildAnalysisPrompt,
  buildRecommendationPrompt,
  type DecisionAnalysisInput,
  type RecommendationInput,
} from '@/core/ai/prompts'
import { validateAnalysisOutput, validateRecommendationOutput } from '@/core/ai/validate'
import type {
  ContextContent,
  GoalContent,
  ConstraintsContent,
  AlternativesContent,
} from '@/core/decision/Decision.types'
import type { DecisionCategory } from '@/core/decision/Decision.constants'

// ─── Helpers ────────────────────────────────────────────────────────────────

// Append-only component save pattern (mirrors save.ts §5–7).
// Also stores prompt_version for AI-generated components.
async function saveComponent(
  decisionId: string,
  component: string,
  content: unknown,
  promptVersion: string
): Promise<void> {
  await adminClient
    .from('decision_components')
    .update({ is_current: false })
    .eq('decision_id', decisionId)
    .eq('component', component)
    .eq('is_current', true)

  const { data: maxRow } = await adminClient
    .from('decision_components')
    .select('version')
    .eq('decision_id', decisionId)
    .eq('component', component)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextVersion = maxRow ? maxRow.version + 1 : 1

  const { error } = await adminClient
    .from('decision_components')
    .insert({
      decision_id: decisionId,
      component,
      version: nextVersion,
      content,
      is_current: true,
      prompt_version: promptVersion,
    })

  if (error) throw error
}

// Update decision status and insert a state transition row.
async function transitionState(
  decisionId: string,
  fromStatus: string,
  toStatus: string,
  trigger: 'user_action' | 'system_event' | 'ai_completion'
): Promise<void> {
  const now = new Date().toISOString()
  await adminClient
    .from('decisions')
    .update({ status: toStatus, updated_at: now })
    .eq('id', decisionId)

  await adminClient
    .from('decision_state_transitions')
    .insert({ decision_id: decisionId, from_status: fromStatus, to_status: toStatus, trigger })
}

// One regeneration pass per H11 §9.5 — appends errors to the user message,
// system prompt is unchanged.
async function regenerate(
  system: string,
  originalUser: string,
  errors: string[],
  maxTokens: number
): Promise<string> {
  const regenUser = `${originalUser}

REGENERATION REQUIRED:
Your previous response failed validation with the following errors:
${errors.join('\n')}

Regenerate the COMPLETE response correcting ONLY these issues. Do not change any parts of the response that were not flagged.`

  const result = await callAI({ system, user: regenUser, maxTokens })
  return result.text
}

// ─── Handler ─────────────────────────────────────────────────────────────────

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

  // 4. Verify ownership (H13 §3.4 step 1)
  const { data: decision, error: fetchError } = await adminClient
    .from('decisions')
    .select('id, status, category')
    .eq('id', decision_id)
    .eq('owner_id', user.id)
    .single()

  if (fetchError || !decision) {
    return res.status(404).json({ error: 'Decision not found' })
  }

  // 5. Verify state = draft (H13 §3.4 step 2)
  if (decision.status !== 'draft') {
    return res.status(409).json({ error: 'Decision must be in draft state to run analysis' })
  }

  // 6. Verify minimum 2 alternatives (H13 §3.4 step 3)
  const { data: altRow } = await adminClient
    .from('decision_components')
    .select('content')
    .eq('decision_id', decision.id)
    .eq('component', '4_alternatives')
    .eq('is_current', true)
    .maybeSingle()

  const altsContent = altRow?.content as AlternativesContent | undefined
  if (
    !altsContent ||
    !Array.isArray(altsContent.alternatives) ||
    altsContent.alternatives.length < 2
  ) {
    return res.status(400).json({ error: 'At least 2 alternatives are required to run analysis' })
  }

  // Capture id now so inner closures don't reference the possibly-null outer variable
  const decisionId = decision.id

  // ── Step 4 (H13): Transition draft → in_analysis ─────────────────────────
  try {
    await transitionState(decisionId, 'draft', 'in_analysis', 'user_action')
  } catch (err) {
    console.error('[POST /api/decision/analyze] Failed to transition to in_analysis', err)
    return res.status(500).json({ error: 'The analysis did not complete. Your inputs are saved. Please try again.' })
  }

  // Helper: revert to draft on analysis engine failure (H13 §3.4 step 8)
  async function revertToDraft(): Promise<void> {
    try {
      await transitionState(decisionId, 'in_analysis', 'draft', 'system_event')
    } catch (e) {
      console.error('[POST /api/decision/analyze] Failed to revert to draft', e)
    }
  }

  // Helper: partial success — analysis stored but recommendation failed (H13 §3.4 step 12)
  async function partialSuccess(analysisConfidence: unknown) {
    try {
      await transitionState(decisionId, 'in_analysis', 'waiting_for_user', 'ai_completion')
    } catch (e) {
      console.error('[POST /api/decision/analyze] Failed to transition to waiting_for_user (partial)', e)
    }
    return res.status(200).json({
      recommendation: null,
      analysis_confidence: analysisConfidence,
      decision_status: 'waiting_for_user',
      recommendation_available: false,
      recommendation_error:
        'The recommendation could not be generated. Your analysis is saved. You can retry or proceed to review the analysis manually.',
    })
  }

  // ── Step 5 (H13): Load all current components ────────────────────────────
  const { data: componentRows } = await adminClient
    .from('decision_components')
    .select('component, content')
    .eq('decision_id', decisionId)
    .eq('is_current', true)

  const comp: Record<string, unknown> = {}
  for (const row of componentRows ?? []) {
    comp[row.component] = row.content
  }

  // ── Step 6 (H13): Build DecisionAnalysisInput ────────────────────────────
  const context = comp['1_context'] as ContextContent | undefined
  const goal = comp['2_goal'] as GoalContent | undefined
  const constraints = comp['3_constraints'] as ConstraintsContent | undefined

  if (!context || !goal || !constraints) {
    console.error('[POST /api/decision/analyze] Missing required input components', {
      context: !!context,
      goal: !!goal,
      constraints: !!constraints,
    })
    await revertToDraft()
    return res.status(503).json({
      error: 'The analysis did not complete. Your inputs are saved. Please try again.',
    })
  }

  const analysisInput: DecisionAnalysisInput = {
    decision_id: decisionId,
    category: decision.category as DecisionCategory,
    context,
    goal,
    constraints,
    alternatives: altsContent,
  }

  const alternativeIds = altsContent.alternatives.map(a => a.id)
  const analysisPrompt = buildAnalysisPrompt(analysisInput)

  // ── Step 7 (H13): Call Analysis Engine ───────────────────────────────────
  let rawAnalysis: string
  try {
    const result = await callAI({
      system: analysisPrompt.system,
      user:   analysisPrompt.user,
      maxTokens: 2000,
    })
    rawAnalysis = result.text
  } catch (err) {
    console.error('[POST /api/decision/analyze] Analysis Engine failed or timed out', err)
    await revertToDraft()
    return res.status(503).json({
      error: 'The analysis did not complete. Your inputs are saved. Please try again.',
    })
  }

  // ── Step 9 (H13): Validate analysis; one regeneration if invalid ─────────
  let analysisOutput: unknown
  try { analysisOutput = parseAIJSON(rawAnalysis) } catch { analysisOutput = null }

  let analysisValid = validateAnalysisOutput(analysisOutput, alternativeIds)

  if (!analysisValid.valid) {
    try {
      const regenText = await regenerate(
        analysisPrompt.system,
        analysisPrompt.user,
        analysisValid.errors,
        2000
      )
      try { analysisOutput = parseAIJSON(regenText) } catch { analysisOutput = null }
      analysisValid = validateAnalysisOutput(analysisOutput, alternativeIds)
    } catch (err) {
      console.error('[POST /api/decision/analyze] Analysis regeneration failed', err)
      analysisValid = { valid: false, errors: ['Regeneration call failed'] }
    }

    if (!analysisValid.valid) {
      await revertToDraft()
      return res.status(503).json({
        error: 'The analysis did not complete. Your inputs are saved. Please try again.',
      })
    }
  }

  // ── Step 10 (H13): Split output → components 5 and 6 ────────────────────
  const combined = analysisOutput as Record<string, unknown>
  const perAlt = combined.per_alternative as Array<Record<string, unknown>>

  const analysisContent = {
    per_alternative: perAlt.map(a => ({
      alternative_id:       a.alternative_id,
      alternative_name:     a.alternative_name,
      pros:                 a.pros,
      cons:                 a.cons,
      goal_fit_assessment:  a.goal_fit_assessment,
      constraint_compliance: a.constraint_compliance,
    })),
    cross_alternative:             combined.cross_alternative,
    market_data_caveat:            combined.market_data_caveat ?? null,
    professional_advice_disclaimer: combined.professional_advice_disclaimer ?? null,
    analysis_confidence:           combined.analysis_confidence,
    confidence_rationale:          combined.confidence_rationale,
    analysis_version:              analysisPrompt.version,
  }

  const risksContent = {
    per_alternative: perAlt.map(a => ({
      alternative_id:   a.alternative_id,
      alternative_name: a.alternative_name,
      risks:            a.risks,
    })),
  }

  // ── Step 10 (H13): Store 5_ai_analysis and 6_risks ───────────────────────
  try {
    await saveComponent(decisionId, '5_ai_analysis', analysisContent, analysisPrompt.version)
    await saveComponent(decisionId, '6_risks',       risksContent,    analysisPrompt.version)
  } catch (err) {
    console.error('[POST /api/decision/analyze] Failed to store analysis components', err)
    await revertToDraft()
    return res.status(503).json({
      error: 'The analysis did not complete. Your inputs are saved. Please try again.',
    })
  }

  // ── Step 11 (H13): Call Recommendation Engine ────────────────────────────
  const recommendationInput: RecommendationInput = {
    decision_id: decisionId,
    category:    decision.category as DecisionCategory,
    goal,
    constraints,
    alternatives: altsContent,
    analysis:    analysisContent,
  }

  const recommendationPrompt = buildRecommendationPrompt(recommendationInput)

  let rawRecommendation: string
  try {
    const result = await callAI({
      system: recommendationPrompt.system,
      user:   recommendationPrompt.user,
      maxTokens: 800,
    })
    rawRecommendation = result.text
  } catch (err) {
    console.error('[POST /api/decision/analyze] Recommendation Engine failed or timed out', err)
    return partialSuccess(combined.analysis_confidence)
  }

  // ── Steps 12–13 (H13): Validate recommendation; one regeneration if invalid
  let recOutput: unknown
  try { recOutput = parseAIJSON(rawRecommendation) } catch { recOutput = null }

  let recValid = validateRecommendationOutput(recOutput, analysisContent)

  if (!recValid.valid) {
    try {
      const regenText = await regenerate(
        recommendationPrompt.system,
        recommendationPrompt.user,
        recValid.errors,
        800
      )
      try { recOutput = parseAIJSON(regenText) } catch { recOutput = null }
      recValid = validateRecommendationOutput(recOutput, analysisContent)
    } catch (err) {
      console.error('[POST /api/decision/analyze] Recommendation regeneration failed', err)
      recValid = { valid: false, errors: ['Regeneration call failed'] }
    }

    if (!recValid.valid) {
      return partialSuccess(combined.analysis_confidence)
    }
  }

  // ── Step 14 (H13): Store 7_recommendation ────────────────────────────────
  try {
    await saveComponent(decisionId, '7_recommendation', recOutput, recommendationPrompt.version)
  } catch (err) {
    console.error('[POST /api/decision/analyze] Failed to store recommendation', err)
    return partialSuccess(combined.analysis_confidence)
  }

  // ── Step 15 (H13): Transition in_analysis → waiting_for_user ────────────
  try {
    await transitionState(decisionId, 'in_analysis', 'waiting_for_user', 'ai_completion')
  } catch (err) {
    console.error('[POST /api/decision/analyze] Failed to transition to waiting_for_user', err)
    // Recommendation is stored — non-fatal; stuck-in-analysis cron will handle cleanup
  }

  // ── Step 16 (H13): Return recommendation summary ─────────────────────────
  const rec = recOutput as Record<string, unknown>

  return res.status(200).json({
    recommendation: {
      recommended_alternative_id:   rec.recommended_alternative_id   ?? null,
      recommended_alternative_name: rec.recommended_alternative_name ?? null,
      primary_reasoning:            rec.primary_reasoning,
      confidence_level:             rec.confidence_level,
      confidence_rationale:         rec.confidence_rationale,
      conditions_for_change:        rec.conditions_for_change,
      honest_tradeoffs:             rec.honest_tradeoffs,
      tie_detected:                 rec.tie_detected  ?? false,
      tie_explanation:              rec.tie_explanation ?? null,
      information_request:          rec.information_request ?? null,
    },
    analysis_confidence:    combined.analysis_confidence,
    decision_status:        'waiting_for_user',
    recommendation_available: true,
  })
}
