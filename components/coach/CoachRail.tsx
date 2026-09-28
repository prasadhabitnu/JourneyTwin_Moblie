import { COACH_STEPS } from "../../lib/coachData";
import HabitnuLogo from "../journey/HabitnuLogo";

interface Props {
  currentIndex: number;
  doneIndices: Set<number>;
  onJump: (i: number) => void;
}

/**
 * Left rail for the /coach route. Shows Maya's 9 steps as a vertical progress list.
 * Every item is clickable regardless of state; hero-flagged steps get a small badge.
 */
export default function CoachRail({ currentIndex, doneIndices, onJump }: Props) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-slate-200 flex-col z-30">
      <div className="p-6 border-b border-slate-100">
        <HabitnuLogo height={22} />
        <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
          A day with Maya
        </div>
        <div className="text-[10px] font-bold text-slate-500 mt-1">Coach view · 428 members</div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {COACH_STEPS.map((r, i) => {
          const isActive = i === currentIndex;
          const isDone = doneIndices.has(i);
          return (
            <button
              key={r.id}
              onClick={() => onJump(i)}
              className={`w-full px-6 py-3 flex items-start gap-3 text-left transition
                ${isActive ? "bg-orange-50" : "hover:bg-slate-50"}`}
            >
              <div className="relative mt-1 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black
                    ${isActive ? "bg-orange-600 text-white ring-4 ring-orange-200"
                      : isDone ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"}`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                {i < COACH_STEPS.length - 1 && (
                  <div className={`absolute left-1/2 top-6 -translate-x-1/2 w-[2px] h-8
                    ${isDone || isActive ? "bg-emerald-300" : "bg-slate-200"}`} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-base">{r.emoji}</span>
                  <span className={`text-[13px] font-black leading-tight
                    ${isActive ? "text-orange-900"
                      : isDone ? "text-slate-800"
                      : "text-slate-500"}`}>
                    {r.name}
                  </span>
                  {!r.hero && (
                    <span className="ml-auto text-[8px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      preview
                    </span>
                  )}
                </div>
                <div className={`text-[11px] mt-0.5 leading-tight
                  ${isActive ? "text-orange-600 font-semibold"
                    : isDone ? "text-slate-500"
                    : "text-slate-400"}`}>
                  {r.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-5 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
        <div className="font-black text-slate-700 mb-1">Coach on shift</div>
        Maya Patel · Monday, 7:30 AM — 5:15 PM PT
      </div>
    </aside>
  );
}
