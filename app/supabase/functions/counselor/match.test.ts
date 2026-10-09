import { afterEach, describe, expect, it, vi } from 'vitest'
import { matchUniversities } from './match'

// Real catalogue ids and names (universities.id / universities.name).
const catalogue = [
  { id: 'harvard', name: 'Harvard University' },
  { id: 'usm', name: 'University of Southern Mississippi' },
  { id: 'california-institute-of-technology', name: 'California Institute of Technology' },
  { id: 'university-of-washington-seattle-campus', name: 'University of Washington-Seattle Campus' },
  { id: 'washington-university-in-st-louis', name: 'Washington University in St Louis' },
  { id: 'university-of-michigan-ann-arbor', name: 'University of Michigan-Ann Arbor' },
  { id: 'michigan-state-university', name: 'Michigan State University' },
  { id: 'mit', name: 'Massachusetts Institute of Technology' },
  { id: 'upenn', name: 'University of Pennsylvania' },
  { id: 'pennsylvania-state-university-main-campus', name: 'Pennsylvania State University-Main Campus' },
  { id: 'yale', name: 'Yale University' },
  { id: 'jhu', name: 'Johns Hopkins University' },
  { id: 'american-university', name: 'American University' },
]

afterEach(() => vi.restoreAllMocks())

describe('matchUniversities', () => {
  it.each([
    ['MIT', 'mit'],
    ['mit', 'mit'],
    ['What is the application fee at MIT', 'mit'],
    ['Massachusetts Institute of Technology', 'mit'],
    ['UPenn', 'upenn'],
    ['Penn', 'upenn'],
    ['University of Pennsylvania', 'upenn'],
    ['UPenn deadline', 'upenn'],
    ['Penn deadline', 'upenn'],
    ['University of Pennsylvania deadline', 'upenn'],
    ['Caltech', 'california-institute-of-technology'],
    ['Penn State tuition', 'pennsylvania-state-university-main-campus'],
    ['Does JHU need the SAT?', 'jhu'],
    ['wustl deadline', 'washington-university-in-st-louis'],
  ])('matches %j to %s', (message, id) => {
    expect(matchUniversities(message, catalogue)).toEqual([id])
  })

  it('matches full catalogue names beyond the original ten', () => {
    expect(matchUniversities('What is the tuition at California Institute of Technology?', catalogue))
      .toEqual(['california-institute-of-technology'])
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
    expect(matchUniversities('Pennsylvania tuition', catalogue)).toEqual([])
    // "Michigan" alone names two schools, so it is ambiguous.
    expect(matchUniversities('Michigan', catalogue)).toEqual([])
    expect(matchUniversities('Michigan tuition', catalogue)).toEqual([])
  })

  it('finds several universities for a comparison and respects the limit', () => {
    expect(matchUniversities('Compare Harvard and MIT', catalogue)).toEqual(expect.arrayContaining(['harvard', 'mit']))
    expect(matchUniversities('Penn vs Penn State', catalogue))
      .toEqual(expect.arrayContaining(['upenn', 'pennsylvania-state-university-main-campus']))
    expect(matchUniversities('Harvard MIT Caltech', catalogue, 2)).toHaveLength(2)
  })
})

describe('nickname key check', () => {
  it('warns once per cold start about nickname keys that match no catalogue name', async () => {
    vi.resetModules()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fresh = await import('./match')
    fresh.matchUniversities('MIT', catalogue)
    fresh.matchUniversities('Yale', catalogue)
    expect(warn).toHaveBeenCalledTimes(1)
    const [label, unused] = warn.mock.calls[0] as [string, string[]]
    expect(label).toBe('COUNSELOR_NICKNAME_UNMATCHED')
    expect(unused).toContain('Columbia University')
    expect(unused).not.toContain('Massachusetts Institute of Technology')
  })
})
