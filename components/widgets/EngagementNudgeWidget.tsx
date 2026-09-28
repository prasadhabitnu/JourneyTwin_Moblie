import { useEffect, useState } from "react";
import { WidgetShell, ChoiceRow, Chip } from "./WidgetShell";
import { WidgetHostProps, WidgetEventHandler } from "../../lib/widgetContract";

/**
 * Engagement Nudge Widget
 * ---------------------------------------------------------------------------
 * Engagement use case. Diane has been quiet for 9 days. Widget renders a
 * low-friction re-engagement without shame: acknowledges the gap, offers a
 * tiny re-entry point (one 30-sec log), and provides an exit that is not a
 * penalty ("Take a longer break").
 *
 * Data collected: reason for gap (optional), chosen re-entry.
 * Events: data:collected → action:taken.
 */

type ReasonId = "busy" | "not-well" | "not-sure" | "other";
const REASONS: { id: ReasonId; label: string; icon: string }[] = [
  { id: "busy",     label: "Just busy",           icon: "🏃🏻‍♀️" },
  { id: "not-well", label: "Not feeling well",    icon: "😷" },
  { id: "not-sure", label: "Not sure it's working", icon: "🤔" },
  { id: "other",    label: "Something else",      icon: "💭" },
];

export default function EngagementNudgeWidget({ theme, patient, onEvent }: WidgetHostProps & { onEvent: WidgetEventHandler }) {
  const [state, setState] = useState<"greeting" | "reason" | "reentry" | "break" | "done">("greeting");
  const [reason, setReason] = useState<ReasonId | null>(null);
  const days = patient.signals?.daysSinceLastLog ?? 9;

  useEffect(() => {
    onEvent({
      type: "widget:mount",
      widgetId: "engagement-nudge",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { daysSinceLastLog: days },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickReason(r: ReasonId) {
    setReason(r);
    setState("reentry");
    onEvent({
      type: "data:collected",
      widgetId: "engagement-nudge",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { reason: r, daysSinceLastLog: days },
    });
  }

  function chooseReentry(kind: "quick-log" | "coach" | "break") {
    if (kind === "break") setState("break"); else setState("done");
    onEvent({
      type: kind === "coach" ? "coach:handoff" : "action:taken",
      widgetId: "engagement-nudge",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { reentry: kind, reason },
    });
  }

  const messages: Record<ReasonId, string> = {
    busy:       `${patient.firstName}, no problem. Want the tiniest possible re-entry? One tap to log how today feels.`,
    "not-well": `${patient.firstName}, sorry it's been a rough stretch. If a symptom is behind this, tap 'Talk to my coach' and Maya will reach out today.`,
    "not-sure": `${patient.firstName}, that's fair — 9 days is enough to lose the thread. Let me show you the one thing that changed in your data.`,
    other:      `${patient.firstName}, whatever it is, we can pick up exactly where you left off. No catch-up work.`,
  };

  return (
    <WidgetShell
      theme={theme}
      eyebrow={`Welcome back, ${patient.firstName}`}
      title={<>It's been {days} days.</>}
      subtitle="No streak lost. No badge revoked. Just glad you're here."
      headerRight={<Chip label="Drift detected" tone="amber" />}
      footerNote={<>Engagement use case · re-entry over restart</>}
    >
      {state === "greeting" && (
        <div>
          <div className="rounded-xl p-4 border mb-4" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-full grid place-items-center shrink-0"
                    style={{ background: "radial-gradient(circle at 35% 30%, #FDE68A, #F59E0B 50%, #B45309)" }}>
                <span className="text-[11px] font-black text-slate-900">Nu</span>
              </span>
              <div className="flex-1 text-[13px] text-slate-800 leading-relaxed font-medium">
                &ldquo;Life happens. I'm not going to guilt you about the gap — I'm going to make it easy to step back in.&rdquo;
              </div>
            </div>
          </div>
          <button
            onClick={() => setState("reason")}
            className="w-full px-4 py-3 rounded-xl text-white text-[13px] font-black tracking-wide shadow-md hover:brightness-110 transition"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, #7C3AED)` }}
          >
            Show me the smallest thing I can do →
          </button>
        </div>
      )}

      {state === "reason" && (
        <div>
          <div className="text-[11px] text-slate-600 font-medium mb-2">
            Optional — what was going on? Helps Nu right-size the re-entry.
          </div>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map(r => (
              <button
                key={r.id}
                onClick={() => pickReason(r.id)}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition text-left"
              >
                <span className="text-xl leading-none">{r.icon}</span>
                <span className="text-[13px] font-black text-slate-700">{r.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => { setReason("other"); setState("reentry"); }}
            className="mt-3 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800"
          >
            Skip → just show me the re-entry
          </button>
        </div>
      )}

      {state === "reentry" && reason && (
        <div>
          <div className="rounded-xl p-3 border mb-3" style={{ background: "#EEF2FF", borderColor: "#C7D2FE" }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-1">Nu says</div>
            <div className="text-[13px] text-slate-800 font-medium leading-snug">{messages[reason]}</div>
          </div>
          <ChoiceRow
            theme={theme}
            primary="Quick 30-sec log →"
            secondary="Talk to my coach"
            tertiary="Take a longer break"
            onPrimary={()   => chooseReentry("quick-log")}
            onSecondary={() => chooseReentry("coach")}
            onTertiary={()  => chooseReentry("break")}
          />
        </div>
      )}

      {state === "done" && (
        <div className="rounded-xl p-4 border" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-emerald-600 text-white grid place-items-center shadow">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
            </span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">You're back in</div>
              <div className="text-[13px] font-black text-emerald-900">Nu will keep it light this week — one small thing a day.</div>
            </div>
          </div>
        </div>
      )}

      {state === "break" && (
        <div className="rounded-xl p-4 border" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🌱</span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Break confirmed</div>
              <div className="text-[13px] font-black text-slate-800">
                Nu will step back for 4 weeks and check in on <span className="text-slate-900">Sep 26</span>. Nothing to do.
              </div>
              <button onClick={() => setState("greeting")} className="mt-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800">
                Change my mind
              </button>
            </div>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
