import { SALLY_SESSION_PREP as prep } from "../../../lib/coachData";

/**
 * Session Prep — Nu's ready-to-run 1:1 prep card for Sally's 10 AM call.
 * Countdown + summary + minute-by-minute agenda + talking points + prior notes + suggested outcomes.
 */
export default function SessionPrep() {
  return (
    <div className="space-y-6">
      {/* Countdown + member header */}
      <div className="rounded-2xl p-[3px] shadow-lg"
           style={{ background: "linear-gradient(135deg, #A78BFA 0%, #7C6BFF 100%)" }}>
        <div className="rounded-[15px] bg-white p-6 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black shrink-0 shadow"
               style={{ background: "#7C6BFF" }}>
            SR
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">Nu prepped you for this session</div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">Sally R. · 1:1 in {prep.minutesUntil} minutes</h1>
            <div className="text-[12px] text-slate-500 font-medium mt-1">
              {prep.scheduledAt} PT · {prep.duration}-min {prep.channel} · Week 13 · Long Walker
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button className="px-4 py-2 rounded-xl text-white text-[12px] font-black shadow hover:brightness-110 transition"
                    style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
              Join in {prep.minutesUntil} min
            </button>
            <button className="px-4 py-2 rounded-xl text-[12px] font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition">
              Reschedule
            </button>
          </div>
        </div>
      </div>

      {/* Nu's summary */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-2">Nu's summary</div>
        <p className="text-[14px] text-slate-800 leading-relaxed font-medium">{prep.summary}</p>
      </div>

      {/* Agenda + Talking points side by side */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Agenda */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">Minute-by-minute agenda</div>
            <span className="text-[10px] font-black text-slate-500">{prep.duration} min total</span>
          </div>
          <div className="space-y-3">
            {prep.agenda.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-black tabular-nums bg-orange-100 text-orange-700 border border-orange-200">
                  {a.minute}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-black text-slate-900">{a.topic}</div>
                  <div className="text-[11.5px] text-slate-600 font-medium leading-relaxed mt-0.5">{a.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Talking points */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600 mb-3">Talking points (Nu ranked by leverage)</div>
          <ul className="space-y-3">
            {prep.talkingPoints.map((t, i) => {
              const [lead, rest] = t.split(": ", 2);
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {i + 1}
                  </span>
                  <div className="text-[13px] text-slate-800 leading-relaxed">
                    <span className="font-black">{lead}:</span>
                    <span className="font-medium"> {rest}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Prior notes + Suggested outcomes */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 mb-3">Prior session notes</div>
          <div className="space-y-3">
            {prep.priorSessionNotes.map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-100">
                <div className="text-[10px] font-black text-slate-500 shrink-0 mt-0.5 tabular-nums">{n.date}</div>
                <div className="text-[12px] text-slate-700 font-medium leading-relaxed">{n.summary}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6"
             style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 60%)", borderColor: "#C7D2FE" }}>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-3">Nu-suggested session outcomes</div>
          <ul className="space-y-2">
            {prep.suggestedOutcomes.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-slate-800 font-medium leading-snug">
                <svg className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 12 10 18 20 6" />
                </svg>
                <span>{o}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-indigo-100 text-[11px] text-slate-600 font-medium italic">
            Nu will pre-draft the SOAP note based on which outcomes you confirm during the session.
          </div>
        </div>
      </div>
    </div>
  );
}
