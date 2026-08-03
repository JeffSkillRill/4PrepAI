import { describe, expect, it, vi } from 'vitest'
import { REDUCED_MOTION_QUERY, shouldAnimateMotion } from './preference'

describe('shouldAnimateMotion', () => {
  it('disables JavaScript-selected motion when reduced motion is requested', () => {
    const matchMedia = vi.fn(() => ({ matches: true }))

    expect(shouldAnimateMotion(matchMedia)).toBe(false)
    expect(matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY)
  })

  it('allows motion when the user has not requested a reduction', () => {
    expect(shouldAnimateMotion(() => ({ matches: false }))).toBe(true)
  })

  it('fails closed during SSR where matchMedia is unavailable', () => {
    expect(shouldAnimateMotion(null)).toBe(false)
  })
})
