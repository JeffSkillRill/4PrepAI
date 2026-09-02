// @vitest-environment jsdom

import { createElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { LearningModuleState } from '../learning/logic'
import type { LearningModule, LearningSubmission } from '../types'
import {
  deriveHomeworkChartData,
  deriveLearningModuleChartData,
  deriveRecordedLearningEvents,
  HomeworkStatusChart,
  JourneyPositionChart,
  LearningProgressChart,
} from './ProgressCharts'

afterEach(cleanup)

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

  it('renders compact, labelled module states and a real lesson progress value', () => {
    render(createElement(LearningProgressChart, {
      states: [
        moduleState(0, 'lessons_in_progress', ['lesson-1', 'lesson-2']),
        moduleState(1, 'locked', ['lesson-3']),
      ],
      completedLessonIds: new Set(['lesson-1']),
    }))

    const progress = screen.getByRole('progressbar', { name: /1 of 3 published lessons complete/i })
    expect(progress.getAttribute('aria-valuenow')).toBe('1')
    expect(progress.getAttribute('aria-valuemax')).toBe('3')
    expect(screen.getByText('In progress')).toBeTruthy()
    expect(screen.getByText('Locked')).toBeTruthy()
    expect(screen.getByText('Continue Module 0: Module 0')).toBeTruthy()

    const modules = screen.getByRole('list', { name: 'Modules' })
    expect(modules.className).toContain('[grid-template-columns:repeat(auto-fill,minmax(4.25rem,1fr))]')
    expect(modules.className).not.toMatch(/grid-cols-|sm:grid-cols-|xl:grid-cols-/)
    expect(screen.getByText('Locked').className).not.toContain('truncate')
  })

  it('replaces three zero counters with one useful homework empty state', () => {
    render(createElement(HomeworkStatusChart, { submissions: [] }))

    expect(screen.getByText('No submitted homework yet')).toBeTruthy()
    expect(screen.queryByText('Waiting')).toBeNull()
    expect(screen.queryByText('Reviewed')).toBeNull()
  })

  it('uses a calm visible step caption while retaining the full no-score description for screen readers', () => {
    const { container } = render(createElement(JourneyPositionChart, { stageId: 'planning' }))

    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Current recorded journey position: Building your plan, step 2 of 5. This is not a score.')
    expect(screen.getByText('Step 2 of 5')).toBeTruthy()
    expect(screen.queryByText(/Position 2 of 5|not a score/i)).toBeNull()
    expect(container.querySelector('ol li:nth-child(2)')?.textContent).toBe('2')
    expect(screen.getByRole('table', { name: 'Five-stage journey' })).toBeTruthy()
  })

  // docs/DASHBOARD.md promises that *every* visualisation is a keyboard-focusable
  // region carrying an aria-label with actual values. Both of these charts lost
  // that when they were rewritten from SVG on 10 August; this pins it so the
  // claim and the code cannot drift apart silently again.
  it('keeps both dashboard charts reachable by keyboard with values in the label', () => {
    const { container: learning } = render(createElement(LearningProgressChart, {
      states: [moduleState(0, 'lessons_in_progress', ['lesson-1', 'lesson-2'])],
      completedLessonIds: new Set(['lesson-1']),
    }))
    const learningRegion = learning.querySelector('section')
    expect(learningRegion?.getAttribute('tabindex')).toBe('0')
    expect(learningRegion?.getAttribute('aria-label')).toMatch(/1 of 2 published lessons complete/i)

    cleanup()

    const populated: LearningSubmission[] = [
      { id: 'reviewed', assignmentId: 'c', userId: 'u', status: 'reviewed', submittedAt: '2026-08-07T02:00:00Z', feedbackRef: 'feedback-1', files: [] },
    ]
    // Both branches: the empty state and the populated one are separate returns.
    for (const submissions of [[] as LearningSubmission[], populated]) {
      const { container: homework } = render(
        createElement(HomeworkStatusChart, { submissions }),
      )
      const homeworkRegion = homework.querySelector('section')
      expect(homeworkRegion?.getAttribute('tabindex')).toBe('0')
      expect(homeworkRegion?.getAttribute('aria-label')).toMatch(/homework submissions recorded/i)
      cleanup()
    }
  })
})
