// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { CounselorScreen } from './CounselorScreen'

const clientMocks = vi.hoisted(() => ({ invoke: vi.fn() }))

vi.mock('../data/client', () => ({
  getSupabaseClient: () => ({
    functions: { invoke: clientMocks.invoke },
  }),
}))

beforeEach(() => clientMocks.invoke.mockReset())
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
  render(<CounselorScreen />)
  fireEvent.change(screen.getByLabelText('What would you like to know?'), { target: { value: 'How should I prepare?' } })
  fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))
}

describe('CounselorScreen answer hierarchy', () => {
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

    render(<CounselorScreen />)
    fireEvent.change(screen.getByLabelText('What would you like to know?'), { target: { value: 'How should I prepare?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))

    expect(await screen.findByRole('heading', { name: 'Verified answer unavailable' })).toBeTruthy()
    expect(screen.getByText('The required provider is unavailable, so no verified answer can be returned.')).toBeTruthy()
  })

  it('identifies a missing counselor deployment without displaying an answer', async () => {
    const response = new Response(JSON.stringify({ code: 'NOT_FOUND' }), { status: 404, headers: { 'content-type': 'application/json' } })
    clientMocks.invoke.mockResolvedValue({ data: null, error: new FunctionsHttpError(response) })

    render(<CounselorScreen />)
    fireEvent.change(screen.getByLabelText('What would you like to know?'), { target: { value: 'How should I prepare?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))

    expect((await screen.findByRole('alert')).textContent).toContain('not configured for this environment')
    expect(screen.queryByText('Verified 4Prep fact')).toBeNull()
  })

  it('identifies a browser-level counselor fetch failure as an environment configuration problem', async () => {
    clientMocks.invoke.mockResolvedValue({ data: null, error: { name: 'FunctionsFetchError' } })

    render(<CounselorScreen />)
    fireEvent.change(screen.getByLabelText('What would you like to know?'), { target: { value: 'How should I prepare?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ask counselor' }))

    expect((await screen.findByRole('alert')).textContent).toContain('not configured or cannot be reached from this environment')
  })
})
