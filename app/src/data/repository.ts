import type { Pathway, Source, StudentProfile, University, UniversityFilters, Verification } from '../types'
import { computeFit, PHI_WEIGHTS } from '../scoring/phi'
import {
  bestPublishedCostScenario,
  hasComprehensiveInternationalFunding,
  hasFullNeedPolicy,
} from '../scoring/costs'
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
  university_facts(kind,value,numeric_value,currency,amount_period,source_id,unknown_reason,suggested_action),
  requirements(kind,value,numeric_value,source_id,unknown_reason,suggested_action),
  programs(id,name,degree,field,program_facts(kind,value,numeric_value,currency,amount_period,source_id,unknown_reason,suggested_action)),
  university_scholarships(scholarships(id,name,amount_value,amount_numeric,currency,amount_period,amount_source_id,amount_unknown_reason,amount_suggested_action))
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
    if (hasFullNeedPolicy(university) || hasComprehensiveInternationalFunding(university)) return true
    const scenario = bestPublishedCostScenario(university)
    if (scenario?.currency === 'USD' && scenario.netCost > filters.budgetMax) return false
  }
  return true
}

export async function listSources(): Promise<Source[]> {
  const { data, error } = await getSupabaseClient()
    .from('sources')
    .select('id,name,url,retrieved_at,verification')
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
      fit: computeFit(profile, university, PHI_WEIGHTS),
    }))
    .sort((left, right) => (right.fit?.overall ?? 0) - (left.fit?.overall ?? 0))

  return { profile, ranked, milestones: pathwayMilestones }
}

export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  const { data, error } = await getSupabaseClient()
    .from('student_profiles')
    .select('country,field,academic_score,budget_max,budget_currency,language_test,language_score,needs_language_pathway,intake')
    .eq('user_id', userId)
    .maybeSingle()
  throwIfError(error)
  if (!data) return null
  return {
    country: data.country,
    field: data.field,
    academicScore: data.academic_score === null ? null : Number(data.academic_score),
    budgetMax: data.budget_max === null ? null : Number(data.budget_max),
    budgetCurrency: data.budget_currency,
    languageTest: data.language_test as StudentProfile['languageTest'],
    languageScore: data.language_score === null ? null : Number(data.language_score),
    needsLanguagePathway: data.needs_language_pathway,
    intake: data.intake,
  }
}

export async function saveStudentProfile(userId: string, profile: StudentProfile): Promise<void> {
  const { error } = await getSupabaseClient().from('student_profiles').upsert({
    user_id: userId,
    country: profile.country,
    field: profile.field,
    academic_score: profile.academicScore,
    budget_max: profile.budgetMax,
    budget_currency: profile.budgetCurrency,
    language_test: profile.languageTest,
    language_score: profile.languageScore,
    needs_language_pathway: profile.needsLanguagePathway,
    intake: profile.intake,
    consented_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  throwIfError(error)
}

export async function listSavedPlanIds(userId: string): Promise<string[]> {
  const { data, error } = await getSupabaseClient()
    .from('saved_plans')
    .select('university_id')
    .eq('user_id', userId)
    .order('created_at')
  throwIfError(error)
  return (data ?? []).map((row) => row.university_id)
}

export async function savePlan(userId: string, universityId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('saved_plans')
    .upsert({ user_id: userId, university_id: universityId }, { onConflict: 'user_id,university_id', ignoreDuplicates: true })
  throwIfError(error)
}

export async function removePlan(userId: string, universityId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('saved_plans')
    .delete()
    .eq('user_id', userId)
    .eq('university_id', universityId)
  throwIfError(error)
}
