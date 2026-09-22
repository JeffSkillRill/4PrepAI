export type DegreeLevel = 'bachelor' | 'master' | 'mba' | 'phd'
export type SubjectArea = 'Arts and Humanities' | 'Business and Management' | 'Engineering and Technology' | 'Life Sciences and Medicine' | 'Natural Sciences' | 'Social Sciences and Management'
export type Programme = { name: string; degree: string; degreeLevel: DegreeLevel; subjectArea: SubjectArea; duration?: string; tuition?: string }
export type UniversityIdentity = { name?: string; city?: string; region?: string }
export type ProfilePayload = { source: { url: string; retrievedDate?: string }; identity: UniversityIdentity; internationalStudentPct?: string; facultyCount?: string; employabilityRate?: string; employabilitySummary?: string; costOfLiving?: Partial<Record<'accommodation'|'food'|'transport'|'utilities', string>>; rankings?: Array<{ label: string; rankDisplay: string; year?: number }>; campuses?: Array<{ name: string; city: string; country: string }>; programmes?: Programme[] }
export type Extraction = { found: ProfilePayload; absent: string[]; needsReview: string[] }
