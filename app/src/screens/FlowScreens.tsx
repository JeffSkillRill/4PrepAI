import { ArrowLeft, ArrowRight, BookOpen, Bookmark, BookmarkCheck, CalendarDays, Check, CircleDollarSign, GraduationCap, Languages, MapPin, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { Pathway, StudentProfile, University } from '../types'
import { DataValue, ExpandableFit } from '../components/Trust'
import { DesignedState, LoadingState } from '../components/States'
import { getRankedPathway } from '../data/repository'

const questions = [
  { eyebrow: 'Your destination', title: 'Where would you like to study?', detail: 'Choose one destination. The ranking will still show alternatives with a clear geographic trade-off.', icon: MapPin, options: ['🇬🇧 United Kingdom', '🇨🇦 Canada', '🇩🇪 Germany', '🇮🇪 Ireland', '🇳🇱 Netherlands', '🇦🇺 Australia'] },
  { eyebrow: 'Your subject', title: 'What do you want to study?', detail: 'Pick a broad field for now—we will match against published programs.', icon: BookOpen, options: ['Computer Science', 'Business & Management', 'Engineering', 'Data & Analytics'] },
  { eyebrow: 'Your academics', title: 'How ready is your academic record?', detail: 'This is a self-assessment only. Formal requirements still need evidence.', icon: GraduationCap, options: ['Strong in relevant subjects', 'Generally on track', 'Some gaps to address', 'I am not sure yet'] },
  { eyebrow: 'Your budget', title: 'What annual budget feels realistic?', detail: 'The placeholder score compares published sticker-price amounts before scholarships and does not convert currencies.', icon: CircleDollarSign, options: ['Under 15k', '15k–25k', '25k–35k', 'Still working it out'] },
  { eyebrow: 'Your language plan', title: 'Where are you with English testing?', detail: 'A target is enough. Missing scores remain an explicit gap.', icon: Languages, options: ['IELTS 6.5 or above', 'IELTS 6.0', 'No IELTS yet', 'I need a language pathway'] },
  { eyebrow: 'Your timing', title: 'When would you like to begin?', detail: 'We will keep this preference in your pathway summary.', icon: CalendarDays, options: ['Autumn 2027', 'Spring 2027', 'Autumn 2028', 'I am flexible'] },
]

const stripFlag = (value: string) => value.replace(/^\S+\s/, '')

function profileFromAnswers(answers: string[]): StudentProfile {
  const budgetMap: Record<string, number | null> = { 'Under 15k': 15000, '15k–25k': 25000, '25k–35k': 35000, 'Still working it out': null }
  const academicMap: Record<string, number | null> = { 'Strong in relevant subjects': 90, 'Generally on track': 72, 'Some gaps to address': 50, 'I am not sure yet': null }
  const languageMap: Record<string, number | null> = { 'IELTS 6.5 or above': 6.5, 'IELTS 6.0': 6, 'No IELTS yet': null, 'I need a language pathway': null }
  return {
    country: stripFlag(answers[0]),
    field: answers[1],
    academicScore: academicMap[answers[2]],
    budgetMax: budgetMap[answers[3]],
    languageScore: languageMap[answers[4]],
    needsLanguagePathway: answers[4] === 'I need a language pathway',
    intake: answers[5],
  }
}

export function IntakeScreen({ onComplete }: { onComplete: (profile: StudentProfile, pathway: Pathway) => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [status, setStatus] = useState<'ready' | 'loading' | 'error' | 'offline'>('ready')
  const question = questions[step]
  const Icon = question.icon
  const selected = answers[step]
  const choose = (value: string) => setAnswers((current) => {
    const next = [...current]
    next[step] = value
    return next
  })
  const finish = async () => {
    const profile = profileFromAnswers(answers)
    setStatus('loading')
    try {
      const pathway = await getRankedPathway(profile)
      onComplete(profile, pathway)
    } catch {
      setStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error')
    }
  }
  const next = () => {
    if (!selected) return
    if (step === questions.length - 1) void finish()
    else setStep((value) => value + 1)
  }

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={() => setStatus('ready')} />

  return (
    <main className="soft-grid min-h-[calc(100vh-106px)] py-10 sm:py-16">
      <div className="mx-auto w-[min(640px,calc(100%-32px))]">
        <div className="mb-5 flex items-center justify-between text-sm"><span className="font-bold text-forest-800">Build your pathway</span><span className="text-muted">Step {step + 1} of {questions.length}</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-forest-100"><div className="h-full rounded-full bg-forest-600 transition-all duration-300" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
        <section className="card mt-6 p-6 sm:p-9">
          <div className="grid size-16 place-items-center rounded-2xl bg-forest-50 text-forest-700"><Icon size={30} /></div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[.14em] text-forest-700">{question.eyebrow}</p>
          <h1 className="display mt-2 text-3xl font-extrabold sm:text-4xl">{question.title}</h1>
          <p className="mt-3 leading-7 text-muted">{question.detail}</p>
          <div className="mt-7 space-y-3" role="radiogroup" aria-label={question.title}>
            {question.options.map((option) => <button key={option} role="radio" aria-checked={selected === option} onClick={() => choose(option)} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left font-semibold transition ${selected === option ? 'border-forest-600 bg-forest-50 text-forest-900 ring-2 ring-forest-100' : 'border-line bg-white hover:border-forest-200 hover:bg-canvas'}`}><span>{option}</span><span className={`grid size-6 place-items-center rounded-full border ${selected === option ? 'border-forest-600 bg-forest-600 text-white' : 'border-line'}`}>{selected === option ? <Check size={14} /> : null}</span></button>)}
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
            <button onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} className="inline-flex items-center gap-2 rounded-xl px-3 py-3 font-bold text-muted transition hover:bg-canvas disabled:invisible"><ArrowLeft size={18} /> Back</button>
            <button onClick={next} disabled={!selected} className="inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-40">{step === questions.length - 1 ? 'Build my plan' : 'Continue'} <ArrowRight size={18} /></button>
          </div>
        </section>
        <p className="mt-5 text-center text-xs leading-5 text-muted">Your choices stay in this session. They are used only to calculate this pathway.</p>
      </div>
    </main>
  )
}

export function ResultsScreen({ pathway, saved, onSave, onOpen }: { pathway: Pathway; saved: Set<string>; onSave: (id: string) => void; onOpen: (university: University) => void }) {
  const ranked = pathway.ranked.slice(0, 3)
  return (
    <main className="page-container py-10 lg:py-14">
      <section className="relative overflow-hidden rounded-[28px] bg-forest-900 p-6 text-white shadow-card sm:p-9 lg:p-11">
        <div className="absolute -right-20 -top-24 size-80 rounded-full bg-forest-500/30 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-forest-100"><Sparkles size={16} /> Profile-based strategy</span><h1 className="display mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">A route built from your answers</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-white/75">The order responds to your destination, subject, academic readiness, budget, language plan, and timing. It organizes sample evidence and does not predict admission.</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"><p className="text-xs font-bold uppercase tracking-[.14em] text-forest-200">Your entered direction</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><PathFact icon={<MapPin />} label={pathway.profile.country} /><PathFact icon={<BookOpen />} label={pathway.profile.field} /><PathFact icon={<CircleDollarSign />} label={pathway.profile.budgetMax ? `Up to ${pathway.profile.budgetMax / 1000}k` : 'Budget unresolved'} /><PathFact icon={<CalendarDays />} label={pathway.profile.intake} /></div></div>
        </div>
      </section>

      <section className="mt-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Ranked shortlist</p><h2 className="display mt-2 text-3xl font-extrabold">Your strongest starting points</h2></div><p className="max-w-md text-sm leading-6 text-muted">Every fit opens into the same five scored components with plain-language reasons.</p></div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">{ranked.map((university, index) => <article key={university.id} className="card interactive-card overflow-hidden"><div className="relative aspect-[2/1] overflow-hidden bg-forest-800"><img src={`https://picsum.photos/seed/${university.id}/800/400`} alt="Sample campus" className="h-full w-full object-cover" /><div className="image-scrim absolute inset-0" /><span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-forest-900">Choice {index + 1}</span><span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold text-white">Sample photo</span><div className="absolute inset-x-4 bottom-4 text-white"><h3 className="display text-2xl font-extrabold">{university.name}</h3><p className="mt-1 text-sm text-white/80">{university.city}, {university.country}</p></div></div><div className="p-5">{university.fit && <ExpandableFit fit={university.fit} compact />}<div className="mt-4 text-xs"><span className="block font-bold uppercase tracking-wide text-muted">Tuition</span><DataValue point={university.tuition} className="mt-1 font-bold" /></div><p className="mt-4 text-sm leading-6 text-muted">{university.fit?.summary}</p><div className="mt-5 grid grid-cols-[1fr_auto] gap-2"><button onClick={() => onOpen(university)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-50 py-3 text-sm font-bold text-forest-800 transition hover:bg-forest-100">Review evidence <ArrowRight size={16} /></button><button onClick={() => onSave(university.id)} disabled={saved.has(university.id)} className="grid size-11 place-items-center rounded-xl border border-line text-forest-800 disabled:bg-forest-50" aria-label={saved.has(university.id) ? `${university.name} already saved` : `Save ${university.name}`}>{saved.has(university.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button></div></div></article>)}</div>
      </section>

      <section className="mt-14"><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Step by step</p><h2 className="display mt-2 text-3xl font-extrabold">Your application runway</h2><div className="timeline-line relative mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">{pathway.milestones.map((item, index) => <article key={item.month} className="relative rounded-2xl border border-line bg-white p-4 pt-14 shadow-soft"><span className="absolute left-4 top-3 z-10 grid size-10 place-items-center rounded-full bg-forest-700 text-xs font-extrabold text-white ring-4 ring-canvas">{index + 1}</span><p className="text-xs font-bold uppercase tracking-[.14em] text-forest-700">Step {item.month}</p><h3 className="mt-2 font-extrabold">{item.title}</h3><p className="mt-2 text-sm leading-5 text-muted">{item.detail}</p></article>)}</div></section>
    </main>
  )
}

function PathFact({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-2 rounded-xl bg-black/10 p-3 font-semibold"><span className="text-forest-200 [&>svg]:size-4">{icon}</span>{label}</div>
}
