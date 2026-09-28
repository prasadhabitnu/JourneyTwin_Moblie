import { useEffect, useRef, useState } from "react";
import { useUpdateMe, UpdateMeLog } from "../../../contexts/UpdateMeContext";
import { NU_VOICE_ENABLED } from "../../../lib/nuSpeech";

/**
 * Update Me - Nu-guided daily logging step (matches the mobile screenshot).
 * Six pastel pill buttons open a Nu-narrated capture modal with voice input.
 * Values write to UpdateMeContext so Best Path can shift its recommendation.
 */

export type PillKey = keyof UpdateMeLog;

export interface Pill {
  key: PillKey;
  label: string;
  bg: string; ring: string; fg: string;
  question: string;
  narration: string;
  unit?: string;
}

export const PILLS: Pill[] = [
  { key: "food",     label: "Food",     bg: "#DCFCE7", ring: "#86EFAC", fg: "#047857",
    question: "What did you have for breakfast?",
    narration: "Tell me what you had for breakfast. I'll flag anything that usually spikes you.",
  },
  { key: "weight",   label: "Weight",   bg: "#FEF3C7", ring: "#FDE68A", fg: "#B45309",
    question: "What's your weight this morning?", unit: "lbs",
    narration: "Weigh in and tell me the number. Just this morning's - we track the trend, not the day.",
  },
  { key: "activity", label: "Activity", bg: "#E0E7FF", ring: "#C7D2FE", fg: "#4338CA",
    question: "How much have you moved today?", unit: "min",
    narration: "How many minutes of walking or exercise so far? Any movement counts - even the stairs.",
  },
  { key: "sleep",    label: "Sleep",    bg: "#EDE9FE", ring: "#DDD6FE", fg: "#6D28D9",
    question: "How did you sleep last night?", unit: "hours",
    narration: "How many hours did you sleep last night? And how did it feel - restful or restless?",
  },
  { key: "water",    label: "Water",    bg: "#DBEAFE", ring: "#BFDBFE", fg: "#1D4ED8",
    question: "How many glasses of water so far?", unit: "glasses",
    narration: "Water check-in. How many glasses so far today? Coffee doesn't count.",
  },
  { key: "stress",   label: "Stress",   bg: "#FCE7F3", ring: "#FBCFE8", fg: "#BE185D",
    question: "How stressed do you feel right now?", unit: "1-5",
    narration: "On a scale of 1 to 5, how stressed do you feel right now? 1 is calm. 5 is overwhelmed.",
  },
];

/**
 * Extra pills that are logged from the Health Compass wedges but do NOT
 * appear in the main Update Me 6-pill grid.
 * Same shape / same CaptureModal — just a different launch surface.
 */
export const COMPASS_ONLY_PILLS: Pill[] = [
  { key: "glucose", label: "Glucose", bg: "#E0E7FF", ring: "#C7D2FE", fg: "#4338CA",
    question: "What's your reading right now?", unit: "mg/dL",
    narration: "Grab a finger stick or CGM reading. Just the number - Nu will fold it into your day.",
  },
  { key: "meds",    label: "Medication", bg: "#FEE2E2", ring: "#FECACA", fg: "#B91C1C",
    question: "How's today's dose going?",
    narration: "Did you take today's semaglutide - on time, late, skipped, or adjusted? Tap what fits.",
  },
];

export default function UpdateMe() {
  const { log, setValue } = useUpdateMe();
  const [active, setActive] = useState<PillKey | null>(null);

  // Count only the 6 Update Me pills toward the visible progress caption.
  // (Compass-logged fields like glucose/meds are surfaced elsewhere.)
  const loggedCount = PILLS.filter(p => log[p.key] !== undefined && log[p.key] !== "").length;
  const activePill = active ? PILLS.find(p => p.key === active) ?? null : null;

  function handleCapture(pill: Pill, value: string | number) {
    setValue(pill.key, value as never);
    setActive(null);
  }

  function displayValue(pill: Pill): string {
    const v = log[pill.key];
    if (v === undefined || v === "") return "";
    if (pill.key === "stress") return `${v}/5`;
    if (pill.key === "food")   return String(v).length > 14 ? String(v).slice(0, 12) + "…" : String(v);
    if (pill.key === "meds")   return String(v);
    return `${v} ${pill.unit ?? ""}`.trim();
  }

  return (
    <div className="space-y-6">
      {/* Update Me card with shaded gradient border */}
      <div className="rounded-2xl p-[3px] shadow-lg"
           style={{ background: "linear-gradient(135deg, #A78BFA 0%, #EC4A83 45%, #F59E0B 100%)" }}>
        <div className="rounded-[15px] bg-white p-6 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[13px] font-black uppercase tracking-[0.14em] text-indigo-700">Update me</div>
            <div className="text-[12px] font-bold text-slate-400">
              {loggedCount === 0 ? "Tap to log" : `${loggedCount} of 6 logged`}
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {PILLS.map(p => {
              const logged = log[p.key] !== undefined && log[p.key] !== "";
              return (
                <button
                  key={p.key}
                  onClick={() => setActive(p.key)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <span
                    className="relative w-16 h-16 rounded-full flex items-center justify-center transition group-hover:scale-105 shadow-sm"
                    style={{
                      background: p.bg,
                      outline: logged ? "3px solid #10B981" : `1px solid ${p.ring}`,
                      outlineOffset: logged ? "1px" : "0",
                    }}
                  >
                    <PillIcon kind={p.key} color={p.fg} />
                    {logged && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="4 12 10 18 20 6" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] font-black text-slate-800">{p.label}</span>
                  <span className={"text-[10px] font-black -mt-1 " + (logged ? "text-emerald-700" : "text-slate-400")}>
                    {logged ? displayValue(p) : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nu is listening bar */}
      <div className="rounded-2xl p-5 border shadow-sm flex items-center gap-4"
           style={{ background: "linear-gradient(90deg, #EEF2FF 0%, #F5F1FF 100%)", borderColor: "#E5DEFF" }}>
        <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow"
              style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
          </svg>
        </span>
        <div className="flex-1">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-0.5">Nu is listening</div>
          <div className="text-[14px] font-bold text-slate-800 leading-snug">
            {loggedCount === 0 && "Start with the easiest one. Weight, then water, then sleep. Three taps and I have enough to shape today."}
            {loggedCount > 0 && loggedCount < 3 && `Nice - ${loggedCount} in. One or two more and the picture gets clearer.`}
            {loggedCount >= 3 && loggedCount < 6 && "That's enough to work with. I'll fold this into today's plan. Log the rest if you want a fuller picture."}
            {loggedCount === 6 && "All six logged. I have the full picture. Today's plan is going to fit you exactly."}
          </div>
        </div>
      </div>

      {activePill && (
        <CaptureModal pill={activePill}
                      onCancel={() => setActive(null)}
                      onSave={(v) => handleCapture(activePill, v)} />
      )}
    </div>
  );
}

// ============================================================================
// Capture modal with voice input
// ============================================================================

export function CaptureModal({ pill, onCancel, onSave }:
  { pill: Pill; onCancel: () => void; onSave: (v: string | number) => void }) {

  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "heard" | "unsupported">("idle");
  const [transcript, setTranscript] = useState<string>("");
  const recRef = useRef<any>(null);

  // Nu narrates the question via speech synthesis when the modal opens.
  // Suppressed for demo via NU_VOICE_ENABLED kill-switch.
  useEffect(() => {
    if (!NU_VOICE_ENABLED) return;
    const utter = new SpeechSynthesisUtterance(pill.narration);
    utter.rate = 1.02;
    utter.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const pref = voices.find(v => /female|Samantha|Karen|Google US English/i.test(v.name)) ?? voices[0];
    if (pref) utter.voice = pref;
    try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(utter); } catch { /* ignore */ }
    return () => { try { window.speechSynthesis.cancel(); } catch {} };
  }, [pill.narration]);

  function startListening() {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setVoiceState("unsupported"); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const t: string = e.results?.[0]?.[0]?.transcript ?? "";
      setTranscript(t);
      setVoiceState("heard");
    };
    rec.onerror = () => setVoiceState("idle");
    rec.onend   = () => setVoiceState(prev => prev === "listening" ? "idle" : prev);
    rec.start();
    setVoiceState("listening");
    recRef.current = rec;
  }

  function stopListening() {
    try { recRef.current?.stop(); } catch {}
    setVoiceState("idle");
  }

  // Parse the transcript into a value the picker can use.
  function parseFromVoice(txt: string): string | number | null {
    const lower = txt.toLowerCase().trim();
    if (pill.key === "food") return txt.trim();
    if (pill.key === "meds") {
      if (/skip/.test(lower))                        return "Skipped";
      if (/late/.test(lower))                        return "Taken late";
      if (/adjust|different|changed/.test(lower))    return "Adjusted dose";
      if (/took|taken|yes|done|complete/.test(lower)) return "Taken on time";
      return null;
    }
    if (pill.key === "stress") {
      if (/(overwhelm|awful|terrible|worst)/i.test(lower)) return 5;
      if (/(stress|anxious|tense|bad)/i.test(lower))         return 4;
      if (/(okay|meh|neutral|fine)/i.test(lower))            return 3;
      if (/(good|calm|easy)/i.test(lower))                    return 2;
      if (/(great|amazing|peaceful|zen)/i.test(lower))       return 1;
      // fall through to digit extract
    }
    // Try to extract a number (with word forms)
    const num = wordsToNumber(lower);
    return num;
  }

  const parsed = transcript ? parseFromVoice(transcript) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(15,23,42,0.55)" }}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="p-6 flex items-center gap-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
               style={{ background: pill.bg, border: `1px solid ${pill.ring}` }}>
            <PillIcon kind={pill.key} color={pill.fg} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Nu asks</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{pill.question}</div>
          </div>
          <button onClick={onCancel} className="text-2xl text-slate-400 hover:text-slate-700 font-black leading-none">×</button>
        </div>

        <div className="px-6 py-3 bg-indigo-50/60 border-b border-slate-100">
          <div className="text-[12px] text-slate-700 font-medium italic leading-snug">
            &ldquo;{pill.narration}&rdquo;
          </div>
        </div>

        {/* Voice capture — hidden while NU_VOICE_ENABLED is off for the demo */}
        {NU_VOICE_ENABLED && (
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={voiceState === "listening" ? stopListening : startListening}
                className={"w-12 h-12 rounded-full flex items-center justify-center transition shadow " +
                  (voiceState === "listening"
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-indigo-600 hover:bg-indigo-700")}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" fillOpacity="0.15" />
                  <path d="M9 3v12a3 3 0 0 0 6 0V3" />
                  <path d="M6 12a6 6 0 0 0 12 0" />
                  <path d="M12 18v3" />
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {voiceState === "listening" ? "Listening…" :
                   voiceState === "heard"     ? "I heard" :
                   voiceState === "unsupported" ? "Voice not supported - tap a value below" :
                   "Speak your answer"}
                </div>
                <div className="text-[13px] font-bold text-slate-800 truncate">
                  {transcript || (voiceState === "listening" ? "…" : "e.g. one seventy-eight, or eight glasses")}
                </div>
                {parsed !== null && parsed !== "" && (
                  <div className="text-[10px] font-black text-emerald-700 mt-0.5">
                    Nu parsed: <span className="font-black">{typeof parsed === "number" ? parsed : `"${parsed}"`}</span>
                  </div>
                )}
              </div>
              {parsed !== null && parsed !== "" && (
                <button
                  onClick={() => onSave(parsed)}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider shadow">
                  Use this
                </button>
              )}
            </div>
          </div>
        )}

        {/* Manual value picker */}
        <div className="p-6">
          {NU_VOICE_ENABLED && (
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
              Or tap to enter manually
            </div>
          )}
          <ValuePicker pill={pill} onSave={onSave} />
          <button onClick={onCancel}
                  className="mt-3 w-full py-2 text-[12px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple word-to-number extractor for the voice flow ("one seventy-eight" -> 178, "seven and a half" -> 7.5)
function wordsToNumber(input: string): number | null {
  // First try to extract raw digits
  const digitMatch = input.match(/([\d]+(?:\.[\d]+)?)/);
  if (digitMatch) return Number(digitMatch[1]);

  const ones: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9,
  };
  const teens: Record<string, number> = {
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
    fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  };
  const tens: Record<string, number> = {
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  };

  const tokens = input.toLowerCase().replace(/[-,]/g, " ").split(/\s+/);
  let total = 0;
  let current = 0;
  let any = false;

  for (const tk of tokens) {
    if (tk === "hundred") { current = (current || 1) * 100; any = true; }
    else if (tk === "and") continue;
    else if (tk === "half") { current += 0.5; any = true; }
    else if (ones[tk] !== undefined) { current += ones[tk]; any = true; }
    else if (teens[tk] !== undefined) { current += teens[tk]; any = true; }
    else if (tens[tk] !== undefined) { current += tens[tk]; any = true; }
  }
  total += current;
  return any ? total : null;
}

function ValuePicker({ pill, onSave }: { pill: Pill; onSave: (v: string | number) => void }) {
  const [txt, setTxt] = useState("");
  const [num, setNum] = useState<number>(
    pill.key === "sleep" ? 7 : pill.key === "water" ? 3 : pill.key === "stress" ? 2 :
    pill.key === "weight" ? 178 : pill.key === "glucose" ? 140 : 20
  );

  if (pill.key === "food") {
    const chips = ["Eggs + toast", "Oatmeal + berries", "Dosa + eggs", "Yogurt + fruit", "Skipped"];
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          {chips.map(c => (
            <button key={c} onClick={() => onSave(c)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-[13px] font-bold text-slate-800 border border-slate-200 hover:border-emerald-300 transition">
              {c}
            </button>
          ))}
        </div>
        <input value={txt} onChange={e => setTxt(e.target.value)}
               placeholder="e.g. Two eggs and buttered toast"
               className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[14px] font-medium focus:outline-none focus:border-indigo-500" />
        <button disabled={!txt.trim()} onClick={() => onSave(txt.trim())}
                className={"mt-3 w-full py-3 rounded-xl text-white text-sm font-black uppercase tracking-wider transition " +
                  (txt.trim() ? "bg-indigo-600 hover:bg-indigo-700 shadow" : "bg-slate-300 cursor-not-allowed")}>
          Log it
        </button>
      </div>
    );
  }

  if (pill.key === "stress") {
    const faces: { v: number; face: string; label: string; color: string }[] = [
      { v: 1, face: "\u{1F60C}", label: "Calm",       color: "#047857" },
      { v: 2, face: "\u{1F642}", label: "Okay",       color: "#0891B2" },
      { v: 3, face: "\u{1F610}", label: "Neutral",    color: "#7C3AED" },
      { v: 4, face: "\u{1F627}", label: "Stressed",   color: "#B45309" },
      { v: 5, face: "\u{1F62B}", label: "Overwhelmed",color: "#B91C1C" },
    ];
    return (
      <div>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {faces.map(f => {
            const active = num === f.v;
            return (
              <button key={f.v} onClick={() => setNum(f.v)}
                      className={"flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition " +
                        (active ? "scale-105" : "border-transparent hover:bg-slate-50")}
                      style={active ? { borderColor: f.color, background: `${f.color}10` } : {}}>
                <span className="text-3xl leading-none">{f.face}</span>
                <span className="text-[10px] font-black tracking-wider" style={{ color: active ? f.color : "#64748B" }}>{f.label}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => onSave(num)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow">
          Log it
        </button>
      </div>
    );
  }

  // Medication — chip picker (no number, no free text).
  if (pill.key === "meds") {
    const chips: { label: string; color: string; bg: string; border: string }[] = [
      { label: "Taken on time",  color: "#047857", bg: "#ECFDF5", border: "#A7F3D0" },
      { label: "Taken late",     color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
      { label: "Adjusted dose",  color: "#4338CA", bg: "#EEF2FF", border: "#C7D2FE" },
      { label: "Skipped",        color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
    ];
    return (
      <div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {chips.map(c => (
            <button key={c.label} onClick={() => onSave(c.label)}
                    className="px-3 py-3 rounded-xl text-[13px] font-black text-left border-2 transition hover:brightness-95"
                    style={{ color: c.color, background: c.bg, borderColor: c.border }}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-slate-500 font-medium italic px-1 pt-1">
          Nu logs the choice and updates your medication timeline.
        </div>
      </div>
    );
  }

  // Glucose — numeric mg/dL picker with clinical-range defaults.
  const isGlucose = pill.key === "glucose";
  const step = pill.key === "weight" ? 0.5 : isGlucose ? 5 : 1;
  const min  = pill.key === "sleep" ? 3 : pill.key === "water" ? 0 : pill.key === "weight" ? 100 : isGlucose ? 40 : 0;
  const max  = pill.key === "weight" ? 400 : pill.key === "activity" ? 240 : pill.key === "sleep" ? 12 : isGlucose ? 400 : 15;
  return (
    <div>
      <div className="flex items-center justify-center gap-6 mb-4">
        <button onClick={() => setNum(v => Math.max(min, v - step))}
                className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl font-black text-slate-700">−</button>
        <div className="text-center">
          <div className="text-5xl font-black tabular-nums text-slate-900">{Number.isInteger(num) ? num : num.toFixed(1)}</div>
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">{pill.unit}</div>
        </div>
        <button onClick={() => setNum(v => Math.min(max, v + step))}
                className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl font-black text-slate-700">+</button>
      </div>
      <input type="range" min={min} max={max} step={step} value={num}
             onChange={e => setNum(Number(e.target.value))}
             className="w-full accent-indigo-600 mb-4" />
      <button onClick={() => onSave(num)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow">
        Log it
      </button>
    </div>
  );
}

function PillIcon({ kind, color }: { kind: PillKey; color: string }) {
  const p = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "food")     return (<svg {...p}><path d="M6 3v6M8 3v6M4 3v6M4 9h6M7 9v11" /><path d="M14 3v11M14 3l4 6-4 3" /></svg>);
  if (kind === "weight")   return (<svg {...p}><rect x="4" y="6" width="16" height="14" rx="2" /><circle cx="12" cy="13" r="3" /><path d="M12 10v2" /></svg>);
  if (kind === "activity") return (<svg {...p}><circle cx="13" cy="4" r="2" fill={color} /><path d="M5 22l4-8 4 5 4-4 3 6" /><path d="M13 6l-3 4 3 3 3-2" /></svg>);
  if (kind === "sleep")    return (<svg {...p}><path d="M20 15A8 8 0 1 1 9 4a5 5 0 0 0 11 11z" /></svg>);
  if (kind === "water")    return (<svg {...p}><path d="M7 4h10l-1 16H8L7 4z" /><path d="M7 4h10l-.4 6H7.4L7 4z" fill={color} opacity="0.35" /></svg>);
  if (kind === "glucose")  return (<svg {...p}><path d="M12 2c-4 5-6 8-6 12a6 6 0 0 0 12 0c0-4-2-7-6-12z" /><path d="M9 14a3 3 0 0 0 3 3" /></svg>);
  if (kind === "meds")     return (<svg {...p}><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)" /><path d="M9 15l6-6" /></svg>);
  return (<svg {...p}><circle cx="12" cy="12" r="9" /><line x1="8" y1="9" x2="10" y2="9" /><line x1="14" y1="9" x2="16" y2="9" /><path d="M8 16c1-2 3-2 4-2s3 0 4 2" /></svg>);
}
