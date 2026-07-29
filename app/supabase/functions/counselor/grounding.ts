export type FactRow = {
  kind: string
  value: string | null
  source_id: string | null
  unknown_reason: string | null
  suggested_action: string | null
}

export type CatalogUniversity = {
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

export type GroundingRecord = {
  university: string
  field: string
  status: 'known' | 'unknown'
  value: string | null
  citationId: string | null
  unknownReason: string | null
  suggestedAction: string | null
}

export function knownContext(rows: CatalogUniversity[]): GroundingRecord[] {
  return rows.flatMap((university) => {
    const facts = [...(university.university_facts ?? []), ...(university.requirements ?? [])]
    const factRecords: GroundingRecord[] = facts.map((fact) => ({
      university: university.name,
      field: fact.kind,
      status: fact.value && fact.source_id ? 'known' : 'unknown',
      value: fact.value,
      citationId: fact.source_id,
      unknownReason: fact.unknown_reason,
      suggestedAction: fact.suggested_action,
    }))
    const scholarships: GroundingRecord[] = (university.university_scholarships ?? []).flatMap((link) => {
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

/** Strip formatting so "$11,700" and "11 700 USD" compare equal. */
const normalizeText = (input: string) => input.toLowerCase().replace(/[^a-z0-9]/g, '')
const normalizeNumber = (input: string) => input.replace(/[,\s]/g, '').replace(/\.0+$/, '')

export function validateFigures(answer: string, records: GroundingRecord[], citations: string[]) {
  const knownRaw = records
    .filter((record) => record.status === 'known' && record.value && record.citationId)
    .map((record) => String(record.value))
    .join(' ')
  const knownNormalized = normalizeText(knownRaw)
  const knownNumbers = new Set((knownRaw.match(/\d[\d,. ]*\d|\d/g) ?? []).map(normalizeNumber))
  const patterns = [
    /(?:US)?[$€£]\s?\d(?:[\d,.]*\d)?(?:\s?(?:k|million|billion))?/gi,
    /\b(?:USD|EUR|GBP|UZS|KZT|TRY)\s?\d(?:[\d,.]*\d)?/gi,
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
  const untraceable = figures.filter((figure) => {
    const numbers = (figure.match(/\d[\d,. ]*\d|\d/g) ?? []).map(normalizeNumber)
    if (numbers.length > 0) return !numbers.every((value) => knownNumbers.has(value))
    return !knownNormalized.includes(normalizeText(figure))
  })
  return {
    ok: untraceable.length === 0 && (figures.length === 0 || citations.length > 0),
    figures,
    untraceable,
  }
}

export function buildVerifiedFactAnswer(kind: string, records: GroundingRecord[]) {
  const matching = records.filter((record) =>
    record.field === kind || (kind === 'aid_international' && record.field === 'scholarship_amount'))
  const known = matching.filter((record) =>
    record.status === 'known' && typeof record.value === 'string' && typeof record.citationId === 'string')
  if (known.length === 0) return null

  const label = kind.replaceAll('_', ' ')
  return {
    answer: known.map((record) => `Verified 4Prep ${label} for ${record.university}: ${record.value}.`).join(' '),
    citations: [...new Set(known.map((record) => record.citationId as string))],
  }
}
