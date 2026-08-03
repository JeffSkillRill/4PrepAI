export const PRODUCTION_SUPABASE_REF = 'pubhgajlqhdbpwqahtki'

export function describeSupabaseTarget(supabaseUrl: string | undefined) {
  if (!supabaseUrl) {
    return { label: 'Not configured', projectRef: null, production: false }
  }
  try {
    const parsed = new URL(supabaseUrl)
    const local = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost'
    if (local) {
      return {
        label: `Local Supabase · ${parsed.host}`,
        projectRef: null,
        production: false,
      }
    }
    const projectRef = parsed.hostname.endsWith('.supabase.co')
      ? parsed.hostname.slice(0, -'.supabase.co'.length)
      : null
    const production = projectRef === PRODUCTION_SUPABASE_REF
    return {
      label: `${projectRef ?? parsed.host}${production ? ' · PRODUCTION' : ' · non-production'}`,
      projectRef,
      production,
    }
  } catch {
    return { label: 'Invalid Supabase URL', projectRef: null, production: false }
  }
}

export function destructiveOperationsAllowed({
  development,
  supabaseUrl,
  explicitOverride,
}: {
  development: boolean
  supabaseUrl: string | undefined
  explicitOverride: boolean
}) {
  return !development || !describeSupabaseTarget(supabaseUrl).production || explicitOverride
}
