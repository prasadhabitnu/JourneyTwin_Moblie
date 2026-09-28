import { useEffect, useMemo, useState } from "react";
import {
  TOUCHPOINTS, SUB_RINGS, CROSS_RING_LINKS, SALLY_TWIN,
  Touchpoint, SubRingDef,
} from "../../lib/twinData";
import TouchpointIcon from "./TouchpointIcon";

/**
 * Journey Twin — constellation layout.
 * Center: Sally hub. 6 small sub-rings orbit her at 60° intervals, each with
 * 3-4 touchpoint dots on its own circumference. Cross-ring lines drawn only
 * for the ~6 correlations that matter (from CROSS_RING_LINKS).
 *
 * Same props as before so pages/twin.tsx keeps working:
 *   size, onSelectTouchpoint, onSelectMarker (marker unused now — the 9 journey
 *   markers are dropped in the constellation view to keep it clean).
 */
interface Props {
  size?: number;
  onSelectTouchpoint?: (t: Touchpoint) => void;
  onSelectMarker?: (m: never) => void; // kept for prop-compat; unused
}

// Local index for fast lookup
const TP_INDEX: Record<string, Touchpoint> = TOUCHPOINTS.reduce((acc, t) => {
  acc[t.id] = t; return acc;
}, {} as Record<string, Touchpoint>);

export default function JourneyTwinRing({ size = 720, onSelectTouchpoint }: Props) {
  const cx = size / 2, cy = size / 2;

  // Layout constants
  const rHub    = size * 0.10;   // center hub radius
  const rOrbit  = size * 0.32;   // distance from canvas-center to each sub-ring's center
  const rRing   = size * 0.11;   // sub-ring circle radius
  const rDot    = size * 0.020;  // touchpoint dot radius

  // Sub-ring centers, evenly spaced starting from top (12 o'clock)
  const subRingCenters = useMemo(() => {
    const N = SUB_RINGS.length;
    return SUB_RINGS.map((sr, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
      return {
        def: sr,
        cx: cx + rOrbit * Math.cos(angle),
        cy: cy + rOrbit * Math.sin(angle),
        angle,
      };
    });
  }, [cx, cy, rOrbit]);

  // Touchpoint positions on each sub-ring's own circumference
  const touchpointPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; ring: SubRingDef }> = {};
    for (const sr of subRingCenters) {
      const K = sr.def.touchpointIds.length;
      // rotate each ring so the "outward" direction gets the first touchpoint
      const outward = Math.atan2(sr.cy - cy, sr.cx - cx);
      sr.def.touchpointIds.forEach((tid, k) => {
        const localAngle = outward + (2 * Math.PI * k) / K - Math.PI / 2;
        positions[tid] = {
          x: sr.cx + rRing * Math.cos(localAngle),
          y: sr.cy + rRing * Math.sin(localAngle),
          ring: sr.def,
        };
      });
    }
    return positions;
  }, [subRingCenters, cx, cy, rRing]);

  // Ambient pulse
  const [pulseId, setPulseId] = useState<string | null>(null);
  useEffect(() => {
    const ids = Object.keys(touchpointPositions);
    if (ids.length === 0) return;
    const timer = window.setInterval(() => {
      const id = ids[Math.floor(Math.random() * ids.length)];
      setPulseId(id);
      window.setTimeout(() => setPulseId(prev => (prev === id ? null : prev)), 900);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [touchpointPositions]);

  // Observation counter
  const [obsCount, setObsCount] = useState(SALLY_TWIN.observationsToday);
  useEffect(() => {
    const t = window.setInterval(() => setObsCount(c => c + 1), 900);
    return () => window.clearInterval(t);
  }, []);

  // Hover
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hoverLink, setHoverLink] = useState<number | null>(null);
  const hoverTouchpoint = hoverId ? TP_INDEX[hoverId] : null;
  const hoverRing = hoverTouchpoint ? touchpointPositions[hoverTouchpoint.id]?.ring : null;

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="block">
        <defs>
          <radialGradient id="twinBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#EEF2FF" stopOpacity="1" />
            <stop offset="70%" stopColor="#F5F3FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hubGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#5B4CE0" />
          </radialGradient>
        </defs>

        {/* Backdrop wash */}
        <circle cx={cx} cy={cy} r={size * 0.48} fill="url(#twinBg)" />

        {/* Cross-ring connection lines (drawn first so dots sit on top) */}
        {CROSS_RING_LINKS.map((link, i) => {
          const a = touchpointPositions[link.from];
          const b = touchpointPositions[link.to];
          if (!a || !b) return null;
          const active = pulseId === link.from || pulseId === link.to || hoverLink === i
                       || hoverId === link.from || hoverId === link.to;
          // curve through a point pulled toward center to keep lines soft + inward
          const mx = cx + (cx - (a.x + b.x) / 2) * -0.3 + ((a.x + b.x) / 2 - cx) * 0.2;
          const my = cy + (cy - (a.y + b.y) / 2) * -0.3 + ((a.y + b.y) / 2 - cy) * 0.2;
          return (
            <g key={i}
               onMouseEnter={() => setHoverLink(i)}
               onMouseLeave={() => setHoverLink(prev => (prev === i ? null : prev))}
               style={{ cursor: "help" }}>
              <path d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                    stroke="#7C6BFF"
                    strokeWidth={active ? 2 : 1}
                    opacity={active ? 0.65 : 0.15}
                    strokeDasharray={active ? "0" : "3 3"}
                    fill="none" />
            </g>
          );
        })}

        {/* Sub-rings (border circles) + labels */}
        {subRingCenters.map(sr => {
          const isRingHovered = hoverRing?.id === sr.def.id;
          return (
            <g key={sr.def.id}>
              {/* Ring fill (soft tint) */}
              <circle cx={sr.cx} cy={sr.cy} r={rRing + 4} fill={sr.def.tint} opacity={0.55} />
              {/* Ring border */}
              <circle cx={sr.cx} cy={sr.cy} r={rRing}
                      fill="none" stroke={sr.def.color}
                      strokeWidth={isRingHovered ? 2.5 : 1.5}
                      opacity={isRingHovered ? 1 : 0.7} />
              {/* Ring label */}
              <text x={sr.cx} y={sr.cy - rRing - 14} textAnchor="middle"
                    fill={sr.def.color} fontSize="11" fontWeight="900" letterSpacing="0.3">
                {sr.def.label}
              </text>
              <text x={sr.cx} y={sr.cy - rRing - 2} textAnchor="middle"
                    fill="#94A3B8" fontSize="9" fontWeight="600">
                {sr.def.touchpointIds.length} streams
              </text>
            </g>
          );
        })}

        {/* Touchpoint dots */}
        {Object.entries(touchpointPositions).map(([tid, pos]) => {
          const t = TP_INDEX[tid];
          if (!t) return null;
          const isPulsing = pulseId === tid;
          const isHover = hoverId === tid;
          const dr = isHover ? rDot + 3 : isPulsing ? rDot + 2 : rDot;
          return (
            <g key={tid}
               onMouseEnter={() => setHoverId(tid)}
               onMouseLeave={() => setHoverId(prev => (prev === tid ? null : prev))}
               onClick={() => onSelectTouchpoint?.(t)}
               style={{ cursor: "pointer" }}>
              {isPulsing && (
                <circle cx={pos.x} cy={pos.y} r={dr + 8} fill={pos.ring.color}
                        opacity={0.22} className="pulse-aura" />
              )}
              {isHover && (
                <circle cx={pos.x} cy={pos.y} r={dr + 6} fill="none"
                        stroke={pos.ring.color} strokeWidth={1.5} opacity={0.9} />
              )}
              <circle cx={pos.x} cy={pos.y} r={dr} fill="#FFFFFF"
                      stroke={pos.ring.color} strokeWidth={2} />
              <g transform={`translate(${pos.x - 6}, ${pos.y - 6})`}>
                <TouchpointIcon kind={t.icon} color={pos.ring.color} size={12} />
              </g>
            </g>
          );
        })}

        {/* Center hub — Sally */}
        <circle cx={cx} cy={cy} r={rHub + 8} fill="#FFFFFF" opacity="0.85" />
        <circle cx={cx} cy={cy} r={rHub + 5} fill="none" stroke="#7C6BFF"
                strokeWidth={2} className="hub-breathe" />
        <circle cx={cx} cy={cy} r={rHub} fill="url(#hubGrad)" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900">
          {SALLY_TWIN.initials}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#E0E7FF"
              fontSize="8.5" fontWeight="800" letterSpacing="1.2">
          JOURNEY TWIN
        </text>
        <text x={cx} y={cy + 23} textAnchor="middle" fill="#E0E7FF"
              fontSize="8.5" fontWeight="600" opacity="0.9">
          Day {SALLY_TWIN.daysWithTwin}
        </text>
      </svg>

      {/* Observation counter (top-left) */}
      <div className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 shadow-sm border border-indigo-100 flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[10px] font-black text-slate-700 tabular-nums">
          {obsCount.toLocaleString()} observations today
        </span>
      </div>

      {/* Touchpoint tooltip (top-right) */}
      {hoverTouchpoint && hoverRing && (
        <div className="absolute top-2 right-2 max-w-[240px] rounded-xl bg-white shadow-xl border p-3"
             style={{ borderColor: hoverRing.color }}>
          <div className="text-[9px] font-black uppercase tracking-[0.14em]"
               style={{ color: hoverRing.color }}>
            {hoverRing.label}
          </div>
          <div className="text-[13px] font-black text-slate-900 leading-tight mb-1">
            {hoverTouchpoint.label}
          </div>
          <div className="text-[11px] text-slate-600 font-medium leading-snug">
            {hoverTouchpoint.learned}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-black mt-2">
            Tap for details →
          </div>
        </div>
      )}

      {/* Cross-ring link tooltip (bottom-right when a line is hovered) */}
      {hoverLink !== null && CROSS_RING_LINKS[hoverLink] && (
        <div className="absolute bottom-2 right-2 max-w-[280px] rounded-xl bg-indigo-600 text-white shadow-xl p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.14em] text-indigo-100 mb-0.5">Cross-ring connection</div>
          <div className="text-[12px] font-medium leading-snug">
            {CROSS_RING_LINKS[hoverLink].why}
          </div>
        </div>
      )}

      <style jsx>{`
        .hub-breathe { animation: hubBreathe 3s ease-in-out infinite;
                       transform-origin: ${cx}px ${cy}px; }
        .pulse-aura  { animation: pulseAura 0.9s ease-out; }
        @keyframes hubBreathe {
          0%, 100% { transform: scale(1);    opacity: 0.8; }
          50%      { transform: scale(1.06); opacity: 1; }
        }
        @keyframes pulseAura {
          0%   { opacity: 0.35; transform: scale(1); }
          100% { opacity: 0;    transform: scale(1.6); }
        }
      `}</style>
    </div>
  );
}
