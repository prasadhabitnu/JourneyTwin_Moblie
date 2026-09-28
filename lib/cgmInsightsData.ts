/**
 * CGM Insights Explorer — data for all 5 lenses.
 * Anchored on Sally's demo profile so numbers match /journey, /twin, and /coach.
 */

// ============================================================================
// LENS 1: Now
// ============================================================================
export const NOW = {
  latestReading: 108,       // mg/dL
  deltaFrom30MinAgo: -2,    // steady
  trendArrow: "steady" as "steady" | "rising" | "falling",
  sensorQuality: "high" as "high" | "medium" | "low",
  tirNow: 87,
  tirTarget: 95,
  // Last 3 hours (in 15-min bins from -3h to now)
  last3h: [116, 118, 122, 118, 112, 108, 106, 108, 110, 112, 108, 108],
  // Forecast next 3 hours (mean + upper/lower bound)
  forecast: {
    mean:  [110, 112, 114, 118, 122, 120, 116, 112, 110, 108, 106, 108],
    upper: [118, 122, 128, 134, 138, 138, 132, 126, 122, 118, 116, 118],
    lower: [102, 104, 102, 104, 108, 106, 102, 100,  98,  98,  96,  98],
  },
  nuNarrative:
    "You're steady at 108 mg/dL. In the next 3 hours, I expect you to hold. If you skip snacks, high stays under 130.",
};

// ============================================================================
// LENS 2: Patterns (4 pattern cards)
// ============================================================================

// Dawn phenomenon — average glucose by hour, 3–7 AM window
export const DAWN = {
  hours: ["3 AM", "4 AM", "5 AM", "6 AM", "7 AM"],
  values: [96, 98, 104, 118, 128],
  peakDelta: 32,
  insight: "Your morning rise is ~32 mg/dL, mostly cortisol-driven. Not adjustable, but predictable.",
};

// Post-meal fingerprint — 3 typical meals with peak + AUC
export const MEALS = [
  { name: "Dosa breakfast",     peak: 178, aucRel: 2.1, verdict: "spikes", color: "#B91C1C" },
  { name: "Eggs + spinach",     peak: 138, aucRel: 1.0, verdict: "steady", color: "#059669" },
  { name: "Fiber-first dinner", peak: 148, aucRel: 1.2, verdict: "good",   color: "#4F5FE5" },
];

// Exercise ROI — post-dinner walks
export const EXERCISE = {
  noWalkPeak:  178,
  withWalkPeak: 152,
  averageDrop:  22,   // mg/dL peak reduction
  daysStudied:  14,
  insight: "A 20-min post-dinner walk cuts your peak by 22 mg/dL on average.",
};

// Sleep × fasting glucose — 7 recent nights
export const SLEEP = [
  { hours: 5.8, fasting: 128 },
  { hours: 6.1, fasting: 122 },
  { hours: 6.5, fasting: 118 },
  { hours: 7.0, fasting: 112 },
  { hours: 7.3, fasting: 108 },
  { hours: 7.5, fasting: 104 },
  { hours: 7.8, fasting: 100 },
];

// ============================================================================
// LENS 3: Best Day (Wed Jul 1 = 99% TIR)
// ============================================================================
export const BEST_DAY = {
  date: "Wed, Jul 1",
  tir: 99,
  meanGlucose: 118,
  // Full-day curve, hourly (8 AM → 10 PM = 15 points)
  curve: [110, 118, 132, 128, 118, 122, 138, 128, 118, 138, 148, 132, 118, 108, 102],
  hours: ["8", "9", "10", "11", "12", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p"],
  recipe: [
    "Eggs + spinach breakfast (protein-first)",
    "20-min walk within 25 min of finishing dinner",
    "8 glasses of water throughout the day",
    "7.8 hours of sleep the night before",
    "No afternoon snack; light 4 PM tea",
  ],
  // Today's curve overlay
  today: [112, 122, 148, 138, 128, 132, 148, 138, 128, 148, 168, 158, 138, 122, 112],
  matchScore: 78, // %
};

// ============================================================================
// LENS 4: What Changed (weekly attribution)
// ============================================================================
export const WEEKLY = {
  weeks: ["Wk-4", "Wk-3", "Wk-2", "This week"],
  tir:   [71, 76, 82, 87],
  netDelta: +5, // pp vs last week
  causes: [
    { feature: "Evening walks",      change: "3 → 5",       contribution: +4.2, color: "#059669" },
    { feature: "Sleep average",      change: "6.9h → 7.3h", contribution: +2.1, color: "#4F5FE5" },
    { feature: "Missed doses",       change: "2 → 0",       contribution: +1.8, color: "#7C3AED" },
    { feature: "Stress 4+ days",     change: "1 → 1",       contribution: -0.6, color: "#B45309" },
    { feature: "High-carb dinners",  change: "3 → 2",       contribution: -0.5, color: "#EC4899" },
  ],
  nuNarrative:
    "The 5-point lift this week is almost all walks. Your Sunday dose miss cost you about 2 points last week — now zero.",
};

// ============================================================================
// LENS 5: Ahead (multi-scenario forecast)
// ============================================================================
export const SCENARIOS = [
  {
    id: "keep",
    label: "Keep going",
    tag: "Baseline",
    color: "#4F5FE5",
    projectedTir: 88,
    delta: +1,
    description: "If you stay on the current pattern.",
    curve: [87, 88, 88, 89, 88, 89, 88],
  },
  {
    id: "walks-6",
    label: "Add one more walk (6/wk)",
    tag: "Recommended",
    color: "#059669",
    projectedTir: 92,
    delta: +5,
    description: "One additional evening walk moves you above target range 92% of the time.",
    curve: [87, 88, 89, 90, 91, 92, 92],
  },
  {
    id: "reminder",
    label: "Reset Sunday reminder",
    tag: "Nu suggests",
    color: "#7C3AED",
    projectedTir: 89,
    delta: +2,
    description: "Saturday-evening dose reminder eliminates the Sunday skip pattern.",
    curve: [87, 88, 88, 89, 89, 89, 89],
  },
];

export const NEXT_WEEK_HEADLINE = {
  current: 87,
  targetFloor: 90,
  weeksToTarget: 2,
  narrative:
    "Your current pattern gets you to 88% next week. The recommended scenario (adding one walk) hits your 90%+ target sooner.",
};
