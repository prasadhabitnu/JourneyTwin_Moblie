import { TODAY_SESSIONS, WEEK_OVERVIEW, CoachSession, SessionKind, SessionUrgency } from "../../../lib/coachData";

/**
 * Session Calendar — Maya's day + Nu's per-session prep.
 * Week overview strip on top, then today's timeline with rich Nu insight per card.
 */
export default function SessionCalendar() {
  const totalToday = TODAY_SESSIONS.length;
  const urgent = TODAY_SESSIONS.filter(s => s.urgency === "urgent").length;
  const nuAdded = TODAY_SESSIONS.filter(s => s.nuAdded).length;

  return (
    <div className="space-y-6">
      {/* Header + Nu framing */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow"
                style={{ background: "linear-gradient(135deg, #EF5C3E 0%, #B91C1C 100%)" }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </span>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 mb-1">Monday, July 6 · Your calendar</div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {totalToday} sessions today
              <span className="text-slate-500 font-bold text-lg"> · {urgent} urgent · {nuAdded} added overnight by Nu</span>
            </h1>
            <p className="text-[14px] text-slate-600 leading-relaxed mt-2">
              Every session has a prep card ready. Nu drafted talking points, agendas, and follow-up materials so you can walk in warm.
            </p>
          </div>
        </div>
      </div>

      {/* Week overview strip */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-3 px-2">This week at a glance</div>
        <div className="grid grid-cols-5 gap-2">
          {WEEK_OVERVIEW.map(d => (
            <button
              key={d.day}
              className={"text-center py-3 rounded-xl transition " +
                (d.isToday
                  ? "bg-orange-100 ring-2 ring-orange-400 cursor-default"
                  : "bg-slate-50 hover:bg-slate-100 cursor-pointer")}
            >
              <div className={"text-[10px] font-black uppercase tracking-wider " + (d.isToday ? "text-orange-700" : "text-slate-500")}>
                {d.day}
              </div>
              <div className={"text-lg font-black tabular-nums mt-0.5 " + (d.isToday ? "text-orange-900" : "text-slate-800")}>
                {d.total}
              </div>
              <div className="text-[9px] text-slate-500 font-medium">{d.label}</div>
              {d.urgent > 0 && (
                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
                     style={{ background: "#FEF2F2", color: "#B91C1C" }}>
                  <span className="w-1 h-1 rounded-full bg-rose-600" />
                  {d.urgent} urgent
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline of today's sessions */}
      <div className="space-y-3">
        {TODAY_SESSIONS.map(s => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>

      {/* Footer callout */}
      <div className="rounded-2xl border border-indigo-100 p-4 flex items-start gap-3"
           style={{ background: "linear-gradient(90deg, #EEF2FF 0%, #F5F1FF 100%)" }}>
        <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow"
              style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </span>
        <div className="flex-1 text-[12.5px] text-slate-700 font-medium leading-relaxed">
          <span className="font-black text-indigo-700">Nu keeps this calendar warm.</span>{" "}
          I add urgent members to your day when I see something worth your attention (like Diane's warm outreach today).
          I also draft the note, the prep card, and the SOAP note for each session so you spend less time on prep and more time with people.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Session card
// ============================================================================

function kindLabel(k: SessionKind) {
  switch (k) {
    case "video":    return "Video";
    case "phone":    return "Phone";
    case "async":    return "Async";
    case "internal": return "Internal";
    case "group":    return "Group";
  }
}

function urgencyChrome(u: SessionUrgency): { bg: string; border: string; fg: string; label: string } {
  switch (u) {
    case "urgent":   return { bg: "#FEF2F2", border: "#FECACA", fg: "#B91C1C", label: "Urgent" };
    case "welcome":  return { bg: "#FCE7F3", border: "#FBCFE8", fg: "#BE185D", label: "New patient" };
    case "internal": return { bg: "#F1F5F9", border: "#E2E8F0", fg: "#475569", label: "Internal" };
    case "regular":
    default:         return { bg: "#EEF2FF", border: "#C7D2FE", fg: "#4338CA", label: "Regular" };
  }
}

function kindIcon(k: SessionKind) {
  if (k === "video") return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="14" height="12" rx="2" /><path d="M22 8l-6 4 6 4V8z" />
    </svg>
  );
  if (k === "phone") return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2z" />
    </svg>
  );
  if (k === "async") return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
  if (k === "group") return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}

function SessionCard({ session: s }: { session: CoachSession }) {
  const chrome = urgencyChrome(s.urgency);
  const isFeatured = s.urgency === "urgent" || s.id === "s1"; // Sally's card + urgent ones stand out

  return (
    <div className={isFeatured ? "rounded-2xl p-[2px] shadow-md" : "rounded-2xl shadow-sm"}
         style={isFeatured
           ? { background: s.nuAdded ? "linear-gradient(135deg, #F87171 0%, #B91C1C 100%)" : "linear-gradient(135deg, #A78BFA 0%, #7C6BFF 100%)" }
           : {}}>
      <div className={"bg-white " + (isFeatured ? "rounded-[14px] border border-transparent" : "rounded-2xl border border-slate-100") + " p-4 flex items-start gap-4"}>
        {/* Time block */}
        <div className="w-24 shrink-0 pt-0.5">
          <div className="text-[11px] font-black tabular-nums text-slate-800 leading-tight">{s.time}</div>
          <div className="text-[10px] text-slate-500 font-medium">{s.durationMin} min</div>
          <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200">
            {kindIcon(s.kind)}
            {kindLabel(s.kind)}
          </div>
        </div>

        {/* Member / topic column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-sm"
                 style={{ background: s.memberTint }}>
              {s.memberInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-black text-slate-900 leading-tight">{s.memberName}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                      style={{ background: chrome.bg, color: chrome.fg, border: `1px solid ${chrome.border}` }}>
                  {chrome.label}
                </span>
                {s.nuAdded && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                    ✨ Nu-added
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                {s.topic}{s.memberContext ? ` · ${s.memberContext}` : ""}
              </div>
            </div>
          </div>

          {/* Nu insight */}
          <div className="rounded-lg bg-indigo-50/60 border border-indigo-100 p-2.5 mb-2">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
                <span className="text-[8px] font-black text-white">Nu</span>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700 mb-0.5">Nu prepped</div>
                <div className="text-[12px] text-slate-800 font-medium leading-relaxed">{s.nuInsight}</div>
              </div>
            </div>
          </div>

          {/* Nu flags row + primary action */}
          <div className="flex items-center gap-2 flex-wrap">
            {s.nuFlags?.map((f, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-black text-indigo-700 bg-white border border-indigo-100">
                {f}
              </span>
            ))}
            <button
              className="ml-auto px-3 py-1.5 rounded-lg text-white text-[11px] font-black shadow-sm hover:brightness-110 transition"
              style={{ background: "linear-gradient(135deg, #EF5C3E 0%, #B91C1C 100%)" }}
            >
              {s.primaryActionLabel} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
