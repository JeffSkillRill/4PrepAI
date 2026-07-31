import { LogIn, Menu, Search, UserRound, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import {
  clearPendingAuth,
  getAuthStorage,
  readPendingAuth,
  resolveAccountProfile,
  writePendingAuth,
  type PendingDestination,
} from './auth/pendingAuth'
import type { Pathway, StudentProfile, University, View } from './types'
import { CompareScreen } from './screens/CompareScreen'
import { IntakeScreen, ResultsScreen } from './screens/FlowScreens'
import { ProfileScreen } from './screens/ProfileScreen'
import { SearchScreen } from './screens/SearchScreen'
import { SavedScreen, ToolsScreen } from './screens/ToolsSavedScreens'
import {
  AuthCallbackScreen,
  AuthScreen,
  PrivacyScreen,
  ResetPasswordScreen,
} from './screens/AuthPrivacyScreens'
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
  auth_callback: '/auth/callback',
  reset_password: '/reset-password',
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
        {view !== 'search' ? <label className="ml-auto hidden min-w-0 max-w-[300px] flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2.5 md:flex focus-within:border-forest-500"><span className="sr-only">Search universities</span><Search size={17} className="shrink-0 text-forest-700" aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onNavigate('search') }} placeholder="Search universities" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label> : <div className="ml-auto" />}
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
  const [privateLoadFailed, setPrivateLoadFailed] = useState(false)
  const [privateRetry, setPrivateRetry] = useState(0)
  const profileRef = useRef<StudentProfile | null>(null)
  const profileOwnerRef = useRef<string | null>(null)
  const loadedUserRef = useRef<string | null>(null)
  const authStorage = getAuthStorage()
  const [initialPendingAuth] = useState(() => readPendingAuth(authStorage))
  const [returnDestination, setReturnDestination] = useState<PendingDestination>(
    () => initialPendingAuth?.destination ?? { view: 'saved', universityId: null },
  )
  const [shouldReturnAfterAuth, setShouldReturnAfterAuth] = useState(
    () => initialPendingAuth !== null,
  )
  const { user, loading: authLoading, recordPrivacyConsent } = useAuth()

  const callbackKind = (() => {
    if (typeof window === 'undefined') return 'unknown'
    const kind = new URLSearchParams(window.location.search).get('kind')
    return kind === 'confirmation' || kind === 'google' ? kind : 'unknown'
  })()

  const navigateToDestination = useCallback((destination: PendingDestination) => {
    if (destination.view === 'profile' && destination.universityId) {
      window.history.pushState({}, '', `/universities/${encodeURIComponent(destination.universityId)}`)
      setSelectedUniversityId(destination.universityId)
      setView('profile')
      return
    }
    const path = viewPaths[destination.view] ?? '/universities'
    window.history.pushState({}, '', path)
    setSelectedUniversityId(null)
    setView(destination.view)
  }, [])

  const rememberAuth = (destination: PendingDestination) => {
    const previous = readPendingAuth(authStorage)
    const pending = {
      destination,
      profile: profileOwnerRef.current === null ? profileRef.current : null,
      ...(previous?.consentedAt ? { consentedAt: previous.consentedAt } : {}),
    }
    writePendingAuth(authStorage, pending)
    setReturnDestination(destination)
    setShouldReturnAfterAuth(true)
  }

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Auth transitions must clear private in-memory data before another user's records can render.
      setSaved(new Set())
      loadedUserRef.current = null
      setPrivateLoading(false)
      setPrivateLoadFailed(false)
      if (profileOwnerRef.current !== null) {
        profileOwnerRef.current = null
        profileRef.current = null
        setProfile(null)
        setPathway(null)
      }
      return
    }
    if (loadedUserRef.current === user.id) return
    loadedUserRef.current = user.id
    let active = true
    const pending = readPendingAuth(authStorage)
    const anonymousProfile = pending?.profile
      ?? (profileOwnerRef.current === null ? profileRef.current : null)
    setPrivateLoadFailed(false)
    setPrivateLoading(true)
    Promise.all([
      getStudentProfile(user.id),
      listSavedPlanIds(user.id),
      pending?.consentedAt
        ? recordPrivacyConsent(pending.consentedAt)
        : Promise.resolve(),
    ])
      .then(async ([storedProfile, ids]) => {
        const resolved = await resolveAccountProfile({
          userId: user.id,
          anonymousProfile,
          storedProfile,
          saveProfile: saveStudentProfile,
        })
        if (!active) return
        profileRef.current = resolved.profile
        profileOwnerRef.current = user.id
        setProfile(resolved.profile)
        setSaved(new Set(ids))
        clearPendingAuth(authStorage)
      })
      .catch((reason: unknown) => {
        loadedUserRef.current = null
        if (active) setPrivateLoadFailed(true)
        if (import.meta.env.DEV) console.error('Could not restore private account data:', reason)
      })
      .finally(() => {
        if (active) setPrivateLoading(false)
      })
    return () => { active = false }
  }, [authStorage, privateRetry, recordPrivacyConsent, user])

  useEffect(() => {
    if (
      view !== 'auth_callback'
      || callbackKind !== 'google'
      || authLoading
      || privateLoading
      || privateLoadFailed
      || !user
    ) return
    clearPendingAuth(authStorage)
    const timer = window.setTimeout(() => {
      setShouldReturnAfterAuth(false)
      navigateToDestination(returnDestination)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [
    authLoading,
    authStorage,
    callbackKind,
    navigateToDestination,
    privateLoadFailed,
    privateLoading,
    returnDestination,
    user,
    view,
  ])

  useEffect(() => {
    if (
      !shouldReturnAfterAuth
      || view !== 'auth'
      || authLoading
      || privateLoading
      || privateLoadFailed
      || !user
    ) return
    const timer = window.setTimeout(() => {
      setShouldReturnAfterAuth(false)
      navigateToDestination(returnDestination)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [
    authLoading,
    navigateToDestination,
    privateLoadFailed,
    privateLoading,
    returnDestination,
    shouldReturnAfterAuth,
    user,
    view,
  ])

  useEffect(() => {
    if (view !== 'results' || !profile || pathway) return
    void getRankedPathway(profile).then(setPathway)
  }, [view, profile, pathway])

  const navigate = (next: View) => {
    if (next === 'auth' && !user && view !== 'auth') {
      rememberAuth({ view, universityId: view === 'profile' ? selectedUniversityId : null })
    }
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
    profileRef.current = nextProfile
    profileOwnerRef.current = user?.id ?? null
    setProfile(nextProfile)
    setPathway(nextPathway)
    if (user) {
      void saveStudentProfile(user.id, nextProfile).catch((reason: unknown) => {
        if (import.meta.env.DEV) console.error('Could not save the student profile:', reason)
      })
    }
    navigate('results')
  }

  const prepareGoogle = (consentedAt: string) => {
    const existing = readPendingAuth(authStorage)
    writePendingAuth(authStorage, {
      destination: existing?.destination ?? returnDestination,
      profile: existing?.profile ?? (profileOwnerRef.current === null ? profileRef.current : null),
      consentedAt,
    })
    setShouldReturnAfterAuth(true)
  }

  const finishAuthentication = () => {
    setShouldReturnAfterAuth(false)
    navigateToDestination(returnDestination)
  }

  const finishSignOut = () => {
    clearPendingAuth(authStorage)
    profileRef.current = null
    profileOwnerRef.current = null
    loadedUserRef.current = null
    setProfile(null)
    setPathway(null)
    setSaved(new Set())
    setShouldReturnAfterAuth(false)
  }

  const finishDeletion = () => {
    finishSignOut()
    setReturnDestination({ view: 'saved', universityId: null })
  }

  const authScreen = (
    <AuthScreen
      onNavigate={navigate}
      onAuthenticated={finishAuthentication}
      onPrepareGoogle={prepareGoogle}
      onSignedOut={finishSignOut}
      onAccountDeleted={finishDeletion}
    />
  )

  let screen: React.ReactNode
  if (authLoading || privateLoading) screen = <LoadingState />
  else if (privateLoadFailed && user) screen = (
    <DesignedState
      state="error"
      onReset={() => {
        loadedUserRef.current = null
        setPrivateRetry((current) => current + 1)
      }}
    />
  )
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
    : authScreen
  else if (view === 'counselor') screen = <CounselorScreen />
  else if (view === 'auth') screen = authScreen
  else if (view === 'reset_password') screen = <ResetPasswordScreen onNavigate={navigate} />
  else if (view === 'auth_callback') screen = <AuthCallbackScreen kind={callbackKind} onNavigate={navigate} onContinue={finishAuthentication} />
  else screen = <PrivacyScreen />

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar view={view} query={query} setQuery={setQuery} onNavigate={navigate} />
      {screen}
      <Footer onNavigate={navigate} />
    </div>
  )
}
