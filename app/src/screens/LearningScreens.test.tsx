// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LearningModule, LearningTrack, LearningUserState } from '../types'
import { LearningModuleScreen, LearningTrackScreen } from './LearningScreens'

const repositoryMocks = vi.hoisted(() => ({
  downloadLearningSubmissionFile: vi.fn(),
  getLearningTrack: vi.fn(),
  getLearningUserState: vi.fn(),
  markLearningLessonComplete: vi.fn(),
  submitLearningAssignment: vi.fn(),
}))

vi.mock('../data/repository', () => repositoryMocks)

function moduleFixture(moduleNumber: number): LearningModule {
  return {
    id: `module-${moduleNumber}`,
    trackId: 'track-1',
    moduleNumber,
    slug: `module-${moduleNumber}`,
    title: `Module ${moduleNumber} title`,
    summary: `Module ${moduleNumber} summary`,
    order: moduleNumber,
    lessons: [{
      id: `lesson-${moduleNumber}`,
      moduleId: `module-${moduleNumber}`,
      slug: `lesson-${moduleNumber}`,
      title: `Lesson ${moduleNumber}`,
      order: 0,
      durationMinutes: null,
      body: null,
      status: 'draft',
      transcript: null,
      mediaUrl: null,
      audioUrl: null,
    }],
    assignment: {
      id: `assignment-${moduleNumber}`,
      moduleId: `module-${moduleNumber}`,
      slug: `assignment-${moduleNumber}`,
      title: `Assignment ${moduleNumber}`,
      brief: 'Assignment brief',
      submissionType: 'artifact',
      templateRef: '/learning-templates/module.docx',
      rubric: null,
    },
  }
}

const track: LearningTrack = {
  id: 'track-1',
  slug: 'application-year',
  title: 'Application year',
  description: 'A step-by-step application course.',
  order: 1,
  modules: Array.from({ length: 11 }, (_, index) => moduleFixture(index + 1)),
}

const emptyUserState: LearningUserState = {
  completedLessonIds: new Set(),
  submissions: [],
}

const navigation = {
  onOpenAssignment: vi.fn(),
  onOpenLesson: vi.fn(),
  onOpenModule: vi.fn(),
  onOpenTrack: vi.fn(),
  onSignIn: vi.fn(),
}

beforeEach(() => {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true })
  repositoryMocks.getLearningTrack.mockReset().mockResolvedValue(track)
  repositoryMocks.getLearningUserState.mockReset().mockResolvedValue(emptyUserState)
})

afterEach(cleanup)

describe('LearningTrackScreen hierarchy', () => {
  it('shows one starting module and defers locked modules until the student expands them', async () => {
    render(<LearningTrackScreen {...navigation} userId="student-1" />)

    expect(await screen.findByText('Start here')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Start module' }).getAttribute('href')).toBe('/learn/module-1')

    const laterModules = screen.getByText('10 later modules').closest('details')
    expect(laterModules).toBeTruthy()
    expect(laterModules?.open).toBe(false)
    expect(screen.getAllByRole('link', { name: 'Preview with warning' })).toHaveLength(10)

    fireEvent.click(screen.getByText('10 later modules'))
    expect(laterModules?.open).toBe(true)
    expect(screen.getByText('Module 2 title')).toBeTruthy()

    const moduleTwoTitle = screen.getByText('Module 2 title')
    const moduleTwo = moduleTwoTitle.closest('details')
    expect(moduleTwo?.open).toBe(false)
    fireEvent.click(moduleTwoTitle)
    expect(moduleTwo?.open).toBe(true)
    expect(screen.getAllByRole('link', { name: 'Preview with warning' })[0].getAttribute('href')).toBe('/learn/module-2')
  })

  it('keeps the sequence warning in front of locked module content', async () => {
    render(<LearningModuleScreen {...navigation} userId="student-1" moduleSlug="module-2" />)

    expect((await screen.findByRole('alert')).textContent).toContain('This module is later in the course')
    expect(screen.getByRole('button', { name: 'Continue anyway' })).toBeTruthy()
    expect((screen.getByRole('button', { name: /Lesson 2/ }) as HTMLButtonElement).disabled).toBe(true)
  })
})
