// Decides what one counselor turn is about before any record is loaded or any
// model is called: its scope, the universities it concerns and the fact it asks
// for. Pure, so every follow-up rule is unit-testable.
import { lastUserMessage, type HistoryMessage } from './history.ts'
import { matchUniversities, type NamedUniversity } from './match.ts'
import { declineReason, isAdmissionsTopic, isShortMessage, routeMessage, type DeclineReason } from './scope.ts'

export function targetedKind(message: string): string | null {
  if (/\bapplication fee\b|\bapply fee\b/i.test(message)) return 'application_fee'
  if (/\btotal cost\b|\bcost of attendance\b|\bcoa\b/i.test(message)) return 'total_cost_of_attendance'
  if (/\broom\b.*\bboard\b|\bhousing\b.*\bmeal/i.test(message)) return 'room_board'
  if (/\bmandatory fee\b|\bstudent fee\b/i.test(message)) return 'fees'
  if (/\btuition\b|\bstudy fee\b/i.test(message)) return 'tuition'
  if (/\bdeadline\b|\bwhen (?:do|should) i apply\b/i.test(message)) return 'deadline'
  if (/\bfinancial certification\b|\bproof of funds\b|\bi-20\b/i.test(message)) return 'financial_certification'
  if (/\baid\b|\bscholarship\b|\bfunding\b|\btuition waiver\b/i.test(message)) return 'aid_international'
  if (/\btest optional\b|\btest required\b|\btesting policy\b/i.test(message)) return 'test_policy'
  if (/\btoefl\b/i.test(message)) return 'toefl'
  if (/\bielts\b/i.test(message)) return 'ielts'
  if (/\bduolingo\b|\bdet\b/i.test(message)) return 'duolingo'
  if (/\bsat\b/i.test(message)) return 'sat'
  if (/\bact\b/i.test(message)) return 'act'
  if (/\bgpa\b/i.test(message)) return 'gpa'
  return null
}

export type TurnPlan =
  | { route: 'decline'; reason: DeclineReason }
  | { route: 'conversation' }
  | {
    route: 'admissions'
    universityIds: string[]
    kind: string | null
    /** A fact was asked for but no university could be resolved: ask which one. */
    needsUniversity: boolean
  }

export function planTurn(message: string, history: HistoryMessage[], catalogue: NamedUniversity[]): TurnPlan {
  // Declines win before any context can unlock them.
  const reason = declineReason(message)
  if (reason) return { route: 'decline', reason }

  const named = matchUniversities(message, catalogue)
  const previous = lastUserMessage(history)
  const previousIds = previous ? matchUniversities(previous, catalogue) : []
  const previousAdmissions = previous !== null && routeMessage(previous, {
    namesUniversity: previousIds.length > 0,
    asksForFact: targetedKind(previous) !== null,
  }) === 'admissions'

  let kind = targetedKind(message)
  const route = routeMessage(message, {
    namesUniversity: named.length > 0,
    asksForFact: kind !== null,
    previousTurnAdmissions: previousAdmissions,
  })
  if (route !== 'admissions') return { route: 'conversation' }

  let universityIds = named
  if (previous !== null && previousAdmissions) {
    // "What about Yale?" after "What is MIT's application fee?" asks for Yale's fee.
    if (named.length > 0 && !kind && isShortMessage(message)) kind = targetedKind(previous)
    // "And the deadline?" or "why?" continue with the universities just discussed.
    // A question that stands on its own ("How do I write an essay?") does not.
    const standsAlone = isAdmissionsTopic(message) && !kind
    if (named.length === 0 && !standsAlone) universityIds = previousIds
  }
  return { route: 'admissions', universityIds, kind, needsUniversity: Boolean(kind) && universityIds.length === 0 }
}
