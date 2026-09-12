export type AdminGoal = {
  destination: string | null
  field: string | null
  budget: string | null
  intakeTerm: string | null
}

export const ADMIN_FILE_URL_TTL_SECONDS = 60
export const SUPPORT_MESSAGE_MAX_LENGTH = 2000
export const QS_INGEST_MAX_BYTES = 200_000
export const QS_INGEST_MAX_ITEMS = 250

export const PROGRAM_DEGREE_LEVELS = ['bachelor', 'master', 'mba', 'phd'] as const
export const PROGRAM_SUBJECT_AREAS = [
  'Arts and Humanities',
  'Business and Management',
  'Engineering and Technology',
  'Life Sciences and Medicine',
  'Natural Sciences',
  'Social Sciences and Management',
] as const

export type QsProgramme = {
  name: string
  degree: string
  degreeLevel: typeof PROGRAM_DEGREE_LEVELS[number]
  subjectArea: typeof PROGRAM_SUBJECT_AREAS[number]
  duration?: string
  tuition?: string
}

export type QsIngestPayload = {
  universityId: string
  source: { url: string }
  internationalStudentPct?: string
  facultyCount?: string
  employabilityRate?: string
  employabilitySummary?: string
  costOfLiving?: Partial<Record<'accommodation' | 'food' | 'transport' | 'utilities', string>>
  rankings?: Array<{ label: string; rankDisplay: string; year?: number }>
  campuses?: Array<{ name: string; city: string; country: string }>
  programmes?: QsProgramme[]
}

function validText(value: unknown, maximum = 1000): value is string {
  return typeof value === 'string'
    && value.trim().length > 0
    && value.length <= maximum
    && !Array.from(value).some((character) => {
      const code = character.charCodeAt(0)
      return code <= 31 || code === 127
    })
}

function validUrl(value: unknown): value is string {
  if (!validText(value, 2048)) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'www.topuniversities.com'
  } catch {
    return false
  }
}

/** Strictly validates the reviewed extension payload; unsupported values never default. */
export function parseQsIngestPayload(value: unknown): QsIngestPayload | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const input = value as Record<string, unknown>
  if (!validText(input.universityId, 160) || !input.source || typeof input.source !== 'object') return null
  const source = input.source as Record<string, unknown>
  if (!validUrl(source.url)) return null
  const textFields = ['internationalStudentPct', 'facultyCount', 'employabilityRate', 'employabilitySummary'] as const
  const output: QsIngestPayload = { universityId: input.universityId.trim(), source: { url: source.url } }
  for (const field of textFields) {
    if (input[field] !== undefined) {
      if (!validText(input[field])) return null
      output[field] = input[field].trim()
    }
  }
  if (input.costOfLiving !== undefined) {
    if (!input.costOfLiving || typeof input.costOfLiving !== 'object' || Array.isArray(input.costOfLiving)) return null
    const costs: QsIngestPayload['costOfLiving'] = {}
    for (const key of ['accommodation', 'food', 'transport', 'utilities'] as const) {
      const field = (input.costOfLiving as Record<string, unknown>)[key]
      if (field !== undefined) {
        if (!validText(field)) return null
        costs[key] = field.trim()
      }
    }
    output.costOfLiving = costs
  }
  const arrays: Array<keyof Pick<QsIngestPayload, 'rankings' | 'campuses' | 'programmes'>> = ['rankings', 'campuses', 'programmes']
  for (const key of arrays) {
    const rows = input[key]
    if (rows === undefined) continue
    if (!Array.isArray(rows) || rows.length > QS_INGEST_MAX_ITEMS) return null
    if (key === 'rankings') {
      if (!rows.every((row) => {
        if (!row || typeof row !== 'object') return false
        const ranking = row as Record<string, unknown>
        const year = ranking.year
        return validText(ranking.label) && validText(ranking.rankDisplay)
          && (year === undefined || (typeof year === 'number' && Number.isInteger(year) && year >= 1900 && year <= 2200))
      })) return null
      output.rankings = rows.map((row) => ({ label: (row as Record<string, unknown>).label as string, rankDisplay: (row as Record<string, unknown>).rankDisplay as string, ...((row as Record<string, unknown>).year === undefined ? {} : { year: (row as Record<string, unknown>).year as number }) }))
    } else if (key === 'campuses') {
      if (!rows.every((row) => row && typeof row === 'object' && validText((row as Record<string, unknown>).name) && validText((row as Record<string, unknown>).city) && validText((row as Record<string, unknown>).country))) return null
      output.campuses = rows.map((row) => ({ name: (row as Record<string, unknown>).name as string, city: (row as Record<string, unknown>).city as string, country: (row as Record<string, unknown>).country as string }))
    } else {
      if (!rows.every((row) => {
        if (!row || typeof row !== 'object') return false
        const programme = row as Record<string, unknown>
        return validText(programme.name) && validText(programme.degree) && typeof programme.degreeLevel === 'string' && (PROGRAM_DEGREE_LEVELS as readonly string[]).includes(programme.degreeLevel) && typeof programme.subjectArea === 'string' && (PROGRAM_SUBJECT_AREAS as readonly string[]).includes(programme.subjectArea) && (programme.duration === undefined || validText(programme.duration)) && (programme.tuition === undefined || validText(programme.tuition))
      })) return null
      output.programmes = rows.map((row) => row as QsProgramme)
    }
  }
  return output
}

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

export function cleanSupportMessage(value: unknown): string | null {
  if (typeof value !== 'string' || value.includes('\0')) return null
  const body = value.trim()
  return body.length > 0 && body.length <= SUPPORT_MESSAGE_MAX_LENGTH ? body : null
}

export function supportThreadIsWaiting(lastSenderRole: string | null): boolean {
  return lastSenderRole === 'student'
}

export function supportMessagePreview(body: string, maxLength = 120): string {
  const flattened = body.replace(/\s+/g, ' ').trim()
  if (flattened.length <= maxLength) return flattened
  return `${flattened.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`
}
