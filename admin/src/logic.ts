import type { AdminGoal, AdminStudentSummary } from './types'

function timestamp(value: string | null): number {
  if (!value) return 0
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function prioritizeStudents(students: AdminStudentSummary[]): AdminStudentSummary[] {
  return [...students].sort((left, right) => {
    const waitingDifference = right.homeworkWaiting - left.homeworkWaiting
    if (waitingDifference !== 0) return waitingDifference
    return timestamp(right.lastActiveAt) - timestamp(left.lastActiveAt)
  })
}

export function findStudents(
  students: AdminStudentSummary[],
  query: string,
): AdminStudentSummary[] {
  const normalized = query.trim().toLowerCase()
  const prioritized = prioritizeStudents(students)
  if (!normalized) return prioritized

  return prioritized.filter((student) => {
    const goal = student.goal
    const values = [
      student.email,
      student.id,
      student.stage.label,
      goal?.destination,
      goal?.field,
      goal?.budget,
      goal?.intakeTerm,
    ]
    return values.some((value) => value?.toLowerCase().includes(normalized))
  })
}

export function goalFacts(goal: AdminGoal | null): Array<[string, string]> {
  if (!goal) return []
  return [
    ['Destination', goal.destination ?? 'Not recorded'],
    ['Field', goal.field ?? 'Not recorded'],
    ['Budget', goal.budget ?? 'Not recorded'],
    ['Intake', goal.intakeTerm ?? 'Not recorded'],
  ]
}

export function formatDateTime(value: string | null): string {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not recorded'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value < 0) return 'Size unavailable'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}
