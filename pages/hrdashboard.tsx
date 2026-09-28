import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, StatCard } from "../components/Page";
import {
  EMPLOYEES, overallStats, departmentRollups, populationStressAverages,
  topAtRisk, skillGapHeatmap, sentimentTrendPopulation, orgInterventions,
  STRESS_FACTORS, STRESS_META, StressFactor, Employee, Department,
  stressBandRollups, STRESS_BAND_META, healthSignals, populationHealthContribution,
  stressBandFor, StressBand,
} from "../lib/hrData";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";
import {
  Users, AlertTriangle, TrendingDown, Heart, Search, Sparkles, MessagesSquare,
  Mail, MessageCircle, Video, FileCheck2, HeartPulse, Moon, Activity as ActivityIcon,
  Layers, ArrowRight,
} from "lucide-react";

/**
 * /hrdashboard — GCC employee wellness view.
 * Executive rollup, department heatmap, at-risk queue, stress radar,
 * sentiment trend, skill-gap heatmap, and recommended org interventions.
 */
export default function HRDashboard() {
  const stats     = useMemo(() => overallStats(), []);
  const rollups   = useMemo(() => departmentRollups(), []);
  const popStress = useMemo(() => populationStressAverages(), []);
  const atRisk    = useMemo(() => topAtRisk(12), []);
  const skillMap  = useMemo(() => skillGapHeatmap().slice(0, 8), []);
  const sentTrend = useMemo(() => sentimentTrendPopulation(), []);
  const orgActs   = useMemo(() => orgInterventions(), []);
  const bands     = useMemo(() => stressBandRollups(), []);
  const healthPct = useMemo(() => populationHealthContribution(), []);

  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const selectedEmp = selectedEmpId ? EMPLOYEES.find(e => e.id === selectedEmpId) : null;

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="HR Wellness · GCC"
        title="Employee stress, sentiment, and skill-gap dashboard"
        subtitle={`Fathom parses email + Teams + calendar + learning-platform signals across ${stats.total} employees to surface stress factors, communication patterns, and skill gaps. Population rollups for leadership, individual profiles for HRBPs.`}
      />

      {/* ============ Hero — org-level stats ============ */}
      <div className="px-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Employees analyzed"
            value={stats.total}
            sub={`Across 8 departments · 7 cities`}
            accent="navy"
          />
          <StatCard
            label="Avg wellness score"
            value={stats.avgWellness}
            delta={stats.avgWellness >= 65 ? "healthy" : stats.avgWellness >= 55 ? "at-risk" : "low"}
            deltaTone={stats.avgWellness >= 65 ? "up" : "down"}
            sub="0-100 · higher = healthier"
            accent="green"
          />
          <StatCard
            label="At-risk employees"
            value={stats.atRiskCount}
            delta={`${Math.round((stats.atRiskCount / stats.total) * 100)}%`}
            deltaTone="down"
            sub="Wellness score < 55"
            accent="red"
          />
          <StatCard
            label="Top stressor"
            value={STRESS_META[stats.topStressor].label}
            sub={`${stats.topStressorCount} employees flag this as primary`}
            accent="amber"
          />
        </div>
      </div>

      {/* ============ Row: Stress radar + Sentiment trend ============ */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        <Card className="lg:col-span-2">
          <CardTitle
            title="Population stress fingerprint"
            subtitle="Average score across 8 dimensions · higher = more stress"
          />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart
              data={STRESS_FACTORS.map(k => ({
                factor: STRESS_META[k].label.replace(" ", "\n"),
                score: popStress[k],
              }))}
              margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
            >
              <PolarGrid stroke="#E5E8EE" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: "#334155", fontWeight: 700 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94A3B8" }} />
              <Radar name="Stress" dataKey="score" stroke="#D52B1E" fill="#D52B1E" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip formatter={(v: number) => [`${v}/100`, "Avg stress"]} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-3">
          <CardTitle
            title="Signal channels we analyze (with company consent)"
            subtitle="Communication + collaboration signals feed the wellness and skill-gap scores · population averages shown"
            action={
              <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1">
                <MessagesSquare size={12} /> Metadata only
              </span>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ChannelTile
              icon={<Mail size={16} />}
              color="#4338CA"
              title="Email · client + team communication"
              signals="Tone toward clients vs teammates · response times · after-hours volume · escalation phrasing"
              metric={`${Math.round(EMPLOYEES.reduce((s, e) => s + e.comm.emailSentiment, 0) / EMPLOYEES.length * 100) / 100 >= 0 ? "+" : ""}${(EMPLOYEES.reduce((s, e) => s + e.comm.emailSentiment, 0) / EMPLOYEES.length).toFixed(2)}`}
              metricLabel="avg sentiment"
              trend={sentTrend.map(d => d.avgSentiment)}
            />
            <ChannelTile
              icon={<MessageCircle size={16} />}
              color="#7C3AED"
              title="Chat · Teams, Slack"
              signals="Message tone · thread participation · response latency in team channels · reactions given/received"
              metric={`${(EMPLOYEES.reduce((s, e) => s + e.comm.teamsSentiment, 0) / EMPLOYEES.length).toFixed(2)}`}
              metricLabel="avg sentiment"
              trend={sentTrend.map(d => d.avgSentiment + 0.05)}
            />
            <ChannelTile
              icon={<Video size={16} />}
              color="#0891B2"
              title="Meetings · Google Meet, Zoom, Teams calls"
              signals="Camera on/off · speaking time share · interruption patterns · attendance vs invited"
              metric={`${Math.round(EMPLOYEES.reduce((s, e) => s + e.comm.meetingParticipation, 0) / EMPLOYEES.length * 100)}%`}
              metricLabel="avg participation"
            />
            <ChannelTile
              icon={<FileCheck2 size={16} />}
              color="#D97706"
              title="Information completeness · skill-gap signal"
              signals="Do replies to clients + teams answer the actual question? Missing detail, hedging, deflection, and repeated clarification requests all flag a skill gap."
              metric={`${Math.round(EMPLOYEES.reduce((s, e) => s + e.comm.writingClarityScore, 0) / EMPLOYEES.length)}`}
              metricLabel="avg clarity /100"
            />
            <ChannelTile
              icon={<HeartPulse size={16} />}
              color="#DC2626"
              title="Health signals · opt-in wellness"
              signals="Sleep debt · resting HR · HRV · steps · chronic conditions · medical claims. Physical health is often the *cause* of stress, not the effect."
              metric={`${healthPct}`}
              metricLabel="health→stress contribution /100"
            />
            <ChannelTile
              icon={<MessagesSquare size={16} />}
              color="#4338CA"
              title="Sentiment trend · 30-day"
              signals="Rolling blended sentiment (email + Teams). Direction matters more than absolute value — 3 amber weeks in a row triggers a Nu check-in."
              metric={`${sentTrend[sentTrend.length - 1].avgSentiment.toFixed(2)}`}
              metricLabel="today's avg"
              trend={sentTrend.map(d => d.avgSentiment)}
            />
          </div>
        </Card>
      </div>

      {/* ============ Fathom stress bands + Nu playbook ============ */}
      <div className="px-8 mb-6">
        <Card>
          <CardTitle
            title="Fathom clusters employees into 4 stress bands · Nu tailors the next step per band"
            subtitle="Fathom does the reading (wellness + comm + health signals), Nu does the outreach (1:1 nudges, health prompts, load-shed suggestions). HRBPs see aggregates and act on the two rightmost bands."
            action={
              <span className="text-[11px] text-indigo-700 font-bold flex items-center gap-1">
                <Layers size={12} /> Fathom clustering · Nu playbook
              </span>
            }
          />

          {/* Population distribution strip */}
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Population distribution</div>
            <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200">
              {bands.map(b => {
                const meta = STRESS_BAND_META[b.band];
                if (b.count === 0) return null;
                return (
                  <div key={b.band} className="flex items-center justify-center text-[11px] font-bold text-white"
                       style={{ background: meta.color, width: `${b.pct}%` }} title={`${meta.label}: ${b.count} (${b.pct}%)`}>
                    {b.pct >= 8 ? `${b.count} · ${b.pct}%` : b.count}
                  </div>
                );
              })}
            </div>
            <div className="flex mt-1.5 text-[10.5px] text-slate-600 gap-4">
              {bands.map(b => (
                <div key={b.band} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ background: STRESS_BAND_META[b.band].color }} />
                  <span className="font-bold">{STRESS_BAND_META[b.band].label}</span>
                  <span className="text-slate-500">· {STRESS_BAND_META[b.band].range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Band cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {bands.map(b => {
              const meta = STRESS_BAND_META[b.band];
              return (
                <div key={b.band} className={`rounded-xl border-2 overflow-hidden bg-white flex flex-col`} style={{ borderColor: meta.border }}>
                  {/* header */}
                  <div className="px-4 py-3" style={{ background: meta.bg }}>
                    <div className="flex items-baseline justify-between">
                      <div className="text-[13px] font-extrabold" style={{ color: meta.color }}>{meta.label}</div>
                      <div className="text-[10px] font-bold tabular-nums" style={{ color: meta.color }}>{b.count} · {b.pct}%</div>
                    </div>
                    <div className="text-[11px] text-slate-700 mt-0.5 leading-snug">{meta.description}</div>
                    <div className="flex items-center gap-3 mt-2 text-[10.5px] text-slate-600">
                      <div><b className="tabular-nums" style={{ color: meta.color }}>{b.avgWellness}</b> avg wellness</div>
                      <div><b className="tabular-nums" style={{ color: meta.color }}>{Math.round(b.avgAttritionRisk * 100)}%</b> attrition</div>
                    </div>
                  </div>

                  {/* body */}
                  <div className="p-3.5 flex-1 flex flex-col gap-3">
                    {/* Top stressors */}
                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500 mb-1">Top drivers</div>
                      <div className="flex flex-wrap gap-1">
                        {b.topStressors.length === 0 ? (
                          <span className="text-[10.5px] text-slate-400 italic">—</span>
                        ) : b.topStressors.map(s => (
                          <span key={s.factor} className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{ background: STRESS_META[s.factor].bg, color: STRESS_META[s.factor].color }}>
                            {STRESS_META[s.factor].label} · {s.count}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Health flags */}
                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                        <HeartPulse size={10} className="text-rose-600" /> Health contributors
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {b.topHealthFlags.length === 0 ? (
                          <span className="text-[10.5px] text-slate-400 italic">No physical-health flags in this band.</span>
                        ) : b.topHealthFlags.slice(0, 3).map(h => (
                          <span key={h.flag} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            {h.flag} · {h.count}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Nu playbook */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[9.5px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1 text-indigo-700">
                        <Sparkles size={10} /> Nu's playbook
                      </div>
                      <ul className="space-y-1.5">
                        {b.nuSuggestions.slice(0, 3).map((s, i) => (
                          <li key={i} className="text-[11px] text-slate-700 leading-snug">
                            <b className="text-lilly-navy">{s.title}.</b> <span className="text-slate-600">{s.detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* HR next steps */}
                    <div className="pt-2 border-t border-slate-100 mt-auto">
                      <div className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                        <ArrowRight size={10} /> HR next steps
                      </div>
                      <ul className="space-y-0.5">
                        {b.hrNextSteps.slice(0, 3).map((s, i) => (
                          <li key={i} className="text-[10.5px] text-slate-700 leading-snug flex gap-1.5">
                            <span className="text-slate-400 shrink-0">·</span><span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ============ Department rollups ============ */}
      <div className="px-8 mb-6">
        <Card>
          <CardTitle
            title="Department rollup · sorted by wellness (lowest first)"
            subtitle="Every card shows headcount, average wellness, at-risk count, and the most-common primary stressor"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {rollups.map(r => {
              const meta = STRESS_META[r.topStressor];
              const wellnessTone =
                r.avgWellness >= 70 ? "emerald" :
                r.avgWellness >= 60 ? "slate" :
                r.avgWellness >= 50 ? "amber"  : "rose";
              return (
                <div key={r.department} className="p-4 border border-lilly-line rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-[13px] font-bold text-lilly-navy leading-snug">{r.department}</div>
                    <div className="text-[11px] text-slate-500 tabular-nums">{r.count}</div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className={
                      "text-[26px] font-extrabold tabular-nums " +
                      (wellnessTone === "emerald" ? "text-emerald-600"
                       : wellnessTone === "amber"  ? "text-amber-600"
                       : wellnessTone === "rose"   ? "text-rose-600" : "text-lilly-navy")
                    }>{r.avgWellness}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">wellness</div>
                  </div>
                  <div className="mt-2 h-1.5 rounded bg-slate-100 overflow-hidden">
                    <div className={
                      "h-full rounded " +
                      (wellnessTone === "emerald" ? "bg-emerald-500"
                       : wellnessTone === "amber"  ? "bg-amber-500"
                       : wellnessTone === "rose"   ? "bg-rose-500" : "bg-slate-500")
                    } style={{ width: `${r.avgWellness}%` }} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Primary stressor</div>
                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-2 text-[10.5px] text-slate-500">
                    <b className="text-rose-600 tabular-nums">{r.atRiskCount}</b> at-risk · <b className="text-lilly-navy">{r.count - r.atRiskCount}</b> healthy
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ============ At-risk queue + drill-down ============ */}
      <div className="px-8 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-5 mb-6">
        <Card padding="p-0">
          <div className="p-5 pb-3">
            <CardTitle
              title="HRBP working queue · top 12 at-risk employees"
              subtitle="Click any row to open the individual profile · sorted by wellness × attrition risk"
              action={
                <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle size={12} /> Priority outreach
                </span>
              }
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border-y border-slate-200">
                  <th className="px-4 py-2.5">Employee</th>
                  <th className="px-4 py-2.5">Dept · role</th>
                  <th className="px-4 py-2.5 w-32">Wellness</th>
                  <th className="px-4 py-2.5 w-32">Attrition</th>
                  <th className="px-4 py-2.5">Primary stressor</th>
                  <th className="px-4 py-2.5">Recommended action</th>
                </tr>
              </thead>
              <tbody>
                {atRisk.map(e => (
                  <AtRiskRow
                    key={e.id}
                    e={e}
                    selected={selectedEmpId === e.id}
                    onClick={() => setSelectedEmpId(e.id === selectedEmpId ? null : e.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Drill-down panel */}
        {selectedEmp ? (
          <EmployeeDrill emp={selectedEmp} onClose={() => setSelectedEmpId(null)} />
        ) : (
          <Card>
            <div className="text-center py-8">
              <Search size={30} className="mx-auto mb-3 text-slate-300" />
              <div className="text-[13px] font-bold text-lilly-navy">Select an employee from the queue</div>
              <div className="text-[11.5px] text-slate-500 mt-1 max-w-xs mx-auto">
                The drill-down shows their stress fingerprint, communication signals, skill gaps, and 90-day wellness trend.
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ============ Skill gap heatmap ============ */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card>
          <CardTitle
            title="Skill gap heatmap · top 8 gaps population-wide"
            subtitle="Bar length = number of employees with this gap · departments listed"
          />
          <div className="space-y-2">
            {skillMap.map(sg => {
              const w = (sg.count / (skillMap[0]?.count || 1)) * 100;
              return (
                <div key={sg.skill} className="grid grid-cols-[1fr_140px] gap-3 items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-[12.5px] font-bold text-lilly-navy">{sg.skill}</div>
                      <div className="text-[10px] text-slate-500 tabular-nums">×{sg.count}</div>
                    </div>
                    <div className="mt-1 h-3 bg-slate-100 rounded overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded" style={{ width: `${w}%` }} />
                    </div>
                  </div>
                  <div className="text-[10.5px] text-slate-500 leading-snug">
                    {Array.from(sg.departments).slice(0, 3).join(", ")}
                    {sg.departments.size > 3 && <span> +{sg.departments.size - 3}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Org interventions */}
        <Card>
          <CardTitle
            title="Recommended organization-wide interventions"
            subtitle="Sequenced by projected impact and readiness"
            action={
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <Sparkles size={12} /> AI-generated
              </span>
            }
          />
          <div className="space-y-3">
            {orgActs.map((iv, i) => (
              <div key={i} className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[14px] font-bold text-lilly-navy leading-snug">{iv.label}</div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-emerald-700 shrink-0">
                    {iv.projectedImpact.split(" ").slice(0, 2).join(" ")}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">{iv.targetPopulation}</div>
                <div className="text-[11px] text-slate-700 mt-2 pt-2 border-t border-emerald-200/60 leading-relaxed">
                  <b className="text-emerald-900">Mechanism:</b> {iv.mechanism}
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  <b>Projected impact:</b> {iv.projectedImpact}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ============ Privacy footer ============ */}
      <div className="px-8">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-[11.5px] text-slate-600 leading-relaxed">
          <b className="text-lilly-navy">Privacy note:</b> Fathom analyzes patterns and metadata (sentiment scores, response times, meeting participation, sentiment classification) — never content. Individual message contents are never surfaced to HR. Employees receive quarterly transparency reports showing which signals feed their wellness score.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function wellnessTone(score: number): { text: string; bg: string; bar: string } {
  if (score >= 70) return { text: "text-emerald-700", bg: "bg-emerald-50", bar: "bg-emerald-500" };
  if (score >= 60) return { text: "text-slate-700",   bg: "bg-slate-50",   bar: "bg-slate-500" };
  if (score >= 50) return { text: "text-amber-700",   bg: "bg-amber-50",   bar: "bg-amber-500" };
  return                { text: "text-rose-700",     bg: "bg-rose-50",    bar: "bg-rose-500" };
}

function AtRiskRow({ e, selected, onClick }: { e: Employee; selected: boolean; onClick: () => void }) {
  const wt = wellnessTone(e.wellnessScore);
  const meta = STRESS_META[e.primaryStressor];
  const attritionTone = e.attritionRisk >= 0.6 ? "text-rose-700" : e.attritionRisk >= 0.4 ? "text-amber-700" : "text-emerald-700";
  const urgencyTone =
    e.recommendedAction.urgency === "high"   ? "bg-rose-100 text-rose-700"
    : e.recommendedAction.urgency === "medium" ? "bg-amber-100 text-amber-700"
    :                                            "bg-emerald-100 text-emerald-700";
  return (
    <tr
      onClick={onClick}
      className={
        "border-b border-slate-100 cursor-pointer transition " +
        (selected ? "bg-indigo-50/40" : "hover:bg-slate-50")
      }
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full grid place-items-center text-white font-bold text-[11px] shrink-0"
               style={{ background: meta.color }}>
            {e.displayName.split(" ").map(p => p[0]).join("")}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-lilly-navy truncate">{e.displayName}</div>
            <div className="text-[10.5px] text-slate-500">
              {e.city} · {e.band} · {e.tenureMonths}mo
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-[12px] font-semibold text-lilly-navy">{e.department}</div>
        <div className="text-[10.5px] text-slate-500 mt-0.5">{e.role} · {e.clientRegion} client</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded bg-slate-100 overflow-hidden min-w-[50px]">
            <div className={`h-full rounded ${wt.bar}`} style={{ width: `${e.wellnessScore}%` }} />
          </div>
          <div className={`text-[12px] font-bold tabular-nums w-8 text-right ${wt.text}`}>{e.wellnessScore}</div>
        </div>
      </td>
      <td className={`px-4 py-3 text-[12px] font-bold tabular-nums ${attritionTone}`}>
        {Math.round(e.attritionRisk * 100)}%
      </td>
      <td className="px-4 py-3">
        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-start gap-2">
          <span className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${urgencyTone}`}>
            {e.recommendedAction.urgency}
          </span>
          <span className="text-[11.5px] text-slate-700 leading-snug">{e.recommendedAction.label}</span>
        </div>
      </td>
    </tr>
  );
}

function EmployeeDrill({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const wt = wellnessTone(emp.wellnessScore);
  const meta = STRESS_META[emp.primaryStressor];
  const radarData = STRESS_FACTORS.map(k => ({
    factor: STRESS_META[k].label.split(" ")[0],
    score: emp.stressFactors[k],
  }));

  return (
    <div className="bg-white border border-lilly-line rounded-xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-br from-lilly-navy to-[#12173D] text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Employee profile</div>
            <div className="text-[22px] font-extrabold mt-1 tracking-tight">{emp.displayName}</div>
            <div className="text-[11px] text-white/80 mt-1">
              {emp.role} · {emp.department} · {emp.city} · {emp.band}
            </div>
            <div className="text-[10.5px] text-white/70 mt-0.5">
              Reports to {emp.managerName} · {emp.clientRegion} client · {emp.tenureMonths}mo tenure
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-[13px] font-bold">✕</button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/60">Wellness</div>
            <div className="text-[26px] font-extrabold tabular-nums">{emp.wellnessScore}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/60">Attrition risk</div>
            <div className={"text-[26px] font-extrabold tabular-nums " + (emp.attritionRisk > 0.5 ? "text-rose-300" : emp.attritionRisk > 0.3 ? "text-amber-300" : "text-emerald-300")}>
              {Math.round(emp.attritionRisk * 100)}%
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/60">Language</div>
            <div className="text-[26px] font-extrabold tabular-nums">{emp.languageProficiency}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">

        {/* Stress radar */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Stress fingerprint</div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <PolarGrid stroke="#E5E8EE" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10, fill: "#334155", fontWeight: 700 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: "#94A3B8" }} />
              <Radar name="Stress" dataKey="score" stroke={meta.color} fill={meta.color} fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Communication signals */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Communication signals</div>
          <div className="grid grid-cols-2 gap-2">
            <SigTile label="Email sentiment" value={emp.comm.emailSentiment.toFixed(2)} tone={emp.comm.emailSentiment > 0.2 ? "pos" : emp.comm.emailSentiment > -0.1 ? "neu" : "neg"} />
            <SigTile label="Teams sentiment" value={emp.comm.teamsSentiment.toFixed(2)} tone={emp.comm.teamsSentiment > 0.2 ? "pos" : emp.comm.teamsSentiment > -0.1 ? "neu" : "neg"} />
            <SigTile label="Avg response" value={`${emp.comm.avgResponseTimeHours.toFixed(1)}h`} tone={emp.comm.avgResponseTimeHours < 4 ? "pos" : emp.comm.avgResponseTimeHours < 8 ? "neu" : "neg"} />
            <SigTile label="After-hours" value={`${Math.round(emp.comm.afterHoursActivityPct)}%`} tone={emp.comm.afterHoursActivityPct < 20 ? "pos" : emp.comm.afterHoursActivityPct < 40 ? "neu" : "neg"} />
            <SigTile label="Meeting particip." value={`${Math.round(emp.comm.meetingParticipation * 100)}%`} tone={emp.comm.meetingParticipation > 0.7 ? "pos" : emp.comm.meetingParticipation > 0.5 ? "neu" : "neg"} />
            <SigTile label="Client escalations" value={`${emp.comm.clientEscalations90d}`} tone={emp.comm.clientEscalations90d < 1 ? "pos" : emp.comm.clientEscalations90d < 3 ? "neu" : "neg"} />
          </div>
        </div>

        {/* Health signals */}
        <EmployeeHealthPanel emp={emp} />

        {/* Skill gaps */}
        {emp.skillGaps.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Detected skill gaps</div>
            <div className="flex flex-wrap gap-1.5">
              {emp.skillGaps.map((sk, i) => (
                <span key={i} className="text-[11px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-800">{sk}</span>
              ))}
            </div>
            <div className="text-[10.5px] text-slate-500 mt-2">
              Learning platform activity: <b className="text-lilly-navy tabular-nums">{emp.learningActivity30d}h</b> in last 30 days
            </div>
          </div>
        )}

        {/* 90-day wellness trend */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">90-day wellness trend</div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={emp.wellnessTrend90d.map((v, i) => ({ day: i - 89, wellness: v }))}
                       margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94A3B8" }}
                     ticks={[-89, -60, -30, 0]} tickFormatter={(v) => v === 0 ? "now" : `${-v}d`} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94A3B8" }} width={28} />
              <Tooltip formatter={(v: number) => [Math.round(v), "Wellness"]} />
              <Line type="monotone" dataKey="wellness" stroke={meta.color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recommended action */}
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-2">
            <Heart size={12} /> Recommended HR action
            <span className={
              "ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded " +
              (emp.recommendedAction.urgency === "high" ? "bg-rose-100 text-rose-700"
               : emp.recommendedAction.urgency === "medium" ? "bg-amber-100 text-amber-700"
               : "bg-emerald-100 text-emerald-700")
            }>
              {emp.recommendedAction.urgency}
            </span>
          </div>
          <div className="text-[13.5px] font-bold text-lilly-navy mt-1 leading-snug">{emp.recommendedAction.label}</div>
          <div className="text-[11.5px] text-slate-700 mt-2 pt-2 border-t border-emerald-200/60 leading-relaxed">
            <b className="text-emerald-900">Reason:</b> {emp.recommendedAction.reason}
          </div>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded hover:bg-emerald-700 transition">
              Schedule action
            </button>
            <button className="px-3 py-1.5 border border-slate-300 text-slate-700 text-[11px] font-bold rounded hover:bg-slate-50 transition">
              Add note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeHealthPanel({ emp }: { emp: Employee }) {
  const h = healthSignals(emp);
  const band = stressBandFor(emp);
  const bandMeta = STRESS_BAND_META[band];
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
        <HeartPulse size={11} className="text-rose-600" /> Health signals (opt-in)
        <span className="ml-auto text-[9.5px] font-bold px-1.5 py-0.5 rounded" style={{ background: bandMeta.bg, color: bandMeta.color }}>
          Band: {bandMeta.label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SigTile label="Sleep" value={`${h.sleepHoursAvg}h`} tone={h.sleepHoursAvg >= 7 ? "pos" : h.sleepHoursAvg >= 6 ? "neu" : "neg"} />
        <SigTile label="Sleep debt/2wk" value={`${h.sleepDebtHrs}h`} tone={h.sleepDebtHrs < 5 ? "pos" : h.sleepDebtHrs < 10 ? "neu" : "neg"} />
        <SigTile label="Steps/day" value={h.stepsDaily.toLocaleString()} tone={h.stepsDaily >= 7000 ? "pos" : h.stepsDaily >= 5000 ? "neu" : "neg"} />
        <SigTile label="Resting HR" value={`${h.restingHR}`} tone={h.restingHR < 70 ? "pos" : h.restingHR < 78 ? "neu" : "neg"} />
        <SigTile label="HRV" value={`${h.hrvMs}ms`} tone={h.hrvMs >= 45 ? "pos" : h.hrvMs >= 35 ? "neu" : "neg"} />
        <SigTile label="BMI" value={`${h.bmi}`} tone={h.bmi < 25 ? "pos" : h.bmi < 30 ? "neu" : "neg"} />
      </div>
      {(h.chronicConditions.length > 0 || h.medicalClaims90d > 0 || h.ergonomicComplaints) && (
        <div className="mt-2 p-2.5 rounded bg-rose-50 border border-rose-200">
          <div className="text-[10px] font-bold text-rose-800 uppercase tracking-widest mb-1">Health flags contributing to stress</div>
          <div className="flex flex-wrap gap-1.5">
            {h.chronicConditions.map((c, i) => (
              <span key={i} className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-white border border-rose-200 text-rose-800">{c}</span>
            ))}
            {h.medicalClaims90d > 0 && (
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-white border border-rose-200 text-rose-800">{h.medicalClaims90d} claims/90d</span>
            )}
            {h.ergonomicComplaints && (
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-white border border-rose-200 text-rose-800">Ergonomic complaint</span>
            )}
          </div>
          <div className="mt-2 text-[10.5px] text-rose-800 leading-relaxed">
            Health→stress contribution: <b className="tabular-nums">{h.healthContribution}/100</b>. Nu will surface health-first suggestions before workload changes.
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelTile({
  icon, color, title, signals, metric, metricLabel, trend,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  signals: string;
  metric: string;
  metricLabel: string;
  trend?: number[];
}) {
  // Build a tiny inline SVG sparkline if trend provided
  const spark = trend && trend.length > 1 ? (() => {
    const w = 60, h = 22;
    const min = Math.min(...trend), max = Math.max(...trend);
    const range = max - min || 1;
    const pts = trend.map((v, i) => {
      const x = (i / (trend.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return (
      <svg width={w} height={h} className="shrink-0">
        <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
      </svg>
    );
  })() : null;

  return (
    <div className="p-3.5 border border-slate-200 rounded-lg bg-white hover:border-slate-300 transition">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded grid place-items-center shrink-0" style={{ background: color + "18", color }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold text-lilly-navy leading-snug">{title}</div>
          <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">{signals}</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
        <div>
          <div className="text-[9.5px] font-bold uppercase tracking-widest text-slate-500">{metricLabel}</div>
          <div className="text-[18px] font-extrabold tabular-nums leading-none mt-0.5" style={{ color }}>{metric}</div>
        </div>
        {spark}
      </div>
    </div>
  );
}

function SigTile({ label, value, tone }: { label: string; value: string; tone: "pos" | "neu" | "neg" }) {
  const clr = tone === "pos" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
            : tone === "neu" ? "text-slate-700 bg-slate-50 border-slate-200"
            :                  "text-rose-700 bg-rose-50 border-rose-200";
  return (
    <div className={`p-2.5 rounded border ${clr}`}>
      <div className="text-[9.5px] font-bold uppercase tracking-widest opacity-75">{label}</div>
      <div className="text-[15px] font-bold tabular-nums tracking-tight mt-0.5">{value}</div>
    </div>
  );
}
