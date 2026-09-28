import { PATIENTS } from "../lib/patientData";

const PAYER_FRIENDLY = ["Commercial PA-friendly", "Self-pay / cash"];

// Mirror the page's ranking logic with the demo override
function ranked(tier: "all"|"T1"|"T2", payer: "all"|"friendly") {
  const natural = PATIENTS
    .filter(p => p.gesTier === "T1" || p.gesTier === "T2")
    .filter(p => p.status === "Identified" || p.status === "Outreach")
    .filter(p => p.id !== "P100967")
    .filter(p => tier === "all" ? true : p.gesTier === tier)
    .filter(p => payer === "all" ? true : PAYER_FRIENDLY.includes(p.payerPosture))
    .map(p => ({
      ...p,
      compositeScore: p.ges * 0.55
        + p.pps * 100 * 0.30
        + (PAYER_FRIENDLY.includes(p.payerPosture) ? 15 : 0),
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const sandy = PATIENTS.find(p => p.id === "P100967");
  const sandyPassesTier = sandy && (tier === "all" || sandy.gesTier === tier);
  const sandyPassesPayer = sandy && (payer === "all" || PAYER_FRIENDLY.includes(sandy.payerPosture));
  if (sandy && sandyPassesTier && sandyPassesPayer) {
    const topScore = natural[0]?.compositeScore ?? 80;
    return [{ ...sandy, compositeScore: topScore + 2 }, ...natural];
  }
  return natural;
}

function show(t: "all"|"T1"|"T2", pa: "all"|"friendly") {
  const r = ranked(t, pa);
  const sandy = r.find(p => p.id === "P100967");
  const sandyRank = sandy ? r.indexOf(sandy) + 1 : -1;
  console.log(`Filter tier=${t}, payer=${pa}: total ${r.length}, Sandy ${sandy ? `at rank ${sandyRank} (composite ${sandy.compositeScore.toFixed(1)})` : "ABSENT"}`);
  console.log(`  Top 3:`);
  r.slice(0, 3).forEach((p, i) => console.log(`    ${i+1}. ${p.id}  ${p.name.padEnd(14)}  composite ${p.compositeScore.toFixed(0)}  GES ${p.ges}  tier ${p.gesTier}`));
}

show("all", "all");
show("T2", "all");
show("T1", "all");           // Sandy is T2 so this should exclude her
show("all", "friendly");     // Sandy's payer isn't friendly so this should exclude her
