// A — Baseline: realistic peak (100 students), steady 15 min.
import { GB, mixedJourney, setupIds, thresholds } from './common.js'

export const options = {
  scenarios: {
    baseline: { executor: 'ramping-vus', startVUs: 0, gracefulRampDown: '30s',
      stages: [{ duration: '2m', target: 100 }, { duration: '15m', target: 100 }, { duration: '1m', target: 0 }] },
  },
  thresholds: thresholds({ egressBytes: Number(__ENV.QA_EGRESS_GB || 0.25) * GB }),
  summaryTrendStats: ['min', 'med', 'p(95)', 'p(99)', 'max'],
}
export const setup = setupIds
export default mixedJourney
