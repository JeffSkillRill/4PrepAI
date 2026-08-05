import { useState, type FormEvent } from 'react'

export function AccessLoading() {
  return (
    <main className="center-screen" aria-live="polite" aria-label="Checking access">
      <span className="spinner" aria-hidden="true" />
      <p>Checking access…</p>
    </main>
  )
}

export function SignInScreen({
  onSignIn,
}: {
  onSignIn: (email: string, password: string) => Promise<void>
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('submitting')
    try {
      await onSignIn(email.trim(), password)
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="sign-in-shell">
      <section className="sign-in-card" aria-labelledby="sign-in-title">
        <div className="brand-mark" aria-hidden="true">4</div>
        <p className="eyebrow">4Prep operations</p>
        <h1 id="sign-in-title">Admin sign in</h1>
        <p className="muted">Use the account issued to you. There is no admin signup.</p>
        <form className="form-stack" onSubmit={submit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {status === 'error' ? <p className="form-error" role="alert">Sign-in failed.</p> : null}
          <button className="primary-button" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

export function NotAvailableScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <main className="center-screen">
      <h1>Not available</h1>
      <button className="quiet-button" type="button" onClick={onSignOut}>Sign out</button>
    </main>
  )
}

export function GenericErrorScreen({
  onRetry,
  onSignOut,
}: {
  onRetry?: () => void
  onSignOut?: () => void
}) {
  return (
    <main className="center-screen" role="alert">
      <h1>Could not load this page</h1>
      <p>Please retry. No records were changed.</p>
      <div className="button-row">
        {onRetry ? <button className="primary-button" type="button" onClick={onRetry}>Retry</button> : null}
        {onSignOut ? <button className="quiet-button" type="button" onClick={onSignOut}>Sign out</button> : null}
      </div>
    </main>
  )
}
