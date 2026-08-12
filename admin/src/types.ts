import type { DashboardStage } from '../../shared/dashboard-stage'

export type AdminStage = DashboardStage

export type AdminGoal = {
  destination: string | null
  field: string | null
  budget: string | null
  intakeTerm: string | null
}

export type AdminMetrics = {
  signedUpTotal: number
  signedIn30d: number
  acted30d: number
  waitingReview: number
}

export type AdminMetricDefinitions = Record<keyof AdminMetrics, string>

export type AdminAccessResponse = {
  admin: {
    id: string
    email: string | null
  }
}

export type AdminSessionResponse = AdminAccessResponse & {
  metrics: AdminMetrics
  definitions: AdminMetricDefinitions
}

export type AdminStudentSummary = {
  id: string
  email: string | null
  createdAt: string
  lastSignInAt: string | null
  lastActiveAt: string | null
  stage: AdminStage
  homeworkWaiting: number
  goal: AdminGoal | null
}

export type AdminCohortResponse = {
  students: AdminStudentSummary[]
}

export type AdminLeadStatus = 'new' | 'claimed' | 'answered' | 'closed'

export type AdminLeadSource = 'results' | 'gap' | 'counselor_refusal'

export type AdminLead = {
  id: string
  /** Null for a student who asked before creating an account. Still a real lead. */
  studentUserId: string | null
  name: string
  contact: string
  source: AdminLeadSource | string
  contextRef: string | null
  note: string | null
  status: AdminLeadStatus
  claimedBy: string | null
  claimedAt: string | null
  answeredAt: string | null
  createdAt: string
  waitingHours: number
}

export type AdminLeadInboxResponse = {
  status: AdminLeadStatus
  leads: AdminLead[]
  /** How long the student who has waited longest has been waiting. */
  oldestWaitingHours: number
}

export type AdminLeadMutationResponse = {
  leadId: string
  status: AdminLeadStatus
}

export type AdminSubmissionFile = {
  id: string
  name: string
  mimeType: string
  byteSize: number
}

export type AdminSubmission = {
  id: string
  status: string
  submittedAt: string | null
  homeworkWaiting: boolean
  assignment: {
    title: string
    brief: string
    rubric: unknown | null
  }
  files: AdminSubmissionFile[]
}

export type AdminStudentResponse = {
  student: {
    id: string
    email: string | null
    stage: AdminStage
    goal: AdminGoal | null
  }
  submissions: AdminSubmission[]
}

export type AdminFileUrlResponse = {
  signedUrl: string
  expiresIn: number
}

export type AdminSupportInboxItem = {
  threadId: string
  studentId: string
  email: string | null
  stage: AdminStage
  waiting: boolean
  lastMessageAt: string
  preview: string
}

export type AdminSupportInboxResponse = {
  threads: AdminSupportInboxItem[]
}

export type AdminSupportMessage = {
  id: string
  senderRole: 'student' | 'admin'
  body: string
  createdAt: string
}

export type AdminSupportThreadResponse = {
  thread: {
    id: string
    studentId: string
    email: string | null
    stage: AdminStage
  }
  messages: AdminSupportMessage[]
}

export type AdminSupportReplyResponse = {
  message: AdminSupportMessage
}
