// Conversation history sent by the browser. It is untrusted input: a client can
// send anything, so only well-formed turns survive, and a history that carries a
// prompt attack is dropped for the request rather than refused.
//
// History is context, never evidence. Figures in it cannot back an answer; only
// records fetched from the database on this turn can (see prompt.ts).
import { isPromptAttack } from './scope.ts'

export type HistoryMessage = { role: 'user' | 'assistant'; content: string }

export const MAX_HISTORY_MESSAGES = 12
export const MAX_HISTORY_CHARACTERS = 1000

export function sanitizeHistory(value: unknown): HistoryMessage[] {
  if (!Array.isArray(value)) return []
  const messages: HistoryMessage[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const { role, content } = item as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') continue
    if (typeof content !== 'string') continue
    const trimmed = content.trim().slice(0, MAX_HISTORY_CHARACTERS)
    if (!trimmed) continue
    messages.push({ role, content: trimmed })
  }
  const recent = messages.slice(-MAX_HISTORY_MESSAGES)
  if (recent.some((message) => message.role === 'user' && isPromptAttack(message.content))) return []
  return recent
}

export function lastUserMessage(history: HistoryMessage[]): string | null {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].role === 'user') return history[index].content
  }
  return null
}
