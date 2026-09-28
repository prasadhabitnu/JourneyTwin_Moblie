/**
 * scenariosData — the interactive-simulation catalog.
 * 3 use cases × 4 integration levels = 12 scenarios; each has 4-6 steps.
 * Steps carry optional MockupData so a handful of mockups render context-aware.
 */

// ============================================================================
// Types
// ============================================================================
export type Actor = "Fathom" | "Sally" | "Coach" | "Physician" | "Lilly";

export interface NumberCallout {
  label: string;
  value: string;
  delta?: string;
  tone?: "up-good" | "up-bad" | "down-good" | "down-bad" | "neutral";
}

export interface HomeCard { title: string; body: string; }
export interface Pattern  { label: string; headline: string; data: number[]; color: string; }
export interface QueueRowData { name: string; initials: string; reason: string; rank: number; }

export interface MockupData {
  // Fathom brain / detect card (split light-top / dark-bottom)
  detectStatus?: string;
  detectTitle?: string;
  detectSignals?: Array<{ label: string; value: string; alert?: boolean }>;   // Lilly data received (light half)
  detectDecision?: string;   // Fathom orchestration output (dark half)
  detectTint?: string;
  orchSeverity?: number;                                        // 0..100
  orchSeverityBand?: "LOW" | "MEDIUM" | "MEDIUM-HIGH" | "HIGH"; // for the meter band label
  orchContextTags?: string[];                                    // e.g., ["sunday-brunch-pattern", "3rd-miss-6wks"]
  orchChannel?: string;                                          // e.g., "Coach handoff · SMS"
  orchTiming?: string;                                           // e.g., "Now · pre-dinner window"

  // Pattern detected (dark card w/ patterns)
  patternKicker?: string;
  patternTitle?: string;
  patterns?: Pattern[];
  patternDecision?: string;

  // Coach console
  consoleFocusName?: string;
  consoleFocusInits?: string;
  consoleFocusReason?: string;
  consoleFocusDetail?: string;
  consoleFocusMeta?: string;
  consoleCTA?: string;

  // Push / lock notification / message thread
  messageKicker?: string;
  messageTitle?: string;
  messageBody?: string;
  messageCaption?: string;
  messageActions?: Array<{ label: string; primary?: boolean }>;
  messageConfirmTitle?: string;
  messageConfirmBody?: string;
  messageTrace?: string;

  // Fathom draft
  draftTemplate?: string;
  draftPersonalization?: string[];
  draftSendWindow?: string;
  draftPreviewTitle?: string;
  draftPreviewBody?: string;

  // Home cards
  homeCards?: HomeCard[];

  // Drill (numbers-first)
  drillKicker?: string;
  drillTitle?: string;
  drillHeadline?: string;
  drillNumbers?: NumberCallout[];
  drillChartData?: number[];
  drillChartLabel?: string;
  drillChartColor?: string;
  drillSuggestion?: string;
  drillActions?: Array<{ label: string; primary?: boolean }>;

  // Committed card
  commitTitle?: string;
  commitBody?: string;
  commitTrace?: string;

  // Confirm / evening celebrate
  confirmKicker?: string;
  confirmTitle?: string;
  confirmBody?: string;
  confirmGradient?: string;

  // Companion loaded
  companionMomentum?: number;
  companionMomentumLabel?: string;
  companionMomentumDelta?: string;
  companionCards?: HomeCard[];
  companionCTA?: string;

  // Chat with coach
  chatContext?: string;
  chatUser?: string;
  chatReply?: string;
  chatReplyTime?: string;

  // Return (final trace)
  returnKicker?: string;
  returnBody?: string;

  // Trigger frame (nausea-log etc.)
  triggerBigNumber?: string;
  triggerBigLabel?: string;
  triggerCaption?: string;
  triggerBg?: string;

  // Habit psychology (Fogg / anchor / IF-THEN / stage / streak / celebration)
  habitName?: string;                                                       // "Evening walk"
  habitStage?: "trying" | "sticky" | "stable" | "automatic";                // ladder stage
  habitAnchor?: string;                                                     // "After dinner"
  habitAnchorReason?: string;                                               // "Sally's strongest existing habit — 6:15 PM daily"
  habitIntentionIf?: string;                                                // "I finish dinner"
  habitIntentionThen?: string;                                              // "put on my shoes and walk 15 min"
  habitDaysDone?: number;                                                   // e.g., 3
  habitDaysWindow?: number;                                                 // e.g., 14
  habitCohortLift?: string;                                                 // "Members who anchored to dinner: 4x more likely to make it stick"
  habitFogg?: { motivation: number; ability: number; prompt: number };      // 0..100 each
  habitCelebrationTone?: "cementing" | "sticky" | "stable" | "automatic";  // celebration copy family
}

export type MockupKind =
  // Reusable
  | "sun-morning-miss"
  | "nausea-log"
  | "fathom-detect"
  | "coach-console"
  | "coach-call"
  | "coach-text"
  | "lilly-home-unchanged"
  | "fathom-draft"
  | "lock-notification"
  | "message-thread"
  | "message-acted"
  | "pattern-detected"
  | "cards-in-home"
  | "card-expanded"
  | "card-committed"
  | "evening-confirm"
  | "lilly-home-plain"
  | "sally-taps-insights"
  | "companion-loaded"
  | "companion-drill"
  | "companion-chat"
  | "companion-return"
  | "plateau-weigh-in"
  | "walk-log-trigger"
  | "habit-intention-capture";

export interface OrchReasoning {
  severity?: string;    // e.g., "24 / 100 · LOW"
  context?: string;     // e.g., "sunday-brunch-pattern · 3rd miss in 6 wks"
  pattern?: string;     // e.g., "78% cohort catch-up if nudged"
  channel?: string;     // e.g., "Lilly push (L2 enabled) · not coach call"
  timing?: string;      // e.g., "9:41 AM (Sally's 74% open window)"
}

export interface Step {
  id: string;
  time: string;
  actor: Actor;
  title: string;
  description: string;
  mockup: MockupKind;
  data?: MockupData;
  orchReasoning?: OrchReasoning;
}

export interface Scenario {
  id: 1 | 2 | 3 | 4;
  levelName: string;
  premise: string;
  outcome: string;
  color: string;
  tint: string;
  steps: Step[];
}

export interface UseCase {
  id: string;
  title: string;
  shortLabel: string;
  category: string;
  icon: "meds" | "nausea" | "spike" | "plateau" | "habit";
  premise: string;
  scenarios: Scenario[];
}

// ============================================================================
// Level chrome — same 4 colors across every use case
// ============================================================================
const L1 = { color: "#0EA5E9", tint: "#DBEAFE", name: "Persistence Intelligence" };
const L2 = { color: "#4F5FE5", tint: "#E0E7FF", name: "Smart Popup" };
const L3 = { color: "#0EA5A4", tint: "#CCFBF1", name: "Insight Cards" };
const L4 = { color: "#7C3AED", tint: "#EDE9FE", name: "HabitNu Companion" };

// ============================================================================
// USE CASE 1 — Sunday dose miss
// ============================================================================
const doseMissDefaults = {
  detect: {
    detectStatus: "Signal detected",
    detectTitle: "Missed dose · Sunday-brunch pattern",
    detectSignals: [
      { label: "Missed dose", value: "Sun 10 AM" },
      { label: "Fasting BG", value: "+12 vs baseline", alert: true },
      { label: "Pattern match", value: "Sunday-brunch miss" },
      { label: "Cohort peers", value: "78% catch-up if nudged" },
    ],
    detectDecision: "Route to Maya · flag as priority.",
    orchSeverity: 24, orchSeverityBand: "LOW",
    orchContextTags: ["sunday-brunch-pattern", "3rd-miss-6wks", "dose-escalation: no"],
    orchChannel: "Lilly push (L2) → fallback: coach call",
    orchTiming: "9:41 AM · Sally's 74% open window",
  } as MockupData,
  console: {
    consoleFocusName: "Sally Reddy",
    consoleFocusInits: "SR",
    consoleFocusReason: "Sunday miss · fasting +12 mg/dL",
    consoleFocusDetail: "3rd Sunday miss in 6 wks. Suggest: shift reminder to Saturday evening.",
    consoleFocusMeta: "GLP-1 · Wk 13",
    consoleCTA: "Call Sally",
  } as MockupData,
  draft: {
    draftTemplate: "lilly.dose_miss.gentle_reset",
    draftPersonalization: ["Sunday brunch", "Saturday-evening reset"],
    draftSendWindow: "Mon 9:41 AM · 74% open rate",
    draftPreviewTitle: "Missed yesterday? Let's reset.",
    draftPreviewBody: "Sunday brunch got busy. Move next reminder to Sat evening?",
  } as MockupData,
  push: {
    messageKicker: "Lilly Health · now",
    messageTitle: "Missed yesterday? Let's reset.",
    messageBody: "Sunday brunch got busy. Want to move next week's reminder to Saturday evening?",
    messageCaption: "Personalized · sent at your best-open window",
  } as MockupData,
  thread: {
    messageTitle: "Missed yesterday? Let's reset.",
    messageBody: "Sunday brunch got busy. Want to move next Sunday's reminder to Saturday evening? Members like you catch up 78% more often that way.",
    messageActions: [{ label: "Log dose now", primary: true }, { label: "Move reminder" }, { label: "Not now" }],
  } as MockupData,
  acted: {
    messageTitle: "Missed yesterday? Let's reset.",
    messageBody: "Sunday brunch got busy. Want to move next Sunday's reminder to Saturday evening?",
    messageConfirmTitle: "Confirmed",
    messageConfirmBody: "Dose logged. Saturday-evening reminder set for next week.",
    messageTrace: "Response captured. Coach handoff skipped — Sally self-served.",
  } as MockupData,
};

const doseMissScenarios: Scenario[] = [
  // -------- L1
  {
    id: 1, levelName: L1.name, color: L1.color, tint: L1.tint,
    premise: "Sally misses her Sunday semaglutide dose. No one told her app.",
    outcome: "Fathom silently flags the miss and hands it to Maya. Sally sees zero UX change in Lilly Health — Maya reaches out through the channels Sally already trusts.",
    steps: [
      { id: "u1l1s1", time: "Sun · 10:00 AM", actor: "Sally", mockup: "sun-morning-miss",
        title: "Sally sleeps in for family brunch.",
        description: "Her Sunday reminder pings, she snoozes it. The dose isn't taken. Nothing else happens in Lilly Health — as designed." },
      { id: "u1l1s2", time: "Mon · 6:15 AM", actor: "Fathom", mockup: "fathom-detect", data: doseMissDefaults.detect,
        title: "Fathom detects the miss and its downstream effect.",
        description: "CGM shows fasting glucose +12 mg/dL vs Sally's baseline. Cross-referenced with the dose ledger, Fathom classifies it 'Sunday-brunch miss' — a familiar pattern for her cohort." },
      { id: "u1l1s3", time: "Mon · 7:30 AM", actor: "Fathom", mockup: "coach-console", data: doseMissDefaults.console,
        title: "Sally jumps to #1 in Maya's queue.",
        description: "In the internal Lilly Insights Console (analyst-only, not member-facing), Maya sees Sally pinned to the top with the reason chip already filled in." },
      { id: "u1l1s4", time: "Mon · 8:45 AM", actor: "Coach", mockup: "coach-call",
        title: "Maya calls Sally on her normal number.",
        description: "Standard Lilly Health coaching channel — no app popup, no notification. Two-minute call: 'How was Sunday? Let's move next Sunday's reminder to Saturday evening.'" },
      { id: "u1l1s5", time: "Mon · 9:00 AM", actor: "Lilly", mockup: "lilly-home-unchanged",
        title: "Sally's Lilly Health app: unchanged.",
        description: "No Fathom card, no Fathom badge, no new tab. From Sally's perspective the app is exactly what Lilly designed. The intelligence lived entirely behind the scenes." },
    ],
  },
  // -------- L2
  {
    id: 2, levelName: L2.name, color: L2.color, tint: L2.tint,
    premise: "Same missed dose. This time Fathom is allowed to send one Lilly-branded nudge.",
    outcome: "Message stays inside the Lilly Health envelope. Sally reads it, taps 'Log dose,' and Fathom measures the response. Non-responders auto-escalate to Maya.",
    steps: [
      { id: "u1l2s1", time: "Sun · 10:00 AM", actor: "Sally", mockup: "sun-morning-miss",
        title: "Same Sunday-brunch miss.",
        description: "Sally snoozes the dose reminder. No change to the trigger." },
      { id: "u1l2s2", time: "Mon · 6:15 AM", actor: "Fathom", mockup: "fathom-detect", data: doseMissDefaults.detect,
        title: "Fathom detects — but now it's allowed to talk to Sally.",
        description: "Same detection logic as Level 1. Difference: Level 2 unlocks the outbound-message rail. Fathom picks the right Lilly-approved template." },
      { id: "u1l2s3", time: "Mon · 9:00 AM", actor: "Fathom", mockup: "fathom-draft", data: doseMissDefaults.draft,
        orchReasoning: {
          severity: "24 / 100 · LOW · no acute-risk combo",
          context:  "sunday-brunch-pattern · 3rd miss in 6 wks · dose escalation: no",
          pattern:  "78% of cohort catch up if nudged within 24h",
          channel:  "Lilly push (L2 enabled) — coach call held as fallback",
          timing:   "9:41 AM · Sally's per-member 74% open window"
        },
        title: "Fathom drafts the nudge and picks Sally's best send time.",
        description: "Template chosen from Lilly's approved library. Send window predicted from Sally's own open-rate model: 9:41 AM (her 74% window). Everything Lilly-branded, no Habitnu chrome." },
      { id: "u1l2s4", time: "Mon · 9:41 AM", actor: "Lilly", mockup: "lock-notification", data: doseMissDefaults.push,
        title: "Push notification arrives in Lilly Health.",
        description: "Lock-screen banner styled exactly like every other Lilly Health push. Sally has no signal that this one came from Fathom vs. Lilly's own reminder engine." },
      { id: "u1l2s5", time: "Mon · 9:43 AM", actor: "Sally", mockup: "message-thread", data: doseMissDefaults.thread,
        title: "Sally taps in — reads the message inside Lilly Health.",
        description: "In-app messaging screen. Same look and feel as Lilly's existing Sunday-reminder thread. The copy is warm, specific to her: mentions the Saturday-evening reset." },
      { id: "u1l2s6", time: "Mon · 9:44 AM", actor: "Sally", mockup: "message-acted", data: doseMissDefaults.acted,
        title: "One tap: 'Log my dose now.' Fathom measures the response.",
        description: "Response tracked — dose logged, Saturday reminder scheduled. If Sally hadn't tapped within 2 hours, Fathom would auto-escalate to Maya in Level 1 mode." },
    ],
  },
  // -------- L3
  {
    id: 3, levelName: L3.name, color: L3.color, tint: L3.tint,
    premise: "Fathom's pattern detection surfaces inside Lilly Health's home feed.",
    outcome: "Fathom cards sit alongside Lilly's own content — same visual language, same navigation. Sally tapped, committed, and Fathom confirmed via her wearable. Zero navigation away from Lilly Health.",
    steps: [
      { id: "u1l3s1", time: "Mon · 6:15 AM", actor: "Fathom", mockup: "pattern-detected",
        data: {
          patternKicker: "Fathom · overnight sweep",
          patternTitle: "2 patterns crossed threshold",
          patterns: [
            { label: "Pattern 1", headline: "Movement -22% vs 30-day baseline", data: [62,58,55,50,48,44,40], color: "#5EEAD4" },
            { label: "Pattern 2", headline: "Dinner peaks climbing · 3 nights",  data: [112,118,125,131,138,142,148], color: "#F59E0B" },
          ],
          patternDecision: "Bundle → 2 cards → Sally's home feed",
        },
        title: "Two patterns detected overnight.",
        description: "Movement down 22% vs Sally's baseline. Post-dinner glucose peaks climbing three days in a row. Fathom bundles both into candidate cards." },
      { id: "u1l3s2", time: "Mon · 7:00 AM", actor: "Fathom", mockup: "cards-in-home",
        data: { homeCards: [
          { title: "Your walks are this week's biggest lever.", body: "5 walks in 7 days · Days above 8.5k steps: 15% higher TIR." },
          { title: "Dinner peaks climbing — 3 nights in a row.", body: "Tuesday's plate spiked +38 mg/dL. See what changed." },
        ] },
        title: "Two 'Fathom noticed' cards drop into Lilly Health's home feed.",
        description: "Cards land above the fold, styled with a subtle 'Fathom noticed' badge. Positioned between Lilly's dose-of-the-day tile and the coaching card." },
      { id: "u1l3s3", time: "Mon · 8:30 AM", actor: "Sally", mockup: "cards-in-home",
        data: { homeCards: [
          { title: "Your walks are this week's biggest lever.", body: "5 walks in 7 days · Days above 8.5k steps: 15% higher TIR." },
          { title: "Dinner peaks climbing — 3 nights in a row.", body: "Tuesday's plate spiked +38 mg/dL. See what changed." },
        ] },
        title: "Sally opens Lilly Health, sees both cards.",
        description: "First card: 'Your evening walks are the biggest lever this week.' Second card: 'Dinner peaks are climbing. Here's what Tuesday's plate looked like.'" },
      { id: "u1l3s4", time: "Mon · 8:32 AM", actor: "Sally", mockup: "card-expanded",
        data: {
          drillKicker: "Fathom noticed",
          drillTitle: "Evening walks = your biggest lever",
          drillHeadline: "3 walk-nights lowered next-morning glucose by 18 mg/dL.",
          drillNumbers: [
            { label: "Walks / week", value: "5", delta: "+2 vs last wk", tone: "up-good" },
            { label: "Avg AM BG", value: "94", delta: "-8 mg/dL", tone: "down-good" },
            { label: "TIR gain", value: "+15%", delta: "vs no-walk days", tone: "up-good" },
          ],
          drillChartData: [82,78,72,68,64,58,54],
          drillChartLabel: "AM glucose after walk-night",
          drillChartColor: L3.color,
          drillSuggestion: "A 20-min walk after dinner. That's it.",
          drillActions: [{ label: "Do this today", primary: true }, { label: "Later" }],
        },
        title: "Sally taps 'See how' on the walk card.",
        description: "Expands to a mini insight sheet: 3-day walk log, correlation with next-morning glucose, and one specific suggestion for tonight. Numbers first — the chart is one tap away." },
      { id: "u1l3s5", time: "Mon · 8:34 AM", actor: "Sally", mockup: "card-committed",
        data: {
          commitTitle: "20-min walk after dinner tonight.",
          commitBody: "Check-in scheduled for 6:45 PM.",
          commitTrace: "Fathom Action Engine armed. Wearable primed to detect walk 6:30–8:00 PM.",
        },
        title: "Sally commits: 'Do this today.'",
        description: "One tap schedules a 6:45 PM check-in. Fathom's action engine primes the wearable to notify her if she hasn't logged movement by 7:15 PM." },
      { id: "u1l3s6", time: "Mon · 7:32 PM", actor: "Fathom", mockup: "evening-confirm",
        data: {
          confirmKicker: "Streak +1",
          confirmTitle: "6 walks in 7 days · your best week",
          confirmBody: "22-min walk detected at 7:14 PM. That's 6 walks in 7 days — highest since April.",
          confirmGradient: "linear-gradient(90deg,#F59E0B,#EF4444)",
        },
        title: "Wearable confirms the walk. Streak card drops in.",
        description: "Fathom captures the 22-minute walk from the wearable. A 'Streak +1' celebration card slides in the next time Sally opens the app." },
    ],
  },
  // -------- L4
  {
    id: 4, levelName: L4.name, color: L4.color, tint: L4.tint,
    premise: "Sally has opted in to the full Fathom experience — living inside Lilly Health's Insights tab.",
    outcome: "Deep Fathom experience with Momentum, drill-downs, and in-line coach chat — all inside Lilly Health's navigation shell. Sally never leaves the app.",
    steps: [
      { id: "u1l4s1", time: "Mon · 8:30 AM", actor: "Sally", mockup: "lilly-home-plain",
        title: "Sally opens Lilly Health.",
        description: "Standard home screen. Notice the new little dot on the Insights tab — Fathom prepared fresh cards overnight." },
      { id: "u1l4s2", time: "Mon · 8:30 AM", actor: "Sally", mockup: "sally-taps-insights",
        title: "Sally taps the Insights tab.",
        description: "The full HabitNu Companion loads inside Lilly Health's chrome. Header still says Lilly Health. Tab bar unchanged." },
      { id: "u1l4s3", time: "Mon · 8:31 AM", actor: "Lilly", mockup: "companion-loaded",
        data: {
          companionMomentum: 78, companionMomentumLabel: "Strong", companionMomentumDelta: "+4 vs last week",
          companionCards: [
            { title: "Dinner peaks · 3 nights climbing", body: "Tap for the story." },
            { title: "Evening walks: your biggest lever", body: "5/7 nights this week." },
            { title: "Wk 20: on pace to cross HbA1c 6.0", body: "Trajectory holds if pattern continues." },
          ],
          companionCTA: "Message Maya",
        },
        title: "Companion loaded: Momentum arc + 3 Fathom cards + Coach button.",
        description: "Momentum score 78 (Strong), 3 personalized insight cards, and a persistent 'Message Maya' button. All Fathom-powered, wrapped in Lilly's UX." },
      { id: "u1l4s4", time: "Mon · 8:33 AM", actor: "Sally", mockup: "companion-drill",
        data: {
          drillKicker: "Nu insight",
          drillTitle: "Dinner peaks · 3-day pattern",
          drillHeadline: "Peak +42 mg/dL Tuesday, +38 Wednesday.",
          drillNumbers: [
            { label: "Tue peak", value: "+42", delta: "mg/dL", tone: "up-bad" },
            { label: "Wed peak", value: "+38", delta: "mg/dL", tone: "up-bad" },
            { label: "Thu peak", value: "+35", delta: "mg/dL", tone: "up-bad" },
          ],
          drillChartData: [112,120,138,142,148,145,150],
          drillChartLabel: "Post-dinner glucose",
          drillChartColor: L4.color,
          drillSuggestion: "Swap 1/2 cup rice for greens tonight + a 15-min walk.",
          drillActions: [{ label: "Ask Maya", primary: true }, { label: "Log tonight" }],
        },
        title: "Sally taps a card → drill sheet opens.",
        description: "Full-height sheet with the 3-night breakdown — big numbers up top, chart one tap away. Nu's next-step suggestion sits below. Everything from the full Fathom app, delivered inside Lilly Health." },
      { id: "u1l4s5", time: "Mon · 8:36 AM", actor: "Sally", mockup: "companion-chat",
        data: {
          chatContext: "Viewing: Dinner peaks · 3-day pattern",
          chatUser: "Should I skip the rice altogether?",
          chatReply: "Nope — halve it and add a walk. Full swap is a bigger change than we need this week.",
          chatReplyTime: "Maya replied · 4 min",
        },
        title: "Sally messages Maya from inside Companion.",
        description: "Coach chat opens in a sheet. Fathom pre-fills the conversation context (which card Sally was viewing). Maya replies from her Lilly Insights Console within 4 minutes." },
      { id: "u1l4s6", time: "Mon · 8:41 AM", actor: "Sally", mockup: "companion-return",
        data: {
          returnKicker: "Insights tab · Fathom Companion",
          returnBody: "Sally spent 11 min. Committed to tonight's plan. Never left Lilly Health.",
        },
        title: "Sally returns to Lilly Health home. Companion state persists.",
        description: "Back tap returns her to Lilly Health's home tab. Tomorrow morning, Fathom has refreshed the Insights tab with new cards. Sally never left the Lilly Health app." },
    ],
  },
];

// ============================================================================
// USE CASE 2 — Wednesday nausea flare-up (side-effect / behavioral)
// ============================================================================
const nauseaShared = {
  detect: {
    detectStatus: "Side-effect signal",
    detectTitle: "Nausea 4/5 · dose-escalation week",
    detectSignals: [
      { label: "Nausea log", value: "4 / 5", alert: true },
      { label: "Breakfast", value: "Skipped" },
      { label: "Dose window", value: "Day 4 · 1mg escalation" },
      { label: "Cohort match", value: "68% flare at this week" },
    ],
    detectDecision: "Route to Maya · not physician-critical yet.",
    detectTint: "#312E81",
    orchSeverity: 56, orchSeverityBand: "MEDIUM",
    orchContextTags: ["dose-escalation-week-4", "1mg-first-cycle", "coincident: breakfast-skip"],
    orchChannel: "Lilly push (L2) + toolkit template · escalate to coach if score > 3 at 2 PM",
    orchTiming: "Now · Sally has app foregrounded (session-window override)",
  } as MockupData,
  console: {
    consoleFocusName: "Sally Reddy",
    consoleFocusInits: "SR",
    consoleFocusReason: "Nausea 4/5 · 1mg escalation week",
    consoleFocusDetail: "Day 4 of dose-up. Skipped breakfast. No Zofran in log. Suggest: gentle toolkit + 2 PM check-in.",
    consoleFocusMeta: "GLP-1 · Wk 13",
    consoleCTA: "Call Sally",
  } as MockupData,
  draft: {
    draftTemplate: "lilly.sideeffect.nausea_gentle_toolkit",
    draftPersonalization: ["Skipped breakfast", "Week-4 escalation"],
    draftSendWindow: "Now · Sally has app open",
    draftPreviewTitle: "Rough morning? Let's take the edge off.",
    draftPreviewBody: "Try our nausea toolkit — 3 things that work for members like you at week 4.",
  } as MockupData,
  push: {
    messageKicker: "Lilly Health · now",
    messageTitle: "Rough morning? Let's take the edge off.",
    messageBody: "Nausea can spike in week 4. Try our toolkit — 3 tactics that work for members like you.",
    messageCaption: "Sent while Sally has app open",
  } as MockupData,
  thread: {
    messageTitle: "Rough morning? Let's take the edge off.",
    messageBody: "Nausea is real in week 4 after moving to 1mg. Members like you find these 3 tactics take the edge off within an hour: ginger tea + saltines, a slow 5-min walk, small protein snack.",
    messageActions: [{ label: "Try tactic 1: Ginger + saltines", primary: true }, { label: "Show all 3" }, { label: "Not now" }],
  } as MockupData,
  acted: {
    messageTitle: "Rough morning? Let's take the edge off.",
    messageBody: "Try our toolkit — 3 tactics that work at week 4.",
    messageConfirmTitle: "Committed",
    messageConfirmBody: "Ginger + saltines. Check-in at 2 PM.",
    messageTrace: "Nausea toolkit engaged. If nausea > 3 at 2 PM, auto-escalate to Maya.",
  } as MockupData,
};

const nauseaScenarios: Scenario[] = [
  // -------- L1
  {
    id: 1, levelName: L1.name, color: L1.color, tint: L1.tint,
    premise: "Wednesday morning of dose-escalation week 4. Sally rates nausea 4/5 and skips breakfast.",
    outcome: "Fathom pattern-matches the flare against her cohort, rules out physician-critical combos, and pings Maya. Maya calls with a warm, specific playbook. Lilly Health app stays quiet.",
    steps: [
      { id: "u2l1s1", time: "Wed · 7:30 AM", actor: "Sally", mockup: "nausea-log",
        data: { triggerBigNumber: "4", triggerBigLabel: "/ 5 nausea", triggerCaption: "Sally logs it in Lilly Health's mood tile. Skips breakfast.", triggerBg: "linear-gradient(180deg,#DCFCE7 0%,#F0FDF4 40%,#F8FAFC 100%)" },
        title: "Sally logs nausea 4/5. Skips breakfast.",
        description: "Wednesday morning, day 4 after moving to 1mg. She logs the score in Lilly Health's mood tile and steps away from the kitchen." },
      { id: "u2l1s2", time: "Wed · 7:35 AM", actor: "Fathom", mockup: "fathom-detect", data: nauseaShared.detect,
        title: "Fathom detects the flare + rules out red flags.",
        description: "Nausea 4/5 + skipped breakfast + day 4 of the 1mg escalation = a well-known pattern. Fathom runs a medical-advisory scan for red-flag combos (Zofran interactions, dehydration risk) — clear." },
      { id: "u2l1s3", time: "Wed · 7:45 AM", actor: "Fathom", mockup: "coach-console", data: nauseaShared.console,
        title: "Sally lands in Maya's queue with a full context chip.",
        description: "Maya opens the console and sees Sally at #1 with the reason and the suggested playbook already drafted — gentle toolkit, no Zofran yet, 2 PM re-check." },
      { id: "u2l1s4", time: "Wed · 8:15 AM", actor: "Coach", mockup: "coach-call",
        title: "Maya calls. Three minutes, one plan.",
        description: "'This is week-4 territory. Sip ginger tea, small protein snack when you can. If it hits 5 by tomorrow, we page Dr Chen.'" },
      { id: "u2l1s5", time: "Wed · 8:20 AM", actor: "Lilly", mockup: "lilly-home-unchanged",
        title: "Lilly Health app: silent handoff.",
        description: "No popup, no card, no badge. Everything happened around Sally — the app is untouched." },
    ],
  },
  // -------- L2
  {
    id: 2, levelName: L2.name, color: L2.color, tint: L2.tint,
    premise: "Same nausea trigger. Fathom sends Sally the Lilly nausea toolkit at exactly the right moment.",
    outcome: "One nudge inside Lilly Health delivers a 3-tactic playbook. Sally commits to tactic 1 in 90 seconds. Nausea toolkit auto-escalates to Maya if it's still 3+ at 2 PM.",
    steps: [
      { id: "u2l2s1", time: "Wed · 7:30 AM", actor: "Sally", mockup: "nausea-log",
        data: { triggerBigNumber: "4", triggerBigLabel: "/ 5 nausea", triggerCaption: "Sally logs it. Same trigger as Level 1.", triggerBg: "linear-gradient(180deg,#DCFCE7 0%,#F0FDF4 40%,#F8FAFC 100%)" },
        title: "Nausea 4/5 logged. Sally still has the app open.",
        description: "Same trigger. Difference: Level 2 lets Fathom respond directly through Lilly's push rail." },
      { id: "u2l2s2", time: "Wed · 7:35 AM", actor: "Fathom", mockup: "fathom-detect", data: nauseaShared.detect,
        title: "Fathom detects. Now allowed to talk to Sally.",
        description: "Same detection logic. Level 2 unlocks outbound messaging." },
      { id: "u2l2s3", time: "Wed · 7:50 AM", actor: "Fathom", mockup: "fathom-draft", data: nauseaShared.draft,
        orchReasoning: {
          severity: "56 / 100 · MEDIUM · watch-band (physician-flag not crossed)",
          context:  "dose-escalation-week-4 · 1mg-first-cycle · coincident: breakfast-skip",
          pattern:  "68% of cohort hit peak nausea day 4 · -2 drop by 4 PM if toolkit engaged",
          channel:  "Lilly push (L2) + toolkit template · auto-escalate to Maya if score > 3 at 2 PM",
          timing:   "Now · session-window override (Sally has app foregrounded)"
        },
        title: "Toolkit template drafted. Send right now — she's active.",
        description: "Send window predictor sees Sally's app is foregrounded. Fathom sends immediately rather than waiting." },
      { id: "u2l2s4", time: "Wed · 7:51 AM", actor: "Lilly", mockup: "lock-notification", data: nauseaShared.push,
        title: "Push arrives in Lilly Health.",
        description: "Standard Lilly Health notification chrome. Sally sees it in the app's own message inbox." },
      { id: "u2l2s5", time: "Wed · 7:52 AM", actor: "Sally", mockup: "message-thread", data: nauseaShared.thread,
        title: "Sally taps in — reads the toolkit.",
        description: "In-app thread with the 3-tactic playbook: ginger + saltines, slow 5-min walk, small protein snack. Warm copy, mentions week-4 specifically." },
      { id: "u2l2s6", time: "Wed · 7:53 AM", actor: "Sally", mockup: "message-acted", data: nauseaShared.acted,
        title: "One tap: 'Try tactic 1.' 2 PM check-in scheduled.",
        description: "Fathom logs the choice, schedules the re-check. If Sally reports nausea > 3 at 2 PM, the case auto-escalates to Maya without another tap." },
    ],
  },
  // -------- L3
  {
    id: 3, levelName: L3.name, color: L3.color, tint: L3.tint,
    premise: "Nausea flare surfaces as two Fathom cards inside Sally's Lilly Health home feed.",
    outcome: "Sally sees the pattern in her home feed, drills in (numbers-first), commits to a tactic, and by afternoon Fathom celebrates a nausea drop from 4 → 2.",
    steps: [
      { id: "u2l3s1", time: "Wed · 7:35 AM", actor: "Fathom", mockup: "pattern-detected",
        data: {
          patternKicker: "Fathom · side-effect sweep",
          patternTitle: "Nausea flare in week-4 window",
          patterns: [
            { label: "Signal 1", headline: "Nausea 4/5 (was 2/5 Mon)",  data: [2,2,3,4,4,4,4], color: "#F97316" },
            { label: "Signal 2", headline: "Breakfast skipped · 2nd day", data: [1,1,1,0,1,0,0], color: "#F59E0B" },
          ],
          patternDecision: "Bundle → 2 cards → home feed",
        },
        title: "Overnight sweep flags two related signals.",
        description: "Nausea jumped 2 → 4 in two days. Breakfast skipped 2 mornings in a row. Fathom bundles both into a card pair." },
      { id: "u2l3s2", time: "Wed · 7:40 AM", actor: "Fathom", mockup: "cards-in-home",
        data: { homeCards: [
          { title: "Wednesday 4/5 nausea = week-4 pattern", body: "68% of members hit this on day 4 of 1mg. Here's what helps." },
          { title: "Small protein now → 63% less afternoon crash", body: "You skipped breakfast — a snack cushions the next 4 hours." },
        ] },
        title: "Two Fathom cards drop into Lilly Health home.",
        description: "Cards appear above the fold, styled with the 'Fathom noticed' badge — same visual language as Lilly's own tiles." },
      { id: "u2l3s3", time: "Wed · 8:00 AM", actor: "Sally", mockup: "cards-in-home",
        data: { homeCards: [
          { title: "Wednesday 4/5 nausea = week-4 pattern", body: "68% of members hit this on day 4 of 1mg. Here's what helps." },
          { title: "Small protein now → 63% less afternoon crash", body: "You skipped breakfast — a snack cushions the next 4 hours." },
        ] },
        title: "Sally opens Lilly Health, sees the cards.",
        description: "'Oh — this is a thing?' The Fathom cards contextualize what she's feeling instead of leaving her guessing." },
      { id: "u2l3s4", time: "Wed · 8:02 AM", actor: "Sally", mockup: "card-expanded",
        data: {
          drillKicker: "Fathom noticed",
          drillTitle: "Nausea week 4 · what the numbers say",
          drillHeadline: "68% of members hit peak nausea on day 4 of the 1mg step.",
          drillNumbers: [
            { label: "Your nausea", value: "4 / 5", delta: "was 2 Mon", tone: "up-bad" },
            { label: "Day of 1mg",  value: "4",     delta: "peak zone",  tone: "neutral" },
            { label: "Members hit", value: "68%",   delta: "at day 4",   tone: "neutral" },
          ],
          drillChartData: [2,2,3,4,4,3,2],
          drillChartLabel: "Cohort nausea (typical week-4 trajectory)",
          drillChartColor: L3.color,
          drillSuggestion: "Ginger tea + saltines now. Small protein by 10 AM.",
          drillActions: [{ label: "Do this today", primary: true }, { label: "Later" }],
        },
        title: "Sally taps 'See how' — numbers first.",
        description: "Big number: '68% of members hit peak nausea on day 4.' Her stats side by side. Chart is one tap away when she wants proof." },
      { id: "u2l3s5", time: "Wed · 8:04 AM", actor: "Sally", mockup: "card-committed",
        data: {
          commitTitle: "Ginger tea + walk after lunch.",
          commitBody: "Check-in at 2 PM.",
          commitTrace: "Action Engine armed. If nausea > 3 at 2 PM → auto-escalate to Maya.",
        },
        title: "Sally commits: 'Ginger + walk after lunch.'",
        description: "One tap logs the plan. Fathom's action engine sets the 2 PM check-in and arms an auto-escalation rule if she's still struggling." },
      { id: "u2l3s6", time: "Wed · 2:30 PM", actor: "Fathom", mockup: "evening-confirm",
        data: {
          confirmKicker: "Nausea down",
          confirmTitle: "4/5 → 2/5 · toolkit worked",
          confirmBody: "Ginger + saltines, 8-min walk after lunch. Self-report confirmed. No coach escalation needed.",
          confirmGradient: "linear-gradient(90deg,#10B981,#059669)",
        },
        title: "2:30 PM: nausea down to 2/5. Celebration card.",
        description: "Sally's re-check dropped to 2/5. Fathom converts the win into a small celebration card — reinforcing what worked so she'll reach for the same playbook next week." },
    ],
  },
  // -------- L4
  {
    id: 4, levelName: L4.name, color: L4.color, tint: L4.tint,
    premise: "Sally opens the Insights tab. The full Companion foregrounds today's nausea narrative.",
    outcome: "Full drill-down, in-line chat with Maya about Zofran, and the Companion tracks nausea through the afternoon — all inside Lilly Health.",
    steps: [
      { id: "u2l4s1", time: "Wed · 8:00 AM", actor: "Sally", mockup: "lilly-home-plain",
        title: "Sally opens Lilly Health.",
        description: "Dot on Insights tab tells her something's waiting." },
      { id: "u2l4s2", time: "Wed · 8:00 AM", actor: "Sally", mockup: "sally-taps-insights",
        title: "Taps the Insights tab.",
        description: "Companion loads inside Lilly Health's chrome — same header, same tab bar." },
      { id: "u2l4s3", time: "Wed · 8:01 AM", actor: "Lilly", mockup: "companion-loaded",
        data: {
          companionMomentum: 74, companionMomentumLabel: "Strong", companionMomentumDelta: "-4 · nausea day",
          companionCards: [
            { title: "Nausea 4/5 today", body: "Week-4 flare pattern. Tap for the story." },
            { title: "Small protein → 63% less crash", body: "Best move for the next 4 hours." },
            { title: "Ginger tea beats Zofran for you", body: "3 of 4 flares — no meds needed." },
          ],
          companionCTA: "Ask Maya about Zofran",
        },
        title: "Companion opens on today's story.",
        description: "Momentum 74 (down 4 from yesterday, expected on a flare day). Three side-effect cards. 'Ask Maya' prominent — Fathom knows this is the moment members want a human." },
      { id: "u2l4s4", time: "Wed · 8:02 AM", actor: "Sally", mockup: "companion-drill",
        data: {
          drillKicker: "Nu insight",
          drillTitle: "Nausea 4/5 · your week-4 pattern",
          drillHeadline: "You're in the peak-nausea window. Typical members drop to 2/5 by 4 PM.",
          drillNumbers: [
            { label: "This morning", value: "4 / 5", delta: "worst since wk 1", tone: "up-bad" },
            { label: "Cohort peak",  value: "day 4", delta: "of 1mg step",     tone: "neutral" },
            { label: "Typical drop", value: "-2",    delta: "by 4 PM",         tone: "down-good" },
          ],
          drillChartData: [2,3,4,4,3,2,2],
          drillChartLabel: "Cohort nausea day 4 (avg trajectory)",
          drillChartColor: L4.color,
          drillSuggestion: "Ginger + saltines + slow 5-min walk. Skip the Zofran unless it hits 5.",
          drillActions: [{ label: "Ask Maya", primary: true }, { label: "Log tactic" }],
        },
        title: "Sally taps the nausea card → drill sheet.",
        description: "Numbers first: her 4/5, cohort peak on day 4, typical -2 drop by 4 PM. Chart one tap away. Nu's suggestion below, with the option to ask Maya rather than commit alone." },
      { id: "u2l4s5", time: "Wed · 8:05 AM", actor: "Sally", mockup: "companion-chat",
        data: {
          chatContext: "Viewing: Nausea 4/5 · week-4 pattern",
          chatUser: "Should I take Zofran?",
          chatReply: "Not yet. Try ginger + saltines + a slow walk first. If it's still 4+ at 2 PM I'll page Dr Chen for a script.",
          chatReplyTime: "Maya replied · 3 min",
        },
        title: "Sally messages Maya from inside Companion.",
        description: "Chat sheet opens. Fathom pre-fills the context ('Viewing: nausea 4/5 pattern') so Maya can answer without asking. Reply in 3 minutes." },
      { id: "u2l4s6", time: "Wed · 8:10 AM", actor: "Sally", mockup: "companion-return",
        data: {
          returnKicker: "Insights tab · Fathom Companion",
          returnBody: "Sally has a plan. Companion will re-check at 2 PM — auto-escalate to Maya if nausea > 3.",
        },
        title: "Sally back to home. Companion re-checks at 2 PM.",
        description: "Everything happened inside Lilly Health. The Companion state persists for the afternoon check-in and tomorrow's follow-up." },
    ],
  },
];

// ============================================================================
// USE CASE 3 — Dinner glucose spike (3 nights in a row)
// ============================================================================
const spikeShared = {
  detect: {
    detectStatus: "Metabolic signal",
    detectTitle: "Post-dinner peaks · 3 nights in a row",
    detectSignals: [
      { label: "Tue peak", value: "+42 mg/dL", alert: true },
      { label: "Wed peak", value: "+38 mg/dL", alert: true },
      { label: "Thu peak", value: "+35 mg/dL", alert: true },
      { label: "Shared factor", value: "White rice · no walk" },
    ],
    detectDecision: "Route to Maya · physician page NOT yet warranted.",
    detectTint: "#134E4A",
    orchSeverity: 62, orchSeverityBand: "MEDIUM-HIGH",
    orchContextTags: ["rice-3-nights", "no-post-meal-walk", "intervention-actionable"],
    orchChannel: "Lilly push (L2) · pre-dinner send window is intervention-actionable",
    orchTiming: "5:30 PM · 45 min before Sally's usual dinner",
  } as MockupData,
  console: {
    consoleFocusName: "Sally Reddy",
    consoleFocusInits: "SR",
    consoleFocusReason: "Dinner peaks · 3-night pattern",
    consoleFocusDetail: "3 consecutive nights: +42/+38/+35. Common thread: white rice, no post-meal walk. Suggest: rice-halving + walk challenge.",
    consoleFocusMeta: "GLP-1 · Wk 13",
    consoleCTA: "Text Sally",
  } as MockupData,
  draft: {
    draftTemplate: "lilly.cgm.dinner_pattern_gentle",
    draftPersonalization: ["Rice pattern", "Pre-dinner send"],
    draftSendWindow: "Fri 5:30 PM · pre-dinner window",
    draftPreviewTitle: "Small tweak, big win tonight.",
    draftPreviewBody: "Last 3 dinners peaked +42. Try ½ cup rice + a walk?",
  } as MockupData,
  push: {
    messageKicker: "Lilly Health · now",
    messageTitle: "Small tweak, big win tonight.",
    messageBody: "Your last 3 dinners peaked +42 mg/dL. Try ½ cup rice + a walk?",
    messageCaption: "Sent 45 min before your usual dinner",
  } as MockupData,
  thread: {
    messageTitle: "Small tweak, big win tonight.",
    messageBody: "Your last 3 dinners peaked +42 mg/dL. The common thread: white rice + no post-meal walk. Halve the rice tonight and take a 15-min walk — members like you drop peaks by 20+ mg/dL with this exact pair.",
    messageActions: [{ label: "Commit: ½ rice + walk", primary: true }, { label: "Show details" }, { label: "Not tonight" }],
  } as MockupData,
  acted: {
    messageTitle: "Small tweak, big win tonight.",
    messageBody: "Halve the rice + 15-min walk.",
    messageConfirmTitle: "Committed",
    messageConfirmBody: "Fathom will check your CGM at 9 PM.",
    messageTrace: "Action Engine armed. If tonight's peak > 30, re-nudge Saturday.",
  } as MockupData,
};

const spikeScenarios: Scenario[] = [
  // -------- L1
  {
    id: 1, levelName: L1.name, color: L1.color, tint: L1.tint,
    premise: "Three consecutive nights of +40 mg/dL dinner spikes. No user log needed — Fathom saw it.",
    outcome: "Fathom flags the pattern to Maya, weighs whether to page Dr Chen (not yet), and Maya sends a warm text through her usual channel. Lilly Health app stays unchanged.",
    steps: [
      { id: "u3l1s1", time: "Fri · 7:00 AM", actor: "Fathom", mockup: "fathom-detect", data: spikeShared.detect,
        title: "Overnight sweep: 3rd consecutive dinner spike.",
        description: "Fathom rolls CGM overnight and detects the 3rd consecutive post-dinner peak >+35 mg/dL. Cross-references food log (rice all 3 nights) and step log (no post-meal walk)." },
      { id: "u3l1s2", time: "Fri · 7:15 AM", actor: "Fathom", mockup: "coach-console", data: spikeShared.console,
        title: "Sally pinned #1 in Maya's queue with the 3-night pattern.",
        description: "Physician-escalation weight computed: below threshold. This is a coaching moment, not a clinical one — yet." },
      { id: "u3l1s3", time: "Fri · 9:00 AM", actor: "Coach", mockup: "coach-text",
        data: { messageTitle: "Noticed 3 dinner spikes.", messageBody: "Coffee this afternoon? Want to try a small rice swap tonight." },
        title: "Maya texts Sally on her normal number.",
        description: "Two-sentence text through Sally's usual coach channel. Nothing in the Lilly Health app changes." },
      { id: "u3l1s4", time: "Fri · 9:05 AM", actor: "Lilly", mockup: "lilly-home-unchanged",
        title: "Lilly Health app: unchanged.",
        description: "Zero UX change. The pattern lives in Maya's console and in Sally's text thread — not in her app." },
    ],
  },
  // -------- L2
  {
    id: 2, levelName: L2.name, color: L2.color, tint: L2.tint,
    premise: "Fathom sends one Lilly-branded pre-dinner nudge on Friday. Sally commits.",
    outcome: "Push arrives 45 min before dinner. Sally taps 'Commit: ½ rice + walk.' Fathom armed to re-check her CGM at 9 PM.",
    steps: [
      { id: "u3l2s1", time: "Fri · 7:00 AM", actor: "Fathom", mockup: "fathom-detect", data: spikeShared.detect,
        title: "Same detection — same 3-night pattern.",
        description: "Fathom detects the same signal as Level 1. Difference: Level 2 unlocks a Lilly-branded outbound message." },
      { id: "u3l2s2", time: "Fri · 5:30 PM", actor: "Fathom", mockup: "fathom-draft", data: spikeShared.draft,
        orchReasoning: {
          severity: "62 / 100 · MEDIUM-HIGH · physician page would trigger at 5 consecutive",
          context:  "rice-3-nights · no-post-meal-walk · intervention-actionable",
          pattern:  "cohort: rice-dinner-spikers · ½ rice + 15min walk = -20 mg/dL avg",
          channel:  "Lilly push (L2) · pre-dinner window is intervention-actionable",
          timing:   "5:30 PM · 45 min before Sally's usual dinner (actionable-window model, not open-rate)"
        },
        title: "Pre-dinner send window. Fathom drafts and fires.",
        description: "Send-time predictor knows Fridays: Sally usually eats 6:15 PM. Fathom fires at 5:30 PM — enough runway to change plans." },
      { id: "u3l2s3", time: "Fri · 5:30 PM", actor: "Lilly", mockup: "lock-notification", data: spikeShared.push,
        title: "Push arrives in Lilly Health.",
        description: "'Small tweak, big win tonight.' Copy is specific to her: mentions the +42 pattern." },
      { id: "u3l2s4", time: "Fri · 5:31 PM", actor: "Sally", mockup: "message-thread", data: spikeShared.thread,
        title: "Sally reads inside Lilly Health.",
        description: "In-app thread. Explains the 3-night pattern with the shared factor (rice + no walk). Names the specific tactic." },
      { id: "u3l2s5", time: "Fri · 5:32 PM", actor: "Sally", mockup: "message-acted", data: spikeShared.acted,
        title: "One tap: 'Commit: ½ rice + walk.'",
        description: "Fathom logs the commitment and arms a 9 PM CGM re-check. If the peak comes in over 30 mg/dL, Fathom re-nudges Saturday." },
      { id: "u3l2s6", time: "Fri · 9:15 PM", actor: "Fathom", mockup: "evening-confirm",
        data: {
          confirmKicker: "Peak dropped",
          confirmTitle: "Tonight: +18 mg/dL (was +42)",
          confirmBody: "½ rice + 14-min walk. Peak cut 57%. Fathom will nudge again tomorrow if the pattern returns.",
          confirmGradient: "linear-gradient(90deg,#10B981,#0EA5A4)",
        },
        title: "9 PM check: peak +18 — pattern broken.",
        description: "CGM confirms the win. Celebration card slides in the next time Sally opens the app." },
    ],
  },
  // -------- L3
  {
    id: 3, levelName: L3.name, color: L3.color, tint: L3.tint,
    premise: "Dinner-spike pattern shows up as a Fathom card in Sally's Lilly Health home feed.",
    outcome: "Sally sees the 3-night story in her feed, drills into the numbers, commits pre-dinner, and by 9 PM Fathom celebrates a peak cut from +42 to +18.",
    steps: [
      { id: "u3l3s1", time: "Fri · 7:00 AM", actor: "Fathom", mockup: "pattern-detected",
        data: {
          patternKicker: "Fathom · overnight sweep",
          patternTitle: "Dinner peaks · 3 nights climbing",
          patterns: [
            { label: "Peak trend", headline: "Tue +42 · Wed +38 · Thu +35", data: [24,28,32,42,38,35,35], color: "#F97316" },
            { label: "Shared factor", headline: "White rice all 3 nights · 0 walks", data: [0,0,1,0,0,0,0], color: "#F59E0B" },
          ],
          patternDecision: "Bundle → 1 hero card → home feed",
        },
        title: "Overnight sweep flags the 3-night rice pattern.",
        description: "Fathom bundles the peak trend and the shared-factor evidence into one home card." },
      { id: "u3l3s2", time: "Fri · 7:15 AM", actor: "Fathom", mockup: "cards-in-home",
        data: { homeCards: [
          { title: "Dinner peaks climbing · 3 nights", body: "Tue +42 · Wed +38 · Thu +35. Shared thread: rice + no walk." },
          { title: "Rice-swap wins tonight", body: "½ cup rice + 15-min walk = 20+ mg/dL lower peak for members like you." },
        ] },
        title: "Card lands in Sally's home feed.",
        description: "Positioned above the fold. Second supporting card offers the specific tactic." },
      { id: "u3l3s3", time: "Fri · 8:00 AM", actor: "Sally", mockup: "cards-in-home",
        data: { homeCards: [
          { title: "Dinner peaks climbing · 3 nights", body: "Tue +42 · Wed +38 · Thu +35. Shared thread: rice + no walk." },
          { title: "Rice-swap wins tonight", body: "½ cup rice + 15-min walk = 20+ mg/dL lower peak for members like you." },
        ] },
        title: "Sally opens Lilly Health, sees the pattern.",
        description: "First time she's seen these 3 nights linked together. The pattern was invisible to her — obvious to Fathom." },
      { id: "u3l3s4", time: "Fri · 8:02 AM", actor: "Sally", mockup: "card-expanded",
        data: {
          drillKicker: "Fathom noticed",
          drillTitle: "Dinner peaks · 3-night breakdown",
          drillHeadline: "Same rice, same skip on the walk, same +40 peak.",
          drillNumbers: [
            { label: "Tue peak", value: "+42", delta: "mg/dL", tone: "up-bad" },
            { label: "Wed peak", value: "+38", delta: "mg/dL", tone: "up-bad" },
            { label: "Thu peak", value: "+35", delta: "mg/dL", tone: "up-bad" },
          ],
          drillChartData: [24,28,32,42,38,35,35],
          drillChartLabel: "Dinner peak · last 7 nights",
          drillChartColor: L3.color,
          drillSuggestion: "Tonight: halve the rice + 15-min walk. Members drop 20+ mg/dL with that pair.",
          drillActions: [{ label: "Commit tonight", primary: true }, { label: "Later" }],
        },
        title: "Sally taps 'See how' — big numbers, no chart.",
        description: "Three peak numbers side by side. Chart is one tap away for the visual thinkers. Nu's suggestion sits below." },
      { id: "u3l3s5", time: "Fri · 8:04 AM", actor: "Sally", mockup: "card-committed",
        data: {
          commitTitle: "½ rice + 15-min walk tonight.",
          commitBody: "Fathom will re-check your CGM at 9 PM.",
          commitTrace: "Action Engine armed. Tomorrow's card depends on tonight's peak.",
        },
        title: "Sally commits.",
        description: "One tap logs the plan. Fathom arms the 9 PM re-check." },
      { id: "u3l3s6", time: "Fri · 9:15 PM", actor: "Fathom", mockup: "evening-confirm",
        data: {
          confirmKicker: "Pattern broken",
          confirmTitle: "Tonight: +18 mg/dL (was +42)",
          confirmBody: "½ rice + 14-min walk. Peak cut 57%. Best dinner CGM of the week.",
          confirmGradient: "linear-gradient(90deg,#10B981,#0EA5A4)",
        },
        title: "9 PM: peak +18 · pattern broken.",
        description: "Celebration card. Reinforces the exact combo that worked — Sally will reach for it again next week." },
    ],
  },
  // -------- L4
  {
    id: 4, levelName: L4.name, color: L4.color, tint: L4.tint,
    premise: "Sally opens the Insights tab. The Companion foregrounds the dinner-spike story.",
    outcome: "Full drill with the 3-night numbers side by side, in-line chat with Maya about the rice, and the Companion tracks tonight's peak — all inside Lilly Health.",
    steps: [
      { id: "u3l4s1", time: "Fri · 8:00 AM", actor: "Sally", mockup: "lilly-home-plain",
        title: "Sally opens Lilly Health.",
        description: "Insights-tab dot signals a fresh Fathom story." },
      { id: "u3l4s2", time: "Fri · 8:00 AM", actor: "Sally", mockup: "sally-taps-insights",
        title: "Taps the Insights tab.",
        description: "Companion loads inside Lilly Health's chrome." },
      { id: "u3l4s3", time: "Fri · 8:01 AM", actor: "Lilly", mockup: "companion-loaded",
        data: {
          companionMomentum: 76, companionMomentumLabel: "Strong", companionMomentumDelta: "-2 · pattern week",
          companionCards: [
            { title: "Dinner peaks · 3 nights climbing", body: "The story behind Tue/Wed/Thu." },
            { title: "Rice-swap wins tonight", body: "½ cup + walk = 20+ mg/dL lower." },
            { title: "Fri afternoon: pre-dinner reset", body: "Small tweak, big win tonight." },
          ],
          companionCTA: "Ask Maya about the rice",
        },
        title: "Companion opens on the dinner-spike hero.",
        description: "Momentum 76 (down 2 for the pattern week). Three cards. 'Ask Maya about the rice' — Fathom pre-loads the coach ask." },
      { id: "u3l4s4", time: "Fri · 8:02 AM", actor: "Sally", mockup: "companion-drill",
        data: {
          drillKicker: "Nu insight",
          drillTitle: "Dinner peaks · your 3-night pattern",
          drillHeadline: "3 nights, same shape. The rice is the shared factor.",
          drillNumbers: [
            { label: "Tue peak", value: "+42", delta: "mg/dL", tone: "up-bad" },
            { label: "Wed peak", value: "+38", delta: "mg/dL", tone: "up-bad" },
            { label: "Thu peak", value: "+35", delta: "mg/dL", tone: "up-bad" },
          ],
          drillChartData: [24,28,32,42,38,35,35],
          drillChartLabel: "Post-dinner peak · last 7 nights",
          drillChartColor: L4.color,
          drillSuggestion: "Halve the rice tonight + a 15-min walk. Expected peak: +18 to +22.",
          drillActions: [{ label: "Ask Maya", primary: true }, { label: "Log tonight" }],
        },
        title: "Sally taps the card → drill.",
        description: "Numbers first. Three peaks side by side. The chart is one tap. Nu's suggestion + optional Maya reach-out below." },
      { id: "u3l4s5", time: "Fri · 8:05 AM", actor: "Sally", mockup: "companion-chat",
        data: {
          chatContext: "Viewing: Dinner peaks · 3-night pattern",
          chatUser: "Should I skip the rice altogether?",
          chatReply: "Nope — halve it and add a walk. Full swap is a bigger change than we need this week.",
          chatReplyTime: "Maya replied · 4 min",
        },
        title: "Sally messages Maya from inside Companion.",
        description: "Chat opens with context pre-filled. Maya replies in 4 minutes with a specific, non-scary tweak." },
      { id: "u3l4s6", time: "Fri · 8:10 AM", actor: "Sally", mockup: "companion-return",
        data: {
          returnKicker: "Insights tab · Fathom Companion",
          returnBody: "Sally has a plan. Companion re-checks tonight's peak at 9 PM.",
        },
        title: "Sally returns to home. Companion re-checks at 9 PM.",
        description: "Companion state persists. Tomorrow's cards depend on tonight's peak." },
    ],
  },
];


// ============================================================================
// USE CASE 4 — Weight plateau (week 11) — coaching / motivational
// ============================================================================
const plateauShared = {
  detect: {
    detectStatus: "Behavioral signal",
    detectTitle: "Weight plateau · week 11 · morale downtrend",
    detectSignals: [
      { label: "Weight",     value: "Flat 3 wks · 176.4 lb" },
      { label: "Mood log",   value: "4 of 7 days: 'meh'", alert: true },
      { label: "Adherence",  value: "12/14 doses on time" },
      { label: "Habits",     value: "Walks + sleep unchanged" },
      { label: "Cohort hit", value: "68% plateau at wk 11" },
    ],
    detectDecision: "Route to Maya · reassurance call, not clinical.",
    detectTint: "#312E81",
    orchSeverity: 18, orchSeverityBand: "LOW",
    orchContextTags: ["week-11-plateau", "habits-still-strong", "morale-dip"],
    orchChannel: "Lilly push (L2) · reassurance template family (NOT corrective)",
    orchTiming: "3 min post-weigh-in · emotional-window model",
  } as MockupData,
  console: {
    consoleFocusName: "Sally Reddy",
    consoleFocusInits: "SR",
    consoleFocusReason: "Weight plateau · morale dip",
    consoleFocusDetail: "3 weeks flat after 8 wks of steady loss. Mood 'meh' 4/7. Habits still strong. Suggest: reassurance call, share physiology + cohort data.",
    consoleFocusMeta: "GLP-1 · Wk 13",
    consoleCTA: "Call Sally",
  } as MockupData,
  draft: {
    draftTemplate: "lilly.plateau.reassurance_science",
    draftPersonalization: ["Week 11 plateau", "Habits still strong"],
    draftSendWindow: "Mon 7:03 AM · post-weigh-in",
    draftPreviewTitle: "You're not stuck. Week 11 does this.",
    draftPreviewBody: "3 weeks flat is textbook for the body's week-11 recalibration.",
  } as MockupData,
  push: {
    messageKicker: "Lilly Health · now",
    messageTitle: "You're not stuck. Week 11 does this.",
    messageBody: "3 weeks flat is textbook. Your habits are still hitting — the pause is physiology.",
    messageCaption: "Sent 3 min after your weigh-in",
  } as MockupData,
  thread: {
    messageTitle: "You're not stuck. Week 11 does this.",
    messageBody: "Body recalibrates around week 11. Members like you break the plateau in 7-10 days if habits hold. Your walks, sleep, doses are all still on track — the pause is a body signal, not a failure signal.",
    messageActions: [{ label: "Show me the science", primary: true }, { label: "Save for later" }, { label: "Not now" }],
  } as MockupData,
  acted: {
    messageTitle: "You're not stuck. Week 11 does this.",
    messageBody: "Body recalibrates. Habits still hit.",
    messageConfirmTitle: "Saved · rejoin Friday",
    messageConfirmBody: "Nu will let you know the moment the plateau breaks.",
    messageTrace: "Friday weigh-in check-in armed. Plateau-break detection active.",
  } as MockupData,
};

const plateauScenarios: Scenario[] = [
  // -------- L1
  {
    id: 1, levelName: L1.name, color: L1.color, tint: L1.tint,
    premise: "Week 11. Sally steps on the scale — 176.4 lb, same as 3 weeks ago. Her mood log has been 'meh' 4 of 7 days.",
    outcome: "Fathom recognizes a textbook plateau + morale dip, routes to Maya. Maya calls with the science and the reassurance. Lilly Health app stays quiet — Sally doesn't need another notification when she's already discouraged.",
    steps: [
      { id: "u4l1s1", time: "Mon · 7:00 AM", actor: "Sally", mockup: "plateau-weigh-in",
        title: "Sally weighs in. Same as three Mondays ago.",
        description: "176.4 lb again. Third Monday in a row. She logs 'meh' in the mood tile and puts the phone down." },
      { id: "u4l1s2", time: "Mon · 7:05 AM", actor: "Fathom", mockup: "fathom-detect", data: plateauShared.detect,
        title: "Fathom recognizes the pattern.",
        description: "Weight flat 3 weeks. Adherence 12/14. Walks + sleep unchanged. Mood 4/7 'meh'. All signals point to physiological plateau + morale dip — 68% of the cohort hits this at week 11." },
      { id: "u4l1s3", time: "Mon · 7:15 AM", actor: "Fathom", mockup: "coach-console", data: plateauShared.console,
        title: "Sally lands in Maya's queue as a reassurance call.",
        description: "Not a clinical concern. Not a coaching failure. Just a body doing what bodies do at week 11 — but Sally doesn't know that, so this is the moment a warm human voice matters most." },
      { id: "u4l1s4", time: "Mon · 10:00 AM", actor: "Coach", mockup: "coach-call",
        title: "Maya calls with the science and the reassurance.",
        description: "'Sally, this is textbook. Your body is recalibrating. In 7-10 days the scale usually starts moving again. Keep the walks, keep the doses — you're doing everything right.'" },
      { id: "u4l1s5", time: "Mon · 10:05 AM", actor: "Lilly", mockup: "lilly-home-unchanged",
        title: "Lilly Health app: unchanged.",
        description: "Sally didn't get a popup she didn't want on a morning she felt low. The intelligence quietly turned into a phone call, and the app stayed out of the way." },
    ],
  },
  // -------- L2
  {
    id: 2, levelName: L2.name, color: L2.color, tint: L2.tint,
    premise: "Same weigh-in. This time Fathom sends one Lilly-branded reassurance message 3 minutes after Sally stepped off the scale.",
    outcome: "Warm, specific, evidence-based push. Sally reads the science, saves it for later, and Fathom arms a Friday plateau-break check-in.",
    steps: [
      { id: "u4l2s1", time: "Mon · 7:00 AM", actor: "Sally", mockup: "plateau-weigh-in",
        title: "Sally weighs in. Same trigger.",
        description: "176.4 lb, third Monday running." },
      { id: "u4l2s2", time: "Mon · 7:05 AM", actor: "Fathom", mockup: "fathom-detect", data: plateauShared.detect,
        title: "Fathom detects the plateau + morale pattern.",
        description: "Same detection. Level 2 unlocks a Lilly-branded reassurance nudge." },
      { id: "u4l2s3", time: "Mon · 7:02 AM", actor: "Fathom", mockup: "fathom-draft", data: plateauShared.draft,
        orchReasoning: {
          severity: "18 / 100 · LOW · physiological (not a coaching failure)",
          context:  "week-11-plateau · habits-still-strong · morale-dip",
          pattern:  "cohort: wk11 plateaus · 68% hit this · break in 7-10 days if habits hold",
          channel:  "Lilly push (L2) · REASSURANCE template family (not corrective)",
          timing:   "3 min post-weigh-in · emotional-window model (not too fast, not too slow)"
        },
        title: "Fathom drafts the reassurance and picks the moment.",
        description: "Send window: 3 min after weigh-in. Not too fast (creepy), not too slow (already discouraged). Template chosen from Lilly's reassurance library." },
      { id: "u4l2s4", time: "Mon · 7:03 AM", actor: "Lilly", mockup: "lock-notification", data: plateauShared.push,
        title: "Push lands in Lilly Health.",
        description: "'You're not stuck. Week 11 does this.' Lilly-branded, calm, specific — nothing hollow or generic." },
      { id: "u4l2s5", time: "Mon · 7:05 AM", actor: "Sally", mockup: "message-thread", data: plateauShared.thread,
        title: "Sally taps in — reads the physiology explanation.",
        description: "In-app thread explains the week-11 recalibration, the 7-10 day typical resumption window, and calls out that HER habits are still hitting. Reframes 'stuck' as 'recalibrating'." },
      { id: "u4l2s6", time: "Mon · 7:06 AM", actor: "Sally", mockup: "message-acted", data: plateauShared.acted,
        title: "Sally taps 'Show me the science' · Friday check-in armed.",
        description: "Fathom logs the read, saves the science card for later, and arms a Friday weigh-in check-in with a plateau-break detector." },
    ],
  },
  // -------- L3
  {
    id: 3, levelName: L3.name, color: L3.color, tint: L3.tint,
    premise: "Plateau + morale story surfaces as Fathom cards in Sally's Lilly Health home feed.",
    outcome: "Sally sees the pattern reframed as physiology (not failure), drills into the 11-week trajectory numbers-first, commits to holding her routine, and Friday's -0.4 lb detection lands as a celebration card.",
    steps: [
      { id: "u4l3s1", time: "Mon · 7:05 AM", actor: "Fathom", mockup: "pattern-detected",
        data: {
          patternKicker: "Fathom · behavioral sweep",
          patternTitle: "Plateau + morale · week 11",
          patterns: [
            { label: "Weight",   headline: "Flat 3 weeks after 8 wks of loss",     data: [183,181,179,177,176.4,176.4,176.4], color: "#94A3B8" },
            { label: "Mood",     headline: "'Meh' 4/7 · was 1/7 two weeks ago",    data: [1,1,2,3,4,3,4], color: "#F59E0B" },
          ],
          patternDecision: "Bundle → 2 cards → home feed",
        },
        title: "Overnight sweep flags plateau + mood.",
        description: "Two signals bundle into a reframe: the plateau is physiology, the mood dip is the plateau's echo. Fathom sends both cards together so Sally sees the full picture." },
      { id: "u4l3s2", time: "Mon · 7:10 AM", actor: "Fathom", mockup: "cards-in-home",
        data: { homeCards: [
          { title: "Week 11 plateau — 68% of members hit this", body: "Your habits are still on track. The pause is body-side, not habit-side." },
          { title: "Your walks + sleep + doses = still strong", body: "The scale caught up 7-10 days ago for members like you." },
        ] },
        title: "Two 'Fathom noticed' cards drop into Lilly Health.",
        description: "Reframe cards — not corrective, not celebratory. Educational + reassuring. Positioned above the coaching card." },
      { id: "u4l3s3", time: "Mon · 8:00 AM", actor: "Sally", mockup: "cards-in-home",
        data: { homeCards: [
          { title: "Week 11 plateau — 68% of members hit this", body: "Your habits are still on track. The pause is body-side, not habit-side." },
          { title: "Your walks + sleep + doses = still strong", body: "The scale caught up 7-10 days ago for members like you." },
        ] },
        title: "Sally opens the app, sees the reframe.",
        description: "'68% hit this?' She thought she was failing. Turns out she's on the well-worn path — the app tells her before she can talk herself into quitting." },
      { id: "u4l3s4", time: "Mon · 8:02 AM", actor: "Sally", mockup: "card-expanded",
        data: {
          drillKicker: "Fathom noticed",
          drillTitle: "Week 11 plateau · your trajectory",
          drillHeadline: "8 weeks of loss, then 3 flat. Both are the program working.",
          drillNumbers: [
            { label: "Total loss",   value: "-6.6 lb", delta: "8 wks",     tone: "down-good" },
            { label: "Flat weeks",   value: "3",       delta: "wks 9-11",  tone: "neutral" },
            { label: "Typical break",value: "wk 12-13", delta: "for cohort", tone: "down-good" },
          ],
          drillChartData: [183,181,179,177,176.4,176.4,176.4],
          drillChartLabel: "Weight · last 7 weigh-ins",
          drillChartColor: L3.color,
          drillSuggestion: "Hold your routine. Weigh again Friday. Nu will flag the break.",
          drillActions: [{ label: "Hold my routine", primary: true }, { label: "Later" }],
        },
        title: "Sally drills in — numbers first.",
        description: "Three big numbers reframe the story: 6.6 lb lost, 3 flat weeks, typical break at wk 12-13. Chart is one tap for the visual thinkers." },
      { id: "u4l3s5", time: "Mon · 8:04 AM", actor: "Sally", mockup: "card-committed",
        data: {
          commitTitle: "Hold the routine. Weigh Friday.",
          commitBody: "Fathom will flag the break the moment it happens.",
          commitTrace: "Plateau-break detector armed. Weekly weigh-in check-in scheduled Friday 7 AM.",
        },
        title: "Sally commits: 'Hold the routine.'",
        description: "One tap arms Friday's check-in and a plateau-break detector so she gets the good news the second there's good news." },
      { id: "u4l3s6", time: "Fri · 7:02 AM", actor: "Fathom", mockup: "evening-confirm",
        data: {
          confirmKicker: "Plateau broke",
          confirmTitle: "-0.4 lb · plateau broke on schedule",
          confirmBody: "176.0 lb this morning. The pause was a recalibration, exactly as predicted. Cohort typical: 7-10 days.",
          confirmGradient: "linear-gradient(90deg,#7C3AED,#4F5FE5)",
        },
        title: "Friday: -0.4 lb · plateau breaks on schedule.",
        description: "Fathom converts the win into a small celebration card the moment Sally opens the app — reinforcing that holding the routine worked, exactly like the card said it would." },
    ],
  },
  // -------- L4
  {
    id: 4, levelName: L4.name, color: L4.color, tint: L4.tint,
    premise: "Sally opens the Insights tab. Companion foregrounds the plateau story with the full trajectory + Nu's reassurance.",
    outcome: "Deep numbers, in-line chat with Maya asking 'Am I doing something wrong?', warm reply that reframes the moment. Companion tracks Friday's plateau-break.",
    steps: [
      { id: "u4l4s1", time: "Mon · 8:00 AM", actor: "Sally", mockup: "lilly-home-plain",
        title: "Sally opens Lilly Health.",
        description: "Insights-tab dot signals a Fathom story is waiting. She's feeling low — this is exactly the day to open it." },
      { id: "u4l4s2", time: "Mon · 8:00 AM", actor: "Sally", mockup: "sally-taps-insights",
        title: "Taps the Insights tab.",
        description: "Companion loads inside Lilly Health's chrome." },
      { id: "u4l4s3", time: "Mon · 8:01 AM", actor: "Lilly", mockup: "companion-loaded",
        data: {
          companionMomentum: 71, companionMomentumLabel: "Strong · plateau week", companionMomentumDelta: "-3 · adherence still A+",
          companionCards: [
            { title: "Week 11 plateau · you're not stuck", body: "68% of members hit this. Tap for the story." },
            { title: "Your habits are still hitting", body: "Walks + sleep + doses all on track." },
            { title: "Plateau typically breaks wk 12-13", body: "Nu will flag the moment it does." },
          ],
          companionCTA: "Ask Maya",
        },
        title: "Companion opens on today's reframe.",
        description: "Momentum 71 (down 3 for the plateau week, but adherence still A+). Three reassurance cards, plus 'Ask Maya' — Fathom knows this is a moment where a coach voice lands better than data alone." },
      { id: "u4l4s4", time: "Mon · 8:02 AM", actor: "Sally", mockup: "companion-drill",
        data: {
          drillKicker: "Nu insight",
          drillTitle: "Week 11 plateau · full trajectory",
          drillHeadline: "8 weeks of loss, then 3 flat. Both are the program working — different phases.",
          drillNumbers: [
            { label: "Loss so far", value: "-6.6", delta: "lb in 11 wks", tone: "down-good" },
            { label: "Flat weeks",  value: "3",    delta: "wks 9-11",     tone: "neutral" },
            { label: "Break window",value: "7-10", delta: "days typical", tone: "down-good" },
          ],
          drillChartData: [183,181,179,177,176.4,176.4,176.4],
          drillChartLabel: "Weight · last 7 weigh-ins",
          drillChartColor: L4.color,
          drillSuggestion: "Hold the routine. Weigh again Friday. Nu flags the moment the plateau breaks.",
          drillActions: [{ label: "Ask Maya", primary: true }, { label: "Hold routine" }],
        },
        title: "Sally taps the plateau card → drill.",
        description: "Numbers first: -6.6 lb, 3 flat weeks, 7-10 day break window. Chart one tap away. Nu's suggestion below, with 'Ask Maya' as the primary action — this is a coaching moment, not a data moment." },
      { id: "u4l4s5", time: "Mon · 8:05 AM", actor: "Sally", mockup: "companion-chat",
        data: {
          chatContext: "Viewing: Week 11 plateau · full trajectory",
          chatUser: "Am I doing something wrong?",
          chatReply: "Nothing. Your habits are still on the honor roll — 12/14 doses, 5 walks, sleep steady. Your body is recalibrating, which is exactly what should happen at week 11. Give it 7-10 days.",
          chatReplyTime: "Maya replied · 3 min",
        },
        title: "Sally messages Maya: 'Am I doing something wrong?'",
        description: "The most important sentence a member says on a plateau week. Maya sees the context Fathom pre-filled and answers the real question — the one behind the question. 3-minute reply." },
      { id: "u4l4s6", time: "Mon · 8:10 AM", actor: "Sally", mockup: "companion-return",
        data: {
          returnKicker: "Insights tab · Fathom Companion",
          returnBody: "Sally has a reframe. Companion will flag the plateau break the moment it happens.",
        },
        title: "Sally back to home, plan in hand.",
        description: "Everything happened inside Lilly Health. Companion state persists for Friday's plateau-break moment." },
    ],
  },
];


// ============================================================================
// USE CASE 5 — Building the evening-walk habit (habit psychology)
// Fogg B=MAP · anchor-stacking · implementation intentions · streaks · celebration
// ============================================================================
const walkHabitShared = {
  detect: {
    detectStatus: "Habit signal",
    detectTitle: "Walk pattern sporadic · anchor available",
    detectSignals: [
      { label: "Walks",        value: "3 / 14 days", alert: true },
      { label: "Cohort lever", value: "#1 for you" },
      { label: "Anchor found", value: "Dinner 6:15 PM" },
      { label: "Fogg B=MAP",   value: "M-hi · A-easy · P-missing" },
    ],
    detectDecision: "Route to habit-formation play · anchor-stack the walk to dinner.",
    detectTint: "#134E4A",
    orchSeverity: 32, orchSeverityBand: "LOW",
    orchContextTags: ["habit-stage: trying", "anchor: dinner-6:15pm", "cohort-lever: evening-walk", "fogg-prompt: missing"],
    orchChannel: "Habit template family · anchor prompt (NOT corrective / NOT reassurance)",
    orchTiming: "5:45 PM · 30 min pre-dinner (planning window, not action window)",
  } as MockupData,
  console: {
    consoleFocusName: "Sally Reddy",
    consoleFocusInits: "SR",
    consoleFocusReason: "Walk habit forming · dinner anchor available",
    consoleFocusDetail: "3/14 walk days. Dinner (6:15 PM) is a strong existing habit. Fogg B=MAP: motivation high, ability easy, prompt missing. Suggest: implementation-intention setup, anchor-stack walk to dinner.",
    consoleFocusMeta: "GLP-1 · Wk 13 · Habit forming",
    consoleCTA: "Call Sally",
  } as MockupData,
  draft: {
    draftTemplate: "lilly.habit.anchor_intention_walk",
    draftPersonalization: ["Anchor: after dinner", "Implementation intention scaffold"],
    draftSendWindow: "Mon 5:45 PM · pre-dinner planning window",
    draftPreviewTitle: "Tonight's tiny win: shoes on right after dinner.",
    draftPreviewBody: "15 min walk. Anchored to dinner so it sticks.",
  } as MockupData,
  push: {
    messageKicker: "Lilly Health · now",
    messageTitle: "Tonight's tiny win: shoes on right after dinner.",
    messageBody: "15 min walk. Anchored to dinner so it sticks — no willpower needed.",
    messageCaption: "Sent 30 min before your usual dinner",
  } as MockupData,
  intention: {
    habitName: "Evening walk",
    habitAnchor: "After dinner",
    habitAnchorReason: "Sally's strongest existing habit — 6:15 PM daily, 47 days running",
    habitIntentionIf: "I finish dinner tonight",
    habitIntentionThen: "put on my shoes and walk for 15 min",
    habitCohortLift: "Members who anchor to an existing habit are 4x more likely to make it stick vs. willpower alone.",
  } as MockupData,
};

const walkHabitScenarios: Scenario[] = [
  // -------- L1
  {
    id: 1, levelName: L1.name, color: L1.color, tint: L1.tint,
    premise: "Sally wants to walk more but hasn't found the rhythm — 3 walks in the past 14 days. Fathom identifies her strongest existing habit (dinner) as the anchor.",
    outcome: "Fathom recognizes the walk-habit gap AND the anchor opportunity. Routes to Maya with a habit-formation playbook. Maya calls with an anchor-stack plan. Lilly Health app stays quiet — the habit conversation happens over the phone.",
    steps: [
      { id: "u5l1s1", time: "Sun · 7:00 PM", actor: "Sally", mockup: "walk-log-trigger",
        title: "Sally sees her walk log. 3 of the last 14 days.",
        description: "She opens Lilly Health, glances at movement — sporadic. She wants to walk more but hasn't found the rhythm." },
      { id: "u5l1s2", time: "Sun · 7:15 PM", actor: "Fathom", mockup: "fathom-detect", data: walkHabitShared.detect,
        title: "Fathom finds the gap AND the anchor.",
        description: "3/14 walk days. But Sally has dinner at 6:15 PM every night — a strong existing habit and the perfect anchor. Fogg's Behavior Model says motivation + ability are already there; the missing piece is the prompt." },
      { id: "u5l1s3", time: "Mon · 7:30 AM", actor: "Fathom", mockup: "coach-console", data: walkHabitShared.console,
        orchReasoning: {
          severity: "32 / 100 · LOW · habit-formation play, not clinical",
          context:  "habit-stage: trying · anchor-available: dinner-6:15pm (47 days) · Fogg B=MAP: motivation-hi · ability-easy · prompt-missing",
          pattern:  "Anchor-stacked habits stick 4x more than willpower-based · cohort n=1.8k · Clear (2018)",
          channel:  "Coach call (L1 default) — warmest channel for behavior-change conversation, no in-app friction on top of an already-effortful ask",
          timing:   "Mon 10 AM · Fresh Start Effect (Dai & Milkman 2014) · Monday adoption +27% vs mid-week"
        },
        title: "Sally lands in Maya's queue with a habit-formation play.",
        description: "Reason chip pre-fills with the Fogg diagnosis + anchor recommendation. Maya doesn't have to figure out the play — Fathom already did." },
      { id: "u5l1s4", time: "Mon · 10:00 AM", actor: "Coach", mockup: "coach-call",
        title: "Maya calls. Anchor-stack the walk.",
        description: "'Sally, let's stop trying to walk more. Let's tie it to dinner. Right after you finish, shoes on — that's the whole rule. In two weeks it's automatic.'" },
      { id: "u5l1s5", time: "Mon · 10:05 AM", actor: "Lilly", mockup: "lilly-home-unchanged",
        title: "Lilly Health app: unchanged.",
        description: "The habit-formation conversation happened warmly, in the channel Sally trusts. The app was untouched." },
    ],
  },
  // -------- L2
  {
    id: 2, levelName: L2.name, color: L2.color, tint: L2.tint,
    premise: "Same gap. Fathom sends the anchor prompt at the pre-dinner planning window and captures Sally's implementation intention in-app.",
    outcome: "Fathom uses Fogg's Behavior Model to time the prompt for planning (not action), delivers an anchor-based nudge inside Lilly Health, and captures Sally's IF-THEN scaffold. Doubles behavior success vs. a vague reminder.",
    steps: [
      { id: "u5l2s1", time: "Sun · 7:00 PM", actor: "Sally", mockup: "walk-log-trigger",
        title: "Same trigger. 3 walks in 14 days.",
        description: "Sally sees the sporadic log — the awareness moment." },
      { id: "u5l2s2", time: "Sun · 7:15 PM", actor: "Fathom", mockup: "fathom-detect", data: walkHabitShared.detect,
        title: "Fathom detects the habit gap + anchor.",
        description: "Same detection. Level 2 unlocks the habit-shaped nudge rail." },
      { id: "u5l2s3", time: "Mon · 5:30 PM", actor: "Fathom", mockup: "fathom-draft", data: walkHabitShared.draft,
        orchReasoning: {
          severity: "32 / 100 · LOW · habit-formation, not corrective / not reassurance",
          context:  "habit-stage: trying · anchor: dinner-6:15pm · fogg-prompt: missing · fresh-start: Monday available",
          pattern:  "Members who anchor a new habit to an existing one: 4x more likely to stick (n=1.8k) · IF-THEN capture doubles follow-through (Gollwitzer 1999)",
          channel:  "Lilly push (L2) + habit-template family + in-app IF-THEN scaffold on tap-in — pairs the delivery with the capture in one flow",
          timing:   "5:45 PM · PLANNING window (30 min pre-dinner) — pre-cue prompts get 2.6x follow-through vs at-cue prompts (JITAI literature)"
        },
        title: "Fathom drafts the anchor prompt for the planning window.",
        description: "Send window predictor picks 5:45 PM — 30 min BEFORE her usual dinner. This is the planning window, not the action window. Members who see anchor prompts before the cue are 2.6x more likely to act on them." },
      { id: "u5l2s4", time: "Mon · 5:45 PM", actor: "Lilly", mockup: "lock-notification", data: walkHabitShared.push,
        title: "Push arrives in Lilly Health.",
        description: "'Tonight's tiny win: shoes on right after dinner.' Anchor-based framing, not a to-do list." },
      { id: "u5l2s5", time: "Mon · 5:47 PM", actor: "Sally", mockup: "habit-intention-capture", data: walkHabitShared.intention,
        title: "Sally captures her implementation intention.",
        description: "Gollwitzer's IF-THEN scaffold: 'After I finish dinner tonight, I will put on my shoes and walk for 15 min.' Filling this in doubles the odds she'll actually do it vs. a vague 'try to walk more.'" },
      { id: "u5l2s6", time: "Mon · 8:15 PM", actor: "Fathom", mockup: "evening-confirm",
        data: {
          confirmKicker: "Cementing",
          confirmTitle: "17-min walk · anchor worked",
          confirmBody: "Right after dinner. First time in 2 weeks. Habit stage: Trying → toward Sticky (day 4 of 14 to stick).",
          confirmGradient: "linear-gradient(90deg,#0EA5A4,#059669)",
        },
        title: "Evening: walk done · micro-celebration.",
        description: "Fogg's rule: celebrate within 3 seconds. Nu logs the completion, marks day 4 of 14 toward the Sticky stage. Habit forming, not habit lecturing." },
    ],
  },
  // -------- L3
  {
    id: 3, levelName: L3.name, color: L3.color, tint: L3.tint,
    premise: "Fathom drops habit-shaped cards into Lilly Health with the anchor + cohort proof + IF-THEN capture.",
    outcome: "Sally sees the walk pattern reframed as a habit-formation opportunity, drills into the Fogg diagnosis + habit stage + IF-THEN scaffold, commits, and by evening Nu celebrates the completion as habit-cementing.",
    steps: [
      { id: "u5l3s1", time: "Mon · 7:00 AM", actor: "Fathom", mockup: "pattern-detected",
        data: {
          patternKicker: "Fathom · habit sweep",
          patternTitle: "Walk gap · anchor available",
          patterns: [
            { label: "Walks",  headline: "3 of last 14 days · sporadic",        data: [1,0,1,0,0,0,1], color: "#F97316" },
            { label: "Anchor", headline: "Dinner 6:15 PM · 47 days · rock solid", data: [1,1,1,1,1,1,1], color: "#0EA5A4" },
          ],
          patternDecision: "Bundle → habit cards → home feed",
        },
        title: "Overnight sweep flags the walk gap AND the dinner anchor.",
        description: "Fathom bundles them: the gap is the target, the anchor is the vehicle. Habit-stacking psychology says pair a new habit to an existing one." },
      { id: "u5l3s2", time: "Mon · 7:15 AM", actor: "Fathom", mockup: "cards-in-home",
        data: { homeCards: [
          { title: "Evening walks: your #1 lever this week", body: "Days you walked had 15% higher TIR. Members like you keep it stickiest by anchoring." },
          { title: "Anchor tonight: after dinner", body: "Your strongest habit is dinner 6:15 PM. Pair the walk to it — no willpower needed." },
        ] },
        orchReasoning: {
          severity: "32 / 100 · LOW · habit-formation card family",
          context:  "habit-stage: trying · anchor-available: dinner · cohort-lever: evening-walk · fogg-prompt: missing",
          pattern:  "Card pairs (WHY + HOW) outperform single cards 3.1x for habit formation · one sells the lever, one sells the anchor",
          channel:  "In-feed cards (L3) · WHY-card (cohort lever) + HOW-card (anchor to dinner) = habit-stacking psychology made visible",
          timing:   "Morning drop (7:15 AM) · reviewed in Sally's 6-9 AM app-open peak · positioned above the coaching card in the feed"
        },
        title: "Two habit-shaped cards drop into Lilly Health.",
        description: "One card sells the WHY (cohort lever + numbers). The other sells the HOW (anchor to existing habit). Together they reframe 'walk more' as 'anchor a tiny habit'." },
      { id: "u5l3s3", time: "Mon · 8:00 AM", actor: "Sally", mockup: "cards-in-home",
        data: { homeCards: [
          { title: "Evening walks: your #1 lever this week", body: "Days you walked had 15% higher TIR. Members like you keep it stickiest by anchoring." },
          { title: "Anchor tonight: after dinner", body: "Your strongest habit is dinner 6:15 PM. Pair the walk to it — no willpower needed." },
        ] },
        title: "Sally opens Lilly Health, sees the habit story.",
        description: "'Oh — I don't have to remember. I just do it after dinner.' The cognitive load of building a new habit collapses." },
      { id: "u5l3s4", time: "Mon · 8:02 AM", actor: "Sally", mockup: "card-expanded",
        data: {
          drillKicker: "Fathom noticed",
          drillTitle: "Evening walk · anchor to dinner",
          drillHeadline: "Anchoring beats willpower — 4x more likely to stick.",
          drillNumbers: [
            { label: "Walks · 14d", value: "3", delta: "sporadic", tone: "up-bad" },
            { label: "Anchor",      value: "6:15", delta: "PM dinner", tone: "up-good" },
            { label: "Cohort lift", value: "4x",   delta: "vs willpower", tone: "up-good" },
          ],
          drillChartData: [1,0,1,0,0,0,1],
          drillChartLabel: "Walk days · last week",
          drillChartColor: L3.color,
          drillSuggestion: "Tonight: right after dinner, shoes on. 15 min. That's the whole rule.",
          drillActions: [{ label: "Set intention", primary: true }, { label: "Later" }],
          habitStage: "trying", habitAnchor: "After dinner",
          habitIntentionIf: "I finish dinner tonight",
          habitIntentionThen: "put on my shoes and walk 15 min",
        },
        title: "Sally drills in — habit stage + anchor + IF-THEN.",
        description: "Habit Ladder shows: Trying stage. Anchor identified. IF-THEN scaffold ready to fill. Numbers first, chart one tap." },
      { id: "u5l3s5", time: "Mon · 8:04 AM", actor: "Sally", mockup: "card-committed",
        data: {
          commitTitle: "Anchored: shoes on after dinner tonight.",
          commitBody: "Nu will check in at 8 PM.",
          commitTrace: "Habit engine armed · Fresh-Start Monday · streak initialized · celebration primed for completion.",
        },
        title: "Sally commits · intention captured.",
        description: "One tap. The IF-THEN gets logged. Fathom arms an 8 PM completion check-in with a micro-celebration ready to fire." },
      { id: "u5l3s6", time: "Mon · 8:15 PM", actor: "Fathom", mockup: "evening-confirm",
        data: {
          confirmKicker: "Cementing · day 4 of 14",
          confirmTitle: "17-min walk · anchor worked",
          confirmBody: "Right after dinner. First time in 2 weeks. Habit stage: Trying → 3 more days to Sticky.",
          confirmGradient: "linear-gradient(90deg,#0EA5A4,#059669)",
        },
        title: "Evening: walk done · celebration + streak lit.",
        description: "Fogg's celebration rule fires. Streak dot lights up. Nu names the stage transition ('3 more days to Sticky') to make progress feel tangible — pulling loss aversion + progress-bar psychology together." },
    ],
  },
  // -------- L4
  {
    id: 4, levelName: L4.name, color: L4.color, tint: L4.tint,
    premise: "Sally opens the Insights tab. The Companion foregrounds the Habit Ladder — walk habit at the Trying stage with the dinner anchor.",
    outcome: "Deep habit-formation experience: Fogg B=MAP breakdown, anchor + intention scaffold, cohort proof, in-line coach chat about what-if-I-forget, streak protection, and evening celebration. All inside Lilly Health.",
    steps: [
      { id: "u5l4s1", time: "Mon · 8:00 AM", actor: "Sally", mockup: "lilly-home-plain",
        title: "Sally opens Lilly Health.",
        description: "Insights dot signals a Fathom story waiting." },
      { id: "u5l4s2", time: "Mon · 8:00 AM", actor: "Sally", mockup: "sally-taps-insights",
        title: "Taps the Insights tab.",
        description: "Companion loads inside Lilly Health's chrome." },
      { id: "u5l4s3", time: "Mon · 8:01 AM", actor: "Lilly", mockup: "companion-loaded",
        data: {
          companionMomentum: 72, companionMomentumLabel: "Strong · building", companionMomentumDelta: "+2 · walk-habit forming",
          companionCards: [
            { title: "Evening walk · Trying stage", body: "Anchor to dinner. 3/14 days · tap to shape." },
            { title: "Your dinner anchor is rock solid", body: "47 days at 6:15 PM. Stack the walk here." },
            { title: "4x lift when members anchor", body: "Cohort proof: anchored habits stick 4x more." },
          ],
          companionCTA: "Ask Maya about the anchor",
          habitName: "Evening walk", habitStage: "trying",
          habitAnchor: "After dinner",
          habitDaysDone: 3, habitDaysWindow: 14,
        },
        orchReasoning: {
          severity: "32 / 100 · LOW · habit-formation focal card",
          context:  "habit-stage: trying · anchor: after-dinner · IF-THEN captured · streak: initializing · Momentum -2 (expected during forming-week)",
          pattern:  "Momentum dips during habit-forming weeks are normal & recoverable · n=4.2k cohort · Habit Ladder progression predicts 78% adherence at week 4",
          channel:  "Companion (L4) · Habit Ladder hero + Fogg B=MAP as the drill numbers + Ask-Maya pinned for moment-of-doubt (\"what if I forget?\")",
          timing:   "8 AM · Fresh Start Monday · Sally\'s typical Insights-tab open window (78% open probability)"
        },
        title: "Companion opens on the habit story.",
        description: "Momentum 72 (walk-habit forming). Habit Ladder card front and center: Evening walk · Trying stage · 3/14 days · anchored to dinner. 'Ask Maya' pre-loaded for the moment-of-doubt." },
      { id: "u5l4s4", time: "Mon · 8:03 AM", actor: "Sally", mockup: "companion-drill",
        data: {
          drillKicker: "Nu insight",
          drillTitle: "Evening walk · anchor-stack setup",
          drillHeadline: "Anchoring beats willpower. Fogg B=MAP says you're primed.",
          drillNumbers: [
            { label: "Motivation", value: "hi",   delta: "cohort peer", tone: "up-good" },
            { label: "Ability",   value: "easy", delta: "15 min max",  tone: "up-good" },
            { label: "Prompt",    value: "add",  delta: "anchor: dinner", tone: "neutral" },
          ],
          drillChartData: [1,0,1,0,0,0,1],
          drillChartLabel: "Walk days · last 7",
          drillChartColor: L4.color,
          drillSuggestion: "After you finish dinner tonight, put on your shoes. That's the whole rule.",
          drillActions: [{ label: "Set intention", primary: true }, { label: "Ask Maya" }],
          habitStage: "trying", habitAnchor: "After dinner",
          habitIntentionIf: "I finish dinner tonight",
          habitIntentionThen: "put on my shoes and walk 15 min",
        },
        title: "Sally taps the habit card · Fogg B=MAP breakdown.",
        description: "Motivation high, ability easy, prompt is the missing piece. Numbers first, chart on tap. Nu's suggestion + IF-THEN scaffold visible for one-tap commit." },
      { id: "u5l4s5", time: "Mon · 8:06 AM", actor: "Sally", mockup: "companion-chat",
        data: {
          chatContext: "Viewing: Evening walk · Trying stage",
          chatUser: "What if I forget?",
          chatReply: "Stack the cue. Put your shoes by the door before you sit down for dinner — then they're the FIRST thing you see when you stand up. Environment does the remembering.",
          chatReplyTime: "Maya replied · 3 min",
        },
        title: "Sally messages Maya: 'What if I forget?'",
        description: "The most common habit-formation objection. Maya's answer draws on environment-design psychology (make the cue impossible to miss) — exactly the layer above the anchor." },
      { id: "u5l4s6", time: "Mon · 8:15 PM", actor: "Sally", mockup: "companion-return",
        data: {
          returnKicker: "Insights tab · Habit Ladder",
          returnBody: "Walk done. Habit stage: Trying → 3 more days to Sticky. Streak dot #4 lit. Nu celebrated within 3 sec (Fogg rule).",
        },
        title: "Evening: walk done · Habit Ladder progresses.",
        description: "The full loop fires: completion detected → 3-second Nu celebration → streak dot lit → stage transition ('3 more days to Sticky') → tomorrow's card pre-loaded. Habit forming inside Lilly Health end to end." },
    ],
  },
];

// ============================================================================
// USE_CASES catalog
// ============================================================================
export const USE_CASES: UseCase[] = [
  {
    id: "dose-miss", title: "Sunday dose miss", shortLabel: "Dose miss",
    category: "Medication adherence · behavioral",
    icon: "meds",
    premise: "Sally misses her Sunday semaglutide dose after family brunch.",
    scenarios: doseMissScenarios,
  },
  {
    id: "nausea", title: "Wednesday nausea flare-up", shortLabel: "Nausea flare",
    category: "Side-effect management · clinical",
    icon: "nausea",
    premise: "Day 4 after moving to 1mg. Sally rates nausea 4/5 and skips breakfast.",
    scenarios: nauseaScenarios,
  },
  {
    id: "dinner-spike", title: "Dinner glucose spike · 3 nights", shortLabel: "Dinner spike",
    category: "CGM pattern · metabolic",
    icon: "spike",
    premise: "Three consecutive nights of +35 mg/dL or higher post-dinner peaks.",
    scenarios: spikeScenarios,
  },
  {
    id: "plateau", title: "Week 11 weight plateau", shortLabel: "Plateau",
    category: "Motivational · behavioral",
    icon: "plateau",
    premise: "Week 11. Sally's weight has been flat 3 weeks after 8 weeks of steady loss. Mood log 'meh' 4 of 7 days. Habits still strong.",
    scenarios: plateauScenarios,
  },
  {
    id: "walk-habit", title: "Building the evening-walk habit", shortLabel: "Walk habit",
    category: "Habit formation · behavior psychology",
    icon: "habit",
    premise: "Sally wants to walk more but hasn't found the rhythm — 3 walks in 14 days. Fathom uses habit psychology (Fogg B=MAP + anchor-stacking + implementation intentions) to help her build it — anchored to her strongest existing habit: dinner.",
    scenarios: walkHabitScenarios,
  },
];

// Backward-compat alias for the original single-scenario import.
export const SCENARIOS = USE_CASES[0].scenarios;
