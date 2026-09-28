import { useEffect, useState } from "react";

interface Props {
  speaking: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

/**
 * Floating Nu sprout in the bottom-right corner. Pulses while speaking,
 * shows an "unmute" affordance when Nu is muted.
 */
export default function NuFloatie({ speaking, muted, onToggleMute }: Props) {
  const [bounce, setBounce] = useState(false);
  useEffect(() => {
    if (speaking) {
      const id = setInterval(() => setBounce(b => !b), 500);
      return () => clearInterval(id);
    } else {
      setBounce(false);
    }
  }, [speaking]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      <button
        onClick={onToggleMute}
        className={`px-3 py-2 rounded-full text-[11px] font-black uppercase tracking-wider
          transition backdrop-blur-lg border shadow
          ${muted ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-white/90 text-slate-700 border-slate-200"}`}
      >
        {muted ? "🔇 Unmute Nu" : "🔊 Nu on"}
      </button>

      <div className="relative">
        {/* Speaking rings */}
        {speaking && !muted && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-300 animate-ping" />
            <div className="absolute -inset-2 rounded-full border-2 border-emerald-200 opacity-60 animate-ping" style={{ animationDelay: "0.4s" }} />
          </>
        )}

        <div
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl
            transition-transform duration-500 ${bounce ? "scale-110" : "scale-100"}
            bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700`}
        >
          <span className="drop-shadow-sm">🌱</span>
        </div>
      </div>
    </div>
  );
}
