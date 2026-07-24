export type View = 'search' | 'profile' | 'compare' | 'intake' | 'results' | 'tools' | 'saved'

export type DevState = 'ready' | 'loading' | 'empty' | 'partial' | 'no_results' | 'refusal' | 'error' | 'offline'

export type Verification = 'unverified_sample' | 'verified'

export type Source = {
  id: string
  origin: string
  url?: string
  retrievedAt: string
  verification: Verification
}

export type DataPoint<T> =
  | { status: 'known'; value: T; sourceId: string }
  | { status: 'unknown'; reason: string; suggestedAction: string }

export type FitTone = 'strong' | 'medium' | 'weak'

export type FitDimension = 'academic' | 'financial' | 'language' | 'career' | 'geographic'

export type FitComponent = {
  label: string
  score: number
  grade: string
  tone: FitTone
  reason: string
}

export type FitScore = {
  version: string
  overall: number
  grade: string
  label: string
  summary: string
  components: Record<FitDimension, FitComponent>
  computedAt: string
}

export type Program = {
  id: string
  name: string
  degree: string
  field: string
  duration: DataPoint<string>
  tuition: DataPoint<string>
}

export type Scholarship = {
  id: string
  name: string
  amount: DataPoint<string>
}

export type University = {
  id: string
  name: string
  city: string
  country: string
  flag: string
  tagline: string
  description: string
  photoSeed: string
  verification: Verification
  fit?: FitScore
  tuition: DataPoint<string>
  livingCost: DataPoint<string>
  applicationFee: DataPoint<string>
  deadline: DataPoint<string>
  scholarship: DataPoint<string>
  language: DataPoint<string>
  ielts: DataPoint<string>
  intake: DataPoint<string>
  programs: Program[]
  scholarships: Scholarship[]
  highlights: string[]
}

export type StudentProfile = {
  country: string
  field: string
  academicScore: number | null
  budgetMax: number | null
  languageScore: number | null
  needsLanguagePathway: boolean
  intake: string
}

export type PathwayMilestone = {
  month: string
  title: string
  detail: string
}

export type Pathway = {
  profile: StudentProfile
  ranked: University[]
  milestones: PathwayMilestone[]
}

export type UniversityFilters = {
  query?: string
  country?: string
  field?: string
  budgetMax?: number | null
}

export type ToolItem = {
  id: string
  name: string
  description: string
  tag: string
  view?: View
}

export const known = <T,>(value: T, sourceId: string): DataPoint<T> => ({ status: 'known', value, sourceId })

export const unknown = <T,>(reason: string, suggestedAction: string): DataPoint<T> => ({
  status: 'unknown',
  reason,
  suggestedAction,
})
