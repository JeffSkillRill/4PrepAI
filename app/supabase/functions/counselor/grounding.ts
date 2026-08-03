export type FactRow = {
  kind: string
  value: string | null
  source_id: string | null
  unknown_reason: string | null
  suggested_action: string | null
}

export type CatalogUniversity = {
  id: string
  name: string
  university_facts: FactRow[]
  requirements: FactRow[]
  university_scholarships: Array<{
    scholarships: {
      name: string
      amount_value: string | null
      amount_source_id: string | null
      amount_unknown_reason: string | null
      amount_suggested_action: string | null
    } | null
  }>
}

export type GroundingRecord = {
  university: string
  field: string
  status: 'known' | 'unknown'
  value: string | null
  citationId: string | null
  unknownReason: string | null
  suggestedAction: string | null
}

const sha256Hex = async (input: string) => {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export const normalizeQuestion = (question: string) =>
  question.toLowerCase().replace(/\s+/g, ' ').trim()

export async function hashCallerIp(ip: string, salt: string) {
  return sha256Hex(`${salt}\u0000${ip}`)
}

export async function buildCounselorCacheKey(
  question: string,
  universityIds: string[],
  records: GroundingRecord[],
  versions: { cache: string; phi: string; prompt: string },
) {
  const recordSnapshot = records
    .map((record) => ({
      citationId: record.citationId,
      field: record.field,
      status: record.status,
      suggestedAction: record.suggestedAction,
      university: record.university,
      unknownReason: record.unknownReason,
      value: record.value,
    }))
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
  const keyMaterial = JSON.stringify({
    cacheVersion: versions.cache,
    phiVersion: versions.phi,
    promptVersion: versions.prompt,
    question: normalizeQuestion(question),
    records: recordSnapshot,
    universityIds: [...new Set(universityIds)].sort(),
  })
  return sha256Hex(keyMaterial)
}

export function knownContext(rows: CatalogUniversity[]): GroundingRecord[] {
  return rows.flatMap((university) => {
    const facts = [...(university.university_facts ?? []), ...(university.requirements ?? [])]
    const factRecords: GroundingRecord[] = facts.map((fact) => ({
      university: university.name,
      field: fact.kind,
      status: fact.value && fact.source_id ? 'known' : 'unknown',
      value: fact.value,
      citationId: fact.source_id,
      unknownReason: fact.unknown_reason,
      suggestedAction: fact.suggested_action,
    }))
    const scholarships: GroundingRecord[] = (university.university_scholarships ?? []).flatMap((link) => {
      const item = link.scholarships
      if (!item) return []
      return [{
        university: university.name,
        field: 'scholarship_amount',
        status: item.amount_value && item.amount_source_id ? 'known' : 'unknown',
        value: item.amount_value,
        citationId: item.amount_source_id,
        unknownReason: item.amount_unknown_reason,
        suggestedAction: item.amount_suggested_action,
      }]
    })
    return [...factRecords, ...scholarships]
  })
}

/** Strip formatting so "$11,700" and "11 700 USD" compare equal. */
const normalizeText = (input: string) => input.toLowerCase().replace(/[^a-z0-9]/g, '')
const normalizeNumber = (input: string) => input.replace(/[,\s]/g, '').replace(/\.0+$/, '')

export type FigureAnswerType = 'verified_fact' | 'general_guidance' | 'refusal'

type FigureType =
  | 'currency:USD'
  | 'currency:EUR'
  | 'currency:GBP'
  | 'currency:UZS'
  | 'currency:KZT'
  | 'currency:TRY'
  | 'percentage'
  | 'date'
  | 'test:ielts'
  | 'test:toefl'
  | 'test:duolingo'
  | 'test:sat'
  | 'test:act'
  | 'gpa'

type FigureMatch = {
  raw: string
  start: number
  end: number
  type: FigureType
  key: string
}

const numberParts = (input: string) =>
  (input.match(/\d[\d,. ]*\d|\d/g) ?? []).map(normalizeNumber)

const currencyType = (input: string): FigureType => {
  if (/€|\bEUR\b/i.test(input)) return 'currency:EUR'
  if (/£|\bGBP\b/i.test(input)) return 'currency:GBP'
  if (/\bUZS\b/i.test(input)) return 'currency:UZS'
  if (/\bKZT\b/i.test(input)) return 'currency:KZT'
  if (/\bTRY\b/i.test(input)) return 'currency:TRY'
  return 'currency:USD'
}

const figureKey = (type: FigureType, raw: string) => {
  if (type === 'date') return `${type}:${normalizeText(raw)}`
  return `${type}:${numberParts(raw).join(':')}`
}

const figurePatterns: Array<{
  pattern: RegExp
  type: (raw: string) => FigureType
}> = [
  {
    pattern: /(?:US)?[$€£]\s?\d(?:[\d,.]*\d)?(?:\s*[-–—]\s*(?:(?:US)?[$€£]\s?)?\d(?:[\d,.]*\d)?)?(?:\s?(?:k|million|billion))?/gi,
    type: currencyType,
  },
  {
    pattern: /\b(?:USD|EUR|GBP|UZS|KZT|TRY)\s?\d(?:[\d,.]*\d)?(?:\s*[-–—]\s*(?:(?:USD|EUR|GBP|UZS|KZT|TRY)\s?)?\d(?:[\d,.]*\d)?)?/gi,
    type: currencyType,
  },
  {
    pattern: /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:,?\s+\d{4})?/gi,
    type: () => 'date',
  },
  {
    pattern: /\b\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{4})?/gi,
    type: () => 'date',
  },
  { pattern: /\b\d{4}-\d{2}-\d{2}\b/g, type: () => 'date' },
  {
    pattern: /\bIELTS\s*(?:overall\s*)?\d(?:\.\d)?(?:\s*[-–—]\s*\d(?:\.\d)?)?\b/gi,
    type: () => 'test:ielts',
  },
  {
    pattern: /\b\d(?:\.\d)?(?:\s*[-–—]\s*\d(?:\.\d)?)?\s*(?:overall\s*)?IELTS\b/gi,
    type: () => 'test:ielts',
  },
  {
    pattern: /\b(?:TOEFL|Duolingo|SAT|ACT)\s*(?:iBT\s*)?\d{1,4}(?:\s*[-–—]\s*\d{1,4})?\b/gi,
    type: (raw) => `test:${raw.match(/TOEFL|Duolingo|SAT|ACT/i)?.[0].toLowerCase() ?? 'toefl'}` as FigureType,
  },
  {
    pattern: /\b\d{1,4}(?:\s*[-–—]\s*\d{1,4})?\s*(?:iBT\s*)?(?:TOEFL|Duolingo|SAT|ACT)\b/gi,
    type: (raw) => `test:${raw.match(/TOEFL|Duolingo|SAT|ACT/i)?.[0].toLowerCase() ?? 'toefl'}` as FigureType,
  },
  {
    pattern: /\bGPA\s*\d(?:\.\d{1,2})?(?:\s*[-–—]\s*\d(?:\.\d{1,2})?)?\b/gi,
    type: () => 'gpa',
  },
  {
    pattern: /\b\d(?:\.\d{1,2})?(?:\s*[-–—]\s*\d(?:\.\d{1,2})?)?\s*GPA\b/gi,
    type: () => 'gpa',
  },
  { pattern: /\b\d{1,3}%/g, type: () => 'percentage' },
]

function extractFigures(input: string): FigureMatch[] {
  const matches = figurePatterns.flatMap(({ pattern, type }) =>
    [...input.matchAll(pattern)].map((match) => {
      const raw = match[0]
      const figureType = type(raw)
      const start = match.index ?? 0
      return { raw, start, end: start + raw.length, type: figureType, key: figureKey(figureType, raw) }
    }))
  return matches.sort((left, right) => left.start - right.start)
}

const unsupportedField = '__unsupported__'

function semanticFields(context: string): Set<string> {
  const fields = new Set<string>()
  if (/\bacceptance rate\b|\badmit rate\b/i.test(context)) fields.add(unsupportedField)
  if (/\btotal cost\b|\bcost of attendance\b|\bcoa\b/i.test(context)) fields.add('total_cost_of_attendance')
  if (/\broom\b.*\bboard\b|\bhousing\b|\bmeal(?:s| plan)?\b|\bfood\b|\bliving expenses?\b/i.test(context)) {
    fields.add('room_board')
    fields.add('living_cost')
  }
  if (/\bapplication fee\b|\bapply fee\b/i.test(context)) fields.add('application_fee')
  if (/\bmandatory fees?\b|\bstudent fees?\b/i.test(context)) fields.add('fees')
  if (/\btuition\b|\bstudy fee\b/i.test(context)) fields.add('tuition')
  if (/\bfinancial certification\b|\bproof of funds\b|\bi-20\b/i.test(context)) fields.add('financial_certification')
  if (/\bdeadline\b|\bapply by\b|\bearly action\b|\bregular decision\b/i.test(context)) fields.add('deadline')
  if (/\bscholarship\b|\bfinancial aid\b|\bdemonstrated need\b|\bfunding\b/i.test(context)) {
    fields.add('aid_international')
    fields.add('scholarship_amount')
  }
  if (/\bTOEFL\b/i.test(context)) fields.add('toefl')
  if (/\bIELTS\b/i.test(context)) fields.add('ielts')
  if (/\bDuolingo\b|\bDET\b/i.test(context)) fields.add('duolingo')
  if (/\bSAT\b/i.test(context)) fields.add('sat')
  if (/\bACT\b/i.test(context)) fields.add('act')
  if (/\bGPA\b/i.test(context)) fields.add('gpa')
  return fields
}

function sentenceAround(input: string, figure: FigureMatch) {
  const start = Math.max(
    input.lastIndexOf('.', figure.start - 1),
    input.lastIndexOf('?', figure.start - 1),
    input.lastIndexOf('!', figure.start - 1),
    input.lastIndexOf('\n', figure.start - 1),
  ) + 1
  const endings = ['.', '?', '!', '\n']
    .map((separator) => input.indexOf(separator, figure.end))
    .filter((index) => index >= 0)
  const end = endings.length > 0 ? Math.min(...endings) : input.length
  return input.slice(start, end)
}

function recordFieldMatches(record: GroundingRecord, fields: Set<string>) {
  if (fields.has(unsupportedField)) return false
  if (fields.size === 0) return true
  if (fields.has(record.field)) return true
  return record.field === 'scholarship_amount' && fields.has('aid_international')
}

export function validateFigures(
  answer: string,
  records: GroundingRecord[],
  citations: string[],
  answerType: FigureAnswerType = 'verified_fact',
) {
  const figures = extractFigures(answer)

  // With no matched university, a scope-approved general answer is explicitly
  // labelled as unverified guidance. Its dates, counts, and ranges are advice,
  // not claims about a 4Prep record, so provenance validation does not apply.
  if (answerType === 'general_guidance' && records.length === 0) {
    return {
      ok: true,
      figures: figures.map((figure) => figure.raw),
      untraceable: [] as string[],
      shouldLogStrike: false,
    }
  }

  const citationIds = new Set(citations)
  const citedRecords = records.filter((record) =>
    record.status === 'known'
    && typeof record.value === 'string'
    && typeof record.citationId === 'string'
    && citationIds.has(record.citationId))
  const recordFigures = citedRecords.map((record) => ({
    record,
    figures: extractFigures(record.value as string),
  }))
  const untraceable = figures
    .filter((figure) => {
      const fields = semanticFields(sentenceAround(answer, figure))
      return !recordFigures.some(({ record, figures: candidates }) =>
        recordFieldMatches(record, fields)
        && candidates.some((candidate) => candidate.type === figure.type && candidate.key === figure.key))
    })
    .map((figure) => figure.raw)
  const verifiedContextValid = answerType !== 'verified_fact'
    || (records.length > 0 && citations.length > 0)
  const ok = untraceable.length === 0
    && (figures.length === 0 || citations.length > 0)
    && verifiedContextValid

  return {
    ok,
    figures: figures.map((figure) => figure.raw),
    untraceable,
    // Strikes measure false claims presented as verified 4Prep facts. A
    // banner-labelled general answer may be refused, but it must not corrupt
    // that audit signal.
    shouldLogStrike: answerType === 'verified_fact' && figures.length > 0 && !ok,
  }
}

export function buildVerifiedFactAnswer(kind: string, records: GroundingRecord[]) {
  const matching = records.filter((record) =>
    record.field === kind || (kind === 'aid_international' && record.field === 'scholarship_amount'))
  const known = matching.filter((record) =>
    record.status === 'known' && typeof record.value === 'string' && typeof record.citationId === 'string')
  if (known.length === 0) return null

  const label = kind.replaceAll('_', ' ')
  return {
    answer: known.map((record) => `Verified 4Prep ${label} for ${record.university}: ${record.value}.`).join(' '),
    citations: [...new Set(known.map((record) => record.citationId as string))],
  }
}
