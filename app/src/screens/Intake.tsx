/**
 * Profile intake: one decision per screen, < 90 seconds, everything
 * editable later. "No IELTS yet" is a first-class path, not an edge case.
 */
import { useState } from "react";
import { CurrencyCode, EnglishTestKind, StudentProfile } from "../types";
import { samplePathway } from "../mock/sample-data";
import { useApp } from "../state";

const STEPS = ["Grades", "Budget", "English", "Field", "Goal", "Where"] as const;

function OptionButton({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-[52px] w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
        selected
          ? "border-accent bg-accent-soft"
          : "border-stone-200 bg-white hover:border-stone-300"
      }`}
    >
      <span>
        <span className="block text-[15px] font-medium text-stone-900">
          {label}
        </span>
        {hint && <span className="block text-[12px] text-stone-500">{hint}</span>}
      </span>
      <span
        aria-hidden
        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
          selected ? "border-accent bg-accent text-white" : "border-stone-300"
        }`}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

export function IntakeScreen() {
  const { navigate, setProfile, setPathway } = useApp();
  const [step, setStep] = useState(0);

  // Draft answers
  const [gpa, setGpa] = useState<number | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [currency] = useState<CurrencyCode>("USD");
  const [englishKind, setEnglishKind] = useState<EnglishTestKind | null>(null);
  const [englishScore, setEnglishScore] = useState<number | null>(null);
  const [planned, setPlanned] = useState<string | null>(null);
  const [field, setField] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [geo, setGeo] = useState<string[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canContinue = [
    gpa !== null,
    budget !== null,
    englishKind === "none"
      ? true
      : englishKind !== null && englishScore !== null,
    field !== null,
    goal !== null,
    true, // geography optional — "open to anywhere" is valid
  ][step];

  const finish = () => {
    const profile: StudentProfile = {
      gpa: gpa !== null ? { value: gpa, scale: 5 } : undefined,
      budgetPerYear: { amount: budget ?? 0, currency, period: "year" },
      english:
        englishKind === "none"
          ? { kind: "none", plannedTestDate: planned ?? undefined }
          : { kind: englishKind ?? "ielts", score: englishScore ?? undefined },
      fieldOfInterest: field ?? "",
      careerGoal: goal ?? "",
      geographyPreference: geo,
      homeCity: "Tashkent",
    };
    setProfile(profile);
    // Phase 1: attach the sample pathway fixture as this profile's result.
    setPathway({ ...samplePathway, profileSnapshot: profile });
    navigate({ name: "results" });
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col px-4 pt-4">
      {/* Progress — always visible */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            aria-label="Previous step"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-500 disabled:opacity-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-[12px] font-medium text-stone-500">
            {step + 1} of {STEPS.length} · {STEPS[step]}
          </span>
          <span className="w-11" aria-hidden />
        </div>
        <div
          className="mt-2 h-1 rounded-full bg-stone-200"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
        >
          <div
            className="h-1 rounded-full bg-accent transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1">
        {step === 0 && (
          <fieldset>
            <legend className="text-lg font-bold text-stone-900">
              How are your grades?
            </legend>
            <p className="mb-4 mt-1 text-[13px] text-stone-500">
              Your average on the 5-point scale. A rough answer is fine — you
              can edit this any time.
            </p>
            <div className="space-y-2">
              {[
                { v: 4.8, label: "Mostly 5s", hint: "≈ 4.6–5.0" },
                { v: 4.4, label: "5s and 4s", hint: "≈ 4.2–4.5" },
                { v: 3.9, label: "Mostly 4s", hint: "≈ 3.6–4.1" },
                { v: 3.3, label: "4s and 3s", hint: "≈ 3.0–3.5" },
              ].map((o) => (
                <OptionButton
                  key={o.v}
                  label={o.label}
                  hint={o.hint}
                  selected={gpa === o.v}
                  onClick={() => setGpa(o.v)}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="text-lg font-bold text-stone-900">
              What can your family spend per year?
            </legend>
            <p className="mb-4 mt-1 text-[13px] text-stone-500">
              Tuition plus living costs, in US dollars. This shapes which
              scholarships matter most for you.
            </p>
            <div className="space-y-2">
              {[
                { v: 4000, label: "Under $4,000" },
                { v: 8000, label: "$4,000 – $8,000" },
                { v: 15000, label: "$8,000 – $15,000" },
                { v: 25000, label: "Over $15,000" },
              ].map((o) => (
                <OptionButton
                  key={o.v}
                  label={o.label}
                  selected={budget === o.v}
                  onClick={() => setBudget(o.v)}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="text-lg font-bold text-stone-900">
              Do you have an English test score?
            </legend>
            <p className="mb-4 mt-1 text-[13px] text-stone-500">
              Most students don't yet — that's completely fine. We'll plan
              around it.
            </p>
            <div className="space-y-2">
              <OptionButton
                label="I have an IELTS score"
                selected={englishKind === "ielts"}
                onClick={() => setEnglishKind("ielts")}
              />
              <OptionButton
                label="I have a TOEFL score"
                selected={englishKind === "toefl"}
                onClick={() => setEnglishKind("toefl")}
              />
              <OptionButton
                label="No test yet"
                hint="We'll include test prep in your plan"
                selected={englishKind === "none"}
                onClick={() => setEnglishKind("none")}
              />
            </div>

            {(englishKind === "ielts" || englishKind === "toefl") && (
              <div className="mt-4">
                <p className="mb-2 text-[13px] font-medium text-stone-700">
                  Your {englishKind === "ielts" ? "IELTS band" : "TOEFL score"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(englishKind === "ielts"
                    ? [5.0, 5.5, 6.0, 6.5, 7.0, 7.5]
                    : [60, 72, 80, 90, 100]
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={englishScore === s}
                      onClick={() => setEnglishScore(s)}
                      className={`min-h-[44px] min-w-[56px] rounded-lg border text-[14px] font-semibold tabular-nums ${
                        englishScore === s
                          ? "border-accent bg-accent text-white"
                          : "border-stone-300 bg-white text-stone-700"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {englishKind === "none" && (
              <div className="mt-4">
                <p className="mb-2 text-[13px] font-medium text-stone-700">
                  When could you take IELTS? (optional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: "2026-10", label: "In ~3 months" },
                    { v: "2027-01", label: "In ~6 months" },
                    { v: "unsure", label: "Not sure yet" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      aria-pressed={planned === o.v}
                      onClick={() => setPlanned(o.v)}
                      className={`min-h-[44px] rounded-lg border px-4 text-[13px] font-medium ${
                        planned === o.v
                          ? "border-accent bg-accent text-white"
                          : "border-stone-300 bg-white text-stone-700"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="text-lg font-bold text-stone-900">
              What do you want to study?
            </legend>
            <p className="mb-4 mt-1 text-[13px] text-stone-500">
              Pick the closest — programs vary by university.
            </p>
            <div className="space-y-2">
              {["Computer Science", "Engineering", "Business", "Medicine", "Design"].map(
                (f) => (
                  <OptionButton
                    key={f}
                    label={f}
                    selected={field === f}
                    onClick={() => setField(f)}
                  />
                )
              )}
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <fieldset>
            <legend className="text-lg font-bold text-stone-900">
              What's the goal after graduation?
            </legend>
            <p className="mb-4 mt-1 text-[13px] text-stone-500">
              This tunes career alignment in your fit scores.
            </p>
            <div className="space-y-2">
              {[
                "Software engineer",
                "Start a company",
                "Work abroad after graduating",
                "Return home with a strong degree",
                "Not sure yet",
              ].map((g) => (
                <OptionButton
                  key={g}
                  label={g}
                  selected={goal === g}
                  onClick={() => setGoal(g)}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === 5 && (
          <fieldset>
            <legend className="text-lg font-bold text-stone-900">
              Where would you like to go?
            </legend>
            <p className="mb-4 mt-1 text-[13px] text-stone-500">
              Choose up to three, in order of preference — or skip to stay open
              to anywhere.
            </p>
            <div className="space-y-2">
              {[
                { code: "HU", label: "Hungary" },
                { code: "KR", label: "South Korea" },
                { code: "TR", label: "Türkiye" },
                { code: "KZ", label: "Kazakhstan" },
              ].map((c) => {
                const idx = geo.indexOf(c.code);
                return (
                  <OptionButton
                    key={c.code}
                    label={c.label}
                    hint={idx >= 0 ? `Choice ${idx + 1}` : undefined}
                    selected={idx >= 0}
                    onClick={() =>
                      setGeo((g) =>
                        g.includes(c.code)
                          ? g.filter((x) => x !== c.code)
                          : g.length < 3
                            ? [...g, c.code]
                            : g
                      )
                    }
                  />
                );
              })}
            </div>
          </fieldset>
        )}
      </div>

      <div className="sticky bottom-20 mt-6 pb-2">
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            className="min-h-[48px] w-full rounded-xl bg-accent text-[15px] font-semibold text-white disabled:bg-stone-300"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="min-h-[48px] w-full rounded-xl bg-accent text-[15px] font-semibold text-white"
          >
            Build my pathway
          </button>
        )}
        <p className="mt-2 text-center text-[11px] text-stone-400">
          Everything here stays editable from your results.
        </p>
      </div>
    </div>
  );
}
