import { describe, expect, it } from 'vitest'
import {
  PRODUCTION_SUPABASE_REF,
  describeSupabaseTarget,
  destructiveOperationsAllowed,
} from './environment'

describe('Supabase environment identification', () => {
  it('identifies the known production project without exposing a key', () => {
    expect(describeSupabaseTarget(`https://${PRODUCTION_SUPABASE_REF}.supabase.co`)).toEqual({
      label: `${PRODUCTION_SUPABASE_REF} · PRODUCTION`,
      projectRef: PRODUCTION_SUPABASE_REF,
      production: true,
    })
  })

  it('labels the local Supabase target', () => {
    expect(describeSupabaseTarget('http://127.0.0.1:54321')).toMatchObject({
      label: 'Local Supabase · 127.0.0.1:54321',
      projectRef: null,
      production: false,
    })
  })
})

describe('destructive local-operation guard', () => {
  it('blocks local development against production unless explicitly overridden', () => {
    expect(destructiveOperationsAllowed({
      development: true,
      supabaseUrl: `https://${PRODUCTION_SUPABASE_REF}.supabase.co`,
      explicitOverride: false,
    })).toBe(false)
    expect(destructiveOperationsAllowed({
      development: true,
      supabaseUrl: `https://${PRODUCTION_SUPABASE_REF}.supabase.co`,
      explicitOverride: true,
    })).toBe(true)
  })

  it('does not block production builds or non-production projects', () => {
    expect(destructiveOperationsAllowed({
      development: false,
      supabaseUrl: `https://${PRODUCTION_SUPABASE_REF}.supabase.co`,
      explicitOverride: false,
    })).toBe(true)
    expect(destructiveOperationsAllowed({
      development: true,
      supabaseUrl: 'https://qa-project-ref.supabase.co',
      explicitOverride: false,
    })).toBe(true)
  })
})
