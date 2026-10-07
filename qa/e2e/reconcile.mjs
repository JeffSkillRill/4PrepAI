// G — Data integrity reconciliation. Replays every write each virtual student sent
// (results/ledger/*.jsonl, in send order) and compares the expected final state
// with what the database actually stores. Service role, read-only, qa_load_ users only.
//
// Classifications:
//   LOST       acknowledged write missing from the DB            → CRITICAL
//   STALE      DB holds an older acknowledged value (out of order) → CRITICAL
//   DUPLICATE  one logical write stored more than once           → HIGH
//   PHANTOM    unacknowledged write that was applied (UI said it failed) → MEDIUM
//   AMBIGUOUS  last op unacknowledged/concurrent; either state acceptable
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { adminClient, QA_ROOT, readState, target, writeResult } from '../lib/target.mjs'

const t = target({ needsServiceRole: true })
const admin = adminClient(t)
const users = new Set(readState('users.json', []).map((user) => user.id))

const dir = join(QA_ROOT, 'results', 'ledger')
const entries = []
for (const file of readdirSync(dir).filter((name) => name.endsWith('.jsonl'))) {
  for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
    const start = line.indexOf('{"ledger":1')
    if (start < 0) continue
    try { entries.push({ ...JSON.parse(line.slice(start)), scenario: file.replace('.jsonl', '') }) } catch { /* partial line */ }
  }
}
entries.sort((a, b) => a.at - b.at)
const findings = []
const add = (severity, kind, detail) => findings.push({ severity, kind, ...detail })

async function fetchIn(table, select, column, ids) {
  const rows = []
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await admin.from(table).select(select).in(column, ids.slice(i, i + 100))
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...data)
  }
  return rows
}

const userIds = [...users]
// ---- saved_plans ------------------------------------------------------------
{
  const expected = new Map() // user|uni -> { state, acked, concurrent }
  const lastVu = new Map()
  for (const e of entries.filter((x) => x.op === 'save' || x.op === 'unsave')) {
    const key = `${e.user}|${e.key}`
    const prev = expected.get(key)
    const concurrent = lastVu.has(key) && lastVu.get(key).vu !== e.vu && e.at - lastVu.get(key).at < 2000
    lastVu.set(key, e)
    if (e.acked) expected.set(key, { state: e.op === 'save', acked: true, concurrent, at: e.at, scenario: e.scenario })
    else expected.set(key, { state: prev?.state ?? false, acked: false, alt: e.op === 'save', concurrent, at: e.at, scenario: e.scenario })
  }
  const stored = new Set((await fetchIn('saved_plans', 'user_id,university_id', 'user_id', userIds)).map((r) => `${r.user_id}|${r.university_id}`))
  let checked = 0
  for (const [key, exp] of expected) {
    checked += 1
    const present = stored.has(key)
    if (present === exp.state) continue
    if (!exp.acked && present === exp.alt) { add('MEDIUM', 'PHANTOM', { table: 'saved_plans', key, scenario: exp.scenario }); continue }
    if (exp.concurrent) { add('INFO', 'AMBIGUOUS', { table: 'saved_plans', key, expected: exp.state, present }); continue }
    add('CRITICAL', exp.state ? 'LOST' : 'RESURRECTED', { table: 'saved_plans', key, expected: exp.state, present, scenario: exp.scenario, at: new Date(exp.at).toISOString() })
  }
  findings.push({ severity: 'INFO', kind: 'CHECKED', table: 'saved_plans', keys: checked })
}

// ---- student_profiles (academic_score carries the write marker) ---------------
{
  const last = new Map()
  for (const e of entries.filter((x) => x.op === 'profile')) {
    const prev = last.get(e.user)
    last.set(e.user, { acked: e.acked ? e : prev?.acked ?? null, tail: e })
  }
  const rows = await fetchIn('student_profiles', 'user_id,academic_score', 'user_id', [...last.keys()])
  const stored = new Map(rows.map((r) => [r.user_id, Number(r.academic_score)]))
  for (const [user, { acked, tail }] of last) {
    if (!stored.has(user)) { add('CRITICAL', 'LOST', { table: 'student_profiles', user }); continue }
    const value = stored.get(user)
    if (acked && value === acked.value) continue
    if (!tail.acked && value === tail.value) { add('MEDIUM', 'PHANTOM', { table: 'student_profiles', user, value }); continue }
    add('CRITICAL', 'STALE', { table: 'student_profiles', user, expected: acked?.value, stored: value, lastAckAt: acked && new Date(acked.at).toISOString() })
  }
  findings.push({ severity: 'INFO', kind: 'CHECKED', table: 'student_profiles', users: last.size })
}

// ---- support_messages: exactly once, in send order ----------------------------
{
  const sends = entries.filter((x) => x.op === 'support')
  const ackedIds = new Set(sends.filter((s) => s.outcome === 'sent').map((s) => s.key))
  const attemptedIds = new Set(sends.map((s) => s.key))
  const threads = await fetchIn('support_threads', 'id,user_id', 'user_id', userIds)
  const messages = threads.length
    ? await fetchIn('support_messages', 'id,thread_id,body,created_at,sender_role', 'thread_id', threads.map((th) => th.id))
    : []
  const qaMessages = messages.filter((m) => m.sender_role === 'student' && m.body.startsWith('[qa_load]'))
  const storedIds = new Set(qaMessages.map((m) => m.id))
  for (const id of ackedIds) if (!storedIds.has(id)) add('CRITICAL', 'LOST', { table: 'support_messages', id })
  for (const m of qaMessages) if (!attemptedIds.has(m.id)) add('HIGH', 'UNKNOWN_ROW', { table: 'support_messages', id: m.id, body: m.body })
  const byBody = new Map()
  for (const m of qaMessages) byBody.set(`${m.thread_id}|${m.body}`, (byBody.get(`${m.thread_id}|${m.body}`) ?? 0) + 1)
  for (const [key, n] of byBody) if (n > 1) add('HIGH', 'DUPLICATE', { table: 'support_messages', key, copies: n })
  for (const m of qaMessages) if (!ackedIds.has(m.id) && attemptedIds.has(m.id)) add('MEDIUM', 'PHANTOM', { table: 'support_messages', id: m.id })
  // Order: per thread, seq numbers parsed from the body must be non-decreasing by created_at, per VU.
  const perThreadVu = new Map()
  for (const m of [...qaMessages].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))) {
    const match = /vu(\d+) seq(\d+)/.exec(m.body)
    if (!match) continue
    const key = `${m.thread_id}|${match[1]}`
    const seq = Number(match[2])
    if (perThreadVu.has(key) && seq < perThreadVu.get(key)) add('HIGH', 'OUT_OF_ORDER', { table: 'support_messages', id: m.id, seq, after: perThreadVu.get(key) })
    perThreadVu.set(key, seq)
  }
  findings.push({ severity: 'INFO', kind: 'CHECKED', table: 'support_messages', acked: ackedIds.size, stored: qaMessages.length,
    idempotencyRetries: sends.length - attemptedIds.size })
}

// ---- learning_progress ----------------------------------------------------------
{
  const acked = entries.filter((x) => x.op === 'lesson' && x.acked)
  const stored = new Set((await fetchIn('learning_progress', 'user_id,lesson_id', 'user_id', userIds)).map((r) => `${r.user_id}|${r.lesson_id}`))
  for (const e of acked) if (!stored.has(`${e.user}|${e.key}`)) add('CRITICAL', 'LOST', { table: 'learning_progress', user: e.user, lesson: e.key })
  findings.push({ severity: 'INFO', kind: 'CHECKED', table: 'learning_progress', acked: acked.length })
}

const summary = findings.reduce((acc, f) => ({ ...acc, [`${f.severity}:${f.kind}`]: (acc[`${f.severity}:${f.kind}`] ?? 0) + 1 }), {})
writeResult('G_integrity', { at: new Date().toISOString(), ledgerEntries: entries.length, summary, findings })
console.log(JSON.stringify({ ledgerEntries: entries.length, summary }, null, 2))
process.exit(findings.some((f) => f.severity === 'CRITICAL') ? 1 : 0)
