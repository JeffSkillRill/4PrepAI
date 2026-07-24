/**
 * Pathway Results — the core screen. AI strategy summary, ranked cards,
 * month-by-month action plan, sticky save.
 */
import { universityById, samplePathway } from "../mock/sample-data";
import { useApp } from "../state";
import {
  AIResponseBlock,
  EmptyState,
  ErrorState,
  OfflineState,
  ScreenHeader,
  SkeletonCard,
  SkeletonLine,
  fmtMonth,
} from "../components/primitives";
import { UniversityCard } from "../components/UniversityCard";

export function ResultsScreen() {
  const {
    navigate,
    pathway,
    profile,
    devState,
    savedPlans,
    setSavedPlans,
    compareIds,
    setCompareIds,
  } = useApp();

  if (devState === "loading") {
    return (
      <div className="mx-auto max-w-md px-4 pt-4">
        <ScreenHeader title="Your pathway" subtitle="Building your plan…" />
        <div className="space-y-3" aria-busy="true">
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <SkeletonLine w="30%" h={11} />
            <div className="mt-3 space-y-2">
              <SkeletonLine />
              <SkeletonLine />
              <SkeletonLine w="70%" />
            </div>
          </div>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (devState === "error") {
    return (
      <div className="mx-auto max-w-md px-4 pt-4">
        <ScreenHeader title="Your pathway" />
        <ErrorState retry={() => {}} />
      </div>
    );
  }

  const effectivePathway =
    devState === "empty" ? null : (pathway ?? samplePathway);

  if (!effectivePathway) {
    return (
      <div className="mx-auto max-w-md px-4 pt-4">
        <ScreenHeader title="Your pathway" />
        <EmptyState
          icon="◇"
          title="No pathway yet"
          body="Answer six quick questions and we'll rank universities that fit your grades, budget, and goals."
          cta={
            <button
              type="button"
              onClick={() => navigate({ name: "intake" })}
              className="min-h-[44px] rounded-lg bg-accent px-5 text-[14px] font-semibold text-white"
            >
              Start — about 90 seconds
            </button>
          }
        />
      </div>
    );
  }

  const p = effectivePathway;
  const isSaved = savedPlans.some((s) => s.id === p.id);
  const englishNote =
    profile?.english.kind === "none"
      ? "You told us you don't have an IELTS score yet — your plan includes test prep before the first deadline."
      : null;

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-4">
      <ScreenHeader
        title="Your pathway"
        subtitle={`Based on your profile · ${p.rankedUniversityIds.length} matches`}
        action={
          <button
            type="button"
            onClick={() => navigate({ name: "intake" })}
            className="min-h-[44px] rounded-lg px-3 text-[13px] font-medium text-accent"
          >
            Edit profile
          </button>
        }
      />

      {devState === "offline" && (
        <div className="mb-3">
          <OfflineState />
        </div>
      )}

      <AIResponseBlock title="Strategy summary">
        <p>{p.strategySummary}</p>
        {englishNote && (
          <p className="mt-2 rounded-lg bg-stone-50 p-2.5 text-[13px] text-stone-600">
            {englishNote}
          </p>
        )}
      </AIResponseBlock>

      <h2 className="mb-2 mt-6 text-[13px] font-semibold uppercase tracking-wide text-stone-500">
        Ranked for you
      </h2>
      <div className="space-y-3">
        {p.rankedUniversityIds.map((id, i) => {
          const u = universityById(id);
          const fit = p.fitScores.find((f) => f.universityId === id);
          if (!u) return null;
          return (
            <UniversityCard
              key={id}
              university={u}
              fit={fit}
              rank={i + 1}
              onOpen={() => navigate({ name: "university", id })}
              inCompare={compareIds.includes(id)}
              onToggleCompare={() =>
                setCompareIds((c) =>
                  c.includes(id)
                    ? c.filter((x) => x !== id)
                    : c.length < 3
                      ? [...c, id]
                      : c
                )
              }
            />
          );
        })}
      </div>

      <h2 className="mb-2 mt-8 text-[13px] font-semibold uppercase tracking-wide text-stone-500">
        Your plan, month by month
      </h2>
      <ol className="relative ml-2 space-y-5 border-l border-stone-200 pb-2 pl-5">
        {p.actionPlan.map((m) => (
          <li key={m.month} className="relative">
            <span
              aria-hidden
              className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-accent"
            />
            <p className="text-[12px] font-semibold uppercase tracking-wide text-accent">
              {fmtMonth(m.month)}
            </p>
            <p className="text-[14px] font-semibold text-stone-900">{m.title}</p>
            <ul className="mt-1 space-y-1">
              {m.items.map((it, j) => (
                <li key={j} className="flex gap-2 text-[13px] text-stone-600">
                  <span aria-hidden className="text-stone-300">
                    –
                  </span>
                  {it}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {/* Sticky save */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-4">
        <button
          type="button"
          disabled={isSaved}
          onClick={() =>
            setSavedPlans((s) => [
              ...s,
              { ...p, savedAt: new Date().toISOString().slice(0, 10) },
            ])
          }
          className={`min-h-[48px] w-full rounded-xl text-[15px] font-semibold shadow-lg ${
            isSaved
              ? "bg-emerald-600 text-white"
              : "bg-stone-900 text-white hover:bg-stone-800"
          }`}
        >
          {isSaved ? "✓ Plan saved" : "Save this plan"}
        </button>
      </div>
    </div>
  );
}
