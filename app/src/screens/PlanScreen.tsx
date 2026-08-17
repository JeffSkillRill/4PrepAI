import { ArrowRight, Check, Pencil, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import type { StudentProfile, View } from '../types'
import { AppLink } from '../components/AppLink'
import { viewPaths } from '../routes'
import { StepFields } from '../intake/StepFields'
import {
  draftFromProfile,
  intakeSteps,
  isStepAnswered,
  profileFromDraft,
  summaryValue,
  type IntakeDraft,
  type IntakeStepId,
} from '../intake/definition'

/**
 * The saved plan, with one editable row per answer.
 *
 * Changing the budget must not disturb the English score, so an edit opens a
 * single question, and saving writes the whole profile back from a draft that
 * started as the current one. Every other answer travels through untouched.
 */
export function PlanScreen({
  profile,
  onSave,
  onNavigate,
  onRebuild,
}: {
  profile: StudentProfile
  onSave: (next: StudentProfile) => void
  onNavigate: (view: View) => void
  onRebuild: () => void
}) {
  const [editing, setEditing] = useState<IntakeStepId | null>(null)
  const [draft, setDraft] = useState<IntakeDraft>(() => draftFromProfile(profile))
  const [valid, setValid] = useState(true)
  const saved = draftFromProfile(profile)

  const open = (id: IntakeStepId) => {
    setDraft(draftFromProfile(profile))
    setValid(true)
    setEditing(id)
  }
  const cancel = () => {
    setDraft(draftFromProfile(profile))
    setValid(true)
    setEditing(null)
  }
  const commit = () => {
    if (!valid) return
    onSave(profileFromDraft(draft))
    setEditing(null)
  }

  return (
    <div className="page-container motion-resolve py-8 sm:py-10 lg:py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[.14em] text-forest-700">Your plan</p>
        <h1 className="display mt-2 text-4xl font-extrabold sm:text-5xl">The answers your pathway is built on</h1>
        <p className="mt-4 leading-7 text-muted">
          Change any single answer without redoing the rest. Everything here stays private to your
          account and is used only to work out your pathway and your gaps.
        </p>
      </div>

      <ul className="mt-8 grid gap-3">
        {intakeSteps.map((step) => {
          const isEditing = editing === step.id
          const answered = isStepAnswered(saved, step.id)
          return (
            <li key={step.id} className="rounded-2xl border border-line bg-white">
              <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-muted">{step.summaryLabel}</p>
                  <p className="mt-1 text-lg font-extrabold">
                    {summaryValue(saved, step.id)}
                    {!answered && step.optional && (
                      <span className="ml-2 rounded-full bg-canvas px-2 py-0.5 text-xs font-bold text-muted">optional</span>
                    )}
                  </p>
                </div>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={cancel}
                    className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-bold text-muted"
                  >
                    <X size={16} /> Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => open(step.id)}
                    className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-bold text-forest-800 transition hover:bg-canvas"
                  >
                    <Pencil size={16} /> Change
                  </button>
                )}
              </div>
              {isEditing && (
                <div className="border-t border-line p-4 sm:p-5">
                  <p className="font-bold">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{step.detail}</p>
                  <div className="mt-4">
                    <StepFields stepId={step.id} draft={draft} onChange={setDraft} onValidityChange={setValid} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-4">
                    <button
                      type="button"
                      onClick={commit}
                      disabled={!valid}
                      className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Check size={17} /> Save this answer
                    </button>
                    <button
                      type="button"
                      onClick={cancel}
                      className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 py-3 font-bold text-muted transition hover:bg-canvas"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <AppLink
          href={viewPaths.results as string}
          onNavigate={() => onNavigate('results')}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-forest-800 px-5 py-3 font-bold text-white"
        >
          See my pathway <ArrowRight size={18} />
        </AppLink>
        <AppLink
          href={viewPaths.skill_gap as string}
          onNavigate={() => onNavigate('skill_gap')}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 font-bold text-forest-800"
        >
          See my skill gaps
        </AppLink>
      </div>

      <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-canvas p-5">
        <div>
          <h2 className="font-extrabold">Starting over?</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            If your situation has changed completely, rebuild the plan from the beginning. Your
            current answers are used as the starting point.
          </p>
        </div>
        <button
          type="button"
          onClick={onRebuild}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-bold text-forest-800"
        >
          <RotateCcw size={16} /> Rebuild my plan
        </button>
      </section>
    </div>
  )
}
