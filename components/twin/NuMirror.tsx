import { useEffect, useRef, useState } from "react";
import TouchpointIcon from "./TouchpointIcon";
import type { IconKind } from "../../lib/twinData";

// ============================================================================
// Data — 6 positive + 6 improvement touchpoints, tuned to Sally's demo profile.
// ============================================================================

export interface MirrorPoint {
  id: string;
  side: "positive" | "improvement";
  label: string;
  icon: IconKind;
  headline: string;
  detail: string;
  metric?: string;
}

export const POSITIVE: MirrorPoint[] = [
  { id: "tir",     side: "positive", label: "TIR is climbing",       icon: "cgm",    metric: "71% → 87%",
    headline: "Time-in-Range moved 16 points in 14 days.",
    detail: "You've had the strongest two weeks of your program. Post-dinner walks are the main driver. Keep the ritual." },
  { id: "streak",  side: "positive", label: "5-day walk streak",     icon: "streak", metric: "5 days",
    headline: "You've walked after dinner five days running.",
    detail: "Your longest streak this year was 12 days in April. You're within reach again. Six today keeps it alive." },
  { id: "weight",  side: "positive", label: "Weight trending down",  icon: "weight", metric: "-7 lbs",
    headline: "You're down 7 lbs in 14 days.",
    detail: "Steady 0.5 lb/day trajectory — exactly where I'd want you. Two flat mid-week days were sodium, not fat. Trust the trend." },
  { id: "sleep",   side: "positive", label: "Sleep is steady",       icon: "bed",    metric: "7.3 h avg",
    headline: "You've averaged 7.3 hours over the two weeks.",
    detail: "Wake-time consistency is your best sleep-quality lever, and you're holding it 5 of 7 nights. Small win — worth naming." },
  { id: "coach",   side: "positive", label: "Coach cadence held",    icon: "coach",  metric: "2/2 sessions",
    headline: "You've kept both bi-weekly check-ins with Maya.",
    detail: "Members who keep their coach cadence in weeks 10-14 show 22% better TIR at week 26. You're setting yourself up." },
  { id: "mood",    side: "positive", label: "Mood is steady",        icon: "mood",   metric: "Steady",
    headline: "Sentiment has been steady this fortnight.",
    detail: "One 5/5 stress day on Wednesday didn't cascade into the rest of the week. That resilience is new. Nu is noticing." },
];

export const IMPROVEMENT: MirrorPoint[] = [
  { id: "meds",     side: "improvement", label: "Sunday dose skips",         icon: "meds",     metric: "2 in 4 weeks",
    headline: "Two Sunday morning semaglutide doses missed.",
    detail: "Always Sunday. Likely tied to family brunches. Moving the reminder to Saturday evening resets this for 78% of members like you." },
  { id: "stress",   side: "improvement", label: "Weekend stress spikes",     icon: "stress",   metric: "3 Sat afternoons",
    headline: "Stress climbs Saturday afternoons.",
    detail: "Your afternoon glucose bumps track it. A 2-minute box breathing at 3 PM has flattened your Sunday curves by 30% when you do it." },
  { id: "water",    side: "improvement", label: "Water is below your line",  icon: "water",    metric: "5 glasses avg",
    headline: "You're averaging 5 glasses on weekdays.",
    detail: "Your hydrated days show 15% lower glucose variability. Two glasses before lunch is your biggest lever. Coffee doesn't count." },
  { id: "postmeal", side: "improvement", label: "Dinner peaks climbing",     icon: "postmeal", metric: "Tue+Wed",
    headline: "Tue and Wed dinner peaks trending up.",
    detail: "Both were higher-carb meals with no walk after. Walking within 30 min drops peaks by 22 mg/dL for you." },
  { id: "wake",     side: "improvement", label: "Weekend wake-time drift",   icon: "sun",      metric: "+45 min",
    headline: "Weekend wake time drifts 45 min later.",
    detail: "That's the single biggest driver of your Monday fasting glucose bump. Even 20 minutes of consistency would matter." },
  { id: "checkin",  side: "improvement", label: "Community check-in missed", icon: "engage",   metric: "1 skipped",
    headline: "You skipped Thursday's cohort challenge check-in.",
    detail: "Not a big deal — but on the days you engage the group, your evening TIR is 8% higher. Peer effect is real for you." },
];

export const SALLY = {
  initials: "SR",
  name: "Sally Reddy",
  positiveCount: POSITIVE.length,
  improvementCount: IMPROVEMENT.length,
};

// ============================================================================
// Component
// ============================================================================
interface Props {
  size?: number;
  onSelect?: (p: MirrorPoint) => void;
}

export default function NuMirror({ size = 900, onSelect }: Props) {
  const W = size, H = size * 0.65;
  const cx = W / 2, cy = H / 2;
  const rx = W * 0.43;
  const archHeight = H * 0.34;

  const leftX = cx - rx, rightX = cx + rx;
  const topCtrl    = { x: cx, y: cy - archHeight };
  const bottomCtrl = { x: cx, y: cy + archHeight };

  const topAt = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * leftX + 2 * u * t * topCtrl.x + t * t * rightX,
      y: u * u * cy     + 2 * u * t * topCtrl.y + t * t * cy,
    };
  };
  const bottomAt = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * leftX + 2 * u * t * bottomCtrl.x + t * t * rightX,
      y: u * u * cy     + 2 * u * t * bottomCtrl.y + t * t * cy,
    };
  };
  const topPositions = POSITIVE.map((_, i)    => topAt((i + 1) / (POSITIVE.length + 1)));
  const botPositions = IMPROVEMENT.map((_, i) => bottomAt((i + 1) / (IMPROVEMENT.length + 1)));

  // ---- Ambient touchpoint pulse ----
  const [pulseId, setPulseId] = useState<string | null>(null);
  useEffect(() => {
    const all = [...POSITIVE.map(p => p.id), ...IMPROVEMENT.map(p => p.id)];
    const t = window.setInterval(() => {
      const id = all[Math.floor(Math.random() * all.length)];
      setPulseId(id);
      window.setTimeout(() => setPulseId(prev => (prev === id ? null : prev)), 900);
    }, 2400);
    return () => window.clearInterval(t);
  }, []);

  // ---- Iris eye-tracking + autonomous drift ----
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [driftOffset,   setDriftOffset]   = useState({ x: 0.15, y: -0.05 });
  const [isPointerActive, setIsPointerActive] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Autonomous drift — Nu looks around the room every ~3s.
  useEffect(() => {
    if (isPointerActive) return;
    const t = window.setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.35 + Math.random() * 0.55;
      setDriftOffset({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.35,   // less vertical
      });
    }, 3000);
    return () => window.clearInterval(t);
  }, [isPointerActive]);

  // Blink every ~7s
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    const t = window.setInterval(() => {
      setIsBlinking(true);
      window.setTimeout(() => setIsBlinking(false), 160);
    }, 7000 + Math.random() * 2000);
    return () => window.clearInterval(t);
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    setPointerOffset({
      x: Math.max(-1, Math.min(1, dx)),
      y: Math.max(-1, Math.min(1, dy * 0.5)),
    });
  }

  const offset = isPointerActive ? pointerOffset : driftOffset;
  const maxMoveX = archHeight * 0.30;
  const maxMoveY = archHeight * 0.14;
  const irisDx = offset.x * maxMoveX;
  const irisDy = offset.y * maxMoveY;

  // Pupil dilates slightly when a touchpoint pulses
  const pupilR = archHeight * (pulseId ? 0.19 : 0.16);

  // ---- Hover state for touchpoints ----
  const [hoverId, setHoverId] = useState<string | null>(null);
  const hoverPoint =
    POSITIVE.find(p => p.id === hoverId) ??
    IMPROVEMENT.find(p => p.id === hoverId) ?? null;

  const irisR = archHeight * 0.42;

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{ width: W, height: H }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPointerActive(true)}
      onMouseLeave={() => setIsPointerActive(false)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block">
        <defs>
          {/* Radial page-wash */}
          <radialGradient id="mirBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#F5F3FF" stopOpacity="1" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          {/* Sclera (cream white) with cool-blue rim shadow */}
          <radialGradient id="scleraGrad" cx="50%" cy="45%" r="60%">
            <stop offset="0%"  stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#F1F4FA" />
            <stop offset="100%" stopColor="#D6DEF0" />
          </radialGradient>
          {/* Iris — deeper, more dimensional */}
          <radialGradient id="irisGrad" cx="45%" cy="35%" r="65%">
            <stop offset="0%"  stopColor="#C4B5FD" />
            <stop offset="35%" stopColor="#7C6BFF" />
            <stop offset="80%" stopColor="#3730A3" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </radialGradient>
          {/* Iris rim (dark limbus around edge) */}
          <radialGradient id="irisLimbus" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#0F0A28" stopOpacity="0" />
            <stop offset="100%" stopColor="#0F0A28" stopOpacity="0.9" />
          </radialGradient>
          {/* Arc gradients (already there — kept) */}
          <linearGradient id="topArcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#10B981" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="botArcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#F59E0B" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.15" />
          </linearGradient>
          {/* Arc emboss highlight (subtle inside-of-lid glow) */}
          <linearGradient id="topHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="botHighlight" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          {/* Emboss drop shadow filter for arcs */}
          <filter id="arcShadow" x="-20%" y="-30%" width="140%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetBlur" />
            <feComponentTransfer><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Concave inner shadow for the sclera */}
          <filter id="scleraInset" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="3" result="off" />
            <feComposite in="off" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inset" />
            <feColorMatrix in="inset" values="0 0 0 0 0.10  0 0 0 0 0.13  0 0 0 0 0.22  0 0 0 0.55 0" result="shad" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="shad" />
            </feMerge>
          </filter>
        </defs>

        {/* Background wash */}
        <ellipse cx={cx} cy={cy} rx={rx * 1.05} ry={archHeight * 1.15} fill="url(#mirBg)" />

        {/* Sclera — the "eyeball white" with a concave inner shadow */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx * 0.98}
          ry={archHeight * 0.98}
          fill="url(#scleraGrad)"
          filter="url(#scleraInset)"
          className={isBlinking ? "eye-blink" : ""}
        />

        {/* Top arc — Positive (with drop shadow + inner highlight) */}
        <g filter="url(#arcShadow)">
          <path d={`M ${leftX} ${cy} Q ${topCtrl.x} ${topCtrl.y} ${rightX} ${cy}`}
                fill="none" stroke="url(#topArcGrad)" strokeWidth="3.6" strokeLinecap="round" />
        </g>
        {/* Top arc highlight ribbon (embossed sheen) */}
        <path d={`M ${leftX} ${cy - 1} Q ${topCtrl.x} ${topCtrl.y - 3} ${rightX} ${cy - 1}`}
              fill="none" stroke="url(#topHighlight)" strokeWidth="1.4" strokeLinecap="round" />

        {/* Bottom arc — Improvement */}
        <g filter="url(#arcShadow)">
          <path d={`M ${leftX} ${cy} Q ${bottomCtrl.x} ${bottomCtrl.y} ${rightX} ${cy}`}
                fill="none" stroke="url(#botArcGrad)" strokeWidth="3.6" strokeLinecap="round" />
        </g>
        <path d={`M ${leftX} ${cy + 1} Q ${bottomCtrl.x} ${bottomCtrl.y + 3} ${rightX} ${cy + 1}`}
              fill="none" stroke="url(#botHighlight)" strokeWidth="1" strokeLinecap="round" />

        {/* Corner sparkles at left/right vertices */}
        <VertexSparkle x={leftX}  y={cy} />
        <VertexSparkle x={rightX} y={cy} />

        {/* Iris + pupil group — this is what moves */}
        <g
          className="iris-eye"
          style={{
            transform: `translate(${irisDx}px, ${irisDy}px)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: isPointerActive
              ? "transform 0.12s cubic-bezier(0.22, 1, 0.36, 1)"
              : "transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)",
            transformBox: "fill-box",
          }}
        >
          {/* Iris — layered gradients for depth */}
          <circle cx={cx} cy={cy} r={irisR} fill="url(#irisGrad)" />
          {/* Iris spoke texture (subtle radial lines) */}
          <g stroke="#A5B4FC" strokeWidth="1" opacity="0.35">
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i / 24) * Math.PI * 2;
              const inner = irisR * 0.35;
              const outer = irisR * 0.85;
              const x1 = cx + inner * Math.cos(a);
              const y1 = cy + inner * Math.sin(a);
              const x2 = cx + outer * Math.cos(a);
              const y2 = cy + outer * Math.sin(a);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>
          {/* Limbus (dark rim) */}
          <circle cx={cx} cy={cy} r={irisR} fill="url(#irisLimbus)" />
          {/* Pupil */}
          <circle cx={cx} cy={cy} r={pupilR} fill="#05030F"
                  style={{ transition: "r 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          {/* Highlight sparkle on iris */}
          <circle cx={cx - archHeight * 0.10} cy={cy - archHeight * 0.13}
                  r={archHeight * 0.055} fill="#FFFFFF" opacity="0.85" />
          {/* Tiny secondary highlight */}
          <circle cx={cx + archHeight * 0.14} cy={cy + archHeight * 0.08}
                  r={archHeight * 0.022} fill="#FFFFFF" opacity="0.45" />
          {/* Sally identity — placed on iris, moves with the eye */}
          <text x={cx} y={cy - archHeight * 0.25} textAnchor="middle" fill="#E0E7FF"
                fontSize={11} fontWeight={900} letterSpacing="1.6">
            NU · SEES · YOU
          </text>
          <text x={cx} y={cy + archHeight * 0.32} textAnchor="middle" fill="#E0E7FF"
                fontSize={10.5} fontWeight={800} letterSpacing="1.2">
            {SALLY.initials} · DAY 91
          </text>
        </g>

        {/* Positive touchpoints (top arc) */}
        {POSITIVE.map((pt, i) => {
          const p = topPositions[i];
          const isPulsing = pulseId === pt.id;
          const isHover = hoverId === pt.id;
          const r = isHover ? 14 : isPulsing ? 12 : 10;
          return (
            <g key={pt.id}
               onMouseEnter={() => setHoverId(pt.id)}
               onMouseLeave={() => setHoverId(prev => (prev === pt.id ? null : prev))}
               onClick={() => onSelect?.(pt)}
               style={{ cursor: "pointer" }}>
              {isPulsing && <circle cx={p.x} cy={p.y} r={r + 8} fill="#10B981" opacity={0.20} className="pulse-aura" />}
              {isHover   && <circle cx={p.x} cy={p.y} r={r + 6} fill="none" stroke="#10B981" strokeWidth={1.6} />}
              <circle cx={p.x} cy={p.y} r={r} fill="#FFFFFF" stroke="#10B981" strokeWidth={2.4}
                      style={{ filter: "drop-shadow(0 2px 3px rgba(16,185,129,0.25))" }} />
              <g transform={`translate(${p.x - 6}, ${p.y - 6})`}>
                <TouchpointIcon kind={pt.icon} color="#10B981" size={12} />
              </g>
              <text x={p.x} y={p.y - r - 12} textAnchor="middle" fill="#065F46"
                    fontSize={10.5} fontWeight={900} letterSpacing="0.3">{pt.label}</text>
              {pt.metric && (
                <text x={p.x} y={p.y - r - 24} textAnchor="middle" fill="#059669"
                      fontSize={9} fontWeight={800} letterSpacing="1.2">{pt.metric}</text>
              )}
            </g>
          );
        })}

        {/* Improvement touchpoints (bottom arc) */}
        {IMPROVEMENT.map((pt, i) => {
          const p = botPositions[i];
          const isPulsing = pulseId === pt.id;
          const isHover = hoverId === pt.id;
          const r = isHover ? 14 : isPulsing ? 12 : 10;
          return (
            <g key={pt.id}
               onMouseEnter={() => setHoverId(pt.id)}
               onMouseLeave={() => setHoverId(prev => (prev === pt.id ? null : prev))}
               onClick={() => onSelect?.(pt)}
               style={{ cursor: "pointer" }}>
              {isPulsing && <circle cx={p.x} cy={p.y} r={r + 8} fill="#F59E0B" opacity={0.20} className="pulse-aura" />}
              {isHover   && <circle cx={p.x} cy={p.y} r={r + 6} fill="none" stroke="#F59E0B" strokeWidth={1.6} />}
              <circle cx={p.x} cy={p.y} r={r} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={2.4}
                      style={{ filter: "drop-shadow(0 2px 3px rgba(245,158,11,0.25))" }} />
              <g transform={`translate(${p.x - 6}, ${p.y - 6})`}>
                <TouchpointIcon kind={pt.icon} color="#B45309" size={12} />
              </g>
              <text x={p.x} y={p.y + r + 20} textAnchor="middle" fill="#92400E"
                    fontSize={10.5} fontWeight={900} letterSpacing="0.3">{pt.label}</text>
              {pt.metric && (
                <text x={p.x} y={p.y + r + 32} textAnchor="middle" fill="#B45309"
                      fontSize={9} fontWeight={800} letterSpacing="1.2">{pt.metric}</text>
              )}
            </g>
          );
        })}

        {/* Side-of-eye labels */}
        <text x={cx} y={cy - archHeight - 24} textAnchor="middle" fill="#065F46"
              fontSize={10} fontWeight={900} letterSpacing="2">
          WHAT NU CELEBRATES · {SALLY.positiveCount}
        </text>
        <text x={cx} y={cy + archHeight + 32} textAnchor="middle" fill="#92400E"
              fontSize={10} fontWeight={900} letterSpacing="2">
          WHAT NU IS WATCHING · {SALLY.improvementCount}
        </text>
      </svg>

      {/* Hover tooltip */}
      {hoverPoint && (
        <div className="absolute top-2 right-2 max-w-[280px] rounded-xl bg-white shadow-xl border p-3"
             style={{ borderColor: hoverPoint.side === "positive" ? "#A7F3D0" : "#FDE68A" }}>
          <div className="text-[9px] font-black uppercase tracking-[0.14em] mb-0.5"
               style={{ color: hoverPoint.side === "positive" ? "#059669" : "#B45309" }}>
            {hoverPoint.side === "positive" ? "Nu celebrates" : "Nu is watching"}
          </div>
          <div className="text-[13px] font-black text-slate-900 leading-tight mb-1">{hoverPoint.label}</div>
          <div className="text-[11px] text-slate-600 font-medium leading-snug">{hoverPoint.headline}</div>
          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-black mt-2">Tap for details →</div>
        </div>
      )}

      <style jsx>{`
        .pulse-aura { animation: pulseAura 0.9s ease-out; }
        .eye-blink  { animation: blink 0.16s ease-in-out; }
        @keyframes pulseAura {
          0%   { opacity: 0.35; transform: scale(1); }
          100% { opacity: 0;    transform: scale(1.6); }
        }
        @keyframes blink {
          0%, 100% { transform: scaleY(1); }
          50%      { transform: scaleY(0.06); }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Small helper — a 4-point sparkle glint at each eye corner
// ============================================================================
function VertexSparkle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`} className="vertex-sparkle">
      <circle r={5} fill="#FFFFFF" opacity="0.85" />
      <circle r={2.5} fill="#7C6BFF" />
      {/* Cross-glint */}
      <line x1={-9} y1={0} x2={9} y2={0} stroke="#7C6BFF" strokeWidth="1" opacity="0.5" />
      <line x1={0} y1={-9} x2={0} y2={9} stroke="#7C6BFF" strokeWidth="1" opacity="0.5" />
      <style jsx>{`
        .vertex-sparkle { animation: sparkle 3.5s ease-in-out infinite; transform-origin: center; }
        @keyframes sparkle {
          0%, 100% { opacity: 0.75; }
          50%      { opacity: 1; }
        }
      `}</style>
    </g>
  );
}
