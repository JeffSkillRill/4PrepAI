// F0 liveness, cache priming for F2, and F3 local-refusal correctness.
// Every call that COULD reach Perplexity is written to .state/ai-ledger.json
// BEFORE it is sent; the run stops when the 300-call / $5 cap would be crossed.
//
//   node --env-file=.env load/prime.mjs
import { adminClient, readState, target, writeResult, writeState } from '../lib/target.mjs'

const t = target({ needsServiceRole: true })
const admin = adminClient(t)
const CAP_CALLS = 300
const EST_COST_PER_CALL = 0.0075 // Sonar: ~2k in + ~0.5k out tokens @ $1/M + $5/1k request fee (low context)
const CAP_USD = 5

const ledger = readState('ai-ledger.json', { calls: 0, estUsd: 0, entries: [] })
const sessions = readState('k6-users.json', [])
if (!sessions.length) { console.error('Run npm run seed first.'); process.exit(2) }
const token = sessions[0].access_token

function reserveAiCall(purpose) {
  if (ledger.calls + 1 > CAP_CALLS || ledger.estUsd + EST_COST_PER_CALL > CAP_USD) return false
  ledger.calls += 1
  ledger.estUsd = Math.round((ledger.estUsd + EST_COST_PER_CALL) * 10000) / 10000
  ledger.entries.push({ at: new Date().toISOString(), purpose })
  writeState('ai-ledger.json', ledger)
  return true
}

async function ask(message) {
  const started = performance.now()
  const res = await fetch(`${t.url}/functions/v1/counselor`, {
    method: 'POST',
    headers: { apikey: t.anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  const ms = Math.round(performance.now() - started)
  let body = null
  try { body = await res.json() } catch { /* non-JSON */ }
  return { status: res.status, ms, body }
}

async function outcomeOf(requestId) {
  if (!requestId) return null
  const { data } = await admin.from('counselor_requests').select('outcome').eq('request_id', requestId).maybeSingle()
  return data?.outcome ?? null
}

const result = { startedAt: new Date().toISOString(), F0: null, primed: [], F3: [], skipped: [] }

// ---- F0: liveness (1 real call). Also tests the Sonar → Agent API migration risk.
if (reserveAiCall('F0 liveness')) {
  const r = await ask('How should an international applicant approach the Yale supplemental essays?')
  result.F0 = { status: r.status, ms: r.ms, answerType: r.body?.answerType, outcome: await outcomeOf(r.body?.requestId),
    answerPreview: typeof r.body?.answer === 'string' ? r.body.answer.slice(0, 160) : null }
  console.log('F0', result.F0)
} else result.skipped.push('F0: AI budget exhausted')

const live = result.F0?.status === 200 && ['general_guidance', 'verified_fact'].includes(result.F0.answerType)
if (!live) {
  result.skipped.push('Priming, F2, F4, F5: F0 did not return a live answer (provider down, retired endpoint, or not configured)')
} else {
  // ---- Priming: 10 questions. Keep only those that are verifiably served from cache afterwards.
  const bank = [
    'How do Harvard essays work for international applicants?', 'What does Princeton look for in recommendation letters?',
    'How should I describe extracurriculars for Yale?', 'How do interviews work at Harvard for international students?',
    'What should I know about Berea College as an international applicant?', 'How does Clark University review applications?',
    'How should I plan my Princeton application timeline?', 'What makes a strong Yale short answer?',
    'How should I prepare for an Illinois Wesleyan application?', 'How do I explain my school system to Harvard admissions?',
  ]
  for (const question of bank) {
    if (!reserveAiCall(`prime: ${question}`)) { result.skipped.push('priming: AI budget exhausted'); break }
    const first = await ask(question)
    // Second ask must be a cache hit, or the question is excluded (it would spend budget under load).
    const second = await ask(question)
    const secondOutcome = await outcomeOf(second.body?.requestId)
    if (secondOutcome !== 'cache_hit') {
      // The second ask may itself have reached Perplexity; account for it.
      if (secondOutcome === 'live_call') reserveAiCall(`prime recheck (miss): ${question}`)
    }
    result.primed.push({ question, firstStatus: first.status, firstMs: first.ms, answerType: first.body?.answerType,
      secondOutcome, secondMs: second.ms, usable: secondOutcome === 'cache_hit' })
  }
  writeState('primed-questions.json', result.primed.filter((p) => p.usable).map((p) => p.question))
}

// ---- F3: Scorecard universities outside the 10-name alias list (0 AI calls by design:
// every question names a targeted fact kind, so an unmatched university is refused locally).
const { data: unis } = await admin.from('universities').select('id,name').not('unitid', 'is', null).order('name').limit(20)
for (const university of unis ?? []) {
  const r = await ask(`What is the tuition at ${university.name}?`)
  const outcome = await outcomeOf(r.body?.requestId)
  if (outcome === 'live_call') reserveAiCall(`F3 unexpected live call: ${university.name}`)
  result.F3.push({ university: university.id, status: r.status, ms: r.ms, answerType: r.body?.answerType, outcome,
    wronglyRefused: r.body?.answerType === 'refusal' && /could not match/i.test(r.body?.answer ?? '') })
}

result.aiLedger = { calls: ledger.calls, estUsd: ledger.estUsd, remaining: CAP_CALLS - ledger.calls }
result.finishedAt = new Date().toISOString()
writeResult('F0_prime_F3', result)
console.log(JSON.stringify({ F0: result.F0, primedUsable: result.primed.filter((p) => p.usable).length,
  F3WronglyRefused: result.F3.filter((f) => f.wronglyRefused).length, aiLedger: result.aiLedger, skipped: result.skipped }, null, 2))
