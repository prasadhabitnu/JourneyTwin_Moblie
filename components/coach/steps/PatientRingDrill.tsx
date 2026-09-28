import Link from "next/link";
import {
  PARAMS, GOOD_SPANS, HEALTH_RECIPES,
  currentValue, severityAt, nuHealthIndexAt,
  type ParamDef,
} from "../../../lib/ringSimData";
import { RING_PANEL, RING_BANDS, bandFor, type RingPanelRow } from "../../../lib/coachData";
import { useCoachSelection } from "../../../contexts/CoachSelectionContext";

/**
 * PatientRingDrill — individual patient deep-dive for the coach.
 * When the selected member is Sally (default), renders full simulated ring data.
 * For other members, renders a representative moment using the ring stream
 * cursored to a band-appropriate hour + the row's actual NHI + narrative context.
 */
export default function PatientRingDrill() {
  const { selectedMemberId } = useCoachSelection();
  const member = RING_PANEL.find(m => m.id === selectedMemberId);
  const isSally = !member || member.id === "sally-r";
  // Cursor into the stream: choose an hour that matches the member's NHI band.
  const cursor =
    isSally                          ? 24 :     // Sally: her real morning
    member!.band === "care"          ? 55 :     // deep anomaly (all params drifted)
    member!.band === "recover"       ? 50 :     // still in the arc
    member!.band === "watch"         ? 42 :     // early drift
    member!.band === "steady"        ? 68 :     // recovery baseline
    /* excellent */                    10;      // early clean baseline

  const nhi = isSally
    ? nuHealthIndexAt(cursor)
    : { score: member!.nhi,
        label: RING_BANDS[member!.band].label,
        tint: RING_BANDS[member!.band].fg };

  // Build a small 30-day NHI mini history (real for Sally, synthetic for others)
  const nhi30 = isSally
    ? [8.6, 8.9, 9.1, 9.0, 9.2, 8.8, 9.0, 9.1, 8.9, 8.7,
       8.4, 8.6, 8.5, 8.3, 7.9, 6.8, 5.2, 5.8, 6.2, 6.9,
       7.4, 7.9, 8.1, 8.3, 8.5, 8.4, 8.5, 8.6, 8.3, nhi.score]
    : Array.from({ length: 30 }).map((_, i) => {
        // simple bounded random walk around member.nhi
        const jitter = Math.sin(i * 0.7 + selectedMemberId.length) * 0.6;
        return Math.max(0.5, Math.min(10, member!.nhi + jitter));
      });

  const identity = isSally
    ? { name: "Sally Reddy", initials: "SR", tint: "#7C6BFF", age: 52, week: 13, mrn: "MRN-A1F92" }
    : { name: member!.name, initials: member!.initials, tint: member!.tint, age: "—", week: member!.week, mrn: `MRN-${member!.id.toUpperCase()}` };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24 space-y-4">
      {/* Header — patient identity */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full grid place-items-center text-[16px] font-black text-white shrink-0 shadow"
             style={{ background: identity.tint }}>
          {identity.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Patient Ring Drill · Fathom pre-loaded {!isSally && "· representative moment"}
          </div>
          <div className="text-[18px] font-black text-slate-900 leading-tight">{identity.name}</div>
          <div className="text-[11px] text-slate-600">
            {isSally ? "Age 52 · Week 13" : `Week ${identity.week}`} · {identity.mrn} · Oura Gen 3 synced 2 min ago
          </div>
          {member && !isSally && (
            <div className="text-[10px] text-slate-500 leading-snug mt-0.5 italic">{member.headline}</div>
          )}
        </div>
        <Link href="/health-ring" className="text-[11px] font-black text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-50 whitespace-nowrap">
          Open ring view →
        </Link>
      </div>

      {/* Non-Sally banner */}
      {!isSally && (
        <div className="rounded-xl border-l-4 px-3 py-2" style={{ background: "#FEF3C7", borderColor: "#F59E0B" }}>
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-0.5">POC note</div>
          <div className="text-[11px] text-amber-900 leading-snug">
            Full 72-hour ring stream is simulated only for Sally in this POC. For {identity.name}, we show a
            representative moment from the shared stream at the hour matching their <span className="font-black">{member!.band}</span> band,
            plus their actual NHI trend + panel-derived context.
          </div>
        </div>
      )}

      {/* NHI hero + 30-day trend */}
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden" style={{ borderColor: nhi.tint + "55" }}>
        <div className="p-4 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: nhi.tint }}>Nu Health Index · now</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[52px] font-black leading-none tabular-nums" style={{ color: nhi.tint, fontFamily: "'Fraunces', serif" }}>
                {nhi.score.toFixed(1)}
              </span>
              <span className="text-[18px] font-black text-slate-400">/ 10</span>
            </div>
            <div className="mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-white shadow-sm" style={{ background: nhi.tint }}>{nhi.label}</span>
            </div>
            {member && !isSally && member.nhiDelta7d !== 0 && (
              <div className="text-[11px] font-black mt-1.5"
                   style={{ color: member.nhiDelta7d < 0 ? "#B91C1C" : "#059669" }}>
                {member.nhiDelta7d > 0 ? "▲ +" : "▼ "}{Math.abs(member.nhiDelta7d).toFixed(1)} · 7-day delta
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">NHI · 30-day trend</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 tabular-nums">
                min {Math.min(...nhi30).toFixed(1)} · max {Math.max(...nhi30).toFixed(1)}
              </div>
            </div>
            <TrendChart data={nhi30} color={nhi.tint} height={90} />
            <div className="text-[10px] text-slate-600 leading-snug mt-1.5">
              {isSally
                ? "Steady baseline > wk-13 URI dip (day 16) > recovery arc (days 17-24). Now back in Steady band."
                : `Trend held near ${member!.nhi.toFixed(1)} across the past month. Watch the ${member!.nhiDelta7d < 0 ? "recent drift" : member!.nhiDelta7d > 0 ? "recent lift" : "steady state"}.`}
            </div>
          </div>
        </div>
      </div>

      {/* 8 vitals grid */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
          {isSally ? "This morning · 8 ring parameters" : `Ring parameters · ${bandFor(member!.nhi)} band moment`}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PARAMS.map(p => <CoachVital key={p.id} def={p} cursor={cursor} />)}
        </div>
      </div>

      {/* Best times */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-2">
          {identity.name.split(" ")[0]}'s best times · past week
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {GOOD_SPANS.map(sp => (
            <div key={sp.id} className="rounded-2xl bg-white border border-emerald-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 flex items-center justify-between" style={{ background: "linear-gradient(90deg,#ECFDF5,#FFFFFF)" }}>
                <div className="min-w-0">
                  <div className="text-[8px] font-black uppercase tracking-widest text-emerald-700 truncate">{sp.dayLabel}</div>
                  <div className="text-[11px] font-black text-slate-900 truncate">{sp.timeLabel}</div>
                </div>
                <div className="text-[16px] font-black text-emerald-700 tabular-nums">{sp.scoreAvg.toFixed(1)}</div>
              </div>
              <div className="p-2.5">
                <ul className="space-y-1 mb-2">
                  {sp.activities.map((a, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-800 leading-snug">
                      <span className="text-emerald-500 leading-none pt-0.5">✓</span><span>{a}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-[9px] text-slate-500 italic leading-snug">{sp.vitalsBrief}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipes */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">
          Nu · {identity.name.split(" ")[0]}'s personal recipes
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {HEALTH_RECIPES.map(r => (
            <div key={r.id} className="rounded-2xl bg-white border p-3 shadow-sm" style={{ borderColor: "#FCD34D" }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-800">Recipe · {r.id.replace(/-/g, " ")}</div>
                <span className="text-[10px] font-black text-amber-900 tabular-nums px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300">
                  {r.reliability}%
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {r.ingredients.map((i, idx) => (
                  <span key={idx} className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>{i}</span>
                ))}
              </div>
              <div className="text-[10px] text-slate-700 leading-snug"><span className="font-black text-slate-900">Outcome:</span> {r.outcome}</div>
              <div className="text-[9px] italic text-slate-500 mt-1">Confirmed in {r.matchedSpans} past good spans.</div>
            </div>
          ))}
        </div>
      </div>

      {/* Coach action bar */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Coach actions · {identity.name.split(" ")[0]}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <ActionButton primary label="Reinforce winning recipe" />
          <ActionButton label="Send anchor prompt" />
          <ActionButton label="Book follow-up call" />
          <ActionButton label="Add to physician queue" tone="danger" />
          <ActionButton label="Log note" />
        </div>
        <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-200 p-2.5">
          <div className="text-[9px] font-black uppercase tracking-widest text-indigo-700 mb-0.5">Nu suggests</div>
          <div className="text-[11px] text-slate-800 leading-snug">
            {member && member.flags.includes("needs-physician")
              ? `Signals cross the physician threshold. Page ${identity.name}'s attending physician now and pre-book a follow-up call for tomorrow morning.`
              : member && member.flags.includes("needs-coach")
              ? `${identity.name.split(" ")[0]}'s pattern signals need a warm coach voice, not a template. A 3-minute call would land better than a nudge.`
              : member && member.flags.includes("thriving")
              ? `${identity.name.split(" ")[0]} is thriving — reinforce what's working publicly. Their winning recipe is worth sharing with the cohort as a success story.`
              : "Winning recipe is holding but slipped 2 nights this week. One-line reinforcement in the 8 PM open window would land well."}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================
function CoachVital({ def, cursor }: { def: ParamDef; cursor: number }) {
  const value = currentValue(def.id, cursor);
  const sev = severityAt(def.id, cursor);
  const meta = { normal: "#059669", watch: "#B45309", warning: "#C2410C", critical: "#B91C1C" }[sev];
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className="w-2 h-2 rounded-full" style={{ background: meta }} />
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{def.label}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[20px] font-black leading-none tabular-nums" style={{ color: sev === "normal" ? "#0F172A" : meta }}>
          {def.format(value)}
        </span>
        <span className="text-[9px] font-black text-slate-500">{def.unit}</span>
      </div>
    </div>
  );
}

function TrendChart({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) {
  const min = Math.min(...data, 5), max = Math.max(...data, 10);
  const w = 400, h = height;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / (max - min)) * (h - 8) - 4,
  }));
  const line = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `M0,${h} L${line} L${w},${h} Z`;
  const gradId = `trend-${color.replace("#", "")}`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y={h - ((9 - min) / (max - min)) * (h - 8) - 4} width={w}
            height={((9 - 7.5) / (max - min)) * (h - 8)} fill="#DCFCE7" opacity="0.5" />
      <path d={area} fill={`url(#${gradId})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionButton({ label, primary, tone }: { label: string; primary?: boolean; tone?: "danger" }) {
  const color = tone === "danger" ? "#B91C1C" : "#4F5FE5";
  return (
    <button className="px-3 py-1.5 rounded-lg text-[11px] font-black transition"
            style={primary
              ? { background: color, color: "white", boxShadow: `0 4px 12px -4px ${color}66` }
              : { background: "white", color, border: `1px solid ${color}55` }}>
      {label}
    </button>
  );
}
