export type AuthProblemKind =
  | 'credentials'
  | 'unconfirmed'
  | 'rate_limit'
  | 'network'
  | 'expired_link'
  | 'generic'

export type AuthProblem = {
  kind: AuthProblemKind
  message: string
}

type ErrorLike = {
  code?: unknown
  message?: unknown
  name?: unknown
  status?: unknown
}

function errorText(reason: unknown): string {
  if (!reason || typeof reason !== 'object') return ''
  const error = reason as ErrorLike
  return [error.code, error.message, error.name, error.status]
    .filter((value): value is string | number => typeof value === 'string' || typeof value === 'number')
    .join(' ')
    .toLowerCase()
}

export function mapAuthError(
  reason: unknown,
  online = typeof navigator === 'undefined' ? true : navigator.onLine,
): AuthProblem {
  const text = errorText(reason)

  if (
    !online
    || text.includes('failed to fetch')
    || text.includes('network')
    || text.includes('fetcherror')
    || text.includes('connection')
  ) {
    return {
      kind: 'network',
      message: 'The connection failed. Check your internet and try again. Nothing was lost.',
    }
  }

  if (
    text.includes('invalid_credentials')
    || text.includes('invalid login credentials')
    || text.includes('wrong password')
  ) {
    return {
      kind: 'credentials',
      message: 'Email or password is incorrect.',
    }
  }

  if (
    text.includes('email_not_confirmed')
    || text.includes('email not confirmed')
    || text.includes('email is not confirmed')
  ) {
    return {
      kind: 'unconfirmed',
      message: 'Please confirm your email before signing in.',
    }
  }

  if (
    text.includes('rate_limit')
    || text.includes('rate limit')
    || text.includes('too many requests')
    || text.includes('over_email_send_rate_limit')
    || text.includes('429')
  ) {
    return {
      kind: 'rate_limit',
      message: 'Too many attempts. Wait a short time, then try again.',
    }
  }

  if (
    text.includes('otp_expired')
    || text.includes('expired')
    || text.includes('invalid token')
    || text.includes('invalid otp')
  ) {
    return {
      kind: 'expired_link',
      message: 'This link is invalid or has expired. Request a new one.',
    }
  }

  return {
    kind: 'generic',
    message: 'Sorry, something went wrong. Please try again.',
  }
}

export function logUnmappedAuthError(reason: unknown, problem: AuthProblem): void {
  if (import.meta.env.DEV && problem.kind === 'generic') {
    console.error('Unmapped authentication error:', reason)
  }
}
