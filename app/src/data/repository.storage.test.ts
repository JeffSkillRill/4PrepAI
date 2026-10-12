import { beforeEach, describe, expect, it, vi } from 'vitest'

const download = vi.fn()
const storageFrom = vi.fn(() => ({ download }))
const getSession = vi.fn()

vi.mock('./client', () => ({
  getSupabaseClient: () => ({
    storage: { from: storageFrom },
    auth: { getSession },
  }),
}))

import { downloadLearningSubmissionFile } from './repository'

describe('private learning-submission downloads', () => {
  beforeEach(() => {
    download.mockReset()
    storageFrom.mockClear()
    getSession.mockReset().mockResolvedValue({ data: { session: { user: { id: 'user' } } }, error: null })
  })

  it('bypasses shared browser caches before Storage evaluates the current user', async () => {
    const file = new Blob(['private homework'], { type: 'text/plain' })
    download.mockResolvedValue({ data: file, error: null })

    await expect(downloadLearningSubmissionFile('user/assignment/homework.txt', 'user')).resolves.toBe(file)

    expect(storageFrom).toHaveBeenCalledWith('learning-submissions')
    expect(download).toHaveBeenCalledWith(
      'user/assignment/homework.txt',
      { cacheNonce: expect.any(String) },
      { cache: 'no-store' },
    )
  })

  it.each(['other/assignment/file.pdf', 'user/../other/file.pdf', 'user//file.pdf', 'user/assignment\\file.pdf', 'user/%2e%2e/file.pdf', 'user/assignment/file?.pdf', 'user/assignment/file#.pdf', 'user/assignment/file\n.pdf'])('rejects a foreign or ambiguous path %s before requesting files', async (path) => {
    await expect(downloadLearningSubmissionFile(path, 'user')).rejects.toThrow('does not belong')
    expect(download).not.toHaveBeenCalled()
  })

  it('rejects downloads while signed out or signed into another account', async () => {
    for (const session of [null, { user: { id: 'other' } }]) {
      getSession.mockResolvedValue({ data: { session }, error: null })
      await expect(downloadLearningSubmissionFile('user/assignment/file.pdf', 'user')).rejects.toThrow('Your account changed')
    }
    expect(download).not.toHaveBeenCalled()
  })

  it('discards a private blob returned after an account change', async () => {
    download.mockImplementation(async () => {
      getSession.mockResolvedValue({ data: { session: { user: { id: 'other' } } }, error: null })
      return { data: new Blob(['private homework']), error: null }
    })
    await expect(downloadLearningSubmissionFile('user/assignment/file.pdf', 'user')).rejects.toThrow('Your account changed')
  })
})
