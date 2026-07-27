import { LogIn, Menu, Search, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import type { Pathway, StudentProfile, University, View } from './types'
import { CompareScreen } from './screens/CompareScreen'
import { IntakeScreen, ResultsScreen } from './screens/FlowScreens'
import { ProfileScreen } from './screens/ProfileScreen'
import { SearchScreen } from './screens/SearchScreen'
import { SavedScreen, ToolsScreen } from './screens/ToolsSavedScreens'
import { AuthScreen, PrivacyScreen } from './screens/AuthPrivacyScreens'
import { CounselorScreen } from './screens/CounselorScreen'
import { DesignedState, LoadingState } from './components/States'
import {
  getRankedPathway,
  getStudentProfile,
  listSavedPlanIds,
  removePlan,
  savePlan,
  saveStudentProfile,
} from './data/repository'

const navItems: { label: string; view: View }[] = [
  { label: 'Search', view: 'search' },
  { label: 'Compare', view: 'compare' },
  { label: 'Counselor', view: 'counselor' },
  { label: 'Tools', view: 'tools' },
  { label: 'Saved', view: 'saved' },
]

const viewPaths: Partial<Record<View, string>> = {
  search: '/universities',
  compare: '/compare',
  intake: '/intake',
  results: '/results',
  tools: '/tools',
  saved: '/saved',
  counselor: '/counselor',
  auth: '/login',
  privacy: '/privacy',
}

function readRoute(): { view: View; universityId: string | null } {
  if (typeof window === 'undefined') return { view: 'search', universityId: null }
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const profile = path.match(/^\/universities\/([^/]+)$/)
  if (profile) return { view: 'profile', universityId: decodeURIComponent(profile[1]) }
  const view = Object.entries(viewPaths).find(([, value]) => value === path)?.[0] as View | undefined
  return { view: view ?? 'search', universityId: null }
}

function Logo({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-2.5" aria-label="4Prep home"><span className="relative grid size-9 rotate-3 place-items-center rounded-[10px] bg-forest-800 text-white shadow"><span className="display -rotate-3 text-lg font-extrabold">4</span><span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-amber-400" /></span><span className="display text-xl font-extrabold tracking-tight text-forest-900">4Prep</span></button>
}

function Navbar({ view, query, setQuery, onNavigate }: { view: View; query: string; setQuery: (value: string) => void; onNavigate: (view: View) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-lg">
      <div className="page-container flex h-[72px] items-center gap-4">
        <Logo onClick={() => onNavigate('search')} />
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
          {navItems.map((item) => <button key={item.view} onClick={() => onNavigate(item.view)} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${view === item.view ? 'bg-forest-50 text-forest-800' : 'text-muted hover:bg-canvas hover:text-ink'}`}>{item.label}</button>)}
        </nav>
        {view !== 'search' ? <label className="ml-auto hidden min-w-0 max-w-[300px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 md:flex focus-within:border-forest-500"><Search size={17} className="shrink-0 text-forest-700" /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onNavigate('search') }} placeholder="Search universities" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label> : <div className="ml-auto" />}
        <button onClick={() => onNavigate('auth')} className="hidden shrink-0 items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-bold text-forest-800 sm:flex"><LogIn size={16} /> {user ? 'Account' : 'Sign in'}</button>
        <button onClick={() => onNavigate('intake')} className="hidden shrink-0 items-center gap-2 rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-bold text-white sm:flex"><UserRound size={17} /> Build my plan</button>
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-xl border border-line xl:hidden" aria-label="Toggle menu" aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {menuOpen && <div className="border-t border-line bg-white xl:hidden"><nav className="page-container grid gap-1 py-3" aria-label="Mobile navigation">{navItems.map((item) => <button key={item.view} onClick={() => { onNavigate(item.view); setMenuOpen(false) }} className={`rounded-xl px-4 py-3 text-left font-bold ${view === item.view ? 'bg-forest-50 text-forest-800' : 'text-muted'}`}>{item.label}</button>)}<button onClick={() => { onNavigate('auth'); setMenuOpen(false) }} className="rounded-xl px-4 py-3 text-left font-bold text-muted">{user ? 'Account' : 'Sign in'}</button><button onClick={() => { onNavigate('intake'); setMenuOpen(false) }} className="mt-2 rounded-xl bg-forest-800 px-4 py-3 text-left font-bold text-white">Build my plan</button></nav></div>}
    </header>
  )
}

function Footer({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <footer className="mt-8 border-t border-line bg-white"><div className="page-container grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end"><div><Logo onClick={() => onNavigate('search')} /><p className="mt-4 max-w-md text-sm leading-6 text-muted">A calmer, source-backed way for Central Asian students to explore university pathways.</p></div><div className="flex flex-wrap gap-5 text-sm font-bold text-muted"><button onClick={() => onNavigate('counselor')}>Counselor</button><button onClick={() => onNavigate('privacy')}>Privacy</button><button onClick={() => onNavigate('auth')}>Account</button></div></div><div className="border-t border-line"><div className="page-container flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-muted"><span>© 2026 4Prep</span><span>Verify university details before applying</span></div></div></footer>
}

export default function App() {
  const initial = readRoute()
  const [view, setView] = useState<View>(initial.view)
  const [query, setQuery] = useState('')
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(initial.universityId)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [pathway, setPathway] = useState<Pathway | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [privateLoading, setPrivateLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const handlePop = () => {
      const route = readRoute()
      setView(route.view)
      setSelectedUniversityId(route.universityId)
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  useEffect(() => {
    if (!user) {
      setSaved(new Set())
      setProfile(null)
      setPathway(null)
      return
    }
    let active = true
    setPrivateLoading(true)
    Promise.all([getStudentProfile(user.id), listSavedPlanIds(user.id)])
      .then(([nextProfile, ids]) => {
        if (!active) return
        setProfile(nextProfile)
        setSaved(new Set(ids))
      })
      .finally(() => {
        if (active) setPrivateLoading(false)
      })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (view !== 'results' || !profile || pathway) return
    void getRankedPathway(profile).then(setPathway)
  }, [view, profile, pathway])

  const navigate = (next: View) => {
    const path = viewPaths[next] ?? '/universities'
    window.history.pushState({}, '', path)
    setView(next)
    if (next !== 'profile') setSelectedUniversityId(null)
  }
  const openUniversity = (university: University) => {
    window.history.pushState({}, '', `/universities/${encodeURIComponent(university.id)}`)
    setSelectedUniversityId(university.id)
    setView('profile')
  }
  const toggleSave = (id: string) => {
    if (!user) {
      navigate('auth')
      return
    }
    const isSaved = saved.has(id)
    setSaved((current) => {
      const next = new Set(current)
      if (isSaved) next.delete(id)
      else next.add(id)
      return next
    })
    void (isSaved ? removePlan(user.id, id) : savePlan(user.id, id)).catch(() => {
      setSaved((current) => {
        const next = new Set(current)
        if (isSaved) next.add(id)
        else next.delete(id)
        return next
      })
    })
  }
  const saveOnce = (id: string) => {
    if (!saved.has(id)) toggleSave(id)
  }
  const completeIntake = (nextProfile: StudentProfile, nextPathway: Pathway) => {
    setProfile(nextProfile)
    setPathway(nextPathway)
    if (user) void saveStudentProfile(user.id, nextProfile)
    navigate('results')
  }

  let screen: React.ReactNode
  if (authLoading || privateLoading) screen = <LoadingState />
  else if (view === 'search') screen = <SearchScreen query={query} setQuery={setQuery} saved={saved} onToggleSave={toggleSave} onOpen={openUniversity} />
  else if (view === 'profile' && selectedUniversityId) screen = <ProfileScreen universityId={selectedUniversityId} profile={profile} saved={saved.has(selectedUniversityId)} onToggleSave={() => toggleSave(selectedUniversityId)} />
  else if (view === 'profile') screen = <DesignedState state="empty" onReset={() => navigate('search')} />
  else if (view === 'compare') screen = <CompareScreen profile={profile} />
  else if (view === 'intake') screen = <IntakeScreen onComplete={completeIntake} />
  else if (view === 'results' && pathway) screen = <ResultsScreen pathway={pathway} saved={saved} onSave={saveOnce} onOpen={openUniversity} />
  else if (view === 'results') screen = <DesignedState state="empty" onReset={() => navigate('intake')} />
  else if (view === 'tools') screen = <ToolsScreen onNavigate={navigate} />
  else if (view === 'saved') screen = user
    ? <SavedScreen saved={saved} onToggleSave={toggleSave} onOpen={openUniversity} onExplore={() => navigate('search')} />
    : <AuthScreen onNavigate={navigate} />
  else if (view === 'counselor') screen = <CounselorScreen />
  else if (view === 'auth') screen = <AuthScreen onNavigate={navigate} />
  else screen = <PrivacyScreen />

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar view={view} query={query} setQuery={setQuery} onNavigate={navigate} />
      {screen}
      <Footer onNavigate={navigate} />
    </div>
  )
}
