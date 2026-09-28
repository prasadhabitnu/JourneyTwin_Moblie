import { dailyRecap, COACHES } from "../lib/coachIntelligence";

const r = dailyRecap(COACHES[0].id);
console.log("Coach:", r.coach.name);
console.log("Date:", r.date);
console.log("\nNarrative:\n  ", r.narrative);
console.log("\nStats:", r.stats);
console.log("\nTimeline (", r.timeline.length, "events):");
r.timeline.forEach(e => console.log(`  ${e.time}  [${e.type.padEnd(11)}] ${e.title}${e.memberName ? "  ⟵ " + e.memberName : ""}`));
console.log("\nWins (", r.wins.length, "):");
r.wins.forEach(w => console.log(`  ✓ ${w.title}`));
console.log("\nTomorrow's focus (", r.tomorrow.length, "):");
r.tomorrow.forEach(t => console.log(`  #${t.rank}. ${t.patient.name} (${t.patient.id})  — ${t.rationale}`));
console.log("\nMood snapshot:");
r.moodSnapshot.forEach(m => console.log(`  ${m.mood.padEnd(12)} ${m.count}`));
