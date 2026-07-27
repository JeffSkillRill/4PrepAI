import type { AmountPeriod, DataPoint, DataPointMetadata, Program, Scholarship, Source, University, Verification } from '../types'
import { known, unknown } from '../types'

export type RawFact = {
  kind: string
  value: string | null
  numeric_value?: number | string | null
  currency?: string | null
  amount_period?: AmountPeriod | null
  source_id: string | null
  unknown_reason: string | null
  suggested_action: string | null
}

export type RawProgram = {
  id: string
  name: string
  degree: string
  field: string
  program_facts?: RawFact[] | null
}

export type RawRequirement = RawFact

export type RawScholarship = {
  id: string
  name: string
  amount_value: string | null
  amount_numeric?: number | string | null
  currency?: string | null
  amount_period?: AmountPeriod | null
  amount_source_id: string | null
  amount_unknown_reason: string | null
  amount_suggested_action: string | null
}

export type RawScholarshipLink = {
  scholarships: RawScholarship | RawScholarship[] | null
}

export type RawUniversity = {
  id: string
  name: string
  city: string
  country: string
  flag: string
  tagline: string
  description: string
  photo_seed: string
  highlights: string[]
  source_id: string
  university_facts?: RawFact[] | null
  programs?: RawProgram[] | null
  requirements?: RawRequirement[] | null
  university_scholarships?: RawScholarshipLink[] | null
}

export type RawSource = {
  id: string
  name: string
  url: string | null
  retrieved_at: string
  verification: Verification
}

const missingFact = (label: string): DataPoint<string> =>
  unknown(`${label} is not available in the data source.`, `Ask the university to confirm ${label.toLowerCase()}.`)

export function mapFact(fact: RawFact | undefined, label: string): DataPoint<string> {
  if (!fact) return missingFact(label)
  if (fact.value !== null && fact.source_id) {
    const numericValue = fact.numeric_value === null || fact.numeric_value === undefined
      ? undefined
      : Number(fact.numeric_value)
    const metadata: DataPointMetadata = {
      ...(Number.isFinite(numericValue) ? { numericValue } : {}),
      ...(fact.currency ? { currency: fact.currency } : {}),
      ...(fact.amount_period ? { period: fact.amount_period } : {}),
    }
    return known(fact.value, fact.source_id, metadata)
  }
  return unknown(
    fact.unknown_reason ?? `${label} is not published.`,
    fact.suggested_action ?? `Ask the university to confirm ${label.toLowerCase()}.`,
  )
}

export function mapSource(row: RawSource): Source {
  return {
    id: row.id,
    origin: row.name,
    ...(row.url ? { url: row.url } : {}),
    retrievedAt: row.retrieved_at,
    verification: row.verification,
  }
}

export function mapScholarship(row: RawScholarship): Scholarship {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount_value !== null && row.amount_source_id
      ? known(row.amount_value, row.amount_source_id, {
          ...(row.amount_numeric === null || row.amount_numeric === undefined
            ? {}
            : { numericValue: Number(row.amount_numeric) }),
          ...(row.currency ? { currency: row.currency } : {}),
          ...(row.amount_period ? { period: row.amount_period } : {}),
        })
      : unknown(
          row.amount_unknown_reason ?? 'The scholarship amount is not published.',
          row.amount_suggested_action ?? 'Ask the provider for the current award amount.',
        ),
  }
}

export function mapProgram(row: RawProgram): Program {
  const facts = new Map((row.program_facts ?? []).map((fact) => [fact.kind, fact]))
  return {
    id: row.id,
    name: row.name,
    degree: row.degree,
    field: row.field,
    duration: mapFact(facts.get('duration'), 'Program duration'),
    tuition: mapFact(facts.get('tuition'), 'Program tuition'),
  }
}

function unwrapScholarship(value: RawScholarship | RawScholarship[] | null): RawScholarship | undefined {
  if (Array.isArray(value)) return value[0]
  return value ?? undefined
}

export function mapUniversity(
  row: RawUniversity,
  verificationBySource: ReadonlyMap<string, Verification> = new Map(),
): University {
  const facts = new Map((row.university_facts ?? []).map((fact) => [fact.kind, fact]))
  const requirements = new Map((row.requirements ?? []).map((fact) => [fact.kind, fact]))
  const scholarships = (row.university_scholarships ?? [])
    .map((link) => unwrapScholarship(link.scholarships))
    .filter((item): item is RawScholarship => Boolean(item))
    .map(mapScholarship)

  return {
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
    flag: row.flag,
    tagline: row.tagline,
    description: row.description,
    photoSeed: row.photo_seed,
    highlights: row.highlights,
    verification: verificationBySource.get(row.source_id) ?? 'unverified_sample',
    tuition: mapFact(facts.get('tuition'), 'Tuition'),
    livingCost: mapFact(facts.get('living_cost'), 'Living cost'),
    applicationFee: mapFact(facts.get('application_fee'), 'Application fee'),
    deadline: mapFact(facts.get('deadline'), 'Application deadline'),
    scholarship: mapFact(facts.get('scholarship'), 'Scholarship'),
    language: mapFact(facts.get('language'), 'Teaching language'),
    intake: mapFact(facts.get('intake'), 'Next intake'),
    ielts: mapFact(requirements.get('ielts'), 'IELTS requirement'),
    programs: (row.programs ?? []).map(mapProgram),
    scholarships,
  }
}
