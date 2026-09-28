/**
 * Journey Twin Ring — touchpoint definitions.
 * Every touchpoint = something Nu observes about Sally + what Nu has learned.
 * Grouped into the 5 twin layers from the patent memo.
 */

export type TwinLayer =
  | "physiological"
  | "behavioral"
  | "contextual"
  | "preference"
  | "motivation";

export interface TwinLayerDef {
  id: TwinLayer;
  label: string;
  color: string;      // deep tone
  tint: string;       // background tint
  arcColor: string;   // arc segment fill
  short: string;      // 1-line description
}

export const TWIN_LAYERS: TwinLayerDef[] = [
  { id: "physiological", label: "Physiological", color: "#4F5FE5", tint: "#EEF2FF", arcColor: "#C7D2FE",
    short: "How your body is doing" },
  { id: "behavioral",    label: "Behavioral",    color: "#059669", tint: "#ECFDF5", arcColor: "#A7F3D0",
    short: "How you're moving through your day" },
  { id: "contextual",    label: "Contextual",    color: "#B45309", tint: "#FFFBEB", arcColor: "#FDE68A",
    short: "The life around your day" },
  { id: "preference",    label: "Preference",    color: "#7C3AED", tint: "#F5F3FF", arcColor: "#DDD6FE",
    short: "What works for you and what doesn't" },
  { id: "motivation",    label: "Motivation",    color: "#BE185D", tint: "#FCE7F3", arcColor: "#FBCFE8",
    short: "How you're feeling about the journey" },
];

// ---- Touchpoint icons (SVG path definitions rendered inline) ----
export type IconKind =
  | "cgm" | "fasting" | "postmeal" | "hba1c" | "weight" | "hrv" | "heart" | "bp"
  | "walk" | "steps" | "meal" | "bed" | "sun" | "water" | "meds"
  | "work" | "family" | "travel" | "food_culture" | "allergy"
  | "food_like" | "activity_style" | "voice"
  | "engage" | "response" | "stress" | "mood" | "streak" | "coach";

export interface Touchpoint {
  id: string;
  layer: TwinLayer;
  icon: IconKind;
  label: string;
  observation: string;    // What Nu observes (data description)
  learned: string;        // What Nu has learned about Sally
  cadence: string;        // "continuous" / "3x daily" / "weekly" etc.
  contributesTo: string[]; // Related touchpoints (for connection lines)
}

// ---- The 28 touchpoints ----
export const TOUCHPOINTS: Touchpoint[] = [
  // ---------- Physiological (8) ----------
  { id: "cgm", layer: "physiological", icon: "cgm",
    label: "CGM stream",
    observation: "Continuous glucose monitoring, 5-minute samples with quality gating.",
    learned: "Your TIR climbed from 71% to 87% over the last 14 days. Post-dinner windows are your leverage moment.",
    cadence: "continuous",
    contributesTo: ["fasting", "postmeal", "hba1c", "meal", "walk"] },
  { id: "fasting", layer: "physiological", icon: "fasting",
    label: "Fasting glucose",
    observation: "Overnight-to-morning window; captured from the first CGM reading after 5 AM.",
    learned: "Fasting runs 12% lower on nights over 7.5 hours of sleep. Yesterday: 108 mg/dL (in range).",
    cadence: "daily",
    contributesTo: ["cgm", "bed", "sun"] },
  { id: "postmeal", layer: "physiological", icon: "postmeal",
    label: "Post-meal AUC",
    observation: "Area under the glucose curve for 3 hours after each meal.",
    learned: "Your dinner peaks dropped 22 mg/dL vs. week 1. Evening walks explain most of it.",
    cadence: "per meal",
    contributesTo: ["cgm", "meal", "walk"] },
  { id: "hba1c", layer: "physiological", icon: "hba1c",
    label: "HbA1c projection",
    observation: "Rolling 14-day estimated HbA1c derived from CGM.",
    learned: "Projecting 6.4% at your next lab draw — down from 7.1% at week 1.",
    cadence: "weekly",
    contributesTo: ["cgm"] },
  { id: "weight", layer: "physiological", icon: "weight",
    label: "Weight",
    observation: "Weight readings from your smart scale or manual entry.",
    learned: "Down 7 lbs over 14 days. Two flat mid-week days matched high-sodium dinners — that's water.",
    cadence: "as-you-weigh",
    contributesTo: [] },
  { id: "hrv", layer: "physiological", icon: "hrv",
    label: "HRV",
    observation: "Heart-rate variability from your wearable, 1-min RMSSD bins.",
    learned: "HRV drops on high-stress afternoons — matches your self-reported score within one day.",
    cadence: "continuous",
    contributesTo: ["stress"] },
  { id: "heart", layer: "physiological", icon: "heart",
    label: "Resting heart rate",
    observation: "Overnight resting heart rate baseline.",
    learned: "Your RHR is 68 bpm — down from 74 at week 1. Steady, consistent with weight loss.",
    cadence: "daily",
    contributesTo: [] },
  { id: "bp", layer: "physiological", icon: "bp",
    label: "Blood pressure",
    observation: "Manual entries when you cuff at home.",
    learned: "126/82 last reading. Trending down since starting GLP-1.",
    cadence: "weekly",
    contributesTo: [] },

  // ---------- Behavioral (7) ----------
  { id: "walk", layer: "behavioral", icon: "walk",
    label: "Walks",
    observation: "Walk sessions detected from activity + location.",
    learned: "3 evening walks in the last 5 days — Sunday's 40-min walk was your longest of the fortnight.",
    cadence: "opportunistic",
    contributesTo: ["cgm", "postmeal", "streak"] },
  { id: "steps", layer: "behavioral", icon: "steps",
    label: "Steps",
    observation: "Daily step count from wearable, 30-second energy bins.",
    learned: "You average 7,200/day. Days above 8,500 show 15% higher TIR.",
    cadence: "continuous",
    contributesTo: ["walk"] },
  { id: "meal", layer: "behavioral", icon: "meal",
    label: "Meals",
    observation: "Food photos + self-report + inferred windows from CGM shape.",
    learned: "20g breakfast protein holds your 10 AM glucose 40 mg/dL lower. Dosa mornings spike you.",
    cadence: "per meal",
    contributesTo: ["postmeal", "food_like", "food_culture"] },
  { id: "bed", layer: "behavioral", icon: "bed",
    label: "Sleep",
    observation: "Sleep epochs from wearable (light / deep / REM) + wake events.",
    learned: "Averaging 7.3 hours. Wake-time consistency is your #1 sleep-quality lever.",
    cadence: "nightly",
    contributesTo: ["fasting", "mood", "hrv"] },
  { id: "sun", layer: "behavioral", icon: "sun",
    label: "Wake time",
    observation: "First movement of the day recorded by wearable.",
    learned: "You're most consistent Mon-Fri at 6:45 AM. Weekends drift ~45 min later.",
    cadence: "daily",
    contributesTo: ["bed"] },
  { id: "water", layer: "behavioral", icon: "water",
    label: "Water",
    observation: "Logged from Update Me pill + inferred from streak patterns.",
    learned: "Hydrated days show 15% lower glucose variability. Two glasses before lunch is your biggest lever.",
    cadence: "self-logged",
    contributesTo: ["cgm"] },
  { id: "meds", layer: "behavioral", icon: "meds",
    label: "Semaglutide doses",
    observation: "Injection events from the pen or self-log.",
    learned: "12 of 14 doses on time. Both misses were Sundays — worth resetting the reminder.",
    cadence: "weekly",
    contributesTo: ["cgm", "fasting"] },

  // ---------- Contextual (5) ----------
  { id: "work", layer: "contextual", icon: "work",
    label: "Work schedule",
    observation: "Calendar signals + app-usage patterns.",
    learned: "Mon-Thu 9-5 in office. Fri work-from-home. Tue afternoons are your longest meeting block.",
    cadence: "learned over weeks",
    contributesTo: ["stress", "engage"] },
  { id: "family", layer: "contextual", icon: "family",
    label: "Family patterns",
    observation: "Life-event flags + Sunday dinner regularity signal.",
    learned: "Sunday family gatherings correlate with the missed doses. Reminder swap = Saturday evening.",
    cadence: "recurring",
    contributesTo: ["meds", "meal"] },
  { id: "travel", layer: "contextual", icon: "travel",
    label: "Travel",
    observation: "Location anomalies + calendar cues.",
    learned: "No travel in the last 4 weeks. Your last trip disrupted sleep for 5 days after return.",
    cadence: "episodic",
    contributesTo: ["bed"] },
  { id: "food_culture", layer: "contextual", icon: "food_culture",
    label: "Cultural food preferences",
    observation: "Onboarding + inferred from meal patterns.",
    learned: "South-Indian mornings preferred. Dosa spikes you more than roti — Nu adapts meal suggestions.",
    cadence: "stable",
    contributesTo: ["meal", "food_like"] },
  { id: "allergy", layer: "contextual", icon: "allergy",
    label: "Allergies",
    observation: "Onboarding-declared + verified against reactions log.",
    learned: "Peanut allergy on file. Nu auto-adapts any group broadcast that suggests peanut-containing meals.",
    cadence: "stable",
    contributesTo: ["meal"] },

  // ---------- Preference (3) ----------
  { id: "food_like", layer: "preference", icon: "food_like",
    label: "Food likes",
    observation: "Positive responses + repeated choices + high-TIR meals.",
    learned: "You gravitate to eggs, paneer, and stir-fry. Roasted veggies work; salads bore you.",
    cadence: "continuous",
    contributesTo: ["meal"] },
  { id: "activity_style", layer: "preference", icon: "activity_style",
    label: "Activity style",
    observation: "Chosen activity types + adherence signals.",
    learned: "Walking > yoga > weights for you. Solo > group. Evening > morning.",
    cadence: "stable",
    contributesTo: ["walk"] },
  { id: "voice", layer: "preference", icon: "voice",
    label: "Communication style",
    observation: "How you respond to different message tones.",
    learned: "Warm and specific > cheerleader. Numbers > adjectives. Short > long.",
    cadence: "learned per message",
    contributesTo: ["engage"] },

  // ---------- Motivation (5) ----------
  { id: "engage", layer: "motivation", icon: "engage",
    label: "App engagement",
    observation: "Session count, dwell time, scroll depth, feature reach.",
    learned: "You open the app 4-6x/day, dropping to 2x on stressful days. Your dip is my early warning.",
    cadence: "continuous",
    contributesTo: ["mood"] },
  { id: "response", layer: "motivation", icon: "response",
    label: "Response cadence",
    observation: "How quickly you act on nudges vs. dismiss them.",
    learned: "42-min median ack-then-act. I pick nudge windows to match.",
    cadence: "per nudge",
    contributesTo: ["engage"] },
  { id: "stress", layer: "motivation", icon: "stress",
    label: "Stress",
    observation: "Self-reported score + HRV-derived signal + language sentiment.",
    learned: "One 5/5 stress day this week (Wed). Afternoon glucose showed it. Box breathing helps.",
    cadence: "daily+",
    contributesTo: ["cgm", "hrv", "mood"] },
  { id: "mood", layer: "motivation", icon: "mood",
    label: "Mood trajectory",
    observation: "Sentiment across chat + emoji + response tone.",
    learned: "Steady with a small dip Tuesday-Wednesday. Not concerning yet — watching.",
    cadence: "continuous",
    contributesTo: ["stress", "engage"] },
  { id: "streak", layer: "motivation", icon: "streak",
    label: "Streak state",
    observation: "Consecutive-day achievement patterns.",
    learned: "5-day walk streak going. Your longest ever is 12 — you were most consistent in weeks 3-5.",
    cadence: "daily",
    contributesTo: ["walk"] },
  { id: "coach", layer: "motivation", icon: "coach",
    label: "Coach relationship",
    observation: "Cadence and quality of your 1:1s with Maya.",
    learned: "You engage most when Maya opens with celebration, not correction. I brief her that way.",
    cadence: "bi-weekly",
    contributesTo: ["engage"] },
];

// ---- Journey step markers overlaid at their time-of-day ----
export interface JourneyMarker {
  id: string;
  emoji: string;
  label: string;
  hour: number;   // 0-23 clock hour (fractional OK)
}

export const JOURNEY_MARKERS: JourneyMarker[] = [
  { id: "morning-friend",      emoji: "🌅", label: "Morning Check-in", hour: 7.0 },
  { id: "update-me",           emoji: "📝", label: "Update Me",        hour: 8.0 },
  { id: "best-path-guide",     emoji: "🧭", label: "Best Path",        hour: 8.5 },
  { id: "vitals-reader",       emoji: "📊", label: "CGM Summary",      hour: 10.0 },
  { id: "glucose-storyteller", emoji: "📖", label: "Glucose Story",    hour: 10.5 },
  { id: "compass-reader",      emoji: "🎯", label: "Health Compass",   hour: 11.0 },
  { id: "kindred-connector",   emoji: "🤝", label: "Community",        hour: 13.0 },
  { id: "trend-watcher",       emoji: "📈", label: "Your Trend",       hour: 16.0 },
  { id: "evening-companion",   emoji: "🌙", label: "Tonight",          hour: 19.5 },
];

// ---- Sally's twin summary (center hub) ----
export const SALLY_TWIN = {
  name: "Sally Reddy",
  initials: "SR",
  ageWeek: "52 · Week 13",
  cohort: "GLP-1 · Long Walker",
  totalTouchpoints: TOUCHPOINTS.length,
  totalObservations: 148_302,   // fake but plausible cumulative count
  observationsToday: 421,       // today's live tick
  daysWithTwin: 91,
  currentMood: "Steady",
};

// ============================================================================
// Sub-ring constellation — 6 small rings, 3-4 touchpoints each, arranged
// around the Sally hub. Each ring inherits a color from the layer it belongs to.
// ============================================================================

export interface SubRingDef {
  id: string;
  label: string;
  color: string;     // deep tone (border, dots)
  tint: string;      // background tint
  layer: TwinLayer;
  touchpointIds: string[];
  headline: string;  // 1-line summary of what this ring watches
}

export const SUB_RINGS: SubRingDef[] = [
  { id: "glucose", label: "Glucose",         color: "#4F5FE5", tint: "#EEF2FF", layer: "physiological",
    headline: "The four glucose streams",
    touchpointIds: ["cgm", "fasting", "postmeal", "hba1c"] },

  { id: "vitals",  label: "Vitals",          color: "#0EA5E9", tint: "#E0F2FE", layer: "physiological",
    headline: "Whole-body signals",
    touchpointIds: ["weight", "hrv", "heart", "bp"] },

  { id: "movement", label: "Movement + Sleep", color: "#059669", tint: "#ECFDF5", layer: "behavioral",
    headline: "How your body moves + rests",
    touchpointIds: ["walk", "steps", "bed", "sun"] },

  { id: "meals-meds", label: "Meals + Meds", color: "#B45309", tint: "#FFFBEB", layer: "behavioral",
    headline: "What goes in — food and medication",
    touchpointIds: ["meal", "meds", "water", "food_like"] },

  { id: "life", label: "Life Context",       color: "#D97706", tint: "#FEF3C7", layer: "contextual",
    headline: "The world around your day",
    touchpointIds: ["work", "family", "travel", "food_culture"] },

  { id: "motivation", label: "Mood + Motivation", color: "#BE185D", tint: "#FCE7F3", layer: "motivation",
    headline: "How you're feeling about it all",
    touchpointIds: ["stress", "mood", "streak", "coach"] },
];

// ============================================================================
// Cross-ring connections — only the correlations that matter, so the
// constellation reads clean rather than crowded.
// ============================================================================
export interface CrossRingLink {
  from: string;  // touchpoint id
  to: string;    // touchpoint id
  why: string;   // 1-liner shown on hover
}

export const CROSS_RING_LINKS: CrossRingLink[] = [
  { from: "bed",    to: "fasting",  why: "7.5+ hours of sleep drops fasting glucose 12%." },
  { from: "meal",   to: "postmeal", why: "Every meal drives a curve. Nu learns your food-response map." },
  { from: "meds",   to: "fasting",  why: "On-time doses hold your fasting number steady." },
  { from: "stress", to: "hrv",      why: "HRV drops on high-stress afternoons — matches your self-report within a day." },
  { from: "walk",   to: "postmeal", why: "Walks within 30 min of eating cut peaks by 22 mg/dL." },
  { from: "work",   to: "stress",   why: "Tuesday meeting blocks are your highest-stress window." },
];
