import { createContext, useContext, useState, ReactNode, useMemo } from "react";

/**
 * Shared state for the Update Me capture flow.
 *   UpdateMe.tsx writes here when a pill is logged.
 *   BestPathGuide.tsx reads here to recommend a path based on today's inputs.
 */

export interface UpdateMeLog {
  food?: string;
  weight?: number;       // lbs
  activity?: number;     // minutes
  sleep?: number;        // hours
  water?: number;        // glasses
  stress?: number;       // 1..5
  // Compass-context fields — logged from Health Compass wedges.
  glucose?: number;      // mg/dL (manual reading, complements CGM stream)
  meds?: string;         // "Taken on time" | "Taken late" | "Skipped" | "Adjusted dose"
}

interface Ctx {
  log: UpdateMeLog;
  setValue: <K extends keyof UpdateMeLog>(key: K, value: UpdateMeLog[K]) => void;
  clear: () => void;
  suggestedPathId: string;  // dynamic recommendation based on log
  suggestionReason: string; // why Nu picked it
}

const UpdateMeContext = createContext<Ctx | null>(null);

export function UpdateMeProvider({ children }: { children: ReactNode }) {
  const [log, setLog] = useState<UpdateMeLog>({});

  const setValue: Ctx["setValue"] = (k, v) => setLog(prev => ({ ...prev, [k]: v }));
  const clear = () => setLog({});

  const { suggestedPathId, suggestionReason } = useMemo(() => suggestPath(log), [log]);

  return (
    <UpdateMeContext.Provider value={{ log, setValue, clear, suggestedPathId, suggestionReason }}>
      {children}
    </UpdateMeContext.Provider>
  );
}

export function useUpdateMe(): Ctx {
  const ctx = useContext(UpdateMeContext);
  if (!ctx) throw new Error("useUpdateMe must be used within UpdateMeProvider");
  return ctx;
}

/**
 * Rules that map today's inputs to the best-fitting path.
 * Higher-priority conditions win (checked top-to-bottom).
 * Default: "long-walker" - Sally's baseline recommendation.
 */
function suggestPath(log: UpdateMeLog): { suggestedPathId: string; suggestionReason: string } {
  // Skipped meds = long-walker with a nudge (semaglutide protects post-meal peaks — walking helps compensate today).
  if (log.meds === "Skipped") {
    return {
      suggestedPathId: "long-walker",
      suggestionReason: "You skipped a dose today - Long Walker gives your body the extra help post-meals.",
    };
  }

  // High glucose reading = tighten meals + move after eating.
  if (log.glucose !== undefined && log.glucose >= 180) {
    return {
      suggestedPathId: "mindful-meals",
      suggestionReason: `Reading of ${log.glucose} mg/dL - Mindful Meals keeps the next curve gentler.`,
    };
  }

  // High stress or bad sleep = recovery-first day
  if ((log.stress ?? 0) >= 4) {
    return {
      suggestedPathId: "rest-reset",
      suggestionReason: "Stress is high today - Nu switched today's plan to Rest & Reset.",
    };
  }
  if (log.sleep !== undefined && log.sleep < 6) {
    return {
      suggestedPathId: "rest-reset",
      suggestionReason: `Only ${log.sleep} hours of sleep - Rest & Reset is the higher-leverage plan today.`,
    };
  }

  // Low hydration = hydration champion
  if (log.water !== undefined && log.water < 3) {
    return {
      suggestedPathId: "hydration-champion",
      suggestionReason: `Only ${log.water} glasses so far - Hydration Champion is the fastest win.`,
    };
  }

  // Low activity = move-more focus
  if (log.activity !== undefined && log.activity < 10) {
    return {
      suggestedPathId: "move-more",
      suggestionReason: `Movement's been light - Move More gets you back on track fast.`,
    };
  }

  // Food that typically spikes: dosa/pancake/bagel/muffin
  if (log.food && /dosa|pancake|bagel|muffin|donut|cereal/i.test(log.food)) {
    return {
      suggestedPathId: "mindful-meals",
      suggestionReason: `${log.food.split(" ").slice(0, 2).join(" ")} usually spikes you - Mindful Meals shapes the rest of the day around that.`,
    };
  }

  // Default: the standard Long Walker recommendation
  return {
    suggestedPathId: "long-walker",
    suggestionReason: "Nothing screams for a shift - The Long Walker is still your best baseline for today.",
  };
}
