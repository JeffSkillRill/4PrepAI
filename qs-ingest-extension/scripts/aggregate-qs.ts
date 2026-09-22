import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

type JsonRecord = Record<string, unknown>
type CsvRow = Array<string>

function object(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function slug(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function csv(rows: CsvRow[]): string {
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`
}

async function main(): Promise<void> {
  const folder = resolve(process.argv[2] ?? './qs-collected')
  const entries = await readdir(folder, { withFileTypes: true })
  const jsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json')).map((entry) => entry.name).sort()
  const universities: CsvRow[] = [['slug', 'name', 'city', 'region', 'source_url', 'retrieved_date']]
  const rankings: CsvRow[] = [['slug', 'label', 'rank_display', 'year']]
  const campuses: CsvRow[] = [['slug', 'campus_name', 'city', 'country']]
  const missingIdentity: string[] = []
  let universityCount = 0
  let rankingCount = 0
  let campusCount = 0

  for (const filename of jsonFiles) {
    let record: JsonRecord | null = null
    try {
      record = object(JSON.parse(await readFile(resolve(folder, filename), 'utf8')))
    } catch {
      console.error(`Skipped invalid JSON: ${filename}`)
      continue
    }
    if (!record) {
      console.error(`Skipped non-object JSON: ${filename}`)
      continue
    }

    const identity = object(record.identity)
    const source = object(record.source)
    const name = text(identity?.name)
    const recordSlug = slug(name)
    if (!name) missingIdentity.push(filename)
    universities.push([recordSlug, name, text(identity?.city), text(identity?.region), text(source?.url), text(source?.retrievedDate)])
    universityCount += 1

    if (Array.isArray(record.rankings)) {
      for (const item of record.rankings) {
        const ranking = object(item)
        if (!ranking) continue
        rankings.push([recordSlug, text(ranking.label), text(ranking.rankDisplay), typeof ranking.year === 'number' && Number.isInteger(ranking.year) ? String(ranking.year) : ''])
        rankingCount += 1
      }
    }

    if (Array.isArray(record.campuses)) {
      for (const item of record.campuses) {
        const campus = object(item)
        if (!campus) continue
        campuses.push([recordSlug, text(campus.name), text(campus.city), text(campus.country)])
        campusCount += 1
      }
    }
  }

  await Promise.all([
    writeFile(resolve(folder, 'universities.csv'), csv(universities), 'utf8'),
    writeFile(resolve(folder, 'rankings.csv'), csv(rankings), 'utf8'),
    writeFile(resolve(folder, 'campuses.csv'), csv(campuses), 'utf8'),
  ])

  console.log(`${universityCount} universities, ${rankingCount} rankings, ${campusCount} campuses`)
  if (missingIdentity.length) console.log(`Missing identity.name: ${missingIdentity.join(', ')}`)
}

void main()
