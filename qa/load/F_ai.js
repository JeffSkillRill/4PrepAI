// F — counselor Edge Function. Select the step with QA_F_STEP:
//   F1  out-of-scope (scope gate only, 0 Perplexity calls)        20 VUs, ~1 req/s, 3 min
//   F2  cached path (primed questions only, 0 Perplexity calls)   25/min 5 min, then 75/min 5 min
//   F4  live calibration (unique questions)                       25/min
//   F5  live 3×                                                    75/min
// F0 (liveness), priming and F3 (local refusal) run in ai/prime.mjs, not here.
// Live steps are capped by QA_AI_REMAINING, which run.sh derives from .state/ai-ledger.json.
import { check } from 'k6'
import exec from 'k6/execution'
import { counselor, GB, ledger, PRIMED, setupIds, thresholds, USERS, vuUser } from './common.js'

const STEP = __ENV.QA_F_STEP || 'F1'
const REMAINING = Number(__ENV.QA_AI_REMAINING || 0)
const LIVE_UNIVERSITIES = ['Harvard', 'Yale', 'Princeton', 'Berea College', 'Clark University', 'Illinois Wesleyan']
const LIVE_TOPICS = ['how to structure the personal essay', 'what makes a strong extracurricular list', 'how to ask for recommendation letters',
  'how interviews work for international applicants', 'how to explain a gap year', 'how to show interest in the major']

function liveScenario(ratePerMin, plannedMin) {
  const minutes = Math.min(plannedMin, Math.floor(REMAINING / ratePerMin))
  if (minutes < 1) return null
  return { executor: 'constant-arrival-rate', rate: ratePerMin, timeUnit: '1m', duration: `${minutes}m`, preAllocatedVUs: 30, maxVUs: 60 }
}

const scenarios = {
  F1: { executor: 'constant-arrival-rate', rate: 60, timeUnit: '1m', duration: '3m', preAllocatedVUs: 20, maxVUs: 20 },
  F2: { executor: 'ramping-arrival-rate', startRate: 25, timeUnit: '1m', preAllocatedVUs: 30, maxVUs: 80,
    stages: [{ duration: '5m', target: 25 }, { duration: '10s', target: 75 }, { duration: '5m', target: 75 }] },
  F4: liveScenario(25, 3),
  F5: liveScenario(75, 2),
}
if (!scenarios[STEP]) throw new Error(`QA_F_STEP=${STEP}: nothing to run (AI budget remaining ${REMAINING})`)
if ((STEP === 'F2') && !PRIMED.length) throw new Error('F2 needs .state/primed-questions.json (run ai/prime.mjs first)')
if (!USERS.length) throw new Error('F needs seeded users (authenticated limit 20/min/user; anon is 8/min per IP)')

export const options = {
  scenarios: { [STEP]: scenarios[STEP] },
  thresholds: {
    ...thresholds({ egressBytes: Number(__ENV.QA_EGRESS_GB || 0.03) * GB }),
    'http_req_duration{name:fn_counselor_live}': ['p(95)<10000'],
    'http_req_duration{name:fn_counselor_cached}': ['p(95)<1500'],
    'http_req_duration{name:fn_counselor_scope}': ['p(95)<1500'],
  },
  summaryTrendStats: ['min', 'med', 'p(95)', 'p(99)', 'max'],
}
export const setup = setupIds

export default function () {
  const user = vuUser()
  const i = exec.scenario.iterationInTest
  let message
  let name
  if (STEP === 'F1') { message = `Can you recommend a good recipe for plov? (${i})`; name = 'fn_counselor_scope' }
  else if (STEP === 'F2') { message = PRIMED[i % PRIMED.length]; name = 'fn_counselor_cached' }
  else {
    // Unique per iteration and per run so nothing is served from cache.
    message = `For ${LIVE_UNIVERSITIES[i % LIVE_UNIVERSITIES.length]}, ${LIVE_TOPICS[Math.floor(i / LIVE_UNIVERSITIES.length) % LIVE_TOPICS.length]}? (${STEP} run ${__ENV.QA_RUN_ID} #${i})`
    name = 'fn_counselor_live'
  }
  const res = counselor(user.access_token, message, name)
  let body = null
  try { body = res.json() } catch { body = null }
  check(res, {
    'counselor 200/429': (r) => r.status === 200 || r.status === 429,
    '429 carries Retry-After': (r) => r.status !== 429 || Boolean(r.headers['Retry-After']),
  })
  ledger({ op: STEP === 'F4' || STEP === 'F5' ? 'ai_live' : 'ai_free', step: STEP, status: res.status,
    answerType: body?.answerType ?? null, requestId: body?.requestId ?? null, durMs: Math.round(res.timings.duration) })
}
