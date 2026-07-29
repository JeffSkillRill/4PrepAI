import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getSupabaseClient } from '../data/client'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<'active' | 'confirmation_required'>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthStartup =
  | { client: ReturnType<typeof getSupabaseClient>; error: null }
  | { client: null; error: Error }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [startup] = useState<AuthStartup>(() => {
    try {
      return { client: getSupabaseClient(), error: null }
    } catch (reason) {
      return {
        client: null,
        error: reason instanceof Error ? reason : new Error('4Prep could not initialize authentication.'),
      }
    }
  })
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(startup.client !== null)
  const [runtimeError, setRuntimeError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true
    const authClient = startup.client
    if (!authClient) return

    void authClient.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error) throw error
        setSession(data.session)
        setLoading(false)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setLoading(false)
        setRuntimeError(reason instanceof Error ? reason : new Error('4Prep could not initialize authentication.'))
      })

    const { data } = authClient.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setLoading(false)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [startup.client])

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    signIn: async (email, password) => {
      const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signUp: async (email, password) => {
      const consentedAt = new Date().toISOString()
      const { data, error } = await getSupabaseClient().auth.signUp({
        email,
        password,
        options: {
          data: {
            privacy_consent_version: '2026-07-27',
            privacy_consented_at: consentedAt,
          },
        },
      })
      if (error) throw error
      return data.session ? 'active' : 'confirmation_required'
    },
    signOut: async () => {
      const { error } = await getSupabaseClient().auth.signOut()
      if (error) throw error
    },
  }), [loading, session])

  if (startup.error) throw startup.error
  if (runtimeError) throw runtimeError

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider.')
  return value
}
