import { useMemo } from "react";
import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import { PATIENTS, riskCounts, readinessCounts, riskMeta, readinessMeta } from "../lib/patientData";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Treemap, LabelList,
} from "recharts";

const RED = "#D52B1E";
const NAVY = "#1B2A4E";

export default function Risk() {
  const risk = useMemo(riskCounts, []);
  const ready = useMemo(readinessCounts, []);

  // Simplified 3-band convention: Stable / Watch / Critical
  //   Stable   = clinical RSS "Low"           → no intervention needed
  //   Watch    = clinical RSS "Medium"        → monitor, build playbook
  //   Critical = clinical RSS "High" + "Critical" merged → immediate intervention
  // For each band we break out the population by GLP-1 eligibility tier (T1–T4)
  // so the chart answers: "of the patients in this risk band, how many sit in
  // each eligibility tier?" The narrative reads cleanly — Stable skews to T1/T2
  // (most eligible), Critical skews to T3/T4 (least eligible / contraindicated).
  const bandOf = (rss: string) =>
    rss === "Low"      ? "Stable"   :
    rss === "Medium"   ? "Watch"    :
                         "Critical";   // High and Critical merge
  const riskByBand = (["Stable", "Watch", "Critical"] as const).map(b => {
    const pts = PATIENTS.filter(p => bandOf(p.rss) === b);
    return {
      band: b,
      T1: pts.filter(p => p.gesTier === "T1").length,
      T2: pts.filter(p => p.gesTier === "T2").length,
      T3: pts.filter(p => p.gesTier === "T3").length,
      T4: pts.filter(p => p.gesTier === "T4").length,
      total: pts.length,
    };
  });

  // Aggregate risk profile — population-level risk dimensions sorted high-to-low.
  // Rendered as a horizontal bar chart so the magnitudes are directly comparable
  // (the previous radar chart obscured this — area and angle don't map cleanly
  // to numeric values).
  const riskDimensions = [
    { dim: "Comorbidity load",   risk: 78 },
    { dim: "Cardiovascular",     risk: 64 },
    { dim: "Adherence risk",     risk: 55 },
    { dim: "Mental-health flags", risk: 48 },
    { dim: "Renal function",     risk: 42 },
    { dim: "Engagement",         risk: 36 },
  ].sort((a, b) => b.risk - a.risk);
  // Threshold colors: ≥60 = red (high), 40–59 = amber (moderate), <40 = green (low)
  const riskTint = (v: number) => v >= 60 ? "#DC2626" : v >= 40 ? "#F59E0B" : "#10B981";

  const treemap = [
    { name: "Hypertension", size: PATIENTS.filter(p => p.comorbidities.includes("Hypertension")).length },
    { name: "Hyperlipidemia", size: PATIENTS.filter(p => p.comorbidities.includes("Hyperlipidemia")).length },
    { name: "OSA", size: PATIENTS.filter(p => p.comorbidities.includes("OSA")).length },
    { name: "MASLD", size: PATIENTS.filter(p => p.comorbidities.includes("MASLD")).length },
    { name: "Depression", size: PATIENTS.filter(p => p.comorbidities.includes("Depression")).length },
    { name: "Anxiety", size: PATIENTS.filter(p => p.comorbidities.includes("Anxiety")).length },
    { name: "OA", size: PATIENTS.filter(p => p.comorbidities.includes("Osteoarthritis")).length },
    { name: "CKD-3", size: PATIENTS.filter(p => p.comorbidities.includes("CKD-3")).length },
    { name: "CAD", size: PATIENTS.filter(p => p.comorbidities.includes("Coronary artery disease")).length },
    { name: "AF", size: PATIENTS.filter(p => p.comorbidities.includes("Atrial fibrillation")).length },
  ];

  const critical = PATIENTS.filter(p => p.rss === "Critical").slice(0, 8);

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Population Risk Segmentation"
        title="Persistence Risk & Momentum"
        subtitle="Two-axis segmentation: clinical risk (RSS) and behavioral readiness (PPS band). The intersection drives the intervention playbook."
      />

      <div className="px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {(["Low", "Medium", "High", "Critical"] as const).map(b => {
          const meta = riskMeta(b);
          return (
            <div key={b} className="bg-white border border-lilly-line rounded-xl shadow-card overflow-hidden">
              <div className={`px-3 py-1.5 text-[11px] font-bold tracking-wider ${meta.color}`}>RISK · {b.toUpperCase()}</div>
              <div className="p-4">
                <div className="text-[28px] font-bold text-lilly-navy leading-none">{risk[b]}</div>
                <div className="text-[11px] text-lilly-grey mt-1.5">{((risk[b] / 1000) * 100).toFixed(1)}% of population</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-8 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
        {(["R1", "R2", "R3", "R4"] as const).map(b => {
          const meta = readinessMeta(b);
          return (
            <div key={b} className="bg-white border border-lilly-line rounded-xl p-4 shadow-card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${meta.color}`}>{b}</div>
              <div>
                <div className="text-[18px] font-bold text-lilly-navy leading-none">{ready[b]}</div>
                <div className="text-[11px] text-lilly-grey mt-0.5">{meta.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        <Card>
          <CardTitle title="Risk band × Eligibility tier" subtitle="3 simplified bands — Stable, Watch, Critical — broken down by GLP-1 eligibility tier" />
          <ResponsiveContainer width="100%" height={290}>
            <BarChart
              data={riskByBand}
              layout="vertical"
              margin={{ top: 10, right: 28, left: 24, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="band"
                tick={{ fontSize: 12, fill: "#1B2A4E", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={84}
              />
              <Tooltip />
              <Bar dataKey="T1" stackId="a" fill="#BFDBFE" />
              <Bar dataKey="T2" stackId="a" fill="#60A5FA" />
              <Bar dataKey="T3" stackId="a" fill="#1D4ED8" />
              <Bar dataKey="T4" stackId="a" fill="#0F1B36">
                <LabelList dataKey="total" position="right" style={{ fontSize: 11, fontWeight: 700, fill: "#1B2A4E" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 px-2 pt-1 text-[10.5px] text-lilly-grey font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{background:"#BFDBFE"}} />T1</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{background:"#60A5FA"}} />T2</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{background:"#1D4ED8"}} />T3</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{background:"#0F1B36"}} />T4</span>
            <span className="ml-auto text-lilly-grey/80">Number at end of bar = total patients in band</span>
          </div>
        </Card>

        <Card>
          <CardTitle title="Aggregate risk profile" subtitle="Population-level risk dimensions, sorted high-to-low" />
          <ResponsiveContainer width="100%" height={290}>
            <BarChart
              data={riskDimensions}
              layout="vertical"
              margin={{ top: 8, right: 32, left: 12, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="dim"
                tick={{ fontSize: 11.5, fill: "#1B2A4E", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={150}
              />
              <Tooltip formatter={(v: number) => `${v} / 100`} />
              <Bar dataKey="risk" radius={[0, 6, 6, 0]}>
                {riskDimensions.map((d, i) => (
                  <Cell key={i} fill={riskTint(d.risk)} />
                ))}
                <LabelList dataKey="risk" position="right" style={{ fontSize: 11.5, fontWeight: 700, fill: "#1B2A4E" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 px-2 pt-1 text-[10.5px] text-lilly-grey font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{background:"#10B981"}} />Low (&lt;40)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{background:"#F59E0B"}} />Moderate (40–59)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{background:"#DC2626"}} />High (≥60)</span>
          </div>
        </Card>
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardTitle title="Comorbidity prevalence" subtitle="Treemap — area proportional to patients affected" />
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={treemap}
              dataKey="size"
              stroke="#fff"
              fill={NAVY}
              content={(((props: any) => {
                const { x, y, width, height, name, size } = props;
                const colors = [RED, NAVY, "#0073AB", "#7C3AED", "#0EA5E9", "#10B981", "#F59E0B", "#EA580C", "#EC4899", "#475569"];
                const idx = (props.index ?? 0) % colors.length;
                return (
                  <g>
                    <rect x={x} y={y} width={width} height={height} stroke="#fff" fill={colors[idx]} />
                    {width > 60 && height > 30 && (
                      <>
                        <text x={x + 8} y={y + 18} fill="#fff" fontSize={12} fontWeight={700}>{name}</text>
                        <text x={x + 8} y={y + 33} fill="#fff" fontSize={11} opacity={0.85}>{size} patients</text>
                      </>
                    )}
                  </g>
                );
              }) as any)}
            />
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="Critical risk queue" subtitle="Auto-routed for safety review" action={<Badge color="red">action</Badge>} />
          <ul className="space-y-2.5">
            {critical.map(p => (
              <li key={p.id} className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-lilly-redLight/60 border border-lilly-red/20">
                <div>
                  <div className="text-[13px] font-bold text-lilly-navy">{p.name}</div>
                  <div className="text-[11px] text-lilly-grey">{p.id} · {p.age}{p.sex} · BMI {p.bmi.toFixed(0)} · {p.comorbidities.length} comorb.</div>
                </div>
                <Badge color="red">{p.rss}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
