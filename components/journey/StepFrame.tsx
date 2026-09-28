import { ReactNode } from "react";
import { NuRole } from "../../lib/journeyData";

interface Props {
  role: NuRole;
  stepIndex: number;
  totalSteps: number;
  nextRole?: NuRole | null;
  onNext?: () => void;
  onBack?: () => void;
  onFinish?: () => void;
  children: ReactNode;
}

export default function StepFrame({
  role, stepIndex, totalSteps,
  nextRole, onNext, onBack, onFinish,
  children,
}: Props) {
  const isLast = nextRole == null;
  return (
    <section className="min-h-screen py-14 px-6 md:px-12 lg:pl-[320px] lg:pr-14 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
            {role.emoji}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
              {role.eyebrow}
            </div>
            <div className="text-sm font-black text-slate-500">
              Step {stepIndex + 1} of {totalSteps} - {role.name}
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-8">
          {role.headline}
        </h1>

        <div>{children}</div>
      </div>

      <div className="max-w-6xl mx-auto w-full mt-12 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            disabled={!onBack || stepIndex === 0}
            className="px-3 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30"
          >
            ← Back
          </button>
          <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Sally - Monday
          </div>
          <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Click a step in the rail to jump
          </div>
        </div>

        {isLast ? (
          <FinishCard onClick={onFinish} />
        ) : (
          <NextUpCard role={nextRole!} onClick={onNext} />
        )}
      </div>
    </section>
  );
}

function NextUpCard({ role, onClick }: { role: NuRole; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border-2 border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50/60 transition p-5 flex items-center gap-4 group shadow-sm hover:shadow-md"
    >
      <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-3xl group-hover:scale-110 transition">
        {role.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
          Next up
        </div>
        <div className="text-lg font-black text-slate-900">{role.name}</div>
        <div className="text-sm text-slate-600 font-medium truncate">{role.subtitle}</div>
      </div>
      <div className="shrink-0 flex items-center gap-2 pr-2 text-indigo-600 font-black text-2xl group-hover:translate-x-1 transition">
        →
      </div>
    </button>
  );
}

function FinishCard({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl transition p-5 flex items-center gap-4 group shadow-lg hover:shadow-xl"
      style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
    >
      <div className="w-14 h-14 rounded-full bg-white/25 flex items-center justify-center text-3xl">
        🌱
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100">
          Finish the journey
        </div>
        <div className="text-lg font-black text-white">That was Sally's day.</div>
        <div className="text-sm text-emerald-50 font-medium truncate">
          Close out and see what happens after the journey ends.
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2 pr-2 text-white font-black text-2xl group-hover:translate-x-1 transition">
        →
      </div>
    </button>
  );
}
