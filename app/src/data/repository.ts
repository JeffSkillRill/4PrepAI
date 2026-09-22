import type {
  LeadSource,
  LeadSubmission,
  LeadSubmitResult,
  LearningAssignment,
  LearningSubmission,
  LearningTrack,
  LearningUserState,
  Pathway,
  Source,
  StudentProfile,
  SupportMessage,
  SupportSendResult,
  SupportThread,
  University,
  UniversityFilters,
  Verification,
} from '../types'
import { computeFit, PHI_WEIGHTS } from '../scoring/phi'
import {
  bestPublishedCostScenario,
  hasComprehensiveInternationalFunding,
  hasFullNeedPolicy,
} from '../scoring/costs'
import { pathwayMilestones } from './static-content'
import { getSupabaseClient } from './client'
import {
  mapSource,
  mapLearningSubmission,
  mapLearningTrack,
  type RawLearningSubmission,
  type RawLearningTrack,
  mapUniversity,
  type RawSource,
  type RawUniversity,
} from './mappers'
import {
  sanitizeLearningFilename,
  validateLearningSubmissionFile,
} from '../learning/logic'

const universitySelect = `
  id,name,city,state,country,flag,tagline,description,photo_seed,highlights,source_id,
  university_facts(kind,value,numeric_value,currency,amount_period,source_id,unknown_reason,suggested_action),
  requirements(kind,value,numeric_value,benchmark,source_id,unknown_reason,suggested_action),
  programs(id,name,degree,field,degree_level,subject_area,program_facts(kind,value,numeric_value,currency,amount_period,source_id,unknown_reason,suggested_action)),
  university_scholarships(scholarships(id,name,amount_value,amount_numeric,currency,amount_period,amount_source_id,amount_unknown_reason,amount_suggested_action,award_conditions(kind,minimum,published_text,source_id))),
  rankings(id,label,rank_display,year,source_id),
  campuses(id,name,city,country,source_id)
`

const learningTrackSelect = `
  id,slug,title,description,sort_order,
  learning_modules(
    id,track_id,module_number,slug,title,summary,sort_order,
    learning_lessons(
      id,module_id,slug,title,sort_order,duration_minutes,body,status,transcript,media_url,audio_url
    ),
    learning_assignments(
      id,module_id,slug,title,brief,submission_type,template_ref,rubric
    )
  )
`

const learningSubmissionSelect = `
  id,assignment_id,user_id,status,submitted_at,feedback_ref,
  learning_submission_files(
    id,submission_id,storage_path,original_filename,mime_type,byte_size,created_at
  )
`

const LEARNING_SUBMISSIONS_BUCKET = 'learning-submissions'
const PRIVATE_OBJECT_CACHE_CONTROL_SECONDS = '0'

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(`4Prep data request failed: ${error.message}`)
}

async function verificationLookup(): Promise<Map<string, Verification>> {
  const sources = await listSources()
  return new Map(sources.map((source) => [source.id, source.verification]))
}

function matchesFilters(university: University, filters: UniversityFilters): boolean {
  if (filters.country && university.country !== filters.country) return false
  if (filters.states?.length && (!university.state || !filters.states.includes(university.state))) return false
  if (filters.field && !university.programs.some((program) => program.field === filters.field)) return false
  if (filters.query) {
    const query = filters.query.toLowerCase()
    const haystack = [
      university.name,
      university.city,
      university.state ?? '',
      university.stateName ?? '',
      university.country,
      ...university.programs.flatMap((program) => [program.name, program.field]),
    ].join(' ').toLowerCase()
    if (!haystack.includes(query)) return false
  }
  if (filters.budgetMax !== undefined && filters.budgetMax !== null) {
    if (hasFullNeedPolicy(university) || hasComprehensiveInternationalFunding(university)) return true
    const scenario = bestPublishedCostScenario(university)
    if (scenario?.currency === 'USD' && scenario.netCost > filters.budgetMax) return false
  }
  return true
}

export async function listSources(): Promise<Source[]> {
  const { data, error } = await getSupabaseClient()
    .from('sources')
    .select('id,name,url,retrieved_at,verification')
    .order('id')
  throwIfError(error)
  return ((data ?? []) as RawSource[]).map(mapSource)
}

export async function listUniversities(filters: UniversityFilters = {}): Promise<University[]> {
  const [result, verificationBySource] = await Promise.all([
    getSupabaseClient().from('universities').select(universitySelect).order('name'),
    verificationLookup(),
  ])
  throwIfError(result.error)
  return ((result.data ?? []) as unknown as RawUniversity[])
    .map((row) => mapUniversity(row, verificationBySource))
    .filter((university) => matchesFilters(university, filters))
}

export async function getUniversity(id: string): Promise<University | null> {
  const [result, verificationBySource] = await Promise.all([
    getSupabaseClient().from('universities').select(universitySelect).eq('id', id).maybeSingle(),
    verificationLookup(),
  ])
  throwIfError(result.error)
  return result.data ? mapUniversity(result.data as unknown as RawUniversity, verificationBySource) : null
}

export async function listScholarshipsForUniversity(id: string) {
  const university = await getUniversity(id)
  return university?.scholarships ?? []
}

export async function getRankedPathway(profile: StudentProfile): Promise<Pathway> {
  const universities = await listUniversities()
  const ranked = universities
    .map((university) => ({
      ...university,
      fit: computeFit(profile, university, PHI_WEIGHTS),
    }))
    .sort((left, right) => (right.fit?.overall ?? 0) - (left.fit?.overall ?? 0))

  return { profile, ranked, milestones: pathwayMilestones }
}

export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  const { data, error } = await getSupabaseClient()
    .from('student_profiles')
    .select('country,field,academic_score,budget_max,budget_currency,language_test,language_score,admission_test,admission_test_score,gpa,needs_language_pathway,intake')
    .eq('user_id', userId)
    .maybeSingle()
  throwIfError(error)
  if (!data) return null
  return {
    country: data.country,
    field: data.field,
    academicScore: data.academic_score === null ? null : Number(data.academic_score),
    budgetMax: data.budget_max === null ? null : Number(data.budget_max),
    budgetCurrency: data.budget_currency,
    languageTest: data.language_test as StudentProfile['languageTest'],
    languageScore: data.language_score === null ? null : Number(data.language_score),
    admissionTest: data.admission_test as StudentProfile['admissionTest'],
    admissionTestScore: data.admission_test_score === null ? null : Number(data.admission_test_score),
    gpa: data.gpa === null ? null : Number(data.gpa),
    needsLanguagePathway: data.needs_language_pathway,
    intake: data.intake,
  }
}

export async function saveStudentProfile(userId: string, profile: StudentProfile): Promise<void> {
  const { error } = await getSupabaseClient().from('student_profiles').upsert({
    user_id: userId,
    country: profile.country,
    field: profile.field,
    academic_score: profile.academicScore,
    budget_max: profile.budgetMax,
    budget_currency: profile.budgetCurrency,
    language_test: profile.languageTest,
    language_score: profile.languageScore,
    admission_test: profile.admissionTest,
    admission_test_score: profile.admissionTestScore,
    gpa: profile.gpa,
    needs_language_pathway: profile.needsLanguagePathway,
    intake: profile.intake,
    consented_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  throwIfError(error)
}

export async function listSavedPlanIds(userId: string): Promise<string[]> {
  const { data, error } = await getSupabaseClient()
    .from('saved_plans')
    .select('university_id')
    .eq('user_id', userId)
    .order('created_at')
  throwIfError(error)
  return (data ?? []).map((row) => row.university_id)
}

export async function savePlan(userId: string, universityId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('saved_plans')
    .upsert({ user_id: userId, university_id: universityId }, { onConflict: 'user_id,university_id', ignoreDuplicates: true })
  throwIfError(error)
}

export async function removePlan(userId: string, universityId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('saved_plans')
    .delete()
    .eq('user_id', userId)
    .eq('university_id', universityId)
  throwIfError(error)
}

type SupportThreadRow = {
  id: string
  user_id: string
  last_message_at: string | null
  last_sender_role: 'student' | 'admin' | null
}

type SupportMessageRow = {
  id: string
  thread_id: string
  sender_role: 'student' | 'admin'
  sender_user_id: string
  body: string
  created_at: string
}

function mapSupportMessage(row: SupportMessageRow): SupportMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderRole: row.sender_role,
    senderUserId: row.sender_user_id,
    body: row.body,
    createdAt: row.created_at,
  }
}

export async function getSupportThread(userId: string): Promise<SupportThread | null> {
  const client = getSupabaseClient()
  const { data: threadData, error: threadError } = await client
    .from('support_threads')
    .select('id,user_id,last_message_at,last_sender_role')
    .eq('user_id', userId)
    .maybeSingle()
  throwIfError(threadError)
  if (!threadData) return null

  const thread = threadData as SupportThreadRow
  const { data: messageData, error: messageError } = await client
    .from('support_messages')
    .select('id,thread_id,sender_role,sender_user_id,body,created_at')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
  throwIfError(messageError)
  return {
    id: thread.id,
    userId: thread.user_id,
    lastMessageAt: thread.last_message_at,
    lastSenderRole: thread.last_sender_role,
    messages: ((messageData ?? []) as SupportMessageRow[]).map(mapSupportMessage),
  }
}

export async function sendSupportMessage(
  messageId: string,
  body: string,
): Promise<SupportSendResult> {
  const { data, error } = await getSupabaseClient().rpc('send_support_message', {
    p_message_id: messageId,
    p_body: body,
  })
  throwIfError(error)
  const row = Array.isArray(data) ? data[0] : null
  if (!row || (row.status !== 'sent' && row.status !== 'rate_limited')) {
    throw new Error('The support message did not receive a delivery confirmation.')
  }
  const retryAfterSeconds = Math.max(0, Number(row.retry_after_seconds) || 0)
  return row.status === 'sent'
    ? { status: 'sent', messageId: row.message_id, retryAfterSeconds: 0 }
    : { status: 'rate_limited', messageId: row.message_id, retryAfterSeconds }
}

/**
 * Ask a human at 4Prep Academy to follow up. Works signed-out on purpose: the
 * catalogue and the counselor are both public, so the highest-intent moment in
 * the product frequently happens before a student has an account.
 *
 * `leadId` is generated by the caller so a retry after a dropped response is
 * idempotent rather than a duplicate row, matching `sendSupportMessage`.
 */
export async function submitLead(
  leadId: string,
  source: LeadSource,
  submission: LeadSubmission,
  contextRef?: string | null,
): Promise<LeadSubmitResult> {
  const { data, error } = await getSupabaseClient().rpc('submit_lead', {
    p_lead_id: leadId,
    p_name: submission.name,
    p_contact: submission.contact,
    p_source: source,
    p_context_ref: contextRef ?? null,
    p_note: submission.note ?? null,
  })
  throwIfError(error)
  const row = Array.isArray(data) ? data[0] : null
  if (!row || (row.status !== 'submitted' && row.status !== 'rate_limited')) {
    throw new Error('The request did not receive a confirmation.')
  }
  const retryAfterSeconds = Math.max(0, Number(row.retry_after_seconds) || 0)
  return row.status === 'submitted'
    ? { status: 'submitted', leadId: row.lead_id, retryAfterSeconds: 0 }
    : { status: 'rate_limited', leadId: row.lead_id, retryAfterSeconds }
}

export async function getLearningTrack(
  slug = 'application-year',
): Promise<LearningTrack | null> {
  const { data, error } = await getSupabaseClient()
    .from('learning_tracks')
    .select(learningTrackSelect)
    .eq('slug', slug)
    .maybeSingle()
  throwIfError(error)
  return data ? mapLearningTrack(data as unknown as RawLearningTrack) : null
}

export async function getLearningUserState(userId: string): Promise<LearningUserState> {
  const [progressResult, submissionResult] = await Promise.all([
    getSupabaseClient()
      .from('learning_progress')
      .select('lesson_id,completed_at')
      .eq('user_id', userId),
    getSupabaseClient()
      .from('learning_submissions')
      .select(learningSubmissionSelect)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: true }),
  ])
  throwIfError(progressResult.error)
  throwIfError(submissionResult.error)
  return {
    completedLessonIds: new Set((progressResult.data ?? []).map((row) => row.lesson_id)),
    completedLessons: (progressResult.data ?? []).map((row) => ({
      lessonId: row.lesson_id,
      completedAt: row.completed_at,
    })),
    submissions: ((submissionResult.data ?? []) as unknown as RawLearningSubmission[])
      .map(mapLearningSubmission),
  }
}

export async function markLearningLessonComplete(
  userId: string,
  lessonId: string,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('learning_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })
  throwIfError(error)
}

type UploadProgress = (percent: number) => void

type LearningSubmissionUpload = {
  userId: string
  assignment: LearningAssignment
  file: File
  onProgress?: UploadProgress
}

function encodedStoragePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

async function uploadLearningObject(
  path: string,
  file: File,
  onProgress?: UploadProgress,
): Promise<void> {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.getSession()
  if (error) throw error
  if (!data.session) throw new Error('Please sign in before uploading homework.')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !publishableKey) {
    throw new Error('Homework upload is not configured.')
  }

  if (typeof XMLHttpRequest === 'undefined') {
    onProgress?.(0)
    const { error: uploadError } = await client.storage
      .from(LEARNING_SUBMISSIONS_BUCKET)
      .upload(path, file, {
        cacheControl: PRIVATE_OBJECT_CACHE_CONTROL_SECONDS,
        contentType: file.type,
        upsert: false,
      })
    if (uploadError) throw uploadError
    onProgress?.(100)
    return
  }

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open(
      'POST',
      `${supabaseUrl}/storage/v1/object/${LEARNING_SUBMISSIONS_BUCKET}/${encodedStoragePath(path)}`,
    )
    request.setRequestHeader('Authorization', `Bearer ${data.session.access_token}`)
    request.setRequestHeader('apikey', publishableKey)
    request.setRequestHeader('Content-Type', file.type)
    request.setRequestHeader('Cache-Control', `max-age=${PRIVATE_OBJECT_CACHE_CONTROL_SECONDS}`)
    request.setRequestHeader('x-upsert', 'false')
    request.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable) return
      onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)))
    })
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100)
        resolve()
        return
      }
      reject(new Error(`Homework upload failed (${request.status}).`))
    })
    request.addEventListener('error', () => reject(new Error('The connection dropped during upload.')))
    request.addEventListener('abort', () => reject(new Error('The upload was cancelled.')))
    onProgress?.(0)
    request.send(file)
  })
}

async function getLearningSubmission(
  userId: string,
  assignmentId: string,
): Promise<LearningSubmission | null> {
  const { data, error } = await getSupabaseClient()
    .from('learning_submissions')
    .select(learningSubmissionSelect)
    .eq('user_id', userId)
    .eq('assignment_id', assignmentId)
    .maybeSingle()
  throwIfError(error)
  return data ? mapLearningSubmission(data as unknown as RawLearningSubmission) : null
}

export async function submitLearningAssignment({
  userId,
  assignment,
  file,
  onProgress,
}: LearningSubmissionUpload): Promise<LearningSubmission> {
  const validationError = validateLearningSubmissionFile(file)
  if (validationError) throw new Error(validationError)

  const client = getSupabaseClient()
  const existing = await getLearningSubmission(userId, assignment.id)
  const { data: submissionRow, error: submissionError } = await client
    .from('learning_submissions')
    .upsert({
      assignment_id: assignment.id,
      user_id: userId,
      status: 'pending',
    }, { onConflict: 'user_id,assignment_id' })
    .select('id')
    .single()
  throwIfError(submissionError)
  if (!submissionRow) throw new Error('The submission record could not be created.')
  const submissionId = submissionRow.id

  const uniquePrefix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}`
  const storagePath = [
    userId,
    assignment.slug,
    `${uniquePrefix}-${sanitizeLearningFilename(file.name)}`,
  ].join('/')

  let uploaded = false
  try {
    await uploadLearningObject(storagePath, file, onProgress)
    uploaded = true

    const { error: fileError } = await client.from('learning_submission_files').insert({
      submission_id: submissionId,
      storage_path: storagePath,
      original_filename: file.name,
      mime_type: file.type.toLowerCase(),
      byte_size: file.size,
    })
    throwIfError(fileError)

    const { error: completionError } = await client
      .from('learning_submissions')
      .update({
        status: 'pending',
        submitted_at: new Date().toISOString(),
        feedback_ref: null,
      })
      .eq('id', submissionId)
      .eq('user_id', userId)
    throwIfError(completionError)
  } catch (reason) {
    if (uploaded) {
      await Promise.allSettled([
        client.storage.from(LEARNING_SUBMISSIONS_BUCKET).remove([storagePath]),
        client.from('learning_submission_files').delete().eq('storage_path', storagePath),
      ])
    }
    if (!existing) {
      await client.from('learning_submissions').delete().eq('id', submissionId)
    }
    throw reason
  }

  const saved = await getLearningSubmission(userId, assignment.id)
  if (!saved) throw new Error('The upload finished, but the submission record could not be reopened.')
  return saved
}

export async function downloadLearningSubmissionFile(storagePath: string): Promise<Blob> {
  const { data, error } = await getSupabaseClient()
    .storage
    .from(LEARNING_SUBMISSIONS_BUCKET)
    .download(
      storagePath,
      { cacheNonce: crypto.randomUUID() },
      { cache: 'no-store' },
    )
  if (error) throw new Error(`4Prep data request failed: ${error.message}`)
  return data
}

export type ReviewedLearningSubmissionWriteBackContext = {
  submission: LearningSubmission
  profileTarget: 'student_profiles' | 'saved_plans'
}

export type ReviewedLearningSubmissionWriteBack = (
  context: ReviewedLearningSubmissionWriteBackContext,
) => Promise<void>

// Deliberately unwired. A later reviewed-artifact parser must supply this adapter;
// uploads in this release never mutate student_profiles or saved_plans.
export const reviewedLearningSubmissionWriteBack: ReviewedLearningSubmissionWriteBack | null = null
