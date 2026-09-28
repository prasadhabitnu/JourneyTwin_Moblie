/**
 * CGM data — deterministic 14-day continuous-glucose stream + curated
 * lifestyle annotations. Feeds pages/cgm-insights.tsx.
 *
 * A CGM reading arrives every 15 minutes → 96 readings/day → 1,344 over 14 days.
 * Values are in mg/dL. Normal target range (ADA): 70–180.
 *
 * Sandy R. (P100967) is the demo hero — her stream is hand-curated to tell
 * the story: post-rice-lunch spikes early in the week; flat, in-range curves
 * on days she walked; dawn-phenomenon mornings; overall improvement as her
 * GLP-1 dose settled.
 */

// ---------- types ----------

export interface CgmReading {
  t: number;        // epoch ms
  glucose: number;  // mg/dL
}

export type AnnotationKind =
  | "meal"
  | "activity"
  | "hydration"
  | "medication"
  | "sleep";

export interface CgmAnnotation {
  t: number;                     // epoch ms
  kind: AnnotationKind;
  label: string;                 // e.g., "Rice bowl (1 cup)"
  attribution: string;           // e.g., "Post-meal spike attributed to refined carbs"
  glucoseDelta?: number;         // e.g., +85 mg/dL rise in the 90 min after
  outcome: "spike" | "flat" | "drop" | "context";
  tone: "warn" | "good" | "info";
}

export interface DayStats {
  date: string;                  // "Mon Jun 16"
  avg: number;
  min: number;
  max: number;
  timeInRange: number;           // % 70–180
  timeAbove: number;             // % > 180
  timeBelow: number;             // % < 70
  cv: number;                    // coefficient of variation, %
  readings: CgmReading[];
  annotations: CgmAnnotation[];
}

export interface CgmStream {
  patientId: string;
  days: DayStats[];              // 14 days, day-14 = today
  // Aggregate stats over the full 14-day window:
  overall: {
    avg: number;                 // mean glucose, mg/dL
    gmi: number;                 // Glucose Management Indicator (est. HbA1c), %
    cv: number;                  // variability, %
    timeInRange: number;         // %
    timeAbove: number;           // %
    timeBelow: number;           // %
    timeVeryHigh: number;        // % > 250
    timeVeryLow: number;         // % < 54
  };
}

// ---------- deterministic PRNG (same seed strategy as patientData) ----------

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Turn "P100967" into a numeric seed
function seedForPatient(id: string): number {
  return id.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 20260506);
}

// Gaussian noise via Box–Muller
function gauss(rand: () => number, mean = 0, std = 1): number {
  const u1 = Math.max(1e-9, rand());
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

// ---------- Sandy's demo storyline (curated per day) ----------

/**
 * The narrative arc across 14 days for Sandy R.:
 *   Day 1–3   Rocky start — post-rice-lunch spikes, low water, minimal walking.
 *   Day 4–7   Coach intervention lands — walks after dinner become habit.
 *   Day 8–10  Dose adjustment — some GI side-effects, but glucose flattens.
 *   Day 11–14 Steady-state — TIR climbs, morning highs shrink.
 */

interface DayShape {
  narrative: string;
  fasting: number;                        // baseline morning glucose
  lunchCarbBurden: number;                // spike magnitude added around noon
  walkBenefit: number;                    // drop magnitude around evening
  variabilityFactor: number;              // multiplier on noise σ
  events: Omit<CgmAnnotation, "t">[];     // events (times set below)
  eventHours: number[];                   // hour-of-day for each event
}

const SANDY_STORYLINE: DayShape[] = [
  // Day 1
  {
    narrative: "Rocky start — big rice lunch + no walk",
    fasting: 118, lunchCarbBurden: 85, walkBenefit: 5, variabilityFactor: 1.3,
    eventHours: [7.5, 12.2, 15.0, 19.5],
    events: [
      { kind: "medication", label: "GLP-1 injection (semaglutide 0.5mg)", attribution: "Weekly dose", outcome: "context", tone: "info" },
      { kind: "meal",       label: "Rice bowl + chicken curry (1.5 cups)", attribution: "Refined carbs — expected 60–90 min spike", outcome: "spike",  tone: "warn", glucoseDelta: 87 },
      { kind: "hydration",  label: "Only 3 glasses of water logged",         attribution: "Under hydration target (8) — variability likely to climb", outcome: "context", tone: "warn" },
      { kind: "meal",       label: "Pasta + garlic bread",                   attribution: "Second refined-carb hit late — sustained elevation", outcome: "spike", tone: "warn", glucoseDelta: 62 },
    ],
  },
  // Day 2
  {
    narrative: "Similar pattern — refined carbs, no post-meal walk",
    fasting: 121, lunchCarbBurden: 78, walkBenefit: 8, variabilityFactor: 1.2,
    eventHours: [7.0, 12.5, 19.0],
    events: [
      { kind: "meal",     label: "Bagel + cream cheese",              attribution: "Fasted overnight then quick carbs — sharp morning rise",       outcome: "spike", tone: "warn", glucoseDelta: 72 },
      { kind: "meal",     label: "Fried rice + spring rolls",         attribution: "Repeated refined-carb pattern from Day 1",                     outcome: "spike", tone: "warn", glucoseDelta: 78 },
      { kind: "meal",     label: "Pizza (2 slices)",                  attribution: "Late refined carbs — flat overnight expected but AUC high",    outcome: "spike", tone: "warn", glucoseDelta: 58 },
    ],
  },
  // Day 3
  {
    narrative: "First coach nudge — starts logging water",
    fasting: 116, lunchCarbBurden: 55, walkBenefit: 15, variabilityFactor: 1.0,
    eventHours: [7.5, 12.5, 15.5, 20.0],
    events: [
      { kind: "meal",     label: "Oatmeal + berries",                 attribution: "Complex carbs + fiber — gentler curve",                        outcome: "flat",  tone: "good", glucoseDelta: 32 },
      { kind: "meal",     label: "Sandwich + chips",                  attribution: "Moderate carb load — some spike but recovering",              outcome: "spike", tone: "warn", glucoseDelta: 58 },
      { kind: "hydration",label: "6 glasses water logged",             attribution: "Approaching hydration goal — variability easing",             outcome: "context", tone: "good" },
      { kind: "meal",     label: "Grilled chicken salad",              attribution: "Low-carb dinner — evening curve stays smooth",                outcome: "flat",  tone: "good", glucoseDelta: 18 },
    ],
  },
  // Day 4 — coach intervention lands
  {
    narrative: "Coach intervention lands — first post-dinner walk",
    fasting: 112, lunchCarbBurden: 48, walkBenefit: 28, variabilityFactor: 0.9,
    eventHours: [7.5, 12.5, 13.5, 19.0, 20.0],
    events: [
      { kind: "meal",     label: "Egg-white omelette + spinach",       attribution: "High-protein breakfast — flat morning",                       outcome: "flat", tone: "good", glucoseDelta: 15 },
      { kind: "meal",     label: "Chicken tikka + naan (½)",            attribution: "Half-portion of naan reduces spike vs Day 1 baseline",        outcome: "spike", tone: "warn", glucoseDelta: 52 },
      { kind: "activity", label: "20-min walk after lunch",             attribution: "Post-meal walk — expected 15–20% drop within 30 min",         outcome: "drop",  tone: "good", glucoseDelta: -22 },
      { kind: "meal",     label: "Grilled salmon + veg",                attribution: "Balanced protein-forward dinner",                             outcome: "flat",  tone: "good", glucoseDelta: 20 },
      { kind: "activity", label: "30-min evening walk (2.1 km)",        attribution: "New habit forming — walking cited by coach",                  outcome: "drop",  tone: "good", glucoseDelta: -25 },
    ],
  },
  // Day 5
  {
    narrative: "Habit sticks — walk + hydration on target",
    fasting: 108, lunchCarbBurden: 45, walkBenefit: 30, variabilityFactor: 0.85,
    eventHours: [7.5, 12.5, 15.0, 20.0],
    events: [
      { kind: "hydration",label: "8 glasses water goal met",            attribution: "Hydration goal met — expect lower variability",              outcome: "context", tone: "good" },
      { kind: "meal",     label: "Quinoa bowl + roasted veg",           attribution: "Complex carbs + fiber — gentle midday curve",                outcome: "flat",  tone: "good", glucoseDelta: 38 },
      { kind: "activity", label: "10-min post-lunch stroll",            attribution: "Now becoming daily — glucose stays flat",                    outcome: "flat",  tone: "good", glucoseDelta: -8 },
      { kind: "activity", label: "30-min evening walk",                 attribution: "Consistent 3rd day of evening walks",                        outcome: "drop",  tone: "good", glucoseDelta: -28 },
    ],
  },
  // Day 6
  {
    narrative: "Injection day — mild GI, but glucose behaves",
    fasting: 106, lunchCarbBurden: 42, walkBenefit: 26, variabilityFactor: 0.9,
    eventHours: [8.0, 12.5, 20.0],
    events: [
      { kind: "medication", label: "GLP-1 injection (semaglutide 0.5mg)", attribution: "Weekly dose — Day 6 of cycle",                              outcome: "context", tone: "info" },
      { kind: "meal",       label: "Lentil soup + salad",                   attribution: "Fiber-forward lunch — flat curve",                          outcome: "flat", tone: "good", glucoseDelta: 22 },
      { kind: "activity",   label: "25-min evening walk",                  attribution: "Habit persists",                                              outcome: "drop", tone: "good", glucoseDelta: -20 },
    ],
  },
  // Day 7 — end of week 1 recap
  {
    narrative: "End of week 1 — TIR up from 41% → 68%",
    fasting: 104, lunchCarbBurden: 50, walkBenefit: 24, variabilityFactor: 0.9,
    eventHours: [7.5, 12.5, 19.5],
    events: [
      { kind: "meal",     label: "Greek yogurt + walnuts",              attribution: "Protein + healthy fats — flat morning",                       outcome: "flat", tone: "good", glucoseDelta: 12 },
      { kind: "meal",     label: "Turkey wrap + apple",                 attribution: "Moderate carb — modest spike",                               outcome: "flat", tone: "good", glucoseDelta: 42 },
      { kind: "activity", label: "35-min evening walk (2.6 km)",        attribution: "Longest walk this week — glucose stays low",                 outcome: "drop", tone: "good", glucoseDelta: -22 },
    ],
  },
  // Day 8 — dose escalation
  {
    narrative: "Dose stepped up (1.0mg) — some nausea, glucose responds",
    fasting: 100, lunchCarbBurden: 40, walkBenefit: 25, variabilityFactor: 0.85,
    eventHours: [8.5, 12.5, 20.0],
    events: [
      { kind: "medication", label: "GLP-1 injection (semaglutide 1.0mg — new dose)", attribution: "Dose adjustment per physician (side-effect risk noted)", outcome: "context", tone: "info" },
      { kind: "meal",       label: "Skipped breakfast — mild nausea",        attribution: "GI side-effect from dose escalation",                          outcome: "context", tone: "warn" },
      { kind: "meal",       label: "Chicken + rice (½ portion)",              attribution: "Reduced appetite from dose — smaller portion",                  outcome: "flat", tone: "good", glucoseDelta: 30 },
      { kind: "activity",   label: "20-min walk",                             attribution: "Walked despite mild nausea",                                     outcome: "drop", tone: "good", glucoseDelta: -18 },
    ],
  },
  // Day 9
  {
    narrative: "Recovering from nausea — nice flat day",
    fasting: 98, lunchCarbBurden: 32, walkBenefit: 22, variabilityFactor: 0.75,
    eventHours: [7.5, 12.5, 20.0],
    events: [
      { kind: "meal",     label: "Egg-white omelette",                  attribution: "High-protein breakfast",                                       outcome: "flat", tone: "good", glucoseDelta: 12 },
      { kind: "meal",     label: "Chicken salad wrap",                  attribution: "Balanced lunch",                                                outcome: "flat", tone: "good", glucoseDelta: 30 },
      { kind: "activity", label: "30-min walk",                         attribution: "Habit continues",                                               outcome: "drop", tone: "good", glucoseDelta: -20 },
    ],
  },
  // Day 10
  {
    narrative: "Best day yet — TIR 84%",
    fasting: 96, lunchCarbBurden: 28, walkBenefit: 22, variabilityFactor: 0.7,
    eventHours: [7.5, 12.5, 15.0, 20.0],
    events: [
      { kind: "hydration",label: "8 glasses water goal met",            attribution: "Hydration habit locked in",                                    outcome: "context", tone: "good" },
      { kind: "meal",     label: "Salmon poke bowl",                    attribution: "Balanced macros — smooth midday curve",                        outcome: "flat", tone: "good", glucoseDelta: 28 },
      { kind: "activity", label: "15-min post-lunch stroll",             attribution: "Daily habit",                                                   outcome: "flat", tone: "good", glucoseDelta: -6 },
      { kind: "activity", label: "40-min evening walk (3.1 km)",         attribution: "Longest walk of the program",                                   outcome: "drop", tone: "good", glucoseDelta: -22 },
    ],
  },
  // Day 11
  {
    narrative: "Weekend — slightly higher variability",
    fasting: 98, lunchCarbBurden: 45, walkBenefit: 20, variabilityFactor: 0.85,
    eventHours: [9.0, 13.0, 19.5],
    events: [
      { kind: "sleep",    label: "Slept in — 8h 20m",                    attribution: "Longer sleep — no dawn-phenomenon rise",                       outcome: "context", tone: "good" },
      { kind: "meal",     label: "Brunch: eggs, avocado, small toast",    attribution: "Balanced brunch — moderate curve",                              outcome: "flat", tone: "good", glucoseDelta: 38 },
      { kind: "activity", label: "25-min walk",                          attribution: "Weekend habit sticking",                                        outcome: "drop", tone: "good", glucoseDelta: -18 },
    ],
  },
  // Day 12
  {
    narrative: "Family dinner — controlled portions win",
    fasting: 96, lunchCarbBurden: 40, walkBenefit: 22, variabilityFactor: 0.85,
    eventHours: [7.5, 12.5, 19.0, 20.5],
    events: [
      { kind: "meal",     label: "Toast + almond butter",               attribution: "Complex carbs + fat — steady morning",                          outcome: "flat", tone: "good", glucoseDelta: 22 },
      { kind: "meal",     label: "Chicken curry + rice (¾ portion)",     attribution: "Slightly larger portion — spike but manageable",                outcome: "spike", tone: "warn", glucoseDelta: 55 },
      { kind: "meal",     label: "Family dinner: paneer + roti (2)",     attribution: "Portion-controlled restaurant meal",                            outcome: "flat", tone: "good", glucoseDelta: 40 },
      { kind: "activity", label: "20-min walk after dinner",             attribution: "Habit even on social nights",                                    outcome: "drop", tone: "good", glucoseDelta: -18 },
    ],
  },
  // Day 13
  {
    narrative: "Injection day — third weekly dose",
    fasting: 94, lunchCarbBurden: 35, walkBenefit: 22, variabilityFactor: 0.75,
    eventHours: [7.5, 8.0, 12.5, 20.0],
    events: [
      { kind: "medication", label: "GLP-1 injection (semaglutide 1.0mg)", attribution: "Weekly dose — no side-effects this cycle",                     outcome: "context", tone: "info" },
      { kind: "meal",       label: "Overnight oats",                     attribution: "Complex carbs — flat morning",                                  outcome: "flat", tone: "good", glucoseDelta: 20 },
      { kind: "meal",       label: "Salmon + quinoa",                    attribution: "Balanced macros",                                                outcome: "flat", tone: "good", glucoseDelta: 30 },
      { kind: "activity",   label: "30-min walk",                        attribution: "Consistent daily habit",                                         outcome: "drop", tone: "good", glucoseDelta: -20 },
    ],
  },
  // Day 14 — today
  {
    narrative: "Today — 14-day TIR steady above 80%",
    fasting: 94, lunchCarbBurden: 32, walkBenefit: 22, variabilityFactor: 0.7,
    eventHours: [7.5, 12.5, 15.0, 20.0],
    events: [
      { kind: "meal",     label: "Greek yogurt + berries",              attribution: "Program-favorite breakfast",                                    outcome: "flat", tone: "good", glucoseDelta: 15 },
      { kind: "meal",     label: "Chicken bowl (grilled)",              attribution: "High-protein lunch — smooth curve",                            outcome: "flat", tone: "good", glucoseDelta: 28 },
      { kind: "hydration",label: "9 glasses water — over target",       attribution: "Consistently exceeding hydration goal",                        outcome: "context", tone: "good" },
      { kind: "activity", label: "35-min evening walk",                 attribution: "Session with Nu confirmed the walk — end-of-day dip",           outcome: "drop", tone: "good", glucoseDelta: -22 },
    ],
  },
];

// ---------- generation ----------

/**
 * Generate a 14-day CGM stream for a patient. Sandy R. (P100967) gets the
 * curated storyline above; other patients get a plausible but generic stream.
 */
// Pinned demo anchor — using a fixed date prevents Next.js hydration
// mismatches between SSR (server time) and client hydration (browser time).
// Sandy R.'s 14-day storyline is written to end on this date.
const DEMO_TODAY = new Date("2026-07-01T20:00:00Z");

export function generateCgmStream(patientId: string, today: Date = DEMO_TODAY): CgmStream {
  const rand = mulberry32(seedForPatient(patientId));
  const isSandy = patientId === "P100967";

  // Anchor "today" to 8pm local so the last day has a full curve
  const anchor = new Date(today);
  anchor.setHours(20, 0, 0, 0);

  const days: DayStats[] = [];
  const READINGS_PER_DAY = 96; // 15-minute cadence
  const MIN_PER_READING = 15;

  for (let d = 0; d < 14; d++) {
    const shape = isSandy ? SANDY_STORYLINE[d] : genericDayShape(d, rand);
    const dayStart = new Date(anchor);
    dayStart.setDate(dayStart.getDate() - (13 - d));
    dayStart.setHours(0, 0, 0, 0);

    const readings: CgmReading[] = [];

    // Build the curve with three additive components:
    //   1) baseline diurnal rhythm (dawn phenomenon + evening dip)
    //   2) meal-driven spikes (Gaussian bumps centered on event times)
    //   3) walk-driven drops (negative Gaussian bumps)
    // then add Gaussian noise scaled by variabilityFactor.
    const mealSpikes = shape.events
      .filter(e => e.outcome === "spike")
      .map((e, i) => ({
        centerHr: shape.eventHours[shape.events.indexOf(e)] ?? (12 + i),
        magnitude: e.glucoseDelta ?? shape.lunchCarbBurden,
        widthHr: 1.4,
      }));

    const walkDrops = shape.events
      .filter(e => e.outcome === "drop")
      .map(e => ({
        centerHr: shape.eventHours[shape.events.indexOf(e)] ?? 20,
        magnitude: Math.abs(e.glucoseDelta ?? shape.walkBenefit),
        widthHr: 1.0,
      }));

    for (let i = 0; i < READINGS_PER_DAY; i++) {
      const hr = (i * MIN_PER_READING) / 60;
      // Diurnal — dawn rise between 4–7am then settle; slight afternoon slump
      const dawn = 8 * Math.exp(-Math.pow(hr - 6, 2) / 3);
      const evening = -3 * Math.exp(-Math.pow(hr - 15.5, 2) / 8);
      let g = shape.fasting + dawn + evening;

      // Meal spikes
      for (const m of mealSpikes) {
        g += m.magnitude * Math.exp(-Math.pow(hr - (m.centerHr + 0.5), 2) / (2 * m.widthHr * m.widthHr));
      }
      // Walk drops
      for (const w of walkDrops) {
        g -= w.magnitude * Math.exp(-Math.pow(hr - (w.centerHr + 0.4), 2) / (2 * w.widthHr * w.widthHr));
      }
      // Noise
      g += gauss(rand, 0, 4.5 * shape.variabilityFactor);
      g = Math.max(55, Math.min(g, 260));

      const t = dayStart.getTime() + i * MIN_PER_READING * 60_000;
      readings.push({ t, glucose: Math.round(g) });
    }

    const annotations: CgmAnnotation[] = shape.events.map((ev, idx) => ({
      ...ev,
      t: dayStart.getTime() + Math.round((shape.eventHours[idx] ?? 12) * 60) * 60_000,
    }));

    days.push({
      ...computeDayStats(dayStart, readings),
      readings,
      annotations,
    });
  }

  return {
    patientId,
    days,
    overall: computeOverall(days),
  };
}

// ---------- helpers ----------

function computeDayStats(date: Date, readings: CgmReading[]): Omit<DayStats, "readings" | "annotations"> {
  const values = readings.map(r => r.glucose);
  const sum = values.reduce((a, v) => a + v, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const variance = values.reduce((a, v) => a + (v - avg) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  const cv = (std / avg) * 100;
  const inRange = values.filter(v => v >= 70 && v <= 180).length / values.length * 100;
  const above = values.filter(v => v > 180).length / values.length * 100;
  const below = values.filter(v => v < 70).length / values.length * 100;
  // timeZone: "UTC" — critical for SSR/hydration parity across server (usually UTC)
  // and client (browser's local TZ). Without this, Day-14 could format as "Wed, Jul 1"
  // on server and "Tue, Jun 30" on a client east of UTC.
  const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  return {
    date: dateStr,
    avg: Math.round(avg),
    min, max,
    timeInRange: Math.round(inRange),
    timeAbove: Math.round(above),
    timeBelow: Math.round(below),
    cv: Math.round(cv * 10) / 10,
  };
}

function computeOverall(days: DayStats[]): CgmStream["overall"] {
  const all: number[] = [];
  days.forEach(d => d.readings.forEach(r => all.push(r.glucose)));
  const sum = all.reduce((a, v) => a + v, 0);
  const avg = sum / all.length;
  const variance = all.reduce((a, v) => a + (v - avg) ** 2, 0) / all.length;
  const cv = (Math.sqrt(variance) / avg) * 100;
  // GMI = 3.31 + 0.02392 × mean_mg_dL (Bergenstal et al., 2018)
  const gmi = 3.31 + 0.02392 * avg;
  const inRange = all.filter(v => v >= 70 && v <= 180).length / all.length * 100;
  const above = all.filter(v => v > 180).length / all.length * 100;
  const below = all.filter(v => v < 70).length / all.length * 100;
  const veryHigh = all.filter(v => v > 250).length / all.length * 100;
  const veryLow = all.filter(v => v < 54).length / all.length * 100;
  return {
    avg: Math.round(avg),
    gmi: Math.round(gmi * 10) / 10,
    cv: Math.round(cv * 10) / 10,
    timeInRange: Math.round(inRange),
    timeAbove: Math.round(above),
    timeBelow: Math.round(below),
    timeVeryHigh: Math.round(veryHigh * 10) / 10,
    timeVeryLow: Math.round(veryLow * 10) / 10,
  };
}

function genericDayShape(dayIdx: number, rand: () => number): DayShape {
  // Non-Sandy patients get a plausible but generic day — no rich annotations.
  return {
    narrative: "",
    fasting: 100 + gauss(rand, 0, 8),
    lunchCarbBurden: 40 + gauss(rand, 0, 15),
    walkBenefit: 15 + gauss(rand, 0, 8),
    variabilityFactor: 1.0,
    eventHours: [8, 12.5, 19.5],
    events: [
      { kind: "meal",     label: "Breakfast", attribution: "Typical meal", outcome: "spike", tone: "warn", glucoseDelta: 40 },
      { kind: "meal",     label: "Lunch",     attribution: "Typical meal", outcome: "spike", tone: "warn", glucoseDelta: 50 },
      { kind: "meal",     label: "Dinner",    attribution: "Typical meal", outcome: "spike", tone: "warn", glucoseDelta: 45 },
    ],
  };
}

// ---------- AGP (Ambulatory Glucose Profile) — percentile bands per 15-min bin ----------

export interface AgpBin {
  hour: number;   // 0.00 .. 23.75, in 0.25 steps
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export function computeAgp(days: DayStats[]): AgpBin[] {
  // 96 bins per day; overlay 14 days → each bin has 14 values
  const bins: number[][] = Array.from({ length: 96 }, () => []);
  days.forEach(d => {
    d.readings.forEach((r, i) => bins[i].push(r.glucose));
  });
  return bins.map((values, i) => {
    const sorted = [...values].sort((a, b) => a - b);
    const pick = (p: number) => sorted[Math.floor((p / 100) * (sorted.length - 1))];
    return {
      hour: (i * 15) / 60,
      p10: pick(10),
      p25: pick(25),
      p50: pick(50),
      p75: pick(75),
      p90: pick(90),
    };
  });
}

// ---------- Six-lens annotation modes ----------

export type CgmLens =
  | "default"
  | "notices"
  | "remembers"
  | "predicts"
  | "recommends"
  | "recovery";

export interface LensInsight {
  lens: CgmLens;
  headline: string;
  bullets: string[];
}

/**
 * Generate lens-mode insights for the currently selected day. Sandy R. has
 * hand-curated storylines per lens; other patients get generic outputs.
 */
export function lensInsight(stream: CgmStream, dayIdx: number, lens: CgmLens): LensInsight {
  const isSandy = stream.patientId === "P100967";
  const day = stream.days[dayIdx];
  const prevWeek = stream.days.slice(0, 7);
  const thisWeek = stream.days.slice(7);
  const prevAvg = Math.round(prevWeek.reduce((a, d) => a + d.avg, 0) / prevWeek.length);
  const thisAvg = Math.round(thisWeek.reduce((a, d) => a + d.avg, 0) / thisWeek.length);
  const prevTir = Math.round(prevWeek.reduce((a, d) => a + d.timeInRange, 0) / prevWeek.length);
  const thisTir = Math.round(thisWeek.reduce((a, d) => a + d.timeInRange, 0) / thisWeek.length);

  if (!isSandy) {
    return { lens, headline: "Lens narratives require the demo hero (Sandy R.).",
             bullets: [`Selected day: ${day.date} — TIR ${day.timeInRange}%, avg ${day.avg} mg/dL.`] };
  }

  switch (lens) {
    case "default":
      return {
        lens,
        headline: `Your day at a glance — ${day.date}`,
        bullets: [
          `Time in range: ${day.timeInRange}% · average glucose ${day.avg} mg/dL`,
          `Range today: ${day.min}–${day.max} mg/dL · variability (CV) ${day.cv}%`,
          `${day.annotations.length} logged events attributed to today's curve`,
        ],
      };
    case "notices":
      return {
        lens,
        headline: "What changed this week",
        bullets: [
          `TIR climbed from ${prevTir}% → ${thisTir}% across the two weeks`,
          `Average glucose dropped from ${prevAvg} → ${thisAvg} mg/dL`,
          `Post-lunch spikes shrunk from ~85 mg/dL rise to ~30 mg/dL after Day 4 walking habit landed`,
          `Fasting glucose settled from 118 → 94 mg/dL over 14 days`,
        ],
      };
    case "remembers":
      return {
        lens,
        headline: "What worked before — pattern lock-in",
        bullets: [
          "Days with a post-dinner walk (Day 4, 5, 6, 7, 10, 13, 14) sat at TIR ≥ 80%",
          "Days with hydration goal met + walk → the flattest curves of the period",
          "Half-portion of refined carbs (Day 4 chicken tikka + ½ naan) had 40% smaller spike than full portion (Day 1 rice + curry)",
          "Injection days (Days 1, 6, 13) show no glucose disruption — dose is stable",
        ],
      };
    case "predicts":
      return {
        lens,
        headline: "If current patterns hold — next 24h forecast",
        bullets: [
          "Fasting glucose expected 92–100 mg/dL tomorrow morning",
          "Lunch curve stays in-range if portion size + a 15-min walk are maintained",
          "TIR next week forecast: 82–88% (95% CI) at current trajectory",
          "GMI (estimated HbA1c) trending toward 6.2% by end of month if pattern holds",
        ],
      };
    case "recommends":
      return {
        lens,
        headline: "3 small things to lock in the pattern",
        bullets: [
          "Keep the 30-min evening walk — biggest single lever on your TIR",
          "Stay at 8+ glasses of water — hydration is inversely correlated with your CV",
          "When rice is on the menu, do the ½-portion play from Day 4 + walk after",
        ],
      };
    case "recovery":
      return {
        lens,
        headline: "If you slip — the path back",
        bullets: [
          "First 24h after a slip: prioritize the post-dinner walk (biggest lift)",
          "Skip the refined-carb combo (rice + naan / pasta + bread) for the next 3 days",
          "Log water: hitting the 8-glass target for 3 days in a row correlates with your best recovery weeks",
          "Coach outreach available — Nu can schedule a check-in if the slip lasts > 3 days",
        ],
      };
  }
}


// ============================================================================
//  Nu Digital Twin extensions — motivational + explanatory layers
//  Visualize (existing) → Explain → Predict → Motivate
// ============================================================================

// ---------- Composite CGM Score (0-100) ----------

export interface CgmScore {
  score: number;                // 0-100
  band: "excellent" | "good" | "fair" | "needs-work";
  bandColor: string;            // hex
  bandLabel: string;
  trend: "up" | "down" | "flat";
  trendDelta: number;           // vs. previous week (points)
  breakdown: { label: string; contribution: number; max: number }[];
}

/**
 * Composite Nu CGM Score — combines TIR (50%), variability (20%),
 * time-above (15%), and event-compliance (15%) into a single 0-100 number
 * the member can watch move day to day.
 */
export function computeCgmScore(stream: CgmStream): CgmScore {
  const { timeInRange, cv, timeAbove, timeVeryHigh } = stream.overall;
  // TIR contribution: 0..50 (100% TIR → 50, 70% TIR → 35, 50% TIR → 25)
  const tirPoints = Math.min(50, Math.round((timeInRange / 100) * 50));
  // Variability: 0..20 (CV ≤ 20 → 20, CV ≥ 40 → 0)
  const cvPoints = Math.max(0, Math.min(20, Math.round(20 - (cv - 20) * 1.0)));
  // Time-above: 0..15 (0% above → 15, 30%+ above → 0)
  const abovePoints = Math.max(0, Math.min(15, Math.round(15 - (timeAbove / 2))));
  // Event compliance: derived from annotation density (proxy for logging habit)
  const totalEvents = stream.days.reduce((a, d) => a + d.annotations.length, 0);
  const compliancePoints = Math.min(15, Math.round((totalEvents / 42) * 15)); // 3 events/day = full
  // Bonus penalty for very high time
  const veryHighPenalty = Math.round(timeVeryHigh * 2);

  const score = Math.max(0, Math.min(100, tirPoints + cvPoints + abovePoints + compliancePoints - veryHighPenalty));

  const band: CgmScore["band"] =
    score >= 85 ? "excellent" :
    score >= 70 ? "good" :
    score >= 55 ? "fair" : "needs-work";
  const bandColor =
    band === "excellent" ? "#10B981" :
    band === "good"      ? "#22C55E" :
    band === "fair"      ? "#F59E0B" : "#DC2626";
  const bandLabel =
    band === "excellent" ? "Excellent" :
    band === "good"      ? "Good" :
    band === "fair"      ? "Fair" : "Needs work";

  // Trend: compare this-week TIR vs. prev-week TIR
  const prevTir = stream.days.slice(0, 7).reduce((a, d) => a + d.timeInRange, 0) / 7;
  const thisTir = stream.days.slice(7).reduce((a, d) => a + d.timeInRange, 0) / 7;
  const trendDelta = Math.round((thisTir - prevTir) * 0.5); // rough conversion to score points
  const trend: CgmScore["trend"] =
    trendDelta > 2 ? "up" : trendDelta < -2 ? "down" : "flat";

  return {
    score,
    band, bandColor, bandLabel,
    trend, trendDelta,
    breakdown: [
      { label: "Time in Range",   contribution: tirPoints,       max: 50 },
      { label: "Variability",     contribution: cvPoints,        max: 20 },
      { label: "Time above",      contribution: abovePoints,     max: 15 },
      { label: "Event logging",   contribution: compliancePoints, max: 15 },
    ],
  };
}

// ---------- Health Credits (gamification) ----------

export interface HealthCredits {
  total: number;                // total credits earned
  level: "Bronze" | "Silver" | "Gold" | "Platinum";
  levelColor: string;
  nextLevel: string | null;
  toNextLevel: number;          // credits until next level (null if Platinum)
  progressPct: number;          // 0..100 within current level
  weekly: number;               // credits earned this week
  breakdown: { source: string; icon: string; credits: number }[];
}

const LEVEL_THRESHOLDS = { Bronze: 0, Silver: 500, Gold: 1500, Platinum: 3000 };

export function computeHealthCredits(stream: CgmStream): HealthCredits {
  const daysInRange = stream.days.filter(d => d.timeInRange >= 70).length;
  const daysExcellent = stream.days.filter(d => d.timeInRange >= 85).length;
  const walkEvents = stream.days.reduce((a, d) => a + d.annotations.filter(e => e.kind === "activity").length, 0);
  const hydrationEvents = stream.days.reduce((a, d) => a + d.annotations.filter(e => e.kind === "hydration").length, 0);
  const mealsLogged = stream.days.reduce((a, d) => a + d.annotations.filter(e => e.kind === "meal").length, 0);
  const streakDays = computeStreakDays(stream);

  const breakdown = [
    { source: `${daysInRange} days ≥ 70% TIR`,           icon: "target",   credits: daysInRange * 100 },
    { source: `${daysExcellent} days ≥ 85% TIR (bonus)`,  icon: "star",     credits: daysExcellent * 50 },
    { source: `${walkEvents} walk sessions`,              icon: "activity", credits: walkEvents * 50 },
    { source: `${hydrationEvents} hydration goals met`,   icon: "droplet",  credits: hydrationEvents * 25 },
    { source: `${mealsLogged} meals logged`,              icon: "utensils", credits: mealsLogged * 15 },
    { source: `${streakDays}-day in-range streak (bonus)`,icon: "flame",    credits: streakDays * 20 },
  ];

  const total = breakdown.reduce((a, b) => a + b.credits, 0);
  const level: HealthCredits["level"] =
    total >= LEVEL_THRESHOLDS.Platinum ? "Platinum" :
    total >= LEVEL_THRESHOLDS.Gold     ? "Gold" :
    total >= LEVEL_THRESHOLDS.Silver   ? "Silver" : "Bronze";
  const levelColor =
    level === "Platinum" ? "#7C3AED" :
    level === "Gold"     ? "#F59E0B" :
    level === "Silver"   ? "#94A3B8" : "#B45309";
  const nextLevel: string | null =
    level === "Bronze"   ? "Silver" :
    level === "Silver"   ? "Gold" :
    level === "Gold"     ? "Platinum" : null;
  const nextThreshold =
    nextLevel === "Silver"   ? LEVEL_THRESHOLDS.Silver :
    nextLevel === "Gold"     ? LEVEL_THRESHOLDS.Gold :
    nextLevel === "Platinum" ? LEVEL_THRESHOLDS.Platinum : total;
  const prevThreshold = LEVEL_THRESHOLDS[level];
  const toNextLevel = nextLevel ? Math.max(0, nextThreshold - total) : 0;
  const progressPct = nextLevel
    ? Math.min(100, Math.round(((total - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
    : 100;

  // Weekly credits — credits earned in the last 7 days
  const thisWeekTotal =
    stream.days.slice(7).filter(d => d.timeInRange >= 70).length * 100 +
    stream.days.slice(7).filter(d => d.timeInRange >= 85).length * 50 +
    stream.days.slice(7).reduce((a, d) => a + d.annotations.filter(e => e.kind === "activity").length, 0) * 50 +
    stream.days.slice(7).reduce((a, d) => a + d.annotations.filter(e => e.kind === "hydration").length, 0) * 25;

  return { total, level, levelColor, nextLevel, toNextLevel, progressPct, weekly: thisWeekTotal, breakdown };
}

function computeStreakDays(stream: CgmStream): number {
  let streak = 0;
  for (let i = stream.days.length - 1; i >= 0; i--) {
    if (stream.days[i].timeInRange >= 70) streak++; else break;
  }
  return streak;
}

// ---------- Achievement Badges ----------

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  earned: boolean;
  earnedOn?: string;            // day date, if earned
  progress?: number;            // 0..100 if in progress
  progressLabel?: string;
}

export function earnedBadges(stream: CgmStream): Badge[] {
  const days = stream.days;
  const activityDays = days.filter(d => d.annotations.some(a => a.kind === "activity")).length;
  const hydrationDays = days.filter(d => d.annotations.some(a => a.kind === "hydration")).length;
  const streak = computeStreakDays(stream);
  const excellentStreak = maxStreak(days.map(d => d.timeInRange >= 85));
  const fastingDrop = Math.max(0, Math.round(days[0].readings[24].glucose - days[days.length - 1].readings[24].glucose)); // 6am reading Day1 vs Day14

  const badges: Badge[] = [
    {
      id: "walker-7",
      emoji: "🏃",
      title: "7-Day Walker",
      description: "Logged an activity 7+ days in the last 14",
      earned: activityDays >= 7,
      progress: Math.min(100, Math.round((activityDays / 7) * 100)),
      progressLabel: `${activityDays} / 7 days`,
      earnedOn: activityDays >= 7 ? days[days.length - 1].date : undefined,
    },
    {
      id: "hydration-hero",
      emoji: "💧",
      title: "Hydration Hero",
      description: "Hit water goal 5+ days in the last 14",
      earned: hydrationDays >= 5,
      progress: Math.min(100, Math.round((hydrationDays / 5) * 100)),
      progressLabel: `${hydrationDays} / 5 days`,
    },
    {
      id: "fasting-fixer",
      emoji: "📉",
      title: "Fasting Fixer",
      description: "Reduced fasting glucose by 20+ mg/dL over the period",
      earned: fastingDrop >= 20,
      progress: Math.min(100, Math.round((fastingDrop / 20) * 100)),
      progressLabel: `${fastingDrop} / 20 mg/dL drop`,
    },
    {
      id: "tir-titan",
      emoji: "⭐",
      title: "Time-in-Range Titan",
      description: "Hit ≥ 85% TIR for 7 consecutive days",
      earned: excellentStreak >= 7,
      progress: Math.min(100, Math.round((excellentStreak / 7) * 100)),
      progressLabel: `${excellentStreak} / 7 day streak`,
    },
    {
      id: "streak-starter",
      emoji: "🔥",
      title: "Streak Starter",
      description: "5+ days in a row with TIR ≥ 70%",
      earned: streak >= 5,
      progress: Math.min(100, Math.round((streak / 5) * 100)),
      progressLabel: `${streak} / 5 day streak`,
    },
    {
      id: "half-portion",
      emoji: "🍽️",
      title: "Half-Portion Master",
      description: "Practiced portion control 3+ times",
      earned: days.reduce((a, d) => a + d.annotations.filter(x => x.label.match(/(½|1\/2|half)/i)).length, 0) >= 3,
      progress: Math.min(100, Math.round(days.reduce((a, d) => a + d.annotations.filter(x => x.label.match(/(½|1\/2|half)/i)).length, 0) / 3 * 100)),
      progressLabel: `${days.reduce((a, d) => a + d.annotations.filter(x => x.label.match(/(½|1\/2|half)/i)).length, 0)} / 3 times`,
    },
  ];

  return badges;
}

function maxStreak(bools: boolean[]): number {
  let max = 0, cur = 0;
  for (const b of bools) {
    if (b) { cur++; max = Math.max(max, cur); } else cur = 0;
  }
  return max;
}

// ---------- Food Correlation ----------

export interface FoodCategory {
  category: string;
  emoji: string;
  count: number;
  avgSpike: number;             // mean glucose delta, mg/dL
  bestExample: string;
  worstExample: string;
  tone: "warn" | "good" | "info";
}

/**
 * Group all meal annotations by broad category (refined carbs, balanced,
 * high-protein, etc.) and average the observed glucose deltas. Answers:
 * "which food types drive my spikes?"
 */
export function foodCorrelation(stream: CgmStream): FoodCategory[] {
  const meals = stream.days.flatMap(d => d.annotations.filter(a => a.kind === "meal" && a.glucoseDelta !== undefined));

  const CATEGORIES: { key: string; label: string; emoji: string; match: RegExp }[] = [
    { key: "refined",   label: "Refined carbs",       emoji: "🍚", match: /(rice|pasta|bread|bagel|naan|pizza|toast|noodle|roti)/i },
    { key: "balanced",  label: "Balanced meals",      emoji: "🥗", match: /(salad|bowl|wrap|quinoa|oatmeal|greek yogurt|salmon|chicken salad)/i },
    { key: "protein",   label: "High-protein",        emoji: "🥩", match: /(chicken|salmon|egg|omelette|turkey|paneer|lentil|tikka)/i },
    { key: "veg",       label: "Veg-forward",         emoji: "🥦", match: /(spinach|veg|avocado|berries|walnuts|almond|olive)/i },
  ];

  const byCat = new Map<string, { label: string; emoji: string; deltas: number[]; examples: { label: string; delta: number }[] }>();
  for (const m of meals) {
    for (const c of CATEGORIES) {
      if (c.match.test(m.label)) {
        if (!byCat.has(c.key)) byCat.set(c.key, { label: c.label, emoji: c.emoji, deltas: [], examples: [] });
        const bucket = byCat.get(c.key)!;
        bucket.deltas.push(m.glucoseDelta ?? 0);
        bucket.examples.push({ label: m.label, delta: m.glucoseDelta ?? 0 });
        break; // one category per meal (first match wins)
      }
    }
  }

  return Array.from(byCat.entries()).map(([_, v]) => {
    const avg = Math.round(v.deltas.reduce((a, x) => a + x, 0) / v.deltas.length);
    const sorted = [...v.examples].sort((a, b) => a.delta - b.delta);
    return {
      category: v.label,
      emoji: v.emoji,
      count: v.deltas.length,
      avgSpike: avg,
      bestExample:  sorted[0].label + " (" + (sorted[0].delta > 0 ? "+" : "") + sorted[0].delta + ")",
      worstExample: sorted[sorted.length - 1].label + " (" + (sorted[sorted.length - 1].delta > 0 ? "+" : "") + sorted[sorted.length - 1].delta + ")",
      tone: avg >= 55 ? "warn" : avg >= 30 ? "info" : "good",
    } as FoodCategory;
  }).sort((a, b) => b.avgSpike - a.avgSpike);
}

// ---------- Meal Response Cards ----------

export interface MealResponse {
  time: string;                 // "12:20 PM"
  label: string;                // meal name
  delta: number;                // glucose rise
  attribution: string;
  outcome: "spike" | "flat" | "drop" | "context";
  tone: "warn" | "good" | "info";
  peakGlucose: number;          // estimated peak after this meal
  timeToBaseline: number;       // minutes back to baseline
}

/** Recent meal responses across the last 3 days, most recent first. */
export function mealResponseCards(stream: CgmStream, count = 6): MealResponse[] {
  const cards: MealResponse[] = [];
  // Walk backward from today
  for (let d = stream.days.length - 1; d >= 0 && cards.length < count; d--) {
    const day = stream.days[d];
    const meals = day.annotations.filter(a => a.kind === "meal");
    for (const m of meals.reverse()) { // latest meal first within a day
      if (cards.length >= count) break;
      // Estimate peak glucose in the 90 min after the meal
      const idxAtMeal = day.readings.findIndex(r => r.t >= m.t);
      const window = day.readings.slice(idxAtMeal, idxAtMeal + 6); // 6 × 15 min = 90 min
      const peak = window.length ? Math.max(...window.map(r => r.glucose)) : day.avg;
      const baseline = day.readings[Math.max(0, idxAtMeal - 4)]?.glucose ?? day.avg;
      // Time to return to baseline (crude)
      let ttb = 90;
      for (let i = idxAtMeal + 6; i < Math.min(day.readings.length, idxAtMeal + 20); i++) {
        if (day.readings[i].glucose <= baseline + 10) { ttb = (i - idxAtMeal) * 15; break; }
      }
      cards.push({
        time: new Date(m.t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }),
        label: m.label,
        delta: m.glucoseDelta ?? 0,
        attribution: m.attribution,
        outcome: m.outcome,
        tone: m.tone,
        peakGlucose: peak,
        timeToBaseline: ttb,
      });
    }
  }
  return cards;
}

// ---------- Pattern Detection ----------

export interface Pattern {
  id: string;
  title: string;
  detail: string;
  confidence: "high" | "medium" | "low";
  tone: "good" | "warn" | "info";
}

/** Detect recurring patterns across the 14-day window. Sandy's hero storyline gets curated patterns. */
export function patternDetection(stream: CgmStream): Pattern[] {
  const isSandy = stream.patientId === "P100967";
  if (!isSandy) {
    return [{
      id: "generic",
      title: "Not enough data",
      detail: "Pattern detection is calibrated for the demo hero.",
      confidence: "low",
      tone: "info",
    }];
  }

  // Sandy-specific curated patterns
  return [
    {
      id: "post-dinner-walk",
      title: "Post-dinner walks flatten your evening curve",
      detail: "On days you walked after dinner (Day 4, 5, 6, 7, 10, 13, 14), your evening glucose stayed within ±15 mg/dL of the pre-meal baseline. On days you skipped the walk (Day 1, 2), evening glucose stayed elevated for 3+ hours.",
      confidence: "high",
      tone: "good",
    },
    {
      id: "refined-carb-spike",
      title: "Refined carbs at lunch spike ~85 mg/dL",
      detail: "Rice, pasta, bagel, and bread meals produced an average +72 mg/dL spike vs. +28 mg/dL for balanced meals. Half-portion versions cut the spike by 40%.",
      confidence: "high",
      tone: "warn",
    },
    {
      id: "hydration-cv",
      title: "Hydration inversely correlates with variability",
      detail: "On days you hit the 8-glass water goal, your CV averaged 8.1%. On days you were under, CV climbed to 17.5% — a meaningful jump in glucose swings.",
      confidence: "high",
      tone: "good",
    },
    {
      id: "dawn-shrinking",
      title: "Dawn-phenomenon rise is shrinking",
      detail: "Your morning fasting glucose settled from 118 mg/dL (Day 1) to 94 mg/dL (Day 14). The dawn-phenomenon rise is now 8 mg/dL smaller than baseline.",
      confidence: "high",
      tone: "good",
    },
    {
      id: "injection-days-flat",
      title: "Injection days show no glucose disruption",
      detail: "GLP-1 injections on Day 1, 6, and 13 did not measurably shift the glucose curve. Dose is well-tolerated.",
      confidence: "medium",
      tone: "info",
    },
  ];
}

// ---------- Weekly Progress ----------

export interface WeeklyProgress {
  thisWeek: { tir: number; avg: number; cv: number; badges: number };
  lastWeek: { tir: number; avg: number; cv: number; badges: number };
  delta: { tir: number; avg: number; cv: number; badges: number };
  goalTir: number;
  goalProgress: number;         // 0..100
  weekSummary: string;
}

export function weeklyProgress(stream: CgmStream): WeeklyProgress {
  const prev = stream.days.slice(0, 7);
  const cur = stream.days.slice(7);
  const avg = (arr: DayStats[], f: (d: DayStats) => number) =>
    Math.round(arr.reduce((a, d) => a + f(d), 0) / arr.length);

  const lastWeek = {
    tir: avg(prev, d => d.timeInRange),
    avg: avg(prev, d => d.avg),
    cv:  avg(prev, d => d.cv),
    badges: 0,
  };
  const thisWeek = {
    tir: avg(cur, d => d.timeInRange),
    avg: avg(cur, d => d.avg),
    cv:  avg(cur, d => d.cv),
    badges: 0,
  };
  const delta = {
    tir: thisWeek.tir - lastWeek.tir,
    avg: thisWeek.avg - lastWeek.avg,
    cv:  thisWeek.cv - lastWeek.cv,
    badges: 0,
  };
  const goalTir = 80;
  const goalProgress = Math.min(100, Math.round((thisWeek.tir / goalTir) * 100));

  const weekSummary =
    delta.tir >= 5 ? `TIR up ${delta.tir} points vs. last week — habits are compounding.`
    : delta.tir >= 0 ? `TIR stable — hold the pattern.`
    : `TIR dropped ${Math.abs(delta.tir)} points — check the Recovery lens.`;

  return { thisWeek, lastWeek, delta, goalTir, goalProgress, weekSummary };
}


// ============================================================================
//  Similar-day references — wire six-lens view to case-based learning
//
//  For any (currentDay, lens) pair, surface the most useful past days as
//  reference points. Each reference carries: outcome (positive/negative/mixed),
//  match reason, key event, steps that were taken (or missed), and takeaway.
//  Members learn from their own history — "this exact day pattern already
//  happened; here's what worked / what to avoid."
// ============================================================================

export type SimilarDayOutcome = "positive" | "negative" | "mixed";

export interface SimilarDay {
  dayIdx: number;                // 0..13
  date: string;                  // e.g., "Sun, Jun 21"
  matchReason: string;           // why this day is a match — one line
  outcome: SimilarDayOutcome;
  tir: number;
  avg: number;
  keyEvent: string;              // the event that defined the day
  stepsTaken: string[];          // what the member did
  stepsSkipped?: string[];       // what was NOT done (for negative refs)
  takeaway: string;              // one-line lesson to carry forward
  tag: string;                   // short label for the pill: "Turning point", "Setback", "Best day", etc.
}

/**
 * Return 2–3 curated reference days for the currently-selected day + active
 * lens. Sandy R. (P100967) gets a hand-curated set that maps to her demo
 * storyline; other patients get an empty list (case-based learning requires
 * enough history — 14 days of one patient is a demo hero luxury).
 */
export function similarDaysForLens(
  stream: CgmStream,
  currentDayIdx: number,
  lens: CgmLens,
): SimilarDay[] {
  if (stream.patientId !== "P100967") return [];

  const d = (idx: number) => stream.days[idx];
  const mk = (
    dayIdx: number,
    matchReason: string,
    outcome: SimilarDayOutcome,
    keyEvent: string,
    stepsTaken: string[],
    takeaway: string,
    tag: string,
    stepsSkipped?: string[],
  ): SimilarDay => ({
    dayIdx,
    date: d(dayIdx).date,
    matchReason,
    outcome,
    tir: d(dayIdx).timeInRange,
    avg: d(dayIdx).avg,
    keyEvent,
    stepsTaken,
    stepsSkipped,
    takeaway,
    tag,
  });

  switch (lens) {
    case "default": {
      // "How am I doing?" → contrast today with a similar recent day + a distant baseline
      return [
        mk(
          4,
          "Same weekday-shape as today; first day the walking habit locked in",
          "positive",
          "20-min post-lunch stroll + 30-min evening walk",
          ["Walked twice", "Chose grilled salmon dinner", "Hit hydration target"],
          "This is the pattern today is echoing — you're in the good part of the arc.",
          "Reference day",
        ),
        mk(
          0,
          "Same day-of-cycle as today (injection day); very different behavior",
          "negative",
          "Rice bowl + no walk + only 3 glasses of water",
          ["Took injection"],
          "Two weeks ago on the same rhythm you were 30+ mg/dL higher — visible progress.",
          "Baseline",
          ["Skipped post-lunch walk", "Missed hydration goal", "Chose refined carbs"],
        ),
      ];
    }

    case "notices": {
      // "What changed?" → contrast the pre-intervention week with the post-intervention week
      return [
        mk(
          1,
          "Peak of the rocky-start pattern — 3 refined-carb meals, no walks",
          "negative",
          "Bagel → Fried rice → Pizza (three refined-carb hits)",
          [],
          "You were logging spikes but not the causes — awareness was low.",
          "Before",
          ["No walk logged", "No hydration logged", "Pizza dinner uncovered"],
        ),
        mk(
          6,
          "Injection day, same as Day 1, but with walk + hydration habit",
          "positive",
          "Lentil soup lunch + 25-min evening walk",
          ["Consistent walk 3rd day", "Fiber-forward lunch", "Injection on schedule"],
          "The change since Day 1: same injection, but daily walk added 24 TIR points.",
          "After",
        ),
        mk(
          10,
          "Best day of the period — everything working together",
          "positive",
          "40-min evening walk (longest ever) + hit hydration",
          ["Post-lunch stroll", "Longest evening walk of the program", "Water goal met"],
          "This is what your ceiling looks like — the compound effect of every habit.",
          "Peak",
        ),
      ];
    }

    case "remembers": {
      // "What worked before?" → success templates
      return [
        mk(
          4,
          "First day post-dinner walk landed — the turning point of the arc",
          "positive",
          "20-min post-lunch stroll + 30-min evening walk",
          ["Half-portion of naan (½)", "Two walks", "Grilled salmon dinner"],
          "Your body responded within 30 min to that first walk — it's a reliable lever.",
          "Turning point",
        ),
        mk(
          5,
          "Habit-locked-in day — walk + hydration + balanced meals",
          "positive",
          "10-min post-lunch stroll + 30-min evening walk",
          ["Quinoa bowl (complex carbs)", "10-min post-lunch stroll", "8 glasses water"],
          "When all three levers stack, CV drops to single digits.",
          "Template",
        ),
        mk(
          10,
          "Best TIR of the period (84%) — longest walk logged",
          "positive",
          "Salmon poke bowl + 40-min evening walk (3.1 km)",
          ["Balanced macros lunch", "15-min post-lunch stroll", "40-min evening walk"],
          "Longer walks compound — 40 min doesn't spike glucose, it flattens it.",
          "Best day",
        ),
        mk(
          13,
          "Injection day + full habit stack — no glucose disruption",
          "positive",
          "GLP-1 injection + overnight oats + 30-min walk",
          ["Kept full habit stack on injection day"],
          "Injection days no longer disrupt — habits absorb the variance.",
          "Steady state",
        ),
      ];
    }

    case "predicts": {
      // "What's next?" → use best-case day + steady-state day as the forecast anchors
      return [
        mk(
          10,
          "Best-case scenario if the walking + hydration stack holds",
          "positive",
          "40-min walk + water goal + balanced macros",
          ["Longest walk of program", "Water goal met", "Balanced lunch"],
          "TIR forecast next week: 82–88% if this pattern repeats 4+ days.",
          "Best-case",
        ),
        mk(
          9,
          "Steady-state day — no perfect events, still hit 100% TIR",
          "positive",
          "Standard 30-min walk + typical balanced meals",
          ["Kept 30-min walk", "Balanced meals", "Recovered from prior day's nausea"],
          "This is the median forecast — even 'ordinary' days now sit in-range.",
          "Steady-state",
        ),
      ];
    }

    case "recommends": {
      // "What should I do?" → point at the exact playbook day
      return [
        mk(
          4,
          "The exact playbook the recommendations are based on",
          "positive",
          "Half-portion naan + post-lunch walk + grilled dinner + evening walk",
          ["Half-portion of naan (½)", "20-min post-lunch stroll", "Grilled salmon", "30-min evening walk"],
          "Copy this exact sequence today — it worked once, it will work again.",
          "Playbook",
        ),
        mk(
          12,
          "Real-world variant — family dinner + still walked",
          "mixed",
          "Family dinner (paneer + roti) + 20-min walk",
          ["Portion-controlled restaurant meal", "Walked after social dinner"],
          "The walk matters more than the meal choice — never skip it, even on social nights.",
          "Realistic",
        ),
      ];
    }

    case "recovery": {
      // "How do I bounce back?" → the Day 3 → Day 4 recovery arc
      return [
        mk(
          3,
          "First day back from the rocky start — small changes only",
          "mixed",
          "Oatmeal breakfast + 6 glasses of water + grilled chicken salad dinner",
          ["Switched breakfast to complex carbs", "Started logging water", "Low-carb dinner"],
          "Recovery doesn't need a perfect day — one lever moved is enough to start.",
          "Recovery Day 1",
        ),
        mk(
          4,
          "Day 2 of recovery — added the walk. Everything flipped.",
          "positive",
          "Two walks (post-lunch + post-dinner) + half-portion carbs",
          ["Added post-lunch walk", "Added post-dinner walk", "Portion-controlled carbs"],
          "The 30-min walk is the single biggest lever on your TIR. Add it back first.",
          "Recovery Day 2",
        ),
        mk(
          1,
          "Reminder — this is what a slip looks like",
          "negative",
          "Refined-carb pattern + no walks + low water",
          [],
          "If today feels like Day 1, tomorrow can be Day 3. The recovery pattern is proven.",
          "Setback anchor",
          ["No walk", "No hydration logged", "Refined-carb meals"],
        ),
      ];
    }
  }
}


// ============================================================================
//  Nu Success Profiles — productize the member's own success into playbooks
//
//  Instead of "best day", Nu identifies multiple SUCCESS ARCHETYPES with
//  different underlying behavior distributions. Each profile is repeatable,
//  named, and has a Nu-suggested small-variation to push it higher.
// ============================================================================

export interface RecipeItem {
  icon: "walk" | "food" | "water" | "protein" | "fiber" | "portion" | "injection";
  label: string;
}

export interface SuccessProfile {
  id: string;
  name: string;
  emoji: string;
  tagline: string;                  // one-line description
  recipe: RecipeItem[];             // 2-3 core ingredients
  matchingDayIndices: number[];     // days that fit this archetype
  avgTir: number;                   // avg TIR across matching days
  signatureStat: {                  // the standout metric
    label: string;
    value: string;
  };
  bestFor: string;                  // when this profile shines
  nuEnhancement: {
    title: string;                  // Nu's suggested variation
    detail: string;                 // why + what to change
    estimatedLift: string;          // e.g., "+3–5 TIR points"
    tone: "small-tweak" | "meaningful-add" | "swap";
  };
}

/**
 * Nu's success-profile analysis. Sandy R. gets 5 curated archetypes drawn
 * from her own 14-day history. Other patients get an empty set (this
 * feature needs enough good-day density to work).
 */
export function nuSuccessProfiles(stream: CgmStream): SuccessProfile[] {
  if (stream.patientId !== "P100967") return [];

  const dayTir = (idx: number) => stream.days[idx].timeInRange;
  const avgOf = (indices: number[]) =>
    Math.round(indices.reduce((a, i) => a + dayTir(i), 0) / indices.length);

  return [
    {
      id: "long-walker",
      name: "The Long Walker",
      emoji: "🚶",
      tagline: "One long walk (35–40 min) does most of the work",
      recipe: [
        { icon: "walk",  label: "35–40 min evening walk" },
        { icon: "food",  label: "Balanced dinner" },
        { icon: "water", label: "6+ glasses water" },
      ],
      matchingDayIndices: [6, 9, 13], // Day 7, 10, 14
      avgTir: avgOf([6, 9, 13]),
      signatureStat: { label: "Total activity", value: "35–40 min (1 walk)" },
      bestFor: "Busy days when you can only commit to one habit",
      nuEnhancement: {
        title: "Add 5 more minutes to hit the 40-min sweet spot",
        detail: "Your Day 10 (40-min walk) had a flatter evening curve than Day 7 (35-min). The last 5 minutes buys measurable AGP smoothing — you're already close.",
        estimatedLift: "+2–3 TIR points",
        tone: "small-tweak",
      },
    },
    {
      id: "splitter",
      name: "The Splitter",
      emoji: "⏱️",
      tagline: "Two shorter walks spread through the day",
      recipe: [
        { icon: "walk",    label: "Post-lunch stroll (10–20 min)" },
        { icon: "walk",    label: "Evening walk (25–30 min)" },
        { icon: "portion", label: "Portion-controlled carbs" },
      ],
      matchingDayIndices: [3, 4, 9], // Day 4, 5, 10
      avgTir: avgOf([3, 4, 9]),
      signatureStat: { label: "Peak lunch spike", value: "≤ 30 mg/dL" },
      bestFor: "Days when lunch carbs are unavoidable — the post-lunch walk absorbs the spike",
      nuEnhancement: {
        title: "Never skip the post-lunch stroll — it's 40% of the effect",
        detail: "Your Day 5 data: the 10-min post-lunch walk cut the lunch spike from +52 → +30 mg/dL. That short walk is doing outsized work. Protect it on your calendar.",
        estimatedLift: "+3–5 TIR points on high-carb-lunch days",
        tone: "meaningful-add",
      },
    },
    {
      id: "fiber-forward",
      name: "The Fiber-Forward",
      emoji: "🌱",
      tagline: "Complex carbs + fiber-forward meals; less activity needed",
      recipe: [
        { icon: "fiber",  label: "Oatmeal / quinoa / lentil-based meals" },
        { icon: "food",   label: "Berries, greens, complex carbs only" },
        { icon: "walk",   label: "Any 20–30 min walk" },
      ],
      matchingDayIndices: [2, 4, 5, 8], // Day 3, 5, 6, 9
      avgTir: avgOf([2, 4, 5, 8]),
      signatureStat: { label: "Max meal spike", value: "≤ 40 mg/dL" },
      bestFor: "Rest days from exercise — meal choice does the heavy lifting",
      nuEnhancement: {
        title: "Layer in a 15-min post-lunch walk to hit the ceiling",
        detail: "Fiber-forward days already sit at avg 95% TIR without much walking. Adding just 15 min after lunch pushes you into 100% TIR territory, at very low effort cost.",
        estimatedLift: "TIR ceiling: 95% → 100%",
        tone: "small-tweak",
      },
    },
    {
      id: "protein-anchored",
      name: "The Protein-Anchored",
      emoji: "🥩",
      tagline: "High-protein breakfast + lunch keeps CV low",
      recipe: [
        { icon: "protein", label: "Egg-white omelette / Greek yogurt breakfast" },
        { icon: "protein", label: "Chicken / salmon-forward lunch" },
        { icon: "walk",    label: "30-min walk (any time)" },
      ],
      matchingDayIndices: [7, 8, 13], // Day 8, 9, 14
      avgTir: avgOf([7, 8, 13]),
      signatureStat: { label: "Coefficient of Variation", value: "≤ 8%" },
      bestFor: "Hormonal / low-energy days — protein steadies the whole curve",
      nuEnhancement: {
        title: "Swap oats + walnuts in on days you don't want eggs",
        detail: "Your Day 7 (Greek yogurt + walnuts) matched the CV of your egg days. Rotate to keep the protein anchor without eating the same breakfast every day.",
        estimatedLift: "Same CV benefit, higher adherence",
        tone: "swap",
      },
    },
    {
      id: "hydration-champion",
      name: "The Hydration Champion",
      emoji: "💧",
      tagline: "Hitting the water goal + any 30-min walk",
      recipe: [
        { icon: "water", label: "8+ glasses water logged" },
        { icon: "walk",  label: "30-min walk (any time)" },
        { icon: "food",  label: "Balanced meals — no restriction needed" },
      ],
      matchingDayIndices: [4, 9, 13], // Day 5, 10, 14
      avgTir: avgOf([4, 9, 13]),
      signatureStat: { label: "Variability reduction", value: "–5 CV points vs. dry days" },
      bestFor: "Managing variability without changing what you eat",
      nuEnhancement: {
        title: "Front-load 4 glasses before noon — shrinks the dawn phenomenon further",
        detail: "Your morning glucose rise correlates with overnight hydration. Getting 4 glasses in by lunch (vs. spread through the day) trimmed your dawn rise on Day 10.",
        estimatedLift: "Fasting glucose: –4–6 mg/dL further",
        tone: "small-tweak",
      },
    },
  ];
}
