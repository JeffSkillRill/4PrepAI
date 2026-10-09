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

/**
 * Offline fallback for the conversation route: used only when the provider is
 * down, unconfigured, or returns something unusable. The model normally writes
 * these replies; this map just keeps each kind of message answered in kind.
 */
export type SmallTalkIntent = 'identity' | 'feelings' | 'thanks' | 'bye' | 'how_are_you' | 'greeting' | 'other'

const SMALL_TALK_PATTERNS: Array<[SmallTalkIntent, RegExp]> = [
  ['identity', /\b(?:are you (?:a |an )?(?:real|human|person|bot|robot|ai|machine|chatgpt|gpt)|real person|what(?:'s| is) your name|who (?:are|made|built|created) you|what (?:model|llm|ai) are you)\b/i],
  ['feelings', /\b(?:nervous|anxious|stressed|scared|afraid|worried|overwhelmed|sad|homesick|lonely|upset|depressed|unsure|confused|disappointed|rejected|hopeless)\b/i],
  ['thanks', /\b(?:thanks?|thank you|thx|ty|appreciate it)\b/i],
  ['bye', /\b(?:bye|goodbye|good night|see you|see ya|talk (?:to you )?later|cya)\b/i],
  ['how_are_you', /\bhow (?:are|r) (?:you|u)\b|\bhow(?:'s| is) (?:it going|your day|everything)\b|\bhow have you been\b|\bwhat'?s up\b/i],
  ['greeting', /^\s*(?:hi|hey|hello|hiya|yo|salom|assalomu alaykum|good (?:morning|afternoon|evening))\b/i],
]

export function smallTalkIntent(message: string): SmallTalkIntent {
  return SMALL_TALK_PATTERNS.find(([, pattern]) => pattern.test(message))?.[0] ?? 'other'
}

export const SMALL_TALK_REPLIES: Record<SmallTalkIntent, string> = {
  greeting: 'Hi! Good to hear from you. Whenever you’re ready, I can help with your US university plans.',
  how_are_you: 'I’m doing well, thanks for asking! How are your plans going?',
  thanks: 'You’re welcome! Anything else on your mind?',
  bye: 'Bye for now, and good luck! Come back any time you have a question.',
  identity: 'I’m 4Prep’s AI counselor. If you’d like to talk to a person, a human counsellor at 4Prep Academy, the team behind this app, can help too.',
  feelings: 'That feeling is completely normal, and you’re not alone in it. Want to take one small step together? Tell me where you are with your applications and we’ll work out what comes next.',
  other: 'Sorry, I can’t chat about that right now. I can still help with universities, costs, requirements, essays and visas.',
}

export function smallTalkFallback(message: string): string {
  return SMALL_TALK_REPLIES[smallTalkIntent(message)]
}

export const CHECK_PROPERLY_REPLY = 'Let me check that properly. Which university do you mean?'
