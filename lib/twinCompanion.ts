/**
 * Twin Companion layer — the daily-life surface of the digital twin.
 *
 * Turns the twin from a dashboard you visit into a companion that visits you:
 *   - a daily brief ("here's your one thing today")
 *   - a one-tap check-in
 *   - an evening reflection
 *   - a proactive "your twin noticed" feed driven by the participant's
 *     historical + current data, including a safety-escalation signal.
 *
 * Pure functions; no UI. The escalation signal is the boundary that keeps the
 * companion trustworthy — the twin proactively hands genuine clinical or
 * mental-health concerns to a human rather than absorbing them.
 */

import { Patient } from "./patientData";
import { TwinState } from "./digitalTwin";
import { TwinEngagement } from "./twinEngagement";

// ---------------------------------------------------------------------------
//  Types
// ---------------------------------------------------------------------------
export interface DailyBrief {
  greeting: string;
  dateLabel: string;
  oneThing: string;
  oneThingWhy: string;
  focusLine: string;
  streakLine: string;
}

export type SignalKind = "encourage" | "nudge" | "anticipate" | "watch" | "escalate";

export interface ProactiveSignal {
  id: string;
  kind: SignalKind;
  title: string;
  detail: string;
  action?: string;
}

export interface CheckInQuestion {
  id: string;
  prompt: string;
  options: { label: string; value: number }[];
}

export interface CompanionState {
  brief: DailyBrief;
  signals: ProactiveSignal[];
  checkIn: CheckInQuestion[];
  reflectionPrompt: string;
}

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------
function firstName(p: Patient): string {
  return p.name.split(" ")[0];
}

// ---------------------------------------------------------------------------
//  Daily brief
// ---------------------------------------------------------------------------
function buildBrief(p: Patient, twin: TwinState, eng: TwinEngagement): DailyBrief {
  const date = new Date();
  const mission = twin.missions[0];
  const rec = twin.recovery;
  const focusLine =
    rec.state === "Low" || rec.state === "Moderate"
      ? `Recovery is ${rec.state.toLowerCase()} today — keep it gentle and protect your sleep.`
      : `Recovery is ${rec.state.toLowerCase()} today — a good day to put in a little extra.`;
  return {
    greeting: `Good morning, ${firstName(p)}`,
    dateLabel: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    oneThing: mission.title,
    oneThingWhy: mission.twinSays,
    focusLine,
    streakLine: `${eng.engagement.dayStreak}-day streak · consistency ${eng.engagement.consistencyScore}/100`,
  };
}

// ---------------------------------------------------------------------------
//  Proactive signals — "your twin noticed"
// ---------------------------------------------------------------------------
const KIND_ORDER: Record<SignalKind, number> = {
  escalate: 0, watch: 1, nudge: 2, anticipate: 3, encourage: 4,
};

function buildSignals(p: Patient, twin: TwinState, eng: TwinEngagement): ProactiveSignal[] {
  const sigs: ProactiveSignal[] = [];
  const tw = twin.member.thisWeek;
  const sleepSig = tw.find(s => s.key === "sleep");
  const moveSig = tw.find(s => s.key === "movement");

  // ESCALATE — the safety boundary. The twin proactively involves a human.
  const concerning =
    p.hba1c >= 9 ||
    p.systolicBP >= 165 ||
    (p.comorbidities.some(c => ["Depression", "Anxiety"].includes(c)) && p.pps < 0.35);
  if (concerning) {
    sigs.push({
      id: "esc",
      kind: "escalate",
      title: "I've looped in your care team",
      detail:
        "A couple of your recent signals are outside what I should guide on by myself. Your coach will reach out — getting a person involved here is exactly the right move, not a setback.",
      action: "See what I flagged",
    });
  }

  // WATCH — sleep is the highest-return fix
  if (sleepSig && !sleepSig.onTrack) {
    sigs.push({
      id: "sleep",
      kind: "watch",
      title: "Your sleep has been running short",
      detail: `You're at ${sleepSig.value} against an 8-hour goal. Sleep quietly powers every other lever — it's the highest-return fix this week.`,
      action: "Tonight: lights out by 11",
    });
  }

  // NUDGE — movement dip
  if (moveSig && !moveSig.onTrack) {
    sigs.push({
      id: "move",
      kind: "nudge",
      title: "Movement dipped below your usual",
      detail: `You're at ${moveSig.value} this week. A 10-minute walk today is enough to keep momentum — small, but it counts.`,
      action: "Log a 10-minute walk",
    });
  }

  // ANTICIPATE — refill (the one thing that really sets the curve back)
  if (p.pdc < 0.85) {
    sigs.push({
      id: "refill",
      kind: "anticipate",
      title: "Your refill is coming up",
      detail:
        "I'll remind you a few days early. Missing a dose is the single thing that really sets the curve back — everything else is forgiving.",
      action: "Set a refill reminder",
    });
  }

  // ANTICIPATE — plateau pre-warning, learned from cohort patterns
  if (p.weeksOnProgram >= 10 && p.weeksOnProgram <= 18) {
    sigs.push({
      id: "plateau",
      kind: "anticipate",
      title: "A plateau may be near",
      detail:
        "Around now, progress often goes quiet for profiles like yours. That isn't failure — it's the plateau. When it comes, we'll push through it together.",
    });
  }

  // ENCOURAGE — always close on something real and positive
  if (p.pctBwLoss >= 5) {
    sigs.push({
      id: "enc",
      kind: "encourage",
      title: `You've crossed ${p.pctBwLoss.toFixed(0)}% body-weight loss`,
      detail:
        "That already passes the threshold where metabolic risk measurably drops. This is real progress your clinician will see — not just a number.",
    });
  } else {
    sigs.push({
      id: "enc",
      kind: "encourage",
      title: `${eng.engagement.dayStreak} days, and counting`,
      detail:
        "Every check-in is a vote for your future self. Showing up is the whole game — and you keep showing up.",
    });
  }

  return sigs
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind])
    .slice(0, 5);
}

// ---------------------------------------------------------------------------
//  Check-in
// ---------------------------------------------------------------------------
const CHECK_IN: CheckInQuestion[] = [
  {
    id: "sleep", prompt: "How did you sleep?",
    options: [{ label: "Poorly", value: 0 }, { label: "OK", value: 1 }, { label: "Well", value: 2 }],
  },
  {
    id: "move", prompt: "Have you moved today?",
    options: [{ label: "Not yet", value: 0 }, { label: "A little", value: 1 }, { label: "Yes", value: 2 }],
  },
  {
    id: "energy", prompt: "How's your energy?",
    options: [{ label: "Low", value: 0 }, { label: "Steady", value: 1 }, { label: "Good", value: 2 }],
  },
];

export function checkInResponse(total: number): string {
  if (total >= 5) {
    return "Strong start. Your twin's read: today's a good day to put in a little extra — your projection responds to days like this.";
  }
  if (total >= 3) {
    return "A steady day. Hold the line on your one thing below — consistency beats intensity, and that's a win.";
  }
  return "A heavier day. Be kind to yourself — just protect your dose and your sleep tonight. Tomorrow resets, and your twin keeps every bit of your progress.";
}

// ---------------------------------------------------------------------------
//  Main entry
// ---------------------------------------------------------------------------
export function buildCompanion(p: Patient, twin: TwinState, eng: TwinEngagement): CompanionState {
  return {
    brief: buildBrief(p, twin, eng),
    signals: buildSignals(p, twin, eng),
    checkIn: CHECK_IN,
    reflectionPrompt: "One small thing that went well today?",
  };
}
