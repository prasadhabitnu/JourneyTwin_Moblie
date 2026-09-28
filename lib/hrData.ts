/**
 * HR Wellness Analytics — GCC employee dataset
 * -----------------------------------------------------------------------------
 * Simulates ~80 employees of a Global Capability Center with:
 *   - 8 stress-factor scores (workPressure, skillGap, comm barrier, etc.)
 *   - Communication analytics (email/Teams sentiment, response time, after-hours)
 *   - Language proficiency + skill gap detection
 *   - Overall wellness score (0-100) and attrition risk
 *   - Sentiment + wellness trend time series
 *   - Recommended HR action per employee
 *
 * All deterministic — same PRNG seed produces the same population every render.
 * Signals are illustrative; production would be wired to actual email/Teams/
 * calendar/learning-platform data streams via approved connectors.
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
const rand = mulberry32(20260927);
const r  = () => rand();
const ri = (lo: number, hi: number) => Math.floor(r() * (hi - lo + 1)) + lo;
const rf = (lo: number, hi: number) => r() * (hi - lo) + lo;
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)];
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

// ---------- reference data ----------

const FIRST_NAMES = [
  "Aarav","Priya","Rahul","Sneha","Vikram","Divya","Karthik","Ananya","Rohan","Meera",
  "Arjun","Kavya","Sanjay","Neha","Aditya","Riya","Nikhil","Ishita","Manish","Pooja",
  "Deepak","Anjali","Rajesh","Shreya","Amit","Sonia","Varun","Tanvi","Kunal","Nisha",
  "Suresh","Aditi","Pranav","Sakshi","Harish","Mira","Vivek","Rhea","Kabir","Aisha",
];
const LAST_NAMES = [
  "Sharma","Patel","Kumar","Reddy","Iyer","Gupta","Rao","Nair","Menon","Chandra",
  "Bose","Krishnan","Deshpande","Bhat","Verma","Joshi","Malhotra","Shetty","Agarwal","Roy",
];

export const DEPARTMENTS = [
  "Engineering",
  "Data Analytics",
  "Customer Support",
  "Quality Assurance",
  "Product Management",
  "UX Design",
  "Operations",
  "Finance",
] as const;
export type Department = typeof DEPARTMENTS[number];

const ROLES: Record<Department, string[]> = {
  "Engineering":         ["SW Engineer", "Sr SW Engineer", "Staff Engineer", "Tech Lead", "SRE"],
  "Data Analytics":      ["Data Analyst", "Data Scientist", "Sr Data Analyst", "ML Engineer"],
  "Customer Support":    ["Support Rep", "Sr Support Rep", "Support Lead", "Escalation Specialist"],
  "Quality Assurance":   ["QA Engineer", "Sr QA Engineer", "QA Lead", "Automation Engineer"],
  "Product Management":  ["Product Analyst", "Product Manager", "Sr Product Manager"],
  "UX Design":           ["UX Designer", "Sr UX Designer", "UX Researcher"],
  "Operations":          ["Ops Analyst", "Ops Lead", "Program Manager"],
  "Finance":             ["Finance Analyst", "Sr Finance Analyst", "FP&A Lead"],
};

export const CITIES = ["Bengaluru", "Hyderabad", "Chennai", "Pune", "Gurugram", "Mumbai", "Noida"] as const;
export type City = typeof CITIES[number];

export const BANDS = ["L1", "L2", "L3", "L4", "L5"] as const;
export type Band = typeof BANDS[number];

export const CLIENT_REGIONS = ["US", "UK", "EU", "APAC"] as const;
export type ClientRegion = typeof CLIENT_REGIONS[number];

// Stress factor keys (used across page)
export const STRESS_FACTORS = [
  "workPressure",
  "skillGap",
  "communicationBarrier",
  "clientPressure",
  "managerRelationship",
  "teamDynamics",
  "learningStagnation",
  "workLifeBalance",
] as const;
export type StressFactor = typeof STRESS_FACTORS[number];

export const STRESS_META: Record<StressFactor, { label: string; sub: string; color: string; bg: string }> = {
  workPressure:         { label: "Work pressure",        sub: "Deadlines, volume, overtime signals",        color: "#BE185D", bg: "#FCE7F3" },
  skillGap:             { label: "Skill gap",            sub: "Technical skills or role fit mismatch",       color: "#B45309", bg: "#FEF3C7" },
  communicationBarrier: { label: "Communication",        sub: "Language + clarity in written responses",     color: "#9F1239", bg: "#FEE2E2" },
  clientPressure:       { label: "Client pressure",      sub: "Client escalations + tone signals",           color: "#6D28D9", bg: "#EDE9FE" },
  managerRelationship:  { label: "Manager relationship", sub: "1:1 sentiment + feedback patterns",           color: "#0F766E", bg: "#CCFBF1" },
  teamDynamics:         { label: "Team dynamics",        sub: "Peer collaboration + Teams sentiment",        color: "#4338CA", bg: "#EEF2FF" },
  learningStagnation:   { label: "Learning stagnation",  sub: "L&D platform usage + skill breadth trend",    color: "#7C2D12", bg: "#FEF3C7" },
  workLifeBalance:      { label: "Work-life balance",    sub: "After-hours activity + PTO patterns",         color: "#047857", bg: "#ECFDF5" },
};

// ---------- types ----------

export interface CommunicationSignals {
  emailSentiment: number;         // -1..1
  teamsSentiment: number;         // -1..1
  avgResponseTimeHours: number;
  afterHoursActivityPct: number;  // % of messages sent 8pm-6am
  meetingParticipation: number;   // 0..1
  writingClarityScore: number;    // 0..100 (Flesch-like)
  clientEscalations90d: number;
}

export interface RecommendedAction {
  label: string;
  urgency: "high" | "medium" | "low";
  reason: string;
}

export interface Employee {
  id: string;
  name: string;
  displayName: string;   // masked for privacy: "Priya S."
  role: string;
  department: Department;
  city: City;
  band: Band;
  clientRegion: ClientRegion;
  tenureMonths: number;
  managerName: string;

  // Wellness signals
  wellnessScore: number;          // 0..100 (higher = healthier)
  attritionRisk: number;          // 0..1
  primaryStressor: StressFactor;
  stressFactors: Record<StressFactor, number>;  // 0..100

  // Communication
  comm: CommunicationSignals;

  // Skills
  languageProficiency: number;    // 0..100
  skillGaps: string[];
  learningActivity30d: number;    // hours

  // Trends
  sentimentTrend30d: number[];    // 30 daily values, -1..1
  wellnessTrend90d: number[];     // 90 daily values, 0..100

  // Recommended HR action
  recommendedAction: RecommendedAction;
}

// ============================================================
// Simulation
// ============================================================

// Archetypes drive coherent stress patterns
type Archetype =
  | "overloaded"         // high workPressure + low WLB + after-hours
  | "language-barrier"   // low language proficiency + client pressure
  | "skill-mismatch"     // high skillGap + learningStagnation
  | "disengaged"         // low sentiment + low participation
  | "manager-mismatch"   // high managerRelationship stress
  | "steady"             // healthy baseline
  | "rising-star"        // high wellness + growing skills
  | "burnout-risk";      // combination of high work pressure + low WLB + declining sentiment

const ARCHETYPE_WEIGHTS: [Archetype, number][] = [
  ["steady",           0.30],
  ["rising-star",      0.14],
  ["overloaded",       0.14],
  ["skill-mismatch",   0.12],
  ["language-barrier", 0.10],
  ["manager-mismatch", 0.08],
  ["disengaged",       0.07],
  ["burnout-risk",     0.05],
];

function pickArchetype(): Archetype {
  const total = ARCHETYPE_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [a, w] of ARCHETYPE_WEIGHTS) { x -= w; if (x <= 0) return a; }
  return "steady";
}

const SKILL_LIBRARY = [
  "SQL fluency", "Python for automation", "Advanced Excel", "Business writing",
  "Client-facing English", "Stakeholder mgmt", "System design",
  "Cloud (AWS/GCP)", "CI/CD tooling", "Data storytelling", "A/B testing",
  "Product analytics", "Design systems", "Accessibility", "Automation frameworks",
  "REST + GraphQL", "Financial modeling", "OKR facilitation",
];

function skillGapsForArchetype(a: Archetype, dept: Department): string[] {
  if (a === "skill-mismatch") {
    const pool = dept === "Engineering" ? ["System design", "Cloud (AWS/GCP)", "CI/CD tooling", "Advanced Python"]
              : dept === "Data Analytics" ? ["Advanced SQL", "ML fundamentals", "A/B testing", "Data storytelling"]
              : dept === "Customer Support" ? ["Advanced product knowledge", "Escalation handling", "Business writing"]
              : dept === "Quality Assurance" ? ["Automation frameworks", "Performance testing", "API testing"]
              : dept === "Product Management" ? ["Roadmap prioritization", "SQL fluency", "Stakeholder mgmt"]
              : ["Business writing", "Client-facing English", "Stakeholder mgmt"];
    return pool.slice(0, 3);
  }
  if (a === "language-barrier") return ["Client-facing English", "Business writing", "Presentation skills"];
  if (a === "rising-star") return [];
  if (r() < 0.3) return [pick(SKILL_LIBRARY)];
  return [];
}

const CLIENT_ESCALATION_COPY = [
  "Client requested rework on last sprint",
  "SLA breach on 2 incidents",
  "Sentiment drop noticed by client PM",
  "Late response on urgent thread",
];

function generateEmployee(idx: number): Employee {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const name = `${first} ${last}`;
  const displayName = `${first} ${last[0]}.`;
  const department = pick(DEPARTMENTS);
  const role = pick(ROLES[department]);
  const city = pick(CITIES);
  const band = pick(BANDS);
  const tenureMonths = ri(3, 84);
  const clientRegion = pick(CLIENT_REGIONS);
  const managerName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)[0]}.`;
  const arch = pickArchetype();

  // ---- stress factors ----
  const s = <Record<StressFactor, number>>({
    workPressure:         ri(20, 55),
    skillGap:             ri(15, 45),
    communicationBarrier: ri(10, 40),
    clientPressure:       ri(15, 45),
    managerRelationship:  ri(15, 40),
    teamDynamics:         ri(15, 40),
    learningStagnation:   ri(15, 45),
    workLifeBalance:      ri(15, 40),
  });
  if (arch === "overloaded") { s.workPressure = ri(72, 92); s.workLifeBalance = ri(65, 85); s.clientPressure = ri(55, 75); }
  if (arch === "language-barrier") { s.communicationBarrier = ri(70, 90); s.clientPressure = ri(60, 82); s.workPressure = ri(45, 65); }
  if (arch === "skill-mismatch") { s.skillGap = ri(72, 90); s.learningStagnation = ri(60, 82); }
  if (arch === "disengaged") { s.teamDynamics = ri(55, 75); s.learningStagnation = ri(55, 78); s.managerRelationship = ri(50, 70); }
  if (arch === "manager-mismatch") { s.managerRelationship = ri(70, 90); s.teamDynamics = ri(50, 72); }
  if (arch === "burnout-risk") { s.workPressure = ri(80, 95); s.workLifeBalance = ri(75, 92); s.teamDynamics = ri(50, 70); }
  if (arch === "rising-star") { for (const k of STRESS_FACTORS) s[k] = Math.max(10, s[k] - ri(10, 25)); }
  if (arch === "steady") { for (const k of STRESS_FACTORS) s[k] = ri(15, 40); }

  const primaryStressor = (Object.entries(s) as [StressFactor, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  // ---- wellness score (inverse of avg stress with variance) ----
  const avgStress = Object.values(s).reduce((a, b) => a + b, 0) / STRESS_FACTORS.length;
  const wellnessScore = Math.round(clamp(100 - avgStress + rf(-6, 6), 5, 98));

  // ---- attrition risk ----
  let attritionRisk =
    (100 - wellnessScore) / 130
    + (s.workLifeBalance / 300)
    + (s.managerRelationship / 260)
    + (tenureMonths < 6 ? 0.10 : 0);
  if (arch === "burnout-risk") attritionRisk += 0.20;
  if (arch === "rising-star") attritionRisk = Math.max(0.03, attritionRisk - 0.10);
  attritionRisk = clamp(attritionRisk, 0.02, 0.94);

  // ---- communication signals ----
  const langBase = clamp(78 + rf(-15, 15), 45, 98);
  const languageProficiency = arch === "language-barrier"
    ? clamp(langBase - ri(15, 25), 40, 78)
    : arch === "rising-star" ? clamp(langBase + ri(3, 8), 80, 99)
    : Math.round(langBase);

  const comm: CommunicationSignals = {
    emailSentiment:        clamp(rf(-0.15, 0.55) - (arch === "burnout-risk" ? 0.4 : 0) - (arch === "disengaged" ? 0.3 : 0), -0.85, 0.85),
    teamsSentiment:        clamp(rf(-0.1, 0.6) - (arch === "manager-mismatch" ? 0.4 : 0) - (arch === "disengaged" ? 0.35 : 0), -0.85, 0.85),
    avgResponseTimeHours:  clamp(rf(1.5, 8) + (arch === "disengaged" ? 5 : 0) + (arch === "overloaded" ? 3 : 0), 0.3, 24),
    afterHoursActivityPct: clamp(rf(5, 20) + (arch === "overloaded" ? 30 : 0) + (arch === "burnout-risk" ? 45 : 0), 2, 92),
    meetingParticipation:  clamp(rf(0.55, 0.9) - (arch === "disengaged" ? 0.35 : 0) - (arch === "burnout-risk" ? 0.2 : 0), 0.1, 0.98),
    writingClarityScore:   Math.round(clamp(languageProficiency + rf(-6, 6), 40, 98)),
    clientEscalations90d:  ri(0, 2) + (arch === "language-barrier" ? ri(1, 3) : 0) + (arch === "overloaded" ? ri(0, 2) : 0),
  };

  // ---- skill gaps + learning ----
  const skillGaps = skillGapsForArchetype(arch, department);
  const learningActivity30d = Math.round(clamp(
    rf(1, 10)
    + (arch === "rising-star" ? 8 : 0)
    - (arch === "overloaded" ? 4 : 0)
    - (arch === "disengaged" ? 3 : 0),
    0, 22
  ));

  // ---- trends ----
  const sentimentBase = (comm.emailSentiment + comm.teamsSentiment) / 2;
  const sentimentTrend30d: number[] = Array.from({ length: 30 }, (_, i) => {
    let v = sentimentBase + Math.sin(i / 4) * 0.08 + rf(-0.10, 0.10);
    // Burnout risk: sentiment declines over time
    if (arch === "burnout-risk") v -= (29 - i) / 100;
    if (arch === "rising-star") v += (29 - i) / 200;
    return clamp(v, -1, 1);
  });
  const wellnessBase = wellnessScore;
  const wellnessTrend90d: number[] = Array.from({ length: 90 }, (_, i) => {
    let v = wellnessBase + Math.sin(i / 8) * 4 + rf(-3, 3);
    if (arch === "burnout-risk") v += (89 - i) / 10;  // was healthier 90 days ago
    if (arch === "rising-star") v -= (89 - i) / 12;   // was less well 90 days ago
    return clamp(v, 10, 100);
  });

  // ---- recommended HR action ----
  const recommendedAction = pickAction(arch, primaryStressor, s, comm, managerName);

  return {
    id: `emp-${String(idx).padStart(3, "0")}`,
    name, displayName, role, department, city, band, clientRegion,
    tenureMonths, managerName,
    wellnessScore, attritionRisk, primaryStressor, stressFactors: s,
    comm, languageProficiency, skillGaps, learningActivity30d,
    sentimentTrend30d, wellnessTrend90d,
    recommendedAction,
  };
}

function pickAction(
  arch: Archetype,
  primary: StressFactor,
  s: Record<StressFactor, number>,
  comm: CommunicationSignals,
  managerName: string,
): RecommendedAction {
  if (arch === "burnout-risk") return {
    label: "Immediate 1:1 + workload rebalance",
    urgency: "high",
    reason: `Sentiment declining 30d + ${Math.round(comm.afterHoursActivityPct)}% after-hours activity · burnout signal`,
  };
  if (arch === "overloaded") return {
    label: "Workload review with " + managerName,
    urgency: "high",
    reason: `Work-pressure ${s.workPressure}/100 + ${Math.round(comm.afterHoursActivityPct)}% after-hours · sustainability risk`,
  };
  if (arch === "language-barrier") return {
    label: "Business English coaching · 6 weeks",
    urgency: "medium",
    reason: `Language proficiency ${Math.round(0)}${""} · client escalations noted · skill-based intervention`,
  };
  if (arch === "skill-mismatch") return {
    label: "Skill roadmap + mentor pairing",
    urgency: "medium",
    reason: `Skill gap ${s.skillGap}/100 · learning activity low · targeted upskilling`,
  };
  if (arch === "disengaged") return {
    label: "Career conversation with " + managerName,
    urgency: "medium",
    reason: `Sentiment low + meeting participation ${Math.round(comm.meetingParticipation * 100)}% · re-engagement`,
  };
  if (arch === "manager-mismatch") return {
    label: "Skip-level 1:1 · listen first",
    urgency: "high",
    reason: `Manager-relationship stress ${s.managerRelationship}/100 · Teams sentiment negative`,
  };
  if (arch === "rising-star") return {
    label: "Stretch project · retention lever",
    urgency: "low",
    reason: "High wellness + learning activity + clarity score · candidate for growth path",
  };
  return {
    label: "Continue current cadence",
    urgency: "low",
    reason: "Steady wellness · no intervention indicated",
  };
}

// ============================================================
// Public builders
// ============================================================

export const EMPLOYEES: Employee[] = Array.from({ length: 80 }, (_, i) => generateEmployee(i));

export function overallStats() {
  const wellSum = EMPLOYEES.reduce((s, e) => s + e.wellnessScore, 0);
  const atRisk = EMPLOYEES.filter(e => e.wellnessScore < 55).length;
  const attritionAvg = EMPLOYEES.reduce((s, e) => s + e.attritionRisk, 0) / EMPLOYEES.length;
  const primaryStressorCounts: Record<StressFactor, number> = {
    workPressure: 0, skillGap: 0, communicationBarrier: 0, clientPressure: 0,
    managerRelationship: 0, teamDynamics: 0, learningStagnation: 0, workLifeBalance: 0,
  };
  for (const e of EMPLOYEES) primaryStressorCounts[e.primaryStressor]++;
  const topStressor = (Object.entries(primaryStressorCounts) as [StressFactor, number][])
    .sort((a, b) => b[1] - a[1])[0];
  return {
    total: EMPLOYEES.length,
    avgWellness: Math.round(wellSum / EMPLOYEES.length),
    atRiskCount: atRisk,
    attritionRiskAvg: attritionAvg,
    topStressor: topStressor[0],
    topStressorCount: topStressor[1],
  };
}

export interface DepartmentRollup {
  department: Department;
  count: number;
  avgWellness: number;
  atRiskCount: number;
  topStressor: StressFactor;
}

export function departmentRollups(): DepartmentRollup[] {
  return DEPARTMENTS.map(d => {
    const list = EMPLOYEES.filter(e => e.department === d);
    if (list.length === 0) {
      return { department: d, count: 0, avgWellness: 0, atRiskCount: 0, topStressor: "workPressure" as StressFactor };
    }
    const avgWellness = Math.round(list.reduce((s, e) => s + e.wellnessScore, 0) / list.length);
    const atRiskCount = list.filter(e => e.wellnessScore < 55).length;
    const stressorCounts: Record<StressFactor, number> = {
      workPressure: 0, skillGap: 0, communicationBarrier: 0, clientPressure: 0,
      managerRelationship: 0, teamDynamics: 0, learningStagnation: 0, workLifeBalance: 0,
    };
    for (const e of list) stressorCounts[e.primaryStressor]++;
    const topStressor = (Object.entries(stressorCounts) as [StressFactor, number][])
      .sort((a, b) => b[1] - a[1])[0][0];
    return { department: d, count: list.length, avgWellness, atRiskCount, topStressor };
  }).sort((a, b) => a.avgWellness - b.avgWellness);
}

export function populationStressAverages(): Record<StressFactor, number> {
  const acc: Record<StressFactor, number> = {
    workPressure: 0, skillGap: 0, communicationBarrier: 0, clientPressure: 0,
    managerRelationship: 0, teamDynamics: 0, learningStagnation: 0, workLifeBalance: 0,
  };
  for (const e of EMPLOYEES) for (const k of STRESS_FACTORS) acc[k] += e.stressFactors[k];
  for (const k of STRESS_FACTORS) acc[k] = Math.round(acc[k] / EMPLOYEES.length);
  return acc;
}

export function topAtRisk(n = 12): Employee[] {
  return [...EMPLOYEES]
    .sort((a, b) => (a.wellnessScore - b.wellnessScore) + (b.attritionRisk - a.attritionRisk) * 30)
    .slice(0, n);
}

export function skillGapHeatmap(): { skill: string; count: number; departments: Set<Department> }[] {
  const map = new Map<string, { count: number; departments: Set<Department> }>();
  for (const e of EMPLOYEES) {
    for (const sk of e.skillGaps) {
      if (!map.has(sk)) map.set(sk, { count: 0, departments: new Set() });
      const entry = map.get(sk)!;
      entry.count++;
      entry.departments.add(e.department);
    }
  }
  return Array.from(map.entries())
    .map(([skill, { count, departments }]) => ({ skill, count, departments }))
    .sort((a, b) => b.count - a.count);
}

export function sentimentTrendPopulation(): { day: number; avgSentiment: number }[] {
  const days = 30;
  const out: { day: number; avgSentiment: number }[] = [];
  for (let d = 0; d < days; d++) {
    const sum = EMPLOYEES.reduce((s, e) => s + e.sentimentTrend30d[d], 0);
    out.push({ day: d - 29, avgSentiment: sum / EMPLOYEES.length });
  }
  return out;
}

// ============================================================
// Recommended organization-wide interventions
// ============================================================

export interface OrgIntervention {
  label: string;
  targetPopulation: string;
  mechanism: string;
  projectedImpact: string;
}

export function orgInterventions(): OrgIntervention[] {
  const skillGaps = skillGapHeatmap();
  const stress = populationStressAverages();
  const rollups = departmentRollups();
  const worstDept = rollups[0];

  const out: OrgIntervention[] = [];

  // Top skill gap → training
  if (skillGaps[0]?.count >= 3) {
    out.push({
      label: `Launch ${skillGaps[0].skill} bootcamp`,
      targetPopulation: `${skillGaps[0].count} employees across ${skillGaps[0].departments.size} departments`,
      mechanism: "6-week cohort · mentor-paired · assessment at end. Closes highest-frequency skill gap.",
      projectedImpact: "−12% skill-gap stress across cohort · +8 wellness points sustained",
    });
  }

  // High work-pressure signal
  if (stress.workPressure > 50) {
    out.push({
      label: "Workload rebalance sprint",
      targetPopulation: `${EMPLOYEES.filter(e => e.stressFactors.workPressure > 65).length} high-load employees`,
      mechanism: "Manager-led review of top-15 assignees · redistribute or renegotiate scope with clients.",
      projectedImpact: "−18% burnout risk in overloaded cohort · lowers attrition risk",
    });
  }

  // Language / comm barrier
  if (stress.communicationBarrier > 42) {
    out.push({
      label: "Business English + client-comm coaching",
      targetPopulation: `${EMPLOYEES.filter(e => e.stressFactors.communicationBarrier > 60).length} client-facing employees`,
      mechanism: "12-week structured program · shadowing + writing lab. Reduces client escalations.",
      projectedImpact: "−35% client escalations · +12 language proficiency points on assessments",
    });
  }

  // Department-focused
  if (worstDept && worstDept.avgWellness < 60) {
    out.push({
      label: `${worstDept.department} listening tour`,
      targetPopulation: `${worstDept.count} ${worstDept.department} employees · avg wellness ${worstDept.avgWellness}`,
      mechanism: `Skip-level 1:1s · anonymous survey · focus area is ${STRESS_META[worstDept.topStressor].label.toLowerCase()}.`,
      projectedImpact: `+9 wellness points · early signal of turnaround within 60 days`,
    });
  }

  return out.slice(0, 4);
}

// ============================================================================
// Health signals — derived deterministically from employee id + wellness
// Simulates what a corporate wellness program + optional Nu integration
// would surface (with employee consent).
// ============================================================================

export interface HealthSignals {
  sleepHoursAvg: number;            // last 14d avg
  sleepDebtHrs: number;             // vs 7h target
  stepsDaily: number;
  restingHR: number;                // bpm
  hrvMs: number;                    // heart rate variability
  bmi: number;
  chronicConditions: string[];      // e.g. Prediabetic, Hypertension
  medicalClaims90d: number;         // count of health claims last quarter
  ergonomicComplaints: boolean;
  healthContribution: number;       // 0..100 — how much health signals contribute to overall stress
}

function h32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}
function seededRand(seed: number) {
  let x = seed || 1;
  return () => { x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

const CHRONIC_POOL = ["Prediabetic", "Hypertension", "PCOS", "Migraine", "Hypothyroid", "Vitamin D deficiency", "Anxiety", "IBS", "Chronic back pain", "Sleep apnea"];

export function healthSignals(e: Employee): HealthSignals {
  const rng = seededRand(h32(e.id + "|health"));
  const wellnessFactor = e.wellnessScore / 100;        // 0..1
  const stressFactor = 1 - wellnessFactor;             // 0..1
  const afterHoursPenalty = e.comm.afterHoursActivityPct / 100;

  // Sleep degrades with stress and after-hours activity
  const sleepHoursAvg = clamp(7.4 - stressFactor * 2.2 - afterHoursPenalty * 1.2 + (rng() - 0.5) * 0.6, 4.5, 8.5);
  const sleepDebtHrs = Math.max(0, Math.round((7 - sleepHoursAvg) * 14 * 10) / 10);

  const stepsDaily = Math.round(clamp(8500 - stressFactor * 5000 + (rng() - 0.5) * 1500, 2000, 12000));
  const restingHR = Math.round(clamp(64 + stressFactor * 15 + (rng() - 0.5) * 6, 55, 92));
  const hrvMs = Math.round(clamp(58 - stressFactor * 22 + (rng() - 0.5) * 8, 20, 75));
  const bmi = Math.round((22 + stressFactor * 5 + (rng() - 0.5) * 3) * 10) / 10;

  // Chronic conditions — probability rises with stress
  const conds: string[] = [];
  const nConds = rng() < (0.15 + stressFactor * 0.55) ? (rng() < 0.4 ? 2 : 1) : 0;
  for (let k = 0; k < nConds; k++) {
    const c = CHRONIC_POOL[Math.floor(rng() * CHRONIC_POOL.length)];
    if (!conds.includes(c)) conds.push(c);
  }

  const medicalClaims90d = Math.round(clamp(stressFactor * 4 + rng() * 2, 0, 8));
  const ergonomicComplaints = rng() < stressFactor * 0.35;

  // Composite health contribution to stress
  const healthContribution = Math.round(clamp(
    (sleepDebtHrs * 1.4) +
    (restingHR > 78 ? 15 : 0) +
    (hrvMs < 35 ? 15 : 0) +
    (conds.length * 12) +
    (medicalClaims90d * 4) +
    (ergonomicComplaints ? 8 : 0),
    5, 95
  ));

  return { sleepHoursAvg: Math.round(sleepHoursAvg * 10) / 10, sleepDebtHrs, stepsDaily, restingHR, hrvMs, bmi, chronicConditions: conds, medicalClaims90d, ergonomicComplaints, healthContribution };
}

// ============================================================================
// Fathom clustering — group employees into 4 stress bands + Nu playbook per band
// ============================================================================

export type StressBand = "thriving" | "steady" | "strained" | "burnout-risk";

export interface StressBandMeta {
  key: StressBand;
  label: string;
  range: string;
  color: string;
  bg: string;
  border: string;
  ring: string;
  description: string;
}

export const STRESS_BAND_META: Record<StressBand, StressBandMeta> = {
  "thriving":     { key: "thriving",     label: "Thriving",     range: "Wellness 75+",  color: "#047857", bg: "#ECFDF5", border: "#A7F3D0", ring: "ring-emerald-200", description: "Energized, engaged, growing. Reinforce and use as multipliers." },
  "steady":       { key: "steady",       label: "Steady",       range: "Wellness 60-74",color: "#334155", bg: "#F1F5F9", border: "#CBD5E1", ring: "ring-slate-200",   description: "Healthy baseline. Watch for small drifts before they compound." },
  "strained":     { key: "strained",     label: "Strained",     range: "Wellness 50-59",color: "#B45309", bg: "#FEF3C7", border: "#FCD34D", ring: "ring-amber-200",   description: "Early stress signals. This is the intervention sweet spot." },
  "burnout-risk": { key: "burnout-risk", label: "Burnout risk", range: "Wellness < 50", color: "#B91C1C", bg: "#FEE2E2", border: "#FCA5A5", ring: "ring-rose-200",    description: "Compounded stress + attrition risk. Immediate HRBP outreach." },
};

export function stressBandFor(e: Employee): StressBand {
  if (e.wellnessScore >= 75) return "thriving";
  if (e.wellnessScore >= 60) return "steady";
  if (e.wellnessScore >= 50) return "strained";
  return "burnout-risk";
}

export interface NuSuggestion { title: string; detail: string }

export interface StressBandRollup {
  band: StressBand;
  count: number;
  pct: number;
  avgWellness: number;
  avgAttritionRisk: number;
  topStressors: { factor: StressFactor; count: number }[];
  topHealthFlags: { flag: string; count: number }[];
  nuSuggestions: NuSuggestion[];
  hrNextSteps: string[];
}

const NU_PLAYBOOK: Record<StressBand, { nu: NuSuggestion[]; hr: string[] }> = {
  "thriving": {
    nu: [
      { title: "Peer-mentor match", detail: "Nu pairs Thriving employees as mentors for Strained peers — 20-min biweekly touchpoints." },
      { title: "Growth-path nudges", detail: "Surface stretch assignments and cross-team rotations aligned with each person's skill trajectory." },
    ],
    hr: ["Recognize publicly · quarterly spotlight", "Invite to shape team rituals", "Use as calibration reference for role scorecards"],
  },
  "steady": {
    nu: [
      { title: "Weekly self-check-in", detail: "60-second Nu pulse: energy, sleep, workload. Trend is what matters — 3 amber weeks triggers a nudge." },
      { title: "Learning micro-drips", detail: "5-min daily learning tied to their top skill-gap signal — keeps skills current before gaps become stressors." },
      { title: "Sleep + activity streaks", detail: "Gentle streak-based nudges on hydration, steps, and consistent sleep window." },
    ],
    hr: ["Skip-level 1:1 every 60 days", "Confirm growth plan is written and shared", "Verify no hidden after-hours load"],
  },
  "strained": {
    nu: [
      { title: "Guided reset conversation", detail: "Nu offers a 10-min structured reflection: what's draining, what's fixable this week, what needs a manager." },
      { title: "Stress-triggered breathing + break", detail: "When after-hours activity spikes or meeting density > 6h/day, Nu nudges a real break — not a Slack message about breaks." },
      { title: "Health screening prompt", detail: "Suggests annual health check-up + on-site physio if ergonomic complaints present. Books it in-app if the employee opts in." },
      { title: "Skill-gap coach", detail: "Personalized 2-week micro-course on the exact gap surfaced from their comm signals." },
    ],
    hr: ["HRBP outreach within 2 weeks · exploratory, not diagnostic", "Manager coaching on workload triage", "Offer EAP + telehealth pathway"],
  },
  "burnout-risk": {
    nu: [
      { title: "Immediate check-in offer", detail: "Nu opens with a warm, human message — never a survey. Offers to schedule time with a counsellor same-week." },
      { title: "Load-shed suggestions", detail: "Surfaces 3-5 meetings/commitments Nu thinks are lowest-value based on their calendar + comm data, ready to decline in one tap." },
      { title: "Health-first triage", detail: "Prioritizes sleep, mood, and any chronic-condition flags. Direct pathway to on-site clinic, mental-health support, or leave-of-absence guidance." },
      { title: "Confidentiality guarantee", detail: "Nu reminds them clearly: individual conversations are private; only aggregate signals reach HR unless they say otherwise." },
    ],
    hr: ["HRBP outreach within 48 hours", "Consider workload freeze + protected recovery time", "Manager alignment: this is not a performance conversation", "Wellness program + medical benefits walk-through"],
  },
};

export function stressBandRollups(): StressBandRollup[] {
  const bands: StressBand[] = ["thriving", "steady", "strained", "burnout-risk"];
  return bands.map(band => {
    const members = EMPLOYEES.filter(e => stressBandFor(e) === band);
    const count = members.length;
    const pct = Math.round((count / EMPLOYEES.length) * 100);
    const avgWellness = count ? Math.round(members.reduce((s, e) => s + e.wellnessScore, 0) / count) : 0;
    const avgAttritionRisk = count ? Math.round(members.reduce((s, e) => s + e.attritionRisk, 0) / count * 100) / 100 : 0;

    // Top 3 stress factors
    const factorCounts: Partial<Record<StressFactor, number>> = {};
    for (const m of members) factorCounts[m.primaryStressor] = (factorCounts[m.primaryStressor] ?? 0) + 1;
    const topStressors = (Object.entries(factorCounts) as [StressFactor, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([factor, count]) => ({ factor, count }));

    // Top health flags across the band
    const healthCounts: Record<string, number> = {};
    for (const m of members) {
      const h = healthSignals(m);
      if (h.sleepDebtHrs > 10) healthCounts["Sleep debt >10h/2wk"] = (healthCounts["Sleep debt >10h/2wk"] ?? 0) + 1;
      if (h.restingHR > 78)    healthCounts["Elevated resting HR"]  = (healthCounts["Elevated resting HR"] ?? 0) + 1;
      if (h.hrvMs < 35)        healthCounts["Low HRV (recovery)"]   = (healthCounts["Low HRV (recovery)"] ?? 0) + 1;
      for (const c of h.chronicConditions) healthCounts[c] = (healthCounts[c] ?? 0) + 1;
      if (h.medicalClaims90d >= 3) healthCounts["High medical claims"] = (healthCounts["High medical claims"] ?? 0) + 1;
    }
    const topHealthFlags = Object.entries(healthCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([flag, count]) => ({ flag, count }));

    return {
      band, count, pct, avgWellness, avgAttritionRisk,
      topStressors, topHealthFlags,
      nuSuggestions: NU_PLAYBOOK[band].nu,
      hrNextSteps: NU_PLAYBOOK[band].hr,
    };
  });
}

export function populationHealthContribution(): number {
  const vals = EMPLOYEES.map(e => healthSignals(e).healthContribution);
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}
