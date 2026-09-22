import assert from 'node:assert/strict'
import test from 'node:test'
import { mapDegreeLevel, mapSubjectArea } from './mapping.js'

test('QS programme mapping maps only explicit QS labels', () => {
  assert.equal(mapDegreeLevel('Master of Science'), 'master')
  assert.equal(mapSubjectArea('Engineering and Technology'), 'Engineering and Technology')
})

test('QS programme mapping excludes unknown enum values', () => {
  assert.equal(mapDegreeLevel('Foundation'), null)
  assert.equal(mapSubjectArea('Computing'), null)
})
