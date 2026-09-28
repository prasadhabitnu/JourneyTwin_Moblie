import { END_OF_DAY as eod, MAYA } from "../../../lib/coachData";

/**
 * End-of-Day Recap — Nu's debrief for Maya at 5:15 PM.
 * Warm sign-off tone. Numbers, wins, worries, tomorrow, quick sign-out.
 */
export default function EndOfDayRecap() {
  const hours = Math.floor(eod.totalMinutesSpent / 60);
  const mins = eod.totalMinutesSpent % 60;

  return (
    <div className="space-y-6">
      {/* Warm sign-off card */}
      <div className="rounded-2xl p-[3px] shadow-lg"
           style={{ background: "linear-gradient(135deg, #6B5CE0 0%, #7C6BFF 50%, #EC4A83 100%)" }}>
        <div className="rounded-[15px] bg-white p-6 md:p-7">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow"
                  style={{ background: "linear-gradient(135deg, #6B5CE0 0%, #4C3EC0 100%)" }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 15A8 8 0 1 1 9 4a5 5 0 0 0 11 11z" />
              </svg>
            </span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">{eod.timestamp} · your day, {MAYA.name.split(" ")[0]}</div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">You did good work today.</h1>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                You reached {eod.membersReached} members, wrote {eod.contactsMade} notes, and sent
                {" "}{eod.physicianHandoffsSent} physician handoffs — {hours} hours {mins} minutes of care.
                I've tucked tomorrow's priorities into your morning brief so you can start easy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Numbers strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Contacts" value={`${eod.contactsMade}/${eod.contactsPlanned}`} accent="#4F5FE5" note="planned" />
        <StatCard label="Broadcast" value={eod.broadcastReach} accent="#EF5C3E" note={`${eod.broadcastsSent} sent`} />
        <StatCard label="MD handoffs" value={eod.physicianHandoffsSent} accent="#B91C1C" note="delivered" />
        <StatCard label="SOAP notes" value={`${eod.soapNotesApproved}/${eod.soapNotesDrafted}`} accent="#059669" note="approved" />
        <StatCard label="Inbound NPS" value={eod.npsInboundToday.toFixed(1)} accent="#F59E0B" note="of 5" />
      </div>

      {/* Wins / Worries side by side */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 12 10 18 20 6" />
              </svg>
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Today's wins</div>
              <div className="text-[13px] font-black text-slate-800">Celebrate these</div>
            </div>
          </div>
          <ul className="space-y-2.5">
            {eod.wins.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-800 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.3 3.9L1.8 18.6a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              </svg>
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">Worth watching</div>
              <div className="text-[13px] font-black text-slate-800">Not urgent — just noted</div>
            </div>
          </div>
          <ul className="space-y-2.5">
            {eod.worries.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] text-slate-800 leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tomorrow's setup */}
      <div className="rounded-2xl border border-indigo-100 p-6"
           style={{ background: "linear-gradient(90deg, #EEF2FF 0%, #F5F1FF 100%)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-9 h-9 rounded-full flex items-center justify-center shadow"
                style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </span>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">Tomorrow, ready when you are</div>
            <div className="text-[14px] font-black text-slate-900">Nu already pre-scored the day for you</div>
          </div>
        </div>
        <ul className="space-y-2">
          {eod.tomorrow.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-slate-800 font-medium leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sign-out tray */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="text-[12px] text-slate-500 font-medium italic">
          "Rest well. I'll keep watch overnight." — Nu
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl text-[12px] font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition">
            Add a personal note
          </button>
          <button className="px-4 py-2 rounded-xl text-white text-[12px] font-black shadow hover:brightness-110 transition"
                  style={{ background: "linear-gradient(135deg, #6B5CE0 0%, #4C3EC0 100%)" }}>
            Sign out for the day
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, note }: { label: string; value: string | number; accent: string; note: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-3.5">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-black tabular-nums" style={{ color: accent }}>{value}</div>
      <div className="text-[10px] text-slate-500 font-medium mt-0.5">{note}</div>
    </div>
  );
}
