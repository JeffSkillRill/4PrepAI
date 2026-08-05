// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SupportScreen } from './SupportScreen'
import { getSupportThread, sendSupportMessage } from '../data/repository'

vi.mock('../data/repository', () => ({
  getSupportThread: vi.fn(),
  sendSupportMessage: vi.fn(),
}))

const getThreadMock = vi.mocked(getSupportThread)
const sendMessageMock = vi.mocked(sendSupportMessage)

afterEach(() => {
  cleanup()
  getThreadMock.mockReset()
  sendMessageMock.mockReset()
  vi.restoreAllMocks()
  window.sessionStorage.clear()
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true })
})

describe('student support chat', () => {
  it('makes the platform-only scope clear and routes admissions questions away', () => {
    const onOpenCounselor = vi.fn()
    getThreadMock.mockResolvedValue(null)
    render(<SupportScreen userId="11111111-1111-4111-8111-111111111111" onSignIn={vi.fn()} onOpenCounselor={onOpenCounselor} />)
    expect(screen.getByRole('heading', { name: 'Platform support' })).toBeTruthy()
    expect(screen.getByText(/not live chat/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Open counselor' }))
    expect(onOpenCounselor).toHaveBeenCalledOnce()
  })

  it('shows an offline message as queued and never claims or attempts delivery', async () => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false })
    getThreadMock.mockResolvedValue(null)
    render(
      <SupportScreen
        userId="11111111-1111-4111-8111-111111111111"
        onSignIn={vi.fn()}
        onOpenCounselor={vi.fn()}
      />,
    )

    await waitFor(() => expect(getThreadMock).toHaveBeenCalled())
    fireEvent.change(screen.getByLabelText('Message 4Prep support'), {
      target: { value: 'The dashboard button does not work.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Queue message' }))

    expect(await screen.findByText('Queued · not sent yet')).toBeTruthy()
    expect(screen.getByText(/has not been sent/i)).toBeTruthy()
    expect(sendMessageMock).not.toHaveBeenCalled()
  })
})
