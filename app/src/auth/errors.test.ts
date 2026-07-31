import { describe, expect, it } from 'vitest'
import { mapAuthError } from './errors'

describe('mapAuthError', () => {
  it.each([
    [{ code: 'invalid_credentials' }, 'credentials', 'Email or password is incorrect.'],
    [{ message: 'Invalid login credentials' }, 'credentials', 'Email or password is incorrect.'],
    [{ code: 'email_not_confirmed' }, 'unconfirmed', 'Please confirm your email before signing in.'],
    [{ status: 429, message: 'Too many requests' }, 'rate_limit', 'Too many attempts. Wait a short time, then try again.'],
    [{ message: 'Failed to fetch' }, 'network', 'The connection failed. Check your internet and try again. Nothing was lost.'],
    [{ code: 'otp_expired' }, 'expired_link', 'This link is invalid or has expired. Request a new one.'],
  ])('maps a provider failure to safe copy', (reason, kind, message) => {
    expect(mapAuthError(reason, true)).toEqual({ kind, message })
  })

  it('uses the same neutral credential message for an unknown email and a wrong password', () => {
    const unknownEmail = mapAuthError({ message: 'Invalid login credentials' }, true)
    const wrongPassword = mapAuthError({ code: 'invalid_credentials' }, true)
    expect(unknownEmail).toEqual(wrongPassword)
  })

  it('does not expose an unmapped provider message', () => {
    expect(mapAuthError({ message: 'Database host internal detail' }, true)).toEqual({
      kind: 'generic',
      message: 'Sorry, something went wrong. Please try again.',
    })
  })

  it('prioritizes an offline browser state', () => {
    expect(mapAuthError({ code: 'invalid_credentials' }, false)).toEqual({
      kind: 'network',
      message: 'The connection failed. Check your internet and try again. Nothing was lost.',
    })
  })
})
