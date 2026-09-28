/**
 * Coach Intelligence — operational layer for the Coach Intelligence Dashboard.
 *
 * Turns the simulated patient population into a coach-facing operational
 * surface: priority queue, daily briefing, suggested interventions, journey
 * timelines, behavioral insights, coach effectiveness metrics, and cohort
 * comparison.
 *
 * Pure data — no React. Consumed by pages/coach-intelligence.tsx.
 */

import { PATIENTS, Patient, BUCKET_LABELS } from "./patientData";
import { CLUSTERS, ClusterKey, clusterOf } from "./campaigns";

// ---------- coach roster ----------
export interface Coach {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  region: string;
  caseload: number;        // active participants
  retentionRate: number;   // 0..1
  avgWeightLossKg: number;
  highRiskRecovery: number; // % of high-risk recovered
  plateauRecoveryRate: number;
  emotionalCohortSuccess: number;
  effectivenessScore: number; // 0..100
  participantSatisfaction: number; // 1..5
  yearsExperience: number;
  badges: string[];
}

export const COACHES: Coach[] = [
  { id: "C001", name: "Maya Patel",       initials: "MP", specialty: "T2DM + Behavioral", region: "Midwest",   caseload: 128, retentionRate: 0.91, avgWeightLossKg: 10.1, highRiskRecovery: 0.74, plateauRecoveryRate: 0.69, emotionalCohortSuccess: 0.82, effectivenessScore: 92, participantSatisfaction: 4.8, yearsExperience: 6, badges: ["Top retention Q1", "T2DM expert"] },
  { id: "C002", name: "Daniel Cho",       initials: "DC", specialty: "Weight loss",        region: "Northeast", caseload: 142, retentionRate: 0.86, avgWeightLossKg: 9.4,  highRiskRecovery: 0.61, plateauRecoveryRate: 0.74, emotionalCohortSuccess: 0.71, effectivenessScore: 88, participantSatisfaction: 4.6, yearsExperience: 4, badges: ["Plateau specialist"] },
  { id: "C003", name: "Renee Williams",   initials: "RW", specialty: "Emotional eating",   region: "Southeast", caseload: 116, retentionRate: 0.89, avgWeightLossKg: 8.9,  highRiskRecovery: 0.78, plateauRecoveryRate: 0.66, emotionalCohortSuccess: 0.91, effectivenessScore: 90, participantSatisfaction: 4.9, yearsExperience: 8, badges: ["Behavioral lead"] },
  { id: "C004", name: "Carlos Mendoza",   initials: "CM", specialty: "Cardiometabolic",    region: "Southwest", caseload: 134, retentionRate: 0.84, avgWeightLossKg: 9.7,  highRiskRecovery: 0.69, plateauRecoveryRate: 0.61, emotionalCohortSuccess: 0.66, effectivenessScore: 84, participantSatisfaction: 4.5, yearsExperience: 5, badges: [] },
  { id: "C005", name: "Aisha Rahman",     initials: "AR", specialty: "Prediabetic + busy", region: "West",      caseload: 121, retentionRate: 0.93, avgWeightLossKg: 8.2,  highRiskRecovery: 0.71, plateauRecoveryRate: 0.72, emotionalCohortSuccess: 0.78, effectivenessScore: 94, participantSatisfaction: 4.9, yearsExperience: 7, badges: ["Highest retention", "Prediabetic cohort lead"] },
  { id: "C006", name: "Ben Thompson",     initials: "BT", specialty: "T2DM + 55+",         region: "Midwest",   caseload: 109, retentionRate: 0.82, avgWeightLossKg: 9.1,  highRiskRecovery: 0.66, plateauRecoveryRate: 0.58, emotionalCohortSuccess: 0.62, effectivenessScore: 80, participantSatisfaction: 4.3, yearsExperience: 3, badges: [] },
];

// ---------- assign each patient to a coach (deterministic) ----------
const PATIENT_COACH = new Map<string, string>();
for (let i = 0; i < PATIENTS.length; i++) {
  // Round-robin weighted by region affinity
  const p = PATIENTS[i];
  const regional = COACHES.filter(c => c.region === p.region);
  const pool = regional.length ? regional : COACHES;
  PATIENT_COACH.set(p.id, pool[i % pool.length].id);
}
// Demo override — pin Sandy R. to the default coach (Maya Patel, C001) so the
// demo dashboard surfaces her without requiring the viewer to switch coach.
PATIENT_COACH.set("P100967", "C001");
export const coachOf = (p: Patient): Coach => COACHES.find(c => c.id === PATIENT_COACH.get(p.id))!;
export const participantsOf = (coachId: string): Patient[] =>
  PATIENTS.filter(p => PATIENT_COACH.get(p.id) === coachId);

// ---------- risk priority signals ----------
export type RiskSignal = "Clinical" | "Behavioral" | "Emotional" | "Dropout";

export interface PriorityEntry {
  patient: Patient;
  riskBand: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;        // 0..100
  signals: RiskSignal[];
  topReason: string;
  recommendedAction: string;
  bucket: ClusterKey;
  bucketLabel: string;
}

function reasonAndAction(p: Patient, signals: RiskSignal[]): { reason: string; action: string } {
  // ===== Demo override: Sandy R. (P100967) — top reason includes GLP-1 side effects =====
  if (p.id === "P100967") {
    return {
      reason: "GLP-1 side effects (persistent nausea + GI symptoms) + low adherence",
      action: "Escalate to physician to reduce dosage",
    };
  }

  // Priority order: Emotional > Clinical > Dropout > Behavioral
  if (signals.includes("Emotional") && p.comorbidities.some(c => ["Depression", "Anxiety"].includes(c))) {
    return {
      reason: "Emotional eating spike + low motivation",
      action: "Behavioral coach escalation + share Renee W. emotional-cohort reference",
    };
  }
  if (signals.includes("Clinical") && p.hba1c >= 8) {
    return {
      reason: `HbA1c ${p.hba1c.toFixed(1)} — clinical worsening`,
      action: "Schedule clinician check + dose review within 5 business days",
    };
  }
  if (signals.includes("Clinical") && p.weeksOnProgram >= 4 && p.pctBwLoss < 2) {
    return {
      reason: "Weight regain trend / no early loss",
      action: "Run plateau script #4 + show similar success stories",
    };
  }
  if (signals.includes("Dropout")) {
    return {
      reason: `${Math.max(2, Math.round((1 - p.pps) * 8))} signals of disengagement (low logins, missed nudges)`,
      action: "Accountability call + 24-hr SMS follow-up sequence",
    };
  }
  if (signals.includes("Behavioral") && p.pdc < 0.6) {
    return {
      reason: `Adherence (PDC) at ${(p.pdc * 100).toFixed(0)}% — refill friction`,
      action: "Refill flow review + pharmacy network alternative",
    };
  }
  if (signals.includes("Behavioral")) {
    return {
      reason: "Low portal engagement + missed sessions",
      action: "Re-engagement message via preferred channel",
    };
  }
  return {
    reason: "General progress check",
    action: "Routine check-in + reinforce goals",
  };
}

export function priorityQueue(coachId: string, limit = 12): PriorityEntry[] {
  const pts = participantsOf(coachId).filter(p =>
    ["Active", "Persistent", "Outreach"].includes(p.status));
  const entries: PriorityEntry[] = pts.map(p => {
    const signals: RiskSignal[] = [];
    let score = 0;

    // Clinical
    if (p.hba1c >= 8 || (p.weeksOnProgram >= 8 && p.pctBwLoss < 3) || p.systolicBP >= 160) {
      signals.push("Clinical");
      score += 30;
    }
    // Behavioral
    if (p.pdc < 0.6 || p.portalLogins90d < 8 || p.coachInteractions90d < 2) {
      signals.push("Behavioral");
      score += 20;
    }
    // Emotional
    if (p.comorbidities.some(c => ["Depression", "Anxiety"].includes(c)) && p.pps < 0.55) {
      signals.push("Emotional");
      score += 20;
    }
    // Dropout
    if (p.pps < 0.45 || (p.status === "Active" && p.weeksOnProgram >= 6 && p.pctBwLoss < 2)) {
      signals.push("Dropout");
      score += 25;
    }

    // ===== Demo override: Sandy R. (P100967) — force her into the top of the queue =====
    // Her natural risk score (~20, Medium) wouldn't surface her on a 100-patient caseload.
    // For the GLP-1 side-effects demo storyline, we promote her with story-appropriate signals.
    if (p.id === "P100967") {
      score = 78;
      // Build a signal mix that matches the override reason/action
      signals.length = 0;
      signals.push("Clinical", "Behavioral", "Dropout");
    }

    let band: PriorityEntry["riskBand"] = "Low";
    if (score >= 60) band = "Critical";
    else if (score >= 40) band = "High";
    else if (score >= 20) band = "Medium";

    const ra = reasonAndAction(p, signals);
    return {
      patient: p,
      riskBand: band,
      riskScore: Math.min(100, score),
      signals,
      topReason: ra.reason,
      recommendedAction: ra.action,
      bucket: clusterOf(p),
      bucketLabel: BUCKET_LABELS[p.bucket] ?? "—",
    };
  });
  entries.sort((a, b) => b.riskScore - a.riskScore);
  return entries.slice(0, limit);
}

// ---------- daily AI briefing ----------
export interface BriefingItem {
  count: number;
  label: string;
  tone: "alert" | "win" | "info";
}

export function dailyBriefing(coachId: string) {
  const queue = priorityQueue(coachId, 200);
  const dropoutRisk = queue.filter(q => q.riskBand === "Critical" || q.signals.includes("Dropout")).length;
  const improving = participantsOf(coachId).filter(p => p.weeksOnProgram >= 4 && p.pctBwLoss >= 6).length;
  const plateau = queue.filter(q => q.signals.includes("Clinical") && !q.signals.includes("Emotional") && q.patient.weeksOnProgram >= 4 && q.patient.pctBwLoss < 4).length;
  const escalations = queue.filter(q => q.riskBand === "Critical" && q.signals.includes("Clinical")).length;
  const items: BriefingItem[] = [
    { count: dropoutRisk, label: "participants at dropout risk",        tone: "alert" },
    { count: improving,   label: "showing strong improvement",          tone: "win" },
    { count: plateau,     label: "plateau interventions recommended",   tone: "info" },
    { count: escalations, label: "require clinical escalation",         tone: "alert" },
  ];
  return items;
}

// ---------- per-participant journey timeline ----------
export interface TimelineEvent {
  date: string;
  week: number;
  type: "milestone" | "intervention" | "risk" | "win";
  title: string;
  detail: string;
}

export function journeyTimeline(p: Patient): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - p.weeksOnProgram * 7);
  const fmt = (week: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + week * 7);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  events.push({ date: fmt(0), week: 0, type: "milestone", title: "Program started", detail: `Baseline weight ${p.baselineWeightLb} lb · BMI ${p.bmi.toFixed(1)} · HbA1c ${p.hba1c.toFixed(1)}` });
  if (p.weeksOnProgram >= 1) events.push({ date: fmt(1), week: 1, type: "intervention", title: "Onboarding call", detail: "Goals locked · expectations set · plateau script preview" });
  if (p.weeksOnProgram >= 2) events.push({ date: fmt(2), week: 2, type: "win", title: "First measurable progress", detail: `Down ${(p.pctBwLoss * 0.25).toFixed(1)}% body weight` });
  if (p.weeksOnProgram >= 3 && p.pps < 0.6) events.push({ date: fmt(3), week: 3, type: "risk", title: "Motivation dip detected", detail: "Portal sessions down 40% week-over-week" });
  if (p.weeksOnProgram >= 4 && p.pps < 0.6) events.push({ date: fmt(4), week: 4, type: "intervention", title: "Coach intervention", detail: "Plateau script #4 · shared Maria R. peer reference" });
  if (p.weeksOnProgram >= 5) events.push({ date: fmt(5), week: 5, type: "win", title: "Recovery", detail: `Re-engagement confirmed · loss now ${(p.pctBwLoss * 0.6).toFixed(1)}%` });
  if (p.weeksOnProgram >= 8) events.push({ date: fmt(8), week: 8, type: "milestone", title: "Dose escalation cleared", detail: "GI tolerance acceptable · clinician approved next dose" });
  if (p.weeksOnProgram >= 12) events.push({ date: fmt(12), week: 12, type: "win", title: "12-week milestone", detail: `Down ${(p.pctBwLoss * 0.85).toFixed(1)}% · HbA1c trend improving` });
  events.push({ date: fmt(p.weeksOnProgram), week: p.weeksOnProgram, type: p.pctBwLoss > 6 ? "win" : "milestone", title: "Current progress", detail: `${p.pctBwLoss.toFixed(1)}% loss · adherence ${(p.pdc * 100).toFixed(0)}% · PPS ${(p.pps * 100).toFixed(0)}%` });
  return events;
}

// ---------- motivation trend (sentiment-style line) ----------
export function motivationTrend(p: Patient): { week: number; motivation: number; band: string }[] {
  // Synthesize a plausible trajectory based on PPS + status
  const out: { week: number; motivation: number; band: string }[] = [];
  for (let w = 0; w <= Math.max(p.weeksOnProgram, 12); w += 1) {
    let m = 80; // start high
    if (w >= 3 && w <= 6) m -= (1 - p.pps) * 50;            // dip
    if (w >= 7) m += (p.pps - 0.5) * 30;                      // recovery
    m = Math.max(15, Math.min(95, m + Math.sin(w * 0.7) * 5));
    const band = m >= 70 ? "High" : m >= 50 ? "Stable" : m >= 30 ? "Declining" : "At-risk";
    out.push({ week: w, motivation: Math.round(m), band });
  }
  return out;
}

// ---------- AI suggested actions per participant ----------
export interface SuggestedAction {
  id: string;
  intent: "motivational reference" | "accountability call" | "meal-plan change" | "peer-group" | "specialist escalation" | "communication";
  text: string;
  predictedLift: string;
  urgency: "now" | "today" | "this week";
}

export function suggestedActions(p: Patient): SuggestedAction[] {
  const out: SuggestedAction[] = [];
  if (p.pps < 0.55 && p.weeksOnProgram >= 4) {
    out.push({
      id: "a1", intent: "motivational reference",
      text: `Show 3 look-alike success stories matched to ${BUCKET_LABELS[p.bucket]}`,
      predictedLift: "+18 pp 2-week retention",
      urgency: "today",
    });
  }
  if (p.coachInteractions90d < 3 && p.status === "Active") {
    out.push({
      id: "a2", intent: "accountability call",
      text: "Book a 10-minute video check-in within 48 hours",
      predictedLift: "+12 pp 4-week retention",
      urgency: "this week",
    });
  }
  if (p.weeksOnProgram >= 6 && p.pctBwLoss < 4) {
    out.push({
      id: "a3", intent: "meal-plan change",
      text: "Trigger AI-generated meal-plan reset (low-effort variant)",
      predictedLift: "+0.4% incremental loss/week",
      urgency: "this week",
    });
  }
  if (p.comorbidities.some(c => ["Depression", "Anxiety"].includes(c)) && p.pps < 0.5) {
    out.push({
      id: "a4", intent: "specialist escalation",
      text: "Escalate to behavioral specialist (warm handoff via app)",
      predictedLift: "+22 pp emotional-cohort retention",
      urgency: "now",
    });
  }
  if (p.bucket === "PreDM_active") {
    out.push({
      id: "a5", intent: "peer-group",
      text: "Add to Prediabetic Prevention peer cohort (weekly group)",
      predictedLift: "+9 pp 12-week persistence",
      urgency: "this week",
    });
  }
  if (out.length === 0) {
    out.push({
      id: "a0", intent: "communication",
      text: "Send routine progress nudge with this week's loss + win",
      predictedLift: "Maintain current trajectory",
      urgency: "this week",
    });
  }
  return out;
}

// ---------- communication intelligence ----------
export interface CommSuggestion {
  channel: "SMS" | "WhatsApp" | "Email" | "App nudge";
  tone: "supportive" | "motivational" | "celebratory" | "informational";
  bestSendTime: string;
  message: string;
}

export function commSuggestions(p: Patient): CommSuggestion[] {
  const bucket = BUCKET_LABELS[p.bucket] ?? "your cohort";
  return [
    {
      channel: "SMS", tone: "supportive", bestSendTime: "Today 18:00 local",
      message: `Hi ${p.name.split(" ")[0]} — thinking about week ${p.weeksOnProgram}. Participants in ${bucket} typically restart progress within 3 weeks after small adjustments. Want to hop on a quick call?`,
    },
    {
      channel: "WhatsApp", tone: "motivational", bestSendTime: "Tomorrow 09:00 local",
      message: `Quick win to share: members like you who pushed through this week ended up with an avg loss of 11.2% by month 6. You're closer than it feels.`,
    },
    {
      channel: "Email", tone: "informational", bestSendTime: "Friday 10:00 local",
      message: `Your weekly summary: ${p.pctBwLoss.toFixed(1)}% loss to date · adherence ${(p.pdc * 100).toFixed(0)}%. One adjustment we'd suggest this week — see inside.`,
    },
  ];
}

// ---------- cohort comparison ----------
export interface CohortRow {
  cohort: string;
  bucket: string;
  participants: number;
  successRate: number;        // % reaching ≥7% loss
  avgLossKg: number;
  retention12w: number;
}

export function cohortComparison(coachId: string): CohortRow[] {
  const buckets = Array.from(new Set(participantsOf(coachId).map(p => p.bucket)));
  return buckets.map(b => {
    const pts = participantsOf(coachId).filter(p => p.bucket === b);
    const success = pts.filter(p => p.pctBwLoss >= 7).length;
    const retained = pts.filter(p => p.weeksOnProgram >= 12 && p.status !== "Discontinued").length;
    const avgLossKg = pts.length ? (pts.reduce((a, p) => a + (p.baselineWeightLb - p.currentWeightLb), 0) / pts.length) * 0.453592 : 0;
    return {
      cohort: BUCKET_LABELS[b] ?? b,
      bucket: b,
      participants: pts.length,
      successRate: pts.length ? success / pts.length : 0,
      avgLossKg,
      retention12w: pts.length ? retained / pts.length : 0,
    };
  }).sort((a, b) => b.participants - a.participants);
}

// ---------- AI session summary ----------
export interface SessionSummary {
  participantId: string;
  date: string;
  duration: string;
  mood: "positive" | "neutral" | "frustrated" | "ambivalent";
  blockers: string[];
  nextActions: string[];
  riskFlags: string[];
}

export function sessionSummary(p: Patient): SessionSummary {
  // ===== Demo override: Sandy R. (P100967) — GLP-1 side-effect storyline =====
  // The session summary on the demo hero is hand-curated so the AI-generated
  // surface lines up with the rest of her demo arc (side effects, declining
  // engagement, dose-reduction escalation).
  if (p.id === "P100967") {
    const date = new Date();
    return {
      participantId: p.id,
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      duration: "23 min",
      mood: "frustrated",
      blockers: [
        "Increasing side-effect burden",
        "Declining engagement and tracking",
        "Risk of treatment discontinuation",
      ],
      nextActions: [
        "Coach outreach within 24 hours",
        "Review symptoms and adherence barriers",
        "Escalate to physician for dose adjustment evaluation",
      ],
      riskFlags: [
        "Tracking frequency down 42%",
        "Side-effect mentions up 28%",
        "Momentum declining for 3 consecutive weeks",
      ],
    };
  }

  const mood: SessionSummary["mood"] = p.pps >= 0.7 ? "positive"
    : p.pps >= 0.5 ? "neutral"
    : p.pps >= 0.35 ? "ambivalent" : "frustrated";

  const blockers: string[] = [];
  if (p.pdc < 0.65) blockers.push("Refill friction (last fill skipped)");
  if (p.coachInteractions90d < 3) blockers.push("Limited coach availability between sessions");
  if (p.pps < 0.55 && p.weeksOnProgram >= 4) blockers.push("Plateau frustration");
  if (p.comorbidities.includes("Depression")) blockers.push("Mood-driven eating pattern");
  if (blockers.length === 0) blockers.push("None reported this session");

  const nextActions: string[] = [];
  nextActions.push(`Send week-${p.weeksOnProgram + 1} micro-habit (5-min walk after dinner)`);
  if (p.pps < 0.6) nextActions.push("Share 2 look-alike references in next 24 hours");
  if (p.pdc < 0.7) nextActions.push("Pharmacy refill check-in via SMS");
  nextActions.push(`Book follow-up for week ${p.weeksOnProgram + 2}`);

  const riskFlags: string[] = [];
  if (p.hba1c >= 8) riskFlags.push("HbA1c ≥ 8 — clinician notify");
  if (p.pps < 0.4) riskFlags.push("Dropout risk: high");
  if (p.systolicBP >= 160) riskFlags.push("BP elevated — escalate to clinician");

  const date = new Date();
  return {
    participantId: p.id,
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    duration: "23 min",
    mood, blockers, nextActions, riskFlags,
  };
}

// ---------- coach leaderboard ----------
export function leaderboard(): (Coach & { rank: number })[] {
  return COACHES
    .slice()
    .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

// ---------- coach overall KPIs ----------
export function coachKpis(coachId: string) {
  const coach = COACHES.find(c => c.id === coachId)!;
  const pts = participantsOf(coachId);
  const active = pts.filter(p => ["Active", "Persistent", "Completed"].includes(p.status));
  const queue = priorityQueue(coachId, 500);
  const highRisk = queue.filter(q => q.riskBand === "High" || q.riskBand === "Critical").length;
  const dropoutRisk = queue.filter(q => q.signals.includes("Dropout") && (q.riskBand === "High" || q.riskBand === "Critical")).length;

  const onProgram = pts.filter(p => p.weeksOnProgram > 4);
  const avgLossKg = onProgram.length ? (onProgram.reduce((a, p) => a + (p.baselineWeightLb - p.currentWeightLb), 0) / onProgram.length) * 0.453592 : 0;
  const completed = pts.filter(p => p.status === "Completed").length;
  const completionRate = pts.length ? completed / pts.length : 0;

  // HbA1c improvement (averaged synthetic delta)
  const hba1cImprovement = onProgram.length
    ? onProgram.reduce((a, p) => a + Math.max(0, (p.hba1c - 5.6)) * 0.55, 0) / onProgram.length / 10
    : 0;

  return {
    coach,
    activeParticipants: active.length,
    highRisk,
    dropoutRisk,
    avgLossKg,
    retentionRate: coach.retentionRate,
    completionRate,
    hba1cImprovement,
    effectivenessScore: coach.effectivenessScore,
  };
}

// ---------- behavioral cohort segments (for Smart Segmentation) ----------
export const BEHAVIORAL_SEGMENTS = [
  { key: "high_risk_clinical", label: "High clinical risk",      filter: (p: Patient) => p.hba1c >= 8 || p.systolicBP >= 160 },
  { key: "low_adherence",      label: "Low adherence (PDC<60%)", filter: (p: Patient) => p.pdc < 0.6 && p.status === "Active" },
  { key: "plateau",            label: "Week-6 plateau",          filter: (p: Patient) => p.weeksOnProgram >= 6 && p.pctBwLoss < 4 && p.status === "Active" },
  { key: "low_motivation",     label: "Low motivation (PPS<0.5)", filter: (p: Patient) => p.pps < 0.5 && p.status === "Active" },
  { key: "emotional",          label: "Emotional eating cohort", filter: (p: Patient) => p.comorbidities.some(c => ["Depression", "Anxiety"].includes(c)) },
  { key: "improving",          label: "Strong progress (≥6%)",   filter: (p: Patient) => p.pctBwLoss >= 6 },
  { key: "onboarding",         label: "Onboarding (week 0–2)",   filter: (p: Patient) => p.weeksOnProgram <= 2 && p.weeksOnProgram > 0 },
  { key: "maintenance",        label: "Maintenance (week 24+)",  filter: (p: Patient) => p.weeksOnProgram >= 24 },
];

export function segmentCount(coachId: string, key: string): number {
  const seg = BEHAVIORAL_SEGMENTS.find(s => s.key === key);
  if (!seg) return 0;
  return participantsOf(coachId).filter(seg.filter).length;
}

// ---------- retention trend (rolling 12 weeks) ----------
export function retentionTrend(coachId: string) {
  // Synthesize 12-week trend tied to coach effectiveness
  const eff = COACHES.find(c => c.id === coachId)!.retentionRate;
  return Array.from({ length: 12 }, (_, i) => {
    const w = i + 1;
    const baseline = 0.92 - i * 0.012 + Math.sin(i / 2) * 0.01;
    const platform = Math.min(0.98, eff - i * 0.005 + Math.sin(i / 3) * 0.008);
    return {
      week: `W${w}`,
      "Your cohort": Number(platform.toFixed(3)),
      "Industry baseline": Number(Math.max(0.5, baseline).toFixed(3)),
    };
  });
}


// ===========================================================================
// Daily Recap — Coach's end-of-day AI-synthesized debrief
// ===========================================================================
//
// One-page summary the coach opens at the end of their shift. Designed to answer
// three questions in order: what did I get done today, what worked, and where
// do I start tomorrow. The narrative paragraph is the centerpiece — it reads
// like a thoughtful peer summary, not a metrics list — and weaves in concrete
// names (notably Sandy R. for the demo storyline).

export interface RecapTimelineEvent {
  time: string;              // e.g. "9:42 AM"
  type: "escalation" | "session" | "outreach" | "response" | "milestone";
  title: string;
  detail: string;
  memberId?: string;
  memberName?: string;
}

export interface RecapWin {
  title: string;
  detail: string;
}

export interface RecapTomorrowItem {
  rank: number;
  patient: Patient;
  rationale: string;
  plannedAction: string;
}

export interface RecapMoodSlice {
  mood: "positive" | "neutral" | "ambivalent" | "frustrated";
  count: number;
}

export interface DailyRecap {
  date: string;
  coach: Coach;
  narrative: string;
  stats: {
    membersReached: number;
    sessionsCompleted: number;
    criticalEscalations: number;
    tomorrowPriorities: number;
  };
  timeline: RecapTimelineEvent[];
  wins: RecapWin[];
  tomorrow: RecapTomorrowItem[];
  moodSnapshot: RecapMoodSlice[];
}

export function dailyRecap(coachId: string): DailyRecap {
  const coach = COACHES.find(c => c.id === coachId)!;
  const roster = participantsOf(coachId);
  const queue = priorityQueue(coachId, 50);

  // Pick the demo storyline anchor — Sandy R. if she's on this coach's roster,
  // else the top-of-queue critical patient.
  const sandy = roster.find(p => p.id === "P100967");
  const anchor = sandy ?? queue[0]?.patient ?? roster[0];

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  // ---------- narrative (AI debrief paragraph) ----------
  // Hand-curated for the demo so the narrative stays consistent with the wins,
  // timeline, and tomorrow-focus list. Avoid dynamic counts here — drift would
  // make the page contradict itself.
  const narrative = anchor && anchor.id === "P100967"
    ? `Today you reached 14 members across an average of 23 minutes per session. The headline of your day was ${anchor.name} — you escalated her to her physician for dose adjustment after three weeks of nausea-related adherence drift. Three members hit their week-4 weight-loss milestone, and your inbox is clear for the first time this week. Tomorrow opens with Sandy's physician callback and three members flagged for emotional-eating signals over the weekend.`
    : `Today you reached 14 members across an average of 23 minutes per session. The headline of your day was ${anchor?.name ?? "your priority caseload"} — escalated for clinical review. Three members hit their week-4 milestone today, and your inbox is clear. Tomorrow opens with the physician callback and the weekend-flagged emotional-eating signals.`;

  // ---------- timeline (chronological day) ----------
  const timeline: RecapTimelineEvent[] = [
    { time: "8:12 AM", type: "outreach",    title: "Morning batch nudges sent",        detail: "12 members received check-in reminders before their breakfast window" },
    { time: "9:42 AM", type: "session",     title: `Live session — ${anchor?.name ?? "member"}`, detail: "23-minute call. Surfaced increasing side-effect burden and declining engagement.", memberId: anchor?.id, memberName: anchor?.name },
    { time: "10:15 AM", type: "escalation", title: "Physician escalation submitted",   detail: "Dose-adjustment review requested. Auto-routed to clinical team. ETA 24h.", memberId: anchor?.id, memberName: anchor?.name },
    { time: "11:30 AM", type: "session",    title: "Plateau coaching call",            detail: "Walked through plateau script #4. Member committed to evening walk routine." },
    { time: "12:45 PM", type: "response",   title: "5 SMS replies received",           detail: "All inbound from morning nudges. 3 confirming intent, 2 asking about refills." },
    { time: "1:20 PM", type: "milestone",   title: "Milestone unlocked",               detail: "3 members crossed week-4 with >6% body-weight loss. Auto-celebrate sent." },
    { time: "2:50 PM", type: "session",     title: "Group cohort huddle",              detail: "8-member emotional-eating cohort. Renee W. led. High engagement." },
    { time: "4:10 PM", type: "outreach",    title: "Afternoon refill reminders",       detail: "7 members flagged for pharmacy follow-up. Action queued for 9am tomorrow." },
    { time: "5:05 PM", type: "milestone",   title: "Day wrap — recap generated",       detail: "AI-synthesized this debrief. Reviewed and ready to file." },
  ];

  // ---------- wins ----------
  const wins: RecapWin[] = [
    { title: "3 members hit week-4 weight-loss milestone", detail: ">6% body-weight loss confirmed across the cohort" },
    { title: "Inbox cleared",                              detail: "All inbound messages from yesterday closed out before 3pm" },
    { title: "Cohort huddle re-engaged 8 members",         detail: "Emotional-eating cohort attendance up 40% vs. last week" },
    { title: "1 member moved Critical → Watch",            detail: "After two weeks of intervention, signals dropped below threshold" },
  ];

  // ---------- tomorrow's focus ----------
  // Always lead with Sandy if she's on the roster; then top of queue by riskScore.
  const tomorrow: RecapTomorrowItem[] = [];
  if (sandy) {
    tomorrow.push({
      rank: 1,
      patient: sandy,
      rationale: "Physician callback expected on dose-reduction review",
      plannedAction: "Confirm dose change + walk through new injection-day routine",
    });
  }
  const others = queue
    .filter(q => q.patient.id !== "P100967")
    .slice(0, sandy ? 3 : 4);
  others.forEach((q, i) => {
    tomorrow.push({
      rank: (sandy ? 1 : 0) + i + 1,
      patient: q.patient,
      rationale: q.topReason,
      plannedAction: q.recommendedAction,
    });
  });

  // ---------- caseload mood snapshot ----------
  // Approximate mood distribution across the caseload using PPS thresholds —
  // mirrors the logic in sessionSummary() so the daily picture is consistent.
  const moodCounts = { positive: 0, neutral: 0, ambivalent: 0, frustrated: 0 };
  roster.forEach(p => {
    if (p.pps >= 0.7)       moodCounts.positive    += 1;
    else if (p.pps >= 0.5)  moodCounts.neutral     += 1;
    else if (p.pps >= 0.35) moodCounts.ambivalent  += 1;
    else                    moodCounts.frustrated  += 1;
  });
  const moodSnapshot: RecapMoodSlice[] = (["positive", "neutral", "ambivalent", "frustrated"] as const)
    .map(m => ({ mood: m, count: moodCounts[m] }));

  return {
    date: dateLabel,
    coach,
    narrative,
    stats: {
      membersReached:       14,
      sessionsCompleted:    3,
      criticalEscalations:  1,
      tomorrowPriorities:   tomorrow.length,
    },
    timeline,
    wins,
    tomorrow,
    moodSnapshot,
  };
}
