// B — Stress ramp: +25 VUs every 2 min from 100 toward 1,500. Aborts at the first
// break (errors > 5% for 30 s, or the egress allowance); run.sh's watchdog also kills it.
// The breaking VU count is read from the time series in results/B.json.
import { GB, mixedJourney, setupIds, thresholds } from './common.js'

const stages = [{ duration: '1m', target: 100 }]
for (let vus = 125; vus <= Number(__ENV.QA_MAX_VUS || 1500); vus += 25) stages.push({ duration: '2m', target: vus })
stages.push({ duration: '10s', target: 0 })

export const options = {
  scenarios: { stress: { executor: 'ramping-vus', startVUs: 0, stages, gracefulRampDown: '0s' } },
  thresholds: {
    ...thresholds({ egressBytes: Number(__ENV.QA_EGRESS_GB || 0.4) * GB }),
    // 3× baseline p95 (pass the measured A catalogue p95 in QA_BASELINE_CATALOGUE_P95).
    'http_req_duration{kind:catalogue}': [{ threshold: `p(95)<${3 * Number(__ENV.QA_BASELINE_CATALOGUE_P95 || 2500)}`, abortOnFail: true, delayAbortEval: '30s' }],
  },
  summaryTrendStats: ['min', 'med', 'p(95)', 'p(99)', 'max'],
}
export const setup = setupIds
export default mixedJourney
