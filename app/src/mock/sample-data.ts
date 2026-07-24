import type { DataPoint, ToolItem, University } from '../types'

const source = (label: string, checkedAt = '18 Jul 2026') => ({ label, checkedAt })
const dp = <T,>(value: T, label = 'Sample university page'): DataPoint<T> => ({ value, source: source(label) })
const missing = <T,>(reason: string, nextAction: string): DataPoint<T> => ({
  value: null,
  source: source('Not published'),
  missingReason: reason,
  nextAction,
})

export const universities: University[] = [
  {
    id: 'northbridge', name: 'Northbridge University', city: 'Manchester', country: 'United Kingdom', flag: '🇬🇧',
    tagline: 'Career-focused study in a lively student city', photoSeed: 'northbridge',
    description: 'A fictional composite university used to demonstrate how 4Prep organizes course, cost, and admissions evidence for international applicants.',
    fit: { grade: 'A', label: 'Strong fit', summary: 'Your budget, subject, and preferred intake line up well.', components: [
      { label: 'Budget fit', grade: 'A', tone: 'strong', reason: 'Estimated study costs sit within your stated range.' },
      { label: 'Academic fit', grade: 'A−', tone: 'strong', reason: 'Your current subjects align with entry expectations.' },
      { label: 'Language fit', grade: 'B+', tone: 'strong', reason: 'Your IELTS goal is close to the sample requirement.' },
      { label: 'Deadline fit', grade: 'A', tone: 'strong', reason: 'There is useful preparation time before the intake.' },
      { label: 'Funding fit', grade: 'B', tone: 'medium', reason: 'A sample award exists, but availability needs checking.' },
    ]},
    tuition: dp('£18,900 / year'), livingCost: dp('£10,200–£12,400 / year', 'Sample city cost guide'), applicationFee: dp('No fee shown'),
    deadline: dp('30 June 2027'), scholarship: dp('Up to £3,000', 'Sample scholarship page'), language: dp('English'), ielts: dp('6.0 overall'), intake: dp('September 2027'),
    programs: [
      { name: 'Computer Science', degree: 'BSc (Hons)', duration: dp('3 years'), tuition: dp('£18,900 / year') },
      { name: 'Business Analytics', degree: 'BSc (Hons)', duration: dp('3 years'), tuition: dp('£18,400 / year') },
    ],
    highlights: ['City-centre campus', 'Optional placement year', 'International student support'],
  },
  {
    id: 'westhaven', name: 'Westhaven Institute of Technology', city: 'Dublin', country: 'Ireland', flag: '🇮🇪',
    tagline: 'Applied technology with an international outlook', photoSeed: 'westhaven',
    description: 'A fictional composite institution illustrating a practical, technology-led pathway with transparent evidence gaps.',
    fit: { grade: 'B+', label: 'Good fit', summary: 'The course match is strong; living costs need closer review.', components: [
      { label: 'Budget fit', grade: 'B−', tone: 'medium', reason: 'Estimated living costs may stretch your stated range.' },
      { label: 'Academic fit', grade: 'A', tone: 'strong', reason: 'The sample entry profile matches your subjects.' },
      { label: 'Language fit', grade: 'B+', tone: 'strong', reason: 'Your IELTS goal is close to the sample requirement.' },
      { label: 'Deadline fit', grade: 'A−', tone: 'strong', reason: 'Your preferred intake remains realistic.' },
      { label: 'Funding fit', grade: 'C+', tone: 'medium', reason: 'Award details are not fully published in this sample.' },
    ]},
    tuition: dp('€16,500 / year'), livingCost: dp('€12,000–€15,000 / year', 'Sample city cost guide'), applicationFee: dp('€45'),
    deadline: dp('1 May 2027'), scholarship: missing('The award amount is not published in the sample.', 'Ask admissions for the current international award list.'), language: dp('English'), ielts: dp('6.0 overall'), intake: dp('September 2027'),
    programs: [
      { name: 'Software Engineering', degree: 'BEng', duration: dp('4 years'), tuition: dp('€16,500 / year') },
      { name: 'Digital Business', degree: 'BSc', duration: dp('3 years'), tuition: dp('€15,900 / year') },
    ],
    highlights: ['Applied project modules', 'Industry mentor scheme', 'Central Dublin location'],
  },
  {
    id: 'rheinland', name: 'Rheinland Applied University', city: 'Cologne', country: 'Germany', flag: '🇩🇪',
    tagline: 'Practice-led learning in the heart of Europe', photoSeed: 'rheinland',
    description: 'A fictional composite applied university showing a lower-tuition route with additional language planning considerations.',
    fit: { grade: 'B', label: 'Promising fit', summary: 'Budget fit is excellent; language planning is the main gap.', components: [
      { label: 'Budget fit', grade: 'A+', tone: 'strong', reason: 'The published sample fee is comfortably in range.' },
      { label: 'Academic fit', grade: 'B+', tone: 'strong', reason: 'Your subjects broadly align with the program.' },
      { label: 'Language fit', grade: 'C', tone: 'weak', reason: 'Some modules may require additional German.' },
      { label: 'Deadline fit', grade: 'B+', tone: 'strong', reason: 'You have time, but document review should start early.' },
      { label: 'Funding fit', grade: 'B', tone: 'medium', reason: 'Lower tuition helps; no sample award is confirmed.' },
    ]},
    tuition: dp('€3,200 / semester'), livingCost: dp('€11,400–€13,200 / year', 'Sample city cost guide'), applicationFee: dp('€75'),
    deadline: dp('15 July 2027'), scholarship: missing('No institution award is listed in the sample.', 'Check DAAD and the university funding page.'), language: dp('English + some German'), ielts: dp('6.5 overall'), intake: dp('October 2027'),
    programs: [
      { name: 'International Information Systems', degree: 'BSc', duration: dp('3.5 years'), tuition: dp('€3,200 / semester') },
      { name: 'Sustainable Engineering', degree: 'BEng', duration: dp('3.5 years'), tuition: dp('€3,200 / semester') },
    ],
    highlights: ['Applied sciences focus', 'Intercultural semester', 'Regional employer projects'],
  },
  {
    id: 'maple-coast', name: 'Maple Coast University', city: 'Halifax', country: 'Canada', flag: '🇨🇦',
    tagline: 'Supportive learning on Canada’s Atlantic coast', photoSeed: 'maple-coast',
    description: 'A fictional composite Canadian university used to illustrate a supportive pathway with a higher overall cost profile.',
    fit: { grade: 'B−', label: 'Consider with care', summary: 'Strong support and course match, but total cost is above target.', components: [
      { label: 'Budget fit', grade: 'C', tone: 'weak', reason: 'Estimated total cost exceeds your preferred ceiling.' },
      { label: 'Academic fit', grade: 'B+', tone: 'strong', reason: 'Your profile aligns with the sample entry expectations.' },
      { label: 'Language fit', grade: 'A−', tone: 'strong', reason: 'Your IELTS goal meets the sample threshold.' },
      { label: 'Deadline fit', grade: 'B', tone: 'medium', reason: 'The earlier deadline needs a focused document plan.' },
      { label: 'Funding fit', grade: 'B−', tone: 'medium', reason: 'A sample award helps but does not close the full gap.' },
    ]},
    tuition: dp('CA$24,800 / year'), livingCost: dp('CA$14,000–CA$17,000 / year', 'Sample city cost guide'), applicationFee: dp('CA$110'),
    deadline: dp('1 February 2027'), scholarship: dp('CA$2,500 entrance award', 'Sample scholarship page'), language: dp('English'), ielts: dp('6.5 overall'), intake: dp('September 2027'),
    programs: [
      { name: 'Data Science', degree: 'BSc', duration: dp('4 years'), tuition: dp('CA$24,800 / year') },
      { name: 'International Management', degree: 'BCom', duration: dp('4 years'), tuition: dp('CA$23,900 / year') },
    ],
    highlights: ['First-year advising', 'Co-op option', 'Waterfront student city'],
  },
  {
    id: 'southern-crossroads', name: 'Southern Crossroads College', city: 'Melbourne', country: 'Australia', flag: '🇦🇺',
    tagline: 'A flexible city-campus route into global careers', photoSeed: 'southern-crossroads',
    description: 'A fictional composite college demonstrating an accessible pathway with rolling application guidance.',
    fit: { grade: 'B', label: 'Promising fit', summary: 'Flexible entry helps, while costs and timing need attention.', components: [
      { label: 'Budget fit', grade: 'C+', tone: 'medium', reason: 'The estimate sits at the top of your range.' },
      { label: 'Academic fit', grade: 'A−', tone: 'strong', reason: 'The pathway accepts a broad academic profile.' },
      { label: 'Language fit', grade: 'B+', tone: 'strong', reason: 'Your current plan is close to the threshold.' },
      { label: 'Deadline fit', grade: 'B', tone: 'medium', reason: 'Rolling review helps, but visa lead time matters.' },
      { label: 'Funding fit', grade: 'B−', tone: 'medium', reason: 'A tuition reduction is shown in the sample.' },
    ]},
    tuition: dp('A$27,600 / year'), livingCost: dp('A$18,000–A$22,000 / year', 'Sample city cost guide'), applicationFee: dp('A$80'),
    deadline: dp('Rolling; apply early'), scholarship: dp('10% tuition reduction', 'Sample scholarship page'), language: dp('English'), ielts: dp('6.0 overall'), intake: dp('February 2027'),
    programs: [
      { name: 'Information Technology', degree: 'Bachelor', duration: dp('3 years'), tuition: dp('A$27,600 / year') },
      { name: 'Commerce', degree: 'Bachelor', duration: dp('3 years'), tuition: dp('A$26,900 / year') },
    ],
    highlights: ['Multiple intakes', 'City campus', 'Embedded career workshops'],
  },
  {
    id: 'tulip', name: 'Tulip International University', city: 'Rotterdam', country: 'Netherlands', flag: '🇳🇱',
    tagline: 'Globally minded study in an entrepreneurial port city', photoSeed: 'tulip',
    description: 'A fictional composite Dutch university illustrating an international classroom and an early application cycle.',
    fit: { grade: 'A−', label: 'Strong fit', summary: 'Excellent subject and language alignment with manageable costs.', components: [
      { label: 'Budget fit', grade: 'B+', tone: 'strong', reason: 'Estimated total cost is within your upper range.' },
      { label: 'Academic fit', grade: 'A', tone: 'strong', reason: 'Your subject mix is a strong match.' },
      { label: 'Language fit', grade: 'A', tone: 'strong', reason: 'Your IELTS goal meets the sample requirement.' },
      { label: 'Deadline fit', grade: 'B', tone: 'medium', reason: 'The early deadline makes preparation time important.' },
      { label: 'Funding fit', grade: 'B', tone: 'medium', reason: 'A modest sample award may be available.' },
    ]},
    tuition: dp('€12,800 / year'), livingCost: dp('€12,600–€15,000 / year', 'Sample city cost guide'), applicationFee: dp('€100'),
    deadline: dp('15 January 2027'), scholarship: dp('€2,000 first-year award', 'Sample scholarship page'), language: dp('English'), ielts: dp('6.5 overall'), intake: dp('September 2027'),
    programs: [
      { name: 'International Business', degree: 'BSc', duration: dp('3 years'), tuition: dp('€12,800 / year') },
      { name: 'Economics & Data', degree: 'BSc', duration: dp('3 years'), tuition: dp('€13,200 / year') },
    ],
    highlights: ['International classroom', 'Project-based learning', 'Startup community'],
  },
]

export const tools: ToolItem[] = [
  { id: 'budget', name: 'Cost calculator', description: 'Build a source-backed estimate for tuition and living costs.', tag: 'Plan your budget' },
  { id: 'ielts', name: 'IELTS planner', description: 'Turn your target score into a focused weekly study plan.', tag: 'Prepare' },
  { id: 'deadline', name: 'Deadline tracker', description: 'See application, scholarship, and document dates together.', tag: 'Stay on track' },
  { id: 'compare', name: 'University compare', description: 'Review fit, cost, language, and deadlines side by side.', tag: 'Decide', view: 'compare' },
  { id: 'pathway', name: 'Pathway builder', description: 'Answer a few questions and get a practical application route.', tag: 'Start here', view: 'intake' },
  { id: 'documents', name: 'Document checklist', description: 'Understand what to prepare and which details to verify.', tag: 'Get ready' },
]

export const countryChips = [
  { label: 'United Kingdom', flag: '🇬🇧' }, { label: 'Canada', flag: '🇨🇦' }, { label: 'Germany', flag: '🇩🇪' },
  { label: 'Ireland', flag: '🇮🇪' }, { label: 'Netherlands', flag: '🇳🇱' }, { label: 'Australia', flag: '🇦🇺' },
]

export const fieldChips = ['Computer Science', 'Business', 'Engineering', 'Data Science', 'Design']

export const planMonths = [
  { month: 'Aug', title: 'Build shortlist', detail: 'Compare courses, total cost, and entry evidence.' },
  { month: 'Sep', title: 'Prepare documents', detail: 'Request transcripts and draft your statement.' },
  { month: 'Oct', title: 'Language focus', detail: 'Book a test date and close the score gap.' },
  { month: 'Nov', title: 'Submit early choices', detail: 'Check every source before submitting.' },
  { month: 'Dec', title: 'Funding review', detail: 'Apply for eligible sample-listed awards.' },
  { month: 'Jan', title: 'Final deadlines', detail: 'Complete remaining priority applications.' },
]
