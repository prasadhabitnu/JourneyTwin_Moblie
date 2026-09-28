import { useMemo } from "react";
import { PageHeader, Card, CardTitle, StatCard, Badge, Section } from "../components/Page";
import {
  PATIENTS, summary, tierCounts, statusCounts, regionAggregates, BUCKET_LABELS,
} from "../lib/patientData";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line, Legend,
} from "recharts";
import { Download, ArrowUpRight, Sparkles, AlertTriangle, TrendingUp } from "lucide-react";

const RED = "#D52B1E";
const NAVY = "#1B2A4E";
const ACCENT = "#0073AB";
const GREEN = "#10B981";
const AMBER = "#F59E0B";

export default function ExecutiveDashboard() {
  const s = useMemo(summary, []);
  const tiers = useMemo(tierCounts, []);
  const statuses = useMemo(statusCounts, []);
  const regions = useMemo(regionAggregates, []);

  // 12-month persistence trend (simulated)
  const trend = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2025, 5 + i, 1).toLocaleString("en", { month: "short" });
    const base = 38 + i * 2.4 + Math.sin(i / 2) * 1.2;
    return {
      month,
      persistence: Math.min(72, Math.round(base * 10) / 10),
      pctLoss: Number((4 + i * 0.9 + Math.sin(i / 3) * 0.4).toFixed(1)),
    };
  });

  const funnel = [
    { stage: "Identified", n: statuses.Identified + statuses.Outreach + statuses.Active + statuses.Persistent + statuses.Discontinued + statuses.Completed },
    { stage: "Outreach", n: statuses.Outreach + statuses.Active + statuses.Persistent + statuses.Discontinued + statuses.Completed },
    { stage: "Active", n: statuses.Active + statuses.Persistent + statuses.Discontinued + statuses.Completed },
    { stage: "Persistent", n: statuses.Persistent + statuses.Completed },
    { stage: "Completed", n: statuses.Completed },
  ];

  const tierData = (Object.keys(tiers) as (keyof typeof tiers)[]).map(k => ({
    name: k,
    value: tiers[k],
    color: k === "T1" ? RED : k === "T2" ? "#EE6055" : k === "T3" ? AMBER : k === "T4" ? "#94A3B8" : "#475569",
  }));

  const recentRecs = PATIENTS
    .filter(p => p.gesTier === "T1" || p.gesTier === "T2")
    .slice(0, 5);

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Executive Overview"
        title="GLP-1 Population Intelligence"
        subtitle="A single pane for the full population — eligibility, persistence, outcomes, and ROI. Built for health-system, payer, and pharma stakeholders."
        actions={
          <>
            <button className="text-sm font-semibold text-lilly-navy bg-white border border-lilly-line px-3.5 py-2 rounded-lg hover:bg-lilly-mist flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Export brief
            </button>
            <button className="text-sm font-semibold text-white bg-lilly-red px-3.5 py-2 rounded-lg hover:bg-lilly-redDark flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Run AI summary
            </button>
          </>
        }
      />

      <div className="px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-7">
        <StatCard accent="red" label="Eligible (T1+T2)" value={s.eligible.toLocaleString()} delta="+8.4%" sub="of 1,000 modeled lives" />
        <StatCard accent="navy" label="Active members" value={s.active.toLocaleString()} delta="+12%" sub="across all programs" />
        <StatCard accent="green" label="12-mo persistence" value={`${(s.persistenceRate * 100).toFixed(1)}%`} delta="+18 pp" sub="vs. 38% industry baseline" />
        <StatCard accent="amber" label="Avg % BW loss" value={`${s.avgPctLoss.toFixed(1)}%`} delta="+2.3 pp" sub="across active cohorts" />
        <StatCard accent="navy" label="Cost / % BW loss" value={`$${Math.round(s.costPerPctLoss).toLocaleString()}`} delta="-41%" sub="vs. baseline $612" deltaTone="up" />
        <StatCard accent="red" label="Platform NPS" value={s.nps} delta="+9" sub="payer/provider users" />
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <Card className="lg:col-span-2">
          <CardTitle title="Program Persistence Performance Over Time" subtitle="Rolling 12-month persistence rate and average body-weight loss" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gpers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RED} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={RED} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NAVY} stopOpacity={0.30} />
                  <stop offset="100%" stopColor={NAVY} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="L" orientation="left" tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="R" orientation="right" tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area yAxisId="L" type="monotone" dataKey="persistence" name="Persistence (%)" stroke={RED} fill="url(#gpers)" strokeWidth={2.5} />
              <Area yAxisId="R" type="monotone" dataKey="pctLoss" name="Avg % BW loss" stroke={NAVY} fill="url(#gloss)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="Eligibility tier distribution" subtitle="Population matrix — clinical axis" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={tierData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {tierData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-5 gap-1 text-center text-[11px] mt-1">
            {tierData.map(d => (
              <div key={d.name}>
                <div className="font-bold text-lilly-navy">{d.value}</div>
                <div className="text-lilly-grey">{d.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <Card>
          <CardTitle title="Program funnel" subtitle="Identified → Outreach → Active → Persistent → Completed" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={funnel} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: "#1B2A4E", fontWeight: 600 }} axisLine={false} tickLine={false} width={88} />
              <Tooltip />
              <Bar dataKey="n" fill={NAVY} radius={[0, 4, 4, 0]}>
                {funnel.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#94A3B8" : i === 1 ? ACCENT : i === 2 ? NAVY : i === 3 ? RED : "#7C1F18"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="Regional eligibility density" subtitle="% of regional population in T1+T2" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regions} margin={{ top: 5, right: 15, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
              <XAxis dataKey="region" tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="eligible" name="Eligible (T1+T2)" fill={RED} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle
            title="AI-surfaced insights"
            subtitle="Top operational signals from the last 24 hours"
            action={<Badge color="red">live</Badge>}
          />
          <ul className="space-y-3">
            {[
              { icon: TrendingUp, color: "text-emerald-600 bg-emerald-50",
                title: "Persistence cohort exceeded forecast",
                body: "T1/R1 cohort (n=78) is tracking 4.2pp above 26-week forecast. Consider expanding capacity in MW region." },
              { icon: AlertTriangle, color: "text-amber-700 bg-amber-50",
                title: "Week-6 plateau drop-off detected",
                body: "62 active members hit the canonical plateau this week — push retention reference module to coaches." },
              { icon: Sparkles, color: "text-lilly-redDark bg-lilly-redLight",
                title: "PA throughput opportunity",
                body: "315 T1 candidates with payer-friendly posture identified — 24-hour PA packet auto-generation available." },
            ].map((it, i) => {
              const Icon = it.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${it.color}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-[13px] font-bold text-lilly-navy leading-tight">{it.title}</div>
                    <div className="text-[12px] text-lilly-grey leading-snug mt-0.5">{it.body}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardTitle title="Top eligibility candidates ready for outreach" subtitle="GES ≥ 60 with payer-friendly posture and high readiness" action={<button className="text-[12px] text-lilly-red font-semibold flex items-center gap-1">View all <ArrowUpRight className="w-3.5 h-3.5" /></button>} />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-lilly-grey font-semibold border-b border-lilly-line">
                <th className="text-left py-2.5">Patient</th>
                <th className="text-left">Cohort</th>
                <th className="text-right">GES</th>
                <th className="text-right">Forecast loss</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentRecs.map(p => (
                <tr key={p.id} className="border-b border-lilly-line/60 hover:bg-lilly-mist/60">
                  <td className="py-2.5">
                    <div className="font-semibold text-lilly-navy">{p.name}</div>
                    <div className="text-[11px] text-lilly-grey">{p.id} · {p.age}{p.sex} · {p.state}</div>
                  </td>
                  <td className="text-[12px] text-lilly-grey">{BUCKET_LABELS[p.bucket]}</td>
                  <td className="text-right font-bold text-lilly-navy">{p.ges}</td>
                  <td className="text-right font-semibold text-emerald-700">{p.ofs.toFixed(1)}%</td>
                  <td className="text-right">
                    <button className="text-[11px] font-semibold text-white bg-lilly-red px-2.5 py-1 rounded-md hover:bg-lilly-redDark">
                      Contact
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardTitle title="Outcome economics" subtitle="The number on the cover slide: cost per outcome achieved" />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-lilly-mist rounded-lg p-4">
              <div className="text-[11px] uppercase tracking-wider font-bold text-lilly-grey">Baseline cost / % BW loss</div>
              <div className="mt-2 text-3xl font-bold text-slate-700 line-through decoration-rose-400 decoration-2">$612</div>
              <div className="text-[12px] text-lilly-grey mt-1">Industry average</div>
            </div>
            <div className="bg-lilly-redLight rounded-lg p-4">
              <div className="text-[11px] uppercase tracking-wider font-bold text-lilly-redDark">Platform target</div>
              <div className="mt-2 text-3xl font-bold text-lilly-redDark">$363</div>
              <div className="text-[12px] text-lilly-redDark/80 mt-1 font-semibold">−41% vs. baseline</div>
            </div>
          </div>
          <div className="mt-4 text-[12.5px] text-lilly-grey leading-relaxed">
            A GLP-1 program is rarely cash-positive in year 1 on drug spend alone. The durable
            ROI lever is <b className="text-lilly-navy">cost per outcome achieved</b> — moved by
            better targeting, higher persistence, and the coach retention reference engine.
          </div>
        </Card>
      </div>
    </div>
  );
}
