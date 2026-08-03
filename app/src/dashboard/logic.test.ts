import { describe, expect, it } from 'vitest'
import { deriveDashboardNextAction, deriveDashboardStage } from './logic'

describe('dashboard state derivation', () => {
  it('treats no recorded actions as the primary empty state', () => {
    const signals = {
      hasProfile: false,
      savedCount: 0,
      completedLessonCount: 0,
      submissionCount: 0,
    }

    expect(deriveDashboardStage(signals)).toBe('empty')
    expect(deriveDashboardNextAction(signals)).toBe('complete_profile')
  })

  it('keeps a profile without saved plans in the partial state', () => {
    const signals = {
      hasProfile: true,
      savedCount: 0,
      completedLessonCount: 0,
      submissionCount: 0,
    }

    expect(deriveDashboardStage(signals)).toBe('partial')
    expect(deriveDashboardNextAction(signals)).toBe('review_route')
  })

  it('uses only real planning and learning actions for the active state', () => {
    const signals = {
      hasProfile: true,
      savedCount: 2,
      completedLessonCount: 1,
      submissionCount: 1,
    }

    expect(deriveDashboardStage(signals)).toBe('active')
    expect(deriveDashboardNextAction(signals)).toBe('review_saved')
  })
})
