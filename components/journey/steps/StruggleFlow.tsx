import { useEffect, useMemo, useRef, useState } from "react";
import { NU_VOICE_ENABLED } from "../../../lib/nuSpeech";

/**
 * StruggleFlow - Nu's adaptive care flow, per user spec.
 * Nine sequential screens that turn "I'm struggling" into an adapted plan in ~30-60s.
 *
 *   1. Acknowledge
 *   2. Review what Nu already knows  (auto-progress)
 *   3. Best-guess reasons (7 tiles)
 *   4. One follow-up question (context-aware)
 *   5. Journey Twin updates (confidence/momentum/risk animation)
 *   6. Adapt Today's Best Path
 *   7. Explain why
 *   8. Escalate if high-risk
 *   9. Commit ("I'm all in" / "Another option")
 */

interface Props {
  onClose: (result: "committed" | "another" | "cancelled") => void;
}

type StepKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface ReasonOpt {
  key: string;
  label: string;
  emoji: string;
  color: string;
  followUp: { question: string; options: string[] };
  adapted: { reduce: string; add: string; skip: string };
  why: string;
  escalate: boolean;  // true = notify coach + workflow
}

const REASONS: ReasonOpt[] = [
  { key: "hungry",       label: "I'm hungry all the time",         emoji: "\u{1F35A}", color: "#F59E0B",
    followUp: { question: "How strong is the hunger today?", options: ["Manageable", "Distracting", "Overwhelming"] },
    adapted: { reduce: "Reduce today's walk from 45 min to 20 min", add: "Add a protein snack at 3 PM", skip: "Delay food logging until after lunch" },
    why: "Members who feel constant hunger stay on track by adding small protein snacks and dialing back movement volume until appetite settles.",
    escalate: false,
  },
  { key: "nausea",       label: "My medication is making me nauseous", emoji: "\u{1F912}", color: "#EC4A83",
    followUp: { question: "When did the nausea start?", options: ["This morning", "Yesterday", "Past few days", "Ongoing"] },
    adapted: { reduce: "Reduce today's walk from 45 min to 20 min", add: "Switch to smaller meals every 3 hours", skip: "Skip protein-heavy dinner tonight" },
    why: "Members who feel nauseous often stay on track by eating smaller meals and walking later, when the medication peak has passed.",
    escalate: true,
  },
  { key: "tired",        label: "I'm too tired",                     emoji: "\u{1F634}", color: "#6B5CE0",
    followUp: { question: "How did you sleep last night?", options: ["Under 5 hours", "5-6 hours", "6-7 hours", "Fine, but drained"] },
    adapted: { reduce: "Cut walk to 10 min - keep the streak alive", add: "Add hydration goal: 4 more glasses", skip: "Skip breakfast log - just log dinner" },
    why: "Members with low energy protect their streak with a very short walk and generous hydration. Momentum, not intensity.",
    escalate: false,
  },
  { key: "notime",       label: "I don't have time",                 emoji: "\u{23F1}",  color: "#4F5FE5",
    followUp: { question: "What's eating your day?", options: ["Work meetings", "Family / kids", "Travel", "Errands"] },
    adapted: { reduce: "Walk in 3 five-min chunks throughout the day", add: "Add 2 stair-only breaks", skip: "Skip food logging today - Nu will estimate" },
    why: "Busy-day Sallys who split movement into micro-walks keep their glucose stable and don't fall behind.",
    escalate: false,
  },
  { key: "motivation",   label: "I lost motivation",                 emoji: "\u{1F613}", color: "#EF5C3E",
    followUp: { question: "Did something happen yesterday?", options: ["Bad numbers", "Family friction", "Work stress", "Nothing specific"] },
    adapted: { reduce: "Replace walk with a 5-min stretch you enjoy", add: "One text to a challenge partner", skip: "No self-tracking today - Nu will handle it" },
    why: "Motivation dips reset fastest when the plan is tiny and social. One tiny win plus one text keeps the loop alive.",
    escalate: false,
  },
  { key: "badglucose",   label: "I had a bad glucose day",            emoji: "\u{1F4C9}", color: "#38BDF8",
    followUp: { question: "What do you think caused it?", options: ["Meal I ate", "Missed medication", "Stress", "Not sure"] },
    adapted: { reduce: "Skip today's harder plan - Steady & Simple only", add: "Add water + short post-lunch walk", skip: "Delay Best Path decisions until dinner" },
    why: "Bad glucose days call for regression to the mean - lower the ambition, focus on 3 basics, let tomorrow reset.",
    escalate: false,
  },
  { key: "other",        label: "Something else",                     emoji: "\u{2753}",  color: "#8B7EE0",
    followUp: { question: "Tell me a bit more.", options: ["Physical symptom", "Emotional", "External event", "I'd rather skip"] },
    adapted: { reduce: "Reduce today's walk to 15 min", add: "Add one gentle hydration goal", skip: "Skip all optional logs" },
    why: "When we don't know the trigger, Nu keeps the plan tiny and predictable so the day still ends in a win.",
    escalate: false,
  },
];

const KNOWN_SOURCES = [
  { label: "CGM data",             icon: "\u{1F4C8}" },
  { label: "Activity & walking",   icon: "\u{1F6B6}" },
  { label: "Food logging",         icon: "\u{1F374}" },
  { label: "Medication adherence", icon: "\u{1F48A}" },
  { label: "Sleep",                icon: "\u{1F319}" },
  { label: "Weight trend",         icon: "\u{2696}"  },
  { label: "Previous conversations", icon: "\u{1F4AC}" },
  { label: "Today's Best Path",    icon: "\u{1F9ED}" },
];

export default function StruggleFlow({ onClose }: Props) {
  const [step, setStep] = useState<StepKey>(1);
  const [reason, setReason] = useState<ReasonOpt | null>(null);
  const [followUp, setFollowUp] = useState<string | null>(null);
  const speech = useRef<{ cancel: () => void } | null>(null);

  // Nu narrates each step. Suppressed for demo via NU_VOICE_ENABLED kill-switch.
  useEffect(() => {
    if (!NU_VOICE_ENABLED) return;
    const line = narrationForStep(step, reason);
    if (!line) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(line);
      utter.rate = 1.02; utter.pitch = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const pref = voices.find(v => /female|Samantha|Karen|Google US English/i.test(v.name)) ?? voices[0];
      if (pref) utter.voice = pref;
      window.speechSynthesis.speak(utter);
      speech.current = { cancel: () => window.speechSynthesis.cancel() };
    } catch {}
    return () => { try { window.speechSynthesis.cancel(); } catch {} };
  }, [step, reason]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
         style={{ background: "rgba(15,23,42,0.65)" }}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <Header step={step} onClose={() => onClose("cancelled")} />
        {step === 1 && <Step1_Acknowledge onNext={() => setStep(2)} />}
        {step === 2 && <Step2_Review onNext={() => setStep(3)} />}
        {step === 3 && <Step3_Reasons onPick={(r) => { setReason(r); setStep(4); }} />}
        {step === 4 && reason && <Step4_FollowUp reason={reason} onPick={(a) => { setFollowUp(a); setStep(5); }} />}
        {step === 5 && reason && <Step5_TwinUpdate reason={reason} onNext={() => setStep(6)} />}
        {step === 6 && reason && <Step6_Adapt reason={reason} onNext={() => setStep(7)} />}
        {step === 7 && reason && <Step7_Why reason={reason} onNext={() => setStep(reason.escalate ? 8 : 9)} />}
        {step === 8 && reason && <Step8_Escalate reason={reason} onNext={() => setStep(9)} />}
        {step === 9 && reason && <Step9_Commit reason={reason} followUp={followUp}
                                              onCommit={() => onClose("committed")}
                                              onAnother={() => onClose("another")} />}
      </div>
    </div>
  );
}

// ============================================================================
// Header - Nu avatar + step indicator
// ============================================================================

function Header({ step, onClose }: { step: StepKey; onClose: () => void }) {
  return (
    <div className="p-5 flex items-center gap-3 border-b border-slate-100"
         style={{ background: "linear-gradient(90deg, #EEF2FF 0%, #F5F1FF 100%)" }}>
      <img src="/journey/ppt/nu_avatar.png" alt="Nu" className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm" />
      <div className="flex-1">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">Nu is with you</div>
        <div className="text-sm font-black text-slate-900">A moment to reset - about 30 seconds</div>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <span key={n}
                className={"w-2 h-2 rounded-full transition " +
                  (n < step ? "bg-emerald-500" : n === step ? "bg-indigo-600 scale-125" : "bg-slate-200")} />
        ))}
      </div>
      <button onClick={onClose}
              className="ml-2 text-2xl text-slate-400 hover:text-slate-700 font-black leading-none">×</button>
    </div>
  );
}

// ============================================================================
// Step 1 - Acknowledge
// ============================================================================

function Step1_Acknowledge({ onNext }: { onNext: () => void }) {
  useEffect(() => { const t = setTimeout(onNext, 3500); return () => clearTimeout(t); }, [onNext]);
  return (
    <div className="p-8 md:p-10 text-center">
      {/* Same face Sally just tapped on the Morning Check-in "Struggling" tile */}
      <div className="text-6xl mb-4">&#128532;</div>
      <div className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-3 leading-tight">
        I&apos;m glad you told me.
      </div>
      <div className="text-lg text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
        Let&apos;s figure out what&apos;s getting in your way. This will be quick.
      </div>
      <button onClick={onNext}
              className="mt-8 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-indigo-200">
        Continue &rarr;
      </button>
    </div>
  );
}

// ============================================================================
// Step 2 - Nu reviews (auto-advances)
// ============================================================================

function Step2_Review({ onNext }: { onNext: () => void }) {
  const [checked, setChecked] = useState(0);
  // Snappier: 140ms per tick (8 sources = 1.1s), then stop the interval,
  // then advance to Step 3 after a short pause so Nu can narrate the insight card.
  useEffect(() => {
    const target = KNOWN_SOURCES.length; // 8
    const id = setInterval(() => {
      setChecked(v => {
        if (v >= target) { clearInterval(id); return v; }
        return v + 1;
      });
    }, 140);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    // Once we've checked everything, wait 700ms for the "Nu noticed" card to be read, then advance.
    if (checked >= KNOWN_SOURCES.length) {
      const t = setTimeout(onNext, 900);
      return () => clearTimeout(t);
    }
  }, [checked, onNext]);

  return (
    <div className="p-6 md:p-8">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-2">Before I ask</div>
      <div className="text-xl font-black text-slate-900 mb-1">Let me check what I already know&hellip;</div>
      <div className="text-[13px] text-slate-500 font-medium mb-5">
        Nu reviews eight sources so we skip the small talk.
      </div>
      <div className="grid grid-cols-2 gap-2">
        {KNOWN_SOURCES.map((src, i) => (
          <div key={src.label}
               className={"flex items-center gap-2 px-3 py-2 rounded-lg border transition " +
                 (i < checked ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50 opacity-40")}>
            <span className="text-lg">{src.icon}</span>
            <span className="text-[12px] font-bold text-slate-800 flex-1">{src.label}</span>
            {i < checked && <span className="text-emerald-600 text-sm">&#10003;</span>}
          </div>
        ))}
      </div>
      {/* Longitudinal pattern insight - the differentiator */}
      {checked >= KNOWN_SOURCES.length && (
        <div className="mt-4 p-4 rounded-xl border shadow-sm animate-fadein"
             style={{ background: "linear-gradient(135deg, #F5F1FF 0%, #FFF1F5 100%)", borderColor: "#DDD6FE" }}>
          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700 mb-1">&#9728; Nu noticed</div>
          <div className="text-[13px] font-bold text-slate-800 leading-snug">
            This is the third Tuesday in a row you&apos;ve reported struggling after work.
            Evenings may be your hardest time.
          </div>
        </div>
      )}
      <style jsx>{`
        .animate-fadein { animation: fadein 260ms ease-out; }
        @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ============================================================================
// Step 3 - Best guess reasons
// ============================================================================

function Step3_Reasons({ onPick }: { onPick: (r: ReasonOpt) => void }) {
  return (
    <div className="p-6 md:p-8">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">Nu&apos;s best guess</div>
      <div className="text-xl font-black text-slate-900 mb-1">Does one of these fit today?</div>
      <div className="text-[13px] text-slate-500 font-medium mb-4">Tap the closest one - we can always change it.</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {REASONS.map(r => (
          <button key={r.key} onClick={() => onPick(r)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-300 hover:shadow-md transition text-left">
            <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl"
                  style={{ background: r.color + "22" }}>
              {r.emoji}
            </span>
            <span className="text-[14px] font-bold text-slate-800 flex-1">{r.label}</span>
            <span className="text-slate-300 group-hover:text-indigo-500 text-sm">&rarr;</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Step 4 - Follow-up
// ============================================================================

function Step4_FollowUp({ reason, onPick }: { reason: ReasonOpt; onPick: (a: string) => void }) {
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-xl"
              style={{ background: reason.color + "22" }}>
          {reason.emoji}
        </span>
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">You said</div>
          <div className="text-[14px] font-black text-slate-800">{reason.label}</div>
        </div>
      </div>
      <div className="text-xl font-black text-slate-900 mb-4">{reason.followUp.question}</div>
      <div className="space-y-2">
        {reason.followUp.options.map(opt => (
          <button key={opt} onClick={() => onPick(opt)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/60 text-[14px] font-bold text-slate-800 transition">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Step 5 - Journey Twin updates
// ============================================================================

function Step5_TwinUpdate({ reason, onNext }: { reason: ReasonOpt; onNext: () => void }) {
  const targets = useMemo(() => {
    const isSevere = reason.escalate || reason.key === "tired" || reason.key === "motivation";
    return {
      confBefore: 82, confAfter: isSevere ? 68 : 74,
      momBefore: 78,  momAfter: isSevere ? 74 : 76,
      riskBefore: 12, riskAfter: isSevere ? 34 : 22,
    };
  }, [reason]);

  const [c, setC] = useState(targets.confBefore);
  const [m, setM] = useState(targets.momBefore);
  const [r, setR] = useState(targets.riskBefore);

  useEffect(() => {
    let t = 0;
    const total = 24;
    const id = setInterval(() => {
      t++;
      const frac = t / total;
      setC(Math.round(targets.confBefore + (targets.confAfter - targets.confBefore) * frac));
      setM(Math.round(targets.momBefore + (targets.momAfter - targets.momBefore) * frac));
      setR(Math.round(targets.riskBefore + (targets.riskAfter - targets.riskBefore) * frac));
      if (t >= total) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [targets]);

  useEffect(() => { const t = setTimeout(onNext, 2400); return () => clearTimeout(t); }, [onNext]);

  return (
    <div className="p-6 md:p-8">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">Updating your Journey Twin</div>
      <div className="text-xl font-black text-slate-900 mb-4">Nu is recalculating&hellip;</div>
      <div className="grid grid-cols-3 gap-3">
        <TwinStat label="Prediction confidence" before={targets.confBefore} after={c} unit="%" tone="indigo" />
        <TwinStat label="Momentum score"         before={targets.momBefore}  after={m} unit=""  tone="emerald" />
        <TwinStat label="Dropoff risk"           before={targets.riskBefore} after={r} unit="%" tone="rose" inverted />
      </div>
    </div>
  );
}

function TwinStat({ label, before, after, unit, tone, inverted }:
  { label: string; before: number; after: number; unit: string; tone: "indigo" | "emerald" | "rose"; inverted?: boolean }) {
  const tint = { indigo: "#EEF2FF", emerald: "#ECFDF5", rose: "#FEF2F2" }[tone];
  const fg   = { indigo: "#4F46E5", emerald: "#047857", rose: "#B91C1C" }[tone];
  const improved = inverted ? after < before : after > before;
  return (
    <div className="rounded-xl p-3 border shadow-sm" style={{ background: tint, borderColor: fg + "33" }}>
      <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: fg }}>{label}</div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-black tabular-nums" style={{ color: fg }}>{after}{unit}</span>
        <span className="text-[10px] text-slate-400 line-through">{before}{unit}</span>
      </div>
      <div className="text-[10px] font-black uppercase tracking-wider mt-0.5"
           style={{ color: improved ? "#047857" : "#B45309" }}>
        {improved ? "↓ easier" : "↑ harder"}
      </div>
    </div>
  );
}

// ============================================================================
// Step 6 - Adapt Best Path
// ============================================================================

function Step6_Adapt({ reason, onNext }: { reason: ReasonOpt; onNext: () => void }) {
  return (
    <div className="p-6 md:p-8">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">Let&apos;s make today easier</div>
      <div className="text-xl font-black text-slate-900 mb-5">Today&apos;s Best Path - adapted for you</div>
      <div className="space-y-3">
        <AdaptRow icon="🔽" label={reason.adapted.reduce} tint="#EEF2FF" />
        <AdaptRow icon="➕" label={reason.adapted.add}    tint="#ECFDF5" />
        <AdaptRow icon="⏸️" label={reason.adapted.skip}   tint="#FEF3C7" />
      </div>
      <button onClick={onNext}
              className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow">
        Continue &rarr;
      </button>
    </div>
  );
}

function AdaptRow({ icon, label, tint }: { icon: string; label: string; tint: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100" style={{ background: tint }}>
      <span className="text-xl">{icon}</span>
      <span className="text-[14px] font-bold text-slate-800 leading-snug">{label}</span>
    </div>
  );
}

// ============================================================================
// Step 7 - Why
// ============================================================================

function Step7_Why({ reason, onNext }: { reason: ReasonOpt; onNext: () => void }) {
  return (
    <div className="p-6 md:p-8">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">Why this works</div>
      <div className="text-xl font-black text-slate-900 mb-4">Here&apos;s the reasoning</div>
      <div className="rounded-2xl p-5 border shadow-sm" style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #F5F1FF 100%)", borderColor: "#DDD6FE" }}>
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow"
                style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12v3h8v-3a7 7 0 0 0-4-12z" />
            </svg>
          </span>
          <div className="text-[14px] font-medium text-slate-800 leading-relaxed">
            {reason.why}
          </div>
        </div>
      </div>
      <button onClick={onNext}
              className="mt-5 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow">
        {reason.escalate ? "See what Nu is doing behind the scenes" : "One more step"} &rarr;
      </button>
    </div>
  );
}

// ============================================================================
// Step 8 - Escalate (only when reason.escalate === true)
// ============================================================================

function Step8_Escalate({ reason, onNext }: { reason: ReasonOpt; onNext: () => void }) {
  return (
    <div className="p-6 md:p-8">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-700 mb-1">Behind the scenes</div>
      <div className="text-xl font-black text-slate-900 mb-4">Nu is looking out for you</div>
      <div className="space-y-2">
        <EscalateRow icon="👤" color="#4F46E5" label="Coach Maya notified"     sub="She'll check in with you before 2 PM" />
        <EscalateRow icon="💊" color="#EC4A83" label="Medication side-effect workflow triggered" sub="Nausea log entry added to your record" />
        <EscalateRow icon="📋" color="#0891B2" label="Physician message queued" sub="Sent to Dr. Adams if nausea persists 48 hours more" />
      </div>
      <div className="mt-5 rounded-xl p-4 bg-slate-50 border border-slate-100 text-[12px] text-slate-600 font-medium leading-snug">
        You don&apos;t need to do anything. This is just a heads-up that your team knows.
      </div>
      <button onClick={onNext}
              className="mt-5 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow">
        Continue &rarr;
      </button>
    </div>
  );
}

function EscalateRow({ icon, color, label, sub }: { icon: string; color: string; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
      <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: color + "22" }}>
        <span className="text-lg">{icon}</span>
      </span>
      <div className="flex-1">
        <div className="text-[13px] font-black text-slate-800">{label}</div>
        <div className="text-[11px] text-slate-500 font-medium">{sub}</div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
        Done
      </span>
    </div>
  );
}

// ============================================================================
// Step 9 - Commit
// ============================================================================

function Step9_Commit({ reason, followUp, onCommit, onAnother }:
  { reason: ReasonOpt; followUp: string | null; onCommit: () => void; onAnother: () => void }) {
  return (
    <div className="p-6 md:p-8">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 mb-1">You&apos;re ready</div>
      <div className="text-2xl font-black text-slate-900 mb-4">Today&apos;s updated Best Path</div>
      <div className="rounded-2xl border shadow-sm p-4 mb-5" style={{ background: "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)", borderColor: "#A7F3D0" }}>
        <ul className="space-y-2">
          <CommitRow text={reason.adapted.reduce} />
          <CommitRow text={reason.adapted.add} />
          <CommitRow text={reason.adapted.skip} />
        </ul>
        {followUp && (
          <div className="mt-3 text-[11px] text-slate-500 font-medium">
            Anchored to your answer: <span className="font-black text-slate-700">&ldquo;{followUp}&rdquo;</span>
          </div>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <button onClick={onCommit}
                className="flex-1 py-3 rounded-xl text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-200 transition hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #10B981 0%, #047857 100%)" }}>
          &#10003; I&apos;m all in
        </button>
        <button onClick={onAnother}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-black uppercase tracking-wider">
          I&apos;d like another option
        </button>
      </div>
    </div>
  );
}

function CommitRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <svg className="w-3 h-3 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 12 10 18 20 6" />
        </svg>
      </span>
      <span className="text-[14px] font-bold text-slate-800 leading-snug">{text}</span>
    </li>
  );
}

// ============================================================================
// Narration
// ============================================================================

function narrationForStep(step: StepKey, reason: ReasonOpt | null): string {
  switch (step) {
    case 1: return "I'm glad you told me. Let's figure out what's getting in your way.";
    case 2: return "Give me a moment. Let me check what I already know.";
    case 3: return "It looks like one of these may be causing today's struggle. Tap the closest one.";
    case 4: return reason?.followUp.question ?? "";
    case 5: return "Updating your Journey Twin. This changes today's plan a little.";
    case 6: return "Let's make today easier.";
    case 7: return "Here's why this shift works.";
    case 8: return "I'm looking out for you. Coach Maya knows.";
    case 9: return "Today's updated plan. Ready when you are.";
    default: return "";
  }
}
