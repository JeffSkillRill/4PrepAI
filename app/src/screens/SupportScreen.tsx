import { CircleAlert, LifeBuoy, LoaderCircle, Send, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupportThread, sendSupportMessage } from '../data/repository'
import type { SupportMessage, SupportThread } from '../types'
import {
  MAX_SUPPORT_MESSAGE_LENGTH,
  SUPPORT_POLL_INTERVAL_MS,
  canRetryQueuedMessage,
  createQueuedSupportMessage,
  helpfulRetryMessage,
  readSupportQueue,
  retryTimeFromNow,
  supportQueueStorage,
  writeSupportQueue,
  type QueuedSupportMessage,
} from '../support/queue'

type ThreadState =
  | { status: 'loading'; thread: SupportThread | null }
  | { status: 'ready'; thread: SupportThread | null }
  | { status: 'error'; thread: SupportThread | null }

function messageTime(value: string): string {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Time unavailable'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function StoredMessage({ message }: { message: SupportMessage }) {
  const fromStudent = message.senderRole === 'student'
  return (
    <li className={`flex ${fromStudent ? 'justify-end' : 'justify-start'}`}>
      <article className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${fromStudent ? 'bg-forest-800 text-white' : 'border border-line bg-white text-ink'}`}>
        <p className={`text-xs font-extrabold ${fromStudent ? 'text-forest-100' : 'text-forest-700'}`}>
          {fromStudent ? 'You' : '4Prep support'}
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
        <p className={`mt-2 text-xs ${fromStudent ? 'text-forest-100' : 'text-muted'}`}>
          {messageTime(message.createdAt)} · Sent
        </p>
      </article>
    </li>
  )
}

function QueuedMessage({
  message,
  sending,
  onRetry,
}: {
  message: QueuedSupportMessage
  sending: boolean
  onRetry: () => void
}) {
  const waitingForLimit = !canRetryQueuedMessage(message)
  return (
    <li className="flex justify-end">
      <article className="max-w-[88%] rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-ink sm:max-w-[75%]">
        <p className="text-xs font-extrabold text-amber-900">You</p>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-amber-950">
          <span>{sending ? 'Sending…' : waitingForLimit ? 'Queued · waiting before retry' : 'Queued · not sent yet'}</span>
          {!sending ? (
            <button type="button" onClick={onRetry} className="rounded-md font-extrabold underline focus-visible:ring-2 focus-visible:ring-forest-500">
              Retry now
            </button>
          ) : null}
        </div>
      </article>
    </li>
  )
}

export function SupportScreen({
  userId,
  onSignIn,
  onOpenCounselor,
}: {
  userId: string | null
  onSignIn: () => void
  onOpenCounselor: () => void
}) {
  const [storage] = useState(() => supportQueueStorage())
  const [threadState, setThreadState] = useState<ThreadState>({ status: 'loading', thread: null })
  const [draft, setDraft] = useState('')
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine)
  const [queued, setQueued] = useState<QueuedSupportMessage[]>(() => (
    userId ? readSupportQueue(storage, userId) : []
  ))
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const queueRef = useRef(queued)
  const sendingRef = useRef(false)

  const persistQueue = useCallback((next: QueuedSupportMessage[]) => {
    if (!userId) return
    queueRef.current = next
    writeSupportQueue(storage, userId, next)
    setQueued(next)
  }, [storage, userId])

  const loadThread = useCallback(async (silent = false) => {
    if (!userId) return
    if (!silent) setThreadState((current) => ({ status: 'loading', thread: current.thread }))
    try {
      const thread = await getSupportThread(userId)
      setThreadState({ status: 'ready', thread })
      if (thread) {
        const delivered = new Set(thread.messages.map((message) => message.id))
        const remaining = queueRef.current.filter((message) => !delivered.has(message.id))
        if (remaining.length !== queueRef.current.length) persistQueue(remaining)
      }
    } catch {
      setThreadState((current) => ({ status: 'error', thread: current.thread }))
    }
  }, [persistQueue, userId])

  const drainQueue = useCallback(async () => {
    if (!userId || !online || sendingRef.current) return
    sendingRef.current = true
    let delivered = false
    try {
      for (const queuedMessage of [...queueRef.current]) {
        if (!canRetryQueuedMessage(queuedMessage)) continue
        setSendingId(queuedMessage.id)
        try {
          const result = await sendSupportMessage(queuedMessage.id, queuedMessage.body)
          if (result.status === 'rate_limited') {
            const retryNotBefore = retryTimeFromNow(result.retryAfterSeconds)
            persistQueue(queueRef.current.map((message) => (
              message.id === queuedMessage.id ? { ...message, retryNotBefore } : message
            )))
            setAnnouncement(helpfulRetryMessage(result.retryAfterSeconds))
            break
          }
          persistQueue(queueRef.current.filter((message) => message.id !== queuedMessage.id))
          setAnnouncement('Message sent and confirmed by 4Prep.')
          delivered = true
        } catch {
          setAnnouncement('The message was not confirmed. It remains queued and will retry when the connection is available.')
          break
        }
      }
    } finally {
      setSendingId(null)
      sendingRef.current = false
    }
    if (delivered) await loadThread(true)
  }, [loadThread, online, persistQueue, userId])

  useEffect(() => {
    if (!userId) return
    const initial = window.setTimeout(() => void loadThread(), 0)
    const poll = window.setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        void loadThread(true)
        void drainQueue()
      }
    }, SUPPORT_POLL_INTERVAL_MS)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(poll)
    }
  }, [drainQueue, loadThread, userId])

  useEffect(() => {
    const updateConnection = () => setOnline(navigator.onLine)
    window.addEventListener('online', updateConnection)
    window.addEventListener('offline', updateConnection)
    return () => {
      window.removeEventListener('online', updateConnection)
      window.removeEventListener('offline', updateConnection)
    }
  }, [])

  useEffect(() => {
    if (!online || queued.length === 0) return
    const timer = window.setTimeout(() => void drainQueue(), 0)
    return () => window.clearTimeout(timer)
  }, [drainQueue, online, queued.length])

  if (!userId) {
    return (
      <div className="page-container py-12 sm:py-16">
        <section className="card mx-auto max-w-xl p-6 text-center sm:p-10">
          <LifeBuoy className="mx-auto text-forest-700" size={42} />
          <h1 className="display mt-5 text-3xl font-extrabold">Platform support</h1>
          <p className="mt-3 leading-7 text-muted">Sign in to report something broken or confusing and keep the conversation private.</p>
          <button type="button" onClick={onSignIn} className="mt-6 min-h-12 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white">Sign in to contact support</button>
        </section>
      </div>
    )
  }

  const messages = threadState.thread?.messages ?? []
  const remaining = MAX_SUPPORT_MESSAGE_LENGTH - draft.length
  const retryQueued = (messageId: string) => {
    persistQueue(queueRef.current.map((message) => (
      message.id === messageId ? { ...message, retryNotBefore: null } : message
    )))
    window.setTimeout(() => void drainQueue(), 0)
  }
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body || body.length > MAX_SUPPORT_MESSAGE_LENGTH) return
    const next = createQueuedSupportMessage(userId, body)
    persistQueue([...queueRef.current, next])
    setDraft('')
    setAnnouncement(online
      ? 'Message queued. 4Prep will confirm when it is sent.'
      : 'You are offline. The message is queued in this tab and has not been sent.')
    window.setTimeout(() => void drainQueue(), 0)
  }

  return (
    <div className="page-container py-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[.14em] text-forest-700">Human help</p>
        <h1 className="display mt-2 text-3xl font-extrabold sm:text-4xl">Platform support</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">Tell us when 4Prep is broken or confusing. This is not live chat; during the pilot, expect a reply within two business days.</p>

        <aside className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
          <strong>Admissions question?</strong> Use the grounded counselor so university facts keep their sources.
          <button type="button" onClick={onOpenCounselor} className="ml-2 rounded font-extrabold underline focus-visible:ring-2 focus-visible:ring-forest-500">Open counselor</button>
        </aside>

        {!online ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="status">
            <WifiOff className="mt-0.5 shrink-0" size={19} />
            <span>You are offline. New messages stay queued in this browser tab and are not labelled sent until the server confirms them. Keep this tab open until you see “Sent.”</span>
          </div>
        ) : null}

        <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-canvas shadow-soft" aria-label="Support conversation">
          <div className="border-b border-line bg-white px-4 py-3 text-xs leading-5 text-muted sm:px-6">
            We check for replies every 15 seconds while this page is open. If a check fails, your existing messages remain available.
          </div>

          {threadState.status === 'loading' && messages.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center gap-2 text-muted" role="status"><LoaderCircle className="motion-safe:animate-spin" size={20} /> Loading conversation…</div>
          ) : null}
          {threadState.status === 'error' ? (
            <div className="m-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
              <span className="flex items-center gap-2"><CircleAlert size={18} /> Replies could not be refreshed. Queued messages were not discarded.</span>
              <button type="button" onClick={() => void loadThread()} className="font-extrabold underline">Retry</button>
            </div>
          ) : null}

          <ol className="grid min-h-52 max-h-[55svh] gap-3 overflow-y-auto p-4 sm:p-6" role="log" aria-live="polite" aria-label="Support messages">
            {messages.length === 0 && queued.length === 0 && threadState.status !== 'loading' ? (
              <li className="m-auto max-w-md text-center text-sm leading-6 text-muted">No messages yet. Describe what happened, what page you were on, and what you expected.</li>
            ) : null}
            {messages.map((message) => <StoredMessage key={message.id} message={message} />)}
            {queued.map((message) => (
              <QueuedMessage key={message.id} message={message} sending={sendingId === message.id} onRetry={() => retryQueued(message.id)} />
            ))}
          </ol>

          <form onSubmit={submit} className="sticky bottom-0 border-t border-line bg-white p-4 sm:p-5">
            <label htmlFor="support-message" className="text-sm font-extrabold">Message 4Prep support</label>
            <textarea
              id="support-message"
              value={draft}
              maxLength={MAX_SUPPORT_MESSAGE_LENGTH}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="What is broken or confusing?"
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 text-base leading-6 outline-none focus:border-forest-500 focus-visible:ring-2 focus-visible:ring-forest-300"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted">{remaining.toLocaleString()} characters left · No attachments</p>
              <button type="submit" disabled={!draft.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-forest-800 px-5 py-2.5 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">
                <Send size={17} /> {online ? 'Send message' : 'Queue message'}
              </button>
            </div>
          </form>
        </section>
        <p className="sr-only" aria-live="assertive">{announcement}</p>
      </div>
    </div>
  )
}
