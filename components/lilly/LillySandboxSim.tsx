import { useEffect, useState } from "react";
import {
  RESPONSE_AREA_META,
  type LillyScenario, type PatientPersona, type SimStep,
} from "../../lib/lillySandboxData";

/**
 * LillySandboxSim — real-time simulation player for the Lilly Sandbox.
 * Shows the full flow: Patient activity → Fathom detects → message dispatched
 * inside Lilly Health → patient engages → Talk-to-Nu → follow-up loop closed.
 *
 * LEFT: Lilly Health phone mockup that changes with the cursor
 * RIGHT: Fathom activity feed (append-only log)
 */
export default function LillySandboxSim({ scenario }: { scenario: LillyScenario }) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = scenario.simulation;
  const total = steps.length;

  useEffect(() => { setIdx(0); setPlaying(false); }, [scenario.id]);

  useEffect(() => {
    if (!playing) return;
    if (idx >= total - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setIdx(i => Math.min(total - 1, i + 1)), 4500);
    return () => clearTimeout(t);
  }, [playing, idx, total]);

  const safe = Math.min(idx, total - 1);
  const step = steps[safe];
  const revealed = steps.slice(0, safe + 1);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap"
           style={{ background: `linear-gradient(90deg, ${scenario.color}12, #FFFFFF)` }}>
        <div>
          <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: scenario.color }}>
            Real-time simulation · seamless into Lilly Health
          </div>
          <div className="text-[15px] font-black text-slate-900 leading-tight" style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
            {step.actor === "Patient"      ? "Patient acts" :
             step.actor === "Fathom"       ? "Fathom decides" :
             step.actor === "Lilly Health" ? "Lilly Health delivers" :
                                              "Nu converses"} — step {safe + 1} of {total}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { setIdx(0); setPlaying(false); }}
                  className="w-8 h-8 rounded-lg grid place-items-center text-slate-600 bg-slate-100 hover:bg-slate-200" title="Reset">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
          <button onClick={() => setIdx(i => Math.max(0, i - 1))}
                  disabled={safe === 0}
                  className="w-8 h-8 rounded-lg grid place-items-center text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={() => {
                    if (safe === total - 1) { setIdx(0); setPlaying(true); }
                    else setPlaying(p => !p);
                  }}
                  className="h-8 px-3 rounded-lg text-[11px] font-black text-white"
                  style={{ background: scenario.color }}>
            {playing ? "▐▐ Pause" : (safe === total - 1 ? "↻ Replay" : "▶ Play")}
          </button>
          <button onClick={() => setIdx(i => Math.min(total - 1, i + 1))}
                  disabled={safe === total - 1}
                  className="w-8 h-8 rounded-lg grid place-items-center text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div className="h-full transition-all duration-500"
             style={{ width: `${((safe + 1) / total) * 100}%`, background: scenario.color }} />
      </div>

      {/* Body — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 p-4"
           style={{ background: "linear-gradient(180deg,#FAFBFF,#FFFFFF)" }}>
        {/* LEFT: Lilly Health phone that changes per step */}
        <div className="flex justify-center">
          <div key={step.id} style={{ animation: "sfade 380ms ease-out" }}>
            <LillyPhone step={step} persona={scenario.patient} />
          </div>
        </div>

        {/* RIGHT: current step description + Fathom activity feed */}
        <div className="space-y-3">
          <div className="rounded-2xl p-3.5 border" style={{ background: "white", borderColor: scenario.color + "44" }}>
            <div className="flex items-center gap-2 mb-1">
              <ActorChip actor={step.actor} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{step.at}</span>
            </div>
            <div className="text-[13px] font-black text-slate-900 leading-snug">{step.title}</div>
            <div className="text-[11px] text-slate-600 leading-relaxed mt-1.5">{step.detail}</div>
          </div>

          {/* Fathom activity feed — appends as steps reveal */}
          <div className="rounded-2xl overflow-hidden border"
               style={{ background: "linear-gradient(160deg,#1E1B4B,#0F172A)", borderColor: "rgba(94,234,212,0.3)" }}>
            <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#5EEAD4" }} />
              <div className="text-[9px] font-black uppercase tracking-widest text-teal-300">Fathom · live activity feed</div>
            </div>
            <div className="p-3 space-y-1.5" style={{ maxHeight: 340, overflowY: "auto" }}>
              {revealed.filter(s => s.fathomLog).map((s, i) => {
                const l = s.fathomLog!;
                const toneColor =
                  l.tone === "success" ? "#5EEAD4" :
                  l.tone === "warn"    ? "#F59E0B" :
                  l.tone === "primary" ? "#A5B4FC" : "#94A3B8";
                return (
                  <div key={s.id + i} className="rounded-lg px-2.5 py-1.5"
                       style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: toneColor }}>{l.action}</span>
                      <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-auto">{s.at}</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-300 leading-snug">{l.detail}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message-status banner */}
          <div className="rounded-lg px-3 py-1.5 flex items-center gap-2" style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}>
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-800">Every message shown</span>
            <span className="text-[10px] font-black text-amber-900">PROPOSED · Lilly approval pending</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sfade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// ActorChip — colored per actor
// ============================================================================
function ActorChip({ actor }: { actor: SimStep["actor"] }) {
  const meta: Record<SimStep["actor"], { bg: string; fg: string; border: string }> = {
    "Patient":       { bg: "#EEF2FF", fg: "#4338CA", border: "#C7D2FE" },
    "Fathom":        { bg: "#F0FDFA", fg: "#0F766E", border: "#99F6E4" },
    "Lilly Health":  { bg: "#FEF2F2", fg: "#9F1239", border: "#FCA5A5" },
    "Nu":            { bg: "#FEF3C7", fg: "#92400E", border: "#FCD34D" },
  };
  const m = meta[actor];
  return (
    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest"
          style={{ background: m.bg, color: m.fg, border: `1px solid ${m.border}` }}>
      {actor}
    </span>
  );
}

// ============================================================================
// LillyPhone — the patient's phone showing what's on screen at the current step
// ============================================================================
function LillyPhone({ step, persona }: { step: SimStep; persona: PatientPersona }) {
  return (
    <div style={{
      width: 260, height: 540, borderRadius: 40, padding: 8, position: "relative",
      background: "linear-gradient(180deg,#1F1930 0%,#100D1E 100%)",
      boxShadow: "0 24px 60px -18px rgba(0,0,0,0.5), 0 0 0 2px #2E2846",
    }}>
      {/* Side buttons */}
      <div style={{ position: "absolute", left: -1.5, top: 130, width: 3, height: 46, borderRadius: 2, background: "#0A0812" }} />
      <div style={{ position: "absolute", right: -1.5, top: 130, width: 3, height: 70, borderRadius: 2, background: "#0A0812" }} />
      <div style={{ width: "100%", height: "100%", borderRadius: 32, overflow: "hidden", background: "#FFFFFF", position: "relative" }}>
        {/* Dynamic island */}
        <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 82, height: 22, borderRadius: 14, background: "#000", zIndex: 20 }} />
        {renderScreen(step, persona)}
      </div>
    </div>
  );
}

function renderScreen(step: SimStep, persona: PatientPersona) {
  const d = step.screenData ?? {};
  switch (step.screen) {

    // ------------------ Lock-screen notification
    case "lilly-lock-notif":
      return (
        <div className="w-full h-full flex flex-col items-center px-3"
             style={{ background: "linear-gradient(160deg,#1E1B4B 0%,#312E81 30%,#0F172A 70%,#020617 100%)" }}>
          <div className="pt-3 pb-1 px-2 w-full flex items-center justify-between text-[10px] font-black text-white/90">
            <span>9:41</span><span className="text-[8px]">••• 4G ▮</span>
          </div>
          <div className="mt-6 text-center">
            <div className="text-[54px] font-black text-white tracking-tight leading-none">9:41</div>
            <div className="text-[11px] font-black text-white/80 mt-1">Today</div>
          </div>
          <div className="mt-8 w-full px-1">
            <div className="rounded-2xl p-2.5 shadow-2xl" style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)", animation: "pulseIn 1.4s ease-out" }}>
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
              <div className="text-[11px] font-black text-slate-900 leading-snug">{d.messageTitle}</div>
              {d.messageBody && <div className="text-[10px] text-slate-700 leading-snug mt-0.5">{d.messageBody}</div>}
            </div>
          </div>
          <div className="mt-auto pb-4 text-[8px] font-black text-white/50 uppercase tracking-widest">Delivered inside Lilly Health</div>
          <style jsx>{`
            @keyframes pulseIn {
              0%   { opacity: 0; transform: translateY(-8px) scale(0.98); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      );

    // ------------------ In-app message thread
    case "lilly-message":
      return (
        <LillyChrome persona={persona} activeTab="home">
          <div className="px-3 pt-2 pb-2">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Messages · from your care team</div>
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3" style={{ borderBottomLeftRadius: 4 }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[9px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', serif" }}>Lilly</span>
                <span className="text-[9px] font-black text-slate-700">Health</span>
                <span className="text-[7px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 border border-amber-300 rounded ml-auto px-1">
                  Proposed
                </span>
              </div>
              <div className="text-[12px] font-black text-slate-900 leading-snug">{d.messageTitle}</div>
              {d.messageBody && <div className="text-[10px] text-slate-700 leading-snug mt-1">{d.messageBody}</div>}
              <div className="mt-2 flex gap-1.5">
                <button className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black text-white" style={{ background: "#E63946" }}>See tips</button>
                <button className="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black text-slate-700 border border-slate-200">Talk to Nu</button>
              </div>
            </div>
          </div>
        </LillyChrome>
      );

    // ------------------ Talk to Nu inside Lilly Health
    case "lilly-talk-to-nu":
      return (
        <LillyChrome persona={persona} activeTab="home" title="Talk to Nu · in Lilly Health">
          <div className="px-3 pt-2 pb-2 space-y-2">
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-2 py-1.5 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full grid place-items-center" style={{ background: "radial-gradient(circle at 35% 30%, #FDE68A, #F59E0B 50%, #B45309)" }}>
                <span className="text-[7px] font-black text-slate-900">Nu</span>
              </div>
              <span className="text-[9px] font-black text-amber-800">Nu · inside Lilly Health</span>
            </div>
            {d.memberQuestion && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl px-2.5 py-1.5 text-[10px] text-white shadow-sm"
                     style={{ background: "linear-gradient(90deg,#4F5FE5,#0EA5A4)", borderBottomRightRadius: 4 }}>
                  {d.memberQuestion}
                </div>
              </div>
            )}
            {d.nuReply && (
              <div className="flex items-start gap-1.5">
                <div className="w-6 h-6 rounded-full grid place-items-center shrink-0" style={{ background: "radial-gradient(circle at 35% 30%, #FDE68A, #F59E0B 50%, #B45309)" }}>
                  <span className="text-[8px] font-black text-slate-900">Nu</span>
                </div>
                <div className="rounded-2xl bg-white border p-2" style={{ borderBottomLeftRadius: 4, borderColor: "#C7D2FE" }}>
                  {d.nuAreaLabel && (
                    <div className="text-[7px] font-black uppercase tracking-widest text-indigo-700 mb-0.5">Area · {d.nuAreaLabel}</div>
                  )}
                  <div className="text-[10px] text-slate-800 leading-snug">{d.nuReply}</div>
                </div>
              </div>
            )}
          </div>
        </LillyChrome>
      );

    // ------------------ Mood log
    case "lilly-mood-log":
      return (
        <LillyChrome persona={persona} activeTab="home" title="Log · this morning">
          <div className="px-3 pt-2">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">How are you feeling?</div>
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3 text-center">
              <div className="flex justify-center gap-1 mb-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-6 h-6 rounded-full grid place-items-center text-[10px] font-black ${i <= (d.moodValue ?? 0) ? "text-white" : "text-slate-500"}`}
                       style={{ background: i <= (d.moodValue ?? 0) ? "#E63946" : "#F1F5F9", border: "1px solid " + (i <= (d.moodValue ?? 0) ? "#B91C1C" : "#E2E8F0") }}>
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nausea intensity · {d.moodValue}/5</div>
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-1.5">
              <div className="text-[9px] font-black text-slate-700">Also logged: breakfast skipped</div>
            </div>
            <div className="mt-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Recorded in Lilly Health · shared with your care team</div>
          </div>
        </LillyChrome>
      );

    // ------------------ Follow-up state
    case "lilly-followup":
      return (
        <LillyChrome persona={persona} activeTab="home">
          <div className="px-3 pt-2">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500 grid place-items-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Handled inside Lilly Health</div>
              </div>
              <div className="text-[11px] font-black text-emerald-900 leading-snug">{d.followupText}</div>
            </div>
            <div className="mt-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Loop closed · trace logged</div>
          </div>
        </LillyChrome>
      );

    // ------------------ Lilly Health home (default idle)
    case "lilly-home":
    default:
      return (
        <LillyChrome persona={persona} activeTab="home">
          <div className="px-3 pt-2">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Today</div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm mb-2">
              <div className="px-3 py-2" style={{ background: "linear-gradient(135deg,#E63946,#F87171)" }}>
                <div className="text-[9px] font-black uppercase tracking-widest text-white/85">Next dose</div>
                <div className="text-[13px] font-black text-white">Semaglutide · Sunday</div>
              </div>
              <div className="px-3 py-2 bg-white text-[10px] text-slate-600">Reminder set · 10 AM</div>
            </div>
            <div className="rounded-2xl border border-slate-200 shadow-sm p-2.5 mb-2">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">This week</div>
              <div className="text-[11px] font-black text-slate-800">Coaching call · Wed 3 PM</div>
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2">
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Behind the scenes</div>
              <div className="text-[10px] font-black text-slate-800">Fathom is watching · nothing shown to patient yet</div>
            </div>
          </div>
        </LillyChrome>
      );
  }
}

// ============================================================================
// Lilly Health chrome — wraps every "phone" screen with the Lilly Health shell
// ============================================================================
function LillyChrome({ persona, activeTab = "home", title, children }:
  { persona: PatientPersona; activeTab?: "home" | "logbook" | "messages"; title?: string; children: React.ReactNode }) {
  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Status bar */}
      <div className="pt-3 pb-1 px-5 flex items-center justify-between text-[10px] tabular-nums font-black text-slate-900">
        <span>9:41</span><span className="text-[8px]">•••</span>
      </div>
      {/* Header */}
      <div className="px-3 pt-1 pb-2 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-black text-white shrink-0"
               style={{ background: "linear-gradient(135deg,#E63946,#F87171)" }}>{persona.initials}</div>
          <div>
            <div className="text-[7px] font-black uppercase tracking-widest text-slate-400 leading-tight">{title ?? "Good morning"}</div>
            <div className="flex items-baseline gap-1 leading-tight">
              <span className="text-[13px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', serif" }}>Lilly</span>
              <span className="text-[11px] font-black text-slate-800">Health</span>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: "linear-gradient(180deg,#FCFCFD 0%,#F8FAFC 100%)" }}>
        {children}
      </div>
      {/* Tab bar */}
      <div className="border-t border-slate-100 pt-1.5 pb-2.5 px-2 flex items-center justify-around bg-white">
        {(["home","logbook","messages","more"] as const).map(t => (
          <div key={t} className="flex flex-col items-center gap-0.5">
            <div className={`w-4 h-4 rounded ${activeTab === t ? "bg-red-500" : "bg-slate-300"}`} />
            <span className={`text-[7px] font-black ${activeTab === t ? "text-red-600" : "text-slate-400"}`}>
              {t[0].toUpperCase() + t.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
