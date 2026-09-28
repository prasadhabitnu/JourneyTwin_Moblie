/**
 * ringSimData — 72-hour simulation of an 8-parameter health ring for Sally,
 * with an embedded early-illness anomaly cluster (~ hour 28-60) that Fathom's
 * AI layer detects, root-causes, and predicts. Drives the /health-ring POC.
 */

// ============================================================================
// Types
// ============================================================================
export type Param = "hr" | "hrv" | "sleep" | "spo2" | "resp" | "temp" | "activity" | "stress";
export type Severity = "normal" | "watch" | "warning" | "critical";
export type NuActionKind = "insight" | "nudge" | "converse" | "escalate" | "company";

export interface ParamDef {
  id: Param;
  label: string;
  unit: string;
  format: (v: number) => string;
  baseline: number;
  // Directional: does a *higher* value mean worse health for this param?
  higherIsWorse: boolean;
  // Bands as absolute values (min, max). Outside these bands escalates severity.
  normal:   [number, number];
  watch:    [number, number];
  warning:  [number, number];
  // Icon: SVG path fragment (rendered inside a 24x24 viewBox with stroke)
  iconPath: string;
  color: string;
}

export interface Anomaly {
  detectedAt: number;
  peakAt: number;
  resolvedBy: number;
  paramsInvolved: Param[];
  headline: string;
  rootCause: {
    hypothesis: string;
    confidence: number;                                     // 0..100
    factors: Array<{ param: Param; delta: string; note: string }>;
  };
  prediction: Array<{
    at: number;                                             // hour when this prediction was made
    outcome: string;
    horizon: string;
    likelihood: number;
  }>;
}

export interface NuAction {
  at: number;
  kind: NuActionKind;
  headline: string;
  detail: string;
  memberMessage?: string;
}

// ============================================================================
// The 8 ring parameters (Sally's baselines + normal bands)
// ============================================================================
export const PARAMS: ParamDef[] = [
  { id: "hr",       label: "Heart rate",    unit: "bpm", baseline: 62, higherIsWorse: true,
    normal: [55, 75], watch: [50, 82], warning: [45, 92],
    format: v => `${Math.round(v)}`,
    iconPath: "M12 21s-7-4.5-9-9c-1.4-3 .3-7 4-7 2 0 4 1.5 5 3 1-1.5 3-3 5-3 3.7 0 5.4 4 4 7-2 4.5-9 9-9 9z",
    color: "#EF4444" },
  { id: "hrv",      label: "HRV",           unit: "ms",  baseline: 42, higherIsWorse: false,
    normal: [36, 55], watch: [30, 60], warning: [24, 65],
    format: v => `${Math.round(v)}`,
    iconPath: "M2 12h3l2-6 4 12 3-9 3 6 2-3h3",
    color: "#0EA5A4" },
  { id: "sleep",    label: "Sleep",         unit: "h",   baseline: 7.3, higherIsWorse: false,
    normal: [6.8, 8.2], watch: [6.0, 8.8], warning: [5.2, 9.5],
    format: v => `${v.toFixed(1)}`,
    iconPath: "M20 15A9 9 0 1 1 9 4a7 7 0 0 0 11 11z",
    color: "#7C3AED" },
  { id: "spo2",     label: "SpO2",          unit: "%",   baseline: 97, higherIsWorse: false,
    normal: [95, 100], watch: [93, 100], warning: [90, 100],
    format: v => `${Math.round(v)}`,
    iconPath: "M12 3v6M12 21v-3M4 12h6M20 12h-3M6.3 6.3l4.2 4.2M17.7 17.7l-4.2-4.2M6.3 17.7l4.2-4.2M17.7 6.3l-4.2 4.2",
    color: "#0EA5E9" },
  { id: "resp",     label: "Respiration",   unit: "br/min", baseline: 14, higherIsWorse: true,
    normal: [12, 17], watch: [11, 19], warning: [10, 22],
    format: v => `${v.toFixed(1)}`,
    iconPath: "M2 12h2c1 0 1-3 2-3s1 6 2 6 1-4 2-4 1 3 2 3 1-4 2-4 1 2 2 2h3",
    color: "#F59E0B" },
  { id: "temp",     label: "Skin temp Δ",   unit: "°C",  baseline: 0.0, higherIsWorse: true,
    normal: [-0.3, 0.3], watch: [-0.5, 0.5], warning: [-0.7, 0.7],
    format: v => `${v > 0 ? "+" : ""}${v.toFixed(1)}`,
    iconPath: "M14 4v10a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z",
    color: "#E11D48" },
  { id: "activity", label: "Activity",      unit: "steps", baseline: 300, higherIsWorse: false,
    normal: [180, 500], watch: [100, 700], warning: [50, 900],
    format: v => `${Math.round(v / 1) * 1}`,
    iconPath: "M13 4l-2 6-4 1 5 4-1 5 4-3 4 3-1-5 5-4-6-1z",
    color: "#059669" },
  { id: "stress",   label: "Stress",        unit: "/5",  baseline: 2, higherIsWorse: true,
    normal: [1, 3], watch: [1, 4], warning: [1, 5],
    format: v => `${v.toFixed(1)}`,
    iconPath: "M13 2L3 14h7l-1 8 11-14h-7z",
    color: "#DC2626" },
];

// ============================================================================
// Time-series generation (72 hourly points per param)
// ============================================================================
const HOURS = 72;

// Deterministic pseudo-random per (param, hour) for reproducible sparklines
function noise(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = ((h >>> 0) % 1000) / 1000;
  return (n - 0.5);
}

// Circadian curve — 0..1 wave over a 24-hour day
function circadian(h: number, phase = 0): number {
  const angle = ((h % 24) / 24) * Math.PI * 2 + phase;
  return Math.sin(angle);
}

// The anomaly overlay — one big cluster building from hour 28 → peak 55 → recovering by 72
function anomalyEnvelope(h: number): number {
  if (h < 28) return 0;
  if (h < 55) return (h - 28) / (55 - 28);   // 0 → 1 climb
  if (h < 72) return 1 - (h - 55) / (72 - 55) * 0.7; // slow recovery
  return 0.3;
}

// Per-param anomaly direction + magnitude
function anomalyShift(param: Param, h: number): number {
  const env = anomalyEnvelope(h);
  switch (param) {
    case "hr":       return  12 * env;
    case "hrv":      return -14 * env;
    case "sleep":    return  -1.1 * env;
    case "spo2":     return  -2 * env;
    case "resp":     return   4 * env;
    case "temp":     return   0.6 * env;
    case "activity": return -180 * env;
    case "stress":   return   2 * env;
  }
}

function generateSeries(paramId: Param): number[] {
  const p = PARAMS.find(x => x.id === paramId)!;
  const out: number[] = [];
  for (let h = 0; h < HOURS; h++) {
    // circadian shape varies by param
    let circ = 0;
    switch (paramId) {
      case "hr":       circ = circadian(h, -1) * 6; break;
      case "hrv":      circ = circadian(h, 2) * 5; break;
      case "sleep":    circ = 0; break;
      case "spo2":     circ = -Math.abs(circadian(h, 0)) * 0.5; break;
      case "resp":     circ = circadian(h, -1) * 1; break;
      case "temp":     circ = circadian(h, -1) * 0.15; break;
      case "activity": circ = Math.max(0, circadian(h, -1)) * 240; break;
      case "stress":   circ = circadian(h, -1) * 0.5; break;
    }
    const n = noise(`${paramId}-${h}`) * (paramId === "activity" ? 60 : paramId === "temp" ? 0.08 : 2);
    const value = p.baseline + circ + n + anomalyShift(paramId, h);
    out.push(value);
  }
  return out;
}

export const STREAMS: Record<Param, number[]> =
  PARAMS.reduce((acc, p) => ({ ...acc, [p.id]: generateSeries(p.id) }), {} as Record<Param, number[]>);

// ============================================================================
// Severity classification at a moment
// ============================================================================
export function severityAt(param: Param, hour: number): Severity {
  const p = PARAMS.find(x => x.id === param)!;
  const v = STREAMS[param][Math.max(0, Math.min(HOURS - 1, Math.round(hour)))];
  const inRange = (val: number, r: [number, number]) => val >= r[0] && val <= r[1];
  if (inRange(v, p.normal))   return "normal";
  if (inRange(v, p.watch))    return "watch";
  if (inRange(v, p.warning))  return "warning";
  return "critical";
}

export function currentValue(param: Param, hour: number): number {
  return STREAMS[param][Math.max(0, Math.min(HOURS - 1, Math.round(hour)))];
}

/** last-24h slice of the series (right-anchored to `hour`) for sparklines */
export function windowSlice(param: Param, hour: number, windowH = 24): number[] {
  const end = Math.max(0, Math.min(HOURS - 1, Math.round(hour)));
  const start = Math.max(0, end - windowH + 1);
  return STREAMS[param].slice(start, end + 1);
}

// ============================================================================
// Nu Health Index — 0-10 star score computed from current severity
// (Shared between /health-ring and the journey Ring-Companion step.)
// ============================================================================
const SEV_WEIGHT: Record<Severity, number> = { normal: 1.25, watch: 1.0, warning: 0.5, critical: 0 };

export function nuHealthIndexAt(hour: number): { score: number; label: string; tint: string } {
  const total = PARAMS.reduce((sum, p) => sum + SEV_WEIGHT[severityAt(p.id, hour)], 0);
  const score = Math.round(total * 10) / 10;
  const label =
    score >= 9.0 ? "Excellent" :
    score >= 7.5 ? "Steady"    :
    score >= 6.0 ? "Watch"     :
    score >= 4.0 ? "Recover"   : "Care";
  const tint =
    score >= 9.0 ? "#059669" :
    score >= 7.5 ? "#0EA5A4" :
    score >= 6.0 ? "#F59E0B" :
    score >= 4.0 ? "#F97316" : "#DC2626";
  return { score, label, tint };
}

// ============================================================================
// "Good Health Times" — spans where all 8 params were in the normal band,
// with hand-authored activity attribution (what Sally did during them).
// ============================================================================
export interface GoodSpan {
  id: string;
  startH: number;
  endH: number;                // exclusive
  scoreAvg: number;            // 0..10 NHI over the span
  dayLabel: string;            // e.g., "Monday evening"
  timeLabel: string;           // e.g., "8 PM - 2 AM"
  activities: string[];        // what Sally did — the "recipe" ingredients
  vitalsBrief: string;         // what her vitals looked like
}

export interface HealthRecipe {
  id: string;
  ingredients: string[];       // "Walk after dinner" · "Phone off by 9 PM" · "Sleep by 10:30"
  outcome: string;             // "All-green next morning · HRV +6 ms above baseline"
  reliability: number;         // 0..100 · how often this recipe leads to a good span
  matchedSpans: number;        // # of past spans that fit this recipe
}

// The 3 highest-scoring continuous windows in Sally's 72-hour stream.
// Hours 0-27 = Mon 8 AM → Tue 11 AM baseline; 28-60 = anomaly; 60-72 = recovery.
export const GOOD_SPANS: GoodSpan[] = [
  {
    id: "mon-evening",
    startH: 12, endH: 18,
    scoreAvg: 9.8,
    dayLabel: "Monday evening → early Tuesday",
    timeLabel: "8 PM - 2 AM",
    activities: [
      "20-min walk after dinner",
      "Herbal tea · phone-off by 9 PM",
      "Sleep started 10:15 PM · full 7h 45m",
    ],
    vitalsBrief: "All 8 in range · HRV peaked 51 ms overnight · deep-sleep +18% vs 30-day avg",
  },
  {
    id: "tue-morning",
    startH: 20, endH: 27,
    scoreAvg: 9.6,
    dayLabel: "Tuesday morning",
    timeLabel: "4 AM - 11 AM",
    activities: [
      "Woke on sleep cycle · 7h 42m",
      "Hydrated: 2 glasses of water before 9 AM",
      "Sunlight walk 8:30 AM · 12 min",
    ],
    vitalsBrief: "Resting HR 58 · HRV 48 · morning skin-temp on baseline · stress 1/5",
  },
  {
    id: "thu-recovery",
    startH: 66, endH: 72,
    scoreAvg: 9.3,
    dayLabel: "Thursday morning · recovery",
    timeLabel: "2 AM - 8 AM",
    activities: [
      "8h sleep · extended deep-sleep phase",
      "Sick-day rest · no forced activity",
      "Warm broth + electrolytes overnight",
    ],
    vitalsBrief: "All parameters climbing back · immune activity winding down · HRV +8 ms in 6h",
  },
];

// Patterns Nu extracts across the good spans — the "recipes" for feeling good.
export const HEALTH_RECIPES: HealthRecipe[] = [
  {
    id: "wind-down-evening",
    ingredients: ["Walk after dinner", "Phone off by 9 PM", "Sleep by 10:30"],
    outcome: "All-green next morning · HRV +6 ms above your baseline",
    reliability: 82,
    matchedSpans: 11,
  },
  {
    id: "gentle-morning",
    ingredients: ["Wake with sunlight", "Hydrate before 9 AM", "Protein-first breakfast"],
    outcome: "All-green through 2 PM · stress score -1 point",
    reliability: 74,
    matchedSpans: 9,
  },
];

// ============================================================================
// The anomaly cluster
// ============================================================================
export const ANOMALY: Anomaly = {
  detectedAt: 30,
  peakAt: 54,
  resolvedBy: 72,
  paramsInvolved: ["hrv", "temp", "resp", "sleep"],
  headline: "Early autonomic-stress signature",
  rootCause: {
    hypothesis: "Prodromal URI (upper respiratory infection)",
    confidence: 82,
    factors: [
      { param: "hrv",   delta: "-24% vs 7-day baseline",     note: "Autonomic recovery capacity dropping — 3rd derivative crossed threshold" },
      { param: "temp",  delta: "+0.4-0.6°C skin overnight",  note: "Sustained elevation across 3 sleep cycles — immune activation pattern" },
      { param: "resp",  delta: "+3 breaths/min baseline",    note: "Nocturnal respiratory rate climb typical of URI prodrome" },
      { param: "sleep", delta: "efficiency -12%",             note: "Fragmented deep-sleep phases — recovery is impaired" },
    ],
  },
  prediction: [
    { at: 30, outcome: "Early autonomic stress · watch state",     horizon: "next 24 h",    likelihood: 68 },
    { at: 40, outcome: "URI onset likely",                          horizon: "next 24-36 h", likelihood: 78 },
    { at: 52, outcome: "URI onset imminent",                        horizon: "next 12-24 h", likelihood: 91 },
    { at: 60, outcome: "Confirmed illness · recovery arc begun",    horizon: "48-72 h to baseline", likelihood: 88 },
  ],
};

// ============================================================================
// Nu's action flow — 5 roles across the anomaly window
// ============================================================================
export const NU_ACTIONS: NuAction[] = [
  {
    at: 30, kind: "insight",
    headline: "Signal flagged · coach console only",
    detail: "Fathom detects HRV drift + temp elevation. Confidence not yet high enough to nudge the member. Logs to Maya's queue at low priority.",
  },
  {
    at: 40, kind: "nudge",
    headline: "Push · pre-illness rest suggestion",
    detail: "Confidence crossed 78%. Nu picks a gentle template — no alarm, no diagnosis. Sent at Sally's typical evening app-open window.",
    memberMessage: "Your body's showing early stress signals. Extra rest tonight would help — skip the morning workout if you can.",
  },
  {
    at: 45, kind: "converse",
    headline: "In-app chat · Sally asks what's happening",
    detail: "Sally opens the app after seeing the nudge. Nu explains what it's seeing — HRV pattern, temp trend, cohort match. Suggests specific evening tactics.",
    memberMessage: "3 nights of HRV drift + a small skin-temp climb usually means your immune system is doing extra work. Warm shower, early bed, extra water. I'll check in tomorrow.",
  },
  {
    at: 52, kind: "escalate",
    headline: "Coach + physician alerted",
    detail: "Respiratory rate crossed watch threshold + prediction confidence at 91%. Maya is paged with the full trace. Virtual physician cc'd for possible Rx pre-authorization.",
  },
  {
    at: 60, kind: "company",
    headline: "Companion mode · continuous accompaniment",
    detail: "Full Companion foreground on Sally's Insights tab. Continuous check-ins every 4 h. Sleep-window optimization. Nu is 'in the room' for the illness arc.",
    memberMessage: "I'll stay close through this. Check-ins at 8, 12, 4, 8. Wake me if anything shifts.",
  },
];
