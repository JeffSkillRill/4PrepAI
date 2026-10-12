/** Serialize writes without letting one rejection prevent later retries. */
export function createWriteQueue() {
  let tail: Promise<unknown> = Promise.resolve()
  return { enqueue<T>(write: () => Promise<T>): Promise<T> {
    const next = tail.catch(() => {}).then(write)
    tail = next
    return next
  } }
}
