// Deterministic counselor replies, written in the counselor's own voice: short,
// warm, plain English for a second-language reader, and honest without
// describing the system's internal rules.

const KIND_LABELS: Record<string, string> = {
  application_fee: 'application fee',
  total_cost_of_attendance: 'total cost of attendance',
  room_board: 'room and board cost',
  fees: 'mandatory fees',
  tuition: 'tuition',
  deadline: 'application deadline',
  financial_certification: 'proof-of-funds amount',
  aid_international: 'financial aid for international students',
  test_policy: 'testing policy',
  toefl: 'TOEFL requirement',
  ielts: 'IELTS requirement',
  duolingo: 'Duolingo English Test requirement',
  sat: 'SAT information',
  act: 'ACT information',
  gpa: 'GPA information',
}

export function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind.replaceAll('_', ' ')
}

/** The student seems to name a school, rather than leaving the school out. */
function mentionsSomeSchool(message: string): boolean {
  return /\buniversit(?:y|ies)\b|\bcollege\b|\binstitute\b|\b(?:at|for|of|in)\s+[A-Z][\w&.-]*/.test(message)
}

export function askWhichUniversity(kind: string, message: string): string {
  if (mentionsSomeSchool(message)) {
    return `I don’t have that school in my records yet. Which university did you mean? Its full name helps, and I can then look up the ${kindLabel(kind)} for you.`
  }
  return `Happy to help with the ${kindLabel(kind)}. Which university are you asking about?`
}

export function unknownFigureReply(kind: string, universities: string[], suggestedAction: string | null | undefined): string {
  const names = universities.join(' and ')
  const next = suggestedAction?.trim() || 'The university’s admissions office can confirm it for you.'
  return `I don’t have a verified ${kindLabel(kind)} for ${names} yet, so I won’t guess. ${next} Is there anything else about ${universities.length === 1 ? 'this school' : 'these schools'} I can help with?`
}

export const REPLIES = {
  unavailable: 'Sorry, I can’t answer right now. Please try again in a little while.',
  rateLimited: 'You’re asking faster than I can keep up. Please wait a minute, then ask again. The university pages in 4Prep are still there to browse.',
  notConfigured: 'Sorry, I can’t answer questions just yet. You can still browse every university page in 4Prep.',
  providerFailed: 'Sorry, I couldn’t answer that just now. Please try again.',
  cannotConfirm: 'I couldn’t confirm that from the information I have, so I’d rather not guess. The university’s page in 4Prep or its admissions office can help.',
  profileCannotConfirm: 'I couldn’t explain this fit from the information I have for this university.',
} as const
