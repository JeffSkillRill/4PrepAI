import type { Pathway, Source, StudentProfile, University, UniversityFilters, Verification } from '../types'
import { computeFit, DEFAULT_PHI_WEIGHTS } from '../scoring/phi'
import { numericPart } from '../scoring/phi'
import { pathwayMilestones } from './static-content'
import { getSupabaseClient } from './client'
import {
  mapSource,
  mapUniversity,
  type RawSource,
  type RawUniversity,
} from './mappers'

const universitySelect = `
  id,name,city,country,flag,tagline,description,photo_seed,highlights,source_id,
  university_facts(kind,value,numeric_value,currency,source_id,unknown_reason,suggested_action),
  requirements(kind,value,numeric_value,source_id,unknown_reason,suggested_action),
  programs(id,name,degree,field,program_facts(kind,value,numeric_value,currency,source_id,unknown_reason,suggested_action)),
  university_scholarships(scholarships(id,name,amount_value,amount_source_id,amount_unknown_reason,amount_suggested_action))
`

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(`4Prep data request failed: ${error.message}`)
}

async function verificationLookup(): Promise<Map<string, Verification>> {
  const sources = await listSources()
  return new Map(sources.map((source) => [source.id, source.verification]))
}

function matchesFilters(university: University, filters: UniversityFilters): boolean {
  if (filters.country && university.country !== filters.country) return false
  if (filters.field && !university.programs.some((program) => program.field === filters.field)) return false
  if (filters.query) {
    const query = filters.query.toLowerCase()
    const haystack = [
      university.name,
      university.city,
      university.country,
      ...university.programs.flatMap((program) => [program.name, program.field]),
    ].join(' ').toLowerCase()
    if (!haystack.includes(query)) return false
  }
  if (filters.budgetMax !== undefined && filters.budgetMax !== null) {
    const tuition = numericPart(university.tuition)
    const living = numericPart(university.livingCost)
    if (tuition !== null && living !== null && tuition + living > filters.budgetMax) return false
  }
  return true
}

export async function listSources(): Promise<Source[]> {
  const { data, error } = await getSupabaseClient()
    .from('sources')
    .select('id,origin,url,retrieved_at,verification')
    .order('id')
  throwIfError(error)
  return ((data ?? []) as RawSource[]).map(mapSource)
}

export async function listUniversities(filters: UniversityFilters = {}): Promise<University[]> {
  const [result, verificationBySource] = await Promise.all([
    getSupabaseClient().from('universities').select(universitySelect).order('name'),
    verificationLookup(),
  ])
  throwIfError(result.error)
  return ((result.data ?? []) as unknown as RawUniversity[])
    .map((row) => mapUniversity(row, verificationBySource))
    .filter((university) => matchesFilters(university, filters))
}

export async function getUniversity(id: string): Promise<University | null> {
  const [result, verificationBySource] = await Promise.all([
    getSupabaseClient().from('universities').select(universitySelect).eq('id', id).maybeSingle(),
    verificationLookup(),
  ])
  throwIfError(result.error)
  return result.data ? mapUniversity(result.data as unknown as RawUniversity, verificationBySource) : null
}

export async function listScholarshipsForUniversity(id: string) {
  const university = await getUniversity(id)
  return university?.scholarships ?? []
}

export async function getRankedPathway(profile: StudentProfile): Promise<Pathway> {
  const universities = await listUniversities()
  const ranked = universities
    .map((university) => ({
      ...university,
      fit: computeFit(profile, university, {
        ...DEFAULT_PHI_WEIGHTS,
        computedAt: new Date().toISOString(),
      }),
    }))
    .sort((left, right) => (right.fit?.overall ?? 0) - (left.fit?.overall ?? 0))

  return { profile, ranked, milestones: pathwayMilestones }
}
