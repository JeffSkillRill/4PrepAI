import { describe, expect, it } from 'vitest'
import type { Program } from '../types'
import { filterProgrammes, groupProgrammes } from './ProfileScreen'

const point = { status: 'unknown' as const, reason: 'Not published.', suggestedAction: 'Ask the university.' }
/** degreeLevel is College Scorecard's numeric credential level; degree is its own wording. */
const programme = (id: string, name: string, degreeLevel: number, degree: string, subjectArea: string): Program => ({
  id, name, degree, field: 'Computer Science', degreeLevel, subjectArea, graduates: point, medianEarnings: point, nationalMedianEarnings: point, medianDebt: point, medianMonthlyPayment: point,
})

describe('profile programme explorer', () => {
  const programmes = [
    programme('1', 'Computer Science', 3, "Bachelor's Degree", 'Engineering'),
    programme('2', 'History', 3, "Bachelor's Degree", 'History'),
    programme('3', 'Business Administration', 5, "Master's Degree", 'Business, Management, Marketing, and Related Support Services'),
  ]

  it('groups sourced programmes by credential level and CIP family', () => {
    const groups = groupProgrammes(programmes)
    expect(groups.map((group) => [group.level, group.programs.length])).toEqual([[3, 2], [5, 1]])
    expect(groups.map((group) => group.label)).toEqual(["Bachelor's Degree", "Master's Degree"])
    expect(groups[0].subjects.map((subject) => subject.subjectArea)).toEqual(['Engineering', 'History'])
  })

  it('filters programme names case-insensitively without filling missing matches', () => {
    expect(filterProgrammes(programmes, 'science').map((program) => program.id)).toEqual(['1'])
    expect(filterProgrammes(programmes, 'unknown')).toEqual([])
  })
})
