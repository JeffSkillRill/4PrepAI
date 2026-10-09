/**
 * Message router for the 4Prep counselor.
 *
 * Students talk to the counselor like a person, and everyday conversation has
 * endless phrasings, so no regex decides what counts as small talk. Code only
 * enforces the hard limits and picks the route:
 *
 * - decline: code and schoolwork, essay ghost-writing, a few unmistakable
 *   off-topic intents, and prompt attacks. A friendly fixed reply, no model call.
 * - admissions: the message names a catalogue university, asks for a fact, uses
 *   admissions vocabulary, or follows up an admissions turn. Records, verified
 *   facts and web search for general guidance, exactly as before.
 * - conversation: everything else. The model answers briefly from general
 *   knowledge, with no web search and a small output budget.
 */

export type Route = 'decline' | 'admissions' | 'conversation'
export type DeclineReason = 'attack' | 'code' | 'essay' | 'off_topic'

/**
 * Admissions vocabulary. A match sends the message down the admissions route,
 * where university records are loaded and web search is available. Kept
 * deliberately broad: the grounding contract still prevents an admissions
 * answer from producing an unsourced figure.
 */
const ADMISSIONS_PATTERNS: RegExp[] = [
  // Application process
  /\badmissions?\b|\badmitted\b|\bapplicants?\b/i,
  /\bappl(?:y|ying|ication|ications)\b/i,
  /\bcommon app\b|\bcoalition app\b|\bapply texas\b/i,
  /\bearly (?:action|decision)\b|\bregular decision\b|\brolling admission\b/i,
  /\bwaitlist(?:ed)?\b|\bdefer(?:red|ral)?\b|\breject(?:ed|ion)\b/i,
  /\bacceptance rate\b|\badmit rate\b|\bchance me\b|\bmy chances\b/i,
  /\benroll(?:ment|ing)?\b|\bmatriculat/i,
  /\bdeadlines?\b/i,

  // Institutions
  /\buniversit(?:y|ies)\b|\bcolleges?\b|\bcampus(?:es)?\b/i,
  /\bivy league\b|\bliberal arts\b|\bcommunity college\b/i,
  /\bin-?state\b|\bout-?of-?state\b/i,
  /\bhigh school\b|\bfreshman\b|\bsophomore\b|\bjunior year\b|\bsenior year\b/i,

  // Academics
  /\bmajors?\b|\bminors?\b|\bdegrees?\b|\bbachelors?\b|\bundergrad/i,
  /\bgrad(?:uate)? school\b|\bmasters?\b|\bphd\b|\bdoctorate\b/i,
  /\btranscripts?\b|\bgpa\b|\bclass rank\b|\bcoursework\b|\bprerequisites?\b/i,
  /\bcredit hours?\b|\bhonors\b|\bvaledictorian\b/i,
  /\bap (?:exam|test|score|class|course)/i,
  /\bib (?:diploma|programme|program|exam)/i,

  // Standardized tests. ACT and DET are matched case-sensitively or with a
  // qualifier, because "act" and "det" as lowercase words are far too common.
  /\bsat\b|\btoefl\b|\bielts\b|\bduolingo\b/i,
  /\btest[- ]optional\b|\btest[- ]blind\b|\bsuperscor/i,
  /\bstandardi[sz]ed test\b|\bentrance exam\b/i,
  /\bACT\b|\bDET\b/,
  /\bact (?:test|score|exam|section)\b/i,

  // Application materials
  /\bessays?\b|\bpersonal statement\b|\bsupplemental\b|\bwriting supplement\b/i,
  /\b(?:letters? of )?recommendations?\b|\brec letters?\b|\brecommenders?\b/i,
  /\bactivity list\b|\bextracurricular/i,
  /\bportfolio\b|\baudition\b|\badmissions? interview\b/i,
  /\bresum[eé]\b|\bcv\b/i,

  // Money
  /\btuition\b|\bscholarships?\b|\bfinancial aid\b|\bfin aid\b/i,
  /\bfafsa\b|\bcss profile\b|\bisfaa\b/i,
  /\bneed-?(?:blind|based|aware)\b|\bmerit (?:aid|scholarship)\b/i,
  /\bgrants?\b|\bstudent loans?\b|\bbursar/i,
  /\bstipends?\b|\bfee waiver\b|\bapplication fee\b/i,
  /\bcost of attendance\b|\bcoa\b|\bnet price\b|\bnet cost\b/i,
  /\broom and board\b|\bmeal plan\b|\bhousing cost\b/i,
  /\btuition waiver\b|\bfunding\b|\bsponsor(?:ship)?\b|\bafford\b/i,

  // Visa and international status
  /\bvisas?\b|\bf-?1\b|\bj-?1\b|\bm-?1\b|\bi-?20\b/i,
  /\bsevis\b|\bds-?160\b|\bembassy\b|\bconsulate\b|\bpassports?\b/i,
  /\bproof of funds\b|\bfinancial certification\b|\bbank statements?\b/i,
  /\binternational students?\b|\bstudy abroad\b|\bstudying in the u\.?s\b/i,
  /\bopt\b|\bcpt\b|\bwork authori[sz]ation\b|\bwork[- ]study\b/i,
  /\bon-?campus (?:job|work|employment)\b/i,

  // Campus life directly tied to the application decision
  /\bdorms?\b|\bdormitor|\broommates?\b|\borientation\b/i,
  /\bsemesters?\b|\bquarter system\b|\bacademic year\b/i,
  /\bguidance counselor\b|\bacademic advis/i,
  /\btransfer(?:ring)? (?:student|credit|to|from)\b|\bgap year\b/i,

  // Extracurricular record. 4Prep reads these as evidence of specific qualities,
  // so students are expected to ask how to present them.
  /\bolympiads?\b|\bmodel un\b|\bmun conference\b|\bdebate (?:team|club)\b/i,
  /\bvolunteer(?:ing|ed)?\b|\bcommunity service\b/i,
  /\bstudent (?:organi[sz]ation|government|club|society)\b/i,
  /\bleadership (?:role|position|experience)\b|\bteam captain\b/i,
  /\bresearch (?:project|experience|assistant|lab)\b|\bscience fair\b/i,
  /\binternships?\b|\bshadowing\b/i,

  // Career outcomes — the Φ fit score has a career component, so this is
  // in remit. Qualified rather than bare "career", which is too broad.
  /\bcareer (?:goals?|path|prospects?|outcomes?|options?|plans?)\b/i,
  /\bjob (?:prospects?|market|after graduation)\b|\bemployab/i,
  /\bafter (?:i )?graduat/i,

  // Adjusting to a US classroom — a large part of what 4Prep prepares students for.
  /\bculture shock\b|\bcross-?cultural\b|\badjust(?:ing)? to (?:life|study|class)/i,
  /\bclass participation\b|\boffice hours\b|\bprofessors?\b|\bseminars?\b/i,
  /\bgroup projects?\b|\bpresentations? in class\b/i,

  // The product itself
  /\b4prep\b|\bfit score\b|\bshortlist\b/i,
]

/**
 * Code and schoolwork. Each pattern needs an explicit request verb plus an
 * unmistakably non-admissions object, so "write me a Python script for my
 * college project" is declined even though it says "college".
 */
const CODE_PATTERNS: RegExp[] = [
  /\b(?:write|create|generate|fix|debug|refactor|review)\b[^.?!]{0,40}\b(?:code|script|program|function|(?<!common |coalition )app|website|component|algorithm|query)\b/i,
  /\b(?:python|javascript|typescript|java|c\+\+|golang|sql|react|node\.?js)\b[^.?!]{0,30}\b(?:code|script|function|error|bug|syntax)\b/i,
  /\b(?:do|finish|complete|solve)\b[^.?!]{0,15}\bmy (?:homework|assignment|coursework|worksheet|exam|test questions)\b/i,
]

/**
 * Ghost-writing an admissions essay. Coaching stays open: "help me write my
 * essay" and "how do I write my personal statement" are not matched.
 */
const ESSAY_GHOSTWRITING_PATTERNS: RegExp[] = [
  /(?<!\bhelp (?:me )?|\bhow (?:do|can|should|to) (?:i )?)\b(?:write|draft|compose)\s+(?:me\s+)?my\s+(?:\w+\s+){0,2}(?:personal statement|essays?|supplements?|supplemental essays?)\b/i,
  /\b(?:write|draft|compose)\b[^.?!]{0,20}\b(?:whole|entire|full|complete)\b[^.?!]{0,20}\b(?:personal statement|essay)\b/i,
  /\b(?:personal statement|essay)\b[^.?!]{0,30}\bfor me\b/i,
]

/** Other unmistakable off-topic requests, kept deliberately narrow. */
const OFF_TOPIC_PATTERNS: RegExp[] = [
  /\brecipe for\b|\bhow (?:do i|to) (?:cook|bake|make)\b[^.?!]{0,20}\b(?:food|dinner|cake|bread|meal)\b/i,
  /\b(?:dosage|prescription|diagnos[ei]|symptoms? of|treat(?:ment)? for)\b/i,
  /\bwrite (?:me )?a (?:poem|song|joke|rap|limerick|screenplay)\b/i,
  /\b(?:stock price|crypto(?:currency)?|bitcoin|forex|should i invest)\b/i,
]

/**
 * Attempts to redirect the counselor away from its role, or to read its
 * configuration. Declined with a friendly redirect rather than acknowledged.
 * "What model are you?" is not an attack: the counselor answers that it is
 * 4Prep's AI counselor, without naming a model or provider.
 */
const PROMPT_ATTACK_PATTERNS: RegExp[] = [
  /\b(?:ignore|disregard|forget|override)\b[^.?!]{0,30}\b(?:previous|prior|above|earlier|all|your)\b[^.?!]{0,20}\b(?:instructions?|prompts?|rules?|directives?)\b/i,
  /\b(?:system prompt|your prompt|your instructions|initial prompt)\b/i,
  /\b(?:jailbreak|dan mode|developer mode|pretend you are|act as (?:if you|a)\b)/i,
]

/**
 * Feelings about the process ("I am nervous about applying") belong in a warm
 * conversation, even though "applying" is admissions vocabulary.
 */
const FEELINGS_PATTERN =
  /\b(?:i'?m|i am|i feel|feeling|i've been|i get|so)\b[^.?!]{0,20}\b(?:nervous|anxious|stressed|scared|afraid|worried|overwhelmed|sad|homesick|lonely|upset|depressed|lost|unsure|confused|excited|disappointed|rejected|hopeless|tired|burn(?:ed|t) out)\b/i

/** Starter questions shown under the opener and under every decline. */
export const SCOPE_SUGGESTIONS: string[] = [
  'What is the application fee at MIT?',
  'What TOEFL score does Clark University require?',
  'How do I write a strong personal statement?',
  'What documents do I need for an F-1 visa interview?',
]

const CAN_HELP = 'I’m happy to help with your university plans: choosing schools, requirements, costs, essays or visas.'

export const DECLINE_MESSAGES: Record<DeclineReason, string> = {
  attack: `Let’s keep our chat about your plans. ${CAN_HELP}`,
  code: `I can’t help with code or schoolwork, but ${CAN_HELP.charAt(0).toLowerCase()}${CAN_HELP.slice(1)}`,
  essay: 'I can’t write your essay for you. It needs to be in your own voice, and that is what admissions readers look for. I’d love to coach you, though: tell me your idea or paste a draft and I’ll give you feedback.',
  off_topic: `That’s not something I can help with, but ${CAN_HELP.charAt(0).toLowerCase()}${CAN_HELP.slice(1)}`,
}

/** Why a message must be declined without a model call, or null. */
export function declineReason(message: string): DeclineReason | null {
  const trimmed = message.trim()
  if (PROMPT_ATTACK_PATTERNS.some((pattern) => pattern.test(trimmed))) return 'attack'
  if (CODE_PATTERNS.some((pattern) => pattern.test(trimmed))) return 'code'
  if (ESSAY_GHOSTWRITING_PATTERNS.some((pattern) => pattern.test(trimmed))) return 'essay'
  if (OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(trimmed))) return 'off_topic'
  return null
}

export function isHardRefusal(message: string): boolean {
  return declineReason(message) !== null
}

export function isPromptAttack(message: string): boolean {
  return PROMPT_ATTACK_PATTERNS.some((pattern) => pattern.test(message))
}

export function isAdmissionsTopic(message: string): boolean {
  return ADMISSIONS_PATTERNS.some((pattern) => pattern.test(message))
}

export function expressesFeelings(message: string): boolean {
  return FEELINGS_PATTERN.test(message)
}

/** A follow-up such as "and the deadline?" or "why?" is short. */
const FOLLOW_UP_MAX_WORDS = 8

export function isShortMessage(message: string): boolean {
  return message.trim().split(/\s+/).filter(Boolean).length <= FOLLOW_UP_MAX_WORDS
}

/**
 * Words that tie a message to what was just said: "and the deadline?", "why?",
 * "is that a lot?", "what about Yale?". A short message without one stands on
 * its own and is routed on its own.
 */
const FOLLOW_UP_PATTERN =
  /^(?:and|but|so|also|then|or|what about|how about|why|why not|how come|really|is that|are they|does (?:it|that|this|she|he|they)|do they|can i|could i|should i|would (?:it|that)|what if|which one|tell me more|more|explain|go on|example)\b|\b(?:it|its|that|this|those|these|they|them|their|there|both|either|same|instead|else)\b/i

export function isFollowUp(message: string): boolean {
  return isShortMessage(message) && FOLLOW_UP_PATTERN.test(message.trim())
}

export type RouteContext = {
  /** The message names a catalogue university. */
  namesUniversity?: boolean
  /** The message asks for a specific fact such as a fee or a deadline. */
  asksForFact?: boolean
  /** The student's previous message in this conversation took the admissions route. */
  previousTurnAdmissions?: boolean
}

/**
 * Picks the route for a student message.
 *
 * Order matters: declines come first so no admissions keyword, university name
 * or earlier admissions turn can unlock them.
 */
export function routeMessage(message: string, context: RouteContext = {}): Route {
  const trimmed = message.trim()
  if (!trimmed) return 'conversation'
  if (isHardRefusal(trimmed)) return 'decline'
  if (context.namesUniversity || context.asksForFact) return 'admissions'
  if (expressesFeelings(trimmed)) return 'conversation'
  if (isAdmissionsTopic(trimmed)) return 'admissions'
  if (context.previousTurnAdmissions && isFollowUp(trimmed)) return 'admissions'
  return 'conversation'
}
