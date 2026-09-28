import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, StatCard } from "../components/Page";
import {
  forecastAll, computeAggregate, topRiskMembers, interventionScenarios,
  fmtUSD, fmtUSDFull, CATEGORIES, CATEGORY_META, Category,
  PatientClaimsForecast,
} from "../lib/insuranceClaims";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";

const NAVY = "#1B2A4E";
const RED  = "#D52B1E";
const AMBER = "#F59E0B";

/**
 * /insurance — Payer view of the GLP-1 cohort.
 * Uses the same 1,000-patient simulated dataset every other page consumes.
 * Rolls up per-patient forecasts into category totals, quarterly stack,
 * top-risk member queue, and Fathom intervention impact.
 */
export default function InsurancePage() {
  const forecasts = useMemo(() => forecastAll(), []);
  const agg = useMemo(() => computeAggregate(forecasts), [forecasts]);
  const topRisk = useMemo(() => topRiskMembers(forecasts, 12), [forecasts]);
  const scenarios = useMemo(() => interventionScenarios(agg, forecasts), [agg, forecasts]);

  const [tab, setTab] = useState<"overview" | "categories" | "cohort">("overview");

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Payer View · Claims Forecast"
        title="Projected insurance claims — next 4 quarters"
        subtitle={`Fathom combines wearable + CGM + behavioral + refill signals with 24 months of historical claim patterns for all ${agg.cohortSize} members. Category rollups for executives, member-level queue for care managers, quantified intervention impact for network partners.`}
        actions={
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {[
              { k: "overview",   label: "Overview" },
              { k: "categories", label: "Categories" },
              { k: "cohort",     label: "Cohort · risk queue" },
            ].map(t => (
              <button
                key={t.k}
                onClick={() => setTab(t.k as any)}
                className={
                  "px-3 py-1.5 rounded-md text-[12px] font-bold transition " +
                  (tab === t.k ? "bg-white text-lilly-navy shadow-sm" : "text-slate-500 hover:text-slate-800")
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      {tab === "overview" && (
        <>
          {/* ============ Hero — total forecast ============ */}
          <div className="px-8 mb-6">
            <div className="rounded-2xl bg-gradient-to-br from-[#12173D] via-[#1E2761] to-[#12173D] text-white p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden shadow-lg">
              <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-amber-400 opacity-10 blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="text-[10.5px] font-bold tracking-widest uppercase text-[#CADCFC]/70">
                  Total forecast · 12 months
                </div>
                <div className="text-[13px] text-[#E2E8F0]/85 mt-2 font-medium">
                  Projected paid claims across all categories, all {agg.cohortSize} members
                </div>
                <div className="text-[52px] md:text-[62px] font-extrabold tracking-[-2.5px] leading-none mt-3 tabular-nums">
                  {fmtUSD(agg.totalSpend)}
                  <span className="text-[22px] text-amber-300 tracking-tight ml-2">
                    ±{fmtUSD((agg.confBand.hi - agg.confBand.lo) / 2)}
                  </span>
                </div>
                <div className="text-[12px] text-[#CADCFC]/80 mt-2">
                  Confidence band <b className="text-amber-300">{Math.round(((agg.confBand.hi - agg.confBand.lo) / agg.totalSpend) * 100)}%</b> · updated as new signals arrive
                </div>
              </div>

              <div className="relative border-l border-white/10 pl-6">
                <div className="text-[10.5px] font-bold tracking-widest uppercase text-[#CADCFC]/60">
                  Fathom impact
                </div>
                <div className="text-[32px] font-extrabold text-emerald-300 mt-2 tabular-nums tracking-tight">
                  −{fmtUSD(agg.fathomImpact)}
                </div>
                <div className="text-[12.5px] text-[#CADCFC]/85 mt-2 leading-relaxed">
                  vs no-intervention counterfactual · <b className="text-white">{Math.round(agg.fathomImpactPct * 100)}% reduction</b> from behavioral + persistence gains detected in the cohort
                </div>
              </div>

              <div className="relative border-l border-white/10 pl-6">
                <div className="text-[10.5px] font-bold tracking-widest uppercase text-[#CADCFC]/60">
                  Highest-risk quarter
                </div>
                <div className="text-[32px] font-extrabold text-white mt-2 tracking-tight">
                  {agg.highestRiskQuarter}
                </div>
                <div className="text-[12.5px] text-[#CADCFC]/85 mt-2 leading-relaxed">
                  Dose-titration wave + winter comorbidity claims · <b className="text-white">{fmtUSD(agg.quarterlyStack.find(q => q.quarter === agg.highestRiskQuarter)?.total ?? 0)} projected</b> · watch the acute-care category
                </div>
              </div>
            </div>
          </div>

          {/* ============ Small stat row ============ */}
          <div className="px-8 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Members forecast"  value={agg.cohortSize.toLocaleString()} sub={`${agg.activeSize} active on program`}                accent="navy" />
            <StatCard label="Per-member cost"   value={fmtUSD(agg.totalSpend / agg.cohortSize)} sub="Blended average · all statuses"          accent="amber" />
            <StatCard label="Pharmacy share"    value={`${Math.round((agg.categoryTotals.pharmacy / agg.totalSpend) * 100)}%`} sub="Dominates every quarter"                accent="red" />
            <StatCard label="Acute reduction"   value="−22%"                             delta="Fathom intervention" deltaTone="up" sub="vs pre-HabitNu baseline"                       accent="green" />
          </div>

          {/* ============ Quarterly stacked chart ============ */}
          <div className="px-8 mb-6">
            <Card>
              <CardTitle
                title="Projected quarterly spend by category"
                subtitle="Q4 2026 through Q3 2027 · stacked bars · category shares highlighted"
              />
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={agg.quarterlyStack} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
                  <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: "#4A4A4A" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#4A4A4A" }}
                    tickFormatter={(v) => fmtUSD(v)}
                    label={{ value: "Projected claims", angle: -90, position: "insideLeft", fill: "#4A4A4A", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(v: number, name: string) => [fmtUSDFull(v), CATEGORY_META[name as Category]?.name ?? name]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(v: string) => CATEGORY_META[v as Category]?.name ?? v}
                  />
                  {CATEGORIES.map((c) => (
                    <Bar
                      key={c}
                      dataKey={c}
                      stackId="stack"
                      fill={CATEGORY_META[c].colorHex}
                      radius={c === "behavioral" ? [4, 4, 0, 0] : 0}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* ============ Intervention impact grid ============ */}
          <div className="px-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-amber-500 rounded" />
              <div className="text-[11px] font-bold uppercase tracking-widest text-amber-700">Intervention impact · where Fathom changes the trajectory</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {scenarios.map((sc, i) => (
                <div key={i} className="relative bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                    {sc.label === "Prevented" ? "✓ Prevented" :
                     sc.label === "Reduced"  ? "✓ Reduced"   : "✓ Earlier detection"}
                  </div>
                  <div className="text-[14.5px] font-bold text-lilly-navy mt-1 leading-snug">{sc.headline}</div>
                  <div className="text-[26px] font-extrabold text-emerald-700 mt-2 tabular-nums tracking-tight">
                    {fmtUSD(sc.savings)}
                    <span className="text-[11px] text-slate-600 font-bold ml-1">/ 12mo</span>
                  </div>
                  <div className="text-[11.5px] text-slate-700 mt-2 pt-2 border-t border-emerald-200/60 leading-relaxed">
                    <span className="font-bold text-emerald-900">Mechanism:</span> {sc.mechanism}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "categories" && (
        <>
          {/* ============ Category grid ============ */}
          <div className="px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {CATEGORIES.map((c) => {
                const meta = CATEGORY_META[c];
                const total = agg.categoryTotals[c];
                const share = agg.totalSpend ? total / agg.totalSpend : 0;
                const trend = agg.categoryTrends[c];
                const conf = agg.categoryConfidence[c];
                return (
                  <div key={c} className="relative bg-white border border-lilly-line rounded-xl overflow-hidden shadow-card">
                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: meta.colorHex }} />
                    <div className="p-5 pt-6">
                      <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: meta.colorHex }}>{meta.name}</div>
                      <div className="text-[15px] font-bold text-lilly-navy mt-1 leading-tight">{meta.sub}</div>

                      <div className="flex items-baseline gap-2 mt-3">
                        <div className="text-[28px] font-extrabold text-lilly-navy tabular-nums tracking-tight leading-none">{fmtUSD(total)}</div>
                        <span className={
                          "text-[11px] font-bold " +
                          (trend === "up" ? "text-rose-600" : trend === "down" ? "text-emerald-600" : "text-slate-500")
                        }>
                          {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"} {trend === "flat" ? "stable" : (trend === "up" ? "+4%" : "reduced")}
                        </span>
                      </div>

                      <div className="text-[11.5px] text-lilly-grey mt-1"><b className="text-lilly-navy">{Math.round(share * 100)}%</b> of total spend</div>

                      <div className="mt-2 h-[6px] rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(share * 100, 3)}%`,
                            background: meta.colorHex,
                          }}
                        />
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 text-[11.5px] text-slate-700 leading-relaxed">
                        <span className="font-bold text-lilly-navy">Fathom sees:</span>{" "}
                        {c === "pharmacy"  && "refill cadence, PA outcomes, dose-escalation trends."}
                        {c === "preventive" && "scheduled lab cadence, CGM data quality. Predictable pattern."}
                        {c === "specialist" && "coach-handoff outcomes, symptom escalation patterns. HabitNu reduces this."}
                        {c === "acute"      && "symptom-log severity + dehydration signals + refill gaps. Early detection prevents ED."}
                        {c === "inpatient"  && "BMI trajectory + gallstone signals + safety keywords. Low base rate, high impact."}
                        {c === "procedures" && "overnight SpO2 dips, breathing rate from Ring, ultrasound follow-ups."}
                        {c === "behavioral" && "engagement patterns, coach caseload. Baseline determined at contract."}
                      </div>

                      <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold tracking-wider uppercase"
                           style={{
                             background: conf >= 0.85 ? "#ECFDF5" : conf >= 0.7 ? "#FEF3C7" : "#F1F5F9",
                             color:      conf >= 0.85 ? "#047857" : conf >= 0.7 ? "#B45309" : "#64748B",
                           }}>
                        Confidence · {conf >= 0.85 ? "high" : conf >= 0.7 ? "medium" : "low"} · {Math.round(conf * 100)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============ Per-category chart ============ */}
          <div className="px-8 mt-6">
            <Card>
              <CardTitle title="Category ranking · 12-month spend"
                         subtitle="Sorted by projected total · pharmacy dominates" />
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  layout="vertical"
                  data={
                    CATEGORIES
                      .map(c => ({ name: CATEGORY_META[c].name, total: agg.categoryTotals[c], color: CATEGORY_META[c].colorHex }))
                      .sort((a, b) => b.total - a.total)
                  }
                  margin={{ top: 10, right: 40, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#4A4A4A" }} tickFormatter={(v) => fmtUSD(v)} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#1B2A4E", fontWeight: 700 }} width={130} />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => [fmtUSDFull(v), "Projected"]} />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                    {CATEGORIES.map((c) => (
                      <Cell key={c} fill={CATEGORY_META[c].colorHex} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {tab === "cohort" && (
        <>
          {/* ============ Top-risk member queue ============ */}
          <div className="px-8">
            <Card padding="p-0">
              <div className="p-5 pb-3">
                <CardTitle
                  title="Care-manager working queue"
                  subtitle={`Fathom scored ${agg.cohortSize} members · top 12 flagged for outreach · one tap opens the coach handoff view`}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border-y border-slate-200">
                      <th className="px-4 py-3">Member</th>
                      <th className="px-4 py-3">Program · risk</th>
                      <th className="px-4 py-3">Predicted claim · 90d</th>
                      <th className="px-4 py-3 w-52">Probability</th>
                      <th className="px-4 py-3 text-right">Est. cost</th>
                      <th className="px-4 py-3">Fathom's driver</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRisk.map((f, i) => <RiskRow key={f.patient.id} f={f} idx={i} />)}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* ============ Signal provenance ============ */}
          <div className="px-8 mt-6">
            <Card>
              <CardTitle
                title="What Fathom sees · signal provenance behind these numbers"
                subtitle="Coverage rates on this cohort · higher coverage = higher forecast confidence"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { l: "Refills",           h: "Pharmacy claims stream", d: "Real-time · PA outcomes, fill dates, escalations",   dot: "g", cov: "100%" },
                  { l: "Ring",              h: "Wearable biometrics",    d: "HRV, HR, SpO2, sleep stages · continuous",             dot: "g", cov: "78%" },
                  { l: "CGM",               h: "Glucose curves",         d: "TIR, post-meal peaks, variability · optional",        dot: "g", cov: "41%" },
                  { l: "Behavioral",        h: "App engagement",         d: "Logs, opens, streaks, symptoms · event-based",         dot: "g", cov: "100%" },
                  { l: "Claims history",    h: "24-month payer feed",    d: "Historical claim types, costs, timing · baseline",     dot: "a", cov: "monthly" },
                  { l: "Labs",              h: "A1c, lipid, kidney",     d: "Quarterly cadence · latency ~30 days",                 dot: "a", cov: "quarterly" },
                  { l: "Prescriber notes",  h: "EHR (opt-in)",           d: "Diagnoses, comorbidities · lowest coverage",           dot: "r", cov: "22%" },
                  { l: "Coach outcomes",    h: "HabitNu case log",       d: "Touchpoints, escalations · powers impact estimates",   dot: "g", cov: "100%" },
                ].map((p, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span className={
                        "w-2 h-2 rounded-full " +
                        (p.dot === "g" ? "bg-emerald-500" : p.dot === "a" ? "bg-amber-500" : "bg-rose-500")
                      } />
                      {p.l}
                      <span className="ml-auto text-[9.5px] text-slate-400">{p.cov}</span>
                    </div>
                    <div className="text-[13px] font-bold text-lilly-navy mt-1">{p.h}</div>
                    <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">{p.d}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function RiskRow({ f, idx }: { f: PatientClaimsForecast; idx: number }) {
  const p = f.patient;
  const cat = f.predictedClaim.category;
  const cm = CATEGORY_META[cat];
  const prob = f.acuteProb90d;
  const probTone =
    prob >= 0.6 ? { bar: "bg-rose-500",    txt: "text-rose-600" }
    : prob >= 0.4 ? { bar: "bg-amber-500", txt: "text-amber-700" }
    :               { bar: "bg-emerald-500", txt: "text-emerald-700" };

  // Initial-avatar tint by risk
  const tint =
    p.rss === "Critical" ? "from-rose-600 to-rose-800"
    : p.rss === "High"   ? "from-orange-500 to-orange-700"
    : p.rss === "Medium" ? "from-amber-500 to-amber-700"
    :                      "from-slate-500 to-slate-700";
  const initial = (p.name.match(/(\b[A-Z])/g) ?? ["?"]).slice(0, 2).join("");

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${tint} text-white grid place-items-center text-[11px] font-bold shrink-0`}>
            {initial}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-lilly-navy truncate">{p.name}</div>
            <div className="text-[10.5px] text-slate-500 tabular-nums">
              {p.age}{p.sex} · {p.id} · {p.region}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-[12px] font-semibold text-lilly-navy">
          {p.status} · wk {p.weeksOnProgram}
        </div>
        <div className="text-[10.5px] text-slate-500 mt-0.5">
          {p.rss} · GES {p.gesTier} · PDC {(p.pdc * 100).toFixed(0)}%
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold"
          style={{ background: cm.bgHex, color: cm.colorHex }}
        >
          {f.predictedClaim.type}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded bg-slate-100 overflow-hidden min-w-[60px]">
            <div className={`h-full ${probTone.bar} rounded`} style={{ width: `${Math.round(prob * 100)}%` }} />
          </div>
          <div className={`text-[12px] font-bold tabular-nums w-8 text-right ${probTone.txt}`}>{Math.round(prob * 100)}%</div>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-bold text-lilly-navy tabular-nums">
        {fmtUSDFull(f.predictedClaim.estCost)}
      </td>
      <td className="px-4 py-3">
        <div className="text-[11.5px] text-slate-600 leading-snug max-w-xs">{f.predictedClaim.driver}</div>
      </td>
      <td className="px-4 py-3">
        <button className="px-2.5 py-1 border border-indigo-500 text-indigo-700 rounded text-[10.5px] font-bold hover:bg-indigo-50 transition">
          Coach view →
        </button>
      </td>
    </tr>
  );
}
