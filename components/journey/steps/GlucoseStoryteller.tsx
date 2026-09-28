import { useState } from "react";

/**
 * Nu the Glucose Storyteller (Step 5)
 *
 * Two views over the same 24-hour glucose stream:
 *   BAND (default) - simple traffic-light timeline. 24 hourly cells colored
 *                    green / amber / red for in-range / above / below.
 *                    Meal + walk icons above the bar at their real times.
 *                    Big friendly legend + Nu explainer.
 *   CHART          - the detailed line chart (medical view) with the pulsing
 *                    breakfast dot the reviewer can tap.
 *
 * A toggle at the top switches views. The band view is the default because
 * most reviewers understand traffic-light metaphors instantly, while the
 * curve requires clinical literacy.
 */

function buildCurve(): number[] {
  const seed = [
    92, 91, 90, 88, 87, 88, 90, 92, 94, 98,
    102, 108, 118, 132, 148, 165, 174, 168, 158, 148,
    138, 128, 120, 112, 108, 105, 102, 100, 100, 100,
    102, 105, 108, 112, 118, 128, 138, 145, 148, 145,
    138, 128, 118, 110, 105, 102, 100, 100, 99, 100,
    102, 105, 108, 112, 118, 124, 130, 138, 145, 148,
    142, 135, 128, 122, 118, 115, 112, 108, 105, 102,
    100, 98, 96, 95, 94, 93, 92, 92, 91, 91,
    90, 90, 89, 89, 88, 88, 88, 89, 90, 92,
    94, 96, 98, 100, 100, 100,
  ];
  while (seed.length < 96) seed.push(seed[seed.length - 1]);
  return seed.slice(0, 96);
}

interface Annotation {
  hour: number;
  label: string;
  kind: "meal" | "walk";
  emoji: string;
  color: string;
  note: string;
}

const ANNOTATIONS: Annotation[] = [
  { hour: 8.75,  label: "Breakfast", kind: "meal", emoji: "🥣", color: "#F59E0B",
    note: "Oatmeal + banana + honey. Quick-release carbs pushed you to 174." },
  { hour: 12.5,  label: "Lunch",     kind: "meal", emoji: "🥗", color: "#F59E0B",
    note: "Grilled chicken salad. Protein-first order kept the peak at 148." },
  { hour: 19.25, label: "Dinner",    kind: "meal", emoji: "🍝", color: "#F59E0B",
    note: "Pasta + veggies + chicken. Peaked at 148 around 8:00 PM." },
  { hour: 21.25, label: "Walk",      kind: "walk", emoji: "🚶‍♀️", color: "#10B981",
    note: "20-min walk after dinner. Glucose back inside range within 45 min." },
];

interface Props {
  onAnnotationTapped?: (label: string) => void;
}

type ViewMode = "band" | "chart" | "meal" | "ppt";

export default function GlucoseStoryteller({ onAnnotationTapped }: Props) {
  const [view, setView] = useState<ViewMode>("band");
  const curve = buildCurve();
  const [tapped, setTapped] = useState<Annotation | null>(null);

  return (
    <div>
      <div className="grid md:grid-cols-4 gap-4 mb-3">
        <Stat big="87%"  small="TIR"           hint="Below goal · Target 95%+" />
        <Stat big="124" small="mg/dL Average"  hint="Yesterday, June 10" />
        <Stat big="198" small="mg/dL Highest"  hint="After Breakfast" />
        <Stat big="78"  small="mg/dL Lowest"   hint="Overnight" />
      </div>
      {/* CGM range settings chip - shows how the target range is defined */}
      <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
        <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
        </svg>
        <span>Target range 70&ndash;180 mg/dL (diabetic). Non-diabetic upper limit: 140. <button className="font-black text-indigo-600 hover:underline">Adjust in CGM settings</button></span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6">
        <div className="mb-5">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-3">
            Yesterday&apos;s glucose
          </div>
          <StoryTabBar view={view} onChange={setView} />
        </div>

        {view === "band" && (
          <BandView curve={curve} annotations={ANNOTATIONS} onTap={(a) => {
            setTapped(a);
            onAnnotationTapped?.(a.label);
          }} />
        )}
        {view === "chart" && (
          <DetailChart curve={curve} annotations={ANNOTATIONS} onTap={(a) => {
            setTapped(a);
            onAnnotationTapped?.(a.label);
          }} />
        )}
        {view === "meal" && <MealView />}
        {view === "ppt"  && <PPTView />}

        {tapped && (
          <div className="mt-4 p-4 rounded-xl border"
               style={{ borderColor: tapped.color + "80", background: tapped.color + "10" }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{tapped.emoji}</span>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: tapped.color }}>
                {tapped.label}
              </span>
              <button onClick={() => setTapped(null)} className="ml-auto text-slate-400 hover:text-slate-700 text-xs">✕</button>
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1">{tapped.note}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="inline-flex ml-auto rounded-full border border-slate-200 bg-slate-50 p-1">
      <button
        onClick={() => onChange("band")}
        className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition
          ${view === "band" ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
      >
        Simple
      </button>
      <button
        onClick={() => onChange("chart")}
        className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition
          ${view === "chart" ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
      >
        Detailed
      </button>
    </div>
  );
}

/**
 * Band view - each of 24 hours gets a colored cell (traffic-light).
 * Meal + walk icons rendered above the bar at the correct hour.
 */
function BandView({ curve, annotations, onTap }: {
  curve: number[]; annotations: Annotation[]; onTap: (a: Annotation) => void;
}) {
  // Bucket the 96 readings into 24 hourly averages, classify each into a band.
  const HOURS = 24;
  const buckets: number[] = [];
  for (let h = 0; h < HOURS; h++) {
    const from = h * 4;
    const to = from + 4;
    const slice = curve.slice(from, to);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    buckets.push(avg);
  }
  function band(v: number): { color: string; label: string } {
    if (v > 180) return { color: "#F59E0B", label: "high" };
    if (v < 70)  return { color: "#F87171", label: "low" };
    return { color: "#10B981", label: "in range" };
  }
  const bandedCounts = { green: 0, amber: 0, red: 0 };
  buckets.forEach(v => {
    const b = band(v);
    if (b.color === "#10B981") bandedCounts.green++;
    else if (b.color === "#F59E0B") bandedCounts.amber++;
    else bandedCounts.red++;
  });
  const pct = (n: number) => Math.round((n / HOURS) * 100);

  return (
    <div>
      {/* Nu's traffic-light explainer */}
      <div className="mb-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none">🌱</span>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">
              Nu explains
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Your glucose stayed in range {pct(bandedCounts.green)}% of the day &mdash; solid, but
              <span className="font-black text-amber-700"> 8 points short of your 95% target</span>.
              The breakfast spike (
              <span className="font-black text-amber-700">198 mg/dL</span>
              ) is the biggest lever &mdash; if we flatten that one meal, tomorrow lands in the 90s.
              The dinner walk did what it should: pulled you back into range within 45 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Trend line over a target-range band. Line color-shifts per band. */}
      <TrendBandChart curve={curve} annotations={annotations} onTap={onTap} />

      {/* Legend + KPIs */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <BandKPI color="#10B981" label="In range" value={`${pct(bandedCounts.green)}%`}
                 sub={`${bandedCounts.green} of 24 hours`} />
        <BandKPI color="#F59E0B" label="Above target" value={`${pct(bandedCounts.amber)}%`}
                 sub={`${bandedCounts.amber} of 24 hours`} />
        <BandKPI color="#F87171" label="Below target" value={`${pct(bandedCounts.red)}%`}
                 sub={`${bandedCounts.red} of 24 hours`} />
      </div>

      {/* Hint moved to floating chip on top of the chart (see TrendBandChart) */}
    </div>
  );
}

function BandKPI({ color, label, value, sub }:
  { color: string; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl p-3 border shadow-sm" style={{ borderColor: color + "44", background: color + "0F" }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>{label}</span>
      </div>
      <div className="text-2xl font-black text-slate-900 tabular-nums">{value}</div>
      <div className="text-[10px] text-slate-500 font-medium">{sub}</div>
    </div>
  );
}

/** Detailed line-chart view (SVG). */
function DetailChart({ curve, annotations, onTap }: {
  curve: number[]; annotations: Annotation[]; onTap: (a: Annotation) => void;
}) {
  const width = 720;
  const height = 320;
  const padL = 40, padR = 20, padT = 20, padB = 40;
  const minY = 60, maxY = 200;
  const xAt = (i: number) => padL + (i / (curve.length - 1)) * (width - padL - padR);
  const yAt = (v: number) => padT + (1 - (v - minY) / (maxY - minY)) * (height - padT - padB);
  const pts = curve.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  const areaPts = `${padL},${yAt(minY)} ` + pts + ` ${xAt(curve.length - 1)},${yAt(minY)}`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <rect x={padL} y={yAt(180)} width={width - padL - padR} height={yAt(70) - yAt(180)} fill="#ECFDF5" />
        {[70, 100, 140, 180].map(v => (
          <g key={v}>
            <line x1={padL} y1={yAt(v)} x2={width - padR} y2={yAt(v)} stroke="#E5E7EB" strokeWidth={1} />
            <text x={padL - 6} y={yAt(v) + 3} textAnchor="end" fill="#6B7280" fontSize={10} fontWeight={700}>{v}</text>
          </g>
        ))}
        {[6, 12, 18].map(h => (
          <text key={h} x={xAt(h * 4)} y={height - 10} textAnchor="middle" fill="#6B7280" fontSize={10} fontWeight={700}>
            {hourLabel(h)}
          </text>
        ))}
        <polygon points={areaPts} fill="url(#glucoseGrad)" opacity={0.25} />
        <defs>
          <linearGradient id="glucoseGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4F5FE5" />
            <stop offset="100%" stopColor="#4F5FE5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={pts} fill="none" stroke="#4F5FE5" strokeWidth={2.5} strokeLinejoin="round" />
        {annotations.map((a, i) => {
          const idx = Math.round(a.hour * 4);
          const cx = xAt(idx);
          const cy = yAt(curve[idx]);
          const isFocus = a.label === "Breakfast";
          return (
            <g key={i} onClick={() => onTap(a)} style={{ cursor: "pointer" }}>
              {isFocus && (
                <circle cx={cx} cy={cy} r={16} fill={a.color} fillOpacity={0.2}>
                  <animate attributeName="r" values="14;22;14" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.2;0.05;0.2" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={cx} cy={cy} r={7} fill={a.color} stroke="#FFFFFF" strokeWidth={2} />
              <text x={cx} y={cy - 14} textAnchor="middle" fontSize={14}>{a.emoji}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 items-center">
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
          Tap the pulsing breakfast dot →
        </span>
        {annotations.map((a, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
            <span className="font-bold text-slate-700">{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ big, small, hint }: { big: string; small: string; hint: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-2xl font-black text-slate-900">{big}</div>
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-1">{small}</div>
      <div className="text-[10px] text-slate-400 font-medium">{hint}</div>
    </div>
  );
}

function hourLabel(h: number): string {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  if (h < 12) return `${h}a`;
  return `${h - 12}p`;
}


// ============================================================================
// StoryTabBar - 3-way tab bar (Simple / Detailed / By meal) with underline
// ============================================================================

function StoryTabBar({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const tabs: { key: ViewMode; label: string; sub: string }[] = [
    { key: "band",  label: "Simple",   sub: "Traffic-light bands" },
    { key: "chart", label: "Detailed", sub: "Full 24h chart" },
    { key: "meal",  label: "By meal",  sub: "Breakfast, lunch, dinner impact" },
    { key: "ppt",   label: "As shown to Sally", sub: "Nu’s daily story chart" },
  ];
  return (
    <div className="flex items-stretch gap-1 border-b border-slate-200 overflow-x-auto">
      {tabs.map(t => {
        const active = t.key === view;
        return (
          <button key={t.key} onClick={() => onChange(t.key)}
                  className={"px-4 py-2.5 text-left transition border-b-2 " +
                    (active ? "border-indigo-600" : "border-transparent hover:bg-slate-50")}>
            <div className={"text-[13px] font-black " + (active ? "text-indigo-700" : "text-slate-600")}>{t.label}</div>
            <div className="text-[10px] font-medium text-slate-400 leading-tight">{t.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// MealView - per-meal glucose impact bars + Nu's plain-English read
// ============================================================================

interface MealImpact {
  meal: string;
  emoji: string;
  peakDelta: number;   // rise above baseline in mg/dL
  timeToPeak: string;
  recovery: string;
  quality: "great" | "good" | "watch";
  note: string;
  color: string;
}

interface MealPeak { peak: number; peakLabel: string; }
const MEAL_IMPACTS: (MealImpact & MealPeak)[] = [
  { meal: "Breakfast", emoji: "SUN",   peak: 198, peakLabel: "Highest spike", peakDelta: 74, timeToPeak: "45 min", recovery: "2h 10m", quality: "watch", note: "Dosa + two eggs caused the spike.",                          color: "#F59E0B" },
  { meal: "Lunch",     emoji: "LEAF",  peak: 102, peakLabel: "Most stable",   peakDelta: 18, timeToPeak: "35 min", recovery: "50 min", quality: "great", note: "Very stable.",                                                color: "#10B981" },
  { meal: "Dinner",    emoji: "MOON",  peak: 118, peakLabel: "Best recovery", peakDelta: 38, timeToPeak: "50 min", recovery: "1h 40m", quality: "good",  note: "Your walk after dinner helped bring glucose back into range.", color: "#5B4CE0" },
  { meal: "Evening",   emoji: "APPLE", peak:  92, peakLabel: "Stayed steady", peakDelta:  8, timeToPeak: "-",       recovery: "-",      quality: "great", note: "Good overnight recovery.",                                     color: "#38BDF8" },
];

function MealView() {
  const maxDelta = Math.max(...MEAL_IMPACTS.map(m => m.peakDelta));
  return (
    <div className="space-y-3">
      {MEAL_IMPACTS.map((m, i) => (
        <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: m.color + "22" }}>
              <MealEmoji kind={m.emoji} color={m.color} />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-[13px] font-black text-slate-900">{m.meal}</div>
                <QualityChip q={m.quality} />
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Peak +{m.peakDelta} mg/dL - to peak in {m.timeToPeak} - recovered in {m.recovery}</div>
            </div>
            <div className="text-right shrink-0" style={{ color: m.color }}>
              <div className="text-2xl font-black tabular-nums leading-none">{m.peak}</div>
              <div className="text-[9px] text-slate-500 font-medium">mg/dL &middot; {m.peakLabel}</div>
            </div>
          </div>
          <MealBar delta={m.peakDelta} max={maxDelta} color={m.color} />
          <div className="text-[12px] text-slate-700 font-medium mt-2 leading-snug">{m.note}</div>
        </div>
      ))}
      <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50 mt-4">
        <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700 mb-1">Nu&apos;s meal-by-meal read</div>
        <div className="text-[13px] text-slate-800 font-medium leading-snug">
          Lunch was your best meal. Breakfast is the biggest lever - swapping dosa for eggs + spinach usually cuts your peak by 40+ mg/dL.
        </div>
      </div>
    </div>
  );
}

function MealBar({ delta, max, color }: { delta: number; max: number; color: string }) {
  const pct = Math.round((delta / max) * 100);
  return (
    <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}CC 0%, ${color} 100%)` }} />
      {/* threshold markers at 30 and 50 mg/dL */}
      <div className="absolute inset-y-0" style={{ left: `${(30 / max) * 100}%`, width: 1, background: "rgba(15,23,42,0.15)" }} />
      <div className="absolute inset-y-0" style={{ left: `${(50 / max) * 100}%`, width: 1, background: "rgba(15,23,42,0.15)" }} />
    </div>
  );
}

function QualityChip({ q }: { q: "great" | "good" | "watch" }) {
  const map = {
    great: { bg: "#DCFCE7", fg: "#047857", label: "Great" },
    good:  { bg: "#DBEAFE", fg: "#1D4ED8", label: "Good" },
    watch: { bg: "#FEF3C7", fg: "#92400E", label: "Watch" },
  };
  const t = map[q];
  return (
    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: t.bg, color: t.fg }}>{t.label}</span>
  );
}

function MealEmoji({ kind, color }: { kind: string; color: string }) {
  const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2.2 as unknown as number, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "SUN")   return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" /></svg>;
  if (kind === "LEAF")  return <svg {...p}><path d="M5 21c0-8 6-14 14-14 0 8-6 14-14 14z" /></svg>;
  if (kind === "APPLE") return <svg {...p}><path d="M12 6c2-3 6-3 6 1s-3 12-6 12S6 11 6 7s4-4 6-1z" /><path d="M12 6V4" /></svg>;
  return <svg {...p}><path d="M20 15A8 8 0 1 1 9 4a7 7 0 0 0 11 11z" /></svg>;
}


// ============================================================================
// PPTView - static image view (extracted from Long Walker.pptx slide 6)
// Shows the exact chart Nu presents in the deck, plus the meal-notes strip
// and a compact Nu recommendation line.
// ============================================================================

function PPTView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <img src="/journey/ppt/nu_story.png" alt="Nu" className="w-10 h-10 rounded-full object-cover border border-slate-100" />
        <div>
          <div className="text-[13px] font-black text-slate-900">Your Glucose Story - June 10</div>
          <div className="text-[11px] text-slate-500 font-medium">Here&apos;s what happened yesterday.</div>
        </div>
      </div>

      {/* PPT chart image */}
      <div className="rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm">
        <img src="/journey/ppt/glucose_chart.png" alt="Yesterday's glucose chart" className="w-full h-auto block" />
      </div>

      {/* PPT meal-notes strip */}
      <div className="rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm">
        <img src="/journey/ppt/glucose_notes.png" alt="Per-meal notes" className="w-full h-auto block" />
      </div>

      {/* Nu recommends */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 flex items-center gap-3">
        <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12v3h8v-3a7 7 0 0 0-4-12z" />
          </svg>
        </span>
        <div className="flex-1 text-[13px] text-slate-800 font-medium leading-snug">
          <span className="font-black text-indigo-700">Nu recommends for today:</span> Great job! Repeat your dinner routine and consider a smaller, lighter breakfast.
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// TrendBandChart - proper line-chart trend view with a target-range background
// band. Line color-shifts (emerald / amber / rose) based on which range the
// value sits in. Meal + walk annotations rendered as tappable markers above.
// Also overlays Sally's best day for comparison.
// ============================================================================

// Sally's best day so far (Sun Jun 28 · 92% TIR) - flatter breakfast, same walk.
function buildBestDay(): number[] {
  const out: number[] = [];
  for (let i = 0; i < 96; i++) {
    const h = i / 4;
    let v = 92;
    if (h < 5)         v = 88 + Math.sin(i * 0.4) * 2;                      // overnight ~88
    else if (h < 8)    v = 92 + (h - 5) * 3;                                // gentle rise
    else if (h < 11)   v = 118 - (h - 8) * 4;                               // shallow breakfast peak ~140
    else if (h < 14)   v = 104 + Math.sin(h * 0.7) * 4;                     // steady midday
    else if (h < 17)   v = 108 + (h - 14) * 5;                              // small lunch bump
    else if (h < 20)   v = 128 - (h - 17) * 6;                              // dinner rise+recovery
    else if (h < 22)   v = 100 + Math.sin(i * 0.3) * 3;                     // post-walk in range
    else               v = 90;                                              // overnight settle
    out.push(v);
  }
  return out;
}

function TrendBandChart({ curve, annotations, onTap }: {
  curve: number[]; annotations: Annotation[]; onTap: (a: Annotation) => void;
}) {
  const W = 720, H = 240, padL = 44, padR = 12, padT = 36, padB = 26;
  const lo = 40, hi = 260;              // y-axis span
  const targetLo = 70, targetHi = 180;  // target range band (adjustable in CGM settings)
  const nonDiabHi = 140;                // reference line for non-diabetic upper limit
  const N = curve.length;
  const xAt = (i: number) => padL + (i / (N - 1)) * (W - padL - padR);
  const yAt = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  const bandColor = (v: number) =>
    v > targetHi ? "#F59E0B" : v < targetLo ? "#F87171" : "#10B981";

  // Build color-segmented polyline paths - one continuous path per color band.
  const segments: { color: string; d: string }[] = [];
  let currentColor = bandColor(curve[0]);
  let currentD = `M ${xAt(0)} ${yAt(curve[0])}`;
  for (let i = 1; i < N; i++) {
    const c = bandColor(curve[i]);
    if (c !== currentColor) {
      // finish previous segment + start new one at the same point for continuity
      segments.push({ color: currentColor, d: currentD + ` L ${xAt(i)} ${yAt(curve[i])}` });
      currentColor = c;
      currentD = `M ${xAt(i - 1)} ${yAt(curve[i - 1])} L ${xAt(i)} ${yAt(curve[i])}`;
    } else {
      currentD += ` L ${xAt(i)} ${yAt(curve[i])}`;
    }
  }
  segments.push({ color: currentColor, d: currentD });

  const hourMarks = [0, 6, 12, 18, 24];

  // Best-day overlay path
  const bestDay = buildBestDay();
  const bestPath = bestDay.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`).join(" ");

  return (
    <div>
      {/* Legend + inline hint chip above the chart */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px] font-medium">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-6 h-0.5 rounded" style={{ background: "#4F5FE5" }} />
          <span className="text-slate-700 font-bold">Yesterday &middot; 87% TIR</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#10B981" strokeWidth="2" strokeDasharray="4 3" /></svg>
          <span className="text-slate-700 font-bold">Your best day &middot; Sun Jun 28 &middot; 92% TIR</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-black uppercase tracking-wider text-[10px]">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
          </svg>
          Tap a meal icon for the story
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Y-axis reference bands: red below 70, amber above 180, green in between */}
        <rect x={padL} y={yAt(lo)}       width={W - padL - padR} height={yAt(targetLo) - yAt(lo)}     fill="#FEE2E2" opacity="0.35" />
        <rect x={padL} y={yAt(targetHi)} width={W - padL - padR} height={yAt(lo) - yAt(targetHi)}     fill="#DCFCE7" opacity="0"    />
        <rect x={padL} y={yAt(targetHi)} width={W - padL - padR} height={yAt(targetLo) - yAt(targetHi)} fill="#DCFCE7" opacity="0.55" />
        <rect x={padL} y={yAt(hi)}       width={W - padL - padR} height={yAt(targetHi) - yAt(hi)}     fill="#FEF3C7" opacity="0.55" />

        {/* Best-day overlay - draw first so it sits behind yesterday's line */}
        <path d={bestPath} fill="none" stroke="#10B981" strokeWidth="1.8" strokeDasharray="4 3" strokeLinejoin="round" opacity="0.75" />

        {/* Reference lines: target range boundaries */}
        <line x1={padL} y1={yAt(targetLo)} x2={W - padR} y2={yAt(targetLo)} stroke="#10B981" strokeWidth="1"   strokeDasharray="3 3" />
        <line x1={padL} y1={yAt(targetHi)} x2={W - padR} y2={yAt(targetHi)} stroke="#F59E0B" strokeWidth="1"   strokeDasharray="3 3" />
        <line x1={padL} y1={yAt(nonDiabHi)} x2={W - padR} y2={yAt(nonDiabHi)} stroke="#0891B2" strokeWidth="0.75" strokeDasharray="1 3" />

        {/* Y-axis labels */}
        {[70, 140, 180, 250].map(v => (
          <text key={v} x={padL - 6} y={yAt(v) + 3} textAnchor="end"
                fontSize="10" fontWeight={700} fill="#64748B">{v}</text>
        ))}
        <text x={padL - 6} y={padT + 8} textAnchor="end" fontSize="9" fontWeight={800} fill="#64748B">mg/dL</text>

        {/* Right-edge legend labels for reference lines */}
        <text x={W - padR - 2} y={yAt(nonDiabHi) - 3} textAnchor="end" fontSize="8" fontWeight={800} fill="#0891B2">140 non-diab.</text>
        <text x={W - padR - 2} y={yAt(targetHi) - 3} textAnchor="end" fontSize="8" fontWeight={800} fill="#B45309">180 diab. cap</text>
        <text x={W - padR - 2} y={yAt(targetLo) + 10} textAnchor="end" fontSize="8" fontWeight={800} fill="#047857">70 low limit</text>

        {/* The glucose line, color-segmented */}
        {segments.map((seg, i) => (
          <path key={i} d={seg.d} fill="none" stroke={seg.color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        ))}

        {/* Hour ticks + labels along the bottom */}
        {hourMarks.map(h => {
          const idx = Math.min(N - 1, Math.round((h / 24) * N));
          const x = xAt(idx);
          return (
            <g key={h}>
              <line x1={x} y1={H - padB} x2={x} y2={H - padB + 4} stroke="#94A3B8" strokeWidth="1" />
              <text x={x} y={H - 6} textAnchor="middle" fontSize="9" fontWeight={800} fill="#64748B">
                {h === 0 ? "12a" : h === 12 ? "12p" : h === 24 ? "12a" : h < 12 ? `${h}a` : `${h - 12}p`}
              </text>
            </g>
          );
        })}

        {/* Meal + walk annotation markers */}
        {annotations.map((a, i) => {
          const idx = Math.min(N - 1, Math.round((a.hour / 24) * (N - 1)));
          const x = xAt(Math.min(N - 1, idx));
          const y = yAt(curve[Math.min(N - 1, idx)]);
          const prev = annotations[i - 1];
          const stacked = !!prev && Math.abs(a.hour - prev.hour) < 2;
          const labelY = stacked ? padT - 4 : padT - 20;
          return (
            <g key={i} onClick={() => onTap(a)} style={{ cursor: "pointer" }}>
              <line x1={x} y1={labelY + 6} x2={x} y2={y - 6} stroke={a.color} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
              <circle cx={x} cy={y} r={5} fill="#FFFFFF" stroke={a.color} strokeWidth="2.2" />
              <circle cx={x} cy={y} r={2} fill={a.color} />
              <text x={x} y={labelY} textAnchor="middle" fontSize="10" fontWeight={900} fill={a.color}>
                {a.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
