import { beforeEach, describe, expect, it, vi } from 'vitest'

const download = vi.fn()
const storageFrom = vi.fn(() => ({ download }))

vi.mock('./client', () => ({
  getSupabaseClient: () => ({
    storage: { from: storageFrom },
  }),
}))

import { downloadLearningSubmissionFile } from './repository'

describe('private learning-submission downloads', () => {
  beforeEach(() => {
    download.mockReset()
    storageFrom.mockClear()
  })

  it('bypasses shared browser caches before Storage evaluates the current user', async () => {
    const file = new Blob(['private homework'], { type: 'text/plain' })
    download.mockResolvedValue({ data: file, error: null })

    await expect(downloadLearningSubmissionFile('user/assignment/homework.txt')).resolves.toBe(file)

    expect(storageFrom).toHaveBeenCalledWith('learning-submissions')
    expect(download).toHaveBeenCalledWith(
      'user/assignment/homework.txt',
      { cacheNonce: expect.any(String) },
      { cache: 'no-store' },
    )
  })
})
