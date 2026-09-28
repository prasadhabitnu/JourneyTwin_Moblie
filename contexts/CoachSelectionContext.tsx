import { createContext, useCallback, useContext, useState, ReactNode } from "react";

/**
 * CoachSelectionContext — Maya's per-session state:
 *   · selectedMemberId — which member is focused for Patient Ring Drill
 *   · outbox           — queued coach actions that survive step navigation
 */

export type OutboxTone = "primary" | "danger" | "default";

export interface QueuedAction {
  id: string;
  memberId: string;
  memberName: string;
  memberInitials: string;
  memberTint: string;
  actionLabel: string;
  tone: OutboxTone;
  queuedAt: number;     // Date.now() ms
}

interface Ctx {
  selectedMemberId: string;
  setSelectedMemberId: (id: string) => void;
  outbox: QueuedAction[];
  queueAction: (a: Omit<QueuedAction, "id" | "queuedAt">) => string;   // returns id
  removeAction: (id: string) => void;
  clearOutbox: () => void;
}

const CoachSelectionContext = createContext<Ctx>({
  selectedMemberId: "sally-r",
  setSelectedMemberId: () => {},
  outbox: [],
  queueAction: () => "",
  removeAction: () => {},
  clearOutbox: () => {},
});

let __nextId = 1;
function nextId(): string {
  __nextId += 1;
  return `act_${__nextId}_${Math.round(Math.random() * 1e6).toString(36)}`;
}

export function CoachSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedMemberId, setSelectedMemberId] = useState("sally-r");
  const [outbox, setOutbox] = useState<QueuedAction[]>([]);

  const queueAction = useCallback((a: Omit<QueuedAction, "id" | "queuedAt">) => {
    const id = nextId();
    const q: QueuedAction = { ...a, id, queuedAt: Date.now() };
    setOutbox(prev => [...prev, q]);
    return id;
  }, []);

  const removeAction = useCallback((id: string) => {
    setOutbox(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearOutbox = useCallback(() => setOutbox([]), []);

  return (
    <CoachSelectionContext.Provider value={{
      selectedMemberId, setSelectedMemberId,
      outbox, queueAction, removeAction, clearOutbox,
    }}>
      {children}
    </CoachSelectionContext.Provider>
  );
}

export function useCoachSelection() {
  return useContext(CoachSelectionContext);
}
