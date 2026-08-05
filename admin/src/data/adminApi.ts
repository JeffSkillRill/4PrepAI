import { getSupabaseClient } from './client'
import type {
  AdminAccessResponse,
  AdminCohortResponse,
  AdminFileUrlResponse,
  AdminSessionResponse,
  AdminSupportInboxResponse,
  AdminSupportReplyResponse,
  AdminSupportThreadResponse,
  AdminStudentResponse,
} from '../types'

export class NotAvailableError extends Error {
  constructor() {
    super('Not available')
    this.name = 'NotAvailableError'
  }
}

export function isNotAvailableStatus(status: number | undefined): boolean {
  return status === 401 || status === 403
}

type AdminActionBody =
  | { action: 'access' }
  | { action: 'session' }
  | { action: 'cohort' }
  | { action: 'student'; studentId: string }
  | { action: 'file_url'; fileId: string }
  | { action: 'chat_inbox' }
  | { action: 'chat_thread'; threadId: string }
  | { action: 'chat_reply'; threadId: string; body: string }

async function invokeAdminApi<T>(body: AdminActionBody): Promise<T> {
  const result = await getSupabaseClient().functions.invoke<T>('admin-api', { body })
  if (result.error) {
    if (isNotAvailableStatus(result.response?.status)) throw new NotAvailableError()
    throw new Error('The admin request could not be completed.')
  }
  if (!result.data) throw new Error('The admin request returned no data.')
  return result.data
}

export const adminApi = {
  access: () => invokeAdminApi<AdminAccessResponse>({ action: 'access' }),
  session: () => invokeAdminApi<AdminSessionResponse>({ action: 'session' }),
  cohort: () => invokeAdminApi<AdminCohortResponse>({ action: 'cohort' }),
  student: (studentId: string) => invokeAdminApi<AdminStudentResponse>({
    action: 'student',
    studentId,
  }),
  fileUrl: (fileId: string) => invokeAdminApi<AdminFileUrlResponse>({
    action: 'file_url',
    fileId,
  }),
  chatInbox: () => invokeAdminApi<AdminSupportInboxResponse>({ action: 'chat_inbox' }),
  chatThread: (threadId: string) => invokeAdminApi<AdminSupportThreadResponse>({
    action: 'chat_thread',
    threadId,
  }),
  chatReply: (threadId: string, body: string) => invokeAdminApi<AdminSupportReplyResponse>({
    action: 'chat_reply',
    threadId,
    body,
  }),
}
