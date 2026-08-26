import { LogIn, Menu, UserRound, X } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
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
import { SkillGapScreen } from './screens/SkillGapScreen'
import { PlanScreen } from './screens/PlanScreen'
import { ScholarshipScreen } from './screens/ScholarshipScreen'
import {
  AuthCallbackScreen,
  AuthScreen,
  PrivacyScreen,
  ResetPasswordScreen,
} from './screens/AuthPrivacyScreens'
import { CounselorScreen } from './screens/CounselorScreen'
import { NotFoundScreen } from './screens/NotFoundScreen'
import { ConnectionStatus, DesignedState, LoadingState } from './components/States'
import { AppLink } from './components/AppLink'
import { EnvironmentBanner } from './components/EnvironmentBanner'
import { CounselorWidget } from './components/CounselorWidget'
import {
  LearningAssignmentScreen,
  LearningLessonScreen,
  LearningModuleScreen,
  LearningTrackScreen,
} from './screens/LearningScreens'
import { learningPath, readRoute, viewPaths } from './routes'
import {
  getRankedPathway,
  getStudentProfile,
  listSavedPlanIds,
  removePlan,
  savePlan,
  saveStudentProfile,
} from './data/repository'
import { runViewTransition } from './motion/viewTransition'

const DashboardScreen = lazy(async () => {
  const module = await import('./screens/DashboardScreen')
  return { default: module.DashboardScreen }
})

const SupportScreen = lazy(async () => {
  const module = await import('./screens/SupportScreen')
  return { default: module.SupportScreen }
})

// Tools carries the planning tools — skill gap, scholarships, and pathway.
// It sat behind a route with no link for weeks, which made two shipped tools
// reachable only by typing a path.
const navItems: { label: string; view: View }[] = [
  { label: 'Search', view: 'search' },
  { label: 'Tools', view: 'tools' },
  { label: 'Learn', view: 'learn' },
  { label: 'Saved', view: 'saved' },
]

function Logo({ href, onNavigate, inverse = false }: { href: string; onNavigate: () => void; inverse?: boolean }) {
  return (
    <AppLink href={href} onNavigate={onNavigate} className="flex items-center gap-2.5" aria-label="4Prep home">
      <img
        src={inverse ? '/brand/4prep-mark-white.png' : '/brand/4prep-mark-color.png'}
        width="36"
        height="36"
        alt=""
        aria-hidden="true"
        className="size-9 shrink-0"
        decoding="async"
      />
      <span className={`display text-xl font-extrabold tracking-tight ${inverse ? 'text-white' : 'text-forest-950'}`}>4Prep</span>
    </AppLink>
  )
}

function Navbar({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const accountView: View = user ? 'dashboard' : 'auth'
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="page-container flex h-[72px] items-center gap-4">
        <Logo href={viewPaths.search as string} onNavigate={() => onNavigate('search')} />
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
          {navItems.map((item) => <AppLink key={item.view} href={viewPaths[item.view] as string} onNavigate={() => onNavigate(item.view)} aria-current={view === item.view ? 'page' : undefined} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${view === item.view ? 'bg-forest-50 text-forest-800' : 'text-muted hover:bg-canvas hover:text-ink'}`}>{item.label}</AppLink>)}
        </nav>
        <AppLink href={viewPaths[accountView] as string} onNavigate={() => onNavigate(accountView)} className="ml-auto hidden shrink-0 items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-bold text-forest-800 sm:flex"><LogIn size={16} /> {user ? 'Account' : 'Sign in'}</AppLink>
        <button onClick={() => onNavigate('intake')} className="hidden shrink-0 items-center gap-2 rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-bold text-white sm:flex"><UserRound size={17} /> Build my plan</button>
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-11 place-items-center rounded-xl border border-line xl:hidden" aria-label="Toggle menu" aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {menuOpen && <div className="border-t border-line bg-white xl:hidden"><nav className="page-container grid gap-1 py-3" aria-label="Mobile navigation">{navItems.map((item) => <AppLink key={item.view} href={viewPaths[item.view] as string} onNavigate={() => { onNavigate(item.view); setMenuOpen(false) }} aria-current={view === item.view ? 'page' : undefined} className={`rounded-xl px-4 py-3 text-left font-bold ${view === item.view ? 'bg-forest-50 text-forest-800' : 'text-muted'}`}>{item.label}</AppLink>)}<AppLink href={viewPaths[accountView] as string} onNavigate={() => { onNavigate(accountView); setMenuOpen(false) }} className="rounded-xl px-4 py-3 text-left font-bold text-muted">{user ? 'Account' : 'Sign in'}</AppLink><button onClick={() => { onNavigate('intake'); setMenuOpen(false) }} className="mt-2 rounded-xl bg-forest-800 px-4 py-3 text-left font-bold text-white">Build my plan</button></nav></div>}
    </header>
  )
}

function Footer({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { user } = useAuth()
  const accountView: View = user ? 'dashboard' : 'auth'
  return <footer className="mt-8 border-t border-forest-800 bg-forest-950 text-white"><div className="page-container grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-end"><div><Logo inverse href={viewPaths.search as string} onNavigate={() => onNavigate('search')} /></div><div className="flex flex-wrap gap-5 text-sm font-bold text-white/75"><AppLink href={viewPaths.tools as string} onNavigate={() => onNavigate('tools')}>Tools</AppLink><AppLink href={viewPaths.counselor as string} onNavigate={() => onNavigate('counselor')}>Counselor</AppLink><AppLink href={viewPaths.support as string} onNavigate={() => onNavigate('support')}>Platform support</AppLink><AppLink href={viewPaths.privacy as string} onNavigate={() => onNavigate('privacy')}>Privacy</AppLink><AppLink href={viewPaths[accountView] as string} onNavigate={() => onNavigate(accountView)}>Account</AppLink></div></div><div className="border-t border-forest-800"><div className="page-container flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-white/65"><span>© 2026 4Prep</span><span>Verify university details before applying</span></div></div></footer>
}

export default function App() {
  const initial = readRoute()
  const [view, setView] = useState<View>(initial.view)
  const [query, setQuery] = useState('')
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(initial.universityId)
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string | null>(initial.moduleSlug)
  const [selectedLessonSlug, setSelectedLessonSlug] = useState<string | null>(initial.lessonSlug)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [pathway, setPathway] = useState<Pathway | null>(null)
  /** Set only by "Rebuild my plan", so the wizard is never reached by accident. */
  const [rebuildRequested, setRebuildRequested] = useState(false)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [privateLoading, setPrivateLoading] = useState(false)
  const [privateLoadFailed, setPrivateLoadFailed] = useState(false)
  const [privateRetry, setPrivateRetry] = useState(0)
  const profileRef = useRef<StudentProfile | null>(null)
  const profileOwnerRef = useRef<string | null>(null)
  const loadedUserRef = useRef<string | null>(null)
  /** Identifies the newest private-data load so a superseded run cannot own the loading flag. */
  const privateLoadRunRef = useRef(0)
  /**
   * `recordPrivacyConsent` gets a new identity on every auth render. Holding it in a ref keeps
   * it out of the load effect's dependencies, which otherwise re-runs, hits the
   * `loadedUserRef` guard, and strands `privateLoading` at true.
   */
  const recordPrivacyConsentRef = useRef<((consentedAt: string) => Promise<void>) | null>(null)
  const authStorage = getAuthStorage()
  const [initialPendingAuth] = useState(() => readPendingAuth(authStorage))
  const [returnDestination, setReturnDestination] = useState<PendingDestination>(
    () => initialPendingAuth?.destination ?? { view: 'search', universityId: null },
  )
  const [shouldReturnAfterAuth, setShouldReturnAfterAuth] = useState(
    () => initialPendingAuth !== null,
  )
  const { user, loading: authLoading, recordPrivacyConsent } = useAuth()

  // Declared before the private-data effect so the ref is current when that effect first runs.
  useEffect(() => {
    recordPrivacyConsentRef.current = recordPrivacyConsent
  }, [recordPrivacyConsent])

  const callbackKind = (() => {
    if (typeof window === 'undefined') return 'unknown'
    const kind = new URLSearchParams(window.location.search).get('kind')
    return kind === 'confirmation' || kind === 'google' ? kind : 'unknown'
  })()

  const navigateToDestination = useCallback((destination: PendingDestination) => {
    if (destination.view === 'profile' && destination.universityId) {
      window.history.pushState({}, '', `/universities/${encodeURIComponent(destination.universityId)}`)
      setSelectedUniversityId(destination.universityId)
      runViewTransition(() => setView('profile'))
      return
    }
    if (
      destination.view === 'learn'
      || destination.view === 'learn_module'
      || destination.view === 'learn_lesson'
      || destination.view === 'learn_assignment'
    ) {
      const moduleSlug = destination.moduleSlug ?? null
      const lessonSlug = destination.lessonSlug ?? null
      window.history.pushState({}, '', learningPath(destination.view, moduleSlug, lessonSlug))
      setSelectedUniversityId(null)
      setSelectedModuleSlug(moduleSlug)
      setSelectedLessonSlug(lessonSlug)
      runViewTransition(() => setView(destination.view))
      return
    }
    const path = viewPaths[destination.view] ?? '/universities'
    window.history.pushState({}, '', path)
    setSelectedUniversityId(null)
    setSelectedModuleSlug(null)
    setSelectedLessonSlug(null)
    runViewTransition(() => setView(destination.view))
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
      runViewTransition(() => setView(route.view))
      setSelectedUniversityId(route.universityId)
      setSelectedModuleSlug(route.moduleSlug)
      setSelectedLessonSlug(route.lessonSlug)
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    document.getElementById('main-content')?.focus({ preventScroll: true })
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
    // Only the newest run may write results or clear the loading flag. A boolean `active`
    // flag cannot do this: when the effect re-runs and early-returns above, the in-flight
    // run's cleanup has already flipped it, so `privateLoading` would never be cleared.
    const runId = ++privateLoadRunRef.current
    const isCurrentRun = () => privateLoadRunRef.current === runId
    const pending = readPendingAuth(authStorage)
    const anonymousProfile = pending?.profile
      ?? (profileOwnerRef.current === null ? profileRef.current : null)
    setPrivateLoadFailed(false)
    setPrivateLoading(true)
    Promise.all([
      getStudentProfile(user.id),
      listSavedPlanIds(user.id),
      pending?.consentedAt
        ? (recordPrivacyConsentRef.current?.(pending.consentedAt) ?? Promise.resolve())
        : Promise.resolve(),
    ])
      .then(async ([storedProfile, ids]) => {
        const resolved = await resolveAccountProfile({
          userId: user.id,
          anonymousProfile,
          storedProfile,
          saveProfile: saveStudentProfile,
        })
        if (!isCurrentRun()) return
        profileRef.current = resolved.profile
        profileOwnerRef.current = user.id
        setProfile(resolved.profile)
        setSaved(new Set(ids))
        clearPendingAuth(authStorage)
      })
      .catch((reason: unknown) => {
        if (!isCurrentRun()) return
        loadedUserRef.current = null
        setPrivateLoadFailed(true)
        if (import.meta.env.DEV) console.error('Could not restore private account data:', reason)
      })
      .finally(() => {
        if (isCurrentRun()) setPrivateLoading(false)
      })
  }, [authStorage, privateRetry, user])

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

  const navigate = (requested: View) => {
    // The intake is answered once. Every "Build my plan" entry point in the app
    // lands on the saved plan instead once one exists, so a student edits rather
    // than silently starting again and overwriting what they had. Rebuilding is
    // still possible, but only by asking for it explicitly on the plan page.
    const next: View = requested === 'intake' && profile && !rebuildRequested ? 'plan' : requested
    if (next === 'auth' && !user && view !== 'auth') {
      rememberAuth({
        view,
        universityId: view === 'profile' ? selectedUniversityId : null,
        moduleSlug: (
          view === 'learn_module'
          || view === 'learn_lesson'
          || view === 'learn_assignment'
        ) ? selectedModuleSlug : null,
        lessonSlug: view === 'learn_lesson' ? selectedLessonSlug : null,
      })
    }
    const path = viewPaths[next] ?? '/universities'
    window.history.pushState({}, '', path)
    runViewTransition(() => setView(next))
    if (next !== 'profile') setSelectedUniversityId(null)
    if (
      next !== 'learn_module'
      && next !== 'learn_lesson'
      && next !== 'learn_assignment'
    ) {
      setSelectedModuleSlug(null)
      setSelectedLessonSlug(null)
    }
  }
  const openUniversity = (university: University) => {
    window.history.pushState({}, '', `/universities/${encodeURIComponent(university.id)}`)
    setSelectedUniversityId(university.id)
    runViewTransition(() => setView('profile'))
  }
  const openLearningTrack = () => {
    window.history.pushState({}, '', learningPath('learn'))
    setSelectedUniversityId(null)
    setSelectedModuleSlug(null)
    setSelectedLessonSlug(null)
    runViewTransition(() => setView('learn'))
  }
  const openLearningModule = (moduleSlug: string) => {
    window.history.pushState({}, '', learningPath('learn_module', moduleSlug))
    setSelectedUniversityId(null)
    setSelectedModuleSlug(moduleSlug)
    setSelectedLessonSlug(null)
    runViewTransition(() => setView('learn_module'))
  }
  const openLearningLesson = (moduleSlug: string, lessonSlug: string) => {
    window.history.pushState({}, '', learningPath('learn_lesson', moduleSlug, lessonSlug))
    setSelectedUniversityId(null)
    setSelectedModuleSlug(moduleSlug)
    setSelectedLessonSlug(lessonSlug)
    runViewTransition(() => setView('learn_lesson'))
  }
  const openLearningAssignment = (moduleSlug: string) => {
    window.history.pushState({}, '', learningPath('learn_assignment', moduleSlug))
    setSelectedUniversityId(null)
    setSelectedModuleSlug(moduleSlug)
    setSelectedLessonSlug(null)
    runViewTransition(() => setView('learn_assignment'))
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
  const persistProfile = (nextProfile: StudentProfile) => {
    profileRef.current = nextProfile
    profileOwnerRef.current = user?.id ?? null
    setProfile(nextProfile)
    if (user) {
      void saveStudentProfile(user.id, nextProfile).catch((reason: unknown) => {
        if (import.meta.env.DEV) console.error('Could not save the student profile:', reason)
      })
    }
  }
  const completeIntake = (nextProfile: StudentProfile, nextPathway: Pathway) => {
    persistProfile(nextProfile)
    setPathway(nextPathway)
    setRebuildRequested(false)
    navigate('results')
  }
  /** A single edited answer. The pathway is dropped so it recomputes from the change. */
  const updatePlanAnswer = (nextProfile: StudentProfile) => {
    persistProfile(nextProfile)
    setPathway(null)
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
    setReturnDestination({
      view: 'search',
      universityId: null,
      moduleSlug: null,
      lessonSlug: null,
    })
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
  if (authLoading || privateLoading) screen = <LoadingState kind="private" />
  else if (privateLoadFailed && user) screen = (
    <DesignedState
      state="error"
      onReset={() => {
        loadedUserRef.current = null
        setPrivateRetry((current) => current + 1)
      }}
    />
  )
  else if (view === 'dashboard') screen = (
    <Suspense fallback={<LoadingState kind="dashboard" />}>
      <DashboardScreen userId={user?.id ?? null} profile={profile} saved={saved} onNavigate={navigate} onOpenUniversity={openUniversity} />
    </Suspense>
  )
  else if (view === 'search') screen = <SearchScreen query={query} setQuery={setQuery} saved={saved} onToggleSave={toggleSave} onOpen={openUniversity} />
  else if (view === 'profile' && selectedUniversityId) screen = <ProfileScreen universityId={selectedUniversityId} profile={profile} saved={saved.has(selectedUniversityId)} onToggleSave={() => toggleSave(selectedUniversityId)} />
  else if (view === 'profile') screen = <DesignedState state="empty" onReset={() => navigate('search')} />
  else if (view === 'compare') screen = <CompareScreen profile={profile} saved={saved} />
  else if (view === 'intake') screen = <IntakeScreen initialProfile={rebuildRequested ? profile : null} onComplete={completeIntake} />
  else if (view === 'plan' && profile) screen = (
    <PlanScreen
      profile={profile}
      onSave={updatePlanAnswer}
      onNavigate={navigate}
      onRebuild={() => { setRebuildRequested(true); setView('intake'); window.history.pushState({}, '', viewPaths.intake as string) }}
    />
  )
  else if (view === 'plan') screen = <DesignedState state="empty" onReset={() => navigate('intake')} />
  else if (view === 'results' && pathway) screen = <ResultsScreen pathway={pathway} saved={saved} onSave={saveOnce} onOpen={openUniversity} />
  else if (view === 'results') screen = <DesignedState state="empty" onReset={() => navigate('intake')} />
  else if (view === 'tools') screen = <ToolsScreen onNavigate={navigate} />
  else if (view === 'saved') screen = user
    ? <SavedScreen saved={saved} onToggleSave={toggleSave} onOpen={openUniversity} onExplore={() => navigate('search')} />
    : authScreen
  else if (view === 'skill_gap') screen = <SkillGapScreen profile={profile} saved={saved} onNavigate={navigate} />
  else if (view === 'scholarships') screen = <ScholarshipScreen profile={profile} saved={saved} onNavigate={navigate} />
  else if (view === 'counselor') screen = <CounselorScreen onOpenCompare={() => navigate('compare')} />
  else if (view === 'support') screen = (
    <Suspense fallback={<LoadingState kind="private" />}>
      <SupportScreen
        key={user?.id ?? 'signed-out'}
        userId={user?.id ?? null}
        onSignIn={() => navigate('auth')}
        onOpenCounselor={() => navigate('counselor')}
      />
    </Suspense>
  )
  else if (view === 'learn') screen = (
    <LearningTrackScreen
      userId={user?.id ?? null}
      onOpenTrack={openLearningTrack}
      onOpenModule={openLearningModule}
      onOpenLesson={openLearningLesson}
      onOpenAssignment={openLearningAssignment}
      onSignIn={() => navigate('auth')}
    />
  )
  else if (view === 'learn_module' && selectedModuleSlug) screen = (
    <LearningModuleScreen
      userId={user?.id ?? null}
      moduleSlug={selectedModuleSlug}
      onOpenTrack={openLearningTrack}
      onOpenModule={openLearningModule}
      onOpenLesson={openLearningLesson}
      onOpenAssignment={openLearningAssignment}
      onSignIn={() => navigate('auth')}
    />
  )
  else if (view === 'learn_lesson' && selectedModuleSlug && selectedLessonSlug) screen = (
    <LearningLessonScreen
      userId={user?.id ?? null}
      moduleSlug={selectedModuleSlug}
      lessonSlug={selectedLessonSlug}
      onOpenTrack={openLearningTrack}
      onOpenModule={openLearningModule}
      onOpenLesson={openLearningLesson}
      onOpenAssignment={openLearningAssignment}
      onSignIn={() => navigate('auth')}
    />
  )
  else if (view === 'learn_assignment' && selectedModuleSlug) screen = (
    <LearningAssignmentScreen
      userId={user?.id ?? null}
      moduleSlug={selectedModuleSlug}
      onOpenTrack={openLearningTrack}
      onOpenModule={openLearningModule}
      onOpenLesson={openLearningLesson}
      onOpenAssignment={openLearningAssignment}
      onSignIn={() => navigate('auth')}
    />
  )
  else if (
    view === 'learn_module'
    || view === 'learn_lesson'
    || view === 'learn_assignment'
  ) screen = <DesignedState state="empty" onReset={openLearningTrack} />
  else if (view === 'auth') screen = authScreen
  else if (view === 'reset_password') screen = <ResetPasswordScreen onNavigate={navigate} />
  else if (view === 'auth_callback') screen = <AuthCallbackScreen kind={callbackKind} onNavigate={navigate} onContinue={finishAuthentication} />
  else if (view === 'privacy') screen = <PrivacyScreen />
  else screen = <NotFoundScreen onReturn={() => navigate('search')} />

  return (
    <div className="min-h-screen bg-canvas">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar view={view} onNavigate={navigate} />
      <ConnectionStatus />
      <main id="main-content" tabIndex={-1}>{screen}</main>
      <Footer onNavigate={navigate} />
      <CounselorWidget onOpenCounselor={() => navigate('counselor')} />
      <EnvironmentBanner />
    </div>
  )
}
