import React, { useEffect, useState } from "react";
import type { Actor, MockupData, MockupKind, OrchReasoning, Scenario, Step } from "../../lib/scenariosData";

export { USE_CASES, SCENARIOS } from "../../lib/scenariosData";
export type { Scenario, UseCase, Step, MockupKind, MockupData, OrchReasoning } from "../../lib/scenariosData";

// ============================================================================
// Auto-derive an OrchReasoning from a fathom-detect step's data
// ============================================================================
function deriveReasoning(step: Step): OrchReasoning | null {
  if (step.orchReasoning) return step.orchReasoning;
  if (step.mockup !== "fathom-detect" || !step.data) return null;
  const d = step.data;
  if (d.orchSeverity == null && !d.orchContextTags && !d.orchChannel) return null;
  return {
    severity: d.orchSeverity != null ? `${d.orchSeverity} / 100 · ${d.orchSeverityBand ?? "-"}` : undefined,
    context:  d.orchContextTags ? d.orchContextTags.join(" · ") : undefined,
    pattern:  d.detectSignals?.find(s => /cohort|pattern|match|peers|hit/i.test(s.label))?.value,
    channel:  d.orchChannel ?? d.detectDecision,
    timing:   d.orchTiming,
  };
}

// ============================================================================
// OrchestrationReveal — collapsible "Why Fathom picked this action" under a step
// ============================================================================
function OrchestrationReveal({ reasoning, color }: { reasoning: OrchReasoning; color: string }) {
  const [open, setOpen] = useState(false);
  const rows: Array<[string, string | undefined]> = [
    ["Severity", reasoning.severity],
    ["Context",  reasoning.context],
    ["Pattern",  reasoning.pattern],
    ["Channel",  reasoning.channel],
    ["Timing",   reasoning.timing],
  ];
  const present = rows.filter(([_, v]) => v);
  if (present.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest transition"
        style={{ background: color + "12", color: color, border: `1px solid ${color}44` }}
      >
        <span>{open ? "▾" : "▸"}</span>
        <span>Why Fathom picked this action</span>
      </button>
      {open && (
        <div className="mt-1.5 rounded-lg border p-2 space-y-1"
             style={{ background: "#0F172A", borderColor: color }}
             onClick={(e) => e.stopPropagation()}>
          {present.map(([label, value]) => (
            <div key={label} className="flex items-start gap-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 w-14 shrink-0 pt-0.5">{label}</span>
              <span className="text-[10px] font-mono leading-snug flex-1" style={{ color: "#E2E8F0" }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Actor chip
// ============================================================================
const ACTOR_META: Record<Actor, { bg: string; border: string; fg: string }> = {
  Fathom:    { bg: "#EEF2FF", border: "#C7D2FE", fg: "#4338CA" },
  Sally:     { bg: "#FEF3F2", border: "#FECDD3", fg: "#BE185D" },
  Coach:     { bg: "#ECFDF5", border: "#A7F3D0", fg: "#065F46" },
  Physician: { bg: "#F0F9FF", border: "#BAE6FD", fg: "#075985" },
  Lilly:     { bg: "#FFF1F2", border: "#FDA4AF", fg: "#9F1239" },
};

function ActorChip({ actor }: { actor: Actor }) {
  const m = ACTOR_META[actor];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
      style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.fg }}
    >{actor}</span>
  );
}

// ============================================================================
// Phone frame + Lilly chrome
// ============================================================================
function PhoneFrame({ children, height = 580 }: { children: React.ReactNode; height?: number }) {
  return (
    <div style={{
      width: 260, height, borderRadius: 40, padding: 8, position: "relative",
      background: "linear-gradient(180deg, #1F1930 0%, #100D1E 100%)",
      boxShadow: "0 24px 60px -18px rgba(0,0,0,0.5), 0 0 0 2px #2E2846, inset 0 0 0 1px rgba(255,255,255,0.06)",
    }}>
      {/* Side buttons */}
      <div style={{ position: "absolute", left: -1.5, top: 88, width: 3, height: 30, borderRadius: 2, background: "#0A0812" }} />
      <div style={{ position: "absolute", left: -1.5, top: 130, width: 3, height: 46, borderRadius: 2, background: "#0A0812" }} />
      <div style={{ position: "absolute", left: -1.5, top: 186, width: 3, height: 46, borderRadius: 2, background: "#0A0812" }} />
      <div style={{ position: "absolute", right: -1.5, top: 130, width: 3, height: 70, borderRadius: 2, background: "#0A0812" }} />
      <div style={{
        width: "100%", height: "100%", borderRadius: 32, overflow: "hidden",
        background: "#FFFFFF", position: "relative",
      }}>
        {/* Dynamic island */}
        <div style={{
          position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
          width: 82, height: 22, borderRadius: 14, background: "#000", zIndex: 20,
          boxShadow: "inset 0 0 0 1px #1A1A1A",
        }}>
          <div style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            width: 6, height: 6, borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #333, #000)",
          }} />
        </div>
        {children}
      </div>
    </div>
  );
}

// iOS-style status bar (time + signal + wifi + battery)
function StatusBar({ time = "9:41", light = false }: { time?: string; light?: boolean }) {
  const fg = light ? "#FFFFFF" : "#0F172A";
  return (
    <div className="pt-3 pb-1 px-5 flex items-center justify-between text-[11px] tabular-nums"
         style={{ color: fg, fontWeight: 800, fontFamily: "'SF Pro Display', 'Plus Jakarta Sans', system-ui" }}>
      <span>{time}</span>
      <div className="flex items-center gap-1">
        {/* Signal bars */}
        <svg width="14" height="9" viewBox="0 0 14 9" fill={fg}>
          <rect x="0" y="6"   width="2" height="3" rx="0.4" opacity="0.95" />
          <rect x="3" y="4.5" width="2" height="4.5" rx="0.4" opacity="0.95" />
          <rect x="6" y="3"   width="2" height="6" rx="0.4" opacity="0.95" />
          <rect x="9" y="1.5" width="2" height="7.5" rx="0.4" opacity="0.95" />
        </svg>
        {/* WiFi */}
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" stroke={fg} strokeWidth="1.3" strokeLinecap="round">
          <path d="M1 3.5C2.5 2 4.2 1.2 6 1.2s3.5.8 5 2.3" />
          <path d="M2.5 5.3C3.5 4.4 4.7 3.9 6 3.9s2.5.5 3.5 1.4" />
          <path d="M4.3 7C4.8 6.6 5.4 6.4 6 6.4s1.2.2 1.7.6" />
          <circle cx="6" cy="8" r="0.7" fill={fg} stroke="none" />
        </svg>
        {/* Battery */}
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
          <rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke={fg} strokeWidth="0.8" opacity="0.7" />
          <rect x="19.5" y="3" width="1.5" height="4" rx="0.5" fill={fg} opacity="0.7" />
          <rect x="2" y="2" width="14" height="6" rx="1" fill={fg} />
        </svg>
      </div>
    </div>
  );
}

function LillyChrome({
  children, activeTab = "home", showInsightDot = false, greeting, showHeader = true,
}: {
  children: React.ReactNode; activeTab?: "home" | "insights" | "logbook";
  showInsightDot?: boolean; greeting?: string; showHeader?: boolean;
}) {
  return (
    <div className="w-full h-full flex flex-col bg-white">
      <StatusBar />
      {showHeader && (
        <div className="px-4 pt-3 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full grid place-items-center text-[11px] font-black text-white shrink-0"
                 style={{
                   background: "linear-gradient(135deg, #E63946 0%, #F87171 100%)",
                   boxShadow: "0 2px 8px -2px rgba(230,57,70,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                 }}>
              SR
            </div>
            <div className="min-w-0">
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">{greeting ?? "Good morning"}</div>
              <div className="flex items-baseline gap-1 leading-tight">
                <span className="text-[15px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif" }}>Lilly</span>
                <span className="text-[12px] font-black text-slate-800">Health</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
              <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto" style={{ background: "linear-gradient(180deg,#FCFCFD 0%,#F8FAFC 100%)" }}>
        {children}
      </div>
      <div className="border-t border-slate-100 pt-2 pb-3 px-2 flex items-center justify-around bg-white">
        <TabItem kind="home"     label="Home"     active={activeTab === "home"} />
        <TabItem kind="logbook"  label="Logbook"  active={activeTab === "logbook"} />
        <TabItem kind="insights" label="Insights" active={activeTab === "insights"} dot={showInsightDot} />
        <TabItem kind="tools"    label="Tools"    active={false} />
        <TabItem kind="more"     label="More"     active={false} />
      </div>
    </div>
  );
}

function TabItem({ kind, label, active, dot = false }: { kind: string; label: string; active: boolean; dot?: boolean }) {
  const color = active ? "#4F5FE5" : "#94A3B8";
  return (
    <div className="flex flex-col items-center gap-0.5 relative w-11">
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {kind === "home"     && <><path d="M3 12l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z" fill={active ? color : "none"} /></>}
        {kind === "logbook"  && <><rect x="4" y="3" width="16" height="18" rx="2" fill={active ? color : "none"} /><path d="M8 8h8M8 12h8M8 16h5" stroke={active ? "white" : color} /></>}
        {kind === "insights" && <><path d="M12 2l2.5 6.5H22l-6 4.5 2.5 7L12 15.5 5.5 20 8 13 2 8.5h7.5z" fill={active ? color : "none"} /></>}
        {kind === "tools"    && <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a6 6 0 0 1-8 8L6.3 20.7a2.4 2.4 0 0 1-3.4-3.4l9.4-9.4a6 6 0 0 1 8-8z" fill={active ? color : "none"} /></>}
        {kind === "more"     && <><circle cx="5"  cy="12" r="1.6" fill={color} stroke="none" /><circle cx="12" cy="12" r="1.6" fill={color} stroke="none" /><circle cx="19" cy="12" r="1.6" fill={color} stroke="none" /></>}
      </svg>
      <span className="text-[8px] font-black" style={{ color }}>{label}</span>
      {dot && <span className="absolute top-0 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />}
    </div>
  );
}

// ============================================================================
// Small utilities
// ============================================================================
function MiniSpark({ color, data, height = 32 }: { color: string; data: number[]; height?: number }) {
  const min = Math.min(...data), max = Math.max(...data);
  const w = 220, h = height;
  const pts = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * w;
    const y = h - ((v - min) / Math.max(1, max - min)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / Math.max(1, data.length - 1)) * w;
        const y = h - ((v - min) / Math.max(1, max - min)) * h;
        return <circle key={i} cx={x} cy={y} r="1.6" fill={color} />;
      })}
    </svg>
  );
}

function toneColor(tone?: string): string {
  switch (tone) {
    case "up-good":
    case "down-good":  return "#059669";
    case "up-bad":
    case "down-bad":   return "#B91C1C";
    default:           return "#64748B";
  }
}

/** Numbers-first drill panel — big numbers, tap to reveal chart. */
function NumbersFirst({ data, color }: { data: MockupData; color: string }) {
  const [showChart, setShowChart] = useState(false);
  const nums = data.drillNumbers ?? [];
  const chartColor = data.drillChartColor ?? color;
  return (
    <div>
      {data.drillHeadline && (
        <div className="text-[10px] text-slate-700 leading-snug mb-2">{data.drillHeadline}</div>
      )}
      {nums.length > 0 && (
        <div className={`grid gap-1 mb-1.5 ${nums.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {nums.map((n, i) => (
            <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 px-1.5 py-1.5">
              <div className="text-[7px] font-black uppercase tracking-widest text-slate-500 leading-tight truncate">{n.label}</div>
              <div className="text-[15px] font-black text-slate-900 leading-none mt-0.5 tabular-nums">{n.value}</div>
              {n.delta && (
                <div className="text-[8px] font-black leading-tight mt-0.5" style={{ color: toneColor(n.tone) }}>{n.delta}</div>
              )}
            </div>
          ))}
        </div>
      )}
      {data.drillChartData && (
        <>
          <button
            onClick={() => setShowChart(s => !s)}
            className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <span>{showChart ? "▾" : "▸"}</span>
            <span>{showChart ? "Hide chart" : "See chart"}</span>
          </button>
          {showChart && (
            <div className="mt-1 rounded-lg bg-white border border-slate-200 p-2">
              <MiniSpark color={chartColor} data={data.drillChartData} />
              {data.drillChartLabel && (
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">{data.drillChartLabel}</div>
              )}
            </div>
          )}
        </>
      )}
      {data.drillSuggestion && (
        <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-2 py-1.5">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Nu suggests</div>
          <div className="text-[10px] font-black text-slate-800">{data.drillSuggestion}</div>
        </div>
      )}
      {data.drillActions && data.drillActions.length > 0 && (
        <div className="mt-2 flex gap-1.5">
          {data.drillActions.map((a, i) => (
            <button
              key={i}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black ${
                a.primary ? "text-white shadow-sm" : "text-slate-700 border border-slate-200"
              }`}
              style={a.primary ? { background: color } : undefined}
            >{a.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Numbers-first version of pattern-detected: patterns show as headline + big value + tap-to-chart. */
function PatternNumbersFirst({ patterns }: { patterns: NonNullable<MockupData["patterns"]> }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="space-y-1.5">
      {patterns.map((p, i) => (
        <div key={i} className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <div className="text-[7px] font-black uppercase tracking-widest text-teal-300">{p.label}</div>
            <button
              onClick={() => setOpenIdx(o => o === i ? null : i)}
              className="ml-auto text-[8px] font-black uppercase tracking-widest text-white/70 hover:text-white"
            >{openIdx === i ? "▾ Chart" : "▸ Chart"}</button>
          </div>
          <div className="text-[10px] font-black text-white leading-snug">{p.headline}</div>
          {openIdx === i && (
            <div className="mt-1"><MiniSpark color={p.color} data={p.data} height={26} /></div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Reusable UI blocks used by multiple mockups
// ============================================================================
function LillyStandardHome({ slim = false }: { slim?: boolean }) {
  return (
    <div className="px-3 pt-3">
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Monday, July 28 · Week 13 of 26</div>
      <div className="text-[16px] font-black text-slate-900 mb-2.5 leading-tight"
           style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
        Your week so far
      </div>

      {/* Mini-stats strip */}
      <div className="grid grid-cols-3 gap-1.5 mb-2.5">
        <MiniStat label="TIR"    value="87" unit="%"  tone="up" delta="+4" />
        <MiniStat label="Weight" value="-7" unit="lb" tone="up" delta="14d" />
        <MiniStat label="Doses"  value="12" unit="/14" tone="neutral" delta="on time" />
      </div>

      {/* Next-dose hero card */}
      <div className="rounded-2xl overflow-hidden shadow-sm mb-2" style={{ border: "1px solid #FEE2E2" }}>
        <div className="px-3 py-2.5" style={{
          background: "linear-gradient(135deg,#E63946 0%,#F87171 60%,#FCA5A5 100%)",
        }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[8px] font-black uppercase tracking-widest text-white/85">Next dose · in 6 days</div>
              <div className="text-[14px] font-black text-white leading-tight">Semaglutide 1mg</div>
              <div className="text-[10px] text-white/90">Sunday · 10:00 AM</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur grid place-items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="8" rx="4" />
                <path d="M12 8v8" />
              </svg>
            </div>
          </div>
        </div>
        <div className="px-2.5 py-1.5 bg-white flex items-center gap-1.5">
          <button className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black text-white shadow-sm" style={{ background: "#E63946" }}>Log dose</button>
          <button className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black text-slate-700 border border-slate-200">Snooze</button>
        </div>
      </div>

      {/* This week — coaching card */}
      {!slim && (
        <div className="rounded-2xl border border-slate-200 shadow-sm bg-white p-2.5 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl grid place-items-center shrink-0" style={{ background: "linear-gradient(135deg,#DCFCE7,#BBF7D0)", border: "1px solid #86EFAC" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3l2 5-2 1.5a11 11 0 0 0 6.5 6.5L15 13l5 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">This week</div>
              <div className="text-[11px] font-black text-slate-900 truncate leading-tight">Coaching call · Maya</div>
              <div className="text-[10px] text-slate-500 truncate">Wednesday · 3:00 PM</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      )}

      {/* Recent activity feed */}
      {!slim && (
        <div className="mb-2">
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 px-1">Recent</div>
          <div className="rounded-2xl border border-slate-200 shadow-sm bg-white divide-y divide-slate-100">
            <ActivityRow color="#10B981" label="Breakfast logged" time="7:12 AM" iconKind="check" />
            <ActivityRow color="#0EA5A4" label="22-min walk"      time="Yesterday · 7:14 PM" iconKind="walk" />
            <ActivityRow color="#4F5FE5" label="Dose taken"       time="Thursday" iconKind="check" />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, unit, tone, delta }: {
  label: string; value: string; unit?: string; tone: "up" | "down" | "neutral"; delta?: string;
}) {
  const dc = tone === "up" ? "#059669" : tone === "down" ? "#B91C1C" : "#64748B";
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-2 shadow-sm">
      <div className="text-[7px] font-black uppercase tracking-widest text-slate-400 truncate">{label}</div>
      <div className="flex items-baseline gap-0.5 mt-0.5">
        <span className="text-[15px] font-black text-slate-900 tabular-nums leading-none">{value}</span>
        {unit && <span className="text-[9px] font-black text-slate-500">{unit}</span>}
      </div>
      {delta && (
        <div className="text-[7px] font-black leading-tight mt-0.5" style={{ color: dc }}>
          {tone === "up" ? "▲ " : tone === "down" ? "▼ " : ""}{delta}
        </div>
      )}
    </div>
  );
}

function ActivityRow({ color, label, time, iconKind }: { color: string; label: string; time: string; iconKind: "check" | "walk" }) {
  return (
    <div className="px-2.5 py-1.5 flex items-center gap-2">
      <div className="w-6 h-6 rounded-full grid place-items-center shrink-0" style={{ background: color + "18" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {iconKind === "check" && <polyline points="20 6 9 17 4 12" />}
          {iconKind === "walk"  && <><circle cx="13" cy="4" r="2" /><path d="M4 22l5-9 3 2 2-4 3 7 4-3" /></>}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black text-slate-800 truncate leading-tight">{label}</div>
        <div className="text-[9px] text-slate-500 truncate">{time}</div>
      </div>
    </div>
  );
}

function FathomCardMini({ color, title, body }: { color: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="px-3 py-1.5" style={{ background: color }}>
        <div className="text-[8px] font-black uppercase tracking-widest text-white/85">Fathom noticed</div>
      </div>
      <div className="px-3 py-2 bg-white">
        <div className="text-[10px] font-black text-slate-900 leading-snug">{title}</div>
        <div className="text-[9px] text-slate-600 leading-snug mt-0.5">{body}</div>
        <div className="mt-1.5 flex gap-1">
          <button className="px-2 py-0.5 rounded-full text-[9px] font-black text-white" style={{ background: color }}>See how</button>
          <button className="px-2 py-0.5 rounded-full text-[9px] font-black text-slate-600 border border-slate-200">Later</button>
        </div>
      </div>
    </div>
  );
}

function SignalRow({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-white/5 border border-white/10 px-2 py-1">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      <span className={`text-[10px] font-black ${alert ? "text-rose-300" : "text-white"}`}>{value}</span>
    </div>
  );
}

function QueueRow({ name, reason, rank }: { name: string; reason: string; rank: number }) {
  return (
    <div className="rounded-lg bg-white border border-slate-200 px-2 py-1.5 mb-1 flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-slate-100 grid place-items-center text-[9px] font-black text-slate-600">#{rank}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black text-slate-900 truncate">{name}</div>
        <div className="text-[9px] text-slate-500 truncate">{reason}</div>
      </div>
    </div>
  );
}

// NuMascot — tiny warm blob glyph, used as the "Nu speaks" indicator
function NuMascot({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <radialGradient id="nu-grad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#nu-grad)" />
      <circle cx="9" cy="10" r="1.4" fill="#1E1B4B" />
      <circle cx="15" cy="10" r="1.4" fill="#1E1B4B" />
      <path d="M9 15c1 1 5 1 6 0" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="9.4" cy="9.4" r="0.4" fill="white" />
      <circle cx="15.4" cy="9.4" r="0.4" fill="white" />
    </svg>
  );
}

function MomentumRing({ score, color }: { score: number; color: string }) {
  const size = 116, r = 46, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const arcSpan = 0.78;                          // 78% of the circle used for the gauge
  const trackDash = circ * arcSpan;
  const fillDash  = (score / 100) * trackDash;
  const gradId = `mom-${color.replace("#", "")}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EDE9FE" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${trackDash} ${circ}`}
              transform={`rotate(${90 + (1 - arcSpan) * 180} ${cx} ${cy})`} />
      {/* Fill */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${fillDash} ${circ}`}
              transform={`rotate(${90 + (1 - arcSpan) * 180} ${cx} ${cy})`}
              style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.22, 1, 0.36, 1)" }} />
      {/* Number + label inside */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="30" fontWeight="800" fill="#1E1B4B" style={{ fontFamily: "'Plus Jakarta Sans'" }}>
        {score}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="7" fontWeight="800" fill="#64748B" letterSpacing="1.5">
        / 100
      </text>
    </svg>
  );
}

// HabitLadder — the 4-stage ladder card (Trying → Sticky → Stable → Automatic)
function HabitLadderCard({ data, color }: { data: MockupData; color: string }) {
  const STAGES = ["trying", "sticky", "stable", "automatic"] as const;
  const currentIdx = STAGES.indexOf(data.habitStage ?? "trying");
  const done = data.habitDaysDone ?? 0;
  const window = data.habitDaysWindow ?? 14;
  const pct = Math.min(100, Math.round((done / window) * 100));
  return (
    <div className="rounded-2xl border shadow-sm mb-2 overflow-hidden"
         style={{ background: "linear-gradient(180deg,#F0FDFA,#FFFFFF)", borderColor: color + "33" }}>
      <div className="px-3 pt-2.5 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg grid place-items-center" style={{ background: color + "18", border: `1px solid ${color}44` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 4v6l4 2M20 8L4 20M8 12l4 4" />
              </svg>
            </div>
            <div>
              <div className="text-[8px] font-black uppercase tracking-widest" style={{ color }}>Habit Ladder</div>
              <div className="text-[12px] font-black text-slate-900 leading-tight">{data.habitName ?? "New habit"}</div>
            </div>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: color + "18", color }}>
            {data.habitStage?.toUpperCase() ?? "TRYING"}
          </span>
        </div>

        {/* Days progress */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
          </div>
          <span className="text-[9px] font-black tabular-nums text-slate-700">{done}/{window}</span>
        </div>

        {/* Anchor line */}
        {data.habitAnchor && (
          <div className="text-[9px] text-slate-600 leading-snug">
            <span className="font-black text-slate-800">Anchor:</span> {data.habitAnchor}
          </div>
        )}

        {/* Stage ladder */}
        <div className="grid grid-cols-4 gap-1 mt-2">
          {STAGES.map((s, i) => {
            const active = i === currentIdx;
            const past   = i < currentIdx;
            return (
              <div key={s} className="text-center">
                <div className="h-1 rounded-full mb-0.5" style={{ background: active || past ? color : "#E2E8F0", opacity: past ? 0.5 : 1 }} />
                <div className={`text-[7px] font-black uppercase tracking-widest ${active ? "" : past ? "text-slate-500" : "text-slate-400"}`}
                     style={active ? { color } : undefined}>
                  {s}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 7-day dots row for the Momentum card
function WeekDots({ color }: { color: string }) {
  const day = ["M","T","W","T","F","S","S"];
  const tone: Array<"empty" | "med" | "good"> = ["good","med","good","empty","good","good","good"];
  return (
    <div className="flex items-center justify-between px-1 mt-2">
      {day.map((d, i) => {
        const t = tone[i];
        const bg = t === "good" ? color : t === "med" ? color + "55" : "#E2E8F0";
        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div className="w-2 h-2 rounded-full" style={{ background: bg }} />
            <span className="text-[7px] font-black text-slate-400">{d}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Backend / brain visuals
// ============================================================================
function FathomBrainCard({ color, data }: { color: string; data: MockupData }) {
  const signals = data.detectSignals ?? [];
  const darkTint = data.detectTint ?? "#0F172A";
  const bandColor: Record<string, string> = {
    "LOW": "#10B981", "MEDIUM": "#F59E0B", "MEDIUM-HIGH": "#F97316", "HIGH": "#EF4444",
  };
  const sev = data.orchSeverity ?? 0;
  const band = data.orchSeverityBand ?? "LOW";
  const sevColor = bandColor[band] ?? "#64748B";

  return (
    <div style={{
      width: 260, height: 520, borderRadius: 24, overflow: "hidden",
      boxShadow: "0 20px 50px -12px rgba(0,0,0,0.4)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top HALF — Lilly data received (light) */}
      <div style={{ background: "linear-gradient(180deg,#FFF1F2 0%,#FEF2F2 100%)", padding: 12, borderBottom: "2px dashed #FCA5A5", flex: "0 0 auto" }}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', serif" }}>Lilly</span>
          <span className="text-[8px] font-black text-slate-800">Health</span>
          <span className="ml-auto text-[7px] font-black uppercase tracking-widest text-rose-700">Data received</span>
        </div>
        <div className="space-y-1">
          {signals.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-md bg-white/70 border border-white px-1.5 py-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{s.label}</span>
              <span className={`text-[9px] font-black tabular-nums ${s.alert ? "text-rose-700" : "text-slate-800"}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Boundary arrow */}
      <div className="flex items-center justify-center py-1 relative" style={{ background: "#FEF2F2" }}>
        <div className="w-full h-px" style={{ background: "linear-gradient(90deg,transparent,#FCA5A5,transparent)" }} />
        <div className="absolute px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest text-white shadow-sm"
             style={{ background: color }}>↓ Fathom orchestrates</div>
      </div>

      {/* Bottom HALF — Fathom orchestration (dark) */}
      <div style={{ background: `linear-gradient(160deg,${darkTint} 0%,#1E1B4B 100%)`, padding: 12, color: "white", flex: 1, overflow: "auto" }}>
        <div className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-2">Fathom orchestration plane</div>

        {/* Severity meter */}
        {data.orchSeverity != null && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Severity</span>
              <span className="text-[9px] font-black tabular-nums" style={{ color: sevColor }}>{sev} / 100 · {band}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${sev}%`, background: sevColor }} />
            </div>
          </div>
        )}

        {/* Context tags */}
        {data.orchContextTags && (
          <div className="mb-2">
            <div className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1">Context</div>
            <div className="flex flex-wrap gap-1">
              {data.orchContextTags.map((t, i) => (
                <span key={i} className="text-[8px] font-black px-1.5 py-0.5 rounded-md font-mono bg-white/10 text-emerald-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Decision / Channel / Timing */}
        <div className="space-y-1 mt-2">
          {data.detectDecision && (
            <div className="rounded bg-white/10 border border-white/10 px-1.5 py-1">
              <div className="text-[7px] font-black uppercase tracking-widest text-slate-400">Decision</div>
              <div className="text-[9px] font-black leading-tight">{data.detectDecision}</div>
            </div>
          )}
          {data.orchChannel && (
            <div className="rounded bg-white/10 border border-white/10 px-1.5 py-1">
              <div className="text-[7px] font-black uppercase tracking-widest text-slate-400">Channel</div>
              <div className="text-[9px] font-black leading-tight">{data.orchChannel}</div>
            </div>
          )}
          {data.orchTiming && (
            <div className="rounded bg-white/10 border border-white/10 px-1.5 py-1">
              <div className="text-[7px] font-black uppercase tracking-widest text-slate-400">Timing</div>
              <div className="text-[9px] font-black leading-tight">{data.orchTiming}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FathomDraftCard({ color, data }: { color: string; data: MockupData }) {
  return (
    <div style={{
      width: 260, height: 520, borderRadius: 24, padding: 16,
      background: "linear-gradient(160deg,#0F172A 0%,#312E81 100%)",
      boxShadow: "0 20px 50px -12px rgba(0,0,0,0.4)", color: "white",
    }}>
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Fathom · drafting</div>
      <div className="text-[13px] font-black leading-tight mb-3">Compose Lilly-approved nudge</div>
      {data.draftTemplate && (
        <div className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 mb-2">
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-0.5">Template</div>
          <div className="text-[10px] font-black break-words">{data.draftTemplate}</div>
        </div>
      )}
      {data.draftPersonalization && (
        <div className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 mb-2">
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-0.5">Personalization</div>
          <div className="text-[10px] flex flex-wrap gap-x-1">
            {data.draftPersonalization.map((p, i) => (
              <span key={i} className="text-emerald-300 font-black">{p}{i < data.draftPersonalization!.length - 1 ? " · " : ""}</span>
            ))}
          </div>
        </div>
      )}
      {data.draftSendWindow && (
        <div className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5 mb-2">
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-0.5">Send window</div>
          <div className="text-[10px] font-black">{data.draftSendWindow}</div>
        </div>
      )}
      {data.draftPreviewTitle && (
        <div className="rounded-lg px-3 py-2" style={{ background: color }}>
          <div className="text-[8px] font-black uppercase tracking-widest text-white/85 mb-0.5">Preview</div>
          <div className="text-[10px] font-black leading-snug">{data.draftPreviewTitle}</div>
          {data.draftPreviewBody && <div className="text-[9px] leading-snug mt-0.5">{data.draftPreviewBody}</div>}
        </div>
      )}
    </div>
  );
}

function PatternDetectedCard({ color, data }: { color: string; data: MockupData }) {
  return (
    <div style={{
      width: 260, height: 520, borderRadius: 24, padding: 16,
      background: "linear-gradient(160deg,#042F2E 0%,#134E4A 100%)",
      boxShadow: "0 20px 50px -12px rgba(0,0,0,0.4)", color: "white",
    }}>
      <div className="text-[9px] font-black uppercase tracking-widest text-teal-300 mb-1">{data.patternKicker ?? "Fathom · overnight sweep"}</div>
      <div className="text-[13px] font-black leading-tight mb-3">{data.patternTitle ?? "Patterns crossed threshold"}</div>
      {data.patterns && <PatternNumbersFirst patterns={data.patterns} />}
      {data.patternDecision && (
        <div className="mt-3 rounded-lg px-2 py-1.5" style={{ background: color }}>
          <div className="text-[8px] font-black uppercase tracking-widest text-white/85 mb-0.5">Decision</div>
          <div className="text-[10px] font-black">{data.patternDecision}</div>
        </div>
      )}
    </div>
  );
}

function CoachConsole({ color, data }: { color: string; data: MockupData }) {
  return (
    <div style={{
      width: 320, height: 520, borderRadius: 20, padding: 14,
      background: "linear-gradient(180deg,#F8FAFC 0%,#EEF2FF 100%)",
      boxShadow: "0 20px 50px -12px rgba(0,0,0,0.25)",
      border: "1px solid #E2E8F0",
    }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lilly Insights Console</div>
        <div className="text-[9px] font-black text-slate-400">Maya · today</div>
      </div>
      <div className="text-[13px] font-black text-slate-900 mb-2">Priority queue · 24 members</div>

      <div className="rounded-xl border-2 bg-white shadow-sm p-3 mb-2"
           style={{ borderColor: color, boxShadow: `0 0 0 3px ${color}22` }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-black text-white" style={{ background: color }}>
            {data.consoleFocusInits ?? "SR"}
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-900">{data.consoleFocusName ?? "Sally Reddy"}</div>
            <div className="text-[9px] text-slate-500">{data.consoleFocusMeta ?? "GLP-1 · Wk 13"}</div>
          </div>
          <span className="ml-auto px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 border border-rose-200">#1</span>
        </div>
        {data.consoleFocusReason && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-2 py-1 mb-1.5">
            <div className="text-[8px] font-black uppercase tracking-widest text-rose-700 mb-0.5">Reason</div>
            <div className="text-[10px] font-black text-rose-900">{data.consoleFocusReason}</div>
          </div>
        )}
        {data.consoleFocusDetail && (
          <div className="text-[9px] text-slate-600 leading-snug">{data.consoleFocusDetail}</div>
        )}
        <button className="mt-1.5 w-full px-2 py-1 rounded-lg text-[10px] font-black text-white shadow-sm" style={{ background: color }}>
          {data.consoleCTA ?? "Call Sally"}
        </button>
      </div>

      <QueueRow name="Diane W." reason="TIR dropped to 68%" rank={2} />
      <QueueRow name="Amit K."  reason="Skipped 2 dose logs" rank={3} />
      <QueueRow name="Priya M." reason="Weight plateau · 3 wks" rank={4} />
      <QueueRow name="John C."  reason="Sleep pattern shift" rank={5} />
    </div>
  );
}

function CompanionView({ color, data }: { color: string; data: MockupData }) {
  const cards = data.companionCards ?? [];
  const momentum = data.companionMomentum ?? 78;
  return (
    <div className="px-3 pt-2 pb-3">
      {/* Section title */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div>
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">Insights · powered by Fathom</div>
          <div className="text-[15px] font-black text-slate-900 leading-tight"
               style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
            Today's story
          </div>
        </div>
        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 tabular-nums">Wk 13</div>
      </div>

      {/* Habit Ladder hero (only when habit data is present) */}
      {data.habitStage && <HabitLadderCard data={data} color={color} />}

      {/* Momentum hero */}
      <div className="rounded-2xl border shadow-sm mb-2 overflow-hidden"
           style={{ background: "linear-gradient(180deg,#F5F3FF,#FFFFFF)", borderColor: color + "33" }}>
        <div className="px-3 pt-2.5 pb-2 flex items-start gap-3">
          <MomentumRing score={momentum} color={color} />
          <div className="flex-1 min-w-0 pt-1">
            <div className="text-[8px] font-black uppercase tracking-widest" style={{ color }}>Momentum</div>
            <div className="text-[15px] font-black text-slate-900 leading-tight">{data.companionMomentumLabel ?? "Strong"}</div>
            <div className="text-[9px] text-slate-500 leading-snug mt-0.5">{data.companionMomentumDelta ?? "+4 vs last week"}</div>
            <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                 style={{ background: color + "18", border: `1px solid ${color}44` }}>
              <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: color }} />
              <span className="text-[8px] font-black uppercase tracking-widest" style={{ color }}>Live · synced 2 min ago</span>
            </div>
          </div>
        </div>
        <div className="px-3 pb-2">
          <WeekDots color={color} />
        </div>
      </div>

      {/* Nu daily prompt */}
      <div className="rounded-2xl bg-white border border-amber-200 p-2.5 mb-2 flex items-start gap-2 shadow-sm">
        <div className="shrink-0"><NuMascot size={26} /></div>
        <div className="flex-1 min-w-0">
          <div className="text-[8px] font-black uppercase tracking-widest text-amber-700">Nu · today</div>
          <div className="text-[10px] font-black text-slate-800 leading-snug">
            {cards[0]?.title ?? "Your habits are still on track. One small tweak tonight, and tomorrow tells a different story."}
          </div>
        </div>
      </div>

      {/* Pinned Ask Maya card */}
      <div className="rounded-2xl overflow-hidden mb-2 shadow-sm" style={{ background: "linear-gradient(90deg," + color + ",#4F5FE5)", border: `1px solid ${color}` }}>
        <div className="px-2.5 py-2 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full grid place-items-center text-[11px] font-black text-white shrink-0"
               style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.4)" }}>
            M
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-black text-white leading-tight truncate">Maya · your coach</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            </div>
            <div className="text-[9px] text-white/85 truncate leading-tight">Online · typical reply 4 min</div>
          </div>
          <button className="px-2.5 py-1.5 rounded-lg text-[10px] font-black text-slate-900 bg-white shadow-sm shrink-0">
            {data.companionCTA ?? "Message"}
          </button>
        </div>
      </div>

      {/* Fathom insights feed */}
      <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 px-1">Fathom noticed today</div>
      <div className="space-y-1.5">
        {cards.map((c, i) => <RichFathomCard key={i} color={color} title={c.title} body={c.body} index={i} />)}
      </div>

      {/* Sync footer */}
      <div className="mt-2 text-center text-[8px] font-black uppercase tracking-widest text-slate-400">
        Last synced with Lilly · 2 min ago
      </div>
    </div>
  );
}

// ============================================================================
// CompanionDrillSheet — the L4 drill: bottom-sheet with hero + always-on chart
// ============================================================================
function CompanionDrillSheet({ data, color }: { data: MockupData; color: string }) {
  const heroNum = data.drillNumbers?.[0];
  const supportingNums = (data.drillNumbers ?? []).slice(1);
  return (
    <div className="w-full h-full flex flex-col" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)" }}>
      {/* Faded backdrop that hints at Insights tab behind the sheet */}
      <div className="absolute inset-0 bg-slate-100 opacity-40 pointer-events-none" />

      {/* Bottom sheet */}
      <div className="mt-auto rounded-t-3xl bg-white shadow-2xl relative overflow-hidden" style={{ minHeight: 440 }}>
        {/* Drag handle */}
        <div className="w-full flex items-center justify-center pt-2 pb-1">
          <div className="w-9 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Sheet header */}
        <div className="px-3 pt-1 pb-2 flex items-start gap-2">
          <div className="w-8 h-8 rounded-xl grid place-items-center shrink-0" style={{ background: color + "18", border: `1px solid ${color}44` }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 8v5l3 2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[8px] font-black uppercase tracking-widest" style={{ color }}>{data.drillKicker ?? "Nu insight"}</div>
            <div className="text-[13px] font-black text-slate-900 leading-tight">{data.drillTitle ?? "Insight"}</div>
          </div>
          <button className="w-6 h-6 rounded-full bg-slate-100 grid place-items-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hero big number */}
        {heroNum && (
          <div className="px-3 pt-1 pb-2 text-center">
            <div className="text-[7px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{heroNum.label}</div>
            <div className="text-[42px] font-black leading-none tabular-nums" style={{ color: toneColor(heroNum.tone), fontFamily: "'Plus Jakarta Sans'" }}>
              {heroNum.value}
            </div>
            {heroNum.delta && (
              <div className="text-[9px] font-black mt-0.5" style={{ color: toneColor(heroNum.tone) }}>
                {heroNum.delta}
              </div>
            )}
          </div>
        )}

        {/* Always-visible chart with peak marker */}
        {data.drillChartData && (
          <div className="mx-3 rounded-xl border border-slate-200 bg-slate-50 p-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">{data.drillChartLabel ?? "Trend"}</span>
              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Last 7 · CGM</span>
            </div>
            <HeroSpark color={data.drillChartColor ?? color} data={data.drillChartData} />
          </div>
        )}

        {/* Supporting numbers row */}
        {supportingNums.length > 0 && (
          <div className={`px-3 grid gap-1.5 mb-2 ${supportingNums.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {supportingNums.map((n, i) => (
              <div key={i} className="rounded-lg bg-white border border-slate-200 px-1.5 py-1.5 text-center">
                <div className="text-[7px] font-black uppercase tracking-widest text-slate-500 truncate">{n.label}</div>
                <div className="text-[12px] font-black text-slate-900 leading-none mt-0.5 tabular-nums">{n.value}</div>
                {n.delta && (
                  <div className="text-[7px] font-black mt-0.5" style={{ color: toneColor(n.tone) }}>{n.delta}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Habit anchor + IF-THEN (only when habit data present) */}
        {(data.habitAnchor || data.habitIntentionIf) && (
          <div className="mx-3 rounded-xl border p-2 mb-2" style={{ background: color + "0A", borderColor: color + "44" }}>
            {data.habitAnchor && (
              <div className="text-[9px] font-black text-slate-800 mb-0.5">
                <span className="uppercase tracking-widest text-[7px]" style={{ color }}>Anchor: </span>{data.habitAnchor}
              </div>
            )}
            {data.habitIntentionIf && (
              <div className="text-[10px] leading-snug">
                <span className="font-black" style={{ color }}>If</span>{" "}
                <span className="text-slate-800">{data.habitIntentionIf}</span>{" "}
                <span className="font-black" style={{ color }}>then</span>{" "}
                <span className="text-slate-800 font-black">{data.habitIntentionThen}</span>
              </div>
            )}
          </div>
        )}

        {/* Nu suggests */}
        {data.drillSuggestion && (
          <div className="mx-3 rounded-xl bg-amber-50 border border-amber-200 p-2 mb-2 flex items-start gap-2">
            <div className="shrink-0"><NuMascot size={22} /></div>
            <div className="flex-1">
              <div className="text-[7px] font-black uppercase tracking-widest text-amber-700">Nu suggests</div>
              <div className="text-[10px] font-black text-slate-800 leading-snug">{data.drillSuggestion}</div>
            </div>
          </div>
        )}

        {/* Action footer */}
        {data.drillActions && data.drillActions.length > 0 && (
          <div className="px-3 pb-3 pt-1 flex gap-1.5">
            {data.drillActions.map((a, i) => (
              <button
                key={i}
                className={`flex-1 px-2 py-2 rounded-xl text-[11px] font-black ${
                  a.primary ? "text-white shadow-sm" : "text-slate-700 border border-slate-200 bg-white"
                }`}
                style={a.primary ? { background: color, boxShadow: `0 4px 12px -4px ${color}55` } : undefined}
              >{a.label}</button>
            ))}
          </div>
        )}

        {/* Footer meta */}
        <div className="px-3 pb-3 text-center text-[7px] font-black uppercase tracking-widest text-slate-400">
          Insight built on Lilly Health data · updated 2 min ago
        </div>
      </div>
    </div>
  );
}

// HeroSpark — filled area + peak marker for the CompanionDrillSheet chart
function HeroSpark({ color, data }: { color: string; data: number[] }) {
  const min = Math.min(...data), max = Math.max(...data);
  const w = 220, h = 44;
  const pts = data.map((v, i) => ({
    x: (i / Math.max(1, data.length - 1)) * w,
    y: h - ((v - min) / Math.max(1, max - min)) * (h - 6) - 3,
  }));
  const line = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `M0,${h} L${line} L${w},${h} Z`;
  const peakIdx = data.indexOf(max);
  const peak = pts[peakIdx];
  const gradId = `hero-${color.replace("#", "")}`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === peakIdx ? 3 : 1.4} fill={color} stroke={i === peakIdx ? "white" : "none"} strokeWidth={i === peakIdx ? 1.5 : 0} />
      ))}
      {peak && (
        <g>
          <line x1={peak.x} y1={0} x2={peak.x} y2={peak.y - 4} stroke={color} strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.5" />
          <rect x={Math.min(w - 36, Math.max(0, peak.x - 18))} y={peak.y - 16} width="36" height="12" rx="3" fill={color} />
          <text x={Math.min(w - 18, Math.max(18, peak.x))} y={peak.y - 8} fontSize="7" fontWeight="800" fill="white" textAnchor="middle">PEAK</text>
        </g>
      )}
    </svg>
  );
}

// Richer Fathom card used in Companion — badge + priority + primary action
function RichFathomCard({ color, title, body, index }: { color: string; title: string; body: string; index: number }) {
  const badges = ["Metabolic", "Behavioral", "Trajectory"];
  const priorities = [{ label: "New", tone: "#F59E0B" }, { label: "Active", tone: "#0EA5A4" }, { label: "Forecast", tone: "#7C3AED" }];
  const b = badges[index % badges.length];
  const p = priorities[index % priorities.length];
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-2.5 pt-2 pb-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: color + "15", color }}>{b}</span>
          <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: p.tone + "15", color: p.tone }}>{p.label}</span>
          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-auto">Fathom noticed</span>
        </div>
        <div className="text-[11px] font-black text-slate-900 leading-snug">{title}</div>
        <div className="text-[9px] text-slate-600 leading-snug mt-0.5">{body}</div>
        <div className="mt-1.5 flex items-center justify-between">
          <button className="text-[9px] font-black flex items-center gap-0.5" style={{ color }}>
            See the story
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 rounded-md grid place-items-center bg-slate-50 border border-slate-200">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button className="w-6 h-6 rounded-md grid place-items-center bg-slate-50 border border-slate-200">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1.5" fill="#94A3B8" /><circle cx="19" cy="12" r="1.5" fill="#94A3B8" /><circle cx="5" cy="12" r="1.5" fill="#94A3B8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Mockup switch
// ============================================================================
export function StepMockup({ kind, color, data }: { kind: MockupKind; color: string; data?: MockupData }) {
  return <div className="flex items-center justify-center">{renderMockup(kind, color, data ?? {})}</div>;
}

function renderMockup(kind: MockupKind, color: string, d: MockupData): React.ReactNode {
  switch (kind) {

    // ------------------ Trigger frames
    case "sun-morning-miss":
      return (
        <PhoneFrame>
          <div className="w-full h-full flex flex-col items-center justify-center px-4"
               style={{ background: d.triggerBg ?? "linear-gradient(180deg,#FFD8B0 0%,#FFE9C7 40%,#F8FAFC 100%)" }}>
            <div className="text-[52px] font-black text-slate-900 tracking-tight">10:00</div>
            <div className="text-[12px] font-black text-slate-700 mt-1">Sunday, July 27</div>
            <div className="mt-8 w-full px-2">
              <div className="rounded-2xl bg-white/85 backdrop-blur border border-white shadow-sm p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', serif" }}>Lilly</span>
                  <span className="text-[9px] font-black text-slate-700">Health</span>
                  <span className="text-[8px] text-slate-400 ml-auto">now</span>
                </div>
                <div className="text-[11px] font-black text-slate-900 leading-snug">Time for your Sunday dose</div>
                <div className="text-[10px] text-slate-600 leading-snug mt-0.5">Semaglutide · scheduled 10 AM</div>
              </div>
              <div className="mt-2 flex items-center gap-1 justify-center">
                <span className="text-[9px] font-black text-slate-500">SNOOZED · 1h</span>
              </div>
            </div>
            <div className="mt-auto pb-6 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              Family brunch · Grill fired up
            </div>
          </div>
        </PhoneFrame>
      );

    case "nausea-log":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home">
            <div className="w-full h-full flex flex-col px-3 pt-3"
                 style={{ background: d.triggerBg ?? "linear-gradient(180deg,#F0FDF4 0%,#FFFFFF 100%)" }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">This morning · mood</div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm text-center">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Nausea</div>
                <div className="text-[48px] font-black text-rose-700 leading-none tabular-nums">{d.triggerBigNumber ?? "4"}</div>
                <div className="text-[11px] font-black text-slate-700 mt-1">{d.triggerBigLabel ?? "/ 5 nausea"}</div>
                <div className="flex justify-center gap-1 mt-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-5 h-5 rounded-full ${i <= parseInt(d.triggerBigNumber ?? "4") ? "bg-rose-500" : "bg-slate-200"}`} />
                  ))}
                </div>
              </div>
              {d.triggerCaption && (
                <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                  <div className="text-[10px] text-slate-700 leading-snug">{d.triggerCaption}</div>
                </div>
              )}
              <div className="mt-auto pb-2 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">
                Breakfast: skipped
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "walk-log-trigger":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="logbook">
            <div className="w-full h-full flex flex-col px-3 pt-3"
                 style={{ background: "linear-gradient(180deg,#F0FDFA 0%,#FFFFFF 100%)" }}>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Movement · this fortnight</div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                <div className="flex items-baseline gap-1">
                  <span className="text-[42px] font-black text-slate-900 leading-none tabular-nums">3</span>
                  <span className="text-[13px] font-black text-slate-500">/ 14 walk days</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Sporadic · 21% of days</div>
                <div className="flex items-center gap-1 mt-3">
                  {[1,0,1,0,0,0,0,1,0,0,0,0,1,0].map((d,i) => (
                    <div key={i} className="flex-1 h-6 rounded-sm" style={{ background: d ? "#0EA5A4" : "#E2E8F0" }} />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] font-black text-slate-400">14 days ago</span>
                  <span className="text-[8px] font-black text-slate-400">today</span>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                <div className="text-[10px] text-slate-700 leading-snug">You want to walk more. You haven't found the rhythm yet.</div>
              </div>
              <div className="mt-auto pb-2 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">
                Your cohort: evening walks = your #1 lever
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "habit-intention-capture":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home" showHeader={false}>
            {/* Sheet header */}
            <div className="px-3 pt-3 pb-2 flex items-center gap-2 border-b border-slate-100">
              <button className="w-7 h-7 rounded-full grid place-items-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4F5FE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Habit setup · anchor-stack</div>
                <div className="text-[12px] font-black text-slate-900 leading-tight">{d.habitName ?? "New habit"}</div>
              </div>
              <NuMascot size={22} />
            </div>

            <div className="px-3 pt-3 pb-2">
              {/* Anchor callout */}
              <div className="rounded-xl border p-2.5 mb-3" style={{ background: color + "0F", borderColor: color + "44" }}>
                <div className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color }}>Your anchor</div>
                <div className="text-[12px] font-black text-slate-900 leading-tight">{d.habitAnchor ?? "After dinner"}</div>
                {d.habitAnchorReason && (
                  <div className="text-[9px] text-slate-600 leading-snug mt-1">{d.habitAnchorReason}</div>
                )}
              </div>

              {/* IF-THEN scaffold */}
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Implementation intention</div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm mb-2">
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 w-8">If</span>
                  <div className="flex-1 border-b-2 border-slate-300 pb-0.5">
                    <span className="text-[11px] font-black text-slate-900">{d.habitIntentionIf ?? "___"}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 w-8">Then</span>
                  <div className="flex-1 border-b-2 border-slate-300 pb-0.5">
                    <span className="text-[11px] font-black" style={{ color }}>{d.habitIntentionThen ?? "___"}</span>
                  </div>
                </div>
              </div>

              {/* Cohort lift chip */}
              {d.habitCohortLift && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 mb-2 flex items-start gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <path d="M23 6l-9.5 9.5-5-5L1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                  <div className="text-[9px] font-black text-emerald-900 leading-snug">{d.habitCohortLift}</div>
                </div>
              )}

              {/* Habit stage progress dots */}
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Habit Ladder</div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 mb-3">
                <div className="grid grid-cols-4 gap-1 mb-1">
                  {(["trying", "sticky", "stable", "automatic"] as const).map(stage => {
                    const active = stage === "trying";
                    return (
                      <div key={stage} className="text-center">
                        <div className={`h-1.5 rounded-full mb-0.5 ${active ? "" : "bg-slate-200"}`}
                             style={active ? { background: color } : undefined} />
                        <div className={`text-[7px] font-black uppercase tracking-widest ${active ? "" : "text-slate-400"}`}
                             style={active ? { color } : undefined}>
                          {stage}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1.5">
                <button className="flex-1 px-2 py-2 rounded-xl text-[11px] font-black text-white shadow-sm"
                        style={{ background: color, boxShadow: `0 4px 12px -4px ${color}55` }}>
                  Save intention
                </button>
                <button className="px-2 py-2 rounded-xl text-[11px] font-black text-slate-700 border border-slate-200">
                  Edit
                </button>
              </div>

              <div className="text-center mt-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                Fogg · Gollwitzer · Clear
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "plateau-weigh-in":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home">
            <div className="w-full h-full flex flex-col px-3 pt-3"
                 style={{ background: "linear-gradient(180deg,#F5F3FF 0%,#FFFFFF 100%)" }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">This morning · scale</div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm text-center">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Weight</div>
                <div className="text-[42px] font-black text-slate-900 leading-none tabular-nums">176.4</div>
                <div className="text-[11px] font-black text-slate-700 mt-1">lbs</div>
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                  <span className="text-[9px] font-black text-slate-600">0.0 lb this week</span>
                </div>
              </div>
              <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6L8 14L18 14" />
                </svg>
                <div className="text-[10px] font-black text-slate-700 leading-tight">Same as 3 Mondays ago</div>
              </div>
              <div className="mt-3 rounded-xl bg-white border border-slate-200 px-3 py-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Mood log</div>
                <div className="flex items-center gap-1">
                  {["😐","😐","🙂","😐","😐","🙂","😐"].map((e, i) => (
                    <div key={i} className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 grid place-items-center text-[12px]">{e}</div>
                  ))}
                </div>
                <div className="text-[9px] text-slate-500 mt-1">'Meh' 4 of 7 days this week</div>
              </div>
              <div className="mt-auto pb-2 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">
                Third Monday · same number
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    // ------------------ Backend
    case "fathom-detect":    return <FathomBrainCard color={color} data={d} />;
    case "fathom-draft":     return <FathomDraftCard color={color} data={d} />;
    case "pattern-detected": return <PatternDetectedCard color={color} data={d} />;
    case "coach-console":    return <CoachConsole color={color} data={d} />;

    // ------------------ Coach outreach
    case "coach-call":
      return (
        <PhoneFrame>
          <div className="w-full h-full flex flex-col items-center justify-between px-4 py-6"
               style={{ background: "linear-gradient(180deg,#0F172A 0%,#1E293B 100%)" }}>
            <div className="mt-10 text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Incoming call</div>
              <div className="w-20 h-20 mx-auto rounded-full bg-white/10 border-2 border-white/20 grid place-items-center mb-3">
                <span className="text-[26px] font-black text-white">M</span>
              </div>
              <div className="text-[16px] font-black text-white">Maya</div>
              <div className="text-[10px] text-slate-300 mt-0.5">Lilly Health Coach</div>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-6">
              <div className="w-14 h-14 rounded-full bg-red-500 grid place-items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3l2 5-2 1.5a11 11 0 0 0 6.5 6.5L15 13l5 2z" transform="rotate(135 12 12)"/></svg>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-500 grid place-items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3l2 5-2 1.5a11 11 0 0 0 6.5 6.5L15 13l5 2z"/></svg>
              </div>
            </div>
          </div>
        </PhoneFrame>
      );

    case "coach-text":
      return (
        <PhoneFrame>
          <div className="w-full h-full flex flex-col px-3 pt-2"
               style={{ background: "linear-gradient(180deg,#F8FAFC 0%,#FFFFFF 100%)" }}>
            <div className="pt-6 pb-1 flex items-center justify-between text-[10px] font-black text-slate-800">
              <span>9:00</span><span className="text-[8px]">•••</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 mt-2">Messages · Maya (coach)</div>
            <div className="space-y-1.5">
              <div className="rounded-2xl bg-emerald-100 border border-emerald-200 px-3 py-2 max-w-[85%]">
                <div className="text-[10px] font-black text-emerald-900">{d.messageTitle ?? "Noticed something."}</div>
                {d.messageBody && <div className="text-[10px] text-emerald-800 mt-0.5 leading-snug">{d.messageBody}</div>}
                <div className="text-[8px] text-emerald-700 mt-1.5">Maya · text</div>
              </div>
            </div>
            <div className="mt-auto pb-4 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">
              Sent via SMS · not through Lilly Health
            </div>
          </div>
        </PhoneFrame>
      );

    // ------------------ Lilly Health app states
    case "lilly-home-unchanged":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home">
            <LillyStandardHome />
            <div className="mx-3 mt-2 mb-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 px-3 py-2">
              <div className="text-[8px] font-black uppercase tracking-widest text-emerald-700 mb-0.5">Behind the scenes</div>
              <div className="text-[10px] font-black text-emerald-900 leading-snug">
                Fathom fired. Maya was pinged. Sally sees no change.
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "lock-notification":
      return (
        <PhoneFrame>
          <div className="w-full h-full flex flex-col items-center px-3"
               style={{
                 background: "linear-gradient(160deg,#1E1B4B 0%,#312E81 30%,#0F172A 70%,#020617 100%)",
               }}>
            <StatusBar light />
            {/* Big clock */}
            <div className="mt-6 text-center">
              <div className="text-[62px] font-black text-white tracking-tight leading-none"
                   style={{ fontFamily: "'SF Pro Display', 'Plus Jakarta Sans', system-ui", fontWeight: 800 }}>
                9:41
              </div>
              <div className="text-[11px] font-black text-white/80 mt-1">Monday, July 28</div>
            </div>

            {/* Notifications stack */}
            <div className="mt-8 w-full space-y-1.5 px-1">
              {/* Lilly Health — hero */}
              <div className="rounded-2xl p-2.5 shadow-2xl"
                   style={{
                     background: "rgba(255,255,255,0.96)",
                     backdropFilter: "blur(20px)",
                     animation: "pulseIn 1.4s ease-out",
                   }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 rounded-md grid place-items-center shadow-sm" style={{ background: "linear-gradient(135deg,#E63946,#F87171)" }}>
                    <span className="text-[8px] font-black italic text-white leading-none" style={{ fontFamily: "'Fraunces', serif" }}>L</span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[10px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', serif" }}>Lilly</span>
                    <span className="text-[10px] font-black text-slate-700">Health</span>
                  </div>
                  <span className="text-[8px] text-slate-400 ml-auto">now</span>
                </div>
                <div className="text-[11px] font-black text-slate-900 leading-snug">{d.messageTitle ?? "Time to check in."}</div>
                {d.messageBody && <div className="text-[10px] text-slate-700 leading-snug mt-0.5">{d.messageBody}</div>}
              </div>
              {/* Secondary faded notif for realism */}
              <div className="rounded-2xl p-2" style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md grid place-items-center" style={{ background: "linear-gradient(135deg,#0EA5E9,#38BDF8)" }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
                  </div>
                  <span className="text-[9px] font-black text-slate-800">Weather</span>
                  <span className="text-[8px] text-slate-500 ml-auto">7:30 AM</span>
                </div>
                <div className="text-[9px] text-slate-700 mt-0.5 leading-snug">Sunny · 72° · perfect walking weather</div>
              </div>
            </div>

            {/* Bottom lock-screen controls */}
            <div className="mt-auto pb-5 w-full flex items-center justify-between px-8">
              <div className="w-10 h-10 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M14.5 3l-1 3.5H10L9 3H7l1 4-2 15h12L16 7l1-4z" />
                </svg>
              </div>
              <div className="text-[8px] font-black text-white/60 uppercase tracking-widest">
                Swipe up to unlock
              </div>
              <div className="w-10 h-10 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19V8a2 2 0 0 0-2-2h-3.2L16 4H8L6.2 6H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
          </div>
        </PhoneFrame>
      );

    case "message-thread":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home" showHeader={false}>
            {/* Thread header with back arrow + title */}
            <div className="px-3 pt-2 pb-2 flex items-center gap-2 border-b border-slate-100 bg-white">
              <button className="w-7 h-7 rounded-full grid place-items-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4F5FE5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-full grid place-items-center text-[10px] font-black text-white shrink-0"
                   style={{ background: "linear-gradient(135deg,#E63946,#F87171)" }}>
                <span className="italic text-white leading-none" style={{ fontFamily: "'Fraunces', serif" }}>L</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black text-slate-900 leading-tight truncate">Lilly Health Reminders</div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] text-slate-500">Active</span>
                </div>
              </div>
              <button className="w-7 h-7 rounded-full grid place-items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
              </button>
            </div>

            {/* Message body */}
            <div className="px-3 pt-3">
              {/* Timestamp separator */}
              <div className="text-center mb-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Today · 9:41 AM</span>
              </div>

              <div className="space-y-2">
                {/* Incoming bubble with avatar */}
                <div className="flex items-end gap-1.5">
                  <div className="w-6 h-6 rounded-full grid place-items-center text-[8px] font-black text-white shrink-0 mb-0.5"
                       style={{ background: "linear-gradient(135deg,#E63946,#F87171)" }}>
                    <span className="italic leading-none" style={{ fontFamily: "'Fraunces', serif" }}>L</span>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm px-3 py-2 max-w-[80%]"
                       style={{ borderBottomLeftRadius: 4 }}>
                    <div className="text-[11px] font-black text-slate-900 leading-snug">{d.messageTitle ?? "Note from Lilly Health"}</div>
                    {d.messageBody && <div className="text-[10px] text-slate-700 leading-relaxed mt-1">{d.messageBody}</div>}
                    <div className="text-[8px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <span>Now</span>
                      <span>·</span>
                      <span className="italic">Personalized for you</span>
                    </div>
                  </div>
                </div>

                {/* Action pills */}
                {d.messageActions && (
                  <div className="flex flex-col gap-1.5 pt-1.5 ml-8 mr-1">
                    {d.messageActions.map((a, i) => (
                      <button
                        key={i}
                        className={`w-full px-3 py-2 rounded-xl text-[11px] font-black transition text-left flex items-center justify-between ${
                          a.primary ? "text-white shadow-sm" : "text-slate-700 bg-white border border-slate-200"
                        }`}
                        style={a.primary ? { background: color, boxShadow: `0 4px 12px -4px ${color}55` } : undefined}
                      >
                        <span>{a.label}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={a.primary ? "white" : "#94A3B8"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat input footer */}
            <div className="mt-auto px-3 py-2 border-t border-slate-100 bg-white flex items-center gap-2">
              <div className="flex-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-[10px] text-slate-400">
                Reply to Lilly Health...
              </div>
              <button className="w-7 h-7 rounded-full grid place-items-center text-white" style={{ background: color }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
                </svg>
              </button>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "message-acted":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home">
            <div className="px-3 pt-2">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Messages · Reminders</div>
              <div className="space-y-2">
                <div className="rounded-2xl bg-slate-100 px-3 py-2 max-w-[85%]">
                  <div className="text-[10px] font-black text-slate-900">{d.messageTitle ?? "Note"}</div>
                  {d.messageBody && <div className="text-[10px] text-slate-700 mt-1">{d.messageBody}</div>}
                </div>
                <div className="rounded-2xl px-3 py-2 max-w-[80%] ml-auto text-white" style={{ background: color }}>
                  <div className="text-[10px] font-black">{d.messageActions?.[0]?.label ?? "Yes"} ✓</div>
                </div>
                {d.messageConfirmTitle && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mb-0.5">{d.messageConfirmTitle}</div>
                    {d.messageConfirmBody && <div className="text-[10px] font-black text-emerald-900">{d.messageConfirmBody}</div>}
                  </div>
                )}
                {d.messageTrace && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Fathom · behind scenes</div>
                    <div className="text-[10px] font-black text-slate-800">{d.messageTrace}</div>
                  </div>
                )}
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "cards-in-home":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home">
            <LillyStandardHome slim />
            <div className="px-3 space-y-2 pb-3">
              {(d.homeCards ?? []).map((c, i) => (
                <FathomCardMini key={i} color={color} title={c.title} body={c.body} />
              ))}
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "card-expanded":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home">
            <div className="px-3 pt-2 pb-2">
              <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-3 py-2" style={{ background: color }}>
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/80">{d.drillKicker ?? "Fathom noticed"}</div>
                  <div className="text-[11px] font-black text-white">{d.drillTitle ?? "Insight"}</div>
                </div>
                <div className="px-3 py-3 bg-white">
                  <NumbersFirst data={d} color={color} />
                  {/* Habit anchor + IF-THEN, if this insight is habit-shaped */}
                  {(d.habitAnchor || d.habitIntentionIf) && (
                    <div className="mt-2 rounded-lg border p-2" style={{ background: color + "0A", borderColor: color + "44" }}>
                      {d.habitAnchor && (
                        <div className="text-[9px] font-black text-slate-800 mb-0.5">
                          <span className="uppercase tracking-widest text-[7px]" style={{ color }}>Anchor: </span>{d.habitAnchor}
                        </div>
                      )}
                      {d.habitIntentionIf && (
                        <div className="text-[10px] leading-snug">
                          <span className="font-black" style={{ color }}>If</span>{" "}
                          <span className="text-slate-800">{d.habitIntentionIf}</span>{" "}
                          <span className="font-black" style={{ color }}>then</span>{" "}
                          <span className="text-slate-800 font-black">{d.habitIntentionThen}</span>
                        </div>
                      )}
                      {d.habitStage && (
                        <div className="mt-1 text-[8px] font-black uppercase tracking-widest" style={{ color }}>
                          Habit Ladder · {d.habitStage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "card-committed":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home">
            <div className="px-3 pt-2 pb-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 grid place-items-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Committed</div>
                </div>
                <div className="text-[11px] font-black text-emerald-900 leading-snug">{d.commitTitle ?? "Plan set"}</div>
                {d.commitBody && <div className="text-[10px] text-emerald-800 mt-0.5">{d.commitBody}</div>}
              </div>
              {d.commitTrace && (
                <div className="mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2">
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Behind scenes</div>
                  <div className="text-[10px] font-black text-slate-800">{d.commitTrace}</div>
                </div>
              )}
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "evening-confirm":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home">
            <div className="px-3 pt-2 pb-2">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="px-3 py-2 flex items-center gap-2" style={{ background: d.confirmGradient ?? "linear-gradient(90deg,#F59E0B,#EF4444)" }}>
                  <span className="text-[14px]">🎯</span>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-white/85">{d.confirmKicker ?? "Nice"}</div>
                    <div className="text-[11px] font-black text-white">{d.confirmTitle ?? "Small win"}</div>
                  </div>
                </div>
                {d.confirmBody && (
                  <div className="px-3 py-2 bg-white">
                    <div className="text-[10px] text-slate-700 leading-snug">{d.confirmBody}</div>
                  </div>
                )}
              </div>
              <div className="mt-2 text-[8px] font-black uppercase tracking-widest text-slate-500 text-center">
                Card added by Fathom · confirmed via wearable / CGM
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    // ------------------ Level 4 Companion
    case "lilly-home-plain":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home" showInsightDot>
            <LillyStandardHome />
          </LillyChrome>
        </PhoneFrame>
      );

    case "sally-taps-insights":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="insights">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 border-2 animate-spin"
                     style={{ borderColor: color, borderTopColor: "transparent" }} />
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loading Companion</div>
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "companion-loaded":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="insights">
            <CompanionView color={color} data={d} />
          </LillyChrome>
        </PhoneFrame>
      );

    case "companion-drill":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="insights" showHeader={false}>
            <CompanionDrillSheet data={d} color={color} />
          </LillyChrome>
        </PhoneFrame>
      );

    case "companion-chat":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="insights">
            <div className="px-3 pt-2 pb-2">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Chat with Maya</div>
              {d.chatContext && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-1.5 mb-2">
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Context</div>
                  <div className="text-[9px] text-slate-700">{d.chatContext}</div>
                </div>
              )}
              <div className="space-y-1.5">
                <div className="rounded-2xl bg-white border border-slate-200 px-2.5 py-1.5 max-w-[85%]">
                  <div className="text-[9px] font-black text-slate-500 mb-0.5">You</div>
                  <div className="text-[10px] text-slate-800">{d.chatUser ?? "..."}</div>
                </div>
                <div className="rounded-2xl px-2.5 py-1.5 max-w-[85%] ml-auto text-white" style={{ background: color }}>
                  <div className="text-[9px] font-black text-white/80 mb-0.5">Maya · Lilly Health Coach</div>
                  <div className="text-[10px]">{d.chatReply ?? "..."}</div>
                </div>
                {d.chatReplyTime && (
                  <div className="text-[8px] font-black uppercase tracking-widest text-emerald-600 text-center pt-1">
                    {d.chatReplyTime}
                  </div>
                )}
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );

    case "companion-return":
      return (
        <PhoneFrame>
          <LillyChrome activeTab="home" showInsightDot>
            <LillyStandardHome />
            <div className="mx-3 mt-2 mb-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2">
              <div className="text-[8px] font-black uppercase tracking-widest text-violet-700 mb-0.5">{d.returnKicker ?? "Insights tab · Fathom Companion"}</div>
              <div className="text-[10px] font-black text-violet-900 leading-snug">
                {d.returnBody ?? "Companion session complete."}
              </div>
            </div>
          </LillyChrome>
        </PhoneFrame>
      );
  }
  return null;
}

// ============================================================================
// The player itself
// ============================================================================
export default function ScenarioPlayer({ scenario }: { scenario: Scenario }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => { setStepIdx(0); setPlaying(false); }, [scenario]);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= scenario.steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStepIdx(i => Math.min(i + 1, scenario.steps.length - 1)), 5500);
    return () => clearTimeout(t);
  }, [playing, stepIdx, scenario.steps.length]);

  const safeIdx = Math.min(stepIdx, scenario.steps.length - 1);
  const active: Step = scenario.steps[safeIdx];

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-start gap-4"
           style={{ background: `linear-gradient(90deg, ${scenario.tint}55, #FFFFFF)` }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
                  style={{ background: scenario.color }}>
              Level {scenario.id} · {scenario.levelName}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Scenario</span>
          </div>
          <div className="text-[15px] font-black text-slate-900 leading-snug">{scenario.premise}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStepIdx(i => Math.max(0, i - 1))}
            disabled={safeIdx === 0}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            title="Previous step"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            onClick={() => {
              if (safeIdx === scenario.steps.length - 1) { setStepIdx(0); setPlaying(true); }
              else setPlaying(p => !p);
            }}
            className="px-3 h-8 rounded-lg text-[11px] font-black text-white grid place-items-center"
            style={{ background: scenario.color }}
          >
            {playing ? "Pause" : (safeIdx === scenario.steps.length - 1 ? "Replay" : "Play")}
          </button>
          <button
            onClick={() => setStepIdx(i => Math.min(scenario.steps.length - 1, i + 1))}
            disabled={safeIdx === scenario.steps.length - 1}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            title="Next step"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <div className="h-1 bg-slate-100">
        <div className="h-full transition-all duration-500"
             style={{ width: `${((safeIdx + 1) / scenario.steps.length) * 100}%`, background: scenario.color }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-6 px-6 py-6"
           style={{ background: "linear-gradient(180deg,#FAFBFF,#FFFFFF)" }}>
        <div className="flex items-start justify-center">
          <div key={active.id} style={{ animation: "fadeSlide 380ms ease-out" }}>
            <StepMockup kind={active.mockup} color={scenario.color} data={active.data} />
          </div>
        </div>

        <div>
          <div className="space-y-1.5">
            {scenario.steps.map((s, i) => {
              const isActive = i === safeIdx;
              const isPast = i < safeIdx;
              return (
                <button
                  key={s.id}
                  onClick={() => { setStepIdx(i); setPlaying(false); }}
                  className={`w-full text-left rounded-xl transition p-3 border ${
                    isActive ? "shadow-sm" : isPast
                      ? "bg-slate-50/60 border-slate-100 opacity-70"
                      : "bg-white border-slate-100 opacity-60 hover:opacity-90"
                  }`}
                  style={isActive ? { background: "white", borderColor: scenario.color, boxShadow: `0 0 0 3px ${scenario.color}22` } : undefined}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-0.5">
                      <div className="w-6 h-6 rounded-full grid place-items-center text-[10px] font-black"
                           style={{
                             background: isActive ? scenario.color : isPast ? "#94A3B8" : "#E2E8F0",
                             color: isActive || isPast ? "white" : "#64748B",
                           }}>
                        {isPast ? "✓" : i + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{s.time}</span>
                        <ActorChip actor={s.actor} />
                      </div>
                      <div className="text-[13px] font-black text-slate-900 leading-snug">{s.title}</div>
                      {isActive && (
                        <>
                          <div className="text-[11px] text-slate-600 leading-relaxed mt-1.5">{s.description}</div>
                          {(() => {
                            const r = deriveReasoning(s);
                            return r ? <OrchestrationReveal reasoning={r} color={scenario.color} /> : null;
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {safeIdx === scenario.steps.length - 1 && (
            <div className="mt-4 rounded-2xl p-4 border" style={{ background: scenario.tint + "88", borderColor: scenario.color }}>
              <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: scenario.color }}>Outcome</div>
              <div className="text-[12px] font-black text-slate-900 leading-relaxed">{scenario.outcome}</div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseIn {
          0%   { opacity: 0; transform: translateY(-8px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
