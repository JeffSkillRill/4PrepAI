// Perplexity Agent API request and response handling for the counselor.
//
// Sonar Chat Completions (/chat/completions) ended on 27 September 2026; only
// synchronous calls still work, through a gradual server-side reformulation.
// This module talks to the canonical Agent API endpoint directly.
//
// A model is named explicitly instead of a preset: with a preset, web search
// cannot be switched off, and verified-record answers must never search the web.
// With an explicit model, no tool runs unless the request lists it.

export const AGENT_API_URL = 'https://api.perplexity.ai/v1/agent'
// The model behind the `fast` preset (Sonar's suggested replacement), pinned.
export const DEFAULT_AGENT_MODEL = 'openai/gpt-6-luna'
const MAX_OUTPUT_TOKENS = 2048

export type AnswerType = 'verified_fact' | 'general_guidance' | 'refusal'

export type ParsedProviderPayload = {
  answerType: AnswerType
  answer: string
  recordCitations: string[]
}

export const ANSWER_SCHEMA = {
  type: 'object',
  required: ['answerType', 'answer', 'recordCitations'],
  properties: {
    answerType: { type: 'string', enum: ['verified_fact', 'general_guidance', 'refusal'] },
    answer: { type: 'string' },
    recordCitations: { type: 'array', items: { type: 'string' } },
  },
} as const

/**
 * Agent API model ids are provider-prefixed ("openai/…"). A legacy Sonar name
 * such as "sonar" left in the PPLX_MODEL secret would be rejected, so it falls
 * back to the default instead of breaking every live answer.
 */
export function resolveAgentModel(configured: string | undefined): string {
  const model = configured?.trim()
  return model && model.includes('/') ? model : DEFAULT_AGENT_MODEL
}

export function buildAgentRequest({
  model,
  system,
  message,
  searchWeb,
}: {
  model: string
  system: string
  message: string
  searchWeb: boolean
}) {
  return {
    model,
    instructions: system,
    input: [{ type: 'message', role: 'user', content: message }],
    temperature: 0,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    ...(searchWeb ? { tools: [{ type: 'web_search' }] } : {}),
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'counselor_answer', schema: ANSWER_SCHEMA },
    },
  }
}

type AgentOutputItem = {
  type?: unknown
  content?: unknown
  results?: unknown
}

function answerText(payload: { output_text?: unknown; output?: unknown }): string | null {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) return payload.output_text
  if (!Array.isArray(payload.output)) return null
  const parts: string[] = []
  for (const item of payload.output as AgentOutputItem[]) {
    if (item?.type !== 'message' || !Array.isArray(item.content)) continue
    for (const part of item.content as Array<{ type?: unknown; text?: unknown }>) {
      if (part?.type === 'output_text' && typeof part.text === 'string') parts.push(part.text)
    }
  }
  return parts.length ? parts.join('') : null
}

function searchResultUrls(output: unknown): string[] {
  if (!Array.isArray(output)) return []
  const urls: string[] = []
  for (const item of output as AgentOutputItem[]) {
    if (item?.type !== 'search_results' || !Array.isArray(item.results)) continue
    for (const result of item.results as Array<{ url?: unknown }>) {
      if (typeof result?.url === 'string' && !urls.includes(result.url)) urls.push(result.url)
    }
  }
  return urls
}

export function parseAgentPayload(value: unknown): {
  parsed: ParsedProviderPayload
  webCitations: string[]
} {
  if (!value || typeof value !== 'object') throw new Error('Counselor provider returned malformed JSON.')
  const payload = value as { status?: unknown; output_text?: unknown; output?: unknown }
  if (payload.status !== undefined && payload.status !== 'completed') {
    throw new Error(`Counselor provider run ended with status ${String(payload.status)}.`)
  }
  const content = answerText(payload)
  if (content === null) throw new Error('Counselor provider response is missing content.')
  const parsed = JSON.parse(content) as Partial<ParsedProviderPayload>
  if (!['verified_fact', 'general_guidance', 'refusal'].includes(parsed.answerType ?? '')) {
    throw new Error('Counselor provider returned an invalid answer type.')
  }
  if (typeof parsed.answer !== 'string' || !parsed.answer.trim()) {
    throw new Error('Counselor provider returned an empty answer.')
  }
  if (!Array.isArray(parsed.recordCitations) || !parsed.recordCitations.every((item) => typeof item === 'string')) {
    throw new Error('Counselor provider returned malformed record citations.')
  }
  return {
    parsed: parsed as ParsedProviderPayload,
    webCitations: searchResultUrls(payload.output),
  }
}
