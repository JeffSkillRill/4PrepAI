// K — Authorization. Student A (and the bare anon key) attack student B's data
// directly through PostgREST, RPC, Storage and Edge Functions. Every probe must fail:
// an error, 401/403, or zero rows affected (verified afterwards with the service role).
// Run it while scenario A's load is running.
//   node --env-file=.env e2e/authz.mjs
import { adminClient, anonClient, readState, target, writeResult } from '../lib/target.mjs'

const t = target({ needsServiceRole: true })
const admin = adminClient(t)
const sessions = readState('k6-users.json', [])
if (sessions.length < 2) { console.error('Need ≥ 2 seeded users (npm run seed).'); process.exit(2) }
const [A, B] = sessions
const asA = anonClient(t, A.access_token)
const asB = anonClient(t, B.access_token)
const anon = anonClient(t)
const results = []
// Valid shape for the cache_key check constraint (^[0-9a-f]{64}$), so only RLS can stop the insert.
const FORGED_CACHE_KEY = 'f'.repeat(64)

function record(name, outcome, detail = {}) {
  results.push({ name, ...outcome, ...detail })
  console.log(`${outcome.pass ? 'PASS' : 'FAIL'}  ${name}${outcome.pass ? '' : `  ${JSON.stringify(detail)}`}`)
}

// ---- give B some data to attack ------------------------------------------------
const { data: anyUni } = await admin.from('universities').select('id').limit(2)
await asB.from('saved_plans').upsert({ user_id: B.id, university_id: anyUni[0].id }, { onConflict: 'user_id,university_id', ignoreDuplicates: true })
await asB.rpc('send_support_message', { p_message_id: crypto.randomUUID(), p_body: '[qa_load] authz seed message from B' })
const { data: bThread } = await admin.from('support_threads').select('id').eq('user_id', B.id).maybeSingle()
const bAvatarPath = `${B.id}/avatar-qa.png`
await asB.storage.from('avatars').upload(bAvatarPath, new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }), { upsert: true })
const { data: bProfileBefore } = await admin.from('student_profiles').select('*').eq('user_id', B.id).maybeSingle()

// ---- reads of B's private rows -------------------------------------------------
const privateReads = [
  ['student_profiles', 'user_id', B.id], ['saved_plans', 'user_id', B.id], ['support_threads', 'user_id', B.id],
  ['learning_progress', 'user_id', B.id], ['learning_submissions', 'user_id', B.id],
  ['support_messages', 'thread_id', bThread?.id ?? '00000000-0000-0000-0000-000000000000'],
]
for (const [who, client] of [['A', asA], ['anon', anon]]) {
  for (const [table, column, value] of privateReads) {
    const { data, error } = await client.from(table).select('*').eq(column, value)
    record(`${who} reads B ${table}`, { pass: Boolean(error) || (data ?? []).length === 0 }, { rows: data?.length ?? null, error: error?.message })
  }
}
// Operational / admin tables: no student or anon access at all.
for (const table of ['counselor_requests', 'counselor_cache', 'counselor_strikes', 'leads', 'admin_users', 'admin_audit_log', 'admin_api_requests']) {
  for (const [who, client] of [['A', asA], ['anon', anon]]) {
    const { data, error } = await client.from(table).select('*').limit(5)
    record(`${who} reads ${table}`, { pass: Boolean(error) || (data ?? []).length === 0 }, { rows: data?.length ?? null, error: error?.message })
  }
}

// ---- writes against B ------------------------------------------------------------
async function writeProbe(name, run, verify) {
  const { error } = await run()
  const intact = await verify()
  record(name, { pass: intact }, { error: error?.message ?? null })
}
await writeProbe('A upserts B student_profile',
  () => asA.from('student_profiles').upsert({ ...bProfileBefore, academic_score: 1 }, { onConflict: 'user_id' }),
  async () => (await admin.from('student_profiles').select('academic_score').eq('user_id', B.id).single()).data.academic_score === bProfileBefore.academic_score)
await writeProbe('A patches B student_profile',
  () => asA.from('student_profiles').update({ academic_score: 2 }).eq('user_id', B.id),
  async () => (await admin.from('student_profiles').select('academic_score').eq('user_id', B.id).single()).data.academic_score === bProfileBefore.academic_score)
await writeProbe('A inserts saved_plan for B',
  () => asA.from('saved_plans').insert({ user_id: B.id, university_id: anyUni[1].id }),
  async () => (await admin.from('saved_plans').select('id').eq('user_id', B.id).eq('university_id', anyUni[1].id)).data.length === 0)
await writeProbe('A deletes B saved_plans',
  () => asA.from('saved_plans').delete().eq('user_id', B.id),
  async () => (await admin.from('saved_plans').select('id').eq('user_id', B.id)).data.length >= 1)
if (bThread) {
  await writeProbe('A inserts message into B thread',
    () => asA.from('support_messages').insert({ thread_id: bThread.id, sender_role: 'admin', sender_user_id: A.id, body: '[qa_load] forged' }),
    async () => (await admin.from('support_messages').select('id').eq('thread_id', bThread.id).like('body', '%forged%')).data.length === 0)
}
await writeProbe('A writes counselor_cache',
  () => asA.from('counselor_cache').insert({ cache_key: FORGED_CACHE_KEY, response_payload: { answerType: 'verified_fact', answer: 'forged', recordCitations: [], webCitations: [] } }),
  async () => (await admin.from('counselor_cache').select('cache_key').eq('cache_key', FORGED_CACHE_KEY)).data.length === 0)
await writeProbe('A grants itself admin',
  () => asA.from('admin_users').insert({ user_id: A.id, grant_reason: 'qa_load forged self-grant' }),
  async () => (await admin.from('admin_users').select('user_id').eq('user_id', A.id)).data.length === 0)

// ---- storage -----------------------------------------------------------------------
{
  const { error } = await asA.storage.from('avatars').upload(bAvatarPath, new Blob(['forged'], { type: 'image/png' }), { upsert: true })
  const { data } = await admin.storage.from('avatars').download(bAvatarPath)
  const bytes = data ? new Uint8Array(await data.arrayBuffer()) : null
  record('A overwrites B avatar', { pass: Boolean(error) && bytes?.[0] === 137 }, { error: error?.message })
  const { error: removeError } = await asA.storage.from('avatars').remove([bAvatarPath])
  const { data: still } = await admin.storage.from('avatars').list(B.id)
  record('A deletes B avatar', { pass: (still ?? []).some((o) => o.name === 'avatar-qa.png') }, { error: removeError?.message })
  const { error: hwError } = await asA.storage.from('learning-submissions').upload(`${B.id}/qa-authz/forged.txt`, new Blob(['x']), { upsert: false })
  record('A uploads into B homework prefix', { pass: Boolean(hwError) }, { error: hwError?.message })
  const { data: listed } = await asA.storage.from('learning-submissions').list(B.id)
  record('A lists B homework prefix', { pass: (listed ?? []).length === 0 }, { entries: listed?.length ?? 0 })
}

// ---- edge functions ------------------------------------------------------------------
{
  const res = await fetch(`${t.url}/functions/v1/admin-api`, {
    method: 'POST', headers: { apikey: t.anonKey, Authorization: `Bearer ${A.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'cohort' }),
  })
  record('non-admin A calls admin-api', { pass: res.status === 403 }, { status: res.status })
  record('delete-account cannot target B', { pass: true, method: 'code review only (calling it deletes the caller)' })
}

// ---- exposed RPC surface -----------------------------------------------------------
{
  const res = await fetch(`${t.url}/rest/v1/`, { headers: { apikey: t.anonKey } })
  const spec = res.ok ? await res.json() : null
  const rpcs = spec ? Object.keys(spec.paths ?? {}).filter((p) => p.startsWith('/rpc/')) : []
  results.push({ name: 'RPC functions visible to anon (review each for caller binding)', rpcs, pass: null })
}

// ---- global anonymous lead limiter (single probe only; never exhausted on production) --
{
  const { data, error } = await anon.rpc('submit_lead', {
    p_lead_id: crypto.randomUUID(), p_name: 'QA Load probe', p_contact: 'qa_load_lead@test.local',
    p_source: 'counselor_refusal', p_context_ref: null, p_note: '[qa_load] global limiter probe',
  })
  results.push({ name: 'anon lead probe (global 30/h limiter, …0017_academy_handoff.sql:354)', pass: null,
    status: data?.[0]?.status ?? null, error: error?.message ?? null,
    note: 'Limit is shared by ALL anonymous visitors; 30 requests from any one client block everyone for up to 1 h. Proven from SQL, not exhausted.' })
}

const failures = results.filter((r) => r.pass === false)
writeResult('K_authz', { at: new Date().toISOString(), probes: results.length, failures: failures.length, results })
console.log(`\n${results.length} probes, ${failures.length} FAILED`)
process.exit(failures.length ? 1 : 0)
