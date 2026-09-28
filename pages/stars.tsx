import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

import {
  VITALS, Vital, tierFor, overallScore, SALLY_STARS,
  COHORT_AVG, WEEKLY_HISTORY, historyFor, overallHistory,
} from "../lib/starData";
import StarRating from "../components/vitals/StarRating";
import TouchpointIcon from "../components/twin/TouchpointIcon";
import HabitnuLogo from "../components/journey/HabitnuLogo";

import { ChatProvider } from "../contexts/ChatContext";
import { UpdateMeProvider } from "../contexts/UpdateMeContext";
import { JourneyConfigProvider } from "../contexts/JourneyConfigContext";
import ChatDrawer from "../components/journey/ChatDrawer";
import NuChatFAB from "../components/journey/NuChatFAB";

type TabKey = "today" | "history";

export default function StarsPage() {
  return (
    <JourneyConfigProvider>
      <UpdateMeProvider>
        <ChatProvider>
          <StarsInner />
          <ChatDrawer />
          <NuChatFAB />
        </ChatProvider>
      </UpdateMeProvider>
    </JourneyConfigProvider>
  );
}

function StarsInner() {
  const [selected, setSelected] = useState<Vital | null>(null);
  const [tab, setTab] = useState<TabKey>("today");

  const overall = overallScore();
  const overallTier = tierFor(overall.rating);
  const overallDelta = overall.rating - overall.lastWeek;
  const overallCohortDelta = overall.rating - COHORT_AVG.overall;

  const clinical  = VITALS.filter(v => v.category === "clinical");
  const lifestyle = VITALS.filter(v => v.category === "lifestyle");

  return (
    <>
      <Head>
        <title>Your Health · Star Ratings — Habitnu Journey Twin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap" />
      </Head>

      <div className="min-h-screen"
           style={{
             fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
             background: "linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 45%, #EEF2FF 100%)",
           }}>
        {/* Top bar */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b border-white/60 backdrop-blur bg-white/40 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <HabitnuLogo />
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
              Your health, in stars
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/journey"      className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">Sally's day →</Link>
            <Link href="/mirror"       className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">Nu's Mirror →</Link>
            <Link href="/cgm-explorer" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">CGM Insights →</Link>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-600 mb-3">
              Your health right now
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4"
                style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
              {SALLY_STARS.name.split(" ")[0]}, you&apos;re at {overall.rating.toFixed(1)} stars.
            </h1>
            <p className="text-[15px] md:text-[16px] text-slate-600 leading-relaxed">
              A single number for your whole health this fortnight. Below, eight vitals — each rated 1 to 5 stars. Tap any one for the numbers and the story.
            </p>
          </div>

          {/* Overall score badge */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="rounded-3xl p-8 shadow-lg border text-center relative overflow-hidden"
                 style={{ background: overallTier.bg, borderColor: overallTier.border }}>
              <div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: overallTier.fg }}>
                Overall · {overallTier.label}
              </div>
              <div className="my-3 flex justify-center">
                <StarRating rating={overall.rating} size={44} />
              </div>
              <div className="text-5xl font-black tabular-nums text-slate-900 mt-1">
                {overall.rating.toFixed(1)}
                <span className="text-2xl font-bold text-slate-500 ml-1">/ 5</span>
              </div>
              <div className="mt-2 text-[13px] font-medium" style={{ color: overallTier.fg }}>
                {overallDelta > 0
                  ? `▲ Up ${overallDelta.toFixed(1)} from last week`
                  : overallDelta < 0
                  ? `▼ Down ${Math.abs(overallDelta).toFixed(1)} from last week`
                  : "Steady vs. last week"}
              </div>
              <div className="mt-3 pt-3 border-t border-white/60 flex items-center justify-center gap-3">
                <CohortChip yourRating={overall.rating} cohortRating={COHORT_AVG.overall} />
                <span className="text-[10.5px] font-medium text-slate-500">
                  Cohort mean: {COHORT_AVG.overall.toFixed(1)} ·
                  {" "}
                  {overallCohortDelta > 0
                    ? `you +${overallCohortDelta.toFixed(1)}`
                    : `you ${overallCohortDelta.toFixed(1)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Tab strip */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-xl bg-white border border-slate-200 shadow-sm p-1">
              <button
                onClick={() => setTab("today")}
                className={"px-5 py-2 rounded-lg text-[12px] font-black transition " +
                  (tab === "today" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900")}>
                Today
              </button>
              <button
                onClick={() => setTab("history")}
                className={"px-5 py-2 rounded-lg text-[12px] font-black transition " +
                  (tab === "history" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900")}>
                12-week history
              </button>
            </div>
          </div>

          {/* Tab content */}
          {tab === "today" && (
            <div className="animate-fadein">
              <SectionHeader label="Clinical vitals" note="Higher weight in the overall score" />
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {clinical.map(v => (
                  <VitalCard key={v.id} vital={v} onClick={() => setSelected(v)} />
                ))}
              </div>
              <SectionHeader label="Lifestyle vitals" note="How your day supports your therapy" />
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {lifestyle.map(v => (
                  <VitalCard key={v.id} vital={v} onClick={() => setSelected(v)} />
                ))}
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="animate-fadein">
              <HistoryView />
            </div>
          )}

          {/* Nu framing footer */}
          <div className="mt-2 rounded-2xl p-6 border border-indigo-100"
               style={{ background: "linear-gradient(90deg, #EEF2FF 0%, #F5F1FF 100%)" }}>
            <div className="grid md:grid-cols-[auto_1fr] gap-4 items-center">
              <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow"
                    style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
                <span className="text-[12px] font-black text-white">Nu</span>
              </span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">Why stars, not graphs</div>
                <div className="text-[13.5px] text-slate-800 font-medium leading-relaxed">
                  Numbers and graphs can hide the story. A star rating is honest at a glance — you know instantly where you stand. When you want the details, they&apos;re one tap away.
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .animate-fadein { animation: fadein 220ms ease-out; }
          @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>

      {selected && <VitalDrill vital={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

// ============================================================================
// SectionHeader
// ============================================================================
function SectionHeader({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-600">{label}</div>
      <div className="text-[10.5px] text-slate-500 font-medium italic">{note}</div>
    </div>
  );
}

// ============================================================================
// CohortChip — "You beat cohort by +0.4" style
// ============================================================================
function CohortChip({ yourRating, cohortRating }: { yourRating: number; cohortRating: number }) {
  const delta = yourRating - cohortRating;
  const above = delta >= 0;
  const bg     = above ? "#ECFDF5" : "#FFFBEB";
  const border = above ? "#A7F3D0" : "#FDE68A";
  const fg     = above ? "#059669" : "#B45309";
  const arrow  = above ? "▲" : "▼";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums"
          style={{ background: bg, color: fg, border: `1px solid ${border}` }}>
      {arrow} {Math.abs(delta).toFixed(1)} vs. cohort
    </span>
  );
}

// ============================================================================
// VitalCard — star-first, with cohort compare
// ============================================================================
function VitalCard({ vital: v, onClick }: { vital: Vital; onClick: () => void }) {
  const tier = tierFor(v.rating);
  const delta = v.rating - v.lastWeekRating;
  const cohortAvg = COHORT_AVG[v.id] ?? 3.5;
  return (
    <button onClick={onClick}
            className="text-left w-full rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition p-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
             style={{ background: tier.bg, border: `1px solid ${tier.border}` }}>
          <TouchpointIcon kind={v.icon} color={tier.chip} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-[14px] font-black text-slate-900">{v.name}</div>
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: tier.bg, color: tier.fg, border: `1px solid ${tier.border}` }}>
              {tier.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StarRating rating={v.rating} size={18} />
            <span className="text-[13px] font-black tabular-nums text-slate-800">{v.rating.toFixed(1)}</span>
            {delta !== 0 && (
              <span className={"text-[10px] font-black tabular-nums " + (delta > 0 ? "text-emerald-600" : "text-rose-600")}>
                {delta > 0 ? "▲ +" : "▼ "}{Math.abs(delta).toFixed(1)}
              </span>
            )}
            <CohortChip yourRating={v.rating} cohortRating={cohortAvg} />
          </div>
          <div className="text-[12.5px] text-slate-600 font-medium leading-snug">{v.headline}</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] font-black tabular-nums text-slate-800">
              {v.value}{v.unit && <span className="text-[10px] font-medium text-slate-500 ml-1">{v.unit}</span>}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">See details →</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// HistoryView — 12-week overall trend + per-vital sparklines
// ============================================================================
function HistoryView() {
  const overallSeries = overallHistory();
  return (
    <div className="space-y-6">
      {/* Big overall chart */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Overall rating · last 12 weeks</div>
            <div className="text-[15px] font-black text-slate-900">Steady climb — 3.2 → 4.1</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Delta 12w</div>
            <div className="text-2xl font-black tabular-nums text-emerald-600">+0.9</div>
          </div>
        </div>
        <OverallHistoryChart values={overallSeries} labels={WEEKLY_HISTORY.map(w => w.label)} />
      </div>

      {/* Per-vital mini history grid */}
      <div>
        <SectionHeader label="Per-vital 12-week history" note="Sparkline shows the star trajectory" />
        <div className="grid md:grid-cols-2 gap-3">
          {VITALS.map(v => (
            <VitalHistoryCard key={v.id} vital={v} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OverallHistoryChart({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 720, H = 200, PAD = 30;
  const min = 1, max = 5;
  const N = values.length;
  const xAt = (i: number) => PAD + ((W - 2 * PAD) * i) / (N - 1);
  const yAt = (v: number) => PAD + (H - 2 * PAD) * (1 - (v - min) / (max - min));
  const path = values.map((v, i) => (i === 0 ? "M" : "L") + ` ${xAt(i)} ${yAt(v)}`).join(" ");
  const areaPath = path + ` L ${xAt(N - 1)} ${H - PAD} L ${xAt(0)} ${H - PAD} Z`;
  // Horizontal gridlines at each star tier
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="200">
      {/* Tier background bands */}
      {[
        { top: yAt(5),   bottom: yAt(4.5), fill: "#ECFDF5" },
        { top: yAt(4.5), bottom: yAt(3.5), fill: "#F0FDF4" },
        { top: yAt(3.5), bottom: yAt(2.5), fill: "#EFF6FF" },
        { top: yAt(2.5), bottom: yAt(1.5), fill: "#FFFBEB" },
        { top: yAt(1.5), bottom: yAt(1),   fill: "#FEF2F2" },
      ].map((band, i) => (
        <rect key={i} x={PAD} y={band.top} width={W - 2 * PAD} height={band.bottom - band.top}
              fill={band.fill} opacity="0.6" />
      ))}
      {/* Area under the line */}
      <path d={areaPath} fill="#7C6BFF" opacity="0.10" />
      {/* Line */}
      <path d={path} fill="none" stroke="#5B4CE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {values.map((v, i) => (
        <circle key={i} cx={xAt(i)} cy={yAt(v)} r={3.5}
                fill={i === N - 1 ? "#5B4CE0" : "#7C6BFF"} />
      ))}
      {/* Y-axis star markers */}
      {[1, 2, 3, 4, 5].map(s => (
        <text key={s} x={PAD - 6} y={yAt(s) + 4} textAnchor="end"
              fontSize="10" fontWeight="700" fill="#94A3B8">{s}★</text>
      ))}
      {/* X-axis labels every 3 weeks */}
      {labels.map((l, i) => (
        i % 3 === 0 || i === N - 1 ? (
          <text key={i} x={xAt(i)} y={H - 8} textAnchor="middle"
                fontSize="10" fontWeight="700" fill="#94A3B8">{l}</text>
        ) : null
      ))}
    </svg>
  );
}

function VitalHistoryCard({ vital: v }: { vital: Vital }) {
  const series = historyFor(v.id);
  const tier = tierFor(v.rating);
  const delta12w = v.rating - (series[0] ?? v.rating);
  return (
    <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
           style={{ background: tier.bg, border: `1px solid ${tier.border}` }}>
        <TouchpointIcon kind={v.icon} color={tier.chip} size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[12.5px] font-black text-slate-900 truncate">{v.name}</div>
          <div className="flex items-center gap-1.5 shrink-0">
            <StarRating rating={v.rating} size={12} gap={1} />
            <span className="text-[11px] font-black tabular-nums text-slate-800">{v.rating.toFixed(1)}</span>
          </div>
        </div>
        <MiniSpark values={series} color={tier.chip} height={30} />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-slate-500 font-medium">12w ago: {(series[0] ?? 0).toFixed(1)}★</span>
          <span className={"text-[10px] font-black tabular-nums " + (delta12w >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {delta12w >= 0 ? "▲ +" : "▼ "}{Math.abs(delta12w).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniSpark({ values, color, height = 32 }: { values: number[]; color: string; height?: number }) {
  const W = 200, H = height;
  const min = 0, max = 5;
  const xAt = (i: number) => (W * i) / (values.length - 1);
  const yAt = (v: number) => H * (1 - (v - min) / (max - min));
  const path = values.map((v, i) => (i === 0 ? "M" : "L") + ` ${xAt(i)} ${yAt(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      <line x1={0} x2={W} y1={yAt(3.5)} y2={yAt(3.5)} stroke="#E2E8F0" strokeDasharray="2 3" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={xAt(i)} cy={yAt(v)} r={1.6} fill={color} />
      ))}
    </svg>
  );
}

// ============================================================================
// VitalDrill — modal
// ============================================================================
function VitalDrill({ vital: v, onClose }: { vital: Vital; onClose: () => void }) {
  const tier = tierFor(v.rating);
  const cohortAvg = COHORT_AVG[v.id] ?? 3.5;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="p-5 border-b flex items-start gap-3"
             style={{ borderColor: tier.border, background: tier.bg }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm border"
               style={{ borderColor: tier.border }}>
            <TouchpointIcon kind={v.icon} color={tier.chip} size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: tier.fg }}>
              {v.category} · {tier.label}
            </div>
            <div className="text-lg font-black text-slate-900 leading-tight">{v.name}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StarRating rating={v.rating} size={16} />
              <span className="text-[12px] font-black tabular-nums text-slate-700">{v.rating.toFixed(1)} / 5</span>
              <CohortChip yourRating={v.rating} cohortRating={cohortAvg} />
            </div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700 font-black leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Value</div>
              <div className="text-2xl font-black tabular-nums text-slate-900">{v.value}</div>
              {v.unit && <div className="text-[10px] text-slate-500 font-medium">{v.unit}</div>}
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">7-day trend</div>
              <MiniSpark values={v.trendData} color={tier.chip} height={40} />
              <div className="text-[10px] text-slate-500 font-medium">{v.trendLabel}</div>
            </div>
          </div>

          <div className="rounded-xl p-3.5" style={{ background: tier.bg, border: `1px solid ${tier.border}` }}>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] mb-1" style={{ color: tier.fg }}>
              What Nu suggests
            </div>
            <div className="text-[13.5px] text-slate-800 font-medium leading-relaxed">{v.detail}</div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium italic text-center">
            Rating updates daily. Cohort mean shown for context — every insight is calibrated to you.
          </div>
        </div>
      </div>
    </div>
  );
}
