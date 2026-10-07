import { describe, expect, it } from 'vitest'
import { matchUniversities } from './match'

const catalogue = [
  { id: 'harvard', name: 'Harvard University' },
  { id: 'usm', name: 'University of Southern Mississippi' },
  { id: 'california-institute-of-technology', name: 'California Institute of Technology' },
  { id: 'university-of-washington-seattle-campus', name: 'University of Washington-Seattle Campus' },
  { id: 'washington-university-in-st-louis', name: 'Washington University in St Louis' },
  { id: 'university-of-michigan-ann-arbor', name: 'University of Michigan-Ann Arbor' },
  { id: 'michigan-state-university', name: 'Michigan State University' },
  { id: 'massachusetts-institute-of-technology', name: 'Massachusetts Institute of Technology' },
  { id: 'american-university', name: 'American University' },
]

describe('matchUniversities', () => {
  it('matches Scorecard universities beyond the original ten', () => {
    expect(matchUniversities('What is the tuition at California Institute of Technology?', catalogue))
      .toEqual(['california-institute-of-technology'])
    expect(matchUniversities('Caltech deadline?', catalogue)).toEqual(['california-institute-of-technology'])
    expect(matchUniversities('Does MIT need the SAT?', catalogue)).toEqual(['massachusetts-institute-of-technology'])
  })

  it('keeps the legacy nicknames working', () => {
    expect(matchUniversities('harvard application fee', catalogue)).toEqual(['harvard'])
    expect(matchUniversities('Is Southern Miss test optional?', catalogue)).toEqual(['usm'])
  })

  it('prefers the longest name and does not double-match its words', () => {
    expect(matchUniversities('Washington University in St. Louis tuition', catalogue))
      .toEqual(['washington-university-in-st-louis'])
    expect(matchUniversities('University of Washington Seattle Campus deadline', catalogue))
      .toEqual(['university-of-washington-seattle-campus'])
  })

  it('does not match ambiguous or ordinary words on their own', () => {
    expect(matchUniversities('What is a good SAT and ACT score?', catalogue)).toEqual([])
    expect(matchUniversities('I am an American student in Washington', catalogue)).toEqual([])
    // "Michigan" alone names two schools, so it is ambiguous.
    expect(matchUniversities('Michigan tuition', catalogue)).toEqual([])
  })

  it('finds several universities for a comparison and respects the limit', () => {
    expect(matchUniversities('Compare Harvard and MIT', catalogue)).toEqual(
      expect.arrayContaining(['harvard', 'massachusetts-institute-of-technology']),
    )
    expect(matchUniversities('Harvard MIT Caltech', catalogue, 2)).toHaveLength(2)
  })
})
