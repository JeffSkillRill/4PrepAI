/**
 * CIP (Classification of Instructional Programs) family names.
 *
 * College Scorecard reports each programme's 4-digit CIP code and title, but no
 * name for the 2-digit family the code belongs to. These names are therefore NOT
 * authored here:
 *
 *  - Most are derived from Scorecard's own data. NCES names every `xx99` code
 *    "<Family name>, Other.", so the family name is read off the source's own
 *    titles with that suffix removed. 37 of the 43 families present in the
 *    catalogue resolve this way.
 *  - Six families publish no `xx99` code in the catalogue. Their titles come from
 *    the NCES CIP 2020 browser (https://nces.ed.gov/ipeds/cipcode/browse.aspx?y=56).
 *
 * Six further families (28, 32, 33, 36, 53, 60 — 12 programme rows in total) are
 * left unresolved on purpose. `cipFamilyName` labels those with their bare code
 * rather than a guessed name, so an unnamed group reads as a gap in the data and
 * never as an invented classification.
 */

/** Derived from Scorecard's own "<Family>, Other." titles. */
const DERIVED_FAMILY_NAMES: Readonly<Record<string, string>> = {
  '01': 'Agricultural/Animal/Plant/Veterinary Science and Related Fields',
  '03': 'Natural Resources and Conservation',
  '04': 'Architecture and Related Services',
  '05': 'Area, Ethnic, Cultural, Gender, and Group Studies',
  '09': 'Communication, Journalism, and Related Programs',
  '11': 'Computer and Information Sciences and Support Services',
  '13': 'Education',
  '14': 'Engineering',
  '15': 'Engineering/Engineering-Related Technologies/Technicians',
  '16': 'Foreign Languages, Literatures, and Linguistics',
  '19': 'Family and Consumer Sciences/Human Sciences',
  '22': 'Legal Professions and Studies',
  '23': 'English Language and Literature/Letters',
  '25': 'Library Science',
  '26': 'Biological and Biomedical Sciences',
  '27': 'Mathematics and Statistics',
  '29': 'Military Technologies and Applied Sciences',
  '30': 'Multi/Interdisciplinary Studies',
  '31': 'Parks, Recreation, Leisure, Fitness, and Kinesiology',
  '38': 'Philosophy and Religious Studies',
  '39': 'Theology and Religious Vocations',
  '40': 'Physical Sciences',
  '41': 'Science Technologies/Technicians',
  '42': 'Psychology',
  '43': 'Homeland Security, Law Enforcement, Firefighting and Related Protective Services',
  '44': 'Public Administration and Social Service Professions',
  '45': 'Social Sciences',
  '49': 'Transportation and Materials Moving',
  '50': 'Visual and Performing Arts',
  '51': 'Health Professions and Related Clinical Sciences',
  '52': 'Business, Management, Marketing, and Related Support Services',
}

/** Families with no `xx99` code in the catalogue; titles from the NCES CIP 2020 browser. */
const NCES_FAMILY_NAMES: Readonly<Record<string, string>> = {
  '10': 'Communications Technologies/Technicians and Support Services',
  '12': 'Culinary, Entertainment, and Personal Services',
  '24': 'Liberal Arts and Sciences, General Studies and Humanities',
  '46': 'Construction Trades',
  '48': 'Precision Production',
  '54': 'History',
}

export const CIP_FAMILY_NAMES: Readonly<Record<string, string>> = {
  ...DERIVED_FAMILY_NAMES,
  ...NCES_FAMILY_NAMES,
}

/**
 * The subject grouping for a programme. Falls back to the bare CIP family code
 * when no sourced name exists — an honest "we do not have a name for this"
 * rather than a bucket chosen by us.
 */
export function cipFamilyName(cipCode: string): string {
  const family = cipCode.slice(0, 2)
  return CIP_FAMILY_NAMES[family] ?? `CIP ${family}`
}
