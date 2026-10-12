import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2.117.2'

export async function listStorageObjects(admin: SupabaseClient, prefix: string, bucket = 'learning-submissions'): Promise<string[]> {
  const paths: string[] = []
  const limit = 100
  for (let offset = 0; ; offset += limit) {
    const { data, error } = await admin.storage.from(bucket).list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw error
    for (const item of data ?? []) {
      const path = `${prefix}/${item.name}`
      if (item.id) paths.push(path)
      else paths.push(...await listStorageObjects(admin, path, bucket))
    }
    if ((data?.length ?? 0) < limit) return paths
  }
}

export async function removeStorageObjects(admin: SupabaseClient, paths: string[], bucket = 'learning-submissions'): Promise<void> {
  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await admin.storage.from(bucket).remove(paths.slice(index, index + 100))
    if (error) throw error
  }
}

export function verifyOwnedPaths(owner: string, paths: string[]): string[] {
  if (paths.some((path) => !path.startsWith(`${owner}/`))) throw new Error('STORAGE_OWNER_MISMATCH')
  return paths
}
