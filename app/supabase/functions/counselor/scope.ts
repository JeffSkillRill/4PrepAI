/**
 * Topic scope gate for the 4Prep counselor.
 *
 * The counselor is a college-admissions advisor, not a general assistant. Without
 * this gate any question that does not name a catalogue university and does not
 * match a fee/test/deadline keyword falls straight through to the web-search
 * provider, which will answer anything at all. That is both off-brand and a
 * direct spend of Perplexity budget on questions 4Prep has no business answering.
 *
 * Design: a deterministic keyword allowlist. Zero latency, zero API cost, and
 * every decision is testable. The trade-off is that unusual phrasings can be
 * wrongly refused — which is why the refusal always shows the student concrete
 * examples of what they CAN ask, rather than a dead end.
 */

export type ScopeVerdict = 'in_scope' | 'greeting' | 'out_of_scope'

/**
 * Questions 4Prep exists to answer. A message needs at least one of these to
 * reach the provider. Kept deliberately broad — recall matters more than
 * precision here, because the downstream grounding contract still prevents an
 * in-scope question from producing an unsourced figure.
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
 * High-confidence off-topic intents that OVERRIDE the allowlist. These exist for
 * messages that smuggle in an admissions word — "write me a Python script for my
 * college project" contains "college" but is not an admissions question.
 *
 * Kept deliberately narrow. Each pattern requires an explicit request verb plus
 * an unmistakably non-admissions object, so an on-topic question cannot trip it
 * by accident.
 */
const HARD_OFF_TOPIC_PATTERNS: RegExp[] = [
  /\b(?:write|create|generate|fix|debug|refactor|review)\b[^.?!]{0,40}\b(?:code|script|program|function|app|website|component|algorithm|query)\b/i,
  /\b(?:python|javascript|typescript|java|c\+\+|golang|sql|react|node\.?js)\b[^.?!]{0,30}\b(?:code|script|function|error|bug|syntax)\b/i,
  /\brecipe for\b|\bhow (?:do i|to) (?:cook|bake|make)\b[^.?!]{0,20}\b(?:food|dinner|cake|bread|meal)\b/i,
  /\b(?:dosage|prescription|diagnos[ei]|symptoms? of|treat(?:ment)? for)\b/i,
  /\bwrite (?:me )?a (?:poem|song|joke|rap|limerick|screenplay)\b/i,
  /\b(?:stock price|crypto(?:currency)?|bitcoin|forex|should i invest)\b/i,
]

/**
 * Attempts to redirect the counselor away from its role, or to interrogate its
 * configuration. Refused with the same friendly out-of-scope message rather than
 * acknowledged, so there is nothing to probe against.
 */
const PROMPT_ATTACK_PATTERNS: RegExp[] = [
  /\b(?:ignore|disregard|forget|override)\b[^.?!]{0,30}\b(?:previous|prior|above|earlier|all)\b[^.?!]{0,20}\b(?:instructions?|prompts?|rules?|directives?)\b/i,
  /\b(?:system prompt|your prompt|your instructions|initial prompt)\b/i,
  /\b(?:jailbreak|dan mode|developer mode|pretend you are|act as (?:if you|a)\b)/i,
  /\b(?:what|which) (?:model|llm|ai) are you\b|\bare you (?:chatgpt|gpt|claude|gemini)\b/i,
]

/**
 * Social openers and questions about the counselor itself ("Hello how can you
 * help me", "who are you") deserve a welcome, not a refusal. Anchored at both
 * ends: a greeting followed by a real question is judged on that question.
 */
const GREETING_WORDS = String.raw`(?:hi|hey|hello|hiya|yo|salom|assalomu alaykum|good (?:morning|afternoon|evening)|how are you(?: doing)?|what'?s up|thanks?(?: a lot| so much)?|thank you(?: so much)?|thx|ok(?:ay)?|cool|great|bye|goodbye)(?:\s+(?:there|counselor|4prep))?`
const META_QUESTIONS = String.raw`(?:(?:so|and|but)\s+)?(?:how (?:can|could|will|do|would) you (?:help|assist)(?: me)?(?: with anything)?|what (?:can|could|do) you (?:do|help(?: me)? with|offer)(?: for me)?|what (?:do|can) i ask(?: you)?|who are you|what are you|what do you do|what is this|how does this work|can you help(?: me)?|help(?: me)?)`
const GREETING_PATTERN = new RegExp(
  String.raw`^(?:${GREETING_WORDS}(?:[\s!.,?]+${META_QUESTIONS})?|${META_QUESTIONS})[\s!.,?]*$`,
  'i',
)

/** Starter questions shown with the welcome and with every out-of-scope reply. */
export const SCOPE_SUGGESTIONS: string[] = [
  'What is the application fee at MIT?',
  'What TOEFL score does Clark University require?',
  'How do I write a strong personal statement?',
  'What documents do I need for an F-1 visa interview?',
]

export const OUT_OF_SCOPE_MESSAGE =
  'That one is outside what I can help with. I am here for applying to US universities as an international student: choosing schools, entry requirements, costs and aid, essays, deadlines and student visas. Want to try one of these?'

export const GREETING_MESSAGE =
  'Hi, I am your 4Prep counselor. I can help you plan your applications to US universities: what a school costs, test and English requirements, deadlines, essays, financial aid and the F-1 student visa. You make the decisions; I help you see your options clearly. What would you like to start with?'

/** Code requests and prompt attacks. These win over every other signal. */
export function isHardRefusal(message: string): boolean {
  const trimmed = message.trim()
  return PROMPT_ATTACK_PATTERNS.some((pattern) => pattern.test(trimmed))
    || HARD_OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(trimmed))
}

export function isPromptAttack(message: string): boolean {
  return PROMPT_ATTACK_PATTERNS.some((pattern) => pattern.test(message))
}

/** A follow-up such as "and the deadline?" or "why?" is short. */
const FOLLOW_UP_MAX_WORDS = 8

export function isShortMessage(message: string): boolean {
  return message.trim().split(/\s+/).filter(Boolean).length <= FOLLOW_UP_MAX_WORDS
}

export type ScopeContext = {
  /** The message names a catalogue university. */
  namesUniversity?: boolean
  /** The student's previous message in this conversation was in scope. */
  previousTurnInScope?: boolean
}

/**
 * Classifies a student message against the counselor's remit.
 *
 * Order matters: prompt attacks and hard off-topic intents are checked first so
 * they cannot be unlocked by an admissions keyword, a university name, or a
 * conversation that was in scope a moment ago.
 */
export function classifyScope(message: string, context: ScopeContext = {}): ScopeVerdict {
  const trimmed = message.trim()
  if (!trimmed) return 'out_of_scope'
  if (isHardRefusal(trimmed)) return 'out_of_scope'
  if (GREETING_PATTERN.test(trimmed)) return 'greeting'
  // Catalogue matching replaces the old hard-coded school list: naming any
  // listed university is an admissions question.
  if (context.namesUniversity) return 'in_scope'
  if (ADMISSIONS_PATTERNS.some((pattern) => pattern.test(trimmed))) return 'in_scope'
  // Each message used to be judged alone, so "and the deadline?" was refused.
  if (context.previousTurnInScope && isShortMessage(trimmed)) return 'in_scope'
  return 'out_of_scope'
}
