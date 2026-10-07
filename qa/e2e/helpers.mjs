import { expect } from '@playwright/test'
import { adminClient, anonClient, readState, target } from '../lib/target.mjs'

export const t = target({ needsServiceRole: true })
export const admin = adminClient(t)
export const users = readState('users.json', [])
export const AUTH_STORAGE_KEY = `sb-${t.ref}-auth-token`
export const PENDING_AUTH_KEY = '4prep.pending-auth'

// Each spec takes users from the END of the pool so it never collides with k6 VUs (which start at 1).
let next = users.length - 1
export function takeUser() {
  if (next < 0) throw new Error('No seeded users left (npm run seed with a larger QA_USER_COUNT).')
  return users[next--]
}

export async function login(page, user) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Password', { exact: true }).fill(user.password)
  await page.getByRole('button', { name: /^Sign in/ }).click()
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 })
}

export async function savedIds(userId) {
  const { data } = await admin.from('saved_plans').select('university_id').eq('user_id', userId)
  return (data ?? []).map((row) => row.university_id)
}

export async function supportBodies(userId) {
  const { data: thread } = await admin.from('support_threads').select('id').eq('user_id', userId).maybeSingle()
  if (!thread) return []
  const { data } = await admin.from('support_messages').select('id,body,created_at')
    .eq('thread_id', thread.id).eq('sender_role', 'student').order('created_at').order('id')
  return data ?? []
}

export const userClient = (accessToken) => anonClient(t, accessToken)

export function note(testInfo, type, description) {
  testInfo.annotations.push({ type, description: typeof description === 'string' ? description : JSON.stringify(description) })
}
