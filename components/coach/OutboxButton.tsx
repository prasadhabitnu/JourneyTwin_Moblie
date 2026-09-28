import { useEffect, useRef, useState } from "react";
import { useCoachSelection, type QueuedAction } from "../../contexts/CoachSelectionContext";

/**
 * OutboxButton — top-nav pill with badge count.
 * Click opens a floating panel listing all queued coach actions
 * grouped by member, with per-item send/remove + footer send-all.
 */
export default function OutboxButton() {
  const { outbox, removeAction, clearOutbox } = useCoachSelection();
  const [open, setOpen] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (!open) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onClickAway);
    return () => window.removeEventListener("mousedown", onClickAway);
  }, [open]);

  const count = outbox.length;

  // Group by member
  const byMember: Record<string, QueuedAction[]> = {};
  outbox.forEach(a => {
    if (!byMember[a.memberId]) byMember[a.memberId] = [];
    byMember[a.memberId].push(a);
  });

  function markSent(id: string) {
    setSentIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => removeAction(id), 700);
  }

  function sendAll() {
    const allIds = outbox.map(a => a.id);
    setSentIds(prev => {
      const next = new Set(prev);
      allIds.forEach(id => next.add(id));
      return next;
    });
    setTimeout(() => clearOutbox(), 900);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button onClick={() => setOpen(o => !o)}
              className="relative flex items-center gap-1.5 h-9 px-3 rounded-full text-[11px] font-black transition"
              style={count > 0
                ? { background: "#EEF2FF", color: "#4F5FE5", border: "1px solid #C7D2FE" }
                : { background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
        <span>Outbox</span>
        {count > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black text-white grid place-items-center"
                style={{ background: "#4F5FE5" }}>{count}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden"
             style={{ width: 380 }}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between"
               style={{ background: "linear-gradient(90deg,#EEF2FF,#FFFFFF)" }}>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-indigo-700">Maya's outbox</div>
              <div className="text-[14px] font-black text-slate-900">
                {count === 0 ? "Nothing queued" : `${count} action${count === 1 ? "" : "s"} · ${Object.keys(byMember).length} member${Object.keys(byMember).length === 1 ? "" : "s"}`}
              </div>
            </div>
            {count > 0 && (
              <button onClick={sendAll}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-black text-white shadow-sm"
                      style={{ background: "linear-gradient(90deg,#4F5FE5,#0EA5A4)" }}>
                Send all
              </button>
            )}
          </div>

          {/* Body */}
          {count === 0 ? (
            <div className="p-8 text-center">
              <div className="text-[11px] text-slate-500 leading-relaxed">
                Queue coach actions from NHI Triage. They'll accumulate here across step navigation.
              </div>
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto p-3 space-y-3">
              {Object.entries(byMember).map(([memberId, actions]) => {
                const first = actions[0];
                return (
                  <div key={memberId} className="rounded-xl border border-slate-200 overflow-hidden">
                    {/* Member header */}
                    <div className="px-3 py-2 flex items-center gap-2" style={{ background: "#F8FAFC" }}>
                      <div className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-black text-white shrink-0"
                           style={{ background: first.memberTint }}>
                        {first.memberInitials}
                      </div>
                      <div className="text-[11px] font-black text-slate-900 truncate flex-1">{first.memberName}</div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{actions.length} action{actions.length === 1 ? "" : "s"}</span>
                    </div>
                    {/* Actions */}
                    <div className="divide-y divide-slate-100">
                      {actions.map(a => {
                        const isSent = sentIds.has(a.id);
                        const toneColor = a.tone === "danger" ? "#B91C1C" : a.tone === "primary" ? "#4F5FE5" : "#334155";
                        return (
                          <div key={a.id}
                               className={`px-3 py-2 flex items-center gap-2 transition ${isSent ? "opacity-40" : ""}`}>
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: toneColor }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-black text-slate-800 truncate">{a.actionLabel}</div>
                              <div className="text-[9px] text-slate-500 tabular-nums">{ago(a.queuedAt)}</div>
                            </div>
                            {isSent ? (
                              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Sent
                              </span>
                            ) : (
                              <>
                                <button onClick={() => markSent(a.id)}
                                        className="px-2 py-1 rounded text-[10px] font-black text-white"
                                        style={{ background: toneColor }}>
                                  Send
                                </button>
                                <button onClick={() => removeAction(a.id)}
                                        className="w-6 h-6 rounded grid place-items-center text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                        title="Remove">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer explainer */}
          {count > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[9px] text-slate-500 italic leading-snug">
              Actions persist across step navigation. Sending closes the loop with Fathom + logs a coach note.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ago(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return `${h}h ago`;
}
