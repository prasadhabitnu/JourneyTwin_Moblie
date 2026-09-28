// Audit Sandy count in the generated dataset
import { PATIENTS } from "./lib/patientData.ts";
const sandys = PATIENTS.filter(p => p.name.startsWith("Sandy"));
console.log("Sandys total:", sandys.length);
sandys.forEach(p => console.log(" ", p.id, "->", p.name, "(", p.age, p.sex, "BMI", p.bmi, ")"));

const ids = ["P100150", "P100384", "P100736"];
ids.forEach(id => {
  const p = PATIENTS.find(x => x.id === id);
  console.log(id + ":", p ? `${p.name} (${p.age}${p.sex} BMI ${p.bmi})` : "NOT FOUND");
});

// Count name collisions (any duplicate names?)
const counts = {};
PATIENTS.forEach(p => counts[p.name] = (counts[p.name]||0)+1);
const dupes = Object.entries(counts).filter(([n,c]) => c > 1).sort((a,b)=>b[1]-a[1]).slice(0,5);
console.log("Top name dupes:", dupes);
