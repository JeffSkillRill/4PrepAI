import { ChevronDown, Menu, Search, Sparkles, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { DevState, Pathway, StudentProfile, University, View } from './types'
import { CompareScreen } from './screens/CompareScreen'
import { IntakeScreen, ResultsScreen } from './screens/FlowScreens'
import { ProfileScreen } from './screens/ProfileScreen'
import { SearchScreen } from './screens/SearchScreen'
import { SavedScreen, ToolsScreen } from './screens/ToolsSavedScreens'
import { DesignedState, LoadingState, PartialBanner } from './components/States'

const navItems: { label: string; view: View }[] = [
  { label: 'Search', view: 'search' },
  { label: 'Compare', view: 'compare' },
  { label: 'Tools', view: 'tools' },
  { label: 'Saved', view: 'saved' },
]

const stateOptions: DevState[] = ['ready', 'loading', 'empty', 'partial', 'no_results', 'refusal', 'error', 'offline']

function Logo({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-2.5" aria-label="4Prep home"><span className="relative grid size-9 rotate-3 place-items-center rounded-[10px] bg-forest-800 text-white shadow"><span className="display -rotate-3 text-lg font-extrabold">4</span><span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-amber-400" /></span><span className="display text-xl font-extrabold tracking-tight text-forest-900">4Prep</span></button>
}

function SampleRibbon({ state, setState }: { state: DevState; setState: (state: DevState) => void }) {
  return (
    <div className="border-b border-amber-200 bg-amber-soft text-amber-950">
      <div className="page-container flex min-h-9 items-center justify-between gap-3 py-1.5 text-xs">
        <p className="flex items-center gap-2"><Sparkles size={14} className="shrink-0" /><span><strong>SAMPLE DATA — NOT VERIFIED</strong><span className="hidden sm:inline"> · Fictional universities for product demonstration only</span></span></p>
        <label className="relative flex shrink-0 items-center gap-2 font-bold"><span className="hidden md:inline">Preview state</span><select value={state} onChange={(event) => setState(event.target.value as DevState)} className="appearance-none rounded-lg border border-amber-300 bg-white/70 py-1 pl-2 pr-7 text-[11px] font-bold uppercase tracking-wide outline-none"><option value="ready">Default</option>{stateOptions.slice(1).map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}</select><ChevronDown size={12} className="pointer-events-none absolute right-2" /></label>
      </div>
    </div>
  )
}

function Navbar({ view, query, setQuery, onNavigate }: { view: View; query: string; setQuery: (value: string) => void; onNavigate: (view: View) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-lg">
      <div className="page-container flex h-[72px] items-center gap-5">
        <Logo onClick={() => onNavigate('search')} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => <button key={item.view} onClick={() => onNavigate(item.view)} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${view === item.view ? 'bg-forest-50 text-forest-800' : 'text-muted hover:bg-canvas hover:text-ink'}`}>{item.label}</button>)}
        </nav>
        {view !== 'search' ? <label className="ml-auto hidden min-w-0 max-w-[350px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 md:flex focus-within:border-forest-500 focus-within:ring-2 focus-within:ring-forest-100"><Search size={17} className="shrink-0 text-forest-700" /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onNavigate('search') }} placeholder="Search universities or subjects" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label> : <div className="ml-auto" />}
        <button onClick={() => onNavigate('intake')} className="hidden shrink-0 items-center gap-2 rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-forest-700 sm:flex"><UserRound size={17} /> Build my plan</button>
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-xl border border-line lg:hidden" aria-label="Toggle menu" aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {menuOpen && <div className="border-t border-line bg-white lg:hidden"><nav className="page-container grid gap-1 py-3" aria-label="Mobile navigation">{navItems.map((item) => <button key={item.view} onClick={() => { onNavigate(item.view); setMenuOpen(false) }} className={`rounded-xl px-4 py-3 text-left font-bold ${view === item.view ? 'bg-forest-50 text-forest-800' : 'text-muted'}`}>{item.label}</button>)}<button onClick={() => { onNavigate('intake'); setMenuOpen(false) }} className="mt-2 rounded-xl bg-forest-800 px-4 py-3 text-left font-bold text-white">Build my plan</button></nav></div>}
    </header>
  )
}

function Footer({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <footer className="mt-8 border-t border-line bg-white"><div className="page-container grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end"><div><Logo onClick={() => onNavigate('search')} /><p className="mt-4 max-w-md text-sm leading-6 text-muted">A calmer, source-backed way for international students to explore university pathways.</p></div><div className="flex flex-wrap gap-5 text-sm font-bold text-muted">{navItems.map((item) => <button key={item.view} onClick={() => onNavigate(item.view)} className="hover:text-forest-800">{item.label}</button>)}</div></div><div className="border-t border-line"><div className="page-container flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-muted"><span>© 2026 4Prep sample experience</span><span>Fictional data · Verify before applying</span></div></div></footer>
}

export default function App() {
  const [view, setView] = useState<View>('search')
  const [devState, setDevState] = useState<DevState>('ready')
  const [query, setQuery] = useState('')
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [pathway, setPathway] = useState<Pathway | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
  }, [view])

  const navigate = (next: View) => setView(next)
  const openUniversity = (university: University) => {
    setSelectedUniversityId(university.id)
    setView('profile')
  }
  const toggleSave = (id: string) => setSaved((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  const saveOnce = (id: string) => setSaved((current) => current.has(id) ? current : new Set(current).add(id))
  const completeIntake = (nextProfile: StudentProfile, nextPathway: Pathway) => {
    setProfile(nextProfile)
    setPathway(nextPathway)
    setView('results')
  }

  let screen: React.ReactNode
  if (devState === 'loading') screen = <LoadingState />
  else if (!['ready', 'partial'].includes(devState)) screen = <DesignedState state={devState as Exclude<DevState, 'ready' | 'loading' | 'partial'>} onReset={() => setDevState('ready')} />
  else {
    screen = <>
      {devState === 'partial' && <PartialBanner />}
      {view === 'search' && <SearchScreen query={query} setQuery={setQuery} saved={saved} onToggleSave={toggleSave} onOpen={openUniversity} />}
      {view === 'profile' && selectedUniversityId && <ProfileScreen universityId={selectedUniversityId} profile={profile} saved={saved.has(selectedUniversityId)} onToggleSave={() => toggleSave(selectedUniversityId)} />}
      {view === 'profile' && !selectedUniversityId && <DesignedState state="empty" onReset={() => setView('search')} />}
      {view === 'compare' && <CompareScreen profile={profile} />}
      {view === 'intake' && <IntakeScreen onComplete={completeIntake} />}
      {view === 'results' && pathway && <ResultsScreen pathway={pathway} saved={saved} onSave={saveOnce} onOpen={openUniversity} />}
      {view === 'results' && !pathway && <DesignedState state="empty" onReset={() => setView('intake')} />}
      {view === 'tools' && <ToolsScreen onNavigate={navigate} />}
      {view === 'saved' && <SavedScreen saved={saved} onToggleSave={toggleSave} onOpen={openUniversity} onExplore={() => setView('search')} />}
    </>
  }

  return (
    <div className="min-h-screen bg-canvas">
      <SampleRibbon state={devState} setState={setDevState} />
      <Navbar view={view} query={query} setQuery={setQuery} onNavigate={navigate} />
      {screen}
      {devState !== 'loading' && <Footer onNavigate={navigate} />}
    </div>
  )
}
