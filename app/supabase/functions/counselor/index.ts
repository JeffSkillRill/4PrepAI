import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
}

type FactRow = {
  kind: string
  value: string | null
  source_id: string | null
  unknown_reason: string | null
  suggested_action: string | null
}

type CatalogUniversity = {
  id: string
  name: string
  university_facts: FactRow[]
  requirements: FactRow[]
  university_scholarships: Array<{
    scholarships: {
      name: string
      amount_value: string | null
      amount_source_id: string | null
      amount_unknown_reason: string | null
      amount_suggested_action: string | null
    } | null
  }>
}

type CounselorAnswer = {
  answerType: 'verified_fact' | 'general_guidance' | 'refusal'
  answer: string
  recordCitations: string[]
  webCitations: string[]
  requestId: string
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

function knownContext(rows: CatalogUniversity[]) {
  return rows.flatMap((university) => {
    const facts = [...(university.university_facts ?? []), ...(university.requirements ?? [])]
    const factRecords = facts.map((fact) => ({
      university: university.name,
      field: fact.kind,
      status: fact.value && fact.source_id ? 'known' : 'unknown',
      value: fact.value,
      citationId: fact.source_id,
      unknownReason: fact.unknown_reason,
      suggestedAction: fact.suggested_action,
    }))
    const scholarships = (university.university_scholarships ?? []).flatMap((link) => {
      const item = link.scholarships
      if (!item) return []
      return [{
        university: university.name,
        field: 'scholarship_amount',
        status: item.amount_value && item.amount_source_id ? 'known' : 'unknown',
        value: item.amount_value,
        citationId: item.amount_source_id,
        unknownReason: item.amount_unknown_reason,
        suggestedAction: item.amount_suggested_action,
      }]
    })
    return [...factRecords, ...scholarships]
  })
}

function validateFigures(answer: string, records: ReturnType<typeof knownContext>, citations: string[]) {
  const knownValues = records
    .filter((record) => record.status === 'known' && record.value && record.citationId)
    .map((record) => `${record.value} [${record.citationId}]`)
    .join(' ')
    .toLowerCase()
  const patterns = [
    /(?:US)?[$€£]\s?\d[\d,.]*(?:\s?(?:k|million|billion))?/gi,
    /\b(?:USD|EUR|GBP|UZS|KZT|TRY)\s?\d[\d,.]*/gi,
    /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:,?\s+\d{4})?/gi,
    /\b\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{4})?/gi,
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\bIELTS\s*(?:overall\s*)?\d(?:\.\d)?\b/gi,
    /\b\d(?:\.\d)?\s*(?:overall\s*)?IELTS\b/gi,
    /\b(?:TOEFL|Duolingo|SAT|ACT)\s*(?:iBT\s*)?\d{1,4}\b/gi,
    /\b\d{1,4}\s*(?:iBT\s*)?(?:TOEFL|Duolingo|SAT|ACT)\b/gi,
    /\bGPA\s*\d(?:\.\d{1,2})?\b/gi,
    /\b\d(?:\.\d{1,2})?\s*GPA\b/gi,
    /\b\d{1,3}%/g,
  ]
  const figures = patterns.flatMap((pattern) => answer.match(pattern) ?? [])
  const untraceable = figures.filter((figure) => !knownValues.includes(figure.toLowerCase()))
  const hasAttachedCitation = citations.some((id) => answer.includes(`[${id}]`))
  return {
    ok: untraceable.length === 0 && (figures.length === 0 || hasAttachedCitation),
    figures,
    untraceable,
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
  const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

  try {
    const body = await request.json()
    const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 1000) : ''
    if (!message) return json({ error: 'A counselor message is required.' }, 400)

    const url = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!url || !anonKey) return json(refusal(requestId, 'The verified records are unavailable right now. Please try again later.'))
    const authHeader = request.headers.get('Authorization') ?? ''
    const database = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data, error } = await database
      .from('universities')
      .select('id,name,university_facts(kind,value,source_id,unknown_reason,suggested_action),requirements(kind,value,source_id,unknown_reason,suggested_action),university_scholarships(scholarships(name,amount_value,amount_source_id,amount_unknown_reason,amount_suggested_action))')
      .order('name')
    if (error) throw error

    const relevant = selectRelevant(message, (data ?? []) as unknown as CatalogUniversity[])
    const kind = targetedKind(message)
    if (kind && relevant.length === 0) {
      return json(refusal(requestId, 'I need the university name before I can check that figure against 4Prep’s verified records.'))
    }
    const records = knownContext(relevant)
    if (kind) {
      const matching = records.filter((record) =>
        record.field === kind || (kind === 'aid_international' && record.field === 'scholarship_amount'))
      if (matching.length === 0 || matching.every((record) => record.status === 'unknown')) {
        const next = matching.find((record) => record.suggestedAction)?.suggestedAction
        return json(refusal(requestId, `4Prep does not have a verified ${kind.replaceAll('_', ' ')} figure for ${relevant.map((item) => item.name).join(', ')}.${next ? ` ${next}` : ' Please confirm it with the university.'}`))
      }
    }

    const apiKey = Deno.env.get('PPLX_API_KEY')
    if (!apiKey) return json(refusal(requestId, 'The counselor is not configured yet. The university records remain available in the catalogue.'))
    const system = `You are the 4Prep university counselor. Return JSON only with keys answerType, answer, recordCitations.

GROUNDING CONTRACT:
- For tuition, cost of attendance, room and board, mandatory fees, aid, financial certification, deadlines, testing policy, TOEFL, IELTS, Duolingo, SAT, ACT, GPA, and scholarship amounts, use ONLY the supplied 4Prep records.
- Every such factual sentence must end with its supplied citation ID in square brackets.
- If the supplied record is unknown or absent, say plainly that 4Prep does not have the verified figure and what is needed. Never use a web figure, estimate, conversion, or substitute.
- General essay, visa-process, and study advice may use web search. Label it exactly "General information — not verified 4Prep data." Do not mix it with university figures.
- answerType must be verified_fact, general_guidance, or refusal.
- recordCitations must contain only citation IDs that appear in the context.

SUPPLIED 4PREP RECORDS:
${JSON.stringify(records)}`
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: Deno.env.get('PPLX_MODEL') ?? 'sonar',
        messages: [{ role: 'system', content: system }, { role: 'user', content: message }],
        temperature: 0,
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
    const payload = await response.json()
    const parsed = JSON.parse(payload?.choices?.[0]?.message?.content)
    const allowedCitationIds = new Set(records.map((record) => record.citationId).filter(Boolean))
    const citations = Array.isArray(parsed.recordCitations)
      ? parsed.recordCitations.filter((id: unknown): id is string => typeof id === 'string' && allowedCitationIds.has(id))
      : []
    const answer = typeof parsed.answer === 'string' ? parsed.answer : ''
    const validation = validateFigures(answer, records, citations)
    let userId: string | null = null
    if (authHeader) {
      const { data: userData } = await database.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''))
      userId = userData.user?.id ?? null
    }
    if (!validation.ok) {
      await logStrike(requestId, userId, JSON.stringify({ untraceable: validation.untraceable, figures: validation.figures, citations }))
      return json(refusal(requestId, 'I cannot verify that figure from the records supplied to me. Please use the university page in 4Prep or ask admissions directly.'))
    }

    const answerType = ['verified_fact', 'general_guidance', 'refusal'].includes(parsed.answerType) ? parsed.answerType : 'refusal'
    return json({
      answerType,
      answer,
      recordCitations: answerType === 'general_guidance' ? [] : citations,
      webCitations: answerType === 'general_guidance' && Array.isArray(payload.citations) ? payload.citations : [],
      requestId,
    } satisfies CounselorAnswer)
  } catch (error) {
    console.error('COUNSELOR_ERROR', requestId, error)
    return json(refusal(requestId, 'I could not produce a grounded answer. No unverified figure will be shown; please try again later.'))
  }
},
}
