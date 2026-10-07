// C — Spike: the whole class opens the app within 5 s. QA_SPIKE_VUS=100 (then 300).
import { coldStart, GB, journeyStudent, setupIds, thresholds } from './common.js'

const VUS = Number(__ENV.QA_SPIKE_VUS || 100)
export const options = {
  scenarios: {
    spike: { executor: 'ramping-vus', startVUs: 0, gracefulRampDown: '30s',
      stages: [{ duration: '5s', target: VUS }, { duration: '3m', target: VUS }, { duration: '30s', target: 0 }] },
  },
  thresholds: {
    ...thresholds({ egressBytes: Number(__ENV.QA_EGRESS_GB || 0.15) * GB, catalogueP95: 5000 }),
    qa_cold_start_ms: ['p(95)<5000'],
  },
  summaryTrendStats: ['min', 'med', 'p(95)', 'p(99)', 'max'],
}
export const setup = setupIds
export default function (data) { journeyStudent(data) }
void coldStart
