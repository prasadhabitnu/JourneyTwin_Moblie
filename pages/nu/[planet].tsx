/**
 * Nu destination pages — dynamic route rendering per-planet content.
 * The user can voice-navigate ("Whatsup Nu, take me to CGM") or tap-navigate
 * from the Universe. Every destination has a back button to /nu.
 */

import { useRouter } from "next/router";
import Link from "next/link";
import NuFrame from "../../components/nu/NuFrame";
import { PLANETS, PlanetSpec } from "../../lib/nuVoice";

export default function NuPlanet() {
  const router = useRouter();
  const slug = String(router.query.planet ?? "");
  const planet = PLANETS.find(p => p.slug === slug);

  if (!planet) {
    return (
      <NuFrame showBack title="Not found">
        <div className="px-6 py-8 text-slate-300 text-sm">
          No planet named <b>{slug}</b>. Say <b className="text-violet-300">"Whatsup Nu, universe"</b> to go home.
        </div>
      </NuFrame>
    );
  }

  return (
    <NuFrame showBack title={planet.name}>
      <div className="px-4 pb-4">
        <PlanetHero planet={planet} />
        <PlanetContent planet={planet} />
      </div>
    </NuFrame>
  );
}

/* -------------------- Hero -------------------- */

function PlanetHero({ planet }: { planet: PlanetSpec }) {
  return (
    <div className="rounded-3xl p-5 mb-4 relative overflow-hidden"
         style={{
           background: `radial-gradient(ellipse at top, ${planet.toneColor}30, transparent 60%),
                        linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
           border: `1.5px solid ${planet.toneColor}60`,
           boxShadow: `0 20px 50px -14px ${planet.toneColor}45`,
         }}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-[36px] shrink-0"
             style={{
               background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.45), transparent 55%),
                            linear-gradient(135deg, ${lighten(planet.toneColor)}, ${planet.toneColor})`,
               boxShadow: `0 0 24px ${planet.toneColor}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
             }}>
          {planet.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black tracking-[0.16em] uppercase"
               style={{ color: planet.toneColor }}>
            Nu planet
          </div>
          <div className="text-white font-black text-[22px] tracking-tight leading-tight">
            {planet.name}
          </div>
          <div className="text-slate-300 text-[12px] mt-1">
            {planet.status}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Per-planet content -------------------- */

function PlanetContent({ planet }: { planet: PlanetSpec }) {
  switch (planet.slug) {
    case "today":       return <TodayContent />;
    case "cgm":         return <CgmContent />;
    case "journey":     return <JourneyContent />;
    case "coach":       return <CoachContent />;
    case "care-circle": return <CareContent />;
    case "learn":       return <LearnContent />;
    case "rewards":     return <RewardsContent />;
    case "progress":    return <ProgressContent />;
    default:            return <GenericContent planet={planet} />;
  }
}

/* --- Today --- */
function TodayContent() {
  return (
    <>
      <Card tone="#F59E0B" title="Today's Playbook" subtitle="The Long Walker · committed">
        <RecipeItem done label="6+ glasses water" meta="✓ 6 logged" icon="💧" />
        <RecipeItem      label="Balanced dinner"  meta="by 7pm"     icon="🥗" />
        <RecipeItem      label="35–40 min walk"    meta="🎤 or say"  icon="🚶" />
      </Card>
      <NuSays>
        Add 5 more minutes today to hit the 40-min sweet spot. <b className="text-amber-200">+2–3 TIR points.</b>
      </NuSays>
      <VoiceHint text='"Whatsup Nu, I just walked 40 minutes"' />
    </>
  );
}

/* --- CGM --- */
function CgmContent() {
  return (
    <>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="TIR" val="99%" color="#10B981" />
        <Stat label="Avg" val="92" sub="mg/dL" />
        <Stat label="CV" val="8%" color="#34D399" />
      </div>
      <Card tone="#3B82F6" title="24-hour glucose" subtitle="Wed, Jul 1 · smooth curve, in-range all day">
        <MiniCurve />
      </Card>
      <Card tone="#3B82F6" title="Pattern Nu spotted">
        <div className="text-[13px] text-white/90 leading-relaxed">
          Post-dinner walk correlates with <b className="text-emerald-300">flatter evening curves</b> — 6 of the last 7 days confirm.
        </div>
      </Card>
      <VoiceHint text='"Whatsup Nu, show my full CGM report"' />
    </>
  );
}

/* --- Journey --- */
function JourneyContent() {
  const weeks = [
    { w: 1,  tir: 42, tag: "Rocky start" },
    { w: 4,  tir: 62, tag: "First walks" },
    { w: 8,  tir: 78, tag: "Dose settled" },
    { w: 13, tir: 99, tag: "Now — The Long Walker" },
  ];
  return (
    <>
      <Card tone="#A78BFA" title="Six-lens journey" subtitle="Week 1 → Week 13">
        <div className="space-y-2 mt-2">
          {weeks.map(w => (
            <div key={w.w} className="flex items-center gap-3">
              <div className="w-11 text-center">
                <div className="text-[9px] uppercase text-slate-400 font-bold">wk</div>
                <div className="text-white font-black text-[14px]">{w.w}</div>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                       style={{
                         width: `${w.tir}%`,
                         background: "linear-gradient(90deg, #C4B5FD, #7C3AED)",
                       }} />
                </div>
                <div className="text-[10.5px] text-slate-300 mt-1 flex justify-between">
                  <span>{w.tag}</span>
                  <span className="text-emerald-300 font-bold">TIR {w.tir}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <VoiceHint text='"Whatsup Nu, what worked in week 4?"' />
    </>
  );
}

/* --- Coach --- */
function CoachContent() {
  const msgs = [
    { who: "coach", who_name: "Maya Patel", txt: "Sandy — great walk streak! Want to try the ½-portion rice rule at dinner tonight?", time: "8:12 am" },
    { who: "you",   txt: "Yes, doing it tonight.", time: "8:20 am" },
    { who: "coach", who_name: "Maya Patel", txt: "Nice. Send me a check-in after dinner. Nu will remind you.", time: "8:21 am" },
  ];
  return (
    <>
      <Card tone="#FB7185" title="Coach Maya" subtitle="Emotional-eating specialist · Southeast">
        <div className="space-y-3 mt-1">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-2.5 rounded-2xl text-[13px] ${
                m.who === "you"
                  ? "bg-white/10 border border-white/12 text-white rounded-br-md"
                  : "bg-rose-500/15 border border-rose-400/30 text-white rounded-bl-md"
              }`}>
                {m.who === "coach" && (
                  <div className="text-[9.5px] font-black tracking-[0.1em] uppercase text-rose-200 mb-0.5">
                    {m.who_name}
                  </div>
                )}
                <div className="leading-relaxed">{m.txt}</div>
                <div className="text-[9.5px] text-white/50 mt-1">{m.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <VoiceHint text='"Whatsup Nu, tell Maya I did the ½ portion"' />
    </>
  );
}

/* --- Care Circle --- */
function CareContent() {
  const members = [
    { name: "Ryan (spouse)",  can: "Weight · walks",           joined: "Since Wk 4"  },
    { name: "Amy (daughter)", can: "Milestones only",         joined: "Since Wk 8"  },
    { name: "Dr. Chen",       can: "Full medical view",       joined: "Since Wk 1"  },
  ];
  return (
    <>
      <Card tone="#F472B6" title="Care Circle" subtitle="3 people share this journey with Sandy">
        <div className="space-y-2 mt-1">
          {members.map(m => (
            <div key={m.name} className="flex items-center gap-3 p-2.5 rounded-xl"
                 style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-9 h-9 rounded-full"
                   style={{ background: "linear-gradient(135deg,#F9A8D4,#F472B6)" }} />
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-[13px]">{m.name}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{m.can} · {m.joined}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <VoiceHint text='"Whatsup Nu, add my sister to Care Circle"' />
    </>
  );
}

/* --- Learn --- */
function LearnContent() {
  const lessons = [
    { title: "Mindful Eating · Day 4", dur: "8 min", tag: "in progress" },
    { title: "Refined-carb strategies", dur: "6 min", tag: "up next" },
    { title: "Nighttime hydration",    dur: "5 min", tag: "queued" },
  ];
  return (
    <>
      <Card tone="#22D3EE" title="Today's lesson" subtitle="Mindful Eating">
        <div className="space-y-2 mt-1">
          {lessons.map(l => (
            <div key={l.title} className="flex items-center gap-3 p-2.5 rounded-xl"
                 style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.25)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-cyan-300"
                   style={{ background: "rgba(34,211,238,0.15)" }}>▶</div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-[13px]">{l.title}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{l.dur} · {l.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <VoiceHint text={`"Whatsup Nu, start today's lesson"`} />
    </>
  );
}

/* --- Rewards --- */
function RewardsContent() {
  const badges = [
    { emoji: "🏃", name: "7-Day Walker",          got: true  },
    { emoji: "💧", name: "Hydration Hero",        got: true  },
    { emoji: "📉", name: "Fasting Fixer",         got: true  },
    { emoji: "⭐", name: "Time-in-Range Titan",   got: true  },
    { emoji: "🔥", name: "Streak Starter",        got: true  },
    { emoji: "🍽️", name: "Half-Portion Master",   got: false, progress: "2 / 3" },
  ];
  return (
    <>
      <Card tone="#C89A3B" title="Health Credits" subtitle="Platinum · 3,575 credits">
        <div className="mt-2">
          <div className="flex justify-between text-[10px] font-black text-slate-300 mb-1">
            <span>Progress</span>
            <span className="text-amber-200">next milestone: 4,000</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full"
                 style={{ width: "89%", background: "linear-gradient(90deg,#FDE68A,#F59E0B)" }} />
          </div>
        </div>
      </Card>
      <Card tone="#C89A3B" title="Achievement badges" subtitle="5 of 6 unlocked">
        <div className="grid grid-cols-3 gap-2 mt-1">
          {badges.map(b => (
            <div key={b.name} className="p-2 rounded-xl text-center"
                 style={{
                   background: b.got
                     ? "linear-gradient(180deg, rgba(253,230,138,0.15), rgba(245,158,11,0.05))"
                     : "rgba(255,255,255,0.04)",
                   border: `1px solid ${b.got ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
                   opacity: b.got ? 1 : 0.6,
                 }}>
              <div className="text-[24px] leading-none">{b.got ? b.emoji : "🔒"}</div>
              <div className="text-[10px] text-white font-bold mt-1 leading-tight">{b.name}</div>
              {!b.got && b.progress && (
                <div className="text-[9px] text-amber-200 font-bold mt-1">{b.progress}</div>
              )}
            </div>
          ))}
        </div>
      </Card>
      <VoiceHint text='"Whatsup Nu, how do I unlock Half-Portion Master?"' />
    </>
  );
}

/* --- Progress --- */
function ProgressContent() {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Stat label="This week TIR" val="99%" sub="+3 vs. last" color="#10B981" />
        <Stat label="Avg glucose" val="96" sub="mg/dL · –4 vs. last" color="#10B981" />
        <Stat label="Streak"       val="4 🔥" sub="days" color="#F59E0B" />
        <Stat label="Voice turns"  val="12" sub="today" color="#A78BFA" />
      </div>
      <Card tone="#10B981" title="Weekly TIR climb" subtitle="Compound of walks + water + portion control">
        <MiniCurve />
      </Card>
      <VoiceHint text='"Whatsup Nu, compare me to last month"' />
    </>
  );
}

/* --- Generic --- */
function GenericContent({ planet }: { planet: PlanetSpec }) {
  return (
    <Card tone={planet.toneColor} title={`${planet.name} · coming soon`}>
      <div className="text-white/80 text-[13px]">
        This planet is scaffolded but not populated yet. Say <b className="text-violet-300">"Whatsup Nu, universe"</b> to return home.
      </div>
    </Card>
  );
}

/* -------------------- Small primitives -------------------- */

function Card({ tone, title, subtitle, children }: {
  tone: string; title: string; subtitle?: string; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-4 mb-3"
         style={{
           background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
           border: `1px solid ${tone}40`,
         }}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-white font-black text-[14px] tracking-tight">{title}</div>
        {subtitle && <div className="text-[10.5px] text-slate-400 font-bold text-right ml-2 shrink-0">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, val, sub, color = "#F8FAFC" }: {
  label: string; val: string; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-xl p-3"
         style={{
           background: "rgba(255,255,255,0.05)",
           border: "1px solid rgba(255,255,255,0.08)",
         }}>
      <div className="text-[9.5px] font-black text-slate-400 uppercase tracking-[0.08em]">{label}</div>
      <div className="text-[20px] font-black mt-0.5 leading-none" style={{ color }}>{val}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function RecipeItem({ label, meta, icon, done }: {
  label: string; meta: string; icon: string; done?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-xl mb-1.5"
         style={{
           background: done ? "rgba(52,211,153,0.10)" : "rgba(255,255,255,0.04)",
           border: `1px solid ${done ? "rgba(52,211,153,0.30)" : "rgba(255,255,255,0.08)"}`,
         }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center border-2"
           style={{
             borderColor: done ? "#10B981" : "rgba(255,255,255,0.4)",
             background: done ? "linear-gradient(135deg,#34D399,#047857)" : "transparent",
           }}>
        {done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/></svg>}
      </div>
      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
           style={{ background: done ? "rgba(52,211,153,0.20)" : "rgba(245,158,11,0.20)" }}>
        {icon}
      </div>
      <div className="flex-1 text-white text-[12.5px] font-semibold">
        {done ? <span className="line-through opacity-60">{label}</span> : label}
      </div>
      <div className="text-[10px] text-slate-400 font-bold">{meta}</div>
    </div>
  );
}

function NuSays({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3 mb-3 rounded-2xl"
         style={{
           background: "linear-gradient(135deg, rgba(167,139,250,0.18), rgba(124,58,237,0.10))",
           border: "1px dashed rgba(167,139,250,0.45)",
         }}>
      <div className="text-[9.5px] font-black tracking-[0.14em] uppercase text-violet-300 mb-1">
        💡 Nu suggests
      </div>
      <div className="text-white text-[12.5px] leading-relaxed">{children}</div>
    </div>
  );
}

function VoiceHint({ text }: { text: string }) {
  return (
    <div className="mx-1 mt-1 text-center text-[11px] text-slate-400 font-semibold">
      Try:&nbsp; <b className="text-violet-300">{text}</b>
    </div>
  );
}

function MiniCurve() {
  // Fake glucose curve — mostly flat in range with a small bump
  const path = "M 0 45 L 20 42 L 40 40 L 60 38 L 80 34 L 100 32 L 120 42 L 140 55 L 160 60 L 180 52 L 200 45 L 220 38 L 240 34 L 260 32 L 280 34 L 300 36 L 320 34";
  return (
    <svg viewBox="0 0 320 80" className="w-full mt-2" preserveAspectRatio="none">
      <defs>
        <linearGradient id="glucoseFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3B82F6" stopOpacity="0.35"/>
          <stop offset="1" stopColor="#3B82F6" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* target range band */}
      <rect x="0" y="28" width="320" height="30" fill="rgba(16,185,129,0.10)"/>
      <line x1="0" y1="28" x2="320" y2="28" stroke="rgba(16,185,129,0.4)" strokeDasharray="2 3"/>
      <line x1="0" y1="58" x2="320" y2="58" stroke="rgba(245,158,11,0.4)" strokeDasharray="2 3"/>
      <path d={path + " L 320 80 L 0 80 Z"} fill="url(#glucoseFill)"/>
      <path d={path} stroke="#60A5FA" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function lighten(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * 0.35);
  const to2 = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to2(mix(r))}${to2(mix(g))}${to2(mix(b))}`;
}
