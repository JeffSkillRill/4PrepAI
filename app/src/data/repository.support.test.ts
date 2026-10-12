import { beforeEach, expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({ getSession: vi.fn(), rpc: vi.fn(), setHeader: vi.fn() }))
vi.mock('./client', () => ({ getSupabaseClient: () => ({ auth: { getSession: mock.getSession }, rpc: mock.rpc }) }))
import { sendSupportMessage } from './repository'

beforeEach(() => {
  mock.getSession.mockReset().mockResolvedValue({ data: { session: { user: { id: 'student-a' }, access_token: 'synthetic-a' } }, error: null })
  mock.setHeader.mockReset().mockResolvedValue({ data: [{ status: 'sent', message_id: 'message-1', retry_after_seconds: 0 }], error: null })
  mock.rpc.mockReset().mockReturnValue({ setHeader: mock.setHeader })
})

it('pins the support request to the queue owner token rather than whichever account is active later', async () => {
  await expect(sendSupportMessage('message-1', 'Synthetic support message', 'student-a')).resolves.toMatchObject({ status: 'sent' })
  expect(mock.rpc).toHaveBeenCalledWith('send_support_message', { p_message_id: 'message-1', p_body: 'Synthetic support message' })
  expect(mock.setHeader).toHaveBeenCalledWith('Authorization', 'Bearer synthetic-a')
})

it.each([null, { user: { id: 'student-b' }, access_token: 'synthetic-b' }])('does not send a queued message while its owner is not signed in', async (session) => {
  mock.getSession.mockResolvedValue({ data: { session }, error: null })
  await expect(sendSupportMessage('message-1', 'Private old message', 'student-a')).rejects.toThrow('Your account changed')
  expect(mock.rpc).not.toHaveBeenCalled()
})
