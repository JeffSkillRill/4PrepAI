// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { University } from '../types'
import { SearchScreen } from './SearchScreen'

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

    const fieldSelect = screen.getByRole('combobox', { name: 'Field of study' })
    expect(screen.queryByRole('button', { name: /Clear field of study filter/i })).toBeNull()
    expect(screen.queryByText('All countries')).toBeNull()
    expect(screen.getByRole('option', { name: 'Business & Management' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Engineering' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Data & Analytics' })).toBeTruthy()

    fireEvent.change(fieldSelect, { target: { value: 'Engineering' } })

    expect(screen.getByRole('button', { name: 'Clear field of study filter: Engineering' })).toBeTruthy()
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
})
