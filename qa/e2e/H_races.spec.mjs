// H — Race conditions in the real UI, verified against the database.
import { expect, test } from '@playwright/test'
import { admin, login, note, PENDING_AUTH_KEY, savedIds, supportBodies, takeUser } from './helpers.mjs'

test('H1 double-click save stores exactly one row and the UI matches the DB', async ({ page }, info) => {
  const user = takeUser()
  await login(page, user)
  await page.goto('/universities')
  const save = page.getByRole('button', { name: /^Save / }).first()
  const name = (await save.getAttribute('aria-label')).replace(/^Save /, '')
  await save.dblclick()
  await page.waitForTimeout(3000)
  const { data: uni } = await admin.from('universities').select('id').eq('name', name).single()
  const { data: rows } = await admin.from('saved_plans').select('id').eq('user_id', user.id).eq('university_id', uni.id)
  const uiSaved = await page.getByRole('button', { name: `Remove ${name} from saved` }).isVisible()
  note(info, 'observed', { rows: rows.length, uiSaved })
  expect(rows.length, 'DB rows for one university').toBeLessThanOrEqual(1)
  expect(uiSaved, 'UI state must equal DB state').toBe(rows.length === 1)
})

test('H2 two tabs, same user: save in A, stale unsave in B, both converge after reload', async ({ context }, info) => {
  const user = takeUser()
  const a = await context.newPage()
  await login(a, user)
  const b = await context.newPage()
  await a.goto('/universities'); await b.goto('/universities')
  const firstA = a.getByRole('button', { name: /^Save / }).first()
  const name = (await firstA.getAttribute('aria-label')).replace(/^Save /, '')
  await firstA.click()
  await a.waitForTimeout(1500)
  // B still shows "Save" (stale). Clicking it toggles B's idea of the state.
  await b.getByRole('button', { name: `Save ${name}` }).click()
  await b.waitForTimeout(1500)
  await a.reload(); await b.reload()
  const { data: uni } = await admin.from('universities').select('id').eq('name', name).single()
  const inDb = (await savedIds(user.id)).includes(uni.id)
  const aUi = await a.getByRole('button', { name: `Remove ${name} from saved` }).isVisible()
  const bUi = await b.getByRole('button', { name: `Remove ${name} from saved` }).isVisible()
  note(info, 'observed', { inDb, aUi, bUi })
  expect(aUi).toBe(inDb)
  expect(bUi).toBe(inDb)
})

test('H3 double-click Send in support creates exactly one message', async ({ page }, info) => {
  const user = takeUser()
  await login(page, user)
  await page.goto('/support')
  const body = `[qa_load] H3 ${Date.now()}`
  await page.getByLabel('Message 4Prep support').fill(body)
  await page.getByRole('button', { name: /send/i }).dblclick()
  await page.waitForTimeout(8000)
  const matches = (await supportBodies(user.id)).filter((m) => m.body === body)
  note(info, 'observed', { copies: matches.length })
  expect(matches.length).toBe(1)
})

test('H4 double-click homework submit leaves one submission and no orphan files', async ({ page }, info) => {
  const user = takeUser()
  const { data: assignment } = await admin.from('learning_assignments')
    .select('id,slug,submission_type,learning_modules(slug)').limit(1).maybeSingle()
  test.skip(!assignment, 'No learning assignment published')
  await login(page, user)
  await page.goto(`/learn/${assignment.learning_modules.slug}/assignment`)
  const input = page.locator('input[type="file"]').first()
  test.skip(!(await input.count()), 'Assignment page has no file input for this user')
  await input.setInputFiles({ name: 'qa-h4.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%qa_load\n') })
  const submit = page.getByRole('button', { name: /submit|upload/i }).first()
  await submit.dblclick()
  await page.waitForTimeout(15_000)
  const { data: subs } = await admin.from('learning_submissions').select('id,status,learning_submission_files(id,storage_path)')
    .eq('user_id', user.id).eq('assignment_id', assignment.id)
  const fileRows = (subs ?? []).flatMap((s) => s.learning_submission_files)
  const { data: objects } = await admin.storage.from('learning-submissions').list(`${user.id}/${assignment.slug}`)
  note(info, 'observed', { submissions: subs?.length, fileRows: fileRows.length, objects: objects?.length ?? 0 })
  expect(subs?.length ?? 0).toBeLessThanOrEqual(1)
  expect(objects?.length ?? 0, 'storage objects must match file rows (no orphans)').toBe(fileRows.length)
})

test('H5 signing in with an anonymous intake in the tab overwrites the stored profile', async ({ page }, info) => {
  const user = takeUser()
  const { data: before } = await admin.from('student_profiles').select('*').eq('user_id', user.id).single()
  await page.goto('/universities')
  // Exactly what the app writes for a logged-out intake (pendingAuth.ts), with different scores.
  await page.evaluate(([key, profile]) => sessionStorage.setItem(key, JSON.stringify({
    destination: { view: 'search', universityId: null }, profile,
  })), [PENDING_AUTH_KEY, {
    country: 'United States', field: 'Biology', academicScore: 10, budgetMax: 5000, budgetCurrency: 'USD',
    languageTest: 'ielts', languageScore: 5, admissionTest: 'sat', admissionTestScore: 900, gpa: 2.0,
    needsLanguagePathway: true, intake: 'Fall 2030',
  }])
  await login(page, user)
  await page.waitForTimeout(5000)
  const { data: after } = await admin.from('student_profiles').select('*').eq('user_id', user.id).single()
  const overwritten = after.field !== before.field || Number(after.gpa) !== Number(before.gpa)
  note(info, 'observed', { before: { field: before.field, gpa: before.gpa, sat: before.admission_test_score },
    after: { field: after.field, gpa: after.gpa, sat: after.admission_test_score }, overwritten })
  // Requirement: a stored profile is never replaced without the student's confirmation.
  expect(overwritten, 'stored profile silently replaced by an anonymous intake').toBe(false)
})
