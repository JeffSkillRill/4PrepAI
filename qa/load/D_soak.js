// D — Soak: 100 VUs for 60 min (QA_SOAK_MIN / QA_SOAK_VUS shrink it if egress is tight).
// Crosses the 60-min JWT expiry, so every authenticated VU must refresh once.
import { GB, mixedJourney, setupIds, thresholds } from './common.js'

const VUS = Number(__ENV.QA_SOAK_VUS || 100)
export const options = {
  scenarios: {
    soak: { executor: 'ramping-vus', startVUs: 0, gracefulRampDown: '30s',
      stages: [{ duration: '2m', target: VUS }, { duration: `${Number(__ENV.QA_SOAK_MIN || 60)}m`, target: VUS }, { duration: '1m', target: 0 }] },
  },
  thresholds: {
    ...thresholds({ egressBytes: Number(__ENV.QA_EGRESS_GB || 0.5) * GB }),
    'checks{check:token refreshed}': ['rate==1'],
  },
  summaryTrendStats: ['min', 'med', 'p(95)', 'p(99)', 'max'],
}
export const setup = setupIds
export default mixedJourney
