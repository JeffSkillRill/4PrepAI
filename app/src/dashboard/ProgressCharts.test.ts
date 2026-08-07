import { describe, expect, it } from 'vitest'
import type { LearningModuleState } from '../learning/logic'
import type { LearningModule, LearningSubmission } from '../types'
import { deriveHomeworkChartData, deriveLearningModuleChartData, deriveRecordedLearningEvents } from './ProgressCharts'

function moduleState(
  number: number,
  status: LearningModuleState['status'],
  lessonIds: string[],
): LearningModuleState {
  const module: LearningModule = {
    id: `module-${number}`,
    trackId: 'track-1',
    moduleNumber: number,
    slug: `module-${number}`,
    title: `Module ${number}`,
    summary: 'Summary',
    order: number,
    lessons: lessonIds.map((id, index) => ({
      id,
      moduleId: `module-${number}`,
      slug: id,
      title: id,
      order: index,
      durationMinutes: null,
      body: null,
      status: 'published',
      transcript: null,
      mediaUrl: null,
      audioUrl: null,
    })),
    assignment: {
      id: `assignment-${number}`,
      moduleId: `module-${number}`,
      slug: `assignment-${number}`,
      title: 'Assignment',
      brief: 'Brief',
      submissionType: 'artifact',
      templateRef: 'template',
      rubric: null,
    },
  }
  return { module, status, unlocked: status !== 'locked', bypassed: false }
}

describe('dashboard chart derivation', () => {
  it('keeps locked modules distinct and counts only recorded lesson ids', () => {
    const chart = deriveLearningModuleChartData([
      moduleState(0, 'lessons_in_progress', ['lesson-1', 'lesson-2']),
      moduleState(1, 'locked', ['lesson-3']),
    ], new Set(['lesson-1', 'unknown-lesson']))

    expect(chart).toMatchObject([
      { number: 0, completedLessons: 1, totalLessons: 2, status: 'lessons_in_progress' },
      { number: 1, completedLessons: 0, totalLessons: 1, status: 'locked' },
    ])
  })

  it('derives submitted, awaiting, and feedback counts without synthetic states', () => {
    const submissions: LearningSubmission[] = [
      { id: 'draft', assignmentId: 'a', userId: 'u', status: 'pending', submittedAt: null, feedbackRef: null, files: [] },
      { id: 'waiting', assignmentId: 'b', userId: 'u', status: 'pending', submittedAt: '2026-08-07T01:00:00Z', feedbackRef: null, files: [] },
      { id: 'reviewed', assignmentId: 'c', userId: 'u', status: 'reviewed', submittedAt: '2026-08-07T02:00:00Z', feedbackRef: 'feedback-1', files: [] },
    ]

    expect(deriveHomeworkChartData(submissions)).toEqual({
      submitted: 2,
      awaitingFeedback: 1,
      feedbackReceived: 1,
    })
  })

  it('plots only recorded timestamps and sorts them without interpolation', () => {
    const events = deriveRecordedLearningEvents(
      [{ lessonId: 'lesson-1', completedAt: '2026-08-07T09:00:00Z' }],
      [{ id: 'submission-1', assignmentId: 'a', userId: 'u', status: 'pending', submittedAt: '2026-08-06T09:00:00Z', feedbackRef: null, files: [] }],
    )

    expect(events.map((event) => [event.label, event.occurredAt])).toEqual([
      ['Homework submitted', '2026-08-06T09:00:00Z'],
      ['Lesson completed', '2026-08-07T09:00:00Z'],
    ])
  })
})
