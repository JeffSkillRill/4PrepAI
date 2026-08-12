import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { adminApi, NotAvailableError } from '../data/adminApi'
import {
  findStudents,
  formatBytes,
  formatDateTime,
  goalFacts,
} from '../logic'
import type {
  AdminCohortResponse,
  AdminLeadInboxResponse,
  AdminLeadStatus,
  AdminMetricDefinitions,
  AdminMetrics,
  AdminSessionResponse,
  AdminStudentResponse,
  AdminSubmission,
  AdminSubmissionFile,
  AdminSupportInboxResponse,
  AdminSupportThreadResponse,
} from '../types'

type LoadState<T> =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: T }
  | { status: 'error'; data: null }

const metricOrder: Array<{
  key: keyof AdminMetrics
  label: string
  priority?: boolean
}> = [
  { key: 'waitingReview', label: 'Homework waiting', priority: true },
  { key: 'acted30d', label: 'Acted in 30 days' },
  { key: 'signedIn30d', label: 'Signed in in 30 days' },
  { key: 'signedUpTotal', label: 'Signed up' },
]

export function AdminConsole({
  session,
  onNotAvailable,
  onSignOut,
}: {
  session: AdminSessionResponse
  onNotAvailable: () => void
  onSignOut: () => void
}) {
  const [cohort, setCohort] = useState<LoadState<AdminCohortResponse>>({
    status: 'loading',
    data: null,
  })
  const [query, setQuery] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [workspace, setWorkspace] = useState<'cohort' | 'support' | 'leads'>('cohort')

  const loadCohort = useCallback(async () => {
    setCohort({ status: 'loading', data: null })
    try {
      setCohort({ status: 'ready', data: await adminApi.cohort() })
    } catch (reason) {
      if (reason instanceof NotAvailableError) {
        onNotAvailable()
        return
      }
      setCohort({ status: 'error', data: null })
    }
  }, [onNotAvailable])

  useEffect(() => {
    let active = true
    void adminApi.cohort()
      .then((data) => {
        if (active) setCohort({ status: 'ready', data })
      })
      .catch((reason: unknown) => {
        if (!active) return
        if (reason instanceof NotAvailableError) {
          onNotAvailable()
          return
        }
        setCohort({ status: 'error', data: null })
      })
    return () => {
      active = false
    }
  }, [onNotAvailable])

  const visibleStudents = useMemo(
    () => findStudents(cohort.data?.students ?? [], query),
    [cohort.data?.students, query],
  )

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">4Prep operations</p>
          <p className="admin-wordmark">Admin console</p>
        </div>
        <div className="account-actions">
          <span>{session.admin.email ?? 'Signed-in admin'}</span>
          <button className="quiet-button" type="button" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      <main className="admin-main">
        <nav className="workspace-tabs" aria-label="Admin workspace">
          <button type="button" aria-current={workspace === 'cohort' ? 'page' : undefined} onClick={() => setWorkspace('cohort')}>Cohort</button>
          <button type="button" aria-current={workspace === 'support' ? 'page' : undefined} onClick={() => setWorkspace('support')}>Support inbox</button>
          <button type="button" aria-current={workspace === 'leads' ? 'page' : undefined} onClick={() => setWorkspace('leads')}>Academy requests</button>
        </nav>

        {workspace === 'cohort' ? <>
          <section aria-labelledby="work-queue-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Pilot cohort</p>
              <h1 id="work-queue-title">Homework review queue</h1>
              <p className="muted">Waiting homework is shown first. Other fields are context, not grades or predictions.</p>
            </div>
          </div>
          <MetricGrid metrics={session.metrics} definitions={session.definitions} />
          </section>

          <section className="panel roster-panel" aria-labelledby="roster-title">
          <div className="roster-toolbar">
            <div>
              <h2 id="roster-title">Students</h2>
              <p className="muted compact">Find one student by email, ID, stage, or recorded goal.</p>
            </div>
            <label className="search-field">
              <span>Find a student</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Email or student ID"
              />
            </label>
          </div>

          {cohort.status === 'loading' ? <InlineLoading label="Loading cohort" /> : null}
          {cohort.status === 'error' ? (
            <InlineError onRetry={loadCohort}>The cohort could not be loaded.</InlineError>
          ) : null}
          {cohort.status === 'ready' ? (
            <RosterTable
              students={visibleStudents}
              selectedStudentId={selectedStudentId}
              onSelect={setSelectedStudentId}
            />
          ) : null}
          </section>

          {selectedStudentId ? (
            <StudentDetail
              key={selectedStudentId}
              studentId={selectedStudentId}
              onClose={() => setSelectedStudentId(null)}
              onNotAvailable={onNotAvailable}
            />
          ) : null}
        </> : workspace === 'support' ? (
          <SupportInbox onNotAvailable={onNotAvailable} />
        ) : (
          <LeadInbox onNotAvailable={onNotAvailable} />
        )}
      </main>
    </div>
  )
}

const leadStatusTabs: Array<{ key: AdminLeadStatus; label: string }> = [
  { key: 'new', label: 'Waiting' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'answered', label: 'Answered' },
  { key: 'closed', label: 'Closed' },
]

const leadSourceLabels: Record<string, string> = {
  results: 'After their pathway',
  gap: 'On an unpublished figure',
  counselor_refusal: 'After a counselor refusal',
}

function waitingLabel(hours: number): string {
  if (hours < 1) return 'under an hour'
  if (hours < 48) return `${Math.round(hours)} hours`
  return `${Math.round(hours / 24)} days`
}

/**
 * The operator queue for the app→Academy handoff.
 *
 * The number at the top is deliberately the oldest wait rather than a total:
 * a count of requests says nothing about whether anyone is being answered, and
 * an unanswered student is the only failure this feature can actually have.
 */
function LeadInbox({ onNotAvailable }: { onNotAvailable: () => void }) {
  const [status, setStatus] = useState<AdminLeadStatus>('new')
  const [resource, setResource] = useState<LoadState<AdminLeadInboxResponse>>({
    status: 'loading',
    data: null,
  })
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async (next: AdminLeadStatus) => {
    setResource({ status: 'loading', data: null })
    try {
      const data = await adminApi.leadInbox(next)
      setResource({ status: 'ready', data })
    } catch (reason) {
      if (reason instanceof NotAvailableError) {
        onNotAvailable()
        return
      }
      setResource({ status: 'error', data: null })
    }
  }, [onNotAvailable])

  // Deferred rather than called in the effect body, matching SupportInbox: the
  // first thing load() does is set state, and doing that synchronously inside an
  // effect cascades renders.
  useEffect(() => {
    const initial = window.setTimeout(() => void load(status), 0)
    return () => window.clearTimeout(initial)
  }, [load, status])

  async function mutate(action: () => Promise<unknown>) {
    setActionError(null)
    try {
      await action()
      await load(status)
    } catch (reason) {
      if (reason instanceof NotAvailableError) {
        onNotAvailable()
        return
      }
      setActionError('That change could not be saved. The request is unchanged.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="panel" aria-labelledby="leads-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Academy requests</p>
          <h1 id="leads-title">Students asking to be contacted</h1>
          <p className="muted">
            Each of these is a student who asked a person to follow up on something the app would not
            guess at. Contact details are shown so you can reply; they are not shared anywhere else.
          </p>
        </div>
      </div>

      <nav className="workspace-tabs" aria-label="Request status">
        {leadStatusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-current={status === tab.key ? 'page' : undefined}
            onClick={() => setStatus(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {resource.status === 'loading' ? <p className="muted">Loading requests…</p> : null}
      {resource.status === 'error' ? (
        <InlineError onRetry={() => { void load(status) }}>
          The requests could not be loaded, so none are shown.
        </InlineError>
      ) : null}

      {resource.status === 'ready' ? (
        <>
          {status === 'new' ? (
            <p className="muted compact">
              {resource.data.leads.length === 0
                ? 'Nobody is waiting.'
                : `Longest wait: ${waitingLabel(resource.data.oldestWaitingHours)}.`}
            </p>
          ) : null}

          {actionError ? <p role="alert" className="muted compact">{actionError}</p> : null}

          {resource.data.leads.length === 0 ? (
            <p className="muted">No requests with this status.</p>
          ) : (
            <ul className="lead-list">
              {resource.data.leads.map((lead) => (
                <li key={lead.id} className="lead-row">
                  <div>
                    <p className="lead-name">{lead.name}</p>
                    <p className="muted compact">{lead.contact}</p>
                    <p className="muted compact">
                      {leadSourceLabels[lead.source] ?? lead.source}
                      {lead.contextRef ? ` · ${lead.contextRef}` : ''}
                      {lead.studentUserId ? '' : ' · no account'}
                    </p>
                    {lead.note ? <p className="lead-note">{lead.note}</p> : null}
                    <p className="muted compact">
                      Waiting {waitingLabel(lead.waitingHours)}
                    </p>
                  </div>
                  <div className="lead-actions">
                    {lead.status === 'new' ? (
                      <button
                        className="quiet-button"
                        type="button"
                        disabled={pendingId === lead.id}
                        onClick={() => {
                          setPendingId(lead.id)
                          void mutate(() => adminApi.leadClaim(lead.id))
                        }}
                      >
                        Claim
                      </button>
                    ) : null}
                    {lead.status === 'new' || lead.status === 'claimed' ? (
                      <>
                        <button
                          className="primary-button"
                          type="button"
                          disabled={pendingId === lead.id}
                          onClick={() => {
                            setPendingId(lead.id)
                            void mutate(() => adminApi.leadResolve(lead.id, 'answered'))
                          }}
                        >
                          Mark answered
                        </button>
                        <button
                          className="quiet-button"
                          type="button"
                          disabled={pendingId === lead.id}
                          onClick={() => {
                            setPendingId(lead.id)
                            void mutate(() => adminApi.leadResolve(lead.id, 'closed'))
                          }}
                        >
                          Close
                        </button>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </section>
  )
}

function SupportInbox({ onNotAvailable }: { onNotAvailable: () => void }) {
  const [resource, setResource] = useState<LoadState<AdminSupportInboxResponse>>({
    status: 'loading',
    data: null,
  })
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [refreshError, setRefreshError] = useState(false)

  const loadInbox = useCallback(async (silent = false) => {
    if (!silent) setResource({ status: 'loading', data: null })
    try {
      setResource({ status: 'ready', data: await adminApi.chatInbox() })
      setRefreshError(false)
    } catch (reason) {
      if (reason instanceof NotAvailableError) {
        onNotAvailable()
        return
      }
      if (silent) setRefreshError(true)
      else setResource({ status: 'error', data: null })
    }
  }, [onNotAvailable])

  useEffect(() => {
    const initial = window.setTimeout(() => void loadInbox(), 0)
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadInbox(true)
    }, 15_000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [loadInbox])

  const waiting = resource.data?.threads.filter((thread) => thread.waiting).length ?? 0
  return (
    <section aria-labelledby="support-inbox-title">
      <div className="section-heading support-heading">
        <div>
          <p className="eyebrow">Human platform help</p>
          <h1 id="support-inbox-title">Support inbox</h1>
          <p className="muted">Oldest waiting thread first. Reply only about 4Prep being broken or confusing; route admissions questions to the grounded counselor.</p>
        </div>
        <p className="support-waiting-count"><strong>{waiting}</strong> waiting</p>
      </div>

      <div className="support-layout">
        <section className="panel support-list" aria-label="Support threads">
          {refreshError ? <p className="refresh-warning" role="status">Latest refresh failed; showing the last confirmed inbox.</p> : null}
          {resource.status === 'loading' ? <InlineLoading label="Loading support inbox" /> : null}
          {resource.status === 'error' ? <InlineError onRetry={() => void loadInbox()}>The support inbox could not be loaded.</InlineError> : null}
          {resource.status === 'ready' && resource.data.threads.length === 0 ? <p className="empty-note">No support threads yet.</p> : null}
          {resource.status === 'ready' ? (
            <ul>
              {resource.data.threads.map((thread) => (
                <li key={thread.threadId}>
                  <button
                    type="button"
                    className={selectedThreadId === thread.threadId ? 'selected' : undefined}
                    aria-pressed={selectedThreadId === thread.threadId}
                    onClick={() => setSelectedThreadId(thread.threadId)}
                  >
                    <span className="support-list-topline">
                      <strong>{thread.email ?? 'Email not recorded'}</strong>
                      <span className={`status-badge ${thread.waiting ? 'status-submitted' : 'status-reviewed'}`}>{thread.waiting ? 'Waiting' : 'Replied'}</span>
                    </span>
                    <span className="support-preview">{thread.preview}</span>
                    <span className="support-context">{thread.stage.label} · {formatDateTime(thread.lastMessageAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {selectedThreadId ? (
          <SupportThread
            key={selectedThreadId}
            threadId={selectedThreadId}
            onNotAvailable={onNotAvailable}
            onInboxChanged={() => void loadInbox(true)}
          />
        ) : (
          <section className="panel support-placeholder">
            <p>Select a thread to read and reply.</p>
          </section>
        )}
      </div>
    </section>
  )
}

function SupportThread({
  threadId,
  onNotAvailable,
  onInboxChanged,
}: {
  threadId: string
  onNotAvailable: () => void
  onInboxChanged: () => void
}) {
  const [resource, setResource] = useState<LoadState<AdminSupportThreadResponse>>({
    status: 'loading',
    data: null,
  })
  const [draft, setDraft] = useState('')
  const [replying, setReplying] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [refreshError, setRefreshError] = useState(false)

  const loadThread = useCallback(async (silent = false) => {
    if (!silent) setResource({ status: 'loading', data: null })
    try {
      setResource({ status: 'ready', data: await adminApi.chatThread(threadId) })
      setRefreshError(false)
    } catch (reason) {
      if (reason instanceof NotAvailableError) {
        onNotAvailable()
        return
      }
      if (silent) setRefreshError(true)
      else setResource({ status: 'error', data: null })
    }
  }, [onNotAvailable, threadId])

  useEffect(() => {
    const initial = window.setTimeout(() => void loadThread(), 0)
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadThread(true)
    }, 15_000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [loadThread])

  const reply = async (event: React.FormEvent) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body || body.length > 2000) return
    setReplying(true)
    setReplyError(null)
    try {
      await adminApi.chatReply(threadId, body)
      setDraft('')
      setAnnouncement('Reply sent and confirmed.')
      await loadThread(true)
      onInboxChanged()
    } catch (reason) {
      if (reason instanceof NotAvailableError) {
        onNotAvailable()
        return
      }
      setReplyError('The reply was not confirmed and is not shown as sent. Try again.')
    } finally {
      setReplying(false)
    }
  }

  if (resource.status === 'loading') return <section className="panel support-thread"><InlineLoading label="Loading thread" /></section>
  if (resource.status === 'error') return <section className="panel support-thread"><InlineError onRetry={() => void loadThread()}>The thread could not be loaded.</InlineError></section>

  const data = resource.data
  return (
    <section className="panel support-thread" aria-labelledby="support-thread-title">
      {refreshError ? <p className="refresh-warning" role="status">Latest refresh failed; showing the last confirmed messages.</p> : null}
      <header>
        <div>
          <p className="eyebrow">Private student thread</p>
          <h2 id="support-thread-title">{data.thread.email ?? 'Email not recorded'}</h2>
          <p className="muted compact">{data.thread.stage.label} · {data.thread.stage.description}</p>
        </div>
      </header>
      <ol className="support-messages" aria-live="polite" aria-label="Support messages">
        {data.messages.map((message) => (
          <li key={message.id} className={message.senderRole === 'admin' ? 'from-admin' : 'from-student'}>
            <article>
              <strong>{message.senderRole === 'admin' ? '4Prep support' : 'Student'}</strong>
              <p>{message.body}</p>
              <time dateTime={message.createdAt}>{formatDateTime(message.createdAt)}</time>
            </article>
          </li>
        ))}
      </ol>
      <form onSubmit={(event) => void reply(event)} className="support-reply">
        <label htmlFor={`support-reply-${threadId}`}>Reply about the platform</label>
        <textarea
          id={`support-reply-${threadId}`}
          rows={4}
          maxLength={2000}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="A clear human reply — no admissions advice or unsourced figures"
        />
        <div>
          <span>{(2000 - draft.length).toLocaleString()} characters left</span>
          <button className="primary-button" type="submit" disabled={replying || !draft.trim()}>{replying ? 'Sending…' : 'Send reply'}</button>
        </div>
        {replyError ? <p className="inline-error" role="alert">{replyError}</p> : null}
      </form>
      <p className="sr-only" aria-live="assertive">{announcement}</p>
    </section>
  )
}

function MetricGrid({
  metrics,
  definitions,
}: {
  metrics: AdminMetrics
  definitions: AdminMetricDefinitions
}) {
  return (
    <div className="metric-grid">
      {metricOrder.map(({ key, label, priority }) => (
        <article className={`metric-card${priority ? ' metric-card-priority' : ''}`} key={key}>
          <p className="metric-label">{label}</p>
          <p className="metric-value">{metrics[key].toLocaleString()}</p>
          <p className="metric-definition">{definitions[key] || 'Definition unavailable.'}</p>
        </article>
      ))}
    </div>
  )
}

function RosterTable({
  students,
  selectedStudentId,
  onSelect,
}: {
  students: AdminCohortResponse['students']
  selectedStudentId: string | null
  onSelect: (studentId: string) => void
}) {
  if (students.length === 0) {
    return <p className="empty-note">No students match this search.</p>
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Homework waiting</th>
            <th scope="col">Student</th>
            <th scope="col">Stage</th>
            <th scope="col">Goal</th>
            <th scope="col">Last recorded activity</th>
            <th scope="col"><span className="sr-only">Open student</span></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className={student.homeworkWaiting > 0 ? 'waiting-row' : undefined}>
              <td>
                <span className={`waiting-count${student.homeworkWaiting > 0 ? ' has-waiting' : ''}`}>
                  {student.homeworkWaiting}
                </span>
              </td>
              <td>
                <strong>{student.email ?? 'Email not recorded'}</strong>
                <span className="secondary-line">Joined {formatDateTime(student.createdAt)}</span>
              </td>
              <td>
                <strong>{student.stage.label}</strong>
                <span className="secondary-line">{student.stage.description}</span>
              </td>
              <td>{student.goal?.field ?? 'Intake not completed'}</td>
              <td>{formatDateTime(student.lastActiveAt)}</td>
              <td className="table-action">
                <button
                  className="open-button"
                  type="button"
                  aria-pressed={selectedStudentId === student.id}
                  onClick={() => onSelect(student.id)}
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StudentDetail({
  studentId,
  onClose,
  onNotAvailable,
}: {
  studentId: string
  onClose: () => void
  onNotAvailable: () => void
}) {
  const [resource, setResource] = useState<LoadState<AdminStudentResponse>>({
    status: 'loading',
    data: null,
  })

  const loadStudent = useCallback(async () => {
    setResource({ status: 'loading', data: null })
    try {
      setResource({ status: 'ready', data: await adminApi.student(studentId) })
    } catch (reason) {
      if (reason instanceof NotAvailableError) {
        onNotAvailable()
        return
      }
      setResource({ status: 'error', data: null })
    }
  }, [onNotAvailable, studentId])

  useEffect(() => {
    let active = true
    void adminApi.student(studentId)
      .then((data) => {
        if (active) setResource({ status: 'ready', data })
      })
      .catch((reason: unknown) => {
        if (!active) return
        if (reason instanceof NotAvailableError) {
          onNotAvailable()
          return
        }
        setResource({ status: 'error', data: null })
      })
    return () => {
      active = false
    }
  }, [onNotAvailable, studentId])

  return (
    <section className="panel student-panel" aria-labelledby="student-detail-title">
      <div className="detail-toolbar">
        <button className="quiet-button" type="button" onClick={onClose}>Back to cohort</button>
        <p className="eyebrow">Private student record</p>
      </div>
      {resource.status === 'loading' ? <InlineLoading label="Loading student" /> : null}
      {resource.status === 'error' ? (
        <InlineError onRetry={loadStudent}>The student record could not be loaded.</InlineError>
      ) : null}
      {resource.status === 'ready' ? (
        <StudentRecord data={resource.data} onNotAvailable={onNotAvailable} />
      ) : null}
    </section>
  )
}

function StudentRecord({
  data,
  onNotAvailable,
}: {
  data: AdminStudentResponse
  onNotAvailable: () => void
}) {
  const submissions = [...data.submissions].sort((left, right) => {
    const leftWaiting = left.status === 'reviewed' ? 0 : 1
    const rightWaiting = right.status === 'reviewed' ? 0 : 1
    if (leftWaiting !== rightWaiting) return rightWaiting - leftWaiting
    return (right.submittedAt ?? '').localeCompare(left.submittedAt ?? '')
  })

  return (
    <div>
      <div className="student-heading">
        <div>
          <h2 id="student-detail-title">{data.student.email ?? 'Email not recorded'}</h2>
          <p className="stage-line"><strong>{data.student.stage.label}</strong> · {data.student.stage.description}</p>
        </div>
      </div>

      <section className="goal-card" aria-labelledby="goal-title">
        <h3 id="goal-title">Recorded goal</h3>
        {data.student.goal ? (
          <dl className="goal-grid">
            {goalFacts(data.student.goal).map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        ) : <p className="muted">Intake has not been completed.</p>}
      </section>

      <section className="submissions-section" aria-labelledby="submissions-title">
        <div className="submissions-heading">
          <h3 id="submissions-title">Homework</h3>
          <span>{submissions.length} submission{submissions.length === 1 ? '' : 's'}</span>
        </div>
        {submissions.length === 0 ? <p className="empty-note">No homework has been submitted.</p> : null}
        <div className="submission-list">
          {submissions.map((submission) => (
            <SubmissionCard
              submission={submission}
              onNotAvailable={onNotAvailable}
              key={submission.id}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

type FileLinkState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'opened'; expiresIn: number }

function SubmissionCard({
  submission,
  onNotAvailable,
}: {
  submission: AdminSubmission
  onNotAvailable: () => void
}) {
  const [fileLinks, setFileLinks] = useState<Record<string, FileLinkState>>({})
  const timers = useRef<number[]>([])

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const requestFile = async (file: AdminSubmissionFile) => {
    const fileWindow = window.open('about:blank', '_blank')
    if (!fileWindow) {
      setFileLinks((current) => ({ ...current, [file.id]: { status: 'error' } }))
      return
    }
    fileWindow.opener = null
    setFileLinks((current) => ({ ...current, [file.id]: { status: 'loading' } }))
    try {
      const response = await adminApi.fileUrl(file.id)
      fileWindow.location.replace(response.signedUrl)
      setFileLinks((current) => ({
        ...current,
        [file.id]: { status: 'opened', expiresIn: response.expiresIn },
      }))
      const timer = window.setTimeout(() => {
        setFileLinks((current) => {
          const next = { ...current }
          delete next[file.id]
          return next
        })
      }, Math.max(1, response.expiresIn) * 1000)
      timers.current.push(timer)
    } catch (reason) {
      fileWindow.close()
      if (reason instanceof NotAvailableError) {
        onNotAvailable()
        return
      }
      setFileLinks((current) => ({ ...current, [file.id]: { status: 'error' } }))
    }
  }

  return (
    <article className={`submission-card${submission.homeworkWaiting ? ' submission-waiting' : ''}`}>
      <header className="submission-header">
        <div>
          <span className={`status-badge status-${submission.status}`}>{submission.status}</span>
          <h4>{submission.assignment.title}</h4>
        </div>
        <time dateTime={submission.submittedAt ?? undefined}>{formatDateTime(submission.submittedAt)}</time>
      </header>
      <div className="review-context">
        <section>
          <h5>Assignment brief</h5>
          <p>{submission.assignment.brief}</p>
        </section>
        <section>
          <h5>Rubric</h5>
          <Rubric value={submission.assignment.rubric} />
        </section>
      </div>
      <section className="files-section" aria-label="Submission files">
        <h5>Files</h5>
        {submission.files.length === 0 ? <p className="muted compact">No file metadata recorded.</p> : null}
        <ul className="file-list">
          {submission.files.map((file) => {
            const link = fileLinks[file.id]
            return (
              <li key={file.id}>
                <div>
                  <strong>{file.name}</strong>
                  <span>{file.mimeType} · {formatBytes(file.byteSize)}</span>
                </div>
                <button
                  className="open-button"
                  type="button"
                  disabled={link?.status === 'loading'}
                  onClick={() => void requestFile(file)}
                >
                  {link?.status === 'loading' ? 'Opening…' : 'Open secure file'}
                </button>
                {link?.status === 'opened' ? (
                  <span role="status">Opened in a new tab · link expires in {link.expiresIn}s</span>
                ) : null}
                {link?.status === 'error' ? (
                  <span className="inline-error" role="alert">Could not open file. Allow pop-ups and try again.</span>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>
    </article>
  )
}

function Rubric({ value }: { value: unknown | null }) {
  if (value === null) return <p className="muted compact">No rubric recorded.</p>
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <p>{String(value)}</p>
  }
  return <pre className="rubric-json">{JSON.stringify(value, null, 2)}</pre>
}

function InlineLoading({ label }: { label: string }) {
  return <div className="inline-state" role="status"><span className="spinner" aria-hidden="true" /> {label}…</div>
}

function InlineError({
  children,
  onRetry,
}: {
  children: React.ReactNode
  onRetry: () => void
}) {
  return (
    <div className="inline-state" role="alert">
      <span>{children}</span>
      <button className="quiet-button" type="button" onClick={onRetry}>Retry</button>
    </div>
  )
}
