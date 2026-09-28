/**
 * Nu chat response engine — curated stub matched to Sally's data.
 *
 * Pattern-matches the user's message against ~20 intents. Each intent
 * returns { text, suggestions? } where suggestions are follow-up prompt
 * chips to keep the conversation going.
 *
 * Anchored on Sally's demo profile:
 *   Age 52, week 13 of GLP-1, Monday July 6, 10 AM
 *   TIR climbed from 71% -> 87% across 14 days
 *   Best day: Wed Jul 1 (99% TIR after evening walk)
 *   Current path: The Long Walker
 *   Weight: down 7 lbs in 14 days
 *   Sleep: averaging 7.3 hours
 *   Two skipped semaglutide doses in the last two weeks
 */

import { tryParseAction, ChatAction } from "./nuChatActions";
import { coachReply, coachOpener } from "./nuChatCoach";

export type ChatPersona = "member" | "coach";

export interface NuReply {
  text: string;
  suggestions?: string[];
  /** Structured side-effects Nu wants to apply (log data, hide step, etc.). */
  actions?: ChatAction[];
}

interface Intent {
  match: RegExp;
  reply: (msg: string) => NuReply;
}

const INTENTS: Intent[] = [
  // Greeting
  {
    match: /^(hi|hello|hey|good\s*morning|good\s*evening|namaste|yo)\b/i,
    reply: () => ({
      text: "Hi Sally. It's 10 AM Monday - you're 13 weeks in and doing well. What's on your mind?",
      suggestions: ["How am I doing?", "Explain today's plan", "Show me my best day"],
    }),
  },

  // Today's status / how am I doing
  {
    match: /(how\s*(am|are)\s*i|today.*doing|status|summary|check\s*in|how.*going|update)/i,
    reply: () => ({
      text:
        "Here's the picture as of this morning:\n\n" +
        "• Time-in-Range: 87% (up from 71% two weeks ago)\n" +
        "• Weight: down 7 lbs in 14 days\n" +
        "• Sleep last night: 7.5 hours\n" +
        "• Fasting glucose: 108 mg/dL, in range\n" +
        "• Path today: The Long Walker\n\n" +
        "Two things worth watching: two skipped semaglutide doses this fortnight, and one 5/5 stress day earlier this week. Everything else is trending your way.",
      suggestions: ["Why The Long Walker?", "What about the skipped doses?", "How's my stress?"],
    }),
  },

  // TIR / time in range / glucose trend
  {
    match: /(tir|time.*range|glucose.*trend|glucose.*doing|blood\s*sugar)/i,
    reply: () => ({
      text:
        "Your TIR moved from 71% -> 87% over the last 14 days. That's a big jump.\n\n" +
        "The 95% target is within reach - three cleaner post-dinner windows would probably do it. The days that dragged the average down were the six where you didn't walk after dinner.",
      suggestions: ["What's my best day?", "How do I hit 95%?", "Show me the trend chart"],
    }),
  },

  // Best day / peak reference
  {
    match: /(best.*day|best.*week|highest.*tir|when.*did.*i.*best|peak.*day|good.*day)/i,
    reply: () => ({
      text:
        "Your best day was Wednesday, July 1. You hit 99% TIR.\n\n" +
        "What made it work:\n" +
        "• Eggs + spinach for breakfast (protein-first)\n" +
        "• 20-min walk within 25 min of finishing dinner\n" +
        "• 8 glasses of water\n" +
        "• 7.8 hours of sleep the night before\n\n" +
        "Today's plan is literally trying to recreate that day.",
      suggestions: ["Compare today to Jul 1", "What if I skip the walk?", "Give me tomorrow's plan"],
    }),
  },

  // Why The Long Walker / explain today
  {
    match: /(why.*long.*walker|why.*today|why.*this.*path|explain.*plan|explain.*today|reason|because)/i,
    reply: () => ({
      text:
        "The Long Walker is your 100% match today. Three reasons:\n\n" +
        "1. Every winning day in your last 14 was preceded by an evening walk within 30 min of dinner.\n" +
        "2. Your fasting glucose drifted up slightly overnight - a small climb, not alarming, but a walk after dinner tonight resets it beautifully.\n" +
        "3. You've done this before. Wed Jul 1 was exactly this pattern. I'm not asking you to invent anything.",
      suggestions: ["What if I can't walk tonight?", "Show me another path", "How long the walk?"],
    }),
  },

  // Walk / exercise / activity
  {
    match: /(walk|walking|exercise|activity|steps|move|movement|cardio|workout)/i,
    reply: () => ({
      text:
        "One walk after dinner is your highest-leverage habit right now. 20 minutes is enough.\n\n" +
        "If tonight is genuinely bad - The Splitter path works too. Two 10-min walks (one post-lunch, one post-dinner) get you 80% of the benefit.",
      suggestions: ["Switch to The Splitter", "What about morning walks?", "I skipped yesterday"],
    }),
  },

  // Sleep
  {
    match: /(sleep|slept|tired|insomnia|bed|nap|rest)/i,
    reply: () => ({
      text:
        "You've averaged 7.3 hours over the last two weeks. Solid.\n\n" +
        "Your fasting glucose runs 12% lower on nights over 7.5 hours. If you can get to bed 30 minutes earlier tonight, tomorrow will feel different.",
      suggestions: ["Any wind-down tips?", "Why does sleep matter?", "Set a bedtime reminder"],
    }),
  },

  // Water / hydration
  {
    match: /(water|hydrat|glass|drink|thirst)/i,
    reply: () => ({
      text:
        "Hydrated days show 15% lower glucose variability for you. Your Sunday hit 10 glasses - your best of the fortnight.\n\n" +
        "Two glasses before lunch is your biggest lever. Coffee doesn't count.",
      suggestions: ["How much should I drink?", "Add a reminder", "Best hydration day"],
    }),
  },

  // Medication / semaglutide / dose
  {
    match: /(med|medication|semaglutide|ozempic|wegovy|dose|shot|injection|skip)/i,
    reply: () => ({
      text:
        "You skipped two doses in the last two weeks - both Sundays. Your fasting glucose ran about 12 mg/dL higher the mornings after.\n\n" +
        "This coming Sunday is your next dose day. Want me to set a Sunday-morning reminder?",
      suggestions: ["Yes, remind me Sunday", "Side effects check", "Log today's dose"],
    }),
  },

  // Stress / anxious / overwhelmed
  {
    match: /(stress|anxious|overwhelm|worried|nervous|panic|frustrat|angry)/i,
    reply: () => ({
      text:
        "I saw a 5/5 stress day earlier this week - your afternoon glucose showed it too.\n\n" +
        "Two things help you specifically: 2 minutes of box breathing at 3 PM, and stepping outside for 5 minutes. On the days you did those, your afternoon curve was 30% flatter.",
      suggestions: ["Start box breathing now", "Talk to my coach", "I'm struggling today"],
    }),
  },

  // Meal ideas / food / breakfast / dinner
  {
    match: /(meal|breakfast|lunch|dinner|snack|food|eat|recipe|cook)/i,
    reply: () => ({
      text:
        "Your body handles protein-first mornings best - 20 g at breakfast holds your 10 AM glucose 40 mg/dL lower.\n\n" +
        "Tonight, if you want a suggestion: grilled paneer or chicken + roasted veggies + a small portion of rice. Fiber before starch. Then walk within 30 min.",
      suggestions: ["Breakfast ideas", "What spikes me?", "Vegetarian options"],
    }),
  },

  // Weight
  {
    match: /(weight|scale|lbs|pounds|kilo|kg|lose|losing|gain)/i,
    reply: () => ({
      text:
        "Down 7 lbs in 14 days - trending 0.5 lb/day, right where I'd want you.\n\n" +
        "Two flat mid-week days matched high-sodium dinners the night before. That's water, not fat. Keep going.",
      suggestions: ["Should I weigh daily?", "How much can I lose?", "What's a healthy pace?"],
    }),
  },

  // Personalization — hide/skip/remove/customize
  {
    match: /(hide|skip.*(wedge|step|screen)|remove|don't\s*show|customize|less)/i,
    reply: () => ({
      text:
        "Got it. Anything you don't want to see, tap the gear icon at the top - Customize your day - and toggle it off.\n\n" +
        "The CGM Summary screen for instance: many people hide it after day 14 when they trust their curve. Totally normal.",
      suggestions: ["Hide the CGM screen", "Add Meal Planning", "Show me the config"],
    }),
  },

  // History / last week / compare
  {
    match: /(history|last\s*week|past|previous|before|compare|trend|two.*weeks)/i,
    reply: () => ({
      text:
        "Two weeks ago your TIR was 71%. Today it's 87%. That's a bigger jump than most week-13 members see.\n\n" +
        "The three biggest levers, in order: your evening walks, your protein-first breakfasts, and getting to bed earlier on Wednesday and Thursday.",
      suggestions: ["Show me the raw numbers", "What changed?", "Predict next week"],
    }),
  },

  // Coach / Maya
  {
    match: /(coach|maya|human|call.*someone|nurse|doctor|escalat)/i,
    reply: () => ({
      text:
        "Your coach is Maya Patel. She's watching your progress and is available Monday-Friday 9 AM - 5 PM PT.\n\n" +
        "Want me to send her a note, or would you rather I book a 15-min check-in?",
      suggestions: ["Send Maya a note", "Book a check-in", "What does Maya see?"],
    }),
  },

  // Community / cohort
  {
    match: /(community|cohort|other.*people|group|challenge|peer)/i,
    reply: () => ({
      text:
        "312 of the 428 people in your cohort accepted this week's Long Walker challenge - Maya's broadcast.\n\n" +
        "You're in the top third for adherence right now. Community activity is on the Best Path screen if you want to see who's doing what.",
      suggestions: ["Show community", "Challenge a member", "See coach broadcast"],
    }),
  },

  // Struggling / give up
  {
    match: /(struggl|give\s*up|too\s*hard|can'?t|quit|done|hate|worst|awful)/i,
    reply: () => ({
      text:
        "I hear you. And I want you to know something: 13 weeks is exactly when this feels hardest. The novelty is gone, the results have started, and it just feels like maintenance.\n\n" +
        "You don't need to do more. You need to do the small thing you already know works. Tonight, if the walk is what's on your mind - 10 minutes is a win. Not 20. Ten. I'll take ten.",
      suggestions: ["I'll try 10 minutes", "Talk to Maya", "Show me my wins"],
    }),
  },

  // Encouragement / motivation
  {
    match: /(motivat|encourage|help|support|proud|celebrate|win)/i,
    reply: () => ({
      text:
        "You're doing more than you think. In 14 days you're down 7 lbs, your TIR climbed 16 points, and you kept 12 of 14 medication doses.\n\n" +
        "Most people at week 13 aren't in this position. Keep the small habits. The rest takes care of itself.",
      suggestions: ["What should I focus on?", "Show my wins", "Set a goal"],
    }),
  },

  // Thanks
  {
    match: /(thank|thanks|thx|appreciat|great|awesome|love)/i,
    reply: () => ({
      text: "Any time, Sally. I'm here whenever you need me. Even at 2 AM.",
      suggestions: ["How am I doing?", "Explain today's plan", "See you tonight"],
    }),
  },

  // Goodbye
  {
    match: /(bye|goodbye|see\s*ya|later|talk\s*later|gtg|gotta go)/i,
    reply: () => ({
      text: "Bye, Sally. I'll check in tonight at 7:30 PM. Enjoy your walk.",
      suggestions: [],
    }),
  },
];

/** Fallback response when no intent matches. Offers a menu instead of a generic 'I don't know.' */
function fallback(msg: string): NuReply {
  return {
    text:
      `I want to make sure I answer you well. I'm strongest when you ask about:\n\n` +
      `• Today's plan and why I chose it\n` +
      `• Your Time-in-Range or best day\n` +
      `• Your sleep, water, meals, or meds\n` +
      `• How you're doing this week vs. last\n` +
      `• Adjusting what you see on your journey\n\n` +
      `Or ask me anything else - I'll do my best.`,
    suggestions: ["How am I doing today?", "Show me my best day", "What's the plan tonight?"],
  };
}

/** Route a user message. Persona-aware: coach intents first for coach, else member. */
export function replyTo(msg: string, persona: ChatPersona = "member"): NuReply {
  const cleaned = msg.trim();
  if (!cleaned) return fallback(cleaned);

  // Coach persona: try coach intents first (navigation + coach Q&A).
  if (persona === "coach") {
    const c = coachReply(cleaned);
    if (c) return c;
    // Coach message didn't match a coach intent — fall through to member intents
    // (they still work as generic Q&A). Skip the member action parser though,
    // since logging is member-only.
    for (const intent of INTENTS) {
      if (intent.match.test(cleaned)) return intent.reply(cleaned);
    }
    return fallback(cleaned);
  }

  // Member persona: action parser wins first, then info intents, then fallback.
  const parsed = tryParseAction(cleaned);
  if (parsed) {
    return {
      text: parsed.text,
      suggestions: parsed.suggestions,
      actions: [parsed.action],
    };
  }
  for (const intent of INTENTS) {
    if (intent.match.test(cleaned)) return intent.reply(cleaned);
  }
  return fallback(cleaned);
}

/** Nu's opening message when the drawer opens for the first time. */
export function openingMessage(persona: ChatPersona = "member"): NuReply {
  if (persona === "coach") return coachOpener();
  return {
    text:
      "Hi Sally! I'm here whenever you need me. Try me - I can look things up, log your meals/water/sleep, or add and remove steps in your journey. Just ask.",
    suggestions: [
      "How am I doing today?",
      "I drank 6 glasses of water",
      "Hide the CGM screen",
      "Add Craving Log",
    ],
  };
}
