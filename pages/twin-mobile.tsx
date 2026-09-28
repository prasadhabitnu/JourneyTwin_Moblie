import Head from "next/head";
import Link from "next/link";

/**
 * /twin-mobile — paired mobile mockups inspired by Oura's GLP-1 Insights.
 * Two iPhone frames side-by-side showing:
 *   Screen 1: "Today" home — day arc, metric chips, tonight's Nu move
 *   Screen 2: "Journey Twin Insights" — week arc, educational content, journal
 * Purely visual mockups — no state, no interactivity beyond the CTA hover.
 */
export default function TwinMobilePage() {
  return (
    <>
      <Head>
        <title>Journey Twin · Mobile Preview</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap" />
      </Head>

      <div className="min-h-screen w-full flex flex-col items-center py-10 px-6"
           style={{
             fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
             background: "radial-gradient(ellipse at top, #1E1B4B 0%, #0F0A28 60%, #05030F 100%)",
           }}>
        {/* Header strip */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300 mb-1">Journey Twin · Mobile preview</div>
            <h1 className="text-2xl font-black text-white leading-tight">A day with Nu, in your pocket.</h1>
          </div>
          <nav className="flex gap-2">
            <Link href="/journey" className="text-[11px] font-black text-indigo-200 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition">Web /journey →</Link>
            <Link href="/twin"    className="text-[11px] font-black text-indigo-200 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition">Twin Ring →</Link>
          </nav>
        </div>

        {/* Paired phone frames */}
        <div className="flex flex-col md:flex-row items-start gap-12 md:gap-8 lg:gap-12">
          <PhoneFrame>
            <TodayScreen />
          </PhoneFrame>
          <PhoneFrame>
            <InsightsScreen />
          </PhoneFrame>
        </div>

        {/* Bottom caption */}
        <div className="mt-10 max-w-2xl text-center text-[13px] text-indigo-200/70 font-medium leading-relaxed">
          Two moments from Sally&apos;s Journey Twin on her phone. Left: her Today home, one arc of her day and Nu&apos;s single tonight-move. Right: week-in-review with what Nu is watching about her therapy right now.
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Phone frame (iPhone-ish)
// ============================================================================
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 380, height: 780, borderRadius: 52, padding: 12,
      background: "linear-gradient(180deg, #2A2440 0%, #1A1730 100%)",
      boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 2px #3C3560, 0 0 0 6px #1A1730",
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 40, overflow: "hidden",
        background: "#000",
        position: "relative",
      }}>
        {/* Dynamic island */}
        <div style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          width: 120, height: 30, borderRadius: 20, background: "#000", zIndex: 20,
        }} />
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Status bar (shared)
// ============================================================================
function StatusBar() {
  return (
    <div className="absolute top-0 left-0 right-0 px-8 pt-3 flex items-center justify-between text-white text-[13px] font-black z-30">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px]">•••</span>
        <span className="text-[11px]">📶</span>
        <span className="text-[11px]">🔋</span>
      </div>
    </div>
  );
}

// ============================================================================
// Signature day-arc (used on both screens, different labels)
// ============================================================================
function DayArc({
  leftLabel, rightLabel, dots = 9, nowIndex = 4, subLabel,
}: {
  leftLabel: string; rightLabel: string; dots?: number; nowIndex?: number; subLabel?: string;
}) {
  const W = 340, H = 100;
  const cx = W / 2, cy = H + 40, r = 175;
  // Arc from angle π (left) to 0 (right) — top half only
  const angleAt = (i: number) => Math.PI - (Math.PI * i) / (dots - 1);
  const pt = (i: number) => ({
    x: cx + r * Math.cos(angleAt(i)),
    y: cy - r * Math.sin(angleAt(i)),
  });
  const arcPath = `M ${pt(0).x} ${pt(0).y} A ${r} ${r} 0 0 1 ${pt(dots - 1).x} ${pt(dots - 1).y}`;
  const nowPt = pt(nowIndex);
  return (
    <div className="relative" style={{ width: "100%", height: H + 40 }}>
      <svg viewBox={`0 0 ${W} ${H + 40}`} width="100%" height="100%" style={{ overflow: "visible" }}>
        {/* the arc */}
        <path d={arcPath} fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
        {/* dots */}
        {Array.from({ length: dots }).map((_, i) => {
          const p = pt(i);
          const isNow = i === nowIndex;
          return (
            <circle key={i} cx={p.x} cy={p.y} r={isNow ? 3 : 1.6}
                    fill="#FFFFFF" opacity={isNow ? 1 : 0.55} />
          );
        })}
        {/* Now glow */}
        <circle cx={nowPt.x} cy={nowPt.y} r={8} fill="none" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />
        {/* end labels */}
        <text x={pt(0).x - 6} y={pt(0).y + 4} textAnchor="end" fill="#B0AFCC" fontSize="10" fontWeight="500">
          {leftLabel}
        </text>
        <text x={pt(dots - 1).x + 6} y={pt(dots - 1).y + 4} textAnchor="start" fill="#B0AFCC" fontSize="10" fontWeight="500">
          {rightLabel}
        </text>
      </svg>
      {subLabel && (
        <div className="absolute left-0 right-0 text-center"
             style={{ top: cy - 60, color: "#E5E4F4", fontSize: 10, fontWeight: 800, letterSpacing: 2 }}>
          {subLabel}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SCREEN 1 — Today home
// ============================================================================
function TodayScreen() {
  return (
    <div className="w-full h-full relative"
         style={{
           background: "linear-gradient(180deg, #1A2E1A 0%, #0F1F14 40%, #08120C 100%)",
           color: "#FFFFFF",
         }}>
      {/* Very subtle forest pattern via radial blobs */}
      <div className="absolute inset-0 opacity-30"
           style={{
             background: "radial-gradient(circle at 20% 30%, #2C4A2C 0%, transparent 40%), radial-gradient(circle at 80% 20%, #1F3A28 0%, transparent 45%)",
           }} />

      <StatusBar />

      {/* Top nav row */}
      <div className="relative z-10 pt-14 px-6 flex items-center justify-between">
        <div className="w-6 h-6 flex flex-col justify-around">
          <span className="block w-full h-[2px] bg-white/85 rounded" />
          <span className="block w-full h-[2px] bg-white/85 rounded" />
          <span className="block w-4/5 h-[2px] bg-white/85 rounded" />
        </div>
        <div className="text-[13px] font-black tracking-[0.2em] text-white/95">HABITNU</div>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-white/85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v13M6 9l6-6 6 6M4 21h16" />
          </svg>
          <div className="w-6 h-6 rounded-full border border-white/70 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white/85" />
          </div>
        </div>
      </div>

      {/* Metric chips */}
      <div className="relative z-10 mt-5 px-4 flex gap-3 overflow-x-auto pb-2"
           style={{ scrollbarWidth: "none" }}>
        <MetricChip glyph="crown" big="87" small="TIR" />
        <MetricChip glyph="moon"  big="84" small="Sleep" />
        <MetricChip glyph="crown" big="91" small="Activity" />
        <MetricChip glyph="scale" big="176" small="Weight" unit="lbs" />
        <MetricChip glyph="heart" big="68" small="RHR" />
      </div>

      {/* Day arc */}
      <div className="relative z-10 mt-5 px-3">
        <DayArc leftLabel="Morning" rightLabel="Evening" dots={9} nowIndex={4} />
      </div>

      {/* Med tag + hero */}
      <div className="relative z-10 -mt-2 px-6 text-center">
        <div className="flex items-center justify-center mb-1">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <svg className="w-3.5 h-3.5 text-white/85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6l-8 12M9 3l6 6M4 20l4-4" />
            </svg>
          </div>
        </div>
        <div className="text-[10px] tracking-[0.22em] font-black text-white/70 mb-2">SEMAGLUTIDE 0.5MG</div>
        <h2 className="text-white leading-tight mb-2"
            style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontSize: 30, fontWeight: 400 }}>
          Tonight&apos;s one move
        </h2>
        <div className="text-[12.5px] text-white/70 font-medium px-4 mb-4 leading-snug">
          A 20-min walk within 30 min of dinner. Nu will nudge at 7:15 PM.
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <button className="px-4 py-2 rounded-full border border-white/25 text-white text-[12px] font-black flex items-center gap-1.5 bg-white/5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            Snooze
          </button>
          <button className="px-4 py-2 rounded-full border border-white/25 text-white text-[12px] font-black flex items-center gap-1.5 bg-white/5">
            <span className="text-sm">+</span> Log a meal
          </button>
        </div>
      </div>

      {/* Sleep card peek + bottom nav */}
      <div className="absolute bottom-16 left-4 right-4 z-10">
        <div className="rounded-2xl p-4 flex items-center gap-3"
             style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-9 h-9 rounded-full border border-white/25 flex items-center justify-center">
            <svg className="w-4 h-4 text-white/85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 15A8 8 0 1 1 9 4a5 5 0 0 0 11 11z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-black text-white">Sleep</div>
            <div className="text-[11px] font-black text-emerald-400">GOOD · 7.5 h</div>
          </div>
          <svg className="w-4 h-4 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav active="today" />
    </div>
  );
}

function MetricChip({ glyph, big, small, unit }: { glyph: string; big: string; small: string; unit?: string }) {
  return (
    <div className="shrink-0 rounded-full px-3 py-2 flex flex-col items-center min-w-[64px]"
         style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="mb-0.5">
        <MetricGlyph kind={glyph} />
      </div>
      <div className="text-white text-[16px] font-black tabular-nums leading-none">
        {big}{unit && <span className="text-[9px] font-bold text-white/60 ml-0.5">{unit}</span>}
      </div>
      <div className="text-[9px] text-white/60 font-black uppercase tracking-wider">{small}</div>
    </div>
  );
}

function MetricGlyph({ kind }: { kind: string }) {
  const p = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none",
              stroke: "rgba(255,255,255,0.75)", strokeWidth: 2 as unknown as number,
              strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "crown") return <svg {...p}><path d="M3 18l2-9 4 4 3-6 3 6 4-4 2 9z" /></svg>;
  if (kind === "moon")  return <svg {...p}><path d="M20 15A8 8 0 1 1 9 4a5 5 0 0 0 11 11z" /></svg>;
  if (kind === "scale") return <svg {...p}><rect x="4" y="6" width="16" height="14" rx="2" /><circle cx="12" cy="13" r="3" /></svg>;
  if (kind === "heart") return <svg {...p}><path d="M12 21s-7-4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 5-9 9-9 9z" /></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="4" /></svg>;
}

function BottomNav({ active }: { active: "today" | "twin" | "health" }) {
  const items = [
    { key: "today",  label: "Today",     icon: "sun" },
    { key: "twin",   label: "Twin",      icon: "leaf" },
    { key: "health", label: "My Health", icon: "hex" },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 pb-6 pt-2 z-20 flex items-center justify-around px-6"
         style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.6))" }}>
      {items.map(it => {
        const isActive = it.key === active;
        return (
          <div key={it.key} className="flex flex-col items-center">
            <NavGlyph kind={it.icon} active={isActive} />
            <div className={"text-[9px] font-black uppercase tracking-wider mt-0.5 " +
              (isActive ? "text-white" : "text-white/50")}>
              {it.label}
            </div>
          </div>
        );
      })}
      {/* Plus button */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
           style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)" }}>
        +
      </div>
    </div>
  );
}

function NavGlyph({ kind, active }: { kind: string; active: boolean }) {
  const color = active ? "#FFFFFF" : "rgba(255,255,255,0.55)";
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
              stroke: color, strokeWidth: 2 as unknown as number,
              strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "sun")  return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" /></svg>;
  if (kind === "leaf") return <svg {...p}><path d="M5 21c0-8 6-14 14-14 0 8-6 14-14 14z" /><path d="M5 21c3-3 6-6 9-9" /></svg>;
  if (kind === "hex")  return <svg {...p}><path d="M12 2l9 5v10l-9 5-9-5V7z" /></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="4" /></svg>;
}

// ============================================================================
// SCREEN 2 — Journey Twin Insights
// ============================================================================
function InsightsScreen() {
  return (
    <div className="w-full h-full relative overflow-y-auto"
         style={{
           background: "linear-gradient(180deg, #0D0B1F 0%, #06050F 100%)",
           color: "#FFFFFF",
         }}>
      <StatusBar />

      {/* Header */}
      <div className="relative z-10 pt-14 px-5 flex items-center justify-between">
        <svg className="w-5 h-5 text-white/85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 6 9 12 15 18" />
        </svg>
        <div className="text-[13px] font-black text-white/95">Journey Twin</div>
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-white/85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6"  x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="9" cy="6" r="2" fill="currentColor" />
            <circle cx="15" cy="12" r="2" fill="currentColor" />
            <circle cx="7" cy="18" r="2" fill="currentColor" />
          </svg>
          <div className="text-lg text-white/85">+</div>
        </div>
      </div>

      {/* Arc + label */}
      <div className="relative z-10 mt-8 px-3">
        <DayArc leftLabel="Mon" rightLabel="Sun" dots={7} nowIndex={2} subLabel="3 SESSIONS UNTIL WEEK 13 REVIEW" />
      </div>

      {/* Body */}
      <div className="relative z-10 px-5 pt-2 pb-24">
        <h2 className="text-white leading-tight mb-3"
            style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontSize: 26, fontWeight: 400 }}>
          What Nu is watching this week
        </h2>
        <p className="text-[13px] text-white/70 font-medium leading-relaxed mb-3">
          You&apos;re in week 13 of GLP-1 therapy. Many members hit an appetite plateau around this window — you haven&apos;t, and your Time-in-Range is climbing. What Nu is watching is your two skipped Sunday doses. Saturday-evening reminders reset this pattern for 78% of members like you.
        </p>
        <button className="text-[12px] font-black text-white/70 flex items-center gap-1 mb-6">
          Less
          <span className="text-[9px]">▲</span>
        </button>

        {/* Details */}
        <div className="text-[10px] tracking-[0.2em] font-black text-white/50 mb-2">DETAILS</div>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <InfoTile label="CURRENT PATH" value="Long Walker" />
          <InfoTile label="THIS WEEK" value="TIR 87% ↑" />
          <InfoTile label="LAST DOSE" value="Sun, Jul 5" />
          <InfoTile label="SCHEDULE" value="Every 7 days" />
        </div>

        {/* Daily Journal */}
        <div className="text-[10px] tracking-[0.2em] font-black text-white/50 mb-2">DAILY JOURNAL</div>
        <div className="flex gap-2 flex-wrap mb-5">
          <TagChip label="+ Add a tag" outline />
          <TagChip label="🥗 Salad" />
          <TagChip label="🚶 Post-dinner walk" />
          <TagChip label="😊 Steady" />
        </div>

        {/* Goal */}
        <div className="text-[10px] tracking-[0.2em] font-black text-white/50 mb-2">GOAL</div>
        <div className="rounded-2xl p-4"
             style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="text-[11px] font-black text-white/60 uppercase tracking-wider mb-1">Reach 95% TIR</div>
          <div className="w-full h-1.5 rounded-full bg-white/10 mb-2">
            <div className="h-full rounded-full" style={{ width: "92%", background: "linear-gradient(90deg, #10B981, #34D399)" }} />
          </div>
          <div className="text-[12px] font-medium text-white/70 leading-snug">
            You&apos;re at 87%. Three cleaner post-dinner windows likely close the gap.
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-3"
         style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="text-[9px] font-black text-white/50 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-black text-white">{value}</div>
        <svg className="w-3.5 h-3.5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </div>
    </div>
  );
}

function TagChip({ label, outline }: { label: string; outline?: boolean }) {
  return (
    <div className={"px-3 py-1.5 rounded-full text-[11px] font-black " +
      (outline ? "border border-white/25 text-white/80 bg-transparent" : "bg-white/10 text-white border border-white/10")}>
      {label}
    </div>
  );
}
