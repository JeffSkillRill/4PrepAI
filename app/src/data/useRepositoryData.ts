import { useCallback, useEffect, useState } from 'react'
import type { DependencyList } from 'react'

export type LoadStatus = 'loading' | 'ready' | 'empty' | 'error' | 'offline'

export function useRepositoryData<T>(loader: () => Promise<T>, dependencies: DependencyList = []) {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((value) => value + 1), [])

  useEffect(() => {
    let active = true
    setStatus('loading')
    loader()
      .then((value) => {
        if (!active) return
        setData(value)
        setStatus(Array.isArray(value) && value.length === 0 ? 'empty' : 'ready')
      })
      .catch(() => {
        if (!active) return
        setStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error')
      })
    return () => {
      active = false
    }
    // The caller supplies the dependencies for its loader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, reloadToken])

  return { data, status, reload }
}
