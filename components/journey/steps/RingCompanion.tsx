import Link from "next/link";
import {
  PARAMS, GOOD_SPANS, HEALTH_RECIPES,
  currentValue, severityAt, nuHealthIndexAt,
  type ParamDef,
} from "../../../lib/ringSimData";

/**
 * RingCompanion — the /journey step for the daily health-ring reading.
 * Patient-facing: Nu Health Index (10-star), 8 vital numbers, and the
 * "Good Health Times" analytics (best spans + Nu-extracted recipes).
 */

// Use hour 24 as "this morning" (Tuesday morning in the sim — a good baseline slice)
const NOW = 24;

export default function RingCompanion() {
  const nhi = nuHealthIndexAt(NOW);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 pb-24">
      {/* Nu Health Index hero */}
      <NuHealthIndexHero nhi={nhi} />

      {/* Vitals grid */}
      <div className="mt-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">This morning · from your ring</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PARAMS.map(p => <RingVital key={p.id} def={p} />)}
        </div>
      </div>

      {/* Your best times */}
      <div className="mt-5">
        <div className="flex items-center gap-2 mb-2">
          <SparkleIcon />
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Your best times · this week</div>
        </div>
        <div className="text-[16px] font-black text-slate-900 leading-tight mb-3"
             style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
          When all 8 vitals stayed in the green — here's what you did.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {GOOD_SPANS.map(sp => <GoodSpanCard key={sp.id} span={sp} />)}
        </div>
      </div>

      {/* Recipes */}
      <div className="mt-5">
        <div className="flex items-center gap-2 mb-2">
          <NuGlyph size={18} />
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">Nu extracted · your recipes for feeling good</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {HEALTH_RECIPES.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      </div>

      {/* Deep dive link */}
      <div className="mt-5 rounded-2xl bg-white border border-slate-200 shadow-sm p-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
             style={{ background: "linear-gradient(135deg,#0EA5A4,#0EA5E9)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-teal-700">Full ring dashboard</div>
          <div className="text-[12px] font-black text-slate-800 leading-tight">See the 72-hour trace · Nu's action flow · coach view.</div>
        </div>
        <Link href="/health-ring" className="px-3 py-1.5 rounded-lg text-[11px] font-black text-white shadow-sm"
              style={{ background: "linear-gradient(90deg,#0EA5A4,#0EA5E9)" }}>
          Open →
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================
function NuHealthIndexHero({ nhi }: { nhi: ReturnType<typeof nuHealthIndexAt> }) {
  return (
    <div className="rounded-3xl border shadow-sm overflow-hidden"
         style={{ background: `linear-gradient(135deg, ${nhi.tint}18 0%, #FFFFFF 65%)`, borderColor: nhi.tint + "55" }}>
      <div className="p-5 flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: nhi.tint }}>Nu Health Index</div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[56px] font-black leading-none tabular-nums"
                  style={{ color: nhi.tint, fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif" }}>
              {nhi.score.toFixed(1)}
            </span>
            <span className="text-[18px] font-black text-slate-400">/ 10</span>
          </div>
          <StarStrip score={nhi.score} color={nhi.tint} size={18} />
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-sm"
                  style={{ background: nhi.tint }}>{nhi.label}</span>
            <span className="text-[11px] text-slate-500">
              {nhi.score >= 9 ? "Everything's on track." :
               nhi.score >= 7.5 ? "You're doing well overall." :
               nhi.score >= 6 ? "One or two things to watch." :
               nhi.score >= 4 ? "Take extra care of yourself today." :
                                "Reach out to your coach today."}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
             style={{ background: "white", border: `1px solid ${nhi.tint}44` }}>
          <NuGlyph size={36} />
          <div className="max-w-[220px]">
            <div className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-0.5">Nu says</div>
            <div className="text-[11px] font-black text-slate-800 leading-snug">
              Your ring watched all night. HRV up 3 ms, morning temp on baseline. Small win before the day even started.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RingVital({ def }: { def: ParamDef }) {
  const value = currentValue(def.id, NOW);
  const sev = severityAt(def.id, NOW);
  const dotColor = sev === "normal" ? "#059669" : sev === "watch" ? "#B45309" : sev === "warning" ? "#C2410C" : "#B91C1C";
  const valColor = sev === "normal" ? "#0F172A" : dotColor;
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{def.label}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[22px] font-black leading-none tabular-nums" style={{ color: valColor }}>{def.format(value)}</span>
        <span className="text-[9px] font-black text-slate-500">{def.unit}</span>
      </div>
    </div>
  );
}

function GoodSpanCard({ span }: { span: typeof GOOD_SPANS[number] }) {
  return (
    <div className="rounded-2xl bg-white border border-emerald-200 shadow-sm overflow-hidden">
      <div className="px-3 py-2 flex items-center justify-between" style={{ background: "linear-gradient(90deg,#ECFDF5,#FFFFFF)" }}>
        <div className="min-w-0">
          <div className="text-[8px] font-black uppercase tracking-widest text-emerald-700 truncate">{span.dayLabel}</div>
          <div className="text-[12px] font-black text-slate-900 truncate">{span.timeLabel}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[18px] font-black leading-none tabular-nums text-emerald-700"
               style={{ fontFamily: "'Fraunces', serif" }}>{span.scoreAvg.toFixed(1)}</div>
          <div className="text-[7px] font-black text-emerald-700 uppercase tracking-widest">NHI</div>
        </div>
      </div>
      <div className="p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">What you did</div>
        <ul className="space-y-1 mb-2">
          {span.activities.map((a, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-800 leading-snug">
              <span className="text-emerald-500 leading-none pt-0.5">✓</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1.5">
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Vitals</div>
          <div className="text-[10px] text-slate-700 leading-snug">{span.vitalsBrief}</div>
        </div>
      </div>
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: typeof HEALTH_RECIPES[number] }) {
  return (
    <div className="rounded-2xl bg-white border shadow-sm overflow-hidden"
         style={{ borderColor: "#FCD34D" }}>
      <div className="px-3 py-2 flex items-center justify-between"
           style={{ background: "linear-gradient(90deg,#FEF3C7,#FFFFFF)" }}>
        <div className="flex items-center gap-2">
          <NuGlyph size={22} />
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-800">Recipe · {recipe.id.replace(/-/g, " ")}</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5" style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-black text-amber-900 tabular-nums">{recipe.reliability}% reliable</span>
        </div>
      </div>
      <div className="p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Ingredients</div>
        <div className="flex flex-wrap gap-1 mb-2">
          {recipe.ingredients.map((i, idx) => (
            <span key={idx} className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>
              {i}
            </span>
          ))}
        </div>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">→ Outcome</div>
        <div className="text-[12px] font-black text-slate-900 leading-snug">{recipe.outcome}</div>
        <div className="text-[9px] text-slate-500 italic mt-1">
          Nu found this pattern in {recipe.matchedSpans} of your past good spans.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Small icons
// ============================================================================
function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" fill="#DCFCE7" />
      <path d="M19 4l0.5 2L21 6.5 19.5 7 19 9 18.5 7 17 6.5 18.5 6z" fill="#DCFCE7" />
    </svg>
  );
}

function NuGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id={`nu-rc-${size}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill={`url(#nu-rc-${size})`} />
      <circle cx="9"  cy="10" r="1.4" fill="#1E1B4B" />
      <circle cx="15" cy="10" r="1.4" fill="#1E1B4B" />
      <path d="M9 15c1 1 5 1 6 0" stroke="#1E1B4B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="9.4"  cy="9.4" r="0.4" fill="white" />
      <circle cx="15.4" cy="9.4" r="0.4" fill="white" />
    </svg>
  );
}

// 10-star strip with half-star precision
function StarStrip({ score, color, size = 20 }: { score: number; color: string; size?: number }) {
  const clamped = Math.max(0, Math.min(10, score));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => {
        const filled = Math.max(0, Math.min(1, clamped - i));
        const gradId = `starj-${i}-${color.replace("#", "")}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24">
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
