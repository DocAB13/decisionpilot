export interface AICallParams {
  system: string
  user: string
  maxTokens: number
}

export interface AICallResult {
  text: string
  inputTokens: number
  outputTokens: number
}

function cleanJSON(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

export async function callAI(params: AICallParams): Promise<AICallResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI_TIMEOUT')), 29000)
  )

  const fetchCall = fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: params.maxTokens,
      system: params.system,
      messages: [{ role: 'user', content: params.user }],
    }),
  }).then(async res => {
    const data = await res.json()
    if (data.type === 'error' || data.error) {
      throw new Error(data.error?.message ?? 'Anthropic API error')
    }
    const text = (data.content as Array<{ text?: string }>)
      .map(b => b.text ?? '').join('')
    return {
      text: cleanJSON(text),
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
    }
  })

  return Promise.race([fetchCall, timeout])
}

export function parseAIJSON<T>(raw: string): T {
  if (!raw.startsWith('{') && !raw.startsWith('[')) {
    throw new Error('AI_RESPONSE_NOT_JSON')
  }
  return JSON.parse(raw) as T
}
