import { createContext, useContext, useState, ReactNode } from "react";

/**
 * BehavioralModeContext — /journey view mode:
 *  · "standard"    — the current bundle (diet path + medication management + habit coaching)
 *  · "behavioral"  — pure behavioral science (no meal plans, no dietary directives).
 *                    Nu shifts to autonomy-supportive language; Best Path becomes "Your
 *                    Habits Today"; member designs, Nu suggests.
 *
 * Persisted to localStorage so the mode survives reloads during a demo.
 */

export type JourneyMode = "standard" | "behavioral";

interface Ctx {
  mode: JourneyMode;
  setMode: (m: JourneyMode) => void;
}

const KEY = "hbtnu.journey.mode";

const BehavioralModeContext = createContext<Ctx>({
  mode: "standard",
  setMode: () => {},
});

export function BehavioralModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<JourneyMode>(() => {
    if (typeof window === "undefined") return "standard";
    const saved = window.localStorage.getItem(KEY);
    return saved === "behavioral" ? "behavioral" : "standard";
  });

  function setMode(m: JourneyMode) {
    setModeState(m);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, m);
  }

  return (
    <BehavioralModeContext.Provider value={{ mode, setMode }}>
      {children}
    </BehavioralModeContext.Provider>
  );
}

export function useBehavioralMode() {
  return useContext(BehavioralModeContext);
}
