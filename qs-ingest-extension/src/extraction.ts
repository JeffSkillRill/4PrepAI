import type { Extraction, ProfilePayload, Programme, UniversityIdentity } from './types.js'
import { mapDegreeLevel, mapSubjectArea } from './mapping.js'

export { mapDegreeLevel, mapSubjectArea } from './mapping.js'

type StructuredAddress = { city: string; country?: string; region?: string }

function clean(value: string | null | undefined): string | undefined {
  const cleaned = value?.replace(/\s+/g, ' ').trim()
  return cleaned || undefined
}

function textAfterLabel(lines: string[], pattern: RegExp): string | undefined {
  const index = lines.findIndex((line) => pattern.test(line))
  return index >= 0 ? clean(lines[index + 1]) : undefined
}

function walkStrings(value: unknown, lines: string[]): void {
  if (typeof value === 'string') lines.push(value)
  else if (Array.isArray(value)) value.forEach((item) => walkStrings(item, lines))
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => walkStrings(item, lines))
}

function structuredJson(document: Document): unknown[] {
  const values: unknown[] = []
  for (const script of Array.from(document.querySelectorAll('script[type="application/ld+json"],script#__NEXT_DATA__'))) {
    try {
      values.push(JSON.parse(script.textContent ?? ''))
    } catch {
      // A malformed embedded block must not prevent visible-page extraction.
    }
  }
  return values
}

function structuredAddresses(value: unknown, addresses: StructuredAddress[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => structuredAddresses(item, addresses))
    return
  }
  if (!value || typeof value !== 'object') return

  const record = value as Record<string, unknown>
  const city = clean(typeof record.addressLocality === 'string' ? record.addressLocality : undefined)
  const country = clean(typeof record.addressCountry === 'string' ? record.addressCountry : undefined)
  const region = clean(typeof record.addressRegion === 'string' ? record.addressRegion : undefined)
  if (city && (country || region)) addresses.push({ city, ...(country === undefined ? {} : { country }), ...(region === undefined ? {} : { region }) })
  Object.values(record).forEach((item) => structuredAddresses(item, addresses))
}

function localDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function extractIdentity(document: Document, addresses: StructuredAddress[]): UniversityIdentity {
  const name = clean(document.querySelector('h1')?.textContent) ?? clean(document.title.split('|', 1)[0])
  const location = addresses[0]
  const city = location?.city ?? clean(document.querySelector('#p2-campus-location option[data-city]')?.getAttribute('data-city'))
  // The country/state values come from JSON-LD exactly as QS publishes them.
  const region = location?.country ?? location?.region
  return {
    ...(name === undefined ? {} : { name }),
    ...(city === undefined ? {} : { city }),
    ...(region === undefined ? {} : { region }),
  }
}

function rankDisplay(value: string | null | undefined): string | undefined {
  // The leading hash is QS presentation chrome. Preserve the printed rank
  // notation itself (`1`, `=43`), while excluding ranges and inequalities.
  const compact = clean(value)?.replace(/\s+/g, '')
  const match = compact?.match(/^#?(=?\d+)$/)
  return match?.[1]
}

function isQsRankingLabel(value: string | undefined): value is string {
  return Boolean(value && /^QS\b.*\bRankings?(?:\s+By\s+Subject)?$/i.test(value))
}

function addRanking(
  into: NonNullable<ProfilePayload['rankings']>,
  label: string | undefined,
  display: string | undefined,
  year?: number,
): void {
  if (!isQsRankingLabel(label) || !display) return
  const existing = into.find((ranking) => ranking.label === label && ranking.rankDisplay === display)
  if (existing) {
    if (existing.year === undefined && year !== undefined) existing.year = year
    return
  }
  into.push({ label, rankDisplay: display, ...(year === undefined ? {} : { year }) })
}

function extractRankings(document: Document, lines: string[]): NonNullable<ProfilePayload['rankings']> {
  const rankings: NonNullable<ProfilePayload['rankings']> = []

  // QS rank cards keep the number and title in labelled descendants. This avoids
  // confusing unrelated Rankings navigation links for data.
  for (const card of Array.from(document.querySelectorAll('#p2-rankings .rnk-list .nav-item a'))) {
    addRanking(rankings, clean(card.querySelector('h3')?.textContent), rankDisplay(card.querySelector('.latest_rank')?.textContent))
  }

  for (const line of lines) {
    // A saved QS page can flatten a rank card as `#1QS World University Rankings`.
    const glued = line.match(/^#?\s*(=?\d+)(QS\b.*?\bRankings?(?:\s+By\s+Subject)?)(?:\s+((?:19|20)\d{2}))?$/i)
    if (glued) {
      addRanking(rankings, clean(glued[2]), rankDisplay(glued[1]), glued[3] === undefined ? undefined : Number(glued[3]))
      continue
    }

    // The profile summary carries the displayed ranking year when QS prints one.
    const sentence = line.match(/\bis\s+ranked\s+#(=?\d+)\s+in\s+(QS\b.*?\bRankings?(?:\s+By\s+Subject)?)(?:\s+((?:19|20)\d{2}))?(?:[.!;]|$)/i)
    if (sentence) addRanking(rankings, clean(sentence[2]), rankDisplay(sentence[1]), sentence[3] === undefined ? undefined : Number(sentence[3]))
  }

  return rankings
}

function extractCampuses(document: Document, structured: unknown[]): NonNullable<ProfilePayload['campuses']> {
  const addresses: StructuredAddress[] = []
  structured.forEach((value) => structuredAddresses(value, addresses))
  const campuses: NonNullable<ProfilePayload['campuses']> = []

  // QS labels name and city in Campus locations. The full country must be
  // explicitly present in JSON-LD; the country code is never expanded by us.
  for (const option of Array.from(document.querySelectorAll('#p2-campus-location option[data-campus][data-city]'))) {
    const name = clean(option.getAttribute('data-campus'))
    const city = clean(option.getAttribute('data-city'))
  const country = city === undefined ? undefined : addresses.find((address) => address.city === city)?.country
    if (!name || !city || !country) continue
    if (!campuses.some((campus) => campus.name === name && campus.city === city && campus.country === country)) {
      campuses.push({ name, city, country })
    }
  }
  return campuses
}

/** Reads structured page data first; fallback text parsing keeps every displayed value verbatim. */
export function extractFromDocument(document: Document, pageUrl: string): Extraction {
  const structured = structuredJson(document)
  const structuredLines: string[] = []
  structured.forEach((value) => walkStrings(value, structuredLines))
  const addresses: StructuredAddress[] = []
  structured.forEach((value) => structuredAddresses(value, addresses))
  const lines = [
    ...structuredLines,
    ...Array.from(document.querySelectorAll('h1,h2,h3,h4,p,li,dt,dd')).map((node) => node.textContent ?? ''),
  ].map(clean).filter((line): line is string => Boolean(line))

  const identity = extractIdentity(document, addresses)
  const found: ProfilePayload = { source: { url: pageUrl, retrievedDate: localDate() }, identity }
  const absent: string[] = []
  const needsReview: string[] = []

  if (identity.name === undefined) absent.push('identity.name')
  if (identity.city === undefined) absent.push('identity.city')
  if (identity.region === undefined) absent.push('identity.region')

  const international = textAfterLabel(lines, /^international students?$/i)
  if (international) found.internationalStudentPct = international
  else absent.push('internationalStudentPct')
  const faculty = textAfterLabel(lines, /^(total )?faculty( staff)?$/i)
  if (faculty) found.facultyCount = faculty
  else absent.push('facultyCount')
  const employability = textAfterLabel(lines, /^employability rate$/i)
  if (employability) found.employabilityRate = employability
  else absent.push('employabilityRate')
  const summary = textAfterLabel(lines, /^employability$/i)
  if (summary) found.employabilitySummary = summary
  else absent.push('employabilitySummary')

  const rankings = extractRankings(document, lines)
  if (rankings.length) found.rankings = rankings
  else absent.push('rankings')

  const campuses = extractCampuses(document, structured)
  if (campuses.length) found.campuses = campuses
  else absent.push('campuses')

  const costs: NonNullable<ProfilePayload['costOfLiving']> = {}
  for (const key of ['accommodation', 'food', 'transport', 'utilities'] as const) {
    const value = textAfterLabel(lines, new RegExp(`^${key}$`, 'i'))
    if (value) costs[key] = value
    else absent.push(`costOfLiving.${key}`)
  }
  if (Object.keys(costs).length) found.costOfLiving = costs

  const programmes: Programme[] = []
  for (const programmeLink of Array.from(document.querySelectorAll('#p2-programs [class*="qs_program_name_"]'))) {
    const name = clean(programmeLink.querySelector('h4')?.textContent)
    const accordion = programmeLink.closest('.accordion-item')
    const degree = clean(accordion?.querySelector('.accordion-button')?.textContent)?.replace(/\s*\(\d+\)\s*$/, '')
    const subject = clean(programmeLink.closest('.item')?.querySelector('.pgmname')?.textContent)
    if (!name || !degree || !subject) continue
    const degreeLevel = mapDegreeLevel(degree)
    const subjectArea = mapSubjectArea(subject)
    if (!degreeLevel || !subjectArea) {
      needsReview.push(`programme: ${name}`)
      continue
    }
    programmes.push({ name, degree, degreeLevel, subjectArea })
  }
  if (programmes.length) found.programmes = programmes
  else absent.push('programmes')

  return { found, absent, needsReview }
}
