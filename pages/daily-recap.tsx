import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import { COACHES, dailyRecap, RecapTimelineEvent } from "../lib/coachIntelligence";
import {
  Sparkles, Sun, Calendar, AlertTriangle, CheckCircle2,
  Phone, MessageSquare, ArrowUpRight, Trophy, Clock, Mic2,
  ChevronRight, FileText,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from "recharts";

/**
 * Daily Recap — Coach's end-of-day debrief
 *
 * One page the coach opens at 5pm. AI-synthesized narrative at the top, then
 * what got done, what worked, and where to start tomorrow. The Sandy R.
 * physician-escalation storyline is the headline of the day.
 */

const TIMELINE_ICON: Record<RecapTimelineEvent["type"], { Icon: typeof Sparkles; color: string; bg: string }> = {
  escalation: { Icon: AlertTriangle, color: "text-lilly-red",      bg: "bg-lilly-red/10" },
  session:    { Icon: Mic2,          color: "text-violet-600",     bg: "bg-violet-100" },
  outreach:   { Icon: MessageSquare, color: "text-sky-600",        bg: "bg-sky-100" },
  response:   { Icon: ArrowUpRight,  color: "text-emerald-600",    bg: "bg-emerald-100" },
  milestone:  { Icon: Trophy,        color: "text-amber-600",      bg: "bg-amber-100" },
};

const MOOD_META = {
  positive:   { label: "Positive",   color: "#10B981" },
  neutral:    { label: "Neutral",    color: "#94A3B8" },
  ambivalent: { label: "Ambivalent", color: "#F59E0B" },
  frustrated: { label: "Frustrated", color: "#DC2626" },
};

export default function DailyRecap() {
  const [coachId, setCoachId] = useState<string>(COACHES[0].id);
  const recap = useMemo(() => dailyRecap(coachId), [coachId]);
  const coach = recap.coach;

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Coach · End-of-Day Recap"
        title="Today's recap, written for you"
        subtitle="AI-synthesized end-of-day summary across your caseload — outreach activity, member responses, escalations, and tomorrow's focus. Generated in seconds; ready to file."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={coachId}
              onChange={e => setCoachId(e.target.value)}
              className="text-sm font-semibold text-lilly-navy bg-white border border-lilly-line rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lilly-red/30"
            >
              {COACHES.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.specialty}</option>
              ))}
            </select>
            <button className="text-sm font-semibold text-white bg-lilly-red px-3.5 py-2 rounded-lg hover:bg-lilly-redDark flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> File recap
            </button>
          </div>
        }
      />

      {/* ===== Date + coach banner ===== */}
      <div className="px-8 mb-5">
        <div className="flex items-center gap-3 text-[13px] text-lilly-grey">
          <Calendar className="w-4 h-4" />
          <span className="font-semibold text-lilly-navy">{recap.date}</span>
          <span className="text-lilly-line">·</span>
          <span>{coach.name}</span>
          <span className="text-lilly-line">·</span>
          <span>Caseload {coach.caseload}</span>
          <span className="text-lilly-line">·</span>
          <span>Effectiveness score <b className="text-lilly-navy">{coach.effectivenessScore}</b></span>
        </div>
      </div>

      {/* ===== AI narrative card (the headline of the page) ===== */}
      <div className="px-8 mb-7">
        <Card className="bg-gradient-to-br from-lilly-redLight via-white to-violet-50 border-lilly-red/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lilly-red to-violet-600 text-white flex items-center justify-center shrink-0 shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-[10.5px] font-bold tracking-wider text-lilly-redDark uppercase">AI Debrief · auto-generated</div>
                <Badge color="amber">draft</Badge>
              </div>
              <p className="text-[16px] leading-relaxed text-lilly-navy font-medium">
                {recap.narrative}
              </p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-lilly-red/15">
                <button className="text-[12px] font-semibold text-lilly-red hover:underline">Regenerate</button>
                <span className="text-lilly-line">·</span>
                <button className="text-[12px] font-semibold text-lilly-grey hover:underline">Edit</button>
                <span className="text-lilly-line">·</span>
                <button className="text-[12px] font-semibold text-lilly-grey hover:underline">Share to supervisor</button>
                <span className="ml-auto text-[11px] text-lilly-grey">
                  Synthesized from 9 events, 3 sessions, 14 outreach signals
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== KPI tiles ===== */}
      <div className="px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatTile
          eyebrow="Members reached"
          value={recap.stats.membersReached}
          sub="Today"
          icon={<MessageSquare className="w-4 h-4 text-sky-600" />}
          accent="bg-sky-100"
        />
        <StatTile
          eyebrow="Sessions completed"
          value={recap.stats.sessionsCompleted}
          sub="Avg 23 min"
          icon={<Mic2 className="w-4 h-4 text-violet-600" />}
          accent="bg-violet-100"
        />
        <StatTile
          eyebrow="Critical escalations"
          value={recap.stats.criticalEscalations}
          sub="Routed to clinical team"
          icon={<AlertTriangle className="w-4 h-4 text-lilly-red" />}
          accent="bg-lilly-redLight"
          danger
        />
        <StatTile
          eyebrow="Tomorrow's priorities"
          value={recap.stats.tomorrowPriorities}
          sub="Queued for 8am"
          icon={<Sun className="w-4 h-4 text-amber-600" />}
          accent="bg-amber-100"
        />
      </div>

      {/* ===== Timeline + Wins ===== */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        {/* Timeline */}
        <Card className="lg:col-span-2">
          <CardTitle title="Today's activity" subtitle={`Chronological — ${recap.timeline.length} meaningful moments`} action={<Badge color="slate">live</Badge>} />
          <ol className="relative ml-2 mt-2 border-l-2 border-lilly-line space-y-3">
            {recap.timeline.map((ev, i) => {
              const meta = TIMELINE_ICON[ev.type];
              return (
                <li key={i} className="ml-4 relative">
                  <span className={`absolute -left-[26px] top-1 w-7 h-7 rounded-full ${meta.bg} flex items-center justify-center`}>
                    <meta.Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[11.5px] font-mono font-semibold text-lilly-grey w-16 shrink-0">{ev.time}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-lilly-navy">{ev.title}</span>
                        {ev.memberName && (
                          <span className="text-[11px] font-semibold text-lilly-red bg-lilly-redLight/70 px-1.5 py-0.5 rounded-md">
                            {ev.memberName}
                          </span>
                        )}
                      </div>
                      <div className="text-[12.5px] text-lilly-grey mt-0.5">{ev.detail}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* Wins */}
        <Card className="bg-gradient-to-br from-emerald-50 via-white to-white border-emerald-200">
          <CardTitle title="Wins" subtitle="Worth noticing" action={<Trophy className="w-4 h-4 text-amber-500" />} />
          <ul className="space-y-3 mt-1">
            {recap.wins.map((w, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-lilly-navy leading-snug">{w.title}</div>
                  <div className="text-[11.5px] text-lilly-grey mt-0.5">{w.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* ===== Tomorrow's focus + caseload mood ===== */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tomorrow */}
        <Card className="lg:col-span-2">
          <CardTitle
            title="Tomorrow's focus"
            subtitle="Top members to start with — ranked by escalation context"
            action={<Sun className="w-4 h-4 text-amber-500" />}
          />
          <ul className="space-y-2.5 mt-2">
            {recap.tomorrow.map(t => (
              <li
                key={t.patient.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-lilly-line hover:border-lilly-red/40 hover:bg-lilly-redLight/30 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-lilly-navy text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                  {t.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold text-lilly-navy">{t.patient.name}</span>
                    <span className="text-[11px] text-lilly-grey">{t.patient.id} · {t.patient.age}{t.patient.sex} · BMI {t.patient.bmi.toFixed(0)}</span>
                    {t.patient.id === "P100967" && <Badge color="red">today's escalation</Badge>}
                  </div>
                  <div className="text-[12.5px] text-lilly-navy mt-1">{t.rationale}</div>
                  <div className="text-[12px] text-lilly-grey mt-1.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Plan: {t.plannedAction}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-lilly-grey mt-2" />
              </li>
            ))}
          </ul>
        </Card>

        {/* Caseload mood snapshot */}
        <Card>
          <CardTitle title="Caseload mood snapshot" subtitle="End-of-day distribution" />
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={recap.moodSnapshot}
                dataKey="count"
                nameKey="mood"
                innerRadius={48}
                outerRadius={78}
                paddingAngle={2}
              >
                {recap.moodSnapshot.map((s, i) => (
                  <Cell key={i} fill={MOOD_META[s.mood].color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number, _n, p: any) => [`${v} members`, MOOD_META[p.payload.mood as keyof typeof MOOD_META].label]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {recap.moodSnapshot.map(s => (
              <div key={s.mood} className="flex items-center gap-2 text-[11.5px]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: MOOD_META[s.mood].color }} />
                <span className="text-lilly-grey">{MOOD_META[s.mood].label}</span>
                <span className="ml-auto font-bold text-lilly-navy">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Stat tile ---------- */
function StatTile({
  eyebrow, value, sub, icon, accent, danger,
}: {
  eyebrow: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  accent: string;
  danger?: boolean;
}) {
  return (
    <div className="bg-white border border-lilly-line rounded-xl shadow-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-lg ${accent} flex items-center justify-center`}>{icon}</div>
        <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase">{eyebrow}</div>
      </div>
      <div className={`text-[30px] font-bold leading-none mt-1.5 ${danger ? "text-lilly-red" : "text-lilly-navy"}`}>
        {value}
      </div>
      <div className="text-[11px] text-lilly-grey mt-1.5">{sub}</div>
    </div>
  );
}
