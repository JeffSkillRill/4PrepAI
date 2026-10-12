import 'jsr:@supabase/functions-js@2.117.3/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.117.2'
import { listStorageObjects, removeStorageObjects, verifyOwnedPaths } from './storage.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
}

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export default {
  async fetch(request: Request) {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

    const authorization = request.headers.get('Authorization') ?? ''
    const accessToken = authorization.replace(/^Bearer\s+/i, '')
    if (!accessToken) return json({ error: 'Please sign in again.' }, 401)

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid request.' }, 400)
    }
    if (
      !body
      || typeof body !== 'object'
      || (body as { confirmation?: unknown }).confirmation !== 'delete-my-account'
    ) {
      return json({ error: 'Deletion confirmation is required.' }, 400)
    }

    const url = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !anonKey || !serviceRoleKey) {
      console.error('DELETE_ACCOUNT_CONFIGURATION_MISSING')
      return json({ error: 'Account deletion is unavailable right now.' }, 503)
    }

    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    })
    const serviceRetry = accessToken === serviceRoleKey
    const requestedUserId = (body as { userId?: unknown }).userId
    const { data: userData, error: userError } = serviceRetry
      ? { data: { user: null }, error: null }
      : await authClient.auth.getUser(accessToken)
    if (!serviceRetry && (userError || !userData.user)) return json({ error: 'Please sign in again.' }, 401)
    const userId = serviceRetry && typeof requestedUserId === 'string' && /^[0-9a-f-]{36}$/i.test(requestedUserId)
      ? requestedUserId : userData.user?.id
    if (!userId) return json({ error: 'Invalid deletion retry.' }, 400)
    const admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const existingJob = await admin.from('account_deletion_jobs').select('stage').eq('user_id', userId).maybeSingle()
    if (existingJob.error) return json({ error: 'Deletion tracking is unavailable. Please try again.' }, 503)
    // Service retries can reconcile a student-confirmed request, never initiate one.
    if (serviceRetry && !existingJob.data) return json({ error: 'No confirmed deletion request.' }, 403)
    if (existingJob.data?.stage === 'finished') return json({ deleted: true, orphanedRows: 0, orphanedObjects: 0 })
    if (!existingJob.data) {
      const job = await admin.from('account_deletion_jobs').insert({ user_id: userId })
      if (job.error) return json({ error: 'Deletion tracking is unavailable. Please try again.' }, 503)
    }

    const submissionResult = await admin
      .from('learning_submissions')
      .select('id')
      .eq('user_id', userId)
    if (submissionResult.error) {
      console.error('DELETE_ACCOUNT_PORTAL_LOOKUP_FAILED', {
        userId,
        message: submissionResult.error.message,
      })
      return json({ error: 'Account deletion could not verify portal data.' }, 500)
    }

    const submissionIds = (submissionResult.data ?? []).map((row) => row.id)
    const supportThreadResult = await admin
      .from('support_threads')
      .select('id')
      .eq('user_id', userId)
    if (supportThreadResult.error) {
      console.error('DELETE_ACCOUNT_SUPPORT_LOOKUP_FAILED', {
        userId,
        message: supportThreadResult.error.message,
      })
      return json({ error: 'Account deletion could not verify support messages.' }, 500)
    }
    const supportThreadIds = (supportThreadResult.data ?? []).map((row) => row.id)
    const fileResult = submissionIds.length > 0
      ? await admin
        .from('learning_submission_files')
        .select('submission_id,storage_path')
        .in('submission_id', submissionIds)
      : { data: [], error: null }
    if (fileResult.error) {
      console.error('DELETE_ACCOUNT_PORTAL_FILE_LOOKUP_FAILED', {
        userId,
        message: fileResult.error.message,
      })
      return json({ error: 'Account deletion could not verify uploaded files.' }, 500)
    }

    let storagePaths: string[]
    try {
      const listedPaths = await listStorageObjects(admin, userId)
      storagePaths = verifyOwnedPaths(userId, [...new Set([
        ...listedPaths,
        ...(fileResult.data ?? []).map((row) => row.storage_path),
      ])])
    } catch (reason) {
      console.error('DELETE_ACCOUNT_STORAGE_LOOKUP_FAILED', {
        userId,
        message: reason instanceof Error ? reason.message : String(reason),
      })
      return json({ error: 'Account deletion could not verify uploaded files.' }, 500)
    }

    try {
      const avatarPaths = await listStorageObjects(admin, userId, 'avatars')
      await removeStorageObjects(admin, storagePaths)
      await removeStorageObjects(admin, avatarPaths, 'avatars')
    } catch (reason) {
      console.error('DELETE_ACCOUNT_STORAGE_CLEANUP_FAILED', {
        userId,
        message: reason instanceof Error ? reason.message : String(reason),
      })
      return json({ error: 'File cleanup did not finish. Your account remains available so you can retry deletion.' }, 500)
    }

    if (existingJob.data?.stage !== 'auth_deleted') {
      const { error: deletionError } = await admin.auth.admin.deleteUser(userId, false)
      // Reconcile a crash after auth deletion but before the journal update.
      if (deletionError && !(serviceRetry && deletionError.code === 'user_not_found')) {
        console.error('DELETE_ACCOUNT_AUTH_FAILED', { userId, message: deletionError.message })
        return json({ error: 'Account deletion could not finish. Please try again.' }, 500)
      }
      const update = await admin.from('account_deletion_jobs').update({ stage: 'auth_deleted' }).eq('user_id', userId)
      if (update.error) return json({ error: 'Deletion cleanup is queued for reconciliation.' }, 503)
    }

    const [
      profileResult,
      plansResult,
      learningSubmissionsResult,
      learningProgressResult,
      learningFilesResult,
      supportThreadsResult,
      supportMessagesResult,
      leadsResult,
    ] = await Promise.all([
      admin.from('student_profiles').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
      admin.from('saved_plans').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
      admin.from('learning_submissions').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
      admin.from('learning_progress').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
      submissionIds.length > 0
        ? admin
          .from('learning_submission_files')
          .select('submission_id', { count: 'exact', head: true })
          .in('submission_id', submissionIds)
        : Promise.resolve({ count: 0, error: null }),
      admin.from('support_threads').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
      supportThreadIds.length > 0
        ? admin
          .from('support_messages')
          .select('thread_id', { count: 'exact', head: true })
          .in('thread_id', supportThreadIds)
        : Promise.resolve({ count: 0, error: null }),
      // Academy handoff requests. These cascade on the auth user, but the
      // cascade is only proven by counting here — this list is hand-maintained
      // and a table missing from it is a table nobody notices was left behind.
      admin.from('leads').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    ])
    if (
      profileResult.error
      || plansResult.error
      || learningSubmissionsResult.error
      || learningProgressResult.error
      || learningFilesResult.error
      || supportThreadsResult.error
      || supportMessagesResult.error
      || leadsResult.error
    ) {
      console.error('DELETE_ACCOUNT_CASCADE_CHECK_FAILED', {
        userId,
        profileError: profileResult.error?.message,
        plansError: plansResult.error?.message,
        submissionsError: learningSubmissionsResult.error?.message,
        progressError: learningProgressResult.error?.message,
        filesError: learningFilesResult.error?.message,
        supportThreadsError: supportThreadsResult.error?.message,
        supportMessagesError: supportMessagesResult.error?.message,
        leadsError: leadsResult.error?.message,
      })
      return json({ error: 'The account was deleted, but cleanup could not be verified.' }, 500)
    }

    let remainingStorageObjects: string[]
    try {
      remainingStorageObjects = [
        ...await listStorageObjects(admin, userId),
        ...await listStorageObjects(admin, userId, 'avatars'),
      ]
    } catch (reason) {
      console.error('DELETE_ACCOUNT_STORAGE_CHECK_FAILED', {
        userId,
        message: reason instanceof Error ? reason.message : String(reason),
      })
      return json({ error: 'The account was deleted, but uploaded-file cleanup could not be verified.' }, 500)
    }

    const orphanedRows = (
      (profileResult.count ?? 0)
      + (plansResult.count ?? 0)
      + (learningSubmissionsResult.count ?? 0)
      + (learningProgressResult.count ?? 0)
      + (learningFilesResult.count ?? 0)
      + (supportThreadsResult.count ?? 0)
      + (supportMessagesResult.count ?? 0)
      + (leadsResult.count ?? 0)
    )
    const orphanedObjects = remainingStorageObjects.length
    if (orphanedRows !== 0) {
      console.error('DELETE_ACCOUNT_ORPHANS_FOUND', { userId, orphanedRows })
      return json({ error: 'The account was deleted, but cleanup could not be verified.' }, 500)
    }
    if (orphanedObjects !== 0) {
      console.error('DELETE_ACCOUNT_STORAGE_ORPHANS_FOUND', { userId, orphanedObjects })
      return json({ error: 'The account was deleted, but uploaded-file cleanup could not be verified.' }, 500)
    }

    const finished = await admin.from('account_deletion_jobs').update({ stage: 'finished', finished_at: new Date().toISOString() }).eq('user_id', userId)
    if (finished.error) return json({ error: 'Deletion verification is queued for reconciliation.' }, 503)
    return json({ deleted: true, orphanedRows, orphanedObjects })
  },
}
