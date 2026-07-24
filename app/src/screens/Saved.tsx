/**
 * Saved plans dashboard shell — with designed logged-out and empty states.
 */
import { universityById } from "../mock/sample-data";
import { useApp } from "../state";
import { EmptyState, ScreenHeader, fmtDate } from "../components/primitives";

export function SavedScreen() {
  const { navigate, savedPlans, loggedIn, setLoggedIn, setPathway } = useApp();

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-md px-4 pt-4">
        <ScreenHeader title="Saved plans" />
        <div className="rounded-xl border border-stone-200 bg-white px-6 py-10 text-center">
          <div aria-hidden className="text-2xl text-stone-300">
            ◫
          </div>
          <h2 className="mt-2 text-[15px] font-semibold text-stone-800">
            Sign in to keep your plans
          </h2>
          <p className="mx-auto mt-1 max-w-[30ch] text-[13px] text-stone-500">
            Saved pathways sync across devices, so you can review them with
            your parents on any phone.
          </p>
          <button
            type="button"
            onClick={() => setLoggedIn(true)}
            className="mt-4 min-h-[48px] w-full rounded-xl bg-accent text-[15px] font-semibold text-white"
          >
            Sign in
          </button>
          <p className="mt-2 text-[11px] text-stone-400">
            (Phase 1: simulated — no real authentication)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-4">
      <ScreenHeader
        title="Saved plans"
        subtitle={
          savedPlans.length > 0
            ? `${savedPlans.length} ${savedPlans.length === 1 ? "plan" : "plans"}`
            : undefined
        }
        action={
          <button
            type="button"
            onClick={() => setLoggedIn(false)}
            className="min-h-[44px] px-2 text-[12px] text-stone-400"
          >
            Sign out
          </button>
        }
      />

      {savedPlans.length === 0 ? (
        <EmptyState
          icon="◫"
          title="No saved plans yet"
          body="Run your pathway, then tap “Save this plan” to keep a dated snapshot you can revisit and share."
          cta={
            <button
              type="button"
              onClick={() => navigate({ name: "intake" })}
              className="min-h-[44px] rounded-lg bg-accent px-5 text-[14px] font-semibold text-white"
            >
              Build a pathway
            </button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {savedPlans.map((plan) => {
            const top = universityById(plan.rankedUniversityIds[0]);
            return (
              <li key={plan.id + (plan.savedAt ?? "")}>
                <button
                  type="button"
                  onClick={() => {
                    setPathway(plan);
                    navigate({ name: "results" });
                  }}
                  className="w-full rounded-xl border border-stone-200 bg-white p-4 text-left hover:border-stone-300"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[14px] font-semibold text-stone-900">
                      {plan.profileSnapshot.fieldOfInterest} pathway
                    </p>
                    <span className="shrink-0 text-[11px] text-stone-400">
                      Run {fmtDate(plan.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-stone-500">
                    Top match: {top?.name ?? "—"} ·{" "}
                    {plan.rankedUniversityIds.length} universities ·{" "}
                    {plan.matchedScholarshipIds.length} scholarships
                  </p>
                  {plan.savedAt && (
                    <p className="mt-1 text-[11px] text-stone-400">
                      Saved {fmtDate(plan.savedAt)}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
