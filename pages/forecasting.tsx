import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import { PATIENTS, outcomeCurve, BUCKET_LABELS } from "../lib/patientData";
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, Cell,
} from "recharts";

const RED = "#D52B1E";
const NAVY = "#1B2A4E";

export default function Forecasting() {
  // Pick a representative active patient
  const candidates = PATIENTS.filter(p => p.status === "Active" && p.weeksOnProgram >= 6 && p.gesTier === "T1");
  const [selectedId, setSelectedId] = useState<string>(candidates[0]?.id ?? PATIENTS[0].id);
  const target = PATIENTS.find(p => p.id === selectedId)!;
  const curve = useMemo(() => outcomeCurve(target), [target]);

  // Cohort outcome distribution
  const onProgram = PATIENTS.filter(p => p.weeksOnProgram > 4);
  const buckets = [0, 3, 6, 9, 12, 15, 18, 22].map(threshold => ({
    threshold: `≥${threshold}%`,
    n: onProgram.filter(p => p.pctBwLoss >= threshold).length,
  }));

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Outcome Forecasting"
        title="Predicted % body-weight loss — patient and cohort"
        subtitle="Quantile gradient-boosted model with P10/P90 confidence bands. Blends modeled trajectory with observed-to-date when ≥ 8 weeks of program data exist."
      />

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <Card className="lg:col-span-2">
          <CardTitle
            title={`Forecast — ${target.name}`}
            subtitle={`${target.age}${target.sex} · BMI ${target.bmi} · HbA1c ${target.hba1c} · ${BUCKET_LABELS[target.bucket]}`}
            action={
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="text-[12px] border border-lilly-line rounded-md px-2 py-1 bg-white text-lilly-navy font-semibold focus:outline-none focus:ring-2 focus:ring-lilly-red/30"
              >
                {candidates.slice(0, 12).map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.id}</option>
                ))}
              </select>
            }
          />
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={curve} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RED} stopOpacity={0.20} />
                  <stop offset="100%" stopColor={RED} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#4A4A4A" }} label={{ value: "Weeks on program", position: "insideBottom", offset: -2, fill: "#4A4A4A", fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11, fill: "#4A4A4A" }} label={{ value: "% BW loss", angle: -90, position: "insideLeft", fill: "#4A4A4A", fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="p90" stroke={RED} strokeOpacity={0.35} fill="url(#band)" name="P90" />
              <Area type="monotone" dataKey="p10" stroke={RED} strokeOpacity={0.35} fill="#fff" fillOpacity={1} name="P10" />
              <Line type="monotone" dataKey="predicted" stroke={RED} strokeWidth={3} dot={false} name="Predicted" />
              <Line type="monotone" dataKey="observed" stroke={NAVY} strokeWidth={2.5} dot={{ r: 3, fill: NAVY }} name="Observed (to date)" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="Patient summary" />
          <dl className="text-[12.5px] divide-y divide-lilly-line/70">
            {[
              ["GES (eligibility)", `${target.ges} (${target.gesTier})`],
              ["PPS (persistence)", `${(target.pps * 100).toFixed(0)}% (${target.ppsBand})`],
              ["RSS (risk)", target.rss],
              ["Predicted 52-wk loss", `${target.ofs.toFixed(1)}%`],
              ["Observed to date", `${target.pctBwLoss.toFixed(1)}% (week ${target.weeksOnProgram})`],
              ["Forecast confidence", `${Math.round(60 + target.pps * 30)}%`],
              ["Adverse-event signals", "None active"],
              ["Look-alike outcomes", `n=128 · avg 14.2% loss`],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between py-2">
                <dt className="text-lilly-grey">{k}</dt>
                <dd className="font-semibold text-lilly-navy">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardTitle title="Cohort outcome distribution" subtitle="% of on-program members reaching loss thresholds" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={buckets} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
              <XAxis dataKey="threshold" tick={{ fontSize: 11, fill: "#1B2A4E", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="n" fill={RED} radius={[6, 6, 0, 0]}>
                {buckets.map((_, i) => (
                  <Cell key={i} fill={i < 3 ? "#94A3B8" : i < 5 ? "#F59E0B" : RED} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="Forecast quality (model card)" subtitle="Last quarterly calibration" />
          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            {[
              ["MAE", "1.8 pp", "Mean absolute error vs. observed"],
              ["P10/P90 coverage", "82%", "Within stated confidence band"],
              ["Brier (PPS)", "0.142", "Lower is better"],
              ["AUROC (persistence)", "0.81", "12-mo persistence prediction"],
              ["Calibration drift", "+1.4%", "Within 5% threshold"],
              ["Fairness audit", "Pass", "Across age, sex, race, payer"],
            ].map(([k, v, sub]) => (
              <div key={k} className="bg-lilly-mist rounded-lg p-3">
                <div className="text-[10.5px] uppercase tracking-wider font-bold text-lilly-grey">{k}</div>
                <div className="text-xl font-bold text-lilly-navy mt-0.5 leading-none">{v}</div>
                <div className="text-[10.5px] text-lilly-grey mt-1">{sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge color="green">model card published</Badge>
            <Badge color="navy">v2.4.1</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
