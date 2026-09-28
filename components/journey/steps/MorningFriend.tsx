import { useEffect, useState } from "react";
import ShadedCard from "../ShadedCard";
import StruggleFlow from "./StruggleFlow";

type Mood = "good" | "okay" | "struggling";

interface Props {
  onMood: (m: Mood) => void;
  selectedMood: Mood | null;
}

const MOODS: { id: Mood; face: string; label: string; bg: string; ring: string; fg: string }[] = [
  { id: "good",       face: "\u{1F60A}", label: "Good",       bg: "#DCFCE7", ring: "#22C55E", fg: "#166534" },
  { id: "okay",       face: "\u{1F610}", label: "Okay",       bg: "#FEF3C7", ring: "#F59E0B", fg: "#92400E" },
  { id: "struggling", face: "\u{1F614}", label: "Struggling", bg: "#FFE4E6", ring: "#F43F5E", fg: "#9F1239" },
];

export default function MorningFriend({ onMood, selectedMood }: Props) {
  const [struggleOpen, setStruggleOpen] = useState(false);
  const [adaptedAcknowledged, setAdaptedAcknowledged] = useState(false);

  useEffect(() => {
    if (selectedMood === "struggling" && !adaptedAcknowledged) setStruggleOpen(true);
    if (selectedMood !== "struggling") setAdaptedAcknowledged(false);
  }, [selectedMood, adaptedAcknowledged]);

  return (
    <div className="grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
      {/* Left: headline column */}
      <div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-5">
          Good morning, Sally.
        </h1>
        <p className="text-[16px] md:text-[17px] text-slate-700 leading-relaxed max-w-xl mb-5">
          It&apos;s 10 AM on a Monday. Before we look at anything else, Nu wants to know how you&apos;re
          feeling this morning.
        </p>
        <div className="inline-flex items-start gap-2 max-w-md">
          <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#EEF2FF" }}>
            <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4L18 8l-4 3 1 5-3-2.5L9 16l1-5-4-3 4.5-1z" />
            </svg>
          </span>
          <span className="text-[13px] text-slate-500 font-medium leading-snug">
            Tap the mood that fits. The rest of today shapes itself around it.
          </span>
        </div>
      </div>

      {/* Right: Nu\u2019s morning check-in card */}
      <ShadedCard tone="violet" padding="p-6 md:p-7">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-1">
          Monday &middot; 10 AM
        </div>
        <div className="text-2xl font-black text-slate-900 mb-1">Good morning, Sally.</div>
        <div className="text-[13px] text-slate-500 font-medium mb-6">Small steps today. Big wins tomorrow.</div>

        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3">
          How are you feeling?
        </div>
        <div className="grid grid-cols-3 gap-3">
          {MOODS.map(m => {
            const active = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onMood(m.id)}
                className={"flex flex-col items-center gap-2 p-4 rounded-2xl transition border-2 " +
                  (active ? "scale-[1.03] shadow-md" : "border-transparent hover:scale-[1.02]")}
                style={{
                  background: m.bg,
                  borderColor: active ? m.ring : "transparent",
                }}
              >
                <span className="text-4xl leading-none">{m.face}</span>
                <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: m.fg }}>{m.label}</span>
              </button>
            );
          })}
        </div>

        {selectedMood && selectedMood !== "struggling" && (
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
            Nu adjusted the rest of your day
          </div>
        )}
        {selectedMood === "struggling" && adaptedAcknowledged && (
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black uppercase tracking-wider">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-4.5-7-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19 10c0 6.5-7 11-7 11z" />
            </svg>
            Nu adapted today&apos;s plan for you
            <button onClick={() => setStruggleOpen(true)} className="ml-2 underline">Review</button>
          </div>
        )}
      </ShadedCard>

      {struggleOpen && (
        <StruggleFlow onClose={(result) => {
          setStruggleOpen(false);
          if (result === "committed" || result === "another") setAdaptedAcknowledged(true);
        }} />
      )}
    </div>
  );
}
