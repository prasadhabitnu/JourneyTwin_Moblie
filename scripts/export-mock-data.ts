/**
 * Export mock data from the dashboard's synthetic pipeline into JSON
 * files consumed by the Flutter mobile app (mobile/habitnu_nu/).
 *
 * Run:
 *   cd glp1-dashboard
 *   npx tsx scripts/export-mock-data.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { PATIENTS } from "../lib/patientData";
import {
  generateCgmStream,
  nuSuccessProfiles,
  computeAgp,
  lensInsight,
  CgmStream,
  DayStats,
  CgmReading,
  CgmAnnotation,
  SuccessProfile,
  AgpBin,
  CgmLens,
  LensInsight,
} from "../lib/cgmData";

const EXPORT_IDS = ["P100967", "P100150", "P100210", "P100384", "P100736", "P100003"];

// -------- Transform helpers --------

interface DartReading { t: string; mgdl: number; }
interface DartAnnotation { t: string; kind: string; label: string; note?: string; }
interface DartDayStats {
  date: string; tir: number; timeAbove: number; timeBelow: number;
  gmi: number; cv: number; meanGlucose: number; label: string;
  readings: DartReading[]; annotations: DartAnnotation[];
}

function toDartReading(r: CgmReading): DartReading {
  return { t: new Date(r.t).toISOString(), mgdl: Math.round(r.glucose * 10) / 10 };
}

function toDartAnnotation(a: CgmAnnotation): DartAnnotation {
  return { t: new Date(a.t).toISOString(), kind: a.kind, label: a.label, note: a.attribution };
}

function toDartDay(d: DayStats): DartDayStats {
  const iso = parseDashboardDateToIso(d.date, 2026);
  const gmi = 3.31 + 0.02392 * d.avg;
  return {
    date: iso,
    tir: d.timeInRange / 100.0,
    timeAbove: d.timeAbove / 100.0,
    timeBelow: d.timeBelow / 100.0,
    gmi: Math.round(gmi * 100) / 100,
    cv: d.cv,
    meanGlucose: d.avg,
    label: d.date,
    readings: d.readings.map(toDartReading),
    annotations: d.annotations.map(toDartAnnotation),
  };
}

function toDartStream(s: CgmStream) {
  return { patientId: s.patientId, days: s.days.map(toDartDay) };
}

function parseDashboardDateToIso(label: string, year: number): string {
  const parts = label.split(" ");
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const monthStr = parts[1];
  const day = parseInt(parts[2], 10);
  return new Date(Date.UTC(year, monthMap[monthStr] ?? 0, day)).toISOString();
}

function toDartSuccessProfile(p: SuccessProfile, stream: CgmStream): unknown {
  return {
    id: p.id, name: p.name, tagline: p.tagline, emoji: p.emoji,
    matchStrength: Math.max(0, Math.min(100, Math.round(p.avgTir))),
    recipe: p.recipe.map((r) => r.label),
    matchingDays: p.matchingDayIndices.map((i) => stream.days[i]?.date ?? "").filter(Boolean),
    nuEnhancements: [
      `${p.nuEnhancement.title} - ${p.nuEnhancement.detail}`,
      `Estimated lift: ${p.nuEnhancement.estimatedLift}`,
    ],
  };
}

// -------- Sections --------

function exportPatients() {
  return EXPORT_IDS.map((id) => {
    const p = PATIENTS.find((x) => x.id === id);
    if (!p) return null;
    return {
      id: p.id, name: p.name, age: p.age, sex: p.sex,
      bmi: Math.round(p.bmi * 10) / 10,
      hba1c: Math.round(p.hba1c * 10) / 10,
      weeksOnProgram: p.weeksOnProgram,
      rss: p.rss, tier: (p as any).tier ?? "GLP-1 Direct",
    };
  }).filter(Boolean);
}

function exportStreams() {
  const streams: Record<string, unknown> = {};
  for (const id of EXPORT_IDS) streams[id] = toDartStream(generateCgmStream(id));
  return streams;
}

function exportProfiles() {
  const profiles: Record<string, unknown[]> = {};
  for (const id of EXPORT_IDS) {
    const s = generateCgmStream(id);
    profiles[id] = nuSuccessProfiles(s).map((p) => toDartSuccessProfile(p, s));
  }
  return profiles;
}

function exportAgp() {
  const agp: Record<string, AgpBin[]> = {};
  for (const id of EXPORT_IDS) agp[id] = computeAgp(generateCgmStream(id).days);
  return agp;
}

const LENSES: CgmLens[] = ["default", "notices", "remembers", "predicts", "recommends", "recovery"];

function exportLensInsights() {
  const out: Record<string, Record<CgmLens, LensInsight>> = {};
  for (const id of EXPORT_IDS) {
    const s = generateCgmStream(id);
    const perLens = {} as Record<CgmLens, LensInsight>;
    for (const l of LENSES) perLens[l] = lensInsight(s, s.days.length - 1, l);
    out[id] = perLens;
  }
  return out;
}

// -------- NEW: Habitnu light-theme extensions --------

// Sally = the mobile-only demo persona. Underlying data mirrors Sandy's CGM
// stream (from the pipeline) but with Habitnu-specific display fields.
const SALLY_ID = "P100967"; // routes to Sandy's CGM data on the backend

function exportDailyMetrics() {
  // 14 days ending "today" (Jul 1, 2026). Weight trends down from 185 to 178.
  // Sleep and stress fluctuate. Momentum score rises from 62 to 78.
  const seed = [
    { d: "Jun 18", weight: 185.2, sleep: 6.0, stress: 4, mood: "okay",       momentum: 62 },
    { d: "Jun 19", weight: 184.8, sleep: 6.5, stress: 3, mood: "good",       momentum: 64 },
    { d: "Jun 20", weight: 184.3, sleep: 7.2, stress: 3, mood: "good",       momentum: 66 },
    { d: "Jun 21", weight: 183.9, sleep: 7.0, stress: 3, mood: "good",       momentum: 67 },
    { d: "Jun 22", weight: 183.4, sleep: 6.8, stress: 4, mood: "okay",       momentum: 66 },
    { d: "Jun 23", weight: 182.8, sleep: 7.5, stress: 2, mood: "good",       momentum: 70 },
    { d: "Jun 24", weight: 182.2, sleep: 7.8, stress: 2, mood: "good",       momentum: 72 },
    { d: "Jun 25", weight: 181.7, sleep: 6.5, stress: 5, mood: "struggling", momentum: 68 },
    { d: "Jun 26", weight: 181.2, sleep: 7.0, stress: 3, mood: "okay",       momentum: 70 },
    { d: "Jun 27", weight: 180.5, sleep: 7.4, stress: 2, mood: "good",       momentum: 74 },
    { d: "Jun 28", weight: 179.9, sleep: 7.6, stress: 2, mood: "good",       momentum: 75 },
    { d: "Jun 29", weight: 179.4, sleep: 7.2, stress: 3, mood: "good",       momentum: 76 },
    { d: "Jun 30", weight: 178.8, sleep: 7.5, stress: 2, mood: "good",       momentum: 77 },
    { d: "Jul 1",  weight: 178.0, sleep: 7.4, stress: 2, mood: "good",       momentum: 78 },
  ];
  const days = seed.map((s) => ({
    date: parseDashboardDateToIso(`Mon ${s.d}`, 2026),
    label: s.d,
    weight: s.weight,
    sleepHours: s.sleep,
    stress: s.stress,           // 1..5
    mood: s.mood,               // "good" | "okay" | "struggling"
    momentum: s.momentum,       // 0..100
  }));
  return { [SALLY_ID]: days };
}

function exportCompassScores() {
  // 0..100 per segment. Higher = healthier. Center Momentum = 78.
  return {
    [SALLY_ID]: {
      movement:  74,
      nutrition: 68,
      glucose:   85,
      sleep:     72,
      stress:    60,
      hydration: 80,
      mindset:   65,
      weight:    70,
    },
  };
}

function exportCompassInsights() {
  // Nu Noticed / Recommends per segment. Text is hand-curated for the demo.
  const perSegment = {
    glucose: {
      noticed: [
        "You had 2 spikes today.",
        "Breakfast caused your highest spike (174 mg/dL).",
        "Your walk after dinner helped you recover faster.",
      ],
      recommends: [
        "Add protein to breakfast.",
        "Walk 15-20 min after meals.",
        "Keep rice, pasta, bread moderate.",
      ],
      actions: ["snap-meal", "log-meal", "ask-nu", "why-this-helps"],
    },
    movement: {
      noticed: [
        "You walked 3 of your last 5 evenings.",
        "Longest walk this week: 32 min on Tuesday.",
        "Post-walk glucose stayed under 140 mg/dL on 4 of 4 evenings.",
      ],
      recommends: [
        "Aim for a 20-min walk after dinner tonight.",
        "Add a short mid-day walk when time permits.",
        "Track your route - familiar loops help build the habit.",
      ],
      actions: ["log-activity", "ask-nu", "why-this-helps", "set-reminder"],
    },
    nutrition: {
      noticed: [
        "You had 2 higher-carb meals this week.",
        "Protein at breakfast helps your glucose stay steadier.",
        "You do best when dinner is balanced with protein and veggies.",
      ],
      recommends: [
        "Add protein to breakfast tomorrow.",
        "Aim for 25-30g protein per meal.",
        "Fill half your plate with veggies.",
      ],
      actions: ["snap-meal", "log-meal", "ask-nu", "why-this-helps"],
    },
    sleep: {
      noticed: [
        "Averaging 7.3 hours the last 7 nights.",
        "Fasting glucose 12% lower on nights >= 7.5 hours.",
        "Wednesday's 6.5-hour night preceded your Thursday morning spike.",
      ],
      recommends: [
        "Aim for 7-8 hours tonight.",
        "Wind-down 30 min before bed.",
        "Keep screens dim after 10 PM.",
      ],
      actions: ["log-sleep", "ask-nu", "why-this-helps", "set-reminder"],
    },
    stress: {
      noticed: [
        "Stress level rose to 5/5 on Wednesday.",
        "Cortisol spikes correlate with your afternoon glucose bumps.",
        "You had 2 calming days in a row - your rings look flatter.",
      ],
      recommends: [
        "Try a 4-minute breathing exercise this afternoon.",
        "Block one no-meeting hour tomorrow.",
        "Text a friend - social contact predicts your calmest days.",
      ],
      actions: ["log-stress", "start-breath", "ask-nu", "why-this-helps"],
    },
    hydration: {
      noticed: [
        "8 glasses on your best days.",
        "You drink less on high-stress mornings.",
        "Hydrated days show 15% lower glucose variability.",
      ],
      recommends: [
        "Keep a water bottle within arm's reach.",
        "Aim for 2 glasses before lunch.",
        "Herbal tea counts.",
      ],
      actions: ["log-water", "ask-nu", "why-this-helps", "set-reminder"],
    },
    mindset: {
      noticed: [
        "Journaling 3 days this week.",
        "Positive-mood mornings correlate with better food choices.",
        "You reported feeling 'good' 9 of the last 14 days.",
      ],
      recommends: [
        "Start each morning with one thing you're grateful for.",
        "Note wins - not just misses - in your check-in.",
        "Talk to Nu when you need to think out loud.",
      ],
      actions: ["ask-nu", "why-this-helps", "log-mood", "start-journal"],
    },
    weight: {
      noticed: [
        "Down 7 lbs in 14 days.",
        "Steady 0.5 lb/day trend since starting Long Walker.",
        "8 lbs to your 170 lb goal.",
      ],
      recommends: [
        "Weigh in weekly, not daily - trends matter more than spikes.",
        "Protein + fiber keep you fuller between meals.",
        "Small changes stick - big changes rebound.",
      ],
      actions: ["log-weight", "ask-nu", "why-this-helps", "view-trend"],
    },
  };
  return { [SALLY_ID]: perSegment };
}

function exportPeopleLikeMe() {
  return {
    [SALLY_ID]: {
      cohortLabel: "Started at 152 lbs with similar goals and evening glucose spikes.",
      ageRange: "50-55",
      similarity: ["Similar habits", "Similar goals"],
      whatWorked: [
        "Walked 20 min after dinner",
        "Protein-first breakfast",
        "Slept 7+ hours",
      ],
      results30d: {
        spikeReduction: -28,   // percent
        weightLoss: -8,        // lbs
        tirImprovement: 11,    // percent points
      },
    },
  };
}

function exportPredictions() {
  return {
    [SALLY_ID]: {
      plan: "The Long Walker",
      momentumNow: 78,
      momentumIn7Days: 86,
      weightNow: 178.0,
      weightIn7Days: 176.5,
      confidence: 0.82,
      note: "If you stay on The Long Walker plan this week.",
    },
  };
}

// -------- main --------

function main() {
  const outDir = path.resolve(__dirname, "..", "..", "mobile", "habitnu_nu", "assets", "data");
  fs.mkdirSync(outDir, { recursive: true });

  const bundle: Array<[string, unknown]> = [
    ["patients.json",         exportPatients()],
    ["cgm_streams.json",      exportStreams()],
    ["success_profiles.json", exportProfiles()],
    ["agp.json",              exportAgp()],
    ["lens_insights.json",    exportLensInsights()],
    // NEW Habitnu-light-theme sections
    ["daily_metrics.json",    exportDailyMetrics()],
    ["compass_scores.json",   exportCompassScores()],
    ["compass_insights.json", exportCompassInsights()],
    ["people_like_me.json",   exportPeopleLikeMe()],
    ["predictions.json",      exportPredictions()],
  ];

  for (const [name, data] of bundle) {
    const p = path.join(outDir, name);
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
    const kb = (fs.statSync(p).size / 1024).toFixed(1);
    console.log(`   wrote ${name} (${kb} KB)`);
  }
  console.log("done -> " + outDir);
}

main();
