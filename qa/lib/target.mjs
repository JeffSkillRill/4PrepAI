// Shared guard for every Node script in /qa: prints the target and refuses to
// touch production unless the owner's explicit flag is set for this shell.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

export const PRODUCTION_REF = 'pubhgajlqhdbpwqahtki'
export const QA_PREFIX = 'qa_load_'
export const QA_DOMAIN = 'test.local'
export const QA_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

export function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    console.error(`Missing ${name}. Set it in qa/.env (see qa/.env.example).`)
    process.exit(2)
  }
  return value
}

export function target({ needsServiceRole = false } = {}) {
  const url = requireEnv('QA_SUPABASE_URL')
  const anonKey = requireEnv('QA_SUPABASE_ANON_KEY')
  const serviceKey = needsServiceRole ? requireEnv('QA_SUPABASE_SERVICE_ROLE_KEY') : null
  const ref = new URL(url).hostname.split('.')[0]
  const isProduction = ref === PRODUCTION_REF
  console.log(`TARGET supabase=${url} app=${process.env.QA_APP_URL ?? '(unset)'} ref=${ref} ${isProduction ? 'PRODUCTION' : 'non-production'}`)
  if (isProduction && process.env.QA_ALLOW_PRODUCTION !== 'yes-owner-approved') {
    console.error('Refusing to run against PRODUCTION without QA_ALLOW_PRODUCTION=yes-owner-approved in this shell.')
    process.exit(3)
  }
  return { url, anonKey, serviceKey, ref, isProduction }
}

export function adminClient(t) {
  return createClient(t.url, t.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function anonClient(t, accessToken) {
  return createClient(t.url, t.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
  })
}

export const qaEmail = (n) => `${QA_PREFIX}${String(n).padStart(4, '0')}@${QA_DOMAIN}`
export const isQaEmail = (email) => typeof email === 'string'
  && email.startsWith(QA_PREFIX) && email.endsWith(`@${QA_DOMAIN}`)

const statePath = (name) => join(QA_ROOT, '.state', name)
export function readState(name, fallback) {
  try { return JSON.parse(readFileSync(statePath(name), 'utf8')) } catch { return fallback }
}
export function writeState(name, value) {
  mkdirSync(join(QA_ROOT, '.state'), { recursive: true })
  writeFileSync(statePath(name), JSON.stringify(value, null, 2), { mode: 0o600 })
}
export function writeResult(name, value) {
  mkdirSync(join(QA_ROOT, 'results'), { recursive: true })
  writeFileSync(join(QA_ROOT, 'results', `${name}.json`), JSON.stringify(value, null, 2))
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
