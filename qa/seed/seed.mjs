// Seed: create qa_load_NNNN@test.local users through the Admin API (no email is
// sent), give each a valid student profile, then mint sessions at a pace that
// stays under Supabase Auth's 30 sign-ins / 5 min / IP limit.
//
//   npm run seed                 create users + profiles + sessions
//   npm run seed -- --tokens     only re-mint/refresh sessions for existing users
import { randomBytes } from 'node:crypto'
import {
  adminClient, anonClient, qaEmail, readState, sleep, target, writeResult, writeState,
} from '../lib/target.mjs'

const t = target({ needsServiceRole: true })
const admin = adminClient(t)
const count = Number(process.env.QA_USER_COUNT ?? 120)
const tokensOnly = process.argv.includes('--tokens')
// 30 per 5 min ⇒ one per 10 s, plus margin.
const SIGN_IN_SPACING_MS = 10_500
const fields = ['Computer Science', 'Engineering', 'Business & Management', 'Biology', 'Economics']

function profileFor(n) {
  // Deterministic, inside every check constraint in …0002 and …0019.
  return {
    country: 'United States',
    field: fields[n % fields.length],
    academic_score: 60 + (n % 40),
    budget_max: 20000 + (n % 8) * 5000,
    budget_currency: 'USD',
    language_test: 'ielts',
    language_score: 6 + (n % 4) * 0.5,
    admission_test: 'sat',
    admission_test_score: 1100 + (n % 50) * 10,
    gpa: Math.round((3 + (n % 10) / 10) * 10) / 10,
    needs_language_pathway: false,
    intake: 'Fall 2027',
    consented_at: new Date().toISOString(),
  }
}

const users = readState('users.json', [])
const byEmail = new Map(users.map((user) => [user.email, user]))
const report = { startedAt: new Date().toISOString(), created: 0, existing: 0, profiles: 0, sessions: 0, errors: [] }

if (!tokensOnly) {
  for (let n = 1; n <= count; n += 1) {
    const email = qaEmail(n)
    if (byEmail.has(email)) { report.existing += 1; continue }
    const password = randomBytes(18).toString('base64url')
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { qa_load: true, full_name: `QA Load ${n}` },
    })
    if (error) { report.errors.push({ email, step: 'createUser', message: error.message }); continue }
    const user = { n, email, password, id: data.user.id }
    users.push(user); byEmail.set(email, user)
    writeState('users.json', users)
    report.created += 1
    const { error: profileError } = await admin.from('student_profiles').upsert({ user_id: user.id, ...profileFor(n) })
    if (profileError) report.errors.push({ email, step: 'profile', message: profileError.message })
    else report.profiles += 1
  }
}

// Mint sessions. Existing refresh tokens are rotated first (separate, looser limit).
const sessions = readState('sessions.json', {})
for (const user of users) {
  const client = anonClient(t)
  const previous = sessions[user.id]
  let session = null
  if (previous?.refresh_token) {
    const { data } = await client.auth.refreshSession({ refresh_token: previous.refresh_token })
    session = data.session
  }
  if (!session) {
    const { data, error } = await client.auth.signInWithPassword({ email: user.email, password: user.password })
    if (error) { report.errors.push({ email: user.email, step: 'signIn', message: error.message }); await sleep(SIGN_IN_SPACING_MS); continue }
    session = data.session
    await sleep(SIGN_IN_SPACING_MS)
  }
  sessions[user.id] = {
    access_token: session.access_token, refresh_token: session.refresh_token, expires_at: session.expires_at,
  }
  writeState('sessions.json', sessions)
  report.sessions += 1
  if (report.sessions % 10 === 0) console.log(`sessions ${report.sessions}/${users.length}`)
}

// k6 reads this (no passwords in it).
writeState('k6-users.json', users.map((user) => ({ id: user.id, n: user.n, ...sessions[user.id] })).filter((user) => user.access_token))
report.finishedAt = new Date().toISOString()
writeResult('seed', report)
console.log(JSON.stringify(report, null, 2))
