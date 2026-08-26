// @vitest-environment jsdom

import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { University } from '../types'
import { UniversityCard } from './UniversityCard'

vi.mock('./Trust', () => ({ DataValue: () => null, ExpandableFit: () => null, MissingValue: () => null }))
vi.mock('./CostSummary', () => ({ CostSummary: () => null }))
vi.mock('./UniversityVisual', () => ({ UniversityVisual: () => null }))
vi.mock('./AppLink', () => ({ AppLink: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a> }))

const university = {
  id: 'example-university',
  name: 'Example University',
  city: 'Example City',
  country: 'United States',
  tagline: 'An example university.',
} as University

let observe: ReturnType<typeof vi.fn>
let callback: IntersectionObserverCallback

function motionPreference(reduced: boolean): typeof window.matchMedia {
  return vi.fn(() => ({ matches: reduced } as MediaQueryList)) as typeof window.matchMedia
}

beforeEach(() => {
  observe = vi.fn()
  window.matchMedia = motionPreference(false)
  vi.stubGlobal('IntersectionObserver', class {
    constructor(next: IntersectionObserverCallback) { callback = next }
    observe = observe
    disconnect = vi.fn()
    root = null
    rootMargin = ''
    thresholds = []
    takeRecords = () => []
    unobserve = vi.fn()
  })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('UniversityCard scroll reveal', () => {
  it('replays the reveal whenever the card re-enters the viewport', () => {
    const { container } = render(<UniversityCard university={university} saved={false} onSave={() => undefined} onOpen={() => undefined} />)
    const card = container.querySelector('article')!

    expect(card.classList.contains('is-revealed')).toBe(false)
    expect(observe).toHaveBeenCalledWith(card)
    act(() => callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(card.classList.contains('is-revealed')).toBe(true)
    act(() => callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(card.classList.contains('is-revealed')).toBe(false)
    act(() => callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(card.classList.contains('is-revealed')).toBe(true)
  })

  it('renders immediately when reduced motion is preferred', () => {
    window.matchMedia = motionPreference(true)
    const { container } = render(<UniversityCard university={university} saved={false} onSave={() => undefined} onOpen={() => undefined} />)

    expect(container.querySelector('article')?.classList.contains('is-revealed')).toBe(true)
    expect(observe).not.toHaveBeenCalled()
  })
})
