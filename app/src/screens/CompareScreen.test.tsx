// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { University } from '../types'
import { CompareScreen } from './CompareScreen'

const universities = ['Alpha University', 'Beta College', 'Gamma Institute', 'Delta University'].map((name, index) => ({
  id: `university-${index + 1}`,
  name,
  city: `City ${index + 1}`,
  country: 'United States',
  highlights: [],
})) as unknown as University[]

vi.mock('../data/useRepositoryData', () => ({
  useRepositoryData: () => ({ data: universities, status: 'ready', reload: vi.fn() }),
}))
vi.mock('../components/UniversityVisual', () => ({ UniversityVisual: () => null }))
vi.mock('../components/CostSummary', () => ({
  CostSummary: ({ university }: { university: University }) => <div>{university.name} cost summary</div>,
  PublishedNetCost: () => <span>Not computable</span>,
}))
vi.mock('../components/Trust', () => ({
  DataValue: () => <span>Unknown</span>,
  ExpandableFit: () => null,
  MissingValue: ({ title }: { title: string }) => <span>{title}</span>,
  SourceChip: () => null,
}))
vi.mock('../scoring/costs', () => ({
  bestPublishedCostScenario: () => null,
  hasComprehensiveInternationalFunding: () => false,
  hasFullNeedPolicy: () => false,
}))

afterEach(cleanup)

describe('CompareScreen university selection', () => {
  it('removes and adds universities without leaving the page', () => {
    render(<CompareScreen profile={null} saved={new Set()} />)

    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(6)
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove Beta College' })[0])
    expect(screen.queryAllByRole('button', { name: 'Remove Beta College' })).toHaveLength(0)

    const delta = screen.getByRole('button', { name: /Delta University/ })
    fireEvent.click(delta)
    expect(screen.getAllByRole('button', { name: 'Remove Delta University' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: /^Remove / })).toHaveLength(6)
  })

  it('allows rebuilding a comparison after every university is removed', () => {
    render(<CompareScreen profile={null} saved={new Set()} />)
    for (const name of ['Alpha University', 'Beta College', 'Gamma Institute']) {
      fireEvent.click(screen.getAllByRole('button', { name: `Remove ${name}` })[0])
    }
    expect(screen.getByRole('heading', { name: 'Add a university to begin' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Delta University/ }))
    expect(screen.getAllByRole('button', { name: 'Remove Delta University' })).toHaveLength(2)
  })
})
