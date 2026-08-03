import { describe, expect, it } from 'vitest'
import {
  mapFact,
  mapLearningSubmission,
  mapLearningTrack,
  mapSource,
  mapUniversity,
  type RawLearningSubmission,
  type RawLearningTrack,
  type RawUniversity,
} from './mappers'

describe('data mappers', () => {
  it('maps a known database fact to a source-backed DataPoint', () => {
    expect(mapFact({
      kind: 'tuition',
      value: '£10 / year',
      source_id: 'source-1',
      unknown_reason: null,
      suggested_action: null,
    }, 'Tuition')).toEqual({ status: 'known', value: '£10 / year', sourceId: 'source-1' })
  })

  it('round-trips an unknown database fact without inventing a fallback', () => {
    expect(mapFact({
      kind: 'scholarship',
      value: null,
      source_id: null,
      unknown_reason: 'No award is published.',
      suggested_action: 'Ask the funding office.',
    }, 'Scholarship')).toEqual({
      status: 'unknown',
      reason: 'No award is published.',
      suggestedAction: 'Ask the funding office.',
    })
  })

  it('maps source verification and retrieval metadata', () => {
    expect(mapSource({
      id: 'source-1',
      name: 'University page',
      url: 'https://example.test',
      retrieved_at: '2026-07-18',
      verification: 'verified',
    })).toEqual({
      id: 'source-1',
      origin: 'University page',
      url: 'https://example.test',
      retrievedAt: '2026-07-18',
      verification: 'verified',
    })
  })

  it('creates explicit unknown points for absent joined facts', () => {
    const row: RawUniversity = {
      id: 'sample',
      name: 'Sample University',
      city: 'City',
      country: 'Country',
      flag: '🏳️',
      tagline: 'Tagline',
      description: 'Description',
      photo_seed: 'sample',
      highlights: [],
      source_id: 'source-1',
    }
    const university = mapUniversity(row)
    expect(university.tuition.status).toBe('unknown')
    expect(university.ielts.status).toBe('unknown')
  })

  it('maps and orders a learning track without filling empty draft content', () => {
    const row: RawLearningTrack = {
      id: 'track-1',
      slug: 'application-year',
      title: 'Application year',
      description: 'Track description',
      sort_order: 0,
      learning_modules: [{
        id: 'module-1',
        track_id: 'track-1',
        module_number: 0,
        slug: 'first-module',
        title: 'First module',
        summary: 'Module summary',
        sort_order: 0,
        learning_lessons: [{
          id: 'lesson-2',
          module_id: 'module-1',
          slug: 'second',
          title: 'Second',
          sort_order: 2,
          duration_minutes: null,
          body: null,
          status: 'draft',
          transcript: null,
          media_url: null,
          audio_url: null,
        }, {
          id: 'lesson-1',
          module_id: 'module-1',
          slug: 'first',
          title: 'First',
          sort_order: 1,
          duration_minutes: null,
          body: null,
          status: 'draft',
          transcript: null,
          media_url: null,
          audio_url: null,
        }],
        learning_assignments: [{
          id: 'assignment-1',
          module_id: 'module-1',
          slug: 'first-module',
          title: 'First module',
          brief: 'Assignment brief',
          submission_type: 'artifact',
          template_ref: '/learning-templates/first-module.docx',
          rubric: null,
        }],
      }],
    }

    const track = mapLearningTrack(row)

    expect(track.modules[0].lessons.map((lesson) => lesson.slug)).toEqual(['first', 'second'])
    expect(track.modules[0].lessons[0]).toMatchObject({
      body: null,
      transcript: null,
      status: 'draft',
    })
    expect(track.modules[0].assignment.rubric).toBeNull()
  })

  it('maps submission file metadata and preserves the pending state', () => {
    const row: RawLearningSubmission = {
      id: 'submission-1',
      assignment_id: 'assignment-1',
      user_id: 'user-1',
      status: 'pending',
      submitted_at: '2026-07-31T10:00:00.000Z',
      feedback_ref: null,
      learning_submission_files: [{
        id: 'file-1',
        submission_id: 'submission-1',
        storage_path: 'user-1/first-module/file.pdf',
        original_filename: 'file.pdf',
        mime_type: 'application/pdf',
        byte_size: '42',
        created_at: '2026-07-31T10:00:00.000Z',
      }],
    }

    expect(mapLearningSubmission(row)).toMatchObject({
      status: 'pending',
      submittedAt: '2026-07-31T10:00:00.000Z',
      feedbackRef: null,
      files: [{ byteSize: 42, originalFilename: 'file.pdf' }],
    })
  })
})
