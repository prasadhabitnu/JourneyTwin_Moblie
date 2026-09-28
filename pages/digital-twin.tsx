import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import { PATIENTS, BUCKET_LABELS, Patient } from "../lib/patientData";
import {
  computeTwin, twinMemory, DEFAULT_INPUTS, TwinInputs, TwinState,
} from "../lib/digitalTwin";
import {
  buildTwinEngagement, askTwin, SUGGESTED_QUESTIONS,
  FutureSelf, EngagementState, NarrativeLayer, TwinEngagement,
} from "../lib/twinEngagement";
import { buildCompanion, checkInResponse } from "../lib/twinCompanion";
import { buildRelationship, TWIN_NAME } from "../lib/twinRelationship";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Area, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, Cell,
} from "recharts";
import {
  Sparkles, Activity, Moon, MessageSquare, Pill, Apple, ArrowRight, CheckCircle2,
  Target, Compass, Award, History, Zap, Dna, FlaskConical, Flame, TrendingUp,
  HeartPulse, ChevronDown, ChevronRight, ChevronLeft, Trophy, Footprints, Droplet, Scale, Layers, Utensils,
  Send, Snowflake, Quote, Sun, AlertTriangle,
} from "lucide-react";

// ---- HabitNu green theme (red reserved for genuine alerts) ----
const GREEN = "#16A34A";
const GREEN_DARK = "#15803D";
const NAVY = "#1B2A4E";
const AMBER = "#F59E0B";
const ALERT = "#DC2626";
const GREY = "#64748B";

function pickDefault() {
  const candidate = PATIENTS.find(p =>
    p.status === "Active" && p.weeksOnProgram >= 6 && p.weeksOnProgram <= 12 &&
    (p.gesTier === "T1" || p.gesTier === "T2")
  );
  return candidate ?? PATIENTS[0];
}

// =============================================================================
//  Recovery gauge — SVG semicircle
// =============================================================================
function RecoveryGauge({ score, state }: { score: number; state: string }) {
  const cx = 110, cy = 104, r = 84;
  const polar = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  };
  const arc = (startDeg: number, endDeg: number) => {
    const [sx, sy] = polar(startDeg);
    const [ex, ey] = polar(endDeg);
    const large = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
    const sweep = startDeg > endDeg ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} ${sweep} ${ex} ${ey}`;
  };
  const valueDeg = 180 - (180 * score) / 100;
  const color = state === "Optimal" ? GREEN
    : state === "Good" ? "#65A30D"
    : state === "Moderate" ? AMBER
    : ALERT;
  return (
    <svg viewBox="0 0 220 130" className="w-full" style={{ maxWidth: 240 }}>
      <path d={arc(180, 0)} fill="none" stroke="#E5E8EE" strokeWidth={16} strokeLinecap="round" />
      <path d={arc(180, valueDeg)} fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" />
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize={34} fontWeight={800} fill={NAVY}>{score}%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={12} fill={GREY}>Recovery Score</text>
    </svg>
  );
}

// =============================================================================
//  Main page
// =============================================================================
export default function DigitalTwin() {
  const [patientId, setPatientId] = useState<string>(pickDefault().id);
  const patient = PATIENTS.find(p => p.id === patientId)!;
  const [inputs, setInputs] = useState<TwinInputs>(DEFAULT_INPUTS);
  const [view, setView] = useState<"member" | "coach">("member");

  const twin = useMemo(() => computeTwin(patient, inputs), [patient, inputs]);

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Digital Twin"
        title={`${patient.name.split(" ")[0]}'s Health Twin`}
        subtitle="A live simulation of one participant's trajectory. The member view stays simple and motivating; the coach view carries the full intelligence layer."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-lilly-mist rounded-lg p-0.5 border border-lilly-line">
              <button
                onClick={() => setView("member")}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition ${view === "member" ? "bg-emerald-600 text-white" : "text-lilly-grey hover:text-lilly-navy"}`}
              >
                Member view
              </button>
              <button
                onClick={() => setView("coach")}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition ${view === "coach" ? "bg-lilly-navy text-white" : "text-lilly-grey hover:text-lilly-navy"}`}
              >
                Impact Driver
              </button>
            </div>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="text-sm font-semibold border border-lilly-line rounded-lg px-3 py-2 bg-white text-lilly-navy focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {PATIENTS.filter(p => p.status === "Active" || p.status === "Persistent").slice(0, 24).map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.id}</option>
              ))}
            </select>
            <button
              onClick={() => setInputs(DEFAULT_INPUTS)}
              className="text-[12px] font-semibold text-lilly-grey border border-lilly-line bg-white px-3 py-2 rounded-lg hover:bg-lilly-mist"
            >
              Reset
            </button>
          </div>
        }
      />
      {view === "member"
        ? <MemberDashboard twin={twin} patientName={patient.name} patient={patient} />
        : <CoachConsole twin={twin} patientName={patient.name} patientId={patient.id} inputs={inputs} setInputs={setInputs} />}
    </div>
  );
}

// =============================================================================
//  MEMBER DASHBOARD  (slide 5)
// =============================================================================
function MemberDashboard({ twin, patientName, patient }: { twin: TwinState; patientName: string; patient: Patient }) {
  const [showInsights, setShowInsights] = useState(false);
  const [memberTab, setMemberTab] = useState<"today" | "dashboard" | "companion">("today");
  const first = patientName.split(" ")[0];
  const m = twin.member;
  const rec = twin.recovery;
  const eng = buildTwinEngagement(patient, twin);
  const nextStep = twin.missions[0];

  // Sparkline for the projection card — 52-week weight line
  const spark = twin.trajectory.map(t => ({ week: t.week, weight: t.weight }));
  const startW = twin.trajectory[0].weight;
  const endW = twin.trajectory[twin.trajectory.length - 1].weight;
  const projLossLb = twin.headline.projectedWeightLossLb52w;

  const insightIcon: Record<string, any> = {
    body: Scale, cardio: HeartPulse, glucose: Droplet, energy: Zap,
  };

  return (
    <div className="px-8">
      {/* Welcome + Today / Dashboard tabs */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-[20px] font-bold text-lilly-navy">Welcome back, {first}</div>
          <div className="text-[13px] text-lilly-grey">
            {memberTab === "today" ? `${TWIN_NAME} has a few things for you today.` : memberTab === "companion" ? `${TWIN_NAME} — your companion, and the relationship behind your twin.` : "Your full digital twin overview."}
          </div>
        </div>
        <div className="flex items-center bg-lilly-mist rounded-lg p-0.5 border border-lilly-line shrink-0">
          <button onClick={() => setMemberTab("today")}
            className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition ${memberTab === "today" ? "bg-emerald-600 text-white" : "text-lilly-grey hover:text-lilly-navy"}`}>
            Today
          </button>
          <button onClick={() => setMemberTab("dashboard")}
            className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition ${memberTab === "dashboard" ? "bg-lilly-navy text-white" : "text-lilly-grey hover:text-lilly-navy"}`}>
            Dashboard
          </button>
          <button onClick={() => setMemberTab("companion")}
            className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition ${memberTab === "companion" ? "bg-emerald-700 text-white" : "text-lilly-grey hover:text-lilly-navy"}`}>
            Companion
          </button>
        </div>
      </div>

      {memberTab === "today" && <TodayView twin={twin} patient={patient} eng={eng} />}

      {memberTab === "companion" && <CompanionView twin={twin} patient={patient} />}

      {memberTab === "dashboard" && (
      <>

      {/* Row 1 — projection · streak · percentile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <Card className="md:col-span-1">
          <div className="flex items-start justify-between">
            <div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">Your 52-week projection</div>
            <Badge color={m.onTrack ? "green" : "amber"}>{m.onTrack ? "On track" : "Building"}</Badge>
          </div>
          <div className="flex items-end gap-4 mt-2">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[44px] font-bold text-emerald-700 leading-none">-{projLossLb}</span>
                <span className="text-[16px] font-semibold text-lilly-grey">lb</span>
              </div>
              <div className="text-[11.5px] text-lilly-grey mt-1">
                HbA1c -{twin.headline.projectedHbA1cDrop52w.toFixed(2)} · Confidence: <b className="text-lilly-navy">{twin.headline.confidenceLabel}</b>
              </div>
            </div>
            <div className="flex-1 h-[60px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark} margin={{ top: 6, right: 4, left: 4, bottom: 4 }}>
                  <Line type="monotone" dataKey="weight" stroke={GREEN} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <Flame className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <div className="text-[28px] font-bold text-lilly-navy leading-none">{m.dayStreak}</div>
              <div className="text-[12px] text-lilly-grey">day streak</div>
            </div>
          </div>
          <div className="text-[12px] text-lilly-grey mt-3">Keep it going — consistency is what moves the twin.</div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <div className="text-[24px] font-bold text-lilly-navy leading-none">{m.percentileLabel}</div>
              <div className="text-[12px] text-lilly-grey">percentile</div>
            </div>
          </div>
          <div className="text-[12px] text-lilly-grey mt-3">{m.percentileText}</div>
        </Card>
      </div>

      {/* Row 2 — this week · next best step · recovery window */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card>
          <CardTitle title="This week's momentum" subtitle="Your three weekly behavior signals" />
          <div className="space-y-3.5">
            {m.thisWeek.map(sig => {
              const Icon = sig.key === "adherence" ? CheckCircle2 : sig.key === "movement" ? Footprints : Moon;
              return (
                <div key={sig.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${sig.onTrack ? "text-emerald-600" : "text-amber-500"}`} />
                      <span className="text-[12.5px] font-semibold text-lilly-navy">{sig.label}</span>
                    </div>
                    <span className="text-[13px] font-bold text-lilly-navy">{sig.value}</span>
                  </div>
                  <div className="h-2 bg-lilly-line rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${sig.onTrack ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${sig.pct}%` }} />
                  </div>
                  <div className="text-[10.5px] text-lilly-grey mt-0.5">{sig.goal}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <CardTitle title="Next best action" subtitle="The one move with the most impact" />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-lilly-navy leading-tight">{nextStep.title}</div>
              <div className="text-[12px] text-lilly-grey mt-1 leading-snug">{nextStep.twinSays}</div>
            </div>
          </div>
          <button className="mt-4 w-full text-[12.5px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2.5 flex items-center justify-center gap-1.5">
            View action plan <ChevronRight className="w-4 h-4" />
          </button>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-bold text-lilly-navy flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-600" /> Recovery Window
            </div>
            <Badge color={rec.state === "Low" ? "rose" : rec.state === "Moderate" ? "amber" : "green"}>{rec.state}</Badge>
          </div>
          <RecoveryGauge score={rec.score} state={rec.state} />
          <div className="text-[12px] text-lilly-navy font-semibold mt-1">{rec.headline}</div>
          <div className="text-[11.5px] text-lilly-grey mt-0.5 leading-snug">{rec.guidance}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-emerald-50 rounded-lg p-2">
              <div className="font-bold text-emerald-700 mb-0.5">Good time for</div>
              <div className="text-lilly-grey leading-snug">{rec.goodTimeFor.join(", ")}</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2">
              <div className="font-bold text-amber-700 mb-0.5">Consider easing</div>
              <div className="text-lilly-grey leading-snug">{rec.consider.join(", ")}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Future self + ask-your-twin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2"><FutureSelfCard fs={eng.futureSelf} /></div>
        <AskTwinCopilot patient={patient} twin={twin} />
      </div>

      {/* Row 3 — twin trend · weekly win */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2">
          <CardTitle title="Twin trend (last 8 weeks)" subtitle="Weight and HbA1c, observed" />
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={m.recentTrend} margin={{ top: 6, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="L" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="R" orientation="right" domain={[5, 9]} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="L" type="monotone" dataKey="weight" stroke={GREEN} strokeWidth={3} dot={{ r: 3, fill: GREEN }} name="Weight (lb)" />
              <Line yAxisId="R" type="monotone" dataKey="hba1c" stroke={NAVY} strokeWidth={2.5} dot={false} name="HbA1c (%)" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-1.5 text-[12px] text-emerald-700 font-semibold mt-1">
            <TrendingUp className="w-4 h-4" /> {m.trendNote}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardTitle title="Weekly win" />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-[13px] text-lilly-navy leading-relaxed">{m.weeklyWin}</div>
          </div>
        </Card>
      </div>

      {/* Momentum + milestones + story */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <MomentumCard eng={eng.engagement} />
        <HealthMilestonesCard narrative={eng.narrative} />
        <StoryCard narrative={eng.narrative} />
      </div>

      {/* Row 4 — additional insights, expandable */}
      <Card padding="p-0">
        <button
          onClick={() => setShowInsights(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-lilly-mist/50 transition"
        >
          <div className="text-sm font-bold text-lilly-navy">Additional insights</div>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
            {showInsights ? "Hide" : "View all insights"}
            {showInsights ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>
        {showInsights && (
          <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {m.additionalInsights.map(ins => {
              const Icon = insightIcon[ins.key] ?? Activity;
              return (
                <div key={ins.key} className="border border-lilly-line rounded-lg p-3 hover:border-emerald-300 transition">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-[12.5px] font-bold text-lilly-navy leading-tight">{ins.label}</div>
                  <div className="text-[11px] text-lilly-grey mt-0.5">Tap to explore</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Nested drill-downs — progressive disclosure */}
      <div className="mt-5">
        <DrilldownExplorer twin={twin} patient={patient} />
      </div>
      </>
      )}
    </div>
  );
}

// =============================================================================
//  COACH CONSOLE  (full intelligence layer, renamed labels)
// =============================================================================
function CoachConsole({
  twin, patientName, patientId, inputs, setInputs,
}: {
  twin: TwinState; patientName: string; patientId: string;
  inputs: TwinInputs; setInputs: (u: (x: TwinInputs) => TwinInputs) => void;
}) {
  const [genomeCompare, setGenomeCompare] = useState(false);
  const memory = useMemo(() => twinMemory(PATIENTS.find(p => p.id === patientId)!), [patientId]);
  const rec = twin.recovery;

  // Health Twin Overview — bar-rail data
  const overview = [
    { dim: "Blood sugar stability", now: twin.current.glycemicControl, w52: twin.projected.week52.glycemicControl },
    { dim: "Weight momentum",       now: twin.current.weightLoad,      w52: twin.projected.week52.weightLoad },
    { dim: "Cardiovascular",        now: twin.current.cardiovascular,  w52: twin.projected.week52.cardiovascular },
    { dim: "Sleep",                 now: twin.current.sleepQuality,    w52: twin.projected.week52.sleepQuality },
    { dim: "Motivation",            now: twin.current.motivation,      w52: twin.projected.week52.motivation },
  ];

  const trajData = twin.trajectory.map((t, i) => ({
    week: t.week, weight: t.weight, weightP10: t.weightP10, weightP90: t.weightP90,
    hba1c: t.hba1c, weightNoGeno: twin.trajectoryNoGenomics[i]?.weight ?? t.weight,
  }));
  const genoEffectLb = Math.round(
    (twin.trajectoryNoGenomics[twin.trajectoryNoGenomics.length - 1]?.weight ?? 0) -
    twin.trajectory[twin.trajectory.length - 1].weight
  );

  return (
    <div className="px-8">
      {/* Cohort + genome attribution strip */}
      <Card className="bg-gradient-to-br from-lilly-navy via-lilly-navyDark to-black text-white border-lilly-navy mb-5">
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <div className="text-[18px] font-bold">{patientName}</div>
            <div className="text-[12px] text-white/65">{patientId}</div>
          </div>
          <div className="flex-1 min-w-[260px]">
            <div className="text-[10.5px] font-bold tracking-wider text-white/60 uppercase">Cohort attribution</div>
            <div className="text-[12.5px] mt-1">Grounded in <b className="text-emerald-300">{twin.cohort.n}</b> participants who match this profile.</div>
            <div className="text-[11px] text-white/60 mt-0.5">{twin.cohort.filter}</div>
            <div className="text-[11px] text-purple-300 mt-1 flex items-center gap-1">
              <Dna className="w-3 h-3 shrink-0" /> {twin.genomics.cohortLabel} · {twin.genomics.responseClass} GLP-1 responder
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10.5px] font-bold tracking-wider text-white/60 uppercase">Confidence</div>
            <div className="text-[18px] font-bold mt-0.5">{twin.headline.confidenceLabel}</div>
          </div>
        </div>
      </Card>

      {/* Health Twin Overview + Recovery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2">
          <CardTitle title="Health Twin Overview" subtitle="Now to Week 52 — higher is better on every axis" action={<Badge color="navy">Impact Driver</Badge>} />
          <div className="space-y-4">
            {overview.map(d => {
              const delta = d.w52 - d.now;
              const cls = delta > 0 ? "text-emerald-700 bg-emerald-50" : delta < 0 ? "text-rose-700 bg-rose-50" : "text-slate-700 bg-slate-100";
              return (
                <div key={d.dim}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-bold text-lilly-navy">{d.dim}</span>
                    <div className="flex items-center gap-2 text-[11.5px]">
                      <span className="font-mono text-lilly-grey">{d.now}</span>
                      <ArrowRight className="w-3 h-3 text-lilly-grey" />
                      <span className="font-mono font-bold text-lilly-navy">{d.w52}</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded text-[10.5px] ${cls}`}>
                        {delta > 0 ? "+" : ""}{delta}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-6 bg-lilly-mist rounded-lg overflow-hidden border border-lilly-line">
                    <div className="absolute inset-y-0 left-0" style={{ width: `${d.w52}%`, background: "rgba(22,163,74,0.13)" }} />
                    <div className="absolute top-1/2" style={{ left: `${d.now}%`, transform: "translate(-50%,-50%)", width: 9, height: 9, borderRadius: "50%", background: "#94A3B8", boxShadow: "0 0 0 2px white" }} />
                    <div className="absolute top-1/2" style={{ left: `${d.w52}%`, transform: "translate(-50%,-50%)", width: 13, height: 13, borderRadius: "50%", background: GREEN, boxShadow: "0 0 0 2px white" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-3 text-[10.5px] mt-3 pt-2.5 border-t border-lilly-line/60">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" /><span className="text-lilly-grey">Now</span></span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: GREEN }} /><span className="text-lilly-grey">Week 52</span></span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-bold text-lilly-navy flex items-center gap-1.5"><HeartPulse className="w-4 h-4 text-emerald-600" /> Recovery Window</div>
            <Badge color={rec.state === "Low" ? "rose" : rec.state === "Moderate" ? "amber" : "green"}>{rec.state}</Badge>
          </div>
          <RecoveryGauge score={rec.score} state={rec.state} />
          <div className="text-[12px] text-lilly-navy font-semibold mt-1">{rec.headline}</div>
          <div className="text-[11.5px] text-lilly-grey mt-0.5 leading-snug">{rec.guidance}</div>
        </Card>
      </div>

      {/* Trajectory + Genomic summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between mb-3 gap-3">
            <div>
              <div className="text-sm font-bold text-lilly-navy">52-week trajectory</div>
              <div className="text-[12px] text-lilly-grey mt-0.5">Live projection · P10/P90 band shaded</div>
            </div>
            <button
              onClick={() => setGenomeCompare(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md border transition ${genomeCompare ? "bg-purple-600 text-white border-purple-600" : "bg-white text-lilly-grey border-lilly-line hover:border-purple-300"}`}
            >
              <Dna className="w-3 h-3" /> Genome compare
            </button>
          </div>
          {genomeCompare && (
            <div className="mb-2 text-[11.5px] bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-purple-900">
              <Dna className="w-3.5 h-3.5 inline mr-1" />
              {genoEffectLb > 0
                ? <>Genome adds <b>{genoEffectLb} lb</b> of projected 52-week loss vs. a genome-neutral baseline.</>
                : genoEffectLb < 0
                  ? <>Genome costs <b>{Math.abs(genoEffectLb)} lb</b> vs. a genome-neutral baseline — tighter inputs close the gap.</>
                  : <>Genome is close to outcome-neutral here.</>}
            </div>
          )}
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={trajData} margin={{ top: 8, right: 18, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="bandG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.20} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis yAxisId="L" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis yAxisId="R" orientation="right" domain={[5, 9]} tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip />
              <Area yAxisId="L" type="monotone" dataKey="weightP90" stroke={GREEN} strokeOpacity={0.35} fill="url(#bandG)" name="P90" />
              <Area yAxisId="L" type="monotone" dataKey="weightP10" stroke={GREEN} strokeOpacity={0.35} fill="#fff" fillOpacity={1} name="P10" />
              <Line yAxisId="L" type="monotone" dataKey="weight" stroke={GREEN} strokeWidth={3} dot={false} name="Weight" />
              {genomeCompare && <Line yAxisId="L" type="monotone" dataKey="weightNoGeno" stroke="#7C3AED" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Genome-neutral" />}
              <Line yAxisId="R" type="monotone" dataKey="hba1c" stroke={NAVY} strokeWidth={2.5} dot={false} name="HbA1c" />
              {genomeCompare && <Legend wrapperStyle={{ fontSize: 11 }} />}
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-lilly-navy flex items-center gap-1.5"><Dna className="w-4 h-4 text-purple-600" /> Genomic Profile</div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
              twin.genomics.responseClass === "enhanced" ? "bg-emerald-50 text-emerald-700"
              : twin.genomics.responseClass === "attenuated" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"
            }`}>{twin.genomics.responseClass}</span>
          </div>
          <div className="text-[12px] text-lilly-navy leading-relaxed bg-slate-50 border border-lilly-line rounded-lg p-2.5">
            {twin.genomics.headline}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { l: "Weight loss", v: twin.genomics.netModifiers.weightLoss, up: true },
              { l: "HbA1c", v: twin.genomics.netModifiers.a1cResponse, up: true },
              { l: "Side-effect", v: twin.genomics.netModifiers.sideEffectRisk, up: false },
              { l: "Appetite", v: twin.genomics.netModifiers.appetiteControl, up: true },
            ].map(x => {
              const good = x.up ? x.v >= 1 : x.v <= 1;
              const neutral = Math.abs(x.v - 1) < 0.02;
              return (
                <div key={x.l} className={`rounded-lg p-2 ${neutral ? "bg-slate-100 text-slate-700" : good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{x.l}</div>
                  <div className="text-[16px] font-bold leading-none mt-0.5">×{x.v.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 space-y-1.5">
            {twin.genomics.variants.map(v => (
              <div key={v.rsid} className="flex items-center justify-between text-[11px] border-b border-lilly-line/50 pb-1">
                <span className="font-bold text-lilly-navy">{v.gene} <span className="font-mono text-lilly-grey font-normal">{v.genotype}</span></span>
                <span className="text-lilly-grey">{v.evidence}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* What changes your trajectory — levers */}
      <Card className="mb-5">
        <CardTitle title="What changes your trajectory" subtitle="Adjust any input — the twin updates everywhere in real time. Outcomes also depend on genome (above)." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Lever icon={Pill} label="Adherence (PDC)" unit="%" value={inputs.adherencePct} min={0} max={100} step={1}
            onChange={v => setInputs(x => ({ ...x, adherencePct: v }))} hint="The single highest-leverage input." />
          <Lever icon={Apple} label="Calorie deficit" unit=" kcal/day" value={inputs.calorieDeficit} min={0} max={1000} step={50}
            onChange={v => setInputs(x => ({ ...x, calorieDeficit: v }))} hint="Below maintenance. Diminishing returns past ~700." />
          <Lever icon={Activity} label="Exercise" unit=" min/week" value={inputs.exerciseMinPerWeek} min={0} max={400} step={10}
            onChange={v => setInputs(x => ({ ...x, exerciseMinPerWeek: v }))} hint="150 min/wk is the inflection." />
          <Lever icon={Moon} label="Sleep" unit=" hrs/night" value={inputs.sleepHoursPerNight} min={4} max={10} step={0.5}
            onChange={v => setInputs(x => ({ ...x, sleepHoursPerNight: v }))} hint="A stealth multiplier on every other input." />
          <Lever icon={MessageSquare} label="Accountability rhythm" unit="/month" value={inputs.coachSessionsPerMonth} min={0} max={6} step={1}
            onChange={v => setInputs(x => ({ ...x, coachSessionsPerMonth: v }))} hint="Coach sessions per month. 2 is the typical rhythm." />
        </div>
      </Card>

      {/* Driver ranking + Next best action + Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card>
          <CardTitle title="Driver ranking" subtitle="Which input moves the trajectory most" action={<Badge color="navy"><Compass className="w-3 h-3 mr-1" />causal</Badge>} />
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={twin.driverRanking} layout="vertical" margin={{ top: 5, right: 18, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} unit=" lb" />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 11.5, fill: "#1B2A4E", fontWeight: 600 }} width={84} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => `${v} lb @ 52w`} />
              <Bar dataKey="lift" radius={[0, 4, 4, 0]}>
                {twin.driverRanking.map((_, i) => <Cell key={i} fill={i === 0 ? GREEN : i === 1 ? NAVY : "#94A3B8"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="Next best action" subtitle="Three paths from today — pick one and commit" action={<Badge color="green"><Target className="w-3 h-3 mr-1" />choose</Badge>} />
          <div className="space-y-2.5">
            {twin.futures.map((f, i) => (
              <button key={f.key} onClick={() => setInputs(x => ({ ...x, ...f.inputs }))}
                className={`w-full text-left p-3 rounded-lg border transition ${i === 0 ? "border-slate-300 bg-slate-50 hover:border-lilly-navy" : "border-emerald-200 bg-emerald-50/60 hover:border-emerald-500"}`}>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="text-[13px] font-bold text-lilly-navy">{f.label}</div>
                  <div className="text-right text-[12px]">
                    <div className="font-bold text-emerald-700">{f.weightDelta52w >= 0 ? "+" : ""}{f.weightDelta52w} lb</div>
                  </div>
                </div>
                <div className="text-[11.5px] text-lilly-grey leading-snug">{f.description}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle title="Missions this week" subtitle="Concrete experiments to run with the participant" action={<Badge color="green"><CheckCircle2 className="w-3 h-3 mr-1" />weekly</Badge>} />
          <div className="space-y-3">
            {twin.missions.map((mi, i) => (
              <div key={mi.id} className="border border-lilly-line rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-md bg-lilly-navy text-white text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div>
                    <div className="text-[12.5px] font-bold text-lilly-navy">{mi.title}</div>
                    <div className="text-[11px] text-lilly-grey mt-0.5 leading-snug">{mi.ask}</div>
                    <div className="text-[11px] text-emerald-800 mt-1.5 leading-snug bg-emerald-50 rounded px-2 py-1.5">
                      <Sparkles className="w-3 h-3 inline mr-1" /> {mi.twinSays}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Twin remembers */}
      <Card>
        <CardTitle title="Twin remembers" subtitle="Earlier projections vs. what actually happened — trust accrues over time" action={<Badge color="amber"><History className="w-3 h-3 mr-1" />track record</Badge>} />
        {memory.length === 0 ? (
          <div className="text-[13px] text-lilly-grey italic py-6 text-center">
            Not enough program history yet — the twin builds its track record after the first 4 weeks.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <ComposedChart data={memory} margin={{ top: 8, right: 18, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} unit="w" />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="predicted" stroke={NAVY} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: NAVY }} name="Twin predicted" />
              <Line type="monotone" dataKey="observed" stroke={GREEN} strokeWidth={2.5} dot={{ r: 4, fill: GREEN }} name="Actually observed" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}

// =============================================================================
//  Lever (slider)
// =============================================================================
function Lever({
  icon: Icon, label, unit, value, min, max, step, onChange, hint,
}: {
  icon: any; label: string; unit: string;
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div className="border border-lilly-line rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[12.5px] font-bold text-lilly-navy">{label}</span>
        </div>
        <div className="text-[14px] font-bold text-emerald-700 font-mono">
          {Number.isInteger(value) ? value : value.toFixed(1)}{unit}
        </div>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-emerald-600"
      />
      <div className="flex justify-between text-[10px] text-lilly-grey mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      {hint && <div className="text-[10.5px] text-lilly-grey mt-1.5 leading-snug">{hint}</div>}
    </div>
  );
}

// =============================================================================
//  Nested drill-down explorer (slide 7) — progressive disclosure
// =============================================================================
function DrilldownExplorer({ twin, patient }: { twin: TwinState; patient: Patient }) {
  const [screen, setScreen] = useState<"overview" | "trend" | "drivers" | "nutrition" | "recovery">("overview");
  const [trendRange, setTrendRange] = useState<"52" | "12">("52");

  const lossLb = +(patient.baselineWeightLb * patient.pctBwLoss / 100).toFixed(1);
  const a1cDropSoFar = +((patient.hba1c >= 6.5 ? 0.7 : 0.25) * (lossLb / 20)).toFixed(2);
  const projLoss = twin.headline.projectedWeightLossLb52w;

  let h = 0;
  for (let i = 0; i < patient.id.length; i++) h = ((h << 5) - h + patient.id.charCodeAt(i)) | 0;
  h = Math.abs(h);

  const overviewItems = [
    { key: "weight",    icon: Scale,        label: "Weight",          value: `-${lossLb} lb`,     sub: "Since start", goto: "trend" as const },
    { key: "hba1c",     icon: Droplet,      label: "HbA1c",           value: `-${a1cDropSoFar}%`, sub: "Since start", goto: "trend" as const },
    { key: "adherence", icon: CheckCircle2, label: "Adherence (PDC)", value: twin.member.thisWeek[0].value, sub: "This week", goto: null },
    { key: "movement",  icon: Footprints,   label: "Movement",        value: twin.member.thisWeek[1].value, sub: "This week", goto: "drivers" as const },
    { key: "sleep",     icon: Moon,         label: "Sleep",           value: twin.member.thisWeek[2].value, sub: "This week", goto: "recovery" as const },
  ];

  const trend52 = twin.trajectory.map(t => ({ week: `W${t.week}`, weight: t.weight }));
  const trend12 = twin.trajectory.filter(t => t.week <= 12).map(t => ({ week: `W${t.week}`, weight: t.weight }));
  const trendData = trendRange === "52" ? trend52 : trend12;

  const drivers = [
    { factor: "Nutrition", impact: +(projLoss * 0.42).toFixed(1), pct: 100 },
    { factor: "Movement",  impact: +(projLoss * 0.28).toFixed(1), pct: 67 },
    { factor: "Sleep",     impact: +(projLoss * 0.18).toFixed(1), pct: 43 },
    { factor: "Stress",    impact: +(projLoss * 0.12).toFixed(1), pct: 29 },
  ];

  const nutrition = [
    { label: "Calorie Deficit", value: 350 + h % 200, unit: " kcal/day", goal: 500 },
    { label: "Protein Intake",  value: 95 + h % 30,   unit: " g/day",    goal: 120 },
    { label: "Fiber Intake",    value: 22 + h % 12,   unit: " g/day",    goal: 30 },
    { label: "Hydration",       value: +(1.6 + (h % 10) / 10).toFixed(1), unit: " L/day", goal: 2.5 },
  ];

  const recScore = twin.recovery.score;
  const rate = (v: number) => (v >= 70 ? "Good" : v >= 45 ? "Fair" : "Needs work");
  const recoveryFactors = [
    { factor: "Sleep Quality",          rating: rate(recScore + 6) },
    { factor: "Heart Rate Variability", rating: rate(recScore - 10) },
    { factor: "Resting Heart Rate",     rating: rate(recScore - 6) },
    { factor: "Stress Balance",         rating: rate(recScore + 2) },
  ];

  const PARENT: Record<string, "overview" | "trend" | "drivers" | null> = {
    overview: null, trend: "overview", drivers: "trend", nutrition: "drivers", recovery: "overview",
  };
  const PATH: Record<string, string[]> = {
    overview: ["Overview"],
    trend: ["Overview", "Trend detail"],
    drivers: ["Overview", "Trend detail", "Drivers"],
    nutrition: ["Overview", "Trend detail", "Drivers", "Nutrition"],
    recovery: ["Overview", "Recovery detail"],
  };

  return (
    <Card padding="p-0">
      <div className="px-5 pt-4 pb-3 border-b border-lilly-line">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-lilly-navy">Explore your twin in depth</div>
            <div className="text-[12px] text-lilly-grey">Progressive disclosure — deeper insight, one tap at a time</div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2.5 text-[11px]">
          {PATH[screen].map((p, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              <span className={i === arr.length - 1 ? "font-bold text-emerald-700" : "text-lilly-grey"}>{p}</span>
              {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-lilly-grey" />}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5">
        {PARENT[screen] && (
          <button onClick={() => setScreen(PARENT[screen]!)} className="flex items-center gap-1 text-[12px] font-semibold text-emerald-700 mb-3 hover:text-emerald-800">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}

        {screen === "overview" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[12px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-md">Trends</span>
              <span className="text-[12px] font-semibold text-lilly-grey px-2.5 py-1">Milestones</span>
            </div>
            <div className="space-y-1.5">
              {overviewItems.map(it => {
                const Icon = it.icon;
                const tappable = it.goto !== null;
                return (
                  <button key={it.key} disabled={!tappable}
                    onClick={() => it.goto && setScreen(it.goto)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition text-left ${tappable ? "border-lilly-line hover:border-emerald-300 hover:bg-lilly-mist/40" : "border-lilly-line/60"}`}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-lilly-navy">{it.label}</div>
                      <div className="text-[11px] text-lilly-grey">{it.sub}</div>
                    </div>
                    <div className="text-[14px] font-bold text-lilly-navy">{it.value}</div>
                    {tappable && <ChevronRight className="w-4 h-4 text-lilly-grey" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {screen === "trend" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[14px] font-bold text-lilly-navy">Weight Trend</div>
              <div className="flex items-center gap-1 bg-lilly-mist rounded-lg p-0.5 border border-lilly-line">
                {(["52", "12"] as const).map(r => (
                  <button key={r} onClick={() => setTrendRange(r)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${trendRange === r ? "bg-white text-lilly-navy shadow-sm" : "text-lilly-grey"}`}>
                    {r} Weeks
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 6, right: 14, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke={GREEN} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">Projected at 52 weeks</div>
                <div className="text-[12px] text-lilly-grey">Confidence: {twin.headline.confidenceLabel}</div>
              </div>
              <div className="text-[24px] font-bold text-emerald-700">-{projLoss} lb</div>
            </div>
            <button onClick={() => setScreen("drivers")} className="mt-3 w-full text-[12.5px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2.5 flex items-center justify-center gap-1.5">
              See what's driving this <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {screen === "drivers" && (
          <div>
            <div className="text-[14px] font-bold text-lilly-navy mb-1">Weight Drivers</div>
            <div className="text-[11.5px] text-lilly-grey mb-3">Impact on weight · high impact first</div>
            <div className="space-y-2.5">
              {drivers.map(d => (
                <div key={d.factor}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="font-semibold text-lilly-navy">{d.factor}</span>
                    <span className="font-bold text-emerald-700">-{d.impact} lb</span>
                  </div>
                  <div className="h-2.5 bg-lilly-mist rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-lilly-mist rounded-lg p-3 text-[12px] text-lilly-navy">
              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
              Focus on nutrition and movement to maximize results.
            </div>
            <button onClick={() => setScreen("nutrition")} className="mt-3 w-full text-[12.5px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2.5 flex items-center justify-center gap-1.5">
              Nutrition detail <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {screen === "nutrition" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span className="text-[12px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-md">Overview</span>
              <span className="text-[12px] font-semibold text-lilly-grey px-2.5 py-1">Details</span>
            </div>
            <div className="space-y-3">
              {nutrition.map(n => {
                const pct = Math.min(100, (Number(n.value) / n.goal) * 100);
                const ok = Number(n.value) >= n.goal * 0.9;
                return (
                  <div key={n.label}>
                    <div className="flex items-center justify-between text-[12.5px] mb-1">
                      <span className="font-semibold text-lilly-navy">{n.label}</span>
                      <span className="font-bold text-lilly-navy">{n.value}{n.unit}</span>
                    </div>
                    <div className="h-2 bg-lilly-mist rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ok ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10.5px] text-lilly-grey mt-0.5">Goal: {n.goal}{n.unit}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {screen === "recovery" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[12px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded-md">Overview</span>
              <span className="text-[12px] font-semibold text-lilly-grey px-2.5 py-1">History</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-40 shrink-0"><RecoveryGauge score={twin.recovery.score} state={twin.recovery.state} /></div>
              <div>
                <Badge color={twin.recovery.state === "Low" ? "rose" : twin.recovery.state === "Moderate" ? "amber" : "green"}>{twin.recovery.state}</Badge>
                <div className="text-[12px] text-lilly-navy font-semibold mt-1.5">{twin.recovery.headline}</div>
                <div className="text-[11.5px] text-lilly-grey mt-0.5">{twin.recovery.guidance}</div>
              </div>
            </div>
            <div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase mt-4 mb-2">What's driving your recovery</div>
            <div className="space-y-1.5">
              {recoveryFactors.map(f => {
                const tone = f.rating === "Good" ? "text-emerald-700 bg-emerald-50" : f.rating === "Fair" ? "text-amber-700 bg-amber-50" : "text-rose-700 bg-rose-50";
                return (
                  <div key={f.factor} className="flex items-center justify-between border-b border-lilly-line/60 pb-1.5">
                    <span className="text-[12.5px] text-lilly-navy">{f.factor}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${tone}`}>{f.rating}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// =============================================================================
//  ENGAGEMENT SURFACES — future self · copilot · momentum · milestones · story
// =============================================================================
function FutureSelfCard({ fs }: { fs: FutureSelf }) {
  return (
    <Card className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white border-emerald-800">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <div className="text-[10.5px] font-bold tracking-wider text-white/70 uppercase">Future-self preview</div>
          <div className="text-[19px] font-bold leading-tight">{fs.headline}</div>
          <div className="text-[12px] text-white/80 mt-0.5">Hold your current path and here's life in {fs.horizonWeeks} weeks — about {fs.projWeightLb} lb lighter.</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-white/60 uppercase mb-1.5">What changes</div>
          <ul className="space-y-1.5">
            {fs.vignette.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] text-white/95 leading-snug">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />{v}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[11px] font-bold tracking-wider text-white/60 uppercase mb-1.5">On the way there</div>
          <div className="space-y-2">
            {fs.milestonePreviews.map((mp, i) => (
              <div key={i} className="bg-white/10 border border-white/15 rounded-lg p-2.5">
                <div className="text-[12.5px] font-bold">{mp.label}</div>
                <div className="text-[11px] text-white/75">{mp.distance} · {mp.eta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function AskTwinCopilot({ patient, twin }: { patient: Patient; twin: TwinState }) {
  const [msgs, setMsgs] = useState<{ role: "you" | "twin"; text: string }[]>([
    { role: "twin", text: `Hi — I'm ${TWIN_NAME}, your twin's voice. Ask me anything about your projection, or tap a question below.` },
  ]);
  const [draft, setDraft] = useState("");
  const ask = (q: string) => {
    if (!q.trim()) return;
    const a = askTwin(q, patient, twin);
    setMsgs(m => [...m, { role: "you", text: q }, { role: "twin", text: a }]);
    setDraft("");
  };
  return (
    <Card>
      <CardTitle title={`Ask ${TWIN_NAME}`} subtitle={`${TWIN_NAME}, the voice of your twin, talks back`} action={<Badge color="green"><MessageSquare className="w-3 h-3 mr-1" />copilot</Badge>} />
      <div className="space-y-2 max-h-[210px] overflow-y-auto mb-3 pr-1">
        {msgs.map((mm, i) => (
          <div key={i} className={`flex ${mm.role === "you" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[12px] leading-snug ${mm.role === "you" ? "bg-lilly-navy text-white" : "bg-emerald-50 text-lilly-navy border border-emerald-100"}`}>
              {mm.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {SUGGESTED_QUESTIONS.map(qq => (
          <button key={qq} onClick={() => ask(qq)}
            className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 hover:bg-emerald-100">
            {qq}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") ask(draft); }}
          placeholder="Ask your twin..."
          className="flex-1 text-[12px] border border-lilly-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <button onClick={() => ask(draft)} className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}

function MomentumCard({ eng }: { eng: EngagementState }) {
  const toneColor = eng.consistencyTone === "green" ? "text-emerald-700" : eng.consistencyTone === "amber" ? "text-amber-700" : "text-rose-700";
  const toneBar = eng.consistencyTone === "green" ? "bg-emerald-500" : eng.consistencyTone === "amber" ? "bg-amber-400" : "bg-rose-400";
  return (
    <Card>
      <CardTitle title="Your momentum" subtitle="Built to survive an off day" />
      {eng.inComeback && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
          <div className="text-[12.5px] font-bold text-emerald-800">{eng.comebackTitle}</div>
          <div className="text-[11.5px] text-lilly-grey mt-1 leading-snug">{eng.comebackMessage}</div>
        </div>
      )}
      <div className="mb-3">
        <div className="flex items-end justify-between">
          <span className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">Consistency score</span>
          <span className={`text-[24px] font-bold ${toneColor} leading-none`}>{eng.consistencyScore}</span>
        </div>
        <div className="h-2 bg-lilly-line rounded-full overflow-hidden mt-1.5">
          <div className={`h-full ${toneBar} rounded-full`} style={{ width: `${eng.consistencyScore}%` }} />
        </div>
        <div className="text-[11.5px] text-lilly-grey mt-1">{eng.consistencyLabel}</div>
      </div>
      <div className="flex items-center gap-4 mb-3 text-[12px]">
        <span className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /><b className="text-lilly-navy">{eng.dayStreak}</b> day streak</span>
        <span className="flex items-center gap-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <Snowflake key={i} className={`w-4 h-4 ${i < eng.streakFreezes ? "text-sky-500" : "text-lilly-line"}`} />
          ))}
          <span className="text-lilly-grey ml-0.5">{eng.streakFreezes} freeze{eng.streakFreezes === 1 ? "" : "s"}</span>
        </span>
      </div>
      <div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase mb-1.5">This week's effort · {eng.effortScore}%</div>
      <div className="space-y-1">
        {eng.effortItems.map((it, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${it.done ? "text-emerald-600" : "text-lilly-line"}`} />
            <span className={it.done ? "text-lilly-navy" : "text-lilly-grey"}>{it.label}</span>
          </div>
        ))}
      </div>
      <div className="text-[10.5px] text-lilly-grey mt-2 leading-snug">Effort counts what you control — it holds up even when the scale doesn't move.</div>
    </Card>
  );
}

function HealthMilestonesCard({ narrative }: { narrative: NarrativeLayer }) {
  return (
    <Card>
      <CardTitle title="Health milestones" subtitle="Real outcomes — no points, no badges" />
      <div className="space-y-1.5 mb-3">
        {narrative.milestones.map((mil, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${mil.achieved ? "text-emerald-600" : "text-lilly-line"}`} />
            <div>
              <div className={`text-[12.5px] font-semibold ${mil.achieved ? "text-lilly-navy" : "text-lilly-grey"}`}>{mil.label}</div>
              <div className="text-[10.5px] text-lilly-grey leading-snug">{mil.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-lilly-line/60">
        <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase mb-2">Small actions, compounding</div>
        <div className="grid grid-cols-3 gap-2">
          {narrative.compounding.map((c, i) => (
            <div key={i} className="bg-lilly-mist rounded-lg p-2">
              <div className="text-[16px] font-bold text-emerald-700 leading-none">{c.value}</div>
              <div className="text-[10px] font-semibold text-lilly-navy mt-1">{c.label}</div>
              <div className="text-[9.5px] text-lilly-grey leading-snug mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function StoryCard({ narrative }: { narrative: NarrativeLayer }) {
  return (
    <Card>
      <CardTitle title="Your story so far" subtitle="Who you're becoming — chapter by chapter" />
      <div className="space-y-2 mb-3">
        {narrative.identity.map((id, i) => (
          <div key={i} className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
            <Quote className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[12px] text-lilly-navy leading-snug">{id}</div>
          </div>
        ))}
      </div>
      <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase mb-2">Your chapters</div>
      <div className="space-y-2">
        {narrative.chapters.map(ch => (
          <div key={ch.n} className="flex items-start gap-2.5">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
              ch.status === "done" ? "bg-emerald-600 text-white" : ch.status === "current" ? "bg-amber-400 text-white" : "bg-lilly-mist text-lilly-grey"
            }`}>{ch.n}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[12.5px] font-bold ${ch.status === "upcoming" ? "text-lilly-grey" : "text-lilly-navy"}`}>{ch.title}</span>
                {ch.status === "current" && <Badge color="amber" size="xs">you are here</Badge>}
              </div>
              <div className="text-[11px] text-lilly-grey leading-snug">{ch.summary}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// =============================================================================
//  TODAY VIEW — the daily companion surface
// =============================================================================
function TodayView({ twin, patient, eng }: { twin: TwinState; patient: Patient; eng: TwinEngagement }) {
  const companion = buildCompanion(patient, twin, eng);
  return (
    <div className="space-y-5">
      <DailyBriefCard brief={companion.brief} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><ProactiveFeed signals={companion.signals} /></div>
        <CheckInCard checkIn={companion.checkIn} />
      </div>
      <ReflectionCard prompt={companion.reflectionPrompt} />
      <div className="text-center text-[11.5px] text-lilly-grey pt-1">
        Your full dashboard, trends, drill-downs and story are one tap away — top right.
      </div>
    </div>
  );
}

function DailyBriefCard({ brief }: { brief: ReturnType<typeof buildCompanion>["brief"] }) {
  return (
    <Card className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white border-emerald-800">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Sun className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="text-[19px] font-bold leading-tight">{brief.greeting}</div>
          <div className="text-[12px] text-white/75">{brief.dateLabel}</div>
        </div>
        <div className="text-[11px] text-white/85 bg-white/10 border border-white/15 rounded-lg px-2.5 py-1 shrink-0">
          {brief.streakLine}
        </div>
      </div>
      <div className="mt-4 bg-white/10 border border-white/15 rounded-xl p-4">
        <div className="text-[10.5px] font-bold tracking-wider text-white/70 uppercase">Your one thing today</div>
        <div className="text-[17px] font-bold mt-1 leading-tight">{brief.oneThing}</div>
        <div className="text-[12.5px] text-white/85 mt-1.5 leading-snug">{brief.oneThingWhy}</div>
      </div>
      <div className="mt-3 text-[12.5px] text-white/90 flex items-start gap-2">
        <HeartPulse className="w-4 h-4 text-emerald-200 shrink-0 mt-0.5" />{brief.focusLine}
      </div>
    </Card>
  );
}

const SIGNAL_STYLE: Record<string, { border: string; bg: string; icon: any; iconCls: string; tag: string }> = {
  escalate:   { border: "border-l-rose-500",    bg: "bg-rose-50",    icon: AlertTriangle, iconCls: "text-rose-600",    tag: "Care team" },
  watch:      { border: "border-l-amber-500",   bg: "bg-amber-50",   icon: AlertTriangle, iconCls: "text-amber-600",   tag: "Watch" },
  nudge:      { border: "border-l-emerald-500", bg: "bg-emerald-50", icon: ArrowRight,    iconCls: "text-emerald-600", tag: "Nudge" },
  anticipate: { border: "border-l-sky-500",     bg: "bg-sky-50",     icon: Compass,       iconCls: "text-sky-600",     tag: "Heads-up" },
  encourage:  { border: "border-l-emerald-500", bg: "bg-emerald-50", icon: Sparkles,      iconCls: "text-emerald-600", tag: "Win" },
};

function ProactiveFeed({ signals }: { signals: ReturnType<typeof buildCompanion>["signals"] }) {
  return (
    <Card>
      <CardTitle title="Your twin noticed" subtitle="Proactive — drawn from your historical and current data, no need to ask" action={<Badge color="green"><Sparkles className="w-3 h-3 mr-1" />proactive</Badge>} />
      <div className="space-y-2.5">
        {signals.map(s => {
          const st = SIGNAL_STYLE[s.kind];
          const Icon = st.icon;
          return (
            <div key={s.id} className={`border-l-4 ${st.border} ${st.bg} rounded-r-lg p-3`}>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-lilly-line flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${st.iconCls}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-lilly-navy">{s.title}</span>
                    <span className={`text-[9.5px] font-bold uppercase tracking-wider ${st.iconCls}`}>{st.tag}</span>
                  </div>
                  <div className="text-[12px] text-lilly-grey mt-0.5 leading-snug">{s.detail}</div>
                  {s.action && (
                    <button className="mt-2 text-[11.5px] font-bold text-emerald-700 flex items-center gap-1 hover:text-emerald-800">
                      {s.action} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CheckInCard({ checkIn }: { checkIn: ReturnType<typeof buildCompanion>["checkIn"] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const allAnswered = checkIn.every(q => answers[q.id] !== undefined);
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  return (
    <Card>
      <CardTitle title="20-second check-in" subtitle="Three taps — your twin learns from every one" />
      <div className="space-y-3">
        {checkIn.map(q => (
          <div key={q.id}>
            <div className="text-[12px] font-semibold text-lilly-navy mb-1.5">{q.prompt}</div>
            <div className="flex gap-1.5">
              {q.options.map(o => (
                <button key={o.label}
                  onClick={() => setAnswers(a => ({ ...a, [q.id]: o.value }))}
                  className={`flex-1 text-[11.5px] font-semibold rounded-lg py-1.5 border transition ${
                    answers[q.id] === o.value
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-lilly-grey border-lilly-line hover:border-emerald-300"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {allAnswered && (
        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-[12px] text-lilly-navy leading-snug">
          <Sparkles className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
          {checkInResponse(total)}
        </div>
      )}
    </Card>
  );
}

function ReflectionCard({ prompt }: { prompt: string }) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <Moon className="w-4 h-4 text-lilly-navy" />
        <div className="text-sm font-bold text-lilly-navy">Evening reflection</div>
        <span className="text-[11px] text-lilly-grey">— a 10-second close to the day</span>
      </div>
      {saved ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-[12.5px] text-lilly-navy">
          <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-600" />
          Logged. Naming a win — even a small one — is how the good days compound. See you tomorrow.
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={prompt}
            className="flex-1 text-[12.5px] border border-lilly-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <button
            onClick={() => { if (text.trim()) setSaved(true); }}
            className="text-[12px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4">
            Save
          </button>
        </div>
      )}
    </Card>
   );
}

// =============================================================================
//  COMPANION VIEW — relationship, memory, coach handoff, lifelong mode
// =============================================================================
const MEMORY_STYLE: Record<string, { icon: any; cls: string }> = {
  start:        { icon: Sparkles,     cls: "text-emerald-600" },
  milestone:    { icon: Award,        cls: "text-amber-600" },
  setback:      { icon: History,      cls: "text-slate-500" },
  intervention: { icon: MessageSquare, cls: "text-sky-600" },
  win:          { icon: CheckCircle2, cls: "text-emerald-600" },
  promise:      { icon: Quote,        cls: "text-violet-600" },
};

function CompanionView({ twin, patient }: { twin: TwinState; patient: Patient }) {
  const rel = buildRelationship(patient, twin);
  const p = rel.persona;
  const lc = rel.lifecycle;

  return (
    <div className="space-y-5">
      {/* Persona header */}
      <Card className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white border-emerald-800">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 text-[26px] font-bold">
            {p.name}
          </div>
          <div className="flex-1">
            <div className="text-[10.5px] font-bold tracking-wider text-white/70 uppercase">Your companion</div>
            <div className="text-[20px] font-bold leading-tight">Meet {p.name}</div>
            <div className="text-[12.5px] text-white/85 mt-0.5">{p.role}.</div>
            <div className="text-[12.5px] text-white/90 mt-2 leading-snug">{p.knownSummary}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10.5px] font-bold tracking-wider text-white/60 uppercase">Together</div>
            <div className="text-[20px] font-bold">{p.knownForLabel}</div>
          </div>
        </div>
        <div className="mt-3 bg-white/10 border border-white/15 rounded-lg p-2.5 text-[12px] text-white/90 leading-snug">
          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-300" />{p.promise}
        </div>
      </Card>

      {/* Memory + coach handoff */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardTitle title={`${p.name} remembers`} subtitle="Your shared history — the wins, the setbacks, the promises" action={<Badge color="navy"><History className="w-3 h-3 mr-1" />memory</Badge>} />
          <div className="space-y-3">
            {rel.memory.map((mem, i) => {
              const st = MEMORY_STYLE[mem.kind];
              const Icon = st.icon;
              const last = i === rel.memory.length - 1;
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-lilly-line flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${st.cls}`} />
                    </div>
                    {!last && <div className="w-px flex-1 bg-lilly-line mt-1" />}
                  </div>
                  <div className={last ? "" : "pb-1"}>
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-bold text-lilly-navy">{mem.text}</span>
                    </div>
                    <div className="text-[10.5px] text-lilly-grey">{mem.dateLabel} · week {mem.week}</div>
                    <div className="text-[11.5px] text-emerald-800 italic mt-1 bg-emerald-50 rounded px-2 py-1 inline-block">
                      {p.name}: "{mem.nuNote}"
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardTitle title="Coach handoff" subtitle="How the relationship was transferred" action={<Badge color="green"><MessageSquare className="w-3 h-3 mr-1" />handoff</Badge>} />
          <div className="bg-lilly-mist rounded-lg p-2.5 mb-3">
            <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase">Status</div>
            <div className="text-[12.5px] font-bold text-lilly-navy mt-0.5">{rel.handoff.statusLabel}</div>
          </div>
          <div className="text-[12px] text-lilly-navy leading-snug italic border-l-2 border-emerald-400 pl-2.5 mb-3">
            {rel.handoff.intro}
          </div>
          <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase mb-1.5">What {p.name} carries forward</div>
          <ul className="space-y-1">
            {rel.handoff.carries.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-lilly-navy">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />{c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Escalation ladder + lifecycle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardTitle title="When Nu brings in a human" subtitle="The escalation ladder — what keeps this trustworthy" />
          <div className="space-y-2">
            {rel.escalation.map((t, i) => {
              const tone = t.tone === "alert" ? "border-l-rose-400 bg-rose-50" : t.tone === "watch" ? "border-l-amber-400 bg-amber-50" : "border-l-emerald-400 bg-emerald-50";
              return (
                <div key={i} className={`border-l-4 ${tone} rounded-r-lg p-2.5`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-lilly-navy">{t.tier}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-lilly-grey">{t.handledBy}</span>
                  </div>
                  <div className="text-[11px] text-lilly-grey leading-snug mt-0.5">{t.scope}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between mb-3 gap-3">
            <div>
              <div className="text-sm font-bold text-lilly-navy">Lifecycle — and life after the program</div>
              <div className="text-[12px] text-lilly-grey mt-0.5">The twin's job widens; it doesn't end.</div>
            </div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              {lc.stageLabel}
            </span>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-lg p-3 mb-3">
            <div className="text-[13.5px] font-bold text-lilly-navy">{lc.stageHeadline}</div>
            <div className="text-[12px] text-lilly-grey mt-1 leading-snug">{lc.stageBody}</div>
            <div className="text-[11.5px] text-emerald-800 font-semibold mt-1.5">{lc.nextHorizon}</div>
          </div>
          <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase mb-2">Beyond GLP-1 — where {p.name} goes next</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {lc.beyondGlp1.map((b, i) => {
              const badge = b.status === "active" ? "bg-emerald-100 text-emerald-700" : b.status === "next" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
              const label = b.status === "active" ? "Active now" : b.status === "next" ? "Up next" : "Later";
              return (
                <div key={i} className="border border-lilly-line rounded-lg p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-bold text-lilly-navy">{b.area}</span>
                    <span className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${badge}`}>{label}</span>
                  </div>
                  <div className="text-[11px] text-lilly-grey leading-snug mt-0.5">{b.detail}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="text-center text-[11.5px] text-lilly-grey pt-1">
        {p.name} stays with you — through the program and long after it.
      </div>
    </div>
  );
}
