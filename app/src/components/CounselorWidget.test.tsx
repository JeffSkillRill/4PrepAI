// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CounselorWidget } from './CounselorWidget'
import { requestCounselorAnswer } from '../counselor/request'

vi.mock('../counselor/request', () => ({
  requestCounselorAnswer: vi.fn(),
}))

const requestCounselorAnswerMock = vi.mocked(requestCounselorAnswer)

describe('CounselorWidget', () => {
  beforeEach(() => {
    requestCounselorAnswerMock.mockReset()
    window.sessionStorage.clear()
  })
  afterEach(cleanup)

  it('starts closed with a launcher, then moves focus into the panel and back on close', () => {
    render(<CounselorWidget />)

    const launcher = screen.getByRole('button', { name: 'Open 4Prep counselor' })
    expect(launcher).toBeTruthy()
    expect(screen.queryByRole('heading', { name: '4Prep counselor' })).toBeNull()

    fireEvent.click(launcher)
    expect(screen.getByRole('heading', { name: '4Prep counselor' })).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('Ask the counselor'))

    fireEvent.click(screen.getByRole('button', { name: 'Close counselor' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open 4Prep counselor' }))
  })

  it('opens the full counselor page from the chat bar', () => {
    const onOpenCounselor = vi.fn()
    render(<CounselorWidget onOpenCounselor={onOpenCounselor} />)

    fireEvent.click(screen.getByRole('button', { name: 'Open 4Prep counselor' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open full counselor chat' }))

    expect(onOpenCounselor).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Open 4Prep counselor' })).toBeTruthy()
  })

  it('shows the sourced counselor reply in the panel', async () => {
    requestCounselorAnswerMock.mockResolvedValue({
      answer: { answer: 'Berea publishes **full funding** for enrolled international students.', answerType: 'verified_fact', recordCitations: [], webCitations: [], requestId: 'request-1' },
      error: null,
    })
    render(<CounselorWidget />)

    fireEvent.click(screen.getByRole('button', { name: 'Open 4Prep counselor' }))
    const input = screen.getByLabelText('Ask the counselor')
    fireEvent.change(input, { target: { value: 'What aid does Berea offer?' } })
    fireEvent.submit(input.closest('form')!)

    expect(await screen.findByText('full funding', { selector: 'strong' })).toBeTruthy()
    expect(screen.getByText('What aid does Berea offer?')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close counselor' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open 4Prep counselor' }))
    expect(screen.getByText('What aid does Berea offer?')).toBeTruthy()
  })

  it('sends on Enter with the earlier conversation as history', async () => {
    requestCounselorAnswerMock.mockResolvedValueOnce({
      answer: { answer: 'MIT fee answer.', answerType: 'verified_fact', recordCitations: [], webCitations: [], requestId: 'request-1' },
      error: null,
    })
    requestCounselorAnswerMock.mockResolvedValueOnce({
      answer: { answer: 'Hi there, I am your counselor.', answerType: 'greeting', recordCitations: [], webCitations: [], requestId: 'request-2' },
      error: null,
    })
    render(<CounselorWidget />)
    fireEvent.click(screen.getByRole('button', { name: 'Open 4Prep counselor' }))
    const input = screen.getByLabelText('Ask the counselor')
    fireEvent.change(input, { target: { value: 'MIT application fee?' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await screen.findByText('MIT fee answer.')
    fireEvent.change(input, { target: { value: 'thanks' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(await screen.findByText('Hi there, I am your counselor.')).toBeTruthy()
    expect(requestCounselorAnswerMock).toHaveBeenLastCalledWith('thanks', [
      { role: 'user', content: 'MIT application fee?' },
      { role: 'assistant', content: 'MIT fee answer.' },
    ])
  })
})
