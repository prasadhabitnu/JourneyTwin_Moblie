import { useEffect, useState } from "react";
import { WidgetShell, ChoiceRow, Chip } from "./WidgetShell";
import { WidgetHostProps, WidgetEventHandler } from "../../lib/widgetContract";

/**
 * Best Day Mirror Widget
 * ---------------------------------------------------------------------------
 * Behavior use case. Weekly reflection card — replays the member's best-scored
 * day and offers a 3-choice CTA. The card is a mirror, not a plan; the member
 * negotiates with their own past.
 *
 * Data collected: which CTA the member chose, adjust reason (if any), skip
 * reason (if any).
 * Events emitted: action:taken, data:collected, navigation:request.
 */
export default function BestDayMirrorWidget({
  host,
  theme,
  patient,
  onEvent,
}: WidgetHostProps & { onEvent: WidgetEventHandler }) {
  const [state, setState] = useState<"idle" | "trying" | "adjusting" | "dismissed">("idle");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    onEvent({
      type: "widget:mount",
      widgetId: "best-day-mirror",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { host, mode: "weekly-reflection" },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (payload: Record<string, unknown>) => {
    onEvent({
      type: "action:taken",
      widgetId: "best-day-mirror",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload,
    });
  };

  const timeline = [
    { time: "7:14 AM",  label: "Sunlight walk, 12 min",               icon: "🌤" },
    { time: "12:30 PM", label: "Protein-first lunch (chicken salad)", icon: "🥗" },
    { time: "6:15 PM",  label: "Early dinner",                        icon: "🍽" },
    { time: "6:45 PM",  label: "15-min walk",                         icon: "🚶🏻‍♀️" },
    { time: "10:30 PM", label: "Lights out",                          icon: "🌙" },
  ];

  return (
    <WidgetShell
      theme={theme}
      gradient={`linear-gradient(135deg, ${theme.primary} 0%, #A855F7 55%, #EC4899 100%)`}
      eyebrow="Your best day last week · Nu-scored"
      title={<>Tuesday, Sept 12</>}
      subtitle="A mirror, not a plan. Repeat the shape if it fits today."
      headerRight={
        <div className="flex items-center gap-1.5">
          <Chip label="Reliability 3 / 14" tone="emerald" />
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md border border-slate-200 bg-white"
          >
            {expanded ? "Hide" : "Context"}
          </button>
        </div>
      }
      footerNote={<>Weekly · Your voice · Three choices always</>}
    >
      <div className="grid md:grid-cols-[1.15fr_1fr] gap-5">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">What you did</div>
          <div className="relative pl-5">
            <span
              className="absolute left-1.5 top-1 bottom-1 w-[2px] rounded"
              style={{ background: `linear-gradient(180deg, ${theme.primary}66, #C4B5FD 50%, #F9A8D488)` }}
            />
            {timeline.map((t, i) => (
              <div key={i} className="relative flex items-start gap-3 pb-3 last:pb-0">
                <span
                  className="absolute top-1.5 w-3 h-3 rounded-full ring-2 ring-white"
                  style={{ left: -15, background: i === 0 ? theme.primary : i === timeline.length - 1 ? "#EC4899" : "#8B5CF6" }}
                />
                <span className="text-xs font-black tabular-nums shrink-0 pt-0.5 whitespace-nowrap" style={{ color: theme.primary, minWidth: 72 }}>{t.time}</span>
                <span className="text-base leading-none shrink-0 pt-0.5">{t.icon}</span>
                <span className="text-[13px] text-slate-800 font-bold leading-snug">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl p-3.5 border shadow-sm" style={{ borderColor: "#A7F3D0", background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDFA 100%)" }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-2">How it went</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <Result label="TIR"   value="91%"    />
              <Result label="HRV"   value="51 ms"  />
              <Result label="Sleep" value="7h 42m" />
              <Result label="Mood"  value="5/5"    />
            </div>
          </div>
          <div className="rounded-2xl p-3.5 border shadow-sm" style={{ borderColor: "#FED7AA", background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)" }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">You wrote at 9 PM</div>
            <div className="text-[14px] italic leading-snug text-slate-800">&ldquo;Felt like myself again.&rdquo;</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          <MiniTile eyebrow="Where it broke last time" body="Last Tuesday-shape day, dinner slipped to 8:30 and TIR dropped to 74%." tone="amber" />
          <MiniTile eyebrow="What's different today" body={`${patient.firstName}, you're traveling — swap the 6:45 walk for stairs.`} tone="indigo" />
          <MiniTile eyebrow="Ingredients you have" body="Chicken + greens in the fridge. Sunrise at 6:52." tone="emerald" />
        </div>
      )}

      <div className="mt-4">
        {state === "idle" && (
          <ChoiceRow
            theme={theme}
            primary="Try this shape today →"
            secondary="Adjust one thing"
            tertiary="Not today"
            onPrimary={() => { setState("trying"); emit({ choice: "try", day: "2026-09-12" }); }}
            onSecondary={() => { setState("adjusting"); emit({ choice: "adjust" }); }}
            onTertiary={() => { setState("dismissed"); emit({ choice: "not-today" }); }}
          />
        )}
        {state === "trying" && (
          <Toast
            tone="emerald"
            eyebrow={`${patient.firstName} is shaping today like Tuesday`}
            body="Nu will check the walk window at 6:30 PM and cheer you on."
            onUndo={() => setState("idle")}
          />
        )}
        {state === "adjusting" && (
          <div className="rounded-xl p-3 border shadow-sm" style={{ background: "#EEF2FF", borderColor: "#C7D2FE" }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-2">Which element to adjust?</div>
            <div className="flex flex-wrap gap-2">
              {["Skip morning walk", "Later lunch", "Swap dinner", "Later lights-out"].map(o => (
                <button key={o}
                  onClick={() => { setState("trying"); emit({ choice: "try", adjust: o }); }}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-black text-indigo-800 bg-white border border-indigo-200 hover:bg-indigo-50">
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}
        {state === "dismissed" && (
          <Toast tone="slate" eyebrow="Understood" body="Nu won't push. The mirror stays whenever you want it." onUndo={() => setState("idle")} />
        )}
      </div>
    </WidgetShell>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">{label}</span>
      <span className="text-lg font-black tabular-nums text-emerald-800">{value}</span>
    </div>
  );
}

function MiniTile({ eyebrow, body, tone }: { eyebrow: string; body: string; tone: "amber" | "indigo" | "emerald" }) {
  const t = { amber: { bg: "#FFFBEB", bd: "#FDE68A", fg: "#B45309" }, indigo: { bg: "#EEF2FF", bd: "#C7D2FE", fg: "#4338CA" }, emerald: { bg: "#ECFDF5", bd: "#A7F3D0", fg: "#065F46" } }[tone];
  return (
    <div className="rounded-xl p-3 border shadow-sm" style={{ background: t.bg, borderColor: t.bd }}>
      <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: t.fg }}>{eyebrow}</div>
      <div className="text-[12px] font-medium text-slate-700 leading-snug">{body}</div>
    </div>
  );
}

function Toast({ eyebrow, body, tone, onUndo }: { eyebrow: string; body: string; tone: "emerald" | "slate"; onUndo: () => void }) {
  const t = tone === "emerald" ? { bg: "#ECFDF5", bd: "#A7F3D0", fg: "#065F46" } : { bg: "#F8FAFC", bd: "#E2E8F0", fg: "#334155" };
  return (
    <div className="rounded-xl p-3 border shadow-sm flex items-center gap-3" style={{ background: t.bg, borderColor: t.bd }}>
      <div className="flex-1">
        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: t.fg }}>{eyebrow}</div>
        <div className="text-[13px] font-black" style={{ color: t.fg }}>{body}</div>
      </div>
      <button onClick={onUndo} className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">Undo</button>
    </div>
  );
}
