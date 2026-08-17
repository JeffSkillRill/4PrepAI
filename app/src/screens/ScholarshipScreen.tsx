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
import { AwardScoreEntry } from '../components/AwardScoreEntry'
import {
  analyseScholarships,
  emptyAwardScores,
  hasAnyScore,
  type AwardReport,
  type AwardScores,
  type AwardStatus,
  type ConditionOutcome,
} from '../scoring/scholarships'

const statusStyles: Record<AwardStatus, { chip: string; eyebrow: string }> = {
  reachable: { chip: 'bg-emerald-100 text-emerald-800', eyebrow: 'You meet what is published' },
  partly_met: { chip: 'bg-amber-100 text-amber-900', eyebrow: 'Part way there' },
  not_yet: { chip: 'bg-amber-100 text-amber-900', eyebrow: 'Not yet' },
  needs_your_scores: { chip: 'bg-sky-100 text-sky-900', eyebrow: 'Needs your answers' },
  no_published_criteria: { chip: 'bg-canvas text-muted', eyebrow: 'No criteria published' },
}

function StatusIcon({ status }: { status: AwardStatus }) {
  if (status === 'reachable') return <Check size={16} aria-hidden="true" />
  if (status === 'partly_met' || status === 'not_yet') return <Target size={16} aria-hidden="true" />
  if (status === 'no_published_criteria') return <FileSearch size={16} aria-hidden="true" />
  return <Info size={16} aria-hidden="true" />
}

function ConditionRow({ item }: { item: ConditionOutcome }) {
  const tone = item.status === 'met'
    ? 'bg-emerald-50 text-emerald-900'
    : item.status === 'short'
      ? 'bg-amber-50 text-amber-950'
      : 'bg-canvas text-muted'
  return (
    <li className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg px-3 py-2 text-sm ${tone}`}>
      <span className="font-bold">{item.label} {item.minimum}</span>
      {item.status === 'met' && <span>· your {item.studentValue} meets it</span>}
      {item.status === 'short' && <span>· your {item.studentValue} is {item.shortfall} short</span>}
      {item.status === 'no_student_value' && <span>· not on your plan yet</span>}
    </li>
  )
}

function AwardCard({ award }: { award: AwardReport }) {
  const style = statusStyles[award.status]
  const publishedTexts = [...new Set(award.conditions.map((item) => item.publishedText))]
  return (
    <article className="card overflow-hidden">
      <header className="border-b border-line bg-canvas p-5">
        <div className="flex items-start gap-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${style.chip}`}>
            <StatusIcon status={award.status} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-muted">{style.eyebrow}</p>
            <h2 className="display mt-0.5 text-xl font-extrabold">{award.name}</h2>
            <p className="mt-1 text-sm text-muted">{award.universityName}</p>
          </div>
        </div>
        <div className="mt-4">
          {award.amountText ? (
            <>
              <p className="display text-2xl font-extrabold text-forest-800">{award.amountText}</p>
              {award.amountSourceId && <span className="mt-2 flex flex-wrap gap-1"><SourceChip sourceId={award.amountSourceId} /></span>}
            </>
          ) : (
            <div className="rounded-xl border border-line bg-white p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[.13em] text-muted opacity-70">Official data gap</p>
              <p className="mt-1 text-sm leading-6 text-muted">{award.amountUnknownReason}</p>
              {award.amountSuggestedAction && <p className="mt-1 text-xs font-bold text-forest-700">{award.amountSuggestedAction}</p>}
            </div>
          )}
        </div>
      </header>
      <div className="p-5">
        <p className="text-sm leading-6 text-muted">{award.message}</p>
        {award.conditions.length > 0 && (
          <>
            <p className="mt-4 text-xs font-extrabold uppercase tracking-[.12em] text-muted">
              What this award publishes
            </p>
            <ul className="mt-2 grid gap-2">
              {award.conditions.map((item) => <ConditionRow key={item.kind} item={item} />)}
            </ul>
            <p className="mt-2 text-xs leading-5 text-muted">
              The score conditions are alternatives to each other. Any condition that is not a score
              applies in addition.
            </p>
            {publishedTexts.map((text) => (
              <p key={text} className="mt-3 rounded-lg bg-canvas p-3 text-xs leading-5 text-muted">
                <span className="font-bold text-ink">Published: </span>{text}
              </p>
            ))}
          </>
        )}
        <div className="mt-4 border-t border-line pt-4">
          <AskACounselor
            source="results"
            contextRef={`scholarship:${award.scholarshipId}`}
            label="Ask a 4Prep counsellor about this award"
          />
        </div>
      </div>
    </article>
  )
}

export function ScholarshipScreen({
  profile,
  saved,
  onNavigate,
}: {
  /** Present for a signed-in student with a plan; null for an anonymous visitor. */
  profile: StudentProfile | null
  saved: ReadonlySet<string>
  onNavigate: (view: View) => void
}) {
  const { data, status, reload } = useRepositoryData(() => listUniversities(), [])
  const universities = useMemo<University[]>(() => data ?? [], [data])
  // Seeded from a saved plan when there is one, so a returning student sees their
  // own scores without retyping, and an anonymous visitor starts empty.
  const [scores, setScores] = useState<AwardScores>(() => (
    profile
      ? {
          languageTest: profile.languageTest,
          languageScore: profile.languageScore,
          admissionTest: profile.admissionTest,
          admissionTestScore: profile.admissionTestScore,
          gpa: profile.gpa,
        }
      : emptyAwardScores
  ))
  const targets = useMemo(() => (
    saved.size > 0 ? universities.filter((university) => saved.has(university.id)) : universities
  ), [saved, universities])
  const report = useMemo(() => analyseScholarships(scores, targets), [scores, targets])
  const entered = hasAnyScore(scores)
  // The scores shown differ from the saved plan, so offer to keep them.
  const changedFromPlan = profile !== null && (
    scores.admissionTest !== profile.admissionTest
    || scores.admissionTestScore !== profile.admissionTestScore
    || scores.gpa !== profile.gpa
  )

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />

  return (
    <div className="page-container motion-resolve py-8 sm:py-10 lg:py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Scholarships</p>
        <h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">Real awards, and what each one publishes</h1>
        <p className="mt-4 leading-7 text-muted">
          Every award here exists in the 4Prep catalogue with its amount and source. Where a
          university publishes the conditions for an award, your own scores are checked against
          every one of them — not just the easiest.
        </p>
      </div>

      <div className="mt-6">
        <AwardScoreEntry scores={scores} onChange={setScores} />
      </div>

      {profile === null ? (
        <section className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-canvas p-5">
          <p className="max-w-2xl text-sm leading-6 text-muted">
            {entered
              ? 'Want to keep these scores, see your five-part fit and track gaps over time? Build a plan and they are saved to your account.'
              : 'You can use this without an account. Building a plan adds your fit score, your pathway and your skill gaps.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('intake')}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white"
          >
            Build my plan <ArrowRight size={18} />
          </button>
        </section>
      ) : changedFromPlan ? (
        <section className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-sky-50/70 p-5">
          <p className="max-w-2xl text-sm leading-6 text-sky-950/80">
            These scores differ from the ones on your plan. Nothing here is saved until you update it.
          </p>
          <AppLink
            href={viewPaths.plan as string}
            onNavigate={() => onNavigate('plan')}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-bold text-forest-800"
          >
            Update my plan
          </AppLink>
        </section>
      ) : null}

      <p className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-white p-4 text-sm leading-6 text-muted">
        <CircleAlert size={17} className="mt-0.5 shrink-0 text-forest-600" aria-hidden="true" />
        Meeting what an award publishes is not an offer of that award, and no award here is promised
        to you. Where a university publishes no criteria, this page says so rather than guessing on
        your behalf.
      </p>

      {report.awards.length === 0 ? (
        <div className="mt-6"><DesignedState state="empty" onReset={reload} /></div>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">
            {!entered
              ? `${report.awards.length} awards in the catalogue. Add a score above to see which conditions you meet.`
              : report.reachableCount > 0
                ? `You meet every published condition on ${report.reachableCount} award${report.reachableCount === 1 ? '' : 's'}.`
                : 'No award currently has all of its published conditions met.'}
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {report.awards.map((award) => <AwardCard key={award.scholarshipId} award={award} />)}
          </div>
        </>
      )}
    </div>
  )
}
