import { describe, expect, it, vi } from 'vitest'
import { collectPages } from './pagination'

describe('public catalogue pagination', () => {
  it('retrieves all records beyond the API row ceiling using inclusive ranges', async () => {
    const records = Array.from({ length: 1205 }, (_, id) => ({ id }))
    const load = vi.fn(async (from: number, to: number) => records.slice(from, to + 1))
    expect(await collectPages(load)).toEqual(records)
    expect(load).toHaveBeenLastCalledWith(1200, 1299)
  })
  it('checks the next page when the last full page lands on an exact boundary', async () => {
    const load = vi.fn().mockResolvedValueOnce([1, 2]).mockResolvedValueOnce([])
    expect(await collectPages(load, 2)).toEqual([1, 2])
    expect(load).toHaveBeenLastCalledWith(2, 3)
  })
  it('does not return a silently incomplete result when a later page fails', async () => {
    const load = vi.fn().mockResolvedValueOnce([1, 2]).mockRejectedValueOnce(new Error('offline'))
    await expect(collectPages(load, 2)).rejects.toThrow('offline')
  })
})
