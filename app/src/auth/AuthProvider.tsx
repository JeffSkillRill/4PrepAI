import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getSupabaseClient } from '../data/client'
import { destructiveOperationsAllowed } from '../data/environment'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  authEvent: AuthChangeEvent | null
  isPasswordRecovery: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<'active' | 'confirmation_required'>
  signInWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  updateProfile: ({ fullName, avatarFile }: { fullName?: string; avatarFile?: File }) => Promise<User>
  resendConfirmation: (email: string) => Promise<void>
  recordPrivacyConsent: (consentedAt: string) => Promise<void>
  deleteAccount: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PRIVACY_CONSENT_VERSION = '2026-08-05'

type AuthStartup =
  | { client: ReturnType<typeof getSupabaseClient>; error: null }
  | { client: null; error: Error }

function appUrl(path: string): string {
  const origin = typeof window === 'undefined' ? 'https://app.4prep.ai' : window.location.origin
  return new URL(path, origin).toString()
}

function isRecoveryUrl(): boolean {
  if (typeof window === 'undefined') return false
  const query = new URLSearchParams(window.location.search)
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return query.get('type') === 'recovery' || fragment.get('type') === 'recovery'
}

export function displayNameForUser(user: User): string {
  const fullName = user.user_metadata.full_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  return user.email?.split('@')[0] || 'Student'
}

export function initialsForDisplayName(displayName: string): string {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  return initials || 'S'
}

function avatarExtension(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (/^[a-z0-9]{1,8}$/.test(extension)) return extension
  const subtype = file.type.split('/')[1]?.replace(/[^a-z0-9]/gi, '').toLowerCase()
  return subtype || 'image'
}

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
  const [authEvent, setAuthEvent] = useState<AuthChangeEvent | null>(null)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(isRecoveryUrl)

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

    const { data } = authClient.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return
      setAuthEvent(event)
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true)
      if (event === 'SIGNED_OUT') setIsPasswordRecovery(false)
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
    authEvent,
    isPasswordRecovery,
    signIn: async (email, password) => {
      const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signUp: async (email, password, fullName) => {
      const consentedAt = new Date().toISOString()
      const { data, error } = await getSupabaseClient().auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: appUrl('/auth/callback?kind=confirmation'),
          data: {
            full_name: fullName?.trim() || undefined,
            privacy_consent_version: PRIVACY_CONSENT_VERSION,
            privacy_consented_at: consentedAt,
          },
        },
      })
      if (error) throw error
      return data.session ? 'active' : 'confirmation_required'
    },
    signInWithGoogle: async () => {
      const { error } = await getSupabaseClient().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: appUrl('/auth/callback?kind=google'),
        },
      })
      if (error) throw error
    },
    resetPassword: async (email) => {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
        redirectTo: appUrl('/reset-password'),
      })
      const resetErrorText = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase()
      if (resetErrorText.includes('user_not_found') || resetErrorText.includes('user not found')) return
      if (error) throw error
    },
    updatePassword: async (password) => {
      const { error } = await getSupabaseClient().auth.updateUser({ password })
      if (error) throw error
      setIsPasswordRecovery(false)
    },
    updateProfile: async ({ fullName, avatarFile }) => {
      const client = getSupabaseClient()
      const { data: userData, error: userError } = await client.auth.getUser()
      if (userError) throw userError
      const currentUser = userData.user
      if (!currentUser) throw new Error('Sign in before updating your profile.')

      const metadata: Record<string, string> = {}
      if (fullName !== undefined) metadata.full_name = fullName.trim()
      if (avatarFile) {
        const path = `${currentUser.id}/avatar-${Date.now()}.${avatarExtension(avatarFile)}`
        const { error: uploadError } = await client.storage.from('avatars').upload(path, avatarFile, {
          upsert: true,
          contentType: avatarFile.type,
        })
        if (uploadError) throw uploadError
        const { data: publicUrl } = client.storage.from('avatars').getPublicUrl(path)
        metadata.avatar_url = publicUrl.publicUrl
      }

      if (Object.keys(metadata).length === 0) return currentUser
      const { data, error } = await client.auth.updateUser({ data: metadata })
      if (error) throw error
      if (!data.user) throw new Error('4Prep could not update your profile.')
      return data.user
    },
    resendConfirmation: async (email) => {
      const { error } = await getSupabaseClient().auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: appUrl('/auth/callback?kind=confirmation'),
        },
      })
      if (error) throw error
    },
    recordPrivacyConsent: async (consentedAt) => {
      const { error } = await getSupabaseClient().auth.updateUser({
        data: {
          privacy_consent_version: PRIVACY_CONSENT_VERSION,
          privacy_consented_at: consentedAt,
        },
      })
      if (error) throw error
    },
    deleteAccount: async () => {
      if (!destructiveOperationsAllowed({
        development: import.meta.env.DEV,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
        explicitOverride: import.meta.env.VITE_ALLOW_PRODUCTION_DESTRUCTIVE_OPERATIONS === 'true',
      })) {
        throw new Error('Account deletion is blocked in local development while connected to the production Supabase project.')
      }
      const client = getSupabaseClient()
      const avatarOwnerId = session?.user.id
      if (avatarOwnerId) {
        // Public avatar URLs should not outlive the account. RLS limits this
        // best-effort cleanup to the signed-in user's folder.
        const bucket = client.storage.from('avatars')
        const { data: avatars } = await bucket.list(avatarOwnerId, { limit: 100 })
        const paths = avatars?.map((avatar) => `${avatarOwnerId}/${avatar.name}`) ?? []
        if (paths.length > 0) await bucket.remove(paths)
      }
      const { data, error } = await client.functions.invoke<{
        deleted: boolean
        orphanedRows: number
        orphanedObjects: number
      }>(
        'delete-account',
        { body: { confirmation: 'delete-my-account' } },
      )
      if (error) throw error
      if (!data?.deleted || data.orphanedRows !== 0 || data.orphanedObjects !== 0) {
        throw new Error('Account deletion did not complete.')
      }
      await client.auth.signOut({ scope: 'local' })
      setSession(null)
      setIsPasswordRecovery(false)
    },
    signOut: async () => {
      const { error } = await getSupabaseClient().auth.signOut({ scope: 'local' })
      if (error) throw error
    },
  }), [authEvent, isPasswordRecovery, loading, session])

  if (startup.error) throw startup.error
  if (runtimeError) throw runtimeError

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider.')
  return value
}
