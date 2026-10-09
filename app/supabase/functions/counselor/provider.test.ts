import { describe, expect, it } from 'vitest'
import {
  DEFAULT_AGENT_MODEL,
  buildAgentRequest,
  parseAgentPayload,
  resolveAgentModel,
} from './provider'

const answer = { answerType: 'general_guidance', answer: 'Start the essay early.', recordCitations: [] }

function agentResponse(text: string, extra: Record<string, unknown> = {}) {
  return {
    status: 'completed',
    output: [
      {
        type: 'search_results',
        results: [
          { id: 1, url: 'https://travel.state.gov/f1' },
          { id: 2, url: 'https://studyinthestates.dhs.gov' },
          { id: 3, url: 'https://travel.state.gov/f1' },
        ],
      },
      { type: 'message', role: 'assistant', content: [{ type: 'output_text', text }] },
    ],
    ...extra,
  }
}

describe('resolveAgentModel', () => {
  it('keeps a provider-prefixed Agent API model', () => {
    expect(resolveAgentModel('anthropic/claude-sonnet-4-6')).toBe('anthropic/claude-sonnet-4-6')
  })

  it('replaces a legacy Sonar name or an empty secret with the default', () => {
    expect(resolveAgentModel('sonar')).toBe(DEFAULT_AGENT_MODEL)
    expect(resolveAgentModel('  ')).toBe(DEFAULT_AGENT_MODEL)
    expect(resolveAgentModel(undefined)).toBe(DEFAULT_AGENT_MODEL)
  })
})

describe('buildAgentRequest', () => {
  it('sends no tools when answering from verified records, so the web is never searched', () => {
    const body = buildAgentRequest({ model: 'openai/gpt-6-luna', system: 'rules', message: 'Harvard tuition?', searchWeb: false })
    expect(body).not.toHaveProperty('tools')
    expect(body).not.toHaveProperty('preset')
    expect(body.instructions).toBe('rules')
    expect(body.input).toEqual([{ type: 'message', role: 'user', content: 'Harvard tuition?' }])
  })

  it('sends prior turns as input messages before the current message', () => {
    const body = buildAgentRequest({
      model: 'openai/gpt-6-luna',
      system: 'rules',
      message: 'What about Yale?',
      history: [
        { role: 'user', content: 'What is the application fee at MIT?' },
        { role: 'assistant', content: 'MIT charges $75.' },
      ],
      searchWeb: false,
    })
    expect(body.input).toEqual([
      { type: 'message', role: 'user', content: 'What is the application fee at MIT?' },
      { type: 'message', role: 'assistant', content: 'MIT charges $75.' },
      { type: 'message', role: 'user', content: 'What about Yale?' },
    ])
  })

  it('sends no temperature, which openai/gpt-6-luna rejects with a 400', () => {
    const body = buildAgentRequest({ model: 'openai/gpt-6-luna', system: 'rules', message: 'Hi', searchWeb: true })
    expect(body).not.toHaveProperty('temperature')
  })

  it('takes a smaller output budget for conversation replies', () => {
    expect(buildAgentRequest({ model: 'm/x', system: 's', message: 'hi', searchWeb: false }).max_output_tokens).toBe(2048)
    expect(buildAgentRequest({ model: 'm/x', system: 's', message: 'hi', searchWeb: false, maxOutputTokens: 400 }).max_output_tokens).toBe(400)
  })

  it('adds the web_search tool only for general guidance', () => {
    const body = buildAgentRequest({ model: 'openai/gpt-6-luna', system: 'rules', message: 'Visa tips?', searchWeb: true })
    expect(body.tools).toEqual([{ type: 'web_search' }])
  })

  it('requests the counselor JSON schema under a valid schema name', () => {
    const body = buildAgentRequest({ model: 'openai/gpt-6-luna', system: 'rules', message: 'Hi', searchWeb: false })
    expect(body.response_format.type).toBe('json_schema')
    expect(body.response_format.json_schema.name).toMatch(/^[A-Za-z0-9_]{1,64}$/)
    expect(body.response_format.json_schema.schema.required).toEqual(['answerType', 'answer', 'recordCitations'])
  })
})

describe('parseAgentPayload', () => {
  it('reads the answer from the message output and de-duplicates search result URLs', () => {
    const { parsed, webCitations } = parseAgentPayload(agentResponse(JSON.stringify(answer)))
    expect(parsed).toEqual(answer)
    expect(webCitations).toEqual(['https://travel.state.gov/f1', 'https://studyinthestates.dhs.gov'])
  })

  it('prefers output_text when the response includes it', () => {
    const payload = agentResponse('not json', { output_text: JSON.stringify(answer) })
    expect(parseAgentPayload(payload).parsed).toEqual(answer)
  })

  it('rejects a run that did not complete', () => {
    expect(() => parseAgentPayload(agentResponse(JSON.stringify(answer), { status: 'incomplete' })))
      .toThrow('status incomplete')
  })

  it('rejects a response with no message text', () => {
    expect(() => parseAgentPayload({ status: 'completed', output: [] })).toThrow('missing content')
  })

  it('accepts a conversation reply', () => {
    const reply = { answerType: 'conversation', answer: 'I’m doing well, thanks!', recordCitations: [] }
    expect(parseAgentPayload(agentResponse(JSON.stringify(reply))).parsed).toEqual(reply)
  })

  it('rejects an answer type outside the contract', () => {
    const bad = JSON.stringify({ ...answer, answerType: 'out_of_scope' })
    expect(() => parseAgentPayload(agentResponse(bad))).toThrow('invalid answer type')
  })

  it('rejects malformed record citations', () => {
    const bad = JSON.stringify({ ...answer, recordCitations: [42] })
    expect(() => parseAgentPayload(agentResponse(bad))).toThrow('malformed record citations')
  })
})
