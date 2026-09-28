import { PATIENTS } from "../lib/patientData";

const bandOf = (rss: string) =>
  rss === "Low" ? "Stable" : rss === "Medium" ? "Watch" : "Critical";

const riskByBand = (["Stable", "Watch", "Critical"] as const).map(b => {
  const pts = PATIENTS.filter(p => bandOf(p.rss) === b);
  return {
    band: b,
    T1: pts.filter(p => p.gesTier === "T1").length,
    T2: pts.filter(p => p.gesTier === "T2").length,
    T3: pts.filter(p => p.gesTier === "T3").length,
    T4: pts.filter(p => p.gesTier === "T4").length,
    total: pts.length,
  };
});

console.log("Simplified 3-band × eligibility-tier matrix:");
console.log("  Band      T1    T2    T3    T4    Total");
riskByBand.forEach(r => {
  console.log(`  ${r.band.padEnd(8)} ${String(r.T1).padStart(4)}  ${String(r.T2).padStart(4)}  ${String(r.T3).padStart(4)}  ${String(r.T4).padStart(4)}  ${String(r.total).padStart(5)}`);
});

const grand = riskByBand.reduce((a, r) => a + r.total, 0);
console.log(`  Grand total: ${grand}`);
