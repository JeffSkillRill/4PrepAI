import { useEffect, useRef } from "react";

export interface Filters {
  budgetMax: number | null;
  country: string | null;
  field: string | null;
  language: string | null;
  /** Only show universities whose IELTS minimum is at or below this */
  ieltsMax: number | null;
  deadlineOpenOnly: boolean;
}

export const emptyFilters: Filters = {
  budgetMax: null,
  country: null,
  field: null,
  language: null,
  ieltsMax: null,
  deadlineOpenOnly: false,
};

export function activeFilterCount(f: Filters): number {
  return [
    f.budgetMax !== null,
    f.country !== null,
    f.field !== null,
    f.language !== null,
    f.ieltsMax !== null,
    f.deadlineOpenOnly,
  ].filter(Boolean).length;
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-[44px] rounded-full border px-4 text-[13px] font-medium ${
        selected
          ? "border-accent bg-accent text-white"
          : "border-stone-300 bg-white text-stone-700"
      }`}
    >
      {label}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-stone-100 py-3">
      <legend className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-stone-500">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/** Bottom-sheet filter panel, designed for one-thumb use. */
export function FilterSheet({
  open,
  onClose,
  filters,
  onChange,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    onChange({ ...filters, [k]: v });
  const toggle = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    set(k, (filters[k] === v ? null : v) as Filters[K]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filters">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40"
      />
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-4 pt-2 shadow-2xl"
      >
        <div aria-hidden className="mx-auto mb-2 h-1 w-10 rounded-full bg-stone-300" />
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-stone-900">Filters</h2>
          <button
            type="button"
            onClick={() => onChange(emptyFilters)}
            className="min-h-[44px] px-2 text-[13px] font-medium text-accent"
          >
            Clear all
          </button>
        </div>

        <Row label="Annual budget ceiling (tuition + living)">
          {[6000, 8000, 12000, 18000].map((b) => (
            <Chip
              key={b}
              label={`≤ $${b.toLocaleString()}`}
              selected={filters.budgetMax === b}
              onClick={() => toggle("budgetMax", b)}
            />
          ))}
        </Row>

        <Row label="Country">
          {["Hungary", "South Korea", "Türkiye", "Kazakhstan"].map((c) => (
            <Chip
              key={c}
              label={c}
              selected={filters.country === c}
              onClick={() => toggle("country", c)}
            />
          ))}
        </Row>

        <Row label="Field">
          {["Computer Science", "Engineering", "Business"].map((f) => (
            <Chip
              key={f}
              label={f}
              selected={filters.field === f}
              onClick={() => toggle("field", f)}
            />
          ))}
        </Row>

        <Row label="Language of instruction">
          {["English", "Korean", "Russian"].map((l) => (
            <Chip
              key={l}
              label={l}
              selected={filters.language === l}
              onClick={() => toggle("language", l)}
            />
          ))}
        </Row>

        <Row label="IELTS requirement">
          {[
            { label: "≤ 5.5", v: 5.5 },
            { label: "≤ 6.0", v: 6.0 },
            { label: "≤ 6.5", v: 6.5 },
          ].map((o) => (
            <Chip
              key={o.v}
              label={o.label}
              selected={filters.ieltsMax === o.v}
              onClick={() => toggle("ieltsMax", o.v)}
            />
          ))}
        </Row>

        <Row label="Deadlines">
          <Chip
            label="Still open"
            selected={filters.deadlineOpenOnly}
            onClick={() => set("deadlineOpenOnly", !filters.deadlineOpenOnly)}
          />
        </Row>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 min-h-[48px] w-full rounded-xl bg-accent text-[15px] font-semibold text-white"
        >
          Show {resultCount} {resultCount === 1 ? "university" : "universities"}
        </button>
      </div>
    </div>
  );
}
