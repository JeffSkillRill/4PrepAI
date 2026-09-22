import type { Extraction, ProfilePayload } from './types.js'

type Config = { supabaseUrl: string; anonKey: string }
type Session = { access_token: string; user: { email?: string } }
type University = { id: string; name: string }
type SaveableProfile = Pick<ProfilePayload, 'source' | 'identity' | 'rankings' | 'campuses' | 'programmes'>

let session: Session | null = null
let extraction: Extraction | null = null
let universities: University[] = []
let databasePanelInitialised = false

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const status = (message: string, kind = '') => { $('status').textContent = message; $('status').className = kind }

function localDateCompact(): string {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
}

function slug(value: string | undefined): string {
  const normalized = value?.normalize('NFKD').replace(/[\u0300-\u036f]/g, '') ?? ''
  return normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unidentified-university'
}

async function config(): Promise<Config> {
  const saved = await chrome.storage.local.get(['supabaseUrl', 'anonKey'])
  return {
    supabaseUrl: typeof saved.supabaseUrl === 'string' ? saved.supabaseUrl : '',
    anonKey: typeof saved.anonKey === 'string' ? saved.anonKey : '',
  }
}

function configPanel(value: Config): void {
  $('config').innerHTML = `<label>Supabase URL<input id="url" value="${value.supabaseUrl}" placeholder="https://project.supabase.co"></label><label>Public anon key<input id="key" value="${value.anonKey}" type="password"></label><button id="settings" type="button">Save database settings</button>`
  $('settings').onclick = async () => {
    await chrome.storage.local.set({ supabaseUrl: $<HTMLInputElement>('url').value.trim(), anonKey: $<HTMLInputElement>('key').value.trim() })
    status('Database settings saved. Local-file collection remains offline.', 'ok')
  }
}

function authPanel(): void {
  $('auth').innerHTML = session
    ? `<p class="ok">Signed in as ${session.user.email ?? 'admin'}</p>`
    : `<label>Email<input id="email" type="email"></label><label>Password<input id="password" type="password"></label><button id="login" type="button">Sign in for database save</button>`
  if (!session) $('login').onclick = login
}

async function login(): Promise<void> {
  const connection = await config()
  const email = $<HTMLInputElement>('email').value
  const password = $<HTMLInputElement>('password').value
  const response = await fetch(`${connection.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: connection.anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const result = await response.json() as Session & { error_description?: string }
  if (!response.ok || !result.access_token) {
    status(result.error_description ?? 'Database sign-in failed.', 'error')
    return
  }
  session = result
  authPanel()
  status('Signed in for the optional database save.', 'ok')
}

function reviewedPayload(): ProfilePayload | null {
  try {
    return JSON.parse($<HTMLTextAreaElement>('payload').value) as ProfilePayload
  } catch {
    status('Reviewed JSON is invalid.', 'error')
    return null
  }
}

function saveableProfile(reviewed: ProfilePayload): SaveableProfile {
  const { source, identity, rankings, campuses, programmes } = reviewed
  return {
    source,
    identity: identity && typeof identity === 'object' && !Array.isArray(identity) ? identity : {},
    ...(rankings === undefined ? {} : { rankings }),
    ...(campuses === undefined ? {} : { campuses }),
    ...(programmes === undefined ? {} : { programmes }),
  }
}

async function saveToFile(): Promise<void> {
  const reviewed = reviewedPayload()
  if (!reviewed) return
  const profile = saveableProfile(reviewed)
  const filename = `qs-collected/${slug(profile.identity.name)}-${localDateCompact()}.json`
  const url = URL.createObjectURL(new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' }))
  try {
    await chrome.downloads.download({ url, filename, saveAs: false })
    status(`Saved locally to Downloads/${filename}.`, 'ok')
  } finally {
    URL.revokeObjectURL(url)
  }
}

function reviewPanel(): void {
  if (!extraction) return
  $('review').innerHTML = `<fieldset><legend>Review extracted data</legend><label>Reviewed payload JSON<textarea id="payload"></textarea></label><p class="muted">Absent: ${extraction.absent.join(', ') || 'none'}<br>Needs review (excluded): ${extraction.needsReview.join(', ') || 'none'}<br>Reported-only values are displayed for review but excluded from every save.</p></fieldset>`
  $<HTMLTextAreaElement>('payload').value = JSON.stringify(extraction.found, null, 2)
  $('localSave').innerHTML = '<button class="primary" id="fileSaveButton" type="button">Save to file</button>'
  $('fileSaveButton').onclick = saveToFile
  if (databasePanelInitialised) databaseReviewPanel()
}

async function read(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab.id) {
    status('No active tab.', 'error')
    return
  }
  extraction = await chrome.tabs.sendMessage(tab.id, { type: 'extract' }) as Extraction
  reviewPanel()
  status('Page read. Review the JSON, then save it locally.', 'ok')
}

async function loadUniversities(): Promise<void> {
  const connection = await config()
  if (!connection.supabaseUrl || !connection.anonKey) {
    status('Enter database settings before loading the university list.', 'error')
    return
  }
  const response = await fetch(`${connection.supabaseUrl}/rest/v1/universities?select=id,name&order=name`, {
    headers: { apikey: connection.anonKey, Authorization: `Bearer ${connection.anonKey}` },
  })
  if (!response.ok) {
    status('Could not load the public university list. Check database settings.', 'error')
    return
  }
  universities = await response.json() as University[]
  databaseReviewPanel()
}

function databaseReviewPanel(): void {
  if (!databasePanelInitialised || !extraction) return
  const options = universities.map((university) => `<option value="${university.id}">${university.name} (${university.id})</option>`).join('')
  $('databaseReview').innerHTML = `<p class="muted">This optional legacy action uses Supabase. It is not needed to save a local file.</p><button id="loadUniversities" type="button">Load university list for database save</button><label>University<select id="university"><option value="">Choose the matching university</option>${options}</select></label>`
  $('loadUniversities').onclick = loadUniversities
  $('databaseSave').innerHTML = '<button id="databaseSaveButton" type="button">Save to database</button>'
  $('databaseSaveButton').onclick = saveToDatabase
}

async function saveToDatabase(): Promise<void> {
  if (!session) {
    status('Sign in before using the optional database save.', 'error')
    return
  }
  const universityId = $<HTMLSelectElement>('university').value
  if (!universityId) {
    status('Choose the matching university first.', 'error')
    return
  }
  const reviewed = reviewedPayload()
  if (!reviewed) return
  const connection = await config()
  const response = await fetch(`${connection.supabaseUrl}/functions/v1/admin-api`, {
    method: 'POST',
    headers: { apikey: connection.anonKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'ingest_university_profile', payload: { ...saveableProfile(reviewed), universityId } }),
  })
  const result = await response.json() as { error?: string; counts?: unknown; absent?: unknown }
  status(response.ok ? `Saved to database. ${JSON.stringify({ counts: result.counts, absent: result.absent })}` : result.error ?? 'Database save failed.', response.ok ? 'ok' : 'error')
}

async function initialiseDatabasePanel(): Promise<void> {
  if (databasePanelInitialised) return
  databasePanelInitialised = true
  configPanel(await config())
  authPanel()
  databaseReviewPanel()
}

function initialise(): void {
  $('read').onclick = read
  $('database').addEventListener('toggle', () => {
    if ($<HTMLDetailsElement>('database').open) void initialiseDatabasePanel()
  })
}

initialise()
