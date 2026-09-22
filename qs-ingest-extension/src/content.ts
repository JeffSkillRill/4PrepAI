import { extractFromDocument } from './extraction.js'

chrome.runtime.onMessage.addListener((message: unknown, _sender: unknown, sendResponse: (value: unknown) => void) => {
  if (message && typeof message === 'object' && (message as { type?: unknown }).type === 'extract') {
    sendResponse(extractFromDocument(document, location.href))
  }
  return true
})
