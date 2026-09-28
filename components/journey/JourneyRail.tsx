import { NU_ROLES } from "../../lib/journeyData";
import { useJourneyConfig } from "../../contexts/JourneyConfigContext";
import HabitnuLogo from "./HabitnuLogo";

interface Props {
  currentIndex: number;
  doneIndices: Set<number>;
  onJump: (i: number) => void;
  onOpenSettings?: () => void;
}

/**
 * Left rail - shows Sally's enabled Nu roles as a vertical progress list.
 * Every item is clickable regardless of state (upcoming / active / done).
 * Gear icon in the header opens the JourneyConfigEditor.
 */
export default function JourneyRail({ currentIndex, doneIndices, onJump, onOpenSettings }: Props) {
  const cfg = useJourneyConfig();
  const enabledRoles = cfg.enabledStepIds
    .map(id => NU_ROLES.find(r => r.id === id))
    .filter((r): r is typeof NU_ROLES[number] => !!r);
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-slate-200 flex-col z-30">
      <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-2">
        <div>
          <HabitnuLogo height={22} />
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
            A day with Nu
          </div>
        </div>
        {onOpenSettings && (
          <button onClick={onOpenSettings}
                  title="Customize your day"
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {enabledRoles.map((r, i) => {
          const isActive = i === currentIndex;
          const isDone = doneIndices.has(i);
          const isUpcoming = !isActive && !isDone;
          return (
            <button
              key={r.id}
              onClick={() => onJump(i)}
              className={`w-full px-6 py-3 flex items-start gap-3 text-left transition
                ${isActive ? "bg-indigo-50" : "hover:bg-slate-50"}`}
            >
              <div className="relative mt-1 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black
                    ${isActive ? "bg-indigo-600 text-white ring-4 ring-indigo-200"
                      : isDone ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"}`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                {i < enabledRoles.length - 1 && (
                  <div className={`absolute left-1/2 top-6 -translate-x-1/2 w-[2px] h-8
                    ${isDone || isActive ? "bg-emerald-300" : "bg-slate-200"}`} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-base">{r.emoji}</span>
                  <span className={`text-[13px] font-black leading-tight
                    ${isActive ? "text-indigo-900"
                      : isDone ? "text-slate-800"
                      : "text-slate-500"}`}>
                    {r.name}
                  </span>
                </div>
                <div className={`text-[11px] mt-0.5 leading-tight
                  ${isActive ? "text-indigo-600 font-semibold"
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
        <div className="font-black text-slate-700 mb-1">The journey</div>
        Sally is 52. Thirteen weeks in. Monday morning.
      </div>
    </aside>
  );
}
