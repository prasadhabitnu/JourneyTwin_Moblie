import { useState } from "react";
import {
  RING_PANEL, RING_BANDS, bandFor,
  type RingPanelRow, type RingBand, type RingFlag,
} from "../../../lib/coachData";
import { useCoachSelection } from "../../../contexts/CoachSelectionContext";

type Filter = "all" | "needs-physician" | "needs-coach" | "thriving" | "trending-down";

/**
 * NHI Triage — full ring panel sorted by Nu Health Index.
 * Row click: sets selected member + jumps to Patient Ring Drill step.
 * Actions button: expands an inline action tray per row.
 */
export default function NhiTriage() {
  const { setSelectedMemberId, queueAction, outbox } = useCoachSelection();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"nhi-asc" | "nhi-desc" | "delta">("nhi-asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [flashByMember, setFlashByMember] = useState<Record<string, string>>({});

  const filtered = RING_PANEL.filter(r =>
    filter === "all" ? true : r.flags.includes(filter as RingFlag)
  );
  const sorted = [...filtered].sort((a, b) =>
    sort === "nhi-desc" ? b.nhi - a.nhi :
    sort === "delta"    ? a.nhiDelta7d - b.nhiDelta7d :
                          a.nhi - b.nhi
  );

  const bandCounts: Record<RingBand, number> = { care: 0, recover: 0, watch: 0, steady: 0, excellent: 0 };
  RING_PANEL.forEach(r => bandCounts[r.band]++);

  function openDrill(id: string) {
    setSelectedMemberId(id);
    // Advance the coach page to the patient-ring-drill step
    window.dispatchEvent(new CustomEvent("coach:goto-step", { detail: { stepId: "patient-ring-drill" } }));
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  function handleQueue(row: RingPanelRow, actionLabel: string, tone: "primary" | "danger" | "default" = "default") {
    queueAction({
      memberId: row.id, memberName: row.name, memberInitials: row.initials, memberTint: row.tint,
      actionLabel, tone,
    });
    // Inline flash toast on the row (persists 2.5s; actual outbox item stays in top-nav outbox)
    setFlashByMember(prev => ({ ...prev, [row.id]: actionLabel }));
    setTimeout(() => {
      setFlashByMember(prev => {
        const next = { ...prev };
        if (next[row.id] === actionLabel) delete next[row.id];
        return next;
      });
    }, 2500);
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24">
      {/* Band summary strip */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {(["care", "recover", "watch", "steady", "excellent"] as RingBand[]).map(b => {
          const meta = RING_BANDS[b];
          const count = bandCounts[b];
          return (
            <div key={b} className="rounded-xl p-2.5 border" style={{ background: meta.tint + "55", borderColor: meta.tint }}>
              <div className="text-[8px] font-black uppercase tracking-widest" style={{ color: meta.fg }}>{meta.label}</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[22px] font-black leading-none tabular-nums" style={{ color: meta.fg }}>{count}</span>
                <span className="text-[9px] font-black text-slate-500">members</span>
              </div>
              <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                NHI {meta.min === 0 ? "< 4" : meta.min === 9 ? "≥ 9" : `${meta.min}-${meta.min + 1.5}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Filter</span>
        {([
          { v: "all",              label: "All",             color: "#334155" },
          { v: "needs-physician",  label: "Needs physician", color: "#B91C1C" },
          { v: "needs-coach",      label: "Needs coach",     color: "#F59E0B" },
          { v: "trending-down",    label: "Trending down",   color: "#C2410C" },
          { v: "thriving",         label: "Thriving",        color: "#059669" },
        ] as const).map(f => {
          const active = filter === f.v;
          return (
            <button key={f.v} onClick={() => setFilter(f.v as Filter)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition"
                    style={active
                      ? { background: f.color, color: "white" }
                      : { background: "white", color: f.color, border: `1px solid ${f.color}55` }}>
              {f.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Sort</span>
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
                  className="text-[11px] font-black text-slate-800 bg-white border border-slate-200 rounded-md px-2 py-1">
            <option value="nhi-asc">NHI (low → high)</option>
            <option value="nhi-desc">NHI (high → low)</option>
            <option value="delta">Delta 7d (worst first)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
        <span>Showing {sorted.length} of {RING_PANEL.length} members  ·  click any row to drill in</span>
        {outbox.length > 0 && (
          <span className="text-indigo-700">
            {outbox.length} queued action{outbox.length === 1 ? "" : "s"} · view in top-nav outbox
          </span>
        )}
      </div>

      {/* Patient list */}
      <div className="space-y-1.5">
        {sorted.map(r => {
          // How many outbox actions this member already has queued
          const memberOutboxCount = outbox.filter(a => a.memberId === r.id).length;
          return (
            <PatientRow key={r.id}
                        row={r}
                        expanded={expandedId === r.id}
                        queuedFlash={flashByMember[r.id]}
                        outboxCount={memberOutboxCount}
                        onOpenDrill={() => openDrill(r.id)}
                        onToggleExpand={() => toggleExpand(r.id)}
                        onQueueAction={(label, tone) => handleQueue(r, label, tone)} />
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
        <div className="text-[10px] text-slate-600 leading-snug">
          <span className="font-black text-slate-800">Nu Health Index</span> is a weighted composite of all 8 ring parameters
          (0-10 scale). Members in Care and Recover bands are auto-flagged for coach attention;
          Care with respiratory or febrile signature is auto-flagged for physician.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Patient row + inline action tray
// ============================================================================
function PatientRow({ row: r, expanded, queuedFlash, outboxCount, onOpenDrill, onToggleExpand, onQueueAction }: {
  row: RingPanelRow; expanded: boolean; queuedFlash?: string; outboxCount: number;
  onOpenDrill: () => void; onToggleExpand: () => void; onQueueAction: (label: string, tone?: "primary" | "danger" | "default") => void;
}) {
  const meta = RING_BANDS[bandFor(r.nhi)];

  // Actions available for this row based on flags + band
  const actions = buildActionsFor(r);

  return (
    <div className="rounded-2xl bg-white border shadow-sm overflow-hidden"
         style={{ borderColor: expanded ? meta.fg + "88" : "#E2E8F0" }}>
      {/* Main row — clickable */}
      <div className="p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition"
           onClick={onOpenDrill}>
        <div className="w-11 h-11 rounded-full grid place-items-center text-[12px] font-black text-white shrink-0 shadow-sm"
             style={{ background: r.tint }}>
          {r.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[12px] font-black text-slate-900 truncate">{r.name}</span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Wk {r.week}</span>
            {r.flags.map(f => <FlagChip key={f} flag={f} />)}
          </div>
          <div className="text-[10px] text-slate-600 leading-snug truncate">{r.headline}</div>
          {r.activePattern && (
            <div className="text-[8px] font-black font-mono text-slate-400 mt-0.5 truncate">pattern: {r.activePattern}</div>
          )}
        </div>
        <div className="text-right shrink-0 min-w-[60px]">
          <div className="text-[22px] font-black leading-none tabular-nums" style={{ color: meta.fg }}>{r.nhi.toFixed(1)}</div>
          <div className="text-[8px] font-black uppercase tracking-widest" style={{ color: meta.fg }}>{meta.label}</div>
          <div className="text-[9px] font-black tabular-nums mt-0.5"
               style={{ color: r.nhiDelta7d < 0 ? "#B91C1C" : r.nhiDelta7d > 0 ? "#059669" : "#94A3B8" }}>
            {r.nhiDelta7d > 0 ? "▲ +" : r.nhiDelta7d < 0 ? "▼ " : "▬ "}{r.nhiDelta7d !== 0 ? Math.abs(r.nhiDelta7d).toFixed(1) : "0.0"}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          className="w-8 h-8 rounded-lg grid place-items-center bg-slate-100 hover:bg-slate-200 shrink-0"
          title="Quick actions">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {expanded
              ? <polyline points="18 15 12 9 6 15" />
              : <><circle cx="12" cy="5" r="1.6" fill="#334155" /><circle cx="12" cy="12" r="1.6" fill="#334155" /><circle cx="12" cy="19" r="1.6" fill="#334155" /></>}
          </svg>
        </button>
      </div>

      {/* Queued-action toast (inline · disappears after 2.5s; item persists in outbox) */}
      {queuedFlash && (
        <div className="mx-3 mb-2 rounded-lg px-2.5 py-1.5 flex items-center gap-2"
             style={{ background: "#DCFCE7", border: "1px solid #86EFAC" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Queued</span>
          <span className="text-[11px] text-emerald-900 font-black flex-1">{queuedFlash}</span>
          <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">→ Outbox</span>
        </div>
      )}
      {/* Persistent per-row outbox indicator (shows even after flash clears) */}
      {!queuedFlash && outboxCount > 0 && (
        <div className="mx-3 mb-2 rounded-lg px-2.5 py-1 flex items-center gap-2"
             style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
          <div className="w-4 h-4 rounded-full grid place-items-center text-[8px] font-black text-white"
               style={{ background: "#4F5FE5" }}>{outboxCount}</div>
          <span className="text-[10px] font-black text-indigo-800">
            {outboxCount} action{outboxCount === 1 ? "" : "s"} queued for {r.name.split(" ")[0]}
          </span>
        </div>
      )}

      {/* Inline action tray */}
      {expanded && (
        <div className="border-t px-3 py-2.5 flex items-center gap-2 flex-wrap"
             style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
             onClick={e => e.stopPropagation()}>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Quick actions</span>
          {actions.map((a, i) => (
            <button key={i}
                    onClick={() => onQueueAction(a.label, a.tone)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-black transition"
                    style={a.tone === "danger"
                      ? { background: "white", color: "#B91C1C", border: "1px solid #FCA5A5" }
                      : a.tone === "primary"
                      ? { background: "#4F5FE5", color: "white", boxShadow: "0 2px 6px -2px rgba(79,95,229,0.4)" }
                      : { background: "white", color: "#4F5FE5", border: "1px solid #C7D2FE" }}>
              {a.label}
            </button>
          ))}
          <button onClick={onOpenDrill}
                  className="ml-auto px-2.5 py-1 rounded-lg text-[10px] font-black text-white flex items-center gap-1"
                  style={{ background: "linear-gradient(90deg,#0EA5A4,#0EA5E9)" }}>
            Open drill
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Per-row action building — depends on flags + band
// ============================================================================
interface ActionDef { label: string; tone?: "primary" | "danger" | "default"; }
function buildActionsFor(r: RingPanelRow): ActionDef[] {
  const acts: ActionDef[] = [];
  if (r.flags.includes("needs-physician")) {
    acts.push({ label: "Page physician", tone: "danger" });
    acts.push({ label: "Order urgent check-in" });
  } else if (r.flags.includes("needs-coach")) {
    acts.push({ label: "Send anchor prompt", tone: "primary" });
    acts.push({ label: "Book follow-up call" });
    acts.push({ label: "Send reassurance" });
  } else if (r.flags.includes("thriving")) {
    acts.push({ label: "Send celebration", tone: "primary" });
    acts.push({ label: "Share as success story" });
  } else if (r.flags.includes("trending-down")) {
    acts.push({ label: "Reinforce recipe", tone: "primary" });
    acts.push({ label: "Send anchor prompt" });
    acts.push({ label: "Book follow-up call" });
  } else {
    acts.push({ label: "Send check-in nudge", tone: "primary" });
    acts.push({ label: "Add to next broadcast" });
  }
  acts.push({ label: "Log note" });
  return acts;
}

function FlagChip({ flag }: { flag: RingFlag }) {
  const meta: Record<RingFlag, { label: string; color: string }> = {
    "needs-physician": { label: "MD",     color: "#B91C1C" },
    "needs-coach":     { label: "Coach",  color: "#F59E0B" },
    "thriving":        { label: "★",       color: "#059669" },
    "trending-down":   { label: "▼",       color: "#C2410C" },
    "recovering":      { label: "▲",       color: "#0F766E" },
  };
  const m = meta[flag];
  return (
    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest"
          style={{ background: m.color + "18", color: m.color, border: `1px solid ${m.color}55` }}>
      {m.label}
    </span>
  );
}
