import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import { PATIENTS, tierCounts, tierMeta, BUCKET_LABELS } from "../lib/patientData";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, Legend,
} from "recharts";

// ===== Palette =====
const RED   = "#D52B1E";
const NAVY  = "#1B2A4E";
const GREEN = "#16A34A";

// Tier color is the visual identity of the eligibility tier (T1 = highest need, T5 = lowest)
const TIER_COLORS: Record<string, string> = {
  T1: "#D52B1E",  // red
  T2: "#EE6055",  // coral
  T3: "#F5B83E",  // amber
  T4: "#94A3B8",  // grey
  T5: "#1B2A4E",  // navy
};
const TIER_NEED_LABEL: Record<string, string> = {
  T1: "T1 (Highest Need)",
  T2: "T2",
  T3: "T3",
  T4: "T4",
  T5: "T5 (Lowest Need)",
};
const TIER_RISK_LABEL: Record<string, string> = {
  T1: "Highest Risk",
  T2: "High Risk",
  T3: "Moderate Risk",
  T4: "Low Risk",
  T5: "Lowest Risk",
};

// Drift Severity Bands — mapped from ppsBand R1-R4 → D1-D4
// R1 (highest persistence) → D1 Stable, R4 (lowest persistence) → D4 Critical Drift
const DRIFT_BAND_FROM_R: Record<string, string> = { R1: "D1", R2: "D2", R3: "D3", R4: "D4" };
const DRIFT_BAND_COLORS: Record<string, string> = {
  D1: "#16A34A",  // Stable — green
  D2: "#F5B83E",  // Emerging Drift — amber
  D3: "#F5803E",  // Significant Drift — orange
  D4: "#D52B1E",  // Critical Drift — red
};
const DRIFT_BAND_META: Record<string, { title: string; sub: string; color: string }> = {
  D1: { title: "Stable",            sub: "On track, low risk",                                  color: "#16A34A" },
  D2: { title: "Emerging Drift",    sub: "Early warning, monitor closely",                       color: "#F5B83E" },
  D3: { title: "Significant Drift", sub: "Clear negative trend, needs outreach",                color: "#F5803E" },
  D4: { title: "Critical Drift",    sub: "Severe deviation, high risk of discontinuation",       color: "#D52B1E" },
};

export default function Eligibility() {
  const [tierFilter, setTierFilter] = useState<string>("all");
  const tiers = useMemo(tierCounts, []);

  // ===== Top-left scatter — Population Clinical Need vs. Diabetes Severity =====
  const scatter = PATIENTS.slice(0, 600).map(p => ({
    bmi: p.bmi, hba1c: p.hba1c, ges: p.ges, tier: p.gesTier, name: p.name,
  }));
  const groups = ["T1", "T2", "T3", "T4", "T5"].map(t => ({
    tier: t,
    data: scatter.filter(d => d.tier === t),
  }));

  const filtered = tierFilter === "all"
    ? PATIENTS.filter(p => p.gesTier === "T1" || p.gesTier === "T2").slice(0, 50)
    : PATIENTS.filter(p => p.gesTier === tierFilter).slice(0, 50);

  // ===== Population Drift Map (Persistence Risk Tier × Drift Severity Band) =====
  const TIERS_AXIS = ["T1", "T2", "T3", "T4", "T5"] as const;
  const DRIFT_AXIS = ["D1", "D2", "D3", "D4"] as const;

  function jitter(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    return ((h & 0xffff) / 0xffff - 0.5) * 0.72;
  }

  const trScatter = PATIENTS.map(p => {
    const driftBand = DRIFT_BAND_FROM_R[p.ppsBand] as (typeof DRIFT_AXIS)[number];
    return {
      x: TIERS_AXIS.indexOf(p.gesTier) + 1 + jitter(p.id + "x"),
      y: DRIFT_AXIS.indexOf(driftBand) + 1 + jitter(p.id + "y"),
      ges: p.ges,
      pps: Math.round(p.pps * 100),
      tier: p.gesTier,
      driftBand,
      name: p.name,
      id: p.id,
    };
  });

  // Color encoding = Intervention Priority:
  //   non-T5 patients get the color of their drift band (D1 green → D4 red)
  //   T5 (Lowest Risk) is always navy — low intervention priority even when drift is high
  const colorGroups = [
    { key: "D1", color: DRIFT_BAND_COLORS.D1, name: "D1 · Stable",            data: trScatter.filter(d => d.tier !== "T5" && d.driftBand === "D1") },
    { key: "D2", color: DRIFT_BAND_COLORS.D2, name: "D2 · Emerging Drift",    data: trScatter.filter(d => d.tier !== "T5" && d.driftBand === "D2") },
    { key: "D3", color: DRIFT_BAND_COLORS.D3, name: "D3 · Significant Drift", data: trScatter.filter(d => d.tier !== "T5" && d.driftBand === "D3") },
    { key: "D4", color: DRIFT_BAND_COLORS.D4, name: "D4 · Critical Drift",    data: trScatter.filter(d => d.tier !== "T5" && d.driftBand === "D4") },
    { key: "T5", color: NAVY,                  name: "T5 · Lowest Risk",       data: trScatter.filter(d => d.tier === "T5") },
  ];

  // Hardcoded counts from target image (POC demo values)
  const DEMO_COUNTS: Record<string, Record<string, number>> = {
    D4: { T1: 48,  T2: 37,  T3: 22,  T4: 10,  T5: 5   },
    D3: { T1: 109, T2: 86,  T3: 52,  T4: 28,  T5: 12  },
    D2: { T1: 231, T2: 178, T3: 104, T4: 63,  T5: 27  },
    D1: { T1: 612, T2: 445, T3: 242, T4: 136, T5: 63  },
  };
  const maxCell = Math.max(...DRIFT_AXIS.flatMap(d => TIERS_AXIS.map(t => DEMO_COUNTS[d][t])));

  // ===== Score Input Weights — updated to match target =====
  const inputContrib = [
    { name: "BMI ≥ 30",                                  weight:  32 },
    { name: "BMI 27–30 + comorbidity",                   weight:  18 },
    { name: "HbA1c ≥ 7.0%",                              weight:  15 },
    { name: "HbA1c 6.5–6.9%",                            weight:  10 },
    { name: "Cardiovascular disease (ASCVD)",            weight:   8 },
    { name: "MASLD / Fatty liver",                       weight:   5 },
    { name: "Obstructive sleep apnea (OSA)",             weight:   3 },
    { name: "eGFR < 30",                                 weight: -12 },
    { name: "Active contraindications",                  weight: -25 },
    { name: "History of medullary thyroid cancer (MTC)", weight: -40 },
    { name: "Pregnancy / breastfeeding",                 weight: -45 },
  ];

  // Heatmap color for the cell-counts matrix — green (low) → red (high)
  function cellColor(intensity: number) {
    if (intensity < 0.25) return `rgba(22,163,74,${0.12 + intensity * 1.20})`;
    if (intensity < 0.50) return `rgba(245,184,62,${0.30 + (intensity - 0.25) * 1.4})`;
    if (intensity < 0.75) return `rgba(245,128,62,${0.50 + (intensity - 0.50) * 1.3})`;
    return `rgba(213,43,30,${0.65 + (intensity - 0.75) * 1.4})`;
  }

  // Drift map tooltip
  const renderDriftTip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;
    const d = payload[0].payload;
    const m = DRIFT_BAND_META[d.driftBand];
    return (
      <div className="bg-white border border-lilly-line rounded-lg shadow-card px-3 py-2 text-[12px]">
        <div className="font-bold text-lilly-navy">{d.name}</div>
        <div className="text-lilly-grey">{d.id}</div>
        <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
          <span className="text-lilly-grey">Risk Tier</span>
          <span className="font-semibold text-lilly-navy">{d.tier} · {TIER_RISK_LABEL[d.tier]}</span>
          <span className="text-lilly-grey">Drift Band</span>
          <span className="font-semibold" style={{ color: m.color }}>{d.driftBand} · {m.title}</span>
          <span className="text-lilly-grey">GES</span>
          <span className="font-semibold text-lilly-navy">{d.ges}</span>
          <span className="text-lilly-grey">Persistence</span>
          <span className="font-semibold text-lilly-navy">{d.pps}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="GLP-1 Eligibility Scoring"
        title="GLP-1 Eligibility Score (GES)"
        subtitle="Composite 0–100 score with auditable inputs. Surfaces on-label, high-benefit candidates first; respects contraindications as hard gates."
      />

      {/* ===== Tier count cards ===== */}
      <div className="px-8 grid grid-cols-2 md:grid-cols-5 gap-4 mb-7">
        {(["T1", "T2", "T3", "T4", "T5"] as const).map(t => {
          const meta = tierMeta(t);
          const needSuffix = t === "T1" ? " · Highest Need" : t === "T5" ? " · Lowest Need" : "";
          return (
            <div key={t} className="bg-white border border-lilly-line rounded-xl shadow-card overflow-hidden">
              <div className={`px-3 py-1.5 text-[10.5px] font-bold tracking-wider ${meta.color}`}>{t}{needSuffix}</div>
              <div className="p-4">
                <div className="text-[28px] font-bold text-lilly-navy leading-none">{tiers[t]}</div>
                <div className="text-[11px] text-lilly-grey mt-1.5 leading-snug">{meta.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== TOP ROW: Clinical Need scatter + Score Input Weights ===== */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">

        {/* Top-left: Population Clinical Need vs. Diabetes Severity */}
        <Card className="lg:col-span-2">
          <CardTitle
            title="Population Clinical Need vs. Diabetes Severity"
            subtitle="Each dot = a patient. Color = Clinical Need Tier (T1–T5). Size = Generalized Eligibility Score (GES)."
          />
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 28, left: 20 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" />
              <XAxis
                type="number"
                dataKey="bmi"
                name="BMI"
                domain={[18, 55]}
                tick={{ fontSize: 11, fill: "#4A4A4A" }}
                label={{
                  value: "Obesity Burden (BMI)",
                  position: "insideBottom",
                  offset: -12,
                  fill: "#1B2A4E",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
              <YAxis
                type="number"
                dataKey="hba1c"
                name="HbA1c"
                domain={[4.5, 12.5]}
                tick={{ fontSize: 11, fill: "#4A4A4A" }}
                label={{
                  value: "Diabetes Severity (HbA1c %)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 0,
                  fill: "#1B2A4E",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
              <ZAxis type="number" dataKey="ges" range={[40, 200]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v: any, k: any) => [v, k]} />
              {groups.map(g => (
                <Scatter
                  key={g.tier}
                  name={TIER_NEED_LABEL[g.tier]}
                  data={g.data}
                  fill={TIER_COLORS[g.tier]}
                  fillOpacity={0.78}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>

          {/* Axis-direction caption (just under the chart) */}
          <div className="flex justify-between items-center text-[10.5px] text-lilly-grey italic px-4 mt-1 mb-3">
            <span>Higher ↑ Greater Severity</span>
            <span>Higher → Greater Obesity</span>
          </div>

          {/* Custom legend — 5 tier dots in one row, no overlap with axis labels */}
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-1.5 text-[11.5px] font-semibold text-lilly-navy border-t border-lilly-line pt-3">
            {(["T1", "T2", "T3", "T4", "T5"] as const).map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ background: TIER_COLORS[t] }}
                />
                <span>{TIER_NEED_LABEL[t]}</span>
              </div>
            ))}
          </div>

          {/* Dot-size footnote */}
          <div className="text-center text-[10.5px] text-lilly-grey italic mt-2">
            Dot size = Generalized Eligibility Score (GES)
          </div>
        </Card>

        {/* Top-right: Score Input Weights */}
        <Card>
          <CardTitle title="Score Input Weights" subtitle="Auditable, clinician-reviewed (illustrative)" />
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={inputContrib} layout="vertical" margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" horizontal={false} />
              <XAxis type="number" domain={[-105, 50]} tick={{ fontSize: 10.5, fill: "#4A4A4A" }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: "#1B2A4E" }}
                width={180}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar
                dataKey="weight"
                radius={[0, 4, 4, 0]}
                label={{
                  position: "right",
                  fill: "#1B2A4E",
                  fontSize: 10.5,
                  fontWeight: 700,
                  formatter: (v: any) => (v > 0 ? `+${v}` : `${v}`),
                }}
              >
                {inputContrib.map((d, i) => (
                  <Cell key={i} fill={d.weight >= 0 ? RED : NAVY} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="px-2 mt-2 text-[10.5px]">
            <div className="text-center text-lilly-grey font-semibold mb-1.5">
              Weight (Relative Contribution to Score)
            </div>
            <div className="flex justify-between font-bold">
              <span style={{ color: RED }}>← Decrease Score</span>
              <span style={{ color: NAVY }}>Increase Score →</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== BOTTOM ROW: Drift Map + Member Counts ===== */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">

        {/* Bottom-left: Population Drift Map */}
        <Card className="lg:col-span-2">
          <CardTitle
            title="Population Drift Map — Persistence Risk Tier × Drift Severity Band"
            subtitle="Each dot = a patient. X = Persistence Risk Tier (T1–T5). Y = Drift Severity Band (D1–D4). Color = Intervention Priority."
            action={<Badge color="red">{PATIENTS.length} patients</Badge>}
          />

          {/* Y-axis descriptive labels + chart, side by side */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3 flex flex-col justify-around pt-4 pb-14">
              {[...DRIFT_AXIS].reverse().map(d => {
                const m = DRIFT_BAND_META[d];
                return (
                  <div key={d} className="text-right pr-2">
                    <div className="text-[12.5px] font-bold" style={{ color: m.color }}>{d} · {m.title}</div>
                    <div className="text-[10px] text-lilly-grey leading-tight mt-0.5">{m.sub}</div>
                  </div>
                );
              })}
              <div className="text-[10px] text-lilly-navy font-bold mt-2 text-right pr-2">
                Drift Severity Band
              </div>
            </div>
            <div className="col-span-9">
              <ResponsiveContainer width="100%" height={420}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Risk Tier"
                    domain={[0.4, 5.6]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(v: number) => TIERS_AXIS[v - 1]}
                    tick={{ fontSize: 13, fill: "#1B2A4E", fontWeight: 700 }}
                    axisLine={{ stroke: "#94A3B8" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Drift Band"
                    domain={[0.4, 4.6]}
                    ticks={[1, 2, 3, 4]}
                    tickFormatter={(v: number) => DRIFT_AXIS[v - 1]}
                    tick={{ fontSize: 12, fill: "#1B2A4E", fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    hide
                  />
                  <ZAxis type="number" dataKey="ges" range={[20, 120]} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} content={renderDriftTip} />
                  {colorGroups.map(g => (
                    <Scatter
                      key={g.key}
                      name={g.name}
                      data={g.data}
                      fill={g.color}
                      fillOpacity={0.78}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* X-axis tier-risk labels (under the chart, aligned to the 9-col chart area) */}
          <div className="grid grid-cols-12 gap-3 mt-1">
            <div className="col-span-3"></div>
            <div className="col-span-9 grid grid-cols-5 text-center px-1">
              {TIERS_AXIS.map(t => (
                <div key={t} className="text-[11px]" style={{ color: TIER_COLORS[t] }}>
                  <div className="font-bold">{t}</div>
                  <div className="text-[10px] mt-0.5">{TIER_RISK_LABEL[t]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-center text-[12px] text-lilly-navy font-bold">
            Persistence Risk Tier
          </div>
          <div className="text-center text-[10.5px] text-lilly-grey italic">
            Likelihood of Discontinuation (Next 90 Days)
          </div>
        </Card>

        {/* Bottom-right: Member Counts matrix */}
        <Card>
          <CardTitle
            title="Member Counts by Drift Band × Risk Tier"
            subtitle="The 4 × 5 intersection matrix · color intensity = member count"
          />
          <table className="w-full text-[11.5px]">
            <thead>
              <tr>
                <th className="text-left pb-2"></th>
                {TIERS_AXIS.map(t => (
                  <th key={t} className="text-center pb-2 px-1">
                    <div className="text-[11px] font-bold" style={{ color: TIER_COLORS[t] }}>{t}</div>
                    <div className="text-[9.5px] font-semibold text-lilly-grey">{TIER_RISK_LABEL[t]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...DRIFT_AXIS].reverse().map(d => {
                const m = DRIFT_BAND_META[d];
                return (
                  <tr key={d}>
                    <td className="py-1.5 pr-2 align-middle">
                      <div className="text-[11px] font-bold" style={{ color: m.color }}>{d}</div>
                      <div className="text-[9.5px] text-lilly-grey leading-tight">{m.title}</div>
                    </td>
                    {TIERS_AXIS.map(t => {
                      const v = DEMO_COUNTS[d][t];
                      const intensity = v / maxCell;
                      return (
                        <td key={t} className="px-1 py-1">
                          <div
                            className="text-center font-bold rounded-md py-2 text-[13px]"
                            style={{
                              background: cellColor(intensity),
                              color: intensity > 0.55 ? "#fff" : "#1B2A4E",
                            }}
                          >
                            {v}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 flex items-center gap-2 text-[10.5px] text-lilly-grey">
            <span>Lower</span>
            <div
              className="flex-1 h-1.5 rounded"
              style={{
                background:
                  "linear-gradient(to right, rgba(22,163,74,0.40), rgba(245,184,62,0.80), rgba(245,128,62,0.85), rgba(213,43,30,0.95))",
              }}
            />
            <span>Higher</span>
          </div>

          <div className="mt-4 pt-3 border-t border-lilly-line/60 text-[11.5px] text-lilly-grey leading-relaxed">
            <span className="font-bold text-lilly-navy">How to read.</span> The top-left region (T1 × D4) is the highest-priority
            outreach cohort — highest persistence risk colliding with the most severe drift. The bottom-right (T5 × D1) is the
            healthy, stable population. Critical drift in highest-risk tiers is where the coach reference engine produces the
            largest measurable lift.
          </div>
        </Card>
      </div>

      {/* ===== Patient table (unchanged) ===== */}
      <div className="px-8">
        <Card padding="p-0">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-lilly-line">
            <div>
              <div className="text-sm font-bold text-lilly-navy">Patient eligibility ranking</div>
              <div className="text-[12px] text-lilly-grey mt-0.5">Filter by tier to drill into a cohort</div>
            </div>
            <div className="flex gap-1.5">
              {["all", "T1", "T2", "T3", "T4", "T5"].map(t => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${tierFilter === t ? "bg-lilly-navy text-white" : "bg-lilly-mist text-lilly-grey hover:bg-lilly-line"}`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-lilly-grey font-semibold border-b border-lilly-line bg-lilly-mist/50">
                <th className="text-left py-2.5 px-5">Patient</th>
                <th className="text-left">Age/Sex</th>
                <th className="text-left">BMI</th>
                <th className="text-left">HbA1c</th>
                <th className="text-left">Comorbidities</th>
                <th className="text-left">Bucket</th>
                <th className="text-right">GES</th>
                <th className="text-right pr-5">Tier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const meta = tierMeta(p.gesTier);
                return (
                  <tr key={p.id} className="border-b border-lilly-line/60 hover:bg-lilly-mist/40">
                    <td className="py-2 px-5">
                      <div className="font-semibold text-lilly-navy">{p.name}</div>
                      <div className="text-[10.5px] text-lilly-grey">{p.id} · {p.state}</div>
                    </td>
                    <td>{p.age}{p.sex}</td>
                    <td className="font-mono">{p.bmi.toFixed(1)}</td>
                    <td className="font-mono">{p.hba1c.toFixed(1)}</td>
                    <td className="text-[11.5px] text-lilly-grey">{p.comorbidities.slice(0, 2).join(", ") || "—"}{p.comorbidities.length > 2 ? ` +${p.comorbidities.length - 2}` : ""}</td>
                    <td className="text-[11.5px] text-lilly-grey">{BUCKET_LABELS[p.bucket]}</td>
                    <td className="text-right font-bold text-lilly-navy">{p.ges}</td>
                    <td className="text-right pr-5">
                      <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${meta.color}`}>{p.gesTier}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
