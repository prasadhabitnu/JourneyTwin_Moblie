/**
 * Star Vitals — 5-star ratings for the 8 core vitals Nu watches for Sally.
 * Ratings use half-star precision. Each vital has a category weight so the
 * consolidated score reflects clinical importance.
 */

import type { IconKind } from "./twinData";

export type VitalCategory = "clinical" | "lifestyle";

export interface Vital {
  id: string;
  name: string;
  icon: IconKind;
  value: string;        // human-readable value ("87%", "-7 lbs", "7.3 h")
  unit?: string;
  category: VitalCategory;
  weight: number;       // for weighted-average overall
  rating: number;       // 0..5, half-star precision
  lastWeekRating: number;
  headline: string;     // one-line insight
  detail: string;       // 2-3 sentences
  trendData: number[];  // last 7 days of underlying values for a mini-spark
  trendLabel: string;   // description of the mini spark's y-axis
}

// ---- Star rating tier chrome ----
export interface RatingTier {
  min: number;   // inclusive
  label: string;
  bg: string;
  border: string;
  fg: string;
  chip: string;
}

export const TIERS: RatingTier[] = [
  { min: 4.5, label: "Excellent",   bg: "#ECFDF5", border: "#10B981", fg: "#065F46", chip: "#059669" },
  { min: 3.5, label: "Strong",      bg: "#F0FDF4", border: "#86EFAC", fg: "#166534", chip: "#059669" },
  { min: 2.5, label: "Steady",      bg: "#EFF6FF", border: "#93C5FD", fg: "#1E40AF", chip: "#4F5FE5" },
  { min: 1.5, label: "Room to grow",bg: "#FFFBEB", border: "#FDE68A", fg: "#92400E", chip: "#B45309" },
  { min: 0,   label: "Needs care",  bg: "#FEF2F2", border: "#FECACA", fg: "#991B1B", chip: "#B91C1C" },
];

export function tierFor(rating: number): RatingTier {
  return TIERS.find(t => rating >= t.min) ?? TIERS[TIERS.length - 1];
}

// ============================================================================
// The 8 vitals — Sally, week 13, this fortnight
// ============================================================================
export const VITALS: Vital[] = [
  // -------- Clinical (weight 1.5) --------
  {
    id: "tir",
    name: "Time in Range",
    icon: "cgm",
    value: "87%",
    category: "clinical",
    weight: 1.5,
    rating: 4.5,
    lastWeekRating: 4.0,
    headline: "Excellent. Up 4 points this week.",
    detail: "You're at 87% Time-in-Range, up from 82% last week. Your target is 95%. Three cleaner post-dinner windows this week likely close the gap.",
    trendData: [71, 74, 76, 78, 82, 84, 87],
    trendLabel: "% TIR",
  },
  {
    id: "hba1c",
    name: "HbA1c Projection",
    icon: "hba1c",
    value: "6.4%",
    category: "clinical",
    weight: 1.5,
    rating: 4.0,
    lastWeekRating: 3.5,
    headline: "Strong. Down from 7.1% at week 1.",
    detail: "Rolling 14-day estimated HbA1c is 6.4%. Trajectory suggests you'll cross 6.0% by week 20 if the current pattern holds. On track for your goal.",
    trendData: [7.1, 7.0, 6.9, 6.8, 6.6, 6.5, 6.4],
    trendLabel: "HbA1c %",
  },
  {
    id: "weight",
    name: "Weight",
    icon: "weight",
    value: "-7 lbs",
    unit: "in 14 days",
    category: "clinical",
    weight: 1.5,
    rating: 5.0,
    lastWeekRating: 5.0,
    headline: "Excellent trajectory. Steady 0.5 lb/day.",
    detail: "You're down 7 lbs across the last 14 days. Two flat mid-week days were sodium, not fat. This is exactly the pace we want at week 13.",
    trendData: [183, 182, 181.5, 180, 179, 177.5, 176],
    trendLabel: "lbs",
  },
  {
    id: "meds",
    name: "Medication Adherence",
    icon: "meds",
    value: "12/14",
    unit: "doses on time",
    category: "clinical",
    weight: 1.5,
    rating: 4.0,
    lastWeekRating: 3.5,
    headline: "Strong. Two Sunday doses missed.",
    detail: "12 of 14 doses on time. Both misses were Sundays — likely tied to family brunch schedule. Moving the reminder to Saturday evening resets this pattern for 78% of members like you.",
    trendData: [1, 1, 1, 0, 1, 1, 1],  // 1 = on time, 0 = missed
    trendLabel: "on time",
  },

  // -------- Lifestyle (weight 1.0) --------
  {
    id: "sleep",
    name: "Sleep",
    icon: "bed",
    value: "7.3 h",
    unit: "avg",
    category: "lifestyle",
    weight: 1.0,
    rating: 4.0,
    lastWeekRating: 4.0,
    headline: "Strong. Wake-time is steady 5/7 nights.",
    detail: "Averaging 7.3 hours. Wake-time consistency is your #1 sleep-quality lever, and you're holding it Mon-Fri. Weekends drift 45 minutes later.",
    trendData: [7.5, 7.0, 7.8, 6.9, 7.4, 7.5, 7.3],
    trendLabel: "hours",
  },
  {
    id: "activity",
    name: "Movement",
    icon: "walk",
    value: "5 walks",
    unit: "last 7 days",
    category: "lifestyle",
    weight: 1.0,
    rating: 4.5,
    lastWeekRating: 4.0,
    headline: "Excellent. Five evening walks this week.",
    detail: "5 post-dinner walks in 7 days — your best week since April. Your average is 7,200 steps/day. Days above 8,500 show 15% higher TIR.",
    trendData: [1, 1, 1, 0, 1, 0, 1],
    trendLabel: "walk?",
  },
  {
    id: "hydration",
    name: "Hydration",
    icon: "water",
    value: "5",
    unit: "glasses/day avg",
    category: "lifestyle",
    weight: 1.0,
    rating: 3.0,
    lastWeekRating: 2.5,
    headline: "Steady but below your line.",
    detail: "Averaging 5 glasses on weekdays. Your hydrated days show 15% lower glucose variability. Two glasses before lunch is your biggest lever. Coffee doesn't count.",
    trendData: [4, 6, 5, 4, 5, 6, 5],
    trendLabel: "glasses",
  },
  {
    id: "stress",
    name: "Stress",
    icon: "stress",
    value: "1 tough day",
    unit: "this week",
    category: "lifestyle",
    weight: 1.0,
    rating: 3.5,
    lastWeekRating: 3.0,
    headline: "Steady overall — one 5/5 day Wed.",
    detail: "Your Wednesday 5/5 stress day showed up in your afternoon glucose. Two minutes of box breathing at 3 PM has flattened your afternoon curves by 30% when you do it.",
    trendData: [2, 2, 3, 5, 3, 2, 2],
    trendLabel: "score 1-5",
  },
];

// ============================================================================
// Overall consolidated score
// ============================================================================
export function overallScore(): { rating: number; lastWeek: number; label: string } {
  const totalWeight = VITALS.reduce((sum, v) => sum + v.weight, 0);
  const weighted    = VITALS.reduce((sum, v) => sum + v.rating * v.weight, 0);
  const rating = Math.round((weighted / totalWeight) * 10) / 10;
  const weightedLast = VITALS.reduce((sum, v) => sum + v.lastWeekRating * v.weight, 0);
  const lastWeek = Math.round((weightedLast / totalWeight) * 10) / 10;
  const label =
    rating >= 4.5 ? "Excellent" :
    rating >= 3.5 ? "Strong" :
    rating >= 2.5 ? "Steady" :
    rating >= 1.5 ? "Room to grow" : "Needs care";
  return { rating, lastWeek, label };
}

// ============================================================================
// Sally identity for the hero
// ============================================================================
export const SALLY_STARS = {
  name: "Sally Reddy",
  initials: "SR",
  weeksInProgram: 13,
  cohort: "GLP-1 · Long Walker",
};

// ============================================================================
// Cohort comparison — mean star ratings across your cohort peers.
// Sourced from Journey Twin's cohort-level aggregation layer (fictional).
// ============================================================================
export const COHORT_AVG: Record<string, number> = {
  tir:       3.8,
  hba1c:     3.5,
  weight:    4.0,
  meds:      4.2,   // cohort actually beats Sally slightly on adherence
  sleep:     3.5,
  activity:  3.2,
  hydration: 3.3,
  stress:    3.6,
  overall:   3.7,
};

// ============================================================================
// 12-week weekly history — for the History tab.
// Values are 0..5 star ratings per week (week 12 = current).
// ============================================================================
export interface WeeklyPoint {
  week: number;              // 1..12 (12 = this week)
  label: string;             // "Wk 12", "Wk 11", etc.
  ratings: Record<string, number>;   // vital id -> star rating
  overall: number;           // weighted overall for that week
}

export const WEEKLY_HISTORY: WeeklyPoint[] = [
  { week: 1,  label: "Wk 1",  overall: 3.2, ratings: { tir: 2.5, hba1c: 3.0, weight: 3.5, meds: 4.0, sleep: 3.5, activity: 3.0, hydration: 2.5, stress: 3.5 } },
  { week: 2,  label: "Wk 2",  overall: 3.2, ratings: { tir: 2.5, hba1c: 3.0, weight: 3.5, meds: 4.0, sleep: 3.5, activity: 3.0, hydration: 3.0, stress: 3.0 } },
  { week: 3,  label: "Wk 3",  overall: 3.3, ratings: { tir: 3.0, hba1c: 3.0, weight: 4.0, meds: 4.5, sleep: 4.0, activity: 3.5, hydration: 3.0, stress: 3.5 } },
  { week: 4,  label: "Wk 4",  overall: 3.4, ratings: { tir: 3.0, hba1c: 3.5, weight: 4.0, meds: 4.5, sleep: 4.0, activity: 3.5, hydration: 2.5, stress: 3.0 } },
  { week: 5,  label: "Wk 5",  overall: 3.5, ratings: { tir: 3.5, hba1c: 3.5, weight: 4.0, meds: 4.5, sleep: 4.0, activity: 4.0, hydration: 3.0, stress: 3.5 } },
  { week: 6,  label: "Wk 6",  overall: 3.6, ratings: { tir: 3.5, hba1c: 3.5, weight: 4.5, meds: 4.0, sleep: 3.5, activity: 4.0, hydration: 3.0, stress: 3.5 } },
  { week: 7,  label: "Wk 7",  overall: 3.5, ratings: { tir: 3.5, hba1c: 3.5, weight: 4.0, meds: 4.0, sleep: 3.0, activity: 3.5, hydration: 3.0, stress: 3.0 } },
  { week: 8,  label: "Wk 8",  overall: 3.6, ratings: { tir: 3.5, hba1c: 4.0, weight: 4.5, meds: 4.0, sleep: 4.0, activity: 4.0, hydration: 3.0, stress: 3.0 } },
  { week: 9,  label: "Wk 9",  overall: 3.7, ratings: { tir: 3.5, hba1c: 4.0, weight: 4.5, meds: 4.0, sleep: 4.0, activity: 4.0, hydration: 3.5, stress: 3.5 } },
  { week: 10, label: "Wk 10", overall: 3.8, ratings: { tir: 4.0, hba1c: 4.0, weight: 4.5, meds: 4.0, sleep: 4.0, activity: 4.0, hydration: 3.0, stress: 3.0 } },
  { week: 11, label: "Wk 11", overall: 3.8, ratings: { tir: 4.0, hba1c: 4.0, weight: 5.0, meds: 3.5, sleep: 4.0, activity: 4.0, hydration: 2.5, stress: 3.0 } },
  { week: 12, label: "This",  overall: 4.1, ratings: { tir: 4.5, hba1c: 4.0, weight: 5.0, meds: 4.0, sleep: 4.0, activity: 4.5, hydration: 3.0, stress: 3.5 } },
];

/** Helper: pull the history slice for a single vital id (12 numbers). */
export function historyFor(vitalId: string): number[] {
  return WEEKLY_HISTORY.map(w => w.ratings[vitalId] ?? 0);
}

export function overallHistory(): number[] {
  return WEEKLY_HISTORY.map(w => w.overall);
}
