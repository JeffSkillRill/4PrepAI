import { FitScore, University } from "../types";
import { scholarshipById } from "../mock/sample-data";
import { DataValue, ExpandableFit, fmtMoney, fmtDate } from "./primitives";

export function UniversityCard({
  university,
  fit,
  rank,
  onOpen,
  onToggleCompare,
  inCompare,
}: {
  university: University;
  fit?: FitScore;
  rank?: number;
  onOpen: () => void;
  onToggleCompare?: () => void;
  inCompare?: boolean;
}) {
  const scholarships = university.scholarshipIds
    .map(scholarshipById)
    .filter(Boolean);

  return (
    <article className="rounded-xl border border-stone-200 bg-white p-4">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={`Open ${university.name}`}
      >
        <div className="flex items-start gap-3">
          {rank !== undefined && (
            <span
              aria-label={`Rank ${rank}`}
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-900 text-[12px] font-bold text-white"
            >
              {rank}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold leading-snug text-stone-900">
              {university.name}
            </h3>
            <p className="text-[12px] text-stone-500">
              {university.city}, {university.country} ·{" "}
              {university.languagesOfInstruction.join(" / ")}
            </p>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-stone-400">
              Tuition
            </dt>
            <dd className="text-[14px] font-semibold text-stone-800">
              <DataValue point={university.tuitionPerYear} render={fmtMoney} />
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-stone-400">
              Deadline
            </dt>
            <dd className="text-[14px] font-semibold text-stone-800">
              <DataValue
                point={university.applicationDeadline}
                render={fmtDate}
              />
            </dd>
          </div>
        </dl>
      </button>

      {fit && (
        <div className="mt-3 border-t border-stone-100 pt-2">
          <ExpandableFit fit={fit} />
        </div>
      )}

      {scholarships.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {scholarships.map(
            (s) =>
              s && (
                <span
                  key={s.id}
                  className="rounded-full bg-accent-soft px-2 py-1 text-[11px] font-medium text-accent"
                >
                  {s.name.replace(" (sample)", "")}
                </span>
              )
          )}
        </div>
      )}

      {onToggleCompare && (
        <div className="mt-3 flex justify-end border-t border-stone-100 pt-2">
          <button
            type="button"
            onClick={onToggleCompare}
            aria-pressed={inCompare}
            className={`min-h-[44px] rounded-lg px-3 text-[13px] font-medium ${
              inCompare
                ? "bg-accent text-white"
                : "text-accent hover:bg-accent-soft"
            }`}
          >
            {inCompare ? "✓ In compare" : "+ Compare"}
          </button>
        </div>
      )}
    </article>
  );
}
