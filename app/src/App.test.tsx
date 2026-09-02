// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'
import { afterEach, describe, expect, it, vi } from 'vitest'

const authState = vi.hoisted(() => ({ user: null as User | null }))

vi.mock('./auth/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./auth/AuthProvider')>()
  return { ...actual, useAuth: () => ({ user: authState.user }) }
})

import { Navbar } from './App'

afterEach(() => {
  authState.user = null
  cleanup()
})

describe('Navbar identity and plan state', () => {
  it('keeps the signed-out account link and plan entry point', () => {
    render(<Navbar view="search" onNavigate={vi.fn()} hasPlan={false} />)

    const navigation = within(screen.getByRole('navigation', { name: 'Primary navigation' }))
    expect(navigation.getByRole('link', { name: 'University List' })).toBeTruthy()
    expect(navigation.getByRole('link', { name: 'Admission' })).toBeTruthy()
    expect(navigation.queryByRole('link', { name: 'Tools' })).toBeNull()
    expect(navigation.queryByRole('link', { name: 'Saved' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Build my plan' })).toBeTruthy()
  })

  it('shows a signed-in user photo and name, and opens the completed plan from the header', () => {
    authState.user = {
      id: 'student-1',
      email: 'ada@example.com',
      user_metadata: { full_name: 'Ada Lovelace', avatar_url: 'https://cdn.example/avatar.jpg' },
    } as unknown as User
    const onNavigate = vi.fn()
    render(<Navbar view="search" onNavigate={onNavigate} hasPlan />)

    expect(screen.getByRole('img', { name: 'Your profile photo' }).getAttribute('src')).toBe('https://cdn.example/avatar.jpg')
    expect(screen.getByText('Ada Lovelace')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'View my plan' }))
    expect(onNavigate).toHaveBeenCalledWith('dashboard')
  })

  it('uses initials when a signed-in user has not added a photo', () => {
    authState.user = {
      id: 'student-1',
      email: 'ada@example.com',
      user_metadata: { full_name: 'Ada Lovelace' },
    } as unknown as User
    render(<Navbar view="search" onNavigate={vi.fn()} hasPlan={false} />)

    expect(screen.getByText('AL')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ada Lovelace' })).toBeTruthy()
  })
})
