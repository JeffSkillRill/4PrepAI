import { useCallback, useEffect, useRef } from 'react'

// Pair with an account/route key on private screens. A completed request (or a
// queued timer) from an unmounted screen must not publish results or start work.
export function useRequestScope() {
  const scope = useRef({ active: true, version: 0 })
  useEffect(() => {
    const current = scope.current
    current.active = true
    return () => {
      current.active = false
      current.version += 1
    }
  }, [])
  return useCallback(() => {
    const version = scope.current.version
    return () => scope.current.active && scope.current.version === version
  }, [])
}
