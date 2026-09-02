// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { FitScore } from '../types'
import { ExpandableFit, FitBreakdown, SourceChip } from './Trust'

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

const fit: FitScore = {
  version: 'v1',
  overall: 82,
  grade: 'A',
  label: 'Strong fit',
  summary: 'Summary',
  computedAt: '2026-09-02T00:00:00.000Z',
  components: {
    academic: { label: 'Academic fit', score: 90, grade: 'A', tone: 'strong', reason: 'Your recorded academic information aligns with the published entry range.', resolved: true },
    financial: { label: 'Financial fit', score: 80, grade: 'B', tone: 'medium', reason: 'Published costs fit the budget you entered.', resolved: true },
    language: { label: 'Language fit', score: 70, grade: 'B', tone: 'medium', reason: 'A language pathway may still be needed.', resolved: true },
    career: { label: 'Career fit', score: 85, grade: 'A', tone: 'strong', reason: 'The program matches the field you entered.', resolved: true },
    geographic: { label: 'Geographic fit', score: 75, grade: 'B', tone: 'medium', reason: 'The destination matches your stated preference.', resolved: true },
  },
}

describe('SourceChip touch target', () => {
  it('keeps the compact visual inside a 44px-tall link target', () => {
    render(<SourceChip sourceId="source-1" />)

    expect(screen.getByRole('link').className).toContain('min-h-11')
  })
})

describe('fit disclosure', () => {
  it('keeps the collapsed fit qualitative and reveals the five reasons on request', () => {
    render(<ExpandableFit fit={fit} compact />)

    const summary = screen.getByText('4Prep fit').closest('summary')
    expect(summary?.textContent).toContain('Strong fit')
    expect(summary?.textContent).not.toContain('82')
    expect(summary?.textContent).not.toContain('A')

    fireEvent.click(summary!)
    expect(screen.getAllByText(fit.components.academic.reason)).toHaveLength(2)
    expect(screen.getByText('90/100')).toBeTruthy()
    expect(screen.getByText('Scoring model: v1. This is guidance, not an admission prediction.')).toBeTruthy()
  })

  it('keeps component values muted beside the reason-led breakdown and preserves its screen-reader table', () => {
    render(<FitBreakdown fit={fit} />)

    const score = screen.getByText('90/100')
    expect(score.className).toContain('text-muted')
    const visibleReason = screen.getAllByText(fit.components.academic.reason).find((element) => element.tagName === 'SPAN')
    expect(visibleReason?.className).toContain('text-muted')
    expect(screen.getByRole('table', { name: 'Five deterministic fit components with reasons' })).toBeTruthy()
  })
})
