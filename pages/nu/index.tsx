/**
 * Nu's Universe — the mobile-viewport home screen.
 *
 * Central Nu sun surrounded by 8 orbital planets, each representing a feature.
 * The bottom voice bar (in NuFrame) captures real speech; parseIntent maps to
 * a planet; Next.js router.push takes the user there.
 *
 * Also tap-navigable — every planet is a clickable Link.
 */

import Link from "next/link";
import NuFrame from "../../components/nu/NuFrame";
import { PLANETS } from "../../lib/nuVoice";

// Angular positions (radians) for the 8 planets, clockwise from top.
const ANGLES = PLANETS.map((_, i) => (i * 360) / 8 - 90); // -90° puts index 0 at 12 o'clock

export default function NuUniverse() {
  return (
    <NuFrame>
      {/* Header */}
      <div className="relative z-10 flex items-center gap-2 px-6 pt-2 pb-3">
        <div className="flex flex-col">
          <div className="text-[16px] font-black text-white tracking-tight flex items-center gap-2">
            habitnu
            <span className="text-[9px] font-black tracking-[0.12em] uppercase px-1.5 py-0.5 rounded"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #4C1D95)", color: "#fff" }}>
              OS
            </span>
          </div>
          <div className="text-[9.5px] text-slate-400 font-semibold">
            powered by <span style={{
              background: "linear-gradient(90deg, #8A5B18, #F59E0B)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              fontWeight: 900,
              letterSpacing: "0.08em",
            }}>FATHOM</span>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/12 bg-white/8">
          <div className="w-6 h-6 rounded-full"
               style={{ background: "linear-gradient(135deg,#F9A8D4,#FBCFE8)" }} />
          <span className="text-[12px] font-bold text-white">Sally</span>
        </div>
      </div>

      {/* Universe title */}
      <div className="relative z-10 px-6 pb-2">
        <div className="flex items-baseline justify-between">
          <div className="font-black tracking-tight text-[17px]"
               style={{
                 background: "linear-gradient(90deg, #F8FAFC, #C4B5FD)",
                 WebkitBackgroundClip: "text",
                 backgroundClip: "text",
                 color: "transparent",
               }}>
            Nu's Universe
          </div>
          <div className="text-[10.5px] text-slate-400 font-bold">
            8 places I can take you
          </div>
        </div>
        <div className="text-[12px] text-slate-400 mt-1">
          Good morning, Sally · say <b className="text-violet-300">"Whatsup Nu"</b> and name a planet
        </div>
      </div>

      {/* THE UNIVERSE */}
      <div className="relative z-10 mx-auto my-3"
           style={{ width: "100%", maxWidth: 400, height: 420 }}>
        {/* Outer orbit ring */}
        <div className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
             style={{
               width: 300, height: 300,
               transform: "translate(-50%, -50%)",
               border: "1.5px dashed rgba(167,139,250,0.32)",
               boxShadow: "0 0 60px rgba(124,58,237,0.15), inset 0 0 40px rgba(124,58,237,0.10)",
             }} />
        {/* Inner ring */}
        <div className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
             style={{
               width: 200, height: 200,
               transform: "translate(-50%, -50%)",
               border: "1px dotted rgba(167,139,250,0.20)",
             }} />

        {/* Central Nu sun */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center z-20"
             style={{
               width: 104, height: 104,
               background:
                 "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.4), transparent 55%),\
                  radial-gradient(circle at 50% 60%, #C4B5FD, #7C3AED 55%, #4C1D95 100%)",
               boxShadow:
                 "0 0 80px rgba(167,139,250,0.55),\
                  0 0 30px rgba(124,58,237,0.65),\
                  inset 0 2px 0 rgba(255,255,255,0.35),\
                  inset 0 -4px 8px rgba(76,29,149,0.5)",
             }}>
          <NuFace size={70} />
          {/* Ripples */}
          <span className="absolute -inset-2 rounded-full border-2 border-violet-300/40 animate-ping" />
          <span className="absolute -inset-2 rounded-full border-2 border-violet-300/30 animate-ping"
                style={{ animationDelay: "1.5s" }} />
        </div>

        {/* Nu sun caption */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 text-center z-10 pointer-events-none"
             style={{ transform: "translate(-50%, calc(-50% + 78px))" }}>
          <div className="text-[8.5px] font-black tracking-[0.14em] uppercase text-violet-300">
            Say the wake phrase
          </div>
          <div className="text-white font-black text-[14px] tracking-tight mt-0.5">
            <span className="text-slate-500">"</span>Whatsup Nu<span className="text-slate-500">"</span>
          </div>
        </div>

        {/* Planets */}
        {PLANETS.map((planet, i) => {
          const angle = (ANGLES[i] * Math.PI) / 180;
          const r = 150; // radius from center of container
          const cx = 50 + (r / 400) * 100 * Math.cos(angle);
          const cy = 50 + (r / 420) * 100 * Math.sin(angle);
          return (
            <Link
              key={planet.slug}
              href={planet.route}
              className="absolute w-[74px] text-center z-10 no-underline"
              style={{
                left: `${cx}%`,
                top: `${cy}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="w-[54px] h-[54px] mx-auto rounded-full flex items-center justify-center text-[22px] relative"
                   style={{
                     background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.4), transparent 55%), linear-gradient(135deg, ${lighten(planet.toneColor)}, ${planet.toneColor})`,
                     border: `1.5px solid ${planet.toneColor}80`,
                     boxShadow: `0 0 22px ${planet.toneColor}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
                   }}>
                <span>{planet.emoji}</span>
              </div>
              <div className="mt-1.5 text-[11px] font-black text-white tracking-tight leading-tight">
                {planet.name}
              </div>
              <div className="text-[9.5px] text-slate-400 font-bold mt-0.5 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: planet.toneColor }} />
                {planet.status}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Voice suggestion strip */}
      <div className="relative z-10 mx-4 mb-3 p-3 rounded-2xl backdrop-blur-md"
           style={{
             background: "linear-gradient(135deg, rgba(124,58,237,0.22), rgba(76,29,149,0.15))",
             border: "1px solid rgba(167,139,250,0.30)",
           }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9.5px] font-black tracking-[0.14em] uppercase text-violet-200">
            Try saying
          </span>
          <span className="ml-auto text-[10px] text-slate-400 font-bold">or tap a planet</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            "Whatsup Nu, take me to CGM",
            "Whatsup Nu, log lunch",
            "Whatsup Nu, message my coach",
            "Whatsup Nu, show rewards",
          ].map(s => (
            <span key={s}
                  className="text-[11px] px-2.5 py-1 rounded-full text-white font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(167,139,250,0.35)",
                  }}>
              <span className="text-slate-400">"</span>{s}<span className="text-slate-400">"</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nu's pick */}
      <div className="relative z-10 mx-4 mb-4 p-3 rounded-2xl flex items-center gap-3"
           style={{
             background: "linear-gradient(#0B0E1F, #131735) padding-box, linear-gradient(135deg, #FDE68A, #F59E0B, #C89A3B) border-box",
             border: "1.5px solid transparent",
             backgroundClip: "padding-box, border-box",
             boxShadow: "0 10px 24px -10px rgba(245,158,11,0.35)",
           }}>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-[22px] shrink-0"
             style={{
               background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5), transparent 55%), linear-gradient(135deg, #FDE68A, #F59E0B)",
               boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
             }}>
          🚶
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9.5px] font-black tracking-[0.14em] uppercase text-amber-200">
            Nu's pick for you today
          </div>
          <div className="text-white font-black text-[14px] tracking-tight mt-0.5">
            The Long Walker · 3-day streak
          </div>
          <div className="text-slate-400 text-[11px] mt-1">
            Say <b className="text-amber-200">"Whatsup Nu, start my walk"</b>
          </div>
        </div>
        <Link href="/nu/today"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #4C1D95)",
                boxShadow: "0 4px 10px -2px rgba(76,29,149,0.55)",
              }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          </svg>
        </Link>
      </div>
    </NuFrame>
  );
}

/* -------------------- Nu character SVG -------------------- */

function NuFace({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path d="M30 6C27 10 24 15 27 21" stroke="#DCFCE7" strokeWidth="1.8" strokeLinecap="round"/>
      <ellipse cx="26" cy="12" rx="5" ry="7.5" transform="rotate(-25 26 12)" fill="#86EFAC" stroke="#DCFCE7" strokeWidth="1.4"/>
      <circle cx="30" cy="34" r="18" fill="#FEF3C7" stroke="#0F1B36" strokeWidth="1.6"/>
      <circle cx="19" cy="37" r="3" fill="#FCA5A5" opacity="0.55"/>
      <circle cx="41" cy="37" r="3" fill="#FCA5A5" opacity="0.55"/>
      <circle cx="24" cy="31" r="1.7" fill="#0F1B36"/>
      <circle cx="36" cy="31" r="1.7" fill="#0F1B36"/>
      <circle cx="24.5" cy="30.5" r="0.5" fill="#fff"/>
      <circle cx="36.5" cy="30.5" r="0.5" fill="#fff"/>
      <path d="M24 39c2 2 4 3 6 3s4-1 6-3" stroke="#0F1B36" strokeWidth="1.7" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/** Lighten a hex color for the top of the planet gradient. */
function lighten(hex: string): string {
  // Simple lighten by mixing with white 35%
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * 0.35);
  const to2 = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to2(mix(r))}${to2(mix(g))}${to2(mix(b))}`;
}
