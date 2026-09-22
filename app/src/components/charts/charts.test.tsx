// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { DataPoint, FitScore, Program, Ranking, University } from '../../types'
import { BudgetComposition } from './BudgetComposition'
import { EmployabilityGauge } from './EmployabilityGauge'
import { FitRadar, resolvedFitComponents } from './FitCharts'
import { LivingCostDonut } from './LivingCostDonut'
import { ProgrammeLevels } from './ProgrammeLevels'
import { RankingComparison } from './RankingComparison'
import { exactRankPosition, plottableAmounts, publishedPercentage } from './chartUtils'

const missing: DataPoint<string> = { status: 'unknown', reason: 'Not published.', suggestedAction: 'Ask the university.' }
const annual = (value: string, amount: number, currency = 'USD'): DataPoint<string> =>
  ({ status: 'known', value, sourceId: 'source-1', numericValue: amount, currency, period: 'year' })

const university = (overrides: Partial<University> = {}) => ({
  id: 'example',
  name: 'Example University',
  tuition: missing,
  fees: missing,
  roomBoard: missing,
  totalCostOfAttendance: missing,
  livingAccommodation: missing,
  livingFood: missing,
  livingTransport: missing,
  livingUtilities: missing,
  employabilityRate: missing,
  ...overrides,
} as University)

const fitComponent = (label: string, score: number, resolved: boolean) =>
  ({ label, score, grade: 'B', tone: 'medium' as const, reason: `${label} reason`, resolved })

const fit = (resolvedCount: number): FitScore => ({
  version: 'test',
  overall: 70,
  grade: 'B',
  label: 'Strong fit',
  summary: 'Summary',
  computedAt: '2026-01-01',
  components: {
    academic: fitComponent('Academic fit', 80, resolvedCount > 0),
    financial: fitComponent('Financial fit', 60, resolvedCount > 1),
    language: fitComponent('Language fit', 70, resolvedCount > 2),
    career: fitComponent('Career fit', 90, resolvedCount > 3),
    geographic: fitComponent('Geographic fit', 50, resolvedCount > 4),
  },
})

const programme = (id: string, degreeLevel: Program['degreeLevel']): Program => ({
  id,
  name: `Programme ${id}`,
  degree: degreeLevel,
  field: 'Computer Science',
  degreeLevel,
  subjectArea: 'Engineering and Technology',
  duration: missing,
  tuition: missing,
})

const ranking = (id: string, rankDisplay: string): Ranking =>
  ({ id, label: `Ranking ${id}`, rankDisplay, year: 2026, sourceId: 'source-1' })

afterEach(cleanup)

describe('chart guards on published values', () => {
  it('drops points without a sourced numeric annual value instead of zeroing them', () => {
    expect(plottableAmounts([
      { label: 'Food', point: missing },
      { label: 'Transport', point: annual('$2,000 a year', 2000) },
    ])).toEqual([{ label: 'Transport', amount: 2000, currency: 'USD', sourceId: 'source-1' }])
  })

  it('accepts only a point published as a percentage', () => {
    expect(publishedPercentage(missing)).toBeNull()
    expect(publishedPercentage(annual('91', 91))).toBeNull()
    expect(publishedPercentage({ status: 'known', value: '91%', sourceId: 'source-1', numericValue: 91, period: 'percentage' })).toEqual({ value: 91, sourceId: 'source-1' })
  })

  it('parses only an exact published league position', () => {
    expect(exactRankPosition('#3')).toBe(3)
    expect(exactRankPosition(' 12 ')).toBe(12)
    expect(exactRankPosition('Top 50')).toBeNull()
    expect(exactRankPosition('51-100')).toBeNull()
  })
})

describe('living cost donut', () => {
  it('falls back to a labelled gap when fewer than two components are published', () => {
    render(<LivingCostDonut university={university({ livingFood: annual('$4,000 a year', 4000) })} />)

    expect(screen.getByText('Living-cost breakdown not published')).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('refuses to place components from different currencies on one donut', () => {
    render(<LivingCostDonut university={university({
      livingFood: annual('$4,000 a year', 4000),
      livingTransport: annual('£900 a year', 900, 'GBP'),
    })} />)

    expect(screen.getByText('Living-cost components cannot share one chart')).toBeTruthy()
  })

  it('draws the donut once two components share a currency', () => {
    render(<LivingCostDonut university={university({
      livingFood: annual('$4,000 a year', 4000),
      livingTransport: annual('$1,000 a year', 1000),
    })} />)

    expect(screen.getByRole('img', { name: /Food: \$4,000, 80 percent/ })).toBeTruthy()
  })
})

describe('budget composition', () => {
  it('falls back to a labelled gap when no component has a numeric value', () => {
    render(<BudgetComposition university={university()} />)

    expect(screen.getByText('Budget composition not published')).toBeTruthy()
  })

  it('plots the published components and never invents the missing ones', () => {
    render(<BudgetComposition university={university({ tuition: annual('$30,000 a year', 30000) })} />)

    const chart = screen.getByRole('img')
    expect(chart.getAttribute('aria-label')).toContain('Tuition: $30,000')
    expect(chart.getAttribute('aria-label')).toContain('Not in the bar because no sourced numeric value is published: Mandatory fees, Room and board')
  })
})

describe('employability gauge', () => {
  it('falls back to a labelled gap when no numeric percentage is published', () => {
    render(<EmployabilityGauge university={university()} />)

    expect(screen.getByText('Employment rate not published as a figure')).toBeTruthy()
  })

  it('draws the dial on a published percentage', () => {
    render(<EmployabilityGauge university={university({
      employabilityRate: { status: 'known', value: '91%', sourceId: 'source-1', numericValue: 91, period: 'percentage' },
    })} />)

    expect(screen.getByRole('img', { name: 'Published employment rate: 91 percent of graduates.' })).toBeTruthy()
  })
})

describe('programme levels', () => {
  it('falls back to a labelled gap when no programme is sourced', () => {
    render(<ProgrammeLevels programs={[]} />)

    expect(screen.getByText('Coming soon')).toBeTruthy()
  })

  it('draws no bar for a level the catalogue has no programme at', () => {
    render(<ProgrammeLevels programs={[programme('1', 'bachelor'), programme('2', 'bachelor'), programme('3', 'mba')]} />)

    const chart = screen.getByRole('img')
    expect(chart.getAttribute('aria-label')).toContain('Bachelor: 2. MBA: 1')
    expect(chart.getAttribute('aria-label')).toContain('No sourced programme is published at these levels: Master, PhD')
  })
})

describe('ranking comparison', () => {
  it('falls back to a labelled gap when fewer than two exact positions are published', () => {
    render(<RankingComparison rankings={[ranking('1', '#4'), ranking('2', 'Top 50')]} />)

    expect(screen.getByText('Rankings cannot be compared visually')).toBeTruthy()
  })

  it('compares only the rankings published as an exact position', () => {
    render(<RankingComparison rankings={[ranking('1', '#4'), ranking('2', '#40'), ranking('3', 'Top 50')]} />)

    const chart = screen.getByRole('img')
    expect(chart.getAttribute('aria-label')).toContain('Ranking 1: position 4')
    expect(chart.getAttribute('aria-label')).toContain('Not plotted because they publish a band rather than a position: Ranking 3 Top 50')
  })
})

describe('fit radar', () => {
  it('is suppressed when fewer than three components are resolved', () => {
    const { container } = render(<FitRadar fit={fit(2)} />)

    expect(container.firstChild).toBeNull()
  })

  it('plots a vertex only for resolved components', () => {
    const { container } = render(<FitRadar fit={fit(4)} />)

    expect(resolvedFitComponents(fit(4))).toHaveLength(4)
    expect(container.querySelectorAll('circle')).toHaveLength(4)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Not plotted because they are unresolved: Geographic fit')
  })
})
