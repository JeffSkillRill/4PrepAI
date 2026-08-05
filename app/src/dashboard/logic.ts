export {
  dashboardStages,
  deriveDashboardStage,
  hasRecordedFeedbackReference,
  type DashboardStage,
  type DashboardStageId,
  type DashboardStageSignals,
} from '../../../shared/dashboard-stage'

import type { DashboardStageSignals } from '../../../shared/dashboard-stage'

export type DashboardNextAction = 'complete_profile' | 'review_route' | 'continue_learning' | 'review_saved'

export function deriveDashboardNextAction(signals: DashboardStageSignals): DashboardNextAction {
  if (!signals.hasCompletedIntake) return 'complete_profile'
  if (signals.savedPlanCount === 0) return 'review_route'
  if (signals.submittedHomeworkCount === 0) return 'continue_learning'
  return 'review_saved'
}
