import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { callAI } from './call'

// ---------------------------------------------------------------------------
// callAI — unit tests
// AAC-06 (H11 §14) timeout behavior and parseAIJSON are already covered in
// acceptance-criteria.test.ts. This file covers the remaining callAI paths:
// missing API key, request construction, the successful response path
// (including cleanJSON's markdown-fence stripping), and Anthropic error
// response handling.
// ---------------------------------------------------------------------------

function mockFetchResolvedWith(body: unknown) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => body,
  } as Response)
}

describe('callAI — missing API key', () => {
  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })

  it('throws without calling fetch when ANTHROPIC_API_KEY is not configured', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await expect(callAI({ system: 's', user: 'u', maxTokens: 100 })).rejects.toThrow(
      'ANTHROPIC_API_KEY not configured'
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('callAI — request construction', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key-request'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.ANTHROPIC_API_KEY
  })

  it('POSTs to the Anthropic messages endpoint with the correct headers and body', async () => {
    const fetchSpy = mockFetchResolvedWith({
      content: [{ text: '{"ok":true}' }],
      usage: { input_tokens: 10, output_tokens: 5 },
    })

    await callAI({ system: 'system prompt', user: 'user prompt', maxTokens: 500 })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      'x-api-key': 'test-key-request',
      'anthropic-version': '2023-06-01',
    })

    const body = JSON.parse(init?.body as string)
    expect(body).toEqual({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: 'system prompt',
      messages: [{ role: 'user', content: 'user prompt' }],
    })
  })
})

describe('callAI — successful response', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key-success'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.ANTHROPIC_API_KEY
  })

  it('returns the text and token usage from a well-formed response', async () => {
    mockFetchResolvedWith({
      content: [{ text: '{"result":"value"}' }],
      usage: { input_tokens: 42, output_tokens: 17 },
    })

    const result = await callAI({ system: 's', user: 'u', maxTokens: 100 })

    expect(result).toEqual({
      text: '{"result":"value"}',
      inputTokens: 42,
      outputTokens: 17,
    })
  })

  it('concatenates multiple content blocks into a single text string', async () => {
    mockFetchResolvedWith({
      content: [{ text: 'part one ' }, { text: 'part two' }],
      usage: { input_tokens: 1, output_tokens: 1 },
    })

    const result = await callAI({ system: 's', user: 'u', maxTokens: 100 })
    expect(result.text).toBe('part one part two')
  })

  it('treats a content block with no text field as an empty string', async () => {
    mockFetchResolvedWith({
      content: [{}, { text: 'only this' }],
      usage: { input_tokens: 1, output_tokens: 1 },
    })

    const result = await callAI({ system: 's', user: 'u', maxTokens: 100 })
    expect(result.text).toBe('only this')
  })

  it('defaults token usage to 0 when usage is missing from the response', async () => {
    mockFetchResolvedWith({ content: [{ text: '{}' }] })

    const result = await callAI({ system: 's', user: 'u', maxTokens: 100 })
    expect(result.inputTokens).toBe(0)
    expect(result.outputTokens).toBe(0)
  })

  it('strips a ```json fenced code block via cleanJSON', async () => {
    mockFetchResolvedWith({
      content: [{ text: '```json\n{"a":1}\n```' }],
      usage: { input_tokens: 1, output_tokens: 1 },
    })

    const result = await callAI({ system: 's', user: 'u', maxTokens: 100 })
    expect(result.text).toBe('{"a":1}')
  })

  it('strips a plain ``` fenced code block via cleanJSON', async () => {
    mockFetchResolvedWith({
      content: [{ text: '```\n{"a":1}\n```' }],
      usage: { input_tokens: 1, output_tokens: 1 },
    })

    const result = await callAI({ system: 's', user: 'u', maxTokens: 100 })
    expect(result.text).toBe('{"a":1}')
  })
})

describe('callAI — Anthropic error responses', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key-error'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.ANTHROPIC_API_KEY
  })

  it('throws the error message when the response has type "error"', async () => {
    mockFetchResolvedWith({ type: 'error', error: { message: 'overloaded_error: try again later' } })

    await expect(callAI({ system: 's', user: 'u', maxTokens: 100 })).rejects.toThrow(
      'overloaded_error: try again later'
    )
  })

  it('throws the error message when an error field is present without type "error"', async () => {
    mockFetchResolvedWith({ error: { message: 'invalid_request_error: bad param' } })

    await expect(callAI({ system: 's', user: 'u', maxTokens: 100 })).rejects.toThrow(
      'invalid_request_error: bad param'
    )
  })

  it('falls back to a generic message when the error has no message field', async () => {
    mockFetchResolvedWith({ error: {} })

    await expect(callAI({ system: 's', user: 'u', maxTokens: 100 })).rejects.toThrow(
      'Anthropic API error'
    )
  })
})
