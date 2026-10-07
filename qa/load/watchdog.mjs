// Watchdog: behaves like one real anonymous student, probing a tiny public query
// every 10 s. Three consecutive failures (non-200 or > 5 s) kill the k6 process,
// because that means real students are hurting.
//   node --env-file=.env load/watchdog.mjs <k6-pid> <scenario>
import { writeResult } from '../lib/target.mjs'

const [pid, scenario] = process.argv.slice(2)
const url = `${process.env.QA_SUPABASE_URL}/rest/v1/sources?select=id&limit=1`
const headers = { apikey: process.env.QA_SUPABASE_ANON_KEY, Authorization: `Bearer ${process.env.QA_SUPABASE_ANON_KEY}` }
const probes = []
let consecutive = 0
let killed = null

const alive = () => { try { process.kill(Number(pid), 0); return true } catch { return false } }

while (alive()) {
  const started = performance.now()
  let status = 0
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) })
    status = res.status
  } catch { status = 0 }
  const ms = Math.round(performance.now() - started)
  const ok = status === 200 && ms <= 5000
  probes.push({ at: new Date().toISOString(), status, ms, ok })
  consecutive = ok ? 0 : consecutive + 1
  if (consecutive >= 3 && !killed) {
    killed = new Date().toISOString()
    console.error(`WATCHDOG: 3 consecutive failed probes — stopping k6 (pid ${pid})`)
    try { process.kill(Number(pid), 'SIGINT') } catch { /* already gone */ }
  }
  writeResult(`${scenario}.watchdog`, { scenario, killedAt: killed, probes })
  await new Promise((resolve) => setTimeout(resolve, 10_000))
}
