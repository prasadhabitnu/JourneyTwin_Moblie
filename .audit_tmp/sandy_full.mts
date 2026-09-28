import { PATIENTS } from "../lib/patientData";
const s = PATIENTS.find(p => p.id === "P100967")!;
console.log("Sandy full record:");
console.log(`  id=${s.id} name=${s.name}`);
console.log(`  status=${s.status} gesTier=${s.gesTier} ppsBand=${s.ppsBand}`);
console.log(`  ges=${s.ges} pps=${s.pps.toFixed(2)} ofs=${s.ofs.toFixed(1)}`);
console.log(`  payerPosture=${s.payerPosture}`);
console.log(`  state=${s.state} bucket=${s.bucket}`);
