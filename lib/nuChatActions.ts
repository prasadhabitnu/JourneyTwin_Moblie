import type { UpdateMeLog } from "../contexts/UpdateMeContext";
import type { NuRoleId } from "./journeyData";

/**
 * Structured actions Nu can perform on the app's state from within chat.
 * Each action is applied by ChatContext (which has access to UpdateMe +
 * JourneyConfig contexts). Actions travel with the chat reply so the UI
 * can show a "did this" confirmation pill next to Nu's text.
 */
export type ChatAction =
  | { type: "log";           key: keyof UpdateMeLog; value: string | number; label: string }
  | { type: "hideStep";      stepId: NuRoleId; label: string }
  | { type: "addStep";       stepId: NuRoleId; label: string }
  | { type: "resetJourney";  label: string }
  | { type: "navigate";      stepId: NuRoleId; label: string };

/**
 * A parsed action plus the confirmation blurb Nu should say.
 * If null, the message didn't parse as an action and the caller should
 * fall through to the info-Q&A response layer.
 */
export interface ParsedAction {
  action: ChatAction;
  text: string;
  suggestions?: string[];
}

// ============================================================================
// Step aliases — human-readable ways Sally might refer to journey steps.
// Longest keys are matched first so "morning check-in" beats "morning".
// ============================================================================

const STEP_ALIASES: Array<{ pattern: string; id: NuRoleId }> = [
  { pattern: "morning check-in", id: "morning-friend" },
  { pattern: "morning checkin",  id: "morning-friend" },
  { pattern: "morning",          id: "morning-friend" },
  { pattern: "check-in",         id: "morning-friend" },
  { pattern: "update me",        id: "update-me" },
  { pattern: "daily update",     id: "update-me" },
  { pattern: "best path",        id: "best-path-guide" },
  { pattern: "today's plan",     id: "best-path-guide" },
  { pattern: "todays plan",      id: "best-path-guide" },
  { pattern: "the plan",         id: "best-path-guide" },
  { pattern: "health compass",   id: "compass-reader" },
  { pattern: "compass",          id: "compass-reader" },
  { pattern: "cgm summary",      id: "vitals-reader" },
  { pattern: "cgm",              id: "vitals-reader" },
  { pattern: "vitals",           id: "vitals-reader" },
  { pattern: "glucose story",    id: "glucose-storyteller" },
  { pattern: "storyteller",      id: "glucose-storyteller" },
  { pattern: "community",        id: "kindred-connector" },
  { pattern: "kindred",          id: "kindred-connector" },
  { pattern: "your trend",       id: "trend-watcher" },
  { pattern: "trend",            id: "trend-watcher" },
  { pattern: "evening",          id: "evening-companion" },
  { pattern: "tonight",          id: "evening-companion" },
  { pattern: "craving log",      id: "craving-log" },
  { pattern: "cravings",         id: "craving-log" },
  { pattern: "craving",          id: "craving-log" },
  { pattern: "weekly reflection",id: "weekly-reflection" },
  { pattern: "reflection",       id: "weekly-reflection" },
  { pattern: "meal planning",    id: "meal-planning" },
  { pattern: "meal plan",        id: "meal-planning" },
  { pattern: "provider prep",    id: "provider-prep" },
  { pattern: "doctor prep",      id: "provider-prep" },
  { pattern: "provider",         id: "provider-prep" },
  { pattern: "learn one thing",  id: "learn-one-thing" },
  { pattern: "learn",            id: "learn-one-thing" },
];

const STEP_LABEL: Record<NuRoleId, string> = {
  "morning-friend":       "Morning Check-in",
  "update-me":            "Update Me",
  "best-path-guide":      "Best Path",
  "compass-reader":       "Health Compass",
  "vitals-reader":        "CGM Summary",
  "ring-companion":       "Ring Companion",
  "glucose-storyteller":  "Glucose Story",
  "kindred-connector":    "Community",
  "trend-watcher":        "Your Trend",
  "evening-companion":    "Tonight",
  "craving-log":          "Craving Log",
  "weekly-reflection":    "Weekly Reflection",
  "meal-planning":        "Meal Planning",
  "provider-prep":        "Provider Prep",
  "learn-one-thing":      "Learn One Thing",
};

function findStep(msg: string): { id: NuRoleId; label: string } | null {
  const lower = msg.toLowerCase();
  const sorted = [...STEP_ALIASES].sort((a, b) => b.pattern.length - a.pattern.length);
  for (const s of sorted) {
    if (lower.includes(s.pattern)) return { id: s.id, label: STEP_LABEL[s.id] };
  }
  return null;
}

function extractNumber(msg: string): number | null {
  const m = msg.match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

// ============================================================================
// Public API - try to parse the message as an action. Returns null if it doesn't
// look like an action (so caller can fall through to info Q&A).
// ============================================================================

export function tryParseAction(rawMsg: string): ParsedAction | null {
  const msg = rawMsg.trim();
  const lower = msg.toLowerCase();

  // ---- Journey configuration -------------------------------------------------

  if (/^(reset|clear|default).*(journey|steps|day)|start\s*over/i.test(msg)) {
    return {
      action: { type: "resetJourney", label: "Journey reset" },
      text: "Done - your journey is back to the default set of steps.",
      suggestions: ["Show me my steps", "How am I doing today?"],
    };
  }

  if (/\b(hide|remove|skip|drop|don'?t\s*show|get\s*rid\s*of|less\s*of)\b/i.test(msg)) {
    const step = findStep(msg);
    if (step) {
      return {
        action: { type: "hideStep", stepId: step.id, label: step.label },
        text: `Done. ${step.label} won't show up in your journey anymore. Restore it from the gear icon at the top whenever you want.`,
        suggestions: ["Undo", "Show me my steps", "What else can I hide?"],
      };
    }
  }

  if (/\b(add|include|show|bring\s*back|restore|enable|turn\s*on)\b/i.test(msg)) {
    const step = findStep(msg);
    if (step) {
      return {
        action: { type: "addStep", stepId: step.id, label: step.label },
        text: `Added. ${step.label} will show up in your journey now.`,
        suggestions: ["Show me my steps", "What else should I add?", "Take me there"],
      };
    }
  }

  // Navigation ("take me to", "go to", "open")
  if (/\b(take\s*me\s*to|go\s*to|open|show\s*me\s*the?|jump\s*to|switch\s*to)\b/i.test(msg)) {
    const step = findStep(msg);
    if (step) {
      return {
        action: { type: "navigate", stepId: step.id, label: step.label },
        text: `Opening ${step.label}...`,
        suggestions: [],
      };
    }
  }

  // ---- Data logging ---------------------------------------------------------

  // Water — "8 glasses of water" / "drank 6" / "log 4 waters"
  if (/(water|glass|hydrat)/i.test(msg)) {
    const n = extractNumber(msg);
    if (n !== null && n >= 0 && n <= 25 && /(log|drank|had|drink|glass|water|so far|today)/i.test(msg)) {
      return {
        action: { type: "log", key: "water", value: n, label: `Water: ${n} ${n === 1 ? "glass" : "glasses"}` },
        text: `Got it - ${n} ${n === 1 ? "glass" : "glasses"} of water logged for today. Two glasses before lunch is your biggest lever.`,
        suggestions: ["Undo", "How am I doing today?", "Log my sleep"],
      };
    }
  }

  // Sleep — "slept 7 hours" / "7.5 hours of sleep" / "log 8 hours sleep"
  if (/(sleep|slept|hours?.*sleep|sleep.*hours?)/i.test(msg)) {
    const n = extractNumber(msg);
    if (n !== null && n >= 0 && n <= 14) {
      return {
        action: { type: "log", key: "sleep", value: n, label: `Sleep: ${n} h` },
        text: `Logged ${n} hours of sleep. ${n >= 7.5 ? "That's your sweet spot - fasting glucose runs 12% lower on nights over 7.5 hours." : n >= 6 ? "Solid. Aim for 7.5+ tonight if you can - it moves the fasting number." : "Short night. I'll switch today's plan toward Rest & Reset."}`,
        suggestions: ["Undo", "Any wind-down tips?", "How am I doing today?"],
      };
    }
  }

  // Activity / walking — "walked 30 min" / "20 minutes of activity"
  if (/(walk|walked|exercise|activity|steps|move|workout|minutes?.*(walk|exercise))/i.test(msg)) {
    const n = extractNumber(msg);
    if (n !== null && n >= 0 && n <= 300) {
      return {
        action: { type: "log", key: "activity", value: n, label: `Activity: ${n} min` },
        text: `${n} minutes logged. ${n >= 20 ? "Nicely done - that's the post-meal-walk window you know works." : n >= 10 ? "Every minute counts. Aim to add 10 more tonight." : "Movement's been light - I'll nudge Move More into today's plan."}`,
        suggestions: ["Undo", "What should I do tonight?", "How am I doing?"],
      };
    }
  }

  // Weight — "weight is 176" / "weighed 176.5" / "log weight 178"
  if (/(weight|weigh|lbs|pounds)/i.test(msg)) {
    const n = extractNumber(msg);
    if (n !== null && n >= 60 && n <= 500) {
      return {
        action: { type: "log", key: "weight", value: n, label: `Weight: ${n} lbs` },
        text: `${n} lbs logged. You're down 7 lbs over the last 14 days - trend line is right where it should be.`,
        suggestions: ["Undo", "Show my weight trend", "Should I weigh daily?"],
      };
    }
  }

  // Stress — "stress is 4" / "feeling stressed" / "4 out of 5"
  if (/(stress|stressed|anxious|overwhelm|mood.*(\d+)|(\d+)\s*(out of\s*5|\/5))/i.test(msg)) {
    let n = extractNumber(msg);
    if (n === null) {
      // Word-based fallback
      if (/(overwhelm|awful|terrible|worst)/i.test(lower)) n = 5;
      else if (/(anxious|stressed|tense|bad)/i.test(lower)) n = 4;
      else if (/(okay|meh|neutral|fine)/i.test(lower))     n = 3;
      else if (/(good|calm|easy)/i.test(lower))            n = 2;
      else if (/(great|amazing|peaceful|zen)/i.test(lower))n = 1;
    }
    if (n !== null && n >= 1 && n <= 5) {
      return {
        action: { type: "log", key: "stress", value: n, label: `Stress: ${n}/5` },
        text: `Logged stress at ${n}/5. ${n >= 4 ? "That's high. Try 2 minutes of box breathing at 3 PM - your afternoon curves were 30% flatter on the days you did." : n === 3 ? "Neutral day. Small win: a short walk keeps it from climbing." : "Calm days give you the flattest glucose curves. Nice."}`,
        suggestions: ["Undo", "Start box breathing", "I'm struggling"],
      };
    }
  }

  // Glucose reading — "glucose is 138" / "reading 142" / "138 mg/dL"
  if (/(glucose|mg\/?dl|reading|blood\s*sugar|finger\s*stick)/i.test(msg)) {
    const n = extractNumber(msg);
    if (n !== null && n >= 30 && n <= 500) {
      return {
        action: { type: "log", key: "glucose", value: n, label: `Glucose: ${n} mg/dL` },
        text: `Logged ${n} mg/dL. ${n >= 180 ? "That's high - I'll switch today's focus to Mindful Meals to keep the next curve gentler." : n >= 140 ? "Slightly elevated. A short walk in the next 30 minutes brings it down fastest." : n >= 70 ? "In range. Nice." : "That's low - grab 15 g of fast carbs and re-check in 15 minutes."}`,
        suggestions: ["Undo", "Show me why", "Explain today's plan"],
      };
    }
  }

  // Meds — "took my meds" / "skipped meds" / "adjusted my dose"
  if (/(med|medication|semaglutide|ozempic|wegovy|dose|shot|injection)/i.test(msg)) {
    let medStatus: string | null = null;
    if (/(skip|miss|forgot|didn'?t|did not)/i.test(lower))            medStatus = "Skipped";
    else if (/(late|delayed|behind)/i.test(lower))                     medStatus = "Taken late";
    else if (/(adjust|changed|different|reduce|lower|higher)/i.test(lower)) medStatus = "Adjusted dose";
    else if (/(took|taken|yes|done|complete|logged)/i.test(lower))    medStatus = "Taken on time";

    if (medStatus) {
      const consequence =
        medStatus === "Skipped"     ? "I'll nudge you tonight and switch today's plan toward Long Walker - walking helps compensate post-meals."
      : medStatus === "Taken late"  ? "Noted. Better late than skipped - your body still gets the coverage."
      : medStatus === "Adjusted dose" ? "Got it. I'll watch for changes in your curve over the next 48 hours."
      : "Great - that's 13 of 15 doses on time this fortnight. Keep the streak.";
      return {
        action: { type: "log", key: "meds", value: medStatus, label: `Meds: ${medStatus}` },
        text: `Logged meds as "${medStatus}". ${consequence}`,
        suggestions: ["Undo", "Side effects check", "Remind me Sunday"],
      };
    }
  }

  // Meal / food logging — "breakfast was eggs" / "ate dosa" / "had oatmeal for lunch"
  // Guard against false positives ("i had a walk"). Require food-ish tokens.
  if (/\b(breakfast|lunch|dinner|snack|meal|ate|eating|had.*for|for\s*breakfast|for\s*lunch|for\s*dinner)\b/i.test(msg)) {
    // Try to extract the food. Strip common prefixes.
    let food = msg
      .replace(/^(i\s*)?(had|ate|eating|log|logging|logged|for\s*breakfast|for\s*lunch|for\s*dinner)\s*[:\-]?\s*/i, "")
      .replace(/^(my\s*)?(breakfast|lunch|dinner|snack|meal)\s*(was|is|:)?\s*/i, "")
      .replace(/\s*(for|as)\s*(breakfast|lunch|dinner|snack|meal)\s*$/i, "")
      .trim();
    if (food.length > 0 && food.length < 80 && !/^(what|how|when|why|log|show)/i.test(food)) {
      // Cap length + strip trailing punctuation
      food = food.replace(/[.!?]+$/, "").trim();
      const isSpike = /\b(dosa|pancake|bagel|muffin|donut|cereal|white\s*bread|pasta|rice)\b/i.test(food);
      return {
        action: { type: "log", key: "food", value: food, label: `Food: ${food.length > 22 ? food.slice(0, 20) + "..." : food}` },
        text: `Logged: "${food}". ${isSpike ? "That one usually spikes you - I'll nudge Mindful Meals for the rest of the day." : "Nice. Protein-first mornings hold your 10 AM glucose 40 mg/dL lower - keep that pattern."}`,
        suggestions: ["Undo", "What spikes me?", "Meal ideas for dinner"],
      };
    }
  }

  return null;
}

/** Turn a step id back into its display label. Exported for ChatContext confirmations. */
export function stepLabel(id: NuRoleId): string {
  return STEP_LABEL[id] ?? id;
}
