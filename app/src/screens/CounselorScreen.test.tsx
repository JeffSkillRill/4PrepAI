// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { CounselorScreen } from './CounselorScreen'
import type { University } from '../types'

const clientMocks = vi.hoisted(() => ({ invoke: vi.fn(), from: vi.fn() }))
const comparisonUniversities = vi.hoisted(() => ['Alpha University', 'Beta College', 'Gamma Institute', 'Delta University'].map((name, index) => ({
  id: `university-${index + 1}`,
  name,
  city: `City ${index + 1}`,
  country: 'United States',
  highlights: [],
})) as unknown as University[])

vi.mock('../data/client', () => ({
  getSupabaseClient: () => ({
    functions: { invoke: clientMocks.invoke },
    from: clientMocks.from,
  }),
}))
vi.mock('../data/useRepositoryData', () => ({ useRepositoryData: () => ({ data: comparisonUniversities, status: 'ready', reload: vi.fn() }) }))
vi.mock('../components/CostSummary', () => ({ PublishedNetCost: () => <span>Not computable</span> }))
vi.mock('../components/Trust', () => ({ DataValue: () => <span>Unknown</span>, ExpandableFit: () => <span>Five-part fit disclosure</span>, MissingValue: ({ title }: { title: string }) => <span>{title}</span>, SourceChip: ({ sourceId }: { sourceId: string }) => <span data-testid="source-chip">{sourceId}</span> }))
vi.mock('../scoring/costs', () => ({ bestPublishedCostScenario: () => null, hasComprehensiveInternationalFunding: () => false, hasFullNeedPolicy: () => false }))

const counselorProps = { profile: null, saved: new Set<string>() }

beforeEach(() => {
  clientMocks.invoke.mockReset()
  clientMocks.from.mockReset()
  window.sessionStorage.clear()
})
afterEach(cleanup)

type AnswerType = 'verified_fact' | 'general_guidance' | 'out_of_scope' | 'refusal' | 'greeting'

function reply(answerType: AnswerType, answer = 'Safe answer copy.', extra: Record<string, unknown> = {}) {
  return { data: { answerType, answer, recordCitations: [], webCitations: [], requestId: `request-${answerType}`, ...extra }, error: null }
}

const composer = () => screen.getByLabelText('Message the counselor') as HTMLTextAreaElement

function typeAndSend(text: string) {
  fireEvent.change(composer(), { target: { value: text } })
  fireEvent.keyDown(composer(), { key: 'Enter' })
}

describe('CounselorScreen chat', () => {
  it('opens with a counselor bubble and starter chips that send when clicked', async () => {
    clientMocks.invoke.mockResolvedValue(reply('verified_fact', 'MIT charges an application fee.'))
    render(<CounselorScreen {...counselorProps} />)
    expect(screen.getByText(/Ask me anything about applying to US universities/)).toBeTruthy()
    const chips = within(screen.getByRole('list', { name: 'Suggested questions' })).getAllByRole('button')
    expect(chips.length).toBeGreaterThanOrEqual(3)
    expect(chips.length).toBeLessThanOrEqual(4)

    fireEvent.click(screen.getByRole('button', { name: 'What is the application fee at MIT?' }))
    expect(await screen.findByText('MIT charges an application fee.')).toBeTruthy()
    expect(clientMocks.invoke).toHaveBeenCalledWith('counselor', { body: { message: 'What is the application fee at MIT?', history: [] } })
  })

  it('sends on Enter and keeps a new line on Shift+Enter', async () => {
    clientMocks.invoke.mockResolvedValue(reply('general_guidance', 'Start early.'))
    render(<CounselorScreen {...counselorProps} />)
    fireEvent.change(composer(), { target: { value: 'How do I start my essay?' } })
    fireEvent.keyDown(composer(), { key: 'Enter', shiftKey: true })
    expect(clientMocks.invoke).not.toHaveBeenCalled()

    fireEvent.keyDown(composer(), { key: 'Enter' })
    expect(await screen.findByText('Start early.')).toBeTruthy()
    expect(clientMocks.invoke).toHaveBeenCalledOnce()
    expect(composer().value).toBe('')
    expect(document.activeElement).toBe(composer())
  })

  it('shows the student message and a typing indicator while waiting', async () => {
    let resolve: (value: unknown) => void = () => {}
    clientMocks.invoke.mockReturnValue(new Promise((done) => { resolve = done }))
    render(<CounselorScreen {...counselorProps} />)
    typeAndSend('What is Yale tuition?')
    expect(screen.getByText('What is Yale tuition?')).toBeTruthy()
    expect(screen.getByText('The counselor is typing')).toBeTruthy()
    resolve(reply('verified_fact', 'Yale tuition reply.'))
    expect(await screen.findByText('Yale tuition reply.')).toBeTruthy()
    expect(screen.queryByText('The counselor is typing')).toBeNull()
  })

  it('renders a greeting as a plain bubble, never as an out-of-scope card', async () => {
    clientMocks.invoke.mockResolvedValue(reply('greeting', 'Hi, I am your 4Prep counselor.', { suggestions: ['How do I write a strong personal statement?'] }))
    const { container } = render(<CounselorScreen {...counselorProps} />)
    typeAndSend('Hello how can you help me')
    expect(await screen.findByText('Hi, I am your 4Prep counselor.')).toBeTruthy()
    expect(container.textContent).not.toMatch(/outside what I advise on/i)
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
  })

  it('passes the earlier conversation as history', async () => {
    clientMocks.invoke.mockResolvedValueOnce(reply('verified_fact', 'MIT fee answer.'))
    clientMocks.invoke.mockResolvedValueOnce(reply('verified_fact', 'Yale fee answer.'))
    render(<CounselorScreen {...counselorProps} />)
    typeAndSend('What is the application fee at MIT?')
    await screen.findByText('MIT fee answer.')
    typeAndSend('What about Yale?')
    await screen.findByText('Yale fee answer.')
    expect(clientMocks.invoke).toHaveBeenLastCalledWith('counselor', {
      body: {
        message: 'What about Yale?',
        history: [
          { role: 'user', content: 'What is the application fee at MIT?' },
          { role: 'assistant', content: 'MIT fee answer.' },
        ],
      },
    })
  })

  it('leaves errored turns out of the history', async () => {
    clientMocks.invoke.mockResolvedValueOnce({ data: null, error: { name: 'FunctionsFetchError' } })
    clientMocks.invoke.mockResolvedValueOnce(reply('general_guidance', 'Second answer.'))
    render(<CounselorScreen {...counselorProps} />)
    typeAndSend('First question')
    await screen.findByRole('alert')
    typeAndSend('Second question')
    await screen.findByText('Second answer.')
    expect(clientMocks.invoke).toHaveBeenLastCalledWith('counselor', { body: { message: 'Second question', history: [] } })
  })

  it('shows a verified fact as a bubble with its source chip', async () => {
    clientMocks.invoke.mockResolvedValue(reply('verified_fact', 'A **verified detail** is formatted safely.', { recordCitations: ['us-mit-application'] }))
    render(<CounselorScreen {...counselorProps} />)
    typeAndSend('Show formatted answer')
    expect(await screen.findByText('verified detail', { selector: 'strong' })).toBeTruthy()
    expect(screen.getByTestId('source-chip').textContent).toBe('us-mit-application')
    expect(screen.queryByText('Verified 4Prep fact')).toBeNull()
  })

  it('tags general guidance as not verified 4Prep data and links its web sources', async () => {
    clientMocks.invoke.mockResolvedValue(reply('general_guidance', 'Bring your I-20.', { webCitations: ['https://travel.state.gov/f1'] }))
    render(<CounselorScreen {...counselorProps} />)
    typeAndSend('What do I bring to the visa interview?')
    expect(await screen.findByText(/General info · not verified 4Prep data/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /travel\.state\.gov/ })).toBeTruthy()
  })

  it.each(['refusal', 'out_of_scope'] as const)('renders %s as a plain bubble with no headline or label', async (answerType) => {
    clientMocks.invoke.mockResolvedValue(reply(answerType, 'Plain counselor reply.', answerType === 'out_of_scope' ? { suggestions: ['Ask about US admissions'] } : {}))
    const { container } = render(<CounselorScreen {...counselorProps} />)
    typeAndSend('Something')
    expect(await screen.findByText('Plain counselor reply.')).toBeTruthy()
    expect(container.textContent).not.toMatch(/Honest refusal|Verified answer unavailable|outside what I advise on|No citation is attached/i)
    if (answerType === 'out_of_scope') expect(screen.getByRole('button', { name: 'Ask about US admissions' })).toBeTruthy()
  })

  it('keeps prior questions and replies visible as a conversation', async () => {
    clientMocks.invoke.mockResolvedValue(reply('verified_fact', 'A saved answer.'))
    render(<CounselorScreen {...counselorProps} />)
    typeAndSend('First question')
    await screen.findByText('A saved answer.')
    typeAndSend('Second question')
    expect(await screen.findByText('Second question')).toBeTruthy()
    await waitFor(() => expect(screen.getAllByText('A saved answer.')).toHaveLength(2))
    expect(screen.getByText('First question')).toBeTruthy()
  })

  it('renders a safe refusal returned with a non-2xx response', async () => {
    const response = new Response(JSON.stringify({
      answerType: 'refusal',
      answer: 'Sorry, I can’t answer right now.',
      recordCitations: [],
      webCitations: [],
      requestId: 'request-503',
    }), { status: 503, headers: { 'content-type': 'application/json' } })
    clientMocks.invoke.mockResolvedValue({ data: null, error: new FunctionsHttpError(response) })
    render(<CounselorScreen {...counselorProps} />)
    typeAndSend('How should I prepare?')
    expect(await screen.findByText('Sorry, I can’t answer right now.')).toBeTruthy()
  })

  it('shows an error bubble with Try again, which resends the question', async () => {
    const response = new Response(JSON.stringify({ code: 'NOT_FOUND' }), { status: 404, headers: { 'content-type': 'application/json' } })
    clientMocks.invoke.mockResolvedValueOnce({ data: null, error: new FunctionsHttpError(response) })
    clientMocks.invoke.mockResolvedValueOnce(reply('general_guidance', 'Now it works.'))
    render(<CounselorScreen {...counselorProps} />)
    typeAndSend('How should I prepare?')
    expect((await screen.findByRole('alert')).textContent).toContain('not configured for this environment')

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Now it works.')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getAllByText('How should I prepare?')).toHaveLength(1)
    expect(clientMocks.invoke).toHaveBeenLastCalledWith('counselor', { body: { message: 'How should I prepare?', history: [] } })
  })

  it('identifies a browser-level counselor fetch failure as an environment configuration problem', async () => {
    clientMocks.invoke.mockResolvedValue({ data: null, error: { name: 'FunctionsFetchError' } })
    render(<CounselorScreen {...counselorProps} />)
    typeAndSend('How should I prepare?')
    expect((await screen.findByRole('alert')).textContent).toContain('not configured or cannot be reached from this environment')
  })

  it('asks the server even for an unknown figure; there is no client-side preflight', async () => {
    clientMocks.invoke.mockResolvedValue(reply('refusal', 'I don’t have a verified tuition for Alpha University yet, so I won’t guess.'))
    render(<CounselorScreen {...counselorProps} />)
    typeAndSend('What is the tuition at Alpha University?')
    expect(await screen.findByText(/I don’t have a verified tuition for Alpha University/)).toBeTruthy()
    expect(clientMocks.from).not.toHaveBeenCalled()
    expect(clientMocks.invoke).toHaveBeenCalledOnce()
  })

  it('shows the character counter only near the limit', () => {
    render(<CounselorScreen {...counselorProps} />)
    fireEvent.change(composer(), { target: { value: 'x'.repeat(800) } })
    expect(screen.queryByText(/characters left/)).toBeNull()
    fireEvent.change(composer(), { target: { value: 'x'.repeat(860) } })
    expect(screen.getByText('140 characters left')).toBeTruthy()
  })

  it('keeps "Compare universities" and a collapsed sourcing note in the sidebar', () => {
    render(<CounselorScreen {...counselorProps} />)
    const summary = screen.getByText('How answers are sourced')
    expect(summary.closest('details')?.open).toBe(false)
    expect(screen.queryByText(/Never compute your Φ fit score/)).toBeNull()
  })

  it('opens the searchable picker and adds a stacked comparison turn to the conversation', () => {
    const first = render(<CounselorScreen {...counselorProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Compare universities' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Search universities'), { target: { value: 'delta' } })
    expect(screen.getByRole('button', { name: /Delta University/ })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Search universities'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Remove Alpha University from selection' }))
    fireEvent.click(screen.getByRole('button', { name: /Delta University/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Add comparison to chat' }))

    expect(screen.getByRole('heading', { name: 'See the trade-offs clearly' })).toBeTruthy()
    expect(screen.getByText('Mandatory fees')).toBeTruthy()
    expect(first.container.querySelector('table')).toBeNull()
    first.unmount()
    render(<CounselorScreen {...counselorProps} />)
    expect(screen.getByRole('heading', { name: 'See the trade-offs clearly' })).toBeTruthy()
  })
})
