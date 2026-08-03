import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  Headphones,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type {
  LearningLesson,
  LearningModule,
  LearningSubmission,
  LearningTrack,
  LearningUserState,
} from '../types'
import {
  downloadLearningSubmissionFile,
  getLearningTrack,
  getLearningUserState,
  markLearningLessonComplete,
  submitLearningAssignment,
} from '../data/repository'
import {
  deriveLearningModuleStates,
  findLearningContinueModule,
  MAX_SUBMISSION_FILE_BYTES,
  SUBMISSION_ACCEPT_ATTRIBUTE,
  SUBMISSION_ACCEPTED_LABEL,
  validateLearningSubmissionFile,
  type LearningModuleDisplayStatus,
} from '../learning/logic'
import { triggerBlobDownload } from '../learning/download'
import {
  LearningDesignedState,
  LearningLoadingState,
  useOnlineStatus,
  type LearningLoadingKind,
} from '../components/States'
import { shouldAnimateMotion } from '../motion/preference'
import { AppLink } from '../components/AppLink'
import { learningPath, viewPaths } from '../routes'

type LearningNavigation = {
  onOpenTrack: () => void
  onOpenModule: (moduleSlug: string) => void
  onOpenLesson: (moduleSlug: string, lessonSlug: string) => void
  onOpenAssignment: (moduleSlug: string) => void
  onSignIn: () => void
}

type LearningScreenProps = LearningNavigation & {
  userId: string | null
}

const emptyUserState: LearningUserState = {
  completedLessonIds: new Set(),
  submissions: [],
}

function useLearningPortalData(userId: string | null) {
  const online = useOnlineStatus()
  const [retry, setRetry] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [track, setTrack] = useState<LearningTrack | null>(null)
  const [userState, setUserState] = useState<LearningUserState>(emptyUserState)

  useEffect(() => {
    if (!online) return
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect -- A connectivity, user, or retry change starts a fresh repository request.
    setLoading(true)
    setError(null)
    Promise.all([
      getLearningTrack(),
      userId ? getLearningUserState(userId) : Promise.resolve(emptyUserState),
    ])
      .then(([nextTrack, nextUserState]) => {
        if (!active) return
        setTrack(nextTrack)
        setUserState(nextUserState)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason : new Error('The learning portal did not load.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [online, retry, userId])

  return {
    online,
    loading,
    error,
    track,
    userState,
    retry: () => setRetry((current) => current + 1),
  }
}

function LearningStateBoundary({
  kind,
  data,
  children,
}: {
  kind: LearningLoadingKind
  data: ReturnType<typeof useLearningPortalData>
  children: (track: LearningTrack, userState: LearningUserState) => React.ReactNode
}) {
  if (!data.online && !data.track) {
    return (
      <LearningDesignedState
        state="offline"
        title="You’re offline"
        body="Your saved work is safe. Reconnect to load this part of the course."
        action="Try again"
        onAction={data.retry}
      />
    )
  }
  if (data.loading && !data.track) return <LearningLoadingState kind={kind} />
  if (data.error) {
    return (
      <LearningDesignedState
        state="error"
        title="This part of the course did not load"
        body="Nothing was changed. Try again when your connection is steady."
        action="Try again"
        onAction={data.retry}
      />
    )
  }
  if (!data.track) {
    return (
      <LearningDesignedState
        state="empty"
        title="The learning track is not available yet"
        body="The course record could not be found. No placeholder lesson has been invented."
        action="Check again"
        onAction={data.retry}
      />
    )
  }
  return (
    <>
      {!data.online ? (
        <div className="page-container pt-4" role="status">
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <strong>You’re offline.</strong> The page stays open so your selected file and place are not lost. Reconnect before saving or uploading.
          </div>
        </div>
      ) : null}
      {children(data.track, data.userState)}
    </>
  )
}

const moduleStatusCopy: Record<LearningModuleDisplayStatus, string> = {
  locked: 'Locked',
  available: 'Available',
  lessons_in_progress: 'Lessons in progress',
  homework_submitted: 'Homework submitted',
}

function StatusBadge({ status }: { status: LearningModuleDisplayStatus }) {
  const tone = status === 'homework_submitted'
    ? 'bg-forest-100 text-forest-900'
    : status === 'locked'
      ? 'bg-stone-100 text-stone-600'
      : 'bg-amber-100 text-amber-950'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${tone}`}>
      {status === 'locked' ? <LockKeyhole size={13} /> : null}
      {status === 'homework_submitted' ? <Check size={13} /> : null}
      {moduleStatusCopy[status]}
    </span>
  )
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const value = total === 0 ? 0 : Math.round((completed / total) * 100)
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-bold text-ink">Overall progress</span>
        <span className="text-muted">{completed} of {total} homework submissions</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-forest-100" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}>
        <div className="motion-progress h-full w-full rounded-full bg-forest-700" style={{ transform: `scaleX(${value / 100})` }} />
      </div>
    </div>
  )
}

export function LearningTrackScreen(props: LearningScreenProps) {
  const data = useLearningPortalData(props.userId)
  return (
    <LearningStateBoundary kind="track" data={data}>
      {(track, userState) => {
        const states = deriveLearningModuleStates(
          track.modules,
          userState.submissions,
          userState.completedLessonIds,
        )
        const submittedCount = states.filter(({ status }) => status === 'homework_submitted').length
        const continueModule = findLearningContinueModule(states)
        return (
          <div className="page-container py-6 sm:py-10">
            <section className="rounded-[24px] border border-forest-100 bg-white p-5 shadow-soft sm:p-8">
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-forest-700">Learning portal</p>
              <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_300px] lg:items-end">
                <div>
                  <h1 className="display text-3xl font-extrabold sm:text-5xl">{track.title}</h1>
                  <p className="mt-3 max-w-2xl leading-7 text-muted">{track.description}</p>
                </div>
                {continueModule ? (
                  <AppLink
                    href={learningPath('learn_module', continueModule.slug)}
                    onNavigate={() => props.onOpenModule(continueModule.slug)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-forest-800 px-5 py-3 text-left font-bold text-white"
                  >
                    <span><span className="block text-xs font-semibold text-forest-100">Continue where you left off</span>{continueModule.title}</span>
                    <ArrowRight size={19} className="shrink-0" />
                  </AppLink>
                ) : null}
              </div>
              <div className="mt-7">
                {props.userId
                  ? <ProgressBar completed={submittedCount} total={track.modules.length} />
                  : <p className="rounded-xl bg-forest-50 px-4 py-3 text-sm text-forest-950">Browse the curriculum now. Sign in when you want to save lesson progress or submit homework.</p>}
              </div>
            </section>

            <section className="mt-7" aria-labelledby="module-list-title">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-forest-700">{track.modules.length} modules</p>
                  <h2 id="module-list-title" className="display text-2xl font-extrabold">Your course</h2>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {states.map(({ module, status }) => (
                  <article key={module.id} className="flex min-h-44 flex-col rounded-2xl border border-line bg-white p-5 shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-extrabold text-forest-700">Module {module.moduleNumber}</p>
                      <StatusBadge status={status} />
                    </div>
                    <h3 className="display mt-3 text-xl font-extrabold">{module.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-muted">{module.summary}</p>
                    <AppLink
                      href={learningPath('learn_module', module.slug)}
                      onNavigate={() => props.onOpenModule(module.slug)}
                      className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-forest-200 px-4 py-2.5 font-bold text-forest-800"
                    >
                      {status === 'locked' ? 'Preview with warning' : 'Open module'}
                      <ArrowRight size={17} />
                    </AppLink>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )
      }}
    </LearningStateBoundary>
  )
}

function SequenceGate({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5" role="alert">
      <div className="flex items-start gap-3">
        <LockKeyhole className="mt-0.5 shrink-0 text-amber-900" size={22} />
        <div>
          <h2 className="font-extrabold text-amber-950">This module is later in the course</h2>
          <p className="mt-2 text-sm leading-6 text-amber-950">It normally opens after you submit the previous module’s homework. If time is short, you can jump ahead now, but you may miss useful preparation.</p>
          <button
            onClick={onContinue}
            className="mt-4 min-h-11 rounded-xl bg-amber-900 px-4 py-2.5 font-bold text-white"
          >
            Continue anyway
          </button>
        </div>
      </div>
    </section>
  )
}

function useModuleAccess(
  module: LearningModule,
  track: LearningTrack,
  userState: LearningUserState,
) {
  const [bypassed, setBypassed] = useState(false)
  const states = useMemo(() => deriveLearningModuleStates(
    track.modules,
    userState.submissions,
    userState.completedLessonIds,
    bypassed ? new Set([module.slug]) : new Set(),
  ), [bypassed, module.slug, track.modules, userState])
  const state = states.find(({ module: item }) => item.id === module.id)
  return {
    allowed: state?.unlocked ?? false,
    bypassed,
    allow: () => setBypassed(true),
  }
}

function ModuleBreadcrumb({
  module,
  onOpenTrack,
}: {
  module: LearningModule
  onOpenTrack: () => void
}) {
  return (
    <AppLink href={viewPaths.learn as string} onNavigate={onOpenTrack} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-forest-700">
      <ArrowLeft size={17} />
      Learning portal <span className="text-muted">/ Module {module.moduleNumber}</span>
    </AppLink>
  )
}

export function LearningModuleScreen(
  props: LearningScreenProps & { moduleSlug: string },
) {
  const data = useLearningPortalData(props.userId)
  return (
    <LearningStateBoundary kind="module" data={data}>
      {(track, userState) => {
        const module = track.modules.find((item) => item.slug === props.moduleSlug)
        if (!module) {
          return (
            <LearningDesignedState
              state="empty"
              title="That module was not found"
              body="Return to the course to choose an available module."
              action="Back to course"
              onAction={props.onOpenTrack}
            />
          )
        }
        return <LearningModuleContent {...props} track={track} module={module} userState={userState} />
      }}
    </LearningStateBoundary>
  )
}

function LearningModuleContent({
  track,
  module,
  userState,
  userId,
  onOpenTrack,
  onOpenLesson,
  onOpenAssignment,
  onSignIn,
}: LearningScreenProps & {
  track: LearningTrack
  module: LearningModule
  userState: LearningUserState
}) {
  const access = useModuleAccess(module, track, userState)
  const allLessonsDraft = module.lessons.length > 0
    && module.lessons.every((lesson) => lesson.status === 'draft')

  return (
    <div className="page-container max-w-6xl py-5 sm:py-9">
      <ModuleBreadcrumb module={module} onOpenTrack={onOpenTrack} />
      <div className="mt-3 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-forest-700">Module {module.moduleNumber}</p>
          <h1 className="display mt-2 text-3xl font-extrabold sm:text-5xl">{module.title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-muted">{module.summary}</p>

          {!access.allowed ? <SequenceGate onContinue={access.allow} /> : null}

          {allLessonsDraft ? (
            <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-950">
              <strong>Lessons are being written — the assignment is open.</strong>
              <p className="mt-1 text-sm leading-6">You can read the assignment brief and download its blank template now.</p>
            </div>
          ) : null}

          <details open className="group mt-7 rounded-2xl border border-line bg-canvas/40" aria-labelledby="lessons-title">
            <summary className="flex min-h-14 cursor-pointer list-none items-center px-4 py-3">
              <h2 id="lessons-title" className="display text-2xl font-extrabold">Lessons</h2>
              <span className="ml-2 text-sm font-bold text-muted">{module.lessons.length}</span>
              <ChevronDown size={18} className="ml-auto transition group-open:rotate-180" />
            </summary>
            <div className="motion-disclosure">
              <div className="overflow-hidden">
                {module.lessons.length === 0 ? (
                  <div className="border-t border-line bg-white p-5">
                    <p className="font-bold">No lesson authoring slots were found.</p>
                    <p className="mt-2 text-sm text-muted">The assignment remains available below.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 border-t border-line p-3">
                    {module.lessons.map((lesson) => {
                      const completed = userState.completedLessonIds.has(lesson.id)
                      const content = (
                        <>
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700">
                            {completed ? <CheckCircle2 size={22} /> : <PlayCircle size={22} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="font-extrabold">{lesson.title}</span>
                            <span className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                              <span>{lesson.status === 'draft' ? 'Draft authoring slot' : 'Published'}</span>
                              <span className="inline-flex items-center gap-1"><Clock3 size={13} />{lesson.durationMinutes ? `${lesson.durationMinutes} min` : 'Duration not set'}</span>
                            </span>
                          </span>
                          <ArrowRight size={18} className="shrink-0 text-muted" />
                        </>
                      )
                      return access.allowed ? (
                        <AppLink
                          key={lesson.id}
                          href={learningPath('learn_lesson', module.slug, lesson.slug)}
                          onNavigate={() => onOpenLesson(module.slug, lesson.slug)}
                          className="flex min-h-20 w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left"
                        >
                          {content}
                        </AppLink>
                      ) : (
                        <button key={lesson.id} disabled className="flex min-h-20 w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left disabled:cursor-not-allowed disabled:opacity-60">
                          {content}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </details>
        </div>

        <aside className="lg:pt-16">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <p className="text-sm font-extrabold text-forest-700">Module assignment</p>
            <h2 className="display mt-2 text-xl font-extrabold">{module.assignment.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{module.assignment.brief}</p>
            {userId && access.allowed ? (
              <a
                href={module.assignment.templateRef}
                download
                className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-forest-200 px-4 py-2.5 font-bold text-forest-800"
              >
                <Download size={17} /> Download blank template
              </a>
            ) : userId ? (
              <button
                onClick={access.allow}
                className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-forest-200 px-4 py-2.5 font-bold text-forest-800"
              >
                Continue to unlock template
              </button>
            ) : (
              <AppLink
                href={viewPaths.auth as string}
                onNavigate={onSignIn}
                className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-forest-200 px-4 py-2.5 font-bold text-forest-800"
              >
                Sign in to download
              </AppLink>
            )}
            {access.allowed ? (
              <AppLink
                href={learningPath('learn_assignment', module.slug)}
                onNavigate={() => onOpenAssignment(module.slug)}
                className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest-800 px-4 py-3 font-bold text-white"
              >
                Open assignment <ArrowRight size={17} />
              </AppLink>
            ) : (
              <button disabled className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest-800 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                Open assignment <ArrowRight size={17} />
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function LessonMedia({ lesson }: { lesson: LearningLesson }) {
  return (
    <section aria-label="Lesson media">
      {lesson.mediaUrl ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-ink">
          <video className="aspect-video w-full" controls preload="metadata" src={lesson.mediaUrl}>
            Your browser cannot play this media. Use the transcript or audio option below.
          </video>
        </div>
      ) : (
        <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-line bg-white p-6 text-center">
          <div>
            <BookOpen className="mx-auto text-forest-700" size={36} />
            <p className="mt-3 font-extrabold">Media has not been published.</p>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_300px]">
        <article className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <FileText size={19} className="text-forest-700" />
            <h2 className="display text-xl font-extrabold">Readable transcript</h2>
          </div>
          {lesson.transcript ? (
            <div className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-ink">{lesson.transcript}</div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">The transcript has not been published.</p>
          )}
        </article>

        <aside className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center gap-2">
            <Headphones size={19} className="text-forest-700" />
            <h2 className="font-extrabold">Audio-only</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">Use less data without loading the video.</p>
          {lesson.audioUrl ? (
            <audio className="mt-4 w-full" controls preload="none" src={lesson.audioUrl}>
              Your browser cannot play this audio.
            </audio>
          ) : (
            <p className="mt-4 rounded-xl bg-canvas p-3 text-sm text-muted">The audio-only file has not been published.</p>
          )}
        </aside>
      </div>
    </section>
  )
}

export function LearningLessonScreen(
  props: LearningScreenProps & { moduleSlug: string; lessonSlug: string },
) {
  const data = useLearningPortalData(props.userId)
  return (
    <LearningStateBoundary kind="lesson" data={data}>
      {(track, userState) => {
        const module = track.modules.find((item) => item.slug === props.moduleSlug)
        const lesson = module?.lessons.find((item) => item.slug === props.lessonSlug)
        if (!module || !lesson) {
          return (
            <LearningDesignedState
              state="empty"
              title="That lesson was not found"
              body="Return to the learning portal to choose a lesson."
              action="Back to course"
              onAction={props.onOpenTrack}
            />
          )
        }
        return <LearningLessonContent {...props} track={track} module={module} lesson={lesson} userState={userState} reload={data.retry} />
      }}
    </LearningStateBoundary>
  )
}

function LearningLessonContent({
  track,
  module,
  lesson,
  userState,
  userId,
  onOpenTrack,
  onOpenModule,
  onOpenAssignment,
  onSignIn,
  reload,
}: LearningScreenProps & {
  track: LearningTrack
  module: LearningModule
  lesson: LearningLesson
  userState: LearningUserState
  reload: () => void
}) {
  const access = useModuleAccess(module, track, userState)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const completed = userState.completedLessonIds.has(lesson.id)

  const completeLesson = async () => {
    if (!userId) {
      onSignIn()
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await markLearningLessonComplete(userId, lesson.id)
      reload()
    } catch {
      setSaveError('Progress was not saved. Your place on this page is unchanged; reconnect and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container max-w-5xl py-5 sm:py-9">
      <ModuleBreadcrumb module={module} onOpenTrack={() => onOpenModule(module.slug)} />
      <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.14em] text-forest-700">Lesson</p>
      <h1 className="display mt-2 text-3xl font-extrabold sm:text-5xl">{lesson.title}</h1>
      <p className="mt-3 text-sm text-muted">{lesson.durationMinutes ? `${lesson.durationMinutes} min` : 'Duration will be set when the lesson is authored.'}</p>

      {!access.allowed ? <SequenceGate onContinue={access.allow} /> : null}

      {access.allowed ? (
        <>
          {lesson.status === 'draft' ? (
            <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5">
              <h2 className="font-extrabold text-sky-950">Lessons are being written — the assignment is open.</h2>
              <p className="mt-2 text-sm leading-6 text-sky-950">No teaching text, transcript, media, or duration has been filled in for this authoring slot.</p>
              <AppLink
                href={learningPath('learn_assignment', module.slug)}
                onNavigate={() => onOpenAssignment(module.slug)}
                className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-sky-900 px-4 py-2.5 font-bold text-white"
              >
                Open assignment
              </AppLink>
            </section>
          ) : (
            <div className="mt-6">
              <LessonMedia lesson={lesson} />
              {lesson.body ? (
                <article className="mt-5 rounded-2xl border border-line bg-white p-5 leading-7 sm:p-7">
                  <h2 className="display text-xl font-extrabold">Lesson text</h2>
                  <div className="mt-4 whitespace-pre-wrap">{lesson.body}</div>
                </article>
              ) : null}
              {saveError ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">{saveError}</p> : null}
              <button
                onClick={() => void completeLesson()}
                disabled={saving || completed}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white disabled:opacity-60 sm:w-auto"
              >
                {completed ? <><CheckCircle2 size={18} /> Completed</> : saving ? 'Saving…' : userId ? 'Mark as complete' : 'Sign in to save progress'}
              </button>
            </div>
          )}
        </>
      ) : null}

      <AppLink href={viewPaths.learn as string} onNavigate={onOpenTrack} className="mt-8 inline-flex min-h-11 items-center gap-2 font-bold text-forest-700">
        <ArrowLeft size={17} /> Back to course
      </AppLink>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function SubmissionView({
  submission,
  onUploadAnother,
  celebrate = false,
}: {
  submission: LearningSubmission
  onUploadAnother: () => void
  celebrate?: boolean
}) {
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const downloadFile = async (file: LearningSubmission['files'][number]) => {
    setDownloadError(null)
    try {
      const blob = await downloadLearningSubmissionFile(file.storagePath)
      triggerBlobDownload(blob, file.originalFilename)
    } catch {
      setDownloadError('The file could not be downloaded. Reconnect and try again.')
    }
  }

  return (
    <section className="mt-7" aria-labelledby="submission-title">
      <div className={`rounded-2xl border border-forest-200 bg-white p-5 shadow-soft sm:p-7 ${celebrate ? 'motion-celebrate' : ''}`} role="status" aria-live="polite">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-forest-100 text-forest-800"><ShieldCheck size={24} /></span>
          <div>
            <p className="text-sm font-extrabold text-forest-700">Submission saved</p>
            <h2 id="submission-title" className="display mt-1 text-2xl font-extrabold">Your work is pending</h2>
            <p className="mt-2 leading-7 text-muted">Your work is saved. Review and feedback are not available in this version of 4Prep.</p>
            {submission.submittedAt ? (
              <p className="mt-2 text-sm text-muted">Submitted {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(submission.submittedAt))}</p>
            ) : null}
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          {submission.files.map((file, index) => (
            <div key={file.id} className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-4 sm:flex-row sm:items-center">
              <FileText className="shrink-0 text-forest-700" size={22} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{file.originalFilename}</p>
                <p className="mt-1 text-xs text-muted">{formatBytes(file.byteSize)} · Upload {index + 1}</p>
              </div>
              <button
                onClick={() => void downloadFile(file)}
                className="min-h-11 rounded-xl border border-line px-4 py-2 text-sm font-bold text-forest-800"
              >
                Download
              </button>
            </div>
          ))}
        </div>
        {downloadError ? <p className="mt-4 text-sm text-red-800" role="alert">{downloadError}</p> : null}
        <button onClick={onUploadAnother} className="mt-5 min-h-11 rounded-xl border border-forest-200 px-4 py-2.5 font-bold text-forest-800">
          Upload another version
        </button>
      </div>
    </section>
  )
}

export function LearningAssignmentScreen(
  props: LearningScreenProps & { moduleSlug: string },
) {
  const data = useLearningPortalData(props.userId)
  return (
    <LearningStateBoundary kind="assignment" data={data}>
      {(track, userState) => {
        const module = track.modules.find((item) => item.slug === props.moduleSlug)
        if (!module) {
          return (
            <LearningDesignedState
              state="empty"
              title="That assignment was not found"
              body="Return to the course to choose a module."
              action="Back to course"
              onAction={props.onOpenTrack}
            />
          )
        }
        return <LearningAssignmentContent {...props} track={track} module={module} userState={userState} reload={data.retry} />
      }}
    </LearningStateBoundary>
  )
}

function LearningAssignmentContent({
  track,
  module,
  userState,
  userId,
  onOpenTrack,
  onOpenModule,
  onSignIn,
  reload,
}: LearningScreenProps & {
  track: LearningTrack
  module: LearningModule
  userState: LearningUserState
  reload: () => void
}) {
  const access = useModuleAccess(module, track, userState)
  const existingSubmission = userState.submissions.find(
    (submission) => submission.assignmentId === module.assignment.id && submission.submittedAt,
  )
  const [showUpload, setShowUpload] = useState(!existingSubmission)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [submission, setSubmission] = useState<LearningSubmission | null>(existingSubmission ?? null)
  const [celebrateSubmission, setCelebrateSubmission] = useState(false)

  const chooseFile = (nextFile: File | null) => {
    setFile(nextFile)
    setUploadError(null)
    setFileError(nextFile ? validateLearningSubmissionFile(nextFile) : null)
  }

  const upload = async () => {
    if (!userId) {
      onSignIn()
      return
    }
    if (!file) {
      setFileError('Choose your completed file before uploading.')
      return
    }
    const validationError = validateLearningSubmissionFile(file)
    if (validationError) {
      setFileError(validationError)
      return
    }

    setUploadError(null)
    setUploadProgress(0)
    try {
      const saved = await submitLearningAssignment({
        userId,
        assignment: module.assignment,
        file,
        onProgress: setUploadProgress,
      })
      setSubmission(saved)
      setCelebrateSubmission(shouldAnimateMotion())
      setShowUpload(false)
      setFile(null)
      reload()
    } catch (reason) {
      setUploadError(reason instanceof Error ? reason.message : 'The upload failed.')
    } finally {
      setUploadProgress(null)
    }
  }

  if (submission?.submittedAt && submission.files.length === 0 && !showUpload) {
    return (
      <LearningDesignedState
        state="empty"
        title="The submission record has no file"
        body="Your assignment record exists, but its uploaded file could not be found. Reopen the upload form and add the file again."
        action="Upload file"
        onAction={() => setShowUpload(true)}
      />
    )
  }

  return (
    <div className="page-container max-w-4xl py-5 sm:py-9">
      <ModuleBreadcrumb module={module} onOpenTrack={() => onOpenModule(module.slug)} />
      <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.14em] text-forest-700">Assignment</p>
      <h1 className="display mt-2 text-3xl font-extrabold sm:text-5xl">{module.assignment.title}</h1>
      <div className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-7">
        <p className="text-sm font-extrabold text-forest-700">What to submit</p>
        <p className="mt-2 text-lg leading-8 text-ink">{module.assignment.brief}</p>
        <p className="mt-4 text-sm leading-6 text-muted">After upload, your work is stored as pending. Review, grading, and feedback are not available in this release.</p>
      </div>

      {!access.allowed ? <SequenceGate onContinue={access.allow} /> : null}

      {access.allowed ? (
        <>
          {submission?.submittedAt && !showUpload ? (
            <SubmissionView
              submission={submission}
              celebrate={celebrateSubmission}
              onUploadAnother={() => {
                setCelebrateSubmission(false)
                setShowUpload(true)
              }}
            />
          ) : (
            <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-7" aria-labelledby="upload-title">
              <h2 id="upload-title" className="display text-2xl font-extrabold">Upload homework</h2>
              <div className="mt-4 rounded-xl bg-forest-50 p-4 text-sm leading-6 text-forest-950">
                <p><strong>Accepted:</strong> {SUBMISSION_ACCEPTED_LABEL}</p>
                <p><strong>Maximum size:</strong> {MAX_SUBMISSION_FILE_BYTES / (1024 * 1024)} MB per file</p>
              </div>

              {userId ? (
                <>
                  <a
                    href={module.assignment.templateRef}
                    download
                    className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-forest-200 px-4 py-2.5 font-bold text-forest-800"
                  >
                    <Download size={17} /> Download blank template
                  </a>
                  <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-forest-200 bg-canvas p-5 text-center">
                    <UploadCloud size={30} className="text-forest-700" />
                    <span className="mt-2 font-extrabold">{file ? file.name : 'Choose your completed file'}</span>
                    <span className="mt-1 text-sm text-muted">{file ? formatBytes(file.size) : 'You will see the file name here before upload.'}</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept={SUBMISSION_ACCEPT_ATTRIBUTE}
                      onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                    />
                  </label>
                </>
              ) : (
                <AppLink href={viewPaths.auth as string} onNavigate={onSignIn} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-forest-800 px-5 py-3 font-bold text-white">
                  Sign in to download and submit
                </AppLink>
              )}

              {fileError ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">{fileError}</p> : null}
              {uploadError ? (
                <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="alert">
                  <strong>The upload did not finish.</strong>
                  <p className="mt-1">Your selected file is still here; nothing was lost. Check your connection and retry.</p>
                  <p className="mt-1">{uploadError}</p>
                </div>
              ) : null}
              {uploadProgress !== null ? (
                <div className="mt-5" aria-live="polite">
                  <div className="mb-2 flex justify-between text-sm font-bold"><span>Uploading</span><span>{uploadProgress}%</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-forest-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress}>
                    <div className="motion-progress h-full w-full rounded-full bg-forest-700" style={{ transform: `scaleX(${uploadProgress / 100})` }} />
                  </div>
                </div>
              ) : null}
              {userId ? (
                <button
                  onClick={() => void upload()}
                  disabled={!file || Boolean(fileError) || uploadProgress !== null}
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UploadCloud size={18} /> {uploadError ? 'Retry upload' : 'Upload homework'}
                </button>
              ) : null}
            </section>
          )}
        </>
      ) : null}

      <AppLink href={viewPaths.learn as string} onNavigate={onOpenTrack} className="mt-8 inline-flex min-h-11 items-center gap-2 font-bold text-forest-700">
        <ArrowLeft size={17} /> Back to course
      </AppLink>
    </div>
  )
}
