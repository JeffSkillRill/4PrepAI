import { describe, expect, it } from 'vitest'
import {
  ADMIN_FILE_URL_TTL_SECONDS,
  formatAdminGoal,
  happenedWithinDays,
  homeworkIsWaiting,
  latestRecordedAt,
  safeDownloadFilename,
  submissionStoragePathBelongsToUser,
} from './contract'

describe('admin API public contract helpers', () => {
  it('keeps private homework links deliberately short-lived', () => {
    expect(ADMIN_FILE_URL_TTL_SECONDS).toBe(60)
  })

  it('formats only a recorded profile goal and keeps unresolved values null', () => {
    expect(formatAdminGoal(null)).toBeNull()
    expect(formatAdminGoal({
      country: 'United States',
      field: 'Computer Science',
      budget_max: 5000,
      budget_currency: 'usd',
      intake: 'Spring 2027',
    })).toEqual({
      destination: 'United States',
      field: 'Computer Science',
      budget: '$5,000',
      intakeTerm: 'Spring 2027',
    })
    expect(formatAdminGoal({
      country: 'United States',
      field: 'Business',
      budget_max: null,
      budget_currency: null,
      intake: 'Fall 2027',
    })?.budget).toBeNull()
  })

  it('derives last activity only from valid recorded timestamps', () => {
    expect(latestRecordedAt([
      '2026-07-01T00:00:00.000Z',
      null,
      'not-a-date',
      '2026-08-03T10:00:00.000Z',
    ])).toBe('2026-08-03T10:00:00.000Z')
    expect(latestRecordedAt([null, undefined])).toBeNull()
  })

  it('uses an explicit trailing window for active-user counts', () => {
    const now = new Date('2026-08-03T12:00:00.000Z')
    expect(happenedWithinDays('2026-07-10T12:00:00.000Z', 30, now)).toBe(true)
    expect(happenedWithinDays('2026-06-01T12:00:00.000Z', 30, now)).toBe(false)
    expect(happenedWithinDays('2026-08-04T12:00:00.000Z', 30, now)).toBe(false)
  })

  it('marks only submitted work without feedback as waiting', () => {
    expect(homeworkIsWaiting({
      status: 'pending',
      submitted_at: '2026-08-03T12:00:00.000Z',
      feedback_ref: null,
    })).toBe(true)
    expect(homeworkIsWaiting({
      status: 'reviewed',
      submitted_at: '2026-08-03T12:00:00.000Z',
      feedback_ref: 'feedback-1',
    })).toBe(false)
    expect(homeworkIsWaiting({ status: 'pending', submitted_at: null, feedback_ref: null })).toBe(false)
    expect(homeworkIsWaiting({
      status: 'submitted',
      submitted_at: '2026-08-03T12:00:00.000Z',
      feedback_ref: '   ',
    })).toBe(true)
  })

  it('accepts only canonical submission paths rooted in the owning user ID', () => {
    const userId = '63495354-7807-4623-bfbd-6e931b781555'
    expect(submissionStoragePathBelongsToUser(
      `${userId}/assignment/file.pdf`,
      userId,
    )).toBe(true)
    expect(submissionStoragePathBelongsToUser(
      '6ebdc0cc-6c84-466b-a59f-28c343ffc8f7/assignment/file.pdf',
      userId,
    )).toBe(false)
    expect(submissionStoragePathBelongsToUser(`${userId}/../file.pdf`, userId)).toBe(false)
    expect(submissionStoragePathBelongsToUser(`${userId}//file.pdf`, userId)).toBe(false)
    expect(submissionStoragePathBelongsToUser(
      `${userId}/%2e%2e/6ebdc0cc-6c84-466b-a59f-28c343ffc8f7/file.pdf`,
      userId,
    )).toBe(false)
    expect(submissionStoragePathBelongsToUser(`${userId}/assignment/file%2fpdf`, userId)).toBe(false)
    expect(submissionStoragePathBelongsToUser(`${userId}/assignment/file?.pdf`, userId)).toBe(false)
    expect(submissionStoragePathBelongsToUser(`${userId}/assignment/file#.pdf`, userId)).toBe(false)
  })

  it('removes header and path controls from the download filename', () => {
    expect(safeDownloadFilename('essay.pdf')).toBe('essay.pdf')
    expect(safeDownloadFilename('../essay\r\n".pdf')).toBe('_essay___.pdf')
    expect(safeDownloadFilename('\r\n')).toBe('homework-file')
  })
})
