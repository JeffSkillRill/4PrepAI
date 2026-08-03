import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import { logUnmappedAuthError, mapAuthError, type AuthProblem } from '../auth/errors'
import { useAuth } from '../auth/AuthProvider'
import type { View } from '../types'
import { AppLink } from '../components/AppLink'
import { viewPaths } from '../routes'

type AuthScreenProps = {
  onNavigate: (view: View) => void
  onAuthenticated: () => void
  onPrepareGoogle: (consentedAt: string) => void
  onSignedOut: () => void
  onAccountDeleted: () => void
}

type AuthStatus = 'ready' | 'loading' | 'loading_google' | 'confirmation'

const fieldClass = 'mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal outline-none transition focus:border-forest-500 focus-visible:ring-2 focus-visible:ring-forest-300'
const focusButtonClass = 'outline-none focus-visible:ring-2 focus-visible:ring-forest-400 focus-visible:ring-offset-2'

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.715v2.259h2.909c1.702-1.567 2.684-3.875 2.684-6.614Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.181l-2.91-2.259c-.805.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.963 10.706A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.168.281-1.706V4.962H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.038l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.322 0 2.507.454 3.441 1.346l2.581-2.58C13.464.891 11.426 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.332C4.672 5.165 6.656 3.58 9 3.58Z" />
    </svg>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  showRequirement = false,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
  showRequirement?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const helpId = `${id}-help`
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold">{label}</label>
      <div className="relative">
        <input
          required
          minLength={8}
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={showRequirement ? helpId : undefined}
          className={`${fieldClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className={`absolute bottom-1.5 right-1.5 grid size-10 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink ${focusButtonClass}`}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
      {showRequirement && <p id={helpId} className="mt-2 text-xs leading-5 text-muted">Use at least 8 characters.</p>}
    </div>
  )
}

function ErrorNotice({
  problem,
  onResend,
}: {
  problem: AuthProblem | null
  onResend?: () => void
}) {
  if (!problem) return null
  return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-950">
      <p>{problem.message}</p>
      {problem.kind === 'unconfirmed' && onResend && (
        <button type="button" onClick={onResend} className={`mt-2 font-bold text-forest-800 underline ${focusButtonClass}`}>
          Resend confirmation email
        </button>
      )}
    </div>
  )
}

function useResendCooldown() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (seconds <= 0) return
    const timer = window.setTimeout(() => setSeconds((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [seconds])
  return { seconds, start: () => setSeconds(60) }
}

export function AuthScreen({
  onNavigate,
  onAuthenticated,
  onPrepareGoogle,
  onSignedOut,
  onAccountDeleted,
}: AuthScreenProps) {
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle,
    resendConfirmation,
    updatePassword,
    deleteAccount,
    signOut,
  } = useAuth()
  const emailId = useId()
  const passwordId = useId()
  const accountPasswordId = useId()
  const deleteEmailId = useId()
  const [mode, setMode] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consented, setConsented] = useState(false)
  const [googleConsented, setGoogleConsented] = useState(false)
  const [status, setStatus] = useState<AuthStatus>('ready')
  const [problem, setProblem] = useState<AuthProblem | null>(null)
  const [notice, setNotice] = useState('')
  const [accountPassword, setAccountPassword] = useState('')
  const [accountAction, setAccountAction] = useState<'ready' | 'password' | 'sign_out' | 'delete'>('ready')
  const [deleteStep, setDeleteStep] = useState<'closed' | 'confirm'>('closed')
  const [deleteEmail, setDeleteEmail] = useState('')
  const [accountDeleted, setAccountDeleted] = useState(false)
  const cooldown = useResendCooldown()

  const handleProblem = (reason: unknown) => {
    const nextProblem = mapAuthError(reason)
    logUnmappedAuthError(reason, nextProblem)
    setProblem(nextProblem)
  }

  if (accountDeleted) {
    return (
      <div className="soft-grid py-16">
        <section className="card mx-auto w-[min(520px,calc(100%-32px))] p-8 text-center">
          <CheckCircle2 size={46} className="mx-auto text-forest-600" />
          <h1 className="display mt-5 text-3xl font-extrabold">Account deleted</h1>
          <p className="mt-3 leading-6 text-muted">Your account, student profile, and saved plans were permanently deleted.</p>
          <AppLink href={viewPaths.search as string} onNavigate={() => onNavigate('search')} className={`mt-7 flex w-full items-center justify-center rounded-xl bg-forest-800 px-4 py-3 font-bold text-white ${focusButtonClass}`}>Return to universities</AppLink>
        </section>
      </div>
    )
  }

  const resend = async () => {
    if (!email || cooldown.seconds > 0) return
    setProblem(null)
    setNotice('')
    try {
      await resendConfirmation(email)
      cooldown.start()
      setNotice('A new confirmation email was requested. Check your inbox and spam folder.')
    } catch (reason) {
      handleProblem(reason)
    }
  }

  if (user) {
    const normalizedEmail = user.email?.trim().toLowerCase() ?? ''
    const canDelete = normalizedEmail.length > 0 && deleteEmail.trim().toLowerCase() === normalizedEmail
    const saveAccountPassword = async (event: FormEvent) => {
      event.preventDefault()
      setAccountAction('password')
      setProblem(null)
      setNotice('')
      try {
        await updatePassword(accountPassword)
        setAccountPassword('')
        setNotice('Your password is updated. You can use it with this email next time.')
      } catch (reason) {
        handleProblem(reason)
      } finally {
        setAccountAction('ready')
      }
    }
    const completeSignOut = async () => {
      setAccountAction('sign_out')
      setProblem(null)
      try {
        await signOut()
        onSignedOut()
      } catch (reason) {
        handleProblem(reason)
        setAccountAction('ready')
      }
    }
    const completeDeletion = async () => {
      if (!canDelete) return
      setAccountAction('delete')
      setProblem(null)
      try {
        await deleteAccount()
        setAccountDeleted(true)
        onAccountDeleted()
      } catch (reason) {
        handleProblem(reason)
        setAccountAction('ready')
      }
    }
    return (
      <div className="page-container py-10 sm:py-16">
        <section className="card mx-auto max-w-xl p-6 sm:p-10">
          <div className="text-center">
            <CheckCircle2 size={46} className="mx-auto text-forest-600" />
            <h1 className="display mt-5 text-3xl font-extrabold">You’re signed in</h1>
            <p className="mt-3 break-all text-muted">{user.email}</p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <AppLink href={viewPaths.saved as string} onNavigate={() => onNavigate('saved')} className={`flex items-center justify-center rounded-xl bg-forest-800 px-5 py-3 font-bold text-white ${focusButtonClass}`}>Open saved plans</AppLink>
            <button
              onClick={() => void completeSignOut()}
              disabled={accountAction !== 'ready'}
              className={`rounded-xl border border-line px-5 py-3 font-bold text-muted disabled:opacity-50 ${focusButtonClass}`}
            >
              {accountAction === 'sign_out' ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
          <p className="mt-3 text-center text-xs leading-5 text-muted">Sign out before leaving a shared device.</p>

          <div className="mt-8 border-t border-line pt-7">
            <h2 className="display text-xl font-extrabold">Email password</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Add or change a password for this email. Google sign-in will keep using the same account.</p>
            <form onSubmit={(event) => void saveAccountPassword(event)} className="mt-4 space-y-4">
              <PasswordField
                id={accountPasswordId}
                label="New password"
                value={accountPassword}
                onChange={setAccountPassword}
                autoComplete="new-password"
                showRequirement
              />
              <button
                disabled={accountAction !== 'ready'}
                aria-busy={accountAction === 'password'}
                className={`w-full rounded-xl border border-forest-700 px-4 py-3 font-bold text-forest-800 disabled:opacity-50 ${focusButtonClass}`}
              >
                {accountAction === 'password' ? 'Updating…' : 'Set password'}
              </button>
            </form>
          </div>

          <div className="mt-8 border-t border-line pt-7">
            <h2 className="display text-xl font-extrabold text-rose-900">Delete account</h2>
            <p className="mt-2 text-sm leading-6 text-muted">This permanently deletes your account, student profile, and saved plans. It cannot be undone.</p>
            {deleteStep === 'closed' ? (
              <button
                type="button"
                onClick={() => setDeleteStep('confirm')}
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-300 px-4 py-3 font-bold text-rose-800 ${focusButtonClass}`}
              >
                <Trash2 size={17} /> Start account deletion
              </button>
            ) : (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <label htmlFor={deleteEmailId} className="block text-sm font-bold text-rose-950">
                  Type your email to confirm
                </label>
                <input
                  id={deleteEmailId}
                  type="email"
                  autoComplete="email"
                  value={deleteEmail}
                  onChange={(event) => setDeleteEmail(event.target.value)}
                  className={fieldClass}
                />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => { setDeleteStep('closed'); setDeleteEmail('') }}
                    disabled={accountAction !== 'ready'}
                    className={`rounded-xl border border-line bg-white px-4 py-3 font-bold text-muted disabled:opacity-50 ${focusButtonClass}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void completeDeletion()}
                    disabled={!canDelete || accountAction !== 'ready'}
                    aria-busy={accountAction === 'delete'}
                    className={`rounded-xl bg-rose-800 px-4 py-3 font-bold text-white disabled:opacity-50 ${focusButtonClass}`}
                  >
                    {accountAction === 'delete' ? 'Deleting…' : 'Delete permanently'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div aria-live="polite" className="mt-5">
            {accountAction !== 'ready' && <p className="sr-only">Please wait.</p>}
            {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">{notice}</p>}
            <ErrorNotice problem={problem} />
          </div>
        </section>
      </div>
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (mode === 'sign_up' && !consented) return
    setStatus('loading')
    setProblem(null)
    setNotice('')
    try {
      if (mode === 'sign_up') {
        const result = await signUp(email, password)
        if (result === 'confirmation_required') {
          setStatus('confirmation')
          cooldown.start()
          return
        }
      } else {
        await signIn(email, password)
      }
      onAuthenticated()
    } catch (reason) {
      handleProblem(reason)
      setStatus('ready')
    }
  }

  const continueWithGoogle = async () => {
    if (!googleConsented) {
      setProblem({ kind: 'generic', message: 'Agree to the Privacy Policy before continuing with Google.' })
      return
    }
    setStatus('loading_google')
    setProblem(null)
    const consentedAt = new Date().toISOString()
    onPrepareGoogle(consentedAt)
    try {
      await signInWithGoogle()
    } catch (reason) {
      handleProblem(reason)
      setStatus('ready')
    }
  }

  return (
    <div className="soft-grid py-8 sm:py-16">
      <section className="card mx-auto w-[min(520px,calc(100%-32px))] p-6 sm:p-9">
        <div className="grid size-13 place-items-center rounded-xl bg-forest-50 text-forest-700"><LockKeyhole /></div>
        <h1 className="display mt-5 text-3xl font-extrabold">{mode === 'sign_in' ? 'Welcome back' : 'Create your private account'}</h1>
        <p className="mt-2 leading-6 text-muted">Protect your intake profile and saved university plans.</p>

        {status === 'confirmation' ? (
          <div className="mt-7">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
              <Mail size={24} />
              <h2 className="display mt-3 text-xl font-extrabold">Check your email</h2>
              <p className="mt-2 break-words text-sm leading-6">We sent a confirmation link to <strong>{email}</strong>. Open it to finish creating your account.</p>
            </div>
            <div className="mt-4" aria-live="polite">
              {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">{notice}</p>}
              <ErrorNotice problem={problem} />
            </div>
            <button
              type="button"
              onClick={() => void resend()}
              disabled={cooldown.seconds > 0}
              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-forest-700 px-4 py-3 font-bold text-forest-800 disabled:opacity-50 ${focusButtonClass}`}
            >
              <RefreshCw size={17} />
              {cooldown.seconds > 0 ? `Resend in ${cooldown.seconds}s` : 'Resend confirmation email'}
            </button>
            <button
              type="button"
              onClick={() => { setStatus('ready'); setProblem(null); setNotice('') }}
              className={`mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-forest-700 ${focusButtonClass}`}
            >
              <ArrowLeft size={16} /> Wrong email? Go back
            </button>
          </div>
        ) : (
          <>
            <label className="mt-7 flex items-start gap-3 rounded-xl border border-line bg-canvas p-4 text-sm leading-6">
              <input
                type="checkbox"
                checked={googleConsented}
                onChange={(event) => setGoogleConsented(event.target.checked)}
                className="mt-0.5 size-6 shrink-0 accent-forest-700 focus-visible:ring-2 focus-visible:ring-forest-400"
              />
              <span>To continue with Google, I agree to 4Prep storing my profile data. I have read the <AppLink href={viewPaths.privacy as string} onNavigate={() => onNavigate('privacy')} className={`font-bold text-forest-700 underline ${focusButtonClass}`}>Privacy Policy</AppLink>.</span>
            </label>
            <button
              type="button"
              onClick={() => void continueWithGoogle()}
              disabled={status !== 'ready'}
              aria-busy={status === 'loading_google'}
              className={`mt-4 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[#dadce0] bg-white px-4 py-3 font-semibold text-[#3c4043] shadow-sm transition hover:bg-[#f8fafd] disabled:opacity-50 ${focusButtonClass}`}
            >
              {status === 'loading_google' ? <LoaderCircle size={20} /> : <GoogleMark />}
              {status === 'loading_google' ? 'Opening Google…' : 'Continue with Google'}
            </button>

            <div className="my-6 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs font-bold uppercase tracking-[.12em] text-muted">or</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <form onSubmit={(event) => void submit(event)} className="space-y-5">
              <div>
                <label htmlFor={emailId} className="block text-sm font-bold">Email</label>
                <input
                  required
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={fieldClass}
                />
              </div>
              <PasswordField
                id={passwordId}
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
                showRequirement={mode === 'sign_up'}
              />
              {mode === 'sign_in' && (
                <AppLink
                  href={viewPaths.reset_password as string}
                  onNavigate={() => onNavigate('reset_password')}
                  className={`text-sm font-bold text-forest-700 underline ${focusButtonClass}`}
                >
                  Forgot your password?
                </AppLink>
              )}
              {mode === 'sign_up' && (
                <label className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-4 text-sm leading-6">
                  <input
                    type="checkbox"
                    checked={consented}
                    onChange={(event) => setConsented(event.target.checked)}
                    className="mt-0.5 size-6 shrink-0 accent-forest-700 focus-visible:ring-2 focus-visible:ring-forest-400"
                  />
                  <span>I consent to 4Prep storing my grades, budget, language score, preferences, and saved plans to provide my pathway. I have read the <AppLink href={viewPaths.privacy as string} onNavigate={() => onNavigate('privacy')} className={`font-bold text-forest-700 underline ${focusButtonClass}`}>Privacy Policy</AppLink>.</span>
                </label>
              )}
              <ErrorNotice problem={problem} onResend={() => void resend()} />
              {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">{notice}</p>}
              <button
                disabled={status !== 'ready' || (mode === 'sign_up' && !consented)}
                aria-busy={status === 'loading'}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-800 py-3.5 font-bold text-white disabled:opacity-50 ${focusButtonClass}`}
              >
                {status === 'loading' ? 'Please wait…' : mode === 'sign_in' ? 'Sign in' : 'Create account'} <ArrowRight size={17} />
              </button>
              <p aria-live="polite" className="sr-only">{status === 'loading' ? 'Authentication is in progress.' : ''}</p>
            </form>
          </>
        )}

        {status !== 'confirmation' && (
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'sign_in' ? 'sign_up' : 'sign_in')
              setStatus('ready')
              setProblem(null)
              setNotice('')
            }}
            className={`mt-5 w-full text-sm font-bold text-forest-700 ${focusButtonClass}`}
          >
            {mode === 'sign_in' ? 'New to 4Prep? Create an account' : 'Already have an account? Sign in'}
          </button>
        )}
      </section>
    </div>
  )
}

export function ResetPasswordScreen({ onNavigate }: { onNavigate: (view: View) => void }) {
  const { user, isPasswordRecovery, resetPassword, updatePassword, signOut } = useAuth()
  const emailId = useId()
  const passwordId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'ready' | 'loading' | 'requested' | 'updated'>('ready')
  const [problem, setProblem] = useState<AuthProblem | null>(() => {
    if (typeof window === 'undefined') return null
    const query = new URLSearchParams(window.location.search)
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const code = query.get('error_code') ?? fragment.get('error_code')
    return code ? mapAuthError({ code }) : null
  })
  const canUpdate = Boolean(user && isPasswordRecovery)

  const handleProblem = (reason: unknown) => {
    const nextProblem = mapAuthError(reason)
    logUnmappedAuthError(reason, nextProblem)
    setProblem(nextProblem)
  }

  const requestReset = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('loading')
    setProblem(null)
    try {
      await resetPassword(email)
      setStatus('requested')
    } catch (reason) {
      handleProblem(reason)
      setStatus('ready')
    }
  }

  const finishReset = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('loading')
    setProblem(null)
    try {
      await updatePassword(password)
      await signOut()
      setStatus('updated')
    } catch (reason) {
      handleProblem(reason)
      setStatus('ready')
    }
  }

  return (
    <div className="soft-grid py-8 sm:py-16">
      <section className="card mx-auto w-[min(520px,calc(100%-32px))] p-6 sm:p-9">
        <div className="grid size-13 place-items-center rounded-xl bg-forest-50 text-forest-700"><KeyRound /></div>
        {status === 'updated' ? (
          <>
            <CheckCircle2 size={38} className="mt-6 text-forest-600" />
            <h1 className="display mt-4 text-3xl font-extrabold">Password updated</h1>
            <p className="mt-3 leading-6 text-muted">Your new password is ready. Sign in again to continue.</p>
            <AppLink href={viewPaths.auth as string} onNavigate={() => onNavigate('auth')} className={`mt-7 flex w-full items-center justify-center rounded-xl bg-forest-800 px-4 py-3.5 font-bold text-white ${focusButtonClass}`}>Go to sign in</AppLink>
          </>
        ) : status === 'requested' ? (
          <>
            <Mail size={34} className="mt-6 text-forest-700" />
            <h1 className="display mt-4 text-3xl font-extrabold">Check your email</h1>
            <p className="mt-3 leading-6 text-muted">If an account uses this email, a reset link will arrive shortly. Check your spam folder too.</p>
            <AppLink href={viewPaths.auth as string} onNavigate={() => onNavigate('auth')} className={`mt-7 inline-flex items-center gap-2 font-bold text-forest-700 ${focusButtonClass}`}><ArrowLeft size={17} /> Back to sign in</AppLink>
          </>
        ) : canUpdate ? (
          <>
            <h1 className="display mt-5 text-3xl font-extrabold">Set a new password</h1>
            <p className="mt-2 leading-6 text-muted">Choose a password you have not used before.</p>
            <form onSubmit={(event) => void finishReset(event)} className="mt-7 space-y-5">
              <PasswordField id={passwordId} label="New password" value={password} onChange={setPassword} autoComplete="new-password" showRequirement />
              <ErrorNotice problem={problem} />
              <button
                disabled={status === 'loading'}
                aria-busy={status === 'loading'}
                className={`w-full rounded-xl bg-forest-800 px-4 py-3.5 font-bold text-white disabled:opacity-50 ${focusButtonClass}`}
              >
                {status === 'loading' ? 'Updating…' : 'Update password'}
              </button>
              <p aria-live="polite" className="sr-only">{status === 'loading' ? 'Password update is in progress.' : ''}</p>
            </form>
          </>
        ) : (
          <>
            <h1 className="display mt-5 text-3xl font-extrabold">Reset your password</h1>
            <p className="mt-2 leading-6 text-muted">Enter your email. We will send a secure reset link.</p>
            <form onSubmit={(event) => void requestReset(event)} className="mt-7 space-y-5">
              <div>
                <label htmlFor={emailId} className="block text-sm font-bold">Email</label>
                <input required id={emailId} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
              </div>
              <ErrorNotice problem={problem} />
              <button
                disabled={status === 'loading'}
                aria-busy={status === 'loading'}
                className={`w-full rounded-xl bg-forest-800 px-4 py-3.5 font-bold text-white disabled:opacity-50 ${focusButtonClass}`}
              >
                {status === 'loading' ? 'Sending…' : 'Send reset link'}
              </button>
              <p aria-live="polite" className="sr-only">{status === 'loading' ? 'Reset request is in progress.' : ''}</p>
            </form>
            <AppLink href={viewPaths.auth as string} onNavigate={() => onNavigate('auth')} className={`mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest-700 ${focusButtonClass}`}><ArrowLeft size={16} /> Back to sign in</AppLink>
          </>
        )}
      </section>
    </div>
  )
}

export function AuthCallbackScreen({
  kind,
  onNavigate,
  onContinue,
}: {
  kind: 'confirmation' | 'google' | 'unknown'
  onNavigate: (view: View) => void
  onContinue: () => void
}) {
  const { user, loading } = useAuth()
  const hasCallbackError = typeof window !== 'undefined' && (
    window.location.search.includes('error=')
    || window.location.hash.includes('error=')
  )

  if (loading || (kind === 'google' && user && !hasCallbackError)) {
    return (
      <div className="soft-grid py-16">
        <section className="card mx-auto w-[min(520px,calc(100%-32px))] p-8 text-center">
          <LoaderCircle size={38} className="mx-auto text-forest-700" />
          <h1 className="display mt-5 text-2xl font-extrabold">Finishing sign-in</h1>
          <p role="status" className="mt-2 text-muted">Please wait. Your work is being restored.</p>
        </section>
      </div>
    )
  }

  if (hasCallbackError || kind === 'unknown' || !user) {
    return (
      <div className="soft-grid py-16">
        <section className="card mx-auto w-[min(520px,calc(100%-32px))] p-8 text-center">
          <LockKeyhole size={38} className="mx-auto text-forest-700" />
          <h1 className="display mt-5 text-2xl font-extrabold">{kind === 'google' ? 'Google sign-in did not finish' : 'This confirmation did not finish'}</h1>
          <p role="alert" className="mt-3 leading-6 text-muted">{kind === 'google' ? 'The sign-in was cancelled or could not finish. Nothing was changed.' : 'The link may be invalid or expired. Request a new confirmation email, then try again.'}</p>
          <AppLink href={viewPaths.auth as string} onNavigate={() => onNavigate('auth')} className={`mt-7 flex w-full items-center justify-center rounded-xl bg-forest-800 px-4 py-3 font-bold text-white ${focusButtonClass}`}>Return to sign in</AppLink>
        </section>
      </div>
    )
  }

  return (
    <div className="soft-grid py-16">
      <section className="card mx-auto w-[min(520px,calc(100%-32px))] p-8 text-center">
        <CheckCircle2 size={46} className="mx-auto text-forest-600" />
        <h1 className="display mt-5 text-3xl font-extrabold">Your email is confirmed</h1>
        <p className="mt-3 leading-6 text-muted">You are signed in. Your saved work is ready.</p>
        <button onClick={onContinue} className={`mt-7 w-full rounded-xl bg-forest-800 px-4 py-3 font-bold text-white ${focusButtonClass}`}>
          Continue to 4Prep
        </button>
      </section>
    </div>
  )
}

export function PrivacyScreen() {
  return (
    <div className="page-container py-12 lg:py-16">
      <article className="card mx-auto max-w-3xl p-6 sm:p-10">
        <div className="flex items-center gap-3 text-forest-700"><ShieldCheck /><span className="text-sm font-bold uppercase tracking-[.14em]">Privacy</span></div>
        <h1 className="display mt-4 text-4xl font-extrabold">4Prep Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Effective 29 July 2026</p>
        <div className="mt-8 space-y-7 leading-7 text-muted">
          <section><h2 className="display text-xl font-extrabold text-ink">What we collect</h2><p className="mt-2">If you create an account, 4Prep stores your email, destination and study preferences, self-reported academic score, budget and currency, language score, intake preference, and saved university plans. Counselor messages are sent to our server-side counselor function to produce a response.</p></section>
          <section><h2 className="display text-xl font-extrabold text-ink">Why we use it</h2><p className="mt-2">We use this information only to authenticate you, calculate your deterministic fit score, restore your pathway and shortlist, and answer counselor questions. Fit is guidance, not an admission decision.</p></section>
          <section><h2 className="display text-xl font-extrabold text-ink">Service providers</h2><p className="mt-2">Supabase provides authentication and database hosting. Google provides optional sign-in. Perplexity processes counselor prompts; the function sends the message and relevant verified university records, not your stored student profile. Vercel is the planned web host.</p></section>
          <section><h2 className="display text-xl font-extrabold text-ink">Access and deletion</h2><p className="mt-2">Row-level security restricts profile and saved-plan records to the signed-in owner. To permanently delete your account, open Account, choose “Start account deletion,” type your email, and confirm. This deletes your authentication account, student profile, and saved plans.</p></section>
          <section><h2 className="display text-xl font-extrabold text-ink">Data accuracy</h2><p className="mt-2">University facts show their source and retrieval date. Missing information remains marked as unknown. Always confirm application details with the university.</p></section>
        </div>
      </article>
    </div>
  )
}
