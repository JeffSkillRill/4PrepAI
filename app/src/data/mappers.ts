import type {
  AmountPeriod,
  AwardCondition,
  DataPoint,
  DataPointMetadata,
  LearningAssignment,
  LearningLesson,
  LearningModule,
  LearningSubmission,
  LearningSubmissionFile,
  LearningTrack,
  Program,
  Campus,
  Ranking,
  RequirementBenchmark,
  Scholarship,
  Source,
  University,
  Verification,
} from '../types'
import { known, unknown } from '../types'

export type RawFact = {
  kind: string
  value: string | null
  numeric_value?: number | string | null
  currency?: string | null
  amount_period?: AmountPeriod | null
  /** Only present on requirement rows; see RequirementBenchmark. */
  benchmark?: RequirementBenchmark | null
  source_id: string | null
  unknown_reason: string | null
  suggested_action: string | null
}

export type RawProgram = {
  id: string
  name: string
  degree: string
  field: string
  degree_level: Program['degreeLevel']
  subject_area: Program['subjectArea']
  program_facts?: RawFact[] | null
}

export type RawRanking = {
  id: number | string
  label: string
  rank_display: string
  year: number | string | null
  source_id: string
}

export type RawCampus = {
  id: number | string
  name: string
  city: string
  country: string
  source_id: string
}

export type RawRequirement = RawFact

export type RawAwardCondition = {
  kind: AwardCondition['kind']
  minimum: number | string
  published_text: string
  source_id: string
}

export type RawScholarship = {
  id: string
  name: string
  award_conditions?: RawAwardCondition[] | null
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
  state: string | null
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
  rankings?: RawRanking[] | null
  campuses?: RawCampus[] | null
}

export type RawSource = {
  id: string
  name: string
  url: string | null
  retrieved_at: string
  verification: Verification
}

export type RawLearningLesson = {
  id: string
  module_id: string
  slug: string
  title: string
  sort_order: number | string
  duration_minutes: number | string | null
  body: string | null
  status: 'draft' | 'published'
  transcript: string | null
  media_url: string | null
  audio_url: string | null
}

export type RawLearningAssignment = {
  id: string
  module_id: string
  slug: string
  title: string
  brief: string
  submission_type: 'structured' | 'checklist' | 'artifact'
  template_ref: string
  rubric: Record<string, unknown> | null
}

export type RawLearningModule = {
  id: string
  track_id: string
  module_number: number | string
  slug: string
  title: string
  summary: string
  sort_order: number | string
  learning_lessons?: RawLearningLesson[] | null
  learning_assignments?: RawLearningAssignment | RawLearningAssignment[] | null
}

export type RawLearningTrack = {
  id: string
  slug: string
  title: string
  description: string
  sort_order: number | string
  learning_modules?: RawLearningModule[] | null
}

export type RawLearningSubmissionFile = {
  id: string
  submission_id: string
  storage_path: string
  original_filename: string
  mime_type: string
  byte_size: number | string
  created_at: string
}

export type RawLearningSubmission = {
  id: string
  assignment_id: string
  user_id: string
  status: 'pending' | 'submitted' | 'reviewed'
  submitted_at: string | null
  feedback_ref: string | null
  learning_submission_files?: RawLearningSubmissionFile[] | null
}

const missingFact = (label: string): DataPoint<string> =>
  unknown(`${label} is not available in the data source.`, `Ask the university to confirm ${label.toLowerCase()}.`)

const USPS_STATE_NAMES: Readonly<Record<string, string>> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
}

function mappedState(code: string | null): { state: string | null; stateName: string | null } {
  const normalized = code?.trim().toUpperCase() ?? null
  if (!normalized || !USPS_STATE_NAMES[normalized]) return { state: null, stateName: null }
  return { state: normalized, stateName: USPS_STATE_NAMES[normalized] }
}

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
      // Absent on non-requirement facts, and deliberately omitted rather than
      // defaulted: a missing classification must never read as a cutoff.
      ...(fact.benchmark ? { benchmark: fact.benchmark } : {}),
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
    // An award with no rows here publishes no criteria. The empty array is the
    // honest answer, and downstream code must treat it as "cannot be assessed"
    // rather than "no barriers".
    conditions: (row.award_conditions ?? []).map((condition) => ({
      kind: condition.kind,
      minimum: Number(condition.minimum),
      publishedText: condition.published_text,
      sourceId: condition.source_id,
    })),
  }
}

export function mapProgram(row: RawProgram): Program {
  const facts = new Map((row.program_facts ?? []).map((fact) => [fact.kind, fact]))
  return {
    id: row.id,
    name: row.name,
    degree: row.degree,
    field: row.field,
    degreeLevel: row.degree_level,
    subjectArea: row.subject_area,
    duration: mapFact(facts.get('duration'), 'Program duration'),
    tuition: mapFact(facts.get('tuition'), 'Program tuition'),
  }
}

function mapRanking(row: RawRanking): Ranking {
  return { id: String(row.id), label: row.label, rankDisplay: row.rank_display, year: row.year === null ? null : Number(row.year), sourceId: row.source_id }
}

function mapCampus(row: RawCampus): Campus {
  return { id: String(row.id), name: row.name, city: row.city, country: row.country, sourceId: row.source_id }
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
  const state = mappedState(row.state)

  return {
    id: row.id,
    name: row.name,
    city: row.city,
    ...state,
    country: row.country,
    flag: row.country === 'United States' ? '🇺🇸' : row.flag,
    tagline: row.tagline,
    description: row.description,
    photoSeed: row.photo_seed,
    sourceId: row.source_id,
    highlights: row.highlights,
    verification: verificationBySource.get(row.source_id) ?? 'unverified_sample',
    tuition: mapFact(facts.get('tuition'), 'Tuition'),
    fees: mapFact(facts.get('fees'), 'Mandatory fees'),
    roomBoard: mapFact(facts.get('room_board'), 'Room and board'),
    totalCostOfAttendance: mapFact(facts.get('total_cost_of_attendance'), 'Total cost of attendance'),
    aidInternational: mapFact(facts.get('aid_international'), 'International institutional aid'),
    testPolicy: mapFact(facts.get('test_policy'), 'Testing policy'),
    financialCertification: mapFact(facts.get('financial_certification'), 'F-1 financial certification'),
    livingCost: mapFact(facts.get('living_cost') ?? facts.get('room_board'), 'Living cost'),
    applicationFee: mapFact(facts.get('application_fee'), 'Application fee'),
    deadline: mapFact(facts.get('deadline'), 'Application deadline'),
    scholarship: mapFact(facts.get('scholarship') ?? facts.get('aid_international'), 'Scholarship'),
    language: mapFact(facts.get('language'), 'Teaching language'),
    intake: mapFact(facts.get('intake'), 'Next intake'),
    ielts: mapFact(requirements.get('ielts'), 'IELTS requirement'),
    toefl: mapFact(requirements.get('toefl'), 'TOEFL requirement'),
    duolingo: mapFact(requirements.get('duolingo'), 'Duolingo requirement'),
    sat: mapFact(requirements.get('sat'), 'SAT expectation'),
    act: mapFact(requirements.get('act'), 'ACT expectation'),
    gpa: mapFact(requirements.get('gpa'), 'GPA expectation'),
    internationalStudentPct: mapFact(facts.get('international_student_pct'), 'International-student percentage'),
    livingAccommodation: mapFact(facts.get('living_accommodation'), 'Accommodation cost'),
    livingFood: mapFact(facts.get('living_food'), 'Food cost'),
    livingTransport: mapFact(facts.get('living_transport'), 'Transport cost'),
    livingUtilities: mapFact(facts.get('living_utilities'), 'Utilities cost'),
    employabilityRate: mapFact(facts.get('employability_rate'), 'Employability rate'),
    employabilitySummary: mapFact(facts.get('employability_summary'), 'Employability summary'),
    facultyCount: mapFact(facts.get('faculty_count'), 'Faculty count'),
    programs: (row.programs ?? []).map(mapProgram),
    scholarships,
    rankings: (row.rankings ?? []).map(mapRanking),
    campuses: (row.campuses ?? []).map(mapCampus),
  }
}

export function mapLearningLesson(row: RawLearningLesson): LearningLesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    slug: row.slug,
    title: row.title,
    order: Number(row.sort_order),
    durationMinutes: row.duration_minutes === null ? null : Number(row.duration_minutes),
    body: row.body,
    status: row.status,
    transcript: row.transcript,
    mediaUrl: row.media_url,
    audioUrl: row.audio_url,
  }
}

export function mapLearningAssignment(row: RawLearningAssignment): LearningAssignment {
  return {
    id: row.id,
    moduleId: row.module_id,
    slug: row.slug,
    title: row.title,
    brief: row.brief,
    submissionType: row.submission_type,
    templateRef: row.template_ref,
    rubric: row.rubric,
  }
}

function unwrapLearningAssignment(
  value: RawLearningAssignment | RawLearningAssignment[] | null | undefined,
): RawLearningAssignment | undefined {
  if (Array.isArray(value)) return value[0]
  return value ?? undefined
}

export function mapLearningModule(row: RawLearningModule): LearningModule {
  const assignment = unwrapLearningAssignment(row.learning_assignments)
  if (!assignment) throw new Error(`Learning module "${row.slug}" has no assignment.`)
  return {
    id: row.id,
    trackId: row.track_id,
    moduleNumber: Number(row.module_number),
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    order: Number(row.sort_order),
    lessons: (row.learning_lessons ?? [])
      .map(mapLearningLesson)
      .sort((left, right) => left.order - right.order),
    assignment: mapLearningAssignment(assignment),
  }
}

export function mapLearningTrack(row: RawLearningTrack): LearningTrack {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    order: Number(row.sort_order),
    modules: (row.learning_modules ?? [])
      .map(mapLearningModule)
      .sort((left, right) => left.order - right.order),
  }
}

export function mapLearningSubmissionFile(
  row: RawLearningSubmissionFile,
): LearningSubmissionFile {
  return {
    id: row.id,
    submissionId: row.submission_id,
    storagePath: row.storage_path,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    byteSize: Number(row.byte_size),
    createdAt: row.created_at,
  }
}

export function mapLearningSubmission(row: RawLearningSubmission): LearningSubmission {
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    userId: row.user_id,
    status: row.status,
    submittedAt: row.submitted_at,
    feedbackRef: row.feedback_ref,
    files: (row.learning_submission_files ?? [])
      .map(mapLearningSubmissionFile)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
  }
}
