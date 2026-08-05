// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NotAvailableScreen, SignInScreen } from './AccessScreens'

afterEach(cleanup)

describe('authorization screens', () => {
  it('renders the same plain unavailable state without navigation or data hints', () => {
    render(<NotAvailableScreen onSignOut={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Not available' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy()
    expect(document.querySelector('nav')).toBeNull()
    expect(document.body.textContent).not.toMatch(/cohort|homework|student|metrics/i)
  })

  it('offers sign in but no signup path', () => {
    render(<SignInScreen onSignIn={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Admin sign in' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /sign up/i })).toBeNull()
    expect(screen.getByText(/There is no admin signup\./)).toBeTruthy()
  })
})
