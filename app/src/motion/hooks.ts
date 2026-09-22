import { useEffect, useRef, useState } from 'react'
import { shouldAnimateMotion } from './preference'

/**
 * Resolved once, at first render, so a component never changes its mind
 * half-way through an animation — and so the very first paint of a
 * reduced-motion page is already the final state. An engine without
 * IntersectionObserver counts as "no motion": there is no way to know when an
 * element arrives, and content must never wait behind an API that is absent.
 */
function useMotionEnabled(): boolean {
  const [enabled] = useState(() => {
    // An environment that cannot report the preference is treated as refusing
    // motion, the same as an explicit `prefers-reduced-motion: reduce`.
    const matchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia.bind(window)
      : null
    return shouldAnimateMotion(matchMedia) && typeof IntersectionObserver !== 'undefined'
  })
  return enabled
}

export type ScrollReveal<T extends HTMLElement> = {
  ref: React.RefObject<T | null>
  /** True once the element has entered the viewport, or from the first render when motion is off. */
  revealed: boolean
  animate: boolean
}

export function useScrollReveal<T extends HTMLElement>(): ScrollReveal<T> {
  const animate = useMotionEnabled()
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    if (!animate) return
    const node = ref.current
    if (!node) {
      // Nothing to observe; reveal on the next frame rather than never.
      const frame = requestAnimationFrame(() => setSeen(true))
      return () => cancelAnimationFrame(frame)
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setSeen(true)
        observer.disconnect()
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [animate])

  return { ref, revealed: animate ? seen : true, animate }
}

const easeOut = (t: number) => 1 - (1 - t) ** 3

/**
 * Counts towards the real value and lands exactly on it. `start` gates the
 * count on the element being visible; with motion off the true value is
 * returned from the very first render, without any state involved.
 */
export function useCountUp(target: number, animate: boolean, start: boolean, durationMs = 900): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!animate || !start) return
    let frame = 0
    const began = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - began) / durationMs)
      if (progress < 1) {
        setValue(target * easeOut(progress))
        frame = requestAnimationFrame(step)
      } else {
        setValue(target)
      }
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, animate, start, durationMs])

  return animate ? value : target
}
