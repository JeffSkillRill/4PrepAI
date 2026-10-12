import 'jsr:@supabase/functions-js@2.117.3/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.117.2'
import { callerKey, corsHeaders, json } from '../_shared/caller.ts'
import { validLeadBody } from './validation.ts'

export default { async fetch(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  const url = Deno.env.get('SUPABASE_URL')
  const anon = Deno.env.get('SUPABASE_ANON_KEY')
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !anon || !service) return json({ error: 'Service unavailable.' }, 503)
  try {
    if (Number(request.headers.get('content-length')) > 8192) return json({ error: 'Request too large.' }, 413)
    const raw = await request.text()
    if (raw.length > 8192) return json({ error: 'Request too large.' }, 413)
    const body = JSON.parse(raw)
    if (!validLeadBody(body)) return json({ error: 'Invalid request.' }, 400)
    let userId: string | null = null
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (token && token !== anon) {
      const { data, error } = await createClient(url, anon, { auth: { persistSession: false } }).auth.getUser(token)
      if (error || !data.user) return json({ error: 'Please sign in again.' }, 401)
      userId = data.user.id
    }
    const key = await callerKey(request, service, userId)
    const database = createClient(url, service, { auth: { persistSession: false } })
    const { data, error } = await database.rpc('submit_lead_for_caller', {
      p_lead_id: body.p_lead_id, p_name: body.p_name, p_contact: body.p_contact,
      p_source: body.p_source, p_note: body.p_note ?? null, p_context_ref: body.p_context_ref ?? null,
      p_user_id: userId, p_caller_key: key,
    })
    if (error) return json({ error: 'The request could not be accepted.' }, error.code === '22023' ? 400 : error.code === '42501' ? 403 : 503)
    return json(data?.[0] ?? { error: 'No confirmation.' }, data?.[0] ? 200 : 503)
  } catch {
    return json({ error: 'The request could not be accepted. Please try again.' }, 400)
  }
} }
