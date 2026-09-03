// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StudentProfile } from '../types'
import { ProfileScreen } from './ProfileScreen'

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
      verification: 'verified',
    },
    status: 'ready',
    reload: vi.fn(),
  }),
}))

vi.mock('../scoring/phi', () => ({
  computeFit: () => ({ label: 'Strong fit', summary: 'A single fit summary', components: {}, version: 'test' }),
}))

vi.mock('../components/Trust', () => ({
  DataValue: () => <span>Data value</span>,
  ExpandableFit: () => <details><summary>4Prep fit</summary></details>,
  HonestGapCluster: () => <span>Published-data coverage</span>,
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

  it('shows one expandable fit and links Scholarships to the single aid caution after intake', () => {
    render(<ProfileScreen {...props} profile={{} as StudentProfile} />)

    expect(screen.getAllByText('4Prep fit')).toHaveLength(1)
    expect(screen.queryByText('Your fit isn’t calculated yet')).toBeNull()
    expect(screen.queryByText('Your route here')).toBeNull()
    expect(screen.getAllByText('Published aid is not your personal offer. Confirm eligibility and ask for an offer.')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'See the published-aid caution in Costs.' }).getAttribute('href')).toBe('#published-aid-caution')
  })
})
