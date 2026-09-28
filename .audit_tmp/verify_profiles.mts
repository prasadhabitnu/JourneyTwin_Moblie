import { generateCgmStream, nuSuccessProfiles } from "../lib/cgmData";

const s = generateCgmStream("P100967");
const profiles = nuSuccessProfiles(s);

console.log(`=== ${profiles.length} Success Profiles for Sandy R. ===\n`);
profiles.forEach(p => {
  console.log(`${p.emoji}  ${p.name}`);
  console.log(`     "${p.tagline}"`);
  console.log(`     Matches: ${p.matchingDayIndices.length} days · avg TIR ${p.avgTir}%`);
  console.log(`     Signature: ${p.signatureStat.label} → ${p.signatureStat.value}`);
  console.log(`     Best for: ${p.bestFor}`);
  console.log(`     Matching days: ${p.matchingDayIndices.map(i => s.days[i].date).join(" · ")}`);
  console.log();
  console.log(`     Recipe:`);
  p.recipe.forEach(r => console.log(`       • [${r.icon.padEnd(9)}] ${r.label}`));
  console.log();
  console.log(`     💡 Nu suggests (${p.nuEnhancement.tone}):`);
  console.log(`        ${p.nuEnhancement.title}`);
  console.log(`        ${p.nuEnhancement.detail}`);
  console.log(`        → Estimated lift: ${p.nuEnhancement.estimatedLift}`);
  console.log();
});
