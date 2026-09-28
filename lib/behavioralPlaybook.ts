/**
 * Motivational Interviewing (MI) playbook for Maya — keyed to member NHI band.
 * OARS scaffold (Open questions · Affirmations · Reflections · Summaries) plus
 * per-band stance, opening questions, reflection scripts, change-talk prompts,
 * resistance patterns, and directive→autonomy language swaps.
 *
 * Grounded in Miller & Rollnick MI-4 (2023), Deci & Ryan Self-Determination
 * Theory, and Wendy Wood habit research.
 */

import type { RingBand } from "./coachData";

export interface ReflectionScript {
  memberSays: string;
  mayaReflects: string;
  kind: "simple" | "complex" | "double-sided";
}
export interface ResistancePlay {
  resistance: string;
  rollWith: string;
}
export interface LanguageSwap {
  directive: string;
  autonomyLift: string;
}

export interface MIPlaybook {
  band: RingBand;
  stance: string;                        // 1-2 sentence orientation
  openingQuestions: string[];             // 3-4 open-ended MI-style openers
  reflections: ReflectionScript[];        // 3 example "member says / Maya reflects" pairs
  changeTalk: string[];                   // 2-3 change-talk elicitation prompts
  resistance: ResistancePlay[];           // 2-3 common resistance patterns + rolls
  swaps: LanguageSwap[];                  // 3 directive → autonomy-supportive swaps
  microScript?: {                          // one small vignette showing MI in flow
    context: string;
    turns: Array<{ speaker: "Maya" | "Sally"; text: string; note?: string }>;
  };
}

export const MI_PLAYBOOKS: Record<RingBand, MIPlaybook> = {
  care: {
    band: "care",
    stance: "Safety first. Presence over solutions. Reduce shame. Non-anxious calm.",
    openingQuestions: [
      "How are you doing today — really?",
      "What would feel most helpful in the next 24 hours?",
      "Who else can we bring alongside you right now?",
      "If we did nothing else this week, what one thing would matter most to you?",
    ],
    reflections: [
      { memberSays: "I feel awful and I don't know why I bother.",
        mayaReflects: "It sounds like the effort has stopped feeling worth the return, and that's exhausting.",
        kind: "complex" },
      { memberSays: "The medication isn't working like it should.",
        mayaReflects: "You feel like the medication isn't doing what you expected of it.",
        kind: "simple" },
      { memberSays: "I don't want to call the doctor.",
        mayaReflects: "Part of you thinks the doctor could help, and part of you wants to handle this yourself first.",
        kind: "double-sided" },
    ],
    changeTalk: [
      "If you could feel a little better this week, what's the smallest sign you'd notice?",
      "What have you noticed on the days that go OK vs. the days that don't?",
      "What would need to change for you to feel like you're on the other side of this?",
    ],
    resistance: [
      { resistance: "\"I've tried everything.\"",
        rollWith: "You've done more than most people would. Would you tell me about the one thing that felt closest to working?" },
      { resistance: "\"I don't have time.\"",
        rollWith: "Time is real. If we had 5 minutes together, not 50, what would matter most to you?" },
    ],
    swaps: [
      { directive: "You need to see the doctor.",             autonomyLift: "What would help you decide about a doctor visit?" },
      { directive: "You should stop skipping breakfast.",     autonomyLift: "What's it like on the mornings you do eat something small?" },
      { directive: "You have to reduce your stress.",         autonomyLift: "Where does stress feel like it lives in your body right now?" },
    ],
  },

  recover: {
    band: "recover",
    stance: "Build momentum. Small wins. Reactivate hope. Name what's still working.",
    openingQuestions: [
      "What's one thing that's gone right this week — even a little?",
      "What would feeling 10% better look like on your best day this week?",
      "What used to work, back when things were easier?",
      "What have you kept doing that you almost gave up on?",
    ],
    reflections: [
      { memberSays: "I did walk twice this week, but only twice.",
        mayaReflects: "Twice is a real change from zero — and it sounds like you were hoping for more from yourself.",
        kind: "double-sided" },
      { memberSays: "I feel like I'm just going through the motions.",
        mayaReflects: "Something in you is still showing up, even when the feeling isn't there.",
        kind: "complex" },
      { memberSays: "The scale hasn't moved in three weeks.",
        mayaReflects: "Three weeks is long enough that you're starting to wonder if this is going to work.",
        kind: "complex" },
    ],
    changeTalk: [
      "You did walk twice — what made those days different?",
      "What would need to be true for you to walk three times next week instead of two?",
      "On a scale of 1-10, how important is it to you to break this plateau? … Why not lower?",
    ],
    resistance: [
      { resistance: "\"Nothing I do works.\"",
        rollWith: "That's a heavy thing to be carrying. If I asked you to name one small thing that at least didn't hurt, what would it be?" },
      { resistance: "\"I want to quit the program.\"",
        rollWith: "You've had a rough stretch. What would you want the program to look like for it to be worth staying?" },
    ],
    swaps: [
      { directive: "You should log your meals.",              autonomyLift: "What have you noticed about your energy after different meals?" },
      { directive: "You need to walk more.",                   autonomyLift: "Which walk — morning or evening — feels more possible to you?" },
      { directive: "You have to be consistent.",              autonomyLift: "What's one thing you could do 3 days out of 7 that would feel like a win?" },
    ],
  },

  watch: {
    band: "watch",
    stance: "Habit-formation coaching. Anchor-stacking questions. Environment design over willpower.",
    openingQuestions: [
      "Which of your current routines feels rock-solid — the one you'd never skip?",
      "If we attached ONE tiny habit to it, what would you want to try?",
      "What would make it impossible to forget?",
      "What's the smallest version of this change that still counts as change?",
    ],
    reflections: [
      { memberSays: "I always mean to walk after dinner but forget.",
        mayaReflects: "The intention is real; the cue is the missing piece.",
        kind: "complex" },
      { memberSays: "I know what I should do, I just don't do it.",
        mayaReflects: "Willpower isn't the missing ingredient here — you're describing what most of us live with.",
        kind: "complex" },
      { memberSays: "I've thought about tracking my sleep.",
        mayaReflects: "You've been curious about it. What's kept you from starting?",
        kind: "simple" },
    ],
    changeTalk: [
      "If you tried this one small thing for a week, what would tell you it's working?",
      "What's the environment change that would make this almost automatic?",
      "You said dinner is at 6:15 every night — how could that clock become your teacher?",
    ],
    resistance: [
      { resistance: "\"I'm not the kind of person who does habits.\"",
        rollWith: "You already have some — dinner at 6:15 for 47 nights is a habit. What if the new one just piggybacked on the old one?" },
      { resistance: "\"I keep forgetting.\"",
        rollWith: "Forgetting isn't a character flaw, it's a cue problem. What would you SEE that would remind you?" },
    ],
    swaps: [
      { directive: "You should walk 15 minutes after dinner.",  autonomyLift: "After dinner tonight, what if your shoes were by the door?" },
      { directive: "You need to hydrate more.",                 autonomyLift: "Where would a glass of water 'live' so it's the first thing you see in the morning?" },
      { directive: "Cut out phone time before bed.",             autonomyLift: "What would you want to do with the last 30 minutes of the day instead?" },
    ],
    microScript: {
      context: "Sally · watch band · walk habit forming",
      turns: [
        { speaker: "Maya",  text: "Sally, before we look at the numbers, what's one small thing that's been going well?" },
        { speaker: "Sally", text: "I walked after dinner three nights this week." },
        { speaker: "Maya",  text: "Three nights. What made those specific nights work?", note: "Reflection + open question · elicits the mechanism, not the shame" },
        { speaker: "Sally", text: "I put my shoes by the door on Monday. On the other nights I forgot." },
        { speaker: "Maya",  text: "So the shoes by the door were kind of doing the reminding for you.", note: "Complex reflection · names the environmental cue" },
        { speaker: "Sally", text: "Yeah. When I saw them, I just did it." },
        { speaker: "Maya",  text: "What would need to be true for the shoes to be by the door every night?", note: "Change talk elicitation · lets Sally design the fix" },
      ],
    },
  },

  steady: {
    band: "steady",
    stance: "Reinforce. Deepen. Move from behavior to identity. Values work.",
    openingQuestions: [
      "What kind of person do you want to be about your health, a year from now?",
      "What are you most proud of in the last month?",
      "What would make this feel automatic?",
      "What have you learned about yourself in this stretch?",
    ],
    reflections: [
      { memberSays: "I actually look forward to my evening walk now.",
        mayaReflects: "It's stopped being 'what I have to do' and started being 'what I want to do.'",
        kind: "complex" },
      { memberSays: "I don't think about the scale as much anymore.",
        mayaReflects: "You're anchored to something more durable than the number now.",
        kind: "complex" },
      { memberSays: "My kids noticed I'm different.",
        mayaReflects: "The change is showing up in the parts of your life that matter most.",
        kind: "complex" },
    ],
    changeTalk: [
      "What would the version of you 12 months from now do that you're not doing yet?",
      "You said you 'feel like yourself again' — what does yourself do that you want to do more of?",
      "What's a habit you'd want to add now that you couldn't have handled 3 months ago?",
    ],
    resistance: [
      { resistance: "\"I'm afraid this won't last.\"",
        rollWith: "That fear makes sense. What have you built this time that wasn't there before?" },
      { resistance: "\"I don't want to lose my momentum.\"",
        rollWith: "Momentum is a real thing to protect. What would you want to have in place before you need it?" },
    ],
    swaps: [
      { directive: "Keep doing what you're doing.",           autonomyLift: "What's the deepest version of what you're doing?" },
      { directive: "You should set stretch goals.",           autonomyLift: "What would feel like a natural next chapter — not a bigger one, a different one?" },
      { directive: "You need to reward yourself.",             autonomyLift: "What are you enjoying about this that you didn't expect?" },
    ],
  },

  excellent: {
    band: "excellent",
    stance: "Celebrate. Give back. Share wisdom. Model for the cohort.",
    openingQuestions: [
      "What has surprised you most about your own capacity?",
      "If you were coaching someone at week 4, what would you tell them?",
      "Where do you want to go from here?",
      "What's a skill you have now that you didn't have a year ago?",
    ],
    reflections: [
      { memberSays: "I feel like I've cracked something.",
        mayaReflects: "You've built the thing you were reaching for. Now the question is what to do with it.",
        kind: "complex" },
      { memberSays: "I don't know what to do without a goal.",
        mayaReflects: "The goal was a scaffold. Now the scaffold's coming down and you're seeing what you built.",
        kind: "complex" },
      { memberSays: "I want to help other members.",
        mayaReflects: "You've noticed you have something to give back.",
        kind: "simple" },
    ],
    changeTalk: [
      "What would happen if you told 3 people in the cohort what worked for you?",
      "What's the next thing that would be worth going after — even a totally different thing?",
      "You said this feels sustainable. What is it about you that makes it sustainable?",
    ],
    resistance: [
      { resistance: "\"I don't want to jinx it.\"",
        rollWith: "Naming what worked isn't a jinx — it's a record. You can always take it back if it stops being true." },
      { resistance: "\"I'm worried about complacency.\"",
        rollWith: "The fact that you're worried about it is probably the strongest protection against it." },
    ],
    swaps: [
      { directive: "Keep pushing.",                            autonomyLift: "What are you enjoying enough to want to protect?" },
      { directive: "You should set a new goal.",              autonomyLift: "What are you curious about that you weren't 6 months ago?" },
      { directive: "Consider mentoring someone.",              autonomyLift: "What would it be like to walk a newer member through your first 4 weeks?" },
    ],
  },
};

// OARS scaffold — the 4 core MI micro-skills that show up in every conversation
export const OARS = [
  {
    letter: "O",
    name: "Open questions",
    body: "Questions that can't be answered with yes/no. Invite the member to think, not to justify. Aim for 3 open questions for every closed one.",
    example: "'What made this week feel different?' — not 'Did you walk this week?'",
  },
  {
    letter: "A",
    name: "Affirmations",
    body: "Specific, honest recognition of member effort or strength. Not praise — recognition. Never generic.",
    example: "'You noticed the pattern before I did.' — not 'You're doing great.'",
  },
  {
    letter: "R",
    name: "Reflections",
    body: "Say back what the member said, or the meaning underneath. Simple reflections repeat; complex ones name the emotion or hidden ambivalence.",
    example: "'You want the walk but the tiredness is louder right now.'",
  },
  {
    letter: "S",
    name: "Summaries",
    body: "Weave together threads across the conversation. Show you've heard everything. Ends with a forward-looking question.",
    example: "'You've walked 3 times, mood's up, but sleep's still off. Where do you want to focus next?'",
  },
];
