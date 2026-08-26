// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CounselorWidget } from './CounselorWidget'
import { requestCounselorAnswer } from '../screens/CounselorScreen'

vi.mock('../screens/CounselorScreen', () => ({
  requestCounselorAnswer: vi.fn(),
}))

const requestCounselorAnswerMock = vi.mocked(requestCounselorAnswer)

describe('CounselorWidget', () => {
  beforeEach(() => {
    requestCounselorAnswerMock.mockReset()
    window.sessionStorage.clear()
  })
  afterEach(cleanup)

  it('opens by default and can be hidden then reopened', () => {
    render(<CounselorWidget />)

    expect(screen.getByRole('heading', { name: '4Prep counselor' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Hide counselor' }))
    expect(screen.getByRole('button', { name: 'Open 4Prep counselor' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Open 4Prep counselor' }))
    expect(screen.getByRole('heading', { name: '4Prep counselor' })).toBeTruthy()
  })

  it('opens the full counselor page from the chat bar', () => {
    const onOpenCounselor = vi.fn()
    render(<CounselorWidget onOpenCounselor={onOpenCounselor} />)

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

    const input = screen.getByLabelText('Ask the counselor')
    fireEvent.change(input, { target: { value: 'What aid does Berea offer?' } })
    fireEvent.submit(input.closest('form')!)

    expect(await screen.findByText('full funding', { selector: 'strong' })).toBeTruthy()
    expect(screen.getByText('What aid does Berea offer?')).toBeTruthy()
  })
})
