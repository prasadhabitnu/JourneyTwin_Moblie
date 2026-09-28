import { useEffect, useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import NuMascot from "./NuMascot";

/**
 * Floating Nu mascot in the bottom-right corner.
 * - Continuous gentle float (up/down 3px, 2.6s ease-in-out)
 * - Pulsing indigo glow ring behind Nu (2s ease-in-out infinite)
 * - Occasional wave nudge (every ~15s) to draw the eye
 * - "Talk to me?" tooltip appears on first mount, fades after 5s
 * - Hides when the chat drawer is open (fades out cleanly)
 */
export default function NuChatFAB() {
  const { isOpen, open } = useChat();
  const [showTooltip, setShowTooltip] = useState(true);
  const [waving, setWaving] = useState(false);

  // Auto-hide the intro tooltip after a beat.
  useEffect(() => {
    const t = window.setTimeout(() => setShowTooltip(false), 5200);
    return () => window.clearTimeout(t);
  }, []);

  // Periodic wave animation to catch Sally's eye when she's browsing elsewhere.
  useEffect(() => {
    if (isOpen) return;
    const id = window.setInterval(() => {
      setWaving(true);
      window.setTimeout(() => setWaving(false), 900);
    }, 15000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  return (
    <div
      className={"fixed bottom-5 right-5 z-40 flex items-end gap-2 transition-all duration-300 " +
        (isOpen ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0")}
    >
      {/* "Talk to me?" tooltip - first-mount hint */}
      <div
        className={"mb-3 rounded-xl px-2.5 py-1.5 shadow-xl transition-all duration-300 " +
          (showTooltip ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none")}
        style={{ background: "#FFFFFF", border: "1px solid #E0E7FF", maxWidth: 180 }}
      >
        <div className="text-[9px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-0.5">Nu</div>
        <div className="text-[11.5px] font-bold text-slate-800 leading-snug">
          Tap me to chat.
        </div>
        {/* speech-bubble tail */}
        <div className="absolute -bottom-1.5 right-4 w-2.5 h-2.5 bg-white border-r border-b border-indigo-100 rotate-45" />
      </div>

      {/* Nu mascot button - compact so it doesn't cover the Next arrow */}
      <button
        onClick={open}
        aria-label="Talk to Nu"
        title="Talk to Nu"
        className={"relative group focus:outline-none " + (waving ? "nu-wave" : "nu-float")}
        style={{ width: 58, height: 72 }}
      >
        {/* Pulsing halo ring (behind the mascot) */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full nu-pulse"
          style={{
            background: "radial-gradient(circle, rgba(124,107,255,0.42) 0%, rgba(124,107,255,0.15) 55%, rgba(124,107,255,0) 75%)",
          }}
        />
        {/* Static soft shadow disc */}
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 bottom-0.5 rounded-full"
          style={{ width: 34, height: 6, background: "rgba(15,23,42,0.18)", filter: "blur(3px)" }}
        />
        {/* The mascot itself */}
        <span className="absolute inset-0 flex items-end justify-center">
          <NuMascot size={52} />
        </span>
        {/* Little unread dot to signal "I'm ready" */}
        <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white shadow-sm nu-blink" />
      </button>

      <style jsx>{`
        .nu-float  { animation: nuFloat 2.6s ease-in-out infinite; }
        .nu-pulse  { animation: nuPulse 2s ease-in-out infinite; }
        .nu-blink  { animation: nuBlink 2.4s ease-in-out infinite; }
        .nu-wave   { animation: nuWave 0.9s ease-in-out; transform-origin: 50% 90%; }
        @keyframes nuFloat {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes nuPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.55; }
          50%      { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes nuBlink {
          0%, 60%, 100% { opacity: 1; transform: scale(1); }
          75%           { opacity: 0.35; transform: scale(0.7); }
        }
        @keyframes nuWave {
          0%   { transform: rotate(0deg)  translateY(0px); }
          20%  { transform: rotate(-8deg) translateY(-3px); }
          40%  { transform: rotate(8deg)  translateY(-2px); }
          60%  { transform: rotate(-5deg) translateY(-1px); }
          80%  { transform: rotate(3deg)  translateY(0px); }
          100% { transform: rotate(0deg)  translateY(0px); }
        }
        }
      `}</style>
    </div>
  );
}
