import {
  COHORT_PATTERNS, PANEL_NHI_DISTRIBUTION, PANEL_RECIPES, RING_BANDS,
  type CohortPattern, type PanelRecipe, type RingBand,
} from "../../../lib/coachData";

/**
 * CohortRingPatterns — aggregate ring analytics across Maya's 428-member panel.
 * Panel NHI histogram, rising patterns Nu detected, cross-panel recipes ranked by reliability.
 */
export default function CohortRingPatterns() {
  const totalPanel = PANEL_NHI_DISTRIBUTION.reduce((s, b) => s + b.count, 0);
  const excellentPct = PANEL_NHI_DISTRIBUTION.find(d => d.band === "excellent")!.pctPanel;
  const needsPct = PANEL_NHI_DISTRIBUTION.filter(d => d.band === "care" || d.band === "recover").reduce((s, d) => s + d.pctPanel, 0);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24 space-y-5">
      {/* Panel NHI distribution */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Panel NHI distribution · {totalPanel} members</div>
          <div className="text-[10px] font-black text-slate-500 tabular-nums">
            <span className="text-emerald-700">{excellentPct}%</span> excellent · <span className="text-rose-700">{needsPct}%</span> needs attention
          </div>
        </div>
        <NhiHistogram data={PANEL_NHI_DISTRIBUTION} />
      </div>

      {/* Cohort patterns rising this week */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-2">Patterns Nu detected across your panel · this week</div>
        <div className="space-y-2">
          {COHORT_PATTERNS.map(p => <CohortPatternCard key={p.id} pattern={p} />)}
        </div>
      </div>

      {/* Panel recipes (what's working across the panel) */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">Recipes working best across your panel</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {PANEL_RECIPES.map(r => <PanelRecipeCard key={r.id} recipe={r} />)}
        </div>
      </div>

      {/* Coach opportunity strip */}
      <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-1">Coach opportunity · scale to many at once</div>
        <div className="text-[15px] font-black text-slate-900 leading-tight mb-2"
             style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
          63 members are adopting the evening-walk anchor. Reinforce the recipe.
        </div>
        <div className="text-[11px] text-slate-700 leading-relaxed mb-3">
          One templated broadcast · 63 personalized versions · Fathom pre-personalizes each to their existing dinner anchor.
          Members who receive reinforcement in week 2 of adoption stick 3.4x more often than those who don't.
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="px-3 py-1.5 rounded-lg text-[11px] font-black text-white shadow-sm"
                  style={{ background: "#4F5FE5", boxShadow: "0 4px 12px -4px rgba(79,95,229,0.5)" }}>
            Draft reinforcement broadcast
          </button>
          <button className="px-3 py-1.5 rounded-lg text-[11px] font-black text-slate-700 border border-slate-200 bg-white">
            View adopting cohort
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NHI histogram — horizontal band bars
// ============================================================================
function NhiHistogram({ data }: { data: typeof PANEL_NHI_DISTRIBUTION }) {
  const maxCount = Math.max(...data.map(d => d.count));
  return (
    <div className="space-y-1.5">
      {data.map(d => {
        const meta = RING_BANDS[d.band];
        const w = (d.count / maxCount) * 100;
        return (
          <div key={d.band} className="flex items-center gap-2">
            <div className="w-16 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: meta.fg }}>{meta.label}</div>
            <div className="flex-1 h-6 rounded relative overflow-hidden" style={{ background: "#F1F5F9" }}>
              <div className="h-full rounded transition-all"
                   style={{ width: `${w}%`, background: `linear-gradient(90deg, ${meta.fg}, ${meta.fg}dd)` }} />
              <div className="absolute inset-0 flex items-center px-2">
                <span className="text-[10px] font-black text-white tabular-nums drop-shadow">{d.count}</span>
                <span className="text-[9px] font-black text-white/85 ml-auto pr-1">{d.pctPanel}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Cohort pattern card
// ============================================================================
function CohortPatternCard({ pattern: p }: { pattern: CohortPattern }) {
  const meta = RING_BANDS[p.severity];
  const trendColor = p.changeVsLastWeek > 0 ? "#B91C1C" : p.changeVsLastWeek < 0 ? "#059669" : "#94A3B8";
  return (
    <div className="rounded-2xl bg-white border shadow-sm p-3" style={{ borderColor: meta.fg + "44" }}>
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest"
              style={{ background: meta.tint, color: meta.fg, border: `1px solid ${meta.fg}55` }}>
          {meta.label}
        </span>
        <span className="text-[13px] font-black text-slate-900 flex-1 min-w-0 truncate">{p.label}</span>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[13px] font-black tabular-nums" style={{ color: "#4F5FE5" }}>{p.affectedCount}</span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">members</span>
          <span className="text-[10px] font-black tabular-nums ml-1.5" style={{ color: trendColor }}>
            {p.changeVsLastWeek > 0 ? "▲ +" : p.changeVsLastWeek < 0 ? "▼ " : "▬ "}{Math.abs(p.changeVsLastWeek)}% wow
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1.5">
        <div className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5">
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Shared driver</div>
          <div className="text-[10px] text-slate-700 leading-snug">{p.driver}</div>
        </div>
        <div className="rounded-lg px-2.5 py-1.5" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
          <div className="text-[8px] font-black uppercase tracking-widest text-indigo-700 mb-0.5">Coach action · at scale</div>
          <div className="text-[10px] text-indigo-900 leading-snug">{p.coachAction}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Panel recipe card
// ============================================================================
function PanelRecipeCard({ recipe: r }: { recipe: PanelRecipe }) {
  return (
    <div className="rounded-2xl bg-white border shadow-sm overflow-hidden" style={{ borderColor: "#FCD34D" }}>
      <div className="px-3 py-2 flex items-center justify-between" style={{ background: "linear-gradient(90deg,#FEF3C7,#FFFFFF)" }}>
        <div className="text-[10px] font-black uppercase tracking-widest text-amber-800 truncate">{r.id.replace(/-/g, " ")}</div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[13px] font-black text-amber-900 tabular-nums">{r.panelReliability}%</span>
          <span className="text-[8px] font-black text-amber-900 uppercase tracking-widest">reliable</span>
        </div>
      </div>
      <div className="p-2.5">
        <div className="flex flex-wrap gap-1 mb-2">
          {r.ingredients.map((i, idx) => (
            <span key={idx} className="text-[9px] font-black px-1.5 py-0.5 rounded"
                  style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}>{i}</span>
          ))}
        </div>
        <div className="text-[10px] text-slate-800 leading-snug"><span className="font-black">→</span> {r.outcome}</div>
        <div className="text-[9px] italic text-slate-500 mt-1">Running in {r.members} of 428 members.</div>
      </div>
    </div>
  );
}
