import { useEffect, useState } from "react";
import ForecastDetailSheet from "../ForecastDetailSheet";
import { useUpdateMe, UpdateMeLog } from "../../../contexts/UpdateMeContext";
import { PILLS, COMPASS_ONLY_PILLS, CaptureModal, Pill, PillKey } from "./UpdateMe";
import StarRating, { starsFromScore } from "../../vitals/StarRating";

// Status matches PPT slide 4 - "On Track" / "Needs Attention" per wedge.
const SEGMENTS = [
  { id: "movement",  label: "Movement",  score: 74, tint: "#DFF3D2", deep: "#7DBB47", status: "on-track" as const },
  { id: "nutrition", label: "Nutrition", score: 68, tint: "#FFE9C7", deep: "#F59E0B", status: "on-track" as const },
  { id: "glucose",   label: "Glucose",   score: 62, tint: "#D9E1FF", deep: "#4F5FE5", status: "needs"   as const },
  { id: "sleep",     label: "Sleep",     score: 82, tint: "#E0DDF7", deep: "#6B5CE0", status: "on-track" as const },
  { id: "stress",    label: "Stress",    score: 60, tint: "#FDD8E3", deep: "#EC4A83", status: "needs"   as const },
  { id: "hydration", label: "Hydration", score: 88, tint: "#CFE8FA", deep: "#38BDF8", status: "on-track" as const },
  { id: "medications", label: "Medications", score: 78, tint: "#FED4CB", deep: "#EF5C3E", status: "on-track" as const },
  { id: "weight",    label: "Weight",    score: 78, tint: "#E7E7F5", deep: "#8B7EE0", status: "on-track" as const },
];

const STATUS_LABEL: Record<string, string> = {
  "on-track": "On Track",
  "needs":    "Needs Attention",
};

// Map a compass wedge id -> the Update Me pill that captures its value.
// Kept in one place so the CTA button, chip, and modal all stay in sync.
const WEDGE_TO_PILL: Record<string, PillKey> = {
  movement:    "activity",
  nutrition:   "food",
  glucose:     "glucose",
  sleep:       "sleep",
  stress:      "stress",
  hydration:   "water",
  medications: "meds",
  weight:      "weight",
};

// CTA button label per wedge - retitles "See Today's Best Path" contextually.
// Glucose is CGM-driven, so instead of logging we surface Nu's reasoning story.
const WEDGE_CTA_LABEL: Record<string, string> = {
  movement:    "Log Activity",
  nutrition:   "Log Meal",
  glucose:     "Show me why",
  sleep:       "Log Sleep",
  stress:      "Log Mood",
  hydration:   "Log Water",
  medications: "Log Meds",
  weight:      "Log Weight",
};

/** Look up the Pill definition for a given wedge id (checks both Update Me pills and Compass-only pills). */
function pillForWedge(wedgeId: string): Pill | null {
  const key = WEDGE_TO_PILL[wedgeId];
  if (!key) return null;
  const all: Pill[] = [...PILLS, ...COMPASS_ONLY_PILLS];
  return all.find(p => p.key === key) ?? null;
}

/** Human-readable display of the logged value for the "You just logged" chip. */
function displayLoggedValue(pillKey: PillKey, log: UpdateMeLog): string {
  const v = log[pillKey];
  if (v === undefined || v === "") return "";
  const pill = [...PILLS, ...COMPASS_ONLY_PILLS].find(p => p.key === pillKey);
  const unit = pill?.unit;
  if (pillKey === "stress") return `${v}/5`;
  if (pillKey === "food" || pillKey === "meds") {
    const s = String(v);
    return s.length > 24 ? s.slice(0, 22) + "…" : s;
  }
  return `${v}${unit ? " " + unit : ""}`.trim();
}

interface Props {
  highlightSweep: boolean;
}

export default function CompassReader({ highlightSweep }: Props) {
  const [active, setActive] = useState(2); // Glucose (idx 2)
  const [drill, setDrill] = useState<"notices" | "remembers" | "story" | null>(null);
  const [openPill, setOpenPill] = useState<Pill | null>(null);
  const { log, setValue } = useUpdateMe();

  useEffect(() => {
    if (!highlightSweep) return;
    let i = 0;
    const seq = [0, 1, 3, 4, 5, 6, 7, 2];
    setActive(seq[0]);
    const id = setInterval(() => {
      i++;
      if (i >= seq.length) { clearInterval(id); return; }
      setActive(seq[i]);
    }, 800);
    return () => clearInterval(id);
  }, [highlightSweep]);

  const seg = SEGMENTS[active];
  const wedgePill = pillForWedge(seg.id);
  const loggedText = wedgePill ? displayLoggedValue(wedgePill.key, log) : "";
  const ctaLabel = WEDGE_CTA_LABEL[seg.id] ?? "Log this";
  const isGlucoseWedge = seg.id === "glucose";
  // Glucose CTA opens the reasoning story; every other wedge opens its Log modal.
  const ctaSubLabel = isGlucoseWedge
    ? "Today's recommendation, explained"
    : (loggedText ? `Logged: ${loggedText}` : "Nu will fold it into your day");
  const ctaEnabled = isGlucoseWedge || !!wedgePill;
  const onCta = () => {
    if (isGlucoseWedge) setDrill("story");
    else if (wedgePill) setOpenPill(wedgePill);
  };

  return (
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div className="flex justify-center">
        <CompassSvg segments={SEGMENTS} active={active} onSelect={setActive} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
            {seg.label} - {seg.score}/100
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
            <StarRating rating={starsFromScore(seg.score)} size={11} gap={1} />
            <span className="text-[10px] font-black tabular-nums text-amber-800">
              {starsFromScore(seg.score).toFixed(1)}
            </span>
          </span>
          {loggedText && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{ background: "#DCFCE7", color: "#047857", border: "1px solid #A7F3D0" }}>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 12 10 18 20 6" />
              </svg>
              You logged: {loggedText}
            </span>
          )}
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">
          {segmentHeadline(seg.id)}
        </h2>
        <p className="text-base text-slate-600 leading-relaxed mb-6">
          {segmentDetail(seg.id)}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <NoticesCard summary={segmentNoticesSummary(seg.id)} onOpen={() => setDrill("notices")} />
          <RemembersCard summary={segmentRemembersSummary(seg.id)} onOpen={() => setDrill("remembers")} />
        </div>

        <NuRecommendsStrip
          items={segmentRecommends(seg.id)}
          ctaLabel={ctaLabel}
          ctaSubLabel={ctaSubLabel}
          onCtaClick={onCta}
          ctaEnabled={ctaEnabled}
        />

        <div className="mt-6 flex items-center gap-6 text-[11px]">
          <Legend color="#10B981" label="Strong" />
          <Legend color="#F59E0B" label="Good" />
          <Legend color="#F87171" label="Needs focus" />
        </div>
      </div>

      {drill === "notices" && (
        <ForecastDetailSheet
          variant="noticed"
          eyebrow="Nu Notices"
          title={`${seg.label} - what Nu tracked`}
          intro={`Everything Nu observed in ${seg.label.toLowerCase()} over the last 14 days.`}
          bullets={segmentNotices(seg.id).map(s => ({ label: s, accent: seg.deep }))}
          footnote="Nu surfaces the top three - tap a wedge and open the drill to see the full pattern."
          onClose={() => setDrill(null)}
        />
      )}

      {drill === "remembers" && (
        <ForecastDetailSheet
          variant="predicts"
          eyebrow="Nu Remembers"
          title={`${seg.label} - long-range patterns`}
          intro={`Historical patterns Nu has learned about your ${seg.label.toLowerCase()}.`}
          bullets={segmentRemembers(seg.id).map(s => ({ label: s, accent: seg.deep }))}
          footnote="These persist across weeks - Nu updates them as new data arrives."
          onClose={() => setDrill(null)}
        />
      )}

      {drill === "story" && (
        <ForecastDetailSheet
          variant="predicts"
          eyebrow="Show me why"
          title="Why Nu picked The Long Walker for today"
          intro="Here's the chain of reasoning behind today's plan. Nu is showing her work - every step is grounded in what she has actually seen in your CGM and daily logs."
          bullets={[
            { label: "1. What Nu saw overnight - your fasting glucose came in at 108 mg/dL, well inside range, but the last 90 minutes drifted up slightly toward 118. Nothing alarming, but it means your morning starts on a small climb rather than flat.", accent: "#4F5FE5" },
            { label: "2. What Nu remembered - your Time-in-Range moved from 71% to 87% across the last 14 days. Every one of those wins was preceded by an evening walk within 30 minutes of dinner. The 6 days you skipped that walk are the 6 days that dragged the average down.", accent: "#4F5FE5" },
            { label: "3. What Nu inferred - a small climb into the morning + a pattern that keeps proving itself = you don't need a new strategy, you need to run the play you already know works. Piling on new habits when the fix is a repeat is what pushes people to quit.", accent: "#4F5FE5" },
            { label: "4. Why The Long Walker today - one 20-minute walk tonight, ideally within 30 minutes of finishing dinner. Nothing else changes. This is your highest-leverage move given today's data and your last 14 days.", accent: "#4F5FE5" },
            { label: "5. What success looks like - Wed Jul 1 was your 99% TIR day. It started with exactly this pattern. Nu's not asking you to be perfect - she's asking you to be Sally on July 1.", accent: "#10B981" },
          ]}
          footnote="Nu re-runs this story every morning using your last 14 days of CGM + Update Me. If your logs change, so does the plan."
          onClose={() => setDrill(null)}
        />
      )}

      {openPill && (
        <CaptureModal
          pill={openPill}
          onCancel={() => setOpenPill(null)}
          onSave={(v) => {
            setValue(openPill.key, v as never);
            setOpenPill(null);
          }}
        />
      )}
    </div>
  );
}

function NoticesCard({ summary, onOpen }: { summary: string; onOpen: () => void }) {
  return (
    <button onClick={onOpen}
            className="w-full text-left rounded-2xl p-5 border border-slate-100 shadow-sm bg-white hover:shadow-md hover:border-indigo-200 transition">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#EEF2FF" }}>
          <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700">Nu Notices</span>
      </div>
      <div className="text-[13px] text-slate-800 font-bold leading-snug mb-2">{summary}</div>
      <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 inline-flex items-center gap-1">
        View all &rarr;
      </div>
    </button>
  );
}

function RemembersCard({ summary, onOpen }: { summary: string; onOpen: () => void }) {
  return (
    <button onClick={onOpen}
            className="w-full text-left rounded-2xl p-5 border border-slate-100 shadow-sm bg-white hover:shadow-md hover:border-indigo-200 transition">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#EEF2FF" }}>
          <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3v1a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-1a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3V6a3 3 0 0 0-3-3z" />
          </svg>
        </span>
        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700">Nu Remembers</span>
      </div>
      <div className="text-[13px] text-slate-800 font-bold leading-snug mb-2">{summary}</div>
      <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 inline-flex items-center gap-1">
        View all &rarr;
      </div>
    </button>
  );
}

function segmentNoticesSummary(id: string): string {
  switch (id) {
    case "movement":    return "3 evening walks in the last 5 days - your longest was 40 minutes on Sunday.";
    case "nutrition":   return "Two higher-carb meals surfaced this week - protein at breakfast is your biggest lever.";
    case "glucose":     return "TIR climbed from 71% to 87% across the two weeks - post-meal peaks dropping.";
    case "sleep":       return "Averaging 7.3 hours; one short 6.5-hour night preceded a rough morning.";
    case "stress":      return "One 5/5 stress day this week - Nu can see it in your afternoon glucose bump.";
    case "hydration":   return "8+ glasses on your best days; Sunday hit 10 - your best hydration day.";
    case "medications": return "2 semaglutide doses missed in 14 days; fasting glucose ran 12 mg/dL higher those mornings.";
    case "weight":      return "Down 7 lbs in 14 days; Monday's 0.8-lb overnight drop was the fastest.";
    default: return "";
  }
}

function segmentRemembersSummary(id: string): string {
  switch (id) {
    case "movement":    return "Your longest week was 5 walks - evening walks work better than morning ones.";
    case "nutrition":   return "20g breakfast protein holds glucose 40 mg/dL lower at 10 AM.";
    case "glucose":     return "Your best glucose day was Wed Jul 1 - 99% TIR after an evening walk.";
    case "sleep":       return "Fasting glucose is 12% lower on nights of 7.5+ hours.";
    case "stress":      return "Two calm days in a row flatten your glucose curves by 30%.";
    case "hydration":   return "Hydrated days show 15% lower glucose variability.";
    case "medications": return "Sunday morning is your dose day; weekly adherence links to +8% TIR the following week.";
    case "weight":      return "Steady 0.5 lb/day trend; TIR predicts your scale better than daily weight does.";
    default: return "";
  }
}


function NuRecommendsStrip({
  items,
  ctaLabel,
  ctaSubLabel,
  onCtaClick,
  ctaEnabled,
}: {
  items: { action: string; why: string }[];
  ctaLabel: string;
  ctaSubLabel: string;
  onCtaClick: () => void;
  ctaEnabled: boolean;
}) {
  const one = items[0];
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-[240px]">
        <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12v3h8v-3a7 7 0 0 0-4-12z" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-0.5">Nu Recommends</div>
          <div className="text-[13px] font-bold text-slate-800 leading-snug">{one?.action}</div>
          {one?.why && <div className="text-[11px] text-slate-500 font-medium mt-0.5">{one.why}</div>}
        </div>
      </div>
      <button
        onClick={onCtaClick}
        disabled={!ctaEnabled}
        className={"flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-black tracking-wide shadow-lg shadow-indigo-200 transition " +
          (ctaEnabled ? "hover:brightness-110" : "opacity-60 cursor-not-allowed")}
        style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}
        title={`Capture ${ctaLabel.replace(/^Log /, "").toLowerCase()} for this wedge`}
      >
        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <div className="text-left leading-tight">
          <div>{ctaLabel}</div>
          <div className="text-[10px] font-black tracking-wider opacity-80 uppercase">{ctaSubLabel}</div>
        </div>
      </button>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="font-bold text-slate-600 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function segmentHeadline(id: string) {
  switch (id) {
    case "movement":  return "Movement is strong.";
    case "nutrition": return "Nutrition can lift this week.";
    case "glucose":   return "Glucose is climbing back.";
    case "sleep":     return "Sleep is where it should be.";
    case "stress":    return "Stress needs a look.";
    case "hydration": return "Hydration is strong.";
    case "medications": return "Two doses missed. Worth a look.";
    case "weight":    return "Weight is trending down.";
    default: return "";
  }
}

function segmentDetail(id: string) {
  switch (id) {
    case "movement":  return "You've built a rhythm. The evening walk is doing more than any other habit right now.";
    case "nutrition": return "Two higher-carb meals are the only weak spots. Protein at breakfast is the single biggest lever.";
    case "glucose":   return "TIR climbed from 71% to 87% across two weeks. The post-meal peaks are getting lower every week.";
    case "sleep":     return "Averaging 7.3 hours the last 7 nights. Fasting glucose is meaningfully lower on the longer nights.";
    case "stress":    return "One high-stress day this week. Nu can see the afternoon glucose bump that came with it.";
    case "hydration": return "Water intake is one of Sally's most consistent habits. That's paying off across the whole day.";
    case "medications": return "Semaglutide 0.5mg weekly plus metformin twice daily. Two semaglutide doses were missed in the last 14 days - both preceded rougher fasting mornings.";
    case "weight":    return "Steady descent. Half a pound a day since starting The Long Walker - sustainable pace.";
    default: return "";
  }
}

function segmentNotices(id: string): string[] {
  switch (id) {
    case "movement":
      return [
        "You walked 3 of your last 5 evenings.",
        "Post-walk glucose stayed under 140 mg/dL every single time.",
        "Sunday's 40-minute walk was your longest this month.",
      ];
    case "nutrition":
      return [
        "Two higher-carb meals showed up this week (Mon lunch, Wed dinner).",
        "Protein at breakfast is your single biggest lever right now.",
        "Half-plate-veggies dinners held glucose flat every time.",
      ];
    case "glucose":
      return [
        "Breakfast caused your biggest glucose spike.",
        "Walking after dinner helped bring you back in range.",
        "You stayed in range most of the day.",
      ];
    case "sleep":
      return [
        "Averaging 7.3 hours the last 7 nights.",
        "Your one short night (Wed, 6.5h) preceded a rough Thursday morning.",
        "Longest stretch this week was Saturday - 8 hours 15 minutes.",
      ];
    case "stress":
      return [
        "Stress hit 5 out of 5 on Wednesday.",
        "Cortisol spikes correlate with your afternoon glucose bumps.",
        "Two calm days followed each stress day - you recover well.",
      ];
    case "hydration":
      return [
        "8+ glasses on your best days.",
        "You drink less on high-stress mornings.",
        "Sunday hit 10 glasses - your best hydration day.",
      ];
    case "medications":
      return [
        "Missed 2 semaglutide doses in the last 14 days (Wed Jun 24 + Sat Jun 27).",
        "Fasting glucose ran 12 mg/dL higher the mornings after each missed dose.",
        "Metformin adherence is 100% - not a single missed pill this month.",
      ];
    case "weight":
      return [
        "Down 7 pounds in 14 days.",
        "8 pounds left to your 170 pound goal.",
        "Fastest drop was Monday - 0.8 lbs overnight.",
      ];
    default: return [];
  }
}

function segmentRemembers(id: string): string[] {
  switch (id) {
    case "movement":
      return [
        "Your longest week was 5 walks - that's the shape we're aiming for.",
        "Days with a walk before dinner had 12% flatter evening curves.",
        "Evening walks work better for you than morning walks.",
      ];
    case "nutrition":
      return [
        "Days that started with 20g protein held glucose 40 mg/dL lower at 10 AM.",
        "Half-plate-veggies dinners kept your peak below 140.",
        "You do best when carbs come last in the meal.",
      ];
    case "glucose":
      return [
        "You usually spike with higher carb breakfasts.",
        "Dinner walks lead to better overnight glucose.",
        "You do best with earlier, lighter dinners.",
      ];
    case "sleep":
      return [
        "Fasting glucose was 12% lower on nights of 7.5 hours or more.",
        "You slept best on days with a walk before 8 PM.",
        "Screens off by 10:30 PM gives you an extra 30 minutes of deep sleep.",
      ];
    case "stress":
      return [
        "Two calming days in a row - your glucose curves look 30% flatter.",
        "Days you journaled had 15% lower glucose variability.",
        "Your Sunday nights predict your Monday cortisol.",
      ];
    case "hydration":
      return [
        "Hydrated days show 15% lower glucose variability.",
        "Your CV was 16% on the day you had 10 glasses.",
        "Water before meals cuts your post-meal peak by 18 mg/dL.",
      ];
    case "medications":
      return [
        "Sunday morning is your dose day - the reminder consistently works.",
        "You started semaglutide 12 weeks ago; nausea passed by week 6.",
        "Nu links weekly dose adherence to 8% higher TIR on the following week.",
      ];
    case "weight":
      return [
        "Steady 0.5 lb/day trend since starting The Long Walker.",
        "Scale moved fastest on weeks you hit both walks + water goals.",
        "TIR predicts your scale better than daily weight does.",
      ];
    default: return [];
  }
}

// -------- SVG compass --------

function CompassSvg({
  segments, active, onSelect,
}: {
  segments: typeof SEGMENTS;
  active: number;
  onSelect: (i: number) => void;
}) {
  const cx = 240;
  const cy = 240;
  const rOuter = 220;
  const rInner = 90;
  const step = (Math.PI * 2) / 8;
  const startAngle = -Math.PI / 2 - step / 2;

  const arcPath = (i: number) => {
    const a0 = startAngle + i * step;
    const a1 = a0 + step;
    const x0 = cx + rOuter * Math.cos(a0);
    const y0 = cy + rOuter * Math.sin(a0);
    const x1 = cx + rOuter * Math.cos(a1);
    const y1 = cy + rOuter * Math.sin(a1);
    const ix0 = cx + rInner * Math.cos(a1);
    const iy0 = cy + rInner * Math.sin(a1);
    const ix1 = cx + rInner * Math.cos(a0);
    const iy1 = cy + rInner * Math.sin(a0);
    return `M ${x0} ${y0} A ${rOuter} ${rOuter} 0 0 1 ${x1} ${y1} L ${ix0} ${iy0} A ${rInner} ${rInner} 0 0 0 ${ix1} ${iy1} Z`;
  };
  // Icons sit closest to the outer edge (so they never collide with the label).
  // Label + status stack vertically in *screen space* right beneath the icon,
  // which keeps the label/status pair readable regardless of wedge angle.
  const iconPos = (i: number) => {
    const a = startAngle + i * step + step / 2;
    const r = rInner + (rOuter - rInner) * 0.78;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const labelPos = (i: number) => {
    const a = startAngle + i * step + step / 2;
    // 32% keeps the label + status pair well clear of the icon on the horizontal
    // wedges (Glucose right, Mindset left) where "Needs Attention" is a wide string.
    const r = rInner + (rOuter - rInner) * 0.32;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  return (
    <svg viewBox="0 0 480 480" width="440" height="440">
      {segments.map((s, i) => {
        const isActive = i === active;
        return (
          <g key={s.id} onClick={() => onSelect(i)} style={{ cursor: "pointer" }}>
            <path d={arcPath(i)}
                  fill={isActive ? s.deep : s.tint}
                  fillOpacity={isActive ? 0.85 : 1}
                  stroke="#FFFFFF" strokeWidth={2} />
            {isActive && (
              <path d={arcPath(i)} fill={s.deep} fillOpacity={0.15}>
                <animate attributeName="fill-opacity" values="0.15;0.35;0.15" dur="2s" repeatCount="indefinite" />
              </path>
            )}
            {(() => {
              const ip = iconPos(i);
              const lp = labelPos(i);
              const statusLabel = STATUS_LABEL[s.status];
              const statusColor = s.status === "needs" ? (isActive ? "#FFE0E0" : "#B91C1C") : (isActive ? "#DCFCE7" : "#047857");
              return (
                <>
                  {/* Icon badge - colored filled circle with icon (near the outer edge of the wedge) */}
                  <circle cx={ip.x} cy={ip.y} r={20}
                          fill={isActive ? "#FFFFFF" : s.deep}
                          stroke={isActive ? s.deep : "#FFFFFF"} strokeWidth={2} />
                  <WedgeIcon id={s.id} cx={ip.x} cy={ip.y} color={isActive ? s.deep : "#FFFFFF"} />
                  {/* Label - centered on the wedge, near the inner hub */}
                  <text x={lp.x} y={lp.y}
                        textAnchor="middle"
                        fill={isActive ? "#FFFFFF" : (s.status === "needs" ? s.deep : "#0F172A")}
                        fontWeight={900}
                        fontSize={13}>
                    {s.label}
                  </text>
                  {/* Status subtitle - stacked directly below the label in screen space */}
                  <text x={lp.x} y={lp.y + 13}
                        textAnchor="middle"
                        fill={statusColor}
                        fontWeight={700}
                        fontSize={8.5}>
                    {statusLabel}
                  </text>
                </>
              );
            })()}
          </g>
        );
      })}
      {/* Center - "Your Health Today" PPT-style */}
      <circle cx={cx} cy={cy} r={rInner} fill="#FFFFFF" stroke="#E5E7EB" strokeWidth={1.5} />
      <circle cx={cx} cy={cy - 12} r={22} fill="#EEF2FF" stroke="#C7D2FE" />
      {/* Nu compass mark: N arrow + circle */}
      <g transform={`translate(${cx} ${cy - 12})`}>
        <path d="M0 -12 L4 6 L0 3 L-4 6 Z" fill="#5B4CE0" />
        <circle cx={0} cy={0} r={2} fill="#5B4CE0" />
      </g>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#0F172A" fontSize={12} fontWeight={900}>Your Health</text>
      <text x={cx} y={cy + 38} textAnchor="middle" fill="#0F172A" fontSize={12} fontWeight={900}>Today</text>
    </svg>
  );
}


// ============================================================================
// Six-lens tabbed pane - collapses Notices + Remembers + Recommends into one
// card with a pill-style tab strip. Reduces visual stack from 2 cards to 1.
// ============================================================================

type LensKey = "notices" | "remembers" | "recommends";

function LensPane({ notices, remembers, recommends, tint }: {
  notices: string[];
  remembers: string[];
  recommends: { action: string; why: string }[];
  tint: string;
}) {
  const [lens, setLens] = useState<LensKey>("notices");
  const tabs: { key: LensKey; label: string; icon: string; count: number }[] = [
    { key: "notices",    label: "Nu Notices",    icon: "EYE",   count: notices.length },
    { key: "remembers",  label: "Nu Remembers",  icon: "BRAIN", count: remembers.length },
    { key: "recommends", label: "Nu Recommends", icon: "BULB",  count: recommends.length },
  ];

  return (
    <div className="rounded-2xl border shadow-sm bg-white overflow-hidden"
         style={{ borderColor: tint + "40" }}>
      <div className="flex items-center gap-1 border-b border-slate-100 px-2 pt-2">
        {tabs.map(t => {
          const active = t.key === lens;
          return (
            <button key={t.key} onClick={() => setLens(t.key)}
                    className={"flex items-center gap-1.5 px-3 py-2 text-[11px] font-black uppercase tracking-wider rounded-t-lg transition " +
                      (active ? "bg-white text-slate-800 border border-b-0 border-slate-100" : "text-slate-500 hover:text-slate-800")}>
              <LensIcon kind={t.icon} color={active ? tint : "#94A3B8"} />
              <span>{t.label}</span>
              <span className={"inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] " +
                (active ? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-500")}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>
      <div className="p-4">
        {lens === "notices" && (
          <ul className="space-y-2">
            {notices.map((n, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-slate-800 leading-snug">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tint }} />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}
        {lens === "remembers" && (
          <ul className="space-y-2">
            {remembers.map((n, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-slate-800 leading-snug">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tint }} />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}
        {lens === "recommends" && (
          <div className="space-y-2">
            {recommends.map((r, i) => (
              <div key={i} className="p-3 rounded-xl border" style={{ borderColor: tint + "40", background: tint + "10" }}>
                <div className="text-[13px] font-black text-slate-900">{r.action}</div>
                <div className="text-[11px] text-slate-600 font-medium mt-0.5">{r.why}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LensIcon({ kind, color }: { kind: string; color: string }) {
  const p = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2.4 as unknown as number, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "EYE")   return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /></svg>;
  if (kind === "BRAIN") return <svg {...p}><path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3v1a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-1a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3V6a3 3 0 0 0-3-3z" /></svg>;
  return <svg {...p}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12v3h8v-3a7 7 0 0 0-4-12z" /></svg>;
}

// One recommendation per wedge.
function segmentRecommends(id: string): { action: string; why: string }[] {
  const M: Record<string, { action: string; why: string }[]> = {
    movement:  [
      { action: "Add a 10-min walk after lunch", why: "Your best-movement days averaged 22% higher TIR." },
      { action: "Take stairs whenever possible", why: "Small activity bursts stack up - Nu counts them." },
    ],
    nutrition: [
      { action: "Swap breakfast dosa for eggs + spinach", why: "Your dosa mornings spike 40 mg/dL higher on average." },
      { action: "Fiber before starch at dinner", why: "Order-of-eating cuts your peak by 18 mg/dL." },
    ],
    glucose: [
      { action: "Walk within 30 min of dinner tonight", why: "This is your highest-leverage habit for tomorrow's TIR." },
      { action: "Aim for 87% TIR - your best week", why: "You've hit it before. Nu believes you can hit it again." },
    ],
    sleep: [
      { action: "Screens off by 10:30 PM", why: "Your best glucose mornings follow 7+ hours of sleep." },
      { action: "Cool the room to 68F", why: "Deep-sleep minutes correlate with lower fasting glucose." },
    ],
    stress: [
      { action: "2 minutes of box breathing at 3 PM", why: "Your afternoon spikes are stress-driven - a short reset flattens the curve." },
      { action: "Step outside for 5 minutes", why: "Sunlight + slow breath drops your stress score fastest." },
    ],
    hydration: [
      { action: "Two glasses before lunch", why: "Hydrated mornings show 15% lower glucose variability." },
      { action: "Keep a bottle at your desk", why: "Sight cue - your top hydration days had one visible." },
    ],
    medications: [
      { action: "Set a Sunday-morning dose reminder", why: "Missed weeks drop your TIR by 8% on average." },
      { action: "Take with breakfast + water", why: "Consistency of timing improves absorption and tolerability." },
    ],
    weight: [
      { action: "Weigh only twice a week", why: "Daily variance hides your real trend - twice-weekly is the signal." },
      { action: "Same time, same clothes", why: "Removes noise so Nu can spot real movement faster." },
    ],
  };
  return M[id] ?? [];
}

// Small icon glyph inside each wedge's badge circle.
function WedgeIcon({ id, cx, cy, color }: { id: string; cx: number; cy: number; color: string }) {
  const p = {
    x: cx - 8, y: cy - 8, width: 16, height: 16,
    viewBox: "0 0 24 24", fill: "none", stroke: color,
    strokeWidth: 2 as unknown as number,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "movement":    return (<svg {...p}><path d="M6 20l4-7 4 4 4-6" /><circle cx="17" cy="4" r="2" fill={color} /></svg>);
    case "nutrition":   return (<svg {...p}><path d="M12 3v18M6 8c0-3 3-5 6-5s6 2 6 5v3c0 2-3 3-6 3s-6-1-6-3z" /></svg>);
    case "glucose":     return (<svg {...p}><path d="M12 2c-4 5-6 8-6 12a6 6 0 0 0 12 0c0-4-2-7-6-12z" fill={color} fillOpacity="0.2" /></svg>);
    case "sleep":       return (<svg {...p}><path d="M20 15A8 8 0 1 1 9 4a5 5 0 0 0 11 11z" /></svg>);
    case "stress":      return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 14s2-2 4-2 4 2 4 2M9 9h.01M15 9h.01" /></svg>);
    case "hydration":   return (<svg {...p}><path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z" /></svg>);
    case "medications": return (<svg {...p}><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)" /><path d="M9 15l6-6" /></svg>);
    case "weight":      return (<svg {...p}><rect x="4" y="6" width="16" height="14" rx="2" /><circle cx="12" cy="13" r="3" /><path d="M12 10v2" /></svg>);
    default:            return (<svg {...p}><circle cx="12" cy="12" r="6" /></svg>);
  }
}
