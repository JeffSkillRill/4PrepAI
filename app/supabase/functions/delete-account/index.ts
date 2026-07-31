import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

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
    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken)
    if (userError || !userData.user) return json({ error: 'Please sign in again.' }, 401)

    const userId = userData.user.id
    const admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error: deletionError } = await admin.auth.admin.deleteUser(userId, false)
    if (deletionError) {
      console.error('DELETE_ACCOUNT_AUTH_FAILED', { userId, message: deletionError.message })
      return json({ error: 'Account deletion could not finish. Please try again.' }, 500)
    }

    const [profileResult, plansResult] = await Promise.all([
      admin.from('student_profiles').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
      admin.from('saved_plans').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    ])
    if (profileResult.error || plansResult.error) {
      console.error('DELETE_ACCOUNT_CASCADE_CHECK_FAILED', {
        userId,
        profileError: profileResult.error?.message,
        plansError: plansResult.error?.message,
      })
      return json({ error: 'The account was deleted, but cleanup could not be verified.' }, 500)
    }

    const orphanedRows = (profileResult.count ?? 0) + (plansResult.count ?? 0)
    if (orphanedRows !== 0) {
      console.error('DELETE_ACCOUNT_ORPHANS_FOUND', { userId, orphanedRows })
      return json({ error: 'The account was deleted, but cleanup could not be verified.' }, 500)
    }

    return json({ deleted: true, orphanedRows })
  },
}
