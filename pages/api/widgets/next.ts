import type { NextApiRequest, NextApiResponse } from "next";
import { DEMO_PATIENTS, WidgetId, WIDGETS } from "../../../lib/widgetContract";
import { makeContext, WidgetContext } from "../../../lib/widgetContext";
import { selectBestWidget, scoreAllWidgets, scoreWidget } from "../../../lib/widgetSelector";
import { assembleSpec } from "../../../lib/widgetSpecBuilders";

/**
 * GET /api/widgets/next
 *
 * Query params (all optional):
 *   - patientId          — one of DEMO_PATIENTS keys (default: sarah-reeves)
 *   - tenant             — for multi-tenant demo (default: lilly-health)
 *   - hour, dayOfWeek    — override time signals
 *   - symptoms           — comma-separated list, e.g. "nausea,fatigue"
 *   - severity           — none|mild|moderate|severe
 *   - daysSinceLog       — number
 *   - medDays            — days of medication left
 *   - paStatus           — approved|pending|denied|not-required
 *   - refillStatus       — on-track|warning|pending|blocked
 *   - lastGlucosePeak    — number
 *   - travel             — home|traveling|airport|hotel
 *   - force              — force a specific widgetId (skips selector, for testing)
 *
 * Response:
 *   { spec: WidgetSpec, ranked: ScoringResult[] }   200 OK
 *   { error: "no-widget-qualifies", ranked: [...] } 204 No Content (still 200 for demo)
 *
 * In production this endpoint lives in the Fathom backend, reads the winning
 * widget's template + variant from the database, hydrates it with patient
 * data, and returns the spec. For the POC we hydrate deterministically.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = req.query;
  const patientId = String(q.patientId ?? "sarah-reeves");
  const tenant    = String(q.tenant ?? "lilly-health");
  const patient   = DEMO_PATIENTS[patientId] ?? DEMO_PATIENTS["sarah-reeves"];

  // Build context from query overrides
  const overrides: Partial<WidgetContext> = {};
  if (q.hour !== undefined || q.dayOfWeek !== undefined) {
    const hour = q.hour !== undefined ? Number(q.hour) : new Date().getHours();
    const dow  = q.dayOfWeek !== undefined ? Number(q.dayOfWeek) : (new Date().getDay());
    overrides.time = {
      localHour: hour,
      dayOfWeek: dow as any,
      isWeekend: dow === 0 || dow === 6,
      partOfDay:
        hour < 6 ? "early-morning" :
        hour < 10 ? "morning" :
        hour < 13 ? "midday" :
        hour < 17 ? "afternoon" :
        hour < 21 ? "evening" : "night",
      isDND: hour < 7 || hour >= 22,
    };
  }
  if (q.symptoms !== undefined || q.severity !== undefined) {
    overrides.clinical = {
      activeSymptoms: q.symptoms ? String(q.symptoms).split(",").filter(Boolean) : [],
      severityBand: (q.severity as any) ?? "none",
      lastGlucosePeak: q.lastGlucosePeak ? Number(q.lastGlucosePeak) : undefined,
      hoursSinceLastSpike: q.lastGlucosePeak && Number(q.lastGlucosePeak) >= 160 ? 2 : undefined,
    };
  }
  if (q.daysSinceLog !== undefined) {
    const d = Number(q.daysSinceLog);
    overrides.behavioral = {
      daysSinceLastLog: d,
      engagementBand: d >= 7 ? "silent" : d >= 3 ? "drifting" : "engaged",
      driftDetected: d >= 5,
    };
  }
  if (q.medDays !== undefined || q.paStatus !== undefined || q.refillStatus !== undefined) {
    overrides.access = {
      daysMedicationLeft: q.medDays !== undefined ? Number(q.medDays) : 21,
      refillStatus: (q.refillStatus as any) ?? "on-track",
      priorAuthStatus: (q.paStatus as any) ?? "approved",
      couponEligible: true,
    };
  }
  if (q.travel !== undefined) {
    overrides.environment = { travel: q.travel as any };
  }

  const ctx = makeContext(patient, overrides);

  // Winner selection
  const forced = q.force ? String(q.force) as WidgetId : undefined;
  const winner = forced
    ? scoreWidget(forced, ctx)
    : selectBestWidget(ctx);

  const ranked = scoreAllWidgets(ctx);

  if (!winner || winner.score === 0) {
    return res.status(200).json({
      spec: null,
      ranked: ranked.map(({ widgetId, score, guardrails, reasons }) => ({ widgetId, score, guardrails, reasons })),
      reason: "no-widget-qualifies",
    });
  }

  const spec = assembleSpec(winner, patient, ctx, tenant);

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    spec,
    ranked: ranked.map(({ widgetId, score, variant, guardrails, reasons }) => ({ widgetId, score, variant, guardrails, reasons: reasons.slice(0, 3) })),
  });
}
