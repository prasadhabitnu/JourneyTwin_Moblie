import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";

import HabitnuLogo from "../components/journey/HabitnuLogo";
import {
  ANOMALY, NU_ACTIONS, PARAMS, GOOD_SPANS, HEALTH_RECIPES,
  currentValue, severityAt, windowSlice,
  type NuAction, type Param, type ParamDef, type Severity,
} from "../lib/ringSimData";

const HOURS = 72;

// ============================================================================
// Utilities
// ============================================================================
function fmtHour(h: number): string {
  const dayOffset = Math.floor(h / 24);
  const hour = h % 24;
  const day = ["Mon", "Tue", "Wed", "Thu"][dayOffset] ?? "Fri";
  const meridian = hour < 12 ? "AM" : "PM";
  const hh = hour === 0 ? 12 : hour <= 12 ? hour : hour - 12;
  return `${day} ${hh} ${meridian}`;
}

const SEV_COLOR: Record<Severity, { fg: string; bg: string; border: string }> = {
  normal:   { fg: "#059669", bg: "#DCFCE7", border: "#86EFAC" },
  watch:    { fg: "#B45309", bg: "#FEF3C7", border: "#FCD34D" },
  warning:  { fg: "#C2410C", bg: "#FFEDD5", border: "#FDBA74" },
  critical: { fg: "#B91C1C", bg: "#FEE2E2", border: "#FCA5A5" },
};

const KIND_META: Record<NuAction["kind"], { label: string; color: string; icon: string; verb: string }> = {
  insight:  { label: "Insight",   color: "#0EA5E9", icon: "M12 8v5l3 2",                                                          verb: "flagged" },
  nudge:    { label: "Nudge",     color: "#F59E0B", icon: "M8 12h8M12 8v8",                                                       verb: "nudged" },
  converse: { label: "Converse",  color: "#0EA5A4", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",         verb: "talking" },
  escalate: { label: "Escalate",  color: "#E11D48", icon: "M12 2v6M8 6l4-4 4 4M4 22h16",                                          verb: "escalated" },
  company:  { label: "Company",   color: "#7C3AED", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", verb: "accompanying" },
};

/** Nu Health Index — 0..10 stars derived from current severity of all 8 params */
function nuHealthIndex(cursor: number): { score: number; label: string; tint: string } {
  const weights: Record<Severity, number> = { normal: 1.25, watch: 1.0, warning: 0.5, critical: 0 };
  const total = PARAMS.reduce((sum, p) => sum + weights[severityAt(p.id, cursor)], 0);
  const score = Math.round(total * 10) / 10;   // 0..10 with 1 decimal
  const label =
    score >= 9.0 ? "Excellent" :
    score >= 7.5 ? "Steady"    :
    score >= 6.0 ? "Watch"     :
    score >= 4.0 ? "Recover"   : "Care";
  const tint =
    score >= 9.0 ? "#059669" :
    score >= 7.5 ? "#0EA5A4" :
    score >= 6.0 ? "#F59E0B" :
    score >= 4.0 ? "#F97316" : "#DC2626";
  return { score, label, tint };
}

/** Latest Nu action visible at cursor */
function latestAction(cursor: number): NuAction | undefined {
  return [...NU_ACTIONS].reverse().find(a => a.at <= cursor);
}

/** Contextual tags derived for the ticker */
function fathomContext(cursor: number): string {
  if (cursor < ANOMALY.detectedAt) return "baseline · no signal";
  if (cursor < 40) return "early-drift · watch";
  if (cursor < 52) return "pattern-cluster · pre-illness";
  if (cursor < 60) return "URI-prodrome · alert";
  return "recovery · post-onset";
}

// ============================================================================
// Page
// ============================================================================
type View = "coach" | "patient";

export default function HealthRingPage() {
  const [view, setView] = useState<View>("coach");
  const [cursor, setCursor] = useState(24);
  const [playing, setPlaying] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setCursor(c => {
        if (c >= HOURS - 1) { setPlaying(false); return HOURS - 1; }
        return c + 1;
      });
    }, 350);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <>
      <Head>
        <title>Health Ring · Live · Habitnu × Lilly</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=JetBrains+Mono:wght@400;700&display=swap" />
      </Head>

      <div className="min-h-screen"
           style={{
             fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
             background: view === "coach"
               ? "linear-gradient(180deg,#0F172A 0%,#1E1B4B 100%)"
               : "linear-gradient(180deg,#FFFFFF 0%,#F5F7FF 100%)",
             color: view === "coach" ? "white" : "#0F172A",
           }}>
        {/* Top nav */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b sticky top-0 z-30"
             style={{
               background: view === "coach" ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.92)",
               backdropFilter: "blur(12px)",
               borderColor: view === "coach" ? "rgba(255,255,255,0.06)" : "#E2E8F0",
             }}>
          <div className="flex items-center gap-3">
            <HabitnuLogo />
            <span className={view === "coach" ? "text-slate-500 text-xl font-black" : "text-slate-300 text-xl font-black"}>|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[18px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif" }}>Lilly</span>
              <span className={`text-[14px] font-black ${view === "coach" ? "text-slate-100" : "text-slate-800"}`}>Health</span>
            </div>
            <span className="ml-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                  style={view === "coach"
                    ? { background: "rgba(20,184,166,0.1)", color: "#5EEAD4", border: "1px solid rgba(20,184,166,0.35)" }
                    : { background: "#F0FDFA", color: "#0F766E", border: "1px solid #99F6E4" }}>
              Ring · Live POC
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <ViewToggle view={view} onChange={setView} />
            <nav className="flex items-center gap-1">
              <Link href="/scenarios"     className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition ${view === "coach" ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>Scenarios</Link>
              <Link href="/orchestration" className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition ${view === "coach" ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>Under the hood</Link>
              <Link href="/four-ways"     className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition ${view === "coach" ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}>4 tiers</Link>
            </nav>
          </div>
        </div>

        {view === "coach"
          ? <CoachView cursor={cursor} playing={playing}
                       setCursor={setCursor} setPlaying={setPlaying}
                       selectedActionId={selectedActionId} setSelectedActionId={setSelectedActionId} />
          : <PatientView cursor={cursor} playing={playing}
                         setCursor={setCursor} setPlaying={setPlaying} />}
      </div>
    </>
  );
}

// ============================================================================
// View toggle
// ============================================================================
function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const isCoach = view === "coach";
  const items: Array<{ v: View; label: string; sub: string }> = [
    { v: "coach",   label: "Coach view",   sub: "Full analytics" },
    { v: "patient", label: "Patient view", sub: "Simple + friendly" },
  ];
  return (
    <div className="inline-flex items-center rounded-xl p-1"
         style={isCoach
           ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }
           : { background: "white", border: "1px solid #E2E8F0" }}>
      {items.map(it => {
        const active = view === it.v;
        return (
          <button key={it.v} onClick={() => onChange(it.v)}
                  className="rounded-lg px-3 py-1.5 text-left transition"
                  style={active
                    ? { background: isCoach ? "linear-gradient(90deg,#0EA5A4,#0EA5E9)" : "#EEF2FF",
                        boxShadow: isCoach ? "0 2px 8px -2px rgba(14,165,164,0.4)" : "none",
                        border: isCoach ? "none" : "1px solid #C7D2FE" }
                    : { background: "transparent" }}>
            <div className={`text-[11px] font-black leading-tight ${active
              ? isCoach ? "text-white" : "text-indigo-700"
              : isCoach ? "text-slate-300" : "text-slate-600"}`}>
              {it.label}
            </div>
            <div className={`text-[8px] font-black uppercase tracking-widest ${active
              ? isCoach ? "text-teal-100" : "text-indigo-500"
              : isCoach ? "text-slate-500" : "text-slate-400"}`}>
              {it.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// COACH VIEW — full analytics dashboard (dark)
// ============================================================================
interface CoachProps {
  cursor: number; playing: boolean;
  setCursor: (v: number) => void; setPlaying: (v: boolean) => void;
  selectedActionId: number | null; setSelectedActionId: (v: number | null) => void;
}

function CoachView({ cursor, playing, setCursor, setPlaying, selectedActionId, setSelectedActionId }: CoachProps) {
  const severities = PARAMS.map(p => severityAt(p.id, cursor));
  const worst: Severity = severities.includes("critical") ? "critical"
                        : severities.includes("warning")  ? "warning"
                        : severities.includes("watch")    ? "watch"
                        : "normal";
  const inAnomalyWindow = cursor >= ANOMALY.detectedAt;
  const revealedActions = NU_ACTIONS.filter(a => a.at <= cursor);
  const activePrediction = [...ANOMALY.prediction].reverse().find(p => p.at <= cursor);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <PlaybackBar cursor={cursor} playing={playing}
                   onPlay={() => setPlaying(!playing)}
                   onScrub={h => { setCursor(h); setPlaying(false); }}
                   onReset={() => { setCursor(0); setPlaying(false); }} />

      <FathomTicker cursor={cursor} worst={worst} />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 mb-4">
        <RingCard hr={currentValue("hr", cursor)} worst={worst} />
        <StatusHero worst={worst} inAnomaly={inAnomalyWindow} anomaly={ANOMALY} cursor={cursor} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {PARAMS.map(p => <VitalTile key={p.id} def={p} cursor={cursor} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="space-y-4">
          {inAnomalyWindow ? (
            <>
              <RootCauseCard anomaly={ANOMALY} />
              {activePrediction && <PredictionCard prediction={activePrediction} anomaly={ANOMALY} />}
            </>
          ) : (
            <NoAnomalyCard cursor={cursor} />
          )}
        </div>
        <NuTimeline actions={revealedActions} selectedId={selectedActionId} onSelect={setSelectedActionId} />
      </div>

      <div className="mt-6 rounded-2xl p-4 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="text-[10px] font-black uppercase tracking-widest text-teal-300 mb-1">Coach view · how to read this</div>
        <div className="text-[12px] text-slate-300 leading-relaxed">
          Scrub the timeline or hit Play. Fathom's variation-detection flags the anomaly around hour 30. The root-cause AI links drifting parameters to a prodromal URI signature. Nu escalates through 5 roles as the story unfolds. Switch to <span className="font-black text-white">Patient view</span> to see the same moment as Sally sees it.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PlaybackBar with jump-to-moment chips
// ============================================================================
function PlaybackBar({ cursor, playing, onPlay, onScrub, onReset }: {
  cursor: number; playing: boolean;
  onPlay: () => void; onScrub: (h: number) => void; onReset: () => void;
}) {
  return (
    <div className="rounded-2xl p-4 mb-3 border"
         style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onReset}
                className="w-9 h-9 rounded-lg grid place-items-center text-slate-300 hover:text-white transition"
                style={{ background: "rgba(255,255,255,0.06)" }} title="Reset">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <button onClick={onPlay}
                className="h-9 px-4 rounded-lg grid place-items-center text-white font-black text-[12px] shadow-lg"
                style={{ background: "linear-gradient(90deg,#0EA5A4,#0EA5E9)" }}>
          {playing ? "▐▐ Pause" : "▶ Play 72h"}
        </button>
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 w-14">Cursor</span>
          <input type="range" min={0} max={HOURS - 1} value={cursor}
                 onChange={e => onScrub(parseInt(e.target.value))}
                 className="flex-1 accent-teal-400" />
        </div>
        <div className="text-right">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Now</div>
          <div className="text-[13px] font-black text-white tabular-nums">t+{cursor}h · {fmtHour(cursor)}</div>
        </div>
      </div>

      {/* Jump-to-moment chips */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jump to</span>
        {NU_ACTIONS.map((a) => {
          const m = KIND_META[a.kind];
          const active = cursor >= a.at && (cursor - a.at) < 8;
          return (
            <button key={a.at} onClick={() => onScrub(a.at)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest transition"
                    style={{
                      background: active ? m.color : "rgba(255,255,255,0.05)",
                      color: active ? "white" : m.color,
                      border: `1px solid ${active ? m.color : m.color + "55"}`,
                    }}>
              {m.label} · t+{a.at}h
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// FathomTicker — live orchestration state chips
// ============================================================================
function FathomTicker({ cursor, worst }: { cursor: number; worst: Severity }) {
  const meta = SEV_COLOR[worst];
  const ctx = fathomContext(cursor);
  const latest = latestAction(cursor);
  const nextAction = NU_ACTIONS.find(a => a.at > cursor);
  const channelText = latest ? KIND_META[latest.kind].label : "Silent";
  const timingText = nextAction
    ? `next: ${KIND_META[nextAction.kind].label} in ${nextAction.at - cursor}h`
    : latest ? `last: ${cursor - latest.at}h ago` : "monitoring";

  return (
    <div className="rounded-2xl px-3 py-2 mb-4 border flex items-center gap-2 flex-wrap"
         style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
      <span className="text-[9px] font-black uppercase tracking-widest text-teal-300 shrink-0">Fathom · live</span>
      <TickerChip kicker="Severity" value={worst.toUpperCase()} color={meta.fg} />
      <TickerChip kicker="Context"  value={ctx} color="#94A3B8" />
      <TickerChip kicker="Channel"  value={channelText} color={latest ? KIND_META[latest.kind].color : "#64748B"} />
      <TickerChip kicker="Timing"   value={timingText} color="#94A3B8" />
    </div>
  );
}
function TickerChip({ kicker, value, color }: { kicker: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg px-2 py-1"
         style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}55` }}>
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{kicker}</span>
      <span className="text-[10px] font-black font-mono" style={{ color }}>{value}</span>
    </div>
  );
}

// ============================================================================
// Ring visual card
// ============================================================================
function RingCard({ hr, worst }: { hr: number; worst: Severity }) {
  const pulseMs = Math.max(500, Math.round(60000 / Math.max(30, hr)));
  const meta = SEV_COLOR[worst];
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden border"
         style={{ background: "linear-gradient(160deg,#1E293B,#0F172A)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[9px] font-black uppercase tracking-widest text-teal-300">Sally Reddy · GLP-1 · Wk 13</div>
        <div className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest"
             style={{ background: meta.bg, color: meta.fg, border: `1px solid ${meta.border}` }}>
          {worst === "normal" ? "All normal" : worst}
        </div>
      </div>
      <div className="relative flex items-center justify-center py-4" style={{ height: 180 }}>
        <div className="absolute rounded-full" style={{
          width: 148, height: 148,
          background: "linear-gradient(135deg,#0EA5A4,#0EA5E9)",
          opacity: 0.15,
          animation: `ringPulse ${pulseMs}ms ease-in-out infinite`,
        }} />
        <div className="absolute rounded-full border-4" style={{
          width: 130, height: 130, borderColor: "#0EA5A4",
          background: "radial-gradient(circle at 30% 30%, #1E293B 40%, #0F172A 100%)",
          boxShadow: "inset 0 0 20px rgba(14,165,164,0.35), 0 0 30px -8px rgba(14,165,164,0.5)",
        }} />
        <div className="relative rounded-full grid place-items-center" style={{
          width: 84, height: 84,
          background: "linear-gradient(160deg,#0F172A,#020617)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div className="text-center">
            <div className="text-[7px] font-black uppercase tracking-widest text-teal-400">Live</div>
            <div className="text-[22px] font-black text-white leading-none tabular-nums">{Math.round(hr)}</div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">bpm</div>
          </div>
        </div>
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const cx = 90 + Math.cos(rad) * 78;
          const cy = 90 + Math.sin(rad) * 78;
          return (
            <div key={deg} className="absolute rounded-full"
                 style={{ width: 6, height: 6, background: "#5EEAD4",
                          left: `calc(50% + ${cx - 90}px - 3px)`,
                          top: `calc(50% + ${cy - 90}px - 3px)` }} />
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        {[
          { l: "Model", v: "Oura Gen 3" },
          { l: "Battery", v: "78%" },
          { l: "Synced", v: "now" },
        ].map(m => (
          <div key={m.l} className="rounded-lg px-2 py-1.5 text-center"
               style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-[7px] font-black uppercase tracking-widest text-slate-400">{m.l}</div>
            <div className="text-[10px] font-black text-white">{m.v}</div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes ringPulse {
          0%   { transform: scale(1);    opacity: 0.15; }
          40%  { transform: scale(1.06); opacity: 0.35; }
          100% { transform: scale(1);    opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Status hero
// ============================================================================
function StatusHero({ worst, inAnomaly, anomaly, cursor }:
  { worst: Severity; inAnomaly: boolean; anomaly: typeof ANOMALY; cursor: number }) {
  const meta = SEV_COLOR[worst];
  const relHours = Math.max(0, cursor - anomaly.detectedAt);
  return (
    <div className="rounded-2xl p-5 border overflow-hidden relative"
         style={{
           background: inAnomaly
             ? `linear-gradient(120deg, ${meta.bg} 0%, rgba(15,23,42,0.05) 100%)`
             : "linear-gradient(120deg,#DCFCE7 0%,rgba(15,23,42,0.05) 100%)",
           borderColor: inAnomaly ? meta.border : "#86EFAC",
         }}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl grid place-items-center shrink-0 shadow-lg"
             style={{ background: inAnomaly ? meta.fg : "#059669" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {inAnomaly
              ? <><path d="M12 9v4M12 17h.01" /><circle cx="12" cy="12" r="10" /></>
              : <><polyline points="20 6 9 17 4 12" /></>}
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: inAnomaly ? meta.fg : "#065F46" }}>
            {inAnomaly ? "Variation detected" : "All systems normal"}
          </div>
          <div className="text-[22px] font-black text-slate-900 leading-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}>
            {inAnomaly ? anomaly.headline : "Sally's ring is quietly listening."}
          </div>
          {inAnomaly && (
            <div className="text-[12px] text-slate-700 mt-1 leading-snug">
              Detected {relHours}h ago · involving {anomaly.paramsInvolved.map(p => PARAMS.find(x => x.id === p)!.label).join(" · ")}
            </div>
          )}
          {!inAnomaly && (
            <div className="text-[12px] text-slate-700 mt-1">
              All 8 parameters inside baseline. No signal above detection threshold.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Vital tile (coach view)
// ============================================================================
function VitalTile({ def, cursor }: { def: ParamDef; cursor: number }) {
  const value = currentValue(def.id, cursor);
  const sev = severityAt(def.id, cursor);
  const meta = SEV_COLOR[sev];
  const slice = windowSlice(def.id, cursor, 24);
  return (
    <div className="rounded-2xl p-3 border relative"
         style={{ background: "rgba(255,255,255,0.03)", borderColor: sev === "normal" ? "rgba(255,255,255,0.08)" : meta.fg + "88" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-lg grid place-items-center shrink-0"
             style={{ background: def.color + "18", border: `1px solid ${def.color}44` }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={def.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={def.iconPath} />
          </svg>
        </div>
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate flex-1">{def.label}</div>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.fg }} />
      </div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className="text-[24px] font-black text-white leading-none tabular-nums">{def.format(value)}</span>
        <span className="text-[10px] font-black text-slate-400">{def.unit}</span>
      </div>
      <Sparkline data={slice} color={def.color} height={30} />
      <div className="text-[8px] font-black uppercase tracking-widest mt-1" style={{ color: sev === "normal" ? "#94A3B8" : meta.fg }}>
        {sev === "normal" ? "Baseline" : sev.toUpperCase()}
      </div>
    </div>
  );
}

// ============================================================================
// Sparkline
// ============================================================================
function Sparkline({ data, color, height = 30 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = Math.max(0.5, max - min);
  const w = 200, h = height;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * h,
  }));
  const line = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `M0,${h} L${line} L${w},${h} Z`;
  const gradId = `spark-${color.replace("#", "")}`;
  const last = pts[pts.length - 1];
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={3} fill={color} stroke="white" strokeWidth={1} />
    </svg>
  );
}

// ============================================================================
// No-anomaly card
// ============================================================================
function NoAnomalyCard({ cursor }: { cursor: number }) {
  const hoursUntil = ANOMALY.detectedAt - cursor;
  return (
    <div className="rounded-2xl p-5 border"
         style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="text-[10px] font-black uppercase tracking-widest text-teal-300 mb-1">Fathom · watching</div>
      <div className="text-[20px] font-black text-white leading-tight mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}>
        No variation above detection threshold.
      </div>
      <div className="text-[12px] text-slate-300 leading-relaxed">
        All 8 ring parameters are inside Sally's personal baseline bands. Fathom's Signal Detection layer is running rolling-window pattern matchers on every stream.
      </div>
      <div className="mt-4 rounded-xl p-3" style={{ background: "rgba(14,165,164,0.08)", border: "1px solid rgba(14,165,164,0.3)" }}>
        <div className="text-[9px] font-black uppercase tracking-widest text-teal-300 mb-0.5">First variation coming</div>
        <div className="text-[11px] text-slate-200">
          A pattern-cluster will surface around <span className="font-black text-white">t+{ANOMALY.detectedAt}h</span> ({fmtHour(ANOMALY.detectedAt)}) — {hoursUntil > 0 ? `${hoursUntil}h from now` : "any moment"}.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Root-cause card
// ============================================================================
function RootCauseCard({ anomaly }: { anomaly: typeof ANOMALY }) {
  return (
    <div className="rounded-2xl p-5 border"
         style={{ background: "linear-gradient(160deg,rgba(30,27,75,0.6),rgba(15,23,42,0.6))", borderColor: "rgba(255,255,255,0.1)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-teal-300">Root-cause AI · hypothesis</div>
        <div className="flex items-center gap-1.5">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confidence</div>
          <div className="px-2 py-0.5 rounded text-[11px] font-black text-white"
               style={{ background: "linear-gradient(90deg,#0EA5A4,#0EA5E9)" }}>{anomaly.rootCause.confidence}%</div>
        </div>
      </div>
      <div className="text-[22px] font-black text-white leading-tight mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}>
        {anomaly.rootCause.hypothesis}
      </div>
      <div className="space-y-2">
        {anomaly.rootCause.factors.map((f, i) => {
          const pd = PARAMS.find(p => p.id === f.param)!;
          return (
            <div key={i} className="rounded-xl p-2.5 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
                   style={{ background: pd.color + "22", border: `1px solid ${pd.color}66` }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={pd.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={pd.iconPath} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-black text-white">{pd.label}</span>
                  <span className="text-[9px] font-black font-mono px-1.5 py-0.5 rounded" style={{ background: pd.color + "22", color: pd.color }}>{f.delta}</span>
                </div>
                <div className="text-[10px] text-slate-300 leading-snug">{f.note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Prediction card
// ============================================================================
function PredictionCard({ prediction, anomaly }: { prediction: typeof ANOMALY.prediction[number]; anomaly: typeof ANOMALY }) {
  const priorPredictions = anomaly.prediction.filter(p => p.at < prediction.at);
  return (
    <div className="rounded-2xl p-5 border"
         style={{ background: "linear-gradient(160deg,rgba(15,23,42,0.6),rgba(30,58,138,0.4))", borderColor: "rgba(94,234,212,0.25)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-teal-300">Fathom prediction · updated live</div>
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 tabular-nums">issued t+{prediction.at}h</div>
      </div>
      <div className="flex items-end gap-4 mb-3">
        <div className="text-[52px] font-black leading-none tabular-nums text-white" style={{ fontFamily: "'Fraunces', serif" }}>
          {prediction.likelihood}<span className="text-[24px] text-teal-300">%</span>
        </div>
        <div className="flex-1 pb-2">
          <div className="text-[16px] font-black text-white leading-tight">{prediction.outcome}</div>
          <div className="text-[11px] text-teal-300 font-black uppercase tracking-widest mt-0.5">horizon · {prediction.horizon}</div>
        </div>
      </div>
      {priorPredictions.length > 0 && (
        <div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Confidence progression</div>
          <div className="flex items-center gap-2 flex-wrap">
            {[...priorPredictions, prediction].map((p, i, arr) => (
              <span key={p.at} className="inline-flex items-center gap-2">
                <span className="rounded-lg px-2 py-1 text-center inline-block"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${p === prediction ? "#5EEAD4" : "rgba(255,255,255,0.1)"}` }}>
                  <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">t+{p.at}h</span>
                  <span className="block text-[13px] font-black text-white tabular-nums">{p.likelihood}%</span>
                </span>
                {i < arr.length - 1 && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M0 5h9M6 1l4 4-4 4" stroke="#5EEAD4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Nu Action Timeline
// ============================================================================
function NuTimeline({ actions, selectedId, onSelect }:
  { actions: NuAction[]; selectedId: number | null; onSelect: (id: number | null) => void }) {
  const KINDS: NuAction["kind"][] = ["insight", "nudge", "converse", "escalate", "company"];
  return (
    <div className="rounded-2xl p-5 border"
         style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="text-[10px] font-black uppercase tracking-widest text-teal-300 mb-1">Nu · action flow</div>
      <div className="text-[16px] font-black text-white leading-tight mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}>
        Insight · nudge · converse · escalate · company
      </div>
      <div className="grid grid-cols-5 gap-1 mb-4">
        {KINDS.map(k => {
          const active = actions.some(a => a.kind === k);
          const m = KIND_META[k];
          return (
            <div key={k} className="text-center">
              <div className="h-1 rounded-full mb-1" style={{ background: active ? m.color : "rgba(255,255,255,0.08)" }} />
              <div className="text-[8px] font-black uppercase tracking-widest" style={{ color: active ? m.color : "#64748B" }}>{m.label}</div>
            </div>
          );
        })}
      </div>
      {actions.length === 0 ? (
        <div className="text-[11px] text-slate-400 italic py-4 text-center">
          Nu hasn't taken any action yet — no signal has crossed threshold.
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((a, i) => {
            const m = KIND_META[a.kind];
            const isLast = i === actions.length - 1;
            const isSelected = selectedId === i;
            return (
              <button key={i} onClick={() => onSelect(isSelected ? null : i)}
                      className="w-full text-left rounded-xl p-3 transition"
                      style={{
                        background: isLast || isSelected ? m.color + "12" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isLast || isSelected ? m.color + "88" : "rgba(255,255,255,0.06)"}`,
                      }}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
                       style={{ background: m.color, boxShadow: isLast ? `0 0 12px ${m.color}88` : "none" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {(a.kind === "insight" || a.kind === "nudge")
                        ? <><circle cx="12" cy="12" r="9" /><path d={m.icon} /></>
                        : <path d={m.icon} />}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: m.color }}>{m.label}</span>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">· t+{a.at}h · {fmtHour(a.at)}</span>
                    </div>
                    <div className="text-[12px] font-black text-white leading-tight">{a.headline}</div>
                    {(isSelected || isLast) && (
                      <>
                        <div className="text-[10px] text-slate-300 leading-relaxed mt-1.5">{a.detail}</div>
                        {a.memberMessage && (
                          <div className="mt-2 rounded-lg px-2.5 py-1.5" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${m.color}44` }}>
                            <div className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: m.color }}>Member sees</div>
                            <div className="text-[10px] font-black text-white italic leading-snug">"{a.memberMessage}"</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PATIENT VIEW — friendly, simple, big numbers + Nu Health Index
// ============================================================================
interface PatientProps {
  cursor: number; playing: boolean;
  setCursor: (v: number) => void; setPlaying: (v: boolean) => void;
}

function PatientView({ cursor, playing, setCursor, setPlaying }: PatientProps) {
  const nhi = nuHealthIndex(cursor);
  // Member-facing Nu messages only (nudge, converse, company)
  const messages = NU_ACTIONS.filter(a => a.at <= cursor && a.memberMessage);
  const hour = cursor % 24;
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Simple scrubber for demo purposes */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3 mb-4 flex items-center gap-3">
        <button onClick={() => setPlaying(!playing)}
                className="h-9 px-3 rounded-lg text-white font-black text-[11px] shadow-sm"
                style={{ background: "linear-gradient(90deg,#0EA5A4,#0EA5E9)" }}>
          {playing ? "▐▐ Pause" : "▶ Play"}
        </button>
        <input type="range" min={0} max={HOURS - 1} value={cursor}
               onChange={e => { setCursor(parseInt(e.target.value)); setPlaying(false); }}
               className="flex-1 accent-teal-500" />
        <div className="text-right">
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Time</div>
          <div className="text-[12px] font-black text-slate-800 tabular-nums">{fmtHour(cursor)}</div>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-teal-700 mb-1">{fmtHour(cursor)}</div>
        <div className="text-[32px] font-black text-slate-900 leading-tight"
             style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}>
          {greeting}, Sally.
        </div>
      </div>

      {/* Nu Health Index HERO */}
      <NuHealthIndexCard nhi={nhi} cursor={cursor} />

      {/* Vitals grid — clean numbers */}
      <div className="mt-6 mb-6">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Today's numbers · from your ring</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PARAMS.map(p => <PatientVitalTile key={p.id} def={p} cursor={cursor} />)}
        </div>
      </div>

      {/* Nu messages */}
      {messages.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <NuBlob size={20} />
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">Messages from Nu · today</div>
          </div>
          <div className="space-y-2">
            {messages.map((m, i) => <PatientNudgeCard key={i} action={m} newest={i === messages.length - 1} />)}
          </div>
        </div>
      )}

      {/* If no messages yet */}
      {messages.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center gap-3 mb-6">
          <NuBlob size={40} />
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">Nu · quiet</div>
            <div className="text-[14px] font-black text-slate-800">Nothing to nudge about right now. Ring is looking after you.</div>
          </div>
        </div>
      )}

      {/* Your best times · Good Health Times analytics */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#DCFCE7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
          </svg>
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Your best times · this week</div>
        </div>
        <div className="text-[18px] font-black text-slate-900 leading-tight mb-3"
             style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}>
          When all 8 vitals stayed in the green — here's what you did.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          {GOOD_SPANS.map(sp => (
            <div key={sp.id} className="rounded-2xl bg-white border border-emerald-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 flex items-center justify-between" style={{ background: "linear-gradient(90deg,#ECFDF5,#FFFFFF)" }}>
                <div className="min-w-0">
                  <div className="text-[8px] font-black uppercase tracking-widest text-emerald-700 truncate">{sp.dayLabel}</div>
                  <div className="text-[12px] font-black text-slate-900 truncate">{sp.timeLabel}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[18px] font-black leading-none tabular-nums text-emerald-700" style={{ fontFamily: "'Fraunces', serif" }}>{sp.scoreAvg.toFixed(1)}</div>
                  <div className="text-[7px] font-black text-emerald-700 uppercase tracking-widest">NHI</div>
                </div>
              </div>
              <div className="p-3">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">What you did</div>
                <ul className="space-y-1 mb-2">
                  {sp.activities.map((a, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-800 leading-snug">
                      <span className="text-emerald-500 leading-none pt-0.5">✓</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1.5">
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Vitals</div>
                  <div className="text-[10px] text-slate-700 leading-snug">{sp.vitalsBrief}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recipes */}
        <div className="flex items-center gap-2 mb-2">
          <NuBlob size={18} />
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">Nu extracted · your recipes for feeling good</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {HEALTH_RECIPES.map(r => (
            <div key={r.id} className="rounded-2xl bg-white border shadow-sm overflow-hidden" style={{ borderColor: "#FCD34D" }}>
              <div className="px-3 py-2 flex items-center justify-between" style={{ background: "linear-gradient(90deg,#FEF3C7,#FFFFFF)" }}>
                <div className="flex items-center gap-2">
                  <NuBlob size={22} />
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-800">Recipe · {r.id.replace(/-/g, " ")}</div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5" style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-black text-amber-900 tabular-nums">{r.reliability}% reliable</span>
                </div>
              </div>
              <div className="p-3">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Ingredients</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {r.ingredients.map((i, idx) => (
                    <span key={idx} className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>{i}</span>
                  ))}
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">→ Outcome</div>
                <div className="text-[12px] font-black text-slate-900 leading-snug">{r.outcome}</div>
                <div className="text-[9px] text-slate-500 italic mt-1">
                  Nu found this pattern in {r.matchedSpans} of your past good spans.
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer explainer */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-teal-700 mb-1">Patient view · what you see</div>
        <div className="text-[12px] text-slate-600 leading-relaxed">
          Simple numbers from your ring. A single Nu Health Index score (out of 10 stars) that summarizes everything. Only the messages Nu wants you to see — no medical jargon, no dashboards. Your coach sees the full picture behind the scenes.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Nu Health Index card (patient hero)
// ============================================================================
function NuHealthIndexCard({ nhi, cursor }: { nhi: ReturnType<typeof nuHealthIndex>; cursor: number }) {
  const trendPrior = cursor >= 12 ? nuHealthIndex(cursor - 12).score : nhi.score;
  const delta = Math.round((nhi.score - trendPrior) * 10) / 10;
  return (
    <div className="rounded-3xl border shadow-sm overflow-hidden"
         style={{ background: `linear-gradient(135deg, ${nhi.tint}12 0%, #FFFFFF 60%)`, borderColor: nhi.tint + "55" }}>
      <div className="p-6 flex items-center gap-6 flex-wrap">
        {/* Left: score + stars */}
        <div className="flex-1 min-w-[260px]">
          <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: nhi.tint }}>Nu Health Index</div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[72px] font-black leading-none tabular-nums" style={{ color: nhi.tint, fontFamily: "'Fraunces', serif" }}>
              {nhi.score.toFixed(1)}
            </span>
            <span className="text-[24px] font-black text-slate-400">/ 10</span>
            {delta !== 0 && (
              <span className="text-[13px] font-black ml-2 tabular-nums"
                    style={{ color: delta > 0 ? "#059669" : "#DC2626" }}>
                {delta > 0 ? "▲ +" : "▼ "}{Math.abs(delta).toFixed(1)}
              </span>
            )}
          </div>
          <StarStrip score={nhi.score} color={nhi.tint} />
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black text-white shadow-sm"
                  style={{ background: nhi.tint }}>{nhi.label}</span>
            <span className="text-[11px] text-slate-500">
              {nhi.score >= 9 ? "Everything's on track." :
               nhi.score >= 7.5 ? "You're doing well overall." :
               nhi.score >= 6 ? "One or two things to watch." :
               nhi.score >= 4 ? "Time to take extra care of yourself." :
                                "Reach out to your coach today."}
            </span>
          </div>
        </div>
        {/* Right: Nu mascot + summary */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
             style={{ background: "white", border: `1px solid ${nhi.tint}44` }}>
          <NuBlob size={44} />
          <div className="max-w-[240px]">
            <div className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-0.5">Nu says</div>
            <div className="text-[12px] font-black text-slate-800 leading-snug">
              {nhi.score >= 9 ? "Your ring's been quiet — everything humming along. Keep going." :
               nhi.score >= 7.5 ? "A small drift but nothing urgent. Extra rest tonight would help." :
               nhi.score >= 6 ? "I noticed some early signals. Slow down today, more water, early bed." :
               nhi.score >= 4 ? "Your body's asking for a rest day. I've told Maya — she may check in." :
                                "This one needs a professional set of eyes. Maya is on it."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Star strip · 10 stars with half-star precision
function StarStrip({ score, color }: { score: number; color: string }) {
  const clamped = Math.max(0, Math.min(10, score));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => {
        const filled = Math.max(0, Math.min(1, clamped - i));
        const gradId = `star-${i}-${color.replace("#", "")}`;
        return (
          <svg key={i} width="22" height="22" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset={`${filled * 100}%`} stopColor={color} />
                <stop offset={`${filled * 100}%`} stopColor="#E2E8F0" />
              </linearGradient>
            </defs>
            <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4-6.5 4 2-7L2 9h7z"
                  fill={`url(#${gradId})`} stroke={filled > 0 ? color : "#CBD5E1"} strokeWidth="0.75" strokeLinejoin="round" />
          </svg>
        );
      })}
    </div>
  );
}

// Nu mascot blob (yellow/orange radial with face)
function NuBlob({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id="nu-blob" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#nu-blob)" />
      <circle cx="9"  cy="10" r="1.4" fill="#1E1B4B" />
      <circle cx="15" cy="10" r="1.4" fill="#1E1B4B" />
      <path d="M9 15c1 1 5 1 6 0" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="9.4"  cy="9.4" r="0.4" fill="white" />
      <circle cx="15.4" cy="9.4" r="0.4" fill="white" />
    </svg>
  );
}

// Patient vital tile — big number, tiny colored dot, no chart
function PatientVitalTile({ def, cursor }: { def: ParamDef; cursor: number }) {
  const value = currentValue(def.id, cursor);
  const sev = severityAt(def.id, cursor);
  const meta = SEV_COLOR[sev];
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ background: meta.fg }} />
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{def.label}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-black leading-none tabular-nums" style={{ color: sev === "normal" ? "#0F172A" : meta.fg }}>
          {def.format(value)}
        </span>
        <span className="text-[11px] font-black text-slate-500">{def.unit}</span>
      </div>
      <div className="text-[9px] font-black mt-1"
           style={{ color: sev === "normal" ? "#64748B" : meta.fg }}>
        {sev === "normal" ? "In range" :
         sev === "watch"  ? "Slightly off" :
         sev === "warning"? "Needs attention" :
                            "Please check in"}
      </div>
    </div>
  );
}

// Patient nudge card — friendly chat bubble style with Nu mascot
function PatientNudgeCard({ action, newest }: { action: NuAction; newest: boolean }) {
  const m = KIND_META[action.kind];
  return (
    <div className="flex items-start gap-2.5">
      <NuBlob size={32} />
      <div className="flex-1 rounded-2xl bg-white border shadow-sm p-3"
           style={{ borderColor: newest ? m.color + "88" : "#E2E8F0", boxShadow: newest ? `0 4px 14px -6px ${m.color}66` : undefined,
                    borderBottomLeftRadius: 4 }}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: m.color + "18", color: m.color }}>
            Nu · {m.label}
          </span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">· {fmtHour(action.at)}</span>
        </div>
        <div className="text-[13px] text-slate-900 leading-snug">
          {action.memberMessage}
        </div>
      </div>
    </div>
  );
}
