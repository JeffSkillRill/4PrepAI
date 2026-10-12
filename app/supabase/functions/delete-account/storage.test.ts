import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2.117.2'
import { listStorageObjects, removeStorageObjects, verifyOwnedPaths } from './storage'
const fake = (list: unknown, remove = vi.fn()) => ({ storage: { from: vi.fn(() => ({ list, remove })) } }) as unknown as SupabaseClient
describe('server-owned deletion storage cleanup', () => {
  it('lists every avatar, not just the first 100', async () => {
    const files = Array.from({ length: 250 }, (_, n) => ({ id: String(n), name: `${n}.jpg` }))
    const list = vi.fn(async (_prefix: string, options: { offset: number; limit: number }) => ({ data: files.slice(options.offset, options.offset + options.limit), error: null }))
    const client = fake(list)
    expect(await listStorageObjects(client, 'owner', 'avatars')).toHaveLength(250)
    expect(list).toHaveBeenCalledTimes(3)
    expect(client.storage.from).toHaveBeenCalledWith('avatars')
  })
  it('recurses into nested folders', async () => {
    const list = vi.fn(async (prefix: string) => ({ data: prefix === 'owner' ? [{ id: null, name: 'assignment' }] : [{ id: 'file', name: 'work.pdf' }], error: null }))
    expect(await listStorageObjects(fake(list), 'owner')).toEqual(['owner/assignment/work.pdf'])
  })
  it('fails closed when listing uploaded files fails', async () => {
    const list = vi.fn().mockResolvedValue({ data: null, error: new Error('unavailable') })
    await expect(listStorageObjects(fake(list), 'owner')).rejects.toThrow('unavailable')
  })
  it('stops at a failed batch so auth deletion can be withheld and retried', async () => {
    const remove = vi.fn().mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: new Error('storage failed') })
    await expect(removeStorageObjects(fake(vi.fn(), remove), Array.from({ length: 250 }, (_, n) => `owner/${n}`), 'avatars')).rejects.toThrow('storage failed')
    expect(remove).toHaveBeenCalledTimes(2)
    expect(remove.mock.calls[0][0]).toHaveLength(100)
  })
  it('never lets a student-owned metadata row target another user’s files', () => {
    expect(() => verifyOwnedPaths('owner', ['someone-else/file.pdf'])).toThrow('STORAGE_OWNER_MISMATCH')
    expect(verifyOwnedPaths('owner', ['owner/file.pdf'])).toEqual(['owner/file.pdf'])
  })
})
