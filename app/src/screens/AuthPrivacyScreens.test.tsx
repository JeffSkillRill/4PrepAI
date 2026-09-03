// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  user: null as User | null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
  resendConfirmation: vi.fn(),
  updatePassword: vi.fn(),
  updateProfile: vi.fn(),
  deleteAccount: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('../auth/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../auth/AuthProvider')>()
  return {
    ...actual,
    useAuth: () => authMocks,
  }
})

import { AuthScreen } from './AuthPrivacyScreens'

beforeEach(() => {
  authMocks.user = null
  Object.values(authMocks).forEach((value) => {
    if (typeof value === 'function') value.mockReset()
  })
  authMocks.signUp.mockResolvedValue('active')
  authMocks.updateProfile.mockResolvedValue({ id: 'student-1', email: 'ada@example.com', user_metadata: { full_name: 'Ada Lovelace' } })
})

afterEach(cleanup)

function renderAuth() {
  return render(
    <AuthScreen
      onNavigate={vi.fn()}
      onAuthenticated={vi.fn()}
      onPrepareGoogle={vi.fn()}
      onSignedOut={vi.fn()}
      onAccountDeleted={vi.fn()}
    />,
  )
}

describe('AuthScreen profile details', () => {
  it('collects a required display name without a profile-photo field during sign-up', async () => {
    renderAuth()
    fireEvent.click(screen.getByRole('button', { name: /New to 4Prep/i }))

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Ada Lovelace' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'very-secret' } })
    expect(document.querySelector('input[type="file"]')).toBeNull()
    fireEvent.click(screen.getByRole('checkbox', { name: /I consent to 4Prep storing/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(authMocks.signUp).toHaveBeenCalledWith('ada@example.com', 'very-secret', 'Ada Lovelace')
    expect(authMocks.updateProfile).not.toHaveBeenCalled()
  })

  it('keeps validated profile-photo upload in the signed-in profile section', async () => {
    authMocks.user = {
      id: 'student-1',
      email: 'ada@example.com',
      user_metadata: { full_name: 'Ada Lovelace' },
    } as unknown as User
    renderAuth()

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy()
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [new File(['image'], 'ada.png', { type: 'image/png' })] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))

    await vi.waitFor(() => expect(authMocks.updateProfile).toHaveBeenCalledWith({
      fullName: 'Ada Lovelace',
      avatarFile: expect.any(File),
    }))
  })

  it('rejects a non-image photo in the signed-in profile section', () => {
    authMocks.user = {
      id: 'student-1',
      email: 'ada@example.com',
      user_metadata: { full_name: 'Ada Lovelace' },
    } as unknown as User
    renderAuth()
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [new File(['not an image'], 'notes.txt', { type: 'text/plain' })] },
    })

    expect(screen.getByRole('alert').textContent).toMatch(/Choose an image file/i)
  })

  it('keeps the 2 MB profile-photo limit in the signed-in profile section', () => {
    authMocks.user = {
      id: 'student-1',
      email: 'ada@example.com',
      user_metadata: { full_name: 'Ada Lovelace' },
    } as unknown as User
    renderAuth()
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [new File([new Uint8Array((2 * 1024 * 1024) + 1)], 'large.png', { type: 'image/png' })] },
    })

    expect(screen.getByRole('alert').textContent).toMatch(/smaller than 2 MB/i)
  })
})
