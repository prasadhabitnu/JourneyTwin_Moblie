import { useState, DragEvent } from "react";
import { NU_ROLES, NuRoleId } from "../../lib/journeyData";
import { useJourneyConfig } from "../../contexts/JourneyConfigContext";

/**
 * JourneyConfigEditor - modal to reshape Sally's journey.
 *
 * Three sections:
 *   1. Your journey - current ordered stack (drag to reorder, tap x to hide, anchors locked)
 *   2. Hidden by you - restore-only list
 *   3. Nu suggests adding - accept or dismiss with rationale
 */

interface Props { onClose: () => void }

// Per-suggestion rationale surfaced in the "Nu suggests" section.
const SUGGESTION_RATIONALE: Record<NuRoleId, string> = {
  "morning-friend": "", "update-me": "", "best-path-guide": "", "compass-reader": "",
  "vitals-reader": "", "ring-companion": "", "glucose-storyteller": "", "kindred-connector": "",
  "trend-watcher": "", "evening-companion": "",
  "weekly-reflection": "Sunday reflection helps 78% of members hit Monday goals. Try it once a week.",
  "meal-planning":    "You grocery-shop Wednesdays. Plan 7 dinners the morning before to keep protein-first easy.",
  "craving-log":      "You're in week 6 of semaglutide - cravings are common. Log them and Nu spots the pattern.",
  "provider-prep":    "Your visit with Dr. Adams is Thursday. Nu can gather your top 3 questions.",
  "learn-one-thing":  "A 90-second lesson picked for today - protein-first order at breakfast.",
};

export default function JourneyConfigEditor({ onClose }: Props) {
  const cfg = useJourneyConfig();
  const [draggingId, setDraggingId] = useState<NuRoleId | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  function onDragStart(e: DragEvent, id: NuRoleId) {
    if (cfg.isAnchor(id)) { e.preventDefault(); return; }
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  }
  function onDragOver(e: DragEvent, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(idx);
  }
  function onDrop(e: DragEvent, targetIdx: number) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") as NuRoleId;
    if (id) cfg.reorder(id, targetIdx);
    setDraggingId(null);
    setDropTarget(null);
  }
  function onDragEnd() { setDraggingId(null); setDropTarget(null); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
         style={{ background: "rgba(15,23,42,0.55)" }}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white p-6 border-b border-slate-100 flex items-center gap-4">
          <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">Customize your day</div>
            <div className="text-xl font-black text-slate-900 leading-tight">Reshape Sally&apos;s journey</div>
          </div>
          <button onClick={cfg.resetToDefault}
                  className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">
            Reset
          </button>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700 font-black leading-none">×</button>
        </div>

        {/* Section 1: current journey */}
        <div className="p-6">
          <SectionHeader label="Your journey today" sub="Drag to reorder. Tap x to hide. Anchors are locked." />
          <div className="space-y-2">
            {cfg.enabledStepIds.map((id, idx) => {
              const role = NU_ROLES.find(r => r.id === id);
              if (!role) return null;
              const active = draggingId === id;
              const overThis = dropTarget === idx && draggingId && draggingId !== id;
              return (
                <div key={id}
                     onDragOver={(e) => onDragOver(e, idx)}
                     onDrop={(e) => onDrop(e, idx)}
                     style={overThis ? { transform: "translateY(4px)" } : {}}>
                  <StepRow
                    role={role}
                    index={idx + 1}
                    locked={cfg.isAnchor(id)}
                    dragging={active}
                    onDragStart={(e) => onDragStart(e, id)}
                    onDragEnd={onDragEnd}
                    onHide={cfg.isAnchor(id) ? undefined : () => cfg.hideStep(id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: hidden */}
        {cfg.hiddenStepIds.length > 0 && (
          <div className="px-6 pb-6">
            <SectionHeader label="Hidden by you" sub="Tap to bring back into today's flow." />
            <div className="space-y-2">
              {cfg.hiddenStepIds.map(id => {
                const role = NU_ROLES.find(r => r.id === id);
                if (!role) return null;
                return (
                  <button key={id}
                          onClick={() => cfg.restoreStep(id)}
                          className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/60 transition opacity-75 hover:opacity-100">
                    <span className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xl shrink-0">
                      {role.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-black text-slate-700">{role.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">{role.subtitle}</div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 px-2 py-1 rounded bg-indigo-100">Restore</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Nu suggests */}
        {cfg.suggestedStepIds.length > 0 && (
          <div className="px-6 pb-6">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.5 4L18 8l-4 3 1 5-3-2.5L9 16l1-5-4-3 4.5-1z" />
                  </svg>
                </span>
                <div className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700">Nu suggests adding</div>
              </div>
              <div className="space-y-2">
                {cfg.suggestedStepIds.map(id => {
                  const role = NU_ROLES.find(r => r.id === id);
                  if (!role) return null;
                  return (
                    <div key={id} className="rounded-xl bg-white border border-slate-100 p-3 flex items-center gap-3">
                      <span className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
                        {role.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-black text-slate-800">{role.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{SUGGESTION_RATIONALE[id]}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => cfg.acceptSuggestion(id)}
                                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                          Add
                        </button>
                        <button onClick={() => cfg.dismissSuggestion(id)}
                                className="px-2 py-2 text-slate-400 hover:text-slate-700 text-[10px] font-black uppercase tracking-wider">
                          Not now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-500">
            {cfg.enabledStepIds.length} steps &middot; {cfg.hiddenStepIds.length} hidden &middot; {cfg.suggestedStepIds.length} suggestions
          </div>
          <button onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700">{label}</div>
      <div className="text-[11px] text-slate-500 font-medium">{sub}</div>
    </div>
  );
}

function StepRow({ role, index, locked, dragging, onDragStart, onDragEnd, onHide }:
  { role: typeof NU_ROLES[number]; index: number; locked: boolean; dragging: boolean;
    onDragStart: (e: DragEvent) => void; onDragEnd: () => void; onHide?: () => void }) {
  return (
    <div
      draggable={!locked}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={"flex items-center gap-3 p-3 rounded-xl border transition " +
        (locked
          ? "border-slate-100 bg-slate-50/40"
          : "border-slate-100 bg-white cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-sm") +
        (dragging ? " opacity-40" : "")
      }>
      <span className="w-6 text-[10px] font-black text-slate-400 tabular-nums text-center">{index}</span>
      <span className="w-10 h-10 rounded-full bg-indigo-50 text-slate-700 flex items-center justify-center text-xl shrink-0">
        {role.emoji}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-black text-slate-800">{role.name}</div>
        <div className="text-[11px] text-slate-500 font-medium truncate">{role.subtitle}</div>
      </div>
      {locked ? (
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-2 py-1 rounded bg-slate-100 shrink-0">Anchor</span>
      ) : (
        <>
          <svg className="w-4 h-4 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
          </svg>
          {onHide && (
            <button onClick={onHide}
                    className="text-slate-400 hover:text-rose-600 shrink-0"
                    title="Hide this step">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}
