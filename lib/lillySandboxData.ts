/**
 * lillySandboxData — data for the Lilly-facing sandbox demo.
 * 4 Golden Paths + patient personas (American names) + Fathom View traces +
 * Talk-to-Nu response rules (5 response areas, patient-context-aware) +
 * step-by-step simulation timeline showing seamless flow into Lilly Health.
 */

// ============================================================================
// Types
// ============================================================================
export type ScenarioId = "side-effect" | "engagement-drift" | "weight-plateau" | "refill-friction";

export type ResponseArea = "behavior" | "treatment-experience" | "access" | "clinical" | "safety";

export interface PatientPersona {
  id: string;
  name: string;
  initials: string;
  tint: string;
  ageWeek: string;
  cohort: string;
  historyFacts: string[];
}

export interface ProposedMessage {
  title: string;
  body: string;
  primaryOption: string;
  status: "proposed" | "approved";
}

export interface FathomTrace {
  signal: string;
  noticed: string[];
  interpretation: string;
  selectedAction: string;
  messageTemplate: string;
  confidenceLabel?: string;
}

export type SimActor = "Patient" | "Fathom" | "Lilly Health" | "Nu";
export type SimScreen =
  | "lilly-home"          // Sarah's Lilly Health home tab
  | "lilly-mood-log"      // patient just logged something
  | "lilly-lock-notif"    // proposed message on lock screen
  | "lilly-message"       // in-app message thread with Talk-to-Nu button
  | "lilly-talk-to-nu"    // chat with Nu inside Lilly Health
  | "lilly-followup";     // post-action state

export interface SimStep {
  id: string;
  at: string;                          // human timestamp
  actor: SimActor;
  title: string;
  detail: string;
  screen: SimScreen;                    // what patient's phone shows
  screenData?: {                        // per-screen context
    moodValue?: number;
    messageTitle?: string;
    messageBody?: string;
    memberQuestion?: string;
    nuReply?: string;
    nuAreaLabel?: string;
    followupText?: string;
    notifCount?: number;
  };
  fathomLog?: {                         // Fathom activity to append behind the scenes
    action: string;                      // "Signal detected" / "Message dispatched" / ...
    detail: string;
    tone: "neutral" | "warn" | "primary" | "success";
  };
}

export interface LillyScenario {
  id: ScenarioId;
  short: string;
  title: string;
  purpose: string;
  patient: PatientPersona;
  demoHistory: string;
  proposedMessage: ProposedMessage;
  fathom: FathomTrace;
  suggestedNuPrompts: string[];
  color: string;
  simulation: SimStep[];
}

// ============================================================================
// Personas (American names)
// ============================================================================
const SARAH: PatientPersona = {
  id: "sarah-r",
  name: "Sarah Reeves",
  initials: "SR",
  tint: "#7C6BFF",
  ageWeek: "52 · week 13",
  cohort: "GLP-1 · 1 mg semaglutide",
  historyFacts: [
    "Nausea 4/5 reported Wed morning",
    "Food intake down 40% past 3 days",
    "1 mg dose escalation started day 22",
    "Prior weeks: TIR 87%, walk 5/7 days",
  ],
};

const SARAH_PLATEAU: PatientPersona = {
  id: "sarah-r-plateau",
  name: "Sarah Reeves",
  initials: "SR",
  tint: "#7C6BFF",
  ageWeek: "52 · week 13",
  cohort: "GLP-1 · 1 mg semaglutide",
  historyFacts: [
    "Weight flat 3 weeks at 176.4 lb",
    "8 wks of steady loss before plateau (-6.6 lb)",
    "Activity down 22% past 2 weeks",
    "Meal logging down ~50% same period",
    "Mood log: 'meh' 4 of 7 days",
  ],
};

const DIANE: PatientPersona = {
  id: "diane-w",
  name: "Diane Wright",
  initials: "DW",
  tint: "#F59E0B",
  ageWeek: "58 · week 22",
  cohort: "GLP-1 · 2 mg semaglutide",
  historyFacts: [
    "App opens down 40% week-over-week",
    "No self check-in in 8 days",
    "Meal / activity tracking down ~70%",
    "Prior weeks: fully engaged (daily check-ins)",
    "No side-effect reports; no clinical flags",
  ],
};

const ADAM: PatientPersona = {
  id: "adam-k",
  name: "Adam Kelly",
  initials: "AK",
  tint: "#0EA5A4",
  ageWeek: "44 · week 10",
  cohort: "GLP-1 · 1 mg tirzepatide",
  historyFacts: [
    "Free-text log: 'pharmacy hasn't restocked, next dose Sunday'",
    "Last dose 5 days ago (on schedule)",
    "Next scheduled dose is 2 days away",
    "Prior 9 weeks: 100% dose adherence",
    "No clinical red flags",
  ],
};

// ============================================================================
// The 4 Golden Paths
// ============================================================================
export const LILLY_SCENARIOS: LillyScenario[] = [
  // ------- Scenario 1 · Side-Effect Friction
  {
    id: "side-effect",
    short: "Side-Effect Friction",
    title: "Scenario 1 · Side-Effect Friction",
    purpose: "Show that Fathom can recognize a treatment experience that may affect engagement and prompt support.",
    patient: SARAH,
    demoHistory: "Patient reports nausea after a recent dose and has reduced food intake.",
    proposedMessage: {
      title: "Not feeling quite yourself?",
      body: "Some people experience stomach-related symptoms during treatment. There may be steps that can help.",
      primaryOption: "See tips",
      status: "proposed",
    },
    fathom: {
      signal: "Side-effect friction",
      noticed: [
        "Nausea score 4/5 reported Wed morning",
        "Food intake ~40% below baseline for 3 days",
        "Coincides with 1 mg dose-escalation week 4",
        "No clinical red-flag threshold crossed",
      ],
      interpretation: "Patient may need support before the issue affects continued engagement.",
      selectedAction: "Present a proposed Lilly-controlled support message. Escalate to coach if score ≥5 or food intake stays low for 5 days.",
      messageTemplate: "lilly.support.side_effect_gentle",
      confidenceLabel: "MEDIUM · watch-band",
    },
    suggestedNuPrompts: [
      "I have been nauseous all week.",
      "Is this normal after the dose?",
      "Should I skip my next dose?",
      "I've barely eaten anything.",
    ],
    color: "#0EA5A4",
    simulation: [
      {
        id: "se-1", at: "Wed 7:32 AM", actor: "Patient",
        title: "Sarah logs nausea 4/5 in Lilly Health",
        detail: "Sarah opens Lilly Health's mood + side-effect tile and taps the nausea intensity. She also notes she skipped breakfast.",
        screen: "lilly-mood-log",
        screenData: { moodValue: 4 },
        fathomLog: { action: "Event received", detail: "sideeffect_reported · nausea=4 · coincident=breakfast_skipped", tone: "neutral" },
      },
      {
        id: "se-2", at: "Wed 7:33 AM", actor: "Fathom",
        title: "Fathom cross-references the last 72 h",
        detail: "Cross-references 3-day food-intake trend + medication timeline. Recognizes the week-4 1mg escalation pattern.",
        screen: "lilly-home",
        screenData: {},
        fathomLog: { action: "Pattern matched", detail: "signal: side-effect friction · cohort: 1mg wk-4 flares · confidence 82%", tone: "warn" },
      },
      {
        id: "se-3", at: "Wed 7:34 AM", actor: "Fathom",
        title: "Message drafted from Lilly's approved template library",
        detail: "Template selected: lilly.support.side_effect_gentle. Copy stays inside Lilly's approved language rails.",
        screen: "lilly-home",
        fathomLog: { action: "Message drafted", detail: "template: lilly.support.side_effect_gentle · status: PROPOSED", tone: "primary" },
      },
      {
        id: "se-4", at: "Wed 9:41 AM", actor: "Lilly Health",
        title: "Proposed message appears in Sarah's Lilly Health app",
        detail: "Sent at Sarah's typical open window. Lands as a native Lilly Health notification — Sarah doesn't leave the app.",
        screen: "lilly-lock-notif",
        screenData: {
          messageTitle: "Not feeling quite yourself?",
          messageBody: "Some people experience stomach-related symptoms during treatment. There may be steps that can help.",
        },
        fathomLog: { action: "Delivered", detail: "surface: lilly_health · lock-screen notification · sent 9:41 AM", tone: "success" },
      },
      {
        id: "se-5", at: "Wed 9:43 AM", actor: "Patient",
        title: "Sarah taps in · reads the proposed message inside Lilly Health",
        detail: "The message thread opens in the same Lilly Health chrome she's used to. Two options: See tips · Talk to Nu.",
        screen: "lilly-message",
        screenData: {
          messageTitle: "Not feeling quite yourself?",
          messageBody: "Some people experience stomach-related symptoms during treatment. There may be steps that can help.",
        },
        fathomLog: { action: "Opened", detail: "member engaged within 2 min · positive signal", tone: "success" },
      },
      {
        id: "se-6", at: "Wed 9:44 AM", actor: "Nu",
        title: "Sarah taps Talk to Nu · asks a free-form question",
        detail: "Talk to Nu opens in-app. Nu recognizes Sarah's history and answers within the TREATMENT-EXPERIENCE response area.",
        screen: "lilly-talk-to-nu",
        screenData: {
          memberQuestion: "I have been nauseous all week.",
          nuReply: "I can see your nausea score has been running 4/5 for a few days now, and it's tracking with week 4 of your 1 mg step — a pattern many people go through. Small tactics that help most: ginger tea, small protein snacks, hydration first thing. If it hits 5 or lasts a few more days, let's involve your doctor.",
          nuAreaLabel: "Treatment experience",
        },
        fathomLog: { action: "Talk-to-Nu turn", detail: "area: treatment-experience · cited: nausea history + 1mg timeline", tone: "primary" },
      },
      {
        id: "se-7", at: "Wed 9:47 AM", actor: "Fathom",
        title: "Response logged · escalation threshold monitored",
        detail: "Sarah accepted the toolkit. Fathom arms a re-check for tomorrow — if nausea ≥5 or food intake stays low, coach escalation fires automatically.",
        screen: "lilly-followup",
        screenData: { followupText: "Toolkit sent · re-check tomorrow · coach escalation armed at nausea ≥5 threshold" },
        fathomLog: { action: "Loop closed", detail: "action=toolkit_accepted · recheck armed 24h · escalation trigger: nausea≥5", tone: "success" },
      },
    ],
  },

  // ------- Scenario 2 · Engagement Drift
  {
    id: "engagement-drift",
    short: "Engagement Drift",
    title: "Scenario 2 · Engagement Drift",
    purpose: "Demonstrate that Fathom can recognize a pattern across several behaviors rather than wait for a patient to disappear.",
    patient: DIANE,
    demoHistory: "Fewer check-ins, less tracking, and lower app activity over time.",
    proposedMessage: {
      title: "How are things going?",
      body: "It has been a little while since your last check-in. A quick check-in can help us understand how things are going.",
      primaryOption: "Check in",
      status: "proposed",
    },
    fathom: {
      signal: "Engagement is declining",
      noticed: [
        "App-open frequency down 40% week-over-week",
        "No self check-in for 8 consecutive days",
        "Meal + activity tracking down ~70%",
        "No side-effect reports; no clinical flags",
      ],
      interpretation: "Early re-engagement may be appropriate — pattern-cluster of engagement decay, not any single alarm.",
      selectedAction: "Prompt a simple check-in in Lilly Health. If no response in 72 h, alert coach for warm outreach.",
      messageTemplate: "lilly.engagement.gentle_checkin",
      confidenceLabel: "LOW-MEDIUM · behavioral",
    },
    suggestedNuPrompts: [
      "I've been really busy lately.",
      "Why does this app matter?",
      "I'm doing fine, I just haven't logged.",
      "I'm thinking about stopping the program.",
    ],
    color: "#F59E0B",
    simulation: [
      {
        id: "ed-1", at: "Day 1 → 8", actor: "Patient",
        title: "Diane's engagement quietly slides",
        detail: "8 days of missed check-ins. App opens down 40% w/w. No single alarm — just a cluster.",
        screen: "lilly-home",
        screenData: { notifCount: 0 },
        fathomLog: { action: "Rolling metrics", detail: "app_opens_wow: -40% · checkins_streak_broken: 8d · meal_log: -70%", tone: "warn" },
      },
      {
        id: "ed-2", at: "Day 8 · 10:00 AM", actor: "Fathom",
        title: "Pattern cluster crosses detection threshold",
        detail: "Three signals correlated. No individual metric would fire; the cluster does. Below coach-escalation threshold — try a gentle nudge first.",
        screen: "lilly-home",
        fathomLog: { action: "Cluster detected", detail: "signal: engagement decline · 3 metrics · confidence 71%", tone: "warn" },
      },
      {
        id: "ed-3", at: "Day 8 · 10:02 AM", actor: "Fathom",
        title: "Non-invasive re-engagement path selected",
        detail: "Template: lilly.engagement.gentle_checkin. Warm, question-not-directive. No pressure.",
        screen: "lilly-home",
        fathomLog: { action: "Message drafted", detail: "template: lilly.engagement.gentle_checkin · tone: warm · length: short", tone: "primary" },
      },
      {
        id: "ed-4", at: "Day 8 · 6:15 PM", actor: "Lilly Health",
        title: "Proposed message lands in Diane's Lilly Health",
        detail: "Sent at her evening open window. In-app card, not a push interruption.",
        screen: "lilly-lock-notif",
        screenData: {
          messageTitle: "How are things going?",
          messageBody: "It has been a little while since your last check-in. A quick check-in can help us understand how things are going.",
        },
        fathomLog: { action: "Delivered", detail: "surface: lilly_health · in-app · evening window", tone: "success" },
      },
      {
        id: "ed-5", at: "Day 8 · 8:32 PM", actor: "Patient",
        title: "Diane opens · types back a free-form reply",
        detail: "Instead of the check-in flow, she chooses Talk to Nu. Nu meets her where she is.",
        screen: "lilly-talk-to-nu",
        screenData: {
          memberQuestion: "I've been really busy lately.",
          nuReply: "I hear that. Real life gets in the way, and the app is here to serve you, not the other way around. Even a 20-second check-in when you can helps me stay useful to you. What's a moment in your day when it wouldn't feel like a chore?",
          nuAreaLabel: "Behavior & habits",
        },
        fathomLog: { action: "Talk-to-Nu turn", detail: "area: behavior · autonomy-supportive framing · re-engaged", tone: "primary" },
      },
      {
        id: "ed-6", at: "Day 8 · 8:35 PM", actor: "Fathom",
        title: "Re-engagement logged · coach path stood down",
        detail: "Diane completed a light check-in inline. Coach escalation not needed. If engagement doesn't rebound in 5 days, gentle follow-up.",
        screen: "lilly-followup",
        screenData: { followupText: "Check-in captured · coach escalation stood down · re-monitor in 5 days" },
        fathomLog: { action: "Loop closed", detail: "outcome: re-engaged · coach path: not required · monitor: 5d", tone: "success" },
      },
    ],
  },

  // ------- Scenario 3 · Weight Plateau
  {
    id: "weight-plateau",
    short: "Weight Plateau",
    title: "Scenario 3 · Weight Plateau",
    purpose: "Show how Fathom can use a trend over time and combine it with other signals.",
    patient: SARAH_PLATEAU,
    demoHistory: "Weight has been relatively flat for several weeks. Activity and meal tracking have also declined.",
    proposedMessage: {
      title: "Your progress has leveled off recently.",
      body: "Plateaus can happen during a weight-management journey. Would you like some help thinking through what may have changed?",
      primaryOption: "Explore next steps",
      status: "proposed",
    },
    fathom: {
      signal: "Plateau plus behavioral change",
      noticed: [
        "Weight flat 3 weeks (176.4 lb, no movement > 0.3 lb)",
        "Prior arc: -6.6 lb across 8 weeks of steady loss",
        "Activity down 22% past 2 weeks",
        "Meal logging down ~50% same period",
        "Mood log 'meh' 4 of 7 days",
      ],
      interpretation: "Explore what may have changed. Plateau may be physiological OR behavior-driven; combined signals suggest a behavioral component is contributing.",
      selectedAction: "Invite the patient to explore possible next steps. Message is exploratory, not prescriptive.",
      messageTemplate: "lilly.plateau.reflective_prompt",
      confidenceLabel: "MEDIUM · combined signal",
    },
    suggestedNuPrompts: [
      "Why has my weight stopped going down?",
      "Am I doing something wrong?",
      "Should I eat less?",
      "I feel like I've plateaued forever.",
    ],
    color: "#7C3AED",
    simulation: [
      {
        id: "wp-1", at: "Mon 7:00 AM", actor: "Patient",
        title: "Sarah steps on the scale · same number",
        detail: "3rd Monday in a row. Sarah logs 176.4 lb. Her mood-log entry is 'meh' — her 4th 'meh' day this week.",
        screen: "lilly-mood-log",
        screenData: { moodValue: 3 },
        fathomLog: { action: "Event received", detail: "weight_logged: 176.4 lb · mood: meh · 3rd flat weigh-in", tone: "neutral" },
      },
      {
        id: "wp-2", at: "Mon 7:05 AM", actor: "Fathom",
        title: "Trend + behavioral drift together cross threshold",
        detail: "Flat weight alone is not enough. Combined with activity -22% + meal-log -50% + mood shift, the picture is different.",
        screen: "lilly-home",
        fathomLog: { action: "Combined signal", detail: "plateau + behavior · cohort: wk-13 plateau + behavior drift · confidence 78%", tone: "warn" },
      },
      {
        id: "wp-3", at: "Mon 7:06 AM", actor: "Fathom",
        title: "Reflective template chosen · not corrective",
        detail: "Tone family: exploratory. Do not prescribe. Do not blame. Open a door for the patient to reflect.",
        screen: "lilly-home",
        fathomLog: { action: "Template selected", detail: "lilly.plateau.reflective_prompt · autonomy-supportive · non-prescriptive", tone: "primary" },
      },
      {
        id: "wp-4", at: "Mon 7:08 AM", actor: "Lilly Health",
        title: "Proposed message shows up in Sarah's Lilly Health",
        detail: "3 minutes after weigh-in — enough to matter, not so fast it feels creepy.",
        screen: "lilly-lock-notif",
        screenData: {
          messageTitle: "Your progress has leveled off recently.",
          messageBody: "Plateaus can happen during a weight-management journey. Would you like some help thinking through what may have changed?",
        },
        fathomLog: { action: "Delivered", detail: "surface: lilly_health · in-app · post-weigh window", tone: "success" },
      },
      {
        id: "wp-5", at: "Mon 7:10 AM", actor: "Patient",
        title: "Sarah reads the message · taps Talk to Nu",
        detail: "She asks the question every plateau member wants to ask.",
        screen: "lilly-talk-to-nu",
        screenData: {
          memberQuestion: "Why has my weight stopped going down?",
          nuReply: "Your weight has been flat about 3 weeks — that's not unusual around week 13. I'm also seeing your activity down about 22% and meal logging down about 50%. The scale often follows the behaviors first. What's felt different for you in the last few weeks?",
          nuAreaLabel: "Behavior & habits",
        },
        fathomLog: { action: "Talk-to-Nu turn", detail: "area: behavior · cited: weight+activity+meal-log · reflected, did not prescribe", tone: "primary" },
      },
      {
        id: "wp-6", at: "Mon 7:14 AM", actor: "Fathom",
        title: "Sarah owns the next step",
        detail: "She names her own change: 'Getting back to the walks.' Fathom logs the self-commitment and arms a re-check next Monday.",
        screen: "lilly-followup",
        screenData: { followupText: "Self-committed: 'Getting back to the walks' · re-check next Mon · no coach page yet" },
        fathomLog: { action: "Loop closed", detail: "outcome: self-committed action · monitor 7d · coach path: standby", tone: "success" },
      },
    ],
  },

  // ------- Scenario 4 · Refill Friction
  {
    id: "refill-friction",
    short: "Refill Friction",
    title: "Scenario 4 · Medication or Refill Friction",
    purpose: "Show that Fathom can recognize a practical barrier and route the patient toward an approved support pathway.",
    patient: ADAM,
    demoHistory: "Patient indicates that the next dose may be missed because the medication is not available or there is a refill problem.",
    proposedMessage: {
      title: "Having trouble with your medication?",
      body: "If you are having difficulty getting your medication or have questions about your prescription, support may be available.",
      primaryOption: "View support options",
      status: "proposed",
    },
    fathom: {
      signal: "Access or refill friction",
      noticed: [
        "Free-text log matched pattern: 'pharmacy hasn't restocked'",
        "Next scheduled dose in 48 hours",
        "9 weeks of prior 100% dose adherence — behavioral gap is unlikely cause",
        "No clinical red flags",
      ],
      interpretation: "Possible interruption in treatment. Not a behavioral or side-effect issue — logistical.",
      selectedAction: "Direct the patient to Lilly-approved support resources (prescription-assistance line + pharmacy locator).",
      messageTemplate: "lilly.access.refill_support_route",
      confidenceLabel: "HIGH · logistical",
    },
    suggestedNuPrompts: [
      "I cannot get my prescription.",
      "My pharmacy is out.",
      "Can I skip a dose?",
      "Who do I call about a refill?",
    ],
    color: "#E11D48",
    simulation: [
      {
        id: "rf-1", at: "Fri 3:12 PM", actor: "Patient",
        title: "Adam types a note in the Lilly Health journal",
        detail: "Free-text entry: 'pharmacy hasn't restocked, next dose Sunday' — flagged for a keyword scan.",
        screen: "lilly-mood-log",
        screenData: { moodValue: 2 },
        fathomLog: { action: "Event received", detail: "journal_entry · keyword-match: pharmacy + restock + next dose", tone: "warn" },
      },
      {
        id: "rf-2", at: "Fri 3:13 PM", actor: "Fathom",
        title: "Classified: logistical, not behavioral",
        detail: "9 weeks of 100% dose adherence rules out behavioral gap. Language pattern maps to access-friction template family.",
        screen: "lilly-home",
        fathomLog: { action: "Classified", detail: "signal: access/refill friction · confidence 92% · not-behavioral", tone: "primary" },
      },
      {
        id: "rf-3", at: "Fri 3:14 PM", actor: "Fathom",
        title: "Route to Lilly-approved support pathway",
        detail: "This is not a Nu conversation — this needs an approved resource. Template routes to Lilly's patient-support line + pharmacy locator.",
        screen: "lilly-home",
        fathomLog: { action: "Template selected", detail: "lilly.access.refill_support_route · route to approved support", tone: "primary" },
      },
      {
        id: "rf-4", at: "Fri 3:15 PM", actor: "Lilly Health",
        title: "Message appears in Adam's Lilly Health app",
        detail: "Fast turnaround — access issues are time-sensitive.",
        screen: "lilly-lock-notif",
        screenData: {
          messageTitle: "Having trouble with your medication?",
          messageBody: "If you are having difficulty getting your medication or have questions about your prescription, support may be available.",
        },
        fathomLog: { action: "Delivered", detail: "surface: lilly_health · in-app · immediate", tone: "success" },
      },
      {
        id: "rf-5", at: "Fri 3:22 PM", actor: "Patient",
        title: "Adam taps in · sees Lilly-approved support options",
        detail: "The primary CTA opens the Lilly patient-support line. Talk to Nu is present for follow-up questions.",
        screen: "lilly-message",
        screenData: {
          messageTitle: "Having trouble with your medication?",
          messageBody: "If you are having difficulty getting your medication or have questions about your prescription, support may be available.",
        },
        fathomLog: { action: "Opened", detail: "member engaged · deep-link to Lilly patient support ready", tone: "success" },
      },
      {
        id: "rf-6", at: "Fri 3:24 PM", actor: "Nu",
        title: "Adam asks Nu a related question · access area",
        detail: "Nu stays inside the ACCESS response area — routes to approved resources, doesn't advise on dose changes.",
        screen: "lilly-talk-to-nu",
        screenData: {
          memberQuestion: "Can I skip a dose?",
          nuReply: "That's a decision for your prescribing physician — I don't have the training to weigh medication changes. I can send a note to your care team right now to make sure this gets in front of them within 24 hours. Would that help?",
          nuAreaLabel: "Clinical",
        },
        fathomLog: { action: "Talk-to-Nu turn", detail: "area: clinical · did NOT advise · routed to care team", tone: "primary" },
      },
      {
        id: "rf-7", at: "Fri 3:26 PM", actor: "Fathom",
        title: "Coach + care-team ticket opened",
        detail: "Two parallel handoffs: Lilly patient-support line for the pharmacy issue, care-team note for the dose question. Both auditable.",
        screen: "lilly-followup",
        screenData: { followupText: "Support-line opened · care-team note sent · re-monitor next scheduled dose" },
        fathomLog: { action: "Loop closed", detail: "handoffs: 2 · lilly_support_line + care_team_note · both audit-logged", tone: "success" },
      },
    ],
  },
];

// ============================================================================
// Talk to Nu · response area meta
// ============================================================================
export const RESPONSE_AREA_META: Record<ResponseArea, { label: string; color: string; rule: string }> = {
  "behavior":              { label: "Behavior & habits",     color: "#0EA5A4", rule: "Food, activity, routines, tracking, motivation and general support." },
  "treatment-experience":  { label: "Treatment experience",  color: "#7C3AED", rule: "Recognize what the patient reports and use only approved educational content." },
  "access":                { label: "Access & refill",       color: "#F59E0B", rule: "Route to Lilly-approved resources or agreed support pathways." },
  "clinical":              { label: "Clinical",              color: "#4F5FE5", rule: "Do not diagnose, prescribe, recommend dose changes. Route to clinician." },
  "safety":                { label: "Safety & escalation",   color: "#DC2626", rule: "Defined words/symptoms trigger the approved escalation response." },
};

// ============================================================================
// Nu response rules — keyword-matched, patient-context-aware
// ============================================================================
export interface NuRule {
  patterns: RegExp[];
  area: ResponseArea;
  scenarioScope?: ScenarioId[];
  cite?: (persona: PatientPersona) => string[];
  reply: (persona: PatientPersona) => string;
}

export const NU_RULES: NuRule[] = [
  // ==== Safety / escalation — highest priority; broadest catch
  {
    patterns: [
      // Explicit stop / quit language
      /thinking about stopping/i, /want to stop/i, /want to quit/i, /giving up/i, /can't do this anymore/i, /done with this/i,
      // Self-harm / suicidal ideation
      /suicid/i, /hurt myself/i, /harm myself/i, /end (it|my life)/i, /don't want to (live|be here)/i,
      // Physical emergency signals
      /chest pain/i, /can't breathe/i, /trouble breathing/i, /passed out/i, /passing out/i, /fainted/i, /fainting/i,
      // Emotional emergency signals
      /hopeless/i, /no reason to/i, /crying all day/i, /can't stop crying/i,
      // Direct crisis vocabulary
      /emergency/i, /call 911/i, /er visit/i, /ambulance/i,
    ],
    area: "safety",
    reply: () =>
      "I hear you, and I want to make sure you get the right support right now. If any of this feels urgent I don't want to be the only voice here. I'm connecting you to your care team immediately — and if you're in a physical or mental-health emergency, please dial 911 or your local emergency line. Would it be OK if I also loop in your coach today?",
  },

  // ==== Clinical — never diagnose, prescribe, adjust dose
  {
    patterns: [
      /change my dose/i, /increase my dose/i, /decrease my dose/i, /adjust my dose/i,
      /skip.* dose/i, /miss.* dose/i, /take extra/i, /double dose/i,
      /forgot my dose/i, /forgot to take/i,
      /new medication/i, /switch medication/i, /stop the medication/i, /stop the drug/i,
      /diagnosis/i, /diagnose/i, /what's wrong with me/i,
    ],
    area: "clinical",
    reply: () =>
      "That's a decision for your prescribing physician — I don't have the training to weigh medication changes or clinical judgments. I can send a note to your care team right now to make sure this gets in front of them within 24 hours. Would that help?",
  },

  // ==== Access / refill
  {
    patterns: [
      /can'?t get my prescription/i, /pharmacy (is )?out/i, /refill/i, /prescription hold/i,
      /can'?t find my medication/i, /who do i call/i, /out of stock/i, /back ?order/i, /insurance denied/i,
      /prior auth/i, /coupon/i, /manufacturer/i, /coverage/i,
    ],
    area: "access",
    reply: (p) =>
      `That sounds frustrating${p.historyFacts.some(f => /pharmacy/i.test(f)) ? " — and I can see your journal mentioned the pharmacy issue" : ""}. I'm routing you to Lilly's approved patient-support line for prescription access; they can help with pharmacy locator, insurance questions, and manufacturer assistance. Would you like the contact and hours right now?`,
  },

  // ==== Treatment experience
  {
    patterns: [
      // Nausea + GI
      /nause/i, /nauseous/i, /throwing up/i, /threw up/i, /vomit/i, /puking/i, /puked/i,
      /stomach/i, /queasy/i, /sick to my stomach/i,
      // Appetite / eating
      /barely eaten/i, /can'?t eat/i, /can'?t hold/i, /appetite/i, /no appetite/i, /not hungry/i,
      // Malaise
      /feel awful/i, /feel terrible/i, /feel bad/i, /rough day/i, /rough week/i, /off today/i,
      // GI-adjacent
      /constipat/i, /diarrhea/i, /heartburn/i, /reflux/i, /bloated/i, /bloating/i, /cramp/i, /gassy/i,
      // Dizzy / fatigue commonly associated with GLP-1
      /dizzy/i, /fatigue/i, /tired all the time/i, /wiped out/i,
    ],
    area: "treatment-experience",
    cite: (p) => p.historyFacts.filter(f => /nausea|food|eat|1 ?mg|dose/i.test(f)),
    reply: (p) => {
      const hasNausea = p.historyFacts.some(f => /nausea/i.test(f));
      return hasNausea
        ? "I can see your nausea score has been running 4/5 for a few days now, and it's tracking with week 4 of your 1 mg step — a pattern many people go through. Small tactics that help most: ginger tea, small protein snacks, hydration first thing in the morning. If it hits a 5, or lasts more than a few more days, let's involve your doctor. Would you like the full toolkit?"
        : "Some stomach-related symptoms are common during treatment. Small tactics that help most: ginger tea, small protein snacks, keep hydration up. If symptoms worsen or persist more than a few days, let's involve your doctor. Want the full toolkit?";
    },
  },
  {
    patterns: [/is this normal/i, /supposed to feel/i, /side effect/i],
    area: "treatment-experience",
    reply: () =>
      "Every person's experience is a little different. What you're describing is something many people go through around this stage of treatment, but I don't want to speak for your specific situation. I can share the general education, and if anything feels alarming I'll route you to your care team. Want to walk through what you're noticing?",
  },

  // ==== Weight plateau
  {
    patterns: [/weight stopped/i, /weight isn'?t/i, /plateau/i, /scale won'?t move/i, /not losing/i],
    area: "behavior",
    cite: (p) => p.historyFacts.filter(f => /weight|activity|meal|mood/i.test(f)),
    scenarioScope: ["weight-plateau"],
    reply: () =>
      "Your weight has been flat about 3 weeks — that's not unusual around this point of the journey. I'm also seeing your activity down about 22% and meal logging down about 50%. The scale often follows the behaviors first. What's felt different for you in the last few weeks?",
  },
  {
    patterns: [/doing something wrong/i, /am i failing/i, /disappointed/i, /frustrated/i, /discouraged/i],
    area: "behavior",
    reply: (p) =>
      `Nothing you're describing sounds like doing anything wrong. ${p.historyFacts.some(f => /weight flat/i.test(f)) ? "3 weeks flat is a real experience — and it's more often about the body catching up than about effort. " : ""}Would it help to think through the last two weeks together — what's still working and what shifted?`,
  },

  // ==== Behavior · engagement drift
  {
    patterns: [/been busy/i, /haven'?t logged/i, /haven'?t checked in/i, /haven'?t had time/i, /why does .*app matter/i],
    area: "behavior",
    scenarioScope: ["engagement-drift"],
    reply: () =>
      "I hear that. Real life gets in the way, and the app is here to serve you, not the other way around. Even a 20-second check-in when you can helps me stay useful to you. What's a moment in your day when it wouldn't feel like a chore?",
  },
  {
    patterns: [/forgot/i, /missed/i, /couldn'?t remember/i],
    area: "behavior",
    reply: () =>
      "Forgetting isn't a failing — it's usually a cue problem. What's a moment in your day that always happens (dinner, brushing teeth, coffee) — we could hook the log onto that, so you don't have to remember at all.",
  },

  // ==== Motivation
  {
    patterns: [/why .*bother/i, /what'?s the point/i, /worth it/i],
    area: "behavior",
    reply: () =>
      "That's an honest question. Sometimes it helps to zoom out — what were you hoping this program would give you when you started? And what would even a small win in the next week look like to you?",
  },

  // Fallback
  {
    patterns: [/.*/],
    area: "behavior",
    reply: () =>
      "I want to make sure I answer this well. Could you tell me a little more about what's going on? I can help with habits, tracking, general support — and if it's something clinical or about your medication I'll route you appropriately.",
  },
];

export function nuRespond(input: string, scenarioId: ScenarioId, persona: PatientPersona): {
  area: ResponseArea;
  reply: string;
  cite: string[];
} {
  const text = input.trim();
  for (const rule of NU_RULES) {
    if (rule.scenarioScope && !rule.scenarioScope.includes(scenarioId)) continue;
    if (rule.patterns.some(p => p.test(text))) {
      return {
        area: rule.area,
        reply: rule.reply(persona),
        cite: rule.cite ? rule.cite(persona) : [],
      };
    }
  }
  return { area: "behavior", reply: NU_RULES[NU_RULES.length - 1].reply(persona), cite: [] };
}
