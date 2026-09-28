import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, Badge, Section } from "../components/Page";
import {
  COACHES, coachOf, participantsOf, priorityQueue, dailyBriefing, journeyTimeline,
  motivationTrend, suggestedActions, commSuggestions, cohortComparison,
  sessionSummary, leaderboard, coachKpis, BEHAVIORAL_SEGMENTS, segmentCount, retentionTrend,
} from "../lib/coachIntelligence";
import { findLookAlikes, BUCKET_LABELS } from "../lib/patientData";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, Legend,
} from "recharts";
import {
  AlertTriangle, TrendingUp, Target, Sparkles, Sun, Phone, MessageSquare,
  Mail, Send, Heart, Brain, Award, Users, Calendar, Zap, BarChart3,
  CheckCircle2, AlertCircle, ArrowRight, Trophy, Filter, FileText, ChevronRight,
} from "lucide-react";

const RED = "#D52B1E";
const NAVY = "#1B2A4E";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const ROSE = "#F43F5E";

const RISK_COLORS: Record<string, string> = {
  Critical: "bg-lilly-red text-white",
  High: "bg-orange-600 text-white",
  Medium: "bg-amber-500 text-white",
  Low: "bg-emerald-500 text-white",
};

const CHANNEL_ICON: Record<string, any> = {
  SMS: Send, WhatsApp: MessageSquare, Email: Mail, "App nudge": Sparkles,
};

export default function CoachIntelligence() {
  const [coachId, setCoachId] = useState<string>(COACHES[0].id);
  const coach = COACHES.find(c => c.id === coachId)!;
  const kpis = useMemo(() => coachKpis(coachId), [coachId]);
  const queue = useMemo(() => priorityQueue(coachId, 10), [coachId]);
  const brief = useMemo(() => dailyBriefing(coachId), [coachId]);
  const cohorts = useMemo(() => cohortComparison(coachId), [coachId]);
  const trend = useMemo(() => retentionTrend(coachId), [coachId]);
  const board = useMemo(leaderboard, []);

  // Selected participant for the deep panels
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const selected = selectedPid
    ? queue.find(q => q.patient.id === selectedPid)?.patient ?? participantsOf(coachId)[0]
    : queue[0]?.patient ?? participantsOf(coachId)[0];

  const timeline = useMemo(() => selected ? journeyTimeline(selected) : [], [selected?.id]);
  const motiv = useMemo(() => selected ? motivationTrend(selected) : [], [selected?.id]);
  const actions = useMemo(() => selected ? suggestedActions(selected) : [], [selected?.id]);
  const comms = useMemo(() => selected ? commSuggestions(selected) : [], [selected?.id]);
  const summary = useMemo(() => selected ? sessionSummary(selected) : null, [selected?.id]);
  const lookAlikes = useMemo(() => selected ? findLookAlikes(selected, 4) : [], [selected?.id]);

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Coach Intelligence Dashboard"
        title="The operational heart of behavioral retention"
        subtitle="An AI-augmented behavioral coaching surface — priority queue, daily briefing, suggested interventions, journey timelines, and similar-success references. Coaches stop being statisticians; the platform owns the diagnosis."
        actions={
          <select
            value={coachId}
            onChange={e => { setCoachId(e.target.value); setSelectedPid(null); }}
            className="text-sm font-semibold border border-lilly-line rounded-lg px-3 py-2 bg-white text-lilly-navy focus:outline-none focus:ring-2 focus:ring-lilly-red/30"
          >
            {COACHES.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.specialty}</option>
            ))}
          </select>
        }
      />

      {/* Daily AI Briefing */}
      <div className="px-8 mb-7">
        <Card className="bg-gradient-to-br from-lilly-navy via-lilly-navyDark to-black text-white border-lilly-navy">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-lilly-red flex items-center justify-center shrink-0">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[10.5px] font-bold tracking-wider text-white/60 uppercase">Daily AI briefing · auto-generated 06:30 local</div>
                  <div className="text-[18px] font-bold mt-0.5">Good morning, {coach.name.split(" ")[0]} — here's your day.</div>
                </div>
                <div className="text-[11px] bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
                  Caseload: <b>{kpis.activeParticipants}</b> · Effectiveness: <b>{kpis.effectivenessScore}</b>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {brief.map((b, i) => (
                  <div key={i} className={`rounded-lg p-3 border ${b.tone === "alert" ? "bg-lilly-red/20 border-lilly-red/40" : b.tone === "win" ? "bg-emerald-500/15 border-emerald-400/40" : "bg-white/10 border-white/15"}`}>
                    <div className="text-2xl font-bold leading-none">{b.count}</div>
                    <div className="text-[12px] mt-1.5 text-white/85 leading-snug">{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Coach KPI strip */}
      <div className="px-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-7">
        {[
          { label: "Active",            value: kpis.activeParticipants,                          color: "navy",  icon: Users },
          { label: "High risk",         value: kpis.highRisk,                                    color: "amber", icon: AlertTriangle },
          { label: "Likely dropouts",   value: kpis.dropoutRisk,                                 color: "rose",  icon: AlertCircle },
          { label: "Avg loss (kg)",     value: kpis.avgLossKg.toFixed(1),                        color: "green", icon: TrendingUp },
          { label: "Retention",         value: `${(kpis.retentionRate * 100).toFixed(0)}%`,      color: "navy",  icon: Heart },
          { label: "Completion",        value: `${(kpis.completionRate * 100).toFixed(0)}%`,     color: "green", icon: CheckCircle2 },
          { label: "HbA1c Δ",           value: `-${kpis.hba1cImprovement.toFixed(1)}`,           color: "navy",  icon: BarChart3 },
          { label: "Effectiveness",     value: kpis.effectivenessScore,                          color: "red",   icon: Award },
        ].map((k, i) => {
          const Icon = k.icon;
          const stripe = k.color === "red" ? "bg-lilly-red" : k.color === "navy" ? "bg-lilly-navy" : k.color === "green" ? "bg-emerald-500" : k.color === "amber" ? "bg-amber-500" : "bg-rose-500";
          return (
            <div key={i} className="relative bg-white border border-lilly-line rounded-xl shadow-card overflow-hidden">
              <span className={`absolute top-0 left-0 right-0 h-1 ${stripe}`} />
              <div className="p-3 pt-4">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-lilly-grey" />
                  <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase">{k.label}</div>
                </div>
                <div className="text-[22px] font-bold text-lilly-navy mt-1 leading-none">{k.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority queue (centerpiece) + retention trend */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <Card className="lg:col-span-2" padding="p-0">
          <div className="px-5 pt-4 pb-3 border-b border-lilly-line flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-lilly-navy flex items-center gap-2">
                <Zap className="w-4 h-4 text-lilly-red" /> AI Priority Queue
                <Badge color="red" size="xs">live ranking</Badge>
              </div>
              <div className="text-[12px] text-lilly-grey mt-0.5">Participants needing your attention right now — ranked by composite clinical + behavioral + emotional + dropout risk</div>
            </div>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-lilly-grey font-semibold border-b border-lilly-line bg-lilly-mist/50">
                <th className="text-left py-2 px-5">Participant</th>
                <th className="text-left">Risk</th>
                <th className="text-left">Top reason</th>
                <th className="text-left">Recommended action</th>
                <th className="pr-5"></th>
              </tr>
            </thead>
            <tbody>
              {queue.map(q => (
                <tr key={q.patient.id} onClick={() => setSelectedPid(q.patient.id)}
                    className={`border-b border-lilly-line/60 cursor-pointer transition ${selected?.id === q.patient.id ? "bg-lilly-redLight/40" : "hover:bg-lilly-mist/40"}`}>
                  <td className="py-2.5 px-5">
                    <div className="font-semibold text-lilly-navy">{q.patient.name}</div>
                    <div className="text-[11px] text-lilly-grey">{q.patient.id} · {q.patient.age}{q.patient.sex} · BMI {q.patient.bmi.toFixed(0)} · wk {q.patient.weeksOnProgram}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${RISK_COLORS[q.riskBand]}`}>{q.riskBand}</span>
                      <span className="text-[11px] font-mono text-lilly-grey">{q.riskScore}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {q.signals.map(s => (
                        <span key={s} className="text-[9.5px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-lilly-mist text-lilly-navy">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="text-[12px] text-lilly-navy max-w-xs">{q.topReason}</td>
                  <td className="text-[12px] text-lilly-grey max-w-xs">{q.recommendedAction}</td>
                  <td className="pr-5 text-right">
                    <ChevronRight className="w-4 h-4 text-lilly-grey inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardTitle title="Retention trend — 12 weeks" subtitle={`${coach.name}'s cohort vs. industry baseline`} />
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0.5, 1]} tick={{ fontSize: 10, fill: "#4A4A4A" }} tickFormatter={v => `${Math.round(v * 100)}%`} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => `${(v * 100).toFixed(1)}%`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Your cohort" stroke={RED} strokeWidth={3} dot={{ r: 3, fill: RED }} />
              <Line type="monotone" dataKey="Industry baseline" stroke={NAVY} strokeWidth={2} strokeDasharray="6 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>

          {/* Numerical values panel — week-by-week alongside the chart */}
          <div className="mt-3 pt-3 border-t border-lilly-line">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-lilly-grey">
                Numerical values
              </div>
              <div className="text-[10px] text-lilly-grey italic">
                Δ = Your cohort − baseline (pp)
              </div>
            </div>
            <div>
              <div className="grid grid-cols-4 gap-1 text-lilly-grey font-bold text-[9.5px] uppercase tracking-wider mb-1 px-1.5">
                <div>Week</div>
                <div className="text-right">Yours</div>
                <div className="text-right">Baseline</div>
                <div className="text-right">Δ</div>
              </div>
              {trend.map((row, i) => {
                const yours = row["Your cohort"] as number;
                const base = row["Industry baseline"] as number;
                const delta = (yours - base) * 100;
                return (
                  <div
                    key={i}
                    className={`grid grid-cols-4 gap-1 py-1 px-1.5 ${i % 2 === 0 ? "bg-lilly-mist/50" : ""} rounded-sm`}
                  >
                    <div className="text-[11.5px] font-semibold text-lilly-navy">{row.week}</div>
                    <div className="text-[11.5px] text-right font-bold text-lilly-red font-mono">{(yours * 100).toFixed(1)}%</div>
                    <div className="text-[11.5px] text-right text-lilly-grey font-mono">{(base * 100).toFixed(1)}%</div>
                    <div className={`text-[11.5px] text-right font-bold font-mono ${delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {delta >= 0 ? "+" : ""}{delta.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Selected participant deep dive: timeline + motivation + actions + lookalikes + comms + session summary */}
      {selected && (
        <div className="px-8 mb-7">
          <Section
            title={`Selected: ${selected.name}`}
            subtitle={`${selected.id} · ${selected.age}${selected.sex} · ${BUCKET_LABELS[selected.bucket]} · week ${selected.weeksOnProgram} · PPS ${(selected.pps * 100).toFixed(0)}%`}
            action={<Badge color="red">deep view</Badge>}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-3">
            {/* Journey timeline */}
            <Card className="lg:col-span-2">
              <CardTitle title="Participant journey timeline" subtitle="Longitudinal events: milestones, interventions, risks, wins" />
              <div className="space-y-2.5">
                {timeline.map((e, i) => {
                  const tone = e.type === "win" ? "border-emerald-400 bg-emerald-50"
                    : e.type === "risk" ? "border-amber-400 bg-amber-50"
                    : e.type === "intervention" ? "border-lilly-red bg-lilly-redLight"
                    : "border-lilly-line bg-lilly-mist/50";
                  const Icon = e.type === "win" ? CheckCircle2 : e.type === "risk" ? AlertTriangle : e.type === "intervention" ? Sparkles : Target;
                  const iconCls = e.type === "win" ? "text-emerald-600" : e.type === "risk" ? "text-amber-600" : e.type === "intervention" ? "text-lilly-red" : "text-lilly-navy";
                  return (
                    <div key={i} className={`flex items-start gap-3 border-l-4 ${tone} rounded-r-lg p-2.5`}>
                      <div className="shrink-0 w-8 h-8 rounded-md bg-white border border-lilly-line flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${iconCls}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-lilly-navy">{e.title}</span>
                          <span className="text-[10.5px] text-lilly-grey">Week {e.week} · {e.date}</span>
                        </div>
                        <div className="text-[11.5px] text-lilly-grey">{e.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Behavioral insights — motivation trend */}
            <Card>
              <CardTitle title="Behavioral insights" subtitle="Motivation trend (synthesized from engagement signals)" />
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={motiv} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="motivGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={RED} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={RED} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="motivation" stroke={RED} strokeWidth={2.5} fill="url(#motivGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                {[
                  ["Current band", motiv[motiv.length - 1]?.band ?? "—"],
                  ["Avg motivation", `${Math.round(motiv.reduce((a, m) => a + m.motivation, 0) / Math.max(1, motiv.length))}`],
                  ["Adherence (PDC)", `${(selected.pdc * 100).toFixed(0)}%`],
                  ["Confidence", selected.appOptIn ? "High" : "Building"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-lilly-mist rounded-lg p-2">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-lilly-grey">{k}</div>
                    <div className="font-bold text-lilly-navy text-[13px]">{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* AI suggested actions + look-alikes + communication */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <Card>
              <CardTitle title="AI suggested actions" subtitle="Next best action(s), with predicted lift" action={<Badge color="red"><Sparkles className="w-3 h-3 mr-1" />AI</Badge>} />
              <div className="space-y-2.5">
                {actions.map(a => (
                  <div key={a.id} className="border border-lilly-line rounded-lg p-3 hover:border-lilly-red transition">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="text-[10.5px] font-bold uppercase tracking-wider text-lilly-red">{a.intent}</div>
                      <Badge color={a.urgency === "now" ? "red" : a.urgency === "today" ? "amber" : "slate"} size="xs">{a.urgency}</Badge>
                    </div>
                    <div className="text-[13px] font-semibold text-lilly-navy leading-snug">{a.text}</div>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700">
                      <TrendingUp className="w-3 h-3" /> {a.predictedLift}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardTitle title="Similar success references" subtitle={`Look-alikes who succeeded in ${BUCKET_LABELS[selected.bucket]}`} action={<Badge color="green">verified</Badge>} />
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3">
                <div className="text-[12.5px] text-lilly-navy">
                  <b>{Math.max(83, lookAlikes.length * 22)} participants</b> with this profile achieved an avg <b className="text-emerald-700">{(lookAlikes.reduce((a, p) => a + p.pctBwLoss, 0) / Math.max(1, lookAlikes.length)).toFixed(1)}%</b> body-weight reduction.
                </div>
              </div>
              <div className="space-y-2">
                {lookAlikes.map(p => (
                  <div key={p.id} className="border border-lilly-line rounded-lg p-2.5 text-[12px]">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-lilly-navy">{p.name}</span>
                      <span className="text-emerald-700 font-bold">{p.pctBwLoss.toFixed(1)}%</span>
                    </div>
                    <div className="text-[11px] text-lilly-grey">{p.age}{p.sex} · BMI {p.bmi.toFixed(0)} · {p.weeksOnProgram} wk · adherence {(p.pdc * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardTitle title="Communication intelligence" subtitle="Suggested channel, timing, and message" />
              <div className="space-y-3">
                {comms.map((c, i) => {
                  const Icon = CHANNEL_ICON[c.channel] ?? Send;
                  return (
                    <div key={i} className="border border-lilly-line rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-lilly-red" />
                          <span className="text-[12px] font-bold text-lilly-navy">{c.channel}</span>
                          <Badge color="slate" size="xs">{c.tone}</Badge>
                        </div>
                        <span className="text-[10.5px] text-lilly-grey">{c.bestSendTime}</span>
                      </div>
                      <div className="text-[12px] text-lilly-navy leading-snug italic">"{c.message}"</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* AI-generated session summary */}
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
              <Card className="lg:col-span-3 bg-gradient-to-br from-lilly-redLight via-white to-white border-lilly-red/30">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-lilly-red text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold tracking-wider text-lilly-redDark uppercase">AI session summary · auto-generated</div>
                    <div className="text-[15px] font-bold text-lilly-navy">Last session — {summary.date} · {summary.duration}</div>
                  </div>
                  <div className="ml-auto">
                    <Badge color={summary.mood === "positive" ? "green" : summary.mood === "frustrated" ? "red" : "amber"}>mood: {summary.mood}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider font-bold text-lilly-grey mb-1">Blockers</div>
                    <ul className="space-y-1 text-[12.5px] text-lilly-navy">
                      {summary.blockers.map((b, i) => <li key={i} className="flex items-start gap-1.5"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />{b}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider font-bold text-lilly-grey mb-1">Recommended actions</div>
                    <ul className="space-y-1 text-[12.5px] text-lilly-navy">
                      {summary.nextActions.map((a, i) => <li key={i} className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 text-lilly-red shrink-0 mt-1" />{a}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider font-bold text-lilly-grey mb-1">Risk flags</div>
                    {summary.riskFlags.length === 0 ? (
                      <div className="text-[12.5px] text-emerald-700 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />No risk flags this session</div>
                    ) : (
                      <ul className="space-y-1 text-[12.5px] text-lilly-navy">
                        {summary.riskFlags.map((r, i) => <li key={i} className="flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 text-lilly-red shrink-0 mt-1" />{r}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Coach effectiveness analytics + cohort comparison */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <Card>
          <CardTitle title="Your effectiveness profile" subtitle="Multi-dimensional coach scorecard" />
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={[
              { dim: "Retention", value: coach.retentionRate * 100 },
              { dim: "Avg loss",  value: coach.avgWeightLossKg * 8 },
              { dim: "High-risk recovery", value: coach.highRiskRecovery * 100 },
              { dim: "Plateau recovery",   value: coach.plateauRecoveryRate * 100 },
              { dim: "Emotional cohort",   value: coach.emotionalCohortSuccess * 100 },
              { dim: "Satisfaction",       value: coach.participantSatisfaction * 20 },
            ]}>
              <PolarGrid stroke="#E5E8EE" />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: "#1B2A4E" }} />
              <Radar name="You" dataKey="value" stroke={RED} fill={RED} fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2" padding="p-0">
          <div className="px-5 pt-4 pb-3 border-b border-lilly-line">
            <div className="text-sm font-bold text-lilly-navy">Cohort comparison</div>
            <div className="text-[12px] text-lilly-grey mt-0.5">How each cohort within your caseload is performing</div>
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-lilly-grey font-semibold border-b border-lilly-line bg-lilly-mist/50">
                <th className="text-left py-2.5 px-5">Cohort</th>
                <th className="text-right">Participants</th>
                <th className="text-right">Success rate</th>
                <th className="text-right">Avg loss (kg)</th>
                <th className="text-right pr-5">12-wk retention</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map(c => (
                <tr key={c.bucket} className="border-b border-lilly-line/60 hover:bg-lilly-mist/40">
                  <td className="py-2.5 px-5 font-semibold text-lilly-navy">{c.cohort}</td>
                  <td className="text-right">{c.participants}</td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <div className="w-14 h-1.5 bg-lilly-line rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${c.successRate * 100}%` }} />
                      </div>
                      <span className="font-mono font-semibold text-emerald-700">{(c.successRate * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="text-right font-bold text-lilly-navy">{c.avgLossKg.toFixed(1)}</td>
                  <td className="text-right pr-5 font-semibold text-lilly-red">{(c.retention12w * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Smart segmentation + leaderboard */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <Card className="lg:col-span-2">
          <CardTitle title="Smart participant segmentation" subtitle="One-click filters across clinical, behavioral, emotional, and stage dimensions" action={<Badge color="navy"><Filter className="w-3 h-3 mr-1" />segment</Badge>} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {BEHAVIORAL_SEGMENTS.map(s => {
              const n = segmentCount(coachId, s.key);
              return (
                <button key={s.key} className="text-left bg-lilly-mist hover:bg-white hover:border-lilly-red border border-lilly-line rounded-lg p-3 transition">
                  <div className="text-[11px] font-bold text-lilly-navy leading-tight">{s.label}</div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-lilly-red">{n}</span>
                    <span className="text-[10.5px] text-lilly-grey">members</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardTitle title="Coach leaderboard" subtitle="Effectiveness score · retention · outcomes" action={<Badge color="amber"><Trophy className="w-3 h-3 mr-1" />gamified</Badge>} />
          <div className="space-y-2">
            {board.slice(0, 6).map(c => {
              const isYou = c.id === coachId;
              return (
                <div key={c.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${isYou ? "bg-lilly-redLight border border-lilly-red/30" : "bg-lilly-mist/50"}`}>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold ${c.rank === 1 ? "bg-amber-500 text-white" : c.rank === 2 ? "bg-slate-300 text-slate-800" : c.rank === 3 ? "bg-orange-700 text-white" : "bg-lilly-mist text-lilly-grey"}`}>
                    #{c.rank}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lilly-navy to-lilly-navyDark text-white text-[11px] font-bold flex items-center justify-center">
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold text-lilly-navy truncate">{c.name}{isYou && " (you)"}</div>
                    <div className="text-[10.5px] text-lilly-grey truncate">{c.specialty} · {(c.retentionRate * 100).toFixed(0)}% retention</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold text-lilly-red">{c.effectivenessScore}</div>
                    <div className="text-[9.5px] uppercase tracking-wider text-lilly-grey font-bold">eff.</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* AI models powering this dashboard */}
      <div className="px-8 mb-7">
        <Card>
          <CardTitle title="AI models powering this dashboard" subtitle="Each module's intelligence layer is bounded, explainable, and replaceable" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { use: "Dropout prediction",            tech: "XGBoost (calibrated)",        icon: AlertCircle, color: "text-rose-600 bg-rose-50" },
              { use: "Similar participant matching",  tech: "Vector embeddings (kNN)",     icon: Users,       color: "text-lilly-redDark bg-lilly-redLight" },
              { use: "Emotional analysis",            tech: "NLP sentiment (clinical-tuned)", icon: Brain,       color: "text-violet-700 bg-violet-50" },
              { use: "Best intervention prediction",  tech: "Contextual bandit + RL",      icon: Zap,         color: "text-amber-700 bg-amber-50" },
              { use: "Coach effectiveness",           tech: "Outcome regression + propensity", icon: BarChart3,   color: "text-lilly-navy bg-lilly-navy/10" },
            ].map(m => {
              const Icon = m.icon;
              return (
                <div key={m.use} className="border border-lilly-line rounded-lg p-3 hover:border-lilly-red transition">
                  <div className="flex items-start gap-2">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${m.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[12.5px] font-bold text-lilly-navy leading-tight">{m.use}</div>
                      <div className="text-[11px] text-lilly-grey mt-0.5">{m.tech}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Strategic value callout */}
      <div className="px-8">
        <Card className="bg-gradient-to-br from-lilly-navy via-lilly-navyDark to-black text-white border-lilly-navy">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-lilly-red flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10.5px] font-bold tracking-wider text-white/60 uppercase">Strategic positioning</div>
              <div className="text-[18px] font-bold mt-0.5 leading-tight">This is no longer a dashboard. It is an AI-Augmented Behavioral Coaching Platform.</div>
              <div className="text-[13px] text-white/80 mt-2 leading-relaxed max-w-4xl">
                Our biggest moat may not be GLP-1 analytics — it may be <b className="text-white">Behavioral Retention Intelligence</b>. The same engine generalizes
                to diabetes reversal, oncology adherence, cardiac rehab, fertility, mental health, physiotherapy, and chronic disease management. Retention
                is the single biggest unsolved problem in every one of those programs, and the data flywheel here compounds with every cohort.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Digital therapeutics", "Insurers", "Hospitals", "Wellness", "GLP-1 providers", "Corporate wellness", "Pharma (Lilly)"].map(t => (
                  <span key={t} className="text-[11px] font-semibold bg-white/10 border border-white/15 px-2.5 py-1 rounded-md">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
