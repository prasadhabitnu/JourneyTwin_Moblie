import { generateCgmStream } from "../lib/cgmData";
const s = generateCgmStream("P100967");
console.log("Day labels (should be identical across server + client now):");
s.days.forEach((d, i) => console.log(`  Day ${i+1}: ${d.date}`));
