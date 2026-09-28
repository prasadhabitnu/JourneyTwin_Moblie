import React, { useEffect, useState } from "react";

import { StepMockup } from "./ScenarioPlayer";
import type { Actor, Scenario, UseCase } from "../../lib/scenariosData";

/**
 * ScenarioCompare — side-by-side view of 3 use cases at the same integration
 * level. Shared step index advances all columns in lockstep so a Lilly reviewer
 * can watch how L2 (say) handles a missed dose, a nausea flare, and a CGM
 * pattern all at the same "step 3 of 6" moment.
 */

// ---- Actor chip (local copy, kept small)
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
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
      style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.fg }}
    >{actor}</span>
  );
}

// ---- Use case icon
function UseCaseIcon({ kind, size = 14 }: { kind: "meds" | "nausea" | "spike" | "plateau" | "habit"; size?: number }) {
  const stroke = "#4F5FE5";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {kind === "meds"    && <><rect x="3" y="8" width="18" height="8" rx="4" /><path d="M12 8v8" /></>}
      {kind === "nausea"  && <><circle cx="12" cy="12" r="9" /><path d="M8 14c1.5-2 6.5-2 8 0" /><circle cx="9" cy="10" r="0.5" fill={stroke} /><circle cx="15" cy="10" r="0.5" fill={stroke} /></>}
      {kind === "spike"   && <><path d="M3 18l4-6 4 3 5-9 5 12" /></>}
      {kind === "plateau" && <><path d="M3 6L8 14L21 14" /></>}
      {kind === "habit"   && <><path d="M4 20L20 20M4 20L4 16L8 16L8 20M8 16L8 12L12 12L12 16M12 12L12 8L16 8L16 12M16 8L16 4L20 4L20 8" /></>}
    </svg>
  );
}

// ---- Level meta
const LEVEL_META: Record<1|2|3|4, { name: string; color: string; tint: string }> = {
  1: { name: "Persistence Intelligence", color: "#0EA5E9", tint: "#DBEAFE" },
  2: { name: "Smart Popup",              color: "#4F5FE5", tint: "#E0E7FF" },
  3: { name: "Insight Cards",            color: "#0EA5A4", tint: "#CCFBF1" },
  4: { name: "HabitNu Companion",        color: "#7C3AED", tint: "#EDE9FE" },
};

// ============================================================================
// Component
// ============================================================================
export default function ScenarioCompare({ useCases }: { useCases: UseCase[] }) {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(2);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Reset step when level changes
  useEffect(() => { setStepIdx(0); setPlaying(false); }, [level]);

  // Compute per-column scenarios + shared max step count
  const columns = useCases.map(uc => {
    const scenario = uc.scenarios.find(s => s.id === level)!;
    return { uc, scenario };
  });
  const maxSteps = Math.max(...columns.map(c => c.scenario.steps.length));

  // Auto-advance
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= maxSteps - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStepIdx(i => Math.min(i + 1, maxSteps - 1)), 6000);
    return () => clearTimeout(t);
  }, [playing, stepIdx, maxSteps]);

  const meta = LEVEL_META[level];
  const safeStep = Math.min(stepIdx, maxSteps - 1);
  const isLast = safeStep === maxSteps - 1;

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100"
           style={{ background: `linear-gradient(90deg, ${meta.tint}55, #FFFFFF)` }}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
                    style={{ background: meta.color }}>
                Level {level} · {meta.name}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Compare mode</span>
            </div>
            <div className="text-[15px] font-black text-slate-900 leading-snug">
              Same integration tier · three different member moments · advancing together.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStepIdx(i => Math.max(0, i - 1))}
              disabled={safeStep === 0}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              title="Previous step"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              onClick={() => {
                if (isLast) { setStepIdx(0); setPlaying(true); }
                else setPlaying(p => !p);
              }}
              className="px-3 h-8 rounded-lg text-[11px] font-black text-white grid place-items-center"
              style={{ background: meta.color }}
            >
              {playing ? "Pause" : (isLast ? "Replay" : "Play all")}
            </button>
            <button
              onClick={() => setStepIdx(i => Math.min(maxSteps - 1, i + 1))}
              disabled={isLast}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              title="Next step"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <div className="text-[10px] font-black text-slate-500 ml-1 tabular-nums">
              Step {safeStep + 1}/{maxSteps}
            </div>
          </div>
        </div>

        {/* Level tabs */}
        <div className="flex gap-1.5">
          {([1, 2, 3, 4] as const).map(l => {
            const lm = LEVEL_META[l];
            const isActive = l === level;
            return (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-left transition ${isActive ? "shadow-sm" : "hover:bg-slate-50 bg-white"}`}
                style={isActive
                  ? { background: lm.tint, border: `1px solid ${lm.color}` }
                  : { border: "1px solid #E2E8F0" }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded grid place-items-center text-[9px] font-black text-white" style={{ background: lm.color }}>{l}</span>
                  <span className={`text-[10px] font-black ${isActive ? "text-slate-900" : "text-slate-700"}`}>{lm.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div className="h-full transition-all duration-500"
             style={{ width: `${((safeStep + 1) / maxSteps) * 100}%`, background: meta.color }} />
      </div>

      {/* 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 px-3 py-6"
           style={{ background: "linear-gradient(180deg,#FAFBFF,#FFFFFF)" }}>
        {columns.map(({ uc, scenario }) => {
          const scenSafeIdx = Math.min(safeStep, scenario.steps.length - 1);
          const step = scenario.steps[scenSafeIdx];
          const atEnd = scenSafeIdx === scenario.steps.length - 1 && safeStep >= scenario.steps.length - 1;
          return (
            <div key={uc.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {/* Column header */}
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2"
                   style={{ background: scenario.tint + "44" }}>
                <div className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
                     style={{ background: "white", border: `1px solid ${scenario.color}` }}>
                  <UseCaseIcon kind={uc.icon} size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 truncate">{uc.shortLabel}</div>
                  <div className="text-[11px] font-black text-slate-900 truncate leading-tight">{uc.title}</div>
                </div>
              </div>

              {/* Phone (scaled to fit column) */}
              <div className="flex justify-center pt-4 pb-2" style={{ height: 460 }}>
                <div key={step.id + safeStep}
                     style={{
                       transform: "scale(0.66)",
                       transformOrigin: "top center",
                       animation: "cmpFade 380ms ease-out",
                     }}>
                  <StepMockup kind={step.mockup} color={scenario.color} data={step.data} />
                </div>
              </div>

              {/* Step context */}
              <div className="mx-3 mt-2 rounded-xl border p-2.5"
                   style={{ background: "white", borderColor: scenario.color + "44" }}>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{step.time}</span>
                  <ActorChip actor={step.actor} />
                  {atEnd && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200">
                      Done
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-black text-slate-900 leading-snug">{step.title}</div>
                <div className="text-[10px] text-slate-600 leading-relaxed mt-1">{step.description}</div>
              </div>

              {/* Step dots */}
              <div className="mt-2 mb-3 flex items-center justify-center gap-1">
                {scenario.steps.map((_, i) => (
                  <div key={i}
                       className="w-1.5 h-1.5 rounded-full transition-colors"
                       style={{
                         background: i === scenSafeIdx
                           ? scenario.color
                           : i < scenSafeIdx ? "#94A3B8" : "#E2E8F0",
                       }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Outcome strip when everyone is done */}
      {isLast && (
        <div className="mx-4 mb-4 rounded-2xl p-4 border"
             style={{ background: meta.tint + "88", borderColor: meta.color }}>
          <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: meta.color }}>
            All {columns.length} use cases · Level {level} outcomes
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            {columns.map(({ uc, scenario }) => (
              <div key={uc.id} className="rounded-xl bg-white/70 border border-white p-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{uc.shortLabel}</div>
                <div className="text-[11px] text-slate-800 leading-relaxed">{scenario.outcome}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes cmpFade {
          from { opacity: 0; transform: translateY(4px) scale(0.66); }
          to   { opacity: 1; transform: translateY(0) scale(0.66); }
        }
      `}</style>
    </div>
  );
}
