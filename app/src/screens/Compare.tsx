/**
 * Compare 2–3 universities. On mobile: horizontally paged columns with
 * scroll-snap — never a squeezed table.
 */
import { universityById, sampleFitScores } from "../mock/sample-data";
import { useApp } from "../state";
import {
  DataValue,
  EmptyState,
  FitBreakdown,
  FitScoreBadge,
  ScreenHeader,
  fmtDate,
  fmtMoney,
} from "../components/primitives";

function CompareRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-stone-400">
        {label}
      </dt>
      <dd className="text-[14px] font-semibold text-stone-800">{children}</dd>
    </div>
  );
}

export function CompareScreen() {
  const { navigate, compareIds, setCompareIds } = useApp();
  const unis = compareIds.map(universityById).filter(Boolean);

  if (unis.length < 2) {
    return (
      <div className="mx-auto max-w-md px-4 pt-4">
        <ScreenHeader
          title="Compare"
          subtitle="Side by side, up to three universities"
        />
        <EmptyState
          icon="⇄"
          title={
            unis.length === 0
              ? "Nothing to compare yet"
              : "Add one more to compare"
          }
          body="Tap “+ Compare” on any university card in your pathway or in browse."
          cta={
            <button
              type="button"
              onClick={() => navigate({ name: "search" })}
              className="min-h-[44px] rounded-lg bg-accent px-5 text-[14px] font-semibold text-white"
            >
              Browse universities
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4">
      <div className="mx-auto max-w-md px-4">
        <ScreenHeader
          title="Compare"
          subtitle="Swipe sideways to page between universities"
        />
      </div>

      <div
        className="snap-x-page no-scrollbar flex gap-3 overflow-x-auto px-4"
        role="region"
        aria-label="University comparison, horizontally scrollable"
      >
        {unis.map((u) => {
          if (!u) return null;
          const fit = sampleFitScores.find((f) => f.universityId === u.id);
          return (
            <article
              key={u.id}
              className="w-[82vw] max-w-[340px] shrink-0 rounded-xl border border-stone-200 bg-white p-4"
            >
              <header className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-[15px] font-bold leading-snug text-stone-900">
                    {u.name}
                  </h2>
                  <p className="text-[12px] text-stone-500">
                    {u.city}, {u.country}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${u.name} from comparison`}
                  onClick={() =>
                    setCompareIds((c) => c.filter((x) => x !== u.id))
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100"
                >
                  ✕
                </button>
              </header>

              <dl className="mt-3 space-y-2.5 border-t border-stone-100 pt-3">
                <CompareRow label="Tuition">
                  <DataValue point={u.tuitionPerYear} render={fmtMoney} />
                </CompareRow>
                <CompareRow label="Living costs">
                  <DataValue point={u.livingCostPerYear} render={fmtMoney} />
                </CompareRow>
                <CompareRow label="Application fee">
                  <DataValue point={u.applicationFee} render={fmtMoney} />
                </CompareRow>
                <CompareRow label="Deadline">
                  <DataValue point={u.applicationDeadline} render={fmtDate} />
                </CompareRow>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-stone-400">
                    IELTS minimum
                  </dt>
                  <dd className="text-[14px] font-semibold text-stone-800">
                    <DataValue point={u.ieltsMinimum} render={(v) => v.toFixed(1)} />
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-stone-400">
                    Acceptance rate
                  </dt>
                  <dd className="text-[14px] font-semibold text-stone-800">
                    <DataValue
                      point={u.acceptanceRate}
                      render={(v) => `${Math.round(v * 100)}%`}
                    />
                  </dd>
                </div>
              </dl>

              {fit && (
                <div className="mt-3 border-t border-stone-100 pt-3">
                  <div className="mb-2 flex items-center gap-2">
                    <FitScoreBadge score={fit.overall} />
                    <span className="text-[12px] text-stone-500">
                      Your fit, in five parts
                    </span>
                  </div>
                  <FitBreakdown fit={fit} />
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate({ name: "university", id: u.id })}
                className="mt-3 min-h-[44px] w-full rounded-lg border border-accent text-[13px] font-semibold text-accent"
              >
                Full profile
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-3 px-4 text-center text-[11px] text-stone-400">
        {unis.length} of 3 slots used
      </p>
    </div>
  );
}
