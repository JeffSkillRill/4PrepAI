export type DashboardStage = 'empty' | 'partial' | 'active'

export type DashboardSignals = {
  hasProfile: boolean
  savedCount: number
  completedLessonCount: number
  submissionCount: number
}

export type DashboardNextAction = 'complete_profile' | 'review_route' | 'continue_learning' | 'review_saved'

export function deriveDashboardStage(signals: DashboardSignals): DashboardStage {
  const hasAnyActivity = signals.hasProfile
    || signals.savedCount > 0
    || signals.completedLessonCount > 0
    || signals.submissionCount > 0
  if (!hasAnyActivity) return 'empty'

  const hasPlanningActivity = signals.hasProfile && signals.savedCount > 0
  const hasLearningActivity = signals.completedLessonCount > 0 || signals.submissionCount > 0
  return hasPlanningActivity && hasLearningActivity ? 'active' : 'partial'
}

export function deriveDashboardNextAction(signals: DashboardSignals): DashboardNextAction {
  if (!signals.hasProfile) return 'complete_profile'
  if (signals.savedCount === 0) return 'review_route'
  if (signals.submissionCount === 0) return 'continue_learning'
  return 'review_saved'
}
