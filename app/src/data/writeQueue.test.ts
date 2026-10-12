import { describe, expect, it, vi } from 'vitest'
import { createWriteQueue } from './writeQueue'
describe('account profile writes', () => {
  it('cannot let an older slow edit overwrite a newer one', async () => {
    const queue = createWriteQueue()
    let finish!: () => void
    const calls: string[] = []
    const first = queue.enqueue(async () => { calls.push('first'); await new Promise<void>((resolve) => { finish = resolve }) })
    const second = queue.enqueue(async () => { calls.push('second') })
    await Promise.resolve(); await Promise.resolve()
    expect(calls).toEqual(['first'])
    finish()
    await Promise.all([first, second])
    expect(calls).toEqual(['first', 'second'])
  })
  it('permits an explicit retry after a failed write', async () => {
    const queue = createWriteQueue()
    await expect(queue.enqueue(async () => { throw new Error('offline') })).rejects.toThrow('offline')
    const retry = vi.fn(async () => 'saved')
    await expect(queue.enqueue(retry)).resolves.toBe('saved')
  })
})
