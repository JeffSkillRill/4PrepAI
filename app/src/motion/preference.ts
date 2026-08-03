type MotionMedia = Pick<MediaQueryList, 'matches'>
type MatchMedia = (query: string) => MotionMedia

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function shouldAnimateMotion(
  matchMedia: MatchMedia | null = typeof window === 'undefined'
    ? null
    : window.matchMedia.bind(window),
): boolean {
  return matchMedia ? !matchMedia(REDUCED_MOTION_QUERY).matches : false
}
