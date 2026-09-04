// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

afterEach(() => {
  cleanup()
})

describe('UniversityCard', () => {
  it('renders immediately without viewport-triggered reveal animation', () => {
    const { container } = render(<UniversityCard university={university} saved={false} onSave={() => undefined} onOpen={() => undefined} />)
    const card = container.querySelector('article')!

    expect(card.classList.contains('university-card-reveal')).toBe(false)
    expect(card.classList.contains('is-revealed')).toBe(false)
    expect(card.getAttribute('style')).toBeNull()
  })
})
