import type { StudentProfile, View } from '../types'

export const PENDING_AUTH_STORAGE_KEY = '4prep.pending-auth'

export type PendingDestination = {
  view: View
  universityId: string | null
}

export type PendingAuth = {
  destination: PendingDestination
  profile: StudentProfile | null
  consentedAt?: string
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const blockedDestinations = new Set<View>(['auth', 'auth_callback', 'reset_password'])
const validDestinations = new Set<View>([
  'search',
  'profile',
  'compare',
  'intake',
  'results',
  'tools',
  'saved',
  'counselor',
  'privacy',
])

export function getAuthStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function isDestination(value: unknown): value is PendingDestination {
  if (!value || typeof value !== 'object') return false
  const destination = value as Partial<PendingDestination>
  return (
    typeof destination.view === 'string'
    && validDestinations.has(destination.view as View)
    && !blockedDestinations.has(destination.view as View)
    && (destination.universityId === null || typeof destination.universityId === 'string')
  )
}

function isStudentProfile(value: unknown): value is StudentProfile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Partial<StudentProfile>
  return (
    typeof profile.country === 'string'
    && typeof profile.field === 'string'
    && (profile.academicScore === null || typeof profile.academicScore === 'number')
    && (profile.budgetMax === null || typeof profile.budgetMax === 'number')
    && (profile.budgetCurrency === null || typeof profile.budgetCurrency === 'string')
    && (
      profile.languageTest === null
      || profile.languageTest === 'ielts'
      || profile.languageTest === 'toefl'
      || profile.languageTest === 'duolingo'
    )
    && (profile.languageScore === null || typeof profile.languageScore === 'number')
    && typeof profile.needsLanguagePathway === 'boolean'
    && typeof profile.intake === 'string'
  )
}

export function readPendingAuth(storage: StorageLike | null): PendingAuth | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(PENDING_AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PendingAuth>
    if (!isDestination(parsed.destination)) return null
    if (parsed.profile !== null && !isStudentProfile(parsed.profile)) return null
    if (parsed.consentedAt !== undefined && typeof parsed.consentedAt !== 'string') return null
    return {
      destination: parsed.destination,
      profile: parsed.profile ?? null,
      ...(parsed.consentedAt ? { consentedAt: parsed.consentedAt } : {}),
    }
  } catch {
    return null
  }
}

export function writePendingAuth(storage: StorageLike | null, pending: PendingAuth): void {
  if (!storage) return
  try {
    storage.setItem(PENDING_AUTH_STORAGE_KEY, JSON.stringify(pending))
  } catch {
    // Session storage can be unavailable in hardened browsers. The in-memory
    // profile remains the fallback for password sign-in in the current page.
  }
}

export function clearPendingAuth(storage: StorageLike | null): void {
  if (!storage) return
  try {
    storage.removeItem(PENDING_AUTH_STORAGE_KEY)
  } catch {
    // A failed cleanup must not interrupt a completed authentication flow.
  }
}

type ResolveAccountProfileOptions = {
  userId: string
  anonymousProfile: StudentProfile | null
  storedProfile: StudentProfile | null
  saveProfile: (userId: string, profile: StudentProfile) => Promise<void>
}

export async function resolveAccountProfile({
  userId,
  anonymousProfile,
  storedProfile,
  saveProfile,
}: ResolveAccountProfileOptions): Promise<{ profile: StudentProfile | null; carried: boolean }> {
  if (!anonymousProfile) return { profile: storedProfile, carried: false }
  await saveProfile(userId, anonymousProfile)
  return { profile: anonymousProfile, carried: true }
}
