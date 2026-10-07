// Shared k6 library: endpoints, virtual-student journeys, token refresh, write ledger.
// Every request is tagged {name, kind} so thresholds and the report can split
// catalogue / small reads / writes / edge functions.
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Counter, Trend } from 'k6/metrics'
import { randomBytes } from 'k6/crypto'
import exec from 'k6/execution'

export const URL = __ENV.QA_SUPABASE_URL
export const ANON = __ENV.QA_SUPABASE_ANON_KEY
export const APP_URL = __ENV.QA_APP_URL || 'https://4-prep-ai2.vercel.app'
const REST = `${URL}/rest/v1`

// Mirrors app/src/data/repository.ts (copied, not imported): lists use the slim
// programme columns; the profile page requests programme outcomes too.
const selectFor = (programColumns) => 'id,name,city,state,country,flag,tagline,description,photo_seed,highlights,source_id,'
  + 'university_facts(kind,value,numeric_value,currency,amount_period,source_id,unknown_reason,suggested_action),'
  + 'requirements(kind,value,numeric_value,benchmark,source_id,unknown_reason,suggested_action),'
  + `university_scorecard_programs(${programColumns}),`
  + 'university_scholarships(scholarships(id,name,amount_value,amount_numeric,currency,amount_period,amount_source_id,amount_unknown_reason,amount_suggested_action,award_conditions(kind,minimum,published_text,source_id))),'
  + 'rankings(id,label,rank_display,year,source_id),campuses(id,name,city,country,source_id)'
const CATALOGUE_SELECT = selectFor('cip_code,credential_level,credential_title,title,source_id')
const PROFILE_SELECT = selectFor('cip_code,credential_level,credential_title,title,awards_ipeds1,awards_ipeds2,median_earnings_4yr,median_earnings_4yr_national,median_debt,median_monthly_payment,source_id')

export const writesAcked = new Counter('qa_writes_acked')
export const writesFailed = new Counter('qa_writes_failed')
export const coldStart = new Trend('qa_cold_start_ms', true)
export const aiCalls = new Counter('qa_ai_calls_possible')

// Seeded users (no passwords). Empty array when not seeded: authenticated journeys are skipped.
export const USERS = (() => {
  try { return JSON.parse(open('../.state/k6-users.json')) } catch { return [] }
})()
export const PRIMED = (() => {
  try { return JSON.parse(open('../.state/primed-questions.json')) } catch { return [] }
})()

export function uuidv4() {
  const b = new Uint8Array(randomBytes(16))
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

function headers(token, extra = {}) {
  return {
    apikey: ANON,
    Authorization: `Bearer ${token || ANON}`,
    'Accept-Encoding': 'gzip, deflate, br',
    'Content-Type': 'application/json',
    ...extra,
  }
}

const think = (min, max) => sleep(min + Math.random() * (max - min))

// ---------- per-VU session (one seeded user per VU, round-robin) -------------
let session = null
export function vuUser() {
  if (!USERS.length) return null
  if (!session) {
    const base = USERS[(exec.vu.idInTest - 1) % USERS.length]
    session = { ...base }
  }
  // Refresh 3–8 min before expiry, jittered so VUs don't stampede the 150/5 min limit.
  const now = Date.now() / 1000
  if (session.expires_at && session.expires_at - now < 180 + Math.random() * 300) {
    const res = http.post(`${URL}/auth/v1/token?grant_type=refresh_token`,
      JSON.stringify({ refresh_token: session.refresh_token }),
      { headers: headers(null), tags: { name: 'auth_refresh', kind: 'auth' } })
    if (check(res, { 'token refreshed': (r) => r.status === 200 })) {
      const body = res.json()
      session.access_token = body.access_token
      session.refresh_token = body.refresh_token
      session.expires_at = body.expires_at
    }
  }
  return session
}

export function ledger(entry) {
  // Captured with `k6 run --console-output=results/ledger/<scenario>.jsonl`.
  console.log(JSON.stringify({ ledger: 1, at: Date.now(), vu: exec.vu.idInTest, iter: exec.vu.iterationInScenario, ...entry }))
}

// ---------- endpoints ---------------------------------------------------------
export function shell() {
  // Static app shell; browsers cache the hashed assets, so only once per VU.
  const res = http.get(`${APP_URL}/universities`, { headers: { 'Accept-Encoding': 'gzip, br' }, tags: { name: 'app_shell', kind: 'static' } })
  check(res, { 'shell 200': (r) => r.status === 200 })
}

export function sources(token) {
  const res = http.get(`${REST}/sources?select=id,name,url,retrieved_at,verification&order=id`,
    { headers: headers(token), tags: { name: 'sources', kind: 'read' } })
  check(res, { 'sources 200': (r) => r.status === 200 })
}

// The app caches the catalogue and sources for 5 minutes per tab (repository.ts
// PUBLIC_CACHE_TTL_MS), so a VU only re-downloads after that window.
let catalogueFetchedAt = 0
export function catalogue(token) {
  if (Date.now() - catalogueFetchedAt < 5 * 60_000) return null
  const res = http.get(`${REST}/universities?select=${encodeURIComponent(CATALOGUE_SELECT)}&order=name`,
    { headers: headers(token), tags: { name: 'catalogue', kind: 'catalogue' }, timeout: '60s' })
  check(res, { 'catalogue 200': (r) => r.status === 200 })
  sources(token)
  if (res.status === 200) catalogueFetchedAt = Date.now()
  return res
}

export function universityProfile(token, id) {
  const res = http.get(`${REST}/universities?select=${encodeURIComponent(PROFILE_SELECT)}&id=eq.${encodeURIComponent(id)}`,
    { headers: headers(token, { Accept: 'application/vnd.pgrst.object+json' }), tags: { name: 'university', kind: 'read' } })
  check(res, { 'university 200': (r) => r.status === 200 })
}

export function profileRationale(token, id, field) {
  // Deterministic path of the counselor function: no Perplexity, no rate limiter.
  const res = http.post(`${URL}/functions/v1/counselor`,
    JSON.stringify({ mode: 'profile_rationale', universityId: id, profile: { field }, fit: { label: 'Promising fit' } }),
    { headers: headers(token), tags: { name: 'fn_profile_rationale', kind: 'edge' } })
  check(res, { 'rationale 200': (r) => r.status === 200 })
}

export function restorePrivate(user) {
  const a = http.get(`${REST}/student_profiles?select=*&user_id=eq.${user.id}`, { headers: headers(user.access_token), tags: { name: 'profile_read', kind: 'read' } })
  const b = http.get(`${REST}/saved_plans?select=university_id&user_id=eq.${user.id}&order=created_at`, { headers: headers(user.access_token), tags: { name: 'saved_read', kind: 'read' } })
  check(a, { 'profile read 200': (r) => r.status === 200 })
  check(b, { 'saved read 200': (r) => r.status === 200 })
}

function recordWrite(res, entry, okStatuses) {
  const ok = okStatuses.includes(res.status)
  if (ok) writesAcked.add(1); else writesFailed.add(1)
  ledger({ ...entry, status: res.status, acked: ok, durMs: Math.round(res.timings.duration) })
  return ok
}

export function saveUniversity(user, universityId) {
  const res = http.post(`${REST}/saved_plans?on_conflict=user_id,university_id`,
    JSON.stringify({ user_id: user.id, university_id: universityId }),
    { headers: headers(user.access_token, { Prefer: 'resolution=ignore-duplicates,return=minimal' }), tags: { name: 'save', kind: 'write' } })
  return recordWrite(res, { op: 'save', user: user.id, key: universityId }, [200, 201, 204])
}

export function unsaveUniversity(user, universityId) {
  const res = http.del(`${REST}/saved_plans?user_id=eq.${user.id}&university_id=eq.${encodeURIComponent(universityId)}`, null,
    { headers: headers(user.access_token, { Prefer: 'return=minimal' }), tags: { name: 'unsave', kind: 'write' } })
  return recordWrite(res, { op: 'unsave', user: user.id, key: universityId }, [200, 204])
}

export function saveProfile(user, marker) {
  // academic_score carries a per-write marker so reconciliation can detect stale overwrites.
  const res = http.post(`${REST}/student_profiles?on_conflict=user_id`, JSON.stringify({
    user_id: user.id, country: 'United States', field: 'Computer Science', academic_score: marker,
    budget_max: 40000, budget_currency: 'USD', language_test: 'ielts', language_score: 7,
    admission_test: 'sat', admission_test_score: 1400, gpa: 3.7, needs_language_pathway: false,
    intake: 'Fall 2027', consented_at: new Date().toISOString(),
  }), { headers: headers(user.access_token, { Prefer: 'resolution=merge-duplicates,return=minimal' }), tags: { name: 'profile_upsert', kind: 'write' } })
  return recordWrite(res, { op: 'profile', user: user.id, value: marker }, [200, 201, 204])
}

export function completeLesson(user, lessonId) {
  const res = http.post(`${REST}/learning_progress?on_conflict=user_id,lesson_id`,
    JSON.stringify({ user_id: user.id, lesson_id: lessonId }),
    { headers: headers(user.access_token, { Prefer: 'resolution=ignore-duplicates,return=minimal' }), tags: { name: 'lesson_complete', kind: 'write' } })
  return recordWrite(res, { op: 'lesson', user: user.id, key: lessonId }, [200, 201, 204])
}

export function learningReads(user) {
  const a = http.get(`${REST}/learning_progress?select=lesson_id,completed_at&user_id=eq.${user.id}`, { headers: headers(user.access_token), tags: { name: 'learning_progress', kind: 'read' } })
  const b = http.get(`${REST}/learning_submissions?select=id,status&user_id=eq.${user.id}`, { headers: headers(user.access_token), tags: { name: 'learning_submissions', kind: 'read' } })
  check(a, { 'progress 200': (r) => r.status === 200 })
  check(b, { 'submissions 200': (r) => r.status === 200 })
}

export function supportPoll(user) {
  const t = http.get(`${REST}/support_threads?select=id,user_id,last_message_at,last_sender_role&user_id=eq.${user.id}`,
    { headers: headers(user.access_token), tags: { name: 'support_thread', kind: 'read' } })
  check(t, { 'thread 200': (r) => r.status === 200 })
  const thread = t.status === 200 ? t.json()[0] : null
  if (!thread) return
  const m = http.get(`${REST}/support_messages?select=id,thread_id,sender_role,sender_user_id,body,created_at&thread_id=eq.${thread.id}&order=created_at.asc,id.asc`,
    { headers: headers(user.access_token), tags: { name: 'support_messages', kind: 'read' } })
  check(m, { 'messages 200': (r) => r.status === 200 })
}

export function supportSend(user, seq, messageId = uuidv4()) {
  const res = http.post(`${REST}/rpc/send_support_message`,
    JSON.stringify({ p_message_id: messageId, p_body: `[qa_load] vu${exec.vu.idInTest} seq${seq}` }),
    { headers: headers(user.access_token), tags: { name: 'support_send', kind: 'write' } })
  const row = res.status === 200 ? (res.json() || [])[0] : null
  const status = row?.status ?? 'error'
  ledger({ op: 'support', user: user.id, key: messageId, seq, status: res.status, outcome: status, retryAfter: row?.retry_after_seconds ?? null, acked: status === 'sent', durMs: Math.round(res.timings.duration) })
  if (status === 'sent') writesAcked.add(1)
  else if (status !== 'rate_limited') writesFailed.add(1)
  return { status, retryAfter: Number(row?.retry_after_seconds) || 0, messageId }
}

export function counselor(token, message, name = 'fn_counselor') {
  const res = http.post(`${URL}/functions/v1/counselor`, JSON.stringify({ message }),
    { headers: headers(token), tags: { name, kind: 'edge' }, timeout: '40s',
      responseCallback: http.expectedStatuses(200, 429) })
  return res
}

// ---------- setup helpers ----------------------------------------------------
export function setupIds() {
  const unis = http.get(`${REST}/universities?select=id&order=name`, { headers: headers(null), tags: { name: 'setup', kind: 'setup' } })
  const universityIds = unis.status === 200 ? unis.json().map((row) => row.id) : []
  let lessonIds = []
  if (USERS.length) {
    const lessons = http.get(`${REST}/learning_lessons?select=id`, { headers: headers(USERS[0].access_token), tags: { name: 'setup', kind: 'setup' } })
    lessonIds = lessons.status === 200 ? lessons.json().map((row) => row.id) : []
  }
  if (!universityIds.length) throw new Error(`setup: could not list universities (HTTP ${unis.status})`)
  return { universityIds, lessonIds }
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// ---------- journeys ------------------------------------------------------------
let shellLoaded = false
export function journeyBrowse(data) {
  if (!shellLoaded) { shell(); shellLoaded = true }
  const started = Date.now()
  catalogue(null)
  coldStart.add(Date.now() - started)
  think(5, 20)
  universityProfile(null, pick(data.universityIds)); think(10, 30)
  universityProfile(null, pick(data.universityIds)); think(30, 90)
}

export function journeyStudent(data, { lite = false } = {}) {
  const user = vuUser()
  if (!user) return journeyBrowse(data)
  if (!shellLoaded) { shell(); shellLoaded = true }
  const started = Date.now()
  restorePrivate(user)
  catalogue(user.access_token) // Dashboard → getRankedPathway → listUniversities
  coldStart.add(Date.now() - started)
  think(10, 30)
  const a = pick(data.universityIds); const b = pick(data.universityIds)
  universityProfile(user.access_token, a); profileRationale(user.access_token, a, 'Computer Science'); think(10, 30)
  saveUniversity(user, a); think(2, 8)
  if (!lite) {
    universityProfile(user.access_token, b); profileRationale(user.access_token, b, 'Computer Science'); think(10, 30)
    saveUniversity(user, b); think(2, 8)
    unsaveUniversity(user, a); think(5, 15)
    learningReads(user)
    if (data.lessonIds.length) completeLesson(user, pick(data.lessonIds))
  }
  think(30, 90)
}

export function journeySupport(data) {
  const user = vuUser()
  if (!user) return journeyBrowse(data)
  journeyStudent(data, { lite: true })
  // ~5 min on the support page: poll every 15 s, one message.
  for (let i = 0; i < 20; i += 1) {
    supportPoll(user)
    if (i === 3) supportSend(user, exec.vu.iterationInScenario)
    sleep(15)
  }
}

export function journeyCounselor(data) {
  const user = vuUser()
  // Only primed (cached) questions: zero Perplexity calls. Without a primed bank, browse instead.
  if (!user || !PRIMED.length) return journeyBrowse(data)
  const res = counselor(user.access_token, pick(PRIMED), 'fn_counselor_cached')
  check(res, { 'counselor cached 200/429': (r) => r.status === 200 || r.status === 429 })
  think(60, 240)
}

export function mixedJourney(data) {
  // §1 mix: 30% browse, 55% student, 10% support, 5% counselor (by VU id, stable per VU).
  const slot = exec.vu.idInTest % 20
  if (slot < 6) return journeyBrowse(data)
  if (slot < 17) return journeyStudent(data)
  if (slot < 19) return journeySupport(data)
  return journeyCounselor(data)
}

// ---------- thresholds ---------------------------------------------------------
export function thresholds({ egressBytes, catalogueP95 = 2500, abortOnBreak = true }) {
  return {
    'http_req_duration{kind:read}': ['p(95)<800'],
    'http_req_duration{kind:catalogue}': [`p(95)<${catalogueP95}`],
    'http_req_duration{kind:write}': ['p(95)<1500'],
    http_req_failed: [
      'rate<0.01',
      { threshold: 'rate<0.05', abortOnFail: abortOnBreak, delayAbortEval: '30s' },
    ],
    // Egress guard: on-wire bytes. Aborts the run at the scenario's allowance.
    data_received: [{ threshold: `count<${egressBytes}`, abortOnFail: true }],
    qa_writes_failed: ['count<1'],
  }
}

export const GB = 1024 ** 3
