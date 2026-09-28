import { useState } from "react";

/**
 * CravingLog - built-for-real component. Sally logs a craving in 4 quick taps,
 * Nu reads it back with a pattern-aware response, and the log accumulates.
 *
 * Real components have real state - the log persists during the session so
 * repeated cravings pile up and Nu can point out patterns.
 */

type Craving =
  | "sweets" | "salty" | "carbs" | "fast-food" | "alcohol" | "sugary-drinks";
type Trigger =
  | "stress" | "boredom" | "hunger" | "emotional" | "social" | "not-sure";
type Response =
  | "gave-in" | "distracted" | "small-portion" | "waited" | "walked-instead";

interface LogEntry {
  id: string;
  craving: Craving;
  intensity: number;   // 1-5
  trigger: Trigger;
  response: Response;
  loggedAt: string;    // e.g. "2:14 PM"
}

const CRAVINGS: { key: Craving; emoji: string; label: string }[] = [
  { key: "sweets",         emoji: "\u{1F370}", label: "Sweets"         },
  { key: "salty",          emoji: "\u{1F35F}", label: "Salty"          },
  { key: "carbs",          emoji: "\u{1F35E}", label: "Carbs"          },
  { key: "fast-food",      emoji: "\u{1F354}", label: "Fast food"      },
  { key: "alcohol",        emoji: "\u{1F377}", label: "Alcohol"        },
  { key: "sugary-drinks",  emoji: "\u{1F964}", label: "Sugary drinks"  },
];

const TRIGGERS: { key: Trigger; label: string; hint: string }[] = [
  { key: "stress",    label: "Stress",       hint: "Work / relationships / news" },
  { key: "boredom",   label: "Boredom",      hint: "Nothing else pulling me"     },
  { key: "hunger",    label: "Real hunger",  hint: "Haven't eaten in 4+ hours"   },
  { key: "emotional", label: "Emotional",    hint: "Sad / anxious / celebratory" },
  { key: "social",    label: "Social",       hint: "Someone else was eating it"  },
  { key: "not-sure",  label: "Not sure",     hint: "Just showed up"              },
];

const RESPONSES: { key: Response; label: string; emoji: string; positive: boolean }[] = [
  { key: "walked-instead", label: "Walked instead",  emoji: "\u{1F6B6}", positive: true  },
  { key: "waited",         label: "Waited it out",   emoji: "\u{23F3}",  positive: true  },
  { key: "distracted",     label: "Distracted",      emoji: "\u{1F4DA}", positive: true  },
  { key: "small-portion",  label: "Small portion",   emoji: "\u{1F944}", positive: true  },
  { key: "gave-in",        label: "Gave in",         emoji: "\u{1F614}", positive: false },
];

export default function CravingLog() {
  const [step, setStep]     = useState<1 | 2 | 3 | 4 | 5>(1);
  const [craving, setCraving]     = useState<Craving | null>(null);
  const [intensity, setIntensity] = useState<number>(3);
  const [trigger, setTrigger]     = useState<Trigger | null>(null);
  const [response, setResponse]   = useState<Response | null>(null);
  const [entries, setEntries]     = useState<LogEntry[]>(SEEDED_LOG);

  function save() {
    if (!craving || !trigger || !response) return;
    const entry: LogEntry = {
      id: `c-${Date.now()}`,
      craving, intensity, trigger, response,
      loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setEntries(prev => [entry, ...prev]);
    // Reset for next entry
    setStep(5);
  }

  function reset() {
    setCraving(null); setIntensity(3); setTrigger(null); setResponse(null); setStep(1);
  }

  const currentEntry: Partial<LogEntry> = { craving: craving ?? undefined, intensity, trigger: trigger ?? undefined, response: response ?? undefined };

  return (
    <div className="space-y-5">
      {/* Progress strip */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map(n => (
          <span key={n}
                className={"h-1.5 flex-1 rounded-full transition " +
                  (n < step  ? "bg-emerald-500" :
                   n === step ? "bg-indigo-500" : "bg-slate-200")} />
        ))}
      </div>

      {/* Steps */}
      {step === 1 && (
        <StepFrame
          eyebrow="Step 1 of 4"
          question="What are you craving?"
          hint="Pick the closest match - we can be specific in step two."
        >
          <div className="grid grid-cols-3 gap-2">
            {CRAVINGS.map(c => (
              <button key={c.key}
                      onClick={() => { setCraving(c.key); setStep(2); }}
                      className={"flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition " +
                        (craving === c.key ? "border-indigo-500 bg-indigo-50 scale-105" : "border-slate-200 bg-white hover:border-indigo-300")}>
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-[11px] font-black text-slate-800">{c.label}</span>
              </button>
            ))}
          </div>
        </StepFrame>
      )}

      {step === 2 && (
        <StepFrame
          eyebrow="Step 2 of 4"
          question="How strong is it?"
          hint="1 = just a whisper. 5 = can't focus on anything else."
        >
          <div className="grid grid-cols-5 gap-2 mb-3">
            {[1, 2, 3, 4, 5].map(n => {
              const active = intensity === n;
              return (
                <button key={n}
                        onClick={() => setIntensity(n)}
                        className={"py-4 rounded-xl border-2 text-2xl font-black tabular-nums transition " +
                          (active
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 scale-105"
                            : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300")}>
                  {n}
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-slate-500 font-medium text-center mb-4">
            {intensity <= 2 ? "Whisper - easy to redirect."
              : intensity === 3 ? "Steady - worth a distraction."
              : intensity === 4 ? "Strong - a plan helps here."
              : "Overwhelming - not your fault. Log it and use the response tool."}
          </div>
          <button onClick={() => setStep(3)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow">
            Continue &rarr;
          </button>
        </StepFrame>
      )}

      {step === 3 && (
        <StepFrame
          eyebrow="Step 3 of 4"
          question="What triggered it?"
          hint="Nu learns your triggers over time - this is the most valuable field."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TRIGGERS.map(t => (
              <button key={t.key}
                      onClick={() => { setTrigger(t.key); setStep(4); }}
                      className={"text-left p-3 rounded-xl border-2 transition " +
                        (trigger === t.key ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300")}>
                <div className="text-[13px] font-black text-slate-800">{t.label}</div>
                <div className="text-[10px] text-slate-500 font-medium">{t.hint}</div>
              </button>
            ))}
          </div>
        </StepFrame>
      )}

      {step === 4 && (
        <StepFrame
          eyebrow="Step 4 of 4"
          question="What did you do?"
          hint="Any answer is fine - no judgment. Nu uses this to spot what works for you."
        >
          <div className="space-y-2">
            {RESPONSES.map(r => (
              <button key={r.key}
                      onClick={() => { setResponse(r.key); }}
                      className={"w-full text-left p-3 rounded-xl border-2 transition flex items-center gap-3 " +
                        (response === r.key ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300")}>
                <span className="text-2xl">{r.emoji}</span>
                <span className="text-[13px] font-black text-slate-800 flex-1">{r.label}</span>
                {r.positive && <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">A win</span>}
              </button>
            ))}
          </div>
          <button onClick={save}
                  disabled={!response}
                  className={"mt-4 w-full py-3 rounded-xl text-white text-sm font-black uppercase tracking-wider shadow transition " +
                    (response ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-300 cursor-not-allowed")}>
            Log this craving
          </button>
        </StepFrame>
      )}

      {step === 5 && (
        <NuResponse entry={currentEntry as LogEntry} entries={entries} onReset={reset} />
      )}

      {/* Recent cravings - always visible except during the reflection step */}
      {step !== 5 && entries.length > 0 && (
        <RecentCravings entries={entries} />
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StepFrame({ eyebrow, question, hint, children }: { eyebrow: string; question: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 md:p-6">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-1">{eyebrow}</div>
      <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-1">{question}</h3>
      <p className="text-[12px] text-slate-500 font-medium mb-4">{hint}</p>
      {children}
    </div>
  );
}

function NuResponse({ entry, entries, onReset }:
  { entry: LogEntry; entries: LogEntry[]; onReset: () => void }) {
  const cravingLabel = CRAVINGS.find(c => c.key === entry.craving)?.label ?? "";
  const triggerLabel = TRIGGERS.find(t => t.key === entry.trigger)?.label ?? "";
  const responseLabel = RESPONSES.find(r => r.key === entry.response)?.label ?? "";
  const responseData = RESPONSES.find(r => r.key === entry.response);

  // Pattern detection: how often has this craving+trigger combo shown up before?
  const patternCount = entries.filter(e =>
    e.craving === entry.craving && e.trigger === entry.trigger
  ).length;

  return (
    <div className="rounded-2xl p-[3px] shadow-lg"
         style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #EC4A83 100%)" }}>
      <div className="rounded-[15px] bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow"
                style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4L18 8l-4 3 1 5-3-2.5L9 16l1-5-4-3 4.5-1z" />
            </svg>
          </span>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">Nu&apos;s read</div>
            <div className="text-lg font-black text-slate-900 leading-tight">Logged - here&apos;s what I see</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <MiniStat label="Craving" value={cravingLabel} />
          <MiniStat label="Intensity" value={`${entry.intensity}/5`} />
          <MiniStat label="Trigger" value={triggerLabel} />
          <MiniStat label="You" value={responseLabel} good={responseData?.positive} />
        </div>

        <div className="rounded-xl p-4 bg-indigo-50 border border-indigo-100 mb-3">
          <div className="text-[13px] text-slate-800 font-medium leading-relaxed">
            {generateNuMessage(entry, patternCount)}
          </div>
        </div>

        {patternCount >= 2 && (
          <div className="rounded-xl p-3 bg-amber-50 border border-amber-200 mb-3">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 mb-0.5">Pattern detected</div>
            <div className="text-[12px] text-slate-700 font-medium">
              This is the {ordinal(patternCount + 1)} time you&apos;ve logged <span className="font-black">{cravingLabel.toLowerCase()}</span> paired with <span className="font-black">{triggerLabel.toLowerCase()}</span>. I&apos;m starting to see your pattern.
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={onReset}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow">
            Log another
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg p-2 bg-slate-50 border border-slate-100">
      <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</div>
      <div className={"text-[12px] font-black leading-tight truncate " + (good ? "text-emerald-700" : "text-slate-800")}>{value}</div>
    </div>
  );
}

function RecentCravings({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700">Recent cravings</div>
        <div className="text-[10px] font-black text-slate-400">Last 7 days &middot; {entries.length} logged</div>
      </div>
      <div className="space-y-2">
        {entries.slice(0, 5).map(e => {
          const c = CRAVINGS.find(x => x.key === e.craving);
          const t = TRIGGERS.find(x => x.key === e.trigger);
          const r = RESPONSES.find(x => x.key === e.response);
          return (
            <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 bg-slate-50/40">
              <span className="text-xl">{c?.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-black text-slate-800">{c?.label} <span className="text-slate-400 font-medium">&middot; {e.intensity}/5</span></div>
                <div className="text-[10px] text-slate-500 font-medium">{t?.label} &rarr; {r?.label}</div>
              </div>
              <div className="text-[10px] font-black text-slate-400 tabular-nums">{e.loggedAt}</div>
              {r?.positive && (
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Nu response generator + helpers
// ============================================================================

function generateNuMessage(entry: LogEntry, patternCount: number): string {
  const responseData = RESPONSES.find(r => r.key === entry.response);
  const intensityWord = entry.intensity >= 4 ? "strong" : entry.intensity === 3 ? "steady" : "mild";

  // First line: acknowledge
  let ack: string;
  if (responseData?.positive) {
    ack = `That was a win. You caught a ${intensityWord} craving and redirected.`;
  } else {
    ack = `A ${intensityWord} craving with no support in the moment. That happens - the log itself is progress.`;
  }

  // Second line: trigger-specific insight
  const insight: Record<Trigger, string> = {
    stress:    "Stress cravings peak between 2 and 4 PM for most members. A protein snack at 3 shrinks the window.",
    boredom:   "Boredom cravings respond well to a two-minute walk. Movement gives the brain what it was actually looking for.",
    hunger:    "Real hunger means we should look at your last meal - protein-first tomorrow will lengthen your fullness window.",
    emotional: "Emotional cravings are honest signals - the craving isn't the problem, the feeling underneath is. Journal one line before you eat.",
    social:    "Social cravings are the hardest to fight. Nu tip: pre-plan your 'happy plate' before you walk into the gathering.",
    "not-sure": "That's okay. Log a few more and I'll start naming your triggers for you.",
  };

  // Third line: pattern note (only if 2+ same combo)
  let pattern = "";
  if (patternCount >= 2) {
    pattern = ` See the pattern card below - this is a recurring one.`;
  }

  return `${ack} ${insight[entry.trigger]}${pattern}`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ============================================================================
// Seeded prior log so the demo feels used
// ============================================================================

const SEEDED_LOG: LogEntry[] = [
  { id: "s1", craving: "sweets",         intensity: 4, trigger: "stress",    response: "walked-instead", loggedAt: "3:14 PM" },
  { id: "s2", craving: "sugary-drinks",  intensity: 3, trigger: "boredom",   response: "waited",         loggedAt: "Yesterday" },
  { id: "s3", craving: "sweets",         intensity: 5, trigger: "stress",    response: "small-portion",  loggedAt: "Mon" },
  { id: "s4", craving: "fast-food",      intensity: 3, trigger: "social",    response: "distracted",     loggedAt: "Sun" },
];
