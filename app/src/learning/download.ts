// A blob download only starts reliably when the anchor is attached to the
// document at click time, and when its object URL survives long enough for the
// browser to read it. Revoking in the same tick aborts the transfer, and a
// detached anchor is ignored outright by some browsers, so the student taps
// "Download" and nothing happens with no error to catch.
export const OBJECT_URL_REVOKE_DELAY_MS = 60_000

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  try {
    link.click()
  } finally {
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_DELAY_MS)
  }
}
