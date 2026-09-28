/**
 * Fathom Widget Selector
 * -----------------------------------------------------------------------------
 * Given a WidgetContext, score every registered widget and pick the winner.
 * Each widget contributes a scoring function (contextFit) that returns:
 *   - score: 0-100 relevance
 *   - reasons: human-readable positives ("+40 activeSymptoms non-empty")
 *   - guardrails: hard blockers ("BLOCK: already shown today")
 *   - variant: which variant of the widget to render (e.g. "adapt-for-travel")
 *
 * Selector semantics:
 *   - Widgets with any guardrail hit → score = 0, ineligible
 *   - Top score wins
 *   - Ties broken by widget priority (safety > clinical > access > treatment >
 *     behavior > engagement)
 */

import { WidgetContext } from "./widgetContext";
import { WidgetId, WIDGETS } from "./widgetContract";

// -----------------------------------------------------------------------------

export type WidgetVariantId =
  | "default"
  | "adapt-for-travel"
  | "recovery-focus"
  | "morning-primer"
  | "post-spike-lesson"
  | "gentle-reentry"
  | "urgent-refill"
  | "coupon-first";

export interface ScoringResult {
  widgetId: WidgetId;
  score: number;                      // 0-100 (0 = ineligible)
  variant: WidgetVariantId;
  reasons: string[];                  // e.g. "+40 nausea in activeSymptoms"
  guardrails: string[];               // e.g. "BLOCK: DND hours"
  priority: number;                   // tiebreaker (higher = wins ties)
}

const PRIORITY: Record<WidgetId, number> = {
  "side-effect-checkin": 90,  // safety-adjacent
  "refill-friction":     80,  // access — running out of meds is urgent
  "glucose-spike":       70,  // clinical insight
  "engagement-nudge":    50,  // engagement — nice to have
  "best-day-mirror":     40,  // reflection — weekly cadence
};

// -----------------------------------------------------------------------------
// Per-widget scoring functions
// -----------------------------------------------------------------------------

const SCORERS: Record<WidgetId, (ctx: WidgetContext) => ScoringResult> = {

  // --- Side-Effect Check-in --------------------------------------------------
  "side-effect-checkin": (ctx) => {
    const reasons: string[] = [];
    const guardrails: string[] = [];
    let score = 20; reasons.push("+20 base (always relevant on GLP-1)");
    let variant: WidgetVariantId = "default";

    if ((ctx.clinical.activeSymptoms?.length ?? 0) > 0) {
      score += 40; reasons.push(`+40 active symptoms: ${ctx.clinical.activeSymptoms!.join(", ")}`);
    }
    if (ctx.clinical.severityBand === "moderate") { score += 15; reasons.push("+15 moderate severity"); }
    if (ctx.clinical.severityBand === "severe")   { score += 30; reasons.push("+30 severe severity"); }

    if (ctx.time.partOfDay === "morning") {
      score += 10; reasons.push("+10 morning symptom-check window");
    }
    if (ctx.time.partOfDay === "night") {
      score += 8; reasons.push("+8 pre-sleep symptom log");
    }

    // Dose day (weekly injection) — usually Sunday for many members
    if (ctx.patient.medication && ctx.time.dayOfWeek === 0) {
      score += 10; reasons.push("+10 injection day check-in");
    }

    // Guardrails
    if (ctx.time.isDND) {
      guardrails.push("BLOCK: DND hours (10 PM – 7 AM)");
    }
    if (ctx.session.widgetsShownToday.includes("side-effect-checkin")) {
      guardrails.push("BLOCK: already shown today");
    }
    if ((ctx.session.lastCoachTouchHoursAgo ?? 999) < 3) {
      guardrails.push("BLOCK: coach touched in last 3h — let it breathe");
    }

    return { widgetId: "side-effect-checkin", score: guardrails.length ? 0 : score, variant, reasons, guardrails, priority: PRIORITY["side-effect-checkin"] };
  },

  // --- Refill Friction -------------------------------------------------------
  "refill-friction": (ctx) => {
    const reasons: string[] = [];
    const guardrails: string[] = [];
    let score = 0;
    let variant: WidgetVariantId = "default";

    const days = ctx.access.daysMedicationLeft ?? 999;
    if (days <= 3)  { score += 100; reasons.push(`+100 CRITICAL: ${days} days left`); variant = "urgent-refill"; }
    else if (days <= 5)  { score += 80; reasons.push(`+80 ${days} days left — action needed`); }
    else if (days <= 10) { score += 40; reasons.push(`+40 ${days} days left — heads up`); }

    if (ctx.access.priorAuthStatus === "pending") { score += 20; reasons.push("+20 PA pending"); }
    if (ctx.access.priorAuthStatus === "denied")  { score += 30; reasons.push("+30 PA denied — coach needed"); }
    if (ctx.access.refillStatus === "blocked")    { score += 25; reasons.push("+25 refill blocked"); }
    if (ctx.access.couponEligible && days <= 7)   { score += 10; reasons.push("+10 coupon-eligible with low days"); variant = "coupon-first"; }

    // Guardrails
    if (days > 14) { guardrails.push("BLOCK: >14 days left, not urgent"); }
    if (ctx.session.widgetsShownToday.includes("refill-friction")) {
      guardrails.push("BLOCK: already shown today");
    }

    return { widgetId: "refill-friction", score: guardrails.length ? 0 : score, variant, reasons, guardrails, priority: PRIORITY["refill-friction"] };
  },

  // --- Glucose Spike ---------------------------------------------------------
  "glucose-spike": (ctx) => {
    const reasons: string[] = [];
    const guardrails: string[] = [];
    let score = 0;
    let variant: WidgetVariantId = "default";

    const peak = ctx.clinical.lastGlucosePeak ?? 0;
    if (peak >= 210) { score += 80; reasons.push(`+80 severe spike (${peak} mg/dL) in last 24h`); }
    else if (peak >= 180) { score += 55; reasons.push(`+55 spike (${peak} mg/dL) above target`); }
    else if (peak >= 160) { score += 25; reasons.push(`+25 mild spike (${peak} mg/dL)`); }

    // Timing: post-meal windows are the natural moment
    if (ctx.time.partOfDay === "afternoon" && (ctx.clinical.hoursSinceLastSpike ?? 99) <= 3) {
      score += 20; reasons.push("+20 post-lunch teachable moment");
      variant = "post-spike-lesson";
    }
    if (ctx.time.partOfDay === "morning" && (ctx.clinical.hoursSinceLastSpike ?? 99) > 8) {
      score += 15; reasons.push("+15 morning-after review window");
      variant = "morning-primer";
    }

    // Guardrails
    if (peak < 155) { guardrails.push("BLOCK: no spike above 155 in window"); }
    if (ctx.time.isDND) { guardrails.push("BLOCK: DND hours"); }
    if (ctx.session.widgetsShownToday.includes("glucose-spike")) {
      guardrails.push("BLOCK: already shown today");
    }

    return { widgetId: "glucose-spike", score: guardrails.length ? 0 : score, variant, reasons, guardrails, priority: PRIORITY["glucose-spike"] };
  },

  // --- Engagement Nudge ------------------------------------------------------
  "engagement-nudge": (ctx) => {
    const reasons: string[] = [];
    const guardrails: string[] = [];
    let score = 0;
    let variant: WidgetVariantId = "default";

    const days = ctx.behavioral.daysSinceLastLog ?? 0;
    if (days >= 14) { score += 60; reasons.push(`+60 silent ${days} days`); variant = "gentle-reentry"; }
    else if (days >= 7)  { score += 50; reasons.push(`+50 drift ${days} days`); }
    else if (days >= 3)  { score += 20; reasons.push(`+20 slowing (${days} days)`); }

    if (ctx.behavioral.engagementBand === "silent")   { score += 20; reasons.push("+20 engagement band: silent"); }
    if (ctx.behavioral.engagementBand === "drifting") { score += 10; reasons.push("+10 engagement band: drifting"); }
    if ((ctx.behavioral.lastMood ?? 5) <= 2) { score += 15; reasons.push("+15 last mood ≤ 2"); }

    // Time preferences: not on injection day, not too early
    if (ctx.time.partOfDay === "midday" || ctx.time.partOfDay === "evening") {
      score += 10; reasons.push("+10 non-intrusive window");
    }
    if (ctx.time.isWeekend) { score += 5; reasons.push("+5 weekend low-pressure moment"); }

    // Guardrails
    if (days < 2) { guardrails.push("BLOCK: engaged in last 48h"); }
    if ((ctx.clinical.activeSymptoms?.length ?? 0) > 0 && ctx.clinical.severityBand !== "mild") {
      guardrails.push("BLOCK: don't nudge during a symptom stretch");
    }
    if (ctx.time.isDND) { guardrails.push("BLOCK: DND hours"); }
    if (ctx.session.widgetsShownToday.includes("engagement-nudge")) {
      guardrails.push("BLOCK: already shown today");
    }

    return { widgetId: "engagement-nudge", score: guardrails.length ? 0 : score, variant, reasons, guardrails, priority: PRIORITY["engagement-nudge"] };
  },

  // --- Best Day Mirror -------------------------------------------------------
  "best-day-mirror": (ctx) => {
    const reasons: string[] = [];
    const guardrails: string[] = [];
    let score = 15; reasons.push("+15 base (weekly cadence)");
    let variant: WidgetVariantId = "default";

    // Weekly cadence — Monday mornings are the sweet spot
    if (ctx.time.dayOfWeek === 1 && ctx.time.partOfDay === "morning") {
      score += 45; reasons.push("+45 Monday morning weekly briefing window");
    } else if (ctx.time.dayOfWeek === 1) {
      score += 25; reasons.push("+25 Monday (weekly moment)");
    }

    // Positive framing works better on good stretches
    if ((ctx.clinical.lastTIR ?? 0) >= 78) { score += 20; reasons.push(`+20 TIR ${ctx.clinical.lastTIR}% — mirror lands positively`); }
    if ((ctx.clinical.nuHealthIndex ?? 0) >= 7) { score += 15; reasons.push(`+15 NHI ${ctx.clinical.nuHealthIndex} — good week to reflect`); }
    if (ctx.behavioral.streakDays && ctx.behavioral.streakDays >= 5) { score += 10; reasons.push(`+10 ${ctx.behavioral.streakDays}-day streak`); }

    // Variant selection
    if (ctx.environment.travel === "traveling" || ctx.environment.travel === "airport") {
      variant = "adapt-for-travel";
      reasons.push("→ variant: adapt-for-travel (env.travel non-home)");
    }
    if ((ctx.clinical.lastTIR ?? 100) < 65 && (ctx.clinical.activeSymptoms?.length ?? 0) === 0) {
      variant = "recovery-focus";
      reasons.push("→ variant: recovery-focus (low TIR, no symptoms)");
    }

    // Guardrails
    if ((ctx.clinical.activeSymptoms?.length ?? 0) > 0 && ctx.clinical.severityBand !== "mild") {
      guardrails.push("BLOCK: symptomatic day — mirror would feel tone-deaf");
    }
    if ((ctx.session.lastBestPathShownDaysAgo ?? 0) < 6) {
      guardrails.push(`BLOCK: shown ${ctx.session.lastBestPathShownDaysAgo}d ago — weekly cap`);
    }
    if (ctx.session.dismissedInLast7Days.some(d => d.widgetId === "best-day-mirror" && d.hoursAgo < 48)) {
      guardrails.push("BLOCK: dismissed in last 48h — respect the No");
    }
    if (ctx.time.isDND) { guardrails.push("BLOCK: DND hours"); }
    if (ctx.session.widgetsShownToday.includes("best-day-mirror")) {
      guardrails.push("BLOCK: already shown today");
    }

    return { widgetId: "best-day-mirror", score: guardrails.length ? 0 : score, variant, reasons, guardrails, priority: PRIORITY["best-day-mirror"] };
  },
};

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export function scoreAllWidgets(ctx: WidgetContext): ScoringResult[] {
  return WIDGETS
    .map(w => SCORERS[w.id](ctx))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.priority - a.priority;
    });
}

export function selectBestWidget(ctx: WidgetContext): ScoringResult | null {
  const ranked = scoreAllWidgets(ctx);
  const winner = ranked[0];
  if (!winner || winner.score === 0) return null;
  return winner;
}

/** Score one widget on demand (used to inspect a single widget's math). */
export function scoreWidget(id: WidgetId, ctx: WidgetContext): ScoringResult {
  return SCORERS[id](ctx);
}
