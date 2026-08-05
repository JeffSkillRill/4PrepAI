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
  AdminMetricDefinitions,
  AdminMetrics,
  AdminSessionResponse,
  AdminStudentResponse,
  AdminSubmission,
  AdminSubmissionFile,
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
      </main>
    </div>
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
