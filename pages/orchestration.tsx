import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import HabitnuLogo from "../components/journey/HabitnuLogo";

/**
 * /orchestration — the tech-review page. Explains Fathom's decision engine
 * end-to-end: the Lilly-vs-Fathom boundary, the 7 orchestration layers, a
 * live decision trace for 4 sample events, the API contracts, the
 * event + decision JSON schemas, and operational SLOs.
 */

// ============================================================================
// Sample events + traces (drive the interactive decision trace)
// ============================================================================
interface LayerTrace {
  in: string;
  out: string;
  detail?: string;
}
interface SampleEvent {
  id: string;
  label: string;
  short: string;
  kind: string;
  color: string;
  eventJson: string;
  trace: Record<string, LayerTrace>;   // keyed by layer id
  action: {
    type: string;
    surface: string;
    templateId: string;
    body: string;
  };
}

const SAMPLE_EVENTS: SampleEvent[] = [
  {
    id: "dose-miss", label: "Missed Sunday dose", short: "Dose miss",
    kind: "dose_missed", color: "#4F5FE5",
    eventJson: `{
  "eventId": "evt_2sBk8Q",
  "memberId": "mbr_sr_a1f92",
  "timestamp": "2026-07-27T14:00:00Z",
  "source": "lilly_health",
  "kind": "dose_missed",
  "payload": {
    "medication": "semaglutide_1mg",
    "scheduledAt": "2026-07-27T14:00:00Z",
    "snoozeCount": 1
  }
}`,
    trace: {
      signal:   { in: "dose_ledger + cgm_stream",  out: "missed_dose · confidence 0.98",  detail: "matched rule: no-log-within-4h + BG rise > baseline" },
      severity: { in: "signal + member vitals",    out: "24 / 100 · band: LOW",           detail: "no acute-risk combo; well-adherent member" },
      context:  { in: "signal + 30-day timeline",  out: "['sunday-brunch-pattern', '3rd-miss-6wks']", detail: "rule + Claude Haiku tag augmentation" },
      pattern:  { in: "tags + cohort index",       out: "cohort: sunday_brunch_missers · 78% catch-up if nudged", detail: "vector similarity over 4.2k historical trajectories" },
      habit:    { in: "signal + tags + member habit inventory", out: "habit-formable: yes · anchor: saturday-eve-reminder · IF-THEN: 'If Sunday brunch is planned, then Saturday-evening dose'", detail: "Fogg B=MAP: M-hi · A-easy · P-add. Tone family: gentle-reset (not corrective)." },
      channel:  { in: "severity + context + Lilly config", out: "primary: lilly_push_l2 · fallback: coach_call_l1", detail: "policy rule: LOW severity + L2 enabled → push preferred" },
      timing:   { in: "member behavior model",     out: "send @ 2026-07-28T09:41:00-04:00 · 74% open", detail: "per-member sequence model over open events" },
    },
    action: {
      type: "push_notification", surface: "lilly_health",
      templateId: "lilly.dose_miss.gentle_reset",
      body: "Missed yesterday? Let's reset.",
    },
  },
  {
    id: "nausea-flare", label: "Wed nausea 4/5", short: "Nausea flare",
    kind: "sideeffect_reported", color: "#0EA5A4",
    eventJson: `{
  "eventId": "evt_9zN2rP",
  "memberId": "mbr_sr_a1f92",
  "timestamp": "2026-07-29T11:30:00Z",
  "source": "lilly_health",
  "kind": "sideeffect_reported",
  "payload": {
    "kind": "nausea",
    "score": 4,
    "scale": "0-5",
    "coincident": ["breakfast_skipped"]
  }
}`,
    trace: {
      signal:   { in: "mood_log + meal_log",       out: "nausea_flare · confidence 0.94", detail: "score >= 4 threshold + coincident_skip signal" },
      severity: { in: "signal + medication timeline", out: "56 / 100 · band: MEDIUM",     detail: "physician-flag NOT crossed; watch-band" },
      context:  { in: "med escalation ledger",     out: "['dose-escalation-week-4', 'first-1mg-cycle']", detail: "known week-4 flare pattern" },
      pattern:  { in: "cohort trajectory index",   out: "cohort: 1mg_wk4_flares · 68% hit peak on day 4", detail: "typical -2 drop by 4 PM if toolkit engaged" },
      habit:    { in: "signal + tags + medication timeline", out: "habit-formable: partial · anchor: breakfast-routine · IF-THEN: 'If nausea > 3, then ginger tea + protein snack'", detail: "Fogg B=MAP: M-hi · A-medium · P-add. Tone family: toolkit-supportive (not lecturing)." },
      channel:  { in: "severity + context + Lilly config", out: "primary: lilly_push_l2 · fallback: coach_call_l1", detail: "MEDIUM severity + toolkit template available" },
      timing:   { in: "session context",           out: "send NOW · Sally has app foregrounded", detail: "session-window overrides scheduled send" },
    },
    action: {
      type: "push_notification", surface: "lilly_health",
      templateId: "lilly.sideeffect.nausea_gentle_toolkit",
      body: "Rough morning? Let's take the edge off.",
    },
  },
  {
    id: "dinner-spike", label: "3 dinner spikes", short: "Dinner spike",
    kind: "cgm_pattern_detected", color: "#F97316",
    eventJson: `{
  "eventId": "evt_7kP1mW",
  "memberId": "mbr_sr_a1f92",
  "timestamp": "2026-07-31T11:00:00Z",
  "source": "fathom_sweep",
  "kind": "cgm_pattern_detected",
  "payload": {
    "pattern": "post_dinner_peak",
    "occurrences": 3,
    "peaks_mgdl": [42, 38, 35],
    "coincident_factors": ["white_rice", "no_post_meal_walk"]
  }
}`,
    trace: {
      signal:   { in: "cgm_stream + food_log + wearable_steps", out: "cgm_dinner_peak_3nights · confidence 0.99", detail: "streaming pattern matcher: 3 consecutive peaks > +30 mg/dL" },
      severity: { in: "peak magnitude + duration", out: "62 / 100 · band: MEDIUM-HIGH", detail: "physician-page threshold: not yet (would trigger at 5 consecutive)" },
      context:  { in: "meal log + step log",       out: "['rice-3-nights', 'no-post-meal-walk-3-nights']", detail: "shared-factor detection across occurrences" },
      pattern:  { in: "cohort trajectory index",   out: "cohort: rice_dinner_spikers · half-rice + 15min walk = -20 mg/dL avg", detail: "trajectory model over 1.8k similar interventions" },
      habit:    { in: "signal + tags + dinner-time model", out: "habit-formable: yes · anchor: dinner-6:15pm · IF-THEN: 'If dinner has rice, then halve + 15-min walk'", detail: "Fogg B=MAP: M-hi · A-easy · P-add. Tone family: awareness (not prescription)." },
      channel:  { in: "severity + context + Lilly config", out: "primary: lilly_push_l2 · timing-critical (pre-dinner)", detail: "pre-dinner send window is intervention-actionable" },
      timing:   { in: "member dinner-time model",  out: "send @ 2026-07-31T17:30:00-04:00 (45 min pre-dinner)", detail: "actionable-window model, not open-rate model" },
    },
    action: {
      type: "push_notification", surface: "lilly_health",
      templateId: "lilly.cgm.dinner_pattern_gentle",
      body: "Small tweak, big win tonight.",
    },
  },
  {
    id: "plateau", label: "Week 11 plateau", short: "Plateau",
    kind: "weight_plateau_detected", color: "#7C3AED",
    eventJson: `{
  "eventId": "evt_3bX7qR",
  "memberId": "mbr_sr_a1f92",
  "timestamp": "2026-08-03T11:00:00Z",
  "source": "fathom_sweep",
  "kind": "weight_plateau_detected",
  "payload": {
    "duration_weeks": 3,
    "current_weight_lb": 176.4,
    "prior_loss_lb": 6.6,
    "prior_duration_weeks": 8,
    "coincident": ["mood_meh_4of7", "adherence_still_A"]
  }
}`,
    trace: {
      signal:   { in: "weight_log + mood_log + adherence_ledger", out: "weight_plateau_3wk + morale_dip · confidence 0.91", detail: "compound signal: two subsignals correlated" },
      severity: { in: "signal + program week + habits",  out: "18 / 100 · band: LOW (physiological)", detail: "reassurance-band; adherence still strong = not a coaching failure" },
      context:  { in: "cohort week-model + habit ledger", out: "['week-11-plateau', 'habits-still-strong']", detail: "reframe context: expected biology, not failure" },
      pattern:  { in: "cohort trajectory index",   out: "cohort: wk11_plateaus · 68% hit this · break in 7-10 days if habits hold", detail: "physiology-based cohort, not intervention-based" },
      habit:    { in: "signal + tags + morale state", out: "habit-formable: no (habits already strong) · reinforce existing · IF-THEN: N/A", detail: "Fogg B=MAP: M-low · A-strong · P-none needed. Tone family: reassurance-science (not corrective)." },
      channel:  { in: "severity + context + Lilly config", out: "primary: lilly_push_l2 + reassurance template · fallback: coach_call_l1", detail: "warm reassurance, NOT corrective; different template family" },
      timing:   { in: "post-weigh-in window",      out: "send @ 2026-08-03T07:03:00-04:00 (3 min post-weigh)", detail: "post-trigger emotional window: not too fast (creepy), not too slow (already discouraged)" },
    },
    action: {
      type: "push_notification", surface: "lilly_health",
      templateId: "lilly.plateau.reassurance_science",
      body: "You're not stuck. Week 11 does this.",
    },
  },
];

// ============================================================================
// The 6 Fathom layers
// ============================================================================
interface LayerDef {
  id: string;
  num: number;
  name: string;
  tagline: string;
  desc: string;
  inputs: string[];
  outputs: string[];
  tech: string[];
  color: string;
}
const LAYERS: LayerDef[] = [
  {
    id: "signal", num: 1, name: "Signal Detection",
    tagline: "Turn raw Lilly data into named signals.",
    desc: "Fathom pulls a normalized event stream from Lilly's data plane — wearable data (Oura ring, Google/Apple Health) and device data (Dexcom CGM) flow into Lilly first, then Fathom reads. Rolling-window pattern matchers run rules for well-defined triggers (missed_dose, side_effect_reported) and streaming ML for compound patterns (cgm_dinner_peak_3nights, weight_plateau_3wk).",
    inputs: ["cgm_stream (Dexcom via Lilly)", "ring_stream (Oura via Lilly)", "health_data (Google/Apple via Lilly)", "dose_ledger", "mood + side-effect log", "food_log", "weight_log"],
    outputs: ["named_signal + confidence"],
    tech: ["Kafka streams", "Flink CEP", "sklearn detectors", "rules DSL"],
    color: "#0EA5E9",
  },
  {
    id: "severity", num: 2, name: "Severity Classifier",
    tagline: "Score the signal 0-100 against clinical + behavioral bands.",
    desc: "Gradient-boosted classifier trained on cohort outcomes. Outputs both a numeric score and a band (LOW / MEDIUM / MEDIUM-HIGH / HIGH / CRITICAL). Bands map to explicit orchestration thresholds — e.g., HIGH triggers physician-page candidacy.",
    inputs: ["signal", "member vitals baseline", "medication timeline", "program week"],
    outputs: ["severity 0-100 + band + confidence"],
    tech: ["XGBoost", "SHAP explainability", "weekly retrain from outcome data"],
    color: "#4F5FE5",
  },
  {
    id: "context", num: 3, name: "Context Tagger",
    tagline: "Attach temporal + behavioral tags that shape the response.",
    desc: "Rules + Claude Haiku augmentation. Attaches tags like 'sunday-brunch-pattern', 'dose-escalation-week-4', 'week-11-plateau', 'rice-3-nights'. Tags govern which template family the Channel Router draws from — corrective vs. reassurance vs. celebration.",
    inputs: ["signal", "member 30-day timeline", "cohort week-model"],
    outputs: ["context_tags[]"],
    tech: ["rules DSL", "Claude Haiku (freeform tag augmentation)", "cohort week-model"],
    color: "#7C3AED",
  },
  {
    id: "pattern", num: 4, name: "Pattern Matcher",
    tagline: "Find similar members. Predict outcomes.",
    desc: "Vector similarity search over the Journey Twin index — pulls historical members with the same signal + tags. Returns cohort trajectory statistics: expected recovery rate, typical break window, intervention response rate. This is where Fathom knows '78% catch-up if nudged.'",
    inputs: ["tagged signal", "member cohort membership"],
    outputs: ["cohort_match + expected_outcome + response_stats"],
    tech: ["pgvector", "sentence embeddings on member trajectories", "cohort aggregation queries"],
    color: "#0EA5A4",
  },
  {
    id: "habit", num: 5, name: "Habit Architect",
    tagline: "Turn every decision into a habit-forming opportunity.",
    desc: "Behavioral-science layer. For each qualified signal, computes Fogg B=MAP (Motivation × Ability × Prompt) score, selects an anchor from the member's existing rock-solid habits, drafts an IF-THEN implementation intention (Gollwitzer), and picks the tone family (corrective / reassurance / celebration / autonomy-supportive). Feeds the Channel Router a habit-shaped decision instead of a raw one. This is what makes Fathom's outputs sticky, not just accurate.",
    inputs: ["signal + tags", "member habit inventory", "cohort habit index", "motivation state model", "current habit-ladder stage"],
    outputs: ["habit_stage + anchor + IF-THEN scaffold + tone family + reinforcement schedule"],
    tech: ["rules DSL", "Claude Haiku (autonomy-supportive language generation)", "pgvector (cohort habit patterns)", "Fogg B=MAP scoring", "Gollwitzer intention grammar"],
    color: "#DB2777",
  },
  {
    id: "channel", num: 6, name: "Channel Router",
    tagline: "Pick the right delivery surface for THIS moment.",
    desc: "Policy engine. Inputs: severity + context + habit shape + Lilly's configured integration level (L1-L4) + member preferences. Outputs a primary channel and a fallback chain. This is where the L1/L2/L3/L4 story lives — Lilly's config is a first-class input, not an override; the Habit Architect's tone family constrains which template pool to draw from.",
    inputs: ["severity", "context", "habit tone family", "Lilly integration config", "member channel prefs"],
    outputs: ["primary channel + fallback chain + template family"],
    tech: ["rules DSL", "policy tests", "Lilly config service"],
    color: "#F97316",
  },
  {
    id: "timing", num: 7, name: "Timing Model",
    tagline: "Optimize send-time for open × non-annoyance.",
    desc: "Sequence model over member events predicting the next-best send window. Distinguishes actionable-window (e.g., pre-dinner for a spike intervention) from open-rate-window (e.g., 9:41 AM if generic). Non-annoyance guardrails cap send frequency.",
    inputs: ["chosen channel", "member behavior model", "session context"],
    outputs: ["send_at + expiry + open_probability"],
    tech: ["sequence transformer per member", "frequency-cap enforcer"],
    color: "#E11D48",
  },
];

// ============================================================================
// API contracts
// ============================================================================
interface ApiEndpoint {
  method: string;
  path: string;
  direction: string;      // "Lilly → Fathom" | "Fathom → Lilly"
  title: string;
  desc: string;
  reqSnippet?: string;
  respSnippet?: string;
  auth: string;
}
const APIS: ApiEndpoint[] = [
  {
    method: "GET", path: "/v1/lilly/pull/events",
    direction: "Fathom → Lilly",
    title: "Data Pull (primary)",
    desc: "Fathom polls Lilly's unified data plane on a schedule (30-second cadence for high-frequency streams like CGM + ring telemetry, 5-minute for logs). Returns everything since the cursor. Wearable data (Oura, Google/Apple Health) and device data (Dexcom) has already been normalized by Lilly.",
    reqSnippet: `GET /v1/lilly/pull/events?
    memberId=mbr_sr_a1f92
   &since=2026-07-28T05:30:00Z
   &sources=cgm,ring,mood,dose
Authorization: Bearer <fathom_service_token>`,
    respSnippet: `{
  "cursor": "2026-07-28T06:14:59Z",
  "events": [
    { "eventId": "...", "kind": "cgm_reading",     ... },
    { "eventId": "...", "kind": "ring_sleep_score", ... },
    { "eventId": "...", "kind": "dose_missed",     ... }
  ],
  "count": 843
}`,
    auth: "mTLS + OAuth2 client credentials · Fathom pulls",
  },
  {
    method: "POST", path: "/v1/ingest/event",
    direction: "Lilly → Fathom",
    title: "Event Push (time-sensitive)",
    desc: "For events where poll latency is too slow — a user-logged side effect at 4/5, an emergency BG excursion, a member-initiated support ping — Lilly pushes directly. Fathom validates, pseudonymizes, and fast-tracks into the orchestration pipeline (bypasses the pull queue).",
    reqSnippet: `POST /v1/ingest/event
X-Lilly-Signature: <hmac>

{
  "memberId": "mbr_sr_a1f92",     // pseudonymized
  "source":   "lilly_health",
  "kind":     "sideeffect_reported",
  "priority": "realtime",
  "payload":  { ... }
}`,
    respSnippet: `{
  "eventId":  "evt_9zN2rP",
  "accepted": true,
  "queuedAt": "2026-07-29T11:30:02Z"
}`,
    auth: "mTLS + HMAC-signed body · Lilly service identity",
  },
  {
    method: "POST", path: "/v1/webhook/decision",
    direction: "Fathom → Lilly",
    title: "Decision Webhook",
    desc: "Fathom pushes decisions to Lilly's inbound webhook. Lilly's delivery adapter picks up and formats for the right surface (push, card, companion).",
    reqSnippet: `POST https://api.lillyhealth.com/inbound/fathom
X-Fathom-Signature: <hmac>

{
  "decisionId": "dec_9zX...",
  "action": {
    "type": "push_notification",
    "surface": "lilly_health",
    "templateId": "lilly.dose_miss.gentle_reset",
    "sendAt": "2026-07-28T09:41:00-04:00",
    "personalization": { ... }
  }
}`,
    respSnippet: `{
  "accepted": true,
  "deliveryId": "dlv_lly_..."
}`,
    auth: "HMAC-signed body · Lilly-issued signing key",
  },
  {
    method: "POST", path: "/v1/delivery/{channel}/ack",
    direction: "Lilly → Fathom",
    title: "Delivery Acknowledgment",
    desc: "Lilly's delivery adapter confirms send + reports response (opened, tapped, actioned). Closes the loop for Fathom's timing model + response tracking.",
    reqSnippet: `{
  "deliveryId": "dlv_lly_...",
  "decisionId": "dec_9zX...",
  "status": "delivered | opened | actioned",
  "actionedAt": "2026-07-28T09:44:00-04:00",
  "userAction": "log_dose_now"
}`,
    respSnippet: `{ "recorded": true }`,
    auth: "mTLS + HMAC",
  },
];

// ============================================================================
// Page
// ============================================================================
export default function OrchestrationPage() {
  const [eventId, setEventId] = useState<string>(SAMPLE_EVENTS[0].id);
  const sample = SAMPLE_EVENTS.find(e => e.id === eventId) ?? SAMPLE_EVENTS[0];

  return (
    <>
      <Head>
        <title>Under the hood — Fathom orchestration</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=JetBrains+Mono:wght@400;700&display=swap" />
      </Head>

      <div className="min-h-screen"
           style={{
             fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
             background: "linear-gradient(180deg, #FFFFFF 0%, #F5F7FF 100%)",
           }}>
        {/* Top co-brand bar */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <HabitnuLogo />
            <span className="text-slate-300 text-xl font-black">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[18px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif" }}>Lilly</span>
              <span className="text-[14px] font-black text-slate-800">Health</span>
            </div>
            <span className="ml-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200">
              Tech review
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/four-ways"   className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">4 ways to partner →</Link>
            <Link href="/scenarios"   className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">Live simulations →</Link>
            <Link href="/health-ring" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition">Ring · Live →</Link>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* HERO */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 mb-3">
              Under the hood
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3"
                style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
              How Fathom orchestrates.
            </h1>
            <p className="text-[15px] text-slate-700 leading-relaxed">
              <span className="font-black text-slate-900">Lilly provides the data.</span>{" "}
              <span className="font-black" style={{ color: "#4F5FE5" }}>Fathom decides — severity, context, pattern → channel + timing.</span>{" "}
              <span className="font-black text-slate-900">Lilly delivers.</span>
            </p>
            <div className="mt-4 rounded-xl bg-white border border-rose-200 px-4 py-2.5 text-[11px] text-slate-700 leading-relaxed text-left inline-block">
              <span className="font-black text-rose-700">Wearables + devices → Lilly.</span>{" "}
              Oura, Google Health, Apple Health, Dexcom, and other partners integrate directly with Lilly Health.
              Fathom <span className="font-black text-slate-900">pulls a unified feed from Lilly's data plane</span> — never from vendor APIs. Lilly owns the participant + partner relationship end-to-end.
            </div>
          </div>

          {/* SECTION 1 — the boundary */}
          <SectionHeader kicker="1 · The boundary" title="Where Lilly stops. Where Fathom starts." />
          <BoundaryDiagram />

          {/* SECTION 2 — the 7 layers */}
          <SectionHeader kicker="2 · The orchestration fabric" title="7 layers between data-in and channel-out." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LAYERS.map(l => <LayerCard key={l.id} layer={l} />)}
          </div>

          {/* SECTION 3 — live decision trace */}
          <SectionHeader kicker="3 · Live decision trace" title="Pick an event. Watch it flow through all six layers." />
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            {/* Event picker */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Sample event</div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_EVENTS.map(e => {
                  const active = e.id === eventId;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setEventId(e.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-black transition ${active ? "text-white shadow-sm" : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"}`}
                      style={active ? { background: e.color } : undefined}
                    >
                      {e.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 p-5">
              {/* Left: event JSON */}
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Event · from Lilly Health</div>
                <CodeBlock code={sample.eventJson} tone="slate" />
                <div className="mt-4 text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Decision · from Fathom</div>
                <div className="rounded-xl border p-3" style={{ background: sample.color + "0F", borderColor: sample.color }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white" style={{ background: sample.color }}>
                      {sample.action.type}
                    </span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{sample.action.surface}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-700 mb-1">{sample.action.templateId}</div>
                  <div className="text-[12px] font-black text-slate-900 leading-snug">{sample.action.body}</div>
                </div>
              </div>

              {/* Right: 6 layer traces */}
              <div className="space-y-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Fathom orchestration trace</div>
                {LAYERS.map(l => {
                  const t = sample.trace[l.id];
                  return (
                    <div key={l.id} className="rounded-xl bg-white border border-slate-200 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded grid place-items-center text-[10px] font-black text-white" style={{ background: l.color }}>
                          {l.num}
                        </span>
                        <span className="text-[11px] font-black text-slate-900">{l.name}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="rounded-md bg-slate-50 border border-slate-100 px-2 py-1.5">
                          <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">In</div>
                          <div className="text-[10px] font-mono text-slate-700 leading-tight">{t.in}</div>
                        </div>
                        <div className="rounded-md px-2 py-1.5" style={{ background: l.color + "12", border: `1px solid ${l.color}44` }}>
                          <div className="text-[8px] font-black uppercase tracking-widest" style={{ color: l.color }}>Out</div>
                          <div className="text-[10px] font-mono font-black leading-tight" style={{ color: l.color === "#F97316" ? "#9A3412" : l.color }}>{t.out}</div>
                        </div>
                      </div>
                      {t.detail && (
                        <div className="text-[10px] text-slate-500 mt-1.5 leading-snug italic">{t.detail}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 4 — APIs */}
          <SectionHeader kicker="4 · APIs Lilly integrates against" title="Pull-first. Push for the time-sensitive." />
          <div className="mb-4 rounded-xl bg-white border border-rose-200 px-4 py-3 text-[12px] text-slate-700 leading-relaxed">
            <span className="font-black text-rose-700">Fathom pulls from Lilly, not from vendor APIs.</span>{" "}
            High-volume streams (CGM, Oura ring, Google/Apple Health) sync on Fathom's schedule via
            <code className="font-mono px-1 py-0.5 rounded bg-rose-50 text-rose-800 mx-0.5">GET /v1/lilly/pull/events</code>.
            Time-sensitive events (a 4/5 nausea log, an emergency excursion) skip the queue via
            <code className="font-mono px-1 py-0.5 rounded bg-rose-50 text-rose-800 mx-0.5">POST /v1/ingest/event</code>.
            Utility endpoints (audit trace, health check) omitted here for brevity.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {APIS.map((a, i) => <ApiCard key={i} api={a} />)}
          </div>

          {/* SECTION 5 — event + decision schemas */}
          <SectionHeader kicker="5 · Wire format" title="Event and Decision — the two objects on the wire." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SchemaCard
              title="Event"
              subtitle="Lilly → Fathom · every event carries its upstream origin"
              json={`// Wearable ring event (pulled)
{
  "eventId":   "evt_r_8kx",
  "memberId":  "mbr_sr_a1f92",       // pseudonymized
  "timestamp": "2026-07-29T04:12:00Z",
  "source":    "lilly_health",
  "upstream":  "oura_ring_gen3",     // Lilly's partner
  "kind":      "ring_sleep_score",
  "payload":   { "score": 71, "hrv_ms": 42, "temp_delta_c": 0.3 }
}

// Member-logged side effect (pushed, time-sensitive)
{
  "eventId":   "evt_9zN2rP",
  "memberId":  "mbr_sr_a1f92",
  "timestamp": "2026-07-29T11:30:00Z",
  "source":    "lilly_health",
  "upstream":  "member_app",
  "priority":  "realtime",
  "kind":      "sideeffect_reported",
  "payload":   { "kind": "nausea", "score": 4, "coincident": ["breakfast_skipped"] }
}`}
              color="#0EA5E9"
            />
            <SchemaCard
              title="Decision"
              subtitle="Fathom → Lilly · the orchestration output"
              json={`{
  "decisionId": "dec_kQ7p2W",
  "eventId":    "evt_9zN2rP",
  "trace": {
    "signal":   { "name": "nausea_flare",     "confidence": 0.94 },
    "severity": { "score": 56,                "band": "MEDIUM" },
    "context":  { "tags": ["dose-escalation-week-4"] },
    "pattern":  { "cohort": "1mg_wk4_flares", "hit_rate": 0.68 },
    "channel":  { "primary": "lilly_push_l2", "fallback": ["coach_call_l1"] },
    "timing":   { "sendAt": "session_now",    "openProb": 1.0 }
  },
  "action": {
    "type":       "push_notification",
    "surface":    "lilly_health",
    "templateId": "lilly.sideeffect.nausea_gentle_toolkit",
    "personalization": {
      "week":     4,
      "toolkit":  ["ginger_saltines", "slow_walk", "protein_snack"]
    },
    "expiresAt":  "2026-07-29T15:30:00Z"
  }
}`}
              color="#4F5FE5"
            />
          </div>

          {/* SECTION 6 — SLOs */}
          <SectionHeader kicker="6 · Operational commitments" title="What Fathom is on the hook for." />
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <SloChip label="p50 ingest → decision" value="< 500 ms" tint="#DBEAFE" fg="#1E40AF" />
              <SloChip label="p99 ingest → decision" value="< 2 s"    tint="#DBEAFE" fg="#1E40AF" />
              <SloChip label="p99 decision → ACK"    value="< 3 s"    tint="#DBEAFE" fg="#1E40AF" />
              <SloChip label="Availability SLA"      value="99.95%"   tint="#DCFCE7" fg="#065F46" />
              <SloChip label="Data residency"        value="US-East · IN-South" tint="#F5F3FF" fg="#5B21B6" />
              <SloChip label="PII boundary"          value="Pseudonymized IDs" tint="#FEF3C7" fg="#92400E" />
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-[11px] text-slate-700 leading-relaxed">
              <span className="font-black text-slate-900">PII stays in Lilly's data plane.</span>{" "}
              Fathom operates on pseudonymized member IDs; the re-identification map lives in Lilly-controlled infrastructure with rotating keys.
              Fathom's decision payloads carry no PII — templates + personalization tokens only, resolved to text by Lilly's delivery adapter at send time.
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 rounded-2xl bg-white border border-slate-200 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 grid place-items-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F5FE5" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">See it in motion</div>
              <div className="text-[13px] text-slate-700 leading-relaxed">
                Watch the same decision trace play out end-to-end on{" "}
                <Link href="/scenarios" className="font-black text-indigo-700 underline">/scenarios</Link>
                {" "}(same 4 sample events, delivered through all 4 integration tiers), or see the integration-tier menu on{" "}
                <Link href="/four-ways" className="font-black text-indigo-700 underline">/four-ways</Link>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// UI building blocks
// ============================================================================
function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mt-10 mb-4">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 mb-1">{kicker}</div>
      <div className="text-[22px] font-black text-slate-900 leading-tight"
           style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
        {title}
      </div>
    </div>
  );
}

function BoundaryDiagram() {
  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.4fr_auto_1fr] items-stretch gap-4">
        {/* Left: Lilly Data Plane */}
        <BoundaryColumn
          kicker="Lilly Data Plane"
          title="Data in"
          tint="#FEF2F2"
          border="#FCA5A5"
          fg="#9F1239"
          items={[
            "CGM (Dexcom · Abbott)",
            "Wearable ring (Oura)",
            "Health data (Google · Apple)",
            "Dose ledger · time-stamped",
            "Mood + side-effect logs",
            "Food + meal log",
            "Weight + biometrics",
            "Program metadata",
          ]}
          footer="Wearables + devices integrate with Lilly. Fathom pulls from Lilly's unified plane — never from vendor APIs."
          upstream={["Oura", "Google Health", "Apple Health", "Dexcom"]}
        />
        <ArrowChip label={<>Fathom pulls<br/>+ Lilly pushes</>} />
        {/* Middle: Fathom */}
        <BoundaryColumn
          kicker="Fathom Orchestration Plane"
          title="Fathom decides"
          tint="#EEF2FF"
          border="#4F5FE5"
          fg="#4F5FE5"
          items={[
            "1 · Signal Detection",
            "2 · Severity Classifier",
            "3 · Context Tagger",
            "4 · Pattern Matcher",
            "5 · Channel Router",
            "6 · Timing Model",
          ]}
          footer="Operates on pseudonymized IDs · no Lilly PII"
          highlight
        />
        <ArrowChip label={<>decision<br/>+ payload</>} />
        {/* Right: Lilly Delivery */}
        <BoundaryColumn
          kicker="Lilly Delivery Surfaces"
          title="Lilly delivers"
          tint="#FEF2F2"
          border="#FCA5A5"
          fg="#9F1239"
          items={[
            "Push notifications",
            "In-app messages",
            "Home-feed cards",
            "Companion tab (L4)",
            "Coach console (analysts)",
            "SMS / voice (coach)",
          ]}
          footer="Lilly re-resolves templates + PII at send time"
        />
      </div>
    </div>
  );
}

function BoundaryColumn({
  kicker, title, items, footer, tint, border, fg, highlight = false, upstream,
}: {
  kicker: string; title: string; items: string[]; footer: string;
  tint: string; border: string; fg: string; highlight?: boolean;
  upstream?: string[];
}) {
  return (
    <div className="rounded-2xl p-4 flex flex-col"
         style={{ background: tint, border: `${highlight ? "2px" : "1px"} solid ${border}` }}>
      <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: fg }}>
        {kicker}
      </div>
      <div className="text-[16px] font-black text-slate-900 mb-3">{title}</div>
      {upstream && (
        <div className="mb-3 rounded-lg bg-white/70 border border-white p-2">
          <div className="text-[7px] font-black uppercase tracking-widest mb-1" style={{ color: fg }}>
            Upstream partners · Lilly-managed
          </div>
          <div className="flex flex-wrap gap-1 mb-1">
            {upstream.map(u => (
              <span key={u} className="text-[9px] font-black px-1.5 py-0.5 rounded-md border" style={{ color: fg, background: tint, borderColor: border }}>
                {u}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-center py-0.5">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v7M2 6l3 3 3-3" stroke={fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            </svg>
          </div>
          <div className="text-[8px] font-black italic text-center" style={{ color: fg }}>
            feed into Lilly Health
          </div>
        </div>
      )}
      <div className="space-y-1 flex-1">
        {items.map((it, i) => (
          <div key={i} className="text-[11px] font-black text-slate-700 flex items-start gap-1.5">
            <span className="text-slate-400 leading-none pt-1">•</span>
            <span className="leading-snug">{it}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/70 text-[9px] font-black italic leading-snug" style={{ color: fg }}>
        {footer}
      </div>
    </div>
  );
}

function ArrowChip({ label }: { label: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <svg width="42" height="16" viewBox="0 0 42 16" fill="none" className="mx-auto mb-1">
          <path d="M0 8h34M28 2l6 6-6 6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-tight">{label}</div>
      </div>
    </div>
  );
}

function LayerCard({ layer }: { layer: LayerDef }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl grid place-items-center text-[14px] font-black text-white shrink-0"
             style={{ background: layer.color }}>
          {layer.num}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-black text-slate-900 leading-tight">{layer.name}</div>
          <div className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: layer.color }}>
            {layer.tagline}
          </div>
        </div>
      </div>
      <div className="text-[11px] text-slate-600 leading-relaxed mb-3">{layer.desc}</div>
      <div className="space-y-1.5">
        <ChipRow label="In"   items={layer.inputs}  fg="#64748B" tint="#F1F5F9" />
        <ChipRow label="Out"  items={layer.outputs} fg={layer.color} tint={layer.color + "12"} />
        <ChipRow label="Tech" items={layer.tech}    fg="#4338CA" tint="#EEF2FF" />
      </div>
    </div>
  );
}

function ChipRow({ label, items, fg, tint }: { label: string; items: string[]; fg: string; tint: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-9 text-[8px] font-black uppercase tracking-widest text-slate-400 pt-1 shrink-0">{label}</div>
      <div className="flex flex-wrap gap-1 flex-1">
        {items.map((it, i) => (
          <span key={i} className="text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono"
                style={{ background: tint, color: fg }}>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function ApiCard({ api }: { api: ApiEndpoint }) {
  const methodColor = api.method === "GET" ? "#0EA5A4" : api.method === "POST" ? "#4F5FE5" : "#F97316";
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-white font-mono" style={{ background: methodColor }}>
          {api.method}
        </span>
        <span className="text-[12px] font-black text-slate-900 font-mono truncate">{api.path}</span>
        <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-slate-500 shrink-0">{api.direction}</span>
      </div>
      <div className="text-[12px] font-black text-slate-800 mb-1">{api.title}</div>
      <div className="text-[11px] text-slate-600 leading-relaxed mb-3">{api.desc}</div>
      {api.reqSnippet && (
        <>
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Request</div>
          <CodeBlock code={api.reqSnippet} tone="slate" small />
        </>
      )}
      {api.respSnippet && (
        <>
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1 mt-2">Response</div>
          <CodeBlock code={api.respSnippet} tone="indigo" small />
        </>
      )}
      <div className="mt-2 text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 inline-block">
        Auth · {api.auth}
      </div>
    </div>
  );
}

function SchemaCard({ title, subtitle, json, color }: { title: string; subtitle: string; json: string; color: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100" style={{ background: color + "0F" }}>
        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{title}</div>
        <div className="text-[11px] text-slate-600 mt-0.5">{subtitle}</div>
      </div>
      <div className="p-4">
        <CodeBlock code={json} tone="slate" />
      </div>
    </div>
  );
}

function CodeBlock({ code, tone = "slate", small = false }: { code: string; tone?: "slate" | "indigo"; small?: boolean }) {
  const bg = tone === "indigo" ? "#312E81" : "#0F172A";
  const fg = tone === "indigo" ? "#C7D2FE" : "#CBD5E1";
  const size = small ? "10px" : "11px";
  return (
    <pre className="rounded-lg p-3 overflow-auto"
         style={{
           background: bg, color: fg,
           fontFamily: "'JetBrains Mono', ui-monospace, monospace",
           fontSize: size, lineHeight: 1.55,
         }}>
      <code>{code}</code>
    </pre>
  );
}

function SloChip({ label, value, tint, fg }: { label: string; value: string; tint: string; fg: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: tint, border: `1px solid ${fg}22` }}>
      <div className="text-[8px] font-black uppercase tracking-widest mb-1" style={{ color: fg }}>{label}</div>
      <div className="text-[14px] font-black text-slate-900 leading-tight tabular-nums">{value}</div>
    </div>
  );
}
