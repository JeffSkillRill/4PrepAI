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
import { type NamedUniversity } from './match.ts'
import { buildSystemPrompt } from './prompt.ts'
import {
  AGENT_API_URL,
  buildAgentRequest,
  parseAgentPayload,
  resolveAgentModel,
  type ParsedProviderPayload,
} from './provider.ts'
import { REPLIES, askWhichUniversity, unknownFigureReply } from './replies.ts'
import { GREETING_MESSAGE, OUT_OF_SCOPE_MESSAGE, SCOPE_SUGGESTIONS } from './scope.ts'
import { planTurn } from './turn.ts'

const ANONYMOUS_MINUTE_LIMIT = 8
const ANONYMOUS_HOUR_LIMIT = 40
const AUTHENTICATED_MINUTE_LIMIT = 20
const AUTHENTICATED_HOUR_LIMIT = 200
const CACHE_TTL_SECONDS = 24 * 60 * 60
const PERPLEXITY_TIMEOUT_MS = 25_000
const CACHE_VERSION = 'counselor-cache-v3'
const PHI_VERSION = 'phi-v0.3'
const PROMPT_VERSION = 'counselor-prompt-v6'
const CATALOG_EVIDENCE_SELECT = 'id,name,university_facts(kind,value,source_id,unknown_reason,suggested_action),requirements(kind,value,source_id,unknown_reason,suggested_action),university_scholarships(scholarships(name,amount_value,amount_source_id,amount_unknown_reason,amount_suggested_action))'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Expose-Headers': 'Retry-After',
}

export type CounselorAnswer = {
  answerType: 'verified_fact' | 'general_guidance' | 'refusal' | 'out_of_scope' | 'greeting'
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

export function createCounselorHandler({ env, createClient, fetch: fetchProvider }: CounselorDeps) {
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
    const json = (value: unknown, status = 200, extraHeaders: Record<string, string> = {}) => new Response(JSON.stringify(value), {
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
      // listed university is in scope and a follow-up can reuse the schools the
      // student just named. The scope gate still runs before any evidence query
      // or provider call, and stays after the rate limiter so it is metered.
      const { data: names, error: namesError } = await database.from('universities').select('id,name').eq('listed', true)
      if (namesError) throw namesError
      const plan = planTurn(message, history, (names ?? []) as NamedUniversity[])
      if (plan.scope !== 'in_scope') {
        const greeting = plan.scope === 'greeting'
        await completeRequest('out_of_scope')
        return json({
          answerType: greeting ? 'greeting' : 'out_of_scope',
          answer: greeting ? GREETING_MESSAGE : OUT_OF_SCOPE_MESSAGE,
          recordCitations: [],
          webCitations: [],
          suggestions: SCOPE_SUGGESTIONS,
          requestId,
        } satisfies CounselorAnswer)
      }
      const { kind } = plan
      if (kind && plan.needsUniversity) {
        await completeRequest('local_response')
        return json(refusal(requestId, askWhichUniversity(kind, message)))
      }

      // Evidence only for the universities this turn concerns, fetched now:
      // nothing from the conversation history can stand in for a record.
      let relevant: CatalogUniversity[] = []
      if (plan.universityIds.length) {
        const { data, error } = await database
          .from('universities')
          .select(CATALOG_EVIDENCE_SELECT)
          .in('id', plan.universityIds)
        if (error) throw error
        const byId = new Map(((data ?? []) as unknown as CatalogUniversity[]).map((row) => [row.id, row]))
        relevant = plan.universityIds.map((id) => byId.get(id)).filter((row): row is CatalogUniversity => Boolean(row))
      }
      if (kind && relevant.length === 0) {
        await completeRequest('local_response')
        return json(refusal(requestId, askWhichUniversity(kind, message)))
      }
      const records = knownContext(relevant)

      // The template answer quotes the stored record and is the fallback whenever
      // the model is unavailable or its answer cannot be verified.
      let fallback: CachedCounselorAnswer | null = null
      if (kind) {
        const matching = recordsForKind(records, kind)
        if (matching.length === 0 || matching.every((record) => record.status === 'unknown')) {
          const next = matching.find((record) => record.suggestedAction)?.suggestedAction
          await completeRequest('local_response')
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
            await completeRequest('local_response')
            return json(refusal(requestId, REPLIES.cannotConfirm))
          }
          fallback = { answerType: 'verified_fact', answer: verified.answer, recordCitations: verified.citations, webCitations: [] }
        }
      }

      // Only a first-turn answer is cacheable: with history, the same words can
      // mean something else, so a conversation never reads or writes the cache.
      const firstTurn = history.length === 0
      const cacheKey = firstTurn
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
          await completeRequest('cache_hit', cacheKey)
          return json({ ...cached, requestId } satisfies CounselorAnswer)
        }
      }

      const storeCache = async (answer: CachedCounselorAnswer) => {
        if (!cacheKey) return
        const { error } = await admin.from('counselor_cache').upsert({
          cache_key: cacheKey,
          response_payload: answer,
          created_at: new Date().toISOString(),
          hit_count: 0,
        }, { onConflict: 'cache_key' })
        if (error) console.error('COUNSELOR_CACHE_WRITE_FAILED', error.message, { requestId })
      }

      const apiKey = env('PPLX_API_KEY')
      if (!apiKey) {
        await completeRequest('provider_failure', cacheKey)
        return json(fallback ? { ...fallback, requestId } : refusal(requestId, REPLIES.notConfigured))
      }
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), PERPLEXITY_TIMEOUT_MS)
      let parsed: ParsedProviderPayload
      let providerWebCitations: string[]
      try {
        const response = await fetchProvider(AGENT_API_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify(buildAgentRequest({
            model: resolveAgentModel(env('PPLX_MODEL')),
            system: buildSystemPrompt(records, kind),
            message,
            history,
            // Verified-record answers never search the web; general guidance may.
            searchWeb: records.length === 0,
          })),
        })
        if (!response.ok) throw new Error(`Counselor provider returned ${response.status}.`)
        const provider = parseAgentPayload(await response.json())
        parsed = provider.parsed
        providerWebCitations = provider.webCitations
      } catch (error) {
        console.error('COUNSELOR_PROVIDER_FAILURE', requestId, error instanceof Error ? error.message : 'Unknown provider failure')
        await completeRequest('provider_failure', cacheKey)
        return json(fallback ? { ...fallback, requestId } : refusal(requestId, REPLIES.providerFailed))
      } finally {
        clearTimeout(timeout)
      }

      // Citations count only when they name a record supplied on THIS request.
      const allowedCitationIds = new Set(records.map((record) => record.citationId).filter(Boolean))
      const citations = Array.isArray(parsed.recordCitations)
        ? parsed.recordCitations.filter((id: unknown): id is string => typeof id === 'string' && allowedCitationIds.has(id))
        : []
      const answer = typeof parsed.answer === 'string' ? parsed.answer : ''
      const validation = validateFigures(answer, records, citations, parsed.answerType)
      if (!validation.ok) {
        if (validation.shouldLogStrike) {
          await logStrike(requestId, userId, JSON.stringify({ untraceable: validation.untraceable, figures: validation.figures, citations }))
        }
        await completeRequest('live_call', cacheKey)
        return json(fallback ? { ...fallback, requestId } : refusal(requestId, REPLIES.cannotConfirm))
      }
      // A fact question with a verified record deserves the verified answer; a
      // model that declined or drifted into general advice gets the template.
      if (fallback && parsed.answerType !== 'verified_fact') {
        await completeRequest('live_call', cacheKey)
        return json({ ...fallback, requestId })
      }

      // Remove any stray inline "[citation-id]" markers so students read clean
      // prose; provenance is shown as source chips from recordCitations.
      const displayAnswer = answer.replace(/\s*\[[a-z0-9_-]+\]/gi, '').replace(/\s+([.,;:])/g, '$1').trim()
      const result = {
        answerType: parsed.answerType,
        answer: displayAnswer,
        recordCitations: parsed.answerType === 'general_guidance' ? [] : citations,
        webCitations: parsed.answerType === 'general_guidance' ? providerWebCitations : [],
      } satisfies CachedCounselorAnswer
      if (result.answerType === 'verified_fact' || result.answerType === 'general_guidance') {
        await storeCache(result)
      }
      await completeRequest('live_call', cacheKey)
      return json({ ...result, requestId } satisfies CounselorAnswer)
    } catch (error) {
      console.error('COUNSELOR_ERROR', requestId, error instanceof Error ? error.message : 'Unknown counselor failure')
      await completeRequest?.('server_failure')
      return json(refusal(requestId, REPLIES.providerFailed))
    }
  }
}
