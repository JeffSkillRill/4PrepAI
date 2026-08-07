// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
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
})
