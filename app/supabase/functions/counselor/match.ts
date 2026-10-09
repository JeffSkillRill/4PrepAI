// Match the universities a student names against the WHOLE verified catalogue.
// Replaces the former 10-name alias table, which silently refused questions about
// every Scorecard university added later. Pure and dependency-free so both the
// Edge Function and its Vitest suite can import it.

export type NamedUniversity = { id: string; name: string }

// Hand-kept nicknames, keyed by the university's official name exactly as
// stored in universities.name (compared after normalize(), so case and
// punctuation do not matter). Keyed by name rather than id so a future id
// change can never silently disable a nickname, as happened to MIT and Penn.
// Only unambiguous short forms belong here: never an ordinary word or another
// school's name. The ambiguity rule below still drops any form two schools share.
const NICKNAMES: Record<string, string[]> = {
  'Harvard University': ['harvard'],
  'Yale University': ['yale'],
  'Princeton University': ['princeton'],
  'Berea College': ['berea'],
  'Illinois Wesleyan University': ['illinois wesleyan', 'iwu'],
  'Clark University': ['clark'],
  'University of Southern Mississippi': ['southern miss', 'usm'],
  'University of Alabama': ['alabama'],
  'University of Nebraska at Kearney': ['unk', 'nebraska kearney'],
  'Houston City College': ['houston community college', 'hcc'],
  'Massachusetts Institute of Technology': ['mit'],
  'California Institute of Technology': ['caltech'],
  'University of Pennsylvania': ['upenn', 'penn'],
  'Pennsylvania State University-Main Campus': ['penn state'],
  'University of California-Los Angeles': ['ucla'],
  'University of California-Berkeley': ['uc berkeley', 'berkeley'],
  'University of California-San Diego': ['ucsd', 'uc san diego'],
  'University of California-Santa Barbara': ['ucsb', 'uc santa barbara'],
  'University of California-Davis': ['uc davis'],
  'University of California-Irvine': ['uc irvine'],
  'University of Southern California': ['usc'],
  'New York University': ['nyu'],
  'Georgia Institute of Technology-Main Campus': ['georgia tech'],
  'Carnegie Mellon University': ['cmu', 'carnegie mellon'],
  'Columbia University in the City of New York': ['columbia'],
  'Johns Hopkins University': ['jhu', 'hopkins'],
  'Washington University in St Louis': ['wustl', 'washu'],
  'University of Chicago': ['uchicago'],
  'University of Michigan-Ann Arbor': ['umich'],
  'University of Virginia-Main Campus': ['uva'],
  'University of North Carolina at Chapel Hill': ['unc', 'unc chapel hill'],
  'The University of Texas at Austin': ['ut austin'],
  'University of Illinois Urbana-Champaign': ['uiuc'],
  'University of Wisconsin-Madison': ['uw madison'],
  'Texas A&M University-College Station': ['texas a and m', 'tamu'],
  'Virginia Polytechnic Institute and State University': ['virginia tech'],
  'North Carolina State University at Raleigh': ['nc state'],
  'Rensselaer Polytechnic Institute': ['rpi'],
  'Worcester Polytechnic Institute': ['wpi'],
  'New Jersey Institute of Technology': ['njit'],
  'University of Massachusetts-Amherst': ['umass amherst', 'umass'],
  'University of Connecticut': ['uconn'],
  'Rutgers University-New Brunswick': ['rutgers'],
  'Tulane University of Louisiana': ['tulane'],
  'George Washington University': ['gwu'],
  'California Polytechnic State University-San Luis Obispo': ['cal poly', 'cal poly slo'],
}

const nicknamesByName = new Map(Object.entries(NICKNAMES).map(([name, forms]) => [normalize(name), forms]))
let nicknameKeysChecked = false

/** Logs, once per cold start, any nickname key that names no catalogue university. */
function warnUnusedNicknames(catalogue: NamedUniversity[]) {
  if (nicknameKeysChecked || catalogue.length === 0) return
  nicknameKeysChecked = true
  const names = new Set(catalogue.map((university) => normalize(university.name)))
  const unused = Object.keys(NICKNAMES).filter((name) => !names.has(normalize(name)))
  if (unused.length) console.warn('COUNSELOR_NICKNAME_UNMATCHED', unused)
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
  for (const nickname of nicknamesByName.get(normalize(university.name)) ?? []) forms.add(normalize(nickname).trim())
  return [...forms].filter((form) => form.length >= 3)
}

/**
 * Returns catalogue ids named in `message`, longest match first, each span used once,
 * so "University of Washington" never also matches a shorter form of another school.
 * A short form shared by two universities is ambiguous and dropped.
 */
export function matchUniversities(message: string, catalogue: NamedUniversity[], limit = 5): string[] {
  warnUnusedNicknames(catalogue)
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
