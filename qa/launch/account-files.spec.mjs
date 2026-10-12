import { expect, test as base } from '@playwright/test'
import { installSignedInFixture, students } from './signed-in-fixture.mjs'

// An explicitly synthetic published lesson permits testing private homework UI;
// this fixture does not publish or change any real course record.
const module = {
  id: 'synthetic-module', track_id: 'synthetic-track', module_number: 1, slug: 'synthetic-module',
  title: 'Synthetic module', summary: 'Local test only', sort_order: 1,
  learning_lessons: [{ id: 'synthetic-lesson', module_id: 'synthetic-module', slug: 'synthetic-lesson', title: 'Synthetic lesson', sort_order: 1, status: 'published', duration_minutes: null, body: 'Local test only', transcript: null, media_url: null, audio_url: null }],
  learning_assignments: [{ id: 'synthetic-assignment', module_id: 'synthetic-module', slug: 'synthetic-assignment', title: 'Synthetic homework', brief: 'Local test only', submission_type: 'artifact', template_ref: '/learning-templates/synthetic.pdf', rubric: null }],
}
const learningTrack = { id: 'synthetic-track', slug: 'application-year', title: 'Synthetic course', description: 'Local test only', sort_order: 1, learning_modules: [module] }
const assignmentPath = '/learn/synthetic-module/assignment'
const homework = (user) => ({
  id: `synthetic-submission-${user.id}`, assignment_id: 'synthetic-assignment', user_id: user.id, status: 'pending', submitted_at: '2026-10-12T00:00:00Z', feedback_ref: null,
  learning_submission_files: [{ id: `synthetic-file-${user.id}`, submission_id: `synthetic-submission-${user.id}`, storage_path: `${user.id}/synthetic-assignment/homework.pdf`, original_filename: `private-${user.user_metadata.full_name.slice(-1)}.pdf`, mime_type: 'application/pdf', byte_size: 22, created_at: '2026-10-12T00:00:00Z' }],
})
const test = base.extend({
  fixture: async ({ context }, use) => {
    const fixture = await installSignedInFixture(context, { learningTrack, learningSubmissions: new Map(students.map((user) => [user.id, [homework(user)]])) })
    try { await use(fixture) } finally { fixture.releaseAll() }
    expect(fixture.failures).toEqual([])
  },
})

test('account settings disclose public photos and clear the previous account draft on a cross-tab switch', async ({ page, context, fixture }) => {
  await fixture.signIn(page)
  await expect(page.getByText(/Profile photos are public to anyone with their URL/)).toBeVisible()
  await page.getByLabel('Display name', { exact: true }).fill('Old private draft name')
  await page.locator('input[type="file"]').setInputFiles({ name: 'synthetic-avatar.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2l9sAAAAASUVORK5CYII=', 'base64') })
  await expect(page.getByRole('img', { name: 'Profile photo preview' })).toBeVisible()
  const otherTab = await context.newPage()
  await fixture.signOut(otherTab)
  await fixture.signIn(otherTab, 1)
  await expect(page.getByRole('heading', { name: 'You’re signed in', exact: true })).toBeVisible()
  await expect(page.getByLabel('Display name', { exact: true })).toHaveValue('Synthetic Student B')
  await expect(page.getByRole('img', { name: 'Profile photo preview' })).toHaveCount(0)
  await expect(page.locator('input[type="file"]')).toHaveValue('')
  await page.goto('/privacy')
  await expect(page.getByRole('heading', { name: 'Optional profile photos', exact: true })).toBeVisible()
})

test('private homework is replaced, not retained, across a cross-tab account switch', async ({ page, context, fixture }) => {
  await fixture.signIn(page)
  await page.goto(assignmentPath)
  await expect(page.getByText('private-A.pdf', { exact: true })).toBeVisible()
  const otherTab = await context.newPage()
  await fixture.signOut(otherTab)
  await expect(page.getByText('private-A.pdf', { exact: true })).toHaveCount(0)
  await fixture.signIn(otherTab, 1)
  await expect(page.getByText('private-B.pdf', { exact: true })).toBeVisible()
  await expect(page.getByText('private-A.pdf', { exact: true })).toHaveCount(0)
})

test('a delayed private blob is not downloaded by the next signed-in student', async ({ page, context, fixture }) => {
  await fixture.signIn(page)
  await page.goto(assignmentPath)
  const gate = fixture.holdNext('download:homework')
  const downloads = []
  page.on('download', (download) => downloads.push(download.suggestedFilename()))
  await page.getByRole('button', { name: 'Download', exact: true }).click()
  await expect.poll(() => gate.started).toBe(true)
  const otherTab = await context.newPage()
  await fixture.signOut(otherTab)
  await fixture.signIn(otherTab, 1)
  await expect(page.getByText('private-B.pdf', { exact: true })).toBeVisible()
  gate.release()
  await expect.poll(() => fixture.requests.filter((request) => request.operation === 'download:homework').every((request) => request.done)).toBe(true)
  // Exercise another successful download as an ordering barrier; only B may download.
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download', exact: true }).click()
  expect((await downloaded).suggestedFilename()).toBe('private-B.pdf')
  expect(downloads).toEqual(['private-B.pdf'])
})

test('leaving the assignment cancels a pending private browser download', async ({ page, fixture }) => {
  await fixture.signIn(page)
  await page.goto(assignmentPath)
  const gate = fixture.holdNext('download:homework')
  const downloads = []
  page.on('download', (download) => downloads.push(download.suggestedFilename()))
  await page.getByRole('button', { name: 'Download', exact: true }).click()
  await expect.poll(() => gate.started).toBe(true)
  await page.getByRole('link', { name: 'Back to course', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Synthetic course', exact: true })).toBeVisible()
  gate.release()
  await expect.poll(() => fixture.requests.filter((request) => request.operation === 'download:homework').every((request) => request.done)).toBe(true)
  await page.getByRole('link', { name: 'Continue module', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Synthetic module', exact: true })).toBeVisible()
  expect(downloads).toEqual([])
})
