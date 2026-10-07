// Counselor request path, shared by the full CounselorScreen and the
// CounselorWidget shown on every page. Kept apart from the screen so the widget
// does not pull the screen into the main bundle.
import type { CounselorAnswer } from './conversation'
import { getSupabaseClient } from '../data/client'

function isCounselorAnswer(value: unknown): value is CounselorAnswer {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CounselorAnswer>
  return ['verified_fact', 'general_guidance', 'refusal', 'out_of_scope'].includes(candidate.answerType ?? '')
    && typeof candidate.answer === 'string'
    && Array.isArray(candidate.recordCitations)
    && Array.isArray(candidate.webCitations)
    && typeof candidate.requestId === 'string'
}

type FunctionErrorResponse = Pick<Response, 'status' | 'clone'>

function responseFromFunctionError(error: unknown): FunctionErrorResponse | null {
  if (!error || typeof error !== 'object' || !('context' in error)) return null
  const context: unknown = (error as { context: unknown }).context
  if (!context || typeof context !== 'object') return null
  if (!('status' in context) || typeof context.status !== 'number') return null
  if (!('clone' in context) || typeof context.clone !== 'function') return null
  return context as FunctionErrorResponse
}

async function counselorAnswerFromResponse(response: FunctionErrorResponse): Promise<CounselorAnswer | null> {
  try {
    const payload: unknown = await response.clone().json()
    return isCounselorAnswer(payload) ? payload : null
  } catch {
    return null
  }
}

type PreflightUniversity = {
  id: string
  name: string
  university_facts: Array<{
    kind: string
    value: string | null
    unknown_reason: string | null
    suggested_action: string | null
  }>
  requirements: Array<{
    kind: string
    value: string | null
    unknown_reason: string | null
    suggested_action: string | null
  }>
}

function requestedKind(message: string): string | null {
  if (/\bapplication fee\b|\bapply fee\b/i.test(message)) return 'application_fee'
  if (/\btotal cost\b|\bcost of attendance\b|\bcoa\b/i.test(message)) return 'total_cost_of_attendance'
  if (/\broom\b.*\bboard\b|\bhousing\b.*\bmeal/i.test(message)) return 'room_board'
  if (/\bmandatory fee\b|\bstudent fee\b/i.test(message)) return 'fees'
  if (/\btuition\b|\bstudy fee\b/i.test(message)) return 'tuition'
  if (/\bdeadline\b/i.test(message)) return 'deadline'
  if (/\bfinancial certification\b|\bproof of funds\b|\bi-20\b/i.test(message)) return 'financial_certification'
  if (/\baid\b|\bscholarship\b|\bfunding\b/i.test(message)) return 'aid_international'
  if (/\btest optional\b|\btest required\b|\btesting policy\b/i.test(message)) return 'test_policy'
  if (/\btoefl\b/i.test(message)) return 'toefl'
  if (/\bielts\b/i.test(message)) return 'ielts'
  if (/\bduolingo\b|\bdet\b/i.test(message)) return 'duolingo'
  if (/\bsat\b/i.test(message)) return 'sat'
  if (/\bact\b/i.test(message)) return 'act'
  if (/\bgpa\b/i.test(message)) return 'gpa'
  return null
}

async function preflightUnknown(message: string): Promise<CounselorAnswer | null> {
  const kind = requestedKind(message)
  if (!kind) return null
  // Names first (small), then facts for the one university named — not the whole catalogue.
  const client = getSupabaseClient()
  const { data: names, error: namesError } = await client.from('universities').select('id,name')
  if (namesError || !names) return null
  const normalized = message.toLowerCase()
  const named = (names as { id: string; name: string }[]).find((item) =>
    normalized.includes(item.id.toLowerCase())
    || normalized.includes(item.name.toLowerCase()))
  if (!named) return null
  const { data, error } = await client
    .from('universities')
    .select('id,name,university_facts(kind,value,unknown_reason,suggested_action),requirements(kind,value,unknown_reason,suggested_action)')
    .eq('id', named.id)
    .maybeSingle()
  if (error || !data) return null
  const university = data as unknown as PreflightUniversity
  const record = [...university.university_facts, ...university.requirements]
    .find((fact) => fact.kind === kind)
  if (!record || record.value !== null) return null
  return {
    answerType: 'refusal',
    answer: `4Prep does not have a verified ${kind.replaceAll('_', ' ')} figure for ${university.name}.${record.suggested_action ? ` ${record.suggested_action}` : ' Please confirm it with the university.'}`,
    recordCitations: [],
    webCitations: [],
    requestId: crypto.randomUUID(),
  }
}

export async function requestCounselorAnswer(message: string): Promise<{ answer: CounselorAnswer | null; error: string | null }> {
  const preflight = await preflightUnknown(message)
  if (preflight) return { answer: preflight, error: null }

  const { data, error: functionError } = await getSupabaseClient().functions.invoke('counselor', {
    body: { message },
  })
  if (functionError) {
    const errorResponse = responseFromFunctionError(functionError)
    if (errorResponse) {
      const safeAnswer = await counselorAnswerFromResponse(errorResponse)
      if (safeAnswer) return { answer: safeAnswer, error: null }
      if (errorResponse.status === 404) {
        return { answer: null, error: 'The grounded counselor is not configured for this environment. The counselor function was not found; no unverified answer was displayed.' }
      }
    }
    if (typeof functionError === 'object' && 'name' in functionError && functionError.name === 'FunctionsFetchError') {
      return { answer: null, error: 'The grounded counselor is not configured or cannot be reached from this environment. No unverified answer was displayed.' }
    }
    return { answer: null, error: 'The grounded counselor is unavailable. No unverified answer was displayed.' }
  }
  if (isCounselorAnswer(data)) return { answer: data, error: null }
  return { answer: null, error: 'The grounded counselor returned an invalid response. No unverified answer was displayed.' }
}
