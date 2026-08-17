// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { StudentProfile, University } from '../types'
import { known, unknown } from '../types'
import { SkillGapScreen } from './SkillGapScreen'

function stub(name: string, overrides: Partial<University>): University {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    city: 'City',
    country: 'United States',
    highlights: [],
    ielts: unknown('Not published.', 'Ask admissions.'),
    toefl: unknown('Not published.', 'Ask admissions.'),
    duolingo: unknown('Not published.', 'Ask admissions.'),
    sat: unknown('Not published.', 'Ask admissions.'),
    act: unknown('Not published.', 'Ask admissions.'),
    gpa: unknown('Not published.', 'Ask admissions.'),
    ...overrides,
  } as unknown as University
}

const universities: University[] = [
  stub('Alabama University', {
    ielts: known('Minimum IELTS 6.0', 'src-a', { numericValue: 6, benchmark: 'admission_minimum' }),
  }),
  stub('Yale University', {
    ielts: known('Most competitive applicants typically have IELTS 7; this is not stated as a minimum', 'src-y', {
      numericValue: 7,
      benchmark: 'indicative',
    }),
  }),
]

vi.mock('../data/useRepositoryData', () => ({
  useRepositoryData: () => ({ data: universities, status: 'ready', reload: vi.fn() }),
}))
vi.mock('../components/Trust', () => ({ SourceChip: () => null }))
vi.mock('../components/AskACounselor', () => ({ AskACounselor: () => <span>Ask a counsellor</span> }))

const profile: StudentProfile = {
  country: 'United States',
  field: 'Computer Science',
  academicScore: 80,
  budgetMax: 25000,
  budgetCurrency: 'USD',
  languageTest: 'ielts',
  languageScore: 6.5,
  admissionTest: null,
  admissionTestScore: null,
  gpa: null,
  needsLanguagePathway: false,
  intake: 'Autumn 2027',
}

afterEach(cleanup)

describe('SkillGapScreen', () => {
  it('asks for the intake before showing any comparison', () => {
    render(<SkillGapScreen profile={null} saved={new Set()} onNavigate={vi.fn()} />)
    expect(screen.getByText('Add your scores first')).toBeTruthy()
    expect(screen.queryByText(/gap. to close/i)).toBeNull()
  })

  it('shows a met minimum and never fails the student against a non-cutoff figure', () => {
    render(<SkillGapScreen profile={profile} saved={new Set()} onNavigate={vi.fn()} />)

    // 6.5 clears Alabama's published 6.0 minimum.
    expect(screen.getByText(/your 6.5 meets the published minimum of 6/i)).toBeTruthy()

    // 6.5 is below Yale's published 7, but Yale sets no minimum. The student
    // must not be told she falls short, and no shortfall badge may appear.
    expect(screen.getByText(/being under it does not mean you fall short/i)).toBeTruthy()
    expect(screen.queryByText(/needed$/)).toBeNull()
    expect(screen.queryByText(/below the published minimum of 7/i)).toBeNull()
  })

  it('states plainly that meeting a minimum is not an admission decision', () => {
    render(<SkillGapScreen profile={profile} saved={new Set()} onNavigate={vi.fn()} />)
    expect(screen.getByText(/meeting a published minimum is not an admission decision/i)).toBeTruthy()
  })

  it('reports only the English test the student sat, not all three', () => {
    render(<SkillGapScreen profile={profile} saved={new Set()} onNavigate={vi.fn()} />)
    expect(screen.getByText(/comparing your ielts score/i)).toBeTruthy()
    expect(screen.queryByText(/TOEFL/)).toBeNull()
    expect(screen.queryByText(/Duolingo/)).toBeNull()
  })

  it('asks for a score instead of showing empty rows when the student holds none', () => {
    render(
      <SkillGapScreen
        profile={{ ...profile, languageTest: null, languageScore: null }}
        saved={new Set()}
        onNavigate={vi.fn()}
      />,
    )
    expect(screen.getByText('No scores on your plan yet')).toBeTruthy()
    expect(screen.queryByText('Alabama University')).toBeNull()
  })
})
