/**
 * Search & browse with a mobile filter sheet. Filters mirror how the
 * student actually decides: budget ceiling, country, field, language,
 * IELTS requirement, open deadlines.
 */
import { useMemo, useState } from "react";
import { universities, sampleFitScores } from "../mock/sample-data";
import { useApp } from "../state";
import {
  EmptyState,
  ErrorState,
  OfflineState,
  ScreenHeader,
  SkeletonCard,
} from "../components/primitives";
import {
  FilterSheet,
  Filters,
  activeFilterCount,
  emptyFilters,
} from "../components/FilterSheet";
import { UniversityCard } from "../components/UniversityCard";

const TODAY = "2026-07-22";

export function SearchScreen() {
  const { navigate, devState, compareIds, setCompareIds } = useApp();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (devState === "no_results") return [];
    return universities.filter((u) => {
      if (
        query &&
        !`${u.name} ${u.city} ${u.country}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      if (filters.country && u.country !== filters.country) return false;
      if (filters.language && !u.languagesOfInstruction.includes(filters.language))
        return false;
      if (filters.field && !u.programs.some((p) => p.field === filters.field))
        return false;
      if (filters.ieltsMax !== null) {
        if (u.ieltsMinimum.status !== "known") return false;
        if (u.ieltsMinimum.value > filters.ieltsMax) return false;
      }
      if (filters.budgetMax !== null) {
        // Honest filtering: only include if both cost figures are known
        // and their sum fits the ceiling.
        if (
          u.tuitionPerYear.status !== "known" ||
          u.livingCostPerYear.status !== "known"
        )
          return false;
        if (
          u.tuitionPerYear.value.amount + u.livingCostPerYear.value.amount >
          filters.budgetMax
        )
          return false;
      }
      if (filters.deadlineOpenOnly) {
        if (u.applicationDeadline.status !== "known") return false;
        if (u.applicationDeadline.value < TODAY) return false;
      }
      return true;
    });
  }, [filters, query, devState]);

  const nFilters = activeFilterCount(filters);

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-4">
      <ScreenHeader
        title="Browse universities"
        subtitle="Every figure is sourced — tap any “src” chip to see where it came from."
      />

      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search universities</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="University, city, or country"
            className="min-h-[44px] w-full rounded-xl border border-stone-300 bg-white px-3 text-[14px] placeholder:text-stone-400"
          />
        </label>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="relative min-h-[44px] rounded-xl border border-stone-300 bg-white px-4 text-[14px] font-medium text-stone-800"
        >
          Filters
          {nFilters > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
              {nFilters}
            </span>
          )}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {devState === "loading" ? (
          <div aria-busy="true" className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : devState === "error" ? (
          <ErrorState retry={() => {}} />
        ) : (
          <>
            {devState === "offline" && <OfflineState />}
            <p className="text-[12px] text-stone-500" aria-live="polite">
              {results.length}{" "}
              {results.length === 1 ? "university" : "universities"}
              {nFilters > 0 && " match your filters"}
            </p>
            {results.length === 0 ? (
              <EmptyState
                icon="◎"
                title="Nothing matches all of those filters"
                body="Try raising the budget ceiling or removing the IELTS filter — those two cut the most options."
                cta={
                  <button
                    type="button"
                    onClick={() => setFilters(emptyFilters)}
                    className="min-h-[44px] rounded-lg border border-accent px-5 text-[14px] font-semibold text-accent"
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              results.map((u) => (
                <UniversityCard
                  key={u.id}
                  university={u}
                  fit={sampleFitScores.find((f) => f.universityId === u.id)}
                  onOpen={() => navigate({ name: "university", id: u.id })}
                  inCompare={compareIds.includes(u.id)}
                  onToggleCompare={() =>
                    setCompareIds((c) =>
                      c.includes(u.id)
                        ? c.filter((x) => x !== u.id)
                        : c.length < 3
                          ? [...c, u.id]
                          : c
                    )
                  }
                />
              ))
            )}
          </>
        )}
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={setFilters}
        resultCount={results.length}
      />
    </div>
  );
}
