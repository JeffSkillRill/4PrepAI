// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SourceChip } from './Trust'

vi.mock('../data/DataProvider', () => ({
  useSource: () => ({
    id: 'source-1',
    origin: 'Official university source',
    url: 'https://example.edu/facts',
    retrievedAt: '2026-08-03',
    verification: 'verified',
  }),
}))

afterEach(cleanup)

describe('SourceChip touch target', () => {
  it('keeps the compact visual inside a 44px-tall link target', () => {
    render(<SourceChip sourceId="source-1" />)

    expect(screen.getByRole('link').className).toContain('min-h-11')
  })
})
