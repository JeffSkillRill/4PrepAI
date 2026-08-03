// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SearchScreen } from './SearchScreen'

vi.mock('../data/useRepositoryData', () => ({
  useRepositoryData: () => ({ data: [], status: 'ready', reload: vi.fn() }),
}))

afterEach(cleanup)

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
})
