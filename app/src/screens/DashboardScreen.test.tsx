// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LearningUserState, StudentProfile } from '../types'
import { DashboardScreen } from './DashboardScreen'

const repositoryMocks = vi.hoisted(() => ({
  getLearningTrack: vi.fn(),
  getLearningUserState: vi.fn(),
  getRankedPathway: vi.fn(),
  listUniversities: vi.fn(),
}))

vi.mock('../data/repository', () => repositoryMocks)

const profile: StudentProfile = {
  country: 'United States',
  field: 'Computer Science',
  academicScore: 90,
  budgetMax: 5000,
  budgetCurrency: 'USD',
  languageTest: null,
  languageScore: null,
  admissionTest: null,
  admissionTestScore: null,
  gpa: null,
  needsLanguagePathway: false,
  intake: 'Spring 2027',
}

const noLearningActivity: LearningUserState = {
  completedLessonIds: new Set(),
  submissions: [],
}

beforeEach(() => {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true })
  repositoryMocks.getLearningTrack.mockReset().mockResolvedValue(null)
  repositoryMocks.getLearningUserState.mockReset().mockResolvedValue(noLearningActivity)
  repositoryMocks.getRankedPathway.mockReset().mockResolvedValue({
    profile,
    ranked: [],
    milestones: [],
  })
  repositoryMocks.listUniversities.mockReset().mockResolvedValue([])
})

afterEach(cleanup)

describe('DashboardScreen stage and goal', () => {
  it('shows the shared stage and all four intake-derived goal fields', async () => {
    const onNavigate = vi.fn()
    render(
      <DashboardScreen
        userId="student-1"
        profile={profile}
        saved={new Set()}
        onNavigate={onNavigate}
        onOpenUniversity={vi.fn()}
      />,
    )

    expect(await screen.findByRole('heading', { name: 'Building your plan' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Your study goal' })).toBeTruthy()
    expect(screen.getByText('United States')).toBeTruthy()
    expect(screen.getByText('Computer Science')).toBeTruthy()
    expect(screen.getByText('USD 5,000')).toBeTruthy()
    expect(screen.getByText('Spring 2027')).toBeTruthy()
    expect(screen.getByText('This is guidance based on recorded information, not an admission prediction.')).toBeTruthy()
    expect(screen.queryByText("Tracks steps you've completed — not your chances of admission.")).toBeNull()
    expect(screen.queryByText(/Recorded actions only.*not a grade or admission prediction/i)).toBeNull()
    expect(screen.queryByText(/typically cost well above this/i)).toBeNull()
    expect(screen.queryByRole('button', { name: /counsellor about funding/i })).toBeNull()

    const editLink = screen.getByRole('link', { name: /Change intake answers/ })
    expect(editLink.getAttribute('href')).toBe('/intake')
    fireEvent.click(editLink)
    expect(onNavigate).toHaveBeenCalledWith('intake')

    fireEvent.click(screen.getByRole('button', { name: 'Account details' }))
    expect(onNavigate).toHaveBeenCalledWith('auth')
  })

  it('states that intake is incomplete instead of rendering blank goal facts', async () => {
    render(
      <DashboardScreen
        userId="student-1"
        profile={null}
        saved={new Set(['university-1'])}
        onNavigate={vi.fn()}
        onOpenUniversity={vi.fn()}
      />,
    )

    expect(await screen.findByRole('heading', { name: 'Building your plan' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Intake not completed' })).toBeTruthy()
    expect(screen.getByText(/cannot show a destination, field, budget, or intake goal yet/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Complete intake/ }).getAttribute('href')).toBe('/intake')
  })


  it('shows the getting-started stage and intake route in the true empty state', async () => {
    render(
      <DashboardScreen
        userId="student-1"
        profile={null}
        saved={new Set()}
        onNavigate={vi.fn()}
        onOpenUniversity={vi.fn()}
      />,
    )

    expect(await screen.findByText('Your stage · Getting started')).toBeTruthy()
    expect(screen.getByText(/Start with your intake so 4Prep can organize the facts around your plan/)).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /Start intake/ })).toHaveLength(1)
    expect(screen.getByRole('link', { name: /Start intake/ }).getAttribute('href')).toBe('/intake')
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.queryByText('Learning progress')).toBeNull()

    const moreWays = screen.getByText('More ways to continue').closest('details')
    expect(moreWays).toBeTruthy()
    expect(moreWays?.open).toBe(false)
    fireEvent.click(screen.getByText('More ways to continue'))
    expect(moreWays?.open).toBe(true)
    expect(screen.getByRole('link', { name: 'Explore universities' }).getAttribute('href')).toBe('/universities')
    expect(screen.getByRole('link', { name: 'Open Learning Portal' }).getAttribute('href')).toBe('/learn')
  })

  it('uses recorded feedback as the strongest stage signal', async () => {
    repositoryMocks.getLearningUserState.mockResolvedValue({
      completedLessonIds: new Set(),
      submissions: [{
        id: 'submission-1',
        assignmentId: 'assignment-1',
        userId: 'student-1',
        status: 'reviewed',
        submittedAt: '2026-08-03T10:00:00.000Z',
        feedbackRef: 'feedback-1',
        files: [],
      }],
    } satisfies LearningUserState)

    render(
      <DashboardScreen
        userId="student-1"
        profile={profile}
        saved={new Set()}
        onNavigate={vi.fn()}
        onOpenUniversity={vi.fn()}
      />,
    )

    expect(await screen.findByRole('heading', { name: 'Feedback received' })).toBeTruthy()
    expect(screen.getByText('Feedback is recorded for at least one homework submission.')).toBeTruthy()
  })

  it('does not claim an empty stage when private learning records fail to load', async () => {
    repositoryMocks.getLearningUserState.mockRejectedValue(new Error('private state unavailable'))

    render(
      <DashboardScreen
        userId="student-1"
        profile={null}
        saved={new Set()}
        onNavigate={vi.fn()}
        onOpenUniversity={vi.fn()}
      />,
    )

    expect(await screen.findByRole('heading', { name: 'Stage could not be checked' })).toBeTruthy()
    expect(screen.getByText(/will not guess your stage/)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Intake not completed' })).toBeTruthy()
  })
})
