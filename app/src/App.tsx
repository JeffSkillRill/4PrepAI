import { AppProvider, DevState, useApp } from "./state";
import { IntakeScreen } from "./screens/Intake";
import { ResultsScreen } from "./screens/Results";
import { UniversityProfileScreen } from "./screens/UniversityProfile";
import { SearchScreen } from "./screens/Search";
import { CompareScreen } from "./screens/Compare";
import { ToolsHubScreen, ToolScreen } from "./screens/Tools";
import { SavedScreen } from "./screens/Saved";

// ── Dev ribbon: sample-data warning + state switcher ───────────────────────

const DEV_STATES: DevState[] = [
  "normal",
  "loading",
  "empty",
  "partial",
  "no_results",
  "refusal",
  "error",
  "offline",
];

function DevRibbon() {
  const { devState, setDevState } = useApp();
  return (
    <div className="sticky top-0 z-40 border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-1.5">
        <span className="shrink-0 text-[11px] font-semibold text-amber-900">
          ⚠ Sample data — not verified
        </span>
        <label className="ml-auto flex items-center gap-1 text-[11px] text-amber-800">
          <span className="sr-only sm:not-sr-only">State:</span>
          <select
            value={devState}
            onChange={(e) => setDevState(e.target.value as DevState)}
            className="max-w-[110px] rounded border border-amber-300 bg-white px-1 py-1 text-[11px]"
            aria-label="Dev state switcher"
          >
            {DEV_STATES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

// ── Bottom navigation ──────────────────────────────────────────────────────

function NavButton({
  label,
  icon,
  active,
  onClick,
  badge,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 ${
        active ? "text-accent" : "text-stone-400"
      }`}
    >
      <span aria-hidden className="text-[17px] leading-none">
        {icon}
      </span>
      <span className="text-[10px] font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-[22%] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function BottomNav() {
  const { route, navigate, compareIds, pathway } = useApp();
  const name = route.name;
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-md">
        <NavButton
          label="Pathway"
          icon="◆"
          active={name === "results" || name === "intake" || name === "university"}
          onClick={() => navigate({ name: pathway ? "results" : "intake" })}
        />
        <NavButton
          label="Browse"
          icon="◎"
          active={name === "search"}
          onClick={() => navigate({ name: "search" })}
        />
        <NavButton
          label="Compare"
          icon="⇄"
          active={name === "compare"}
          onClick={() => navigate({ name: "compare" })}
          badge={compareIds.length}
        />
        <NavButton
          label="Tools"
          icon="◧"
          active={name === "tools" || name === "tool"}
          onClick={() => navigate({ name: "tools" })}
        />
        <NavButton
          label="Saved"
          icon="◫"
          active={name === "saved"}
          onClick={() => navigate({ name: "saved" })}
        />
      </div>
    </nav>
  );
}

// ── Route switch ───────────────────────────────────────────────────────────

function Screen() {
  const { route } = useApp();
  switch (route.name) {
    case "intake":
      return <IntakeScreen />;
    case "results":
      return <ResultsScreen />;
    case "university":
      return <UniversityProfileScreen id={route.id} />;
    case "search":
      return <SearchScreen />;
    case "compare":
      return <CompareScreen />;
    case "tools":
      return <ToolsHubScreen />;
    case "tool":
      return <ToolScreen toolId={route.id} />;
    case "saved":
      return <SavedScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen pb-16">
        <DevRibbon />
        <main>
          <Screen />
        </main>
        <BottomNav />
      </div>
    </AppProvider>
  );
}
