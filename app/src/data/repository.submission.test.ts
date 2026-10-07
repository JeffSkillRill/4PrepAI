import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LearningAssignment } from '../types'

const upload = vi.fn()
const remove = vi.fn()
const rpc = vi.fn()
const maybeSingle = vi.fn()
const from = vi.fn()

vi.mock('./client', () => ({
  getSupabaseClient: () => ({
    auth: { getSession: async () => ({ data: { session: { access_token: 'token' } }, error: null }) },
    storage: { from: () => ({ upload, remove }) },
    rpc,
    from,
  }),
}))

import { submitLearningAssignment } from './repository'

const assignment = { id: 'assignment-1', slug: 'essay-draft' } as LearningAssignment
const file = new File(['%PDF-1.4'], 'Essay.pdf', { type: 'application/pdf' })

function selectChain() {
  const chain = { select: () => chain, eq: () => chain, maybeSingle }
  return chain
}

describe('homework submission', () => {
  beforeEach(() => {
    // Without XMLHttpRequest the repository uploads through the Storage client.
    vi.stubGlobal('XMLHttpRequest', undefined)
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon')
    upload.mockReset().mockResolvedValue({ error: null })
    remove.mockReset().mockResolvedValue({ error: null })
    rpc.mockReset().mockResolvedValue({ data: 'submission-1', error: null })
    maybeSingle.mockReset().mockResolvedValue({
      data: {
        id: 'submission-1',
        assignment_id: 'assignment-1',
        user_id: 'user-1',
        status: 'pending',
        submitted_at: '2026-10-08T00:00:00Z',
        feedback_ref: null,
        learning_submission_files: [],
      },
      error: null,
    })
    from.mockReset().mockImplementation(selectChain)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('uploads first, then records the submission and file row in one call', async () => {
    const saved = await submitLearningAssignment({ userId: 'user-1', assignment, file })

    expect(upload).toHaveBeenCalledTimes(1)
    const storagePath = upload.mock.calls[0][0] as string
    expect(storagePath).toMatch(/^user-1\/essay-draft\/.+-Essay\.pdf$/)
    expect(rpc).toHaveBeenCalledWith('submit_learning_assignment', {
      p_assignment_id: 'assignment-1',
      p_storage_path: storagePath,
      p_original_filename: 'Essay.pdf',
      p_mime_type: 'application/pdf',
      p_byte_size: file.size,
    })
    expect(upload.mock.invocationCallOrder[0]).toBeLessThan(rpc.mock.invocationCallOrder[0])
    expect(remove).not.toHaveBeenCalled()
    expect(saved.id).toBe('submission-1')
  })

  it('never writes submission rows directly from the browser', async () => {
    await submitLearningAssignment({ userId: 'user-1', assignment, file })

    expect(from).toHaveBeenCalledTimes(1)
    expect(from).toHaveBeenCalledWith('learning_submissions')
  })

  it('deletes the uploaded object when the database rejects the submission', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'The uploaded homework file was not found' } })

    await expect(submitLearningAssignment({ userId: 'user-1', assignment, file }))
      .rejects.toThrow('The uploaded homework file was not found')

    expect(remove).toHaveBeenCalledWith([upload.mock.calls[0][0]])
    expect(maybeSingle).not.toHaveBeenCalled()
  })

  it('records nothing when the upload fails', async () => {
    upload.mockResolvedValue({ error: new Error('The connection dropped during upload.') })

    await expect(submitLearningAssignment({ userId: 'user-1', assignment, file }))
      .rejects.toThrow('The connection dropped during upload.')

    expect(rpc).not.toHaveBeenCalled()
    expect(remove).not.toHaveBeenCalled()
  })
})
