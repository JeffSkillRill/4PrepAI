// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SupportScreen } from './SupportScreen'
import { getSupportThread, sendSupportMessage } from '../data/repository'
import { createQueuedSupportMessage, writeSupportQueue } from '../support/queue'

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
  window.localStorage.clear()
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true })
})

describe('student support chat', () => {
  it('stops the old queue after an account screen unmounts, without restoring cleared private text', async () => {
    const owner = '11111111-1111-4111-8111-111111111111'
    const queue = ['Old account first message', 'Old account second message'].map((body) => createQueuedSupportMessage(owner, body))
    writeSupportQueue(window.localStorage, owner, queue)
    getThreadMock.mockResolvedValue(null)
    let resolveSend!: (value: Awaited<ReturnType<typeof sendSupportMessage>>) => void
    sendMessageMock.mockImplementation(() => new Promise((resolve) => { resolveSend = resolve }))
    const view = render(<SupportScreen userId={owner} onSignIn={vi.fn()} onOpenCounselor={vi.fn()} />)
    await waitFor(() => expect(sendMessageMock).toHaveBeenCalledTimes(1))
    view.unmount()
    window.localStorage.clear()
    render(<SupportScreen userId="22222222-2222-4222-8222-222222222222" onSignIn={vi.fn()} onOpenCounselor={vi.fn()} />)
    await act(async () => { resolveSend({ status: 'sent', messageId: queue[0].id, retryAfterSeconds: 0 }) })
    expect(sendMessageMock).toHaveBeenCalledTimes(1)
    expect(window.localStorage.length).toBe(0)
    expect(screen.queryByText(/Old account/)).toBeNull()
  })

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
