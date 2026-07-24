/**
 * University profile — Niche-style depth. Programs, sourced costs,
 * requirements, deadlines, scholarships, and "how you compare".
 */
import { scholarshipById, universityById, sampleFitScores } from "../mock/sample-data";
import { Requirement, ScholarshipAward, StudentProfile } from "../types";
import { useApp } from "../state";
import {
  DataValue,
  ErrorState,
  FitBreakdown,
  FitScoreBadge,
  MissingValue,
  OfflineState,
  ScreenHeader,
  SkeletonCard,
  fmtDate,
  fmtMoney,
} from "../components/primitives";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-stone-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

const awardLabel = (a: ScholarshipAward): string =>
  a.kind === "full_ride"
    ? "Full ride"
    : a.kind === "percent_tuition"
      ? `${a.percent}% of tuition`
      : fmtMoney(a.money);

/** Compares one requirement against the entered profile, honestly. */
function CompareRow({
  req,
  profile,
}: {
  req: Requirement;
  profile: StudentProfile | null;
}) {
  let verdict: { label: string; cls: string } | null = null;

  if (req.requirement.status === "known" && profile) {
    if (req.key === "ielts_min") {
      if (profile.english.kind === "ielts" && profile.english.score != null) {
        const min = Number(req.requirement.value);
        const s = profile.english.score;
        verdict =
          s >= min
            ? {
                label: `You clear it — your ${s} vs their ${min}`,
                cls: "text-emerald-700 bg-emerald-50",
              }
            : {
                label: `Below their ${min} — you have ${s}`,
                cls: "text-amber-800 bg-amber-50",
              };
      } else if (profile.english.kind === "none") {
        verdict = {
          label: "No score yet — plan a test before the deadline",
          cls: "text-stone-600 bg-stone-100",
        };
      }
    }
    if (req.key === "gpa_min" && profile.gpa) {
      verdict = {
        label: `Your GPA: ${profile.gpa.value}/${profile.gpa.scale}`,
        cls: "text-stone-600 bg-stone-100",
      };
    }
  }

  return (
    <li className="rounded-lg border border-stone-200 bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium text-stone-800">
          {req.label}
        </span>
        <span className="text-[13px] font-semibold text-stone-800">
          <DataValue point={req.requirement} render={(v) => String(v)} />
        </span>
      </div>
      {req.notes && (
        <p className="mt-1 text-[12px] text-stone-500">{req.notes}</p>
      )}
      {verdict && (
        <p
          className={`mt-1.5 inline-block rounded px-2 py-0.5 text-[12px] font-medium ${verdict.cls}`}
        >
          {verdict.label}
        </p>
      )}
    </li>
  );
}

export function UniversityProfileScreen({ id }: { id: string }) {
  const { navigate, profile, devState } = useApp();
  const u = universityById(id);

  if (devState === "loading") {
    return (
      <div className="mx-auto max-w-md px-4 pt-4" aria-busy="true">
        <SkeletonCard />
        <div className="mt-3">
          <SkeletonCard />
        </div>
      </div>
    );
  }
  if (devState === "error" || !u) {
    return (
      <div className="mx-auto max-w-md px-4 pt-4">
        <ScreenHeader title="University" onBack={() => navigate({ name: "results" })} />
        <ErrorState retry={() => {}} />
      </div>
    );
  }

  const fit = sampleFitScores.find((f) => f.universityId === u.id);
  const partial = devState === "partial";

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-4">
      <ScreenHeader
        title={u.name}
        subtitle={`${u.city}, ${u.country} · Founded ${
          u.founded.status === "known" ? u.founded.value : "—"
        }`}
        onBack={() => navigate({ name: "results" })}
      />

      {devState === "offline" && (
        <div className="mb-3">
          <OfflineState />
        </div>
      )}

      {u.about && <p className="text-[14px] text-stone-600">{u.about}</p>}

      <Section title="Costs">
        <dl className="grid grid-cols-1 gap-2">
          {(
            [
              ["Tuition", u.tuitionPerYear],
              ["Living costs", u.livingCostPerYear],
              ["Application fee", partial
                ? { status: "unknown" as const, reason: "Couldn't load this figure", suggestedAction: "Reconnect to refresh" }
                : u.applicationFee],
            ] as const
          ).map(([label, point]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2.5"
            >
              <dt className="text-[13px] text-stone-600">{label}</dt>
              <dd className="text-[14px] font-semibold text-stone-900">
                <DataValue point={point} render={fmtMoney} />
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2.5">
            <dt className="text-[13px] text-stone-600">Acceptance rate</dt>
            <dd className="text-[14px] font-semibold text-stone-900">
              <DataValue
                point={u.acceptanceRate}
                render={(v) => `${Math.round(v * 100)}%`}
              />
            </dd>
          </div>
        </dl>
      </Section>

      <Section title="Key deadline">
        <div className="rounded-lg border border-stone-200 bg-white px-3 py-2.5">
          <span className="text-[14px] font-semibold text-stone-900">
            <DataValue point={u.applicationDeadline} render={fmtDate} />
          </span>
          <span className="ml-2 text-[12px] text-stone-500">
            application deadline
          </span>
        </div>
      </Section>

      <Section title="Programs">
        <ul className="space-y-2">
          {u.programs.map((prog) => (
            <li
              key={prog.id}
              className="rounded-lg border border-stone-200 bg-white p-3"
            >
              <p className="text-[14px] font-semibold text-stone-900">
                {prog.name}
              </p>
              <p className="text-[12px] text-stone-500">
                {prog.durationYears} years · {prog.languageOfInstruction}
              </p>
              <div className="mt-1 text-[13px] font-medium text-stone-800">
                <DataValue point={prog.tuitionPerYear} render={fmtMoney} compactMissing={false} />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Requirements — how you compare">
        {profile ? (
          <ul className="space-y-2">
            {u.requirements.map((r) => (
              <CompareRow key={r.id} req={r} profile={profile} />
            ))}
          </ul>
        ) : (
          <div>
            <ul className="space-y-2">
              {u.requirements.map((r) => (
                <CompareRow key={r.id} req={r} profile={null} />
              ))}
            </ul>
            <button
              type="button"
              onClick={() => navigate({ name: "intake" })}
              className="mt-3 min-h-[44px] w-full rounded-lg border border-accent text-[13px] font-semibold text-accent"
            >
              Enter your profile to see how you compare
            </button>
          </div>
        )}
      </Section>

      <Section title="Scholarships here">
        <ul className="space-y-2">
          {u.scholarshipIds.map((sid) => {
            const s = scholarshipById(sid);
            if (!s) return null;
            return (
              <li
                key={s.id}
                className="rounded-lg border border-stone-200 bg-white p-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[14px] font-semibold text-stone-900">
                    {s.name.replace(" (sample)", "")}
                  </p>
                  <span className="shrink-0 text-[13px] font-semibold text-accent">
                    <DataValue point={s.award} render={awardLabel} />
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-stone-500">
                  {s.eligibilitySummary}
                </p>
                <div className="mt-1.5 text-[12px] text-stone-600">
                  Deadline:{" "}
                  <DataValue point={s.deadline} render={fmtDate} />
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      {fit && (
        <Section title="Your fit">
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-3">
              <FitScoreBadge score={fit.overall} size="lg" />
              <p className="text-[13px] text-stone-500">
                Built from five components — each with its reason.
              </p>
            </div>
            <FitBreakdown fit={fit} />
          </div>
        </Section>
      )}

      {!profile && (
        <div className="mt-6">
          <MissingValue
            reason="Fit score needs your profile"
            suggestedAction="Complete the 90-second intake to see your fit"
            compact={false}
          />
        </div>
      )}
    </div>
  );
}
