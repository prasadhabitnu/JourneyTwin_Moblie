/**
 * Claims Analytics — reverse-engineer clinical + behavioral clusters
 * -----------------------------------------------------------------------------
 * Input: 24 months of insurance claims per member (simulated here).
 * Output for each member:
 *   1. Extracted signals (diagnoses, meds, utilization pattern, adherence score)
 *   2. Clinical cluster assignment (which health archetype) + reasoning
 *   3. Behavioral cluster assignment (utilization pattern) + reasoning
 *   4. Forward-looking claim predictions (3/6/12 months, probability, cost)
 *   5. Recommended Fathom/Nu interventions with projected financial impact
 *
 * All simulation is deterministic (seeded PRNG) so cluster assignments and
 * financials are stable across renders. Numbers are illustrative — production
 * numbers depend on client cohort + benefit design + region.
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
const rand = mulberry32(20260926);
const r  = () => rand();
const ri = (lo: number, hi: number) => Math.floor(r() * (hi - lo + 1)) + lo;

// ---------- types ----------
export type ClaimCategory = "pharmacy" | "specialist" | "acute" | "preventive" | "inpatient" | "procedures" | "behavioral";

export interface ClaimRecord {
  date: string;                 // YYYY-MM
  category: ClaimCategory;
  code: string;                 // ICD/CPT/NDC-like
  description: string;
  amount: number;
  provider?: string;
}

export interface ExtractedSignals {
  diagnoses: string[];
  activeMedications: string[];
  procedures: string[];
  utilizationPattern: string;
  adherenceScore: number;       // 0..1 from refill regularity
  edVisits24m: number;
  specialistVisits24m: number;
  totalSpend24m: number;
  monthlyRefillGaps: number;    // avg gap size between refills
  providerCount: number;
}

export interface ClusterAssignment {
  id: string;
  name: string;
  archetype: string;            // short label
  confidence: number;           // 0..1
  matchReason: string[];
  colorHex: string;
  bgHex: string;
}

export interface FuturePrediction {
  horizon: "3m" | "6m" | "12m";
  claim: string;
  category: ClaimCategory;
  probability: number;
  estimatedCost: number;
  driver: string;
}

export interface Intervention {
  label: string;
  mechanism: string;
  projectedImpact: number;       // $ delta over 12 months
  confidence: "high" | "medium" | "low";
}

export interface ClaimsMember {
  id: string;
  displayId: string;             // masked ID
  ageBand: string;
  sex: "F" | "M";
  region: string;
  planType: string;
  claims: ClaimRecord[];
  signals: ExtractedSignals;
  clinicalCluster: ClusterAssignment;
  behavioralCluster: ClusterAssignment;
  predictions: FuturePrediction[];
  interventions: Intervention[];
  projectedSpendWithout: number;
  projectedSpendWith: number;
}

// ============================================================
// CLUSTER LIBRARY — 8 clinical + 5 behavioral archetypes
// ============================================================

export const CLINICAL_CLUSTERS = {
  UNCONTROLLED_T2DM: {
    id: "CLIN.UNCONTROLLED_T2DM",
    name: "Uncontrolled T2DM · rising acuity",
    archetype: "Escalation",
    colorHex: "#BE185D", bgHex: "#FCE7F3",
  },
  CONTROLLED_T2DM: {
    id: "CLIN.CONTROLLED_T2DM",
    name: "Controlled T2DM · steady maintenance",
    archetype: "Maintain",
    colorHex: "#047857", bgHex: "#ECFDF5",
  },
  CARDIOMETABOLIC_STACK: {
    id: "CLIN.CARDIOMETABOLIC_STACK",
    name: "Cardiometabolic multi-morbid",
    archetype: "Multi-morbid",
    colorHex: "#9F1239", bgHex: "#FEE2E2",
  },
  PREDIABETIC_WEIGHT: {
    id: "CLIN.PREDIABETIC_WEIGHT",
    name: "Prediabetic · weight management focus",
    archetype: "Pre-conversion",
    colorHex: "#4338CA", bgHex: "#EEF2FF",
  },
  POST_CV_EVENT: {
    id: "CLIN.POST_CV_EVENT",
    name: "Post-CV event · secondary prevention",
    archetype: "Post-event",
    colorHex: "#7C2D12", bgHex: "#FEF3C7",
  },
  MASLD: {
    id: "CLIN.MASLD",
    name: "MASLD progression · liver focus",
    archetype: "Hepatic",
    colorHex: "#B45309", bgHex: "#FEF3C7",
  },
  OBESITY_OSA: {
    id: "CLIN.OBESITY_OSA",
    name: "Obesity + OSA · pending sleep evaluation",
    archetype: "Sleep-linked",
    colorHex: "#6D28D9", bgHex: "#EDE9FE",
  },
  BH_COOCCURRING: {
    id: "CLIN.BH_COOCCURRING",
    name: "Behavioral health co-occurring",
    archetype: "BH-linked",
    colorHex: "#0F766E", bgHex: "#CCFBF1",
  },
} as const;

export const BEHAVIORAL_CLUSTERS = {
  HIGH_ADHERENT: {
    id: "BEHV.HIGH_ADHERENT",
    name: "Highly adherent · engaged utilizer",
    archetype: "Engaged",
    colorHex: "#047857", bgHex: "#ECFDF5",
  },
  ADHERENT_SILENT: {
    id: "BEHV.ADHERENT_SILENT",
    name: "Adherent but silent",
    archetype: "Passive-compliant",
    colorHex: "#4338CA", bgHex: "#EEF2FF",
  },
  CYCLIC_NON_ADHERENT: {
    id: "BEHV.CYCLIC",
    name: "Cyclic non-adherent · gap patterns",
    archetype: "Gap-and-refill",
    colorHex: "#B45309", bgHex: "#FEF3C7",
  },
  RECENT_DRIFTER: {
    id: "BEHV.RECENT_DRIFTER",
    name: "Recent drifter · silent last 3 months",
    archetype: "Drifting",
    colorHex: "#9F1239", bgHex: "#FEE2E2",
  },
  FRAGMENTED: {
    id: "BEHV.FRAGMENTED",
    name: "Fragmented care · multi-provider · ED-reliant",
    archetype: "Fragmented",
    colorHex: "#7C2D12", bgHex: "#FEE2E2",
  },
} as const;

// ============================================================
// MEMBER SIMULATION — 18 members spanning cluster space
// ============================================================

interface MemberSeed {
  displayId: string;
  ageBand: string;
  sex: "F" | "M";
  region: string;
  planType: string;
  clinical: keyof typeof CLINICAL_CLUSTERS;
  behavioral: keyof typeof BEHAVIORAL_CLUSTERS;
}

const SEEDS: MemberSeed[] = [
  { displayId: "M-8834-A", ageBand: "45-54", sex: "F", region: "Southeast", planType: "PPO",  clinical: "UNCONTROLLED_T2DM",     behavioral: "CYCLIC_NON_ADHERENT" },
  { displayId: "M-2019-B", ageBand: "55-64", sex: "M", region: "Midwest",   planType: "HMO",  clinical: "CARDIOMETABOLIC_STACK", behavioral: "ADHERENT_SILENT" },
  { displayId: "M-4477-C", ageBand: "35-44", sex: "F", region: "West",      planType: "PPO",  clinical: "PREDIABETIC_WEIGHT",    behavioral: "HIGH_ADHERENT" },
  { displayId: "M-6612-D", ageBand: "60-69", sex: "M", region: "Northeast", planType: "MA",   clinical: "POST_CV_EVENT",         behavioral: "HIGH_ADHERENT" },
  { displayId: "M-9928-E", ageBand: "50-59", sex: "F", region: "Southeast", planType: "PPO",  clinical: "OBESITY_OSA",           behavioral: "RECENT_DRIFTER" },
  { displayId: "M-1157-F", ageBand: "40-49", sex: "M", region: "West",      planType: "HDHP", clinical: "MASLD",                 behavioral: "ADHERENT_SILENT" },
  { displayId: "M-3344-G", ageBand: "30-39", sex: "F", region: "Midwest",   planType: "PPO",  clinical: "BH_COOCCURRING",        behavioral: "FRAGMENTED" },
  { displayId: "M-5501-H", ageBand: "55-64", sex: "M", region: "Southeast", planType: "PPO",  clinical: "UNCONTROLLED_T2DM",     behavioral: "FRAGMENTED" },
  { displayId: "M-7208-J", ageBand: "45-54", sex: "F", region: "Northeast", planType: "HMO",  clinical: "CONTROLLED_T2DM",       behavioral: "HIGH_ADHERENT" },
  { displayId: "M-0074-K", ageBand: "60-69", sex: "F", region: "West",      planType: "MA",   clinical: "CARDIOMETABOLIC_STACK", behavioral: "RECENT_DRIFTER" },
  { displayId: "M-4419-L", ageBand: "35-44", sex: "M", region: "Midwest",   planType: "PPO",  clinical: "OBESITY_OSA",           behavioral: "ADHERENT_SILENT" },
  { displayId: "M-9963-M", ageBand: "50-59", sex: "F", region: "Southeast", planType: "PPO",  clinical: "MASLD",                 behavioral: "CYCLIC_NON_ADHERENT" },
  { displayId: "M-2287-N", ageBand: "25-34", sex: "F", region: "West",      planType: "HDHP", clinical: "PREDIABETIC_WEIGHT",    behavioral: "CYCLIC_NON_ADHERENT" },
  { displayId: "M-3391-P", ageBand: "55-64", sex: "M", region: "Northeast", planType: "PPO",  clinical: "POST_CV_EVENT",         behavioral: "ADHERENT_SILENT" },
  { displayId: "M-6708-Q", ageBand: "40-49", sex: "F", region: "Midwest",   planType: "HMO",  clinical: "BH_COOCCURRING",        behavioral: "RECENT_DRIFTER" },
  { displayId: "M-8842-R", ageBand: "60-69", sex: "M", region: "Southeast", planType: "MA",   clinical: "CARDIOMETABOLIC_STACK", behavioral: "HIGH_ADHERENT" },
  { displayId: "M-5570-S", ageBand: "35-44", sex: "F", region: "West",      planType: "PPO",  clinical: "CONTROLLED_T2DM",       behavioral: "ADHERENT_SILENT" },
  { displayId: "M-9114-T", ageBand: "45-54", sex: "F", region: "Northeast", planType: "PPO",  clinical: "UNCONTROLLED_T2DM",     behavioral: "RECENT_DRIFTER" },
];

// Diagnosis library per cluster
const CLUSTER_DIAGNOSES: Record<keyof typeof CLINICAL_CLUSTERS, string[]> = {
  UNCONTROLLED_T2DM:     ["E11.65 · T2DM w/ hyperglycemia", "R73.09 · Abnormal glucose", "E11.9 · T2DM w/o complication"],
  CONTROLLED_T2DM:       ["E11.9 · T2DM w/o complication", "Z79.899 · Long-term drug therapy"],
  CARDIOMETABOLIC_STACK: ["E11.9 · T2DM", "I10 · Essential HTN", "E78.5 · Hyperlipidemia", "E66.9 · Obesity"],
  PREDIABETIC_WEIGHT:    ["R73.03 · Prediabetes", "E66.01 · Morbid obesity", "Z71.3 · Dietary counseling"],
  POST_CV_EVENT:         ["I25.10 · Atherosclerotic HD", "I21.9 · MI unspec (history)", "Z95.5 · Coronary bypass status", "I10 · HTN"],
  MASLD:                 ["K76.0 · Fatty liver", "K74.0 · Hepatic fibrosis", "E11.9 · T2DM", "E78.5 · Hyperlipidemia"],
  OBESITY_OSA:           ["E66.01 · Morbid obesity", "G47.33 · OSA", "R06.83 · Snoring"],
  BH_COOCCURRING:        ["F41.1 · GAD", "F32.9 · Depressive episode", "E11.9 · T2DM", "R53.83 · Fatigue"],
};

const CLUSTER_MEDS: Record<keyof typeof CLINICAL_CLUSTERS, string[]> = {
  UNCONTROLLED_T2DM:     ["Metformin 1000mg BID", "Glipizide 10mg", "Insulin glargine (recent)"],
  CONTROLLED_T2DM:       ["Metformin 500mg BID", "Semaglutide 0.5mg wkly"],
  CARDIOMETABOLIC_STACK: ["Metformin 1000mg BID", "Lisinopril 20mg", "Atorvastatin 40mg", "Semaglutide 1mg wkly"],
  PREDIABETIC_WEIGHT:    ["Metformin 500mg (off-label)", "Semaglutide 0.25mg (starter)"],
  POST_CV_EVENT:         ["Aspirin 81mg", "Atorvastatin 80mg", "Metoprolol 50mg", "Semaglutide 1mg wkly"],
  MASLD:                 ["Metformin", "Vitamin E 800IU", "Semaglutide 1mg wkly"],
  OBESITY_OSA:           ["Semaglutide 2.4mg wkly (Wegovy)", "Modafinil (as needed)"],
  BH_COOCCURRING:        ["Sertraline 100mg", "Metformin 500mg BID", "Semaglutide 0.5mg wkly"],
};

const CLUSTER_PROCEDURES: Record<keyof typeof CLINICAL_CLUSTERS, string[]> = {
  UNCONTROLLED_T2DM:     ["A1c panel × 4", "CMP × 4", "Diabetic retinal exam"],
  CONTROLLED_T2DM:       ["A1c panel × 2", "Lipid panel × 1"],
  CARDIOMETABOLIC_STACK: ["A1c × 3", "Lipid × 2", "EKG × 1", "Echocardiogram × 1"],
  PREDIABETIC_WEIGHT:    ["OGTT × 1", "Fasting glucose × 3", "DEXA scan"],
  POST_CV_EVENT:         ["Cardiac stress test", "Echo × 1", "Lipid × 3", "EKG × 4"],
  MASLD:                 ["Liver ultrasound", "FibroScan × 1", "LFT × 4"],
  OBESITY_OSA:           ["Home sleep test", "CPAP titration study", "DEXA scan"],
  BH_COOCCURRING:        ["PHQ-9 × 4", "GAD-7 × 4", "A1c × 2"],
};

// ============================================================
// Simulate 24 months of claims per member
// ============================================================

function monthOffset(offsetMonths: number): string {
  // Anchor: current display = 2026-09; walk backwards for history
  const anchor = new Date(2026, 8, 1); // Sept 2026 (month index 8)
  const d = new Date(anchor.getFullYear(), anchor.getMonth() - offsetMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function generateClaims(seed: MemberSeed): ClaimRecord[] {
  const c = seed.clinical;
  const b = seed.behavioral;
  const claims: ClaimRecord[] = [];

  const diag = CLUSTER_DIAGNOSES[c];
  const meds = CLUSTER_MEDS[c];
  const procs = CLUSTER_PROCEDURES[c];

  // Pharmacy — monthly-ish with gaps controlled by behavior
  for (let m = 23; m >= 0; m--) {
    for (const med of meds) {
      let fill = true;
      if (b === "CYCLIC_NON_ADHERENT" && m % 3 === 2) fill = false;
      if (b === "RECENT_DRIFTER" && m <= 2) fill = false; // last 3 months silent
      if (b === "FRAGMENTED" && r() < 0.28) fill = false;
      if (b === "ADHERENT_SILENT" && r() < 0.05) fill = false;

      if (fill) {
        claims.push({
          date: monthOffset(m),
          category: "pharmacy",
          code: `NDC-${ri(10000, 99999)}`,
          description: med,
          amount: 240 + ri(0, 600),
        });
      }
    }
  }

  // Preventive — quarterly labs
  for (let m = 22; m >= 0; m -= 3) {
    if (b === "FRAGMENTED" && r() < 0.5) continue;
    claims.push({
      date: monthOffset(m),
      category: "preventive",
      code: "CPT-83036",
      description: "HbA1c panel",
      amount: 45 + ri(0, 30),
    });
  }
  if (b === "HIGH_ADHERENT" || b === "ADHERENT_SILENT") {
    claims.push({ date: monthOffset(20), category: "preventive", code: "CPT-99396", description: "Annual physical", amount: 285 });
    claims.push({ date: monthOffset(8),  category: "preventive", code: "CPT-99396", description: "Annual physical", amount: 295 });
  }

  // Specialist — cluster-driven
  const specVisits = c === "UNCONTROLLED_T2DM" ? 4
                   : c === "POST_CV_EVENT" ? 5
                   : c === "MASLD" ? 3
                   : c === "OBESITY_OSA" ? 2
                   : c === "BH_COOCCURRING" ? 4
                   : c === "CARDIOMETABOLIC_STACK" ? 3
                   : 1;
  for (let i = 0; i < specVisits; i++) {
    const m = ri(1, 22);
    const specialty = c === "UNCONTROLLED_T2DM" || c === "CONTROLLED_T2DM" ? "Endocrinology"
                   : c === "POST_CV_EVENT" || c === "CARDIOMETABOLIC_STACK" ? "Cardiology"
                   : c === "MASLD" ? "Hepatology"
                   : c === "OBESITY_OSA" ? "Sleep medicine"
                   : c === "BH_COOCCURRING" ? "Psychiatry"
                   : "Internal medicine";
    claims.push({
      date: monthOffset(m),
      category: "specialist",
      code: `CPT-9921${ri(3, 5)}`,
      description: `${specialty} consult`,
      amount: 250 + ri(50, 300),
      provider: specialty,
    });
  }

  // Procedures — cluster-specific
  for (const proc of procs.slice(0, 2)) {
    if (proc.includes("Sleep test") || proc.includes("CPAP")) {
      claims.push({ date: monthOffset(ri(3, 15)), category: "procedures", code: "CPT-95806", description: proc, amount: 1850 });
    } else if (proc.includes("FibroScan")) {
      claims.push({ date: monthOffset(ri(3, 15)), category: "procedures", code: "CPT-91200", description: proc, amount: 420 });
    } else if (proc.includes("DEXA")) {
      claims.push({ date: monthOffset(ri(3, 15)), category: "procedures", code: "CPT-77080", description: proc, amount: 190 });
    } else if (proc.includes("Echo")) {
      claims.push({ date: monthOffset(ri(3, 15)), category: "procedures", code: "CPT-93306", description: proc, amount: 780 });
    } else if (proc.includes("stress test")) {
      claims.push({ date: monthOffset(ri(3, 15)), category: "procedures", code: "CPT-93015", description: proc, amount: 1140 });
    }
  }

  // Acute — behavior-driven
  const edCount = b === "FRAGMENTED" ? 3 : b === "CYCLIC_NON_ADHERENT" ? 2 : b === "RECENT_DRIFTER" ? 1 : 0;
  for (let i = 0; i < edCount; i++) {
    claims.push({
      date: monthOffset(ri(1, 22)),
      category: "acute",
      code: "CPT-99284",
      description: "Emergency department visit",
      amount: 2100 + ri(-400, 900),
    });
  }

  // Inpatient — rare
  if (c === "POST_CV_EVENT") {
    claims.push({ date: monthOffset(20), category: "inpatient", code: "MS-DRG-247", description: "Cardiac catheterization + stent (index event)", amount: 34500 });
  }

  // Behavioral — for BH cluster
  if (c === "BH_COOCCURRING") {
    for (let m = 22; m >= 0; m -= 4) {
      if (r() < 0.7) {
        claims.push({ date: monthOffset(m), category: "behavioral", code: "CPT-90837", description: "Therapy session", amount: 190 });
      }
    }
  }

  return claims.sort((a, b) => a.date.localeCompare(b.date));
}

function extractSignals(claims: ClaimRecord[], seed: MemberSeed): ExtractedSignals {
  const c = seed.clinical;
  const b = seed.behavioral;

  const diagnoses = CLUSTER_DIAGNOSES[c].slice(0, 4);
  const activeMedications = Array.from(new Set(
    claims.filter(cl => cl.category === "pharmacy").map(cl => cl.description)
  )).slice(0, 4);
  const procedures = Array.from(new Set(
    claims.filter(cl => cl.category === "procedures").map(cl => cl.description)
  ));

  const utilizationPattern =
    b === "HIGH_ADHERENT"       ? "Consistent · quarterly labs + annual PCP + routine specialist"
    : b === "ADHERENT_SILENT"   ? "Pharmacy-heavy · minimal non-refill utilization"
    : b === "CYCLIC_NON_ADHERENT" ? "Gap-and-refill cycles · quarterly cadence broken"
    : b === "RECENT_DRIFTER"    ? "Prior consistent · last 3 months silent across all categories"
    :                             "Multi-provider · ED-reliant · low continuity";

  // Adherence score from pharmacy claim regularity
  const pharmMonths = new Set(claims.filter(cl => cl.category === "pharmacy").map(cl => cl.date));
  const adherenceScore = Math.min(1, pharmMonths.size / 24);
  const monthlyRefillGaps =
    b === "CYCLIC_NON_ADHERENT" ? 1.4
    : b === "RECENT_DRIFTER"    ? 3.0
    : b === "FRAGMENTED"        ? 2.1
    : b === "ADHERENT_SILENT"   ? 0.3
    :                             0.1;

  const edVisits24m = claims.filter(cl => cl.category === "acute").length;
  const specialistVisits24m = claims.filter(cl => cl.category === "specialist").length;
  const totalSpend24m = claims.reduce((s, cl) => s + cl.amount, 0);

  const providerCount =
    b === "FRAGMENTED"   ? 6
    : b === "HIGH_ADHERENT" ? 2
    :                       3;

  return {
    diagnoses, activeMedications, procedures,
    utilizationPattern, adherenceScore,
    edVisits24m, specialistVisits24m, totalSpend24m, monthlyRefillGaps, providerCount,
  };
}

function assignClusters(seed: MemberSeed, sig: ExtractedSignals): { clinical: ClusterAssignment; behavioral: ClusterAssignment } {
  const cm = CLINICAL_CLUSTERS[seed.clinical];
  const bm = BEHAVIORAL_CLUSTERS[seed.behavioral];

  const clinReasons: Record<keyof typeof CLINICAL_CLUSTERS, string[]> = {
    UNCONTROLLED_T2DM: [
      "Recurring E11.65 (hyperglycemia) diagnoses across 18 months",
      "Insulin added in month 6 · dose escalation pattern",
      "4 endocrinology visits + retinal exam in last 24 months",
      "A1c panels every quarter (physician monitoring)",
    ],
    CONTROLLED_T2DM: [
      "Steady E11.9 diagnosis · no complication codes",
      "Single dual-agent regimen with 92%+ fill consistency",
      "Semi-annual A1c + annual PCP · low specialist load",
      "No ED visits · no procedure escalation",
    ],
    CARDIOMETABOLIC_STACK: [
      "Concurrent E11, I10, E78 diagnoses (T2DM + HTN + HLD)",
      "4 concurrent medication classes filled consistently",
      "Cardiology + endocrinology visits in rotation",
      "Echocardiogram + EKG within 24 months",
    ],
    PREDIABETIC_WEIGHT: [
      "R73.03 (prediabetes) + E66 (obesity) diagnoses",
      "OGTT + fasting glucose panels · no diabetes complications",
      "GLP-1 starter dose · dietary counseling code Z71.3",
      "Preventive-first utilization",
    ],
    POST_CV_EVENT: [
      "I21.9 (MI history) + Z95.5 (bypass status)",
      "Inpatient cardiac cath + stent 20 months ago",
      "5 cardiology follow-ups + stress test · secondary prevention regimen",
      "Full quad therapy: ASA, statin, beta-blocker, GLP-1",
    ],
    MASLD: [
      "K76.0 (fatty liver) + K74.0 (fibrosis) diagnoses",
      "Liver ultrasound + FibroScan in last 15 months",
      "4 LFT panels · concurrent T2DM + HLD comorbidities",
      "Hepatology consults · GLP-1 for hepatic benefit",
    ],
    OBESITY_OSA: [
      "E66.01 (morbid obesity) + G47.33 (OSA) diagnoses",
      "Home sleep test + CPAP titration study · pending CPAP fill",
      "Wegovy 2.4mg dose · weight-management focus",
      "R06.83 (snoring) documented multiple times",
    ],
    BH_COOCCURRING: [
      "F41.1 (GAD) + F32.9 (depression) diagnoses",
      "Regular therapy sessions (CPT-90837) + SSRI fills",
      "PHQ-9 + GAD-7 assessments quarterly",
      "Physical comorbidities (T2DM) + fatigue coding (R53.83)",
    ],
  };

  const behvReasons: Record<keyof typeof BEHAVIORAL_CLUSTERS, string[]> = {
    HIGH_ADHERENT: [
      `Pharmacy fills present in ${Math.round(sig.adherenceScore * 24)}/24 months`,
      "Annual physicals on cadence · specialist visits scheduled, not emergent",
      `Provider count: ${sig.providerCount} · high continuity`,
      "No ED visits in 24 months",
    ],
    ADHERENT_SILENT: [
      "Pharmacy adherence high · non-pharmacy utilization minimal",
      "Only refill-triggered app opens · no manual logs or engagement",
      "Refills auto-pay · annual physical present · no proactive touch",
      "PCP relationship stable but under-utilized",
    ],
    CYCLIC_NON_ADHERENT: [
      `Refill gaps averaging ${sig.monthlyRefillGaps.toFixed(1)} months between fills`,
      "Every-3rd-month gap pattern · classic PA-appeal cycle",
      "Occasional urgent-care visits during gaps",
      "Coach touch-points would break the cycle",
    ],
    RECENT_DRIFTER: [
      "Consistent 20 months, then silent last 3 months",
      "Last refill 90+ days ago · A1c panel missed this quarter",
      "No inbound activity · no ED visits (yet)",
      "High recovery probability with a warm re-entry",
    ],
    FRAGMENTED: [
      `${sig.edVisits24m} ED visits in 24 months · no established PCP relationship`,
      `Provider count ${sig.providerCount}+ · no continuity`,
      "Refills across multiple pharmacies · care coordination gap",
      "High-cost pattern · biggest ROI on outreach",
    ],
  };

  return {
    clinical: {
      id: cm.id, name: cm.name, archetype: cm.archetype,
      confidence: 0.80 + r() * 0.15,
      matchReason: clinReasons[seed.clinical],
      colorHex: cm.colorHex, bgHex: cm.bgHex,
    },
    behavioral: {
      id: bm.id, name: bm.name, archetype: bm.archetype,
      confidence: 0.75 + r() * 0.18,
      matchReason: behvReasons[seed.behavioral],
      colorHex: bm.colorHex, bgHex: bm.bgHex,
    },
  };
}

function makePredictions(seed: MemberSeed, sig: ExtractedSignals): FuturePrediction[] {
  const c = seed.clinical;
  const b = seed.behavioral;
  const out: FuturePrediction[] = [];

  // 3-month predictions — near-term based on immediate signals
  if (b === "RECENT_DRIFTER") {
    out.push({ horizon: "3m", claim: "Refill lapse escalation", category: "pharmacy",
      probability: 0.72, estimatedCost: 1240,
      driver: "90+ days since last fill · outreach window closing" });
  }
  if (b === "CYCLIC_NON_ADHERENT") {
    out.push({ horizon: "3m", claim: "Urgent care · symptom rebound", category: "acute",
      probability: 0.51, estimatedCost: 720,
      driver: "Expected gap in next cycle based on prior pattern" });
  }
  if (b === "FRAGMENTED") {
    out.push({ horizon: "3m", claim: "ED visit · GI or metabolic", category: "acute",
      probability: 0.62, estimatedCost: 3200,
      driver: "3 ED visits historical · no PCP anchor" });
  }
  if (c === "UNCONTROLLED_T2DM") {
    out.push({ horizon: "3m", claim: "Insulin dose escalation + endo visit", category: "specialist",
      probability: 0.68, estimatedCost: 425,
      driver: "A1c trajectory · dose ceiling on oral agents" });
  }

  // 6-month predictions
  if (c === "OBESITY_OSA") {
    out.push({ horizon: "6m", claim: "CPAP device + supplies", category: "procedures",
      probability: 0.78, estimatedCost: 2400,
      driver: "Sleep study complete · titration study complete · fill imminent" });
  }
  if (c === "MASLD") {
    out.push({ horizon: "6m", claim: "Hepatology follow-up + FibroScan", category: "procedures",
      probability: 0.62, estimatedCost: 720,
      driver: "12-month fibrosis surveillance cadence" });
  }
  if (c === "CARDIOMETABOLIC_STACK" || c === "POST_CV_EVENT") {
    out.push({ horizon: "6m", claim: "Cardiology follow-up + stress test", category: "specialist",
      probability: 0.55, estimatedCost: 1140,
      driver: "Semi-annual cardiac risk monitoring" });
  }
  if (c === "PREDIABETIC_WEIGHT") {
    out.push({ horizon: "6m", claim: "Dose titration + dietician follow-up", category: "specialist",
      probability: 0.48, estimatedCost: 320,
      driver: "GLP-1 starter dose · escalation window" });
  }
  if (c === "BH_COOCCURRING") {
    out.push({ horizon: "6m", claim: "Ongoing therapy + med review", category: "behavioral",
      probability: 0.82, estimatedCost: 760,
      driver: "Established BH treatment cadence" });
  }

  // 12-month predictions — trajectory-based
  if (c === "UNCONTROLLED_T2DM" && b !== "HIGH_ADHERENT") {
    out.push({ horizon: "12m", claim: "Inpatient · hyperglycemic event (DKA/HHS)", category: "inpatient",
      probability: 0.14, estimatedCost: 21400,
      driver: "Trajectory risk · adherence gap × uncontrolled A1c" });
  }
  if (c === "CARDIOMETABOLIC_STACK" && b === "ADHERENT_SILENT") {
    out.push({ horizon: "12m", claim: "First CV event (MI/stroke) probability", category: "inpatient",
      probability: 0.06, estimatedCost: 34500,
      driver: "10-year ASCVD risk · low current engagement means missed early signals" });
  }
  if (c === "OBESITY_OSA" && sig.adherenceScore > 0.6) {
    out.push({ horizon: "12m", claim: "Weight-related surgery avoidance", category: "inpatient",
      probability: -0.11, estimatedCost: -18200,
      driver: "GLP-1 trajectory · reduced bariatric conversion probability" });
  }
  if (c === "PREDIABETIC_WEIGHT" && b === "HIGH_ADHERENT") {
    out.push({ horizon: "12m", claim: "Regression to normal glucose (avoids T2DM claims)", category: "preventive",
      probability: -0.23, estimatedCost: -3800,
      driver: "Adherent GLP-1 + weight loss · likely to leave prediabetes bracket" });
  }
  if (b === "RECENT_DRIFTER") {
    out.push({ horizon: "12m", claim: "Discontinuation cascade · A1c drift + inpatient risk", category: "inpatient",
      probability: 0.11, estimatedCost: 12800,
      driver: "Without re-engagement · projected discontinuation + 12-month cascade" });
  }

  return out;
}

function makeInterventions(seed: MemberSeed, sig: ExtractedSignals): Intervention[] {
  const c = seed.clinical;
  const b = seed.behavioral;
  const out: Intervention[] = [];

  // Behavioral-driven interventions
  if (b === "RECENT_DRIFTER") {
    out.push({
      label: "Warm re-entry ASK (T3 popup)",
      mechanism: "Nu opens with 'anything getting in the way?' — no accusation. Coach reaches out within 24h with full context. Historical drift-recovery rate: 71% within 7 days.",
      projectedImpact: -8400,
      confidence: "high",
    });
  }
  if (b === "CYCLIC_NON_ADHERENT") {
    out.push({
      label: "PA-cycle predictor + coach handoff",
      mechanism: "Fathom flags PA-appeal timing before the gap. Coach coordinates with pharmacy + prescriber to bridge fills. Cuts gap frequency 60%.",
      projectedImpact: -3200,
      confidence: "high",
    });
  }
  if (b === "FRAGMENTED") {
    out.push({
      label: "PCP anchor + care-coordination handoff",
      mechanism: "Coach identifies best-fit PCP from plan network. Warm handoff with claims history + open questions. Anchors care, reduces ED reliance.",
      projectedImpact: -6800,
      confidence: "medium",
    });
  }
  if (b === "ADHERENT_SILENT") {
    out.push({
      label: "Low-touch mode offer",
      mechanism: "Recognize the pattern rather than nudge harder. Nu quiets reminders, watches refill + weight only. Increases satisfaction, prevents opt-out.",
      projectedImpact: -1400,
      confidence: "high",
    });
  }
  if (b === "HIGH_ADHERENT") {
    out.push({
      label: "Reinforcement + best-day mirror",
      mechanism: "Weekly best-day reflection keeps the shape visible. Low-cost preservation of the working pattern.",
      projectedImpact: -800,
      confidence: "high",
    });
  }

  // Clinical-driven interventions
  if (c === "UNCONTROLLED_T2DM") {
    out.push({
      label: "CGM connection + Nu spike analysis",
      mechanism: "Real-time meal-response feedback. Nu surfaces patient-specific levers from calm days. Reduces A1c drift + inpatient risk.",
      projectedImpact: -4200,
      confidence: "medium",
    });
  }
  if (c === "OBESITY_OSA") {
    out.push({
      label: "Ring sleep monitoring + CPAP adherence",
      mechanism: "Fathom tracks CPAP effectiveness via Ring HRV + SpO2. Coach nudges CPAP wear-time. Reduces downstream CV claims.",
      projectedImpact: -2600,
      confidence: "medium",
    });
  }
  if (c === "POST_CV_EVENT") {
    out.push({
      label: "Secondary-prevention adherence support",
      mechanism: "Fathom tracks quad-therapy fill patterns. Coach reinforces cardio protocol. Reduces recurrent-event risk.",
      projectedImpact: -5200,
      confidence: "high",
    });
  }
  if (c === "BH_COOCCURRING") {
    out.push({
      label: "MI-based Nu voice + BH-coach coordination",
      mechanism: "Motivational Interviewing scripts calibrated to depression/anxiety. Coach coordinates with BH provider. Improves engagement across both dimensions.",
      projectedImpact: -3400,
      confidence: "medium",
    });
  }
  if (c === "PREDIABETIC_WEIGHT") {
    out.push({
      label: "Weight-loss trajectory reinforcement",
      mechanism: "Best-day mirror + cravings-sleep correlation. Members who complete 12-month program regress from prediabetes ~40% of the time.",
      projectedImpact: -3800,
      confidence: "medium",
    });
  }

  return out.slice(0, 3);
}

// ============================================================
// Public builders
// ============================================================

export function buildAllMembers(): ClaimsMember[] {
  return SEEDS.map((seed, idx) => {
    const claims = generateClaims(seed);
    const signals = extractSignals(claims, seed);
    const { clinical, behavioral } = assignClusters(seed, signals);
    const predictions = makePredictions(seed, signals);
    const interventions = makeInterventions(seed, signals);

    // Compute financials
    const monthlyRun = signals.totalSpend24m / 24;
    const projectedSpendWithout = Math.round(monthlyRun * 12 * 1.08); // trajectory implies modest inflation
    const interventionDelta = interventions.reduce((s, iv) => s + iv.projectedImpact, 0);
    const projectedSpendWith = Math.max(0, projectedSpendWithout + interventionDelta);

    return {
      id: `mem-${idx}`,
      displayId: seed.displayId,
      ageBand: seed.ageBand,
      sex: seed.sex,
      region: seed.region,
      planType: seed.planType,
      claims,
      signals,
      clinicalCluster: clinical,
      behavioralCluster: behavioral,
      predictions,
      interventions,
      projectedSpendWithout,
      projectedSpendWith,
    };
  });
}

export function fmtUSD(n: number): string {
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000)     return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs).toLocaleString()}`;
}
export function fmtUSDFull(n: number): string {
  const sign = n < 0 ? "−" : "";
  return `${sign}$${Math.round(Math.abs(n)).toLocaleString()}`;
}
