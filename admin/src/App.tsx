import { useCallback, useEffect, useState } from 'react'
import { useAdminAuth } from './auth'
import { AdminConsole } from './components/AdminConsole'
import {
  AccessLoading,
  GenericErrorScreen,
  NotAvailableScreen,
  SignInScreen,
} from './components/AccessScreens'
import { adminApi, NotAvailableError } from './data/adminApi'
import type { AdminSessionResponse } from './types'

type AccessState =
  | { status: 'checking'; data: null }
  | { status: 'ready'; data: AdminSessionResponse }
  | { status: 'not_available'; data: null }
  | { status: 'error'; data: null }

export default function App() {
  const auth = useAdminAuth()

  if (auth.loading) return <AccessLoading />
  if (auth.error) return <GenericErrorScreen />
  if (!auth.session) return <SignInScreen onSignIn={auth.signIn} />

  const signOut = () => {
    void auth.signOut().catch(() => window.location.reload())
  }

  return (
    <AuthorizedApplication
      key={auth.session.access_token}
      accessToken={auth.session.access_token}
      onSignOut={signOut}
    />
  )
}

function AuthorizedApplication({
  accessToken,
  onSignOut,
}: {
  accessToken: string
  onSignOut: () => void
}) {
  const [access, setAccess] = useState<AccessState>({ status: 'checking', data: null })

  const checkAccess = useCallback(async () => {
    setAccess({ status: 'checking', data: null })
    try {
      setAccess({ status: 'ready', data: await adminApi.session() })
    } catch (reason) {
      setAccess(reason instanceof NotAvailableError
        ? { status: 'not_available', data: null }
        : { status: 'error', data: null })
    }
  }, [])

  useEffect(() => {
    let active = true
    void adminApi.session()
      .then((data) => {
        if (active) setAccess({ status: 'ready', data })
      })
      .catch((reason: unknown) => {
        if (!active) return
        setAccess(reason instanceof NotAvailableError
          ? { status: 'not_available', data: null }
          : { status: 'error', data: null })
      })
    return () => {
      active = false
    }
  }, [accessToken])

  const makeUnavailable = useCallback(() => {
    setAccess({ status: 'not_available', data: null })
  }, [])

  if (access.status === 'checking') return <AccessLoading />
  if (access.status === 'not_available') return <NotAvailableScreen onSignOut={onSignOut} />
  if (access.status === 'error') {
    return <GenericErrorScreen onRetry={checkAccess} onSignOut={onSignOut} />
  }

  return (
    <AdminConsole
      session={access.data}
      onNotAvailable={makeUnavailable}
      onSignOut={onSignOut}
    />
  )
}
