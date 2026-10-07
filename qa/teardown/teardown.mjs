// Teardown: remove everything the seed and the scenarios created, then prove
// zero qa_load_ rows remain. Touches only rows owned by qa_load_ users (or, for
// leads, rows whose contact is a qa_load_ address).
//
// Order matters: counselor_requests / counselor_strikes use ON DELETE SET NULL
// (…0002:70, …0007:5), so they must be deleted BEFORE the users or they become
// unattributable. Storage objects never cascade.
import {
  adminClient, isQaEmail, QA_PREFIX, readState, target, writeResult, writeState,
} from '../lib/target.mjs'

const t = target({ needsServiceRole: true })
const admin = adminClient(t)
const report = { startedAt: new Date().toISOString(), deleted: {}, residual: {}, errors: [] }

// Discover qa users from Auth itself, not only local state, so a crashed seed is still cleaned.
const qaUsers = []
for (let page = 1; ; page += 1) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
  if (error) { report.errors.push({ step: 'listUsers', message: error.message }); break }
  qaUsers.push(...data.users.filter((user) => isQaEmail(user.email)))
  if (data.users.length < 1000) break
}
const ids = qaUsers.map((user) => user.id)
console.log(`found ${ids.length} qa_load_ users`)

async function deleteWhere(table, column, values) {
  let total = 0
  for (let i = 0; i < values.length; i += 100) {
    const { count, error } = await admin.from(table).delete({ count: 'exact' }).in(column, values.slice(i, i + 100))
    if (error) { report.errors.push({ step: `delete ${table}`, message: error.message }); return total }
    total += count ?? 0
  }
  report.deleted[table] = total
  return total
}

// 1. SET NULL tables first.
await deleteWhere('counselor_strikes', 'user_id', ids)
await deleteWhere('counselor_requests', 'user_id', ids)

// 2. Storage objects under each user's prefix (private homework + public avatars).
// Homework is nested <userId>/<assignment>/<file>; folders come back with id === null.
async function listRecursive(bucket, prefix) {
  const { data, error } = await admin.storage.from(bucket).list(prefix, { limit: 1000 })
  if (error || !data) return []
  const nested = await Promise.all(data.map((entry) => (entry.id === null
    ? listRecursive(bucket, `${prefix}/${entry.name}`)
    : [`${prefix}/${entry.name}`])))
  return nested.flat()
}
for (const bucket of ['learning-submissions', 'avatars']) {
  let removed = 0
  for (const id of ids) {
    const paths = await listRecursive(bucket, id)
    if (!paths.length) continue
    const { error: removeError } = await admin.storage.from(bucket).remove(paths)
    if (removeError) report.errors.push({ step: `storage ${bucket}`, message: removeError.message })
    else removed += paths.length
  }
  report.deleted[`storage:${bucket}`] = removed
}

// 3. Tagged anonymous rows (leads probe from scenario K).
{
  const { count, error } = await admin.from('leads').delete({ count: 'exact' }).like('contact', `${QA_PREFIX}%`)
  if (error) report.errors.push({ step: 'delete leads', message: error.message })
  report.deleted.leads = count ?? 0
}

// 4. Users (cascades profiles, saved plans, support, learning, user-linked leads).
let usersDeleted = 0
for (const user of qaUsers) {
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) report.errors.push({ step: 'deleteUser', id: user.id, message: error.message })
  else usersDeleted += 1
}
report.deleted.auth_users = usersDeleted

// 5. Prove zero residue.
const userTables = [
  'student_profiles', 'saved_plans', 'support_threads', 'learning_progress',
  'learning_submissions', 'counselor_requests', 'counselor_strikes', 'leads',
]
for (const table of userTables) {
  const { count, error } = ids.length
    ? await admin.from(table).select('*', { count: 'exact', head: true }).in('user_id', ids.slice(0, 1000))
    : { count: 0, error: null }
  report.residual[table] = error ? `error: ${error.message}` : count
}
{
  const { count } = await admin.from('leads').select('*', { count: 'exact', head: true }).like('contact', `${QA_PREFIX}%`)
  report.residual['leads(contact)'] = count
  const remaining = []
  for (let page = 1; ; page += 1) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    remaining.push(...(data?.users ?? []).filter((user) => isQaEmail(user.email)))
    if (!data || data.users.length < 1000) break
  }
  report.residual.auth_users = remaining.length
}
report.zeroResidue = Object.values(report.residual).every((value) => value === 0)
report.note = 'Anonymous counselor_requests rows (watchdog / anonymous VUs) carry only a salted IP hash and are left to the 7-day retention job.'
report.finishedAt = new Date().toISOString()
if (report.zeroResidue) { writeState('users.json', []); writeState('sessions.json', {}); writeState('k6-users.json', []) }
writeResult('teardown', report)
console.log(JSON.stringify(report, null, 2))
process.exit(report.zeroResidue && report.errors.length === 0 ? 0 : 1)
