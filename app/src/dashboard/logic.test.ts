import { describe, expect, it } from 'vitest'
import {
  dashboardStages,
  deriveDashboardNextAction,
  deriveDashboardStage,
  hasRecordedFeedbackReference,
  type DashboardStageId,
  type DashboardStageSignals,
} from './logic'

describe('dashboard state derivation', () => {
  const booleanValues = [false, true] as const
  const countValues = [0, 1] as const

  const expectedStage = (signals: DashboardStageSignals): DashboardStageId => {
    if (signals.feedbackReceivedCount > 0) return 'feedback_received'
    if (signals.submittedHomeworkCount > 0) return 'homework_submitted'
    if (signals.completedLessonCount > 0) return 'learning'
    if (signals.hasCompletedIntake || signals.savedPlanCount > 0) return 'planning'
    return 'not_started'
  }

  const everyBinarySignalCombination: DashboardStageSignals[] = []
  for (const hasCompletedIntake of booleanValues) {
    for (const savedPlanCount of countValues) {
      for (const completedLessonCount of countValues) {
        for (const submittedHomeworkCount of countValues) {
          for (const feedbackReceivedCount of countValues) {
            everyBinarySignalCombination.push({
              hasCompletedIntake,
              savedPlanCount,
              completedLessonCount,
              submittedHomeworkCount,
              feedbackReceivedCount,
            })
          }
        }
      }
    }
  }

  it.each(everyBinarySignalCombination)(
    'uses recorded-action precedence for %#: %o',
    (signals) => {
      const stage = deriveDashboardStage(signals)

      expect(stage).toEqual(dashboardStages[expectedStage(signals)])
      expect(JSON.parse(JSON.stringify(stage))).toEqual(stage)
    },
  )

  it('ignores invalid or non-positive counts instead of inventing activity', () => {
    expect(deriveDashboardStage({
      hasCompletedIntake: false,
      savedPlanCount: -1,
      completedLessonCount: Number.NaN,
      submittedHomeworkCount: Number.NEGATIVE_INFINITY,
      feedbackReceivedCount: 0,
    })).toEqual(dashboardStages.not_started)
  })

  it.each([
    {
      signals: {
        hasCompletedIntake: false,
        savedPlanCount: 0,
        completedLessonCount: 0,
        submittedHomeworkCount: 0,
        feedbackReceivedCount: 0,
      },
      action: 'complete_profile',
    },
    {
      signals: {
        hasCompletedIntake: true,
        savedPlanCount: 0,
        completedLessonCount: 0,
        submittedHomeworkCount: 0,
        feedbackReceivedCount: 0,
      },
      action: 'review_route',
    },
    {
      signals: {
        hasCompletedIntake: true,
        savedPlanCount: 1,
        completedLessonCount: 0,
        submittedHomeworkCount: 0,
        feedbackReceivedCount: 0,
      },
      action: 'continue_learning',
    },
    {
      signals: {
        hasCompletedIntake: true,
        savedPlanCount: 1,
        completedLessonCount: 1,
        submittedHomeworkCount: 1,
        feedbackReceivedCount: 0,
      },
      action: 'review_saved',
    },
  ] as const)('derives $action from its first unmet recorded action', ({ signals, action }) => {
    expect(deriveDashboardNextAction(signals)).toBe(action)
  })

  it('keeps feedback as a real stage signal before the feedback UI ships', () => {
    expect(deriveDashboardStage({
      hasCompletedIntake: false,
      savedPlanCount: 0,
      completedLessonCount: 0,
      submittedHomeworkCount: 0,
      feedbackReceivedCount: 1,
    })).toEqual(dashboardStages.feedback_received)
  })

  it('requires a non-empty recorded feedback reference', () => {
    expect(hasRecordedFeedbackReference('feedback-1')).toBe(true)
    expect(hasRecordedFeedbackReference('   ')).toBe(false)
    expect(hasRecordedFeedbackReference(null)).toBe(false)
  })
})
