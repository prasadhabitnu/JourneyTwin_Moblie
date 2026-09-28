import { PATIENTS } from "../lib/patientData";

const sandys = PATIENTS.filter(p => p.name.startsWith("Sandy"));
console.log("Sandys in dataset:", sandys.length);
sandys.forEach(p => console.log(`  ${p.id}  ${p.name}  age ${p.age}${p.sex}  BMI ${p.bmi}  HbA1c ${p.hba1c}  wk ${p.weeksOnProgram}  PPS ${p.pps.toFixed(2)}  status ${p.status}`));

console.log();
const ids = ["P100150", "P100384", "P100736", "P100967"];
ids.forEach(id => {
  const p = PATIENTS.find(x => x.id === id);
  if (!p) return console.log(`${id}: NOT FOUND`);
  console.log(`${id}: ${p.name.padEnd(14)} age ${p.age}${p.sex} BMI ${p.bmi} wk ${p.weeksOnProgram}`);
});
