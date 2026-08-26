// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { University } from '../types'
import { CounselorComparison, UniversityPickerModal } from './UniversityComparison'

const universities = ['Alpha University', 'Beta College', 'Gamma Institute', 'Delta University'].map((name, index) => ({
  id: `university-${index + 1}`,
  name,
  city: `City ${index + 1}`,
  country: 'United States',
  highlights: [],
})) as unknown as University[]

vi.mock('../data/useRepositoryData', () => ({ useRepositoryData: () => ({ data: universities, status: 'ready', reload: vi.fn() }) }))
vi.mock('../components/CostSummary', () => ({ PublishedNetCost: () => <span>Not computable</span> }))
vi.mock('../components/Trust', () => ({ DataValue: () => <span>Unknown</span>, ExpandableFit: () => <span>Five-part fit disclosure</span>, MissingValue: ({ title }: { title: string }) => <span>{title}</span>, SourceChip: () => null }))
vi.mock('../scoring/costs', () => ({ bestPublishedCostScenario: () => null, hasComprehensiveInternationalFunding: () => false, hasFullNeedPolicy: () => false }))

afterEach(cleanup)

describe('UniversityPickerModal', () => {
  it('filters universities while retaining its three-university limit', () => {
    const onConfirm = vi.fn()
    render(<UniversityPickerModal saved={new Set()} onClose={() => undefined} onConfirm={onConfirm} />)

    expect(screen.getByText('3 of 3 selected')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Search universities'), { target: { value: 'delta' } })
    expect(screen.getByRole('button', { name: /Delta University/ })).toBeTruthy()
    expect(screen.getByText('Three selected — remove one before adding another.')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Search universities'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Remove Alpha University from selection' }))
    fireEvent.click(screen.getByRole('button', { name: /Delta University/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Add comparison to chat' }))

    expect(onConfirm).toHaveBeenCalledWith(['university-2', 'university-3', 'university-4'])
  })

  it('labels an empty search result', () => {
    render(<UniversityPickerModal saved={new Set()} onClose={() => undefined} onConfirm={() => undefined} />)
    fireEvent.change(screen.getByLabelText('Search universities'), { target: { value: 'nowhere' } })
    expect(screen.getByText('No universities match that search.')).toBeTruthy()
  })
})

describe('CounselorComparison', () => {
  it('derives the displayed comparison from the selected university IDs', () => {
    const { container } = render(<CounselorComparison universityIds={['university-1', 'university-4']} profile={null} saved={new Set()} onRemoveUniversity={() => undefined} />)

    expect(screen.getByRole('heading', { name: 'See the trade-offs clearly' })).toBeTruthy()
    expect(screen.getByText('Aid-adjusted cost comparison')).toBeTruthy()
    expect(screen.getByText('Mandatory fees')).toBeTruthy()
    expect(screen.getByTestId('comparison-university-header').parentElement?.className).toContain('sticky')
    expect(screen.getByTestId('comparison-university-header').className).toContain('sm:grid-cols-2')
    expect(screen.getByTestId('comparison-university-header').className).not.toContain('lg:grid-cols-3')
    expect(screen.getAllByText('Your fit isn’t calculated yet').length).toBeGreaterThan(0)
    expect(container.querySelector('table')).toBeNull()
    expect(screen.queryByRole('table')).toBeNull()
  })
})
