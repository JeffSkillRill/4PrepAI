import 'jsr:@supabase/functions-js@2.117.3/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.117.2'
import { json } from '../_shared/caller.ts'
import { buildOperationsEmail } from './message.ts'

export default { async fetch(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  const token = Deno.env.get('LAUNCH_OPS_TOKEN')
  if (!token || request.headers.get('authorization') !== `Bearer ${token}`) return json({ error: 'Unauthorized.' }, 401)
  const url = Deno.env.get('SUPABASE_URL')
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !service) return json({ error: 'Service unavailable.' }, 503)
  const database = createClient(url, service, { auth: { persistSession: false } })
  try {
    // Reconcile confirmed partial deletions independently of the student's session.
    const jobs = await database.from('account_deletion_jobs').select('user_id').neq('stage', 'finished').order('created_at').limit(3)
    if (jobs.error) throw new Error('DELETION_QUEUE_UNAVAILABLE')
    for (const job of jobs.data ?? []) {
      const retry = await fetch(`${url}/functions/v1/delete-account`, {
        method: 'POST', headers: { authorization: `Bearer ${service}`, apikey: service, 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'delete-my-account', userId: job.user_id }),
        signal: AbortSignal.timeout(20_000),
      })
      if (!retry.ok) console.error('DELETION_RECONCILIATION_PENDING')
    }
    const { data, error } = await database.rpc('launch_ops_snapshot')
    if (error) throw new Error('OPERATIONS_SNAPSHOT_UNAVAILABLE')
    const apiKey = Deno.env.get('RESEND_API_KEY')
    const from = Deno.env.get('ALERT_EMAIL_FROM')
    const to = Deno.env.get('ALERT_EMAIL_TO')
    if (!apiKey || !from || !to) return json({ error: 'Email alerts are not configured.', snapshot: data }, 503)
    const healthUrl = Deno.env.get('APP_HEALTH_URL')
    let health = 'not configured'
    if (healthUrl?.startsWith('https://')) {
      try {
        const response = await fetch(healthUrl, { signal: AbortSignal.timeout(10_000), redirect: 'error' })
        health = response.ok ? 'reachable' : `HTTP ${response.status}`
      } catch { health = 'unreachable' }
    }
    const period = new Date().toISOString().slice(0, 13)
    const message = buildOperationsEmail(data, health, period)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10_000),
      headers: { authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `4prep-ops-${period}` },
      body: JSON.stringify({ from, to: [to], ...message }),
    })
    if (!response.ok) throw new Error('OPERATIONS_EMAIL_FAILED')
    return json({ sent: true })
  } catch {
    console.error('LAUNCH_OPERATIONS_FAILED')
    return json({ error: 'Operations check did not finish.' }, 503)
  }
} }
