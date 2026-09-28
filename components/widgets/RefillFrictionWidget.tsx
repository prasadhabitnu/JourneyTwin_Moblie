import { useEffect, useState } from "react";
import { WidgetShell, ChoiceRow, Chip } from "./WidgetShell";
import { WidgetHostProps, WidgetEventHandler } from "../../lib/widgetContract";

/**
 * Refill Friction Widget
 * ---------------------------------------------------------------------------
 * Access use case. Adam has 4 days of medication left, refill hasn't shipped
 * (prior auth pending). Widget shows: days-left, blocker, and 3 concrete
 * actions to break the friction. Nu never dispenses medical advice; only
 * routes to pharmacy contact, coupon program, or coach.
 *
 * Data collected: chosen action, optional pharmacy contact result.
 * Events: action:taken, navigation:request, coach:handoff.
 */

export default function RefillFrictionWidget({ theme, patient, onEvent }: WidgetHostProps & { onEvent: WidgetEventHandler }) {
  const [state, setState] = useState<"idle" | "calling" | "coupon" | "coach" | "resolved">("idle");
  const daysLeft = 4;
  const blocker = "Prior auth pending — insurance response expected in 48 h";

  useEffect(() => {
    onEvent({
      type: "widget:mount",
      widgetId: "refill-friction",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { daysLeft, blocker },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function takeAction(kind: "call-pharmacy" | "coupon" | "coach" | "resolved") {
    if (kind === "call-pharmacy") setState("calling");
    else if (kind === "coupon")  setState("coupon");
    else if (kind === "coach")   setState("coach");
    else                          setState("resolved");
    const eventType = kind === "coach" ? "coach:handoff" : kind === "call-pharmacy" ? "navigation:request" : "action:taken";
    onEvent({
      type: eventType as any,
      widgetId: "refill-friction",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { action: kind, daysLeft, blocker, medication: patient.medication?.name },
    });
  }

  const urgent = daysLeft <= 5;

  return (
    <WidgetShell
      theme={theme}
      eyebrow={`${patient.firstName}, your ${patient.medication?.name ?? "medication"} is running low`}
      title={<>{daysLeft} days left</>}
      subtitle={patient.medication ? `${patient.medication.name} ${patient.medication.dose} · weekly dose` : undefined}
      headerRight={<Chip label={urgent ? "Action needed" : "Heads up"} tone={urgent ? "rose" : "amber"} />}
      footerNote={<>Access use case · Nu routes to pharmacy / coupon / coach (never fills prescriptions)</>}
    >
      {state === "idle" && (
        <div>
          <div className="rounded-xl p-4 border mb-4" style={{ background: "#FEF3C7", borderColor: "#FDE68A" }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1">What's blocking your refill</div>
            <div className="text-[13px] font-black text-amber-900 leading-snug">{blocker}</div>
          </div>

          <div className="rounded-xl p-4 border mb-4" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-full grid place-items-center shrink-0"
                    style={{ background: "radial-gradient(circle at 35% 30%, #FDE68A, #F59E0B 50%, #B45309)" }}>
                <span className="text-[11px] font-black text-slate-900">Nu</span>
              </span>
              <div className="flex-1 text-[13px] text-slate-800 leading-snug font-medium">
                {patient.firstName}, three ways members like you usually unblock this. Pick whichever fits your day.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <ActionCard
              theme={theme}
              tone="primary"
              icon="📞"
              title="Call pharmacy"
              body="Confirm PA status; ask about a 5-day bridge fill"
              onClick={() => takeAction("call-pharmacy")}
            />
            <ActionCard
              theme={theme}
              tone="secondary"
              icon="🎟"
              title="Manufacturer coupon"
              body="Zepbound Savings Card — up to $469 off if paying cash"
              onClick={() => takeAction("coupon")}
            />
            <ActionCard
              theme={theme}
              tone="tertiary"
              icon="👥"
              title="Talk to Maya"
              body="Coach can escalate PA + coordinate with prescriber"
              onClick={() => takeAction("coach")}
            />
          </div>
        </div>
      )}

      {state === "calling" && (
        <ActionResult
          eyebrow="Opening dialer"
          title="CVS #4482 · (312) 555-0198"
          body="Ask for: PA status on Zepbound 2.4 mg, refill authorization number, expected fill date."
          primaryLabel="I'm done"
          onPrimary={() => takeAction("resolved")}
          onBack={() => setState("idle")}
          tone="indigo"
        />
      )}

      {state === "coupon" && (
        <ActionResult
          eyebrow="Zepbound Savings Card"
          title="Apply your $469 offer"
          body="Enter your card number at the pharmacy counter. Valid for 4 more fills through Dec 2026."
          primaryLabel="Card applied"
          onPrimary={() => takeAction("resolved")}
          onBack={() => setState("idle")}
          tone="indigo"
        />
      )}

      {state === "coach" && (
        <ActionResult
          eyebrow="Maya was pinged"
          title="Coach handoff sent"
          body="Maya will call your prescriber's office and update your PA status by end of day. She'll message you here when she has news."
          primaryLabel="Sounds good"
          onPrimary={() => takeAction("resolved")}
          onBack={() => setState("idle")}
          tone="emerald"
        />
      )}

      {state === "resolved" && (
        <div className="rounded-xl p-4 border" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-emerald-600 text-white grid place-items-center shadow">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
            </span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Handled</div>
              <div className="text-[13px] font-black text-emerald-900">Nu will re-check the refill status tomorrow and nudge you if it hasn't shipped.</div>
            </div>
            <button onClick={() => setState("idle")} className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">Undo</button>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}

function ActionCard({
  icon, title, body, tone, theme, onClick,
}: {
  icon: string; title: string; body: string;
  tone: "primary" | "secondary" | "tertiary";
  theme: any; onClick: () => void;
}) {
  const isPrimary = tone === "primary";
  return (
    <button
      onClick={onClick}
      className={`text-left p-3 rounded-xl border transition hover:-translate-y-0.5 ${isPrimary ? "shadow-md" : "hover:bg-slate-50"}`}
      style={{
        background: isPrimary ? `linear-gradient(135deg, ${theme.primary} 0%, #7C3AED 100%)` : "#FFFFFF",
        borderColor: isPrimary ? "transparent" : "#E2E8F0",
        color: isPrimary ? "#FFFFFF" : theme.text,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-[13px] font-black leading-tight">{title}</span>
      </div>
      <div className={`text-[11px] font-medium leading-snug ${isPrimary ? "text-white/85" : "text-slate-500"}`}>{body}</div>
    </button>
  );
}

function ActionResult({
  eyebrow, title, body, primaryLabel, tone, onPrimary, onBack,
}: {
  eyebrow: string; title: string; body: string;
  primaryLabel: string;
  tone: "indigo" | "emerald";
  onPrimary: () => void; onBack: () => void;
}) {
  const t = tone === "emerald"
    ? { bg: "#ECFDF5", bd: "#A7F3D0", fg: "#065F46" }
    : { bg: "#EEF2FF", bd: "#C7D2FE", fg: "#3730A3" };
  return (
    <div className="rounded-xl p-4 border" style={{ background: t.bg, borderColor: t.bd }}>
      <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: t.fg }}>{eyebrow}</div>
      <div className="text-[15px] font-black mb-1" style={{ color: t.fg }}>{title}</div>
      <div className="text-[12px] text-slate-700 leading-snug font-medium mb-3">{body}</div>
      <div className="flex items-center gap-2">
        <button onClick={onPrimary}
                className="flex-1 px-4 py-2.5 rounded-lg text-white text-[12px] font-black tracking-wide"
                style={{ background: t.fg }}>
          {primaryLabel}
        </button>
        <button onClick={onBack}
                className="px-3 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800">
          Back
        </button>
      </div>
    </div>
  );
}
