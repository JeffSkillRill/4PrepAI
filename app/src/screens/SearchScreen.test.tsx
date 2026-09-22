// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { University } from '../types'
import { budgetLimits, filterCatalogueUniversities, SearchScreen } from './SearchScreen'

const repositoryMocks = vi.hoisted(() => ({ data: [] as University[] }))

vi.mock('../data/useRepositoryData', () => ({
  useRepositoryData: () => ({ data: repositoryMocks.data, status: 'ready', reload: vi.fn() }),
}))
vi.mock('../components/UniversityCard', () => ({
  UniversityCard: ({ university, layout }: { university: University; layout?: string }) => <article data-layout={layout}>{university.name}</article>,
}))

afterEach(() => {
  repositoryMocks.data = []
  cleanup()
})

describe('SearchScreen result announcements', () => {
  it('keeps one landmark and heading while announcing the no-results recovery', () => {
    const { container } = render(
      <main>
        <SearchScreen
          query="no-match"
          setQuery={vi.fn()}
          saved={new Set()}
          onToggleSave={vi.fn()}
          onOpen={vi.fn()}
        />
      </main>,
    )

    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(screen.getByRole('status').textContent).toContain('No universities match')
    expect(screen.getByRole('heading', { level: 2, name: 'No exact matches yet' })).toBeTruthy()
  })

  it('renders search results as one list card per row', () => {
    repositoryMocks.data = [{
      id: 'alpha',
      name: 'Alpha University',
      city: 'Alpha City',
      country: 'United States',
      programs: [],
      scholarships: [],
      aidInternational: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' },
      totalCostOfAttendance: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' },
    } as unknown as University]

    render(
      <SearchScreen
        query=""
        setQuery={vi.fn()}
        saved={new Set()}
        onToggleSave={vi.fn()}
        onOpen={vi.fn()}
      />,
    )

    expect(screen.getByTestId('university-results').className).toBe('grid gap-6')
    expect(screen.getByText('Alpha University').getAttribute('data-layout')).toBe('list')
  })

  it('updates the university-name search as soon as the user types', () => {
    const setQuery = vi.fn()

    render(
      <SearchScreen
        query=""
        setQuery={setQuery}
        saved={new Set()}
        onToggleSave={vi.fn()}
        onOpen={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Search universities by name' }), {
      target: { value: 'a' },
    })

    expect(setQuery).toHaveBeenCalledWith('a')
  })

  it('shows the selected major as an active search chip', () => {
    render(
      <SearchScreen
        query=""
        setQuery={vi.fn()}
        saved={new Set()}
        onToggleSave={vi.fn()}
        onOpen={vi.fn()}
      />,
    )

    const fieldSelect = screen.getByRole('combobox', { name: 'Major' })
    expect(screen.queryByRole('button', { name: /Remove filter: Engineering/i })).toBeNull()
    expect(screen.queryByText('All countries')).toBeNull()
    expect(screen.getByRole('option', { name: 'Business & Management' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Engineering' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Data & Analytics' })).toBeTruthy()

    fireEvent.change(fieldSelect, { target: { value: 'Engineering' } })

    expect(screen.getByRole('button', { name: 'Remove filter: Engineering' })).toBeTruthy()
  })

  it('filters typed search text against university names', () => {
    repositoryMocks.data = [
      {
        id: 'alpha',
        name: 'Alpha University',
        city: 'Match City',
        country: 'United States',
        programs: [],
        scholarships: [],
        aidInternational: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' },
        totalCostOfAttendance: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' },
      },
      {
        id: 'beta',
        name: 'Beta College',
        city: 'Alpha City',
        country: 'United States',
        programs: [],
        scholarships: [],
        aidInternational: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' },
        totalCostOfAttendance: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' },
      },
    ] as unknown as University[]

    render(
      <SearchScreen
        query="alpha"
        setQuery={vi.fn()}
        saved={new Set()}
        onToggleSave={vi.fn()}
        onOpen={vi.fn()}
      />,
    )

    expect(screen.getByText('Alpha University')).toBeTruthy()
    expect(screen.queryByText('Beta College')).toBeNull()
  })

  it('keeps unknown-cost schools visible and defers both explanations behind disclosures', () => {
    repositoryMocks.data = [{
      id: 'unknown-cost',
      name: 'Unknown Cost University',
      city: 'Example City',
      country: 'United States',
      programs: [],
      scholarships: [],
      aidInternational: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' },
      totalCostOfAttendance: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' },
    } as unknown as University]

    render(
      <SearchScreen
        query=""
        setQuery={vi.fn()}
        saved={new Set()}
        onToggleSave={vi.fn()}
        onOpen={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText(/Annual budget ceiling/), { target: { value: '5000' } })
    expect(screen.getByText('Unknown Cost University')).toBeTruthy()

    const budgetSummary = screen.getByText('What does this budget mean?')
    const budgetDetails = budgetSummary.closest('details')
    expect(budgetDetails?.open).toBe(false)
    budgetSummary.focus()
    fireEvent.click(budgetSummary)
    expect(budgetDetails?.open).toBe(true)
    fireEvent.click(budgetSummary)
    expect(budgetDetails?.open).toBe(false)
    expect(document.activeElement).toBe(budgetSummary)

    const unknownSummary = screen.getByText(/1 school don’t publish a full numeric cost — Why\?/).closest('summary')
    const unknownDetails = unknownSummary?.closest('details')
    expect(unknownDetails?.open).toBe(false)
    unknownSummary?.focus()
    fireEvent.click(unknownSummary!)
    expect(unknownDetails?.open).toBe(true)
    expect(unknownDetails?.textContent).toContain('They stay in your results')
    fireEvent.click(unknownSummary!)
    expect(unknownDetails?.open).toBe(false)
    expect(document.activeElement).toBe(unknownSummary)
  })

  it('builds the state options only from known states in loaded data', () => {
    repositoryMocks.data = [
      { id: 'ny', name: 'New York University', state: 'NY', stateName: 'New York', programs: [], aidInternational: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' }, totalCostOfAttendance: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' } },
      { id: 'ca', name: 'California University', state: 'CA', stateName: 'California', programs: [], aidInternational: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' }, totalCostOfAttendance: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' } },
      { id: 'unknown', name: 'Unknown State University', state: null, stateName: null, programs: [], aidInternational: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' }, totalCostOfAttendance: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' } },
    ] as unknown as University[]

    render(
      <SearchScreen
        query=""
        setQuery={vi.fn()}
        saved={new Set()}
        onToggleSave={vi.fn()}
        onOpen={vi.fn()}
      />,
    )

    expect(screen.getByRole('checkbox', { name: 'California (CA)' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'New York (NY)' })).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: 'Texas (TX)' })).toBeNull()
  })
})

function filterUniversity({
  id,
  state,
  stateName,
  field,
  annualCost,
}: {
  id: string
  state: string | null
  stateName: string | null
  field: string
  annualCost: number
}): University {
  return {
    id,
    name: `${id} University`,
    state,
    stateName,
    programs: [{ field }],
    scholarships: [],
    aidInternational: { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask admissions' },
    totalCostOfAttendance: { status: 'known', value: `$${annualCost}`, sourceId: 'source', numericValue: annualCost, currency: 'USD', period: 'year' },
  } as unknown as University
}

describe('catalogue three-filter logic', () => {
  const universities = [
    filterUniversity({ id: 'ca-cs', state: 'CA', stateName: 'California', field: 'Computer Science', annualCost: 20_000 }),
    filterUniversity({ id: 'ny-cs', state: 'NY', stateName: 'New York', field: 'Computer Science', annualCost: 20_000 }),
    filterUniversity({ id: 'ca-engineering', state: 'CA', stateName: 'California', field: 'Engineering', annualCost: 20_000 }),
    filterUniversity({ id: 'ca-expensive-cs', state: 'CA', stateName: 'California', field: 'Computer Science', annualCost: 60_000 }),
    filterUniversity({ id: 'unknown-cs', state: null, stateName: null, field: 'Computer Science', annualCost: 20_000 }),
  ]

  it('keeps unknown-state universities when no state is selected', () => {
    const results = filterCatalogueUniversities(universities, {
      query: '',
      budget: budgetLimits.max,
      field: '',
      states: [],
    })

    expect(results.map((item) => item.university.id)).toContain('unknown-cs')
  })

  it('combines budget, state, and major with AND logic and excludes unknown states', () => {
    const results = filterCatalogueUniversities(universities, {
      query: '',
      budget: 30_000,
      field: 'Computer Science',
      states: ['CA'],
    })

    expect(results.map((item) => item.university.id)).toEqual(['ca-cs'])
  })
})
