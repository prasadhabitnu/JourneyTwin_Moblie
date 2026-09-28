import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import { PATIENTS } from "../lib/patientData";
import {
  generateCgmStream, computeAgp, lensInsight,
  computeCgmScore, computeHealthCredits, earnedBadges,
  foodCorrelation, mealResponseCards, patternDetection, weeklyProgress,
  similarDaysForLens, nuSuccessProfiles,
  CgmStream, CgmLens, AnnotationKind, CgmAnnotation,
  MealResponse, FoodCategory, Pattern, Badge as BadgeType,
  SimilarDay, SuccessProfile, RecipeItem,
} from "../lib/cgmData";
import {
  ResponsiveContainer, ComposedChart, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Area, ReferenceLine, ReferenceArea,
} from "recharts";
import {
  Activity, Droplets, Utensils, Syringe, Moon, Sparkles,
  ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown, Info,
  Eye, History, Wand2, ListChecks, ArrowRightCircle,
  Trophy, Flame, Award, Target, Zap, CheckCircle2, Lock,
  BookOpen, Rewind, ThumbsUp, ThumbsDown, ArrowRight,
  Beef, Sprout, ChevronDown, ChevronUp, Play, Lightbulb,
} from "lucide-react";

// ============================================================================
//  CGM Insights — Nu Digital Twin experience
//
//  Layout (mockup-driven):
//    Row 1  →  CGM Score  ·  Time in Range  ·  Health Credits
//    Six-lens strip
//    Row 2  →  24h Timeline (2/3)  |  AI Insights + Pattern Detection (1/3)
//    Row 3  →  Meal Response + Food Correlation (1/2)  |  Weekly Progress + Badges (1/2)
//    Detail →  AGP overlay + 14-day pattern heatmap
//
//  Progression: Visualize → Explain → Predict → Motivate
// ============================================================================

const SELECTOR_IDS = ["P100967", "P100150", "P100210", "P100384", "P100736", "P100003"];

const LENSES: Array<{ id: CgmLens; label: string; icon: any; question: string }> = [
  { id: "default",    label: "Default",    icon: Activity,         question: "How am I doing?" },
  { id: "notices",    label: "Notices",    icon: Eye,              question: "What changed?" },
  { id: "remembers",  label: "Remembers",  icon: History,          question: "What worked before?" },
  { id: "predicts",   label: "Predicts",   icon: Wand2,            question: "What's next?" },
  { id: "recommends", label: "Recommends", icon: ListChecks,       question: "What should I do?" },
  { id: "recovery",   label: "Recovery",   icon: ArrowRightCircle, question: "How do I bounce back?" },
];

const ANNOT_META: Record<AnnotationKind, { icon: any; color: string; bg: string; label: string }> = {
  meal:       { icon: Utensils, color: "text-amber-700",   bg: "bg-amber-100",   label: "Meal" },
  activity:   { icon: Activity, color: "text-emerald-700", bg: "bg-emerald-100", label: "Activity" },
  hydration:  { icon: Droplets, color: "text-sky-700",     bg: "bg-sky-100",     label: "Hydration" },
  medication: { icon: Syringe,  color: "text-violet-700",  bg: "bg-violet-100",  label: "Medication" },
  sleep:      { icon: Moon,     color: "text-indigo-700",  bg: "bg-indigo-100",  label: "Sleep" },
};

const TONE_TO_COLOR = { warn: "#F59E0B", good: "#10B981", info: "#7C3AED" };

const toHour = (t: number) => {
  const d = new Date(t);
  return d.getHours() + d.getMinutes() / 60;
};
const fmtHour = (h: number) => {
  const hh = Math.floor(h);
  return hh === 0 ? "12a" : hh === 12 ? "12p" : hh < 12 ? `${hh}a` : `${hh - 12}p`;
};

export default function CgmInsightsPage() {
  const [patientId, setPatientId] = useState<string>("P100967");
  const [dayIdx, setDayIdx] = useState<number>(13);
  const [lens, setLens] = useState<CgmLens>("default");
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);
  const [committedProfile, setCommittedProfile] = useState<string | null>(null);

  const patient = useMemo(() => PATIENTS.find(p => p.id === patientId), [patientId]);
  const stream: CgmStream = useMemo(() => generateCgmStream(patientId), [patientId]);
  const day = stream.days[dayIdx];
  const agp = useMemo(() => computeAgp(stream.days), [stream]);
  const insight = useMemo(() => lensInsight(stream, dayIdx, lens), [stream, dayIdx, lens]);

  const cgmScore    = useMemo(() => computeCgmScore(stream), [stream]);
  const credits     = useMemo(() => computeHealthCredits(stream), [stream]);
  const badges      = useMemo(() => earnedBadges(stream), [stream]);
  const foodCorr    = useMemo(() => foodCorrelation(stream), [stream]);
  const meals       = useMemo(() => mealResponseCards(stream, 6), [stream]);
  const patterns    = useMemo(() => patternDetection(stream), [stream]);
  const weekly      = useMemo(() => weeklyProgress(stream), [stream]);
  const similarDays = useMemo(() => similarDaysForLens(stream, dayIdx, lens), [stream, dayIdx, lens]);
  const profiles    = useMemo(() => nuSuccessProfiles(stream), [stream]);

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Continuous Glucose Monitoring · Nu - The Journey Twin"
        title="CGM Insights"
        subtitle="Visualize → Explain → Predict → Motivate. Interactive 14-day glucose story with lifestyle-context attribution, pattern detection, and gamified health credits."
        actions={
          <select
            value={patientId}
            onChange={e => { setPatientId(e.target.value); setDayIdx(13); }}
            className="text-sm font-semibold text-lilly-navy bg-white border border-lilly-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lilly-red/30"
          >
            {SELECTOR_IDS.map(id => {
              const p = PATIENTS.find(x => x.id === id);
              return (
                <option key={id} value={id}>
                  {p ? `${p.name} — ${p.id}` : id}{id === "P100967" ? " · demo hero" : ""}
                </option>
              );
            })}
          </select>
        }
      />

      {/* patient banner */}
      {patient && (
        <div className="px-8 mb-5">
          <div className="flex items-center gap-3 text-[13px] text-lilly-grey">
            <Badge color={patient.rss === "Critical" ? "red" : patient.rss === "High" ? "amber" : "slate"}>
              {patient.rss} risk
            </Badge>
            <span className="font-semibold text-lilly-navy">{patient.name}</span>
            <span className="text-lilly-line">·</span>
            <span>{patient.age}{patient.sex} · BMI {patient.bmi.toFixed(1)}</span>
            <span className="text-lilly-line">·</span>
            <span>HbA1c {patient.hba1c.toFixed(1)}</span>
            <span className="text-lilly-line">·</span>
            <span>Week {patient.weeksOnProgram} on program</span>
          </div>
        </div>
      )}

      {/* ================ ROW 1 — three hero tiles ================ */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <CgmScoreCard score={cgmScore} />
        <TirRingCard stream={stream} />
        <HealthCreditsCard credits={credits} />
      </div>

      {/* ================ Six-lens strip ================ */}
      <div className="px-8 mb-5">
        <div className="bg-white border border-lilly-line rounded-2xl p-1.5 shadow-card flex gap-1 overflow-x-auto">
          {LENSES.map(L => {
            const active = L.id === lens;
            return (
              <button
                key={L.id}
                onClick={() => setLens(L.id)}
                className={`flex-1 min-w-[130px] flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl transition ${
                  active
                    ? "bg-gradient-to-b from-violet-50 to-violet-100 border border-violet-500 text-violet-900 shadow-sm"
                    : "text-lilly-grey hover:bg-lilly-mist/60"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <L.icon className={`w-3.5 h-3.5 ${active ? "text-violet-600" : "text-lilly-grey"}`} />
                  <span className={`text-[10px] font-bold tracking-wider uppercase ${active ? "text-violet-600" : "text-lilly-soft"}`}>
                    {L.label}
                  </span>
                </div>
                <div className={`text-[12.5px] font-bold ${active ? "text-violet-900" : "text-lilly-navy"} leading-tight`}>
                  {L.question}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================ ROW 2 — Timeline (2/3) + AI Insights + Patterns (1/3) ================ */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Left: 24-hour timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardTitle
              title={`24-hour glucose timeline — ${day.date}`}
              subtitle={`${day.readings.length} readings · TIR ${day.timeInRange}% · avg ${day.avg} · range ${day.min}–${day.max}`}
              action={
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDayIdx(Math.max(0, dayIdx - 1))}
                    disabled={dayIdx === 0}
                    className="text-xs font-semibold text-lilly-grey border border-lilly-line rounded px-2 py-1 disabled:opacity-40 hover:bg-lilly-mist"
                  >← prev</button>
                  <button
                    onClick={() => setDayIdx(Math.min(13, dayIdx + 1))}
                    disabled={dayIdx === 13}
                    className="text-xs font-semibold text-lilly-grey border border-lilly-line rounded px-2 py-1 disabled:opacity-40 hover:bg-lilly-mist"
                  >next →</button>
                </div>
              }
            />
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={day.readings.map(r => ({ hour: toHour(r.t), glucose: r.glucose }))}
                margin={{ top: 10, right: 20, left: 0, bottom: 6 }}
              >
                <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" />
                <XAxis dataKey="hour" type="number" domain={[0, 24]}
                  ticks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
                  tickFormatter={fmtHour}
                  tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 260]} ticks={[54, 70, 140, 180, 250]}
                  tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
                <Tooltip labelFormatter={(h: number) => fmtHour(h)} formatter={(v: number) => [`${v} mg/dL`, "glucose"]} />
                <ReferenceArea y1={70} y2={180} fill="#10B981" fillOpacity={0.06} />
                <ReferenceLine y={70}  stroke="#10B981" strokeDasharray="4 4" />
                <ReferenceLine y={180} stroke="#F59E0B" strokeDasharray="4 4" />
                <ReferenceLine y={250} stroke="#DC2626" strokeDasharray="4 4" />
                {day.annotations.map((a, i) => (
                  <ReferenceLine key={i} x={toHour(a.t)} stroke={TONE_TO_COLOR[a.tone]}
                    strokeDasharray="2 3" strokeOpacity={0.7} />
                ))}
                <Line type="monotone" dataKey="glucose" stroke="#1B2A4E" strokeWidth={2}
                  dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>

            {/* Inline annotation chips under the chart */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {day.annotations.map((a, i) => {
                const meta = ANNOT_META[a.kind];
                // timeZone: "UTC" — matches lib/cgmData.ts pinned anchor so SSR + client agree.
                const time = new Date(a.t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
                return (
                  <div key={i} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${meta.bg} text-[11px] font-semibold ${meta.color} border border-white`}>
                    <meta.icon className="w-3 h-3" />
                    <span>{time}</span>
                    <span className="text-lilly-navy font-normal">{a.label}</span>
                    {a.glucoseDelta !== undefined && (
                      <span className={`font-bold ${a.glucoseDelta > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                        {a.glucoseDelta > 0 ? "+" : ""}{a.glucoseDelta}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-[11px] text-lilly-grey flex items-center gap-3">
              <Info className="w-3 h-3" />
              <span>Hover the chart for exact values · dashed verticals mark logged events · shaded band = in-range 70–180</span>
            </div>
          </Card>
        </div>

        {/* Right: AI Insights + Recommendations + Pattern Detection */}
        <div className="space-y-4">
          {/* Lens insight card */}
          <Card className="bg-gradient-to-br from-violet-50 via-white to-white border-violet-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold tracking-wider text-violet-700 uppercase mb-1">
                  Nu Insight · Lens: {lens}
                </div>
                <div className="text-[14px] font-bold text-lilly-navy mb-1.5 leading-snug">{insight.headline}</div>
                <ul className="space-y-1">
                  {insight.bullets.map((b, i) => (
                    <li key={i} className="text-[12px] text-lilly-navy flex items-start gap-1.5">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-violet-500 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Similar Days — case-based learning tied to the active lens */}
          {similarDays.length > 0 && (
            <Card>
              <CardTitle
                title="Similar days"
                subtitle={`${similarDays.length} reference${similarDays.length > 1 ? " days" : " day"} from your history · ${lens} lens`}
                action={<BookOpen className="w-4 h-4 text-violet-600" />}
              />
              <div className="space-y-2 mt-1">
                {similarDays.map(sd => (
                  <SimilarDayRow
                    key={sd.dayIdx}
                    day={sd}
                    onSelect={() => setDayIdx(sd.dayIdx)}
                    isCurrent={sd.dayIdx === dayIdx}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Pattern Detection */}
          <Card>
            <CardTitle
              title="Pattern detection"
              subtitle="Recurring patterns found across 14 days"
              action={<Zap className="w-4 h-4 text-violet-600" />}
            />
            <ul className="space-y-2.5 mt-1">
              {patterns.map(p => <PatternRow key={p.id} p={p} />)}
            </ul>
          </Card>
        </div>
      </div>

      {/* ================ Nu Success Profiles ================ */}
      {profiles.length > 0 && (
        <div className="px-8 mb-6">
          <Card>
            <CardTitle
              title="Nu's Success Profiles"
              subtitle="Repeatable playbooks from your own history. Pick one to run today — Nu suggests small variations to push each higher."
              action={<Sparkles className="w-4 h-4 text-violet-600" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
              {profiles.map(profile => (
                <SuccessProfileCard
                  key={profile.id}
                  profile={profile}
                  isExpanded={expandedProfile === profile.id}
                  isCommitted={committedProfile === profile.id}
                  onToggle={() => setExpandedProfile(expandedProfile === profile.id ? null : profile.id)}
                  onCommit={() => setCommittedProfile(committedProfile === profile.id ? null : profile.id)}
                  onDayClick={(idx) => setDayIdx(idx)}
                  stream={stream}
                />
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ================ ROW 3 — Meal Response + Food Correlation | Weekly Progress + Badges ================ */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Left: Meal Response Cards + Food Correlation */}
        <div className="space-y-4">
          <Card>
            <CardTitle
              title="Recent meal responses"
              subtitle="How each meal moved your glucose"
              action={<Utensils className="w-4 h-4 text-amber-600" />}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
              {meals.map((m, i) => <MealResponseCardView key={i} meal={m} />)}
            </div>
          </Card>

          <Card>
            <CardTitle
              title="Food correlation"
              subtitle="Average glucose response by food type (14-day)"
              action={<TrendingUp className="w-4 h-4 text-amber-600" />}
            />
            <div className="space-y-2 mt-1">
              {foodCorr.map(f => <FoodCorrelationRow key={f.category} f={f} />)}
            </div>
          </Card>
        </div>

        {/* Right: Weekly Progress + Achievement Badges */}
        <div className="space-y-4">
          <Card>
            <CardTitle
              title="Weekly progress"
              subtitle={weekly.weekSummary}
              action={<TrendingUp className="w-4 h-4 text-emerald-600" />}
            />
            <div className="grid grid-cols-3 gap-3 mt-2">
              <WeeklyStatCell label="TIR"       thisWeek={`${weekly.thisWeek.tir}%`}         delta={weekly.delta.tir}  unit="pts" positive={weekly.delta.tir >= 0} />
              <WeeklyStatCell label="Avg gluc." thisWeek={`${weekly.thisWeek.avg}`}          delta={weekly.delta.avg}  unit=" mg/dL" positive={weekly.delta.avg <= 0} />
              <WeeklyStatCell label="Variability" thisWeek={`${weekly.thisWeek.cv}%`}         delta={weekly.delta.cv}   unit="pts" positive={weekly.delta.cv <= 0} />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-semibold text-lilly-grey uppercase tracking-wider mb-1">
                <span>Weekly TIR goal · {weekly.goalTir}%</span>
                <span className="text-lilly-navy font-bold">{weekly.goalProgress}%</span>
              </div>
              <div className="h-2 bg-lilly-mist rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
                  style={{ width: `${weekly.goalProgress}%` }}
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle
              title="Achievement badges"
              subtitle={`${badges.filter(b => b.earned).length} of ${badges.length} unlocked · keep the streak going`}
              action={<Trophy className="w-4 h-4 text-amber-500" />}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2">
              {badges.map(b => <BadgeCard key={b.id} b={b} />)}
            </div>
          </Card>
        </div>
      </div>

      {/* ================ Detail views — AGP + Heatmap ================ */}
      <div className="px-8 mb-5">
        <Card>
          <CardTitle
            title="Ambulatory Glucose Profile (AGP)"
            subtitle="14-day overlay — median (p50) with IQR (p25–p75) and 80% envelope (p10–p90)"
            action={<Badge color="slate">clinician view</Badge>}
          />
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={agp} margin={{ top: 10, right: 20, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" />
              <XAxis dataKey="hour" type="number" domain={[0, 24]}
                ticks={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
                tickFormatter={fmtHour}
                tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 260]} ticks={[54, 70, 140, 180, 250]}
                tick={{ fontSize: 11, fill: "#4A4A4A" }} axisLine={false} tickLine={false} />
              <Tooltip labelFormatter={(h: number) => fmtHour(h)} formatter={(v: number, n) => [`${v} mg/dL`, String(n).toUpperCase()]} />
              <ReferenceArea y1={70} y2={180} fill="#10B981" fillOpacity={0.06} />
              <ReferenceLine y={70}  stroke="#10B981" strokeDasharray="4 4" />
              <ReferenceLine y={180} stroke="#F59E0B" strokeDasharray="4 4" />
              <ReferenceLine y={250} stroke="#DC2626" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="p90" stroke="none" fill="#7C3AED" fillOpacity={0.10} />
              <Area type="monotone" dataKey="p10" stroke="none" fill="#FFFFFF" fillOpacity={1} />
              <Area type="monotone" dataKey="p75" stroke="none" fill="#7C3AED" fillOpacity={0.18} />
              <Area type="monotone" dataKey="p25" stroke="none" fill="#FFFFFF" fillOpacity={1} />
              <Line type="monotone" dataKey="p50" stroke="#5B21B6" strokeWidth={2.5} dot={false} name="Median" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Weekly heatmap */}
      <div className="px-8 mb-2">
        <Card>
          <CardTitle
            title="14-day pattern heatmap"
            subtitle="Click a row to load that day into the timeline above"
            action={<Badge color="slate">interactive</Badge>}
          />
          <div className="mt-3 overflow-x-auto">
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[100px_repeat(24,minmax(0,1fr))] gap-[2px] mb-1">
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="text-[9px] text-lilly-grey font-mono text-center">
                    {h % 3 === 0 ? fmtHour(h) : ""}
                  </div>
                ))}
              </div>
              {stream.days.map((d, dIdx) => (
                <div
                  key={dIdx}
                  className={`grid grid-cols-[100px_repeat(24,minmax(0,1fr))] gap-[2px] mb-[2px] rounded-md cursor-pointer group ${
                    dIdx === dayIdx ? "bg-violet-50 ring-1 ring-violet-400" : "hover:bg-lilly-mist/60"
                  }`}
                  onClick={() => setDayIdx(dIdx)}
                >
                  <div className={`px-2 py-1 text-[11px] font-semibold ${dIdx === dayIdx ? "text-violet-800" : "text-lilly-navy"} flex items-center gap-1`}>
                    <span>{d.date}</span>
                    <span className="text-[9px] text-lilly-grey ml-auto">TIR {d.timeInRange}%</span>
                  </div>
                  {Array.from({ length: 24 }, (_, h) => {
                    const bin = d.readings.slice(h * 4, h * 4 + 4);
                    const avg = bin.length ? bin.reduce((a, r) => a + r.glucose, 0) / bin.length : 0;
                    return (
                      <div
                        key={h}
                        className="h-6 rounded-sm"
                        style={{ background: glucoseToColor(avg) }}
                        title={`${d.date} · ${fmtHour(h)} · avg ${Math.round(avg)} mg/dL`}
                      />
                    );
                  })}
                </div>
              ))}
              <div className="flex items-center gap-2 text-[10px] text-lilly-grey font-semibold mt-3">
                <span>lower</span>
                <div className="flex gap-[2px]">
                  {[55, 65, 75, 100, 130, 160, 180, 210, 240].map(v => (
                    <div key={v} className="w-6 h-3 rounded-sm" style={{ background: glucoseToColor(v) }} />
                  ))}
                </div>
                <span>higher</span>
                <span className="ml-auto flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{background:"#10B981"}}/> in range</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{background:"#F59E0B"}}/> above</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{background:"#DC2626"}}/> very high</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{background:"#7C3AED"}}/> below</span>
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================= Row 1 hero cards ================= */

function CgmScoreCard({ score }: { score: ReturnType<typeof computeCgmScore> }) {
  const trendIcon = score.trend === "up" ? <TrendingUp className="w-3.5 h-3.5" />
                  : score.trend === "down" ? <TrendingDown className="w-3.5 h-3.5" />
                  : <Minus className="w-3.5 h-3.5" />;
  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase">Today's CGM Score</div>
          <div className="text-[10.5px] text-lilly-grey">Nu Journey Twin composite</div>
        </div>
        <div
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: score.bandColor + "22", color: score.bandColor }}
        >
          {trendIcon}
          {score.trend === "flat" ? "steady" : `${score.trendDelta > 0 ? "+" : ""}${score.trendDelta} vs. wk 1`}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <div className="text-[54px] font-bold leading-none" style={{ color: score.bandColor }}>
          {score.score}
        </div>
        <div className="text-[15px] font-bold" style={{ color: score.bandColor }}>{score.bandLabel}</div>
      </div>
      {/* Breakdown bars */}
      <div className="mt-3 space-y-1.5">
        {score.breakdown.map((b, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-[10.5px] font-semibold text-lilly-grey">
              <span>{b.label}</span>
              <span className="text-lilly-navy">{b.contribution} / {b.max}</span>
            </div>
            <div className="h-1 bg-lilly-mist rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(b.contribution / b.max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TirRingCard({ stream }: { stream: CgmStream }) {
  const tir = stream.overall.timeInRange;
  const above = stream.overall.timeAbove;
  const below = stream.overall.timeBelow;
  const conic = `conic-gradient(
    #10B981 0 ${tir * 3.6}deg,
    #F59E0B ${tir * 3.6}deg ${(tir + above) * 3.6}deg,
    #7C3AED ${(tir + above) * 3.6}deg 360deg
  )`;

  return (
    <Card>
      <div className="mb-2">
        <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase">Time in Range</div>
        <div className="text-[10.5px] text-lilly-grey">14-day · target 70–180 mg/dL</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: 116, height: 116 }}>
          <div className="absolute inset-0 rounded-full" style={{ background: conic }} />
          <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
            <div className="text-[26px] font-bold text-emerald-600 leading-none">{tir}%</div>
            <div className="text-[10px] text-lilly-grey uppercase tracking-wider font-semibold mt-0.5">in range</div>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          <RangeBar label="In range (70-180)" pct={tir}   color="#10B981" />
          <RangeBar label="Above (>180)"      pct={above} color="#F59E0B" />
          <RangeBar label="Below (<70)"       pct={below} color="#7C3AED" />
          <div className="text-[10.5px] text-lilly-grey pt-1 border-t border-lilly-line/60 mt-2">
            Avg <b className="text-lilly-navy">{stream.overall.avg}</b> mg/dL ·
            GMI <b className="text-lilly-navy">{stream.overall.gmi}%</b> ·
            CV <b className="text-lilly-navy">{stream.overall.cv}%</b>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RangeBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10.5px] font-semibold">
        <span className="text-lilly-grey">{label}</span>
        <span className="text-lilly-navy">{pct}%</span>
      </div>
      <div className="h-1.5 bg-lilly-mist rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.max(2, pct)}%`, background: color }} />
      </div>
    </div>
  );
}

function HealthCreditsCard({ credits }: { credits: ReturnType<typeof computeHealthCredits> }) {
  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase">Health Credits</div>
          <div className="text-[10.5px] text-lilly-grey">Earn credits by building healthy habits</div>
        </div>
        <div
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: credits.levelColor + "22", color: credits.levelColor }}
        >
          <Award className="w-3.5 h-3.5" />
          {credits.level}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-[36px] font-bold leading-none" style={{ color: credits.levelColor }}>
          {credits.total.toLocaleString()}
        </div>
        <div className="text-[12px] font-semibold text-lilly-grey">credits</div>
        <div className="ml-auto text-[11px] font-semibold text-emerald-700">
          +{credits.weekly} this week
        </div>
      </div>

      {credits.nextLevel && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10.5px] font-semibold text-lilly-grey">
            <span>{credits.toNextLevel} to {credits.nextLevel}</span>
            <span className="text-lilly-navy">{credits.progressPct}%</span>
          </div>
          <div className="h-1.5 bg-lilly-mist rounded-full overflow-hidden mt-1">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${credits.progressPct}%`, background: credits.levelColor }} />
          </div>
        </div>
      )}

      <div className="mt-3 space-y-1">
        {credits.breakdown.slice(0, 4).map((b, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="text-lilly-grey flex-1">{b.source}</span>
            <span className="font-bold text-lilly-navy">+{b.credits}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PatternRow({ p }: { p: Pattern }) {
  const bg = p.tone === "good" ? "bg-emerald-50 border-emerald-200"
           : p.tone === "warn" ? "bg-amber-50 border-amber-200"
                               : "bg-sky-50 border-sky-200";
  const dot = p.tone === "good" ? "bg-emerald-500"
            : p.tone === "warn" ? "bg-amber-500"
                                : "bg-sky-500";
  return (
    <li className={`p-2.5 rounded-lg border ${bg}`}>
      <div className="flex items-start gap-2">
        <span className={`w-2 h-2 rounded-full ${dot} shrink-0 mt-1.5`} />
        <div className="flex-1">
          <div className="text-[12.5px] font-bold text-lilly-navy leading-snug">{p.title}</div>
          <div className="text-[11px] text-lilly-grey mt-0.5 leading-snug">{p.detail}</div>
        </div>
        <Badge color={p.confidence === "high" ? "green" : p.confidence === "medium" ? "amber" : "slate"} size="xs">
          {p.confidence}
        </Badge>
      </div>
    </li>
  );
}

function MealResponseCardView({ meal }: { meal: MealResponse }) {
  const outcomeIcon =
    meal.outcome === "spike" ? <ArrowUpRight className="w-3 h-3 text-amber-600" /> :
    meal.outcome === "drop"  ? <ArrowDownRight className="w-3 h-3 text-emerald-600" /> :
                                <Minus className="w-3 h-3 text-emerald-600" />;
  const tint = meal.tone === "warn" ? "border-amber-200 bg-amber-50/40"
             : meal.tone === "good" ? "border-emerald-200 bg-emerald-50/40"
                                    : "border-lilly-line";
  return (
    <div className={`rounded-lg border ${tint} p-2.5`}>
      <div className="flex items-center gap-1.5 text-[10.5px] text-lilly-grey font-semibold">
        <Utensils className="w-3 h-3" />
        <span>{meal.time}</span>
        <span className="ml-auto flex items-center gap-0.5 text-lilly-navy">
          {outcomeIcon}
          {meal.delta > 0 ? "+" : ""}{meal.delta} mg/dL
        </span>
      </div>
      <div className="text-[12.5px] font-bold text-lilly-navy mt-1 leading-snug">{meal.label}</div>
      <div className="text-[11px] text-lilly-grey mt-1 leading-snug">{meal.attribution}</div>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-lilly-grey font-semibold">
        <span>Peak <b className="text-lilly-navy">{meal.peakGlucose}</b></span>
        <span>Baseline in <b className="text-lilly-navy">{meal.timeToBaseline}m</b></span>
      </div>
    </div>
  );
}

function FoodCorrelationRow({ f }: { f: FoodCategory }) {
  const barColor = f.tone === "warn" ? "#F59E0B" : f.tone === "good" ? "#10B981" : "#7C3AED";
  const barWidth = Math.min(100, (Math.abs(f.avgSpike) / 90) * 100);
  return (
    <div className="border border-lilly-line rounded-lg p-2.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{f.emoji}</span>
        <span className="text-[12.5px] font-bold text-lilly-navy">{f.category}</span>
        <span className="text-[10.5px] text-lilly-grey">· {f.count} meals</span>
        <span className="ml-auto text-[13px] font-bold" style={{ color: barColor }}>
          {f.avgSpike > 0 ? "+" : ""}{f.avgSpike} mg/dL
        </span>
      </div>
      <div className="h-1.5 bg-lilly-mist rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, background: barColor }} />
      </div>
      <div className="mt-1.5 text-[10.5px] text-lilly-grey leading-snug">
        <div>Best: <span className="text-lilly-navy font-semibold">{f.bestExample}</span></div>
        <div>Worst: <span className="text-lilly-navy font-semibold">{f.worstExample}</span></div>
      </div>
    </div>
  );
}

function WeeklyStatCell({ label, thisWeek, delta, unit, positive }:
  { label: string; thisWeek: string; delta: number; unit: string; positive: boolean }) {
  const deltaSymbol = delta > 0 ? "+" : "";
  const arrow = delta === 0 ? <Minus className="w-3 h-3" />
              : positive ? <TrendingUp className="w-3 h-3 text-emerald-600" />
                         : <TrendingDown className="w-3 h-3 text-amber-600" />;
  return (
    <div className="border border-lilly-line rounded-lg p-2.5">
      <div className="text-[10px] font-bold tracking-wider text-lilly-grey uppercase">{label}</div>
      <div className="text-[20px] font-bold text-lilly-navy mt-1 leading-none">{thisWeek}</div>
      <div className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${positive ? "text-emerald-700" : "text-amber-700"}`}>
        {arrow}
        <span>{deltaSymbol}{delta}{unit} vs. last week</span>
      </div>
    </div>
  );
}

function BadgeCard({ b }: { b: BadgeType }) {
  return (
    <div className={`rounded-lg border p-2.5 transition ${
      b.earned
        ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white"
        : "border-lilly-line bg-lilly-mist/40 opacity-70"
    }`}>
      <div className="flex items-start gap-2">
        <div className={`text-2xl leading-none ${b.earned ? "" : "grayscale opacity-60"}`}>{b.emoji}</div>
        <div className="flex-1">
          <div className="text-[11.5px] font-bold text-lilly-navy leading-tight">{b.title}</div>
          <div className="text-[10px] text-lilly-grey mt-0.5 leading-snug">{b.description}</div>
        </div>
        {b.earned
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          : <Lock className="w-3.5 h-3.5 text-lilly-soft shrink-0" />}
      </div>
      {!b.earned && b.progress !== undefined && (
        <div className="mt-1.5">
          <div className="h-1 bg-lilly-mist rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${b.progress}%` }} />
          </div>
          <div className="text-[9.5px] text-lilly-grey mt-0.5">{b.progressLabel}</div>
        </div>
      )}
    </div>
  );
}

function SimilarDayRow({ day, onSelect, isCurrent }: {
  day: SimilarDay;
  onSelect: () => void;
  isCurrent: boolean;
}) {
  const outcomeMeta = {
    positive: { border: "border-emerald-200", bg: "bg-emerald-50/50",  chip: "bg-emerald-100 text-emerald-800",  icon: <ThumbsUp    className="w-3 h-3 text-emerald-700" /> },
    negative: { border: "border-amber-200",   bg: "bg-amber-50/50",    chip: "bg-amber-100 text-amber-800",      icon: <ThumbsDown  className="w-3 h-3 text-amber-700" /> },
    mixed:    { border: "border-sky-200",     bg: "bg-sky-50/50",      chip: "bg-sky-100 text-sky-800",          icon: <Rewind      className="w-3 h-3 text-sky-700" /> },
  } as const;
  const m = outcomeMeta[day.outcome];
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-lg border ${m.border} ${m.bg} p-2.5 transition hover:shadow-sm ${isCurrent ? "ring-2 ring-violet-400" : ""}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${m.chip}`}>
          {m.icon}
          <span>{day.tag}</span>
        </div>
        <span className="text-[11.5px] font-semibold text-lilly-navy">{day.date}</span>
        <span className="text-[10.5px] text-lilly-grey">TIR {day.tir}% · avg {day.avg}</span>
        <ArrowRight className="w-3.5 h-3.5 text-lilly-grey ml-auto" />
      </div>
      <div className="text-[11.5px] text-lilly-grey italic leading-snug mb-1.5">
        <span className="font-semibold text-lilly-navy not-italic">Why this day: </span>
        {day.matchReason}
      </div>
      <div className="text-[12px] font-semibold text-lilly-navy leading-snug mb-1.5">
        {day.keyEvent}
      </div>
      {day.stepsTaken.length > 0 && (
        <div className="mb-1.5">
          <div className="text-[9.5px] font-bold tracking-wider text-emerald-700 uppercase mb-0.5">Steps taken</div>
          <ul className="space-y-0.5">
            {day.stepsTaken.map((s, i) => (
              <li key={i} className="text-[11px] text-lilly-navy flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {day.stepsSkipped && day.stepsSkipped.length > 0 && (
        <div className="mb-1.5">
          <div className="text-[9.5px] font-bold tracking-wider text-amber-700 uppercase mb-0.5">Steps that would have helped</div>
          <ul className="space-y-0.5">
            {day.stepsSkipped.map((s, i) => (
              <li key={i} className="text-[11px] text-lilly-navy flex items-start gap-1.5">
                <span className="w-3 h-3 rounded-full border border-amber-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="text-[11px] text-violet-800 border-l-2 border-violet-400 pl-2 mt-1.5 leading-snug">
        {day.takeaway}
      </div>
    </button>
  );
}

function SuccessProfileCard({ profile, isExpanded, isCommitted, onToggle, onCommit, onDayClick, stream }: {
  profile: SuccessProfile;
  isExpanded: boolean;
  isCommitted: boolean;
  onToggle: () => void;
  onCommit: () => void;
  onDayClick: (idx: number) => void;
  stream: CgmStream;
}) {
  const iconFor = (icon: RecipeItem["icon"]) => {
    switch (icon) {
      case "walk":      return <Activity className="w-3.5 h-3.5 text-emerald-700" />;
      case "food":      return <Utensils className="w-3.5 h-3.5 text-amber-700" />;
      case "water":     return <Droplets className="w-3.5 h-3.5 text-sky-700" />;
      case "protein":   return <Beef className="w-3.5 h-3.5 text-rose-700" />;
      case "fiber":     return <Sprout className="w-3.5 h-3.5 text-emerald-700" />;
      case "portion":   return <Utensils className="w-3.5 h-3.5 text-amber-700" />;
      case "injection": return <Syringe className="w-3.5 h-3.5 text-violet-700" />;
    }
  };
  const toneChip = profile.nuEnhancement.tone === "small-tweak" ? "bg-emerald-100 text-emerald-800"
                : profile.nuEnhancement.tone === "swap"         ? "bg-sky-100 text-sky-800"
                                                                : "bg-violet-100 text-violet-800";
  const toneLabel = profile.nuEnhancement.tone === "small-tweak" ? "Small tweak"
                  : profile.nuEnhancement.tone === "swap"        ? "Swap"
                                                                 : "Meaningful add";
  return (
    <div className={`rounded-xl border p-3 transition ${
      isCommitted
        ? "border-violet-400 bg-gradient-to-br from-violet-50 to-white ring-2 ring-violet-300"
        : "border-lilly-line bg-white hover:border-violet-200"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="text-2xl leading-none">{profile.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[13.5px] font-bold text-lilly-navy leading-tight">{profile.name}</div>
            {isCommitted && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                committed today
              </span>
            )}
          </div>
          <div className="text-[11px] text-lilly-grey mt-0.5 leading-snug">{profile.tagline}</div>
        </div>
        <button
          onClick={onToggle}
          className="w-6 h-6 rounded-full bg-lilly-mist text-lilly-grey hover:bg-lilly-mist/80 flex items-center justify-center shrink-0"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Outcome + Signature */}
      <div className="flex items-center gap-3 mt-3 text-[11px]">
        <div className="flex items-center gap-1 text-emerald-700 font-bold">
          <Trophy className="w-3.5 h-3.5" />
          {profile.avgTir}% TIR avg
        </div>
        <div className="text-lilly-grey">·</div>
        <div className="text-lilly-grey">
          <span className="font-semibold text-lilly-navy">{profile.matchingDayIndices.length} matching days</span>
        </div>
      </div>

      {/* Recipe */}
      <div className="mt-3 space-y-1.5">
        {profile.recipe.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-[11.5px] text-lilly-navy">
            <span className="w-5 h-5 rounded-md bg-lilly-mist flex items-center justify-center shrink-0">{iconFor(r.icon)}</span>
            <span>{r.label}</span>
          </div>
        ))}
      </div>

      {/* Signature stat */}
      <div className="mt-3 flex items-center gap-2 text-[11px] p-2 rounded-md bg-emerald-50 border border-emerald-100">
        <Trophy className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        <span className="text-emerald-900 font-semibold">{profile.signatureStat.label}:</span>
        <span className="text-lilly-navy font-bold">{profile.signatureStat.value}</span>
      </div>

      {isExpanded && (
        <>
          {/* Best for */}
          <div className="mt-3 text-[11.5px] text-lilly-navy leading-snug border-l-2 border-lilly-line pl-2.5">
            <span className="font-bold">Best for:</span> {profile.bestFor}
          </div>

          {/* Matching days — clickable to load into timeline */}
          <div className="mt-3">
            <div className="text-[9.5px] font-bold tracking-wider text-lilly-grey uppercase mb-1.5">Matching days · click to view</div>
            <div className="flex flex-wrap gap-1.5">
              {profile.matchingDayIndices.map(idx => {
                const d = stream.days[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => onDayClick(idx)}
                    className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-md px-2 py-1"
                  >
                    <span>{d.date}</span>
                    <span className="text-emerald-600">· {d.timeInRange}%</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nu's enhancement suggestion */}
          <div className="mt-3 rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-2.5">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-violet-700" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Nu suggests</span>
              <span className={`ml-auto text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${toneChip}`}>
                {toneLabel}
              </span>
            </div>
            <div className="text-[12.5px] font-bold text-lilly-navy leading-snug">{profile.nuEnhancement.title}</div>
            <div className="text-[11px] text-lilly-navy mt-1 leading-snug">{profile.nuEnhancement.detail}</div>
            <div className="text-[11px] font-bold text-emerald-700 mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Estimated lift: {profile.nuEnhancement.estimatedLift}
            </div>
          </div>

          {/* Commit button */}
          <button
            onClick={onCommit}
            className={`mt-3 w-full flex items-center justify-center gap-1.5 text-[12px] font-bold py-2 rounded-lg transition ${
              isCommitted
                ? "bg-violet-100 text-violet-800 border border-violet-400"
                : "bg-lilly-red text-white hover:bg-lilly-redDark"
            }`}
          >
            {isCommitted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isCommitted ? "Committed for today — Nu will nudge you" : "Try this today"}
          </button>
        </>
      )}
    </div>
  );
}

function glucoseToColor(g: number): string {
  if (g < 54)  return "#5B21B6";
  if (g < 70)  return "#7C3AED";
  if (g < 90)  return "#86EFAC";
  if (g < 140) return "#10B981";
  if (g < 180) return "#34D399";
  if (g < 210) return "#FBBF24";
  if (g < 250) return "#F59E0B";
  return "#DC2626";
}
