export type AdminGoal = {
  destination: string | null
  field: string | null
  budget: string | null
  intakeTerm: string | null
}

export const ADMIN_FILE_URL_TTL_SECONDS = 60

export type ProfileGoalRow = {
  country: string | null
  field: string | null
  budget_max: number | null
  budget_currency: string | null
  intake: string | null
}

export type SubmissionActivityRow = {
  status: string
  submitted_at: string | null
  feedback_ref: string | null
}

function cleanText(value: string | null): string | null {
  const cleaned = value?.trim() ?? ''
  return cleaned || null
}

export function formatAdminGoal(profile: ProfileGoalRow | null): AdminGoal | null {
  if (!profile) return null
  const amount = profile.budget_max
  const currency = cleanText(profile.budget_currency)?.toUpperCase() ?? null
  let budget: string | null = null
  if (amount !== null && Number.isFinite(amount) && currency && /^[A-Z]{3}$/.test(currency)) {
    try {
      budget = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(amount)
    } catch {
      budget = `${currency} ${amount.toLocaleString('en-US')}`
    }
  }

  return {
    destination: cleanText(profile.country),
    field: cleanText(profile.field),
    budget,
    intakeTerm: cleanText(profile.intake),
  }
}

export function latestRecordedAt(values: Array<string | null | undefined>): string | null {
  let latest: { value: string; timestamp: number } | null = null
  for (const value of values) {
    if (!value) continue
    const timestamp = Date.parse(value)
    if (!Number.isFinite(timestamp)) continue
    if (!latest || timestamp > latest.timestamp) latest = { value, timestamp }
  }
  return latest?.value ?? null
}

export function happenedWithinDays(value: string | null, days: number, now: Date): boolean {
  if (!value || days <= 0) return false
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return false
  const windowStart = now.getTime() - days * 24 * 60 * 60 * 1000
  return timestamp >= windowStart && timestamp <= now.getTime()
}

export function homeworkIsWaiting(submission: SubmissionActivityRow): boolean {
  const hasFeedback = Boolean(submission.feedback_ref?.trim())
  return Boolean(
    submission.submitted_at
    && !hasFeedback
    && (submission.status === 'pending' || submission.status === 'submitted'),
  )
}

function isControlCharacter(value: string): boolean {
  const code = value.charCodeAt(0)
  return code <= 31 || code === 127
}

export function submissionStoragePathBelongsToUser(
  storagePath: string,
  userId: string,
): boolean {
  if (
    !storagePath
    || storagePath.length > 1024
    || storagePath.includes('\\')
    || storagePath.includes('%')
    || storagePath.includes('?')
    || storagePath.includes('#')
    || Array.from(storagePath).some(isControlCharacter)
  ) {
    return false
  }
  const segments = storagePath.split('/')
  return segments.length >= 3
    && segments[0] === userId
    && segments.every((segment) => segment !== '' && segment !== '.' && segment !== '..')
}

export function safeDownloadFilename(filename: string): string {
  const cleaned = Array.from(filename, (character) => (
    isControlCharacter(character)
      || character === '"'
      || character === '\\'
      || character === '/'
      ? '_'
      : character
  )).join('')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 180)
  return cleaned && /[\p{L}\p{N}]/u.test(cleaned) ? cleaned : 'homework-file'
}
