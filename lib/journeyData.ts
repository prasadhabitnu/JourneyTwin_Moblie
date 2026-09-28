/**
 * Journey data - the Nu roles that guide the reviewer through Sally's day.
 */

export type NuRoleId =
  | "morning-friend"
  | "update-me"
  | "best-path-guide"
  | "compass-reader"
  | "vitals-reader"
  | "ring-companion"
  | "glucose-storyteller"
  | "kindred-connector"
  | "trend-watcher"
  | "evening-companion"
  // Nu-suggested steps that Sally can add to her rotation:
  | "weekly-reflection"
  | "meal-planning"
  | "craving-log"
  | "provider-prep"
  | "learn-one-thing";

export interface NuRole {
  id: NuRoleId;
  emoji: string;
  name: string;
  subtitle: string;
  headline: string;
  eyebrow: string;
  narration: string;
  approxSeconds: number;
  hasCheckpoint?: boolean;
}

export const NU_ROLES: NuRole[] = [
  {
    id: "morning-friend",
    emoji: "🌅",
    name: "Morning Check-in",
    subtitle: "How Sally starts her day",
    eyebrow: "10 AM - Monday, July 6",
    headline: "How are you starting today?",
    narration:
      "Good morning, Sally. It's 10 AM on a Monday. Before we look at anything, I want to know how you're feeling this morning. " +
      "Tap the mood that fits, and I'll shape the rest of today around it.",
    approxSeconds: 18,
    hasCheckpoint: true,
  },
  {
    id: "update-me",
    emoji: "📝",
    name: "Update Me",
    subtitle: "A quick log to shape today",
    eyebrow: "Update me",
    headline: "Six taps. That's all I need.",
    narration:
      "Before we plan the day, let me catch up on where you are. Tap any pill - food, weight, activity, sleep, water, stress - and I'll ask you a single question. " +
      "You don't have to log all six. Even three gives me enough to shape today's plan.",
    approxSeconds: 18,
    hasCheckpoint: true,
  },
  {
    id: "best-path-guide",
    emoji: "🧭",
    name: "Best Path",
    subtitle: "The plan you can win today",
    eyebrow: "Today's plan",
    headline: "The plan you can win today.",
    narration:
      "I looked at your last fourteen days and one pattern is louder than the rest. " +
      "On the days you walked after dinner and started meals with protein, your glucose behaved. " +
      "So today's plan is The Long Walker: one 20-minute walk after dinner, protein-first meals, " +
      "eight glasses of water, and seven or more hours of sleep. Four small commitments. One big lift.",
    approxSeconds: 24,
  },
  {
    id: "compass-reader",
    emoji: "🎯",
    name: "Health Compass",
    subtitle: "Eight dimensions of Sally",
    eyebrow: "Your Health Compass",
    headline: "Where you stand, all in one view.",
    narration:
      "Your Health Compass has eight dimensions. Movement is strong. Hydration is strong. " +
      "Glucose is climbing back into range. Nutrition and medications are the two Sally can lift this week - " +
      "she missed two semaglutide doses in the last fortnight. " +
      "The center number is your Momentum, a composite of all eight. You're at seventy-eight, and the arrow is pointing up.",
    approxSeconds: 22,
  },
  {
    id: "vitals-reader",
    emoji: "📊",
    name: "CGM Summary",
    subtitle: "Yesterday at a glance",
    eyebrow: "CGM daily summary",
    headline: "Yesterday at a glance.",
    narration:
      "Here are yesterday's numbers at a glance. Time in Range was eighty-seven percent - a good day. " +
      "Average glucose was 124. Highest was 198 after breakfast. Lowest was 78 overnight. " +
      "You stayed in range most of the day. Your dinner walk brought glucose back into range.",
    approxSeconds: 20,
  },
  {
    id: "ring-companion",
    emoji: "💍",
    name: "Ring Companion",
    subtitle: "Your ring read this morning",
    eyebrow: "Health Ring · continuous",
    headline: "Your body's story, in one number.",
    narration:
      "Your ring watched all night. Your Nu Health Index is eight point four out of ten — Steady. " +
      "The four things that lifted your score this week — a walk after dinner, phone off by nine, sleep by ten-thirty, sunlight in the morning — " +
      "those are your recipes for feeling good. When you do them, your ring stays quiet. When you don't, it starts to whisper.",
    approxSeconds: 22,
    hasCheckpoint: true,
  },
  {
    id: "glucose-storyteller",
    emoji: "📖",
    name: "Glucose Story",
    subtitle: "Yesterday, minute by minute",
    eyebrow: "Yesterday's glucose story",
    headline: "Every meal. Every walk. Every dip.",
    narration:
      "This is your glucose curve from yesterday. Two spikes stand out. Breakfast at 8:45 pushed you to 174. " +
      "Dinner at 7:15 pushed you to 148. Both times, the twenty-minute walk brought you back down inside forty-five minutes. " +
      "Tap the breakfast spike - the amber dot at 174 - and I'll tell you what made it move.",
    approxSeconds: 24,
    hasCheckpoint: true,
  },
  {
    id: "kindred-connector",
    emoji: "🤝",
    name: "Community",
    subtitle: "People who look like you",
    eyebrow: "People like you",
    headline: "You are not walking alone.",
    narration:
      "Fifteen thousand people started this program the way you did. Same age range. Same starting glucose swings. " +
      "In their first thirty days on The Long Walker, they saw twenty-eight percent fewer spikes, eight pounds lost, " +
      "and eleven percent more time in range. Your numbers are pointing at the same shape.",
    approxSeconds: 22,
  },
  {
    id: "trend-watcher",
    emoji: "📈",
    name: "Your Trend",
    subtitle: "Where Sally is heading",
    eyebrow: "Your trend",
    headline: "Momentum 78 to 86 in seven days.",
    narration:
      "Your momentum has climbed sixteen points in fourteen days. If you stay on The Long Walker this week, " +
      "the model expects you to reach eighty-six by next Wednesday. Weight is 178. Goal is 170. " +
      "At your current pace, that's five weeks away. Real progress. Sustainable pace.",
    approxSeconds: 22,
  },
  {
    id: "evening-companion",
    emoji: "🌙",
    name: "Tonight at 7:30 pm",
    subtitle: "Tonight's small win",
    eyebrow: "Tonight",
    headline: "Tonight's small win.",
    narration:
      "Tonight at 7:30 PM, take a twenty-minute walk after dinner. That's your only commitment. " +
      "One small win extends tomorrow's momentum. When you're done, tell me - I'll log it, and we'll pick this up in the morning. " +
      "Small steps today. Big wins tomorrow.",
    approxSeconds: 22,
  },
  // -------- Nu-suggested steps (opt-in additions to the daily rotation) --------
  {
    id: "weekly-reflection",
    emoji: "📓",
    name: "Weekly Reflection",
    subtitle: "Sundays only",
    eyebrow: "Sunday recap",
    headline: "What worked. What didn't.",
    narration: "Sunday reflection helps 78% of members hit their Monday goals. Let's take three minutes to name what worked and what got in the way.",
    approxSeconds: 18,
  },
  {
    id: "meal-planning",
    emoji: "🛒",
    name: "Meal Planning",
    subtitle: "Wednesdays before grocery",
    eyebrow: "Meal planning",
    headline: "Plan the next 7 dinners.",
    narration: "Wednesday is your grocery run. Let's line up 7 dinners so protein-first is easy all week.",
    approxSeconds: 20,
  },
  {
    id: "craving-log",
    emoji: "🍰",
    name: "Craving Log",
    subtitle: "Track and understand cravings",
    eyebrow: "Craving check-in",
    headline: "Cravings are data. Let's log this one.",
    narration: "You're in your first eight weeks on semaglutide. Cravings are common and they teach me your triggers. Tell me what and when - I'll spot the pattern.",
    approxSeconds: 22,
    hasCheckpoint: true,
  },
  {
    id: "provider-prep",
    emoji: "📋",
    name: "Provider Prep",
    subtitle: "Before your next visit",
    eyebrow: "Doctor visit prep",
    headline: "Three questions worth asking.",
    narration: "Your visit with Dr. Adams is coming up. Let's gather the three questions worth your face-time.",
    approxSeconds: 15,
  },
  {
    id: "learn-one-thing",
    emoji: "🎓",
    name: "Learn One Thing",
    subtitle: "90-second lesson",
    eyebrow: "Nu teaches",
    headline: "One idea. Ninety seconds.",
    narration: "A quick lesson picked for where you are today - protein-first order at breakfast.",
    approxSeconds: 12,
  },
];

// -------- Best Path options offered in Step 2 --------

export type PathTone = "gold" | "indigo" | "emerald" | "violet" | "sky" | "rose";

export interface CohortStats {
  todayCount: number;         // number of cohort members who chose this path today
  yesterdayCount: number;     // ditto yesterday (for delta)
  weeklyCount: number;        // last 7 days rolling
  successRatePct: number;     // % who hit >= 80% TIR yesterday on this path
  avgTirYesterday: number;    // cohort's average TIR yesterday on this path
}

export interface JourneyPath {
  id: string;
  name: string;
  emoji: string;
  focus: string;
  matchStrength: number;
  tone: PathTone;
  items: { icon: string; label: string }[];
  why: string;
  evidence: { day: string; tir: number; note: string }[];
  cohort: CohortStats;
}

export const JOURNEY_PATHS: JourneyPath[] = [
  {
    id: "long-walker",
    name: "The Long Walker",
    emoji: "🚶‍♀️",
    focus: "Protect your glucose after meals.",
    matchStrength: 100,
    tone: "gold",
    items: [
      { icon: "🚶", label: "Walk 20 min after dinner"     },
      { icon: "🍽️",   label: "Protein-first meals"           },
      { icon: "💧",    label: "Drink 8 glasses of water"      },
      { icon: "🌙",    label: "Aim for 7+ hours of sleep"     },
    ],
    why: "On the days Sally walked after dinner and started meals with protein, her glucose behaved. Not sometimes. Every time.",
    evidence: [
      { day: "Sun - Jun 21", tir: 92, note: "Walked 32 min. Protein breakfast." },
      { day: "Wed - Jun 24", tir: 88, note: "Walked 25 min. Salad + chicken lunch." },
      { day: "Sat - Jun 27", tir: 95, note: "Walked 40 min. Family dinner (portion controlled)." },
    ],
    cohort: { todayCount: 324, yesterdayCount: 298, weeklyCount: 1847, successRatePct: 82, avgTirYesterday: 84 },
  },
  {
    id: "splitter",
    name: "The Splitter",
    emoji: "⏱️",
    focus: "Two short walks a day beat one long one.",
    matchStrength: 92,
    tone: "indigo",
    items: [
      { icon: "🚶", label: "Post-lunch 10-min walk"       },
      { icon: "🏃", label: "Post-dinner 25-min walk"      },
      { icon: "🥗",   label: "Portion-controlled carbs"     },
      { icon: "✅",   label: "Log both walks in the app"    },
    ],
    why: "Sally's lunch spikes dropped 40% when she took a 10-minute walk right after eating.",
    evidence: [
      { day: "Sun - Jun 21", tir: 90, note: "10 min post-lunch + 25 min post-dinner." },
      { day: "Mon - Jun 22", tir: 88, note: "Split walks kept lunch peak at 122." },
      { day: "Sat - Jun 27", tir: 93, note: "Same pattern. Steady curve all day." },
    ],
    cohort: { todayCount: 156, yesterdayCount: 141, weeklyCount: 892, successRatePct: 79, avgTirYesterday: 82 },
  },
  {
    id: "fiber-forward",
    name: "The Fiber-Forward",
    emoji: "🌱",
    focus: "Veggies + fiber pace your glucose curve.",
    matchStrength: 88,
    tone: "emerald",
    items: [
      { icon: "🥦", label: "Half plate of veggies"       },
      { icon: "🌾",    label: "30+ grams fiber daily"        },
      { icon: "➡️",    label: "Eat veggies before starches"  },
      { icon: "🍞",    label: "Whole grains only"            },
    ],
    why: "On high-fiber days, Sally's glucose swings shrunk 30% across the whole afternoon.",
    evidence: [
      { day: "Sat - Jun 20", tir: 87, note: "35g fiber. Flat curve after lunch." },
      { day: "Mon - Jun 22", tir: 91, note: "Veggies before pasta. Peak stayed under 130." },
      { day: "Tue - Jun 23", tir: 89, note: "Grain bowl lunch. Steady evening." },
    ],
    cohort: { todayCount: 89, yesterdayCount: 92, weeklyCount: 512, successRatePct: 74, avgTirYesterday: 79 },
  },
  {
    id: "protein-anchored",
    name: "The Protein-Anchored",
    emoji: "🍗",
    focus: "25-30g protein per meal keeps you steady.",
    matchStrength: 85,
    tone: "rose",
    items: [
      { icon: "🥩", label: "25-30g protein per meal"         },
      { icon: "🍳",  label: "Protein at breakfast"             },
      { icon: "🐟", label: "Lean sources: chicken, fish"      },
      { icon: "🫘", label: "Legumes for plant-forward"        },
    ],
    why: "Protein-first breakfasts flatten Sally's morning curve 15%.",
    evidence: [
      { day: "Thu - Jun 25", tir: 84, note: "3-egg breakfast. Flat AM." },
      { day: "Fri - Jun 26", tir: 87, note: "Greek yogurt + almonds. Held at 100." },
      { day: "Wed - Jul 1",  tir: 99, note: "Cottage cheese + berries. Best morning yet." },
    ],
    cohort: { todayCount: 118, yesterdayCount: 105, weeklyCount: 641, successRatePct: 77, avgTirYesterday: 81 },
  },
  {
    id: "hydration-champion",
    name: "The Hydration Champion",
    emoji: "💧",
    focus: "8+ glasses a day flattens your curve.",
    matchStrength: 82,
    tone: "sky",
    items: [
      { icon: "🥤", label: "8+ glasses of water"      },
      { icon: "☀️", label: "2 glasses before lunch"   },
      { icon: "🍵", label: "Herbal tea counts"        },
      { icon: "✍️", label: "Log every glass"          },
    ],
    why: "Well-hydrated days show 15% lower glucose variability across every meal.",
    evidence: [
      { day: "Mon - Jun 22", tir: 89, note: "9 glasses. CV was 16%." },
      { day: "Sat - Jun 27", tir: 91, note: "8 glasses + herbal tea. Steady." },
      { day: "Wed - Jul 1",  tir: 99, note: "10 glasses. Flat curve all day." },
    ],
    cohort: { todayCount: 74, yesterdayCount: 68, weeklyCount: 398, successRatePct: 71, avgTirYesterday: 77 },
  },
  {
    id: "mindful-meals",
    name: "Mindful Meals",
    emoji: "🥗",
    focus: "Balanced meals, better choices.",
    matchStrength: 88,
    tone: "emerald",
    items: [
      { icon: "🥬", label: "Half the plate is non-starchy vegetables" },
      { icon: "🍗", label: "Protein and fiber before carbs" },
      { icon: "🥄", label: "Stop at 80% full - last bites spike the most" },
      { icon: "⏱️", label: "Slow down - chew each bite" },
    ],
    why: "Order-of-eating and plate composition are the two biggest post-meal levers. Sally's cleanest days all shared this pattern.",
    evidence: [
      { day: "Tue - Jun 23", tir: 88, note: "Veggies first at dinner. Peak stayed under 140." },
      { day: "Fri - Jun 26", tir: 91, note: "Protein-first lunch. Steady all afternoon." },
      { day: "Sun - Jun 28", tir: 93, note: "80% full at all three meals. Textbook day." },
    ],
    cohort: { todayCount: 156, yesterdayCount: 143, weeklyCount: 892, successRatePct: 74, avgTirYesterday: 80 },
  },
  {
    id: "steady-simple",
    name: "Steady & Simple",
    emoji: "⏰",
    focus: "Consistency beats variety.",
    matchStrength: 85,
    tone: "rose",
    items: [
      { icon: "⏰", label: "Same meal times every day (8, 12, 7)" },
      { icon: "🔁", label: "Rotate 3 breakfasts, 3 lunches, 3 dinners" },
      { icon: "🎯", label: "One habit at a time - master, then add" },
      { icon: "📋", label: "Log at the same time each day" },
    ],
    why: "Predictable timing gives your body a rhythm. Same-time meals cut glucose variability by 20% in your cohort.",
    evidence: [
      { day: "Thu - Jun 25", tir: 86, note: "All meals within 15 min of scheduled time." },
      { day: "Sun - Jun 28", tir: 89, note: "Same 3-meal rotation as last Sunday." },
      { day: "Tue - Jun 30", tir: 87, note: "Simple day - no new foods, steady curve." },
    ],
    cohort: { todayCount: 118, yesterdayCount: 122, weeklyCount: 745, successRatePct: 78, avgTirYesterday: 81 },
  },
  {
    id: "move-more",
    name: "Move More",
    emoji: "🏃",
    focus: "Activity earlier in the day.",
    matchStrength: 90,
    tone: "gold",
    items: [
      { icon: "🚶", label: "10-min walk right after breakfast" },
      { icon: "🪜", label: "Take the stairs whenever possible" },
      { icon: "👣", label: "Hit 7,000+ steps by noon" },
      { icon: "⚡", label: "Movement break every 90 minutes" },
    ],
    why: "Morning-anchored movement primes your metabolism for the whole day. Your afternoon peaks are 22 mg/dL lower on active mornings.",
    evidence: [
      { day: "Mon - Jun 22", tir: 90, note: "7,200 steps by noon. Afternoon peak was 132." },
      { day: "Wed - Jun 24", tir: 87, note: "Post-breakfast walk. Curve stayed flat until lunch." },
      { day: "Sat - Jun 27", tir: 92, note: "12,000 steps total. Best day of the week." },
    ],
    cohort: { todayCount: 201, yesterdayCount: 189, weeklyCount: 1156, successRatePct: 76, avgTirYesterday: 82 },
  },
  {
    id: "rest-reset",
    name: "Rest & Reset",
    emoji: "🌙",
    focus: "Sleep and recovery first.",
    matchStrength: 82,
    tone: "violet",
    items: [
      { icon: "📱", label: "Screens off 60 min before bed" },
      { icon: "🌡️", label: "Cool the room to 65-68F" },
      { icon: "⏰", label: "Same wake time every day - weekends included" },
      { icon: "🧘", label: "5-min wind-down ritual" },
    ],
    why: "Sleep is your glucose reset button. Nights of 7.5+ hours consistently give you 12% lower fasting glucose.",
    evidence: [
      { day: "Sun - Jun 28", tir: 92, note: "8h 15m sleep. Fasting glucose 92 mg/dL." },
      { day: "Tue - Jun 30", tir: 88, note: "7h 45m sleep. Room at 66F. Deep sleep up." },
      { day: "Fri - Jul 3",  tir: 90, note: "Screens off by 10 PM. Best deep-sleep of the week." },
    ],
    cohort: { todayCount: 89, yesterdayCount: 94, weeklyCount: 578, successRatePct: 72, avgTirYesterday: 79 },
  },
];

// -------- Mood branches --------

export interface MorningMoodBranch { mood: "good" | "okay" | "struggling"; narration: string; }

export const MORNING_BRANCHES: MorningMoodBranch[] = [
  { mood: "good",       narration: "You're feeling good today. Perfect. Momentum days are the best days to lock in the walk - let's ride that energy straight through to 9:15 PM tonight." },
  { mood: "okay",       narration: "Okay is honest. Okay is fine. On okay days, small commitments beat ambitious ones - we'll keep the plan simple and see how you feel after lunch." },
  { mood: "struggling", narration: "That's real, and I hear you. On rough mornings, one thing counts: just the walk. Skip anything else on the list today, and we'll make the walk feel small." },
];

export const GLUCOSE_CHECKPOINT_RESPONSE =
  "Right. That 174 was breakfast: oatmeal, banana, and honey. All quick-release carbs. " +
  "Add fifteen grams of protein - eggs, greek yogurt, cottage cheese - and the same meal " +
  "typically peaks 40 to 50 milligrams per deciliter lower.";

export const JOURNEY_INTRO = {
  eyebrow: "A day with Nu",
  headline: "Meet Sally.",
  subheadline: "Sally is 52. She's thirteen weeks into a GLP-1 program and uses a CGM. In three minutes, you'll walk through her Wednesday alongside Nu, her digital twin. Voice narrated. You control the pace.",
  ctaLabel: "Begin the journey",
};

export const JOURNEY_OUTRO = {
  eyebrow: "That was Sally's day",
  headline: "This is what one Wednesday looks like on Nu.",
  subheadline: "Multiply by seven days, then by fourteen weeks, then by fifteen thousand Sallys - and you have the Habitnu x Lilly GLP-1 Population Intelligence platform.",
  primaryCta: "Enter the dashboard",
  secondaryCta: "Restart the journey",
};


// ============================================================================
// Personalization layer - separates "what pattern to follow" from "what to eat"
// The pattern transfers across the cohort; the ingredients are personal.
// ============================================================================

export interface MemberProfile {
  memberId: string;
  displayName: string;
  vegetarian: boolean;
  vegan: boolean;
  religiousDiet?: "halal" | "kosher" | "jain" | null;
  allergies: string[];                    // e.g. ["shellfish", "peanut"]
  glutenSensitive: boolean;
  lactoseSensitive: boolean;
  glp1Stage: "titration" | "maintenance"; // titration = more nausea, gentler food
  morningNausea: boolean;
  meds: string[];                         // e.g. ["metformin", "insulin-basal"]
  cohortBaselineTirPct: number;           // where this member starts vs where the path lands
}

export const SALLY_PROFILE: MemberProfile = {
  memberId: "sally",
  displayName: "Sally",
  vegetarian: true,
  vegan: false,
  religiousDiet: null,
  allergies: [],
  glutenSensitive: true,
  lactoseSensitive: false,
  glp1Stage: "titration",
  morningNausea: true,
  meds: ["semaglutide", "metformin"],
  cohortBaselineTirPct: 68,
};

// A pattern is transferable; ingredients are not.
export interface PathBundle {
  pathId: string;
  pattern: {
    movement: string;   // e.g. "Walk 22 min after dinner"
    timing:   string;   // e.g. "Inside the 90-min post-meal window"
    shape:    string;   // e.g. "Protein-first at every meal"
  };
  originalIngredients: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack?: string;
  };
}

export const PATH_BUNDLES: Record<string, PathBundle> = {
  "long-walker": {
    pathId: "long-walker",
    pattern: {
      movement: "Walk 22 minutes after dinner",
      timing:   "Start walking within 30 min of finishing dinner",
      shape:    "Protein-first at breakfast and dinner",
    },
    originalIngredients: {
      breakfast: "Two scrambled eggs + spinach",
      lunch:     "Grilled chicken salad with olive oil",
      dinner:    "Grilled salmon bowl with quinoa and greens",
      snack:     "Greek yogurt with almonds",
    },
  },
  "splitter": {
    pathId: "splitter",
    pattern: {
      movement: "Two 12-minute walks - after lunch, after dinner",
      timing:   "Start walk 45 min after each meal",
      shape:    "Balanced plate, half veggies",
    },
    originalIngredients: {
      breakfast: "Cottage cheese + berries",
      lunch:     "Turkey wrap on whole-wheat tortilla",
      dinner:    "Baked cod with brown rice + broccoli",
      snack:     "Apple + peanut butter",
    },
  },
  "fiber-forward": {
    pathId: "fiber-forward",
    pattern: {
      movement: "10-min walk after every meal",
      timing:   "Fiber before starch at every meal",
      shape:    "35g fiber/day target",
    },
    originalIngredients: {
      breakfast: "Chia pudding with walnuts",
      lunch:     "Lentil soup with whole-grain crackers",
      dinner:    "Roasted vegetable + chickpea bowl",
      snack:     "Pear + almonds",
    },
  },
  "protein-anchored": {
    pathId: "protein-anchored",
    pattern: {
      movement: "15-min walk after breakfast and dinner",
      timing:   "30g protein at breakfast, 40g at dinner",
      shape:    "Protein anchors every meal",
    },
    originalIngredients: {
      breakfast: "Eggs + turkey sausage + spinach",
      lunch:     "Chicken thigh + sweet potato + salad",
      dinner:    "Grilled steak + roasted vegetables",
      snack:     "Cottage cheese + cucumber",
    },
  },
  "hydration-champion": {
    pathId: "hydration-champion",
    pattern: {
      movement: "Short walk after each glass of water",
      timing:   "1 glass of water 20 min before every meal",
      shape:    "3L water/day + electrolyte at 3 PM",
    },
    originalIngredients: {
      breakfast: "Oats with berries + hydration coffee",
      lunch:     "Cucumber salad + hummus + pita",
      dinner:    "Broth-based soup + grain bowl",
      snack:     "Watermelon + feta",
    },
  },
  "mindful-meals": {
    pathId: "mindful-meals",
    pattern: {
      movement: "10-min stroll after each meal",
      timing:   "Veggies first, protein second, carbs last at every meal",
      shape:    "Half plate veggies, stop at 80% full",
    },
    originalIngredients: {
      breakfast: "Spinach + eggs + tomato",
      lunch:     "Big salad + grilled chicken",
      dinner:    "Roasted veggies + quinoa + salmon",
      snack:     "Cottage cheese + berries",
    },
  },
  "steady-simple": {
    pathId: "steady-simple",
    pattern: {
      movement: "One 20-min walk at the same time each day",
      timing:   "Meals at 8 AM, 12 PM, 7 PM sharp",
      shape:    "Rotate a 3-meal cookbook",
    },
    originalIngredients: {
      breakfast: "Oats + banana + peanut butter",
      lunch:     "Turkey wrap + apple",
      dinner:    "Chicken + rice + broccoli",
      snack:     "Greek yogurt",
    },
  },
  "move-more": {
    pathId: "move-more",
    pattern: {
      movement: "10-min walk after breakfast + stair-only day",
      timing:   "First movement within 30 min of waking",
      shape:    "7,000+ steps before noon",
    },
    originalIngredients: {
      breakfast: "Overnight oats + almonds",
      lunch:     "Grilled chicken bowl + hummus",
      dinner:    "Stir-fry with brown rice",
      snack:     "Trail mix",
    },
  },
  "rest-reset": {
    pathId: "rest-reset",
    pattern: {
      movement: "Gentle stretching before bed",
      timing:   "Screens off 60 min before bed",
      shape:    "7.5+ hours in a cool room",
    },
    originalIngredients: {
      breakfast: "Chia pudding + berries",
      lunch:     "Lentil soup + salad",
      dinner:    "Baked salmon + roasted vegetables (early - 6:30 PM)",
      snack:     "Chamomile tea + walnut",
    },
  },
};

// A single adapted meal + why it was changed (or a green "as-is" note).
export interface AdaptedItem {
  original: string;
  adapted: string;
  reason: string;        // e.g. "Vegetarian - swapped fish"
  flag: "changed" | "as-is" | "warn";
}

export interface AdaptedPath {
  pathId: string;
  pattern: PathBundle["pattern"];         // pattern is preserved verbatim
  breakfast: AdaptedItem;
  lunch:     AdaptedItem;
  dinner:    AdaptedItem;
  snack?:    AdaptedItem;
  overallCompatibility: "fits" | "swap" | "skip";
  memberSummary: string;                  // one line explaining the adaptation
  cohortReference?: string;               // "12 members in your cohort do this variant"
}

// Very small deterministic adapter (demo-scale, not clinical logic).
// Real system would call the personalization service.
export function adaptPathForMember(pathId: string, profile: MemberProfile): AdaptedPath {
  const bundle = PATH_BUNDLES[pathId] ?? PATH_BUNDLES["long-walker"];
  const orig = bundle.originalIngredients;

  function adaptOne(original: string): AdaptedItem {
    let adapted = original;
    let reasons: string[] = [];
    const lower = original.toLowerCase();

    // Vegetarian - swap common meats/fish
    if (profile.vegetarian) {
      if (lower.includes("salmon")) { adapted = adapted.replace(/salmon/gi, "paneer tikka"); reasons.push("vegetarian - swapped fish"); }
      if (lower.includes("chicken")) { adapted = adapted.replace(/chicken/gi, "tofu"); reasons.push("vegetarian - swapped poultry"); }
      if (lower.includes("turkey")) { adapted = adapted.replace(/turkey/gi, "plant-protein"); reasons.push("vegetarian - swapped turkey"); }
      if (lower.includes("cod") || lower.includes("fish")) { adapted = adapted.replace(/cod|fish/gi, "tempeh"); reasons.push("vegetarian - swapped fish"); }
      if (lower.includes("steak") || lower.includes("beef")) { adapted = adapted.replace(/steak|beef/gi, "seitan"); reasons.push("vegetarian - swapped red meat"); }
    }

    // Gluten sensitivity
    if (profile.glutenSensitive) {
      if (lower.includes("whole-wheat")) { adapted = adapted.replace(/whole-wheat/gi, "gluten-free"); reasons.push("gluten-free swap"); }
      if (lower.includes("tortilla")) { adapted = adapted.replace(/tortilla/gi, "lettuce wrap"); reasons.push("gluten-free swap"); }
      if (lower.includes("crackers")) { adapted = adapted.replace(/crackers/gi, "seed crackers"); reasons.push("gluten-free swap"); }
      if (lower.includes("pita")) { adapted = adapted.replace(/pita/gi, "cucumber slices"); reasons.push("gluten-free swap"); }
    }

    // Morning nausea - lighter breakfast
    if (profile.morningNausea && (lower.includes("egg") || lower.includes("sausage"))) {
      adapted = "Greek yogurt + berries + chia (lighter for morning)";
      reasons.push("morning-nausea friendly");
    }

    // Lactose sensitivity
    if (profile.lactoseSensitive) {
      if (lower.includes("yogurt")) { adapted = adapted.replace(/yogurt/gi, "coconut yogurt"); reasons.push("lactose-free"); }
      if (lower.includes("cottage cheese")) { adapted = adapted.replace(/cottage cheese/gi, "silken tofu"); reasons.push("lactose-free"); }
    }

    for (const a of profile.allergies) {
      if (lower.includes(a)) {
        adapted = adapted.replace(new RegExp(a, "gi"), "sunflower seed");
        reasons.push(`${a}-free`);
      }
    }

    if (adapted === original) {
      return { original, adapted, reason: "Works for you as-is", flag: "as-is" };
    }
    return { original, adapted, reason: reasons.join(", "), flag: "changed" };
  }

  const breakfast = adaptOne(orig.breakfast);
  const lunch     = adaptOne(orig.lunch);
  const dinner    = adaptOne(orig.dinner);
  const snack     = orig.snack ? adaptOne(orig.snack) : undefined;

  const swaps = [breakfast, lunch, dinner, snack].filter(Boolean).filter(x => x!.flag === "changed").length;
  const overallCompatibility: AdaptedPath["overallCompatibility"] =
    swaps === 0 ? "fits" : swaps <= 3 ? "swap" : "skip";

  const memberSummary =
    swaps === 0
      ? "This path fits you as-is. The pattern and the meals both work for your plan."
      : `${swaps} meal${swaps > 1 ? "s were" : " was"} adapted to your plan. The pattern is unchanged.`;

  const cohortReference =
    swaps > 0 ? `${8 + swaps * 4} members in your cohort follow this same variant.` : undefined;

  return {
    pathId: bundle.pathId,
    pattern: bundle.pattern,
    breakfast, lunch, dinner, snack,
    overallCompatibility,
    memberSummary,
    cohortReference,
  };
}

export interface CohortCompatibility {
  totalCohort: number;
  adaptsClean: number;
  needsSwap: number;
  shouldSkip: number;
  skipReasonBreakdown: { reason: string; count: number }[];
}

export function cohortCompatibility(pathId: string): CohortCompatibility {
  const map: Record<string, CohortCompatibility> = {
    "long-walker": {
      totalCohort: 428, adaptsClean: 391, needsSwap: 24, shouldSkip: 13,
      skipReasonBreakdown: [
        { reason: "GLP-1 titration nausea peak", count: 6 },
        { reason: "Cardiac clearance pending",   count: 4 },
        { reason: "Recent joint surgery",         count: 3 },
      ],
    },
    "splitter": {
      totalCohort: 428, adaptsClean: 402, needsSwap: 18, shouldSkip: 8,
      skipReasonBreakdown: [
        { reason: "Shift work - no lunch break", count: 5 },
        { reason: "Mobility restriction",         count: 3 },
      ],
    },
    "mindful-meals": {
      totalCohort: 428, adaptsClean: 386, needsSwap: 30, shouldSkip: 12,
      skipReasonBreakdown: [
        { reason: "GI-flare - restricted diet", count: 5 },
        { reason: "Doesn't cook",                count: 4 },
        { reason: "Family meal constraints",    count: 3 },
      ],
    },
    "steady-simple": {
      totalCohort: 428, adaptsClean: 411, needsSwap: 12, shouldSkip: 5,
      skipReasonBreakdown: [
        { reason: "Travel-heavy week",           count: 3 },
        { reason: "Shift work - variable hours", count: 2 },
      ],
    },
    "move-more": {
      totalCohort: 428, adaptsClean: 372, needsSwap: 32, shouldSkip: 24,
      skipReasonBreakdown: [
        { reason: "Recent joint pain",          count: 10 },
        { reason: "Mobility restriction",        count: 8 },
        { reason: "Cardiac clearance pending",   count: 6 },
      ],
    },
    "rest-reset": {
      totalCohort: 428, adaptsClean: 405, needsSwap: 14, shouldSkip: 9,
      skipReasonBreakdown: [
        { reason: "Night-shift worker",         count: 5 },
        { reason: "Newborn at home",             count: 4 },
      ],
    },
  };
  return map[pathId] ?? map["long-walker"];
}
