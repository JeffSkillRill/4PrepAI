// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DataPoint, FitDimension, StudentProfile } from '../types'
import { ProfileScreen } from './ProfileScreen'

// The profile now reads these values to decide whether a chart has enough
// published data to draw, so the fixture has to carry real data points rather
// than relying on every reader being mocked.
const unknownPoint: DataPoint<string> = { status: 'unknown', reason: 'Not published.', suggestedAction: 'Ask the university.' }
const pointFields = [
  'tuition', 'fees', 'roomBoard', 'totalCostOfAttendance', 'aidInternational', 'testPolicy',
  'financialCertification', 'livingCost', 'applicationFee', 'deadline', 'scholarship', 'language',
  'ielts', 'toefl', 'duolingo', 'sat', 'act', 'gpa', 'intake', 'internationalStudentPct',
  'livingAccommodation', 'livingFood', 'livingTransport', 'livingUtilities', 'employabilityRate',
  'employabilitySummary', 'facultyCount',
] as const
const points = Object.fromEntries(pointFields.map((field) => [field, unknownPoint]))

const fitComponent = (label: string, score: number, resolved: boolean) =>
  ({ label, score, grade: 'B', tone: 'medium' as const, reason: `${label} reason`, resolved })

vi.mock('../data/useRepositoryData', () => ({
  useRepositoryData: () => ({
    data: {
      id: 'harvard',
      name: 'Harvard University',
      city: 'Cambridge',
      country: 'United States',
      flag: 'US',
      tagline: 'Example profile',
      description: 'Example description',
      highlights: [],
      programs: [],
      rankings: [],
      campuses: [],
      scholarships: [],
      verification: 'verified',
      ...points,
    },
    status: 'ready',
    reload: vi.fn(),
  }),
}))

vi.mock('../scoring/phi', () => ({
  computeFit: () => ({
    label: 'Strong fit',
    summary: 'A single fit summary',
    overall: 74,
    grade: 'B',
    version: 'test',
    computedAt: '2026-01-01',
    components: {
      academic: fitComponent('Academic fit', 80, true),
      financial: fitComponent('Financial fit', 50, false),
      language: fitComponent('Language fit', 70, true),
      career: fitComponent('Career fit', 85, true),
      geographic: fitComponent('Geographic fit', 60, true),
    } satisfies Record<FitDimension, ReturnType<typeof fitComponent>>,
  }),
}))

vi.mock('../components/Trust', () => ({
  DataValue: () => <span>Data value</span>,
  ExpandableFit: () => <details><summary>4Prep fit</summary></details>,
  HonestGapCluster: () => <span>Published-data coverage</span>,
  AIResponseBlock: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SourceChip: () => <span>Source</span>,
  MissingValue: ({ title }: { title: string }) => <span>{title}</span>,
  SampleNotice: () => null,
}))

vi.mock('../components/CostSummary', () => ({
  CostSummary: () => <p id="published-aid-caution">Published aid is not your personal offer. Confirm eligibility and ask for an offer.</p>,
  PublishedNetCost: () => <span>Published net cost</span>,
}))

vi.mock('../components/UniversityVisual', () => ({ UniversityVisual: () => null }))

afterEach(cleanup)

const props = { universityId: 'harvard', saved: false, onToggleSave: vi.fn() }

describe('ProfileScreen fit and aid explanations', () => {
  it('shows one intake invitation before a profile exists', () => {
    render(<ProfileScreen {...props} profile={null} />)

    expect(screen.getAllByText('Your fit isn’t calculated yet')).toHaveLength(1)
    expect(screen.queryByText('Your route isn’t calculated yet')).toBeNull()
    expect(screen.queryByText('4Prep fit')).toBeNull()
  })

  it('shows one expandable fit and sourced-section empty states after intake', () => {
    render(<ProfileScreen {...props} profile={{} as StudentProfile} />)

    expect(screen.getAllByText('4Prep fit')).toHaveLength(1)
    expect(screen.queryByText('Your fit isn’t calculated yet')).toBeNull()
    expect(screen.queryByText('Your route here')).toBeNull()
    expect(screen.getAllByText('Coming soon').length).toBeGreaterThan(0)
    expect(screen.getByText('Rankings & ratings')).toBeTruthy()
  })
})
