// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DataPoint, University } from '../types'
import { CostSummary } from './CostSummary'

vi.mock('./Trust', () => ({
  DataValue: () => <span>Published value</span>,
  SourceChip: () => <span>Source</span>,
}))

const known = (value: string, numericValue: number): DataPoint<string> => ({
  status: 'known', value, numericValue, currency: 'USD', period: 'year', sourceId: 'source-1',
})
const unknown: DataPoint<string> = { status: 'unknown', reason: 'Not published', suggestedAction: 'Ask the university' }
const university = {
  id: 'university-1',
  name: 'Alpha University',
  tuition: known('$40,000', 40000),
  fees: unknown,
  roomBoard: known('$15,000', 15000),
  totalCostOfAttendance: known('$55,000', 55000),
  aidInternational: unknown,
  financialCertification: unknown,
  scholarships: [],
} as unknown as University

afterEach(cleanup)

describe('CostSummary chart density', () => {
  it('omits the full composition chart in compact university cards', () => {
    render(<CostSummary university={university} compact />)
    expect(screen.queryByText(/Published annual components/)).toBeNull()
  })

  it('keeps the composition chart in the full university profile', () => {
    render(<CostSummary university={university} />)
    expect(screen.getByText(/Published annual components/)).toBeTruthy()
  })

  it('opens compact cost components in a modal instead of expanding the card', () => {
    const { container } = render(<CostSummary university={university} compact />)
    const cardSection = container.querySelector('section')
    const trigger = screen.getByRole('button', { name: 'Cost components and visa funds' })

    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(trigger)

    expect(screen.getByRole('dialog', { name: 'Alpha University cost components and visa funds' }).className).toContain('cost-modal-dialog')
    expect(cardSection?.textContent).not.toContain('Mandatory fees')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})
