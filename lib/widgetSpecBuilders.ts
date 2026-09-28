/**
 * WidgetSpec builders — the "server" side of the SDUI loop.
 *
 * In production these live in the Fathom backend and hydrate a spec by:
 *   1. Looking up the widget_template row for the winning widget
 *   2. Applying the selected variant's overrides
 *   3. Merging in patient signals (personalized copy, numbers, timings)
 *   4. Applying tenant theme overrides
 *
 * For the POC we generate the spec deterministically from patient + context.
 * The renderer doesn't care where the spec came from.
 */

import { PatientContext, WidgetId } from "./widgetContract";
import { WidgetVariantId, ScoringResult } from "./widgetSelector";
import { WidgetSpec, SpecNode } from "./widgetSpec";
import { WidgetContext } from "./widgetContext";

const nowIso = () => new Date().toISOString();

// -----------------------------------------------------------------------------
// Best Day Mirror
// -----------------------------------------------------------------------------
function buildBestDayMirror(patient: PatientContext, ctx: WidgetContext, variant: WidgetVariantId): SpecNode {
  const traveling = ctx.environment.travel === "traveling" || ctx.environment.travel === "airport";
  const recovery  = variant === "recovery-focus";

  const timeline = [
    { time: "7:14 AM",  icon: "🌤", label: "Sunlight walk, 12 min" },
    { time: "12:30 PM", icon: "🥗", label: "Protein-first lunch (chicken salad)" },
    { time: "6:15 PM",  icon: "🍽", label: "Early dinner" },
    { time: "6:45 PM",  icon: "🚶", label: "15-min walk" },
    { time: "10:30 PM", icon: "🌙", label: "Lights out" },
  ];

  const contextTiles: SpecNode = {
    type: "ContextTiles",
    items: [
      { eyebrow: "Where it broke last time", body: "Last Tuesday-shape day, dinner slipped to 8:30 and TIR dropped to 74%.", tone: "warning" },
      { eyebrow: "What's different today",
        body: traveling
          ? `${patient.firstName}, you're traveling — swap the 6:45 walk for stairs at the concourse.`
          : recovery
          ? "This week's TIR sits low — treat this shape as a target, not a demand."
          : `${patient.firstName}, no schedule changes today. The full shape fits.`,
        tone: "info" },
      { eyebrow: "Ingredients you have", body: "Chicken + greens in the fridge. Sunrise at 6:52.", tone: "success" },
    ],
  };

  const inner: SpecNode = {
    type: "Column", gap: 3,
    children: [
      {
        type: "Grid", cols: 2,
        children: [
          { type: "Timeline", eyebrow: "What you did", items: timeline },
          {
            type: "Column", gap: 3,
            children: [
              { type: "StatGrid", eyebrow: "How it went", tone: "success",
                items: [
                  { label: "TIR",   value: "91%" },
                  { label: "HRV",   value: "51 ms" },
                  { label: "Sleep", value: "7h 42m" },
                  { label: "Mood",  value: "5/5" },
                ] },
              { type: "Quote", eyebrow: "You wrote at 9 PM", body: "\"Felt like myself again.\"", tone: "warning" },
            ],
          },
        ],
      },
      contextTiles,
      {
        type: "ChoiceRow",
        primary:   { label: "Try this shape today →",  actionId: "try" },
        secondary: { label: "Adjust one thing",         actionId: "adjust" },
        tertiary:  { label: "Not today",                actionId: "dismiss" },
      },
    ],
  };

  return {
    type: "Shell",
    eyebrow: `Your best day last week · Nu-scored`,
    eyebrowTone: "primary",
    title: "Tuesday, Sept 12",
    subtitle: "A mirror, not a plan. Repeat the shape if it fits today.",
    gradient: "mirror",
    headerRight: { chip: { label: "Reliability 3 / 14", tone: "success" } },
    footerNote: "Weekly · your voice · three choices always",
    child: inner,
  };
}

// -----------------------------------------------------------------------------
// Side-Effect Check-in
// -----------------------------------------------------------------------------
function buildSideEffect(patient: PatientContext, ctx: WidgetContext): SpecNode {
  const symptoms = ctx.clinical.activeSymptoms ?? [];
  const primarySymptom = symptoms[0] ?? "nausea";
  const severe = ctx.clinical.severityBand === "severe" || ctx.clinical.severityBand === "moderate";

  const nuLine = severe
    ? `${patient.firstName}, a ${ctx.clinical.severityBand} ${primarySymptom} at week ${patient.medication?.week ?? "14"} warrants a coach touch. I'll flag Maya today.`
    : `${patient.firstName}, mild ${primarySymptom} is common at this dose. Small ginger tea + eat protein first — most members feel it lift by 3 PM.`;

  const inner: SpecNode = {
    type: "Column", gap: 3,
    children: [
      { type: "Message", from: "nu", body: nuLine,
        tone: severe ? "danger" : "info",
        meta: { area: "treatment-experience", ruleId: `tx.${primarySymptom}.${severe ? "severe" : "mild"}`, confidence: "high" } },
      { type: "FactRows",
        items: [
          { icon: "🩺", label: "Active symptoms", value: symptoms.length ? symptoms.join(", ") : "none logged" },
          { icon: "💊", label: "Medication",       value: patient.medication ? `${patient.medication.name} ${patient.medication.dose}` : "—" },
          { icon: "📅", label: "Program week",     value: patient.medication ? `${patient.medication.week}` : "—" },
        ] },
      severe
        ? {
            type: "ChoiceRow",
            primary:   { label: "Talk to my coach", actionId: "handoff" },
            secondary: { label: "Log & continue",   actionId: "log" },
            tertiary:  { label: "Not now",          actionId: "dismiss" },
          }
        : {
            type: "ChoiceRow",
            primary:   { label: "Log & continue",   actionId: "log" },
            secondary: { label: "Talk to Nu",       actionId: "chat" },
            tertiary:  { label: "Not now",          actionId: "dismiss" },
          },
    ],
  };

  return {
    type: "Shell",
    eyebrow: `How are you feeling, ${patient.firstName}?`,
    title: "Side-effect check-in",
    subtitle: patient.medication ? `${patient.medication.name} ${patient.medication.dose} · Week ${patient.medication.week}` : undefined,
    headerRight: { chip: { label: severe ? "Escalation" : "Nu ready", tone: severe ? "danger" : "success" } },
    footerNote: "Treatment-experience area · escalates to coach at severity ≥ 4",
    child: inner,
  };
}

// -----------------------------------------------------------------------------
// Engagement Nudge
// -----------------------------------------------------------------------------
function buildEngagementNudge(patient: PatientContext, ctx: WidgetContext): SpecNode {
  const days = ctx.behavioral.daysSinceLastLog ?? 9;
  return {
    type: "Shell",
    eyebrow: `Welcome back, ${patient.firstName}`,
    title: `It's been ${days} days.`,
    subtitle: "No streak lost. No badge revoked. Just glad you're here.",
    headerRight: { chip: { label: "Drift detected", tone: "warning" } },
    footerNote: "Engagement use case · re-entry over restart",
    child: {
      type: "Column", gap: 3,
      children: [
        { type: "Message", from: "nu",
          body: `"Life happens. I'm not going to guilt you about the gap — I'm going to make it easy to step back in."`,
          tone: "info" },
        {
          type: "ChoiceRow",
          primary:   { label: "Quick 30-sec log →",   actionId: "quick-log" },
          secondary: { label: "Talk to my coach",     actionId: "handoff" },
          tertiary:  { label: "Take a longer break",  actionId: "break" },
        },
      ],
    },
  };
}

// -----------------------------------------------------------------------------
// Refill Friction
// -----------------------------------------------------------------------------
function buildRefill(patient: PatientContext, ctx: WidgetContext): SpecNode {
  const days = ctx.access.daysMedicationLeft ?? 4;
  const urgent = days <= 5;
  const blocker = ctx.access.priorAuthStatus === "pending"
    ? "Prior auth pending — insurance response expected in 48 h"
    : ctx.access.priorAuthStatus === "denied"
    ? "Prior auth denied — appeal or coach handoff needed"
    : "Refill scheduled — no action needed";

  return {
    type: "Shell",
    eyebrow: `${patient.firstName}, your ${patient.medication?.name ?? "medication"} is running low`,
    title: `${days} days left`,
    subtitle: patient.medication ? `${patient.medication.name} ${patient.medication.dose} · weekly` : undefined,
    headerRight: { chip: { label: urgent ? "Action needed" : "Heads up", tone: urgent ? "danger" : "warning" } },
    footerNote: "Access use case · Nu routes to pharmacy / coupon / coach (never fills prescriptions)",
    child: {
      type: "Column", gap: 3,
      children: [
        { type: "FactRows",
          items: [
            { icon: "⚠️",  label: "Blocker",    value: blocker, tone: "warning" },
            { icon: "💊", label: "Medication", value: patient.medication ? `${patient.medication.name} ${patient.medication.dose}` : "—" },
            { icon: "🎟", label: "Coupon",     value: ctx.access.couponEligible ? "Zepbound Savings Card — $469 off" : "Not eligible" },
          ] },
        { type: "Message", from: "nu",
          body: `${patient.firstName}, three ways members like you usually unblock this. Pick whichever fits your day.`,
          tone: "info" },
        {
          type: "ChoiceRow",
          primary:   { label: "Call pharmacy",       actionId: "call-pharmacy" },
          secondary: { label: "Apply coupon",         actionId: "coupon" },
          tertiary:  { label: "Talk to Maya",         actionId: "handoff" },
        },
      ],
    },
  };
}

// -----------------------------------------------------------------------------
// Glucose Spike
// -----------------------------------------------------------------------------
function buildGlucoseSpike(patient: PatientContext, ctx: WidgetContext): SpecNode {
  const peak = ctx.clinical.lastGlucosePeak ?? 214;

  return {
    type: "Shell",
    eyebrow: `${patient.firstName}, one big spike yesterday`,
    title: `Lunch peaked at ${peak}`,
    subtitle: "Peak targets under 155 for most GLP-1 members at your dose.",
    headerRight: { chip: { label: "Post-meal 12:00-15:00", tone: "warning" } },
    footerNote: "Clinical insight · levers, not prescriptions",
    child: {
      type: "Column", gap: 3,
      children: [
        { type: "Chart",
          eyebrow: "Yesterday's lunch curve",
          yMin: 80, yMax: 240,
          targetBand: { min: 70, max: 155, label: "TARGET" },
          xLabels: ["12:00", "13:00", "14:00", "15:00"],
          series: [
            { label: "Yesterday", color: "danger",
              values: [102, 108, 128, 168, 199, peak, 205, 188, 168, 152, 140, 128, 118],
              marker: { at: 5, label: `${peak}` } },
            { label: "Aug 22 (calm)", color: "success", dashed: true,
              values: [96, 99, 104, 118, 132, 141, 138, 128, 120, 114, 108, 102, 98] },
          ] },
        { type: "StatGrid",
          items: [
            { label: "Peak",         value: `${peak}`, tone: "danger" },
            { label: "Above 155 for", value: "78 min", tone: "warning" },
            { label: "Meal",          value: "Rice + curry", tone: "neutral" },
          ] },
        { type: "Message", from: "nu", tone: "info",
          body: "Members like you cut spikes 30-40% with veggies-first or a 10-min post-lunch walk. Pick a lever for tomorrow?" },
        {
          type: "ChoiceRow",
          primary:   { label: "Veggies first, rice last",  actionId: "lever-order" },
          secondary: { label: "10-min walk after lunch",   actionId: "lever-walk" },
          tertiary:  { label: "Not now",                   actionId: "dismiss" },
        },
      ],
    },
  };
}

// -----------------------------------------------------------------------------
// Dispatcher — the equivalent of a DB template lookup
// -----------------------------------------------------------------------------
export function buildSpec(id: WidgetId, patient: PatientContext, ctx: WidgetContext, variant: WidgetVariantId): SpecNode {
  switch (id) {
    case "best-day-mirror":     return buildBestDayMirror(patient, ctx, variant);
    case "side-effect-checkin": return buildSideEffect(patient, ctx);
    case "engagement-nudge":    return buildEngagementNudge(patient, ctx);
    case "refill-friction":     return buildRefill(patient, ctx);
    case "glucose-spike":       return buildGlucoseSpike(patient, ctx);
  }
}

// Standard action payload table — what an event fires on the client
const ACTIONS: Record<string, { emit: any; payload?: Record<string, unknown> }> = {
  "try":            { emit: "action:taken",      payload: { choice: "try" } },
  "adjust":         { emit: "action:taken",      payload: { choice: "adjust" } },
  "dismiss":        { emit: "action:taken",      payload: { choice: "dismiss" } },
  "log":            { emit: "data:collected",    payload: { kind: "log" } },
  "chat":           { emit: "action:taken",      payload: { choice: "chat" } },
  "handoff":        { emit: "coach:handoff",     payload: {} },
  "quick-log":      { emit: "data:collected",    payload: { kind: "quick-log" } },
  "break":          { emit: "action:taken",      payload: { choice: "break" } },
  "call-pharmacy":  { emit: "navigation:request", payload: { target: "dialer" } },
  "coupon":         { emit: "action:taken",       payload: { choice: "coupon" } },
  "lever-order":    { emit: "data:collected",     payload: { commit: "veggies-first" } },
  "lever-walk":     { emit: "data:collected",     payload: { commit: "post-lunch-walk" } },
};

// -----------------------------------------------------------------------------
// Full spec assembly — the API's response payload
// -----------------------------------------------------------------------------
export function assembleSpec(
  ranked: ScoringResult,
  patient: PatientContext,
  ctx: WidgetContext,
  tenant: string,
): WidgetSpec {
  const layout = buildSpec(ranked.widgetId, patient, ctx, ranked.variant);

  return {
    specVersion: "1.0",
    widgetId: ranked.widgetId,
    variant: ranked.variant,
    layout,
    actions: ACTIONS,
    meta: {
      renderedAtIso: nowIso(),
      ttlSec: 300,
      ruleId: `${ranked.widgetId}.${ranked.variant}`,
      reasons: ranked.reasons.slice(0, 5),
      tenant,
      patientId: patient.patientId,
    },
  };
}
