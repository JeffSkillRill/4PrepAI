import { ArrowRight, Check, CircleAlert, FileSearch, Info, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StudentProfile, University, View } from '../types'
import { DesignedState, LoadingState } from '../components/States'
import { SourceChip } from '../components/Trust'
import { AskACounselor } from '../components/AskACounselor'
import { AppLink } from '../components/AppLink'
import { listUniversities } from '../data/repository'
import { useRepositoryData } from '../data/useRepositoryData'
import { viewPaths } from '../routes'
import { analyseSkillGap, relevantTests, testLabels, type SkillGapItem, type SkillGapReport, type SkillGapStatus } from '../scoring/skillGap'

const statusStyles: Record<SkillGapStatus, { chip: string; eyebrow: string }> = {
  met: { chip: 'bg-emerald-100 text-emerald-800', eyebrow: 'Minimum met' },
  short: { chip: 'bg-amber-100 text-amber-900', eyebrow: 'Gap to close' },
  not_a_cutoff: { chip: 'bg-sky-100 text-sky-900', eyebrow: 'Published, not a cutoff' },
  other_purpose: { chip: 'bg-violet-100 text-violet-900', eyebrow: 'Different purpose' },
  not_published: { chip: 'bg-canvas text-muted', eyebrow: 'Official data gap' },
  no_student_score: { chip: 'bg-sky-100 text-sky-900', eyebrow: 'Needs your answers' },
}

function StatusIcon({ status }: { status: SkillGapStatus }) {
  if (status === 'met') return <Check size={16} aria-hidden="true" />
  if (status === 'short') return <Target size={16} aria-hidden="true" />
  if (status === 'not_published') return <FileSearch size={16} aria-hidden="true" />
  return <Info size={16} aria-hidden="true" />
}

function GapRow({ item }: { item: SkillGapItem }) {
  const style = statusStyles[item.status]
  return (
    <li className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${style.chip}`}>
          <StatusIcon status={item.status} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-muted">{style.eyebrow}</p>
          <p className="mt-0.5 font-bold">
            {item.label}
            {item.status === 'short' && item.shortfall !== null && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-900">
                +{item.shortfall} needed
              </span>
            )}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">{item.message}</p>
          {item.publishedText && (
            <p className="mt-2 rounded-lg bg-canvas p-2 text-xs leading-5 text-muted">
              <span className="font-bold text-ink">Published: </span>{item.publishedText}
            </p>
          )}
          {item.unknownReason && (
            <p className="mt-2 text-xs leading-5 text-muted">{item.unknownReason}</p>
          )}
          {item.suggestedAction && (
            <p className="mt-1 text-xs font-bold text-forest-700">{item.suggestedAction}</p>
          )}
          {item.sourceId && <span className="mt-2 flex flex-wrap gap-1"><SourceChip sourceId={item.sourceId} /></span>}
        </div>
      </div>
    </li>
  )
}

function ReportCard({ report }: { report: SkillGapReport }) {
  const [open, setOpen] = useState(false)
  // Anything the student can act on comes first; the rest stays available but
  // does not crowd out the numbers that matter.
  const priority = report.items.filter((item) => item.status === 'short' || item.status === 'met')
  const rest = report.items.filter((item) => item.status !== 'short' && item.status !== 'met')
  const ordered = [...priority.sort((left) => (left.status === 'short' ? -1 : 1)), ...rest]
  const visible = open ? ordered : ordered.slice(0, 3)

  return (
    <article className="card overflow-hidden">
      <header className="border-b border-line bg-canvas p-5">
        <h2 className="display text-xl font-extrabold">{report.universityName}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{report.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          {report.shortCount > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
              {report.shortCount} gap{report.shortCount === 1 ? '' : 's'} to close
            </span>
          )}
          {report.metCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
              {report.metCount} minimum{report.metCount === 1 ? '' : 's'} met
            </span>
          )}
          {report.hasNoComparableRequirement && (
            <span className="rounded-full bg-canvas px-3 py-1 text-muted">No published minimum</span>
          )}
        </div>
      </header>
      <div className="p-5">
        <ul className="grid gap-3">
          {visible.map((item) => <GapRow key={item.test} item={item} />)}
        </ul>
        {ordered.length > 3 && (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="mt-4 min-h-12 w-full rounded-xl border border-line px-4 py-3 text-sm font-bold text-forest-800 transition hover:bg-canvas"
          >
            {open ? 'Show fewer tests' : `Show all ${ordered.length} tests`}
          </button>
        )}
        <div className="mt-4 border-t border-line pt-4">
          <AskACounselor
            source="gap"
            contextRef={`skill-gap:${report.universityId}`}
            label="Ask a 4Prep counsellor about these gaps"
          />
        </div>
      </div>
    </article>
  )
}

export function SkillGapScreen({
  profile,
  saved,
  onNavigate,
}: {
  profile: StudentProfile | null
  saved: ReadonlySet<string>
  onNavigate: (view: View) => void
}) {
  const { data, status, reload } = useRepositoryData(() => listUniversities(), [])
  const universities = useMemo<University[]>(() => data ?? [], [data])
  const targets = useMemo(() => {
    const chosen = saved.size > 0
      ? universities.filter((university) => saved.has(university.id))
      : universities
    return chosen.slice(0, 5)
  }, [saved, universities])
  const reports = useMemo(
    () => (profile ? targets.map((university) => analyseSkillGap(profile, university)) : []),
    [profile, targets],
  )
  const heldTests = profile ? relevantTests(profile) : []
  const hasNoScores = profile !== null && heldTests.length === 0

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />

  return (
    <div className="page-container motion-resolve py-8 sm:py-10 lg:py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Skill gap</p>
        <h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">What actually stands between you and each university</h1>
        <p className="mt-4 leading-7 text-muted">
          Your entered scores next to what each university publishes. A gap only appears where a
          university states a real admission minimum — never against a figure it publishes as a
          guide, and never against a score that opens funding rather than a place.
        </p>
      </div>

      {!profile ? (
        <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/70 p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-sky-900 opacity-70">Needs your answers</p>
          <h2 className="display mt-1 text-2xl font-extrabold text-sky-950">Add your scores first</h2>
          <p className="mt-2 max-w-2xl leading-7 text-sky-950/80">
            This tool compares your own test scores against published minimums. Complete the short
            intake and your gaps appear here, each one a specific number.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('intake')}
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white"
          >
            Start the intake <ArrowRight size={18} />
          </button>
        </section>
      ) : hasNoScores ? (
        <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/70 p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-sky-900 opacity-70">Needs your answers</p>
          <h2 className="display mt-1 text-2xl font-extrabold text-sky-950">No scores on your plan yet</h2>
          <p className="mt-2 max-w-2xl leading-7 text-sky-950/80">
            Gaps are measured against the scores you hold. Add an English test score — and an SAT,
            ACT or GPA if you have one — and each gap appears here as a specific number.
          </p>
          <AppLink
            href={viewPaths.plan as string}
            onNavigate={() => onNavigate('plan')}
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white"
          >
            Add my scores <ArrowRight size={18} />
          </AppLink>
        </section>
      ) : reports.length === 0 ? (
        <DesignedState state="empty" onReset={reload} />
      ) : (
        <>
          <p className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-white p-4 text-sm leading-6 text-muted">
            <CircleAlert size={17} className="mt-0.5 shrink-0 text-forest-600" aria-hidden="true" />
            Meeting a published minimum is not an admission decision, and missing one is not a
            rejection. These are the numbers universities publish, compared with the numbers you
            entered.
          </p>
          <p className="mt-4 text-sm text-muted">
            Comparing your {heldTests.map((test) => testLabels[test]).join(', ')}
            {heldTests.length === 1 ? ' score' : ' scores'}.{' '}
            <AppLink
              href={viewPaths.plan as string}
              onNavigate={() => onNavigate('plan')}
              className="font-bold text-forest-700 underline"
            >
              Change a score
            </AppLink>{' '}
            on your plan.
          </p>
          <p className="mt-2 text-sm text-muted">
            {saved.size > 0
              ? `Showing your saved universities.`
              : `Showing the first ${reports.length} universities in the catalogue.`}{' '}
            <AppLink
              href={viewPaths.saved as string}
              onNavigate={() => onNavigate('saved')}
              className="font-bold text-forest-700 underline"
            >
              Save universities
            </AppLink>{' '}
            to focus this on your own shortlist.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {reports.map((report) => <ReportCard key={report.universityId} report={report} />)}
          </div>
        </>
      )}
    </div>
  )
}
