import { useState } from 'react'
import type { AdmissionTest, LanguageTest } from '../types'
import { admissionTestRanges, languageTestRanges } from '../types'
import {
  academicOptions,
  budgetOptions,
  countryOptions,
  fieldOptions,
  intakeOptions,
  validateGpa,
  validateScore,
  type IntakeDraft,
  type IntakeStepId,
} from './definition'

/**
 * The controls for one intake question.
 *
 * Rendered identically by the wizard and by the plan page's per-answer editor,
 * so changing one answer later uses exactly the same input, validation and
 * wording as answering it the first time.
 */

function OptionList({
  options,
  selected,
  onSelect,
  name,
}: {
  options: string[]
  selected: string | null
  onSelect: (value: string) => void
  name: string
}) {
  return (
    <div className="grid gap-3" role="radiogroup" aria-label={name}>
      {options.map((option) => {
        const active = option === selected
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(option)}
            className={`min-h-12 rounded-xl border px-4 py-3 text-left font-bold transition ${
              active ? 'border-forest-600 bg-forest-50 text-forest-900' : 'border-line bg-white hover:border-forest-400'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function TestPicker<T extends string>({
  tests,
  labels,
  value,
  onChange,
  noneLabel,
  legend,
}: {
  tests: readonly T[]
  labels: Record<T, string>
  value: T | null
  onChange: (next: T | null) => void
  noneLabel: string
  legend: string
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={legend}>
      {tests.map((test) => (
        <button
          key={test}
          type="button"
          role="radio"
          aria-checked={value === test}
          onClick={() => onChange(test)}
          className={`min-h-12 rounded-xl border px-4 py-3 font-bold transition ${
            value === test ? 'border-forest-600 bg-forest-50 text-forest-900' : 'border-line bg-white hover:border-forest-400'
          }`}
        >
          {labels[test]}
        </button>
      ))}
      <button
        type="button"
        role="radio"
        aria-checked={value === null}
        onClick={() => onChange(null)}
        className={`min-h-12 rounded-xl border px-4 py-3 font-bold transition ${
          value === null ? 'border-forest-600 bg-forest-50 text-forest-900' : 'border-line bg-white hover:border-forest-400'
        }`}
      >
        {noneLabel}
      </button>
    </div>
  )
}

function ScoreInput({
  id,
  label,
  hint,
  value,
  error,
  onChange,
}: {
  id: string
  label: string
  hint: string
  value: string
  error: string | null
  onChange: (raw: string) => void
}) {
  return (
    <div className="mt-4">
      <label htmlFor={id} className="block text-sm font-bold">{label}</label>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error !== null}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 min-h-12 w-full rounded-xl border px-4 py-3 text-lg font-bold outline-none ${
          error ? 'border-rose-400 bg-rose-50' : 'border-line focus:border-forest-500'
        }`}
      />
      {error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-bold text-rose-700">{error}</p>}
    </div>
  )
}

const languageTests: readonly LanguageTest[] = ['ielts', 'toefl', 'duolingo']
const admissionTests: readonly AdmissionTest[] = ['sat', 'act']
const languageLabels = { ielts: 'IELTS', toefl: 'TOEFL iBT', duolingo: 'Duolingo' } as const
const admissionLabels = { sat: 'SAT', act: 'ACT' } as const

export function StepFields({
  stepId,
  draft,
  onChange,
  onValidityChange,
}: {
  stepId: IntakeStepId
  draft: IntakeDraft
  onChange: (next: IntakeDraft) => void
  onValidityChange?: (valid: boolean) => void
}) {
  const [languageRaw, setLanguageRaw] = useState(draft.languageScore === null ? '' : String(draft.languageScore))
  const [admissionRaw, setAdmissionRaw] = useState(draft.admissionTestScore === null ? '' : String(draft.admissionTestScore))
  const [gpaRaw, setGpaRaw] = useState(draft.gpa === null ? '' : String(draft.gpa))
  const [touched, setTouched] = useState(false)

  const report = (valid: boolean) => onValidityChange?.(valid)

  if (stepId === 'country') {
    return <OptionList name="Destination" options={countryOptions} selected={draft.country} onSelect={(value) => onChange({ ...draft, country: value })} />
  }
  if (stepId === 'field') {
    return <OptionList name="Subject" options={fieldOptions} selected={draft.field} onSelect={(value) => onChange({ ...draft, field: value })} />
  }
  if (stepId === 'academic') {
    return <OptionList name="Academic readiness" options={academicOptions} selected={draft.academic} onSelect={(value) => onChange({ ...draft, academic: value })} />
  }
  if (stepId === 'budget') {
    return <OptionList name="Annual budget" options={budgetOptions} selected={draft.budget} onSelect={(value) => onChange({ ...draft, budget: value })} />
  }
  if (stepId === 'intake') {
    return <OptionList name="Start date" options={intakeOptions} selected={draft.intake} onSelect={(value) => onChange({ ...draft, intake: value })} />
  }

  if (stepId === 'language') {
    const error = touched ? validateScore(draft.languageTest, languageRaw) : null
    const range = draft.languageTest ? languageTestRanges[draft.languageTest] : null
    return (
      <div>
        <TestPicker
          legend="English test"
          tests={languageTests}
          labels={languageLabels}
          value={draft.languageTest}
          noneLabel="No test yet"
          onChange={(next) => {
            setLanguageRaw('')
            setTouched(false)
            report(true)
            onChange({ ...draft, languageTest: next, languageScore: null, languageAnswered: next === null, needsLanguagePathway: draft.needsLanguagePathway })
          }}
        />
        {draft.languageTest === null ? (
          <label className="mt-4 flex min-h-12 items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={draft.needsLanguagePathway}
              onChange={(event) => onChange({ ...draft, needsLanguagePathway: event.target.checked, languageAnswered: true })}
              className="size-5"
            />
            <span className="text-sm font-bold">I need a language pathway programme</span>
          </label>
        ) : (
          <ScoreInput
            id="language-score"
            label={`Your ${range?.label} score`}
            hint={`Enter the score you received. ${range?.label} runs from ${range?.min} to ${range?.max}.`}
            value={languageRaw}
            error={error}
            onChange={(raw) => {
              setLanguageRaw(raw)
              setTouched(true)
              const message = validateScore(draft.languageTest, raw)
              report(message === null)
              onChange({
                ...draft,
                languageScore: message === null && raw.trim() !== '' ? Number(raw) : null,
                languageAnswered: message === null && raw.trim() !== '',
              })
            }}
          />
        )}
      </div>
    )
  }

  if (stepId === 'admissionTest') {
    const error = touched ? validateScore(draft.admissionTest, admissionRaw) : null
    const range = draft.admissionTest ? admissionTestRanges[draft.admissionTest] : null
    return (
      <div>
        <TestPicker
          legend="Admission test"
          tests={admissionTests}
          labels={admissionLabels}
          value={draft.admissionTest}
          noneLabel="Neither"
          onChange={(next) => {
            setAdmissionRaw('')
            setTouched(false)
            report(true)
            // Choosing one clears the other by construction: a single field holds
            // the choice, so a student can never end up recorded with both.
            onChange({ ...draft, admissionTest: next, admissionTestScore: null, admissionAnswered: next === null })
          }}
        />
        {draft.admissionTest !== null && (
          <ScoreInput
            id="admission-score"
            label={`Your ${range?.label} score`}
            hint={`${range?.label} runs from ${range?.min} to ${range?.max}.`}
            value={admissionRaw}
            error={error}
            onChange={(raw) => {
              setAdmissionRaw(raw)
              setTouched(true)
              const message = validateScore(draft.admissionTest, raw)
              report(message === null)
              onChange({
                ...draft,
                admissionTestScore: message === null && raw.trim() !== '' ? Number(raw) : null,
                admissionAnswered: message === null && raw.trim() !== '',
              })
            }}
          />
        )}
      </div>
    )
  }

  const gpaError = touched ? validateGpa(gpaRaw) : null
  return (
    <div>
      <ScoreInput
        id="gpa-score"
        label="Your GPA"
        hint="On the 0 to 4.0 scale. Leave blank to skip."
        value={gpaRaw}
        error={gpaError}
        onChange={(raw) => {
          setGpaRaw(raw)
          setTouched(true)
          const message = validateGpa(raw)
          report(message === null)
          onChange({
            ...draft,
            gpa: message === null && raw.trim() !== '' ? Number(raw) : null,
            gpaAnswered: message === null,
          })
        }}
      />
      <button
        type="button"
        onClick={() => {
          setGpaRaw('')
          setTouched(false)
          report(true)
          onChange({ ...draft, gpa: null, gpaAnswered: true })
        }}
        className="mt-3 min-h-12 rounded-xl border border-line px-4 py-3 text-sm font-bold text-muted transition hover:bg-canvas"
      >
        Skip this
      </button>
    </div>
  )
}
