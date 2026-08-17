// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StudentProfile, University } from '../types'
import { known, unknown } from '../types'
import { ScholarshipScreen } from './ScholarshipScreen'

const alabamaConditions = [
  { kind: 'sat' as const, minimum: 1420, publishedText: 'SAT 1420 begins the published $28,000 merit tier with GPA 3.5', sourceId: 'src' },
  { kind: 'act' as const, minimum: 32, publishedText: 'ACT 32 begins the published $28,000 merit tier with GPA 3.5', sourceId: 'src' },
  { kind: 'gpa' as const, minimum: 3.5, publishedText: 'SAT 1420 begins the published $28,000 merit tier with GPA 3.5', sourceId: 'src' },
]

const universities = [
  {
    id: 'alabama',
    name: 'University of Alabama',
    scholarships: [{
      id: 'alabama-automatic',
      name: 'Alabama Automatic Merit Scholarship',
      amount: known('Up to $28,000 / year', 'src', { numericValue: 28000, currency: 'USD' }),
      conditions: alabamaConditions,
    }],
  },
  {
    id: 'yale',
    name: 'Yale University',
    scholarships: [{
      id: 'yale-need-aid',
      name: 'Yale need-based grant aid',
      amount: unknown('The award is individualized from demonstrated need, so Yale publishes no single amount.', 'Ask financial aid.'),
      conditions: [],
    }],
  },
] as unknown as University[]

vi.mock('../data/useRepositoryData', () => ({
  useRepositoryData: () => ({ data: universities, status: 'ready', reload: vi.fn() }),
}))
vi.mock('../components/Trust', () => ({ SourceChip: () => null }))
vi.mock('../components/AskACounselor', () => ({ AskACounselor: () => <span>Ask a counsellor</span> }))

function profile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    country: 'United States',
    field: 'Computer Science',
    academicScore: 80,
    budgetMax: 12000,
    budgetCurrency: 'USD',
    languageTest: 'ielts',
    languageScore: 6.5,
    admissionTest: null,
    admissionTestScore: null,
    gpa: null,
    needsLanguagePathway: false,
    intake: 'Fall 2027',
    ...overrides,
  }
}

afterEach(cleanup)

describe('ScholarshipScreen', () => {
  it('shows the real sourced amount and the published reason where there is none', () => {
    render(<ScholarshipScreen profile={profile()} saved={new Set()} onNavigate={vi.fn()} />)
    expect(screen.getByText('Up to $28,000 / year')).toBeTruthy()
    expect(screen.getByText(/individualized from demonstrated need/i)).toBeTruthy()
  })

  // The failure this tool could most easily produce.
  it('does not call an award reachable when only the score half is met', () => {
    render(
      <ScholarshipScreen
        profile={profile({ admissionTest: 'sat', admissionTestScore: 1500, gpa: 2.9 })}
        saved={new Set()}
        onNavigate={vi.fn()}
      />,
    )
    expect(screen.getByText('Part way there')).toBeTruthy()
    expect(screen.queryByText('You meet what is published')).toBeNull()
    expect(screen.getByText(/still short on gpa by 0.6/i)).toBeTruthy()
  })

  it('calls an award reachable only when every condition is met', () => {
    render(
      <ScholarshipScreen
        profile={profile({ admissionTest: 'sat', admissionTestScore: 1500, gpa: 3.9 })}
        saved={new Set()}
        onNavigate={vi.fn()}
      />,
    )
    expect(screen.getByText('You meet what is published')).toBeTruthy()
    expect(screen.getByText(/not an offer of the award/i)).toBeTruthy()
  })

  it('says an award with no published criteria cannot be assessed', () => {
    render(<ScholarshipScreen profile={profile()} saved={new Set()} onNavigate={vi.fn()} />)
    expect(screen.getByText('No criteria published')).toBeTruthy()
    expect(screen.getByText(/cannot be assessed from published information/i)).toBeTruthy()
  })

  it('shows the real awards to an anonymous visitor with no account', () => {
    render(<ScholarshipScreen profile={null} saved={new Set()} onNavigate={vi.fn()} />)
    expect(screen.getByText('Up to $28,000 / year')).toBeTruthy()
    expect(screen.getByText(/no account needed/i)).toBeTruthy()
    expect(screen.getByText(/add a score above/i)).toBeTruthy()
  })

  // The second way in: scores typed on the page, no sign-up, real verdicts.
  it('checks conditions from scores typed by an anonymous visitor', () => {
    render(<ScholarshipScreen profile={null} saved={new Set()} onNavigate={vi.fn()} />)

    fireEvent.click(screen.getByRole('radio', { name: 'SAT' }))
    fireEvent.change(screen.getByLabelText('Your SAT score'), { target: { value: '1500' } })
    fireEvent.change(screen.getByLabelText('Your GPA'), { target: { value: '2.9' } })

    // Score met, GPA missed: the compound rule must hold on this path too.
    expect(screen.getByText('Part way there')).toBeTruthy()
    expect(screen.queryByText('You meet what is published')).toBeNull()

    fireEvent.change(screen.getByLabelText('Your GPA'), { target: { value: '3.9' } })
    expect(screen.getByText('You meet what is published')).toBeTruthy()
  })

  it('refuses an out-of-range score typed by a visitor', () => {
    render(<ScholarshipScreen profile={null} saved={new Set()} onNavigate={vi.fn()} />)
    fireEvent.click(screen.getByRole('radio', { name: 'ACT' }))
    fireEvent.change(screen.getByLabelText('Your ACT score'), { target: { value: '99' } })
    expect(screen.getByRole('alert').textContent).toContain('ACT scores run from 1 to 36')
    expect(screen.queryByText('You meet what is published')).toBeNull()
  })

  it('starts a signed-in student from their saved plan scores', () => {
    render(
      <ScholarshipScreen
        profile={profile({ admissionTest: 'sat', admissionTestScore: 1500, gpa: 3.9 })}
        saved={new Set()}
        onNavigate={vi.fn()}
      />,
    )
    expect((screen.getByLabelText('Your SAT score') as HTMLInputElement).value).toBe('1500')
    expect((screen.getByLabelText('Your GPA') as HTMLInputElement).value).toBe('3.9')
    expect(screen.getByText('You meet what is published')).toBeTruthy()
  })

  it('warns a signed-in student that changed scores are not saved', () => {
    render(
      <ScholarshipScreen
        profile={profile({ admissionTest: 'sat', admissionTestScore: 1500, gpa: 3.9 })}
        saved={new Set()}
        onNavigate={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('Your GPA'), { target: { value: '2.0' } })
    expect(screen.getByText(/nothing here is saved until you update it/i)).toBeTruthy()
  })
})
