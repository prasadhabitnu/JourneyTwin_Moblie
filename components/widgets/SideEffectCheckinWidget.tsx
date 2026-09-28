import { useEffect, useState } from "react";
import { WidgetShell, ChoiceRow, Chip } from "./WidgetShell";
import { WidgetHostProps, WidgetEventHandler, NuResponse } from "../../lib/widgetContract";

/**
 * Side-Effect Check-in Widget
 * ---------------------------------------------------------------------------
 * Treatment-experience use case. Sarah (nausea week 14) taps this widget in
 * the Lilly Health app. Widget:
 *   1. Presents a scannable symptom picker (nausea, fatigue, constipation…)
 *   2. Collects severity 1-5 + optional voice/text note
 *   3. Routes through Nu treatment-experience rules
 *   4. Renders Nu's response with 3 actions (Log & continue / Talk to Nu /
 *      Talk to my coach)
 *   5. Escalates to coach queue if severity ≥ 4 OR safety keywords present
 *
 * Events: data:collected → nu:response → action:taken (or nu:escalate)
 */

type Symptom = "nausea" | "fatigue" | "constipation" | "heartburn" | "bloating" | "dizziness";
type Severity = 1 | 2 | 3 | 4 | 5;

const SYMPTOMS: { id: Symptom; label: string; icon: string }[] = [
  { id: "nausea",       label: "Nausea",       icon: "🤢" },
  { id: "fatigue",      label: "Fatigue",      icon: "😴" },
  { id: "constipation", label: "Constipation", icon: "🚫" },
  { id: "heartburn",    label: "Heartburn",    icon: "🔥" },
  { id: "bloating",     label: "Bloating",     icon: "🎈" },
  { id: "dizziness",    label: "Dizziness",    icon: "💫" },
];

function routeNuResponse(symptom: Symptom, severity: Severity, firstName: string): NuResponse {
  if (severity >= 4) {
    return {
      area: "treatment-experience",
      confidence: "high",
      ruleId: `tx.${symptom}.severe`,
      message: `${firstName}, a ${severity}/5 on ${symptom} at week 14 warrants a coach touchpoint. I'll flag Maya to reach out today.`,
      requiresEscalation: true,
      suggestedActions: [
        { id: "handoff", label: "Talk to my coach", tone: "primary", emits: "coach:handoff" },
        { id: "log",     label: "Log & continue",   tone: "secondary" },
        { id: "later",   label: "Not now",          tone: "tertiary" },
      ],
    };
  }
  const softLines: Record<Symptom, string> = {
    nausea:       `${firstName}, mild nausea is common at this dose. Small ginger tea + eat protein first — most members feel it lift by 3 PM.`,
    fatigue:      `${firstName}, weeks 12-16 dip is expected. A 10-min sunlight walk resets more members than any nap.`,
    constipation: `${firstName}, add 500 ml water + 1 tbsp psyllium tonight. Members see relief within 24-36 h.`,
    heartburn:    `${firstName}, try eating dinner 90 min earlier tonight and skip the late snack. Stays quieter.`,
    bloating:     `${firstName}, walking after meals cuts bloating for 8 of 10 members. 10 minutes is enough.`,
    dizziness:    `${firstName}, hydration first — 2 glasses of water now. If it lingers past an hour, tap "Talk to my coach."`,
  };
  return {
    area: "treatment-experience",
    confidence: "high",
    ruleId: `tx.${symptom}.mild`,
    message: softLines[symptom],
    suggestedActions: [
      { id: "log",      label: "Log & continue",  tone: "primary" },
      { id: "chat",     label: "Talk to Nu",      tone: "secondary" },
      { id: "handoff",  label: "Talk to my coach", tone: "tertiary", emits: "coach:handoff" },
    ],
  };
}

export default function SideEffectCheckinWidget({ theme, patient, onEvent }: WidgetHostProps & { onEvent: WidgetEventHandler }) {
  const [step, setStep] = useState<"pick" | "severity" | "response">("pick");
  const [symptom, setSymptom] = useState<Symptom | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [response, setResponse] = useState<NuResponse | null>(null);

  useEffect(() => {
    onEvent({
      type: "widget:mount",
      widgetId: "side-effect-checkin",
      at: new Date().toISOString(),
      patientId: patient.patientId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickSymptom(s: Symptom) {
    setSymptom(s);
    setStep("severity");
    onEvent({
      type: "data:collected",
      widgetId: "side-effect-checkin",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { symptom: s },
    });
  }

  function submitSeverity(v: Severity) {
    setSeverity(v);
    const r = routeNuResponse(symptom!, v, patient.firstName);
    setResponse(r);
    setStep("response");
    onEvent({
      type: "nu:response",
      widgetId: "side-effect-checkin",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { symptom, severity: v, area: r.area, ruleId: r.ruleId, escalate: r.requiresEscalation ?? false },
    });
    if (r.requiresEscalation) {
      onEvent({
        type: "nu:escalate",
        widgetId: "side-effect-checkin",
        at: new Date().toISOString(),
        patientId: patient.patientId,
        payload: { severity: v, symptom, coach: "Maya Patel" },
      });
    }
  }

  function takeAction(id: string, label: string, emitEvent?: string) {
    onEvent({
      type: (emitEvent as any) ?? "action:taken",
      widgetId: "side-effect-checkin",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { actionId: id, actionLabel: label, symptom, severity },
    });
  }

  return (
    <WidgetShell
      theme={theme}
      eyebrow={`How are you feeling, ${patient.firstName}?`}
      title={<>Side-effect check-in</>}
      subtitle={patient.medication ? `${patient.medication.name} ${patient.medication.dose} · Week ${patient.medication.week}` : undefined}
      headerRight={<Chip label={step === "response" ? "Nu ready" : "Collecting"} tone={step === "response" ? "emerald" : "indigo"} />}
      footerNote={<>Treatment-experience area · escalates to coach at severity ≥ 4</>}
    >
      {step === "pick" && (
        <div>
          <div className="text-[11px] text-slate-600 font-medium mb-3">Tap what you're feeling most today. You can log more than one later.</div>
          <div className="grid grid-cols-3 gap-2">
            {SYMPTOMS.map(s => (
              <button
                key={s.id}
                onClick={() => pickSymptom(s.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition"
              >
                <span className="text-2xl leading-none">{s.icon}</span>
                <span className="text-[12px] font-black text-slate-700">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-xl p-3 border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-rose-700 mb-0.5">If it's severe</div>
            <div className="text-[12px] text-rose-800 font-medium">Chest pain, trouble breathing, or vomiting that won't stop → tap here to call 911.</div>
          </div>
        </div>
      )}

      {step === "severity" && symptom && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{SYMPTOMS.find(s => s.id === symptom)!.icon}</span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">You logged</div>
              <div className="text-[15px] font-black text-slate-900">{SYMPTOMS.find(s => s.id === symptom)!.label}</div>
            </div>
            <button
              onClick={() => setStep("pick")}
              className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800">
              Change
            </button>
          </div>
          <div className="text-[11px] text-slate-600 font-medium mb-2">How severe, right now?</div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(v => {
              const tone = v <= 2 ? "#10B981" : v === 3 ? "#F59E0B" : "#EF4444";
              return (
                <button
                  key={v}
                  onClick={() => submitSeverity(v as Severity)}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition text-center"
                >
                  <div className="text-2xl font-black tabular-nums" style={{ color: tone }}>{v}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {v === 1 ? "Barely" : v === 2 ? "Mild" : v === 3 ? "Noticeable" : v === 4 ? "Rough" : "Severe"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === "response" && response && (
        <div>
          <div
            className="rounded-xl p-4 border shadow-sm mb-3"
            style={{
              background: response.requiresEscalation ? "#FEF2F2" : "#EEF2FF",
              borderColor:  response.requiresEscalation ? "#FECACA" : "#C7D2FE",
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="w-9 h-9 rounded-full grid place-items-center shrink-0 shadow"
                style={{ background: "radial-gradient(circle at 35% 30%, #FDE68A, #F59E0B 50%, #B45309)" }}
              >
                <span className="text-[11px] font-black text-slate-900">Nu</span>
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Chip label={response.area} tone={response.requiresEscalation ? "rose" : "indigo"} />
                  <Chip label={`Rule ${response.ruleId}`} tone="slate" />
                  <Chip label={`${response.confidence} confidence`} tone="emerald" />
                </div>
                <div className="text-[13px] text-slate-800 leading-snug font-medium">{response.message}</div>
              </div>
            </div>
          </div>

          <ChoiceRow
            theme={theme}
            primary={response.suggestedActions![0].label}
            secondary={response.suggestedActions![1]?.label}
            tertiary={response.suggestedActions![2]?.label ?? "Not now"}
            onPrimary={() =>   takeAction(response.suggestedActions![0].id, response.suggestedActions![0].label, response.suggestedActions![0].emits)}
            onSecondary={() => takeAction(response.suggestedActions![1].id, response.suggestedActions![1].label, response.suggestedActions![1].emits)}
            onTertiary={() =>  takeAction(response.suggestedActions![2]?.id ?? "later", response.suggestedActions![2]?.label ?? "Not now", response.suggestedActions![2]?.emits)}
          />

          <button
            onClick={() => { setStep("pick"); setSymptom(null); setSeverity(null); setResponse(null); }}
            className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800"
          >
            Log another symptom
          </button>
        </div>
      )}
    </WidgetShell>
  );
}
