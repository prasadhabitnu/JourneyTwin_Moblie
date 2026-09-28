import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import {
  COACHES, coachKpis, priorityQueue, participantsOf, retentionTrend,
} from "../lib/coachIntelligence";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  Users, TrendingUp, AlertTriangle, CalendarCheck, MessageSquare,
  ArrowUpRight, ArrowDownRight, Moon, Footprints, Pill, ChevronRight, Download,
} from "lucide-react";

// HabitNu green theme — red reserved for genuine alerts
const GREEN = "#16A34A";
const NAVY = "#1B2A4E";
const ALERT = "#DC2626";

const SIGNAL_TAG: Record<string, { label: string; color: "rose" | "amber" | "slate" }> = {
  Clinical:   { label: "Clinical",   color: "rose" },
  Dropout:    { label: "Engagement", color: "rose" },
  Emotional:  { label: "Recovery",   color: "amber" },
  Behavioral: { label: "Adherence",  color: "amber" },
};

export default function CoachDashboard() {
  const [coachId, setCoachId] = useState<string>(COACHES[0].id);
  const coach = COACHES.find(c => c.id === coachId)!;
  const first = coach.name.split(" ")[0];

  const kpis = useMemo(() => coachKpis(coachId), [coachId]);
  const queue = useMemo(() => priorityQueue(coachId, 6), [coachId]);
  const trend = useMemo(() => retentionTrend(coachId), [coachId]);
  const roster = useMemo(() => participantsOf(coachId), [coachId]);

  const total = roster.length;
  const active = roster.filter(p => ["Active", "Persistent", "Completed"].includes(p.status));
  const onTrackN = roster.filter(p => p.pctBwLoss >= 5).length;
  const onTrackPct = total > 0 ? Math.round((onTrackN / total) * 100) : 0;
  const weeklyCheckins = Math.round(active.length * 0.19);

  // Member progress overview — on track vs off track, 9 weeks
  const progress = trend.map((t, i) => ({
    week: t.week,
    "On Track": Math.round(t["Your cohort"] * 100),
    "Off Track": Math.round((1 - t["Your cohort"]) * 100 * 0.7 + 6),
  }));

  // Top opportunities across the caseload
  const sleepN = roster.filter(p => p.status === "Active" && p.portalLogins90d < 18).length;
  const moveN = roster.filter(p => p.status === "Active" && p.pctBwLoss < 6 && p.weeksOnProgram >= 6).length;
  const adhN = roster.filter(p => p.status === "Active" && p.pdc < 0.7).length;
  const opportunities = [
    { icon: Moon, tint: "bg-indigo-50 text-indigo-600", label: "Improve sleep quality", n: Math.max(sleepN, 18) },
    { icon: Footprints, tint: "bg-emerald-50 text-emerald-600", label: "Increase weekly movement", n: Math.max(moveN, 14) },
    { icon: Pill, tint: "bg-rose-50 text-rose-600", label: "Boost adherence", n: Math.max(adhN, 11) },
  ];

  const kpiCards = [
    { label: "Total Members", value: total, delta: 6, up: true, icon: Users, tint: "bg-emerald-50 text-emerald-600" },
    { label: "Members On Track", value: `${onTrackPct}%`, delta: 5, up: true, icon: TrendingUp, tint: "bg-emerald-50 text-emerald-600" },
    { label: "Members Need Attention", value: kpis.highRisk, delta: 3, up: false, icon: AlertTriangle, tint: "bg-rose-50 text-rose-600", alert: true },
    { label: "Weekly Check-ins", value: weeklyCheckins, delta: 4, up: true, icon: CalendarCheck, tint: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Coach Dashboard"
        title={`Good morning, Coach ${first}`}
        subtitle="At-a-glance clarity — who needs you, why, and what to do next."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={coachId}
              onChange={e => setCoachId(e.target.value)}
              className="text-sm font-semibold border border-lilly-line rounded-lg px-3 py-2 bg-white text-lilly-navy focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {COACHES.map(c => <option key={c.id} value={c.id}>{c.name} — {c.specialty}</option>)}
            </select>
            <button className="text-sm font-semibold text-lilly-navy bg-white border border-lilly-line px-3.5 py-2 rounded-lg hover:bg-lilly-mist flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        }
      />

      {/* KPI row */}
      <div className="px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {kpiCards.map((k, i) => {
          const Icon = k.icon;
          return (
            <Card key={i}>
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.tint}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`flex items-center gap-0.5 text-[11px] font-bold ${k.up ? "text-emerald-600" : "text-rose-600"}`}>
                  {k.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {k.delta} vs last week
                </span>
              </div>
              <div className={`text-[30px] font-bold mt-2 leading-none ${k.alert ? "text-rose-600" : "text-lilly-navy"}`}>{k.value}</div>
              <div className="text-[12px] text-lilly-grey mt-1">{k.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Members needing attention */}
      <div className="px-8 mb-7">
        <Card padding="p-0">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-lilly-line">
            <div>
              <div className="text-sm font-bold text-lilly-navy">Members needing attention</div>
              <div className="text-[12px] text-lilly-grey mt-0.5">Prioritized by need — a simple risk reason and one clear action each</div>
            </div>
            <Badge color="green">{queue.length} flagged</Badge>
          </div>
          <table className="w-full text-[13px]">
            <tbody>
              {queue.map(q => {
                const sig = q.signals[0] ?? "Behavioral";
                const tag = SIGNAL_TAG[sig] ?? SIGNAL_TAG.Behavioral;
                return (
                  <tr key={q.patient.id} className="border-b border-lilly-line/60 hover:bg-lilly-mist/40">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                          {q.patient.name.split(" ").map(x => x[0]).join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-lilly-navy">{q.patient.name}</div>
                          <div className="text-[11px] text-lilly-grey">{q.patient.id} · week {q.patient.weeksOnProgram}</div>
                        </div>
                      </div>
                    </td>
                    <td><Badge color={tag.color}>{tag.label}</Badge></td>
                    <td className="text-[12px] text-lilly-grey max-w-xs">{q.topReason}</td>
                    <td className="text-right pr-5">
                      <button className="text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Message
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Progress overview + top opportunities */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardTitle title="Member progress overview" subtitle="On track vs. off track across your caseload — last 9 weeks" />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={progress} margin={{ top: 6, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="On Track" stroke={GREEN} strokeWidth={3} dot={{ r: 3, fill: GREEN }} />
              <Line type="monotone" dataKey="Off Track" stroke={ALERT} strokeWidth={2.5} dot={{ r: 3, fill: ALERT }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="Top opportunities" subtitle="Where one move helps the most members" />
          <div className="space-y-2.5">
            {opportunities.map(op => {
              const Icon = op.icon;
              return (
                <button key={op.label} className="w-full flex items-center gap-3 p-3 rounded-lg border border-lilly-line hover:border-emerald-300 hover:bg-lilly-mist/40 transition text-left">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${op.tint}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold text-lilly-navy">{op.label}</div>
                    <div className="text-[11px] text-lilly-grey">{op.n} members</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-lilly-grey shrink-0" />
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-lilly-line/60 text-[11.5px] text-lilly-grey leading-snug">
            Progress overview without dashboard overload — the full intelligence layer lives in <b className="text-lilly-navy">Coach Intelligence</b>.
          </div>
        </Card>
      </div>
    </div>
  );
}
