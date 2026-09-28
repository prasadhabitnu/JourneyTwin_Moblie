/**
 * Genomics module — per-patient pharmacogenomic profile that modulates
 * GLP-1 receptor agonist response in the digital-twin engine.
 *
 * Five high-signal variants relevant to GLP-1 / GIP receptor agonist response:
 *   GLP1R   rs6923761    — receptor signaling (Gly168Ser)
 *   FTO     rs9939609    — obesity susceptibility + satiety
 *   TCF7L2  rs7903146    — beta-cell insulin secretion
 *   MC4R    rs17782313   — melanocortin / satiety pathway
 *   GIPR    rs10423928   — GIP receptor (relevant for dual agonists)
 *
 * Genotypes are deterministically assigned per patient via patient.id hash,
 * with realistic US-population frequencies. Modifier magnitudes are calibrated
 * to plausible ranges from the published pharmacogenomics literature.
 *
 * IMPORTANT: This is a decision-support model, not a clinical genotyping
 * service. In a real deployment the variants come from an external CLIA-
 * certified lab feed (Ancestry, 23andMe research portal, or a clinical-grade
 * pipeline) — this module is the application-layer translation of those
 * results into outcome modifiers.
 */

import { Patient } from "./patientData";

export type EvidenceLevel = "established" | "moderate" | "exploratory";

export interface VariantModifier {
  weightLoss: number;        // multiplier on drug-mediated weekly loss rate
  a1cResponse: number;       // multiplier on A1C drop rate
  sideEffectRisk: number;    // multiplier (1.0 = neutral)
  appetiteControl: number;   // multiplier on diet-lever effectiveness
}

export interface GenomicVariant {
  gene: string;
  rsid: string;
  genotype: string;
  alleles: string;
  effect: string;
  modifier: VariantModifier;
  evidence: EvidenceLevel;
  populationFreq: string;
  brief: string;
}

export interface GenomicProfile {
  variants: GenomicVariant[];
  netModifiers: VariantModifier;
  responseClass: "enhanced" | "typical" | "attenuated";
  headline: string;
  cohortLabel: string;
  // Per-lever sensitivity hints for UI tooltips
  leverHints: {
    adherence: string;
    diet: string;
    exercise: string;
    sleep: string;
    coaching: string;
  };
}

// ---------- helpers ----------
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function pickWeighted<T>(seed: number, opts: { v: T; w: number }[]): { v: T; idx: number } {
  const total = opts.reduce((a, b) => a + b.w, 0);
  let r = ((seed % 10000) / 10000) * total;
  for (let i = 0; i < opts.length; i++) {
    r -= opts[i].w;
    if (r <= 0) return { v: opts[i].v, idx: i };
  }
  return { v: opts[opts.length - 1].v, idx: opts.length - 1 };
}

// ---------- main entry ----------
export function genomicProfile(p: Patient): GenomicProfile {
  const h = hash(p.id);
  const variants: GenomicVariant[] = [];

  // -------- GLP1R rs6923761 (Gly168Ser) --------
  const glp1r = pickWeighted(h, [
    { v: "GG", w: 60 }, { v: "GA", w: 32 }, { v: "AA", w: 8 },
  ]);
  variants.push({
    gene: "GLP1R",
    rsid: "rs6923761",
    genotype: glp1r.v,
    alleles: glp1r.v === "GG"
      ? "G/G (Gly168/Gly168)"
      : glp1r.v === "GA"
        ? "G/A (Gly168/Ser168)"
        : "A/A (Ser168/Ser168)",
    effect: glp1r.idx === 0
      ? "Typical GLP-1 receptor response"
      : glp1r.idx === 1
        ? "Slightly attenuated GLP-1 response"
        : "Reduced GLP-1 receptor signaling",
    modifier: {
      weightLoss: [1.00, 0.93, 0.82][glp1r.idx],
      a1cResponse: [1.00, 0.95, 0.86][glp1r.idx],
      sideEffectRisk: 1.00,
      appetiteControl: 1.00,
    },
    evidence: "moderate",
    populationFreq: "60% GG · 32% GA · 8% AA (US/EU)",
    brief: "Gly168Ser variant in the GLP-1 receptor. Carriers of the Ser allele may have attenuated response to GLP-1 RAs in several clinical studies, though effect size varies.",
  });

  // -------- FTO rs9939609 --------
  const fto = pickWeighted(h ^ 0xA5A5A5A5, [
    { v: "TT", w: 36 }, { v: "TA", w: 48 }, { v: "AA", w: 16 },
  ]);
  variants.push({
    gene: "FTO",
    rsid: "rs9939609",
    genotype: fto.v,
    alleles: fto.v.split("").join("/"),
    effect: fto.idx === 0
      ? "Lower obesity-risk allele load"
      : fto.idx === 1
        ? "Heterozygous obesity-risk carrier"
        : "Homozygous obesity-risk carrier",
    modifier: {
      weightLoss: [1.00, 1.05, 1.10][fto.idx],
      a1cResponse: 1.00,
      sideEffectRisk: 1.00,
      appetiteControl: [1.00, 0.95, 0.88][fto.idx],
    },
    evidence: "established",
    populationFreq: "36% TT · 48% TA · 16% AA",
    brief: "Strongest single-gene predictor of common obesity. GLP-1 RAs appear especially effective in A-allele carriers, partly compensating for impaired hypothalamic satiety signaling.",
  });

  // -------- TCF7L2 rs7903146 --------
  const tcf = pickWeighted(h ^ 0x5A5A5A5A, [
    { v: "CC", w: 52 }, { v: "CT", w: 40 }, { v: "TT", w: 8 },
  ]);
  variants.push({
    gene: "TCF7L2",
    rsid: "rs7903146",
    genotype: tcf.v,
    alleles: tcf.v.split("").join("/"),
    effect: tcf.idx === 0
      ? "Typical insulin secretion"
      : tcf.idx === 1
        ? "Mild T2DM susceptibility"
        : "Elevated T2DM risk — impaired insulin response",
    modifier: {
      weightLoss: 1.00,
      a1cResponse: [1.00, 1.08, 1.15][tcf.idx],
      sideEffectRisk: 1.00,
      appetiteControl: 1.00,
    },
    evidence: "established",
    populationFreq: "52% CC · 40% CT · 8% TT",
    brief: "T-allele carriers consistently show better HbA1c response to GLP-1 RAs — the drug compensates for impaired beta-cell function. One of the most robust pharmacogenomic signals in T2DM.",
  });

  // -------- MC4R rs17782313 --------
  const mc4r = pickWeighted(h ^ 0xCCCCCCCC, [
    { v: "TT", w: 65 }, { v: "TC", w: 30 }, { v: "CC", w: 5 },
  ]);
  variants.push({
    gene: "MC4R",
    rsid: "rs17782313",
    genotype: mc4r.v,
    alleles: mc4r.v.split("").join("/"),
    effect: mc4r.idx === 0
      ? "Typical satiety signaling"
      : mc4r.idx === 1
        ? "Mild melanocortin variant — higher appetite"
        : "Strong melanocortin variant — significantly higher appetite",
    modifier: {
      weightLoss: [1.00, 0.98, 0.92][mc4r.idx],
      a1cResponse: 1.00,
      sideEffectRisk: 1.00,
      appetiteControl: [1.00, 0.95, 0.85][mc4r.idx],
    },
    evidence: "moderate",
    populationFreq: "65% TT · 30% TC · 5% CC",
    brief: "Variant near MC4R, the central satiety regulator. C-allele carriers tend to have higher baseline appetite; GLP-1 RA can partially restore satiety signaling, but the diet lever is harder to use.",
  });

  // -------- GIPR rs10423928 --------
  const gipr = pickWeighted(h ^ 0x33333333, [
    { v: "AA", w: 55 }, { v: "AT", w: 38 }, { v: "TT", w: 7 },
  ]);
  variants.push({
    gene: "GIPR",
    rsid: "rs10423928",
    genotype: gipr.v,
    alleles: gipr.v.split("").join("/"),
    effect: gipr.idx === 0
      ? "Typical GIP receptor function"
      : gipr.idx === 1
        ? "Modestly altered GIP signaling"
        : "Reduced GIP receptor sensitivity",
    modifier: {
      weightLoss: [1.00, 0.97, 0.91][gipr.idx],
      a1cResponse: 1.00,
      sideEffectRisk: [1.00, 0.95, 0.85][gipr.idx],
      appetiteControl: 1.00,
    },
    evidence: "exploratory",
    populationFreq: "55% AA · 38% AT · 7% TT",
    brief: "GIP receptor variant — relevant for dual GLP-1/GIP agonists like tirzepatide. T-allele carriers tend to have fewer GI side effects but slightly less weight loss.",
  });

  // -------- combine into net profile --------
  const net: VariantModifier = {
    weightLoss: variants.reduce((a, v) => a * v.modifier.weightLoss, 1),
    a1cResponse: variants.reduce((a, v) => a * v.modifier.a1cResponse, 1),
    sideEffectRisk: variants.reduce((a, v) => a * v.modifier.sideEffectRisk, 1),
    appetiteControl: variants.reduce((a, v) => a * v.modifier.appetiteControl, 1),
  };

  const responseClass: "enhanced" | "typical" | "attenuated" =
    net.weightLoss >= 1.04 ? "enhanced"
    : net.weightLoss <= 0.96 ? "attenuated"
    : "typical";

  const headline = responseClass === "enhanced"
    ? `Enhanced GLP-1 response — your variants suggest ×${net.weightLoss.toFixed(2)} weight loss and ×${net.a1cResponse.toFixed(2)} HbA1c response vs. the average for your cohort.`
    : responseClass === "attenuated"
    ? `Attenuated response — your variants suggest ×${net.weightLoss.toFixed(2)} weight loss. Tighter adherence and a more aggressive titration plan typically close most of the gap.`
    : `Typical GLP-1 response — ×${net.weightLoss.toFixed(2)} weight loss, in line with your cohort. Lever choices matter more than genomics here.`;

  // Estimate how unusual the full 5-variant profile is — coarse heuristic
  const rarityScore = variants.reduce((a, v) => a * (
    v.modifier.weightLoss > 1.05 || v.modifier.weightLoss < 0.95 ? 0.18
    : v.modifier.a1cResponse > 1.05 ? 0.42
    : 0.62
  ), 1);
  const sharedPct = Math.max(0.5, Math.min(40, rarityScore * 100));

  // Per-lever hints — what to tell the coach about each lever for this genome
  const leverHints = {
    adherence: net.weightLoss < 0.95
      ? "Higher genomic significance — every percentage point of adherence matters more for this patient."
      : net.weightLoss > 1.05
        ? "Strong drug response — adherence is still the top lever, but missed doses cost less than average."
        : "Standard adherence response curve.",
    diet: net.appetiteControl < 0.95
      ? "Appetite biology works against the diet lever for this patient. Pair with a meal-plan reset and structured timing."
      : "Standard diet response.",
    exercise: "Exercise sensitivity is largely genotype-independent — the lever behaves as modeled.",
    sleep: "Sleep multiplier is largely genotype-independent in current evidence.",
    coaching: net.a1cResponse > 1.05
      ? "This patient's HbA1c moves easily — coaching that reinforces glycemic wins lands harder."
      : "Standard coaching response.",
  };

  return {
    variants,
    netModifiers: net,
    responseClass,
    headline,
    cohortLabel: `~${Math.round(sharedPct)}% of the population shares this 5-variant signature`,
    leverHints,
  };
}

// Useful for unit/UI tests
export const NEUTRAL_MODIFIER: VariantModifier = {
  weightLoss: 1, a1cResponse: 1, sideEffectRisk: 1, appetiteControl: 1,
};
