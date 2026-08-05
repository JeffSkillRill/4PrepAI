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
