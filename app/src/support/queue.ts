export const MAX_SUPPORT_MESSAGE_LENGTH = 2000
export const SUPPORT_POLL_INTERVAL_MS = 15_000

export type QueuedSupportMessage = {
  id: string
  userId: string
  body: string
  queuedAt: string
  retryNotBefore: string | null
}

type QueueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const QUEUE_KEY_PREFIX = '4prep:support-queue:v1:'

function queueKey(userId: string): string {
  return `${QUEUE_KEY_PREFIX}${userId}`
}

function validQueuedMessage(value: unknown, userId: string): value is QueuedSupportMessage {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<QueuedSupportMessage>
  return typeof item.id === 'string'
    && /^[0-9a-f-]{36}$/i.test(item.id)
    && item.userId === userId
    && typeof item.body === 'string'
    && item.body.trim().length > 0
    && item.body.length <= MAX_SUPPORT_MESSAGE_LENGTH
    && typeof item.queuedAt === 'string'
    && Number.isFinite(Date.parse(item.queuedAt))
    && (item.retryNotBefore === null || (
      typeof item.retryNotBefore === 'string'
      && Number.isFinite(Date.parse(item.retryNotBefore))
    ))
}

// localStorage, not sessionStorage: a message the student was told is queued must
// survive closing the tab. Keys are per user, readSupportQueue filters on userId, the
// server binds sends to auth.uid(), and resending the same id is idempotent, so two
// tabs draining one queue cannot duplicate a message. Queues are cleared on sign-out
// (clearSupportQueues) so a shared device keeps no message text.
export function supportQueueStorage(): QueueStorage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function clearSupportQueues(storage: Pick<Storage, 'length' | 'key' | 'removeItem'> | null): void {
  if (!storage) return
  const keys: string[] = []
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (key?.startsWith(QUEUE_KEY_PREFIX)) keys.push(key)
  }
  keys.forEach((key) => storage.removeItem(key))
}

/** Sign-out / account-deletion hook: drop every queued message on this device. */
export function clearDeviceSupportQueues(): void {
  if (typeof window === 'undefined') return
  try {
    clearSupportQueues(window.localStorage)
  } catch {
    // Storage blocked: nothing was persisted there either.
  }
}

export function readSupportQueue(
  storage: QueueStorage | null,
  userId: string,
): QueuedSupportMessage[] {
  if (!storage) return []
  try {
    const parsed: unknown = JSON.parse(storage.getItem(queueKey(userId)) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => validQueuedMessage(item, userId))
  } catch {
    return []
  }
}

export function writeSupportQueue(
  storage: QueueStorage | null,
  userId: string,
  queue: QueuedSupportMessage[],
): void {
  if (!storage) return
  if (queue.length === 0) {
    storage.removeItem(queueKey(userId))
    return
  }
  storage.setItem(queueKey(userId), JSON.stringify(queue))
}

export function createQueuedSupportMessage(
  userId: string,
  body: string,
  now = new Date(),
  id = crypto.randomUUID(),
): QueuedSupportMessage {
  return {
    id,
    userId,
    body: body.trim(),
    queuedAt: now.toISOString(),
    retryNotBefore: null,
  }
}

export function canRetryQueuedMessage(
  message: QueuedSupportMessage,
  now = new Date(),
): boolean {
  return message.retryNotBefore === null
    || Date.parse(message.retryNotBefore) <= now.getTime()
}

export function retryTimeFromNow(seconds: number, now = new Date()): string {
  return new Date(now.getTime() + Math.max(1, seconds) * 1000).toISOString()
}

export function helpfulRetryMessage(seconds: number): string {
  if (seconds < 60) return `Please wait about ${Math.max(1, Math.ceil(seconds))} seconds, then retry. Your message is still queued.`
  const minutes = Math.ceil(seconds / 60)
  return `Please wait about ${minutes} minute${minutes === 1 ? '' : 's'}, then retry. Your message is still queued.`
}
