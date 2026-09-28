/**
 * Twin Relationship & Lifecycle layer.
 *
 * Turns the twin from a tool into a relationship the participant keeps for life:
 *   3. Relationship layer — a named, consistent persona ("Nu") + a memory of
 *      the shared history (wins, setbacks, promises, interventions).
 *   4. Coach handoff      — the designed coach-to-twin trust transfer, the
 *      twin carrying the coach's voice, and a clear escalation ladder.
 *   5. Lifelong mode      — lifecycle stages including post-program graduation
 *      into a general health companion beyond GLP-1.
 *
 * Pure functions; no UI.
 */

import { Patient } from "./patientData";
import { TwinState } from "./digitalTwin";
import { coachOf } from "./coachIntelligence";

// The twin's persistent persona name — derived from HabitNu, short and warm.
export const TWIN_NAME = "Nu";

// ---------------------------------------------------------------------------
//  Types
// ---------------------------------------------------------------------------
export interface TwinPersona {
  name: string;
  role: string;
  knownForDays: number;
  knownForLabel: string;
  knownSummary: string;
  promise: string;
}

export type MemoryKind = "start" | "milestone" | "setback" | "intervention" | "win" | "promise";
export interface MemoryEntry {
  week: number;
  dateLabel: string;
  kind: MemoryKind;
  text: string;
  nuNote: string;
}

export interface CoachHandoff {
  coachName: string;
  status: "with-coach" | "co-piloted" | "handed-off";
  statusLabel: string;
  handoffWeek: number;
  intro: string;
  carries: string[];
}

export interface EscalationTier {
  tier: string;
  handledBy: string;
  scope: string;
  tone: "calm" | "watch" | "alert";
}

export type LifecycleStage = "onboarding" | "building" | "maintenance" | "lifelong";
export interface BeyondGlp1Area {
  area: string;
  detail: string;
  status: "active" | "next" | "later";
}
export interface Lifecycle {
  stage: LifecycleStage;
  stageLabel: string;
  stageHeadline: string;
  stageBody: string;
  nextHorizon: string;
  beyondGlp1: BeyondGlp1Area[];
}

export interface TwinRelationship {
  persona: TwinPersona;
  memory: MemoryEntry[];
  handoff: CoachHandoff;
  escalation: EscalationTier[];
  lifecycle: Lifecycle;
}

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------
function firstName(p: Patient): string {
  return p.name.split(" ")[0];
}
function weeksAgoDate(weeksAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.max(0, weeksAgo) * 7);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
//  3a. Persona
// ---------------------------------------------------------------------------
function buildPersona(p: Patient): TwinPersona {
  const days = Math.max(1, p.weeksOnProgram * 7);
  const knownForLabel = days >= 14
    ? `${Math.round(days / 7)} weeks`
    : `${days} days`;
  return {
    name: TWIN_NAME,
    role: "the voice of your digital twin — your daily health partner",
    knownForDays: days,
    knownForLabel,
    knownSummary: `${TWIN_NAME} holds your baseline, your genome, your care plan, and ${knownForLabel} of your daily signals — and remembers all of it.`,
    promise: `${TWIN_NAME} is here every day, learns only from you, and is always honest about when something needs a person instead.`,
  };
}

// ---------------------------------------------------------------------------
//  3b. Memory — the shared history Nu remembers
// ---------------------------------------------------------------------------
function buildMemory(p: Patient, twin: TwinState): MemoryEntry[] {
  const w = p.weeksOnProgram;
  const coach = coachOf(p);
  const out: MemoryEntry[] = [];

  out.push({
    week: 0,
    dateLabel: weeksAgoDate(w),
    kind: "start",
    text: `You started — baseline ${p.baselineWeightLb} lb, HbA1c ${p.hba1c.toFixed(1)}.`,
    nuNote: "Day one. I've kept everything since.",
  });
  if (w >= 2) out.push({
    week: 2,
    dateLabel: weeksAgoDate(w - 2),
    kind: "win",
    text: "Your first measurable progress showed up on the scale.",
    nuNote: "The first pounds are the hardest — you earned those.",
  });
  if (w >= 4 && p.pps < 0.62) out.push({
    week: 3,
    dateLabel: weeksAgoDate(w - 3),
    kind: "setback",
    text: "A rough stretch — motivation dipped and check-ins slowed.",
    nuNote: "I remember this. It didn't undo anything — and you came back.",
  });
  if (w >= 5) out.push({
    week: 4,
    dateLabel: weeksAgoDate(w - 4),
    kind: "intervention",
    text: `Coach ${coach.name.split(" ")[0]} stepped in with a plateau play and a peer reference.`,
    nuNote: `${coach.name.split(" ")[0]} and I worked that out together — it's part of your plan now.`,
  });
  if (w >= 6) out.push({
    week: 6,
    dateLabel: weeksAgoDate(w - 6),
    kind: "promise",
    text: "You told me you'd take a 10-minute walk after dinner.",
    nuNote: "I held onto this. It's still one of your strongest small habits.",
  });
  if (p.pctBwLoss >= 5) out.push({
    week: Math.min(w, 12),
    dateLabel: weeksAgoDate(Math.max(0, w - 12)),
    kind: "milestone",
    text: `You crossed 5% body-weight loss — the threshold where metabolic risk measurably drops.`,
    nuNote: "A real clinical milestone. I logged it the moment it happened.",
  });
  out.push({
    week: w,
    dateLabel: "This week",
    kind: "win",
    text: `Down ${p.pctBwLoss.toFixed(1)}% so far, ${w} weeks in — and still showing up.`,
    nuNote: "Where we are now. Tomorrow we add one more day to this.",
  });

  return out.sort((a, b) => a.week - b.week);
}

// ---------------------------------------------------------------------------
//  4a. Coach handoff
// ---------------------------------------------------------------------------
function buildHandoff(p: Patient): CoachHandoff {
  const coach = coachOf(p);
  const coachFirst = coach.name.split(" ")[0];
  const w = p.weeksOnProgram;

  const status: CoachHandoff["status"] =
    w < 6 ? "with-coach" : w < 16 ? "co-piloted" : "handed-off";
  const statusLabel =
    status === "with-coach" ? "Coach-led — Nu is learning alongside"
    : status === "co-piloted" ? "Co-piloted — Nu daily, coach weekly"
    : "Nu-led daily — coach is your escalation tier";

  const intro = status === "with-coach"
    ? `Coach ${coachFirst} is leading your onboarding. ${TWIN_NAME} is learning your patterns in the background so the handoff later feels seamless.`
    : status === "co-piloted"
    ? `Coach ${coachFirst} introduced ${TWIN_NAME}: "I'll be checking in weekly now — but ${TWIN_NAME} has everything we've worked on and will be with you every day."`
    : `Coach ${coachFirst} has handed your day-to-day to ${TWIN_NAME}: "${TWIN_NAME} knows your plan as well as I do. I'm one message away whenever you need a person."`;

  return {
    coachName: coach.name,
    status,
    statusLabel,
    handoffWeek: 6,
    intro,
    carries: [
      "Your goals, in your own words",
      "The coaching plays that worked for you",
      "Your plateau plan and your comeback plan",
      "Every promise you made and every win you logged",
    ],
  };
}

// ---------------------------------------------------------------------------
//  4b. Escalation ladder
// ---------------------------------------------------------------------------
function buildEscalation(): EscalationTier[] {
  return [
    {
      tier: "Nu handles it",
      handledBy: TWIN_NAME,
      scope: "Daily guidance, motivation, missions, education, the one-thing-today and your check-ins.",
      tone: "calm",
    },
    {
      tier: "Nu flags your coach",
      handledBy: "Health coach",
      scope: "Disengagement, plateau frustration, missed sessions, a slip that needs a human conversation.",
      tone: "watch",
    },
    {
      tier: "Nu escalates to your clinician",
      handledBy: "Clinician",
      scope: "Clinical red flags — out-of-range A1C or blood pressure, side-effect concerns, medication questions.",
      tone: "alert",
    },
    {
      tier: "Urgent — a person, now",
      handledBy: "Care team + crisis resources",
      scope: "Signs of distress or a safety concern. Nu never tries to handle this alone — it routes to a person immediately.",
      tone: "alert",
    },
  ];
}

// ---------------------------------------------------------------------------
//  5. Lifecycle — including post-program lifelong mode
// ---------------------------------------------------------------------------
function buildLifecycle(p: Patient): Lifecycle {
  const w = p.weeksOnProgram;
  const completed = p.status === "Completed";

  let stage: LifecycleStage;
  if (completed) stage = "lifelong";
  else if (w < 4) stage = "onboarding";
  else if (w < 26) stage = "building";
  else stage = "maintenance";

  const map: Record<LifecycleStage, { label: string; headline: string; body: string; horizon: string }> = {
    onboarding: {
      label: "Onboarding",
      headline: "Getting started — Nu is learning you.",
      body: "Your coach is leading. Nu is building a model of your patterns so it can carry the day-to-day soon.",
      horizon: "Next: settle your routines through week 4.",
    },
    building: {
      label: "Building",
      headline: "In the work — Nu is your daily partner.",
      body: "The change is taking hold. Nu runs the daily loop; your coach checks in weekly and steps in when it matters.",
      horizon: "Next: reach and hold your 26-week outcome.",
    },
    maintenance: {
      label: "Maintenance",
      headline: "Holding the gain — the hard part most programs skip.",
      body: "The weight came off; now Nu protects it. The focus shifts from losing to keeping — and to the habits that make it permanent.",
      horizon: "Next: 12 months of durable maintenance, then lifelong mode.",
    },
    lifelong: {
      label: "Lifelong companion",
      headline: "The program ended. Nu didn't.",
      body: "You graduated the GLP-1 program — but Nu stays. Its job widens from weight to whole-health: sleep, heart, stress, and the next goal you choose.",
      horizon: "Next: you pick the goal. Nu adapts to it.",
    },
  };
  const m = map[stage];

  const beyondGlp1: BeyondGlp1Area[] = [
    { area: "Weight maintenance", detail: "Protecting the gain — the metric that defines long-term success.", status: stage === "lifelong" || stage === "maintenance" ? "active" : "next" },
    { area: "Cardiometabolic fitness", detail: "Resting heart rate, blood pressure, and aerobic capacity over time.", status: stage === "lifelong" ? "active" : "next" },
    { area: "Sleep & recovery", detail: "The stealth multiplier — tracked and coached on its own from here.", status: stage === "lifelong" ? "active" : "next" },
    { area: "Stress & resilience", detail: "Mood, stress load, and the behaviors that buffer them.", status: stage === "lifelong" ? "next" : "later" },
    { area: "Preventive screening", detail: "Nu nudges the screenings and labs that catch problems early.", status: "later" },
    { area: "Strength & longevity", detail: "Muscle, mobility, and healthspan — the long game.", status: "later" },
  ];

  return {
    stage,
    stageLabel: m.label,
    stageHeadline: m.headline,
    stageBody: m.body,
    nextHorizon: m.horizon,
    beyondGlp1,
  };
}

// ---------------------------------------------------------------------------
//  Main entry
// ---------------------------------------------------------------------------
export function buildRelationship(p: Patient, twin: TwinState): TwinRelationship {
  return {
    persona: buildPersona(p),
    memory: buildMemory(p, twin),
    handoff: buildHandoff(p),
    escalation: buildEscalation(),
    lifecycle: buildLifecycle(p),
  };
}
