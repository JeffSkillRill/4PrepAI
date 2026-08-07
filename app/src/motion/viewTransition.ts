import { shouldAnimateMotion } from './preference'

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown
}

export function runViewTransition(
  update: () => void,
  documentRef: TransitionDocument | null = typeof document === 'undefined'
    ? null
    : document as TransitionDocument,
  matchMedia: ((query: string) => Pick<MediaQueryList, 'matches'>) | null = typeof window === 'undefined'
    ? null
    : window.matchMedia.bind(window),
): boolean {
  if (!documentRef?.startViewTransition || !shouldAnimateMotion(matchMedia)) {
    update()
    return false
  }
  documentRef.startViewTransition(update)
  return true
}
