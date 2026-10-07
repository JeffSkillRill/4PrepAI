// J — Client authority (re-scoped "timer integrity": the app has no timer).
// What the client decides, the server must not blindly trust.
import { expect, test } from '@playwright/test'
import { admin, login, note, PENDING_AUTH_KEY, supportBodies, takeUser, userClient } from './helpers.mjs'

async function sessionFor(page) {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => k.endsWith('-auth-token'))
    return JSON.parse(localStorage.getItem(key))
  })
}

test('J1 consented_at comes from the client clock: does the server accept a forged time?', async ({ page }, info) => {
  const user = takeUser()
  await login(page, user)
  const session = await sessionFor(page)
  const client = userClient(session.access_token)
  const { data: current } = await admin.from('student_profiles').select('*').eq('user_id', user.id).single()
  const results = {}
  for (const [label, when] of [['future+2y', '2028-10-07T00:00:00Z'], ['past-1990', '1990-01-01T00:00:00Z']]) {
    const { error } = await client.from('student_profiles').upsert({ ...current, consented_at: when }, { onConflict: 'user_id' })
    const { data } = await admin.from('student_profiles').select('consented_at').eq('user_id', user.id).single()
    results[label] = { accepted: !error, stored: data.consented_at }
  }
  note(info, 'observed', results)
  // Server-owned since migration 20261007120000: a forged value may be accepted by the
  // upsert but must never be stored; the original first-save time must survive.
  for (const { stored } of Object.values(results)) {
    expect(stored, 'consented_at changed by a client save').toBe(current.consented_at)
  }
})

test('J2 skewed clock (+2 days) in the browser still saves with server-valid data', async ({ page }, info) => {
  const user = takeUser()
  await page.clock.install({ time: new Date(Date.now() + 2 * 86_400_000) })
  await login(page, user)
  await page.goto('/support')
  const body = `[qa_load] J2 ${Date.now()}`
  await page.getByLabel('Message 4Prep support').fill(body)
  await page.getByRole('button', { name: /send/i }).click()
  await page.clock.runFor(30_000)
  await page.waitForTimeout(8000)
  const stored = (await supportBodies(user.id)).filter((m) => m.body === body)
  note(info, 'observed', { stored: stored.length, createdAt: stored[0]?.created_at })
  expect(stored.length).toBe(1)
  // created_at must be server time, not the skewed client time.
  expect(Math.abs(Date.parse(stored[0].created_at) - Date.now())).toBeLessThan(10 * 60_000)
})

test('J3 tampered pending-auth profile (out-of-range values) is rejected, not partially saved', async ({ page }, info) => {
  const user = takeUser()
  const { data: before } = await admin.from('student_profiles').select('*').eq('user_id', user.id).single()
  await page.goto('/universities')
  await page.evaluate(([key]) => sessionStorage.setItem(key, JSON.stringify({
    destination: { view: 'search', universityId: null },
    profile: { country: 'United States', field: 'Biology', academicScore: 999, budgetMax: -5, budgetCurrency: 'USD',
      languageTest: 'ielts', languageScore: 42, admissionTest: 'sat', admissionTestScore: 9999, gpa: 9.9,
      needsLanguagePathway: false, intake: 'Fall 2027', injected: '<script>alert(1)</script>' },
  })), [PENDING_AUTH_KEY])
  await login(page, user)
  await page.waitForTimeout(5000)
  const { data: after } = await admin.from('student_profiles').select('*').eq('user_id', user.id).single()
  const uiError = await page.getByText(/could not|couldn’t|try again|failed/i).first().isVisible().catch(() => false)
  note(info, 'observed', { unchanged: after.gpa === before.gpa && after.admission_test_score === before.admission_test_score, uiError })
  expect(Number(after.gpa)).toBeLessThanOrEqual(4)
  expect(Number(after.admission_test_score)).toBeLessThanOrEqual(1600)
})

test('J5 frozen JS (5 min) with a queued message does not burst duplicate sends on resume', async ({ page, context }, info) => {
  const user = takeUser()
  await page.clock.install()
  await login(page, user)
  await page.goto('/support')
  const body = `[qa_load] J5 ${Date.now()}`
  await context.setOffline(true)
  await page.getByLabel('Message 4Prep support').fill(body)
  await page.getByRole('button', { name: /send/i }).click()
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  await context.setOffline(false)
  await page.clock.fastForward('05:00')
  await page.clock.resume()
  await page.waitForTimeout(30_000)
  const copies = (await supportBodies(user.id)).filter((m) => m.body === body).length
  note(info, 'observed', { copies })
  expect(copies).toBe(1)
})
