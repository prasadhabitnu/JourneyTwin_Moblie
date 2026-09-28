import { useState } from "react";
import { MI_PLAYBOOKS, OARS } from "../../../lib/behavioralPlaybook";
import { RING_BANDS, RING_PANEL, type RingBand } from "../../../lib/coachData";

/**
 * BehavioralPlaybook — MI + reflective-listening playbook for Maya,
 * organized by member NHI band. Sits inside the /coach journey.
 */
export default function BehavioralPlaybook() {
  const [band, setBand] = useState<RingBand>("watch");
  const play = MI_PLAYBOOKS[band];
  const meta = RING_BANDS[band];
  const membersInBand = RING_PANEL.filter(m => m.band === band).length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-24 space-y-4">
      {/* Intro card */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #C7D2FE" }}>
        <div className="px-4 py-3" style={{ background: "linear-gradient(90deg,#4F5FE5,#7C3AED)" }}>
          <div className="text-[9px] font-black uppercase tracking-widest text-white/85">Motivational Interviewing playbook</div>
          <div className="text-[20px] font-black text-white leading-tight" style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
            Meet the member where they are. Then walk with them.
          </div>
        </div>
        <div className="px-4 py-3 bg-white text-[12px] text-slate-700 leading-relaxed">
          MI is <span className="font-black">not a script</span> — it's a stance. You resist the urge to fix, elicit change talk from the member, roll with resistance,
          and use reflections instead of directives. This playbook translates the stance into practical prompts, keyed to where the member is on their Nu Health Index.
        </div>
      </div>

      {/* OARS scaffold */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-2">OARS · the 4 micro-skills</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {OARS.map(o => (
            <div key={o.letter} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg grid place-items-center text-[16px] font-black text-white shadow"
                     style={{ background: "linear-gradient(135deg,#4F5FE5,#7C3AED)" }}>
                  {o.letter}
                </div>
                <div className="text-[12px] font-black text-slate-900">{o.name}</div>
              </div>
              <div className="text-[10px] text-slate-600 leading-snug mb-1.5">{o.body}</div>
              <div className="text-[9px] italic text-indigo-700 leading-snug">
                <span className="font-black uppercase tracking-widest text-[8px] not-italic">Ex:</span> {o.example}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Band picker */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Playbook for member band</div>
        <div className="grid grid-cols-5 gap-1.5">
          {(["care","recover","watch","steady","excellent"] as RingBand[]).map(b => {
            const m = RING_BANDS[b];
            const active = b === band;
            const count = RING_PANEL.filter(r => r.band === b).length;
            return (
              <button key={b} onClick={() => setBand(b)}
                      className="rounded-xl px-2 py-2 text-left transition"
                      style={active
                        ? { background: m.tint, border: `2px solid ${m.fg}` }
                        : { background: "white", border: "1px solid #E2E8F0" }}>
                <div className="text-[8px] font-black uppercase tracking-widest" style={{ color: active ? m.fg : "#94A3B8" }}>
                  {m.label}
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[15px] font-black tabular-nums" style={{ color: active ? m.fg : "#334155" }}>{count}</span>
                  <span className="text-[8px] font-black text-slate-500">members</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stance card — big and colored */}
      <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ background: meta.tint + "88", borderColor: meta.fg }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl grid place-items-center text-white font-black text-[12px] shrink-0"
               style={{ background: meta.fg }}>
            {meta.label.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: meta.fg }}>Coach stance · {meta.label} band · {membersInBand} of your members</div>
            <div className="text-[16px] font-black text-slate-900 leading-tight mt-0.5" style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
              {play.stance}
            </div>
          </div>
        </div>
      </div>

      {/* Content grid — 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Opening questions */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-indigo-700 mb-1.5">Opening questions</div>
          <div className="text-[12px] text-slate-500 mb-2 italic">Start the conversation. Open-ended. Not yes/no.</div>
          <ul className="space-y-2">
            {play.openingQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-slate-800 leading-snug">
                <span className="text-indigo-500 font-black shrink-0">Q{i + 1}</span>
                <span className="italic">"{q}"</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Change talk elicitation */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mb-1.5">Change talk · elicitation</div>
          <div className="text-[12px] text-slate-500 mb-2 italic">Draw the member's own reasons for change to the surface. Never argue for it.</div>
          <ul className="space-y-2">
            {play.changeTalk.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-slate-800 leading-snug">
                <span className="text-emerald-600 font-black shrink-0">→</span>
                <span className="italic">"{c}"</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Reflection scripts — full width */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
        <div className="text-[9px] font-black uppercase tracking-widest text-violet-700 mb-1.5">Reflection scripts</div>
        <div className="text-[12px] text-slate-500 mb-3 italic">
          Simple = repeat/rephrase. Complex = name the meaning underneath. Double-sided = hold the ambivalence.
        </div>
        <div className="space-y-3">
          {play.reflections.map((r, i) => (
            <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-3" style={{ background: "#F8FAFC" }}>
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Sally says</div>
                  <div className="text-[12px] text-slate-800 italic leading-snug">"{r.memberSays}"</div>
                </div>
                <div className="p-3" style={{ background: "#F5F3FF", borderLeft: "1px solid #E9D5FF" }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="text-[8px] font-black uppercase tracking-widest text-violet-700">Maya reflects</div>
                    <span className="text-[7px] font-black uppercase tracking-widest px-1 rounded"
                          style={{ background: r.kind === "simple" ? "#DBEAFE" : r.kind === "complex" ? "#F3E8FF" : "#FEF3C7",
                                   color:      r.kind === "simple" ? "#1E40AF" : r.kind === "complex" ? "#6B21A8" : "#92400E" }}>
                      {r.kind.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[12px] text-slate-900 font-black italic leading-snug">"{r.mayaReflects}"</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rolling with resistance + language swaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-rose-700 mb-1.5">Rolling with resistance</div>
          <div className="text-[12px] text-slate-500 mb-2 italic">Never argue. Reflect the resistance back with respect, then invite forward.</div>
          <div className="space-y-2.5">
            {play.resistance.map((r, i) => (
              <div key={i} className="text-[11px] leading-snug">
                <div className="text-slate-700 italic mb-0.5">{r.resistance}</div>
                <div className="text-slate-900"><span className="font-black text-rose-700">→</span> {r.rollWith}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-teal-700 mb-1.5">Language swaps · directive → autonomy</div>
          <div className="text-[12px] text-slate-500 mb-2 italic">Same intent. Different verb. Members hear the difference immediately.</div>
          <div className="space-y-2.5">
            {play.swaps.map((s, i) => (
              <div key={i} className="text-[11px] leading-snug">
                <div className="text-slate-500 line-through italic">{s.directive}</div>
                <div className="text-slate-900 font-black italic mt-0.5"><span className="text-teal-600">→</span> {s.autonomyLift}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Micro-script vignette (only for watch band right now) */}
      {play.microScript && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100" style={{ background: "#F5F3FF" }}>
            <div className="text-[9px] font-black uppercase tracking-widest text-violet-700">Micro-script · MI in flow</div>
            <div className="text-[12px] font-black text-slate-800 mt-0.5">{play.microScript.context}</div>
          </div>
          <div className="p-4 space-y-3">
            {play.microScript.turns.map((t, i) => (
              <div key={i} className={`flex items-start gap-2.5 ${t.speaker === "Maya" ? "flex-row" : "flex-row-reverse"}`}>
                <div className="w-8 h-8 rounded-full grid place-items-center text-[10px] font-black text-white shrink-0 shadow-sm"
                     style={{ background: t.speaker === "Maya" ? "linear-gradient(135deg,#EF5C3E,#B91C1C)" : "#7C6BFF" }}>
                  {t.speaker === "Maya" ? "MP" : "SR"}
                </div>
                <div className={`max-w-[75%] rounded-2xl p-2.5 ${t.speaker === "Maya" ? "" : "text-right"}`}
                     style={{ background: t.speaker === "Maya" ? "#F5F3FF" : "#F1F5F9",
                              borderBottomLeftRadius:  t.speaker === "Maya" ? 4 : undefined,
                              borderBottomRightRadius: t.speaker === "Sally" ? 4 : undefined }}>
                  <div className="text-[11px] text-slate-800 leading-snug italic">"{t.text}"</div>
                  {t.note && (
                    <div className="text-[9px] font-black text-violet-700 uppercase tracking-widest mt-1 not-italic">
                      · {t.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
        <div className="text-[10px] text-slate-600 leading-snug">
          <span className="font-black text-slate-800">Grounded in</span>: Miller & Rollnick MI-4 (2023) · Deci & Ryan Self-Determination Theory ·
          Wendy Wood habit + environment research. Nu learns these patterns and lifts them into member-facing chat + coach notes.
        </div>
      </div>
    </div>
  );
}
