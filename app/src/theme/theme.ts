import { useSyncExternalStore } from 'react'
import { shouldAnimateMotion } from '../motion/preference'

export type ThemePreference = 'light' | 'dark' | 'system'

/** Shared with the pre-paint script in index.html; theme.test.ts keeps the two in step. */
export const THEME_STORAGE_KEY = '4prep-theme'
const THEME_CHANGE_EVENT = '4prep-theme-change'

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function getThemeStorage(): ThemeStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    // Some browsers throw on the accessor itself when site data is blocked.
    return null
  }
}

export function readThemePreference(storage: ThemeStorage | null): ThemePreference {
  try {
    const stored = storage?.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

/** "system" is stored as no value at all, so the OS preference stays in charge. */
export function writeThemePreference(storage: ThemeStorage | null, preference: ThemePreference): void {
  try {
    if (preference === 'system') storage?.removeItem(THEME_STORAGE_KEY)
    else storage?.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Private mode or a full quota: the choice still applies for this page view.
  }
}

/**
 * An explicit choice sets data-theme on <html>. "system" removes it, which
 * hands control to the prefers-color-scheme block in index.css, so a later OS
 * change is followed without any JavaScript.
 */
export function applyThemePreference(preference: ThemePreference, root: HTMLElement): void {
  if (preference === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', preference)
}

type RevealDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<unknown> }
}

/**
 * The new theme grows as a circle from `origin` (the control that was used),
 * drawn by the `.theme-reveal` rules in index.css. Reduced motion, an engine
 * that cannot report it, or no View Transitions support all get the instant switch.
 */
function revealTheme(preference: ThemePreference, origin?: { x: number; y: number }): void {
  const root = document.documentElement
  const doc = document as RevealDocument
  const matchMedia = typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : null
  if (!doc.startViewTransition || !shouldAnimateMotion(matchMedia)) {
    applyThemePreference(preference, root)
    return
  }
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? 0
  root.style.setProperty('--theme-reveal-x', `${x}px`)
  root.style.setProperty('--theme-reveal-y', `${y}px`)
  root.style.setProperty('--theme-reveal-r', `${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))}px`)
  // Scoped to this switch, so route changes keep their default cross-fade.
  root.classList.add('theme-reveal')
  const transition = doc.startViewTransition(() => applyThemePreference(preference, root))
  void transition.finished.finally(() => root.classList.remove('theme-reveal'))
}

/** Persists, applies (with the reveal only when motion is allowed) and tells every toggle. */
export function setThemePreference(preference: ThemePreference, origin?: { x: number; y: number }): void {
  writeThemePreference(getThemeStorage(), preference)
  if (typeof document !== 'undefined') revealTheme(preference, origin)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

function subscribe(notify: () => void): () => void {
  // Another tab changed the theme: follow it, then re-render.
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return
    applyThemePreference(readThemePreference(getThemeStorage()), document.documentElement)
    notify()
  }
  window.addEventListener(THEME_CHANGE_EVENT, notify)
  window.addEventListener('storage', handleStorage)
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, notify)
    window.removeEventListener('storage', handleStorage)
  }
}

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(
    subscribe,
    () => readThemePreference(getThemeStorage()),
    () => 'system',
  )
}
