// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { CounselorScreen } from './CounselorScreen'
import type { University } from '../types'

const clientMocks = vi.hoisted(() => ({ invoke: vi.fn() }))
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
  }),
}))
vi.mock('../data/useRepositoryData', () => ({ useRepositoryData: () => ({ data: comparisonUniversities, status: 'ready', reload: vi.fn() }) }))
vi.mock('../components/CostSummary', () => ({ PublishedNetCost: () => <span>Not computable</span> }))
vi.mock('../components/Trust', () => ({ DataValue: () => <span>Unknown</span>, ExpandableFit: () => <span>Five-part fit disclosure</span>, MissingValue: ({ title }: { title: string }) => <span>{title}</span>, SourceChip: () => null }))
vi.mock('../scoring/costs', () => ({ bestPublishedCostScenario: () => null, hasComprehensiveInternationalFunding: () => false, hasFullNeedPolicy: () => false }))

const counselorProps = { profile: null, saved: new Set<string>() }

beforeEach(() => {
  clientMocks.invoke.mockReset()
  window.sessionStorage.clear()
})
afterEach(cleanup)

async function submitAnswer(answerType: 'verified_fact' | 'general_guidance' | 'out_of_scope' | 'refusal') {
  clientMocks.invoke.mockResolvedValue({
    data: {
      answerType,
      answer: answerType === 'verified_fact' ? 'The sourced record says this is verified.' : 'Safe answer copy.',
      recordCitations: [],
      webCitations: [],
      suggestions: answerType === 'out_of_scope' ? ['Ask about US admissions'] : undefined,
      requestId: 'request-1',
    },
    error: null,
  })
  render(<CounselorScreen {...counselorProps} />)
  fireEvent.change(screen.getByLabelText('What would you like to know?'), { target: { value: 'How should I prepare?' } })
  fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))
}

describe('CounselorScreen answer hierarchy', () => {
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

  it('resolves a verified fact with its explicit record label', async () => {
    clientMocks.invoke.mockResolvedValue({
      data: { answerType: 'verified_fact', answer: 'A **verified detail** is formatted safely.', recordCitations: [], webCitations: [], requestId: 'request-markdown' },
      error: null,
    })
    render(<CounselorScreen {...counselorProps} />)
    fireEvent.change(screen.getByLabelText('What would you like to know?'), { target: { value: 'Show formatted answer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))

    expect(await screen.findByText('verified detail', { selector: 'strong' })).toBeTruthy()
    expect(screen.getByText('Show formatted answer')).toBeTruthy()
  })

  it('keeps prior questions and replies visible as a conversation', async () => {
    clientMocks.invoke.mockResolvedValue({
      data: { answerType: 'verified_fact', answer: 'A saved answer.', recordCitations: [], webCitations: [], requestId: 'request-history' },
      error: null,
    })
    render(<CounselorScreen {...counselorProps} />)
    const input = screen.getByLabelText('What would you like to know?')
    fireEvent.change(input, { target: { value: 'First question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))
    await screen.findByText('A saved answer.')
    fireEvent.change(input, { target: { value: 'Second question' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))

    expect(await screen.findByText('First question')).toBeTruthy()
    expect(screen.getByText('Second question')).toBeTruthy()
    expect(screen.getAllByText('A saved answer.')).toHaveLength(2)
  })

  it('resolves a verified fact with its explicit record label', async () => {
    await submitAnswer('verified_fact')
    const label = await screen.findByText('Verified 4Prep fact')
    expect(label.closest('.motion-resolve')).toBeTruthy()
    expect(screen.getByText('The sourced record says this is verified.')).toBeTruthy()
  })

  it('labels general guidance as not verified 4Prep data', async () => {
    await submitAnswer('general_guidance')
    expect(await screen.findByText('General web guidance · not verified 4Prep data')).toBeTruthy()
  })

  it.each([
    ['out_of_scope', 'That is outside what I advise on'],
    ['refusal', 'Verified answer unavailable'],
  ] as const)('keeps %s static and visibly distinct', async (answerType, heading) => {
    await submitAnswer(answerType)
    const element = await screen.findByRole('heading', { name: heading })
    expect(element.closest('.trust-static')).toBeTruthy()
    expect(element.closest('.motion-resolve')).toBeNull()
  })

  it('renders a safe refusal returned with a non-2xx response', async () => {
    const response = new Response(JSON.stringify({
      answerType: 'refusal',
      answer: 'The required provider is unavailable, so no verified answer can be returned.',
      recordCitations: [],
      webCitations: [],
      requestId: 'request-503',
    }), { status: 503, headers: { 'content-type': 'application/json' } })
    clientMocks.invoke.mockResolvedValue({ data: null, error: new FunctionsHttpError(response) })

    render(<CounselorScreen {...counselorProps} />)
    fireEvent.change(screen.getByLabelText('What would you like to know?'), { target: { value: 'How should I prepare?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))

    expect(await screen.findByRole('heading', { name: 'Verified answer unavailable' })).toBeTruthy()
    expect(screen.getByText('The required provider is unavailable, so no verified answer can be returned.')).toBeTruthy()
  })

  it('identifies a missing counselor deployment without displaying an answer', async () => {
    const response = new Response(JSON.stringify({ code: 'NOT_FOUND' }), { status: 404, headers: { 'content-type': 'application/json' } })
    clientMocks.invoke.mockResolvedValue({ data: null, error: new FunctionsHttpError(response) })

    render(<CounselorScreen {...counselorProps} />)
    fireEvent.change(screen.getByLabelText('What would you like to know?'), { target: { value: 'How should I prepare?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))

    expect((await screen.findByRole('alert')).textContent).toContain('not configured for this environment')
    expect(screen.queryByText('Verified 4Prep fact')).toBeNull()
  })

  it('identifies a browser-level counselor fetch failure as an environment configuration problem', async () => {
    clientMocks.invoke.mockResolvedValue({ data: null, error: { name: 'FunctionsFetchError' } })

    render(<CounselorScreen {...counselorProps} />)
    fireEvent.change(screen.getByLabelText('What would you like to know?'), { target: { value: 'How should I prepare?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))

    expect((await screen.findByRole('alert')).textContent).toContain('not configured or cannot be reached from this environment')
  })
})
