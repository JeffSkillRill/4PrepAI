import type { DegreeLevel, SubjectArea } from './types.js'

const subjects: Readonly<Record<string, SubjectArea>> = {
  'arts and humanities': 'Arts and Humanities', 'business and management': 'Business and Management',
  'engineering and technology': 'Engineering and Technology', 'life sciences and medicine': 'Life Sciences and Medicine',
  'natural sciences': 'Natural Sciences', 'social sciences and management': 'Social Sciences and Management',
}
export function mapDegreeLevel(value: string): DegreeLevel | null { const v=value.toLowerCase(); return /\bmba\b/.test(v)?'mba':/ph\.?d|doctor/.test(v)?'phd':/master|msc|m\.s\b|ma\b/.test(v)?'master':/bachelor|bsc|b\.s\b|undergraduate/.test(v)?'bachelor':null }
export function mapSubjectArea(value: string): SubjectArea | null { return subjects[value.trim().toLowerCase()] ?? null }
