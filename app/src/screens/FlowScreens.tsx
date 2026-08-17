import { ArrowLeft, ArrowRight, BookOpen, Bookmark, BookmarkCheck, CalendarDays, CircleDollarSign, ClipboardList, GraduationCap, Languages, MapPin, Percent, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { Pathway, StudentProfile, University } from '../types'
import { ExpandableFit } from '../components/Trust'
import { AskACounselor } from '../components/AskACounselor'
import { DesignedState, LoadingState } from '../components/States'
import { getRankedPathway } from '../data/repository'
import { UniversityVisual } from '../components/UniversityVisual'
import { PublishedNetCost } from '../components/CostSummary'
import { AppLink } from '../components/AppLink'
import { StepFields } from '../intake/StepFields'
import {
  draftFromProfile,
  emptyDraft,
  intakeSteps,
  isStepAnswered,
  profileFromDraft,
  type IntakeDraft,
  type IntakeStepId,
} from '../intake/definition'

const stepIcons: Record<IntakeStepId, typeof MapPin> = {
  country: MapPin,
  field: BookOpen,
  academic: GraduationCap,
  budget: CircleDollarSign,
  language: Languages,
  admissionTest: ClipboardList,
  gpa: Percent,
  intake: CalendarDays,
}

export function IntakeScreen({
  initialProfile = null,
  onComplete,
}: {
  /** Pre-fills the wizard when a student chooses to redo an existing plan. */
  initialProfile?: StudentProfile | null
  onComplete: (profile: StudentProfile, pathway: Pathway) => void
}) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<IntakeDraft>(
    initialProfile ? draftFromProfile(initialProfile) : emptyDraft,
  )
  const [valid, setValid] = useState(true)
  const [status, setStatus] = useState<'ready' | 'loading' | 'error' | 'offline'>('ready')
  const definition = intakeSteps[step]
  const Icon = stepIcons[definition.id]
  const answered = isStepAnswered(draft, definition.id)
  const canContinue = valid && (answered || definition.optional)

  const finish = async (finalDraft: IntakeDraft) => {
    const profile = profileFromDraft(finalDraft)
    setStatus('loading')
    try {
      const pathway = await getRankedPathway(profile)
      onComplete(profile, pathway)
    } catch {
      setStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error')
    }
  }

  const next = () => {
    if (!canContinue) return
    // An optional step passed over without an answer is still a deliberate
    // answer: "I do not have one". Recording that stops the plan page showing
    // it as an unfinished task forever.
    const advanced: IntakeDraft = definition.id === 'admissionTest'
      ? { ...draft, admissionAnswered: true }
      : definition.id === 'gpa'
        ? { ...draft, gpaAnswered: true }
        : draft
    setDraft(advanced)
    if (step === intakeSteps.length - 1) void finish(advanced)
    else { setStep((value) => value + 1); setValid(true) }
  }

  if (status === 'loading') return <LoadingState kind="form" />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={() => setStatus('ready')} />

  return (
    <div className="soft-grid min-h-[calc(100vh-106px)] py-10 sm:py-16">
      <div className="mx-auto w-[min(640px,calc(100%-32px))]">
        <div className="mb-5 flex items-center justify-between text-sm"><span className="font-bold text-forest-800">Build your pathway</span><span className="text-muted">Step {step + 1} of {intakeSteps.length}</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-forest-100"><div className="motion-progress h-full w-full rounded-full bg-forest-600" style={{ transform: `scaleX(${(step + 1) / intakeSteps.length})` }} /></div>
        <section className="card mt-6 p-6 sm:p-9">
          <div className="grid size-16 place-items-center rounded-2xl bg-forest-50 text-forest-700"><Icon size={30} /></div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[.14em] text-forest-700">{definition.eyebrow}</p>
          <h1 className="display mt-2 text-3xl font-extrabold sm:text-4xl">{definition.title}</h1>
          <p className="mt-3 leading-7 text-muted">{definition.detail}</p>
          <div className="mt-7">
            <StepFields stepId={definition.id} draft={draft} onChange={setDraft} onValidityChange={setValid} />
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
            <button onClick={() => { setStep((value) => Math.max(0, value - 1)); setValid(true) }} disabled={step === 0} className="inline-flex items-center gap-2 rounded-xl px-3 py-3 font-bold text-muted transition hover:bg-canvas disabled:invisible"><ArrowLeft size={18} /> Back</button>
            <button onClick={next} disabled={!canContinue} className="inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-40">{step === intakeSteps.length - 1 ? 'Build my plan' : definition.optional && !answered ? 'Skip' : 'Continue'} <ArrowRight size={18} /></button>
          </div>
        </section>
        <p className="mt-5 text-center text-xs leading-5 text-muted">Sign in to save these private answers. They are used only to calculate your pathway.</p>
      </div>
    </div>
  )
}

export function ResultsScreen({ pathway, saved, onSave, onOpen }: { pathway: Pathway; saved: Set<string>; onSave: (id: string) => void; onOpen: (university: University) => void }) {
  const ranked = pathway.ranked.slice(0, 3)
  return (
    <div className="page-container motion-resolve py-8 sm:py-10 lg:py-14">
      <section className="relative overflow-hidden rounded-[28px] bg-forest-900 p-6 text-white shadow-card sm:p-9 lg:p-11">
        <div className="absolute -right-20 -top-24 size-80 rounded-full bg-forest-500/30 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-forest-100"><Sparkles size={16} /> Profile-based strategy</span><h1 className="display mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">A route built from your answers</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">The order responds to your destination, subject, academic readiness, budget, language plan, and timing. It organizes verified evidence and does not predict admission.</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"><p className="text-xs font-bold uppercase tracking-[.14em] text-forest-200">Your entered direction</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><PathFact icon={<MapPin />} label={pathway.profile.country} /><PathFact icon={<BookOpen />} label={pathway.profile.field} /><PathFact icon={<CircleDollarSign />} label={pathway.profile.budgetMax && pathway.profile.budgetCurrency ? `${pathway.profile.budgetCurrency} ${pathway.profile.budgetMax.toLocaleString()}` : 'Budget unresolved'} /><PathFact icon={<CalendarDays />} label={pathway.profile.intake} /></div></div>
        </div>
      </section>

      <section className="mt-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Ranked shortlist</p><h2 className="display mt-2 text-3xl font-extrabold">Your strongest starting points</h2></div><p className="max-w-md text-sm leading-6 text-muted">Every fit opens into the same five scored components with plain-language reasons.</p></div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">{ranked.map((university, index) => <article key={university.id} className="card interactive-card overflow-hidden"><div className="relative aspect-[2/1] overflow-hidden bg-forest-800"><UniversityVisual university={university} className="absolute inset-0" /><div className="image-scrim absolute inset-0" /><span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-forest-900">Choice {index + 1}</span><div className="absolute inset-x-4 bottom-4 text-white"><h3 className="display text-2xl font-extrabold">{university.name}</h3><p className="mt-1 text-sm text-white/80">{university.city}, {university.country}</p></div></div><div className="p-5">{university.fit && <ExpandableFit fit={university.fit} compact />}<div className="mt-4 text-xs"><span className="block font-bold uppercase tracking-wide text-muted">Aid-adjusted net-cost scenario</span><div className="mt-1 font-bold"><PublishedNetCost university={university} compact /></div></div><p className="mt-4 text-sm leading-6 text-muted">{university.fit?.summary}</p><div className="mt-5 grid grid-cols-[1fr_auto] gap-2"><AppLink href={`/universities/${encodeURIComponent(university.id)}`} onNavigate={() => onOpen(university)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-50 py-3 text-sm font-bold text-forest-800 transition hover:bg-forest-100">Review evidence <ArrowRight size={16} /></AppLink><button onClick={() => onSave(university.id)} disabled={saved.has(university.id)} className="grid size-11 place-items-center rounded-xl border border-line text-forest-800 disabled:bg-forest-50" aria-label={saved.has(university.id) ? `${university.name} already saved` : `Save ${university.name}`}>{saved.has(university.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button></div></div></article>)}</div>
      </section>

      <section className="mt-14"><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Step by step</p><h2 className="display mt-2 text-3xl font-extrabold">Your application runway</h2><div className="timeline-line relative mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">{pathway.milestones.map((item, index) => <article key={item.month} className="relative rounded-2xl border border-line bg-white p-4 pt-14 shadow-soft"><span className="absolute left-4 top-3 z-10 grid size-10 place-items-center rounded-full bg-forest-700 text-xs font-extrabold text-white ring-4 ring-canvas">{index + 1}</span><p className="text-xs font-bold uppercase tracking-[.14em] text-forest-700">Step {item.month}</p><h3 className="mt-2 font-extrabold">{item.title}</h3><p className="mt-2 text-sm leading-5 text-muted">{item.detail}</p></article>)}</div></section>

      {/* Placed last on purpose: the student sees the sourced shortlist and the
          five scored components first, and is offered a person only after the
          product has given everything it can evidence. */}
      <section className="mt-14 max-w-2xl">
        <AskACounselor
          source="results"
          contextRef={`${pathway.profile.country}:${pathway.profile.field}`}
          label="Talk this through with a 4Prep counsellor"
        />
      </section>
    </div>
  )
}

function PathFact({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-2 rounded-xl bg-black/10 p-3 font-semibold"><span className="text-forest-200 [&>svg]:size-4">{icon}</span>{label}</div>
}
