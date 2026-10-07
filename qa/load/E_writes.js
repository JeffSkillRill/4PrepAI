// E — Write storm: 100 authenticated VUs writing with no think time for 10 min.
// Support sends honour rate_limited / retry_after_seconds like the real client queue.
import { sleep } from 'k6'
import exec from 'k6/execution'
import { completeLesson, GB, saveProfile, saveUniversity, setupIds, supportSend, thresholds, unsaveUniversity, vuUser } from './common.js'

export const options = {
  scenarios: { storm: { executor: 'constant-vus', vus: Number(__ENV.QA_STORM_VUS || 100), duration: __ENV.QA_STORM_DURATION || '10m' } },
  thresholds: thresholds({ egressBytes: Number(__ENV.QA_EGRESS_GB || 0.05) * GB }),
  summaryTrendStats: ['min', 'med', 'p(95)', 'p(99)', 'max'],
}
export const setup = setupIds

let retryAt = 0
let seq = 0
export default function (data) {
  const user = vuUser()
  if (!user) throw new Error('E requires seeded users (npm run seed)')
  const unis = data.universityIds.slice((exec.vu.idInTest * 5) % data.universityIds.length).concat(data.universityIds).slice(0, 5)
  for (const id of unis) saveUniversity(user, id)
  for (const id of unis.slice(0, 3)) unsaveUniversity(user, id)
  saveProfile(user, exec.vu.iterationInScenario % 101)
  if (data.lessonIds.length) completeLesson(user, data.lessonIds[exec.vu.iterationInScenario % data.lessonIds.length])
  if (Date.now() >= retryAt) {
    seq += 1
    const result = supportSend(user, seq)
    if (result.status === 'rate_limited') retryAt = Date.now() + result.retryAfter * 1000
    // Idempotency probe: a retried send with the SAME id must not create a second row.
    else if (result.status === 'sent' && seq % 3 === 0) supportSend(user, seq, result.messageId)
  }
  sleep(0.2)
}
