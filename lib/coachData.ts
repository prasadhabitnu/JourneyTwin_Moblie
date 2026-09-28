/**
 * Coach journey data — Maya Patel's day, 428-member panel.
 * Parallel structure to journeyData.ts (member journey).
 */

export type CoachStepId =
  | "morning-brief"
  | "session-calendar"
  | "priority-queue"
  | "nhi-triage"
  | "patient-ring-drill"
  | "cohort-pulse"
  | "cohort-ring-patterns"
  | "session-prep"
  | "mi-playbook"
  | "broadcast-design"
  | "physician-handoff"
  | "panel-insights"
  | "documentation"
  | "end-of-day";

export interface CoachStep {
  id: CoachStepId;
  emoji: string;
  name: string;
  subtitle: string;
  eyebrow: string;
  headline: string;
  hero: boolean;   // fully-built vs. stub
}

export const COACH_STEPS: CoachStep[] = [
  {
    id: "morning-brief",
    emoji: "🌅",
    name: "Morning Brief",
    subtitle: "Your day at a glance",
    eyebrow: "7:30 AM · Monday, Jul 6",
    headline: "Here's what Nu watched overnight.",
    hero: true,
  },
  {
    id: "session-calendar",
    emoji: "📆",
    name: "Session Calendar",
    subtitle: "Today's schedule + Nu prep",
    eyebrow: "Monday, Jul 6 · 6 sessions",
    headline: "Your day, with Nu's prep for each.",
    hero: true,
  },
  {
    id: "priority-queue",
    emoji: "🎯",
    name: "Priority Queue",
    subtitle: "3 members need you today",
    eyebrow: "The members who need Maya",
    headline: "Sally, Diane, and Amit — in that order.",
    hero: true,
  },
  {
    id: "nhi-triage",
    emoji: "💍",
    name: "NHI Triage",
    subtitle: "Panel sorted by Nu Health Index",
    eyebrow: "Ring · panel-wide today",
    headline: "Who needs what — by the numbers.",
    hero: true,
  },
  {
    id: "patient-ring-drill",
    emoji: "🔍",
    name: "Patient Ring Drill",
    subtitle: "Individual deep-dive",
    eyebrow: "Sally R. · Wk 13",
    headline: "Ring trend · best times · recipes.",
    hero: true,
  },
  {
    id: "cohort-pulse",
    emoji: "📊",
    name: "Cohort Pulse",
    subtitle: "Whole-panel snapshot",
    eyebrow: "428 members · week-in-review",
    headline: "Your panel this week.",
    hero: false,
  },
  {
    id: "cohort-ring-patterns",
    emoji: "🧬",
    name: "Cohort Ring Patterns",
    subtitle: "Aggregate patterns across your panel",
    eyebrow: "428 members · ring signals",
    headline: "What's rising across the panel — and where you can help many at once.",
    hero: true,
  },
  {
    id: "session-prep",
    emoji: "📋",
    name: "Session Prep",
    subtitle: "Sally's 10 AM 1:1",
    eyebrow: "Session in 22 minutes",
    headline: "Ready-to-run prep for Sally R.",
    hero: true,
  },
  {
    id: "mi-playbook",
    emoji: "🗣️",
    name: "MI Playbook",
    subtitle: "Behavioral scripts keyed to member band",
    eyebrow: "Motivational Interviewing · practice room",
    headline: "Meet the member where they are.",
    hero: true,
  },
  {
    id: "broadcast-design",
    emoji: "📢",
    name: "Broadcast Design",
    subtitle: "Send a cohort challenge",
    eyebrow: "One message · 400+ personalized versions",
    headline: "Draft, adapt, send.",
    hero: false,
  },
  {
    id: "physician-handoff",
    emoji: "🩺",
    name: "Physician Handoff",
    subtitle: "2 escalations pending",
    eyebrow: "Ready for physician review",
    headline: "Nu drafted the envelopes.",
    hero: false,
  },
  {
    id: "panel-insights",
    emoji: "🔬",
    name: "Panel Insights",
    subtitle: "Patterns Nu noticed",
    eyebrow: "What's shifting this week",
    headline: "Six patterns worth your attention.",
    hero: false,
  },
  {
    id: "documentation",
    emoji: "📝",
    name: "Documentation",
    subtitle: "SOAP notes drafted",
    eyebrow: "4 notes for your review",
    headline: "Nu drafted; you refine.",
    hero: false,
  },
  {
    id: "end-of-day",
    emoji: "🌙",
    name: "End-of-Day Recap",
    subtitle: "Your day, summarized",
    eyebrow: "5:15 PM · Wrapping up",
    headline: "You did good work today.",
    hero: true,
  },
];

// ============================================================================
// Maya Patel — coach persona
// ============================================================================
export const MAYA = {
  name: "Maya Patel",
  initials: "MP",
  tint: "#EF5C3E",
  role: "Health Coach · CDCES",
  panel: 428,
  cohortFocus: "GLP-1 · weeks 10-16",
  onCall: "9 AM - 5 PM PT",
  yearsCoaching: 6,
};

// ============================================================================
// Priority queue — the 3 members flagged for Maya today
// ============================================================================
export interface PriorityMember {
  id: string;
  name: string;
  initials: string;
  tint: string;
  ageWeek: string;        // e.g., "52 · week 13"
  urgency: "high" | "medium" | "low";
  headline: string;       // one-line reason they're flagged
  nuNoticed: string[];    // 3 bullets
  nuPredicts: string;     // 1 line forecast
  nuSuggests: string;     // Nu's recommended coach action
  suggestedActions: { label: string; kind: "primary" | "secondary" }[];
  lastContact: string;    // "3 days ago"
  tir7d: number;          // Time-in-Range %
  tirTrend: number;       // pct-point change vs. prior week
}

export const PRIORITY_MEMBERS: PriorityMember[] = [
  {
    id: "sally-r",
    name: "Sally R.",
    initials: "SR",
    tint: "#7C6BFF",
    ageWeek: "52 · week 13",
    urgency: "medium",
    headline: "Skipped Sunday semaglutide dose. Fasting glucose up 12 mg/dL Monday morning.",
    nuNoticed: [
      "Second missed Sunday dose in 4 weeks — always Sunday morning.",
      "TIR climbed 71% → 87% overall; strong trend line otherwise.",
      "Reported 5/5 stress on Wed; afternoon glucose spiked in tandem.",
    ],
    nuPredicts: "If Sunday reminder isn't reset, expect a 3rd skip within 3 weeks (72% confidence).",
    nuSuggests: "Reset her Sunday dose reminder to Saturday evening (family-time-friendly). Celebrate the 87% TIR streak.",
    suggestedActions: [
      { label: "Open session prep", kind: "primary" },
      { label: "Send Sunday reminder swap", kind: "secondary" },
      { label: "Add to next physician review", kind: "secondary" },
    ],
    lastContact: "3 days ago",
    tir7d: 87,
    tirTrend: +4,
  },
  {
    id: "diane-w",
    name: "Diane W.",
    initials: "DW",
    tint: "#F59E0B",
    ageWeek: "58 · week 22",
    urgency: "high",
    headline: "TIR dropped 6 pts this week. Motivation trending down 8 days.",
    nuNoticed: [
      "TIR down from 82% → 76% over 7 days. Post-lunch peaks are climbing.",
      "App opens dropped 40% week-over-week — first drop since enrollment.",
      "Reported knee pain 2x this week; walking cadence halved.",
    ],
    nuPredicts: "Without intervention, motivation collapse likely (68% confidence). Consider protective outreach today.",
    nuSuggests: "Warm phone check-in this afternoon. Physical-limits path (Steady & Simple) may be a better fit than her current Long Walker.",
    suggestedActions: [
      { label: "Call this afternoon", kind: "primary" },
      { label: "Switch her to Steady & Simple", kind: "secondary" },
      { label: "Escalate to physician (knee)", kind: "secondary" },
    ],
    lastContact: "9 days ago",
    tir7d: 76,
    tirTrend: -6,
  },
  {
    id: "amit-k",
    name: "Amit K.",
    initials: "AK",
    tint: "#059669",
    ageWeek: "44 · week 8",
    urgency: "medium",
    headline: "CGM MARD elevated — likely sensor issue, not glucose spike.",
    nuNoticed: [
      "CGM MARD jumped from 8% to 19% over 4 days.",
      "Two implausible-slope readings flagged by validator (>4 mg/dL/min).",
      "Amit himself reported the CGM 'feels loose' in yesterday's chat.",
    ],
    nuPredicts: "Sensor artifact — not a physiological event. Data from last 4 days should be quality-flagged in his summary.",
    nuSuggests: "Text Amit to swap sensor + downweight last 4 days in his weekly view. No clinical action needed.",
    suggestedActions: [
      { label: "Text sensor-swap instructions", kind: "primary" },
      { label: "Flag data for exclusion", kind: "secondary" },
    ],
    lastContact: "yesterday",
    tir7d: 74,
    tirTrend: 0,
  },
];

// ============================================================================
// Panel-level stats for Cohort Pulse / Morning Brief
// ============================================================================
export const PANEL_STATS = {
  total: 428,
  active7d: 401,
  priorityToday: 3,
  checkInToday: 12,
  doingWell: 385,
  broadcastsThisWeek: 2,
  physicianHandoffsPending: 2,
  soapNotesToReview: 4,
  cohortAvgTir: 82,
  cohortTirTrend: +2,
  streakingMembers: 6, // members who hit their walk streak this week
  atRiskMembers: 4,    // members trending down enough for concern
};

// ============================================================================
// Session prep for Sally (used by SessionPrep step)
// ============================================================================
export const SALLY_SESSION_PREP = {
  memberId: "sally-r",
  scheduledAt: "10:00 AM",
  minutesUntil: 22,
  duration: 25,
  channel: "video",
  summary:
    "Sally is 13 weeks in, doing well overall — TIR climbed 16 points to 87%, down 7 lbs. But she's skipped two consecutive Sunday doses, and reported 5/5 stress on Wed. She's ready for a re-anchor conversation, not a lecture.",
  agenda: [
    { minute: "0-3",   topic: "Warm open", note: "Ask about the family gathering she mentioned last time." },
    { minute: "3-8",   topic: "Celebrate the 87% TIR", note: "This is her best 14-day stretch of the program. Show the trend chart. Nu-generated congrats card ready." },
    { minute: "8-16",  topic: "Explore the Sunday dose skips", note: "Both misses are Sunday mornings. Sunday family brunches? Suggest moving reminder to Saturday evening (Nu drafted the swap language)." },
    { minute: "16-22", topic: "Discuss the evening-walk pattern", note: "6 of her top 7 TIR days had an evening walk. Reinforce Long Walker as the anchor." },
    { minute: "22-25", topic: "Close + next steps", note: "Confirm Saturday-evening reminder swap. Set next 1:1 in 2 weeks." },
  ],
  talkingPoints: [
    "Celebrate: TIR climbed from 71% → 87% in 14 days — best stretch of her program.",
    "Explore: two Sunday doses missed. Not a pattern of avoidance — likely a family-schedule collision. Suggest reminder swap.",
    "Reinforce: her evening walks are the #1 lever. Preserve the ritual.",
    "Watch: 5/5 stress last Wed correlated with an afternoon glucose bump. Introduce the 3 PM box-breathing option if time permits.",
  ],
  priorSessionNotes: [
    { date: "Jun 22", summary: "Set Long Walker as her path. Discussed post-dinner walk timing. She committed to 30-min-after-dinner window." },
    { date: "Jun 8",  summary: "Onboarding session. Established coach cadence at 2-week intervals. Consented to physician handoff for events > moderate severity." },
  ],
  suggestedOutcomes: [
    "Move Sunday dose reminder to Saturday 7 PM.",
    "Keep Long Walker as active path.",
    "Add box-breathing as optional 3 PM nudge (contingent on her stress trend).",
  ],
};

// ============================================================================
// End-of-day recap — Maya's debrief
// ============================================================================
export const END_OF_DAY = {
  timestamp: "5:15 PM",
  contactsMade: 3,
  contactsPlanned: 3,
  broadcastsSent: 1,
  broadcastReach: 312,
  physicianHandoffsSent: 2,
  soapNotesDrafted: 4,
  soapNotesApproved: 4,
  wins: [
    "6 members hit their walk streak this week — Nu queued congrats for tomorrow's morning brief.",
    "Sally R. accepted the Sunday-reminder swap. First proactive save of a dose-skip pattern this month.",
    "Amit K. sensor issue caught early — 4 days of noisy data flagged before it distorted his summary.",
  ],
  worries: [
    "Diane W. still declining — knee pain limits walking. Physician handoff sent to Dr. Chen for orthopedic consult.",
    "Cohort-wide: 4 members trending downward on TIR. None severe enough for individual outreach yet; watching.",
  ],
  tomorrow: [
    "5 members in tomorrow's priority queue (Nu pre-scored overnight).",
    "Diane W. follow-up — expect physician response by noon.",
    "New GLP-1 cohort (week 3) starts tomorrow — 12 members onboarded overnight.",
  ],
  totalMinutesSpent: 187,
  membersReached: 6,
  npsInboundToday: 4.7,
};

// ============================================================================
// Session Calendar — Maya's Monday, Jul 6 schedule with Nu insights per session
// ============================================================================

export type SessionKind = "video" | "phone" | "async" | "internal" | "group";
export type SessionUrgency = "urgent" | "regular" | "welcome" | "internal";

export interface CoachSession {
  id: string;
  time: string;              // "10:00 - 10:25"
  startMin: number;          // minutes from 8:00 AM for the timeline
  durationMin: number;
  kind: SessionKind;
  urgency: SessionUrgency;
  memberName: string;        // "Sally R." or "Team huddle" or "Dr. Chen"
  memberInitials: string;
  memberTint: string;
  memberContext?: string;    // "52 · week 13" or undefined for internal
  topic: string;             // "1:1 review" / "Warm outreach"
  nuInsight: string;         // Nu-generated prep summary
  nuFlags?: string[];        // Optional per-session Nu tags
  nuAdded?: boolean;         // true = Nu inserted this into the calendar today
  primaryActionLabel: string;
  primaryActionKind: "prep" | "join" | "start" | "review" | "send";
}

export const TODAY_SESSIONS: CoachSession[] = [
  {
    id: "s0",
    time: "8:00 - 8:15",
    startMin: 0,
    durationMin: 15,
    kind: "internal",
    urgency: "internal",
    memberName: "Team huddle",
    memberInitials: "TH",
    memberTint: "#64748B",
    topic: "Daily standup",
    nuInsight: "Nu queued 4 items for you to raise: cohort TIR trend, Diane's escalation, Sunday-reminder pattern across 6 members, and the week-3 cohort onboarding tomorrow.",
    primaryActionLabel: "Open agenda",
    primaryActionKind: "review",
  },
  {
    id: "s1",
    time: "10:00 - 10:25",
    startMin: 120,
    durationMin: 25,
    kind: "video",
    urgency: "regular",
    memberName: "Sally R.",
    memberInitials: "SR",
    memberTint: "#7C6BFF",
    memberContext: "52 · week 13 · Long Walker",
    topic: "Bi-weekly 1:1",
    nuInsight: "Ready for a re-anchor conversation about the Sunday dose skips. Celebrate her 87% TIR streak first. Full agenda + talking points prepped in Session Prep.",
    nuFlags: ["Session Prep ready", "SOAP note pre-drafted"],
    primaryActionLabel: "Open session prep",
    primaryActionKind: "prep",
  },
  {
    id: "s2",
    time: "11:30 - 11:45",
    startMin: 210,
    durationMin: 15,
    kind: "phone",
    urgency: "urgent",
    memberName: "Diane W.",
    memberInitials: "DW",
    memberTint: "#F59E0B",
    memberContext: "58 · week 22 · Long Walker",
    topic: "Warm outreach",
    nuInsight: "TIR dropped 6 pts this week; app opens down 40%. Nu added this to your calendar overnight. Suggested tone: warm, curiosity-first, not corrective.",
    nuFlags: ["Nu-added today", "Physician handoff also drafted"],
    nuAdded: true,
    primaryActionLabel: "Prep with Nu",
    primaryActionKind: "prep",
  },
  {
    id: "s3",
    time: "1:00 - 1:20",
    startMin: 300,
    durationMin: 20,
    kind: "async",
    urgency: "regular",
    memberName: "Amit K.",
    memberInitials: "AK",
    memberTint: "#059669",
    memberContext: "44 · week 8 · Fiber-Forward",
    topic: "CGM sensor swap check-in",
    nuInsight: "Nu drafted the sensor-swap instructions + a note explaining why last 4 days of data are flagged. Ready to send; you review and dispatch.",
    nuFlags: ["Draft ready"],
    primaryActionLabel: "Review + send",
    primaryActionKind: "send",
  },
  {
    id: "s4",
    time: "2:00 - 2:30",
    startMin: 360,
    durationMin: 30,
    kind: "video",
    urgency: "welcome",
    memberName: "Rachel M.",
    memberInitials: "RM",
    memberContext: "47 · week 1 · onboarding",
    memberTint: "#EC4899",
    topic: "New patient onboarding",
    nuInsight: "First session. Nu prepped a warm welcome deck + baseline CGM read + a values-elicitation flow tuned to her stated goals (energy, family time, no scale focus).",
    nuFlags: ["Onboarding checklist ready", "Warm start prepped"],
    primaryActionLabel: "Open welcome prep",
    primaryActionKind: "prep",
  },
  {
    id: "s5",
    time: "3:30 - 4:00",
    startMin: 450,
    durationMin: 30,
    kind: "internal",
    urgency: "internal",
    memberName: "Dr. Chen review",
    memberInitials: "DC",
    memberTint: "#4F5FE5",
    topic: "Physician handoff sync",
    nuInsight: "Diane W. (orthopedic consult) + Robert P. (dose review at week 12). Envelopes drafted with structured decision support; Dr. Chen will review live with you.",
    nuFlags: ["2 envelopes ready"],
    primaryActionLabel: "Review envelopes",
    primaryActionKind: "review",
  },
  {
    id: "s6",
    time: "4:15 - 4:30",
    startMin: 495,
    durationMin: 15,
    kind: "group",
    urgency: "regular",
    memberName: "Cohort broadcast",
    memberInitials: "CB",
    memberTint: "#F59E0B",
    memberContext: "312 recipients (auto-adapted)",
    topic: "Hydration challenge",
    nuInsight: "One template, 312 personalized versions. Nu adapted for allergies, cultural preferences, and GLP-1 tolerance. Preview + send ready.",
    nuFlags: ["Auto-adapted", "Preview ready"],
    primaryActionLabel: "Preview + send",
    primaryActionKind: "send",
  },
];

// Week overview strip (Mon-Fri) — session density + priority markers
export interface DayLoad { day: string; label: string; total: number; urgent: number; isToday?: boolean; }
export const WEEK_OVERVIEW: DayLoad[] = [
  { day: "Mon", label: "Jul 6", total: 6, urgent: 1, isToday: true },
  { day: "Tue", label: "Jul 7", total: 4, urgent: 0 },
  { day: "Wed", label: "Jul 8", total: 5, urgent: 1 },
  { day: "Thu", label: "Jul 9", total: 3, urgent: 0 },
  { day: "Fri", label: "Jul 10", total: 4, urgent: 0 },
];

// ============================================================================
// Ring Panel — Nu Health Index across Maya's 428-member panel (top 20 rows)
// Feeds NhiTriage + CohortPatterns
// ============================================================================
export type RingBand = "care" | "recover" | "watch" | "steady" | "excellent";
export type RingFlag = "needs-physician" | "needs-coach" | "thriving" | "trending-down" | "recovering";

export interface RingPanelRow {
  id: string;
  name: string;
  initials: string;
  tint: string;
  week: number;                         // program week
  nhi: number;                          // 0..10
  nhiDelta7d: number;                   // change vs 7 days ago
  band: RingBand;
  flags: RingFlag[];
  headline: string;                     // one-line context
  activePattern?: string;               // e.g., "3-night dinner spike"
}

export const RING_BANDS: Record<RingBand, { label: string; min: number; tint: string; fg: string }> = {
  care:      { label: "Care",      min: 0,   tint: "#FEE2E2", fg: "#B91C1C" },
  recover:   { label: "Recover",   min: 4,   tint: "#FFEDD5", fg: "#C2410C" },
  watch:     { label: "Watch",     min: 6,   tint: "#FEF3C7", fg: "#B45309" },
  steady:    { label: "Steady",    min: 7.5, tint: "#CCFBF1", fg: "#0F766E" },
  excellent: { label: "Excellent", min: 9,   tint: "#DCFCE7", fg: "#059669" },
};

export function bandFor(nhi: number): RingBand {
  if (nhi >= 9)   return "excellent";
  if (nhi >= 7.5) return "steady";
  if (nhi >= 6)   return "watch";
  if (nhi >= 4)   return "recover";
  return "care";
}

export const RING_PANEL: RingPanelRow[] = [
  // ---- Care (< 4)
  { id: "james-o",   name: "James O'Brien",  initials: "JO", tint: "#B91C1C", week: 8,  nhi: 3.2, nhiDelta7d: -1.4, band: "care",    flags: ["needs-physician", "trending-down"], headline: "SpO2 89% overnight · resp +5 · possible OSA episode", activePattern: "nocturnal-desat-3nights" },
  { id: "nora-l",    name: "Nora Liu",        initials: "NL", tint: "#B91C1C", week: 11, nhi: 3.8, nhiDelta7d: -0.9, band: "care",    flags: ["needs-physician"],                    headline: "Resting HR 92 · HRV -38% vs baseline · fever likely", activePattern: "febrile-signature" },
  // ---- Recover (4-6)
  { id: "sally-r",   name: "Sally Reddy",     initials: "SR", tint: "#E63946", week: 13, nhi: 5.8, nhiDelta7d: -1.2, band: "recover", flags: ["needs-coach", "recovering"],          headline: "URI signature detected 30h ago · Fathom escalated Wed",  activePattern: "URI-prodrome" },
  { id: "marcus-t",  name: "Marcus Thomas",   initials: "MT", tint: "#F97316", week: 9,  nhi: 5.4, nhiDelta7d: -0.6, band: "recover", flags: ["needs-coach"],                          headline: "Sleep -18% for 5 nights · stress up · anchor missing",  activePattern: "sleep-debt-cluster" },
  { id: "priya-m",   name: "Priya Menon",     initials: "PM", tint: "#F97316", week: 14, nhi: 4.6, nhiDelta7d: -0.8, band: "recover", flags: ["needs-coach"],                          headline: "3rd week weight plateau · mood 'meh' 5/7 days",         activePattern: "week-14-plateau" },
  // ---- Watch (6-7.5)
  { id: "diane-w",   name: "Diane Wright",    initials: "DW", tint: "#F59E0B", week: 12, nhi: 6.9, nhiDelta7d: -0.3, band: "watch",   flags: ["needs-coach"],                          headline: "TIR dropped to 68% · dinner spikes 2 nights",           activePattern: "dinner-spike-early" },
  { id: "amit-k",    name: "Amit Kapoor",     initials: "AK", tint: "#F59E0B", week: 10, nhi: 6.5, nhiDelta7d: 0.0,  band: "watch",   flags: ["needs-coach"],                          headline: "Skipped 2 dose logs · HRV drifting · morale watch" },
  { id: "linda-c",   name: "Linda Chen",      initials: "LC", tint: "#F59E0B", week: 15, nhi: 7.2, nhiDelta7d: -0.2, band: "watch",   flags: ["trending-down"],                       headline: "Activity down 22% · anchor available: dinner walk" },
  { id: "raj-g",     name: "Raj Ghosh",       initials: "RG", tint: "#F59E0B", week: 11, nhi: 6.3, nhiDelta7d: -0.4, band: "watch",   flags: ["needs-coach"],                          headline: "1mg escalation week · nausea 3/5 morning" },
  // ---- Steady (7.5-9)
  { id: "john-c",    name: "John Carter",     initials: "JC", tint: "#0EA5A4", week: 14, nhi: 8.1, nhiDelta7d: 0.4,  band: "steady",  flags: [],                                       headline: "Walking streak day 11 · TIR 84% · steady climb" },
  { id: "maria-s",   name: "Maria Santos",    initials: "MS", tint: "#0EA5A4", week: 13, nhi: 8.5, nhiDelta7d: 0.2,  band: "steady",  flags: [],                                       headline: "Anchor recipe locked · phone-off 9 PM habit stuck" },
  { id: "tara-o",    name: "Tara Owens",      initials: "TO", tint: "#0EA5A4", week: 9,  nhi: 7.8, nhiDelta7d: 0.1,  band: "steady",  flags: [],                                       headline: "Sleep window steady 5/7 nights · HRV baseline" },
  { id: "kenji-h",   name: "Kenji Hara",      initials: "KH", tint: "#0EA5A4", week: 12, nhi: 8.3, nhiDelta7d: 0.5,  band: "steady",  flags: ["recovering"],                          headline: "Broke week-11 plateau · -1.4 lb this week" },
  // ---- Excellent (9+)
  { id: "aisha-b",   name: "Aisha Brown",     initials: "AB", tint: "#059669", week: 16, nhi: 9.4, nhiDelta7d: 0.3,  band: "excellent", flags: ["thriving"],                          headline: "6 walks in 7 days · HRV +6 above baseline" },
  { id: "sanjay-p",  name: "Sanjay Patel",    initials: "SP", tint: "#059669", week: 18, nhi: 9.6, nhiDelta7d: 0.1,  band: "excellent", flags: ["thriving"],                          headline: "All 8 vitals in green 5 days running" },
  { id: "erin-b",    name: "Erin Baker",      initials: "EB", tint: "#059669", week: 17, nhi: 9.2, nhiDelta7d: 0.4,  band: "excellent", flags: ["thriving"],                          headline: "Consistent recipe · morning sunlight + walk anchor" },
  { id: "malik-j",   name: "Malik Johnson",   initials: "MJ", tint: "#059669", week: 20, nhi: 9.8, nhiDelta7d: 0.0,  band: "excellent", flags: ["thriving"],                          headline: "HbA1c projected 5.9% · exemplary member" },
  // Fill for realism
  { id: "carla-r",   name: "Carla Reyes",     initials: "CR", tint: "#F59E0B", week: 11, nhi: 7.1, nhiDelta7d: -0.1, band: "watch",   flags: [],                                       headline: "Hydration -20% · walk streak intact" },
  { id: "ben-y",     name: "Ben Yamada",      initials: "BY", tint: "#0EA5A4", week: 15, nhi: 8.0, nhiDelta7d: 0.1,  band: "steady",  flags: [],                                       headline: "Meds adherence 14/14 · consistent" },
  { id: "hana-w",    name: "Hana Winter",     initials: "HW", tint: "#F97316", week: 13, nhi: 5.6, nhiDelta7d: -0.5, band: "recover", flags: ["needs-coach"],                          headline: "Stress up 2 points · sleep fragmented 4 nights" },
];

// ============================================================================
// Cohort ring patterns — what's rising across the panel
// ============================================================================
export interface CohortPattern {
  id: string;
  label: string;
  affectedCount: number;                // # of members
  changeVsLastWeek: number;             // %
  severity: RingBand;
  driver: string;                        // shared factor
  coachAction: string;                   // what Maya can do at scale
}

export const COHORT_PATTERNS: CohortPattern[] = [
  {
    id: "wk11-plateau",
    label: "Week 11-14 weight plateau",
    affectedCount: 42,
    changeVsLastWeek: 18,
    severity: "watch",
    driver: "Physiological cohort effect — recovery in 7-10 days if habits hold",
    coachAction: "One reassurance broadcast · templated for cohort · Fathom pre-personalizes each",
  },
  {
    id: "monsoon-sleep",
    label: "Sleep-quality dip · weather-correlated",
    affectedCount: 28,
    changeVsLastWeek: 12,
    severity: "watch",
    driver: "Regional weather pattern · humidity + temperature stack",
    coachAction: "Group message about cooling + sleep-hygiene tactics · target region tag",
  },
  {
    id: "post-escalation-nausea",
    label: "1mg escalation nausea",
    affectedCount: 19,
    changeVsLastWeek: -6,
    severity: "recover",
    driver: "Week 4 of 1mg step · well-documented cohort trajectory",
    coachAction: "Nausea toolkit auto-armed · escalate to Nurse Line if score > 3 at 2 PM",
  },
  {
    id: "walk-anchor-adoption",
    label: "Evening-walk anchor · adoption rising",
    affectedCount: 63,
    changeVsLastWeek: 22,
    severity: "steady",
    driver: "Recipe adoption after last week's cohort broadcast",
    coachAction: "Reinforce this recipe · publish success stories · celebrate the streak",
  },
  {
    id: "coach-opp-hydration",
    label: "Hydration slipping in 24 members",
    affectedCount: 24,
    changeVsLastWeek: 8,
    severity: "watch",
    driver: "Shared factor: skipped morning water · pre-noon habit gap",
    coachAction: "One-question morning nudge · 'Full glass before 9 AM?' · templated across 24",
  },
];

// ============================================================================
// Panel-wide NHI distribution (for cohort histogram)
// ============================================================================
export const PANEL_NHI_DISTRIBUTION: Array<{ band: RingBand; count: number; pctPanel: number }> = [
  { band: "care",      count: 8,   pctPanel:  2 },
  { band: "recover",   count: 42,  pctPanel: 10 },
  { band: "watch",     count: 96,  pctPanel: 22 },
  { band: "steady",    count: 198, pctPanel: 46 },
  { band: "excellent", count: 84,  pctPanel: 20 },
];

// ============================================================================
// Recipes ranked by cross-panel reliability (for CohortPatterns "recipes that work")
// ============================================================================
export interface PanelRecipe {
  id: string;
  ingredients: string[];
  outcome: string;
  panelReliability: number;    // 0..100
  members: number;             // members reliably running this recipe
}
export const PANEL_RECIPES: PanelRecipe[] = [
  {
    id: "wind-down-evening",
    ingredients: ["Walk after dinner", "Phone off by 9 PM", "Sleep by 10:30"],
    outcome: "All-green next morning · avg NHI 9.2",
    panelReliability: 82,
    members: 187,
  },
  {
    id: "gentle-morning",
    ingredients: ["Wake with sunlight", "Hydrate before 9 AM", "Protein-first breakfast"],
    outcome: "All-green through 2 PM · stress -1",
    panelReliability: 74,
    members: 142,
  },
  {
    id: "dose-anchor-sunday",
    ingredients: ["Saturday-evening reminder", "Dose after coffee routine", "Log same minute"],
    outcome: "Sunday miss rate cut 3.4x",
    panelReliability: 79,
    members: 96,
  },
];
