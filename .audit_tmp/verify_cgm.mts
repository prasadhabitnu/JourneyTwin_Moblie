import { generateCgmStream, computeAgp, lensInsight } from "../lib/cgmData";

const stream = generateCgmStream("P100967");
console.log("=== Sandy R. (P100967) — 14-day CGM stream ===");
console.log(`Overall: TIR ${stream.overall.timeInRange}% · avg ${stream.overall.avg} mg/dL · GMI ${stream.overall.gmi}% · CV ${stream.overall.cv}%`);
console.log(`Time above 180: ${stream.overall.timeAbove}% · below 70: ${stream.overall.timeBelow}%`);
console.log(`Very high (>250): ${stream.overall.timeVeryHigh}% · very low (<54): ${stream.overall.timeVeryLow}%`);

console.log("\n=== Per-day summary ===");
console.log("Day  Date              TIR   Avg   Min–Max     CV     Events");
stream.days.forEach((d, i) => {
  console.log(`${String(i+1).padStart(2)}   ${d.date.padEnd(18)}${String(d.timeInRange).padStart(3)}%   ${String(d.avg).padStart(3)}   ${d.min}–${d.max}    ${String(d.cv).padStart(4)}%  ${d.annotations.length}`);
});

const agp = computeAgp(stream.days);
console.log("\n=== AGP percentile bands (spot check at 8am, noon, 6pm) ===");
[8, 12, 18].forEach(h => {
  const bin = agp.find(b => Math.abs(b.hour - h) < 0.01);
  if (bin) console.log(`  ${h}:00 → p10=${Math.round(bin.p10)} p25=${Math.round(bin.p25)} p50=${Math.round(bin.p50)} p75=${Math.round(bin.p75)} p90=${Math.round(bin.p90)}`);
});

console.log("\n=== Lens insights (Sandy R., day 14 = today) ===");
for (const lens of ["default","notices","remembers","predicts","recommends","recovery"] as const) {
  const ins = lensInsight(stream, 13, lens);
  console.log(`\n[${lens}] ${ins.headline}`);
  ins.bullets.forEach(b => console.log(`  • ${b}`));
}

console.log("\n=== Sample day-1 annotations (with cause attribution) ===");
stream.days[0].annotations.forEach(a => {
  const time = new Date(a.t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const delta = a.glucoseDelta !== undefined ? ` (${a.glucoseDelta > 0 ? "+" : ""}${a.glucoseDelta} mg/dL)` : "";
  console.log(`  ${time}  [${a.kind.padEnd(10)}] ${a.label}${delta}`);
  console.log(`         → ${a.attribution}`);
});
