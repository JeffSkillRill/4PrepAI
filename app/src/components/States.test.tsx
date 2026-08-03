// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DesignedState } from './States'

afterEach(cleanup)

describe('DesignedState semantics', () => {
  it('renders as a section with a secondary heading when nested in a screen', () => {
    const { container } = render(
      <main>
        <h1>Find your path abroad</h1>
        <DesignedState state="no_results" headingLevel={2} onReset={vi.fn()} />
      </main>,
    )

    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2, name: 'No exact matches yet' })).toBeTruthy()
  })
})
