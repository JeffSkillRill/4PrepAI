import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { extractFromDocument } from './extraction.js'

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__', 'real-qs-profile.html')

test('extracts only literally printed QS profile facts from the real fixture', {
  skip: existsSync(fixturePath) ? false : 'Waiting for the user-provided real QS profile HTML fixture.',
}, () => {
  const document = new JSDOM(readFileSync(fixturePath, 'utf8')).window.document
  const extraction = extractFromDocument(document, 'https://www.topuniversities.com/universities/fixture')

  assert.deepEqual(extraction.found.identity, {
    name: 'Massachusetts Institute of Technology (MIT)',
    city: 'Cambridge',
    region: 'United States',
  })
  assert.match(extraction.found.source.retrievedDate ?? '', /^\d{4}-\d{2}-\d{2}$/)
  assert.deepEqual(extraction.found.rankings, [
    { label: 'QS World University Rankings', rankDisplay: '1', year: 2027 },
    { label: 'QS WUR Ranking By Subject', rankDisplay: '1' },
    { label: 'QS Sustainability Ranking', rankDisplay: '=43' },
  ])
  assert.deepEqual(extraction.found.campuses, [
    {
      name: 'Massachusetts Institute of Technology (MIT) Campus',
      city: 'Cambridge',
      country: 'United States',
    },
  ])
  assert.equal(extraction.found.programmes, undefined)
  assert.deepEqual(extraction.absent, [
    'internationalStudentPct',
    'facultyCount',
    'employabilityRate',
    'employabilitySummary',
    'costOfLiving.accommodation',
    'costOfLiving.food',
    'costOfLiving.transport',
    'costOfLiving.utilities',
    'programmes',
  ])
  assert.deepEqual(extraction.needsReview, ['programme: Executive MBA'])
  assert.ok(extraction.found.rankings?.every((ranking) => !/Rankings Overview|Rankings & Ratings/.test(ranking.label)))
})
