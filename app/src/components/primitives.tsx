/**
 * Reusable primitives. These encode the product's non-negotiable rules:
 * numbers carry sources, missing data is a designed state, and the fit
 * score always expands into its five components.
 */
import { useId, useState } from "react";
import {
  DataPoint,
  FitScore,
  Money,
  Source,
} from "../types";
import { sourceById } from "../mock/sample-data";

// ── Formatting helpers ─────────────────────────────────────────────────────

export const fmtMoney = (m: Money): string => {
  const sym: Record<string, string> = { USD: "$", EUR: "€" };
  const n = m.amount.toLocaleString("en-US");
  const core = sym[m.currency] ? `${sym[m.currency]}${n}` : `${n} ${m.currency}`;
  const per: Record<string, string> = {
    year: "/yr",
    semester: "/sem",
    month: "/mo",
    one_time: "",
  };
  return `${core}${per[m.period] ?? ""}`;
};

export const fmtDate = (iso: string): string =>
  new Date(iso + (iso.length === 7 ? "-01" : "")).toLocaleDateString("en-US", {
    day: iso.length === 7 ? undefined : "numeric",
    month: "short",
    year: "numeric",
  });

export const fmtMonth = (iso: string): string =>
  new Date(iso + "-01").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

// ── SourceChip ─────────────────────────────────────────────────────────────
// Every rendered figure carries one. Tap to see origin + retrieval date.

export function SourceChip({ sourceId }: { sourceId: string }) {
  const [open, setOpen] = useState(false);
  const src: Source | undefined = sourceById(sourceId);
  const id = useId();
  if (!src) return null;
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="ml-1 inline-flex min-h-[24px] items-center gap-0.5 rounded-full border border-stone-300 bg-white px-1.5 text-[10px] font-medium text-stone-500 hover:border-accent hover:text-accent"
        title={`Source: ${src.name}`}
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2 3 7v2h18V7l-9-5Zm-7 9v7H3v3h18v-3h-2v-7h-3v7h-3v-7h-2v7H8v-7H5Z"
            fill="currentColor"
          />
        </svg>
        src
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-40 mb-1.5 w-56 -translate-x-1/2 rounded-lg border border-stone-200 bg-white p-2.5 text-left shadow-lg"
        >
          <span className="block text-[11px] font-semibold leading-snug text-stone-800">
            {src.name}
          </span>
          <span className="mt-1 block text-[10px] text-stone-500">
            Retrieved {fmtDate(src.retrievedAt)}
          </span>
          {src.verification === "unverified_sample" && (
            <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
              Sample — not verified
            </span>
          )}
        </span>
      )}
    </span>
  );
}

// ── MissingValue ───────────────────────────────────────────────────────────
// The designed state for unknown data. Never an em-dash, zero, or estimate.

export function MissingValue({
  reason,
  suggestedAction,
  compact,
}: {
  reason: string;
  suggestedAction?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[13px] italic text-stone-500"
        title={suggestedAction}
      >
        <span aria-hidden className="text-stone-400">
          ◌
        </span>
        {reason}
      </span>
    );
  }
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-3 py-2">
      <p className="text-[13px] italic text-stone-600">{reason}</p>
      {suggestedAction && (
        <p className="mt-0.5 text-[12px] text-accent">→ {suggestedAction}</p>
      )}
    </div>
  );
}

// ── DataValue — renders any DataPoint correctly ────────────────────────────

export function DataValue<T>({
  point,
  render,
  compactMissing = true,
  className = "",
}: {
  point: DataPoint<T>;
  render: (v: T) => React.ReactNode;
  compactMissing?: boolean;
  className?: string;
}) {
  if (point.status === "unknown") {
    return (
      <MissingValue
        reason={point.reason}
        suggestedAction={point.suggestedAction}
        compact={compactMissing}
      />
    );
  }
  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span>{render(point.value)}</span>
      <SourceChip sourceId={point.sourceId} />
    </span>
  );
}

// ── FitScoreBadge + FitBreakdown ───────────────────────────────────────────

const tone = (score: number) =>
  score >= 80
    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
    : score >= 60
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-stone-100 text-stone-600 border-stone-200";

export function FitScoreBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border font-semibold tabular-nums ${tone(
        score
      )} ${size === "lg" ? "h-12 w-12 text-lg" : "h-10 w-10 text-sm"}`}
      aria-label={`Fit score ${score} out of 100`}
    >
      {score}
    </span>
  );
}

export function FitBreakdown({ fit }: { fit: FitScore }) {
  return (
    <ul className="space-y-2.5">
      {fit.components.map((c) => (
        <li key={c.key}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-medium text-stone-800">
              {c.label}
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-stone-700">
              {c.score}
            </span>
          </div>
          <div
            className="mt-1 h-1.5 w-full rounded-full bg-stone-200"
            role="img"
            aria-label={`${c.label}: ${c.score} out of 100`}
          >
            <div
              className={`h-1.5 rounded-full ${
                c.score >= 80
                  ? "bg-emerald-500"
                  : c.score >= 60
                    ? "bg-amber-500"
                    : "bg-stone-400"
              }`}
              style={{ width: `${c.score}%` }}
            />
          </div>
          <p className="mt-1 text-[12px] leading-snug text-stone-500">
            {c.reason}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** Badge that expands to the five components — the score is never bare. */
export function ExpandableFit({ fit }: { fit: FitScore }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-1 text-left"
      >
        <FitScoreBadge score={fit.overall} />
        <span className="flex-1">
          <span className="block text-[13px] font-medium text-stone-800">
            Fit score
          </span>
          <span className="block text-[11px] text-stone-500">
            {open ? "Hide" : "See"} the five components
          </span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className={`text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {open && (
        <div id={id} className="mt-2 rounded-lg bg-stone-50 p-3">
          <FitBreakdown fit={fit} />
        </div>
      )}
    </div>
  );
}

// ── AIResponseBlock ────────────────────────────────────────────────────────
// Frame for anything the counselor says: labeled, structured, honest about
// limits. Refusal is a designed variant, not an error.

export function AIResponseBlock({
  title = "Your counselor",
  children,
  variant = "ok",
  refusal,
}: {
  title?: string;
  children?: React.ReactNode;
  variant?: "ok" | "refusal";
  refusal?: { explanation: string; clarifyingQuestion: string };
}) {
  return (
    <section
      aria-label={title}
      className="rounded-xl border border-stone-200 bg-white p-4"
    >
      <header className="mb-2 flex items-center gap-2">
        <span
          aria-hidden
          className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-[11px] font-bold text-accent"
        >
          4P
        </span>
        <span className="text-[12px] font-semibold uppercase tracking-wide text-stone-500">
          {title}
        </span>
        <span className="ml-auto rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500">
          AI · based on your profile
        </span>
      </header>
      {variant === "refusal" && refusal ? (
        <div>
          <p className="text-[14px] leading-relaxed text-stone-800">
            {refusal.explanation}
          </p>
          <div className="mt-3 rounded-lg border border-accent/20 bg-accent-soft p-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-accent">
              To help you better
            </p>
            <p className="mt-1 text-[14px] text-stone-800">
              {refusal.clarifyingQuestion}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-[14px] leading-relaxed text-stone-800">
          {children}
        </div>
      )}
    </section>
  );
}

// ── Skeletons (fixed sizes — no layout shift) ──────────────────────────────

export function SkeletonLine({ w = "100%", h = 14 }: { w?: string; h?: number }) {
  return <div className="skeleton" style={{ width: w, height: h }} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div
      className="rounded-xl border border-stone-200 bg-white p-4"
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10" />
        <div className="flex-1 space-y-2">
          <SkeletonLine w="60%" />
          <SkeletonLine w="40%" h={11} />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonLine />
        <SkeletonLine w="80%" />
      </div>
    </div>
  );
}

// ── Shared shell pieces ────────────────────────────────────────────────────

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  action,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-4 flex items-start gap-2">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold tracking-tight text-stone-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-stone-500">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({
  icon = "○",
  title,
  body,
  cta,
}: {
  icon?: string;
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
      <div aria-hidden className="text-2xl text-stone-300">
        {icon}
      </div>
      <h2 className="mt-2 text-[15px] font-semibold text-stone-800">{title}</h2>
      <p className="mx-auto mt-1 max-w-[28ch] text-[13px] text-stone-500">
        {body}
      </p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}

export function ErrorState({ retry }: { retry?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-center"
    >
      <h2 className="text-[15px] font-semibold text-red-900">
        Something went wrong on our side
      </h2>
      <p className="mt-1 text-[13px] text-red-700">
        Your profile and saved plans are untouched.
      </p>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="mt-3 min-h-[44px] rounded-lg bg-red-700 px-5 text-[14px] font-semibold text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function OfflineState() {
  return (
    <div
      role="status"
      className="rounded-xl border border-stone-300 bg-stone-100 px-5 py-6 text-center"
    >
      <h2 className="text-[15px] font-semibold text-stone-800">
        You're offline
      </h2>
      <p className="mt-1 text-[13px] text-stone-600">
        Showing your last loaded results. Deadlines and figures may be out of
        date until you reconnect.
      </p>
    </div>
  );
}
