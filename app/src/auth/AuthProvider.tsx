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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const client = getSupabaseClient()
    void client.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider.')
  return value
}
