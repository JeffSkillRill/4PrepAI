// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OBJECT_URL_REVOKE_DELAY_MS, triggerBlobDownload } from './download'

const createObjectURL = vi.fn(() => 'blob:4prep/homework')
const revokeObjectURL = vi.fn()

beforeEach(() => {
  vi.useFakeTimers()
  createObjectURL.mockClear()
  revokeObjectURL.mockClear()
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL,
    revokeObjectURL,
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('triggerBlobDownload', () => {
  it('attaches the anchor to the document before clicking it', () => {
    let attachedAtClick = false
    let downloadAtClick: string | null = null
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function mockClick(this: HTMLAnchorElement) {
        attachedAtClick = document.body.contains(this)
        downloadAtClick = this.getAttribute('download')
      })

    triggerBlobDownload(new Blob(['essay']), 'my-essay.pdf')

    expect(click).toHaveBeenCalledTimes(1)
    // A detached anchor is ignored by Firefox, so the download never starts.
    expect(attachedAtClick).toBe(true)
    expect(downloadAtClick).toBe('my-essay.pdf')
  })

  it('does not revoke the object URL in the same tick as the click', () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    triggerBlobDownload(new Blob(['essay']), 'my-essay.pdf')

    // Revoking synchronously races the browser and aborts the transfer.
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).not.toHaveBeenCalled()

    vi.advanceTimersByTime(OBJECT_URL_REVOKE_DELAY_MS)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:4prep/homework')
  })

  it('removes the anchor and still schedules cleanup when the click throws', () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => triggerBlobDownload(new Blob(['essay']), 'my-essay.pdf')).toThrow('blocked')
    expect(document.querySelectorAll('a')).toHaveLength(0)

    vi.advanceTimersByTime(OBJECT_URL_REVOKE_DELAY_MS)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:4prep/homework')
  })
})
