import { describe, expect, it } from 'vitest'
import { findStudents, formatBytes, goalFacts, prioritizeStudents } from './logic'
import type { AdminStudentSummary } from './types'

const baseStudent: AdminStudentSummary = {
  id: 'student-a',
  email: 'a@example.test',
  createdAt: '2026-08-01T00:00:00.000Z',
  lastSignInAt: null,
  lastActiveAt: null,
  stage: { id: 'planning', label: 'Building your plan', description: 'Profile recorded.' },
  homeworkWaiting: 0,
  goal: null,
}

describe('cohort roster logic', () => {
  it('puts homework waiting ahead of more recently active students', () => {
    const recent = {
      ...baseStudent,
      id: 'recent',
      lastActiveAt: '2026-08-03T10:00:00.000Z',
    }
    const waiting = {
      ...baseStudent,
      id: 'waiting',
      homeworkWaiting: 1,
      lastActiveAt: '2026-07-20T10:00:00.000Z',
    }

    expect(prioritizeStudents([recent, waiting]).map((student) => student.id))
      .toEqual(['waiting', 'recent'])
  })

  it('finds one student by email, id, stage, or goal text', () => {
    const student = {
      ...baseStudent,
      goal: {
        destination: 'United States',
        field: 'Computer Science',
        budget: 'USD 5,000',
        intakeTerm: 'Spring 2027',
      },
    }

    expect(findStudents([student], 'computer')).toHaveLength(1)
    expect(findStudents([student], 'missing')).toHaveLength(0)
  })
})

describe('honest display helpers', () => {
  it('keeps missing goal fields explicit', () => {
    expect(goalFacts({ destination: null, field: null, budget: null, intakeTerm: null }))
      .toEqual([
        ['Destination', 'Not recorded'],
        ['Field', 'Not recorded'],
        ['Budget', 'Not recorded'],
        ['Intake', 'Not recorded'],
      ])
  })

  it('formats bytes without turning an invalid value into zero', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
    expect(formatBytes(Number.NaN)).toBe('Size unavailable')
  })
})
