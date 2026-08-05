export type View =
  | 'dashboard'
  | 'search'
  | 'profile'
  | 'compare'
  | 'intake'
  | 'results'
  | 'tools'
  | 'saved'
  | 'counselor'
  | 'support'
  | 'learn'
  | 'learn_module'
  | 'learn_lesson'
  | 'learn_assignment'
  | 'auth'
  | 'auth_callback'
  | 'reset_password'
  | 'privacy'
  | 'not_found'

export type DevState = 'ready' | 'loading' | 'empty' | 'partial' | 'no_results' | 'refusal' | 'error' | 'offline'

export type Verification = 'unverified_sample' | 'verified'

export type Source = {
  id: string
  origin: string
  url?: string
  retrievedAt: string
  verification: Verification
}

export type AmountPeriod = 'year' | 'semester' | 'month' | 'one_time' | 'percentage'

export type DataPointMetadata = {
  numericValue?: number
  currency?: string
  period?: AmountPeriod
}

// The known/unknown union is the product's provenance boundary. Numeric metadata
// is optional and can only accompany a known, cited value.
export type DataPoint<T> =
  | ({ status: 'known'; value: T; sourceId: string } & DataPointMetadata)
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
  fees: DataPoint<string>
  roomBoard: DataPoint<string>
  totalCostOfAttendance: DataPoint<string>
  aidInternational: DataPoint<string>
  testPolicy: DataPoint<string>
  financialCertification: DataPoint<string>
  livingCost: DataPoint<string>
  applicationFee: DataPoint<string>
  deadline: DataPoint<string>
  scholarship: DataPoint<string>
  language: DataPoint<string>
  ielts: DataPoint<string>
  toefl: DataPoint<string>
  duolingo: DataPoint<string>
  sat: DataPoint<string>
  act: DataPoint<string>
  gpa: DataPoint<string>
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
  budgetCurrency: string | null
  languageTest: 'ielts' | 'toefl' | 'duolingo' | null
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

export type LearningLessonStatus = 'draft' | 'published'

export type LearningSubmissionType = 'structured' | 'checklist' | 'artifact'

export type LearningSubmissionStatus = 'pending' | 'submitted' | 'reviewed'

export type LearningLesson = {
  id: string
  moduleId: string
  slug: string
  title: string
  order: number
  durationMinutes: number | null
  body: string | null
  status: LearningLessonStatus
  transcript: string | null
  mediaUrl: string | null
  audioUrl: string | null
}

export type LearningAssignment = {
  id: string
  moduleId: string
  slug: string
  title: string
  brief: string
  submissionType: LearningSubmissionType
  templateRef: string
  rubric: Record<string, unknown> | null
}

export type LearningModule = {
  id: string
  trackId: string
  moduleNumber: number
  slug: string
  title: string
  summary: string
  order: number
  lessons: LearningLesson[]
  assignment: LearningAssignment
}

export type LearningTrack = {
  id: string
  slug: string
  title: string
  description: string
  order: number
  modules: LearningModule[]
}

export type LearningSubmissionFile = {
  id: string
  submissionId: string
  storagePath: string
  originalFilename: string
  mimeType: string
  byteSize: number
  createdAt: string
}

export type LearningSubmission = {
  id: string
  assignmentId: string
  userId: string
  status: LearningSubmissionStatus
  submittedAt: string | null
  feedbackRef: string | null
  files: LearningSubmissionFile[]
}

export type LearningUserState = {
  completedLessonIds: Set<string>
  submissions: LearningSubmission[]
}

export type SupportMessageSender = 'student' | 'admin'

export type SupportMessage = {
  id: string
  threadId: string
  senderRole: SupportMessageSender
  senderUserId: string
  body: string
  createdAt: string
}

export type SupportThread = {
  id: string
  userId: string
  lastMessageAt: string | null
  lastSenderRole: SupportMessageSender | null
  messages: SupportMessage[]
}

export type SupportSendResult =
  | { status: 'sent'; messageId: string; retryAfterSeconds: 0 }
  | { status: 'rate_limited'; messageId: string; retryAfterSeconds: number }

export const known = <T,>(
  value: T,
  sourceId: string,
  metadata: DataPointMetadata = {},
): DataPoint<T> => ({ status: 'known', value, sourceId, ...metadata })

export const unknown = <T,>(reason: string, suggestedAction: string): DataPoint<T> => ({
  status: 'unknown',
  reason,
  suggestedAction,
})
