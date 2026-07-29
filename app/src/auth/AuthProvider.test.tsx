// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from '../components/AppErrorBoundary'
import { AuthProvider } from './AuthProvider'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('AuthProvider startup configuration', () => {
  it('renders a designed configuration fallback when the Supabase environment is absent', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <AppErrorBoundary>
        <AuthProvider>
          <p>Application content</p>
        </AuthProvider>
      </AppErrorBoundary>,
    )

    expect(await screen.findByRole('heading', { name: 'The app isn’t configured yet' })).toBeTruthy()
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy()
    expect(screen.queryByText('Application content')).toBeNull()
    expect(document.body.textContent?.trim()).not.toBe('')
  })
})
