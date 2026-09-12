import { describe, expect, it } from 'vitest'
import type { Program } from '../types'
import { filterProgrammes, groupProgrammes } from './ProfileScreen'

const point = { status: 'unknown' as const, reason: 'Not published.', suggestedAction: 'Ask the university.' }
const programme = (id: string, name: string, degreeLevel: Program['degreeLevel'], subjectArea: Program['subjectArea']): Program => ({
  id, name, degree: degreeLevel, field: 'Computer Science', degreeLevel, subjectArea, duration: point, tuition: point,
})

describe('profile programme explorer', () => {
  const programmes = [
    programme('1', 'Computer Science', 'bachelor', 'Engineering and Technology'),
    programme('2', 'History', 'bachelor', 'Arts and Humanities'),
    programme('3', 'MBA', 'mba', 'Business and Management'),
  ]

  it('groups sourced programmes by normalized degree level and subject area', () => {
    const groups = groupProgrammes(programmes)
    expect(groups.map((group) => [group.level, group.programs.length])).toEqual([['bachelor', 2], ['mba', 1]])
    expect(groups[0].subjects.map((subject) => subject.subjectArea)).toEqual(['Engineering and Technology', 'Arts and Humanities'])
  })

  it('filters programme names case-insensitively without filling missing matches', () => {
    expect(filterProgrammes(programmes, 'science').map((program) => program.id)).toEqual(['1'])
    expect(filterProgrammes(programmes, 'unknown')).toEqual([])
  })
})
