import { describe, expect, it } from 'vitest'
import { isNotAvailableStatus } from './adminApi'

describe('admin authorization response handling', () => {
  it.each([401, 403])('maps HTTP %s to the same unavailable state', (status) => {
    expect(isNotAvailableStatus(status)).toBe(true)
  })

  it.each([undefined, 400, 404, 429, 500])('does not disguise HTTP %s as an authorization denial', (status) => {
    expect(isNotAvailableStatus(status)).toBe(false)
  })
})
