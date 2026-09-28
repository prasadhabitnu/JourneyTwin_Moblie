/**
 * Coach-flavored Nu chat responses + coach actions.
 * When the persona is "coach" this module runs first; if nothing matches,
 * caller falls through to the member intents (which will still work as a
 * general-purpose Q&A).
 *
 * Actions that navigate use the same journey:jump event listened to by
 * pages/coach.tsx, dispatched with { stepId } — the coach page interprets
 * as coach-step id and jumps the rail.
 */

import type { NuReply } from "./nuChatResponses";
import type { ChatAction } from "./nuChatActions";

// ============================================================================
// Coach navigation targets (coach step ids)
// ============================================================================
const COACH_STEP_ALIASES: Array<{ pattern: string; id: string }> = [
  { pattern: "morning brief",     id: "morning-brief" },
  { pattern: "calendar",          id: "session-calendar" },
  { pattern: "schedule",          id: "session-calendar" },
  { pattern: "my day",            id: "session-calendar" },
  { pattern: "today's schedule",  id: "session-calendar" },
  { pattern: "priority queue",    id: "priority-queue" },
  { pattern: "who needs",         id: "priority-queue" },
  { pattern: "cohort pulse",      id: "cohort-pulse" },
  { pattern: "cohort",            id: "cohort-pulse" },
  { pattern: "session prep",      id: "session-prep" },
  { pattern: "prep sally",        id: "session-prep" },
  { pattern: "prep for",          id: "session-prep" },
  { pattern: "broadcast",         id: "broadcast-design" },
  { pattern: "compose message",   id: "broadcast-design" },
  { pattern: "physician",         id: "physician-handoff" },
  { pattern: "escalation",        id: "physician-handoff" },
  { pattern: "handoff",           id: "physician-handoff" },
  { pattern: "panel insights",    id: "panel-insights" },
  { pattern: "patterns",          id: "panel-insights" },
  { pattern: "documentation",     id: "documentation" },
  { pattern: "soap",              id: "documentation" },
  { pattern: "notes",             id: "documentation" },
  { pattern: "end of day",        id: "end-of-day" },
  { pattern: "wrap up",           id: "end-of-day" },
  { pattern: "recap",             id: "end-of-day" },
];

const STEP_LABEL: Record<string, string> = {
  "morning-brief":     "Morning Brief",
  "session-calendar":  "Session Calendar",
  "priority-queue":    "Priority Queue",
  "cohort-pulse":      "Cohort Pulse",
  "session-prep":      "Session Prep",
  "broadcast-design":  "Broadcast Design",
  "physician-handoff": "Physician Handoff",
  "panel-insights":    "Panel Insights",
  "documentation":     "Documentation",
  "end-of-day":        "End-of-Day Recap",
};

function findCoachStep(msg: string): { id: string; label: string } | null {
  const lower = msg.toLowerCase();
  const sorted = [...COACH_STEP_ALIASES].sort((a, b) => b.pattern.length - a.pattern.length);
  for (const s of sorted) {
    if (lower.includes(s.pattern)) return { id: s.id, label: STEP_LABEL[s.id] ?? s.id };
  }
  return null;
}

// ============================================================================
// Coach opener
// ============================================================================
export function coachOpener(): NuReply {
  return {
    text:
      "Hi Maya. It's Monday morning — you have 6 sessions today, and 3 members need extra attention (Sally, Diane, Amit). Where would you like to start?",
    suggestions: [
      "Show me my calendar",
      "Who needs me most?",
      "Prep Sally",
      "How's my cohort?",
    ],
  };
}

// ============================================================================
// Coach intent router — returns null if nothing matches (caller falls through)
// ============================================================================
export function coachReply(msg: string): NuReply | null {
  const lower = msg.trim().toLowerCase();

  // --- Navigation (highest priority) ---
  if (/\b(take\s*me\s*to|go\s*to|open|show\s*me\s*(the|my)?|jump\s*to|switch\s*to|prep)\b/.test(lower)) {
    const step = findCoachStep(lower);
    if (step) {
      const action: ChatAction = { type: "navigate", stepId: step.id as never, label: step.label };
      return {
        text: `Opening ${step.label}…`,
        actions: [action],
        suggestions: [],
      };
    }
  }

  // --- Info: greeting ---
  if (/^(hi|hello|hey|good\s*morning|namaste|yo)\b/.test(lower)) {
    return {
      text: "Morning, Maya. Ready when you are. Ask me about your day, your panel, or any of your members.",
      suggestions: ["My calendar", "Priority members", "Cohort TIR", "Prep Sally"],
    };
  }

  // --- Info: day / calendar overview ---
  if (/(my\s*day|how'?s?\s*my\s*day|calendar|schedule|next\s*appointment|next\s*session|what'?s?\s*next)/.test(lower)) {
    return {
      text:
        "You have 6 sessions today:\n\n" +
        "• 8:00 AM — Team huddle\n" +
        "• 10:00 AM — Sally R. (1:1, video) · your next member session\n" +
        "• 11:30 AM — Diane W. (phone, Nu-added) · urgent warm outreach\n" +
        "• 1:00 PM — Amit K. (async) · sensor swap\n" +
        "• 2:00 PM — Rachel M. (new patient, video)\n" +
        "• 3:30 PM — Dr. Chen (physician handoff review)\n" +
        "• 4:15 PM — Cohort broadcast (hydration challenge)\n\n" +
        "Sally is in 22 minutes. Want me to pull up her prep?",
      suggestions: ["Open session calendar", "Prep Sally", "Diane's context", "Reschedule something"],
    };
  }

  // --- Info: priority ---
  if (/(priority|who\s*needs|who\s*should\s*i|urgent|flagged)/.test(lower)) {
    return {
      text:
        "3 members in your priority queue today:\n\n" +
        "1. Sally R. — 2 skipped Sunday doses. Suggest reminder swap in your 10 AM.\n" +
        "2. Diane W. — TIR down 6 pts, motivation declining 8 days. Warm phone call this afternoon; I added it to your calendar.\n" +
        "3. Amit K. — CGM sensor artifact, not a clinical event. Text him a swap.\n\n" +
        "Sally and Diane are the two that will matter most.",
      suggestions: ["Open priority queue", "Prep Sally", "How's Diane?", "Escalate Diane"],
    };
  }

  // --- Info: Sally ---
  if (/(sally|how'?s?\s*sally|sally.*status)/.test(lower)) {
    return {
      text:
        "Sally R. — 52, week 13 of GLP-1, on The Long Walker path.\n\n" +
        "• TIR climbed 71% → 87% over 14 days — best stretch of her program.\n" +
        "• Down 7 lbs in 14 days.\n" +
        "• Two Sunday doses skipped in 4 weeks — the pattern to work on today.\n" +
        "• One 5/5 stress day last Wed (afternoon glucose showed it).\n\n" +
        "She's ready for a re-anchor conversation, not a lecture. Session Prep is fully drafted.",
      suggestions: ["Open Sally's session prep", "Show me her trend", "Draft the Sunday-reminder swap"],
    };
  }

  // --- Info: Diane ---
  if (/(diane|how'?s?\s*diane)/.test(lower)) {
    return {
      text:
        "Diane W. — 58, week 22, currently on Long Walker (may not be the right fit anymore).\n\n" +
        "• TIR down from 82% → 76% over 7 days.\n" +
        "• App opens down 40% week-over-week — first drop since enrollment.\n" +
        "• Knee pain reported twice this week; walking cadence halved.\n\n" +
        "I recommend a warm phone check-in this afternoon (I added it at 11:30 AM). Consider switching her to Steady & Simple. Physician handoff for knee is drafted.",
      suggestions: ["Prep for Diane's call", "Switch Diane's path", "Review MD handoff"],
    };
  }

  // --- Info: Amit ---
  if (/(amit|how'?s?\s*amit)/.test(lower)) {
    return {
      text:
        "Amit K. — 44, week 8. CGM MARD elevated (8% → 19% over 4 days). Two implausible-slope readings flagged.\n\n" +
        "This is a sensor artifact, not a clinical event. I drafted a swap message and flagged the last 4 days of data. You review + send.",
      suggestions: ["Review + send Amit's swap message", "Flag data for exclusion"],
    };
  }

  // --- Info: cohort / panel ---
  if (/(cohort|panel|whole.*panel|how'?s?\s*my\s*(cohort|panel)|group)/.test(lower)) {
    return {
      text:
        "Panel snapshot (428 members):\n\n" +
        "• 385 doing well overnight — quiet, healthy patterns.\n" +
        "• 12 flagged for a gentle check-in this week.\n" +
        "• 3 in today's priority queue.\n" +
        "• Cohort TIR: 82%, up 2 points vs. last week.\n" +
        "• 6 members hit their walk streak — Nu queued a group congrats for you.\n" +
        "• 4 members trending downward but not severe.",
      suggestions: ["Send group congrats", "See at-risk members", "Open cohort pulse"],
    };
  }

  // --- Info: drift / alerts ---
  if (/(drift|alert|regression|shifting|model.*perform)/.test(lower)) {
    return {
      text:
        "Panel-wide drift monitors — nothing severe. Two mild signals:\n\n" +
        "• Sunday dose skips are clustering — 6 members across your panel skipped this past Sunday. Worth a cohort-level nudge.\n" +
        "• Week-12 sub-cohort showing slightly higher fatigue reports than typical for that phase. Watching, not intervening yet.",
      suggestions: ["Draft Sunday-reminder broadcast", "See week-12 cohort", "Open panel insights"],
    };
  }

  // --- Info: broadcast ---
  if (/(broadcast|compose|send.*group|send.*cohort|challenge)/.test(lower)) {
    return {
      text:
        "Your hydration challenge is drafted for 4:15 PM — one template, 312 personalized versions (Nu adapts for allergies, cultural preferences, GLP-1 tolerance). Want to preview or edit before it goes?",
      suggestions: ["Open broadcast design", "Preview per-member versions", "Change the template"],
    };
  }

  // --- Info: physician / handoff ---
  if (/(physician|handoff|md|dr\.?|doctor|escalat)/.test(lower)) {
    return {
      text:
        "2 physician handoffs are drafted with structured decision-support envelopes: Diane W. (orthopedic consult for knee) and Robert P. (dose review at week 12). Dr. Chen's 3:30 PM slot is on your calendar to review them together.",
      suggestions: ["Review Diane's envelope", "Review Robert's envelope", "Open physician handoff"],
    };
  }

  // --- Info: SOAP notes / documentation ---
  if (/(soap|notes?\b|documentation|write.*note|charting)/.test(lower)) {
    return {
      text:
        "4 SOAP notes drafted, waiting for your review. I generate them from the session transcript + the outcomes you confirmed. You edit, then one-tap approve, and it flows to the EHR.",
      suggestions: ["Open documentation", "Review Sally's note", "See all pending"],
    };
  }

  // --- Info: end of day ---
  if (/(end.*day|wrap.*up|debrief|recap|sign.*out|done.*today)/.test(lower)) {
    return {
      text:
        "Not quite yet — you still have 2:00 PM (Rachel), 3:30 PM (Dr. Chen), and 4:15 PM (broadcast). But your end-of-day recap will be ready at 5:15 PM. Want me to jump you there anyway?",
      suggestions: ["Yes, take me to recap", "Show my remaining sessions", "Skip to broadcast"],
    };
  }

  // --- Info: how am I doing (coach-self) ---
  if (/(how\s*am\s*i|how'?s?\s*my\s*day\s*going|am\s*i\s*on\s*track)/.test(lower)) {
    return {
      text:
        "You're on track. 3 of 3 planned contacts made, 2 physician handoffs sent, 4 SOAP notes drafted. Panel is stable. Your day is going well.",
      suggestions: ["Show today's metrics", "What's next?", "End-of-day recap"],
    };
  }

  // No coach intent matched — return null so caller can fall through
  return null;
}
