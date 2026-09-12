import { mapDegreeLevel, mapSubjectArea } from './mapping.ts'

Deno.test('QS programme mapping maps only explicit QS labels', () => {
  if (mapDegreeLevel('Master of Science') !== 'master') throw new Error('master was not mapped')
  if (mapSubjectArea('Engineering and Technology') !== 'Engineering and Technology') throw new Error('subject was not mapped')
})
Deno.test('QS programme mapping excludes unknown enum values', () => {
  if (mapDegreeLevel('Foundation') !== null || mapSubjectArea('Computing') !== null) throw new Error('unknown enum was guessed')
})
