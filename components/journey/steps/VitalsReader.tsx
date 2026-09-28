import React, { useState } from "react";
import ForecastDetailSheet, { ForecastVariant } from "../ForecastDetailSheet";

/**
 * CGM Summary (a.k.a. Nu the Vitals Reader) - slide 5 of the Long Walker deck.
 *
 * Layout:
 *   Row 1 - "Yesterday at a glance" hero: TIR + Good day pill + Nu's summary
 *   Row 2 - 4 stat tiles (Average, Highest, Lowest, Time in Range)
 *   Row 3 - Three forecast cards (Nu Noticed / Nu Predicts / Watch-outs)
 *   Row 4 - "Want the full story?" CTA linking to Glucose Storyteller
 */
export default function VitalsReader() {
  return (
    <div className="space-y-5">
      <YesterdayHeroCard />
      <StatTilesGrid />
      <CGMForecastCards />
      <FullStoryCta />
    </div>
  );
}

// ============================================================================
// Three forecast cards for CGM — same shape as TrendWatcher's, CGM-specific copy.
// Each opens a drill-down sheet with detail.
// ============================================================================

function CGMForecastCards() {
  const [open, setOpen] = useState<ForecastVariant | null>(null);
  return (
    <div className="space-y-3">
      <CGMForecastCard variant="noticed"
        eyebrow="Nu Noticed"
        badgeBg="linear-gradient(135deg, #DBEAFE 0%, #EEF2FF 100%)"
        onClick={() => setOpen("noticed")}>
        <span>Your dinner walk pulled glucose from <span className="font-black text-amber-600">156</span> back to <span className="font-black text-emerald-600">104</span> in 45 minutes.</span>
      </CGMForecastCard>

      <CGMForecastCard variant="predicts"
        eyebrow="Nu Predicts"
        badgeBg="linear-gradient(135deg, #EDE9FE 0%, #F5F1FF 100%)"
        onClick={() => setOpen("predicts")}>
        <span>Fix the breakfast spike and you&apos;re on track for <span className="font-black text-emerald-600">92-95% TIR</span> today.</span>
      </CGMForecastCard>

      <CGMForecastCard variant="warning"
        eyebrow="What Could Slow You Down?"
        badgeBg="linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)"
        onClick={() => setOpen("warning")}>
        <span>A carb-heavy breakfast like yesterday&apos;s <span className="font-black text-amber-600">198 spike</span> keeps TIR below your 95% target.</span>
      </CGMForecastCard>

      {open === "noticed" && (
        <ForecastDetailSheet
          variant="noticed"
          eyebrow="Nu Noticed"
          title="Yesterday's story, moment by moment"
          intro="These are the moments that shaped yesterday's 87% Time in Range."
          bullets={[
            { label: "6:45 AM · Fasting glucose at 92 mg/dL",  sub: "Well within your morning baseline range",             accent: "#047857" },
            { label: "8:45 AM · Breakfast peak hit 198 mg/dL", sub: "Dosa + eggs pushed you above target for 42 minutes", accent: "#B45309" },
            { label: "12:30 PM · Lunch stayed flat at 102",    sub: "Textbook meal - protein first, carbs last",           accent: "#047857" },
            { label: "7:15 PM · Dinner peak at 156 mg/dL",     sub: "Modest rise; walked at 9:15 PM",                       accent: "#B45309" },
            { label: "10:00 PM · Recovery to 104 mg/dL",       sub: "Your dinner walk brought glucose back in range",       accent: "#047857" },
            { label: "Overnight · Stable at 78-92 mg/dL",      sub: "Good overnight recovery, no dips below 70",            accent: "#047857" },
          ]}
          footnote="Nu tracks 96 CGM readings per day and rolls the important moments up into this timeline."
          onClose={() => setOpen(null)}
        />
      )}

      {open === "predicts" && (
        <ForecastDetailSheet
          variant="predicts"
          eyebrow="Nu Predicts"
          title="Today's TIR forecast"
          intro="Nu compared your last 14 days to cohort baselines and modeled today two ways:"
          scenarios={[
            { name: "If breakfast is fixed",    endPoint: "94%", endLabel: "Reaches 95% target",
              color: "#10B981", points: [87, 89, 91, 92, 93, 94],
              caption: "Protein-first breakfast + dinner walk." },
            { name: "If yesterday repeats",     endPoint: "87%", endLabel: "8 pts short of target",
              color: "#F59E0B", points: [87, 87, 87, 87, 87, 87],
              caption: "Same 198 breakfast peak, same dinner walk." },
          ]}
          footnote="Nu updates today's forecast every hour as new CGM data arrives."
          onClose={() => setOpen(null)}
        />
      )}

      {open === "warning" && (
        <ForecastDetailSheet
          variant="warning"
          eyebrow="What Could Slow You Down?"
          title="Risks to today's TIR"
          intro="Three things Nu watches. Any one of them can push today's TIR further below your 95% target:"
          bullets={[
            { label: "Repeat of yesterday's breakfast",  sub: "198 spike alone costs 8-12 TIR points", accent: "#B45309" },
            { label: "Skipping the dinner walk",         sub: "Removes your biggest evening recovery lever",         accent: "#B45309" },
            { label: "Late-night snack after 10 PM",     sub: "Overnight glucose climbs, morning fasting spikes",    accent: "#B45309" },
            { label: "Skipped semaglutide dose",         sub: "Nu will send a soft reminder at your usual time",     accent: "#B45309" },
          ]}
          footnote="Nu will nudge you before any of these become a problem - never scold, always support."
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function CGMForecastCard({ variant, eyebrow, badgeBg, onClick, children }:
  { variant: ForecastVariant; eyebrow: string; badgeBg: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
            className="w-full text-left rounded-2xl border border-slate-100 bg-white shadow-sm p-4 md:p-5 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition">
      <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: badgeBg }}>
        <CGMBadgeIcon variant={variant} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-black uppercase tracking-[0.14em] mb-1 text-indigo-700">{eyebrow}</div>
        <div className="text-[14px] md:text-[15px] font-medium text-slate-700 leading-snug">{children}</div>
      </div>
      <svg className="w-5 h-5 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 6 15 12 9 18" />
      </svg>
    </button>
  );
}

function CGMBadgeIcon({ variant }: { variant: ForecastVariant }) {
  if (variant === "noticed") return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <defs>
        <radialGradient id="nuBodyC" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="60%" stopColor="#4F5FE5" />
          <stop offset="100%" stopColor="#3730A3" />
        </radialGradient>
      </defs>
      <ellipse cx="14" cy="5" rx="2.5" ry="1.8" fill="#10B981" transform="rotate(-20 14 5)" />
      <ellipse cx="16" cy="18" rx="10" ry="10" fill="url(#nuBodyC)" />
      <ellipse cx="12" cy="17" rx="1.6" ry="2" fill="#FFFFFF" />
      <ellipse cx="20" cy="17" rx="1.6" ry="2" fill="#FFFFFF" />
      <circle cx="12" cy="17.5" r="0.8" fill="#0F172A" />
      <circle cx="20" cy="17.5" r="0.8" fill="#0F172A" />
      <path d="M13 21 Q16 23 19 21" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
  if (variant === "predicts") return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <defs>
        <radialGradient id="ballGradC" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="14" r="9" fill="url(#ballGradC)" />
      <ellipse cx="12.5" cy="10.5" rx="2" ry="1.4" fill="#FFFFFF" opacity="0.7" />
      <path d="M10 22 L22 22 L20 26 L12 26 Z" fill="#4C1D95" />
    </svg>
  );
  return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <path d="M16 5 L28 26 L4 26 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="15" y="12" width="2" height="7" fill="#78350F" rx="1" />
      <circle cx="16" cy="22" r="1.3" fill="#78350F" />
    </svg>
  );
}

// ============================================================================
// Hero: Yesterday at a glance
// ============================================================================

function YesterdayHeroCard() {
  return (
    <div className="rounded-2xl border shadow-sm bg-white overflow-hidden relative">
      <img
        src="/journey/ppt/sun_hills.png"
        alt=""
        aria-hidden
        className="absolute top-0 right-0 w-56 h-auto pointer-events-none select-none opacity-95"
      />
      <div className="p-6 md:p-8 relative">
        <div className="text-2xl font-black text-slate-900 mb-1">Yesterday at a glance</div>
        <div className="text-[13px] text-slate-500 font-medium mb-6">June 10</div>

        <div className="grid md:grid-cols-[280px_1fr] gap-6 items-start">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Time in Range</div>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black text-emerald-600 tabular-nums leading-none">87</span>
              <span className="text-2xl font-black text-emerald-600 leading-none">%</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 17 9 11 13 15 21 7" /></svg>
              Solid &middot; 8 pts below 95% target
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 4L18 8l-4 3 1 5-3-2.5L9 16l1-5-4-3 4.5-1z" />
                </svg>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700">Nu&apos;s summary</span>
            </div>
            <div className="text-[15px] text-slate-800 font-medium leading-relaxed">
              In range 87% of the day &mdash; solid, but 8 points short of your 95% target.
              The <span className="font-black text-amber-700">198 breakfast spike</span> is the
              biggest lever; the dinner walk did exactly what it should.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatTile {
  label: string;
  value: string;
  unit: string;
  sub: string;
  tint: string;
  ring: string;
  icon: "trend" | "up" | "down" | "drop";
}

const TILES: StatTile[] = [
  { label: "Average Glucose", value: "124", unit: "mg/dL", sub: "",                     tint: "#F5F3FF", ring: "#DDD6FE", icon: "trend" },
  { label: "Highest Glucose", value: "198", unit: "mg/dL", sub: "After Breakfast",     tint: "#FFF7ED", ring: "#FED7AA", icon: "up"    },
  { label: "Lowest Glucose",  value: "78",  unit: "mg/dL", sub: "Overnight",            tint: "#ECFDF5", ring: "#A7F3D0", icon: "down"  },
  { label: "Time in Range",   value: "87",  unit: "%",     sub: "Target 95%+ · 70-180 range", tint: "#EFF6FF", ring: "#BFDBFE", icon: "drop"  },
];

function StatTilesGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {TILES.map(t => <StatTileCard key={t.label} tile={t} />)}
    </div>
  );
}

/**
 * Compact vertical stat block:
 *   big value  (with unit as suffix)
 *   small-caps label
 *   sub-line   (context / status)
 * A tiny colored dot sits in the top-right so each tile keeps its identity chip
 * without stealing horizontal space from the number.
 */
function StatTileCard({ tile }: { tile: StatTile }) {
  const dotColor: Record<string, string> = { trend: "#7C3AED", up: "#EA580C", down: "#059669", drop: "#2563EB" };
  const valColor = tile.icon === "drop" ? "#047857" : "#0F172A";
  return (
    <div className="relative rounded-2xl border shadow-sm p-4 md:p-5"
         style={{ background: tile.tint, borderColor: tile.ring }}>
      <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full" style={{ background: dotColor[tile.icon] }} />
      <div className="flex items-baseline gap-1">
        <span className="text-3xl md:text-4xl font-black tabular-nums leading-none" style={{ color: valColor }}>{tile.value}</span>
        <span className="text-[12px] text-slate-500 font-medium">{tile.unit}</span>
      </div>
      <div className="text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-500 mt-2 leading-tight">
        {tile.label}
      </div>
      {tile.sub && (
        <div className="text-[10px] md:text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">
          {tile.sub}
        </div>
      )}
    </div>
  );
}

function TileIcon({ kind, color }: { kind: "trend" | "up" | "down" | "drop"; color: string }) {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2.4 as unknown as number, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "trend") return <svg {...p}><polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" /></svg>;
  if (kind === "up")    return <svg {...p}><line x1="7" y1="17" x2="17" y2="7" /><polyline points="9 7 17 7 17 15" /></svg>;
  if (kind === "down")  return <svg {...p}><line x1="12" y1="4" x2="12" y2="20" /><polyline points="6 14 12 20 18 14" /></svg>;
  return <svg {...p}><path d="M12 3C8 9 6 12 6 15a6 6 0 0 0 12 0c0-3-2-6-6-12z" /></svg>;
}

function FullStoryCta() {
  return (
    <div className="rounded-2xl border shadow-sm bg-gradient-to-br from-white to-indigo-50 p-5 flex flex-wrap items-center gap-4"
         style={{ borderColor: "#DDD6FE" }}>
      <img src="/journey/ppt/nu_avatar.png" alt="Nu" className="w-14 h-14 rounded-full object-cover shrink-0 border border-slate-100 shadow-sm" />
      <div className="flex-1 min-w-[200px]">
        <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700 mb-0.5">Want the full story?</div>
        <div className="text-[14px] text-slate-800 font-medium leading-snug">
          Nu will walk you through what happened and why.
        </div>
      </div>
      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent("journey:jump", { detail: { step: 5 } }));
        }}
        className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-black tracking-wide shadow-lg shadow-indigo-200 transition hover:brightness-110"
        style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
        <div className="text-left">
          <div>Continue the story</div>
          <div className="text-[10px] font-black tracking-wider opacity-80 uppercase">Nu Glucose Story</div>
        </div>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
      </button>
    </div>
  );
}
