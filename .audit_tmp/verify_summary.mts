import { PATIENTS } from "../lib/patientData";
import { sessionSummary } from "../lib/coachIntelligence";

const sandy = PATIENTS.find(p => p.id === "P100967")!;
const s = sessionSummary(sandy);

console.log("Sandy R. session summary:");
console.log("  mood:", s.mood);
console.log("  BLOCKERS:");
s.blockers.forEach(b => console.log("    •", b));
console.log("  RECOMMENDED ACTIONS:");
s.nextActions.forEach(a => console.log("    →", a));
console.log("  RISK FLAGS:");
s.riskFlags.forEach(r => console.log("    ⚠", r));

console.log("\nSanity check — another patient (not Sandy) still uses dynamic generation:");
const other = PATIENTS.find(p => p.id !== "P100967" && p.status === "Active")!;
const o = sessionSummary(other);
console.log(`  ${other.name}: ${o.blockers.length} blockers, ${o.nextActions.length} actions, ${o.riskFlags.length} flags — generated dynamically`);
