import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { AIToolId, Pathway, StudentProfile } from "./types";

// ── Routing (in-memory; no router dependency for Phase 1) ─────────────────

export type Route =
  | { name: "intake" }
  | { name: "results" }
  | { name: "university"; id: string }
  | { name: "search" }
  | { name: "compare" }
  | { name: "tools" }
  | { name: "tool"; id: AIToolId }
  | { name: "saved" };

/**
 * Dev-only state switcher. Lets every screen's designed states be reached
 * without a backend: loading, empty, partial data, no results, AI refusal,
 * error, offline.
 */
export type DevState =
  | "normal"
  | "loading"
  | "empty"
  | "partial"
  | "no_results"
  | "refusal"
  | "error"
  | "offline";

export interface AppState {
  route: Route;
  navigate: (r: Route) => void;
  profile: StudentProfile | null;
  setProfile: (p: StudentProfile | null) => void;
  pathway: Pathway | null;
  setPathway: (p: Pathway | null) => void;
  savedPlans: Pathway[];
  setSavedPlans: Dispatch<SetStateAction<Pathway[]>>;
  compareIds: string[];
  setCompareIds: Dispatch<SetStateAction<string[]>>;
  devState: DevState;
  setDevState: (s: DevState) => void;
  /** Simulated auth flag for the Saved Plans logged-out state */
  loggedIn: boolean;
  setLoggedIn: (b: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: "intake" });
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [pathway, setPathway] = useState<Pathway | null>(null);
  const [savedPlans, setSavedPlans] = useState<Pathway[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [devState, setDevState] = useState<DevState>("normal");
  const [loggedIn, setLoggedIn] = useState(true);

  const navigate = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0 });
  };

  return (
    <Ctx.Provider
      value={{
        route,
        navigate,
        profile,
        setProfile,
        pathway,
        setPathway,
        savedPlans,
        setSavedPlans,
        compareIds,
        setCompareIds,
        devState,
        setDevState,
        loggedIn,
        setLoggedIn,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}
