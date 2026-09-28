import { PATIENTS } from "../lib/patientData";

// Candidate criteria for the Sandy demo persona:
//  - Female
//  - Age 38-52 (mid-life GLP-1 audience)
//  - BMI 32-38 (squarely in GLP-1 indication, not extreme)
//  - status === "Active" (on program right now)
//  - weeksOnProgram between 8 and 20 (early-mid, side effects peak window)
//  - NOT contraindicated (would conflict with "reduce dose" action)
//  - pps (persistence) between 0.35 and 0.65 — wobbly enough that the
//    "GLP-1 side effects + low adherence" reason reads as believable

const candidates = PATIENTS.filter(p =>
  p.sex === "F" &&
  p.age >= 38 && p.age <= 52 &&
  p.bmi >= 32 && p.bmi <= 38 &&
  p.status === "Active" &&
  p.weeksOnProgram >= 8 && p.weeksOnProgram <= 20 &&
  !p.hasContraindication &&
  p.pps >= 0.35 && p.pps <= 0.65
);

console.log("Total candidates:", candidates.length);
console.log();

// Sort by "good demo profile" score: closer to BMI 35, mid-program, moderate pps
const scored = candidates.map(p => ({
  p,
  score:
    Math.abs(p.bmi - 35) +
    Math.abs(p.weeksOnProgram - 12) * 0.2 +
    Math.abs(p.pps - 0.5) * 2
})).sort((a,b) => a.score - b.score);

console.log("Top 8 candidates by demo-profile fit:");
scored.slice(0, 8).forEach(({p, score}) => {
  console.log(
    `  ${p.id}  ${p.name.padEnd(14)}  age ${p.age}F  BMI ${p.bmi}  HbA1c ${p.hba1c}  ` +
    `wk ${p.weeksOnProgram}  PPS ${p.pps.toFixed(2)}  GES ${p.ges}  RSS ${p.rss}  ` +
    `score ${score.toFixed(2)}`
  );
});
