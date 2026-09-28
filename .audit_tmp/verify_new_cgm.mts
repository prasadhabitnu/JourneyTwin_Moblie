import { generateCgmStream, computeCgmScore, computeHealthCredits, earnedBadges,
         foodCorrelation, mealResponseCards, patternDetection, weeklyProgress } from "../lib/cgmData";

const s = generateCgmStream("P100967");
const score = computeCgmScore(s);
const cr = computeHealthCredits(s);
const bd = earnedBadges(s);
const fc = foodCorrelation(s);
const mr = mealResponseCards(s, 6);
const pt = patternDetection(s);
const wk = weeklyProgress(s);

console.log("=== Sandy R. — expanded CGM analytics ===\n");
console.log(`CGM Score: ${score.score} (${score.bandLabel})  trend: ${score.trend} ${score.trendDelta > 0 ? "+" : ""}${score.trendDelta}`);
score.breakdown.forEach(b => console.log(`   ${b.label.padEnd(18)} ${b.contribution} / ${b.max}`));

console.log(`\nHealth Credits: ${cr.total.toLocaleString()} · ${cr.level} · +${cr.weekly} this week`);
if (cr.nextLevel) console.log(`   → ${cr.toNextLevel} to ${cr.nextLevel} (${cr.progressPct}% of segment)`);
cr.breakdown.forEach(b => console.log(`   ${b.source.padEnd(40)} +${b.credits}`));

console.log(`\nAchievements: ${bd.filter(x => x.earned).length} / ${bd.length} unlocked`);
bd.forEach(b => console.log(`   ${b.earned ? "✓" : "○"} ${b.emoji} ${b.title.padEnd(25)} ${b.progressLabel}`));

console.log(`\nFood correlation (${fc.length} categories):`);
fc.forEach(f => console.log(`   ${f.emoji} ${f.category.padEnd(20)} avg ${f.avgSpike > 0 ? "+" : ""}${f.avgSpike} mg/dL  (${f.count} meals)`));

console.log(`\nRecent meals (${mr.length}):`);
mr.forEach(m => console.log(`   ${m.time.padEnd(9)} ${m.label.slice(0, 32).padEnd(32)}  ${m.delta > 0 ? "+" : ""}${m.delta}  peak ${m.peakGlucose}`));

console.log(`\nPatterns detected (${pt.length}):`);
pt.forEach(p => console.log(`   [${p.confidence}] ${p.title}`));

console.log(`\nWeekly progress:`);
console.log(`   This week: TIR ${wk.thisWeek.tir}% · avg ${wk.thisWeek.avg} · CV ${wk.thisWeek.cv}%`);
console.log(`   Last week: TIR ${wk.lastWeek.tir}% · avg ${wk.lastWeek.avg} · CV ${wk.lastWeek.cv}%`);
console.log(`   Delta:     TIR ${wk.delta.tir > 0 ? "+" : ""}${wk.delta.tir} · avg ${wk.delta.avg > 0 ? "+" : ""}${wk.delta.avg} · CV ${wk.delta.cv > 0 ? "+" : ""}${wk.delta.cv}`);
console.log(`   Summary: ${wk.weekSummary}`);
console.log(`   Goal progress: ${wk.goalProgress}% of ${wk.goalTir}% TIR target`);
