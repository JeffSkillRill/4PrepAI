import type { LearningModuleState } from '../learning/logic'
import type { LearningSubmission } from '../types'
import {
  dashboardStages,
  hasRecordedFeedbackReference,
  type DashboardStageId,
} from './logic'

export type LearningModuleChartDatum = {
  id: string
  number: number
  title: string
  completedLessons: number
  totalLessons: number
  status: LearningModuleState['status']
}

export function deriveLearningModuleChartData(
  states: LearningModuleState[],
  completedLessonIds: ReadonlySet<string>,
): LearningModuleChartDatum[] {
  return states.map(({ module, status }) => ({
    id: module.id,
    number: module.moduleNumber,
    title: module.title,
    completedLessons: module.lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length,
    totalLessons: module.lessons.length,
    status,
  }))
}

export function deriveHomeworkChartData(submissions: LearningSubmission[]) {
  const submitted = submissions.filter((submission) => Boolean(submission.submittedAt))
  const feedbackReceived = submitted.filter((submission) => (
    hasRecordedFeedbackReference(submission.feedbackRef)
  )).length
  return {
    submitted: submitted.length,
    awaitingFeedback: submitted.length - feedbackReceived,
    feedbackReceived,
  }
}

function moduleFill(status: LearningModuleState['status']) {
  if (status === 'homework_submitted') return 'var(--color-chart-feedback)'
  if (status === 'lessons_in_progress') return 'var(--color-chart-awaiting)'
  if (status === 'available') return 'var(--color-muted)'
  return 'url(#locked-hatch)'
}

export function LearningProgressChart({
  states,
  completedLessonIds,
}: {
  states: LearningModuleState[]
  completedLessonIds: ReadonlySet<string>
}) {
  const data = deriveLearningModuleChartData(states, completedLessonIds)
  const width = Math.max(330, data.length * 30 + 14)
  const completedTotal = data.reduce((sum, item) => sum + item.completedLessons, 0)
  const lessonTotal = data.reduce((sum, item) => sum + item.totalLessons, 0)
  const lockedTotal = data.filter((item) => item.status === 'locked').length
  const label = `${completedTotal} of ${lessonTotal} published lessons complete across ${data.length} modules; ${lockedTotal} modules locked by sequence.`

  if (data.length === 0) {
    return <p className="text-sm leading-6 text-muted">No published module records are available, so no learning chart is shown.</p>
  }

  return (
    <div className="mt-4" role="img" aria-label={label} tabIndex={0}>
      <svg viewBox={`0 0 ${width} 76`} className="chart-focusable block h-auto w-full" aria-hidden="true">
        <defs>
          <pattern id="locked-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" className="chart-hatch" />
          </pattern>
        </defs>
        {data.map((item, index) => {
          const x = 8 + index * 30
          const ratio = item.totalLessons > 0 ? item.completedLessons / item.totalLessons : 0
          return (
            <g key={item.id}>
              <title>{`Module ${item.number}: ${item.title}. ${item.completedLessons} of ${item.totalLessons} lessons complete. ${item.status.replaceAll('_', ' ')}.`}</title>
              <rect x={x} y="8" width="22" height="42" rx="6" fill="var(--color-canvas)" stroke="var(--color-line)" strokeWidth="2" />
              <rect x={x + 3} y="11" width="16" height="36" rx="3" fill={moduleFill(item.status)} opacity={item.status === 'locked' ? 1 : .22} />
              {ratio > 0 ? <rect x={x + 3} y={47 - 36 * ratio} width="16" height={36 * ratio} rx="3" fill="var(--color-forest-700)" /> : null}
              <text x={x + 11} y="67" textAnchor="middle" fill="var(--color-muted)" fontSize="9" fontWeight="700">{item.number}</text>
            </g>
          )
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted" aria-hidden="true">
        <span><span className="mr-1 inline-block size-2.5 rounded-sm bg-forest-700" /> Complete</span>
        <span><span className="mr-1 inline-block size-2.5 rounded-sm bg-muted" /> Available</span>
        <span><span className="mr-1 inline-block size-2.5 rounded-sm border border-muted bg-canvas" /> Locked pattern</span>
      </div>
      <div className="sr-only"><table>
        <caption>Learning progress by module</caption>
        <thead><tr><th>Module</th><th>Lessons complete</th><th>Total lessons</th><th>State</th></tr></thead>
        <tbody>{data.map((item) => <tr key={item.id}><th>{item.number}: {item.title}</th><td>{item.completedLessons}</td><td>{item.totalLessons}</td><td>{item.status.replaceAll('_', ' ')}</td></tr>)}</tbody>
      </table></div>
    </div>
  )
}

export function HomeworkStatusChart({ submissions }: { submissions: LearningSubmission[] }) {
  const data = deriveHomeworkChartData(submissions)
  const rows = [
    { label: 'Submitted', value: data.submitted, color: 'bg-forest-700' },
    { label: 'Awaiting feedback', value: data.awaitingFeedback, color: 'bg-chart-awaiting' },
    { label: 'Feedback received', value: data.feedbackReceived, color: 'bg-chart-feedback' },
  ]
  const label = `${data.submitted} homework submissions recorded; ${data.awaitingFeedback} awaiting feedback; ${data.feedbackReceived} with feedback recorded.`
  return (
    <div className="mt-5 grid grid-cols-3 gap-2" role="img" aria-label={label} tabIndex={0}>
      {rows.map((row) => (
        <div key={row.label} className="chart-focusable rounded-xl border border-line bg-canvas p-3 text-center">
          <span className={`mx-auto block size-2.5 rounded-full ${row.color}`} aria-hidden="true" />
          <strong className="mt-2 block text-xl text-ink">{row.value}</strong>
          <span className="mt-1 block text-[11px] font-bold leading-4 text-muted">{row.label}</span>
        </div>
      ))}
      <div className="sr-only"><table><caption>Homework status</caption><tbody>{rows.map((row) => <tr key={row.label}><th>{row.label}</th><td>{row.value}</td></tr>)}</tbody></table></div>
    </div>
  )
}

export function JourneyPositionChart({ stageId }: { stageId: DashboardStageId }) {
  const stages = Object.values(dashboardStages)
  const currentIndex = stages.findIndex((stage) => stage.id === stageId)
  const label = `Current recorded journey position: ${stages[currentIndex].label}, step ${currentIndex + 1} of ${stages.length}. This is not a score.`
  return (
    <div className="mt-5" role="img" aria-label={label} tabIndex={0}>
      <ol className="grid grid-cols-5 gap-1" aria-hidden="true">
        {stages.map((stage, index) => (
          <li key={stage.id} className="min-w-0 text-center">
            <span className={`mx-auto grid size-8 place-items-center rounded-full border-2 text-xs font-extrabold ${index === currentIndex ? 'border-forest-700 bg-forest-50 text-forest-800' : index < currentIndex ? 'border-forest-700 bg-forest-700 text-white' : 'border-muted bg-white text-muted'}`}>{index + 1}</span>
            <span className={`mt-2 hidden text-[10px] font-bold leading-3 sm:block ${index === currentIndex ? 'text-forest-800' : 'text-muted'}`}>{stage.label}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs font-bold text-forest-700">Position {currentIndex + 1} of {stages.length}: {stages[currentIndex].label} · not a score</p>
      <div className="sr-only"><table><caption>Five-stage journey</caption><tbody>{stages.map((stage, index) => <tr key={stage.id}><th>{index + 1}. {stage.label}</th><td>{index === currentIndex ? 'Current recorded position' : index < currentIndex ? 'Earlier recorded position' : 'Not yet reached'}</td></tr>)}</tbody></table></div>
    </div>
  )
}

export type RecordedLearningEvent = {
  id: string
  occurredAt: string
  label: string
  kind: 'lesson' | 'homework'
}

export function deriveRecordedLearningEvents(
  completedLessons: ReadonlyArray<{ lessonId: string; completedAt: string }>,
  submissions: LearningSubmission[],
): RecordedLearningEvent[] {
  return [
    ...completedLessons.map((completion) => ({
      id: `lesson-${completion.lessonId}`,
      occurredAt: completion.completedAt,
      label: 'Lesson completed',
      kind: 'lesson' as const,
    })),
    ...submissions.flatMap((submission) => submission.submittedAt ? [{
      id: `homework-${submission.id}`,
      occurredAt: submission.submittedAt,
      label: 'Homework submitted',
      kind: 'homework' as const,
    }] : []),
  ].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
}

export function RecordedEventTimeline({
  completedLessons,
  submissions,
}: {
  completedLessons: ReadonlyArray<{ lessonId: string; completedAt: string }>
  submissions: LearningSubmission[]
}) {
  const events = deriveRecordedLearningEvents(completedLessons, submissions)
  if (events.length === 0) {
    return <p className="mt-4 rounded-xl border border-line bg-canvas p-3 text-xs leading-5 text-muted">No dated learning actions are recorded yet. No trend line is drawn.</p>
  }
  const formatter = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <div className="chart-focusable mt-5 rounded-xl border border-line bg-canvas p-4" role="img" aria-label={`${events.length} recorded learning events in chronological order. No values are interpolated.`} tabIndex={0}>
      <p className="text-xs font-extrabold uppercase tracking-[.12em] text-muted">Recorded events · no trend line</p>
      <ol className="mt-3 grid gap-3">
        {events.map((event) => (
          <li key={event.id} className="grid grid-cols-[12px_1fr_auto] items-center gap-3 text-xs">
            <span className={`size-3 rounded-full ${event.kind === 'lesson' ? 'bg-forest-700' : 'bg-chart-awaiting'}`} aria-hidden="true" />
            <span className="font-bold text-ink">{event.label}</span>
            <time className="text-muted" dateTime={event.occurredAt}>{formatter.format(new Date(event.occurredAt))}</time>
          </li>
        ))}
      </ol>
      <div className="sr-only"><table><caption>Recorded learning events</caption><tbody>{events.map((event) => <tr key={event.id}><th>{event.label}</th><td>{event.occurredAt}</td></tr>)}</tbody></table></div>
    </div>
  )
}
