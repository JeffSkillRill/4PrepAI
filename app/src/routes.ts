import type { View } from './types'

export type AppRoute = {
  view: View
  universityId: string | null
  moduleSlug: string | null
  lessonSlug: string | null
}

export const viewPaths: Partial<Record<View, string>> = {
  dashboard: '/dashboard',
  search: '/universities',
  compare: '/compare',
  intake: '/intake',
  results: '/results',
  tools: '/tools',
  saved: '/saved',
  counselor: '/counselor',
  support: '/support',
  learn: '/learn',
  auth: '/login',
  auth_callback: '/auth/callback',
  reset_password: '/reset-password',
  privacy: '/privacy',
  not_found: '/404',
}

const defaultRoute: AppRoute = {
  view: 'search',
  universityId: null,
  moduleSlug: null,
  lessonSlug: null,
}

const notFoundRoute: AppRoute = { ...defaultRoute, view: 'not_found' }

function decodePathPart(value: string): string | null {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

export function parseRoutePath(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, '') || '/'
  const assignment = path.match(/^\/learn\/([^/]+)\/assignment$/)
  if (assignment) {
    const moduleSlug = decodePathPart(assignment[1])
    return moduleSlug
      ? { ...defaultRoute, view: 'learn_assignment', moduleSlug }
      : notFoundRoute
  }

  const lesson = path.match(/^\/learn\/([^/]+)\/([^/]+)$/)
  if (lesson) {
    const moduleSlug = decodePathPart(lesson[1])
    const lessonSlug = decodePathPart(lesson[2])
    return moduleSlug && lessonSlug
      ? { ...defaultRoute, view: 'learn_lesson', moduleSlug, lessonSlug }
      : notFoundRoute
  }

  const learningModule = path.match(/^\/learn\/([^/]+)$/)
  if (learningModule) {
    const moduleSlug = decodePathPart(learningModule[1])
    return moduleSlug
      ? { ...defaultRoute, view: 'learn_module', moduleSlug }
      : notFoundRoute
  }

  if (path === '/learn') return { ...defaultRoute, view: 'learn' }

  const profile = path.match(/^\/universities\/([^/]+)$/)
  if (profile) {
    const universityId = decodePathPart(profile[1])
    return universityId
      ? { ...defaultRoute, view: 'profile', universityId }
      : notFoundRoute
  }

  const view = Object.entries(viewPaths).find(([, value]) => value === path)?.[0] as View | undefined
  return view ? { ...defaultRoute, view } : notFoundRoute
}

export function readRoute(): AppRoute {
  if (typeof window === 'undefined') return defaultRoute
  return parseRoutePath(window.location.pathname)
}

export function learningPath(
  view: Extract<View, 'learn' | 'learn_module' | 'learn_lesson' | 'learn_assignment'>,
  moduleSlug: string | null = null,
  lessonSlug: string | null = null,
): string {
  if (view === 'learn' || !moduleSlug) return '/learn'
  const modulePart = encodeURIComponent(moduleSlug)
  if (view === 'learn_assignment') return `/learn/${modulePart}/assignment`
  if (view === 'learn_lesson' && lessonSlug) {
    return `/learn/${modulePart}/${encodeURIComponent(lessonSlug)}`
  }
  return `/learn/${modulePart}`
}

export function buildRoutePath(route: AppRoute): string {
  if (route.view === 'profile') {
    return route.universityId
      ? `/universities/${encodeURIComponent(route.universityId)}`
      : viewPaths.not_found as string
  }
  if (
    route.view === 'learn'
    || route.view === 'learn_module'
    || route.view === 'learn_lesson'
    || route.view === 'learn_assignment'
  ) {
    return learningPath(route.view, route.moduleSlug, route.lessonSlug)
  }
  return viewPaths[route.view] ?? (viewPaths.not_found as string)
}
