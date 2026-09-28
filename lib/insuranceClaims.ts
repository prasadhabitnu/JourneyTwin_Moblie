/**
 * Insurance Claims Forecast
 * -----------------------------------------------------------------------------
 * Computes per-patient 12-month projected insurance claims by category using
 * the same 1,000-patient simulated dataset every other POC page consumes.
 *
 * Categories (7):
 *   pharmacy    — GLP-1 refills + comorbidity meds (dominant · ~60% of spend)
 *   preventive  — routine labs, PCP visits (predictable · quarterly cadence)
 *   specialist  — endo, cardio, GI, BH (reduced by coach absorbing routine touch)
 *   acute       — ED + urgent care (highest variance · Fathom's biggest win)
 *   inpatient   — pancreatitis, cholecystectomy, severe hypoglycemia (rare, costly)
 *   procedures  — imaging, DEXA, sleep studies
 *   behavioral  — HabitNu PMPM + BH claims (fixed per-member cost)
 *
 * All numbers derive deterministically from Patient attributes (bmi, hba1c,
 * comorbidities, pps, pdc, weeksOnProgram, status, etc.) so the aggregate
 * totals are stable across renders. Illustrative — production numbers will
 * differ per client contract + region + benefit design.
 */

import { Patient, PATIENTS } from "./patientData";

// ---------- category types ----------
export const CATEGORIES = [
  "pharmacy",
  "preventive",
  "specialist",
  "acute",
  "inpatient",
  "procedures",
  "behavioral",
] as const;
export type Category = typeof CATEGORIES[number];

export const CATEGORY_META: Record<Category, {
  name: string;
  sub: string;
  colorHex: string;
  bgHex: string;
}> = {
  pharmacy:   { name: "Pharmacy",         sub: "GLP-1 refills + comorbidity meds",  colorHex: "#4338CA", bgHex: "#EEF2FF" },
  preventive: { name: "Preventive",       sub: "A1c, lipid, kidney panels + PCP",   colorHex: "#047857", bgHex: "#ECFDF5" },
  specialist: { name: "Specialist",       sub: "Endo, cardio, GI, dietician",       colorHex: "#0F766E", bgHex: "#CCFBF1" },
  acute:      { name: "Acute care",       sub: "ED + urgent care",                  colorHex: "#BE185D", bgHex: "#FCE7F3" },
  inpatient:  { name: "Inpatient",        sub: "Rare but high-cost events",         colorHex: "#9F1239", bgHex: "#FEE2E2" },
  procedures: { name: "Procedures",       sub: "Imaging, sleep studies, DEXA",      colorHex: "#6D28D9", bgHex: "#EDE9FE" },
  behavioral: { name: "Behavioral/coach", sub: "HabitNu program + BH visits",       colorHex: "#B45309", bgHex: "#FEF3C7" },
};

// ---------- per-patient forecast ----------

export interface ClaimsBreakdown {
  pharmacy: number;
  preventive: number;
  specialist: number;
  acute: number;
  inpatient: number;
  procedures: number;
  behavioral: number;
}

export interface PredictedClaim {
  type: string;
  category: Category;
  estCost: number;
  driver: string;
  probability90d: number;
}

export interface PatientClaimsForecast {
  patient: Patient;
  categories: ClaimsBreakdown;
  total12m: number;
  confidence: number;             // 0..1
  acuteProb90d: number;           // 0..1
  predictedClaim: PredictedClaim;
  interventionImpact: number;     // $ Fathom saves vs no-intervention
}

/** Deterministic hash for stability. */
function h(p: Patient): number {
  let s = 0;
  for (let i = 0; i < p.id.length; i++) s = ((s << 5) - s + p.id.charCodeAt(i)) | 0;
  return Math.abs(s);
}

/** Sub-1 pseudo-random in [0,1) from a Patient. */
function frac(p: Patient, salt = 0): number {
  return ((h(p) + salt * 1013904223) >>> 0) / 4294967296;
}

/** Category multipliers based on comorbidities. */
function comorbLoad(p: Patient): number {
  return p.comorbidities.length;
}

function isActive(p: Patient): boolean {
  return p.status === "Active" || p.status === "Persistent";
}

/** Predict category costs, deterministic per patient. */
export function forecastPatient(p: Patient): PatientClaimsForecast {
  const active   = isActive(p);
  const pdc      = clamp(p.pdc, 0, 1);
  const older    = p.age >= 55 ? 1 : 0;
  const highBMI  = p.bmi >= 32 ? 1 : 0;
  const uncdm    = p.hba1c >= 7.0 ? 1 : p.hba1c >= 6.5 ? 0.5 : 0;
  const risk     = p.rss === "Critical" ? 3 : p.rss === "High" ? 2 : p.rss === "Medium" ? 1 : 0;
  const cLoad    = comorbLoad(p);
  const persist  = clamp(p.pps, 0, 1);
  const noise    = (salt: number) => 0.85 + frac(p, salt) * 0.30;   // 0.85..1.15

  // ---- Pharmacy ----
  // Base: GLP-1 at ~$1,100/mo effective payer cost (post-rebate assumption)
  // Scaled by PDC (adherence) and program status
  const pharmBase = active ? 1100 * 12 * pdc : 200 * 12; // discontinued still may fill lightly
  const comorbMeds = cLoad * 240; // roughly $20/mo per comorbidity med
  const pharmacy = Math.round((pharmBase + comorbMeds) * noise(1));

  // ---- Preventive ----
  // Quarterly labs + annual PCP + wearable/CGM handling
  const preventive = Math.round((400 + cLoad * 60 + older * 80) * noise(2));

  // ---- Specialist ----
  // Endo/dietician if diabetic, cardio if HTN/CAD, GI if MASLD/OSA
  let specialist = 180 + cLoad * 90 + uncdm * 240;
  if (p.comorbidities.includes("Coronary artery disease")) specialist += 300;
  if (p.comorbidities.includes("MASLD")) specialist += 220;
  // Fathom absorbs routine touch — reduce for engaged members
  const specialistReduction = active ? 0.75 + (1 - persist) * 0.15 : 1.0;
  specialist = Math.round(specialist * specialistReduction * noise(3));

  // ---- Acute care (ED + urgent) ----
  // Higher for early weeks (side-effect risk), lower for well-engaged
  const earlyWeeks = p.weeksOnProgram > 0 && p.weeksOnProgram < 12 ? 1.6 : 1.0;
  const acuteBase = 60 + risk * 80 + uncdm * 60 + cLoad * 25;
  const engagementProt = active ? (0.60 + (1 - persist) * 0.40) : 1.0;
  const acute = Math.round(acuteBase * earlyWeeks * engagementProt * noise(4));

  // ---- Inpatient ----
  // Rare (base ~2-4% event rate/yr) but expensive
  const rapidLoss = p.pctBwLoss >= 12 && p.weeksOnProgram <= 32 ? 1.4 : 1.0; // gallstones risk
  const inpatientBase = 380 * (1 + risk * 0.35 + cLoad * 0.06) * rapidLoss;
  const inpatient = Math.round(inpatientBase * noise(5));

  // ---- Procedures ----
  // Imaging, DEXA, sleep studies. OSA drives sleep study.
  let procedures = 120 + older * 60;
  if (p.comorbidities.includes("OSA")) procedures += 320;   // sleep study or CPAP fitting
  if (highBMI) procedures += 90;                             // DEXA
  procedures = Math.round(procedures * noise(6));

  // ---- Behavioral/coaching ----
  // HabitNu PMPM baseline + occasional BH claims from Anxiety/Depression
  let behavioral = 144; // $12 PMPM × 12
  if (p.comorbidities.some(c => ["Depression", "Anxiety"].includes(c))) behavioral += 260;
  behavioral = Math.round(behavioral * noise(7));

  const categories: ClaimsBreakdown = { pharmacy, preventive, specialist, acute, inpatient, procedures, behavioral };
  const total12m = Object.values(categories).reduce((a, b) => a + b, 0);

  // ---- Predicted next-90d claim + acute probability ----
  const predictedClaim = pickPredictedClaim(p, { pharmacy, preventive, specialist, acute, inpatient, procedures, behavioral });
  const acuteProb90d = predictedClaim.probability90d;

  // ---- Fathom intervention impact ----
  // Saves calibrated by persistence gap × engagement × cohort behaviors
  const persistGap = 1 - persist;
  const interventionImpact = Math.round(
    (specialist * 0.20 + acute * 0.45 + inpatient * 0.15) * persistGap * noise(8)
  );

  // ---- Confidence ----
  // Higher when we have more data (weeks on program) and known comorbidities
  const confidence = clamp(
    0.55 + Math.min(p.weeksOnProgram, 30) / 100 + (active ? 0.10 : 0) + (cLoad >= 2 ? 0.05 : 0),
    0.4, 0.98
  );

  return {
    patient: p, categories, total12m, confidence, acuteProb90d, predictedClaim, interventionImpact,
  };
}

// ---------- predicted next-90d claim picker ----------

interface PredictContext {
  pharmacy: number; preventive: number; specialist: number;
  acute: number; inpatient: number; procedures: number; behavioral: number;
}

const CLAIM_OPTIONS: Array<{
  test: (p: Patient) => number;               // returns 0..1 probability
  build: (p: Patient) => PredictedClaim;
}> = [
  // Elena-style: safety keyword / severe recent — ED dehydration
  {
    test: (p) => {
      if (p.status !== "Active") return 0;
      const early = p.weeksOnProgram >= 4 && p.weeksOnProgram <= 12 ? 1 : 0.4;
      const risky = p.rss === "Critical" ? 1 : p.rss === "High" ? 0.7 : 0.2;
      return Math.min(0.85, early * risky * 0.9);
    },
    build: (p) => ({
      type: "ED · dehydration",
      category: "acute",
      estCost: 3400,
      driver: "Vomiting risk in early weeks · dose escalation window",
      probability90d: 0,
    }),
  },
  // Rapid weight loss + GI risk = cholecystectomy
  {
    test: (p) => {
      if (p.pctBwLoss < 12) return 0;
      if (p.weeksOnProgram > 40) return 0;
      return Math.min(0.75, p.pctBwLoss / 25);
    },
    build: (p) => ({
      type: "Cholecystectomy",
      category: "inpatient",
      estCost: 18200,
      driver: `Rapid weight loss (${p.pctBwLoss.toFixed(1)}% BW) · gallstone risk`,
      probability90d: 0,
    }),
  },
  // OSA — sleep study referral
  {
    test: (p) => p.comorbidities.includes("OSA") ? 0.55 : 0,
    build: (p) => ({
      type: "Sleep study",
      category: "procedures",
      estCost: 1850,
      driver: "OSA history · SpO2 or breathing anomalies expected",
      probability90d: 0,
    }),
  },
  // Poorly-controlled diabetes = endo consult
  {
    test: (p) => p.hba1c >= 7.5 ? 0.6 : p.hba1c >= 7.0 ? 0.45 : 0.15,
    build: (p) => ({
      type: "Endo consult",
      category: "specialist",
      estCost: 425,
      driver: `HbA1c ${p.hba1c.toFixed(1)}% · dose review indicated`,
      probability90d: 0,
    }),
  },
  // Cardiovascular history → cardio consult
  {
    test: (p) => p.comorbidities.includes("Coronary artery disease") ? 0.55 : p.comorbidities.includes("Hypertension") && p.age >= 55 ? 0.35 : 0.1,
    build: (p) => ({
      type: "Cardio consult",
      category: "specialist",
      estCost: 390,
      driver: "Cardiovascular history · monitoring cadence",
      probability90d: 0,
    }),
  },
  // Refill lapse (drift signal)
  {
    test: (p) => {
      if (p.status === "Discontinued") return 0.72;
      if (p.pdc < 0.60 && p.status === "Active") return 0.60;
      return 0;
    },
    build: (p) => ({
      type: "Refill appeal / lapse",
      category: "pharmacy",
      estCost: 1240,
      driver: `PDC ${(p.pdc * 100).toFixed(0)}% · adherence risk`,
      probability90d: 0,
    }),
  },
  // Urgent care from nausea patterns
  {
    test: (p) => {
      if (p.weeksOnProgram < 4 || p.weeksOnProgram > 18) return 0;
      return p.rss === "High" ? 0.51 : 0.32;
    },
    build: (p) => ({
      type: "Urgent care · GI symptoms",
      category: "acute",
      estCost: 680,
      driver: "Nausea/vomiting management within GLP-1 dose ramp",
      probability90d: 0,
    }),
  },
  // Dietician (weight-loss motivated members)
  {
    test: (p) => p.bmi >= 32 ? 0.28 : 0.15,
    build: (p) => ({
      type: "Dietician visit",
      category: "specialist",
      estCost: 180,
      driver: "Weight management + food-logging patterns",
      probability90d: 0,
    }),
  },
];

function pickPredictedClaim(p: Patient, ctx: PredictContext): PredictedClaim {
  let best: { prob: number; claim: PredictedClaim } | null = null;
  for (const opt of CLAIM_OPTIONS) {
    const prob = opt.test(p);
    if (prob > (best?.prob ?? 0)) {
      const claim = opt.build(p);
      claim.probability90d = prob;
      best = { prob, claim };
    }
  }
  if (!best) {
    return {
      type: "Routine PCP",
      category: "preventive",
      estCost: 220,
      driver: "Steady member · low-touch monitoring",
      probability90d: 0.18,
    };
  }
  return best.claim;
}

// ---------- aggregate rollups ----------

export interface Aggregate {
  totalSpend: number;
  confBand: { lo: number; hi: number };
  categoryTotals: ClaimsBreakdown;
  categoryTrends: Record<Category, "up" | "down" | "flat">;
  categoryConfidence: Record<Category, number>;
  quarterlyStack: Array<{ quarter: string } & ClaimsBreakdown & { total: number }>;
  fathomImpact: number;
  fathomImpactPct: number;
  highestRiskQuarter: string;
  cohortSize: number;
  activeSize: number;
}

const QUARTERS = ["Q4 2026", "Q1 2027", "Q2 2027", "Q3 2027"];

// Illustrative seasonal / lifecycle multipliers per category per quarter
const Q_SEASON: Record<Category, [number, number, number, number]> = {
  pharmacy:   [1.00, 1.05, 0.96, 0.99],   // dose titration wave Q1
  preventive: [0.95, 1.10, 0.98, 0.97],   // Q1 annual physical wave
  specialist: [0.98, 1.08, 0.94, 1.00],
  acute:      [1.05, 1.15, 0.90, 0.90],   // winter GI + dehydration peak
  inpatient:  [1.00, 1.10, 0.95, 0.95],
  procedures: [1.00, 1.05, 1.00, 0.95],
  behavioral: [1.00, 1.00, 1.00, 1.00],   // fixed PMPM
};

export function computeAggregate(forecasts: PatientClaimsForecast[]): Aggregate {
  const totals: ClaimsBreakdown = { pharmacy: 0, preventive: 0, specialist: 0, acute: 0, inpatient: 0, procedures: 0, behavioral: 0 };
  let totalSpend = 0;
  let fathomImpact = 0;
  let confSum = 0;

  for (const f of forecasts) {
    for (const c of CATEGORIES) totals[c] += f.categories[c];
    totalSpend += f.total12m;
    fathomImpact += f.interventionImpact;
    confSum += f.confidence;
  }

  const avgConf = forecasts.length ? confSum / forecasts.length : 0.75;
  const confBandWidth = totalSpend * (1 - avgConf) * 0.6;
  const confBand = { lo: Math.round(totalSpend - confBandWidth), hi: Math.round(totalSpend + confBandWidth) };

  // Quarterly stack — apply seasonal multipliers to per-quarter (25% of annual) slice
  const quarterlyStack = QUARTERS.map((q, qi) => {
    const per: ClaimsBreakdown = { pharmacy: 0, preventive: 0, specialist: 0, acute: 0, inpatient: 0, procedures: 0, behavioral: 0 };
    let total = 0;
    for (const c of CATEGORIES) {
      const v = Math.round(totals[c] * 0.25 * Q_SEASON[c][qi]);
      per[c] = v;
      total += v;
    }
    return { quarter: q, ...per, total };
  });

  const highestRiskQuarter = quarterlyStack.reduce((a, b) => (b.total > a.total ? b : a)).quarter;

  const trends: Record<Category, "up" | "down" | "flat"> = {
    pharmacy: "up",     // dose escalations trending up
    preventive: "flat",
    specialist: "down", // coach absorbs routine touch
    acute: "down",      // Fathom prevents acute events
    inpatient: "flat",
    procedures: "up",   // sleep-study referrals from Ring
    behavioral: "flat",
  };

  const confidenceMap: Record<Category, number> = {
    pharmacy: 0.92,
    preventive: 0.90,
    specialist: 0.76,
    acute: 0.72,
    inpatient: 0.58,
    procedures: 0.70,
    behavioral: 0.98,
  };

  const activeSize = forecasts.filter(f => isActive(f.patient)).length;

  return {
    totalSpend: Math.round(totalSpend),
    confBand,
    categoryTotals: totals,
    categoryTrends: trends,
    categoryConfidence: confidenceMap,
    quarterlyStack,
    fathomImpact: Math.round(fathomImpact),
    fathomImpactPct: totalSpend ? fathomImpact / totalSpend : 0,
    highestRiskQuarter,
    cohortSize: forecasts.length,
    activeSize,
  };
}

// ---------- top-risk cohort ----------

export function topRiskMembers(forecasts: PatientClaimsForecast[], n = 10): PatientClaimsForecast[] {
  return [...forecasts]
    .sort((a, b) => {
      // Rank by acute probability, weighted by estimated cost so inpatient bubbles up
      const sa = a.acuteProb90d * Math.max(a.predictedClaim.estCost, 100);
      const sb = b.acuteProb90d * Math.max(b.predictedClaim.estCost, 100);
      return sb - sa;
    })
    .slice(0, n);
}

// ---------- intervention scenarios ----------

export interface InterventionScenario {
  label: string;
  headline: string;
  savings: number;
  mechanism: string;
}

export function interventionScenarios(agg: Aggregate, forecasts: PatientClaimsForecast[]): InterventionScenario[] {
  const active = forecasts.filter(f => isActive(f.patient));
  const inActiveTotal = active.reduce((s, f) => s + f.total12m, 0);
  // Split the top-line Fathom impact into 4 illustrative buckets so payers see where it comes from
  const impact = agg.fathomImpact;
  return [
    {
      label: "Prevented",
      headline: "ED visits from GI side-effect withdrawal",
      savings: Math.round(impact * 0.14),
      mechanism: "Fathom detects the avoidance pattern (log nausea → go silent). Nu asks early, coach reaches out same-day. Members feel supported and don't spiral into ED-level dehydration.",
    },
    {
      label: "Prevented",
      headline: "Post-coach engagement drift → discontinuation",
      savings: Math.round(impact * 0.60),
      mechanism: "3-month re-engagement ASK catches drift. Preserved persistence = continued refills = weight/A1c maintained = no cascade into insulin claims or bariatric consults.",
    },
    {
      label: "Reduced",
      headline: "Duplicate specialist consults",
      savings: Math.round(impact * 0.09),
      mechanism: "Coach absorbs routine treatment-experience questions. Members don't book endo visits for questions the coach can answer with Lilly-approved copy.",
    },
    {
      label: "Earlier detection",
      headline: "Sleep-apnea referrals from Ring signals",
      savings: Math.round(impact * 0.17),
      mechanism: "SpO2 dips + snoring flagged 4-6 months earlier than symptom-driven referral. Earlier CPAP = fewer cardiovascular claims downstream.",
    },
  ];
}

// ---------- convenience ----------

export function forecastAll(): PatientClaimsForecast[] {
  return PATIENTS.map(forecastPatient);
}

function clamp(x: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, x)); }

// USD formatter helpers used by the page
export function fmtUSD(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
export function fmtUSDFull(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}
