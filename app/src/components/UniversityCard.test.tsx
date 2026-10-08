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
  state: null,
  stateName: null,
  country: 'United States',
  tagline: 'An example university.',
  description: 'A source-backed description.',
  sourceId: 'source-1',
  rankings: [],
} as unknown as University

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

  it('shows an explicit unknown state and the unranked badge in list layout', () => {
    const { getByText } = render(<UniversityCard university={university} layout="list" saved={false} onSave={() => undefined} onOpen={() => undefined} />)

    expect(getByText('Example City, State unknown, United States')).toBeTruthy()
    expect(getByText('Not ranked by QS')).toBeTruthy()
  })

  it('shows the QS World rank with its edition when one is sourced', () => {
    const ranked = { ...university, rankings: [{ id: '1', label: 'QS World University Rankings', rankDisplay: '#45', rankSort: 45, year: 2027, sourceId: 'source-1' }] }
    const { getByText } = render(<UniversityCard university={ranked} layout="list" saved={false} onSave={() => undefined} onOpen={() => undefined} />)

    expect(getByText('QS 2027 · #45')).toBeTruthy()
  })
})
