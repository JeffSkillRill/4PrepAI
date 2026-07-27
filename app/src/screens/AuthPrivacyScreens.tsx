import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import type { View } from '../types'

export function AuthScreen({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { user, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consented, setConsented] = useState(false)
  const [status, setStatus] = useState<'ready' | 'loading' | 'confirmation'>('ready')
  const [error, setError] = useState('')

  if (user) {
    return (
      <main className="page-container py-16">
        <section className="card mx-auto max-w-xl p-7 text-center sm:p-10">
          <CheckCircle2 size={46} className="mx-auto text-forest-600" />
          <h1 className="display mt-5 text-3xl font-extrabold">You’re signed in</h1>
          <p className="mt-3 text-muted">{user.email}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => onNavigate('saved')} className="rounded-xl bg-forest-800 px-5 py-3 font-bold text-white">Open saved plans</button>
            <button onClick={() => void signOut()} className="rounded-xl border border-line px-5 py-3 font-bold text-muted">Sign out</button>
          </div>
        </section>
      </main>
    )
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (mode === 'sign_up' && !consented) return
    setStatus('loading')
    setError('')
    try {
      if (mode === 'sign_up') {
        const result = await signUp(email, password)
        if (result === 'confirmation_required') {
          setStatus('confirmation')
          return
        }
      } else {
        await signIn(email, password)
      }
      onNavigate('saved')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Authentication failed.')
      setStatus('ready')
    }
  }

  return (
    <main className="soft-grid py-12 sm:py-16">
      <section className="card mx-auto w-[min(520px,calc(100%-32px))] p-6 sm:p-9">
        <div className="grid size-13 place-items-center rounded-xl bg-forest-50 text-forest-700"><LockKeyhole /></div>
        <h1 className="display mt-5 text-3xl font-extrabold">{mode === 'sign_in' ? 'Welcome back' : 'Create your private account'}</h1>
        <p className="mt-2 leading-6 text-muted">Email authentication protects your intake profile and saved university plans.</p>
        {status === 'confirmation' ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
            Check your email to confirm your account, then return here to sign in.
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="mt-7 space-y-5">
            <label className="block text-sm font-bold">Email
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-forest-500" />
            </label>
            <label className="block text-sm font-bold">Password
              <input required minLength={8} type="password" autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-forest-500" />
            </label>
            {mode === 'sign_up' && (
              <label className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-4 text-sm leading-6">
                <input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} className="mt-1 size-4 accent-forest-700" />
                <span>I consent to 4Prep storing my grades, budget, language score, preferences, and saved plans to provide my pathway. I have read the <button type="button" onClick={() => onNavigate('privacy')} className="font-bold text-forest-700 underline">Privacy Policy</button>.</span>
              </label>
            )}
            {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
            <button disabled={status === 'loading' || (mode === 'sign_up' && !consented)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-800 py-3.5 font-bold text-white disabled:opacity-50">
              {status === 'loading' ? 'Please wait…' : mode === 'sign_in' ? 'Sign in' : 'Create account'} <ArrowRight size={17} />
            </button>
          </form>
        )}
        <button onClick={() => { setMode(mode === 'sign_in' ? 'sign_up' : 'sign_in'); setStatus('ready'); setError('') }} className="mt-5 w-full text-sm font-bold text-forest-700">
          {mode === 'sign_in' ? 'New to 4Prep? Create an account' : 'Already have an account? Sign in'}
        </button>
      </section>
    </main>
  )
}

export function PrivacyScreen() {
  return (
    <main className="page-container py-12 lg:py-16">
      <article className="card mx-auto max-w-3xl p-6 sm:p-10">
        <div className="flex items-center gap-3 text-forest-700"><ShieldCheck /><span className="text-sm font-bold uppercase tracking-[.14em]">Privacy</span></div>
        <h1 className="display mt-4 text-4xl font-extrabold">4Prep Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Effective 27 July 2026</p>
        <div className="mt-8 space-y-7 leading-7 text-muted">
          <section><h2 className="display text-xl font-extrabold text-ink">What we collect</h2><p className="mt-2">If you create an account, 4Prep stores your email, destination and study preferences, self-reported academic score, budget and currency, language score, intake preference, and saved university plans. Counselor messages are sent to our server-side counselor function to produce a response.</p></section>
          <section><h2 className="display text-xl font-extrabold text-ink">Why we use it</h2><p className="mt-2">We use this information only to authenticate you, calculate your deterministic fit score, restore your pathway and shortlist, and answer counselor questions. Fit is guidance, not an admission decision.</p></section>
          <section><h2 className="display text-xl font-extrabold text-ink">Service providers</h2><p className="mt-2">Supabase provides authentication and database hosting. Perplexity processes counselor prompts; the function sends the message and relevant verified university records, not your stored student profile. Vercel is the planned web host.</p></section>
          <section><h2 className="display text-xl font-extrabold text-ink">Access and deletion</h2><p className="mt-2">Row-level security restricts profile and saved-plan records to the signed-in owner. A public support contact and self-service account-deletion flow must be added before accepting production accounts.</p></section>
          <section><h2 className="display text-xl font-extrabold text-ink">Data accuracy</h2><p className="mt-2">University facts show their source and retrieval date. Missing information remains marked as unknown. Always confirm application details with the university.</p></section>
        </div>
      </article>
    </main>
  )
}
