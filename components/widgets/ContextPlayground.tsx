import { useMemo, useState, useCallback } from "react";
import {
  WIDGETS,
  WidgetId,
  WidgetEvent,
  DEMO_PATIENTS,
  LILLY_THEME,
  NOVO_THEME,
  HABITNU_THEME,
  HostSurface,
  HostTheme,
} from "../../lib/widgetContract";
import {
  WidgetContext,
  makeContext,
  PartOfDay,
  Weather,
  Calendar,
  Travel,
  SeverityBand,
  EngagementBand,
  RefillStatus,
  partOfDayFromHour,
  isDND,
} from "../../lib/widgetContext";
import { scoreAllWidgets, ScoringResult } from "../../lib/widgetSelector";

import BestDayMirrorWidget from "./BestDayMirrorWidget";
import SideEffectCheckinWidget from "./SideEffectCheckinWidget";
import EngagementNudgeWidget from "./EngagementNudgeWidget";
import RefillFrictionWidget from "./RefillFrictionWidget";
import GlucoseSpikeWidget from "./GlucoseSpikeWidget";

// -----------------------------------------------------------------------------
// Context Playground — set signals on the left, see Fathom pick the winner
// in the middle, inspect the ranked scoring on the right.
// -----------------------------------------------------------------------------

export default function ContextPlayground({
  host,
  theme,
  onEvent,
}: {
  host: HostSurface;
  theme: HostTheme;
  onEvent: (e: WidgetEvent) => void;
}) {
  const [patientId, setPatientId] = useState("sarah-reeves");
  const [hour, setHour] = useState(9);
  const [dayOfWeek, setDayOfWeek] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(1);
  const [travel, setTravel] = useState<Travel>("home");
  const [weather, setWeather] = useState<Weather>("cloudy");
  const [calendar, setCalendar] = useState<Calendar>("free");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<SeverityBand>("none");
  const [tir, setTir] = useState(78);
  const [nhi, setNhi] = useState(7.2);
  const [glucosePeak, setGlucosePeak] = useState(140);
  const [daysSinceLog, setDaysSinceLog] = useState(0);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [engagement, setEngagement] = useState<EngagementBand>("engaged");
  const [medDays, setMedDays] = useState(21);
  const [refillStatus, setRefillStatus] = useState<RefillStatus>("on-track");
  const [paStatus, setPaStatus] = useState<"not-required" | "approved" | "pending" | "denied">("approved");
  const [bestPathShownDaysAgo, setBestPathShownDaysAgo] = useState(8);
  const [coachTouchedHoursAgo, setCoachTouchedHoursAgo] = useState(26);

  const patient = DEMO_PATIENTS[patientId];

  const ctx: WidgetContext = useMemo(() => makeContext(patient, {
    time: {
      localHour: hour,
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      partOfDay: partOfDayFromHour(hour),
      isDND: isDND(hour),
    },
    environment: { travel, weather, calendar, tempF: 68 },
    clinical: {
      activeSymptoms: symptoms,
      severityBand: severity,
      lastTIR: tir,
      nuHealthIndex: nhi,
      lastGlucosePeak: glucosePeak,
      hoursSinceLastSpike: glucosePeak >= 160 ? 2 : undefined,
    },
    behavioral: {
      daysSinceLastLog: daysSinceLog,
      lastMood: mood,
      engagementBand: engagement,
      driftDetected: daysSinceLog >= 5,
      streakDays: engagement === "engaged" ? 12 : 0,
    },
    access: {
      daysMedicationLeft: medDays,
      refillStatus,
      priorAuthStatus: paStatus,
      couponEligible: true,
    },
    session: {
      widgetsShownToday: [],
      dismissedInLast7Days: [],
      lastBestPathShownDaysAgo: bestPathShownDaysAgo,
      lastCoachTouchHoursAgo: coachTouchedHoursAgo,
    },
  }), [
    patient, hour, dayOfWeek, travel, weather, calendar, symptoms, severity, tir, nhi,
    glucosePeak, daysSinceLog, mood, engagement, medDays, refillStatus, paStatus,
    bestPathShownDaysAgo, coachTouchedHoursAgo,
  ]);

  const ranked = useMemo(() => scoreAllWidgets(ctx), [ctx]);
  const winner = ranked.find(r => r.score > 0);

  const winnerProps = { host, theme, patient, onEvent };
  const renderWinner = useCallback(() => {
    if (!winner) return null;
    switch (winner.widgetId) {
      case "best-day-mirror":     return <BestDayMirrorWidget {...winnerProps} />;
      case "side-effect-checkin": return <SideEffectCheckinWidget {...winnerProps} />;
      case "engagement-nudge":    return <EngagementNudgeWidget {...winnerProps} />;
      case "refill-friction":     return <RefillFrictionWidget {...winnerProps} />;
      case "glucose-spike":       return <GlucoseSpikeWidget {...winnerProps} />;
    }
  }, [winner, winnerProps]);

  const preset = (name: string, apply: () => void) => (
    <button
      onClick={apply}
      className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
    >
      {name}
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_360px] gap-6">
      {/* LEFT — signal controls */}
      <aside className="space-y-3">
        <Section label="Presets">
          <div className="flex flex-wrap gap-1.5">
            {preset("Fresh Monday AM", () => {
              setHour(8); setDayOfWeek(1); setTir(82); setNhi(7.8); setSymptoms([]); setSeverity("none");
              setDaysSinceLog(0); setEngagement("engaged"); setGlucosePeak(140); setBestPathShownDaysAgo(8);
            })}
            {preset("Rough nausea day", () => {
              setHour(10); setSymptoms(["nausea", "fatigue"]); setSeverity("moderate"); setTir(64); setNhi(4.5);
            })}
            {preset("Post-lunch spike", () => {
              setHour(14); setGlucosePeak(214); setSymptoms([]); setSeverity("none");
            })}
            {preset("9 days silent", () => {
              setHour(12); setDaysSinceLog(9); setEngagement("silent"); setMood(2); setSymptoms([]);
            })}
            {preset("Refill critical", () => {
              setMedDays(3); setRefillStatus("blocked"); setPaStatus("pending"); setHour(11);
            })}
            {preset("DND hours", () => setHour(23))}
          </div>
        </Section>

        <Section label="Patient">
          <select
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            className="w-full text-[12px] font-black text-slate-800 border border-slate-200 rounded-md px-2 py-1.5 bg-white"
          >
            {Object.values(DEMO_PATIENTS).map(p => (
              <option key={p.patientId} value={p.patientId}>{p.firstName} · {p.medication?.name} · week {p.medication?.week}</option>
            ))}
          </select>
        </Section>

        <Section label="Time">
          <Row label={`Hour: ${hour.toString().padStart(2, "0")}:00 · ${partOfDayFromHour(hour)}${isDND(hour) ? " · DND" : ""}`}>
            <input type="range" min={0} max={23} value={hour} onChange={e => setHour(+e.target.value)} className="w-full" />
          </Row>
          <Row label={`Day: ${DAYS[dayOfWeek]}`}>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((d, i) => (
                <button key={d}
                  onClick={() => setDayOfWeek(i as any)}
                  className={"text-[10px] font-black py-1 rounded " + (i === dayOfWeek ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
                >
                  {d[0]}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        <Section label="Environment">
          <Row label={`Travel: ${travel}`}>
            <SegPicker value={travel} options={["home", "traveling", "airport", "hotel"] as Travel[]} onChange={setTravel} />
          </Row>
          <Row label={`Weather: ${weather}`}>
            <SegPicker value={weather} options={["sunny", "cloudy", "rainy", "cold", "hot", "snow"] as Weather[]} onChange={setWeather} />
          </Row>
          <Row label={`Calendar: ${calendar}`}>
            <SegPicker value={calendar} options={["free", "busy", "meeting", "commuting"] as Calendar[]} onChange={setCalendar} />
          </Row>
        </Section>

        <Section label="Clinical">
          <Row label="Active symptoms">
            <div className="flex flex-wrap gap-1">
              {["nausea", "fatigue", "constipation", "heartburn", "bloating", "dizziness"].map(s => {
                const on = symptoms.includes(s);
                return (
                  <button key={s}
                    onClick={() => setSymptoms(prev => on ? prev.filter(x => x !== s) : [...prev, s])}
                    className={"text-[10px] font-black px-2 py-1 rounded-full border " + (on ? "bg-rose-100 text-rose-800 border-rose-300" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Row>
          <Row label={`Severity: ${severity}`}>
            <SegPicker value={severity} options={["none", "mild", "moderate", "severe"] as SeverityBand[]} onChange={setSeverity} />
          </Row>
          <Row label={`TIR: ${tir}%`}>
            <input type="range" min={40} max={100} value={tir} onChange={e => setTir(+e.target.value)} className="w-full" />
          </Row>
          <Row label={`NHI: ${nhi.toFixed(1)} / 10`}>
            <input type="range" min={0} max={10} step={0.1} value={nhi} onChange={e => setNhi(+e.target.value)} className="w-full" />
          </Row>
          <Row label={`Last glucose peak: ${glucosePeak} mg/dL`}>
            <input type="range" min={90} max={260} value={glucosePeak} onChange={e => setGlucosePeak(+e.target.value)} className="w-full" />
          </Row>
        </Section>

        <Section label="Behavioral">
          <Row label={`Days since last log: ${daysSinceLog}`}>
            <input type="range" min={0} max={30} value={daysSinceLog} onChange={e => setDaysSinceLog(+e.target.value)} className="w-full" />
          </Row>
          <Row label={`Last mood: ${mood}/5`}>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map(v => (
                <button key={v} onClick={() => setMood(v as any)}
                  className={"text-[11px] font-black py-1 rounded " + (v === mood ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                  {v}
                </button>
              ))}
            </div>
          </Row>
          <Row label={`Engagement: ${engagement}`}>
            <SegPicker value={engagement} options={["engaged", "steady", "drifting", "silent"] as EngagementBand[]} onChange={setEngagement} />
          </Row>
        </Section>

        <Section label="Access">
          <Row label={`Days of medication left: ${medDays}`}>
            <input type="range" min={0} max={45} value={medDays} onChange={e => setMedDays(+e.target.value)} className="w-full" />
          </Row>
          <Row label={`Refill: ${refillStatus}`}>
            <SegPicker value={refillStatus} options={["on-track", "warning", "pending", "blocked"] as RefillStatus[]} onChange={setRefillStatus} />
          </Row>
          <Row label={`PA: ${paStatus}`}>
            <SegPicker value={paStatus} options={["approved", "pending", "denied", "not-required"] as any} onChange={setPaStatus as any} />
          </Row>
        </Section>

        <Section label="Session state">
          <Row label={`Best Path shown ${bestPathShownDaysAgo}d ago`}>
            <input type="range" min={0} max={14} value={bestPathShownDaysAgo} onChange={e => setBestPathShownDaysAgo(+e.target.value)} className="w-full" />
          </Row>
          <Row label={`Coach touched ${coachTouchedHoursAgo}h ago`}>
            <input type="range" min={0} max={72} value={coachTouchedHoursAgo} onChange={e => setCoachTouchedHoursAgo(+e.target.value)} className="w-full" />
          </Row>
        </Section>
      </aside>

      {/* CENTER — winning widget */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
              Fathom's pick · scored {ranked.length} candidates
            </div>
            <div className="text-[22px] font-black text-slate-900 leading-tight mt-1">
              {winner
                ? WIDGETS.find(w => w.id === winner.widgetId)!.name
                : "No widget qualifies right now"}
            </div>
            {winner && (
              <div className="text-[13px] text-slate-600 font-medium">
                Score {winner.score} · variant <span className="font-black text-indigo-700">{winner.variant}</span>
              </div>
            )}
          </div>
        </div>

        {winner ? (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="mx-auto" style={{ maxWidth: 460 }}>
              <div className="rounded-t-[36px] pt-3 pb-1 flex items-center justify-center" style={{ background: theme.primary }}>
                <span className="w-16 h-1 rounded-full bg-white/40" />
              </div>
              <div className="px-3 py-3 flex items-center justify-between bg-white border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg grid place-items-center text-white font-black text-[11px]" style={{ background: theme.primary }}>
                    {theme === LILLY_THEME ? "L" : theme === NOVO_THEME ? "N" : "H"}
                  </span>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {theme === LILLY_THEME ? "Lilly Health" : theme === NOVO_THEME ? "Novo Companion" : "Habitnu"}
                    </div>
                    <div className="text-[13px] font-black text-slate-900 leading-none">My Program</div>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Host: {host}</div>
              </div>
              <div className="px-4 pt-4 pb-2 bg-slate-50/60 text-[10px] font-black uppercase tracking-widest text-slate-500">
                ↓ Widget slot ↓
              </div>
              <div className="px-4 pb-6 bg-slate-50/60">
                <div className="rounded-xl border-2 border-dashed border-indigo-200 p-1">
                  {renderWinner()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 mb-2">No widget qualifies</div>
            <div className="text-[15px] font-black text-slate-900 mb-1">Fathom stays quiet.</div>
            <div className="text-[13px] text-slate-600 font-medium max-w-md mx-auto">
              Every widget was blocked by a guardrail (DND, dedupe, symptom guard, cadence cap, etc.). See the right pane for details.
            </div>
          </div>
        )}
      </section>

      {/* RIGHT — ranked candidates */}
      <aside className="space-y-3">
        <Section label={`Ranked candidates · ${ranked.length} scored`}>
          <div className="space-y-2">
            {ranked.map((r, i) => (
              <CandidateCard key={r.widgetId} result={r} rank={i + 1} isWinner={r === winner} />
            ))}
          </div>
        </Section>
      </aside>
    </div>
  );
}

// -----------------------------------------------------------------------------

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-2">{label}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      {children}
    </div>
  );
}

function SegPicker<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(o => (
        <button key={o}
          onClick={() => onChange(o)}
          className={"text-[10px] font-black px-2 py-1 rounded-md border " + (o === value ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function CandidateCard({ result, rank, isWinner }: { result: ScoringResult; rank: number; isWinner: boolean }) {
  const w = WIDGETS.find(x => x.id === result.widgetId)!;
  const eligible = result.score > 0;
  return (
    <div className={"rounded-xl border p-3 " + (isWinner ? "border-emerald-500 bg-emerald-50 shadow-md" : eligible ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50/70 opacity-70")}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={"w-6 h-6 rounded-full grid place-items-center text-[10px] font-black " + (isWinner ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600")}>
          {rank}
        </span>
        <span className="text-[13px] font-black text-slate-900 flex-1">{w.name}</span>
        <span className={"text-[11px] font-black tabular-nums " + (isWinner ? "text-emerald-700" : eligible ? "text-slate-700" : "text-slate-400")}>
          {result.score}
        </span>
      </div>
      {result.variant !== "default" && (
        <div className="text-[9px] font-black uppercase tracking-widest text-indigo-700 mb-1">variant: {result.variant}</div>
      )}
      {result.reasons.length > 0 && (
        <ul className="space-y-0.5 mb-1">
          {result.reasons.slice(0, 4).map((r, i) => (
            <li key={i} className="text-[10.5px] text-slate-600 font-medium leading-snug">· {r}</li>
          ))}
          {result.reasons.length > 4 && (
            <li className="text-[10px] text-slate-400 italic">+ {result.reasons.length - 4} more</li>
          )}
        </ul>
      )}
      {result.guardrails.length > 0 && (
        <ul className="space-y-0.5 mt-1 pt-1 border-t border-slate-200">
          {result.guardrails.map((g, i) => (
            <li key={i} className="text-[10px] font-black text-rose-700 leading-snug">✕ {g}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
