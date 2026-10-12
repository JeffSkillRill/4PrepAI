// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LearningModule, LearningTrack, LearningUserState } from '../types'
import { LearningAssignmentScreen, LearningModuleScreen, LearningTrackScreen } from './LearningScreens'
import { triggerBlobDownload } from '../learning/download'

const repositoryMocks = vi.hoisted(() => ({
  downloadLearningSubmissionFile: vi.fn(),
  getLearningTrack: vi.fn(),
  getLearningUserState: vi.fn(),
  markLearningLessonComplete: vi.fn(),
  submitLearningAssignment: vi.fn(),
}))

vi.mock('../data/repository', () => repositoryMocks)
vi.mock('../learning/download', () => ({ triggerBlobDownload: vi.fn() }))

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
      status: 'published',
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
  vi.mocked(triggerBlobDownload).mockReset()
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true })
  repositoryMocks.getLearningTrack.mockReset().mockResolvedValue(track)
  repositoryMocks.getLearningUserState.mockReset().mockResolvedValue(emptyUserState)
})

afterEach(cleanup)

describe('LearningTrackScreen hierarchy', () => {
  it('does not trigger a private download after its account screen has unmounted', async () => {
    repositoryMocks.getLearningUserState.mockResolvedValue({
      completedLessonIds: new Set(),
      submissions: [{ id: 'submission-1', assignmentId: 'assignment-1', userId: 'student-1', status: 'pending', submittedAt: '2026-10-12T00:00:00Z', feedbackRef: null,
        files: [{ id: 'file-1', submissionId: 'submission-1', storagePath: 'student-1/assignment-1/private.pdf', originalFilename: 'private.pdf', mimeType: 'application/pdf', byteSize: 10, createdAt: '2026-10-12T00:00:00Z' }] }],
    })
    let resolveDownload!: (blob: Blob) => void
    repositoryMocks.downloadLearningSubmissionFile.mockImplementation(() => new Promise((resolve) => { resolveDownload = resolve }))
    const view = render(<LearningAssignmentScreen {...navigation} userId="student-1" moduleSlug="module-1" />)
    fireEvent.click(await screen.findByRole('button', { name: /^Download$/ }))
    expect(repositoryMocks.downloadLearningSubmissionFile).toHaveBeenCalledWith('student-1/assignment-1/private.pdf', 'student-1')
    view.unmount()
    await act(async () => { resolveDownload(new Blob(['private'])) })
    expect(triggerBlobDownload).not.toHaveBeenCalled()
  })

  it('does not offer a draft-only course as something students can start', async () => {
    repositoryMocks.getLearningTrack.mockResolvedValue({ ...track, modules: track.modules.map((module) => ({ ...module, lessons: module.lessons.map((lesson) => ({ ...lesson, status: 'draft' })) })) })
    render(<LearningTrackScreen {...navigation} userId="student-1" />)
    expect(await screen.findByText('The admission course is coming soon')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Start module' })).toBeNull()
  })
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
