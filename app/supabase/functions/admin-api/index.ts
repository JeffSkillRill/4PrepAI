import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import {
  deriveDashboardStage,
  hasRecordedFeedbackReference,
} from '../../../../shared/dashboard-stage.ts'
import {
  auditAdminEvent,
  authorizeAdmin,
  type AdminContext,
  type AdminServiceClient,
} from '../_shared/adminAuth.ts'
import {
  ADMIN_FILE_URL_TTL_SECONDS,
  formatAdminGoal,
  happenedWithinDays,
  homeworkIsWaiting,
  latestRecordedAt,
  safeDownloadFilename,
  submissionStoragePathBelongsToUser,
  type ProfileGoalRow,
} from './contract.ts'

const PAGE_SIZE = 500

type AuthUserRow = {
  id: string
  email: string | null
  createdAt: string
  lastSignInAt: string | null
}

type ProfileRow = ProfileGoalRow & {
  user_id: string
  created_at: string
  updated_at: string
}

type SavedPlanRow = {
  user_id: string
  created_at: string
}

type AdminIdentityRow = {
  user_id: string
}

type ProgressRow = {
  user_id: string
  lesson_id: string
  completed_at: string
}

type SubmissionRow = {
  id: string
  user_id: string
  status: string
  submitted_at: string | null
  feedback_ref: string | null
}

type SubmissionDetailRow = SubmissionRow & {
  learning_assignments: {
    title: string
    brief: string
    rubric: Record<string, unknown> | null
  } | null
  learning_submission_files: Array<{
    id: string
    original_filename: string
    mime_type: string
    byte_size: number
  }>
}

type FileRow = {
  id: string
  storage_path: string
  original_filename: string
  learning_submissions: { user_id: string } | Array<{ user_id: string }> | null
}

type AdminAction =
  | { action: 'access' }
  | { action: 'session' }
  | { action: 'cohort' }
  | { action: 'student'; studentId: string }
  | { action: 'file_url'; fileId: string }

type PageResult<T> = {
  data: T[] | null
  error: { message: string } | null
}

function allowedOrigins(): Set<string> {
  const configured = (Deno.env.get('ADMIN_ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  return new Set(configured)
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin')
  return {
    ...(origin && allowedOrigins().has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Expose-Headers': 'X-Request-Id',
    'Vary': 'Origin',
  }
}

function json(
  request: Request,
  requestId: string,
  value: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
      'Cache-Control': 'no-store',
    },
  })
}

function parseAction(value: unknown): AdminAction | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Record<string, unknown>
  if (candidate.action === 'access' || candidate.action === 'session' || candidate.action === 'cohort') {
    return { action: candidate.action }
  }
  if (candidate.action === 'student' && typeof candidate.studentId === 'string' && candidate.studentId) {
    return { action: 'student', studentId: candidate.studentId }
  }
  if (candidate.action === 'file_url' && typeof candidate.fileId === 'string' && candidate.fileId) {
    return { action: 'file_url', fileId: candidate.fileId }
  }
  return null
}

async function collectPages<T>(
  load: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const result = await load(from, from + PAGE_SIZE - 1)
    if (result.error) throw new Error(result.error.message)
    const page = result.data ?? []
    rows.push(...page)
    if (page.length < PAGE_SIZE) return rows
  }
}

async function listAuthUsers(database: AdminServiceClient): Promise<AuthUserRow[]> {
  const users: AuthUserRow[] = []
  for (let page = 1; ; page += 1) {
    const { data, error } = await database.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(error.message)
    const batch = data.users.map((user) => ({
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
    }))
    users.push(...batch)
    if (batch.length < 1000) return users
  }
}

async function getAuthUser(
  database: AdminServiceClient,
  userId: string,
): Promise<AuthUserRow | null> {
  const { data, error } = await database.auth.admin.getUserById(userId)
  if (error) throw new Error(error.message)
  const user = data.user
  if (!user) return null
  return {
    id: user.id,
    email: user.email ?? null,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
  }
}

async function hasAdminGrantHistory(
  database: AdminServiceClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await database
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
  if (error) throw new Error(error.message)
  return Boolean(data?.length)
}

async function loadCohortRecords(database: AdminServiceClient) {
  const [authUsers, adminIdentities, profiles, plans, progress, submissions] = await Promise.all([
    listAuthUsers(database),
    collectPages<AdminIdentityRow>((from, to) => database
      .from('admin_users')
      .select('user_id')
      .order('user_id')
      .range(from, to)),
    collectPages<ProfileRow>((from, to) => database
      .from('student_profiles')
      .select('user_id,country,field,budget_max,budget_currency,intake,created_at,updated_at')
      .order('user_id')
      .range(from, to)),
    collectPages<SavedPlanRow>((from, to) => database
      .from('saved_plans')
      .select('user_id,created_at')
      .order('user_id')
      .range(from, to)),
    collectPages<ProgressRow>((from, to) => database
      .from('learning_progress')
      .select('user_id,lesson_id,completed_at')
      .order('user_id')
      .range(from, to)),
    collectPages<SubmissionRow>((from, to) => database
      .from('learning_submissions')
      .select('id,user_id,status,submitted_at,feedback_ref')
      .order('user_id')
      .range(from, to)),
  ])
  const adminUserIds = new Set(adminIdentities.map((identity) => identity.user_id))
  const users = authUsers.filter((user) => !adminUserIds.has(user.id))
  const studentUserIds = new Set(users.map((user) => user.id))
  return {
    users,
    profiles: profiles.filter((row) => studentUserIds.has(row.user_id)),
    plans: plans.filter((row) => studentUserIds.has(row.user_id)),
    progress: progress.filter((row) => studentUserIds.has(row.user_id)),
    submissions: submissions.filter((row) => studentUserIds.has(row.user_id)),
  }
}

function groupByUser<T extends { user_id: string }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>()
  for (const row of rows) grouped.set(row.user_id, [...(grouped.get(row.user_id) ?? []), row])
  return grouped
}

function cohortPayload(records: Awaited<ReturnType<typeof loadCohortRecords>>) {
  const profileByUser = new Map(records.profiles.map((profile) => [profile.user_id, profile]))
  const plansByUser = groupByUser(records.plans)
  const progressByUser = groupByUser(records.progress)
  const submissionsByUser = groupByUser(records.submissions)

  return records.users.map((user) => {
    const profile = profileByUser.get(user.id) ?? null
    const plans = plansByUser.get(user.id) ?? []
    const progress = progressByUser.get(user.id) ?? []
    const submissions = submissionsByUser.get(user.id) ?? []
    const submitted = submissions.filter((item) => item.submitted_at)
    const lastActiveAt = latestRecordedAt([
      profile?.created_at,
      profile?.updated_at,
      ...plans.map((item) => item.created_at),
      ...progress.map((item) => item.completed_at),
      ...submissions.map((item) => item.submitted_at),
    ])
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      lastActiveAt,
      stage: deriveDashboardStage({
        hasCompletedIntake: Boolean(profile),
        savedPlanCount: plans.length,
        completedLessonCount: progress.length,
        submittedHomeworkCount: submitted.length,
        feedbackReceivedCount: submitted.filter((item) => (
          hasRecordedFeedbackReference(item.feedback_ref)
        )).length,
      }),
      homeworkWaiting: submissions.filter(homeworkIsWaiting).length,
      goal: formatAdminGoal(profile),
    }
  }).sort((left, right) => {
    if (left.homeworkWaiting !== right.homeworkWaiting) return right.homeworkWaiting - left.homeworkWaiting
    return (Date.parse(right.lastActiveAt ?? '') || 0) - (Date.parse(left.lastActiveAt ?? '') || 0)
  })
}

async function auditRead(
  context: AdminContext,
  action: string,
  resourceType: string,
  resourceId?: string | null,
  targetUserId?: string | null,
): Promise<void> {
  await auditAdminEvent(context, {
    action,
    resourceType,
    resourceId,
    targetUserId,
    outcome: 'allowed',
    metadata: { access_basis: 'active_admin_grant' },
  })
}

async function sessionResponse(context: AdminContext) {
  await auditRead(context, 'cohort.metrics.read', 'student_cohort')
  const records = await loadCohortRecords(context.database)
  const students = cohortPayload(records)
  const now = new Date()
  return {
    admin: { id: context.userId, email: context.email },
    metrics: {
      signedUpTotal: records.users.length,
      signedIn30d: records.users.filter((user) => happenedWithinDays(user.lastSignInAt, 30, now)).length,
      acted30d: students.filter((student) => happenedWithinDays(student.lastActiveAt, 30, now)).length,
      waitingReview: records.submissions.filter(homeworkIsWaiting).length,
    },
    definitions: {
      signedUpTotal: 'Student Auth users currently present in this Supabase project. Auth identities with admin grant history are excluded.',
      signedIn30d: 'Those student users whose Supabase Auth last sign-in time is within the trailing 30 days.',
      acted30d: 'Users with a profile save or update, saved plan, completed lesson, or homework submission recorded in the trailing 30 days. Page views are not counted.',
      waitingReview: 'Submitted homework with no feedback reference and a pending or submitted status.',
    },
  }
}

async function cohortResponse(context: AdminContext) {
  await auditRead(context, 'cohort.roster.read', 'student_cohort')
  return { students: cohortPayload(await loadCohortRecords(context.database)) }
}

async function studentResponse(context: AdminContext, studentId: string) {
  await auditRead(context, 'student.detail.read', 'student', studentId, studentId)
  if (await hasAdminGrantHistory(context.database, studentId)) return null
  const [user, profileResult, plansResult, progressResult, submissionsResult] = await Promise.all([
    getAuthUser(context.database, studentId),
    context.database
      .from('student_profiles')
      .select('user_id,country,field,budget_max,budget_currency,intake,created_at,updated_at')
      .eq('user_id', studentId)
      .maybeSingle(),
    context.database.from('saved_plans').select('user_id,created_at').eq('user_id', studentId),
    context.database.from('learning_progress').select('user_id,lesson_id,completed_at').eq('user_id', studentId),
    context.database
      .from('learning_submissions')
      .select('id,user_id,status,submitted_at,feedback_ref,learning_assignments(title,brief,rubric),learning_submission_files(id,original_filename,mime_type,byte_size)')
      .eq('user_id', studentId)
      .order('submitted_at', { ascending: false }),
  ])
  if (profileResult.error) throw new Error(profileResult.error.message)
  if (plansResult.error) throw new Error(plansResult.error.message)
  if (progressResult.error) throw new Error(progressResult.error.message)
  if (submissionsResult.error) throw new Error(submissionsResult.error.message)
  if (!user) return null

  const profile = profileResult.data as ProfileRow | null
  const plans = (plansResult.data ?? []) as SavedPlanRow[]
  const progress = (progressResult.data ?? []) as ProgressRow[]
  const submissions = (submissionsResult.data ?? []) as unknown as SubmissionDetailRow[]
  const submitted = submissions.filter((item) => item.submitted_at)
  const lastActiveAt = latestRecordedAt([
    profile?.created_at,
    profile?.updated_at,
    ...plans.map((item) => item.created_at),
    ...progress.map((item) => item.completed_at),
    ...submissions.map((item) => item.submitted_at),
  ])
  return {
    student: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      lastActiveAt,
      stage: deriveDashboardStage({
        hasCompletedIntake: Boolean(profile),
        savedPlanCount: plans.length,
        completedLessonCount: progress.length,
        submittedHomeworkCount: submitted.length,
        feedbackReceivedCount: submitted.filter((item) => (
          hasRecordedFeedbackReference(item.feedback_ref)
        )).length,
      }),
      goal: formatAdminGoal(profile),
    },
    submissions: submissions.map((submission) => ({
      id: submission.id,
      status: submission.status,
      submittedAt: submission.submitted_at,
      homeworkWaiting: homeworkIsWaiting(submission),
      assignment: {
        title: submission.learning_assignments?.title ?? 'Assignment unavailable',
        brief: submission.learning_assignments?.brief ?? 'The assignment brief is unavailable.',
        rubric: submission.learning_assignments?.rubric ?? null,
      },
      files: submission.learning_submission_files.map((file) => ({
        id: file.id,
        name: file.original_filename,
        mimeType: file.mime_type,
        byteSize: file.byte_size,
      })),
    })),
  }
}

async function fileUrlResponse(context: AdminContext, fileId: string) {
  await auditRead(context, 'homework.file.lookup', 'learning_submission_file', fileId)
  const { data, error } = await context.database
    .from('learning_submission_files')
    .select('id,storage_path,original_filename,learning_submissions!inner(user_id)')
    .eq('id', fileId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const file = data as unknown as FileRow
  const relation = Array.isArray(file.learning_submissions)
    ? file.learning_submissions[0]
    : file.learning_submissions
  const targetUserId = relation?.user_id ?? null
  if (!targetUserId || !submissionStoragePathBelongsToUser(file.storage_path, targetUserId)) {
    throw new Error('Submission file path does not match its recorded owner.')
  }
  if (await hasAdminGrantHistory(context.database, targetUserId)) return null

  // Write the required file-open audit before minting a usable URL. If this
  // insert fails, no signed URL is returned.
  await auditRead(context, 'homework.file.open', 'learning_submission_file', file.id, targetUserId)
  const { data: signed, error: signedError } = await context.database.storage
    .from('learning-submissions')
    .createSignedUrl(file.storage_path, ADMIN_FILE_URL_TTL_SECONDS, {
      download: safeDownloadFilename(file.original_filename),
    })
  if (signedError || !signed?.signedUrl) {
    throw new Error(signedError?.message ?? 'Signed URL was not created.')
  }
  return { signedUrl: signed.signedUrl, expiresIn: ADMIN_FILE_URL_TTL_SECONDS }
}

export default {
  async fetch(request: Request) {
    const requestId = crypto.randomUUID()
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin')
      return new Response(null, {
        status: origin && allowedOrigins().has(origin) ? 204 : 403,
        headers: corsHeaders(request),
      })
    }
    if (request.method !== 'POST') return json(request, requestId, { error: 'Method not allowed.' }, 405)

    const authorization = await authorizeAdmin(request, requestId)
    if (!authorization.ok) {
      const message = authorization.status === 403 ? 'Not available.' : 'Admin service unavailable.'
      const body = authorization.status === 403
        ? { error: message }
        : { error: message, requestId }
      return json(
        request,
        requestId,
        body,
        authorization.status,
      )
    }

    const action = parseAction(await request.json().catch(() => null))
    if (!action) return json(request, requestId, { error: 'Invalid admin request.', requestId }, 400)

    try {
      if (action.action === 'access') {
        return json(request, requestId, {
          admin: { id: authorization.context.userId, email: authorization.context.email },
        })
      }
      if (action.action === 'session') {
        return json(request, requestId, await sessionResponse(authorization.context))
      }
      if (action.action === 'cohort') {
        return json(request, requestId, await cohortResponse(authorization.context))
      }
      if (action.action === 'student') {
        const result = await studentResponse(authorization.context, action.studentId)
        return result
          ? json(request, requestId, result)
          : json(request, requestId, { error: 'Student not found.', requestId }, 404)
      }
      const result = await fileUrlResponse(authorization.context, action.fileId)
      return result
        ? json(request, requestId, result)
        : json(request, requestId, { error: 'File not found.', requestId }, 404)
    } catch (reason) {
      console.error('ADMIN_API_REQUEST_FAILED', {
        requestId,
        action: action.action,
        message: reason instanceof Error ? reason.message : String(reason),
      })
      try {
        await auditAdminEvent(authorization.context, {
          action: `${action.action}.failed`,
          resourceType: 'admin_api',
          outcome: 'failed',
          reasonCode: 'request_failed',
        })
      } catch (auditReason) {
        console.error('ADMIN_API_FAILURE_AUDIT_FAILED', {
          requestId,
          message: auditReason instanceof Error ? auditReason.message : String(auditReason),
        })
      }
      return json(request, requestId, { error: 'Admin service unavailable.', requestId }, 503)
    }
  },
}
