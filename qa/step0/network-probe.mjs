// What does a student on THIS network see? One normal page load, system DNS, no overrides.
//   node step0/network-probe.mjs
import { chromium } from '@playwright/test'
import { writeResult, QA_ROOT } from '../lib/target.mjs'
import { join } from 'node:path'

const appUrl = process.env.QA_APP_URL || 'https://4-prep-ai2.vercel.app'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const requests = []
const pending = new Set()
page.on('requestfinished', async (req) => {
  const res = await req.response()
  requests.push({ url: req.url().slice(0, 90), status: res?.status() ?? null })
})
page.on('request', (req) => pending.add(req.url().slice(0, 90)))
page.on('requestfinished', (req) => pending.delete(req.url().slice(0, 90)))
page.on('requestfailed', (req) => pending.delete(req.url().slice(0, 90)))
page.on('requestfailed', (req) => requests.push({ url: req.url().slice(0, 90), failed: req.failure()?.errorText }))
const started = Date.now()
await page.goto(`${appUrl}/universities`, { waitUntil: 'commit', timeout: 60_000 })
await page.waitForTimeout(45_000) // long enough for the Supabase fetches to time out or succeed
const visibleText = (await page.locator('main').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 600)
const cards = await page.getByRole('button', { name: /^Save / }).count()
await page.screenshot({ path: join(QA_ROOT, 'results', 'step0-student-view.png'), fullPage: false })
await browser.close()
const supabase = requests.filter((r) => r.url.includes('supabase.co'))
const result = { at: new Date().toISOString(), appUrl, elapsedMs: Date.now() - started, universityCards: cards,
  supabaseRequests: supabase, stillPending: [...pending], otherRequests: requests.length - supabase.length, visibleText }
writeResult('step0-student-view', result)
console.log(JSON.stringify({ ...result, visibleText: visibleText.slice(0, 300) }, null, 2))
