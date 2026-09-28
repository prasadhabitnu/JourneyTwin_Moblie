import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle } from "../components/Page";
import {
  buildAllMembers, ClaimsMember, fmtUSD, fmtUSDFull, ClaimCategory,
} from "../lib/claimsAnalytics";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import { Upload, Sparkles, Layers, TrendingUp, Target, DollarSign } from "lucide-react";

const CATEGORY_TINT: Record<ClaimCategory, { fill: string; ring: string }> = {
  pharmacy:   { fill: "#4338CA", ring: "#C7D2FE" },
  preventive: { fill: "#047857", ring: "#A7F3D0" },
  specialist: { fill: "#0F766E", ring: "#99F6E4" },
  acute:      { fill: "#BE185D", ring: "#F9A8D4" },
  inpatient:  { fill: "#9F1239", ring: "#FCA5A5" },
  procedures: { fill: "#6D28D9", ring: "#C4B5FD" },
  behavioral: { fill: "#B45309", ring: "#FDE68A" },
};

/**
 * /claims — reverse-engineer clinical + behavioral clusters from claims data.
 * Left rail: member picker (18 simulated members spanning cluster space).
 * Right pane: 6-section analysis journey per selected member.
 */
export default function ClaimsPage() {
  const members = useMemo(() => buildAllMembers(), []);
  const [selectedId, setSelectedId] = useState(members[0].id);
  const m = members.find(x => x.id === selectedId)!;

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Claims Reverse-Engineering"
        title="Cluster assignment + future-claim prediction from historical claims"
        subtitle="Fathom parses 24 months of claims per member, assigns clinical + behavioral archetype, predicts specific claims across 3 / 6 / 12 month horizons, and quantifies where HabitNu intervention shifts the trajectory."
      />

      <div className="px-8 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">

        {/* ---------------- Member picker ---------------- */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-lilly-red mb-2 flex items-center gap-2">
            <Upload size={12} /> Input · {members.length} simulated members
          </div>
          {members.map(mm => (
            <MemberRow
              key={mm.id}
              m={mm}
              active={mm.id === selectedId}
              onClick={() => setSelectedId(mm.id)}
            />
          ))}
        </div>

        {/* ---------------- Analysis journey ---------------- */}
        <div className="space-y-5">

          {/* Header strip — who we're looking at */}
          <div className="bg-gradient-to-br from-[#12173D] via-[#1E2761] to-[#12173D] text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute -top-16 -right-8 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
            <div className="relative flex items-start gap-6 flex-wrap">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#CADCFC]/70">Member (anonymized)</div>
                <div className="text-[32px] font-extrabold tracking-tight mt-1 leading-none">{m.displayId}</div>
                <div className="text-[12px] text-[#CADCFC]/80 mt-2">
                  {m.ageBand} · {m.sex} · {m.region} · {m.planType}
                </div>
              </div>
              <div className="border-l border-white/10 pl-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#CADCFC]/60">24-month total</div>
                <div className="text-[24px] font-extrabold tabular-nums mt-1">{fmtUSD(m.signals.totalSpend24m)}</div>
                <div className="text-[11px] text-[#CADCFC]/75 mt-0.5">
                  {m.claims.length} distinct claims processed
                </div>
              </div>
              <div className="border-l border-white/10 pl-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#CADCFC]/60">ED visits</div>
                <div className="text-[24px] font-extrabold tabular-nums mt-1">{m.signals.edVisits24m}</div>
                <div className="text-[11px] text-[#CADCFC]/75 mt-0.5">last 24 months</div>
              </div>
              <div className="border-l border-white/10 pl-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#CADCFC]/60">Adherence</div>
                <div className="text-[24px] font-extrabold tabular-nums mt-1">{Math.round(m.signals.adherenceScore * 100)}%</div>
                <div className="text-[11px] text-[#CADCFC]/75 mt-0.5">refill regularity</div>
              </div>
            </div>
          </div>

          {/* ============ Section 1 — Raw claims timeline ============ */}
          <Card>
            <CardTitle
              title="1 · Raw claims — the last 24 months"
              subtitle="Every dot is a claim · height shows amount · color shows category"
            />
            <ClaimsTimeline claims={m.claims} />
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(CATEGORY_TINT).map(([k, t]) => (
                <span key={k} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
                  <span className="w-3 h-3 rounded" style={{ background: t.fill }} />
                  {k}
                </span>
              ))}
            </div>
          </Card>

          {/* ============ Section 2 — Fathom signal extraction ============ */}
          <Card>
            <CardTitle
              title="2 · What Fathom extracted"
              subtitle="Parsed diagnoses, medications, procedures, and utilization patterns from the raw claims"
              action={<span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1"><Sparkles size={12}/>Parsed in 1.2s</span>}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ExtractQuad label="Diagnoses" tint="rose" items={m.signals.diagnoses} />
              <ExtractQuad label="Active medications" tint="indigo" items={m.signals.activeMedications} />
              <ExtractQuad label="Procedures" tint="violet" items={m.signals.procedures.length ? m.signals.procedures : ["No procedures recorded"]} />
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Utilization pattern</div>
                <div className="text-[13px] font-bold text-lilly-navy mt-1 leading-snug">{m.signals.utilizationPattern}</div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                  <div><span className="text-slate-500">Specialist visits:</span> <b className="text-lilly-navy tabular-nums">{m.signals.specialistVisits24m}</b></div>
                  <div><span className="text-slate-500">ED visits:</span> <b className="text-lilly-navy tabular-nums">{m.signals.edVisits24m}</b></div>
                  <div><span className="text-slate-500">Providers:</span> <b className="text-lilly-navy tabular-nums">{m.signals.providerCount}</b></div>
                  <div><span className="text-slate-500">Avg refill gap:</span> <b className="text-lilly-navy tabular-nums">{m.signals.monthlyRefillGaps.toFixed(1)}mo</b></div>
                </div>
              </div>
            </div>
          </Card>

          {/* ============ Section 3 — Cluster assignment ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ClusterCard
              icon={<Layers size={18} />}
              stepLabel="3a · Clinical cluster"
              cluster={m.clinicalCluster}
            />
            <ClusterCard
              icon={<Layers size={18} />}
              stepLabel="3b · Behavioral cluster"
              cluster={m.behavioralCluster}
            />
          </div>

          {/* ============ Section 4 — Predictions ============ */}
          <Card>
            <CardTitle
              title="4 · Predicted claims · 3 / 6 / 12-month horizons"
              subtitle="Probability + estimated cost per specific claim · negative deltas = claims Fathom projects to prevent"
              action={<span className="text-[11px] text-lilly-red font-bold flex items-center gap-1"><TrendingUp size={12}/>Forward-looking</span>}
            />
            <div className="space-y-2">
              {(["3m", "6m", "12m"] as const).map(h => {
                const list = m.predictions.filter(p => p.horizon === h);
                if (list.length === 0) return null;
                return (
                  <div key={h}>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                      <span className="w-8 h-6 grid place-items-center rounded bg-slate-100 text-slate-700 font-mono">{h}</span>
                      {h === "3m" ? "Near-term" : h === "6m" ? "Mid-term" : "Trajectory-based"}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {list.map((pr, i) => (
                        <PredictionCard key={i} p={pr} />
                      ))}
                    </div>
                  </div>
                );
              })}
              {m.predictions.length === 0 && (
                <div className="text-[13px] text-slate-500 italic">
                  Steady member · no notable claims predicted beyond routine cadence.
                </div>
              )}
            </div>
          </Card>

          {/* ============ Section 5 — Interventions ============ */}
          <Card>
            <CardTitle
              title="5 · Recommended Fathom + Nu interventions"
              subtitle="Matched to both the clinical and behavioral cluster · projected 12-month impact"
              action={<span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1"><Target size={12}/>Intervention plan</span>}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {m.interventions.map((iv, i) => (
                <InterventionCard key={i} iv={iv} />
              ))}
            </div>
          </Card>

          {/* ============ Section 6 — Financial delta ============ */}
          <Card>
            <CardTitle
              title="6 · Projected 12-month spend"
              subtitle="With Fathom intervention vs baseline trajectory"
              action={<span className="text-[11px] text-lilly-navy font-bold flex items-center gap-1"><DollarSign size={12}/>Payer impact</span>}
            />
            <FinancialDelta without={m.projectedSpendWithout} withInt={m.projectedSpendWith} />
          </Card>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function MemberRow({ m, active, onClick }: { m: ClaimsMember; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full text-left p-3 rounded-lg transition border " +
        (active ? "bg-lilly-navy text-white border-lilly-navy shadow" : "bg-white border-lilly-line hover:border-lilly-navy/50")
      }
    >
      <div className="flex items-start gap-2">
        <div className={
          "w-8 h-8 rounded-full grid place-items-center text-[10px] font-bold shrink-0 " +
          (active ? "bg-white/15 text-white" : "text-white")
        }
        style={!active ? { background: m.clinicalCluster.colorHex } : {}}>
          {m.displayId.slice(2, 4)}
        </div>
        <div className="flex-1 min-w-0">
          <div className={"text-[12px] font-bold truncate " + (active ? "text-white" : "text-lilly-navy")}>
            {m.displayId}
          </div>
          <div className={"text-[10.5px] truncate " + (active ? "text-white/70" : "text-slate-500")}>
            {m.clinicalCluster.archetype} · {m.behavioralCluster.archetype}
          </div>
          <div className={"text-[10px] mt-1 tabular-nums " + (active ? "text-amber-300" : "text-slate-600")}>
            {fmtUSD(m.signals.totalSpend24m)} in 24mo · {m.signals.edVisits24m} ED
          </div>
        </div>
      </div>
    </button>
  );
}

function ClaimsTimeline({ claims }: { claims: ClaimsMember["claims"] }) {
  const data = claims.map((c, i) => {
    const [y, mo] = c.date.split("-").map(Number);
    // Convert to month-offset for x axis: months from Oct 2024 (index 0) to Sept 2026 (index 23)
    const monthIndex = (y - 2024) * 12 + (mo - 10);
    return {
      x: monthIndex,
      y: c.amount,
      cat: c.category,
      desc: c.description,
      date: c.date,
    };
  });

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 5, right: 20, left: 40, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" />
          <XAxis
            dataKey="x" type="number" domain={[0, 24]}
            ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]}
            tickFormatter={(v) => {
              const m = v % 12;
              const y = 2024 + Math.floor(v / 12);
              return `${["Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"][m]}'${String(y).slice(2)}`;
            }}
            tick={{ fontSize: 10, fill: "#4A4A4A" }}
          />
          <YAxis
            dataKey="y" type="number" scale="log" domain={[10, 50000]}
            tickFormatter={(v) => fmtUSD(v)}
            tick={{ fontSize: 10, fill: "#4A4A4A" }}
            label={{ value: "Amount ($, log)", angle: -90, position: "insideLeft", fill: "#4A4A4A", fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              return (
                <div className="bg-white shadow-lg rounded-md p-2 text-[11px] border border-slate-200">
                  <div className="font-bold text-lilly-navy">{p.desc}</div>
                  <div className="text-slate-500">{p.date} · {p.cat}</div>
                  <div className="tabular-nums font-bold mt-1">{fmtUSDFull(p.y)}</div>
                </div>
              );
            }}
          />
          <Scatter data={data} shape="circle">
            {data.map((d, i) => (
              <Cell key={i} fill={CATEGORY_TINT[d.cat as ClaimCategory].fill} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function ExtractQuad({ label, tint, items }: { label: string; tint: string; items: string[] }) {
  const bg = tint === "rose" ? "bg-rose-50 border-rose-200"
           : tint === "indigo" ? "bg-indigo-50 border-indigo-200"
           : tint === "violet" ? "bg-violet-50 border-violet-200"
           : "bg-slate-50 border-slate-200";
  const fg = tint === "rose" ? "text-rose-700"
           : tint === "indigo" ? "text-indigo-700"
           : tint === "violet" ? "text-violet-700"
           : "text-slate-600";
  return (
    <div className={`p-4 border rounded-lg ${bg}`}>
      <div className={`text-[10px] font-bold uppercase tracking-widest ${fg}`}>{label}</div>
      <ul className="mt-2 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-[12px] text-slate-700 font-mono">
            <span className={`inline-block w-1 h-1 rounded-full mr-2 align-middle ${fg.replace("text-","bg-")}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClusterCard({ icon, stepLabel, cluster }: {
  icon: React.ReactNode;
  stepLabel: string;
  cluster: ClaimsMember["clinicalCluster"];
}) {
  return (
    <div className="relative bg-white rounded-xl border border-lilly-line shadow-card overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: cluster.colorHex }} />
      <div className="p-5 pt-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
          {icon} {stepLabel}
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <div className="text-[18px] font-extrabold text-lilly-navy leading-tight">{cluster.name}</div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide"
            style={{ background: cluster.bgHex, color: cluster.colorHex }}
          >
            {cluster.archetype}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${cluster.confidence * 100}%`, background: cluster.colorHex }} />
          </div>
          <div className="text-[12px] font-bold tabular-nums text-lilly-navy">{Math.round(cluster.confidence * 100)}% confidence</div>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-4 mb-2">Why Fathom assigned this cluster</div>
        <ul className="space-y-1.5">
          {cluster.matchReason.map((rz, i) => (
            <li key={i} className="text-[12px] text-slate-700 flex items-start gap-2 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: cluster.colorHex }} />
              {rz}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PredictionCard({ p }: { p: ClaimsMember["predictions"][number] }) {
  const t = CATEGORY_TINT[p.category];
  const isPreventive = p.probability < 0;
  return (
    <div
      className="p-4 rounded-lg border-l-4"
      style={{ borderLeftColor: isPreventive ? "#047857" : t.fill, background: isPreventive ? "#ECFDF5" : "white" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isPreventive ? "#047857" : t.fill }}>
            {isPreventive ? "PROJECTED AVOIDANCE" : p.category}
          </div>
          <div className="text-[13.5px] font-bold text-lilly-navy mt-1 leading-snug">{p.claim}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {isPreventive ? "12mo cost" : "probability"}
          </div>
          <div className="text-[18px] font-extrabold tabular-nums" style={{ color: isPreventive ? "#047857" : t.fill }}>
            {isPreventive ? fmtUSD(p.estimatedCost) : `${Math.round(p.probability * 100)}%`}
          </div>
          <div className="text-[10px] text-slate-500 tabular-nums">
            {isPreventive ? "avoided" : `${fmtUSD(p.estimatedCost)} est.`}
          </div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-snug">
        <b className="text-lilly-navy">Driver:</b> {p.driver}
      </div>
    </div>
  );
}

function InterventionCard({ iv }: { iv: ClaimsMember["interventions"][number] }) {
  const savings = -iv.projectedImpact;
  return (
    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-1">
        ✓ Recommended
        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-white text-emerald-700">
          {iv.confidence.toUpperCase()} CONF
        </span>
      </div>
      <div className="text-[13.5px] font-bold text-lilly-navy mt-1 leading-snug">{iv.label}</div>
      <div className="text-[22px] font-extrabold text-emerald-700 mt-2 tabular-nums tracking-tight">
        {fmtUSD(savings)}<span className="text-[10px] text-slate-600 font-bold ml-1">/ 12mo</span>
      </div>
      <div className="text-[11px] text-slate-700 mt-2 pt-2 border-t border-emerald-200/60 leading-relaxed">
        <b className="text-emerald-900">Mechanism:</b> {iv.mechanism}
      </div>
    </div>
  );
}

function FinancialDelta({ without, withInt }: { without: number; withInt: number }) {
  const savings = without - withInt;
  const savingsPct = Math.round((savings / Math.max(without, 1)) * 100);
  const withoutW = 100;
  const withW = (withInt / Math.max(without, 1)) * 100;
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Without intervention</div>
          <div className="text-[28px] font-extrabold text-lilly-navy tabular-nums mt-1 tracking-tight">{fmtUSDFull(without)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Baseline trajectory · next 12 months</div>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">With Fathom + Nu</div>
          <div className="text-[28px] font-extrabold text-emerald-700 tabular-nums mt-1 tracking-tight">{fmtUSDFull(withInt)}</div>
          <div className="text-[11px] text-emerald-800 mt-1">
            {savings >= 0
              ? <>Saves <b className="tabular-nums">{fmtUSDFull(savings)}</b> · {savingsPct}% reduction</>
              : <>Net cost <b className="tabular-nums">+{fmtUSD(-savings)}</b> (higher engagement + preventive)</>}
          </div>
        </div>
      </div>
      {/* Visual bar comparison */}
      <div className="pt-4 border-t border-slate-100">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Visual comparison</div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-bold text-slate-600 w-32">Without HabitNu</div>
            <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
              <div className="h-full bg-slate-500 rounded" style={{ width: `${withoutW}%` }} />
            </div>
            <div className="text-[11px] font-bold text-lilly-navy tabular-nums w-16 text-right">{fmtUSD(without)}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-bold text-emerald-700 w-32">With HabitNu</div>
            <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
              <div className="h-full bg-emerald-500 rounded" style={{ width: `${withW}%` }} />
            </div>
            <div className="text-[11px] font-bold text-emerald-700 tabular-nums w-16 text-right">{fmtUSD(withInt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
