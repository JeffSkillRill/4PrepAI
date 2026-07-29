import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import {
  buildCounselorCacheKey,
  buildVerifiedFactAnswer,
  hashCallerIp,
  knownContext,
  validateFigures,
  type CatalogUniversity,
} from './grounding.ts'

const ANONYMOUS_MINUTE_LIMIT = 8
const ANONYMOUS_HOUR_LIMIT = 40
const AUTHENTICATED_MINUTE_LIMIT = 20
const AUTHENTICATED_HOUR_LIMIT = 200
const CACHE_TTL_SECONDS = 24 * 60 * 60
const PERPLEXITY_TIMEOUT_MS = 25_000
const CACHE_VERSION = 'counselor-cache-v1'
const PHI_VERSION = 'phi-v0.2'
const PROMPT_VERSION = 'counselor-prompt-v3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Expose-Headers': 'Retry-After',
}

type CounselorAnswer = {
  answerType: 'verified_fact' | 'general_guidance' | 'refusal'
  answer: string
  recordCitations: string[]
  webCitations: string[]
  requestId: string
}

type CachedCounselorAnswer = Omit<CounselorAnswer, 'requestId'>

type RequestOutcome =
  | 'local_response'
  | 'cache_hit'
  | 'live_call'
  | 'provider_failure'
  | 'server_failure'

type ParsedProviderPayload = {
  answerType: CounselorAnswer['answerType']
  answer: string
  recordCitations: string[]
}

const aliases: Record<string, string[]> = {
  harvard: ['harvard', 'harvard university'],
  yale: ['yale', 'yale university'],
  princeton: ['princeton', 'princeton university'],
  berea: ['berea', 'berea college'],
  'illinois-wesleyan': ['illinois wesleyan', 'iwu'],
  clark: ['clark', 'clark university'],
  usm: ['southern miss', 'university of southern mississippi', 'usm'],
  alabama: ['university of alabama', 'alabama'],
  unk: ['university of nebraska at kearney', 'unk'],
  hcc: ['houston city college', 'houston community college', 'hcc'],
}

function targetedKind(message: string): string | null {
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

function selectRelevant(message: string, rows: CatalogUniversity[]): CatalogUniversity[] {
  const normalized = message.toLowerCase()
  const ids = Object.entries(aliases)
    .filter(([, names]) => names.some((name) => normalized.includes(name)))
    .map(([id]) => id)
  return ids.length ? rows.filter((row) => ids.includes(row.id)) : []
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

function parseProviderPayload(value: unknown): {
  parsed: ParsedProviderPayload
  webCitations: string[]
} {
  if (!value || typeof value !== 'object') throw new Error('Counselor provider returned malformed JSON.')
  const payload = value as {
    choices?: Array<{ message?: { content?: unknown } }>
    citations?: unknown
  }
  const content = payload.choices?.[0]?.message?.content
  if (typeof content !== 'string') throw new Error('Counselor provider response is missing content.')
  const parsed = JSON.parse(content) as Partial<ParsedProviderPayload>
  if (!['verified_fact', 'general_guidance', 'refusal'].includes(parsed.answerType ?? '')) {
    throw new Error('Counselor provider returned an invalid answer type.')
  }
  if (typeof parsed.answer !== 'string' || !parsed.answer.trim()) {
    throw new Error('Counselor provider returned an empty answer.')
  }
  if (!Array.isArray(parsed.recordCitations) || !parsed.recordCitations.every((item) => typeof item === 'string')) {
    throw new Error('Counselor provider returned malformed record citations.')
  }
  return {
    parsed: parsed as ParsedProviderPayload,
    webCitations: Array.isArray(payload.citations)
      ? payload.citations.filter((item): item is string => typeof item === 'string')
      : [],
  }
}

async function logStrike(requestId: string, userId: string | null, detail: string) {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
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

export default {
async fetch(request: Request) {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const requestId = crypto.randomUUID()
  const json = (value: unknown, status = 200, extraHeaders: Record<string, string> = {}) => new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders, ...extraHeaders, 'Content-Type': 'application/json' },
  })
  let completeRequest: ((outcome: RequestOutcome, cacheKey?: string) => Promise<void>) | null = null

  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 1000) : ''
    if (!message) return json({ error: 'A counselor message is required.' }, 400)

    const url = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const ipSalt = Deno.env.get('COUNSELOR_IP_SALT')
    if (!url || !anonKey || !serviceKey || !ipSalt) {
      return json(refusal(requestId, 'The verified counselor is unavailable right now. Please try again later.'), 503)
    }
    const authHeader = request.headers.get('Authorization') ?? ''
    const database = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
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
      return json(refusal(
        requestId,
        'You’ve reached the counselor’s short-term question limit. Please wait a minute and try again; the verified university catalogue remains available.',
      ), 429, { 'Retry-After': '60' })
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

    const { data, error } = await database
      .from('universities')
      .select('id,name,university_facts(kind,value,source_id,unknown_reason,suggested_action),requirements(kind,value,source_id,unknown_reason,suggested_action),university_scholarships(scholarships(name,amount_value,amount_source_id,amount_unknown_reason,amount_suggested_action))')
      .order('name')
    if (error) throw error

    const relevant = selectRelevant(message, (data ?? []) as unknown as CatalogUniversity[])
    const kind = targetedKind(message)
    if (kind && relevant.length === 0) {
      await completeRequest('local_response')
      return json(refusal(requestId, `I could not match that university to 4Prep’s verified catalogue, so I cannot provide a verified ${kind.replaceAll('_', ' ')} figure. I will not substitute a web figure.`))
    }
    const records = knownContext(relevant)
    if (kind) {
      const matching = records.filter((record) =>
        record.field === kind || (kind === 'aid_international' && record.field === 'scholarship_amount'))
      if (matching.length === 0 || matching.every((record) => record.status === 'unknown')) {
        const next = matching.find((record) => record.suggestedAction)?.suggestedAction
        await completeRequest('local_response')
        return json(refusal(requestId, `4Prep does not have a verified ${kind.replaceAll('_', ' ')} figure for ${relevant.map((item) => item.name).join(', ')}.${next ? ` ${next}` : ' Please confirm it with the university.'}`))
      }
    }

    const cacheKey = await buildCounselorCacheKey(
      message,
      relevant.map((item) => item.id),
      records,
      { cache: CACHE_VERSION, phi: PHI_VERSION, prompt: PROMPT_VERSION },
    )
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

    const storeCache = async (answer: CachedCounselorAnswer) => {
      const { error } = await admin.from('counselor_cache').upsert({
        cache_key: cacheKey,
        response_payload: answer,
        created_at: new Date().toISOString(),
        hit_count: 0,
      }, { onConflict: 'cache_key' })
      if (error) console.error('COUNSELOR_CACHE_WRITE_FAILED', error.message, { requestId })
    }

    if (kind) {
      const verified = buildVerifiedFactAnswer(kind, records)
      if (verified) {
        const validation = validateFigures(verified.answer, records, verified.citations)
        if (!validation.ok) {
          await logStrike(requestId, userId, JSON.stringify({
            untraceable: validation.untraceable,
            figures: validation.figures,
            citations: verified.citations,
          }))
          await completeRequest('local_response', cacheKey)
          return json(refusal(requestId, 'I cannot verify that figure from the records supplied to me. Please use the university page in 4Prep or ask admissions directly.'))
        }
        const answer = {
          answerType: 'verified_fact',
          answer: verified.answer,
          recordCitations: verified.citations,
          webCitations: [],
        } satisfies CachedCounselorAnswer
        await storeCache(answer)
        await completeRequest('local_response', cacheKey)
        return json({ ...answer, requestId } satisfies CounselorAnswer)
      }
    }

    const apiKey = Deno.env.get('PPLX_API_KEY')
    if (!apiKey) {
      await completeRequest('provider_failure', cacheKey)
      return json(refusal(requestId, 'The counselor is not configured yet. The university records remain available in the catalogue.'))
    }
    const system = `You are the 4Prep university counselor. Return JSON only with keys answerType, answer, recordCitations.

GROUNDING CONTRACT:
- For tuition, cost of attendance, room and board, mandatory fees, aid, financial certification, deadlines, testing policy, TOEFL, IELTS, Duolingo, SAT, ACT, GPA, and scholarship amounts, use ONLY the supplied 4Prep records.
- Quote such figures exactly as they appear in the supplied record. Do not reformat, round, or convert currency.
- List the citation ID of every record you used in the recordCitations array. Do not write citation IDs inside the answer text.
- If the supplied record is unknown or absent, say plainly that 4Prep does not have the verified figure and what is needed. Never use a web figure, estimate, conversion, or substitute.
- General essay, visa-process, and study advice may use web search. Label it exactly "General information — not verified 4Prep data." Do not mix it with university figures.
- answerType must be verified_fact, general_guidance, or refusal.
- recordCitations must contain only citation IDs that appear in the context.

SUPPLIED 4PREP RECORDS:
${JSON.stringify(records)}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), PERPLEXITY_TIMEOUT_MS)
    let parsed: ParsedProviderPayload
    let providerWebCitations: string[]
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: Deno.env.get('PPLX_MODEL') ?? 'sonar',
          messages: [{ role: 'system', content: system }, { role: 'user', content: message }],
          temperature: 0,
          ...(records.length > 0 ? { web_search_options: { disable_search: true } } : {}),
          response_format: { type: 'json_schema', json_schema: { schema: {
            type: 'object',
            required: ['answerType', 'answer', 'recordCitations'],
            properties: {
              answerType: { type: 'string', enum: ['verified_fact', 'general_guidance', 'refusal'] },
              answer: { type: 'string' },
              recordCitations: { type: 'array', items: { type: 'string' } },
            },
          } } },
        }),
      })
      if (!response.ok) throw new Error(`Counselor provider returned ${response.status}.`)
      const provider = parseProviderPayload(await response.json())
      parsed = provider.parsed
      providerWebCitations = provider.webCitations
    } catch (error) {
      console.error('COUNSELOR_PROVIDER_FAILURE', requestId, error instanceof Error ? error.message : 'Unknown provider failure')
      await completeRequest('provider_failure', cacheKey)
      return json(refusal(requestId, 'I could not produce a grounded answer. No unverified figure will be shown; please try again later.'))
    } finally {
      clearTimeout(timeout)
    }

    const allowedCitationIds = new Set(records.map((record) => record.citationId).filter(Boolean))
    const citations = Array.isArray(parsed.recordCitations)
      ? parsed.recordCitations.filter((id: unknown): id is string => typeof id === 'string' && allowedCitationIds.has(id))
      : []
    const answer = typeof parsed.answer === 'string' ? parsed.answer : ''
    const validation = validateFigures(answer, records, citations)
    if (!validation.ok) {
      await logStrike(requestId, userId, JSON.stringify({ untraceable: validation.untraceable, figures: validation.figures, citations }))
      await completeRequest('live_call', cacheKey)
      return json(refusal(requestId, 'I cannot verify that figure from the records supplied to me. Please use the university page in 4Prep or ask admissions directly.'))
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
    return json(refusal(requestId, 'I could not produce a grounded answer. No unverified figure will be shown; please try again later.'))
  }
},
}
