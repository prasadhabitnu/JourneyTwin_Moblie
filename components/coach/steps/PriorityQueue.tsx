import { PRIORITY_MEMBERS, PriorityMember } from "../../../lib/coachData";

/**
 * Priority Queue — Nu-scored top 3 members needing Maya's attention today.
 * Sally R. is the featured/hero card; Diane and Amit are secondary.
 */
export default function PriorityQueue() {
  return (
    <div className="space-y-6">
      {PRIORITY_MEMBERS.map((m, i) => (
        <MemberCard key={m.id} member={m} featured={i === 0} rank={i + 1} />
      ))}
    </div>
  );
}

function MemberCard({ member: m, featured, rank }: { member: PriorityMember; featured: boolean; rank: number }) {
  const urgencyChrome = m.urgency === "high"
    ? { bg: "#FEF2F2", border: "#FECACA", fg: "#B91C1C", label: "Urgent" }
    : m.urgency === "medium"
    ? { bg: "#FFFBEB", border: "#FDE68A", fg: "#B45309", label: "Worth a look" }
    : { bg: "#ECFDF5", border: "#A7F3D0", fg: "#047857", label: "Optional" };

  return (
    <div className={featured ? "rounded-2xl p-[3px] shadow-lg" : ""}
         style={featured ? { background: "linear-gradient(135deg, #7C6BFF 0%, #EF5C3E 100%)" } : {}}>
      <div className={`rounded-${featured ? "[15px]" : "2xl"} bg-white border ${featured ? "border-transparent" : "border-slate-100"} shadow-sm p-6`}>
        {/* Header row */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black shrink-0 shadow"
               style={{ background: m.tint }}>
            {m.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">#{rank} priority</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                    style={{ background: urgencyChrome.bg, color: urgencyChrome.fg, border: `1px solid ${urgencyChrome.border}` }}>
                {urgencyChrome.label}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Last contact: {m.lastContact}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">{m.name}</h2>
            <div className="text-[12px] text-slate-500 font-medium">{m.ageWeek} · GLP-1</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">TIR (7d)</div>
            <div className="text-2xl font-black tabular-nums text-slate-900">{m.tir7d}%</div>
            <div className={"text-[10px] font-black " + (m.tirTrend > 0 ? "text-emerald-600" : m.tirTrend < 0 ? "text-rose-600" : "text-slate-500")}>
              {m.tirTrend > 0 ? "▲ +" : m.tirTrend < 0 ? "▼ " : "· "}{Math.abs(m.tirTrend)} pts
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-4 pb-4 border-b border-slate-100">
          <div className="text-[14px] font-bold text-slate-800 leading-snug">{m.headline}</div>
        </div>

        {/* Nu Notices / Predicts / Suggests */}
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {/* Notices */}
          <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-2">Nu Noticed</div>
            <ul className="space-y-1.5">
              {m.nuNoticed.map((n, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700 leading-snug">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Predicts */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700 mb-2">Nu Predicts</div>
            <div className="text-[12px] text-slate-700 font-medium leading-relaxed">{m.nuPredicts}</div>
          </div>

          {/* Suggests */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 mb-2">Nu Suggests</div>
            <div className="text-[12px] text-slate-700 font-medium leading-relaxed">{m.nuSuggests}</div>
          </div>
        </div>

        {/* Action tray */}
        <div className="flex flex-wrap gap-2">
          {m.suggestedActions.map((a, i) => (
            <button
              key={i}
              className={a.kind === "primary"
                ? "px-4 py-2 rounded-xl text-white text-[12px] font-black shadow hover:brightness-110 transition"
                : "px-3 py-2 rounded-xl text-[12px] font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"}
              style={a.kind === "primary" ? { background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" } : {}}
            >
              {a.label}
            </button>
          ))}
          <button className="ml-auto text-[11px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-700 px-2">
            Defer to tomorrow
          </button>
        </div>
      </div>
    </div>
  );
}
