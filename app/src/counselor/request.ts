// Counselor request path, shared by the full CounselorScreen and the
// CounselorWidget shown on every page. Kept apart from the screen so the widget
// does not pull the screen into the main bundle.
import { ANSWER_TYPES, type CounselorAnswer, type CounselorHistoryMessage } from './conversation'
import { getSupabaseClient } from '../data/client'

function isCounselorAnswer(value: unknown): value is CounselorAnswer {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CounselorAnswer>
  return ANSWER_TYPES.includes(candidate.answerType ?? '')
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

/**
 * Asks the counselor Edge Function. Every answer, including an unknown figure,
 * comes from the server, which sees the conversation; `history` is context the
 * server validates and never treats as evidence.
 */
export async function requestCounselorAnswer(
  message: string,
  history: CounselorHistoryMessage[] = [],
): Promise<{ answer: CounselorAnswer | null; error: string | null }> {
  const { data, error: functionError } = await getSupabaseClient().functions.invoke('counselor', {
    body: { message, history },
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
