import { describe, expect, it } from 'vitest'
import type { LearningModule, LearningSubmission } from '../types'
import {
  deriveLearningModuleStates,
  MAX_SUBMISSION_FILE_BYTES,
  validateLearningSubmissionFile,
} from './logic'

function moduleFixture(order: number): LearningModule {
  const suffix = String(order)
  return {
    id: `module-${suffix}`,
    trackId: 'track-1',
    moduleNumber: order,
    slug: `module-${suffix}`,
    title: `Module ${suffix}`,
    summary: 'Summary',
    order,
    lessons: [{
      id: `lesson-${suffix}`,
      moduleId: `module-${suffix}`,
      slug: `lesson-${suffix}`,
      title: `Lesson ${suffix}`,
      order: 0,
      durationMinutes: null,
      body: null,
      status: 'draft',
      transcript: null,
      mediaUrl: null,
      audioUrl: null,
    }],
    assignment: {
      id: `assignment-${suffix}`,
      moduleId: `module-${suffix}`,
      slug: `assignment-${suffix}`,
      title: `Assignment ${suffix}`,
      brief: 'Brief',
      submissionType: 'artifact',
      templateRef: `/learning-templates/module-${suffix}.docx`,
      rubric: null,
    },
  }
}

function submissionFixture(assignmentId: string): LearningSubmission {
  return {
    id: `submission-${assignmentId}`,
    assignmentId,
    userId: 'user-1',
    status: 'pending',
    submittedAt: '2026-07-31T10:00:00.000Z',
    feedbackRef: null,
    files: [],
  }
}

describe('learning module unlock logic', () => {
  it('unlocks modules in sequence when the previous assignment has a submission time', () => {
    const modules = [moduleFixture(0), moduleFixture(1), moduleFixture(2)]
    const states = deriveLearningModuleStates(
      modules,
      [submissionFixture('assignment-0')],
      new Set(),
    )

    expect(states.map((state) => state.status)).toEqual([
      'homework_submitted',
      'available',
      'locked',
    ])
  })

  it('marks lesson progress and supports an explicit jump-ahead escape hatch', () => {
    const modules = [moduleFixture(0), moduleFixture(1), moduleFixture(2)]
    const states = deriveLearningModuleStates(
      modules,
      [],
      new Set(['lesson-2']),
      new Set(['module-2']),
    )

    expect(states[1]).toMatchObject({ status: 'locked', unlocked: false })
    expect(states[2]).toMatchObject({
      status: 'lessons_in_progress',
      unlocked: true,
      bypassed: true,
    })
  })
})

describe('learning submission file validation', () => {
  it('accepts an allowed type at the storage size cap', () => {
    expect(validateLearningSubmissionFile({
      name: 'work.pdf',
      size: MAX_SUBMISSION_FILE_BYTES,
      type: 'application/pdf',
    })).toBeNull()
  })

  it('rejects a file above the storage size cap', () => {
    expect(validateLearningSubmissionFile({
      name: 'work.pdf',
      size: MAX_SUBMISSION_FILE_BYTES + 1,
      type: 'application/pdf',
    })).toContain('larger than the 10 MB limit')
  })

  it('rejects disallowed types and mismatched extensions', () => {
    expect(validateLearningSubmissionFile({
      name: 'work.txt',
      size: 10,
      type: 'text/plain',
    })).toContain('Choose one of these file types')
    expect(validateLearningSubmissionFile({
      name: 'work.png',
      size: 10,
      type: 'application/pdf',
    })).toContain('does not match')
  })
})
