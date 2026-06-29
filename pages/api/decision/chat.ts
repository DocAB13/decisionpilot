import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { sanitizeForPrompt } from '@/core/ai/sanitize'
import { buildChatSystemPrompt } from '@/core/ai/prompts'
import type { DecisionObject } from '@/core/decision/Decision.types'
import type { ComponentName } from '@/core/decision/Decision.constants'

const CHAT_ALLOWED_STATES = new Set(['draft', 'waiting_for_user', 'decision_made'])

// Chat Engine structured output format (H11 §4.3 OUTPUT FORMAT)
const CHAT_OUTPUT_FORMAT = `OUTPUT FORMAT:
Respond with valid JSON only. The first character of your response must be '{'. Do not include any text before or after the JSON object.

Required schema:
{
  "visible_response": "<your response to the user — this is the text shown directly in the chat UI>",
  "material_change_detected": false,
  "material_change_summary": null,
  "component_to_update": null
}

When the user provides material new information not already captured in the Decision Object (a new constraint, a changed goal, new alternative details):
{
  "visible_response": "<acknowledge the new information and ask if they want to formally update the relevant component>",
  "material_change_detected": true,
  "material_change_summary": "<concise description of what changed and how it affects the analysis>",
  "component_to_update": "1_context | 2_goal | 3_constraints | 4_alternatives"
}`

interface ChatEngineResponse {
  visible_response: string
  material_change_detected: boolean
  material_change_summary: string | null
  component_to_update: string | null
}

function cleanJSON(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
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
    .select('id, owner_id, anonymous_token, category, status, title, created_at, updated_at, expires_at')
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

  // 7. Sanitize message (H11 §10.2)
  const sanitizedMessage = sanitizeForPrompt(String(message))

  try {
    // 8. Fetch current Decision Object components for system prompt reconstruction (H11 §6.4)
    const { data: componentRows, error: componentsError } = await adminClient
      .from('decision_components')
      .select('component, version, content, created_at, prompt_version')
      .eq('decision_id', decision.id)
      .eq('is_current', true)

    if (componentsError) throw componentsError

    const components: DecisionObject['components'] = {}
    for (const row of componentRows ?? []) {
      components[row.component as ComponentName] = {
        version: row.version,
        content: row.content,
        updated_at: row.created_at,
        ...(row.prompt_version ? { prompt_version: row.prompt_version } : {}),
      }
    }

    const decisionObject: DecisionObject = {
      id: decision.id,
      owner_id: decision.owner_id,
      anonymous_token: decision.anonymous_token,
      category: decision.category,
      status: decision.status,
      title: decision.title,
      created_at: decision.created_at,
      updated_at: decision.updated_at,
      expires_at: decision.expires_at,
      components,
      state_transitions: [],
    }

    // 9. Fetch last 20 chat messages in reverse-chronological order, then reverse for history (H11 §6.3)
    const { data: chatHistory, error: historyError } = await adminClient
      .from('decision_chat_messages')
      .select('role, content')
      .eq('decision_id', decision.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (historyError) throw historyError

    const historyMessages = (chatHistory ?? [])
      .reverse()
      .map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content as string }))

    // 10. Build system prompt: Decision Object context + output format instructions (H11 §6.4, §4.3)
    const systemPrompt = buildChatSystemPrompt(decisionObject) + '\n\n' + CHAT_OUTPUT_FORMAT

    // Build messages array: history + current sanitized message
    const messages = [
      ...historyMessages,
      { role: 'user' as const, content: sanitizedMessage },
    ]

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    // 11. Call Chat Engine with 29-second timeout, max 400 tokens (H11 §4.5, H13 §3.6 step 8)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 29000)
    )

    const fetchPromise = fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: systemPrompt,
        messages,
      }),
    }).then(async apiRes => {
      const data = await apiRes.json()
      if (data.type === 'error' || data.error) {
        throw new Error(data.error?.message ?? 'Anthropic API error')
      }
      const rawText = (data.content as Array<{ text?: string }>)
        .map(b => b.text ?? '').join('')
      return cleanJSON(rawText)
    })

    let rawAIText: string
    try {
      rawAIText = await Promise.race([fetchPromise, timeoutPromise])
    } catch (aiErr) {
      // AI call failed or timed out — store nothing (H13 §3.6 step 9)
      console.error('[POST /api/decision/chat] AI call failed:', aiErr)
      return res.status(503).json({ error: 'The AI could not respond at this time. Please try again.' })
    }

    // 12. Parse and validate structured Chat response (H11 §7.4 FR-07.4)
    let chatEngineResponse: ChatEngineResponse
    try {
      if (!rawAIText.startsWith('{')) throw new Error('AI_RESPONSE_NOT_JSON')
      chatEngineResponse = JSON.parse(rawAIText) as ChatEngineResponse
      if (typeof chatEngineResponse.visible_response !== 'string' || !chatEngineResponse.visible_response) {
        throw new Error('AI_RESPONSE_MISSING_FIELD')
      }
    } catch (parseErr) {
      console.error('[POST /api/decision/chat] Parse failed:', parseErr, rawAIText?.slice(0, 200))
      return res.status(503).json({ error: 'The AI could not respond at this time. Please try again.' })
    }

    // 13. Insert user message and AI response atomically via DB function (H13 §3.6 step 10–13)
    const { error: rpcError } = await adminClient.rpc('insert_chat_exchange', {
      p_decision_id: decision.id,
      p_user_content: sanitizedMessage,
      p_assistant_content: chatEngineResponse.visible_response,
    })

    if (rpcError) throw rpcError

    // 14. Fetch IDs of the two messages just inserted (newest pair for this decision)
    const { data: recentMessages } = await adminClient
      .from('decision_chat_messages')
      .select('id, role')
      .eq('decision_id', decision.id)
      .order('created_at', { ascending: false })
      .limit(2)

    const assistantMsg = recentMessages?.find(m => m.role === 'assistant')
    const userMsg = recentMessages?.find(m => m.role === 'user')

    return res.status(200).json({
      response: chatEngineResponse.visible_response,
      material_change_detected: chatEngineResponse.material_change_detected ?? false,
      material_change_summary: chatEngineResponse.material_change_summary ?? null,
      component_to_update: chatEngineResponse.component_to_update ?? null,
      message_id: userMsg?.id ?? null,
      response_id: assistantMsg?.id ?? null,
    })
  } catch (err) {
    console.error('[POST /api/decision/chat]', err)
    return res.status(503).json({ error: 'The AI could not respond at this time. Please try again.' })
  }
}
