import { useState } from 'react'
import type { AdmissionTest } from '../types'
import { admissionTestRanges } from '../types'
import { validateGpa, validateScore } from '../intake/definition'
import type { AwardScores } from '../scoring/scholarships'

/**
 * Compact score entry for the Scholarship Finder.
 *
 * Deliberately separate from the intake wizard: a visitor with no account should
 * be able to check awards in two fields without answering questions about
 * destination, subject, budget or timing. Validation is the same as the intake's,
 * so a score accepted here would also be accepted into a saved plan.
 */
export function AwardScoreEntry({
  scores,
  onChange,
}: {
  scores: AwardScores
  onChange: (next: AwardScores) => void
}) {
  const [admissionRaw, setAdmissionRaw] = useState(
    scores.admissionTestScore === null ? '' : String(scores.admissionTestScore),
  )
  const [gpaRaw, setGpaRaw] = useState(scores.gpa === null ? '' : String(scores.gpa))
  const [admissionTouched, setAdmissionTouched] = useState(false)
  const [gpaTouched, setGpaTouched] = useState(false)

  const admissionError = admissionTouched ? validateScore(scores.admissionTest, admissionRaw) : null
  const gpaError = gpaTouched ? validateGpa(gpaRaw) : null
  const range = scores.admissionTest ? admissionTestRanges[scores.admissionTest] : null

  const pickTest = (next: AdmissionTest | null) => {
    setAdmissionRaw('')
    setAdmissionTouched(false)
    onChange({ ...scores, admissionTest: next, admissionTestScore: null })
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft" aria-label="Your scores">
      <h2 className="display text-xl font-extrabold">Your scores</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        No account needed. Enter what you have and every award below updates.
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.12em] text-muted">Admission test</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Admission test">
            {(['sat', 'act'] as AdmissionTest[]).map((test) => (
              <button
                key={test}
                type="button"
                role="radio"
                aria-checked={scores.admissionTest === test}
                onClick={() => pickTest(test)}
                className={`min-h-12 rounded-xl border px-4 py-3 font-bold transition ${
                  scores.admissionTest === test
                    ? 'border-forest-600 bg-forest-50 text-forest-900'
                    : 'border-line hover:border-forest-400'
                }`}
              >
                {admissionTestRanges[test].label}
              </button>
            ))}
            <button
              type="button"
              role="radio"
              aria-checked={scores.admissionTest === null}
              onClick={() => pickTest(null)}
              className={`min-h-12 rounded-xl border px-4 py-3 font-bold transition ${
                scores.admissionTest === null
                  ? 'border-forest-600 bg-forest-50 text-forest-900'
                  : 'border-line hover:border-forest-400'
              }`}
            >
              Neither
            </button>
          </div>
          {scores.admissionTest !== null && (
            <div className="mt-3">
              <label htmlFor="award-admission" className="block text-sm font-bold">
                Your {range?.label} score
              </label>
              <input
                id="award-admission"
                type="number"
                inputMode="numeric"
                value={admissionRaw}
                onChange={(event) => {
                  const raw = event.target.value
                  setAdmissionRaw(raw)
                  setAdmissionTouched(true)
                  const message = validateScore(scores.admissionTest, raw)
                  onChange({
                    ...scores,
                    admissionTestScore: message === null && raw.trim() !== '' ? Number(raw) : null,
                  })
                }}
                aria-invalid={admissionError !== null}
                aria-describedby={admissionError ? 'award-admission-error' : undefined}
                className={`mt-2 min-h-12 w-full rounded-xl border px-4 py-3 text-lg font-bold outline-none ${
                  admissionError ? 'border-rose-400 bg-rose-50' : 'border-line focus:border-forest-500'
                }`}
              />
              {admissionError && (
                <p id="award-admission-error" role="alert" className="mt-2 text-sm font-bold text-rose-700">
                  {admissionError}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[.12em] text-muted">Grades</p>
          <label htmlFor="award-gpa" className="mt-2 block text-sm font-bold">Your GPA</label>
          <p className="mt-1 text-xs text-muted">On the 0 to 4.0 scale. Leave blank to skip.</p>
          <input
            id="award-gpa"
            type="number"
            inputMode="decimal"
            value={gpaRaw}
            onChange={(event) => {
              const raw = event.target.value
              setGpaRaw(raw)
              setGpaTouched(true)
              const message = validateGpa(raw)
              onChange({
                ...scores,
                gpa: message === null && raw.trim() !== '' ? Number(raw) : null,
              })
            }}
            aria-invalid={gpaError !== null}
            aria-describedby={gpaError ? 'award-gpa-error' : undefined}
            className={`mt-2 min-h-12 w-full rounded-xl border px-4 py-3 text-lg font-bold outline-none ${
              gpaError ? 'border-rose-400 bg-rose-50' : 'border-line focus:border-forest-500'
            }`}
          />
          {gpaError && (
            <p id="award-gpa-error" role="alert" className="mt-2 text-sm font-bold text-rose-700">
              {gpaError}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
