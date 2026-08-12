import {
  BookOpenText,
  CheckCircle2,
  CirclePlay,
  ClipboardCheck,
  Clock3,
  LockKeyhole,
} from 'lucide-react'
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

function moduleStatusLabel(status: LearningModuleState['status']) {
  if (status === 'homework_submitted') return 'Submitted'
  if (status === 'lessons_in_progress') return 'In progress'
  if (status === 'available') return 'Ready'
  return 'Locked'
}

function moduleStatusClasses(status: LearningModuleState['status']) {
  if (status === 'homework_submitted') return 'border-forest-700 bg-forest-700 text-white'
  if (status === 'lessons_in_progress') return 'border-forest-400 bg-brand-soft text-forest-900'
  if (status === 'available') return 'border-forest-200 bg-forest-50 text-forest-800'
  return 'border-line bg-canvas text-muted'
}

function ModuleStatusIcon({ status }: { status: LearningModuleState['status'] }) {
  if (status === 'homework_submitted') return <CheckCircle2 size={17} />
  if (status === 'lessons_in_progress') return <BookOpenText size={17} />
  if (status === 'available') return <CirclePlay size={17} />
  return <LockKeyhole size={16} />
}

export function LearningProgressChart({
  states,
  completedLessonIds,
}: {
  states: LearningModuleState[]
  completedLessonIds: ReadonlySet<string>
}) {
  const data = deriveLearningModuleChartData(states, completedLessonIds)
  const completedTotal = data.reduce((sum, item) => sum + item.completedLessons, 0)
  const lessonTotal = data.reduce((sum, item) => sum + item.totalLessons, 0)
  const lockedTotal = data.filter((item) => item.status === 'locked').length
  const progressRatio = lessonTotal > 0 ? completedTotal / lessonTotal : 0
  const activeModule = data.find((item) => item.status === 'lessons_in_progress')
    ?? data.find((item) => item.status === 'available')
  const label = `${completedTotal} of ${lessonTotal} published lessons complete across ${data.length} modules; ${lockedTotal} modules locked by sequence.`

  if (data.length === 0) {
    return <p className="text-sm leading-6 text-muted">No published module records are available, so no learning chart is shown.</p>
  }

  return (
    // Keyboard-focusable with the real values in its label, matching every other
    // visualisation (CompareScreen, CostSummary, FitBreakdown, the timeline) and
    // the commitment in docs/DASHBOARD.md. Not role="img": this region contains a
    // progressbar, a list, and a screen-reader table, and role="img" would hide
    // all three.
    <section
      className="chart-focusable mt-5 rounded-[20px] border border-forest-100 bg-forest-50/55 p-4 sm:p-5"
      aria-label={`Lesson progress. ${label}`}
      tabIndex={0}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.12em] text-forest-700">Lesson progress</p>
          <p className="mt-1 flex items-baseline gap-2 text-muted">
            <strong className="display text-3xl font-extrabold text-ink">{completedTotal}</strong>
            <span className="text-sm font-bold">of {lessonTotal} complete</span>
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-extrabold text-forest-800">
          {activeModule ? <CirclePlay size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
          {activeModule ? `Module ${activeModule.number} ${activeModule.status === 'lessons_in_progress' ? 'in progress' : 'ready'}` : 'All modules submitted'}
        </span>
      </div>

      {lessonTotal > 0 ? (
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-white ring-1 ring-line"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={lessonTotal}
          aria-valuenow={completedTotal}
        >
          <span
            className="block h-full origin-left rounded-full bg-forest-600"
            style={{ transform: `scaleX(${progressRatio})` }}
            aria-hidden="true"
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">No published lesson records are available yet.</p>
      )}

      <p className="mt-3 text-sm font-bold text-forest-900">
        {activeModule
          ? `${activeModule.status === 'lessons_in_progress' ? 'Continue' : 'Start'} Module ${activeModule.number}: ${activeModule.title}`
          : 'All currently published modules have a recorded homework submission.'}
      </p>

      <ol className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 xl:grid-cols-11" aria-label="Modules">
        {data.map((item) => {
          const statusLabel = moduleStatusLabel(item.status)
          return (
            <li
              key={item.id}
              className={`min-w-0 rounded-xl border px-2 py-3 text-center ${moduleStatusClasses(item.status)}`}
              title={`Module ${item.number}: ${item.title}. ${item.completedLessons} of ${item.totalLessons} lessons complete. ${statusLabel}.`}
            >
              <span className="mx-auto grid size-7 place-items-center rounded-full bg-white text-forest-700" aria-hidden="true">
                <ModuleStatusIcon status={item.status} />
              </span>
              <strong className="mt-2 block text-sm">{item.number}</strong>
              <span className="mt-0.5 block truncate text-[10px] font-extrabold uppercase tracking-[.04em]">{statusLabel}</span>
              <span className="sr-only">Module {item.number}: {item.title}. {item.completedLessons} of {item.totalLessons} lessons complete.</span>
            </li>
          )
        })}
      </ol>

      <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-muted">
        <LockKeyhole size={15} className="shrink-0" aria-hidden="true" />
        {lockedTotal === 0 ? 'No modules are sequence-locked.' : `${lockedTotal} module${lockedTotal === 1 ? ' is' : 's are'} sequence-locked until earlier homework is submitted.`}
      </p>
      <div className="sr-only"><table>
        <caption>Learning progress by module</caption>
        <thead><tr><th>Module</th><th>Lessons complete</th><th>Total lessons</th><th>State</th></tr></thead>
        <tbody>{data.map((item) => <tr key={item.id}><th>{item.number}: {item.title}</th><td>{item.completedLessons}</td><td>{item.totalLessons}</td><td>{item.status.replaceAll('_', ' ')}</td></tr>)}</tbody>
      </table></div>
    </section>
  )
}

export function HomeworkStatusChart({ submissions }: { submissions: LearningSubmission[] }) {
  const data = deriveHomeworkChartData(submissions)
  const rows = [
    { label: 'Total submitted', value: data.submitted, color: 'bg-forest-700' },
    { label: 'Waiting', value: data.awaitingFeedback, color: 'bg-chart-awaiting' },
    { label: 'Reviewed', value: data.feedbackReceived, color: 'bg-chart-feedback' },
  ]
  const label = `${data.submitted} homework submissions recorded; ${data.awaitingFeedback} awaiting feedback; ${data.feedbackReceived} with feedback recorded.`

  if (data.submitted === 0) {
    return (
      <section className="chart-focusable mt-4 rounded-2xl border border-line bg-white p-4" aria-label={label} tabIndex={0}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-forest-700" aria-hidden="true"><ClipboardCheck size={20} /></span>
          <div>
            <h3 className="font-extrabold text-ink">No submitted homework yet</h3>
            <p className="mt-1 text-sm leading-6 text-muted">Submission and feedback status appears after your first assignment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="chart-focusable mt-4 rounded-2xl border border-line bg-white p-4" aria-label={label} tabIndex={0}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-forest-700" aria-hidden="true"><ClipboardCheck size={20} /></span>
        <div>
          <h3 className="font-extrabold text-ink">Homework</h3>
          <p className="text-xs text-muted">Only recorded submissions are counted.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl bg-canvas px-3 py-3 text-center">
            <span className={`mx-auto block size-2 rounded-full ${row.color}`} aria-hidden="true" />
            <strong className="mt-1.5 block text-xl text-ink">{row.value}</strong>
            <span className="mt-0.5 block text-[10px] font-extrabold uppercase leading-4 tracking-[.04em] text-muted">{row.label}</span>
          </div>
        ))}
      </div>
      <div className="sr-only"><table><caption>Homework status</caption><tbody>{rows.map((row) => <tr key={row.label}><th>{row.label}</th><td>{row.value}</td></tr>)}</tbody></table></div>
    </section>
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
    return (
      <div className="mt-3 flex items-start gap-3 px-1 py-2 text-sm text-muted">
        <Clock3 size={18} className="mt-0.5 shrink-0 text-forest-600" aria-hidden="true" />
        <p><strong className="text-ink">Activity history starts with your first saved action.</strong> Saved lessons and homework will appear here with their dates.</p>
      </div>
    )
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
