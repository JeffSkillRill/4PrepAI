import 'jsr:@supabase/functions-js@2.117.3/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.117.2'
import { isOperationalEvent } from '../_shared/operational-events.ts'
import { callerKey, corsHeaders, json } from '../_shared/caller.ts'

export default { async fetch(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  const url = Deno.env.get('SUPABASE_URL')
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !service) return json({ error: 'Service unavailable.' }, 503)
  try {
    if (Number(request.headers.get('content-length')) > 1024) return json({ error: 'Request too large.' }, 413)
    const raw = await request.text()
    if (raw.length > 1024) return json({ error: 'Request too large.' }, 413)
    const body = JSON.parse(raw)
    if (!isOperationalEvent(body?.event)) return json({ error: 'Invalid event.' }, 400)
    const key = await callerKey(request, `${service}:${new Date().toISOString().slice(0, 10)}`)
    const { error } = await createClient(url, service, { auth: { persistSession: false } }).rpc('record_operational_event', { p_event: body.event, p_caller_key: key })
    return error ? json({ error: 'Event unavailable.' }, 503) : json({ accepted: true })
  } catch {
    return json({ error: 'Invalid request.' }, 400)
  }
} }
