import { createContext, useContext, useState, ReactNode } from "react";
import { NuRoleId } from "../lib/journeyData";

/**
 * JourneyConfigContext - Sally's personal journey configuration.
 * Which steps are enabled, in what order, and which Nu suggestions are pending.
 *
 * Anchors ("morning-friend", "evening-companion") are always in the enabled list
 * at the correct positions and cannot be hidden.
 */

const ANCHOR_START: NuRoleId = "morning-friend";
const ANCHOR_END:   NuRoleId = "evening-companion";
const ANCHORS: NuRoleId[]    = [ANCHOR_START, ANCHOR_END];

const DEFAULT_ENABLED: NuRoleId[] = [
  "morning-friend",
  "update-me",
  "best-path-guide",
  "compass-reader",
  "vitals-reader",
  "ring-companion",
  "glucose-storyteller",
  "kindred-connector",
  "trend-watcher",
  "evening-companion",
];

const DEFAULT_SUGGESTIONS: NuRoleId[] = [
  "weekly-reflection",
  "meal-planning",
  "craving-log",
  "provider-prep",
  "learn-one-thing",
];

export interface JourneyConfigCtx {
  enabledStepIds: NuRoleId[];
  hiddenStepIds:  NuRoleId[];
  suggestedStepIds: NuRoleId[];
  isAnchor: (id: NuRoleId) => boolean;
  hideStep: (id: NuRoleId) => void;
  restoreStep: (id: NuRoleId) => void;
  acceptSuggestion: (id: NuRoleId) => void;
  dismissSuggestion: (id: NuRoleId) => void;
  reorder: (id: NuRoleId, targetIndex: number) => void;
  resetToDefault: () => void;
}

const Ctx = createContext<JourneyConfigCtx | null>(null);

export function JourneyConfigProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled]     = useState<NuRoleId[]>(DEFAULT_ENABLED);
  const [hidden, setHidden]       = useState<NuRoleId[]>([]);
  const [suggested, setSuggested] = useState<NuRoleId[]>(DEFAULT_SUGGESTIONS);

  const isAnchor = (id: NuRoleId) => ANCHORS.includes(id);

  function hideStep(id: NuRoleId) {
    if (isAnchor(id)) return;
    setEnabled(prev => prev.filter(x => x !== id));
    setHidden(prev => (prev.includes(id) ? prev : [...prev, id]));
  }

  function restoreStep(id: NuRoleId) {
    setHidden(prev => prev.filter(x => x !== id));
    // Insert right before the end anchor (Tonight).
    setEnabled(prev => {
      if (prev.includes(id)) return prev;
      const endIdx = prev.indexOf(ANCHOR_END);
      const next = [...prev];
      if (endIdx >= 0) next.splice(endIdx, 0, id);
      else next.push(id);
      return next;
    });
  }

  function acceptSuggestion(id: NuRoleId) {
    setSuggested(prev => prev.filter(x => x !== id));
    setEnabled(prev => {
      if (prev.includes(id)) return prev;
      const endIdx = prev.indexOf(ANCHOR_END);
      const next = [...prev];
      if (endIdx >= 0) next.splice(endIdx, 0, id);
      else next.push(id);
      return next;
    });
  }

  function dismissSuggestion(id: NuRoleId) {
    setSuggested(prev => prev.filter(x => x !== id));
  }

  function reorder(id: NuRoleId, targetIndex: number) {
    setEnabled(prev => {
      if (isAnchor(id)) return prev;
      const currentIdx = prev.indexOf(id);
      if (currentIdx < 0) return prev;
      // Compute clamped target within the movable band (skip anchors at 0 and length-1).
      const startAnchorIdx = prev.indexOf(ANCHOR_START);
      const endAnchorIdx   = prev.indexOf(ANCHOR_END);
      const minIdx = startAnchorIdx + 1;
      const maxIdx = endAnchorIdx - 1;
      let target = Math.max(minIdx, Math.min(maxIdx, targetIndex));
      const next = prev.filter(x => x !== id);
      // Re-clamp after removal (indices may shift).
      const newStart = next.indexOf(ANCHOR_START);
      const newEnd   = next.indexOf(ANCHOR_END);
      target = Math.max(newStart + 1, Math.min(newEnd, target));
      next.splice(target, 0, id);
      return next;
    });
  }

  function resetToDefault() {
    setEnabled(DEFAULT_ENABLED);
    setHidden([]);
    setSuggested(DEFAULT_SUGGESTIONS);
  }

  return (
    <Ctx.Provider value={{
      enabledStepIds:    enabled,
      hiddenStepIds:     hidden,
      suggestedStepIds:  suggested,
      isAnchor,
      hideStep,
      restoreStep,
      acceptSuggestion,
      dismissSuggestion,
      reorder,
      resetToDefault,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useJourneyConfig(): JourneyConfigCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useJourneyConfig must be used inside JourneyConfigProvider");
  return c;
}
