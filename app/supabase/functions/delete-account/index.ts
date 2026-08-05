import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
}

const submissionsBucket = 'learning-submissions'

type AdminClient = ReturnType<typeof createClient>

async function listStorageObjects(
  admin: AdminClient,
  prefix: string,
): Promise<string[]> {
  const paths: string[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const { data, error } = await admin.storage
      .from(submissionsBucket)
      .list(prefix, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      })
    if (error) throw error
    for (const item of data ?? []) {
      const path = `${prefix}/${item.name}`
      if (item.id) paths.push(path)
      else paths.push(...await listStorageObjects(admin, path))
    }
    if ((data?.length ?? 0) < limit) break
    offset += limit
  }
  return paths
}

async function removeStorageObjects(
  admin: AdminClient,
  paths: string[],
): Promise<void> {
  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await admin.storage
      .from(submissionsBucket)
      .remove(paths.slice(index, index + 100))
    if (error) throw error
  }
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
    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken)
    if (userError || !userData.user) return json({ error: 'Please sign in again.' }, 401)

    const userId = userData.user.id
    const admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

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
      storagePaths = [...new Set([
        ...listedPaths,
        ...(fileResult.data ?? []).map((row) => row.storage_path),
      ])]
    } catch (reason) {
      console.error('DELETE_ACCOUNT_STORAGE_LOOKUP_FAILED', {
        userId,
        message: reason instanceof Error ? reason.message : String(reason),
      })
      return json({ error: 'Account deletion could not verify uploaded files.' }, 500)
    }

    const { error: deletionError } = await admin.auth.admin.deleteUser(userId, false)
    if (deletionError) {
      console.error('DELETE_ACCOUNT_AUTH_FAILED', { userId, message: deletionError.message })
      return json({ error: 'Account deletion could not finish. Please try again.' }, 500)
    }

    try {
      await removeStorageObjects(admin, storagePaths)
    } catch (reason) {
      console.error('DELETE_ACCOUNT_STORAGE_CLEANUP_FAILED', {
        userId,
        message: reason instanceof Error ? reason.message : String(reason),
      })
      return json({ error: 'The account was deleted, but uploaded-file cleanup did not finish.' }, 500)
    }

    const [
      profileResult,
      plansResult,
      learningSubmissionsResult,
      learningProgressResult,
      learningFilesResult,
      supportThreadsResult,
      supportMessagesResult,
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
    ])
    if (
      profileResult.error
      || plansResult.error
      || learningSubmissionsResult.error
      || learningProgressResult.error
      || learningFilesResult.error
      || supportThreadsResult.error
      || supportMessagesResult.error
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
      })
      return json({ error: 'The account was deleted, but cleanup could not be verified.' }, 500)
    }

    let remainingStorageObjects: string[]
    try {
      remainingStorageObjects = await listStorageObjects(admin, userId)
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

    return json({ deleted: true, orphanedRows, orphanedObjects })
  },
}
