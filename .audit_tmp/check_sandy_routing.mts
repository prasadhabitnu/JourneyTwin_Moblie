import { PATIENTS } from "../lib/patientData";
import { coachOf, COACHES, priorityQueue, participantsOf } from "../lib/coachIntelligence";

const sandy = PATIENTS.find(p => p.id === "P100967")!;
const c = coachOf(sandy);
console.log("Sandy's assigned coach:", c.id, c.name, "(region:", c.region, ")");
console.log("Sandy demographics:", `${sandy.age}${sandy.sex} BMI ${sandy.bmi} HbA1c ${sandy.hba1c} wk ${sandy.weeksOnProgram}`);
console.log("Sandy clinical signals:", `pdc=${sandy.pdc.toFixed(2)} pps=${sandy.pps.toFixed(2)} portalLogins90d=${sandy.portalLogins90d} coachInteractions90d=${sandy.coachInteractions90d} systolicBP=${sandy.systolicBP} pctBwLoss=${sandy.pctBwLoss.toFixed(1)} comorbidities=${sandy.comorbidities.join("|")} status=${sandy.status}`);

console.log();
for (const coach of COACHES) {
  const q = priorityQueue(coach.id, 50);
  const inQueue = q.find(e => e.patient.id === "P100967");
  const total = participantsOf(coach.id).length;
  console.log(`${coach.id} ${coach.name.padEnd(18)} caseload ${total} — Sandy ${inQueue ? `IN queue at rank ${q.indexOf(inQueue)+1}, score ${inQueue.riskScore}, band ${inQueue.riskBand}` : "not in queue"}`);
}
