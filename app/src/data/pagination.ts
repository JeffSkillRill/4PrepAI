/** Inclusive PostgREST ranges, safely below the configured 1,000-row limit. */
export async function collectPages<T>(load: (from: number, to: number) => Promise<T[]>, pageSize = 100): Promise<T[]> {
  const rows: T[] = []
  for (let offset = 0; ; offset += pageSize) {
    const page = await load(offset, offset + pageSize - 1)
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
}
