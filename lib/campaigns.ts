/**
 * GLP-1 Eligibility Campaign Clustering.
 *
 * Seven canonical campaign clusters (with one "Unsegmented" catch-all),
 * deterministic assignment for every patient in the simulated dataset, and
 * AI-suggested per-cluster channel, timing, conversion/retention probability,
 * and multichannel campaign content (SMS / WhatsApp / Email / Coach script /
 * Member nudge).
 *
 * Pure data — no React. Consumed by pages/campaigns.tsx.
 */

import { PATIENTS, Patient, BUCKET_LABELS } from "./patientData";

// ---------- canonical clusters ----------
export type ClusterKey =
  | "HIGH_CLINICAL_RISK"
  | "WEIGHT_LOSS_MOTIVATION"
  | "PLATEAU_FAILED"
  | "BUSY_PROFESSIONAL"
  | "EMOTIONAL_EATING"
  | "INSURANCE_OPTIMIZED"
  | "EARLY_PREDIABETIC"
  | "UNSEGMENTED";

export interface ClusterDef {
  key: ClusterKey;
  name: string;
  theme: string;
  characteristics: string[];
  messaging: string[];
  cta: string;
  channels: { primary: string; secondary: string[] };
  bestOutreach: string;
  emotionalTrigger: "fear" | "achievement" | "confidence" | "support" | "control";
  color: string;          // tailwind-friendly hex for charts
  badge: string;          // tailwind class for badges
  importance?: "critical" | "high" | "standard";
}

export const CLUSTERS: Record<ClusterKey, ClusterDef> = {
  HIGH_CLINICAL_RISK: {
    key: "HIGH_CLINICAL_RISK",
    name: "High Clinical Risk",
    theme: "Immediate Health Improvement",
    characteristics: ["HbA1c > 8", "BMI > 35", "Hypertension", "Fatty liver", "Cardiovascular risk"],
    messaging: [
      "Reduce hospitalization risk",
      "Improve diabetes control",
      "Lower cardiovascular risk",
    ],
    cta: "Start medically guided intervention now.",
    channels: { primary: "Coach call", secondary: ["Email", "SMS"] },
    bestOutreach: "Tue–Thu · 10:00–11:30 local",
    emotionalTrigger: "fear",
    color: "#D52B1E",
    badge: "bg-lilly-red text-white",
    importance: "critical",
  },
  WEIGHT_LOSS_MOTIVATION: {
    key: "WEIGHT_LOSS_MOTIVATION",
    name: "Weight Loss Motivation",
    theme: "Transformation & Confidence",
    characteristics: ["Obesity-focused", "Non-diabetic", "Appearance-driven", "Younger demographics"],
    messaging: [
      "Sustainable weight loss",
      "Lifestyle transformation",
      "Confidence improvement",
    ],
    cta: "Start your transformation today.",
    channels: { primary: "Instagram / WhatsApp", secondary: ["SMS", "Email"] },
    bestOutreach: "Sun + Mon · 19:00–21:30 local",
    emotionalTrigger: "confidence",
    color: "#EE6055",
    badge: "bg-rose-500 text-white",
    importance: "high",
  },
  PLATEAU_FAILED: {
    key: "PLATEAU_FAILED",
    name: "Plateau / Failed Program",
    theme: "This Time Will Be Different",
    characteristics: ["Failed previous diets", "Inconsistent adherence", "Frequent drop-offs"],
    messaging: [
      "AI-guided personalization",
      "Similar participant success stories",
      "Coach-supported accountability",
    ],
    cta: "See why this time is different — meet your match.",
    channels: { primary: "Coach call", secondary: ["WhatsApp", "Email"] },
    bestOutreach: "Wed–Fri · 18:00–20:00 local",
    emotionalTrigger: "support",
    color: "#1B2A4E",
    badge: "bg-lilly-navy text-white",
    importance: "critical",
  },
  BUSY_PROFESSIONAL: {
    key: "BUSY_PROFESSIONAL",
    name: "Busy Professional",
    theme: "Programs Designed for Busy Lives",
    characteristics: ["Low activity", "Irregular meals", "Stress eating", "Low time availability"],
    messaging: [
      "Flexible coaching",
      "Micro habits that fit your day",
      "Low-effort routines",
    ],
    cta: "5 minutes a day. Real results.",
    channels: { primary: "Email", secondary: ["SMS", "WhatsApp"] },
    bestOutreach: "Tue + Thu · 07:30–08:30 + 12:30–13:30 local",
    emotionalTrigger: "control",
    color: "#0073AB",
    badge: "bg-sky-600 text-white",
    importance: "high",
  },
  EMOTIONAL_EATING: {
    key: "EMOTIONAL_EATING",
    name: "Emotional Eating",
    theme: "Support Beyond Dieting",
    characteristics: ["Stress-related eating", "Inconsistent motivation", "Emotional triggers"],
    messaging: [
      "Behavioral coaching",
      "Supportive community",
      "Sustainable habit formation",
    ],
    cta: "More than a diet — real support, every day.",
    channels: { primary: "Coach call", secondary: ["WhatsApp", "App nudge"] },
    bestOutreach: "Sun + Wed · 20:00–21:30 local",
    emotionalTrigger: "support",
    color: "#7C3AED",
    badge: "bg-violet-600 text-white",
    importance: "high",
  },
  INSURANCE_OPTIMIZED: {
    key: "INSURANCE_OPTIMIZED",
    name: "Insurance-Optimized",
    theme: "Prevent Future Health Costs",
    characteristics: ["Partially covered", "High claims risk", "Employer-sponsored wellness"],
    messaging: [
      "Lower long-term medical spend",
      "Employer-sponsored — covered for you",
      "Avoid the next preventable claim",
    ],
    cta: "Activate your covered benefit.",
    channels: { primary: "Email (employer)", secondary: ["Direct mail", "HR portal"] },
    bestOutreach: "Mon + Tue · 09:00–11:00 local",
    emotionalTrigger: "control",
    color: "#10B981",
    badge: "bg-emerald-600 text-white",
    importance: "high",
  },
  EARLY_PREDIABETIC: {
    key: "EARLY_PREDIABETIC",
    name: "Early Prediabetic",
    theme: "Prevent Diabetes Before It Starts",
    characteristics: ["Early metabolic risk", "Low symptom awareness"],
    messaging: [
      "Catch it early — most reversible window",
      "Get ahead of diabetes",
      "Proven prevention with high ROI",
    ],
    cta: "Take the 2-minute risk check.",
    channels: { primary: "SMS", secondary: ["Email", "App nudge"] },
    bestOutreach: "Mon + Wed · 17:30–19:00 local",
    emotionalTrigger: "achievement",
    color: "#F59E0B",
    badge: "bg-amber-500 text-white",
    importance: "high",
  },
  UNSEGMENTED: {
    key: "UNSEGMENTED",
    name: "Unsegmented",
    theme: "General awareness",
    characteristics: ["Did not match a primary cluster"],
    messaging: ["General platform awareness"],
    cta: "Learn more.",
    channels: { primary: "Email", secondary: [] },
    bestOutreach: "Standard hours",
    emotionalTrigger: "achievement",
    color: "#94A3B8",
    badge: "bg-slate-400 text-white",
    importance: "standard",
  },
};

// ---------- assignment ----------
export function assignCluster(p: Patient): ClusterKey {
  const hasCAD = p.comorbidities.includes("Coronary artery disease");
  const hasAF = p.comorbidities.includes("Atrial fibrillation");
  const hasHTN = p.comorbidities.includes("Hypertension");
  const hasMASLD = p.comorbidities.includes("MASLD");
  const hasDepression = p.comorbidities.includes("Depression");
  const hasAnxiety = p.comorbidities.includes("Anxiety");

  // 1. High clinical risk — most urgent
  if (
    p.hba1c >= 8 ||
    (p.bmi >= 35 && (hasHTN || hasMASLD)) ||
    hasCAD || hasAF
  ) return "HIGH_CLINICAL_RISK";

  // 2. Plateau / failed program — next most urgent for retention work
  if (
    p.status === "Discontinued" ||
    (p.status === "Active" && p.pps < 0.40 && p.weeksOnProgram >= 4)
  ) return "PLATEAU_FAILED";

  // 3. Emotional eating — depression/anxiety + obesity
  if ((hasDepression || hasAnxiety) && p.bmi >= 30) return "EMOTIONAL_EATING";

  // 4. Insurance-optimized — high claims risk + sponsored coverage
  if (
    (p.payerPosture === "Commercial PA-friendly" || p.payerPosture === "Commercial step-therapy") &&
    (p.bmi >= 32 || p.hba1c >= 6.5 || p.comorbidities.length >= 3)
  ) return "INSURANCE_OPTIMIZED";

  // 5. Early prediabetic — most preventable, high ROI
  if (p.hba1c >= 5.7 && p.hba1c < 6.5 && p.bmi >= 27) return "EARLY_PREDIABETIC";

  // 6. Weight loss motivation — younger, no diabetes, appearance-driven
  if (p.age < 42 && p.hba1c < 6.5 && p.bmi >= 27 && p.bmi < 38) return "WEIGHT_LOSS_MOTIVATION";

  // 7. Busy professional — working age, low engagement
  if (p.age >= 28 && p.age <= 55 && p.portalLogins90d < 14 && p.coachInteractions90d < 4) return "BUSY_PROFESSIONAL";

  return "UNSEGMENTED";
}

// Cache cluster on each patient (cheap, runs once)
const PATIENT_CLUSTER = new Map<string, ClusterKey>();
for (const p of PATIENTS) PATIENT_CLUSTER.set(p.id, assignCluster(p));
export const clusterOf = (p: Patient): ClusterKey => PATIENT_CLUSTER.get(p.id) ?? "UNSEGMENTED";

// ---------- aggregate stats per cluster ----------
export interface ClusterStats {
  key: ClusterKey;
  def: ClusterDef;
  population: number;
  share: number;                    // fraction of total
  enrollmentProbability: number;    // 0..1
  retentionRisk: "Low" | "Medium" | "High";
  retentionRiskScore: number;       // numeric for sorting
  expectedConversions: number;
  avgGes: number;
  avgPctLoss: number;
  topState: string;
}

function modeState(items: Patient[]): string {
  const counts = new Map<string, number>();
  for (const p of items) counts.set(p.state, (counts.get(p.state) ?? 0) + 1);
  let best = ""; let n = 0;
  for (const [s, c] of counts) if (c > n) { best = s; n = c; }
  return best || "—";
}

const ENROLL_BASE: Record<ClusterKey, number> = {
  HIGH_CLINICAL_RISK: 0.62,
  WEIGHT_LOSS_MOTIVATION: 0.71,
  PLATEAU_FAILED: 0.46,
  BUSY_PROFESSIONAL: 0.78,
  EMOTIONAL_EATING: 0.58,
  INSURANCE_OPTIMIZED: 0.74,
  EARLY_PREDIABETIC: 0.84,
  UNSEGMENTED: 0.32,
};

const RETENTION_RISK: Record<ClusterKey, { band: "Low" | "Medium" | "High"; score: number }> = {
  HIGH_CLINICAL_RISK: { band: "Medium", score: 2 },
  WEIGHT_LOSS_MOTIVATION: { band: "Medium", score: 2 },
  PLATEAU_FAILED: { band: "High", score: 3 },
  BUSY_PROFESSIONAL: { band: "Medium", score: 2 },
  EMOTIONAL_EATING: { band: "High", score: 3 },
  INSURANCE_OPTIMIZED: { band: "Low", score: 1 },
  EARLY_PREDIABETIC: { band: "Low", score: 1 },
  UNSEGMENTED: { band: "Medium", score: 2 },
};

export function clusterStats(): ClusterStats[] {
  const total = PATIENTS.length;
  return (Object.keys(CLUSTERS) as ClusterKey[]).map(k => {
    const def = CLUSTERS[k];
    const items = PATIENTS.filter(p => clusterOf(p) === k);
    const n = items.length;
    const baseProb = ENROLL_BASE[k];
    // Adjust by avg readiness in the segment
    const avgPps = n ? items.reduce((a, p) => a + p.pps, 0) / n : 0;
    const enrollmentProbability = Math.min(0.95, baseProb + (avgPps - 0.5) * 0.18);
    const avgGes = n ? items.reduce((a, p) => a + p.ges, 0) / n : 0;
    const avgPctLoss = n ? items.reduce((a, p) => a + p.pctBwLoss, 0) / n : 0;
    return {
      key: k, def,
      population: n,
      share: n / total,
      enrollmentProbability,
      retentionRisk: RETENTION_RISK[k].band,
      retentionRiskScore: RETENTION_RISK[k].score,
      expectedConversions: Math.round(n * enrollmentProbability),
      avgGes,
      avgPctLoss,
      topState: modeState(items),
    };
  }).filter(s => s.population > 0);
}

// ---------- per-cluster, multichannel AI campaign content ----------
export interface CampaignContent {
  sms: string;
  whatsapp: string;
  email: { subject: string; body: string };
  coachScript: string[];
  appNudge: string;
  objectionHandling: { objection: string; response: string }[];
}

export function generateCampaign(k: ClusterKey, similarSuccessExample?: { name: string; loss: number; weeks: number; bucket: string }): CampaignContent {
  const def = CLUSTERS[k];
  const ref = similarSuccessExample;

  switch (k) {
    case "HIGH_CLINICAL_RISK":
      return {
        sms: `Your recent labs put you at higher risk for hospitalization. A medically-guided GLP-1 program can lower that risk in 12–16 weeks. Reply YES to talk to a clinician today.`,
        whatsapp: `Hi {first_name} — your recent results show indicators we'd want to act on quickly. Our medically-guided program has helped people with similar labs reduce HbA1c by ~1.4 points in 16 weeks. Want a 10-min call this week?`,
        email: {
          subject: "An important update on your recent labs",
          body: `Hi {first_name},\n\nWe reviewed your recent labs and want to flag something important. With HbA1c, BMI, and BP at your current levels, your risk of a preventable hospitalization in the next 24 months is meaningfully elevated — and that risk is reducible.\n\nOur medically-guided GLP-1 program is designed precisely for this profile. People starting in your range typically see HbA1c drop by 1.0–1.5 points and BMI drop by 4–6 within 16 weeks, with a clinician overseeing every step.\n\nWe've reserved a 10-minute consult slot for you this week. ${def.cta}\n\nDr. M. Patel\nClinical Lead, Habitnu`,
        },
        coachScript: [
          "Open with empathy: \"I want to talk about something we noticed in your recent labs.\"",
          "Frame the risk concretely (hospitalization, cardiac event) — avoid vague language.",
          "Pivot to action: \"There's a clinician-supervised path that has worked for people in your exact range.\"",
          "Offer the smallest next step: a 10-minute call this week, no commitment.",
          "Close with a written follow-up summarizing the conversation.",
        ],
        appNudge: `Your most recent labs deserve a 10-minute conversation. Tap to book — no commitment.`,
        objectionHandling: [
          { objection: "I'll deal with it later.", response: "Every month at this risk level adds measurable cardiac and kidney load — the most reversible window is the first 16 weeks." },
          { objection: "I've heard about side effects.", response: "GI symptoms are real but transient for most. Our titration protocol is designed to minimize them, and your clinician adjusts dose live." },
        ],
      };

    case "WEIGHT_LOSS_MOTIVATION":
      return {
        sms: `Ready for a real change? Most people in your group lose 12–18% of their body weight in 6 months on our program. Tap to start: hbtnu.co/start`,
        whatsapp: `Hey {first_name}! ✨ You're not after a diet — you're after a transformation. Our program is built around sustainable change, not white-knuckle willpower. ${ref ? `${ref.name} dropped ${ref.loss.toFixed(1)}% in ${ref.weeks} weeks with us.` : "Want to see what week 1–24 actually looks like?"} `,
        email: {
          subject: "What if this time, it actually stuck?",
          body: `Hi {first_name},\n\nMost weight-loss programs ask you to grit your teeth and try harder. We do the opposite — we make the harder choices easier.\n\nIn the last 12 months, our members in your demographic averaged 14.2% body-weight loss at 26 weeks, and 78% kept it off through 12 months. The difference is the personalization: a coach who knows you, a plan that adjusts in real time, and a community of people whose story looks like yours.\n\n${def.cta}\n\nThe Habitnu team`,
        },
        coachScript: [
          "Lead with their goal in their words — not a clinical frame.",
          "Use a peer reference from the same age/BMI range — not aggregate stats.",
          "Highlight what's different: real-time personalization + community + outcomes data.",
          "Make the first week feel small and concrete: \"Day 1 you do X. That's it.\"",
        ],
        appNudge: `Your before-and-after starts now. See the 24-week timeline most people in your group followed.`,
        objectionHandling: [
          { objection: "I've tried everything.", response: "Every previous program treated you as an average. We treat you as a sample of one — which is the only thing that works long-term." },
          { objection: "Too expensive.", response: "Three things: insurance often covers more than you think, our payment plan starts at $X, and the cost-per-pound-kept-off is below most gyms." },
        ],
      };

    case "PLATEAU_FAILED":
      return {
        sms: `We know you've tried before. This is genuinely different — AI-matched coach, peer success stories from people exactly like you. 5 min to see why? hbtnu.co/different`,
        whatsapp: `Hi {first_name} — we know you've been here before. The thing that's different now isn't another diet plan; it's the AI matching you to a coach and peer references that look like *you*. ${ref ? `For example, ${ref.name} (${ref.bucket}) lost ${ref.loss.toFixed(1)}% in ${ref.weeks} weeks. Want to see what worked for them?` : "Want to see the playbook that's working for people in your situation?"}`,
        email: {
          subject: "We know you've tried before. Here's what's actually different.",
          body: `Hi {first_name},\n\nLet's be direct: most weight-loss programs fail you, not the other way around. They're built for an \"average user\" who doesn't exist.\n\nOur platform does one thing differently: it matches you to people whose story looks like yours — same age, same baseline, same prior-program history — and tells you what actually worked for them, week by week.\n\n${ref ? `${ref.name} had your exact pattern: ${ref.bucket}, prior program drop-off, plateau at week 6. Today: ${ref.loss.toFixed(1)}% loss in ${ref.weeks} weeks. Their playbook is sitting in your account, ready when you are.\n\n` : ""}One 15-minute call. We'll show you the data and you decide. ${def.cta}\n\nThe Habitnu team`,
        },
        coachScript: [
          "Open by acknowledging — \"We know this isn't your first attempt.\" Don't pretend it is.",
          "Don't promise — show. Pull up a peer reference from the same bucket who succeeded.",
          "Diagnose the prior failure together: usually a timing/coverage/coach-fit issue, not willpower.",
          "Frame this attempt as a *different system*, not a *renewed effort*.",
          "End with the smallest commit: \"Try one week. If it feels the same as before, you walk away.\"",
        ],
        appNudge: `${ref ? `${ref.name} had your exact pattern and lost ${ref.loss.toFixed(1)}%.` : "Someone exactly like you succeeded."} Want their week-by-week playbook?`,
        objectionHandling: [
          { objection: "I always quit by week 6.", response: "Week 6 is the canonical plateau — it's biology, not failure. We have a specific playbook for this week and a 24-hour coach response window." },
          { objection: "Coaches just push me.", response: "You'll choose your coach from a profile match — and you can switch any time. Our retention isn't built on pressure; it's built on fit." },
        ],
      };

    case "BUSY_PROFESSIONAL":
      return {
        sms: `5 minutes a day. Real outcomes. Designed for calendars that don't bend. Tap to see how: hbtnu.co/busy`,
        whatsapp: `Hi {first_name} — we built this for people whose calendars don't bend. 5 minutes/day, no meal-prep marathons, no unrealistic exercise blocks. Async coaching when you need it, AI-suggested micro-habits between meetings.`,
        email: {
          subject: "A program built for calendars that don't bend",
          body: `Hi {first_name},\n\nMost wellness programs are built for someone with two free hours a day. You don't have those hours, and pretending you do is why nothing has stuck.\n\nThis is different. The whole program is designed around five-minute interactions, asynchronous coaching, and AI-suggested micro-habits that fit between meetings. You'll never see a 30-minute video. You'll never log a meal manually. Your coach reads your calendar (with permission) and adjusts.\n\n${def.cta}\n\nThe Habitnu team`,
        },
        coachScript: [
          "Lead with their constraint, not their goal: \"Tell me about your calendar.\"",
          "Frame the program as time-respecting: \"You'll never spend more than 5 minutes a day in this app.\"",
          "Show async coaching: messaging > scheduling.",
          "Bundle the first 3 micro-habits — make them feel trivially easy.",
        ],
        appNudge: `2 minutes between your 11am and 12pm — your day's micro-habit is queued.`,
        objectionHandling: [
          { objection: "I don't have time.", response: "That's exactly why we built it this way — 5 min/day total, async only, no live calls unless you want them." },
          { objection: "I travel too much.", response: "Built for it — pharmacy network in 50 states, app works offline, coaching is async by default." },
        ],
      };

    case "EMOTIONAL_EATING":
      return {
        sms: `If food is more than fuel, a diet won't fix it. We pair clinical care with behavioral coaching — not willpower. Want to talk?`,
        whatsapp: `Hi {first_name} — we know diets don't address what's actually happening when you eat. We pair clinical care with behavioral coaching and a small, supportive community. No willpower theater.`,
        email: {
          subject: "When food is more than fuel",
          body: `Hi {first_name},\n\nMost programs treat eating as a math problem. For a lot of us, it isn't.\n\nIf stress, hard days, or specific emotional triggers drive how you eat, no diet plan will fix that. What works is a behavioral coach you can text at 9pm on a hard night, plus a small community of people who get it. The clinical layer (medication, labs, monitoring) sits underneath, doing its work quietly.\n\n${def.cta}\n\nThe Habitnu team`,
        },
        coachScript: [
          "Lead with non-judgment: \"Food doing more than feeding you is more common than people say.\"",
          "Don't pivot to weight too fast — establish the emotional architecture first.",
          "Introduce the behavioral coach + community as the spine; medication as supporting infrastructure.",
          "Offer evening / weekend availability explicitly.",
        ],
        appNudge: `Hard day? You can message your coach right now — they typically respond within 18 minutes.`,
        objectionHandling: [
          { objection: "I don't want therapy.", response: "It isn't therapy — it's a coach trained in behavioral patterns. You set the agenda, you control the depth." },
          { objection: "I'll feel judged.", response: "We screen and train coaches specifically for non-judgment. You can also switch coaches one-tap if it's not a fit." },
        ],
      };

    case "INSURANCE_OPTIMIZED":
      return {
        sms: `Your benefit covers a clinically-guided GLP-1 program at $0. Average member avoids ~$2,400 in next-year medical costs. Activate: hbtnu.co/benefit`,
        whatsapp: `Hi {first_name} — your employer benefit covers our clinically-guided program at $0 to you. Most members in your range avoid ~$2,400/year in downstream medical costs and save their employer ~3× that. 60-second activation.`,
        email: {
          subject: "Your employer benefit — activated in 60 seconds",
          body: `Hi {first_name},\n\nGood news: your employer's wellness benefit covers our clinically-guided GLP-1 program at $0 to you. We send the employer a privacy-protected outcome report; they save on downstream medical claims; you get a real program.\n\nThe activation is 60 seconds. The first clinical visit is within 5 business days. Average member in your demographic avoids ~$2,400/year in downstream medical costs.\n\n${def.cta}\n\nThe Habitnu team`,
        },
        coachScript: [
          "Open with the financial frame: \"Your benefit covers this completely.\"",
          "Address privacy directly: \"Your employer never sees individual data — only aggregates.\"",
          "Move quickly to activation; this segment converts on speed.",
          "Include the cost-avoidance number as a one-liner; don't over-sell it.",
        ],
        appNudge: `Your benefit is sitting unused. 60 seconds to activate.`,
        objectionHandling: [
          { objection: "Will my employer see this?", response: "No individual data. They see only aggregate, privacy-protected outcomes. Your name and labs stay private." },
          { objection: "What's the catch?", response: "There isn't one. Employers fund this because preventing one hospitalization pays for ~80 program memberships." },
        ],
      };

    case "EARLY_PREDIABETIC":
      return {
        sms: `Your last labs put you in the prediabetic range — most reversible window. 80% of people in your range avoid diabetes with our 12-week program. Start: hbtnu.co/prevent`,
        whatsapp: `Hi {first_name} — your last labs are in the prediabetic range. The good news: this is the most reversible window. ~80% of people in your range avoid diabetes entirely with a structured 12-week prevention program. Want the playbook?`,
        email: {
          subject: "Your last labs — the most reversible window",
          body: `Hi {first_name},\n\nA quick, important note. Your last HbA1c puts you in the prediabetic range. This isn't an emergency — but it is the highest-leverage window you'll ever have.\n\nNational data: ~70% of people in your range progress to Type 2 diabetes within 5 years if no intervention happens. With a structured 12-week prevention program (lifestyle + monitoring + targeted clinical support), that flips: ~80% avoid diabetes entirely.\n\nThe program is built for prevention specifically. Two minutes to start: ${def.cta}\n\nThe Habitnu team`,
        },
        coachScript: [
          "Open with calm framing — \"This is the most reversible window, not an emergency.\"",
          "Use the 70% / 80% flip statistic — it's memorable and accurate-enough.",
          "Position as a 12-week prevention program, not a permanent commitment.",
          "Smallest next step: a 2-minute risk check.",
        ],
        appNudge: `2-minute risk check. Most people who finish it start the prevention program the same week.`,
        objectionHandling: [
          { objection: "I feel fine.", response: "That's exactly why this is the right window — symptoms are the late signal, not the early one." },
          { objection: "Can't I just exercise more?", response: "Lifestyle change works — and it works much better with structure, monitoring, and a coach for 12 weeks. After that, you're on your own with much better data." },
        ],
      };

    default:
      return {
        sms: `Hi {first_name} — Habitnu can help. Tap to learn more: hbtnu.co/start`,
        whatsapp: `Hi {first_name}! Habitnu helps people improve metabolic health. Want to learn how?`,
        email: { subject: "An introduction to Habitnu", body: `Hi {first_name},\n\nHabitnu is a clinically-guided weight and metabolic health program. Want to learn more?` },
        coachScript: ["Open generally, listen for the actual cluster signal, then re-route."],
        appNudge: `Habitnu — clinically guided weight & metabolic health.`,
        objectionHandling: [],
      };
  }
}

// ---------- channel mix view (for charts) ----------
export const CHANNEL_MIX = [
  { channel: "Coach call", value: 28 },
  { channel: "WhatsApp", value: 22 },
  { channel: "Email", value: 24 },
  { channel: "SMS", value: 18 },
  { channel: "App nudge", value: 8 },
];

// ---------- granular dimensions (for the dimensions card) ----------
export const GRANULAR_DIMENSIONS: { dim: string; examples: string[] }[] = [
  { dim: "Clinical", examples: ["HbA1c", "BMI", "BP", "eGFR"] },
  { dim: "Behavioral", examples: ["Adherence (PDC)", "Meal logging", "Portal use"] },
  { dim: "Emotional", examples: ["Motivation style", "Trigger profile"] },
  { dim: "Demographic", examples: ["Age", "Gender", "Ethnicity", "Language"] },
  { dim: "Lifestyle", examples: ["Sedentary", "Travel-heavy", "Shift work"] },
  { dim: "Financial", examples: ["Affordability", "Coverage tier"] },
  { dim: "Program History", examples: ["Prior drop-offs", "Last attempt date"] },
  { dim: "Engagement", examples: ["App usage", "Coach response", "Channel preference"] },
];
