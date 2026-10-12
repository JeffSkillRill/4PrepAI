// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import type { Session, User } from '@supabase/supabase-js'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './AuthProvider'

const mock = vi.hoisted(() => ({ getSession: vi.fn(), getUser: vi.fn(), updateUser: vi.fn(), upload: vi.fn(), callback: vi.fn() }))
vi.mock('../data/client', () => ({ getSupabaseClient: () => ({
  auth: { getSession: mock.getSession, getUser: mock.getUser, updateUser: mock.updateUser,
    onAuthStateChange: (callback: typeof mock.callback) => { mock.callback = callback; return { data: { subscription: { unsubscribe: vi.fn() } } } },
  },
  storage: { from: () => ({ upload: mock.upload, getPublicUrl: () => ({ data: { publicUrl: 'https://synthetic.invalid/avatar' } }) }) },
}) }))

const userA = { id: 'student-a', user_metadata: {} } as User
const userB = { id: 'student-b', user_metadata: {} } as User
const session = (user: User) => ({ user, access_token: 'synthetic-only' }) as Session
let auth: ReturnType<typeof useAuth>
function Probe() {
  const value = useAuth()
  useEffect(() => { auth = value }, [value])
  return <p>{value.user?.id ?? 'signed-out'}</p>
}
beforeEach(() => {
  mock.getSession.mockReset().mockResolvedValue({ data: { session: session(userA) }, error: null })
  mock.getUser.mockReset().mockResolvedValue({ data: { user: userA }, error: null })
  mock.updateUser.mockReset().mockResolvedValue({ data: { user: userA }, error: null })
  mock.upload.mockReset().mockResolvedValue({ error: null })
})
afterEach(cleanup)

it('updates the original account normally', async () => {
  render(<AuthProvider><Probe /></AuthProvider>)
  await screen.findByText('student-a')
  await act(async () => { await auth.updateProfile({ fullName: ' Synthetic A ' }) })
  expect(mock.updateUser).toHaveBeenCalledWith({ data: { full_name: 'Synthetic A' } })
})

it('does not attach an old avatar or name to the newly signed-in account', async () => {
  let release!: (value: { error: null }) => void
  mock.upload.mockImplementation(() => new Promise((resolve) => { release = resolve }))
  render(<AuthProvider><Probe /></AuthProvider>)
  await screen.findByText('student-a')
  const result = auth.updateProfile({ fullName: 'Old name', avatarFile: new File(['image'], 'avatar.png', { type: 'image/png' }) }).catch((error: Error) => error)
  await vi.waitFor(() => expect(mock.upload).toHaveBeenCalled())
  act(() => { mock.callback('SIGNED_OUT', null); mock.callback('SIGNED_IN', session(userB)) })
  await act(async () => { release({ error: null }); expect(await result).toMatchObject({ message: expect.stringContaining('Your account changed') }) })
  expect(mock.updateUser).not.toHaveBeenCalled()
  expect(screen.getByText('student-b')).toBeTruthy()
})

it('rejects a delayed user lookup from a different account before uploading or updating metadata', async () => {
  let release!: (value: { data: { user: User }; error: null }) => void
  mock.getUser.mockImplementation(() => new Promise((resolve) => { release = resolve }))
  render(<AuthProvider><Probe /></AuthProvider>)
  await screen.findByText('student-a')
  const result = auth.updateProfile({ fullName: 'Old name' }).catch((error: Error) => error)
  act(() => { mock.callback('SIGNED_OUT', null); mock.callback('SIGNED_IN', session(userB)) })
  await act(async () => { release({ data: { user: userB }, error: null }); expect(await result).toBeInstanceOf(Error) })
  expect(mock.upload).not.toHaveBeenCalled()
  expect(mock.updateUser).not.toHaveBeenCalled()
})

it('does not let a delayed startup session replace a newer auth event', async () => {
  let release!: (value: { data: { session: Session }; error: null }) => void
  mock.getSession.mockImplementation(() => new Promise((resolve) => { release = resolve }))
  render(<AuthProvider><Probe /></AuthProvider>)
  act(() => { mock.callback('SIGNED_IN', session(userB)) })
  await act(async () => { release({ data: { session: session(userA) }, error: null }) })
  expect(screen.getByText('student-b')).toBeTruthy()
  expect(screen.queryByText('student-a')).toBeNull()
})

it('ignores a startup session returned after sign-out before initial hydration', async () => {
  let release!: (value: { data: { session: Session }; error: null }) => void
  mock.getSession.mockImplementation(() => new Promise((resolve) => { release = resolve }))
  render(<AuthProvider><Probe /></AuthProvider>)
  act(() => { mock.callback('SIGNED_OUT', null) })
  await act(async () => { release({ data: { session: session(userA) }, error: null }) })
  expect(screen.getByText('signed-out')).toBeTruthy()
})
