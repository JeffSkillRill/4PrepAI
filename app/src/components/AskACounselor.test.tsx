// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const submitLead = vi.fn()

vi.mock('../data/repository', () => ({
  submitLead: (...args: unknown[]) => submitLead(...args),
}))

import { AskACounselor } from './AskACounselor'
import { setAnalyticsSink } from '../data/analytics'
import type { AnalyticsEvent, AnalyticsProperties } from '../data/analytics'

const events: Array<{ event: AnalyticsEvent; properties: AnalyticsProperties }> = []

beforeEach(() => {
  submitLead.mockReset()
  events.length = 0
  setAnalyticsSink((event, properties) => { events.push({ event, properties }) })
})

afterEach(() => {
  setAnalyticsSink(null)
  cleanup()
})

function openForm() {
  fireEvent.click(screen.getByRole('button', { name: /ask a 4prep counsellor/i }))
}

function fillRequired() {
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Aziza' } })
  fireEvent.change(screen.getByLabelText(/how to reach you/i), { target: { value: '@aziza' } })
}

describe('AskACounselor', () => {
  it('reports that it was shown before the student interacts, so a conversion rate has a denominator', () => {
    render(<AskACounselor source="gap" contextRef="berea" />)
    expect(events.map((entry) => entry.event)).toContain('handoff_shown')
  })

  it('states that the app stays free, and never predicts an admission outcome', () => {
    render(<AskACounselor source="gap" contextRef="berea" />)
    openForm()

    const text = document.body.textContent ?? ''
    expect(text).toMatch(/stays free/i)
    expect(text).not.toMatch(/chance|likelihood|guarantee|will get in|admission odds/i)
  })

  it('submits and confirms what happens next without promising a reply time', async () => {
    submitLead.mockResolvedValue({ status: 'submitted', leadId: 'lead-1', retryAfterSeconds: 0 })
    render(<AskACounselor source="results" contextRef="US:Computer Science" />)
    openForm()
    fillRequired()
    fireEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => {
      expect(screen.getByText(/will be in touch/i)).toBeTruthy()
    })
    // A stated window nobody meets costs more than no window at all.
    expect(document.body.textContent ?? '').not.toMatch(/within \d|working day|24 hours/i)
    expect(events.some((entry) => entry.event === 'lead_submitted')).toBe(true)
  })

  it('passes the caller-generated id, source and context to the repository', async () => {
    submitLead.mockResolvedValue({ status: 'submitted', leadId: 'lead-2', retryAfterSeconds: 0 })
    render(<AskACounselor source="gap" contextRef="berea-college" />)
    openForm()
    fillRequired()
    fireEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => expect(submitLead).toHaveBeenCalledTimes(1))
    const [leadId, source, submission, contextRef] = submitLead.mock.calls[0]
    expect(typeof leadId).toBe('string')
    expect(leadId).not.toHaveLength(0)
    expect(source).toBe('gap')
    expect(submission).toMatchObject({ name: 'Aziza', contact: '@aziza' })
    expect(contextRef).toBe('berea-college')
  })

  it('names the wait when rate limited rather than showing a generic error', async () => {
    submitLead.mockResolvedValue({ status: 'rate_limited', leadId: 'lead-3', retryAfterSeconds: 600 })
    render(<AskACounselor source="gap" />)
    openForm()
    fillRequired()
    fireEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => {
      expect(screen.getByText(/try again in about 10 minutes/i)).toBeTruthy()
    })
    expect(events.some((entry) => entry.event === 'lead_failed')).toBe(true)
  })

  it('keeps what the student typed when submission fails, and offers a way through', async () => {
    submitLead.mockRejectedValue(new Error('network'))
    render(<AskACounselor source="results" />)
    openForm()
    fillRequired()
    fireEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => {
      expect(screen.getByText(/could not send that just now/i)).toBeTruthy()
    })
    expect((screen.getByLabelText(/your name/i) as HTMLInputElement).value).toBe('Aziza')
    expect((screen.getByLabelText(/how to reach you/i) as HTMLInputElement).value).toBe('@aziza')
    expect(screen.getByRole('link', { name: /contact@4prep\.ai/i })).toBeTruthy()
  })

  it('drops a honeypot submission without calling the repository or telling the filler', async () => {
    render(<AskACounselor source="gap" />)
    openForm()
    fillRequired()
    fireEvent.change(screen.getByLabelText(/company/i), { target: { value: 'bot inc' } })
    fireEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => {
      expect(screen.getByText(/will be in touch/i)).toBeTruthy()
    })
    expect(submitLead).not.toHaveBeenCalled()
  })

  it('will not submit until a name and a reachable contact are both present', () => {
    render(<AskACounselor source="gap" />)
    openForm()
    const send = screen.getByRole('button', { name: /send request/i }) as HTMLButtonElement
    expect(send.disabled).toBe(true)

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Aziza' } })
    expect(send.disabled).toBe(true)

    fireEvent.change(screen.getByLabelText(/how to reach you/i), { target: { value: '@aziza' } })
    expect(send.disabled).toBe(false)
  })
})
