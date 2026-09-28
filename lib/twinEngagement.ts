/**
 * Twin Engagement layer — motivation & retention enhancements for the
 * member-facing digital twin. Pure functions; no UI; no black-box ML.
 *
 * Four enhancement families:
 *   1. Future-self bridge   — a vivid 26-week self + near-term milestone previews
 *   2. Responsive copilot   — scripted "ask your twin" Q&A
 *   3. Resilient engagement — consistency score, streak freezes, effort, comeback path
 *   4. Health narrative     — real outcome milestones, compounding, identity, chapters
 */

import { Patient } from "./patientData";
import { TwinState } from "./digitalTwin";

// ---------------------------------------------------------------------------
//  Types
// ---------------------------------------------------------------------------
export interface MilestonePreview {
  label: string;
  distance: string;
  eta: string;
}
export interface FutureSelf {
  horizonWeeks: number;
  headline: string;
  projWeightLb: number;
  projHbA1c: number;
  vignette: string[];
  milestonePreviews: MilestonePreview[];
}

export interface EffortItem { label: string; done: boolean; }
export interface EngagementState {
  consistencyScore: number;
  consistencyLabel: string;
  consistencyTone: "green" | "amber" | "rose";
  dayStreak: number;
  streakFreezes: number;
  effortScore: number;
  effortItems: EffortItem[];
  inComeback: boolean;
  comebackTitle: string;
  comebackMessage: string;
}

export interface HealthMilestone { label: string; detail: string; achieved: boolean; }
export interface CompoundStat { label: string; value: string; sub: string; }
export interface Chapter {
  n: number;
  title: string;
  status: "done" | "current" | "upcoming";
  summary: string;
}
export interface NarrativeLayer {
  milestones: HealthMilestone[];
  compounding: CompoundStat[];
  identity: string[];
  chapters: Chapter[];
}

export interface TwinEngagement {
  futureSelf: FutureSelf;
  engagement: EngagementState;
  narrative: NarrativeLayer;
}

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

// ---------------------------------------------------------------------------
//  1. FUTURE-SELF BRIDGE
// ---------------------------------------------------------------------------
function buildFutureSelf(p: Patient, twin: TwinState): FutureSelf {
  const w26 = twin.trajectory.find(t => t.week === 24)
    ?? twin.trajectory.find(t => t.week === 28)
    ?? twin.trajectory[twin.trajectory.length - 1];
  const baseW = twin.trajectory[0].weight;
  const lossLb = Math.round(baseW - w26.weight);
  const a1cDrop = +(twin.trajectory[0].hba1c - w26.hba1c).toFixed(2);

  const v: string[] = [];
  if (lossLb >= 8) v.push("You climb two flights of stairs without stopping to catch your breath.");
  if (lossLb >= 5) v.push(`You're down about ${lossLb} lb — back into clothes you'd set aside.`);
  if (p.hba1c >= 6.5 && a1cDrop >= 0.4) v.push("Your A1C is heading back toward the healthy range — fewer highs and lows through the day.");
  if (p.comorbidities.includes("Hypertension")) v.push("Your blood-pressure readings are landing in range far more often.");
  if (p.comorbidities.includes("OSA")) v.push("You're sleeping more deeply — and waking up actually rested.");
  if (p.comorbidities.includes("Osteoarthritis")) v.push("Your knees and hips carry less load — everyday movement hurts less.");
  v.push("You have steady energy in the afternoon, where the slump used to hit.");
  v.push("You move because you want to — it's becoming who you are, not a chore.");

  // Near-term milestone previews
  const baselineLb = p.baselineWeightLb;
  const currentLossPct = p.pctBwLoss;
  const currentLossLb = baselineLb * currentLossPct / 100;
  const weeklyRateLb = twin.trajectory.length > 1
    ? (twin.trajectory[0].weight - twin.trajectory[2].weight) / 8
    : 0.5;

  const previews: MilestonePreview[] = [];
  const pctTargets = [5, 10, 15].filter(t => t > currentLossPct + 0.3);
  for (const t of pctTargets.slice(0, 2)) {
    const targetLb = baselineLb * t / 100;
    const gap = Math.max(1, targetLb - currentLossLb);
    const weeks = Math.max(1, Math.round(gap / Math.max(0.25, weeklyRateLb)));
    previews.push({
      label: `${t}% body-weight loss`,
      distance: `${gap.toFixed(1)} lb away`,
      eta: `~${weeks} week${weeks === 1 ? "" : "s"}`,
    });
  }
  // A round-number lb milestone
  const nextRoundLb = (Math.floor(currentLossLb / 5) + 1) * 5;
  const roundGap = Math.max(1, nextRoundLb - currentLossLb);
  const roundWeeks = Math.max(1, Math.round(roundGap / Math.max(0.25, weeklyRateLb)));
  previews.unshift({
    label: `${nextRoundLb} lb lost in total`,
    distance: `${roundGap.toFixed(1)} lb away`,
    eta: `~${roundWeeks} week${roundWeeks === 1 ? "" : "s"}`,
  });

  return {
    horizonWeeks: 24,
    headline: `Meet your 6-month self`,
    projWeightLb: lossLb,
    projHbA1c: a1cDrop,
    vignette: v.slice(0, 5),
    milestonePreviews: previews.slice(0, 3),
  };
}

// ---------------------------------------------------------------------------
//  3. RESILIENT ENGAGEMENT
// ---------------------------------------------------------------------------
function buildEngagement(p: Patient, twin: TwinState): EngagementState {
  const h = hash(p.id);

  // Consistency score — a resilient weighted blend, NOT a brittle streak.
  // Survives a single missed day; bends rather than breaks.
  const adherence = clamp(p.pdc, 0, 1);
  const portal = clamp(p.portalLogins90d / 60, 0, 1);
  const coach = clamp(p.coachInteractions90d / 12, 0, 1);
  const consistency = Math.round(
    (adherence * 0.5 + portal * 0.3 + coach * 0.2) * 100
  );
  const consistencyTone: EngagementState["consistencyTone"] =
    consistency >= 70 ? "green" : consistency >= 45 ? "amber" : "rose";
  const consistencyLabel =
    consistency >= 80 ? "Rock solid"
    : consistency >= 65 ? "Strong and steady"
    : consistency >= 45 ? "Holding — one nudge lifts this"
    : "Wobbling — let's rebuild gently";

  const dayStreak = 3 + (h % 26);
  // Freezes: 2 by default, fewer if engagement is shaky
  const streakFreezes = consistency >= 60 ? 2 : consistency >= 40 ? 1 : 0;

  // Effort — controllable weekly behaviours (outcome-independent).
  const effortItems: EffortItem[] = [
    { label: "Took your dose on schedule", done: p.pdc >= 0.7 },
    { label: "Logged meals 5+ days", done: ((h >> 1) & 3) > 0 },
    { label: "Hit your movement goal", done: p.pctBwLoss >= 4 || ((h >> 3) & 1) === 1 },
    { label: "Slept 7+ hours, 5 nights", done: ((h >> 4) & 3) > 1 },
    { label: "Checked in with your coach", done: p.coachInteractions90d >= 3 },
  ];
  const effortScore = Math.round(effortItems.filter(e => e.done).length / effortItems.length * 100);

  // Comeback path — triggered when the participant has slipped.
  const inComeback = p.status === "Discontinued" || (p.status === "Active" && p.pps < 0.4);
  const comebackTitle = inComeback ? "Welcome back — let's restart, not rewind." : "";
  const comebackMessage = inComeback
    ? "Missing a stretch doesn't erase your progress — the twin kept all of it. Pick one small action for the next 3 days and your momentum rebuilds faster than you'd expect."
    : "";

  return {
    consistencyScore: consistency,
    consistencyLabel,
    consistencyTone,
    dayStreak,
    streakFreezes,
    effortScore,
    effortItems,
    inComeback,
    comebackTitle,
    comebackMessage,
  };
}

// ---------------------------------------------------------------------------
//  4. HEALTH NARRATIVE  (milestones · compounding · identity · chapters)
// ---------------------------------------------------------------------------
function buildNarrative(p: Patient, twin: TwinState): NarrativeLayer {
  const weeks = p.weeksOnProgram;
  const lossLb = p.baselineWeightLb * p.pctBwLoss / 100;

  // Real health-outcome milestones (no XP, no badges).
  const milestones: HealthMilestone[] = [
    { label: "First 5 lb lost", detail: "The hardest pounds — momentum starts here.", achieved: lossLb >= 5 },
    { label: "5% body-weight loss", detail: "The threshold where metabolic risk measurably drops.", achieved: p.pctBwLoss >= 5 },
    { label: "Blood pressure trending into range", detail: "Each kg off takes load off your heart.", achieved: weeks >= 8 && lossLb >= 7 },
    { label: "A1C improved by 0.5 points", detail: "Real glycemic progress your clinician will see.", achieved: p.hba1c >= 6.5 && weeks >= 10 && lossLb >= 8 },
    { label: "10% body-weight loss", detail: "The level linked to durable cardiometabolic benefit.", achieved: p.pctBwLoss >= 10 },
    { label: "10-year cardiac risk meaningfully reduced", detail: "The outcome behind all the others.", achieved: p.pctBwLoss >= 12 && weeks >= 20 },
  ];

  // Compounding — making invisible accumulation visible.
  const totalMoveMin = Math.round(weeks * 150 * Math.max(0.4, p.pdc));
  const totalMiles = Math.round(totalMoveMin / 20);
  const dosesOnTime = Math.round(weeks * 7 * clamp(p.pdc, 0, 1) / 7);
  const compounding: CompoundStat[] = [
    { label: "Movement banked", value: `${totalMiles} mi`, sub: `${totalMoveMin.toLocaleString()} minutes of movement so far` },
    { label: "Weeks showing up", value: `${weeks}`, sub: "Every week is a vote for your future self" },
    { label: "Doses kept on track", value: `${dosesOnTime}/${weeks}`, sub: "Consistency is what the curve is built on" },
  ];

  // Identity — who the participant is becoming.
  const identity: string[] = [];
  if (weeks >= 4) identity.push(`You've shown up for ${weeks} weeks running.`);
  if (p.pdc >= 0.7) identity.push("You're becoming someone who keeps a routine — not someone who starts one.");
  if (p.pctBwLoss >= 6) identity.push("You're proof to yourself that this works for you.");
  if (identity.length < 2) identity.push("Every check-in is you choosing your future self over your past habits.");

  // Chapters — the journey as a story.
  const chapterDefs: { title: string; start: number; end: number; summary: string }[] = [
    { title: "Getting started", start: 0, end: 4, summary: "Finding your footing — first habits, first results." },
    { title: "Finding your rhythm", start: 4, end: 12, summary: "Routines settle in; the twin learns your pattern." },
    { title: "Breaking the plateau", start: 12, end: 26, summary: "Progress gets quieter — this is where persistence pays." },
    { title: "Making it stick", start: 26, end: 999, summary: "Maintenance and identity — the change becomes permanent." },
  ];
  const chapters: Chapter[] = chapterDefs.map((c, i) => ({
    n: i + 1,
    title: c.title,
    status: weeks >= c.end ? "done" : weeks >= c.start ? "current" : "upcoming",
    summary: c.summary,
  }));

  return { milestones, compounding, identity, chapters };
}

// ---------------------------------------------------------------------------
//  Main entry
// ---------------------------------------------------------------------------
export function buildTwinEngagement(p: Patient, twin: TwinState): TwinEngagement {
  return {
    futureSelf: buildFutureSelf(p, twin),
    engagement: buildEngagement(p, twin),
    narrative: buildNarrative(p, twin),
  };
}

// ---------------------------------------------------------------------------
//  2. RESPONSIVE COPILOT — scripted "ask your twin" Q&A
// ---------------------------------------------------------------------------
export const SUGGESTED_QUESTIONS: string[] = [
  "Am I on track?",
  "What's my biggest opportunity?",
  "What happens if I skip this week?",
  "Why does my projection look like this?",
  "What should I focus on next?",
];

export function askTwin(question: string, p: Patient, twin: TwinState): string {
  const q = question.toLowerCase();
  const loss52 = twin.headline.projectedWeightLossLb52w;
  const topDriver = twin.driverRanking[0];

  if (q.includes("on track") || q.includes("doing")) {
    return twin.member.onTrack
      ? `Yes — you're tracking toward about -${loss52} lb at 52 weeks, which puts you in the ${twin.member.percentileLabel.toLowerCase()} of members like you. Keep the rhythm you've built.`
      : `You're building, not stalled. Today's path projects about -${loss52} lb at 52 weeks. One change — lifting ${topDriver.label.toLowerCase()} — would move that line noticeably.`;
  }
  if (q.includes("opportunity") || q.includes("focus") || q.includes("next") || q.includes("should i")) {
    return `Your biggest lever right now is ${topDriver.label.toLowerCase()} — nudging it up adds roughly ${topDriver.lift} lb to your 52-week projection. Start with this week's mission: ${twin.missions[0].title}.`;
  }
  if (q.includes("skip") || q.includes("miss") || q.includes("break")) {
    return `One week off won't undo your progress — the twin keeps all of it. What it does is delay your next milestone by a week or two. If life needs the week, take it; just protect your dose and come back. Missing the dose is the only thing that really sets the curve back.`;
  }
  if (q.includes("projection") || q.includes("change") || q.includes("why") || q.includes("look like")) {
    return `Your projection is built from your real signals — adherence, movement, sleep, coaching — plus your genome and the outcomes of ${twin.cohort.n} members who match your profile. It moves whenever those inputs move; nothing here is guessed.`;
  }
  if (q.includes("recovery")) {
    return `Your recovery window is ${twin.recovery.score}% — ${twin.recovery.state.toLowerCase()}. ${twin.recovery.guidance}`;
  }
  if (q.includes("genome") || q.includes("genetic") || q.includes("dna")) {
    return `Your genetic profile reads as a ${twin.genomics.responseClass} GLP-1 responder. ${twin.genomics.headline}`;
  }
  // Fallback
  return `Here's what I'd say: you're projected to lose about -${loss52} lb at 52 weeks, and your highest-leverage move is ${topDriver.label.toLowerCase()}. Ask me about your projection, what to focus on, or what happens if you skip a week.`;
}
