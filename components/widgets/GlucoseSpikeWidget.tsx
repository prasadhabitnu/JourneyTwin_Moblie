import { useEffect, useState } from "react";
import { WidgetShell, ChoiceRow, Chip } from "./WidgetShell";
import { WidgetHostProps, WidgetEventHandler } from "../../lib/widgetContract";

/**
 * Glucose Spike Insight Widget
 * ---------------------------------------------------------------------------
 * Clinical use case (numbers-first). Sarah's post-lunch glucose spiked to 214
 * yesterday. Widget shows: the spike curve, what she ate, one clear lever to
 * try next time, and the 3-choice CTA (Try lever / Show comparable days /
 * Not now).
 *
 * Data collected: chosen lever + commitment.
 * Events: data:collected → action:taken.
 */

// Sarah's Sept 15 lunch spike vs her best-Tuesday flat curve.
// Values are mg/dL at 15-min intervals from 12:00 to 15:00.
const SPIKE = [102, 108, 128, 168, 199, 214, 205, 188, 168, 152, 140, 128, 118];
const CALM  = [ 96,  99, 104, 118, 132, 141, 138, 128, 120, 114, 108, 102,  98];

export default function GlucoseSpikeWidget({ theme, patient, onEvent }: WidgetHostProps & { onEvent: WidgetEventHandler }) {
  const [state, setState] = useState<"idle" | "committed" | "comparing" | "skipped">("idle");
  const [lever, setLever] = useState<string | null>(null);

  useEffect(() => {
    onEvent({
      type: "widget:mount",
      widgetId: "glucose-spike",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { spikePeak: 214, spikeMeal: "White rice + curry" },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commitLever(l: string) {
    setLever(l);
    setState("committed");
    onEvent({
      type: "data:collected",
      widgetId: "glucose-spike",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { commitment: l, targetPeak: 155 },
    });
    onEvent({
      type: "action:taken",
      widgetId: "glucose-spike",
      at: new Date().toISOString(),
      patientId: patient.patientId,
      payload: { choice: "try-lever", lever: l },
    });
  }

  return (
    <WidgetShell
      theme={theme}
      eyebrow={`${patient.firstName}, one big spike yesterday`}
      title={<>Lunch peaked at 214</>}
      subtitle="Peak targets under 155 for most GLP-1 members at your dose."
      headerRight={<Chip label="Post-meal · 12:00-15:00" tone="amber" />}
      footerNote={<>Clinical insight · levers, not prescriptions</>}
    >
      {(state === "idle" || state === "comparing") && (
        <>
          <SpikeChart spike={SPIKE} calm={CALM} showCompare={state === "comparing"} theme={theme} />

          <div className="grid grid-cols-3 gap-2 mt-4">
            <Stat label="Peak"  value="214" unit="mg/dL" tone="#B91C1C" />
            <Stat label="Above 155 for" value="78" unit="min" tone="#B45309" />
            <Stat label="Meal" value="White rice + curry" tone="#334155" small />
          </div>

          <div className="rounded-xl p-3 border mt-4" style={{ background: "#EEF2FF", borderColor: "#C7D2FE" }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-1">
              Nu spotted three levers that work for you
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
              {[
                { id: "order",  label: "Veggies first, rice last", detail: "Cut your Aug 22 spike from 199 → 141" },
                { id: "walk",   label: "10-min walk after lunch",  detail: "Flattened your Aug 30 curve by 33%" },
                { id: "swap",   label: "Swap ½ rice for lentils",  detail: "Sarah, you liked this at last week's dinner" },
              ].map(l => {
                const selected = lever === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => commitLever(l.label)}
                    className={"text-left p-2.5 rounded-lg border-2 transition " + (selected ? "border-indigo-500 bg-white shadow-md" : "border-indigo-100 bg-white hover:border-indigo-300")}
                  >
                    <div className="text-[12px] font-black text-slate-800 leading-tight">{l.label}</div>
                    <div className="text-[10px] font-medium text-indigo-700 mt-1 leading-snug">{l.detail}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <ChoiceRow
              theme={theme}
              primary="Try a lever tomorrow →"
              secondary={state === "comparing" ? "Hide comparable days" : "Show comparable days"}
              tertiary="Not now"
              onPrimary={() => commitLever("Veggies first, rice last")}
              onSecondary={() => {
                setState(state === "comparing" ? "idle" : "comparing");
                onEvent({
                  type: "action:taken",
                  widgetId: "glucose-spike",
                  at: new Date().toISOString(),
                  patientId: patient.patientId,
                  payload: { choice: "toggle-compare", to: state === "comparing" ? "hide" : "show" },
                });
              }}
              onTertiary={() => {
                setState("skipped");
                onEvent({
                  type: "action:taken",
                  widgetId: "glucose-spike",
                  at: new Date().toISOString(),
                  patientId: patient.patientId,
                  payload: { choice: "not-now" },
                });
              }}
            />
          </div>
        </>
      )}

      {state === "committed" && lever && (
        <div className="rounded-xl p-4 border" style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-emerald-600 text-white grid place-items-center shadow">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
            </span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Committed for tomorrow</div>
              <div className="text-[13px] font-black text-emerald-900">{lever}</div>
              <div className="text-[11px] text-emerald-800 mt-0.5 font-medium">
                Nu will compare tomorrow's post-lunch curve to today's and text you the delta at 3 PM.
              </div>
            </div>
            <button onClick={() => setState("idle")} className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">Undo</button>
          </div>
        </div>
      )}

      {state === "skipped" && (
        <div className="rounded-xl p-4 border" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">👋</span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Noted</div>
              <div className="text-[13px] font-black text-slate-800">Nu will keep watching. If tomorrow's lunch spikes again, the widget will show up quietly.</div>
            </div>
            <button onClick={() => setState("idle")} className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">Show again</button>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}

function Stat({ label, value, unit, tone, small }: { label: string; value: string; unit?: string; tone: string; small?: boolean }) {
  return (
    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</div>
      <div className={"font-black tabular-nums leading-tight " + (small ? "text-[13px]" : "text-2xl")} style={{ color: tone }}>
        {value}{unit && <span className="text-[10px] font-black ml-1 text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

function SpikeChart({ spike, calm, showCompare, theme }: { spike: number[]; calm: number[]; showCompare: boolean; theme: any }) {
  const w = 640, h = 180, padL = 34, padR = 12, padT = 12, padB = 24;
  const yMin = 80, yMax = 230;
  const xAt = (i: number) => padL + (i / (spike.length - 1)) * (w - padL - padR);
  const yAt = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * (h - padT - padB);
  const path = (arr: number[]) => arr.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  const areaPath = (arr: number[]) => {
    const top = arr.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ");
    return `M ${xAt(0)},${yAt(yMin)} L ${top} L ${xAt(arr.length - 1)},${yAt(yMin)} Z`;
  };
  const times = ["12:00", "13:00", "14:00", "15:00"];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {/* target band 70-155 */}
      <rect x={padL} y={yAt(155)} width={w - padL - padR} height={yAt(70) - yAt(155)} fill="#10B98118" />
      <text x={padL + 6} y={yAt(155) - 4} fontSize={9} fill="#065F46" fontWeight={800}>TARGET RANGE (70-155)</text>
      {/* gridlines */}
      {[100, 155, 200].map(v => (
        <g key={v}>
          <line x1={padL} y1={yAt(v)} x2={w - padR} y2={yAt(v)} stroke="#E5E7EB" strokeDasharray="3 3" />
          <text x={padL - 4} y={yAt(v) + 3} textAnchor="end" fontSize={9} fill="#94A3B8" fontWeight={700}>{v}</text>
        </g>
      ))}
      {/* comparison curve */}
      {showCompare && (
        <>
          <path d={areaPath(calm)} fill="#10B98120" />
          <polyline points={path(calm)} fill="none" stroke="#10B981" strokeWidth={2.5} strokeDasharray="4 4" />
          <text x={xAt(calm.length - 1) - 60} y={yAt(calm[calm.length - 3]) - 6} fontSize={10} fontWeight={800} fill="#065F46">Aug 22 · calm</text>
        </>
      )}
      {/* spike area */}
      <path d={areaPath(spike)} fill="#EF444422" />
      <polyline points={path(spike)} fill="none" stroke="#DC2626" strokeWidth={3} />
      {/* peak dot */}
      <circle cx={xAt(5)} cy={yAt(214)} r={4.5} fill="#DC2626" stroke="#FFF" strokeWidth={2} />
      <text x={xAt(5) + 8} y={yAt(214) - 6} fontSize={11} fontWeight={800} fill="#B91C1C">214</text>
      {/* x labels */}
      {times.map((t, i) => (
        <text key={t} x={padL + (i / (times.length - 1)) * (w - padL - padR)} y={h - 6} textAnchor="middle" fontSize={9} fill="#6B7280" fontWeight={700}>{t}</text>
      ))}
    </svg>
  );
}
