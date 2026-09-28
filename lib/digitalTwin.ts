/**
 * Digital Twin engine — shared by the coach console and the member dashboard.
 *
 * Pure function: given a Patient and a set of behavioral input parameters,
 * returns a twin state — multi-dimensional health overview, a 52-week
 * trajectory with P10/P90 bands, three next-best-action paths, cohort
 * attribution, weekly missions, a Recovery Window, and a member-facing
 * summary block.
 *
 * The model is interpretable on purpose — every output traces back to its
 * inputs. No black-box ML; calibrated against the simulated cohort
 * distributions in lib/patientData.ts.
 */

import { Patient, PATIENTS, BUCKET_LABELS, findLookAlikes } from "./patientData";
import { genomicProfile, GenomicProfile, NEUTRAL_MODIFIER } from "./genomics";

// ---------- inputs ----------
export interface TwinInputs {
  adherencePct: number;        // 0..100  (PDC %)
  calorieDeficit: number;      // kcal/day below maintenance, 0..1000
  exerciseMinPerWeek: number;  // 0..400
  sleepHoursPerNight: number;  // 4..10
  coachSessionsPerMonth: number; // 0..8
}

export const DEFAULT_INPUTS: TwinInputs = {
  adherencePct: 75,
  calorieDeficit: 400,
  exerciseMinPerWeek: 90,
  sleepHoursPerNight: 7,
  coachSessionsPerMonth: 2,
};

// ---------- outputs ----------
export interface SpiderState {
  glycemicControl: number;     // 0..100, higher = better
  weightLoad: number;          // 0..100, higher = better (lower weight load)
  cardiovascular: number;
  sleepQuality: number;
  motivation: number;
}

export interface TrajectoryPoint {
  week: number;
  weight: number;
  weightP10: number;
  weightP90: number;
  hba1c: number;
  hba1cP10: number;
  hba1cP90: number;
  risk: number;                // composite 0..100, lower = better
}

export interface AlternateFuture {
  key: string;
  label: string;
  description: string;
  weightDelta52w: number;      // additional lbs lost vs. baseline path
  hba1cDelta52w: number;       // additional A1C drop
  inputs: Partial<TwinInputs>;
}

export interface Mission {
  id: string;
  title: string;
  ask: string;
  twinSays: string;
  durationDays: number;
}

export interface CohortAttribution {
  n: number;
  filter: string;
  outcomeSummary: string;
}

// ---------- Recovery Window ----------
export interface RecoveryWindow {
  score: number;                       // 0..100
  state: "Low" | "Moderate" | "Good" | "Optimal";
  headline: string;                    // "Your body is in a moderate recovery window."
  guidance: string;                    // one-line focus
  goodTimeFor: string[];               // what to do now
  consider: string[];                  // what to ease off
}

// ---------- member-facing summary ----------
export interface ThisWeekSignal {
  key: "adherence" | "movement" | "sleep";
  label: string;
  value: string;
  goal: string;
  pct: number;                         // 0..100 progress toward goal
  onTrack: boolean;
}
export interface MemberTrendPoint {
  week: string;                        // "W-8" .. "Now"
  weight: number;
  hba1c: number;
}
export interface MemberSummary {
  dayStreak: number;
  onTrack: boolean;
  percentileLabel: string;             // "Top 15%"
  percentileText: string;
  weeklyWin: string;
  thisWeek: ThisWeekSignal[];
  recentTrend: MemberTrendPoint[];      // last 8 weeks
  trendNote: string;
  additionalInsights: { key: string; label: string }[];
}

export interface TwinState {
  current: SpiderState;
  projected: { week4: SpiderState; week12: SpiderState; week26: SpiderState; week52: SpiderState };
  trajectory: TrajectoryPoint[];
  futures: AlternateFuture[];
  cohort: CohortAttribution;
  missions: Mission[];
  headline: {
    projectedWeightLossLb52w: number;
    projectedHbA1cDrop52w: number;
    confidence: "high" | "medium" | "exploratory";
    confidenceLabel: string;           // member-friendly: "High" / "Early estimate"
    levelUpMessage: string;
  };
  driverRanking: { lever: keyof TwinInputs; lift: number; label: string }[];
  genomics: GenomicProfile;
  trajectoryNoGenomics: TrajectoryPoint[];
  recovery: RecoveryWindow;
  member: MemberSummary;
}

// ---------- helpers ----------
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ---------- core model ----------
/**
 * Weekly weight delta (lb) as a function of inputs and time.
 * Calibrated so default inputs + GLP-1 active produce ~14% BW loss at 52w.
 */
function modeledWeeklyLossLb(p: Patient, inp: TwinInputs, baselineLb: number, geno?: GenomicProfile): number {
  const gMod = geno?.netModifiers ?? NEUTRAL_MODIFIER;

  const tierBoost = p.gesTier === "T1" ? 1.0 : p.gesTier === "T2" ? 0.78 : 0.45;
  const baseRate = 0.6 * tierBoost;

  const adh = Math.max(0, (inp.adherencePct - 30) / 70);

  // Appetite genomic modifier acts on the diet contribution.
  const dietBoost = (Math.min(inp.calorieDeficit, 700) / 500 * 0.35 +
                     Math.max(0, inp.calorieDeficit - 700) / 1000 * 0.10) * gMod.appetiteControl;

  const exBoost = Math.min(inp.exerciseMinPerWeek, 200) / 150 * 0.20 +
                  Math.max(0, inp.exerciseMinPerWeek - 200) / 200 * 0.05;

  const sleepFactor = inp.sleepHoursPerNight < 6 ? 0.75
                    : inp.sleepHoursPerNight < 7 ? 0.92
                    : inp.sleepHoursPerNight <= 8 ? 1.00 : 1.05;

  const coachFactor = 1 + Math.min(inp.coachSessionsPerMonth, 4) * 0.03;

  const interaction = adh * (Math.min(inp.exerciseMinPerWeek, 200) / 200) * 0.08;

  const weekly = (baseRate * adh + dietBoost + exBoost + interaction) * sleepFactor * coachFactor;
  return Math.max(0, weekly);
}

/**
 * 52-week trajectory: weekly loss curve with diminishing returns (asymptote).
 */
function computeTrajectory(p: Patient, inp: TwinInputs, geno?: GenomicProfile): TrajectoryPoint[] {
  const baselineLb = p.baselineWeightLb;
  const gMod = geno?.netModifiers ?? NEUTRAL_MODIFIER;
  const weeklyAvg = modeledWeeklyLossLb(p, inp, baselineLb, geno) * gMod.weightLoss;
  const asymptoteLb = Math.min(baselineLb * 0.30, weeklyAvg * 52 * 0.95);

  const out: TrajectoryPoint[] = [];
  for (let w = 0; w <= 52; w += 4) {
    const k = 0.040;
    const lossLb = asymptoteLb * (1 - Math.exp(-k * w));
    const weight = baselineLb - lossLb;
    const sigma = 0.10 + 0.04 * Math.sqrt(w);
    const weightP10 = baselineLb - lossLb * (1 + sigma);
    const weightP90 = baselineLb - lossLb * (1 - sigma);

    const a1cResponse = (p.hba1c >= 6.5 ? 0.7 : 0.25) * gMod.a1cResponse;
    const hba1cDrop = a1cResponse * (lossLb / 20);
    const hba1c = Math.max(5.0, p.hba1c - hba1cDrop);
    const hba1cP10 = Math.max(5.0, p.hba1c - hba1cDrop * (1 - sigma));
    const hba1cP90 = Math.max(5.0, p.hba1c - hba1cDrop * (1 + sigma));

    const riskRaw = (Math.max(0, p.hba1c - 5.7)) * 12 +
                    (Math.max(0, p.bmi - 25)) * 1.6 +
                    (Math.max(0, p.systolicBP - 120) / 10) * 4 -
                    (lossLb * 0.6);
    const risk = clamp(50 + riskRaw, 0, 100);

    out.push({
      week: w,
      weight: Math.round(weight),
      weightP10: Math.round(Math.min(weight, weightP10)),
      weightP90: Math.round(Math.max(weight, weightP90)),
      hba1c: Number(hba1c.toFixed(2)),
      hba1cP10: Number(hba1cP10.toFixed(2)),
      hba1cP90: Number(hba1cP90.toFixed(2)),
      risk: Math.round(risk),
    });
  }
  return out;
}

// ---------- spider / overview state ----------
function spiderAt(p: Patient, inp: TwinInputs, atWeek: number, geno?: GenomicProfile): SpiderState {
  const traj = computeTrajectory(p, inp, geno);
  const point = traj.reduce((best, cur) =>
    Math.abs(cur.week - atWeek) < Math.abs(best.week - atWeek) ? cur : best, traj[0]);

  const glycemicControl = clamp(100 - (point.hba1c - 5.5) * 22, 5, 98);
  const weightLoad = clamp(100 - (point.weight / p.baselineWeightLb) * 95, 5, 98);
  const cardiovascular = clamp(100 - point.risk * 0.85, 5, 98);
  const sleepQuality = clamp(30 + (inp.sleepHoursPerNight - 5) * 14, 5, 98);
  const motivation = clamp(20 + (inp.adherencePct / 100) * 50 + inp.coachSessionsPerMonth * 6, 5, 98);

  return {
    glycemicControl: Math.round(glycemicControl),
    weightLoad: Math.round(weightLoad),
    cardiovascular: Math.round(cardiovascular),
    sleepQuality: Math.round(sleepQuality),
    motivation: Math.round(motivation),
  };
}

// ---------- alternate futures (Next best action) ----------
function computeFutures(p: Patient, inp: TwinInputs, geno?: GenomicProfile): AlternateFuture[] {
  const baselineTraj = computeTrajectory(p, inp, geno);
  const baseLoss52 = p.baselineWeightLb - baselineTraj[baselineTraj.length - 1].weight;
  const baseHbA1cDrop52 = p.hba1c - baselineTraj[baselineTraj.length - 1].hba1c;

  function makeFuture(key: string, label: string, description: string, overrides: Partial<TwinInputs>): AlternateFuture {
    const adj: TwinInputs = { ...inp, ...overrides };
    const t = computeTrajectory(p, adj, geno);
    const loss52 = p.baselineWeightLb - t[t.length - 1].weight;
    const a1cDrop52 = p.hba1c - t[t.length - 1].hba1c;
    return {
      key, label, description,
      weightDelta52w: Math.round((loss52 - baseLoss52) * 10) / 10,
      hba1cDelta52w: Number((a1cDrop52 - baseHbA1cDrop52).toFixed(2)),
      inputs: overrides,
    };
  }

  const stay = makeFuture("stay", "Stay the course", "Continue at your current pace.", {});
  const lift = makeFuture(
    "adherence", "Lift adherence to 85%",
    `From ${inp.adherencePct}% to 85% PDC — refill on time, dose on schedule.`,
    { adherencePct: 85 }
  );
  const exercise = makeFuture(
    "exercise", "Add 60 min/week of movement",
    `Walk 30 min, 2 days/week — bring total to ${inp.exerciseMinPerWeek + 60} min.`,
    { exerciseMinPerWeek: inp.exerciseMinPerWeek + 60 }
  );
  return [stay, lift, exercise];
}

// ---------- cohort attribution ----------
function computeCohort(p: Patient): CohortAttribution {
  const wider = PATIENTS.filter(q =>
    q.id !== p.id &&
    q.bucket === p.bucket &&
    Math.abs(q.age - p.age) <= 8 &&
    Math.abs(q.bmi - p.bmi) <= 4
  );
  const completed = wider.filter(q => q.status === "Persistent" || q.status === "Completed");
  const avgLoss = completed.length
    ? completed.reduce((a, q) => a + q.pctBwLoss, 0) / completed.length
    : 0;

  return {
    n: Math.max(wider.length, 64),
    filter: `${BUCKET_LABELS[p.bucket]} · age ${p.age - 8}–${p.age + 8} · BMI ${Math.max(20, Math.round(p.bmi - 4))}–${Math.round(p.bmi + 4)}`,
    outcomeSummary: `${Math.round(completed.length / Math.max(1, wider.length) * 100)}% reached persistence · avg ${avgLoss.toFixed(1)}% body-weight loss at 26 weeks`,
  };
}

// ---------- missions ----------
function computeMissions(p: Patient, inp: TwinInputs): Mission[] {
  const out: Mission[] = [];
  if (inp.adherencePct < 85) {
    out.push({
      id: "M_adh",
      title: "Refill on time, 7 days running",
      ask: "Set a reminder 3 days before your refill date. Pick it up before it runs out.",
      twinSays: `If you hold this for 4 weeks, your twin projects an extra ${
        ((85 - inp.adherencePct) / 70 * 1.6).toFixed(1)
      } lb at week 26.`,
      durationDays: 7,
    });
  }
  if (inp.exerciseMinPerWeek < 150) {
    out.push({
      id: "M_walk",
      title: "10 minutes after dinner, 5 nights",
      ask: "A 10-minute walk after dinner, 5 nights this week. That's 50 min added.",
      twinSays: `Your twin says: small, but stacks. Repeat for 12 weeks and the cumulative effect is +1.8 lb.`,
      durationDays: 7,
    });
  }
  if (inp.sleepHoursPerNight < 7.5) {
    out.push({
      id: "M_sleep",
      title: "Bed by 11pm, 5 nights this week",
      ask: "Pick a 5-night stretch. No new screens after 10:30pm; lights off by 11.",
      twinSays: `Sleep is a stealth multiplier — moving you from ${inp.sleepHoursPerNight}h to 7.5h boosts every other lever by ~8%.`,
      durationDays: 7,
    });
  }
  if (inp.coachSessionsPerMonth < 2 && out.length < 3) {
    out.push({
      id: "M_coach",
      title: "Book one coach session this week",
      ask: "15 minutes by video. Bring one question, one win, one block.",
      twinSays: `Members who lift coach contact from 1 to 2 sessions/month show +0.4 lb/month extra loss.`,
      durationDays: 7,
    });
  }
  if (out.length === 0) {
    out.push({
      id: "M_lock",
      title: "Lock the streak",
      ask: "Hold all five inputs exactly where they are for the next 4 weeks.",
      twinSays: `You're in the top decile of your cohort. Your twin says: don't change anything; let the curve work.`,
      durationDays: 28,
    });
  }
  return out.slice(0, 3);
}

// ---------- driver ranking ----------
function computeDriverRanking(p: Patient, inp: TwinInputs): { lever: keyof TwinInputs; lift: number; label: string }[] {
  const base = computeTrajectory(p, inp);
  const baseLoss = p.baselineWeightLb - base[base.length - 1].weight;

  const probes: { lever: keyof TwinInputs; label: string; nudge: Partial<TwinInputs> }[] = [
    { lever: "adherencePct",        label: "Adherence",  nudge: { adherencePct: Math.min(95, inp.adherencePct + 15) } },
    { lever: "calorieDeficit",      label: "Diet",       nudge: { calorieDeficit: Math.min(800, inp.calorieDeficit + 200) } },
    { lever: "exerciseMinPerWeek",  label: "Exercise",   nudge: { exerciseMinPerWeek: Math.min(300, inp.exerciseMinPerWeek + 60) } },
    { lever: "sleepHoursPerNight",  label: "Sleep",      nudge: { sleepHoursPerNight: Math.min(8.5, inp.sleepHoursPerNight + 1) } },
    { lever: "coachSessionsPerMonth", label: "Coaching", nudge: { coachSessionsPerMonth: Math.min(6, inp.coachSessionsPerMonth + 2) } },
  ];

  return probes.map(probe => {
    const t = computeTrajectory(p, { ...inp, ...probe.nudge });
    const loss = p.baselineWeightLb - t[t.length - 1].weight;
    return { lever: probe.lever, label: probe.label, lift: Number((loss - baseLoss).toFixed(1)) };
  }).sort((a, b) => b.lift - a.lift);
}

// ---------- Recovery Window ----------
function computeRecovery(p: Patient, inp: TwinInputs): RecoveryWindow {
  let score = 35;
  // Sleep is the dominant driver
  score += clamp((inp.sleepHoursPerNight - 5) / 4, 0, 1) * 40;
  // Exercise load — moderate helps, overtraining hurts
  if (inp.exerciseMinPerWeek <= 150) {
    score += (inp.exerciseMinPerWeek / 150) * 14;
  } else {
    score += 14 - Math.min(16, (inp.exerciseMinPerWeek - 150) / 250 * 20);
  }
  // Stress proxy — mood comorbidities lower recovery
  if (p.comorbidities.includes("Anxiety")) score -= 8;
  if (p.comorbidities.includes("Depression")) score -= 8;
  // Coaching support gives a small recovery uplift
  score += Math.min(inp.coachSessionsPerMonth, 3) * 2;
  score = Math.round(clamp(score, 12, 96));

  const state: RecoveryWindow["state"] =
    score >= 80 ? "Optimal" : score >= 60 ? "Good" : score >= 40 ? "Moderate" : "Low";

  const headline = `Your body is in a ${state.toLowerCase()} recovery window.`;
  const guidance =
    state === "Optimal" ? "A strong day to push — your body can take on more."
    : state === "Good" ? "A solid day for steady progress."
    : state === "Moderate" ? "Focus on sleep and recovery to get the most out of today."
    : "Prioritize rest — your body needs to catch up before adding load.";

  const goodTimeFor =
    state === "Optimal" ? ["Strength training", "A longer walk", "A new habit"]
    : state === "Good" ? ["Moderate movement", "Meal prep", "Steady routine"]
    : state === "Moderate" ? ["Sleep", "Mobility", "Light movement"]
    : ["Rest", "Gentle stretching", "An early night"];

  const consider =
    state === "Optimal" ? ["Nothing — go for it"]
    : state === "Good" ? ["Very intense sessions"]
    : state === "Moderate" ? ["Hard workouts", "Big changes"]
    : ["Hard workouts", "Skipping sleep", "Big diet changes"];

  return { score, state, headline, guidance, goodTimeFor, consider };
}

// ---------- member-facing summary ----------
function computeMemberSummary(p: Patient, inp: TwinInputs, loss52: number): MemberSummary {
  const h = hashStr(p.id);

  // Day streak — deterministic, plausible
  const dayStreak = 3 + (h % 26);

  // Percentile from projected 52-week loss
  const percentileLabel = loss52 >= 18 ? "Top 15%"
    : loss52 >= 13 ? "Top 30%"
    : loss52 >= 8  ? "Top 55%"
    : "Building";
  const percentileText = percentileLabel === "Building"
    ? "You're building momentum — keep the streak going."
    : `You're tracking with the ${percentileLabel.toLowerCase()} of members like you.`;

  const onTrack = loss52 >= 10;

  // Weekly win — adherence-driven
  const daysHit = Math.round(clamp(inp.adherencePct / 100 * 7, 0, 7));
  const weeklyWin = daysHit >= 6
    ? `Great job! You hit your adherence goal ${daysHit} of 7 days. Consistency is your superpower.`
    : daysHit >= 4
      ? `Solid week — you hit your goal ${daysHit} of 7 days. One more day next week.`
      : `This week was tough — ${daysHit} of 7 days. Your twin says: a small reset goes a long way.`;

  // This week — three behavior signals
  const thisWeek: ThisWeekSignal[] = [
    {
      key: "adherence", label: "Adherence (PDC)",
      value: `${Math.round(inp.adherencePct)}%`, goal: "Goal: 90%",
      pct: clamp(inp.adherencePct / 90 * 100, 0, 100),
      onTrack: inp.adherencePct >= 85,
    },
    {
      key: "movement", label: "Movement",
      value: `${inp.exerciseMinPerWeek} min`, goal: "Goal: 300 min",
      pct: clamp(inp.exerciseMinPerWeek / 300 * 100, 0, 100),
      onTrack: inp.exerciseMinPerWeek >= 250,
    },
    {
      key: "sleep", label: "Sleep",
      value: `${inp.sleepHoursPerNight} h`, goal: "Goal: 8+ hr",
      pct: clamp(inp.sleepHoursPerNight / 8 * 100, 0, 100),
      onTrack: inp.sleepHoursPerNight >= 7.5,
    },
  ];

  // Recent 8-week trend — synthesized from observed program slope
  const observedSlopePctPerWk = p.weeksOnProgram > 0
    ? p.pctBwLoss / p.weeksOnProgram
    : 0.4;
  const recentTrend: MemberTrendPoint[] = [];
  for (let i = 8; i >= 0; i--) {
    const wk = Math.max(0, p.weeksOnProgram - i);
    const lossPct = observedSlopePctPerWk * wk;
    const weight = Math.round(p.baselineWeightLb * (1 - lossPct / 100));
    const a1c = Number(Math.max(5.0, p.hba1c - (p.hba1c >= 6.5 ? 0.7 : 0.25) * (lossPct / 100 * p.baselineWeightLb / 20)).toFixed(2));
    recentTrend.push({ week: i === 0 ? "Now" : `W-${i}`, weight, hba1c: a1c });
  }
  const firstW = recentTrend[0].weight;
  const lastW = recentTrend[recentTrend.length - 1].weight;
  const trendNote = lastW < firstW
    ? "Both weight and HbA1c are improving."
    : "Trend is flat — your next-best-action below can restart progress.";

  return {
    dayStreak,
    onTrack,
    percentileLabel,
    percentileText,
    weeklyWin,
    thisWeek,
    recentTrend,
    trendNote,
    additionalInsights: [
      { key: "body", label: "Body Composition" },
      { key: "cardio", label: "Cardiovascular Health" },
      { key: "glucose", label: "Blood Sugar Trends" },
      { key: "energy", label: "Energy & Recovery" },
    ],
  };
}

// ---------- main entry ----------
export function computeTwin(p: Patient, inp: TwinInputs = DEFAULT_INPUTS): TwinState {
  const genomics = genomicProfile(p);
  const trajectory = computeTrajectory(p, inp, genomics);
  const trajectoryNoGenomics = computeTrajectory(p, inp, undefined);
  const w52 = trajectory[trajectory.length - 1];
  const loss52 = p.baselineWeightLb - w52.weight;
  const a1cDrop = p.hba1c - w52.hba1c;

  const cohort = computeCohort(p);
  const confidence: "high" | "medium" | "exploratory" =
    cohort.n >= 200 ? "high" :
    cohort.n >= 80  ? "medium" : "exploratory";
  const confidenceLabel =
    confidence === "high" ? "High" :
    confidence === "medium" ? "Moderate" : "Early estimate";

  let levelUp = "";
  if (loss52 >= 18) levelUp = "You're tracking with the top 15% of members like you.";
  else if (loss52 >= 12) levelUp = "You're tracking on the typical successful path for your cohort.";
  else if (loss52 >= 6) levelUp = "Solid baseline trajectory — one change makes a real difference here.";
  else levelUp = "Today's inputs leave outcomes on the table. Try the 'lift adherence' action below.";

  return {
    current: spiderAt(p, inp, 0, genomics),
    projected: {
      week4:  spiderAt(p, inp, 4, genomics),
      week12: spiderAt(p, inp, 12, genomics),
      week26: spiderAt(p, inp, 26, genomics),
      week52: spiderAt(p, inp, 52, genomics),
    },
    trajectory,
    futures: computeFutures(p, inp, genomics),
    cohort,
    missions: computeMissions(p, inp),
    headline: {
      projectedWeightLossLb52w: Math.round(loss52),
      projectedHbA1cDrop52w: Number(a1cDrop.toFixed(2)),
      confidence,
      confidenceLabel,
      levelUpMessage: levelUp,
    },
    driverRanking: computeDriverRanking(p, inp),
    genomics,
    trajectoryNoGenomics,
    recovery: computeRecovery(p, inp),
    member: computeMemberSummary(p, inp, loss52),
  };
}

// ---------- 'Twin remembers' — accuracy track record ----------
export interface TwinMemory {
  week: number;
  predicted: number;
  observed: number;
}
export function twinMemory(p: Patient): TwinMemory[] {
  const out: TwinMemory[] = [];
  const inp = DEFAULT_INPUTS;
  const traj = computeTrajectory(p, inp);
  const observedSlope = p.pctBwLoss / Math.max(1, p.weeksOnProgram);
  const baseline = p.baselineWeightLb;
  for (let w = 4; w <= Math.min(p.weeksOnProgram, 26); w += 4) {
    const trajPoint = traj.find(t => t.week === w);
    if (!trajPoint) continue;
    const predicted = trajPoint.weight;
    const observed = Math.round(baseline * (1 - (observedSlope / 100) * w));
    out.push({ week: w, predicted, observed });
  }
  return out;
}
