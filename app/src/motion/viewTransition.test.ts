import { describe, expect, it, vi } from 'vitest'
import { runViewTransition } from './viewTransition'

describe('runViewTransition', () => {
  it('updates instantly and skips the API under reduced motion', () => {
    const update = vi.fn()
    const startViewTransition = vi.fn()

    expect(runViewTransition(
      update,
      { startViewTransition } as unknown as Document,
      () => ({ matches: true }),
    )).toBe(false)
    expect(update).toHaveBeenCalledOnce()
    expect(startViewTransition).not.toHaveBeenCalled()
  })

  it('uses progressive enhancement only when supported and motion is allowed', () => {
    const update = vi.fn()
    const startViewTransition = vi.fn((callback: () => void) => callback())

    expect(runViewTransition(
      update,
      { startViewTransition } as unknown as Document,
      () => ({ matches: false }),
    )).toBe(true)
    expect(startViewTransition).toHaveBeenCalledOnce()
    expect(update).toHaveBeenCalledOnce()
  })
})
