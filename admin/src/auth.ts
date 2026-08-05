import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from './data/client'

type AuthStartup =
  | { client: ReturnType<typeof getSupabaseClient>; error: null }
  | { client: null; error: Error }

export function useAdminAuth() {
  const [startup] = useState<AuthStartup>(() => {
    try {
      return { client: getSupabaseClient(), error: null }
    } catch (reason) {
      return {
        client: null,
        error: reason instanceof Error ? reason : new Error('Authentication could not start.'),
      }
    }
  })
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(startup.client !== null)
  const [runtimeError, setRuntimeError] = useState<Error | null>(null)

  useEffect(() => {
    const client = startup.client
    if (!client) return
    let active = true

    void client.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error) throw error
        setSession(data.session)
        setLoading(false)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setRuntimeError(reason instanceof Error ? reason : new Error('Authentication could not start.'))
        setLoading(false)
      })

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setLoading(false)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [startup.client])

  return useMemo(() => ({
    session,
    loading,
    error: startup.error ?? runtimeError,
    signIn: async (email: string, password: string) => {
      if (!startup.client) throw startup.error
      const { error } = await startup.client.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signOut: async () => {
      if (!startup.client) return
      const { error } = await startup.client.auth.signOut({ scope: 'local' })
      if (error) throw error
      setSession(null)
    },
  }), [loading, runtimeError, session, startup.client, startup.error])
}
