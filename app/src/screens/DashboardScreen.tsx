import {
  ArrowRight,
  Bookmark,
  BookOpenCheck,
  ClipboardList,
  Compass,
  Flag,
  LayoutDashboard,
  ShieldCheck,
  UserRound,
  Wrench,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type {
  LearningTrack,
  LearningUserState,
  Pathway,
  StudentProfile,
  University,
  View,
} from '../types'
import { ExpandableFit } from '../components/Trust'
import { DesignedState, LoadingState, useOnlineStatus } from '../components/States'
import {
  getLearningTrack,
  getLearningUserState,
  getRankedPathway,
  listUniversities,
} from '../data/repository'
import {
  deriveLearningModuleStates,
  findLearningContinueModule,
} from '../learning/logic'
import {
  deriveDashboardNextAction,
  deriveDashboardStage,
  hasRecordedFeedbackReference,
  type DashboardNextAction,
  type DashboardStage,
} from '../dashboard/logic'
import { AppLink } from '../components/AppLink'
import { viewPaths } from '../routes'
import {
  HomeworkStatusChart,
  JourneyPositionChart,
  LearningProgressChart,
  RecordedEventTimeline,
} from '../dashboard/ProgressCharts'

type DashboardData = {
  catalogue: University[]
  pathway: Pathway | null
  track: LearningTrack | null
  learningUserState: LearningUserState
  catalogueUnavailable: boolean
  learningUnavailable: boolean
  learningUserStateUnavailable: boolean
}

const emptyLearningState: LearningUserState = {
  completedLessonIds: new Set(),
  submissions: [],
}

function useDashboardData(userId: string, profile: StudentProfile | null) {
  const online = useOnlineStatus()
  const [retry, setRetry] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'offline'>('loading')
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (!online) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Connectivity determines whether private dashboard data can be checked.
      setStatus('offline')
      return
    }
    let active = true
    setStatus('loading')
    const catalogueRequest = profile
      ? getRankedPathway(profile).then((pathway) => ({ catalogue: pathway.ranked, pathway }))
      : listUniversities().then((catalogue) => ({ catalogue, pathway: null }))

    Promise.allSettled([
      catalogueRequest,
      getLearningTrack(),
      getLearningUserState(userId),
    ]).then(([catalogueResult, trackResult, userStateResult]) => {
      if (!active) return
      const everyRequestFailed = catalogueResult.status === 'rejected'
        && trackResult.status === 'rejected'
        && userStateResult.status === 'rejected'
      if (everyRequestFailed) {
        setStatus('error')
        return
      }
      setData({
        catalogue: catalogueResult.status === 'fulfilled' ? catalogueResult.value.catalogue : [],
        pathway: catalogueResult.status === 'fulfilled' ? catalogueResult.value.pathway : null,
        track: trackResult.status === 'fulfilled' ? trackResult.value : null,
        learningUserState: userStateResult.status === 'fulfilled'
          ? userStateResult.value
          : emptyLearningState,
        catalogueUnavailable: catalogueResult.status === 'rejected',
        learningUnavailable: trackResult.status === 'rejected' || userStateResult.status === 'rejected',
        learningUserStateUnavailable: userStateResult.status === 'rejected',
      })
      setStatus('ready')
    })
    return () => {
      active = false
    }
  }, [online, profile, retry, userId])

  return {
    data,
    status,
    retry: () => setRetry((current) => current + 1),
  }
}

type DashboardProps = {
  userId: string | null
  profile: StudentProfile | null
  saved: ReadonlySet<string>
  onNavigate: (view: View) => void
  onOpenUniversity: (university: University) => void
}

export function DashboardScreen(props: DashboardProps) {
  if (!props.userId) {
    return <SignedOutDashboard onNavigate={props.onNavigate} />
  }
  return <SignedInDashboard {...props} userId={props.userId} />
}

function SignedOutDashboard({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <div className="page-container py-8 sm:py-12">
      <section className="soft-grid overflow-hidden rounded-[28px] border border-line bg-white p-6 shadow-soft sm:p-10">
        <span className="grid size-14 place-items-center rounded-2xl bg-forest-50 text-forest-700"><LayoutDashboard size={27} /></span>
        <p className="mt-6 text-sm font-extrabold uppercase tracking-[.14em] text-forest-700">Student dashboard</p>
        <h1 className="display mt-2 max-w-2xl text-3xl font-extrabold sm:text-5xl">Return to the work you actually saved</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">Sign in to bring your intake profile, saved universities, lesson progress, and homework submissions together. Signed-out visitors can still browse the sourced catalogue and learning curriculum.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <AppLink href={viewPaths.auth as string} onNavigate={() => onNavigate('auth')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white">Sign in <ArrowRight size={18} /></AppLink>
          <AppLink href={viewPaths.search as string} onNavigate={() => onNavigate('search')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 py-3 font-bold text-forest-800">Browse without signing in</AppLink>
        </div>
      </section>
    </div>
  )
}

function SignedInDashboard({
  userId,
  profile,
  saved,
  onNavigate,
  onOpenUniversity,
}: DashboardProps & { userId: string }) {
  const resource = useDashboardData(userId, profile)
  if (resource.status === 'loading') return <LoadingState kind="dashboard" />
  if (resource.status === 'error' || resource.status === 'offline') {
    return <DesignedState state={resource.status} onReset={resource.retry} />
  }
  if (!resource.data) return <DesignedState state="error" onReset={resource.retry} />

  const { data } = resource
  const submitted = data.learningUserState.submissions.filter((item) => item.submittedAt)
  const signals = {
    hasCompletedIntake: Boolean(profile),
    savedPlanCount: saved.size,
    completedLessonCount: data.learningUserState.completedLessonIds.size,
    submittedHomeworkCount: submitted.length,
    feedbackReceivedCount: submitted.filter((item) => (
      hasRecordedFeedbackReference(item.feedbackRef)
    )).length,
  }
  const stage = deriveDashboardStage(signals)
  const nextAction = deriveDashboardNextAction(signals)
  const savedUniversities = data.catalogue.filter((university) => saved.has(university.id))
  const topRoute = data.pathway?.ranked[0] ?? null
  const learningStates = data.track
    ? deriveLearningModuleStates(
      data.track.modules,
      data.learningUserState.submissions,
      data.learningUserState.completedLessonIds,
    )
    : []
  const continueModule = findLearningContinueModule(learningStates)

  if (stage.id === 'not_started' && !data.learningUserStateUnavailable) {
    return (
      <DashboardEmpty
        learningUnavailable={data.learningUnavailable}
        learningStates={learningStates}
        completedLessonIds={data.learningUserState.completedLessonIds}
        submissions={data.learningUserState.submissions}
        onNavigate={onNavigate}
        stage={stage}
      />
    )
  }

  return (
    <div className="page-container motion-resolve py-8 sm:py-12">
      <section className="rounded-[24px] bg-forest-900 p-6 text-white shadow-card sm:p-9">
        <p className="text-sm font-extrabold uppercase tracking-[.14em] text-forest-200">Student dashboard</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="display text-3xl font-extrabold sm:text-5xl">Pick up the next real step</h1>
            <p className="mt-3 max-w-2xl leading-7 text-white/75">This page reports recorded actions only. It does not grade your progress or predict an admission outcome.</p>
            <button type="button" onClick={() => onNavigate('auth')} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/35 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"><UserRound size={17} /> Account details</button>
          </div>
          <NextAction
            action={nextAction}
            topRoute={topRoute}
            onNavigate={onNavigate}
            onOpenUniversity={onOpenUniversity}
          />
        </div>
      </section>

      <div className="mt-6 gap-5 lg:columns-2 [&>section]:mb-5 [&>section]:break-inside-avoid">
        <DashboardCard icon={<Flag />} eyebrow="Where you are" title={data.learningUserStateUnavailable ? 'Stage could not be checked' : stage.label}>
          {data.learningUserStateUnavailable ? (
            <UnavailableNote>Your private lesson and homework records could not be loaded, so 4Prep will not guess your stage. Reconnect and retry.</UnavailableNote>
          ) : (
            <>
              <p className="text-sm leading-6 text-muted">{stage.description}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[.1em] text-forest-700">Recorded actions only · not a grade or admission prediction</p>
              <JourneyPositionChart stageId={stage.id} />
            </>
          )}
        </DashboardCard>

        <DashboardCard icon={<ClipboardList />} eyebrow="What you are working toward" title={profile ? 'Your study goal' : 'Intake not completed'}>
          {profile ? (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <DashboardFact label="Destination" value={profile.country} />
                <DashboardFact label="Field" value={profile.field} />
                <DashboardFact label="Budget" value={formatBudget(profile)} />
                <DashboardFact label="Intake" value={profile.intake} />
              </dl>
              {topRoute?.fit ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-muted">First route to review · not an outcome prediction</p>
                  <ExpandableFit fit={topRoute.fit} compact />
                </div>
              ) : null}
              <AppLink href={viewPaths.intake as string} onNavigate={() => onNavigate('intake')} className="mt-4 inline-flex items-center gap-2 font-bold text-forest-700">Change intake answers <ArrowRight size={17} /></AppLink>
            </>
          ) : (
            <>
              <p className="text-sm leading-6 text-muted">There is no completed intake saved for this account, so 4Prep cannot show a destination, field, budget, or intake goal yet.</p>
              <AppLink href={viewPaths.intake as string} onNavigate={() => onNavigate('intake')} className="mt-4 inline-flex items-center gap-2 font-bold text-forest-700">Complete intake <ArrowRight size={17} /></AppLink>
            </>
          )}
        </DashboardCard>

        <DashboardCard icon={<Bookmark />} eyebrow="Saved plans" title={`${saved.size} universit${saved.size === 1 ? 'y' : 'ies'} saved`}>
          {savedUniversities.length > 0 ? (
            <ul className="grid gap-2.5">
              {savedUniversities.slice(0, 4).map((university) => (
                <li key={university.id}>
                  <SavedUniversityRow university={university} onOpen={() => onOpenUniversity(university)} />
                </li>
              ))}
            </ul>
          ) : data.catalogueUnavailable ? (
            <UnavailableNote>Saved university names could not be checked. Your saved-plan records were not changed.</UnavailableNote>
          ) : (
            <div className="rounded-xl border border-dashed border-forest-200 bg-forest-50/50 p-5 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-full bg-forest-100 text-forest-700"><Bookmark size={20} /></div>
              <p className="mt-3 text-sm font-bold text-forest-900">No universities saved yet</p>
              <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-muted">Bookmark a university and it lands here, ready to compare side by side.</p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <AppLink href={viewPaths[saved.size > 0 ? 'saved' : 'search'] as string} onNavigate={() => onNavigate(saved.size > 0 ? 'saved' : 'search')} className="inline-flex items-center gap-2 font-bold text-forest-700">{saved.size > 0 ? 'Open saved plans' : 'Explore universities'} <ArrowRight size={17} /></AppLink>
            {saved.size > 1 && (
              <AppLink href={viewPaths.counselor as string} onNavigate={() => onNavigate('counselor')} className="inline-flex items-center gap-2 text-sm font-bold text-muted transition hover:text-forest-700">Compare in counselor</AppLink>
            )}
          </div>
        </DashboardCard>

        <DashboardCard icon={<BookOpenCheck />} eyebrow="Learning portal" title={`${signals.completedLessonCount} lessons complete · ${signals.submittedHomeworkCount} homework submitted`}>
          {data.learningUnavailable ? (
            <UnavailableNote>Learning progress could not be checked. Nothing was changed; reconnect and retry from the Learning Portal.</UnavailableNote>
          ) : (
            <>
              <p className="text-sm leading-6 text-muted">{data.track ? `${data.track.modules.length} real modules are in this track. Counts above come from your saved lesson and submission records.` : 'The learning track has not been published.'}</p>
              {learningStates.length > 0 ? (
                <>
                  <LearningProgressChart states={learningStates} completedLessonIds={data.learningUserState.completedLessonIds} />
                  <HomeworkStatusChart submissions={data.learningUserState.submissions} />
                  <RecordedEventTimeline completedLessons={data.learningUserState.completedLessons ?? []} submissions={data.learningUserState.submissions} />
                </>
              ) : null}
              {continueModule ? <p className="mt-3 font-bold text-forest-900">Continue: {continueModule.title}</p> : null}
            </>
          )}
          <AppLink href={viewPaths.learn as string} onNavigate={() => onNavigate('learn')} className="mt-4 inline-flex items-center gap-2 font-bold text-forest-700">Open Learning Portal <ArrowRight size={17} /></AppLink>
        </DashboardCard>

        <DashboardCard icon={<ShieldCheck />} eyebrow="Trusted help" title="Research tools stay separate from outcomes">
          <p className="text-sm leading-6 text-muted">Use the counselor for sourced facts or clearly labeled general guidance. Its operational request log is not exposed as a student activity score.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <AppLink href={viewPaths.counselor as string} onNavigate={() => onNavigate('counselor')} className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-3 font-bold text-forest-800"><Compass size={17} /> Counselor</AppLink>
            <AppLink href={viewPaths.tools as string} onNavigate={() => onNavigate('tools')} className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-3 font-bold text-forest-800"><Wrench size={17} /> All tools</AppLink>
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}

function DashboardEmpty({
  completedLessonIds,
  learningUnavailable,
  learningStates,
  onNavigate,
  stage,
  submissions,
}: {
  completedLessonIds: ReadonlySet<string>
  learningUnavailable: boolean
  learningStates: ReturnType<typeof deriveLearningModuleStates>
  onNavigate: (view: View) => void
  stage: DashboardStage
  submissions: LearningUserState['submissions']
}) {
  return (
    <div className="page-container motion-resolve py-8 sm:py-12">
      <section className="soft-grid rounded-[28px] border border-line bg-white p-6 shadow-soft sm:p-10">
        <p className="text-sm font-extrabold uppercase tracking-[.14em] text-forest-700">Your stage · {stage.label}</p>
        <h1 className="display mt-2 max-w-2xl text-3xl font-extrabold sm:text-5xl">Start with facts, not empty metrics</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">{stage.description} Your intake is not complete, so there is no study goal to show yet. We will not fill the space with guessed chances, invented deadlines, or a readiness score.</p>
      </section>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <EmptyStep step="1" title="Tell us about your plan" body="Create the profile used by the five-part fit explanation." action="Start intake" href={viewPaths.intake as string} onClick={() => onNavigate('intake')} />
        <EmptyStep step="2" title="Review official evidence" body="Browse costs, requirements, sources, and honest gaps before saving." action="Explore universities" href={viewPaths.search as string} onClick={() => onNavigate('search')} />
        <EmptyStep step="3" title="Begin the application course" body={learningUnavailable ? 'The Learning Portal is currently unavailable; no progress has been invented.' : 'Browse the real modules and save progress when you complete work.'} action="Open Learning Portal" href={viewPaths.learn as string} onClick={() => onNavigate('learn')} />
      </div>
      {!learningUnavailable && learningStates.length > 0 ? (
        <section className="card mt-6 p-5 sm:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[.13em] text-forest-700">Learning progress</p>
          <h2 className="display mt-1 text-xl font-extrabold">Your learning path is ready</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Start with the first available module. This view updates only after a lesson or homework action is saved.</p>
          <LearningProgressChart states={learningStates} completedLessonIds={completedLessonIds} />
          <HomeworkStatusChart submissions={submissions} />
          <RecordedEventTimeline completedLessons={[]} submissions={submissions} />
        </section>
      ) : null}
    </div>
  )
}

function NextAction({
  action,
  topRoute,
  onNavigate,
  onOpenUniversity,
}: {
  action: DashboardNextAction
  topRoute: University | null
  onNavigate: (view: View) => void
  onOpenUniversity: (university: University) => void
}) {
  const content = {
    complete_profile: ['Complete your intake', 'Your profile is needed before personal fit can be explained.'],
    review_route: ['Review your first route', topRoute ? `Open ${topRoute.name} and inspect all five fit reasons.` : 'Open the catalogue and review sourced options.'],
    continue_learning: ['Continue the application course', 'Your saved plans are in place; the Learning Portal is the next recorded action.'],
    review_saved: ['Review your saved plans', 'Return to the universities you chose and compare their evidence.'],
  } satisfies Record<DashboardNextAction, [string, string]>

  const activate = () => {
    if (action === 'complete_profile') onNavigate('intake')
    else if (action === 'review_route' && topRoute) onOpenUniversity(topRoute)
    else if (action === 'review_route') onNavigate('search')
    else if (action === 'continue_learning') onNavigate('learn')
    else onNavigate('saved')
  }

  const href = action === 'complete_profile'
    ? viewPaths.intake as string
    : action === 'review_route' && topRoute
      ? `/universities/${encodeURIComponent(topRoute.id)}`
      : action === 'review_route'
        ? viewPaths.search as string
        : action === 'continue_learning'
          ? viewPaths.learn as string
          : viewPaths.saved as string

  return (
    <AppLink href={href} onNavigate={activate} className="flex w-full items-center justify-between gap-4 rounded-2xl bg-white p-5 text-left text-forest-950">
      <span><span className="block text-xs font-extrabold uppercase tracking-[.12em] text-forest-700">Next recorded action</span><span className="mt-1 block font-extrabold">{content[action][0]}</span><span className="mt-1 block text-sm leading-6 text-muted">{content[action][1]}</span></span>
      <ArrowRight size={20} className="shrink-0" />
    </AppLink>
  )
}

function DashboardCard({
  icon,
  eyebrow,
  title,
  children,
  className = '',
}: {
  icon: React.ReactNode
  eyebrow: string
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700 [&>svg]:size-5">{icon}</span>
        <div><p className="text-xs font-extrabold uppercase tracking-[.12em] text-forest-700">{eyebrow}</p><h2 className="display mt-1 text-xl font-extrabold">{title}</h2></div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function DashboardFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-canvas p-3"><dt className="text-xs font-bold text-muted">{label}</dt><dd className="mt-1 break-words font-bold">{value}</dd></div>
}

/**
 * A saved university on the dashboard, carrying its location and — when a plan
 * exists so fit has been computed — a coloured fit chip. Falls back to a neutral
 * "Sourced" chip so the row is never a bare name in a pill.
 */
function SavedUniversityRow({ university, onOpen }: { university: University; onOpen: () => void }) {
  const fit = university.fit
  const fitTone = fit
    ? fit.overall >= 75
      ? 'bg-emerald-100 text-emerald-800'
      : fit.overall >= 55
        ? 'bg-amber-100 text-amber-900'
        : 'bg-rose-100 text-rose-900'
    : 'bg-forest-50 text-forest-700'
  return (
    <AppLink
      href={`/universities/${encodeURIComponent(university.id)}`}
      onNavigate={onOpen}
      className="group flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-left transition hover:border-forest-300 hover:bg-forest-50/40"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-forest-800 text-lg" aria-hidden="true">{university.flag}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-forest-900">{university.name}</span>
        <span className="mt-0.5 block truncate text-xs text-muted">{university.city}, {university.country}</span>
      </span>
      <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold sm:inline ${fitTone}`}>
        {fit ? `${fit.label} · ${fit.grade}` : 'Sourced'}
      </span>
      <ArrowRight size={17} className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-forest-700" />
    </AppLink>
  )
}

function formatBudget(profile: StudentProfile): string {
  if (profile.budgetMax === null || !profile.budgetCurrency) return 'Still working it out'
  return `${profile.budgetCurrency} ${profile.budgetMax.toLocaleString()}`
}

function EmptyStep({
  step,
  title,
  body,
  action,
  href,
  onClick,
}: {
  step: string
  title: string
  body: string
  action: string
  href: string
  onClick: () => void
}) {
  return (
    <section className="card flex flex-col p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-forest-800 font-extrabold text-white">{step}</span>
      <h2 className="display mt-5 text-xl font-extrabold">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{body}</p>
      <AppLink href={href} onNavigate={onClick} className="mt-5 inline-flex items-center gap-2 font-bold text-forest-700">{action} <ArrowRight size={17} /></AppLink>
    </section>
  )
}

function UnavailableNote({ children }: { children: React.ReactNode }) {
  return <p className="trust-static rounded-xl border border-line bg-canvas p-3 text-sm leading-6 text-muted">{children}</p>
}
