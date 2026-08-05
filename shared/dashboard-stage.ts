export type DashboardStageSignals = {
  hasCompletedIntake: boolean
  savedPlanCount: number
  completedLessonCount: number
  submittedHomeworkCount: number
  feedbackReceivedCount: number
}

export type DashboardStageId =
  | 'not_started'
  | 'planning'
  | 'learning'
  | 'homework_submitted'
  | 'feedback_received'

export type DashboardStage = {
  id: DashboardStageId
  label: string
  description: string
}

export const dashboardStages = {
  not_started: {
    id: 'not_started',
    label: 'Getting started',
    description: 'No intake, saved university, completed lesson, homework submission, or feedback has been recorded yet.',
  },
  planning: {
    id: 'planning',
    label: 'Building your plan',
    description: 'A completed intake or saved university is recorded. No completed lesson or homework submission is recorded yet.',
  },
  learning: {
    id: 'learning',
    label: 'Working through lessons',
    description: 'At least one completed lesson is recorded. No homework submission is recorded yet.',
  },
  homework_submitted: {
    id: 'homework_submitted',
    label: 'Homework submitted',
    description: 'At least one homework submission is recorded. No feedback has been recorded yet.',
  },
  feedback_received: {
    id: 'feedback_received',
    label: 'Feedback received',
    description: 'Feedback is recorded for at least one homework submission.',
  },
} as const satisfies Record<DashboardStageId, DashboardStage>

function hasRecordedCount(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function hasRecordedFeedbackReference(value: string | null | undefined): boolean {
  return Boolean(value?.trim())
}

/**
 * Reports the furthest product step supported by recorded actions only.
 * It does not infer readiness, grade work, or predict an admission outcome.
 */
export function deriveDashboardStage(signals: DashboardStageSignals): DashboardStage {
  if (hasRecordedCount(signals.feedbackReceivedCount)) {
    return dashboardStages.feedback_received
  }
  if (hasRecordedCount(signals.submittedHomeworkCount)) {
    return dashboardStages.homework_submitted
  }
  if (hasRecordedCount(signals.completedLessonCount)) {
    return dashboardStages.learning
  }
  if (signals.hasCompletedIntake || hasRecordedCount(signals.savedPlanCount)) {
    return dashboardStages.planning
  }
  return dashboardStages.not_started
}
