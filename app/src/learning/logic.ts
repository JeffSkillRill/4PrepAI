import type {
  LearningModule,
  LearningSubmission,
  LearningSubmissionStatus,
} from '../types'

export const MAX_SUBMISSION_FILE_BYTES = 10 * 1024 * 1024

export const SUBMISSION_ACCEPT_ATTRIBUTE = [
  '.pdf',
  '.docx',
  '.csv',
  '.xlsx',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.heic',
  '.heif',
].join(',')

export const SUBMISSION_ACCEPTED_LABEL = 'PDF, DOCX, CSV, XLSX, JPG, PNG, WEBP, GIF, HEIC, or HEIF'

const allowedFileTypes = new Map<string, ReadonlySet<string>>([
  ['application/pdf', new Set(['pdf'])],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', new Set(['docx'])],
  ['text/csv', new Set(['csv'])],
  ['application/vnd.ms-excel', new Set(['csv'])],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', new Set(['xlsx'])],
  ['image/jpeg', new Set(['jpg', 'jpeg'])],
  ['image/png', new Set(['png'])],
  ['image/webp', new Set(['webp'])],
  ['image/gif', new Set(['gif'])],
  ['image/heic', new Set(['heic'])],
  ['image/heif', new Set(['heif'])],
])

export type LearningModuleDisplayStatus =
  | 'locked'
  | 'available'
  | 'lessons_in_progress'
  | 'homework_submitted'

export type LearningModuleState = {
  module: LearningModule
  status: LearningModuleDisplayStatus
  unlocked: boolean
  bypassed: boolean
}

function isSubmitted(submission: LearningSubmission | undefined): boolean {
  return Boolean(submission?.submittedAt)
}

export function deriveLearningModuleStates(
  modules: LearningModule[],
  submissions: LearningSubmission[],
  completedLessonIds: ReadonlySet<string>,
  bypassedModuleSlugs: ReadonlySet<string> = new Set(),
): LearningModuleState[] {
  const submissionByAssignment = new Map(
    submissions.map((submission) => [submission.assignmentId, submission]),
  )

  return [...modules]
    .sort((left, right) => left.order - right.order)
    .map((module, index, ordered) => {
      const currentSubmission = submissionByAssignment.get(module.assignment.id)
      const previousModule = ordered[index - 1]
      const previousSubmitted = previousModule
        ? isSubmitted(submissionByAssignment.get(previousModule.assignment.id))
        : true
      const bypassed = bypassedModuleSlugs.has(module.slug)
      const unlocked = previousSubmitted || bypassed
      const hasProgress = module.lessons.some((lesson) => completedLessonIds.has(lesson.id))

      let status: LearningModuleDisplayStatus
      if (isSubmitted(currentSubmission)) status = 'homework_submitted'
      else if (!unlocked) status = 'locked'
      else if (hasProgress) status = 'lessons_in_progress'
      else status = 'available'

      return { module, status, unlocked, bypassed }
    })
}

export function findLearningContinueModule(states: LearningModuleState[]): LearningModule | null {
  const next = states.find(({ status }) => (
    status === 'available' || status === 'lessons_in_progress'
  ))
  if (next) return next.module
  return states.at(-1)?.module ?? null
}

export function validateLearningSubmissionFile(
  file: Pick<File, 'name' | 'size' | 'type'>,
): string | null {
  if (file.size <= 0) return 'This file is empty. Choose a file that contains your work.'
  if (file.size > MAX_SUBMISSION_FILE_BYTES) return 'This file is larger than the 10 MB limit.'

  const allowedExtensions = allowedFileTypes.get(file.type.toLowerCase())
  if (!allowedExtensions) return `Choose one of these file types: ${SUBMISSION_ACCEPTED_LABEL}.`

  const extension = file.name.split('.').at(-1)?.toLowerCase() ?? ''
  if (!allowedExtensions.has(extension)) {
    return 'The file extension does not match its file type. Export the file again and retry.'
  }
  return null
}

export function sanitizeLearningFilename(filename: string): string {
  const sanitized = filename
    .normalize('NFKD')
    .replace(/[^\w.,'!$@=;:+()&*-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return sanitized || 'submission'
}

export function isPendingLearningSubmission(status: LearningSubmissionStatus): boolean {
  return status === 'pending'
}
