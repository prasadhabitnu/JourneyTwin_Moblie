/**
 * GLP-1 Population Intelligence — Simulated dataset.
 *
 * Generates 1,000 deterministic, internally-consistent patient records used by
 * every page of the POC. Computes the four canonical scores defined in the
 * blueprint:
 *   - GES (GLP-1 Eligibility Score)         0–100
 *   - PPS (Persistence Probability Score)    0–1
 *   - OFS (Outcome Forecast Score)           predicted % BW loss at 52w
 *   - RSS (Risk Stratification Score)        Low / Medium / High / Critical
 *
 * All randomness uses a seeded PRNG so the dataset is identical across renders
 * and across server/client. NO external data calls are made.
 */

// ---------- seeded PRNG ----------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260506);
const r = () => rand();
const ri = (lo: number, hi: number) => Math.floor(r() * (hi - lo + 1)) + lo;
const rf = (lo: number, hi: number) => r() * (hi - lo) + lo;
const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
const pickWeighted = <T,>(items: { v: T; w: number }[]): T => {
  const total = items.reduce((a, b) => a + b.w, 0);
  let x = r() * total;
  for (const it of items) { x -= it.w; if (x <= 0) return it.v; }
  return items[items.length - 1].v;
};
const norm = (mean: number, sd: number) => {
  // Box-Muller
  const u1 = Math.max(r(), 1e-9);
  const u2 = r();
  return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

// ---------- reference data ----------
export const PROGRAM_STATUS = ["Identified", "Outreach", "Active", "Persistent", "Discontinued", "Completed"] as const;
export type ProgramStatus = typeof PROGRAM_STATUS[number];

export const ELIG_TIER = ["T1", "T2", "T3", "T4", "T5"] as const;
export type EligTier = typeof ELIG_TIER[number];

export const READINESS_BAND = ["R1", "R2", "R3", "R4"] as const;
export type ReadinessBand = typeof READINESS_BAND[number];

export const RISK_BAND = ["Low", "Medium", "High", "Critical"] as const;
export type RiskBand = typeof RISK_BAND[number];

export const REGIONS = [
  { code: "MW", name: "Midwest", weight: 0.22, baseLat: 41.5, baseLng: -87.6 },
  { code: "NE", name: "Northeast", weight: 0.20, baseLat: 40.7, baseLng: -74.0 },
  { code: "SE", name: "Southeast", weight: 0.24, baseLat: 33.7, baseLng: -84.4 },
  { code: "SW", name: "Southwest", weight: 0.18, baseLat: 32.7, baseLng: -96.8 },
  { code: "W",  name: "West",      weight: 0.16, baseLat: 34.0, baseLng: -118.2 },
];

const STATES_BY_REGION: Record<string, string[]> = {
  MW: ["IL", "OH", "MI", "IN", "WI", "MN", "MO", "IA"],
  NE: ["NY", "PA", "NJ", "MA", "CT", "MD"],
  SE: ["FL", "GA", "NC", "SC", "TN", "AL", "VA"],
  SW: ["TX", "AZ", "NM", "OK"],
  W:  ["CA", "WA", "OR", "CO", "NV", "UT"],
};

const PAYER_POSTURES = [
  "Commercial PA-friendly",
  "Commercial step-therapy",
  "Medicare Part D (limited)",
  "Medicaid (state-variable)",
  "Self-pay / cash",
] as const;

const ETHNICITIES = [
  { v: "White (non-Hispanic)", w: 0.55 },
  { v: "Black / African American", w: 0.13 },
  { v: "Hispanic / Latino", w: 0.18 },
  { v: "Asian", w: 0.07 },
  { v: "South Asian", w: 0.04 },
  { v: "Other / Multiracial", w: 0.03 },
];

const SEX = [
  { v: "F", w: 0.56 },
  { v: "M", w: 0.43 },
  { v: "X", w: 0.01 },
] as const;

// "Sandy" is intentionally NOT in this pool — the demo hero P100150 is pinned to "Sandy R."
// via NAME_OVERRIDES_BY_ID below, and we don't want any other random patient to collide
// with that name (previously P100736 was getting "Sandy S." which broke the demo storyline).
const FIRST_F = ["Maria","Sarah","Jennifer","Linda","Patricia","Aisha","Priya","Mei","Olivia","Sofia","Elena","Grace","Naomi","Diane","Rachel","Tanya","Carmen","Yara","Joy","Hannah"];
const FIRST_M = ["James","Michael","David","Robert","Jose","Carlos","Raj","Wei","Daniel","Marcus","Anthony","Vikram","Ahmed","Ethan","Kevin","Andre","Hector","Liam","Noah","Omar"];
const LASTS = ["Rivera","Johnson","Patel","Chen","Garcia","Williams","Smith","Nguyen","Jackson","Martinez","Anderson","Khan","Singh","Brown","Davis","Wilson","Lopez","Cohen","Park","Thompson"];

// ---------- patient generation ----------
export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: "F" | "M" | "X";
  ethnicity: string;
  region: string;
  state: string;
  city: string;
  lat: number;
  lng: number;

  // Clinical
  bmi: number;
  hba1c: number;
  fastingGlucose: number;
  systolicBP: number;
  diastolicBP: number;
  ldl: number;
  egfr: number;
  comorbidities: string[];
  hasContraindication: boolean;

  // Program
  payerPosture: typeof PAYER_POSTURES[number];
  status: ProgramStatus;
  weeksOnProgram: number;
  baselineWeightLb: number;
  currentWeightLb: number;
  pctBwLoss: number;

  // Engagement
  portalLogins90d: number;
  coachInteractions90d: number;
  pdc: number; // proportion of days covered, 0-1
  appOptIn: boolean;

  // Scores (computed)
  ges: number;
  gesTier: EligTier;
  pps: number;
  ppsBand: ReadinessBand;
  ofs: number;
  rss: RiskBand;

  // Coach reference bucket key
  bucket: string;
}

const COMORBIDITY_POOL = [
  "Hypertension", "Hyperlipidemia", "OSA", "MASLD", "PCOS",
  "Osteoarthritis", "Depression", "Anxiety", "CKD-3",
  "Coronary artery disease", "Atrial fibrillation",
];

function pickComorbidities(age: number, bmi: number, hba1c: number): string[] {
  const out: string[] = [];
  const obese = bmi >= 30;
  const old = age >= 55;
  const dia = hba1c >= 6.5;

  if (r() < (obese ? 0.65 : 0.35)) out.push("Hypertension");
  if (r() < 0.35) out.push("Hyperlipidemia");
  if (r() < (obese ? 0.30 : 0.10)) out.push("OSA");
  if (r() < (obese ? 0.18 : 0.05)) out.push("MASLD");
  if (r() < (old ? 0.22 : 0.10)) out.push("Osteoarthritis");
  if (r() < 0.18) out.push("Depression");
  if (r() < 0.22) out.push("Anxiety");
  if (dia && r() < 0.18) out.push("CKD-3");
  if (old && r() < 0.10) out.push("Coronary artery disease");
  if (old && r() < 0.06) out.push("Atrial fibrillation");

  // Sex-specific
  if (r() < 0.04) out.push("PCOS");

  return out.slice(0, 5);
}

function bucketFor(p: {
  age: number; sex: "F" | "M" | "X"; bmi: number; hba1c: number;
  ethnicity: string; comorbidities: string[];
}): string {
  const hasHTN = p.comorbidities.includes("Hypertension");
  if (p.sex === "F" && p.age >= 35 && p.age <= 45 && p.hba1c >= 6.5) return "W35-45_T2DM";
  if (p.sex === "M" && p.bmi >= 35 && p.hba1c < 6.5) return "M_BMI_35plus";
  if (p.hba1c >= 5.7 && p.hba1c < 6.5) return "PreDM_active";
  if (hasHTN && p.bmi >= 30) return "HTN_OB_combo";
  if (p.ethnicity === "South Asian") return "SA_cardiometabolic";
  if (p.sex === "F" && p.age >= 25 && p.age <= 35) return "Postpartum_year1";
  if (p.age >= 55 && p.hba1c >= 6.5) return "55plus_T2DM";
  return "Workforce_shift";
}

function computeGES(p: {
  bmi: number; hba1c: number; comorbidities: string[];
  hasContraindication: boolean; egfr: number; age: number;
}): { ges: number; tier: EligTier } {
  if (p.hasContraindication) return { ges: 0, tier: "T5" };
  let s = 0;
  if (p.bmi >= 30) s += 25;
  else if (p.bmi >= 27 && p.comorbidities.length >= 1) s += 18;
  else if (p.bmi >= 25) s += 8;

  if (p.hba1c >= 7.0) s += 20;
  else if (p.hba1c >= 6.5) s += 12;
  else if (p.hba1c >= 5.7) s += 5;

  if (p.comorbidities.some(c => ["Coronary artery disease", "Hypertension", "Hyperlipidemia"].includes(c))) s += 8;
  if (p.comorbidities.includes("OSA")) s += 4;
  if (p.comorbidities.includes("MASLD")) s += 4;

  if (p.egfr < 30) s -= 25;
  if (p.age > 75 && p.hba1c < 6.5) s -= 10;

  const ges = Math.round(clamp(s + norm(0, 4), 0, 100));
  let tier: EligTier;
  if (ges >= 60) tier = "T1";
  else if (ges >= 40) tier = "T2";
  else if (ges >= 25) tier = "T3";
  else tier = "T4";
  return { ges, tier };
}

function computePPS(p: {
  pdc: number; portalLogins90d: number; coachInteractions90d: number;
  appOptIn: boolean; status: ProgramStatus; weeksOnProgram: number;
}): { pps: number; band: ReadinessBand } {
  let s = 0.30;
  s += clamp(p.pdc, 0, 1) * 0.35;
  s += clamp(p.portalLogins90d / 60, 0, 1) * 0.15;
  s += clamp(p.coachInteractions90d / 12, 0, 1) * 0.10;
  s += p.appOptIn ? 0.08 : 0;
  if (p.status === "Discontinued") s -= 0.25;
  if (p.weeksOnProgram >= 26) s += 0.05;
  s += norm(0, 0.04);
  const pps = clamp(s, 0.02, 0.98);
  let band: ReadinessBand;
  if (pps >= 0.70) band = "R1";
  else if (pps >= 0.50) band = "R2";
  else if (pps >= 0.30) band = "R3";
  else band = "R4";
  return { pps, band };
}

function computeOFS(p: { ges: number; pps: number; bmi: number; hba1c: number; weeksOnProgram: number; pctBwLoss: number; }): number {
  // Predicted % BW loss at 52 weeks
  const base = 6 + (p.ges / 100) * 9 + p.pps * 6 + (p.bmi >= 35 ? 2 : 0) + (p.hba1c >= 7 ? 1 : 0);
  // Pull toward observed-so-far if program time exists
  const observedAdj = p.weeksOnProgram > 8 ? p.pctBwLoss * (52 / Math.max(p.weeksOnProgram, 12)) : null;
  const blended = observedAdj == null ? base : 0.55 * base + 0.45 * observedAdj;
  return clamp(blended + norm(0, 1.0), 0, 28);
}

function computeRSS(p: {
  comorbidities: string[]; bmi: number; egfr: number; systolicBP: number; hasContraindication: boolean; pps: number; status: ProgramStatus;
}): RiskBand {
  let s = 0;
  s += p.comorbidities.length * 0.6;
  if (p.bmi >= 40) s += 1.5;
  if (p.egfr < 45) s += 1.5;
  if (p.systolicBP >= 160) s += 1.0;
  if (p.comorbidities.includes("Coronary artery disease")) s += 1.5;
  if (p.comorbidities.includes("Atrial fibrillation")) s += 1.0;
  if (p.hasContraindication) s += 2.0;
  if (p.pps < 0.3) s += 0.8;
  if (p.status === "Discontinued") s += 0.8;

  if (s >= 5.5) return "Critical";
  if (s >= 3.5) return "High";
  if (s >= 1.5) return "Medium";
  return "Low";
}

function generatePatient(idx: number): Patient {
  const region = pickWeighted(REGIONS.map(reg => ({ v: reg, w: reg.weight })));
  const state = pick(STATES_BY_REGION[region.code]);
  const lat = region.baseLat + norm(0, 1.5);
  const lng = region.baseLng + norm(0, 2.0);
  const city = pick(["Springfield", "Riverside", "Madison", "Franklin", "Georgetown", "Arlington", "Fairview", "Salem", "Greenville", "Hudson"]);

  const sex = pickWeighted(SEX.map(s => ({ v: s.v as "F"|"M"|"X", w: s.w })));
  const ethnicity = pickWeighted(ETHNICITIES);

  // Age: tilt toward 35-65 (the high-eligibility window)
  const age = Math.round(clamp(norm(48, 14), 18, 85));

  // BMI: target a population skewed for a GLP-1 program
  const bmi = clamp(norm(33, 5.5), 19, 55);

  // HbA1c: bimodal-ish (non-diabetic + diabetic)
  const hba1c = r() < 0.32
    ? clamp(norm(7.4, 0.9), 5.0, 12.5)   // diabetic
    : clamp(norm(5.6, 0.5), 4.6, 6.4);   // non-diabetic / pre

  const fastingGlucose = clamp(70 + (hba1c - 5) * 30 + norm(0, 8), 60, 280);
  const systolicBP = Math.round(clamp(norm(130, 16) + (bmi >= 30 ? 4 : 0), 95, 195));
  const diastolicBP = Math.round(clamp(systolicBP * 0.65 + norm(0, 5), 55, 120));
  const ldl = Math.round(clamp(norm(115, 30), 50, 220));
  const egfr = Math.round(clamp(norm(85, 18) - Math.max(0, age - 50) * 0.4, 22, 130));

  const comorbidities = pickComorbidities(age, bmi, hba1c);

  const hasContraindication = r() < 0.025; // ~2.5%

  const payerPosture = pickWeighted([
    { v: PAYER_POSTURES[0], w: 0.30 },
    { v: PAYER_POSTURES[1], w: 0.27 },
    { v: PAYER_POSTURES[2], w: 0.16 },
    { v: PAYER_POSTURES[3], w: 0.18 },
    { v: PAYER_POSTURES[4], w: 0.09 },
  ]);

  // Status distribution & program time
  const status: ProgramStatus = pickWeighted([
    { v: "Identified", w: 0.22 },
    { v: "Outreach", w: 0.18 },
    { v: "Active", w: 0.20 },
    { v: "Persistent", w: 0.15 },
    { v: "Discontinued", w: 0.13 },
    { v: "Completed", w: 0.12 },
  ]);

  const weeksOnProgram = (() => {
    switch (status) {
      case "Identified": return 0;
      case "Outreach": return ri(1, 4);
      case "Active": return ri(2, 16);
      case "Persistent": return ri(20, 44);
      case "Discontinued": return ri(4, 30);
      case "Completed": return ri(48, 78);
    }
  })();

  const baselineWeightLb = Math.round(bmi * 6.5 + norm(0, 12));
  const persistentLikelihood = status === "Persistent" || status === "Completed";
  const pctBwLoss = (() => {
    if (status === "Identified" || status === "Outreach") return 0;
    const ramp = clamp(weeksOnProgram / 26, 0, 1);
    const peak = persistentLikelihood ? rf(8, 22) : status === "Discontinued" ? rf(1, 6) : rf(3, 12);
    return Math.max(0, peak * ramp + norm(0, 0.6));
  })();
  const currentWeightLb = Math.round(baselineWeightLb * (1 - pctBwLoss / 100));

  const pdc = (() => {
    if (status === "Identified" || status === "Outreach") return 0;
    if (status === "Discontinued") return clamp(rf(0.15, 0.55), 0.05, 0.95);
    if (status === "Persistent" || status === "Completed") return clamp(rf(0.78, 0.97), 0.5, 1);
    return clamp(rf(0.45, 0.85), 0.2, 1);
  })();

  const portalLogins90d = Math.max(0, Math.round(norm(persistentLikelihood ? 28 : 12, 14)));
  const coachInteractions90d = Math.max(0, Math.round(norm(persistentLikelihood ? 7 : 3, 3)));
  const appOptIn = r() < (persistentLikelihood ? 0.92 : 0.55);

  // Scores
  const { ges, tier } = computeGES({ bmi, hba1c, comorbidities, hasContraindication, egfr, age });
  const { pps, band } = computePPS({ pdc, portalLogins90d, coachInteractions90d, appOptIn, status, weeksOnProgram });
  const ofs = computeOFS({ ges, pps, bmi, hba1c, weeksOnProgram, pctBwLoss });
  const rss = computeRSS({ comorbidities, bmi, egfr, systolicBP, hasContraindication, pps, status });

  const first = sex === "F" ? pick(FIRST_F) : sex === "M" ? pick(FIRST_M) : pick([...FIRST_F, ...FIRST_M]);
  const last = pick(LASTS);
  let name = `${first} ${last[0]}.`;
  // Demo-story name overrides — pin specific patient IDs so the demo storyline is consistent.
  // P100967 is Linda B. (47F, BMI 34.3, HbA1c 7.2, wk 13) by natural generation — a textbook
  // GLP-1 demo persona. We rename her display to "Sandy R." so the coach-intelligence
  // GLP-1-side-effects narrative lands on a genuine female mid-40s profile.
  const NAME_OVERRIDES_BY_ID: Record<string, string> = {
    P100967: "Sandy R.",
  };
  const patientIdForOverride = `P${(100000 + idx).toString()}`;
  if (NAME_OVERRIDES_BY_ID[patientIdForOverride]) {
    name = NAME_OVERRIDES_BY_ID[patientIdForOverride];
  }

  const bucket = bucketFor({ age, sex, bmi, hba1c, ethnicity, comorbidities });

  return {
    id: `P${(100000 + idx).toString()}`,
    name,
    age, sex, ethnicity,
    region: region.name, state, city, lat, lng,
    bmi: Number(bmi.toFixed(1)),
    hba1c: Number(hba1c.toFixed(1)),
    fastingGlucose: Math.round(fastingGlucose),
    systolicBP, diastolicBP, ldl, egfr,
    comorbidities, hasContraindication,
    payerPosture, status,
    weeksOnProgram,
    baselineWeightLb, currentWeightLb,
    pctBwLoss: Number(pctBwLoss.toFixed(1)),
    portalLogins90d, coachInteractions90d,
    pdc: Number(pdc.toFixed(2)),
    appOptIn,
    ges, gesTier: tier,
    pps: Number(pps.toFixed(3)), ppsBand: band,
    ofs: Number(ofs.toFixed(1)),
    rss,
    bucket,
  };
}

// ---------- generate once and freeze ----------
export const PATIENTS: Patient[] = Array.from({ length: 1000 }, (_, i) => generatePatient(i));

// ---------- aggregate helpers used by pages ----------
export function summary() {
  const total = PATIENTS.length;
  const eligible = PATIENTS.filter(p => p.gesTier === "T1" || p.gesTier === "T2").length;
  const active = PATIENTS.filter(p => ["Active", "Persistent", "Completed"].includes(p.status)).length;
  const persistent = PATIENTS.filter(p => p.status === "Persistent" || p.status === "Completed").length;
  const discontinued = PATIENTS.filter(p => p.status === "Discontinued").length;

  const onProgram = PATIENTS.filter(p => p.weeksOnProgram > 0);
  const avgPctLoss = onProgram.length
    ? onProgram.reduce((a, p) => a + p.pctBwLoss, 0) / onProgram.length
    : 0;
  const avgOfs = PATIENTS.reduce((a, p) => a + p.ofs, 0) / total;

  // Cost model — illustrative
  const drugMonthlyNet = 720;     // $/persistent/month
  const programPmpm = 14;         // $/managed life/month
  const persistentSpend = persistent * drugMonthlyNet * 12;
  const programSpend = total * programPmpm * 12;
  const totalSpend = persistentSpend + programSpend;
  const aggregateLoss = onProgram.reduce((a, p) => a + p.pctBwLoss, 0);
  const costPerPctLoss = aggregateLoss > 0 ? totalSpend / aggregateLoss : 0;

  return {
    total,
    eligible,
    active,
    persistent,
    discontinued,
    persistenceRate: active > 0 ? persistent / active : 0,
    avgPctLoss,
    avgOfs,
    costPerPctLoss,
    nps: 62,                       // simulated platform NPS
    coachCaseload: 285,            // platform target with copilot
  };
}

export function tierCounts() {
  const out: Record<EligTier, number> = { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0 };
  for (const p of PATIENTS) out[p.gesTier]++;
  return out;
}

export function riskCounts() {
  const out: Record<RiskBand, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  for (const p of PATIENTS) out[p.rss]++;
  return out;
}

export function readinessCounts() {
  const out: Record<ReadinessBand, number> = { R1: 0, R2: 0, R3: 0, R4: 0 };
  for (const p of PATIENTS) out[p.ppsBand]++;
  return out;
}

export function statusCounts() {
  const out: Record<ProgramStatus, number> = {
    Identified: 0, Outreach: 0, Active: 0, Persistent: 0, Discontinued: 0, Completed: 0,
  };
  for (const p of PATIENTS) out[p.status]++;
  return out;
}

export function regionAggregates() {
  const map = new Map<string, { region: string; total: number; eligible: number; active: number; avgGes: number; avgLoss: number; }>();
  for (const p of PATIENTS) {
    const cur = map.get(p.region) ?? { region: p.region, total: 0, eligible: 0, active: 0, avgGes: 0, avgLoss: 0 };
    cur.total++;
    cur.avgGes += p.ges;
    cur.avgLoss += p.pctBwLoss;
    if (["T1", "T2"].includes(p.gesTier)) cur.eligible++;
    if (["Active", "Persistent", "Completed"].includes(p.status)) cur.active++;
    map.set(p.region, cur);
  }
  return Array.from(map.values()).map(r => ({
    ...r,
    avgGes: r.avgGes / r.total,
    avgLoss: r.avgLoss / r.total,
  }));
}

export function stateAggregates() {
  const map = new Map<string, { state: string; total: number; eligible: number; active: number; avgGes: number; }>();
  for (const p of PATIENTS) {
    const cur = map.get(p.state) ?? { state: p.state, total: 0, eligible: 0, active: 0, avgGes: 0 };
    cur.total++;
    cur.avgGes += p.ges;
    if (["T1", "T2"].includes(p.gesTier)) cur.eligible++;
    if (["Active", "Persistent", "Completed"].includes(p.status)) cur.active++;
    map.set(p.state, cur);
  }
  return Array.from(map.values())
    .map(s => ({ ...s, avgGes: s.avgGes / s.total }))
    .sort((a, b) => b.eligible - a.eligible);
}

// Look-alike retrieval for the coach module
export function findLookAlikes(target: Patient, k = 6, mustBeSuccessful = true): Patient[] {
  const candidates = PATIENTS.filter(p =>
    p.id !== target.id &&
    (!mustBeSuccessful || (p.status === "Persistent" || p.status === "Completed") && p.pctBwLoss >= 7)
  );
  const scored = candidates.map(p => {
    const distance =
      Math.abs(p.age - target.age) * 0.6 +
      Math.abs(p.bmi - target.bmi) * 1.0 +
      Math.abs(p.hba1c - target.hba1c) * 4 +
      (p.sex === target.sex ? 0 : 6) +
      (p.ethnicity === target.ethnicity ? 0 : 4) +
      (p.bucket === target.bucket ? -8 : 0) +
      Math.abs(p.systolicBP - target.systolicBP) * 0.05;
    return { p, distance };
  });
  scored.sort((a, b) => a.distance - b.distance);
  return scored.slice(0, k).map(s => s.p);
}

export function bucketStats() {
  const buckets = ["W35-45_T2DM", "M_BMI_35plus", "PreDM_active", "HTN_OB_combo", "SA_cardiometabolic", "Postpartum_year1", "55plus_T2DM", "Workforce_shift"] as const;
  return buckets.map(b => {
    const pts = PATIENTS.filter(p => p.bucket === b);
    const success = pts.filter(p => (p.status === "Persistent" || p.status === "Completed") && p.pctBwLoss >= 7);
    const completed = pts.filter(p => p.status === "Completed" || p.status === "Persistent" || p.status === "Discontinued");
    const persistRate = completed.length > 0
      ? pts.filter(p => p.status === "Persistent" || p.status === "Completed").length / completed.length
      : 0;
    return {
      bucket: b,
      label: BUCKET_LABELS[b],
      n: pts.length,
      successN: success.length,
      avgPctLoss: pts.length ? pts.reduce((a, p) => a + p.pctBwLoss, 0) / pts.length : 0,
      successAvgLoss: success.length ? success.reduce((a, p) => a + p.pctBwLoss, 0) / success.length : 0,
      persistRate,
    };
  });
}

export const BUCKET_LABELS: Record<string, string> = {
  "W35-45_T2DM": "Women 35–45 with Type 2 Diabetes",
  "M_BMI_35plus": "Men with BMI > 35",
  "PreDM_active": "Prediabetic participants",
  "HTN_OB_combo": "Hypertension + Obesity",
  "SA_cardiometabolic": "South Asian + Cardiometabolic",
  "Postpartum_year1": "Postpartum (year 1)",
  "55plus_T2DM": "Adults 55+ with T2DM",
  "Workforce_shift": "Shift workers / irregular schedule",
};

// Cohort retention curve (weeks 0..52) per bucket
export function cohortRetention(bucketKey: string, weeks = 52) {
  const pts = PATIENTS.filter(p => p.bucket === bucketKey && p.weeksOnProgram > 0);
  const start = pts.length || 1;
  const out: { week: number; retention: number }[] = [];
  for (let w = 0; w <= weeks; w += 4) {
    const stillIn = pts.filter(p => {
      if (p.status === "Discontinued" && p.weeksOnProgram <= w) return false;
      return p.weeksOnProgram >= w;
    }).length;
    // Smooth + ensure platform-vs-baseline framing
    const r = stillIn / start;
    out.push({ week: w, retention: Math.max(0.05, r) });
  }
  return out;
}

// Outcome forecast — predicted curve for a target patient
export function outcomeCurve(target: Patient) {
  const peak = target.ofs;
  const out: { week: number; predicted: number; p10: number; p90: number; observed: number | null }[] = [];
  for (let w = 0; w <= 52; w += 4) {
    const trajectory = peak * (1 - Math.exp(-w / 18));
    const observed = w <= target.weeksOnProgram ? target.pctBwLoss * (w / Math.max(target.weeksOnProgram, 1)) : null;
    out.push({
      week: w,
      predicted: Number(trajectory.toFixed(2)),
      p10: Number((trajectory * 0.7).toFixed(2)),
      p90: Number((trajectory * 1.25).toFixed(2)),
      observed: observed == null ? null : Number(observed.toFixed(2)),
    });
  }
  return out;
}

// ---------- score helpers ----------
export function tierMeta(t: EligTier) {
  switch (t) {
    case "T1": return { label: "On-label, high benefit", color: "bg-lilly-red text-white" };
    case "T2": return { label: "On-label, moderate", color: "bg-orange-500 text-white" };
    case "T3": return { label: "Watchful eligible", color: "bg-yellow-400 text-yellow-900" };
    case "T4": return { label: "Not currently indicated", color: "bg-slate-300 text-slate-800" };
    case "T5": return { label: "Contraindicated", color: "bg-slate-700 text-white" };
  }
}

export function riskMeta(r: RiskBand) {
  switch (r) {
    case "Low": return { color: "bg-emerald-500 text-white" };
    case "Medium": return { color: "bg-amber-500 text-white" };
    case "High": return { color: "bg-orange-600 text-white" };
    case "Critical": return { color: "bg-lilly-red text-white" };
  }
}

export function readinessMeta(r: ReadinessBand) {
  switch (r) {
    case "R1": return { label: "Activated", color: "bg-emerald-500 text-white" };
    case "R2": return { label: "Receptive", color: "bg-sky-500 text-white" };
    case "R3": return { label: "Hesitant", color: "bg-amber-500 text-white" };
    case "R4": return { label: "Disengaged", color: "bg-slate-500 text-white" };
  }
}
