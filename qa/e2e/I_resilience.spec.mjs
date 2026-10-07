// I — Resilience: offline, tab loss, token expiry, dropped requests, reload mid-upload.
import { expect, test } from '@playwright/test'
import { admin, AUTH_STORAGE_KEY, login, note, savedIds, supportBodies, takeUser } from './helpers.mjs'

test('I2 offline 30 s with 3 queued support messages: all delivered once, in order', async ({ page, context }, info) => {
  const user = takeUser()
  await login(page, user)
  await page.goto('/support')
  const stamp = Date.now()
  await context.setOffline(true)
  for (let i = 1; i <= 3; i += 1) {
    await page.getByLabel('Message 4Prep support').fill(`[qa_load] I2 ${stamp} #${i}`)
    await page.getByRole('button', { name: /send/i }).click()
  }
  await page.waitForTimeout(30_000)
  await context.setOffline(false)
  await expect.poll(async () => (await supportBodies(user.id)).filter((m) => m.body.includes(`I2 ${stamp}`)).length,
    { timeout: 90_000, intervals: [5000] }).toBeGreaterThanOrEqual(3)
  const got = (await supportBodies(user.id)).filter((m) => m.body.includes(`I2 ${stamp}`)).map((m) => m.body)
  note(info, 'observed', got)
  expect(got).toEqual([1, 2, 3].map((i) => `[qa_load] I2 ${stamp} #${i}`))
})

test('I3 closing the tab while messages are queued offline: are they lost?', async ({ context }, info) => {
  const user = takeUser()
  const page = await context.newPage()
  await login(page, user)
  await page.goto('/support')
  const stamp = Date.now()
  await context.setOffline(true)
  for (let i = 1; i <= 2; i += 1) {
    await page.getByLabel('Message 4Prep support').fill(`[qa_load] I3 ${stamp} #${i}`)
    await page.getByRole('button', { name: /send/i }).click()
  }
  await page.close() // queue lives in sessionStorage (support/queue.ts) — per tab
  await context.setOffline(false)
  const reopened = await context.newPage()
  await reopened.goto('/support')
  await reopened.waitForTimeout(40_000)
  const delivered = (await supportBodies(user.id)).filter((m) => m.body.includes(`I3 ${stamp}`)).length
  note(info, 'observed', { queued: 2, deliveredAfterReopen: delivered })
  expect(delivered, 'messages the UI accepted as queued were lost when the tab closed').toBe(2)
})

test('I4 expired access token mid-session: the next write refreshes and succeeds', async ({ page }, info) => {
  const user = takeUser()
  await login(page, user)
  await page.goto('/universities')
  // Force the stored session to look expired; supabase-js must refresh before the next request.
  await page.evaluate((key) => {
    const session = JSON.parse(localStorage.getItem(key))
    session.expires_at = Math.floor(Date.now() / 1000) - 60
    localStorage.setItem(key, JSON.stringify(session))
  }, AUTH_STORAGE_KEY)
  await page.reload()
  const save = page.getByRole('button', { name: /^Save / }).first()
  const name = (await save.getAttribute('aria-label')).replace(/^Save /, '')
  await save.click()
  await page.waitForTimeout(4000)
  const { data: uni } = await admin.from('universities').select('id').eq('name', name).single()
  const stored = (await savedIds(user.id)).includes(uni.id)
  const stillSignedIn = !(await page.getByRole('link', { name: /sign in/i }).first().isVisible().catch(() => false))
  note(info, 'observed', { stored, stillSignedIn })
  expect(stored).toBe(true)
  expect(stillSignedIn).toBe(true)
})

test('I5 dropped save request: UI must not claim success; retry succeeds', async ({ page }, info) => {
  const user = takeUser()
  await login(page, user)
  await page.goto('/universities')
  await page.route('**/rest/v1/saved_plans*', (route) => (route.request().method() === 'POST' ? route.abort('connectionreset') : route.continue()))
  const save = page.getByRole('button', { name: /^Save / }).first()
  const name = (await save.getAttribute('aria-label')).replace(/^Save /, '')
  await save.click()
  await page.waitForTimeout(3000)
  const { data: uni } = await admin.from('universities').select('id').eq('name', name).single()
  const storedAfterDrop = (await savedIds(user.id)).includes(uni.id)
  const uiClaimsSaved = await page.getByRole('button', { name: `Remove ${name} from saved` }).isVisible()
  await page.unroute('**/rest/v1/saved_plans*')
  await page.reload()
  await page.getByRole('button', { name: `Save ${name}` }).click()
  await page.waitForTimeout(3000)
  const storedAfterRetry = (await savedIds(user.id)).includes(uni.id)
  note(info, 'observed', { storedAfterDrop, uiClaimsSaved, storedAfterRetry })
  expect(uiClaimsSaved, 'UI shows saved although the write never reached the server').toBe(storedAfterDrop)
  expect(storedAfterRetry).toBe(true)
})

test('I1 reload during homework upload leaves no half-submission', async ({ page }, info) => {
  const user = takeUser()
  const { data: assignment } = await admin.from('learning_assignments').select('id,slug,learning_modules(slug)').limit(1).maybeSingle()
  test.skip(!assignment, 'No learning assignment published')
  await login(page, user)
  await page.goto(`/learn/${assignment.learning_modules.slug}/assignment`)
  const input = page.locator('input[type="file"]').first()
  test.skip(!(await input.count()), 'Assignment page has no file input for this user')
  // Hold the Storage upload so the reload lands between "row created" and "file stored".
  await page.route('**/storage/v1/object/learning-submissions/**', async (route) => { await new Promise((r) => setTimeout(r, 15_000)); await route.continue() })
  await input.setInputFiles({ name: 'qa-i1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%qa_load\n') })
  await page.getByRole('button', { name: /submit|upload/i }).first().click()
  await page.waitForTimeout(3000)
  await page.reload()
  await page.waitForTimeout(20_000)
  const { data: subs } = await admin.from('learning_submissions').select('id,status,learning_submission_files(id)').eq('user_id', user.id).eq('assignment_id', assignment.id)
  const half = (subs ?? []).filter((s) => s.status !== 'draft' && s.learning_submission_files.length === 0)
  const { data: objects } = await admin.storage.from('learning-submissions').list(`${user.id}/${assignment.slug}`)
  note(info, 'observed', { submissions: subs, objects: objects?.length ?? 0 })
  expect(half.length, 'submitted rows without a file').toBe(0)
})
