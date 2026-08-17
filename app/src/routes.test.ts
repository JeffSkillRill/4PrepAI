import { describe, expect, it } from 'vitest'
import { buildRoutePath, parseRoutePath, type AppRoute } from './routes'

describe('dashboard route parsing', () => {
  it('parses the signed-in home route', () => {
    expect(parseRoutePath('/dashboard')).toMatchObject({
      view: 'dashboard',
      universityId: null,
    })
  })
})

describe('learning route parsing', () => {
  it('parses the track home', () => {
    expect(parseRoutePath('/learn')).toMatchObject({
      view: 'learn',
      moduleSlug: null,
      lessonSlug: null,
    })
  })

  it('parses a module path', () => {
    expect(parseRoutePath('/learn/building-your-list')).toMatchObject({
      view: 'learn_module',
      moduleSlug: 'building-your-list',
      lessonSlug: null,
    })
  })

  it('parses a lesson path', () => {
    expect(parseRoutePath('/learn/building-your-list/lesson-one')).toMatchObject({
      view: 'learn_lesson',
      moduleSlug: 'building-your-list',
      lessonSlug: 'lesson-one',
    })
  })

  it('parses an assignment path before treating assignment as a lesson slug', () => {
    expect(parseRoutePath('/learn/building-your-list/assignment/')).toMatchObject({
      view: 'learn_assignment',
      moduleSlug: 'building-your-list',
      lessonSlug: null,
    })
  })
})

describe('route round trips', () => {
  const routes: AppRoute[] = [
    { view: 'dashboard', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'search', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'profile', universityId: 'university/with spaces', moduleSlug: null, lessonSlug: null },
    { view: 'compare', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'intake', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'plan', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'results', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'tools', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'saved', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'skill_gap', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'scholarships', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'counselor', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'learn', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'learn_module', universityId: null, moduleSlug: 'module/one', lessonSlug: null },
    { view: 'learn_lesson', universityId: null, moduleSlug: 'module/one', lessonSlug: 'lesson two' },
    { view: 'learn_assignment', universityId: null, moduleSlug: 'module/one', lessonSlug: null },
    { view: 'auth', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'auth_callback', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'reset_password', universityId: null, moduleSlug: null, lessonSlug: null },
    { view: 'privacy', universityId: null, moduleSlug: null, lessonSlug: null },
  ]

  it.each(routes)('builds $view hrefs that parse to the same route', (route) => {
    expect(parseRoutePath(buildRoutePath(route))).toEqual(route)
  })

  it('distinguishes an unknown path from the university catalogue', () => {
    expect(parseRoutePath('/does-not-exist')).toMatchObject({ view: 'not_found' })
    expect(parseRoutePath('/universities')).toMatchObject({ view: 'search' })
  })

  it.each([
    '/universities/%E0%A4%A',
    '/learn/%E0%A4%A',
    '/learn/module/%E0%A4%A',
  ])('treats malformed path encoding as not found: %s', (path) => {
    expect(parseRoutePath(path)).toMatchObject({ view: 'not_found' })
  })
})
