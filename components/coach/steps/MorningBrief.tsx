import { PANEL_STATS, MAYA } from "../../../lib/coachData";

/**
 * Morning Brief — Nu's overnight prep for Maya.
 * Warm cup-of-coffee tone. Numbers first, then Nu's top-3 flagged patterns.
 */
export default function MorningBrief() {
  return (
    <div className="space-y-6">
      {/* Warm greeting card */}
      <div className="rounded-2xl p-[3px] shadow-lg"
           style={{ background: "linear-gradient(135deg, #FDBA74 0%, #EF5C3E 50%, #B91C1C 100%)" }}>
        <div className="rounded-[15px] bg-white p-6 md:p-7">
          <div className="flex items-start gap-4">
            <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow"
                  style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v3M5.6 5.6l2.1 2.1M3 12h3M5.6 18.4l2.1-2.1M12 21v-3M18.4 18.4l-2.1-2.1M21 12h-3M18.4 5.6l-2.1 2.1" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 mb-1">Nu's morning prep for {MAYA.name.split(" ")[0]}</div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">
                Good morning, Maya. Here's your panel.
              </h1>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                Overnight I watched all {PANEL_STATS.total} members. Most of your panel is doing well —
                <span className="font-black text-emerald-700"> {PANEL_STATS.doingWell}</span> members had a quiet, healthy night.
                A small number need your attention today.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Numbers strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Priority today" value={PANEL_STATS.priorityToday} accent="#EF5C3E" note="Nu-flagged for you" />
        <StatCard label="Gentle check-in" value={PANEL_STATS.checkInToday} accent="#F59E0B" note="Warm ping suggested" />
        <StatCard label="Doing well" value={PANEL_STATS.doingWell} accent="#059669" note="No action needed" />
        <StatCard label="Active last 7d" value={PANEL_STATS.active7d} accent="#4F5FE5" note={`of ${PANEL_STATS.total} total`} />
      </div>

      {/* Nu's top-3 flags */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 mb-3">Nu flagged three things overnight</div>
        <div className="space-y-3">
          <FlagRow
            severity="med"
            name="Sally R."
            headline="Skipped Sunday semaglutide dose."
            detail="Second Sunday miss in 4 weeks — pattern worth intervening on. Fasting glucose up 12 mg/dL this morning."
          />
          <FlagRow
            severity="high"
            name="Diane W."
            headline="TIR down 6 points this week; motivation declining 8 days."
            detail="App opens down 40% week-over-week. Reported knee pain 2x. Consider physical-limits path + warm call today."
          />
          <FlagRow
            severity="med"
            name="Amit K."
            headline="CGM MARD elevated — likely sensor artifact."
            detail="Not a clinical event. Text him a sensor-swap and downweight 4 days of noisy data. Nu drafted the message."
          />
        </div>
      </div>

      {/* Cohort mood */}
      <div className="rounded-2xl border border-slate-100 shadow-sm p-6 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex items-start gap-4">
          <span className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 mb-1">Panel mood</div>
            <div className="text-[15px] font-bold text-slate-800 leading-snug">
              Cohort TIR is {PANEL_STATS.cohortAvgTir}%, up {PANEL_STATS.cohortTirTrend} points from last week.
              {" "}{PANEL_STATS.streakingMembers} members hit their walk streak. Send group congrats?
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="px-3 py-1.5 rounded-full text-[11px] font-black text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-50 transition">
                Draft group congrats
              </button>
              <button className="px-3 py-1.5 rounded-full text-[11px] font-black text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition">
                See full cohort pulse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, note }: { label: string; value: number; accent: string; note: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-4">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      <div className="text-3xl font-black tabular-nums" style={{ color: accent }}>{value}</div>
      <div className="text-[10px] text-slate-500 font-medium mt-1">{note}</div>
    </div>
  );
}

function FlagRow({ severity, name, headline, detail }: { severity: "high" | "med"; name: string; headline: string; detail: string }) {
  const color = severity === "high" ? "#B91C1C" : "#B45309";
  const bg    = severity === "high" ? "#FEF2F2" : "#FFFBEB";
  const border = severity === "high" ? "#FECACA" : "#FDE68A";
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ background: bg, borderColor: border }}>
      <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white font-black text-[10px]"
            style={{ background: color }}>
        {severity === "high" ? "!" : "·"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-black text-slate-900">{name}</span>
          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color, background: "#FFFFFF", border: `1px solid ${border}` }}>
            {severity === "high" ? "urgent" : "worth a look"}
          </span>
        </div>
        <div className="text-[13px] font-bold text-slate-800 mt-0.5 leading-snug">{headline}</div>
        <div className="text-[12px] text-slate-600 font-medium mt-1 leading-relaxed">{detail}</div>
      </div>
    </div>
  );
}
