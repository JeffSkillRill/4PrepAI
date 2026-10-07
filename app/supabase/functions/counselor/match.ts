// Match the universities a student names against the WHOLE verified catalogue.
// Replaces the former 10-name alias table, which silently refused questions about
// every Scorecard university added later. Pure and dependency-free so both the
// Edge Function and its Vitest suite can import it.

export type NamedUniversity = { id: string; name: string }

// Hand-kept nicknames. Applied only when the id exists in the catalogue.
const NICKNAMES: Record<string, string[]> = {
  harvard: ['harvard'],
  yale: ['yale'],
  princeton: ['princeton'],
  berea: ['berea'],
  'illinois-wesleyan': ['illinois wesleyan', 'iwu'],
  clark: ['clark'],
  usm: ['southern miss', 'usm'],
  alabama: ['alabama'],
  unk: ['unk', 'nebraska kearney'],
  hcc: ['houston community college', 'hcc'],
  'massachusetts-institute-of-technology': ['mit'],
  'california-institute-of-technology': ['caltech'],
  'university-of-pennsylvania': ['upenn', 'penn'],
  'university-of-california-los-angeles': ['ucla'],
  'university-of-california-berkeley': ['uc berkeley', 'berkeley'],
  'university-of-southern-california': ['usc'],
  'new-york-university': ['nyu'],
  'georgia-institute-of-technology-main-campus': ['georgia tech'],
  'carnegie-mellon-university': ['cmu', 'carnegie mellon'],
}

// Words that carry no identity on their own.
const GENERIC = new Set(['the', 'university', 'college', 'of', 'at', 'in', 'and', 'main', 'campus', 'institute', 'school'])
// Short forms that collide with admissions vocabulary or ordinary words.
// US state names are never a university on their own ("Michigan" is two schools).
const US_STATES = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia',
  'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland',
  'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington',
  'wisconsin', 'wyoming', 'carolina', 'dakota', 'jersey', 'hampshire', 'mexico', 'york', 'rhode', 'island',
]
const NEVER_ALONE = new Set([
  ...US_STATES,
  'act', 'sat', 'gpa', 'det', 'art', 'arts', 'new', 'north', 'south', 'east', 'west', 'central', 'american',
  'technology', 'science', 'saint', 'st', 'los', 'angeles', 'san', 'city', 'national', 'international', 'state',
])

export function normalize(text: string): string {
  return ` ${text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `
}

function variants(university: NamedUniversity): string[] {
  const full = normalize(university.name).trim()
  const forms = new Set([full, full.replace(/^the /, '')])
  // "Harvard University" → "harvard"; "University of Michigan Ann Arbor" → "michigan ann arbor".
  const core = full.split(' ').filter((word) => !GENERIC.has(word)).join(' ')
  if (core && !(core.split(' ').length === 1 && NEVER_ALONE.has(core))) forms.add(core)
  for (const nickname of NICKNAMES[university.id] ?? []) forms.add(normalize(nickname).trim())
  return [...forms].filter((form) => form.length >= 3)
}

/**
 * Returns catalogue ids named in `message`, longest match first, each span used once,
 * so "University of Washington" never also matches a shorter form of another school.
 * A short form shared by two universities is ambiguous and dropped.
 */
export function matchUniversities(message: string, catalogue: NamedUniversity[], limit = 5): string[] {
  const owners = new Map<string, Set<string>>()
  for (const university of catalogue) {
    for (const form of variants(university)) {
      if (!owners.has(form)) owners.set(form, new Set())
      owners.get(form)!.add(university.id)
    }
  }
  const forms = [...owners.entries()]
    .filter(([, ids]) => ids.size === 1)
    .map(([form, ids]) => ({ form, id: [...ids][0] }))
    .sort((a, b) => b.form.length - a.form.length)

  let text = normalize(message)
  const matched: string[] = []
  for (const { form, id } of forms) {
    const needle = ` ${form} `
    if (!text.includes(needle)) continue
    if (!matched.includes(id)) matched.push(id)
    text = text.replaceAll(needle, ' | ')
    if (matched.length >= limit) break
  }
  return matched
}
