import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

import ScenarioPlayer, { USE_CASES } from "../components/lilly/ScenarioPlayer";
import ScenarioCompare from "../components/lilly/ScenarioCompare";
import HabitnuLogo from "../components/journey/HabitnuLogo";

type Mode = "focus" | "compare";

/**
 * /scenarios — Interactive step-by-step simulation for how Fathom manifests
 * inside the Lilly Health app across all four integration levels.
 *
 * Two modes:
 *   Focus   — pick a use case + level, watch it unfold in a single player
 *   Compare — pick a level, watch all 3 use cases advance side-by-side
 */
export default function ScenariosPage() {
  const [mode, setMode] = useState<Mode>("focus");
  const [useCaseId, setUseCaseId] = useState<string>(USE_CASES[0].id);
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3 | 4>(1);

  const useCase = USE_CASES.find(u => u.id === useCaseId) ?? USE_CASES[0];
  const scenario = useCase.scenarios.find(s => s.id === activeLevel) ?? useCase.scenarios[0];

  return (
    <>
      <Head>
        <title>Simulate All 4 Scenarios — Habitnu × Lilly Health</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap" />
      </Head>

      <div
        className="min-h-screen"
        style={{
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        }}
      >
        {/* Top co-brand bar */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <HabitnuLogo />
            <span className="text-slate-300 text-xl font-black">|</span>
            <div className="flex items-center gap-1.5">
              <span
                className="text-[18px] font-black italic"
                style={{ color: "#E63946", fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif" }}
              >Lilly</span>
              <span className="text-[14px] font-black text-slate-800">Health</span>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/four-ways"     className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">4 ways to partner →</Link>
            <Link href="/health-ring"   className="px-3 py-1.5 rounded-lg text-[12px] font-black text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition">Ring · Live →</Link>
            <Link href="/orchestration" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition">Under the hood →</Link>
            <Link href="/journey"       className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">Sally's day →</Link>
            <Link href="/stars"         className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">Star vitals →</Link>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 mb-3">
              Live simulation
            </div>
            <h1
              className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3"
              style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}
            >
              See how Fathom lives inside Lilly Health — at every level.
            </h1>
            <p className="text-[14px] md:text-[15px] text-slate-600 leading-relaxed">
              Focus on one story, or compare how the same integration tier handles three different member moments.
            </p>
          </div>

          {/* Boundary strip — Lilly data → Fathom orchestrates → Lilly delivers */}
          <BoundaryStrip />

          {/* Mode toggle */}
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-1 rounded-2xl bg-white border border-slate-200 shadow-sm p-1">
              <ModeButton active={mode === "focus"}   onClick={() => setMode("focus")}   label="Focus mode"   sub="One use case · one level" />
              <ModeButton active={mode === "compare"} onClick={() => setMode("compare")} label="Compare mode" sub="Same level · 3 use cases" />
            </div>
          </div>

          {mode === "focus" && (
            <>
              {/* Use-case dropdown */}
              <div className="mb-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                     style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                  <UseCaseIcon kind={useCase.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 block mb-0.5">
                    Use case
                  </label>
                  <select
                    value={useCaseId}
                    onChange={e => { setUseCaseId(e.target.value); setActiveLevel(1); }}
                    className="text-[15px] font-black text-slate-900 bg-transparent border-0 outline-none cursor-pointer focus:outline-none"
                    style={{ appearance: "auto" }}
                  >
                    {USE_CASES.map(u => (
                      <option key={u.id} value={u.id}>{u.title}</option>
                    ))}
                  </select>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    <span className="font-black text-slate-700">{useCase.category}</span> · {useCase.premise}
                  </div>
                </div>
              </div>

              {/* Level tabs */}
              <div className="mb-6 rounded-2xl bg-white border border-slate-200 shadow-sm p-2 flex gap-1.5">
                {useCase.scenarios.map(s => {
                  const isActive = s.id === activeLevel;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveLevel(s.id)}
                      className={`flex-1 rounded-xl px-3 py-2.5 text-left transition ${isActive ? "shadow-sm" : "hover:bg-slate-50"}`}
                      style={isActive ? { background: s.tint, border: `1px solid ${s.color}` } : { background: "white", border: "1px solid transparent" }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-5 h-5 rounded-md grid place-items-center text-[10px] font-black text-white" style={{ background: s.color }}>
                          {s.id}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-slate-700" : "text-slate-500"}`}>
                          Level {s.id}
                        </span>
                      </div>
                      <div className={`text-[12px] font-black leading-snug ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                        {s.levelName}
                      </div>
                      <div className={`text-[10px] leading-snug mt-0.5 ${isActive ? "text-slate-600" : "text-slate-400"}`}>
                        {s.steps.length} steps · {s.id === 1 ? "invisible" : s.id === 2 ? "one nudge" : s.id === 3 ? "in-feed" : "full companion"}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Focus player */}
              <ScenarioPlayer scenario={scenario} />
            </>
          )}

          {mode === "compare" && (
            <ScenarioCompare useCases={USE_CASES} />
          )}

          {/* Footer note */}
          <div className="mt-10 rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 grid place-items-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F5FE5" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5l3 2" /></svg>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">How to read this</div>
                <div className="text-[13px] text-slate-700 leading-relaxed">
                  <span className="font-black text-slate-900">Lilly Health provides the data.</span>{" "}
                  <span className="font-black" style={{ color: "#4F5FE5" }}>Fathom orchestrates severity, context, pattern → decision + channel + timing.</span>{" "}
                  <span className="font-black text-slate-900">Lilly Health delivers the outcome.</span>
                  <br /><br />
                  {mode === "focus"
                    ? "Tap ▸ Why Fathom picked this action on any active step to see the orchestration reasoning. Numbers come first on every drill — tap See chart if you want the underlying graph."
                    : "Compare mode holds the integration tier constant and varies the member moment. Watch how a Level 2 popup fits four completely different clinical stories — same rail, four different Nu voices."}
                  {" "}Full tech deep-dive on the orchestration engine: <Link href="/orchestration" className="font-black text-indigo-700 underline">Under the hood →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Mode toggle button
// ============================================================================
function ModeButton({ active, onClick, label, sub }: { active: boolean; onClick: () => void; label: string; sub: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-left transition ${
        active ? "shadow-sm" : "hover:bg-slate-50"
      }`}
      style={active
        ? { background: "linear-gradient(90deg,#EEF2FF,#F5F3FF)", border: "1px solid #C7D2FE" }
        : { background: "transparent", border: "1px solid transparent" }}
    >
      <div className={`text-[12px] font-black leading-tight ${active ? "text-indigo-700" : "text-slate-700"}`}>
        {label}
      </div>
      <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${active ? "text-indigo-500" : "text-slate-400"}`}>
        {sub}
      </div>
    </button>
  );
}

// ============================================================================
// BoundaryStrip — Lilly data → Fathom → Lilly delivery (compact)
// ============================================================================
function BoundaryStrip() {
  return (
    <div className="mb-4 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_28px_1.4fr_28px_1fr] items-stretch">
        {/* Left: Lilly data */}
        <div className="p-3" style={{ background: "linear-gradient(180deg,#FEF2F2,#FFF1F2)" }}>
          <div className="text-[8px] font-black uppercase tracking-widest text-rose-700 mb-0.5">Lilly Health data in</div>
          <div className="text-[12px] font-black text-slate-900 leading-tight mb-1">Unified data plane</div>
          <div className="text-[10px] text-slate-700 leading-snug mb-1.5">CGM · doses · mood · food · weight</div>
          <div className="text-[7px] font-black uppercase tracking-widest text-rose-700/80 mb-1">via Lilly partnerships</div>
          <div className="flex flex-wrap gap-1">
            {["Oura", "Google Health", "Apple Health", "Dexcom"].map(v => (
              <span key={v} className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-white/80 text-rose-800 border border-rose-200">
                {v}
              </span>
            ))}
          </div>
          <div className="text-[8px] font-black italic text-rose-700/70 mt-1.5">Fathom pulls · never touches vendor APIs</div>
        </div>
        {/* Arrow 1 */}
        <div className="hidden md:flex items-center justify-center bg-white">
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
            <path d="M0 5h13M10 1l4 4-4 4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        {/* Middle: Fathom */}
        <div className="p-3 border-t md:border-t-0" style={{ background: "linear-gradient(180deg,#EEF2FF,#F5F3FF)", borderColor: "#C7D2FE" }}>
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[8px] font-black uppercase tracking-widest text-indigo-700">Fathom orchestrates</div>
            <Link href="/orchestration" className="text-[8px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800">
              Under the hood →
            </Link>
          </div>
          <div className="text-[12px] font-black text-slate-900 leading-tight mb-1">Severity · Context · Pattern → Decision · Channel · Timing</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {["signal", "severity 0-100", "context tags", "cohort match", "channel router", "send window"].map(t => (
              <span key={t} className="text-[8px] font-black px-1.5 py-0.5 rounded font-mono bg-white/70 text-indigo-800 border border-indigo-100">
                {t}
              </span>
            ))}
          </div>
        </div>
        {/* Arrow 2 */}
        <div className="hidden md:flex items-center justify-center bg-white">
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
            <path d="M0 5h13M10 1l4 4-4 4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        {/* Right: Lilly delivery */}
        <div className="p-3 border-t md:border-t-0" style={{ background: "linear-gradient(180deg,#FEF2F2,#FFF1F2)" }}>
          <div className="text-[8px] font-black uppercase tracking-widest text-rose-700 mb-0.5">Lilly Health delivers</div>
          <div className="text-[12px] font-black text-slate-900 leading-tight mb-1">Outcome to member</div>
          <div className="text-[10px] text-slate-700 leading-snug">Push · in-app card · Companion tab · coach console · SMS</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Small use-case icon glyph
// ============================================================================
function UseCaseIcon({ kind }: { kind: "meds" | "nausea" | "spike" | "plateau" | "habit" }) {
  const stroke = "#4F5FE5";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {kind === "meds"    && <><rect x="3" y="8" width="18" height="8" rx="4" /><path d="M12 8v8" /></>}
      {kind === "nausea"  && <><circle cx="12" cy="12" r="9" /><path d="M8 14c1.5-2 6.5-2 8 0" /><circle cx="9" cy="10" r="0.5" fill={stroke} /><circle cx="15" cy="10" r="0.5" fill={stroke} /></>}
      {kind === "spike"   && <><path d="M3 18l4-6 4 3 5-9 5 12" /></>}
      {kind === "plateau" && <><path d="M3 6L8 14L21 14" /></>}
      {kind === "habit"   && <><path d="M4 20L20 20M4 20L4 16L8 16L8 20M8 16L8 12L12 12L12 16M12 12L12 8L16 8L16 12M16 8L16 4L20 4L20 8" /></>}
    </svg>
  );
}
