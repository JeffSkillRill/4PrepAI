// The counselor request flow. index.ts wires it to Deno and the real Supabase
// client; tests wire it to fakes, so every conversation rule can be exercised
// end to end without a network.
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import {
  buildCounselorCacheKey,
  buildProfileFitRationale,
  buildVerifiedFactAnswer,
  hashCallerIp,
  knownContext,
  validateFigures,
  type CatalogUniversity,
  type GroundingRecord,
} from './grounding.ts'
import { sanitizeHistory, type HistoryMessage } from './history.ts'
import { matchUniversities, type NamedUniversity } from './match.ts'
import { buildSystemPrompt, formatToday } from './prompt.ts'
import {
  AGENT_API_URL,
  CONVERSATION_MAX_OUTPUT_TOKENS,
  buildAgentRequest,
  parseAgentPayload,
  resolveAgentModel,
  type ParsedProviderPayload,
} from './provider.ts'
import { REPLIES, askWhichUniversity, smallTalkFallback, unknownFigureReply } from './replies.ts'
import { DECLINE_MESSAGES, SCOPE_SUGGESTIONS } from './scope.ts'
import { planTurn, targetedKind } from './turn.ts'

const ANONYMOUS_MINUTE_LIMIT = 8
const ANONYMOUS_HOUR_LIMIT = 40
const AUTHENTICATED_MINUTE_LIMIT = 20
const AUTHENTICATED_HOUR_LIMIT = 200
const CACHE_TTL_SECONDS = 24 * 60 * 60
const PERPLEXITY_TIMEOUT_MS = 25_000
const CACHE_VERSION = 'counselor-cache-v4'
const PHI_VERSION = 'phi-v0.3'
const PROMPT_VERSION = 'counselor-prompt-v7'
const CATALOG_EVIDENCE_SELECT = 'id,name,university_facts(kind,value,source_id,unknown_reason,suggested_action),requirements(kind,value,source_id,unknown_reason,suggested_action),university_scholarships(scholarships(name,amount_value,amount_source_id,amount_unknown_reason,amount_suggested_action))'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Expose-Headers': 'Retry-After',
}

export type CounselorAnswer = {
  /** 'greeting' is no longer sent; it stays valid for turns stored by earlier clients. */
  answerType: 'verified_fact' | 'general_guidance' | 'refusal' | 'out_of_scope' | 'greeting' | 'clarification' | 'conversation'
  answer: string
  recordCitations: string[]
  webCitations: string[]
  suggestions?: string[]
  requestId: string
}

type CachedCounselorAnswer = Omit<CounselorAnswer, 'requestId' | 'suggestions'>

type RequestOutcome =
  | 'local_response'
  | 'cache_hit'
  | 'live_call'
  | 'out_of_scope'
  | 'provider_failure'
  | 'server_failure'

export type CounselorDeps = {
  env: (name: string) => string | undefined
  createClient: (url: string, key: string, options: Record<string, unknown>) => SupabaseClient
  fetch: typeof fetch
  /** Clock for the date in the system prompt; injectable for tests. */
  now?: () => Date
}

function clarification(requestId: string, answer: string): CounselorAnswer {
  return { answerType: 'clarification', answer, recordCitations: [], webCitations: [], requestId }
}

/**
 * Version-skew shim. Browsers still running the pre-chat client never send
 * `history` and reject answer types they do not know, so for them a clarifying
 * question goes out as a refusal and a conversation reply as general guidance
 * (their least misleading banner). Remove once every deployed client sends
 * `history`.
 */
function forLegacyClient(answer: CounselorAnswer): CounselorAnswer {
  if (answer.answerType === 'greeting') return { ...answer, answerType: 'out_of_scope' }
  if (answer.answerType === 'clarification') return { ...answer, answerType: 'refusal' }
  if (answer.answerType === 'conversation') return { ...answer, answerType: 'general_guidance' }
  return answer
}

function refusal(requestId: string, answer: string): CounselorAnswer {
  return { answerType: 'refusal', answer, recordCitations: [], webCitations: [], requestId }
}

function cachedAnswer(value: unknown): CachedCounselorAnswer | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<CachedCounselorAnswer>
  if (candidate.answerType !== 'verified_fact' && candidate.answerType !== 'general_guidance') return null
  if (typeof candidate.answer !== 'string' || !candidate.answer) return null
  if (!Array.isArray(candidate.recordCitations) || !candidate.recordCitations.every((item) => typeof item === 'string')) return null
  if (!Array.isArray(candidate.webCitations) || !candidate.webCitations.every((item) => typeof item === 'string')) return null
  return candidate as CachedCounselorAnswer
}

function recordsForKind(records: GroundingRecord[], kind: string) {
  return records.filter((record) =>
    record.field === kind || (kind === 'aid_international' && record.field === 'scholarship_amount'))
}

export function createCounselorHandler({ env, createClient, fetch: fetchProvider, now = () => new Date() }: CounselorDeps) {
  async function logStrike(requestId: string, userId: string | null, detail: string) {
    const url = env('SUPABASE_URL')
    const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !serviceKey) {
      console.error('COUNSELOR_STRIKE', { requestId, userId, detail })
      return
    }
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { error } = await admin.from('counselor_strikes').insert({
      request_id: requestId,
      user_id: userId,
      strike_type: 'untraceable_figure',
      detail,
    })
    if (error) console.error('COUNSELOR_STRIKE_LOG_FAILED', error.message, { requestId, detail })
  }

  return async function handle(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    const requestId = crypto.randomUUID()
    let legacyClient = false
    const json = (value: unknown, status = 200, extraHeaders: Record<string, string> = {}) => new Response(JSON.stringify(
      legacyClient && value && typeof value === 'object' && 'answerType' in value ? forLegacyClient(value as CounselorAnswer) : value,
    ), {
      status,
      headers: { ...corsHeaders, ...extraHeaders, 'Content-Type': 'application/json' },
    })
    let completeRequest: ((outcome: RequestOutcome, cacheKey?: string) => Promise<void>) | null = null

    try {
      const body = await request.json()
      const mode = body?.mode === 'profile_rationale' ? 'profile_rationale' : 'chat'
      const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 1000) : ''
      if (mode === 'chat' && !message) return json({ error: 'A counselor message is required.' }, 400)
      // Untrusted: validated, bounded, and dropped whole if it carries a prompt attack.
      const history: HistoryMessage[] = sanitizeHistory(body?.history)
      legacyClient = mode === 'chat' && !Array.isArray(body?.history)

      const url = env('SUPABASE_URL')
      const anonKey = env('SUPABASE_ANON_KEY')
      const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY')
      const ipSalt = env('COUNSELOR_IP_SALT')
      if (!url || !anonKey || !serviceKey || !ipSalt) {
        return json(refusal(requestId, REPLIES.unavailable), 503)
      }
      const authHeader = request.headers.get('Authorization') ?? ''
      const database = createClient(url, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      })
      if (mode === 'profile_rationale') {
        const universityId = typeof body?.universityId === 'string' ? body.universityId : ''
        const profileField = typeof body?.profile?.field === 'string' ? body.profile.field.trim().slice(0, 120) : ''
        const fitLabel = typeof body?.fit?.label === 'string' ? body.fit.label.trim().slice(0, 80) : ''
        if (!universityId || !profileField || !fitLabel) return json({ error: 'A university, profile field, and fit are required.' }, 400)
        const { data: rationaleRows, error: rationaleError } = await database
          .from('universities')
          .select(CATALOG_EVIDENCE_SELECT)
          .eq('id', universityId)
          .maybeSingle()
        if (rationaleError) throw rationaleError
        const university = rationaleRows as unknown as CatalogUniversity | null
        if (!university) return json({ error: 'University not found.' }, 404)
        const rationale = buildProfileFitRationale(university.name, profileField, fitLabel, knownContext([university]))
        const validation = validateFigures(rationale.answer, knownContext([university]), rationale.citations, 'verified_fact')
        if (!validation.ok && rationale.citations.length > 0) return json(refusal(requestId, REPLIES.profileCannotConfirm))
        return json({ answerType: 'verified_fact', answer: rationale.answer, recordCitations: rationale.citations, webCitations: [], requestId } satisfies CounselorAnswer)
      }
      const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
      let userId: string | null = null
      const accessToken = authHeader.replace(/^Bearer\s+/i, '')
      if (accessToken) {
        const { data: userData } = await database.auth.getUser(accessToken)
        userId = userData.user?.id ?? null
      }

      const forwardedFor = request.headers.get('x-forwarded-for') ?? ''
      const clientIp = forwardedFor.split(',')[0]?.trim() || 'unavailable'
      const callerKey = userId
        ? `user:${userId}`
        : `anon:${await hashCallerIp(clientIp, ipSalt)}`
      const minuteLimit = userId ? AUTHENTICATED_MINUTE_LIMIT : ANONYMOUS_MINUTE_LIMIT
      const hourLimit = userId ? AUTHENTICATED_HOUR_LIMIT : ANONYMOUS_HOUR_LIMIT
      const { data: rateRows, error: rateError } = await admin.rpc('begin_counselor_request', {
        p_request_id: requestId,
        p_user_id: userId,
        p_caller_key: callerKey,
        p_minute_limit: minuteLimit,
        p_hour_limit: hourLimit,
      })
      if (rateError) throw new Error(`Counselor rate limiter failed: ${rateError.message}`)
      const rate = Array.isArray(rateRows) ? rateRows[0] : null
      if (!rate?.allowed) {
        return json(refusal(requestId, REPLIES.rateLimited), 429, { 'Retry-After': '60' })
      }

      completeRequest = async (outcome, cacheKey) => {
        const { error } = await admin
          .from('counselor_requests')
          .update({
            outcome,
            cache_key: cacheKey ?? null,
            completed_at: new Date().toISOString(),
          })
          .eq('request_id', requestId)
        if (error) console.error('COUNSELOR_REQUEST_LOG_FAILED', error.message, { requestId, outcome })
      }

      // Catalogue names first (one small query), so a message that names any
      // listed university takes the admissions route and a follow-up can reuse
      // the schools the student just named. Routing runs after the rate limiter,
      // so every message stays metered.
      const { data: names, error: namesError } = await database.from('universities').select('id,name').eq('listed', true)
      if (namesError) throw namesError
      const catalogue = (names ?? []) as NamedUniversity[]
      const plan = planTurn(message, history, catalogue)
      const today = formatToday(now())
      const apiKey = env('PPLX_API_KEY')
      const finish = completeRequest

      async function callModel({ records, kind, searchWeb, maxOutputTokens }: {
        records: GroundingRecord[]
        kind: string | null
        searchWeb: boolean
        maxOutputTokens?: number
      }): Promise<{ parsed: ParsedProviderPayload; webCitations: string[] }> {
        if (!apiKey) throw new Error('PPLX_API_KEY is not configured.')
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), PERPLEXITY_TIMEOUT_MS)
        try {
          const response = await fetchProvider(AGENT_API_URL, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify(buildAgentRequest({
              model: resolveAgentModel(env('PPLX_MODEL')),
              system: buildSystemPrompt({ records, kind, today }),
              message,
              history,
              searchWeb,
              maxOutputTokens,
            })),
          })
          if (response.status === 400) {
            // The provider's own error text says what it rejected; it carries no secrets.
            console.error('COUNSELOR_PROVIDER_REJECTED', requestId, (await response.text()).slice(0, 300))
          }
          if (!response.ok) throw new Error(`Counselor provider returned ${response.status}.`)
          return parseAgentPayload(await response.json())
        } finally {
          clearTimeout(timeout)
        }
      }

      const cleanText = (text: string) =>
        // Remove stray inline "[citation-id]" markers; provenance is shown as source chips.
        text.replace(/\s*\[[a-z0-9_-]+\]/gi, '').replace(/\s+([.,;:])/g, '$1').trim()

      async function answerAdmissions(universityIds: string[], kind: string | null): Promise<Response> {
        // Evidence only for the universities this turn concerns, fetched now:
        // nothing from the conversation history can stand in for a record.
        let relevant: CatalogUniversity[] = []
        if (universityIds.length) {
          const { data, error } = await database
            .from('universities')
            .select(CATALOG_EVIDENCE_SELECT)
            .in('id', universityIds)
          if (error) throw error
          const byId = new Map(((data ?? []) as unknown as CatalogUniversity[]).map((row) => [row.id, row]))
          relevant = universityIds.map((id) => byId.get(id)).filter((row): row is CatalogUniversity => Boolean(row))
        }
        if (kind && relevant.length === 0) {
          await finish('local_response')
          return json(clarification(requestId, askWhichUniversity(kind, message)))
        }
        const records = knownContext(relevant)

        // The template answer quotes the stored record and is the fallback whenever
        // the model is unavailable or its answer cannot be verified.
        let fallback: CachedCounselorAnswer | null = null
        if (kind) {
          const matching = recordsForKind(records, kind)
          if (matching.length === 0 || matching.every((record) => record.status === 'unknown')) {
            const next = matching.find((record) => record.suggestedAction)?.suggestedAction
            await finish('local_response')
            return json(refusal(requestId, unknownFigureReply(kind, relevant.map((item) => item.name), next)))
          }
          const verified = buildVerifiedFactAnswer(kind, records)
          if (verified) {
            const validation = validateFigures(verified.answer, records, verified.citations, 'verified_fact')
            if (!validation.ok) {
              if (validation.shouldLogStrike) {
                await logStrike(requestId, userId, JSON.stringify({
                  untraceable: validation.untraceable,
                  figures: validation.figures,
                  citations: verified.citations,
                }))
              }
              await finish('local_response')
              return json(refusal(requestId, REPLIES.cannotConfirm))
            }
            fallback = { answerType: 'verified_fact', answer: verified.answer, recordCitations: verified.citations, webCitations: [] }
          }
        }

        // Only a first-turn answer is cacheable: with history, the same words can
        // mean something else, so a conversation never reads or writes the cache.
        const cacheKey = history.length === 0
          ? await buildCounselorCacheKey(
            message,
            relevant.map((item) => item.id),
            records,
            { cache: CACHE_VERSION, phi: PHI_VERSION, prompt: PROMPT_VERSION },
          )
          : undefined
        if (cacheKey) {
          const { data: cacheRows, error: cacheError } = await admin.rpc('take_counselor_cache_hit', {
            p_cache_key: cacheKey,
            p_ttl_seconds: CACHE_TTL_SECONDS,
          })
          if (cacheError) console.error('COUNSELOR_CACHE_READ_FAILED', cacheError.message, { requestId })
          const cached = cachedAnswer(Array.isArray(cacheRows) ? cacheRows[0]?.response_payload : null)
          if (cached) {
            await finish('cache_hit', cacheKey)
            return json({ ...cached, requestId } satisfies CounselorAnswer)
          }
        }

        if (!apiKey) {
          await finish('provider_failure', cacheKey)
          return json(fallback ? { ...fallback, requestId } : refusal(requestId, REPLIES.notConfigured))
        }
        let parsed: ParsedProviderPayload
        let providerWebCitations: string[]
        try {
          // Verified-record answers never search the web; general guidance may.
          const provider = await callModel({ records, kind, searchWeb: records.length === 0 })
          parsed = provider.parsed
          providerWebCitations = provider.webCitations
        } catch (error) {
          console.error('COUNSELOR_PROVIDER_FAILURE', requestId, error instanceof Error ? error.message : 'Unknown provider failure')
          await finish('provider_failure', cacheKey)
          return json(fallback ? { ...fallback, requestId } : refusal(requestId, REPLIES.providerFailed))
        }

        // Citations count only when they name a record supplied on THIS request.
        const allowedCitationIds = new Set(records.map((record) => record.citationId).filter(Boolean))
        const citations = Array.isArray(parsed.recordCitations)
          ? parsed.recordCitations.filter((id: unknown): id is string => typeof id === 'string' && allowedCitationIds.has(id))
          : []
        const answer = typeof parsed.answer === 'string' ? parsed.answer : ''
        const validation = validateFigures(answer, records, citations, parsed.answerType, {
          namedUniversities: matchUniversities(answer, catalogue),
        })
        if (!validation.ok) {
          if (validation.shouldLogStrike) {
            await logStrike(requestId, userId, JSON.stringify({ untraceable: validation.untraceable, figures: validation.figures, citations }))
          }
          await finish('live_call', cacheKey)
          return json(fallback ? { ...fallback, requestId } : refusal(requestId, REPLIES.cannotConfirm))
        }
        // A fact question with a verified record deserves the verified answer; a
        // model that declined or drifted into general advice gets the template.
        if (fallback && parsed.answerType !== 'verified_fact') {
          await finish('live_call', cacheKey)
          return json({ ...fallback, requestId })
        }

        const result = {
          answerType: parsed.answerType,
          answer: cleanText(answer),
          recordCitations: parsed.answerType === 'verified_fact' || parsed.answerType === 'refusal' ? citations : [],
          webCitations: parsed.answerType === 'general_guidance' ? providerWebCitations : [],
        } satisfies CachedCounselorAnswer
        if (result.answerType === 'verified_fact' || result.answerType === 'general_guidance') {
          await storeCache(result, cacheKey)
        }
        await finish('live_call', cacheKey)
        return json({ ...result, requestId } satisfies CounselorAnswer)
      }

      async function storeCache(answer: CachedCounselorAnswer, cacheKey: string | undefined) {
        if (!cacheKey) return
        const { error } = await admin.from('counselor_cache').upsert({
          cache_key: cacheKey,
          response_payload: answer,
          created_at: new Date().toISOString(),
          hit_count: 0,
        }, { onConflict: 'cache_key' })
        if (error) console.error('COUNSELOR_CACHE_WRITE_FAILED', error.message, { requestId })
      }

      async function answerConversation(): Promise<Response> {
        const offline = async () => {
          await finish('provider_failure')
          return json({ answerType: 'conversation', answer: smallTalkFallback(message), recordCitations: [], webCitations: [], requestId } satisfies CounselorAnswer)
        }
        if (!apiKey) return offline()
        let parsed: ParsedProviderPayload
        try {
          // Small talk never searches the web and gets a small output budget.
          parsed = (await callModel({ records: [], kind: null, searchWeb: false, maxOutputTokens: CONVERSATION_MAX_OUTPUT_TOKENS })).parsed
        } catch (error) {
          console.error('COUNSELOR_PROVIDER_FAILURE', requestId, error instanceof Error ? error.message : 'Unknown provider failure')
          return offline()
        }
        const answer = cleanText(typeof parsed.answer === 'string' ? parsed.answer : '')
        // No records stand behind this reply, so it can never be a verified fact.
        const answerType = parsed.answerType === 'verified_fact' ? 'conversation' : parsed.answerType
        const named = matchUniversities(answer, catalogue)
        const validation = validateFigures(answer, [], [], 'conversation', { namedUniversities: named })
        if (!validation.ok) {
          // An unverified university figure: never shown. Answer the turn properly
          // from that university's records instead.
          console.error('COUNSELOR_CONVERSATION_FIGURE_BLOCKED', requestId, JSON.stringify({ figures: validation.figures, universities: named }))
          return answerAdmissions(named, targetedKind(message))
        }
        await finish('live_call')
        return json({
          answerType,
          answer,
          recordCitations: [],
          webCitations: [],
          ...(answerType === 'refusal' ? { suggestions: SCOPE_SUGGESTIONS } : {}),
          requestId,
        } satisfies CounselorAnswer)
      }

      if (plan.route === 'decline') {
        await finish('out_of_scope')
        return json({
          answerType: 'out_of_scope',
          answer: DECLINE_MESSAGES[plan.reason],
          recordCitations: [],
          webCitations: [],
          suggestions: SCOPE_SUGGESTIONS,
          requestId,
        } satisfies CounselorAnswer)
      }
      if (plan.route === 'conversation') return answerConversation()
      if (plan.kind && plan.needsUniversity) {
        await finish('local_response')
        return json(clarification(requestId, askWhichUniversity(plan.kind, message)))
      }
      return answerAdmissions(plan.universityIds, plan.kind)
    } catch (error) {
      console.error('COUNSELOR_ERROR', requestId, error instanceof Error ? error.message : 'Unknown counselor failure')
      await completeRequest?.('server_failure')
      return json(refusal(requestId, REPLIES.providerFailed))
    }
  }
}
