import { useState } from "react";
import {
  NOW, DAWN, MEALS, EXERCISE, SLEEP,
  BEST_DAY, WEEKLY, SCENARIOS, NEXT_WEEK_HEADLINE,
} from "../../lib/cgmInsightsData";

// ============================================================================
// InsightCard — the reusable pattern: number-first, tap to reveal chart.
// ============================================================================
interface InsightCardProps {
  eyebrow: string;
  eyebrowColor?: string;
  headline: React.ReactNode;
  detail?: React.ReactNode;
  extras?: React.ReactNode;   // extra stats above the chart toggle
  chart?: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;        // driven by page-level Simple/Detail toggle
  accent?: string;
}
function InsightCard({
  eyebrow, eyebrowColor = "#4F5FE5",
  headline, detail, extras, chart, defaultOpen = false, forceOpen = false, accent = "#5B4CE0",
}: InsightCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = forceOpen || open;
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] mb-1" style={{ color: eyebrowColor }}>
        {eyebrow}
      </div>
      <div className="text-slate-900 leading-tight">{headline}</div>
      {detail && <div className="text-[13px] text-slate-600 font-medium leading-relaxed mt-1.5">{detail}</div>}
      {extras && <div className="mt-3">{extras}</div>}
      {chart && (
        <div className="mt-3">
          {!forceOpen && (
            <button onClick={() => setOpen(v => !v)}
                    className="text-[11.5px] font-black inline-flex items-center gap-1 hover:brightness-90 transition"
                    style={{ color: accent }}>
              {isOpen ? "Hide chart" : "See the chart"}
              <span className="text-[10px]">{isOpen ? "▲" : "▼"}</span>
            </button>
          )}
          {isOpen && <div className="mt-3">{chart}</div>}
        </div>
      )}
    </div>
  );
}

function NuNote({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3.5 flex items-start gap-3">
      <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow"
            style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
        <span className="text-[9px] font-black text-white">Nu</span>
      </span>
      <div className="text-[12.5px] text-slate-800 font-medium leading-relaxed">{text}</div>
    </div>
  );
}

// ============================================================================
// LENS 1 — Now
// ============================================================================
export function NowLens({ detailMode = false }: { detailMode?: boolean }) {
  const gap = NOW.tirTarget - NOW.tirNow;
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <InsightCard
          eyebrow="Time in range · now"
          eyebrowColor="#059669"
          accent="#059669"
          headline={<div><span className="text-5xl font-black text-emerald-600">{NOW.tirNow}%</span></div>}
          detail={`${gap} points below your ${NOW.tirTarget}% target. Up 4 points from last week.`}
          chart={<TirGauge tir={NOW.tirNow} target={NOW.tirTarget} />}
          forceOpen={detailMode}
        />
        <InsightCard
          eyebrow="Latest reading"
          headline={
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-slate-900">{NOW.latestReading}</span>
              <span className="text-sm font-bold text-slate-500 mb-2">mg/dL</span>
            </div>
          }
          detail={`Steady for 30 minutes. Sensor quality: high.`}
        />
        <InsightCard
          eyebrow="Forecast · next 3 hours"
          eyebrowColor="#7C3AED"
          accent="#7C3AED"
          headline={<div><span className="text-3xl font-black text-slate-900">96 – 130 mg/dL</span></div>}
          detail="Expected range if you don't snack. High likely between 12:30 and 1:30 PM."
          chart={<ForecastChart past={NOW.last3h} mean={NOW.forecast.mean} upper={NOW.forecast.upper} lower={NOW.forecast.lower} />}
          forceOpen={detailMode}
        />
      </div>
      <NuNote text={NOW.nuNarrative} />
    </div>
  );
}

// ============================================================================
// LENS 2 — Patterns
// ============================================================================
export function PatternsLens({ detailMode = false }: { detailMode?: boolean }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <InsightCard
        eyebrow="Dawn phenomenon · physiological"
        eyebrowColor="#4F5FE5"
        accent="#4F5FE5"
        headline={<div><span className="text-4xl font-black text-indigo-700">+{DAWN.peakDelta}</span> <span className="text-lg font-black text-slate-500">mg/dL</span></div>}
        detail="Your glucose rises from 96 to 128 between 3 and 7 AM. Cortisol-driven — normal for you."
        chart={<DawnChart />}
        forceOpen={detailMode}
      />

      <InsightCard
        eyebrow="Post-meal fingerprint · food response"
        eyebrowColor="#B45309"
        accent="#B45309"
        headline={<div className="text-[15px] font-black text-slate-800">Dosa spikes you 40 mg/dL more than eggs.</div>}
        detail="Dosa peaks at 178. Eggs + spinach stays at 138. Fiber-first dinners stay under 150."
        extras={
          <div className="grid grid-cols-3 gap-2">
            {MEALS.map(m => (
              <div key={m.name} className="rounded-lg border border-slate-200 p-2">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Peak</div>
                <div className="text-xl font-black tabular-nums" style={{ color: m.color }}>{m.peak}</div>
                <div className="text-[10px] text-slate-600 font-medium truncate">{m.name}</div>
              </div>
            ))}
          </div>
        }
        chart={<MealsChart />}
        forceOpen={detailMode}
      />

      <InsightCard
        eyebrow="Post-dinner walk ROI · behavior"
        eyebrowColor="#059669"
        accent="#059669"
        headline={<div><span className="text-4xl font-black text-emerald-600">−{EXERCISE.averageDrop}</span> <span className="text-lg font-black text-slate-500">mg/dL peak</span></div>}
        detail={`A 20-min walk within 30 min of dinner cuts your post-meal peak from ${EXERCISE.noWalkPeak} to ${EXERCISE.withWalkPeak}. Studied over ${EXERCISE.daysStudied} days.`}
        chart={<ExerciseChart />}
        forceOpen={detailMode}
      />

      <InsightCard
        eyebrow="Sleep → fasting glucose · physiological"
        eyebrowColor="#7C3AED"
        accent="#7C3AED"
        headline={<div><span className="text-4xl font-black text-violet-700">−5</span> <span className="text-lg font-black text-slate-500">mg/dL per hour</span></div>}
        detail="Every extra hour of sleep drops your next-morning fasting glucose by about 5 mg/dL. 5.8h → 128. 7.8h → 100."
        chart={<SleepChart />}
        forceOpen={detailMode}
      />
    </div>
  );
}

// ============================================================================
// LENS 3 — Best Day
// ============================================================================
export function BestDayLens({ detailMode = false }: { detailMode?: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <InsightCard
          eyebrow="Your best day"
          eyebrowColor="#059669"
          accent="#059669"
          headline={<div className="text-2xl font-black text-slate-900">{BEST_DAY.date}</div>}
          detail={`Mean glucose ${BEST_DAY.meanGlucose} mg/dL. Nothing above 170 all day.`}
        />
        <InsightCard
          eyebrow="Time in range that day"
          eyebrowColor="#059669"
          accent="#059669"
          headline={<div><span className="text-5xl font-black text-emerald-600">{BEST_DAY.tir}%</span></div>}
          detail="Your all-time high. Baseline was 71% two weeks earlier."
        />
        <InsightCard
          eyebrow="Today matches Jul 1 by"
          eyebrowColor="#7C3AED"
          accent="#7C3AED"
          headline={<div><span className="text-5xl font-black text-violet-700">{BEST_DAY.matchScore}%</span></div>}
          detail="Where today differs: breakfast was heavier, walk was skipped, sleep was 45 min shorter."
        />
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 mb-3">What made Jul 1 work</div>
        <ol className="space-y-2.5">
          {BEST_DAY.recipe.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-[13.5px] text-slate-800 font-medium leading-snug">
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">{i + 1}</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </div>

      <InsightCard
        eyebrow="Evidence · both curves overlaid"
        headline={<div className="text-[14px] font-black text-slate-800">Compare today with Jul 1</div>}
        detail="Green line is Jul 1. Grey dashed is today. Look at the dinner window — the biggest difference."
        chart={<BestDayChart best={BEST_DAY.curve} today={BEST_DAY.today} hours={BEST_DAY.hours} />}
        forceOpen={detailMode}
      />
    </div>
  );
}

// ============================================================================
// LENS 4 — What Changed
// ============================================================================
export function WhatChangedLens({ detailMode = false }: { detailMode?: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <InsightCard
          eyebrow="Net change this week"
          eyebrowColor="#059669"
          accent="#059669"
          headline={<div><span className="text-5xl font-black text-emerald-600">+{WEEKLY.netDelta}</span> <span className="text-lg font-black text-slate-500">pp</span></div>}
          detail="Time-in-Range moved from 82% last week to 87% this week."
        />
        <InsightCard
          eyebrow="Four-week trajectory"
          headline={<div className="text-2xl font-black text-slate-900 tabular-nums">71% → 76% → 82% → 87%</div>}
          detail="Each week has improved. Steady climb, no plateau yet."
          chart={<WeeklyBars />}
          forceOpen={detailMode}
        />
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-3">What moved the needle</div>
        <div className="space-y-2.5">
          {WEEKLY.causes.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition">
              <div className="w-1.5 h-10 rounded-full shrink-0" style={{ background: c.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-black text-slate-900">{c.feature}</div>
                <div className="text-[11px] text-slate-500 font-medium">{c.change}</div>
              </div>
              <div className={"text-lg font-black tabular-nums shrink-0 " +
                (c.contribution > 0 ? "text-emerald-600" : "text-rose-600")}>
                {c.contribution > 0 ? "+" : ""}{c.contribution.toFixed(1)} pp
              </div>
            </div>
          ))}
        </div>
      </div>

      <NuNote text={WEEKLY.nuNarrative} />
    </div>
  );
}

// ============================================================================
// LENS 5 — Ahead
// ============================================================================
export function AheadLens({ detailMode = false }: { detailMode?: boolean }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-1">Next 7 days · target {NEXT_WEEK_HEADLINE.targetFloor}% TIR</div>
        <div className="text-[14px] text-slate-800 font-medium leading-relaxed">{NEXT_WEEK_HEADLINE.narrative}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {SCENARIOS.map(s => (
          <ScenarioNumberCard key={s.id} s={s} forceOpen={detailMode} />
        ))}
      </div>
    </div>
  );
}

function ScenarioNumberCard({ s, forceOpen }: { s: typeof SCENARIOS[number]; forceOpen: boolean }) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;
  const featured = s.tag === "Recommended";
  return (
    <div className={featured ? "rounded-2xl p-[2.5px] shadow-md" : "rounded-2xl shadow-sm"}
         style={featured ? { background: `linear-gradient(135deg, ${s.color} 0%, #10B981 100%)` } : {}}>
      <div className={"bg-white " + (featured ? "rounded-[13px]" : "rounded-2xl border border-slate-100") + " p-5"}>
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                style={{ background: s.color + "20", color: s.color, border: `1px solid ${s.color}40` }}>
            {s.tag}
          </span>
          <span className="text-[10px] font-black text-slate-500 tabular-nums">Δ {s.delta > 0 ? "+" : ""}{s.delta} pp</span>
        </div>
        <div className="text-[14.5px] font-black text-slate-900 leading-tight mb-2">{s.label}</div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-5xl font-black tabular-nums" style={{ color: s.color }}>{s.projectedTir}%</div>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">proj. TIR</div>
        </div>
        <div className="text-[12px] text-slate-600 font-medium leading-relaxed mt-2">{s.description}</div>
        {!forceOpen && (
          <button onClick={() => setOpen(v => !v)}
                  className="mt-3 text-[11.5px] font-black inline-flex items-center gap-1"
                  style={{ color: s.color }}>
            {isOpen ? "Hide 7-day sparkline" : "See 7-day sparkline"}
            <span className="text-[10px]">{isOpen ? "▲" : "▼"}</span>
          </button>
        )}
        {isOpen && (
          <div className="mt-3">
            <ScenarioSpark values={s.curve} color={s.color} />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Chart components (unchanged from previous version)
// ============================================================================

function TirGauge({ tir, target }: { tir: number; target: number }) {
  const r = 90, cx = 110, cy = 110;
  const circ = 2 * Math.PI * r;
  const arcLen = (tir / 100) * circ;
  const targetArc = (target / 100) * circ;
  return (
    <div className="flex justify-center">
      <svg width="220" height="180" viewBox="0 0 220 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF2FF" strokeWidth="18" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#A7F3D0" strokeWidth="4"
                strokeDasharray={`${targetArc} ${circ}`} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10B981" strokeWidth="18"
                strokeDasharray={`${arcLen} ${circ}`} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="42" fontWeight="900" fill="#0F172A">{tir}%</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="10" fontWeight="800" fill="#6B7280" letterSpacing="1.3">TIR</text>
        <text x={cx} y={cy + 32} textAnchor="middle" fontSize="9" fontWeight="700" fill="#059669">target {target}%</text>
      </svg>
    </div>
  );
}

function ForecastChart({ past, mean, upper, lower }: { past: number[]; mean: number[]; upper: number[]; lower: number[] }) {
  const W = 520, H = 180, PAD = 20;
  const allVals = [...past, ...upper, ...lower];
  const min = 60, max = Math.max(160, ...allVals) + 10;
  const totalPoints = past.length + mean.length;
  const xAt = (i: number) => PAD + ((W - 2 * PAD) * i) / (totalPoints - 1);
  const yAt = (v: number) => PAD + (H - 2 * PAD) * (1 - (v - min) / (max - min));
  const pastPath = past.map((v, i) => (i === 0 ? "M" : "L") + ` ${xAt(i)} ${yAt(v)}`).join(" ");
  const meanPath = mean.map((v, i) => (i === 0 ? "M" : "L") + ` ${xAt(past.length + i)} ${yAt(v)}`).join(" ");
  const bandTop = upper.map((v, i) => `${xAt(past.length + i)} ${yAt(v)}`).join(" L ");
  const bandBot = [...lower].reverse().map((v, i) => `${xAt(past.length + lower.length - 1 - i)} ${yAt(v)}`).join(" L ");
  const bandPath = `M ${bandTop} L ${bandBot} Z`;
  const y70 = yAt(70), y180 = yAt(180);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="180">
      <rect x={PAD} y={y180} width={W - 2 * PAD} height={y70 - y180} fill="#ECFDF5" opacity="0.7" />
      <line x1={xAt(past.length - 1)} x2={xAt(past.length - 1)} y1={PAD} y2={H - PAD}
            stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
      <text x={xAt(past.length - 1) - 4} y={PAD + 12} textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="700">NOW</text>
      <path d={bandPath} fill="#C7D2FE" opacity="0.4" />
      <path d={pastPath} fill="none" stroke="#5B4CE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={meanPath} fill="none" stroke="#7C6BFF" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
      <text x={5} y={y180 + 4} fontSize="9" fill="#94A3B8" fontWeight="700">180</text>
      <text x={5} y={y70  + 4} fontSize="9" fill="#94A3B8" fontWeight="700">70</text>
    </svg>
  );
}

function DawnChart() {
  const W = 320, H = 130, PAD = 24;
  const values = DAWN.values;
  const min = 80, max = 140;
  const xAt = (i: number) => PAD + ((W - 2 * PAD) * i) / (values.length - 1);
  const yAt = (v: number) => PAD + (H - 2 * PAD) * (1 - (v - min) / (max - min));
  const path = values.map((v, i) => (i === 0 ? "M" : "L") + ` ${xAt(i)} ${yAt(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="130">
      <line x1={PAD} x2={W - PAD} y1={yAt(100)} y2={yAt(100)} stroke="#E2E8F0" strokeDasharray="2 3" />
      <path d={path} fill="none" stroke="#4F5FE5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={xAt(i)} cy={yAt(v)} r={3.5} fill="#4F5FE5" />
      ))}
      {DAWN.hours.map((h, i) => (
        <text key={i} x={xAt(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#94A3B8" fontWeight="700">{h}</text>
      ))}
    </svg>
  );
}

function MealsChart() {
  return (
    <div className="flex flex-col gap-1.5 pt-1">
      {MEALS.map(m => {
        const pct = Math.min(100, (m.peak / 200) * 100);
        return (
          <div key={m.name}>
            <div className="flex items-center justify-between text-[10px] font-black mb-0.5">
              <span className="text-slate-700">{m.name}</span>
              <span className="tabular-nums" style={{ color: m.color }}>{m.peak} mg/dL</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ background: m.color, width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExerciseChart() {
  const W = 320, H = 130, PAD = 20;
  const withWalk = [110, 122, 138, 152, 138, 122, 112];
  const withoutWalk = [110, 128, 148, 178, 168, 148, 128];
  const min = 90, max = 190;
  const N = withWalk.length;
  const xAt = (i: number) => PAD + ((W - 2 * PAD) * i) / (N - 1);
  const yAt = (v: number) => PAD + (H - 2 * PAD) * (1 - (v - min) / (max - min));
  const p = (arr: number[]) => arr.map((v, i) => (i === 0 ? "M" : "L") + ` ${xAt(i)} ${yAt(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="130">
      <path d={p(withoutWalk)} fill="none" stroke="#F87171" strokeWidth="2.4" />
      <path d={p(withWalk)}    fill="none" stroke="#10B981" strokeWidth="2.4" />
      <text x={W - PAD - 4} y={yAt(withoutWalk[3]) - 6} textAnchor="end" fontSize="9" fill="#B91C1C" fontWeight="900">No walk · 178</text>
      <text x={W - PAD - 4} y={yAt(withWalk[3])    + 14} textAnchor="end" fontSize="9" fill="#059669" fontWeight="900">Walked · 152</text>
    </svg>
  );
}

function SleepChart() {
  const W = 320, H = 130, PAD = 24;
  const minH = 5, maxH = 8.5;
  const minF = 95, maxF = 135;
  const xAt = (h: number) => PAD + ((W - 2 * PAD) * (h - minH)) / (maxH - minH);
  const yAt = (f: number) => PAD + (H - 2 * PAD) * (1 - (f - minF) / (maxF - minF));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="130">
      {SLEEP.map((s, i) => (
        <circle key={i} cx={xAt(s.hours)} cy={yAt(s.fasting)} r={4} fill="#7C3AED" opacity="0.85" />
      ))}
      <line x1={xAt(minH)} y1={yAt(135)} x2={xAt(maxH)} y2={yAt(100)}
            stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <text x={PAD} y={H - 6} fontSize="9" fill="#94A3B8" fontWeight="700">5h sleep</text>
      <text x={W - PAD} y={H - 6} textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="700">8h sleep</text>
    </svg>
  );
}

function BestDayChart({ best, today, hours }: { best: number[]; today: number[]; hours: string[] }) {
  const W = 640, H = 200, PAD = 28;
  const min = 60, max = 200;
  const N = best.length;
  const xAt = (i: number) => PAD + ((W - 2 * PAD) * i) / (N - 1);
  const yAt = (v: number) => PAD + (H - 2 * PAD) * (1 - (v - min) / (max - min));
  const p = (arr: number[]) => arr.map((v, i) => (i === 0 ? "M" : "L") + ` ${xAt(i)} ${yAt(v)}`).join(" ");
  const y70 = yAt(70), y180 = yAt(180);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="200">
      <rect x={PAD} y={y180} width={W - 2 * PAD} height={y70 - y180} fill="#ECFDF5" opacity="0.7" />
      <path d={p(best)}  fill="none" stroke="#10B981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={p(today)} fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
      {hours.map((h, i) => (i % 2 === 0 ? (
        <text key={i} x={xAt(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#94A3B8" fontWeight="700">{h}</text>
      ) : null))}
    </svg>
  );
}

function WeeklyBars() {
  const max = 100;
  return (
    <div className="flex items-end justify-around gap-3 h-[160px] mt-2">
      {WEEKLY.weeks.map((w, i) => {
        const h = (WEEKLY.tir[i] / max) * 100;
        const isNow = i === WEEKLY.weeks.length - 1;
        return (
          <div key={w} className="flex flex-col items-center flex-1">
            <div className="text-[10px] font-black tabular-nums text-slate-700 mb-1">{WEEKLY.tir[i]}%</div>
            <div className="w-full rounded-t-lg transition"
                 style={{ height: `${h}%`, background: isNow ? "#10B981" : "#C7D2FE", minHeight: 12 }} />
            <div className="text-[10px] font-black text-slate-500 mt-1 uppercase tracking-wider">{w}</div>
          </div>
        );
      })}
    </div>
  );
}

function ScenarioSpark({ values, color }: { values: number[]; color: string }) {
  const W = 260, H = 44;
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const xAt = (i: number) => (W * i) / (values.length - 1);
  const yAt = (v: number) => H * (1 - (v - min) / (max - min));
  const path = values.map((v, i) => (i === 0 ? "M" : "L") + ` ${xAt(i)} ${yAt(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="44">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={xAt(i)} cy={yAt(v)} r={2.2} fill={color} />
      ))}
    </svg>
  );
}
