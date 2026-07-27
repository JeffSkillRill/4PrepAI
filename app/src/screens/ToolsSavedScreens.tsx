import { ArrowRight, BookMarked, CheckCircle2, GitCompareArrows, LockKeyhole, MessageCircle, Sparkles } from 'lucide-react'
import type { ToolItem, University, View } from '../types'
import { UniversityCard } from '../components/UniversityCard'
import { DesignedState, LoadingState } from '../components/States'
import { listUniversities } from '../data/repository'
import { tools } from '../data/static-content'
import { useRepositoryData } from '../data/useRepositoryData'

const toolIcons = [MessageCircle, GitCompareArrows, Sparkles]

export function ToolsScreen({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { status, reload } = useRepositoryData(() => listUniversities(), [])
  if (status === 'loading') return <LoadingState />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />
  return (
    <main>
      <section className="border-b border-line bg-forest-50">
        <div className="page-container grid gap-8 py-12 lg:grid-cols-[1fr_360px] lg:items-center lg:py-16">
          <div><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Planning tools</p><h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">Turn research into a clear next step</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted">Practical, source-aware tools for budgeting, preparation, and comparison—built around the decisions students actually need to make.</p></div>
          <div className="relative hidden overflow-hidden rounded-2xl bg-forest-900 p-7 text-white shadow-card lg:block"><div className="absolute -right-10 -top-10 size-36 rounded-full bg-forest-500/40 blur-2xl" /><Sparkles size={34} className="relative text-forest-200" /><h2 className="display relative mt-5 text-2xl font-extrabold">Start with your pathway</h2><p className="relative mt-2 text-sm leading-6 text-white/70">A few choices create a focused shortlist and month-by-month plan.</p><button onClick={() => onNavigate('intake')} className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-forest-900">Build my pathway <ArrowRight size={16} /></button></div>
        </div>
      </section>
      <section className="page-container py-10 lg:py-14"><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{tools.map((tool, index) => { const Icon = toolIcons[index]; return <ToolCard key={tool.id} tool={tool} icon={<Icon size={25} />} onOpen={() => tool.view ? onNavigate(tool.view) : undefined} /> })}</div>
        <div className="mt-10 grid gap-6 rounded-2xl border border-line bg-white p-6 shadow-soft sm:grid-cols-[1fr_auto] sm:items-center"><div className="flex items-start gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800"><LockKeyhole size={22} /></div><div><h2 className="display text-xl font-extrabold">Your private planning data stays yours</h2><p className="mt-1 text-sm leading-6 text-muted">Sign in to restore your intake profile and saved plans. Database row-level security limits both to your account.</p></div></div><button onClick={() => onNavigate('auth')} className="rounded-xl border border-line px-4 py-3 text-sm font-bold text-forest-800">Open account</button></div>
      </section>
    </main>
  )
}

function ToolCard({ tool, icon, onOpen }: { tool: ToolItem; icon: React.ReactNode; onOpen: () => void | undefined }) {
  return <article className="card interactive-card group p-6"><div className="flex items-start justify-between"><div className="grid size-12 place-items-center rounded-xl bg-forest-50 text-forest-700">{icon}</div><span className="rounded-full bg-canvas px-3 py-1.5 text-xs font-bold text-muted">{tool.tag}</span></div><h2 className="display mt-6 text-2xl font-extrabold">{tool.name}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-muted">{tool.description}</p><button onClick={onOpen} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest-700 transition group-hover:gap-3">Open tool <ArrowRight size={16} /></button></article>
}

export function SavedScreen({ saved, onToggleSave, onOpen, onExplore }: { saved: Set<string>; onToggleSave: (id: string) => void; onOpen: (university: University) => void; onExplore: () => void }) {
  const { data, status, reload } = useRepositoryData(() => listUniversities(), [])
  if (status === 'loading') return <LoadingState />
  if (status === 'error' || status === 'offline') return <DesignedState state={status} onReset={reload} />
  const items = (data ?? []).filter((university) => saved.has(university.id))
  return (
    <main className="page-container py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Saved</p><h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">Your considered shortlist</h1><p className="mt-4 max-w-2xl leading-7 text-muted">Keep promising routes together, then compare their evidence when you are ready.</p></div>{items.length > 1 && <button className="inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white"><GitCompareArrows size={18} /> Compare saved</button>}</div>
      {items.length > 0 ? <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map((university) => <UniversityCard key={university.id} university={university} saved onSave={() => onToggleSave(university.id)} onOpen={() => onOpen(university)} />)}</div> : <section className="soft-grid mt-9 overflow-hidden rounded-[28px] border border-line bg-white px-6 py-14 text-center shadow-soft sm:px-12"><div className="mx-auto grid size-24 place-items-center rounded-full bg-forest-50 text-forest-700"><BookMarked size={52} strokeWidth={1.4} /></div><h2 className="display mt-7 text-3xl font-extrabold">Save routes worth a second look</h2><p className="mx-auto mt-3 max-w-lg leading-7 text-muted">Use the bookmark on any university card. Your account’s private shortlist will appear here.</p><button onClick={onExplore} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white">Explore universities <ArrowRight size={18} /></button></section>}
      <section className="mt-10 flex items-start gap-4 rounded-2xl border border-line bg-white p-5"><CheckCircle2 size={22} className="mt-0.5 shrink-0 text-forest-600" /><div><h2 className="font-extrabold">Shortlist with intent</h2><p className="mt-1 text-sm leading-6 text-muted">A balanced shortlist usually includes ambitious, strong-fit, and cost-conscious routes. Fit labels explain trade-offs without promising outcomes.</p></div></section>
    </main>
  )
}
