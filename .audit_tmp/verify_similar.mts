import { generateCgmStream, similarDaysForLens, CgmLens } from "../lib/cgmData";

const s = generateCgmStream("P100967");
const LENSES: CgmLens[] = ["default", "notices", "remembers", "predicts", "recommends", "recovery"];

for (const lens of LENSES) {
  const refs = similarDaysForLens(s, 13, lens);
  console.log(`\n=== ${lens.toUpperCase()} lens (from Day 14) — ${refs.length} references ===`);
  refs.forEach(r => {
    console.log(`  [${r.outcome.padEnd(8)}] ${r.tag.padEnd(18)} ${r.date} — TIR ${r.tir}% · avg ${r.avg}`);
    console.log(`    Why: ${r.matchReason}`);
    console.log(`    Key: ${r.keyEvent}`);
    if (r.stepsTaken.length) console.log(`    Steps taken: ${r.stepsTaken.join(" · ")}`);
    if (r.stepsSkipped?.length) console.log(`    Skipped:     ${r.stepsSkipped.join(" · ")}`);
    console.log(`    ⤳ ${r.takeaway}`);
  });
}
