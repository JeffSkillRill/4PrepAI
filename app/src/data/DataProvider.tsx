import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Source } from '../types'
import { listSources } from './repository'

type SourceContextValue = {
  sources: ReadonlyMap<string, Source>
  loading: boolean
  error: Error | null
}

const SourceContext = createContext<SourceContextValue>({
  sources: new Map(),
  loading: true,
  error: null,
})

export function DataProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true
    listSources()
      .then((rows) => {
        if (active) setItems(rows)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason : new Error('Sources could not be loaded.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo<SourceContextValue>(
    () => ({ sources: new Map(items.map((source) => [source.id, source])), loading, error }),
    [items, loading, error],
  )

  return <SourceContext.Provider value={value}>{children}</SourceContext.Provider>
}

export function useSource(id: string): Source | undefined {
  return useContext(SourceContext).sources.get(id)
}

export function useSourceStatus() {
  const { loading, error } = useContext(SourceContext)
  return { loading, error }
}
