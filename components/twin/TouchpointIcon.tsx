import { IconKind } from "../../lib/twinData";

/**
 * Small SVG glyphs for each touchpoint. Rendered inline so the ring stays a
 * single crisp SVG (no external icon font needed). 16x16 viewport.
 */
export default function TouchpointIcon({ kind, color, size = 14 }: { kind: IconKind; color: string; size?: number }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: 2 as unknown as number,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "cgm":       return <svg {...p}><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>;
    case "fasting":   return <svg {...p}><path d="M12 3v18M6 12h12" /><circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.2" /></svg>;
    case "postmeal":  return <svg {...p}><path d="M3 20l4-6 4 4 4-8 6 6" /></svg>;
    case "hba1c":     return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "weight":    return <svg {...p}><rect x="4" y="6" width="16" height="14" rx="2" /><circle cx="12" cy="13" r="3" /></svg>;
    case "hrv":       return <svg {...p}><path d="M3 12h3l2-4 3 8 3-6 2 3h5" /></svg>;
    case "heart":     return <svg {...p}><path d="M12 21s-7-4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 5-9 9-9 9z" /></svg>;
    case "bp":        return <svg {...p}><path d="M4 12l4 4 4-8 4 4 4-2" /><path d="M3 20h18" /></svg>;
    case "walk":      return <svg {...p}><circle cx="13" cy="4" r="2" fill={color} /><path d="M5 22l4-8 4 5 4-4 3 6" /></svg>;
    case "steps":     return <svg {...p}><circle cx="6" cy="8" r="2" fill={color} /><circle cx="12" cy="12" r="2" fill={color} /><circle cx="18" cy="16" r="2" fill={color} /></svg>;
    case "meal":      return <svg {...p}><path d="M6 3v6M8 3v6M4 3v6M4 9h6M7 9v11" /><path d="M14 3v11M14 3l4 6-4 3" /></svg>;
    case "bed":       return <svg {...p}><path d="M20 15A8 8 0 1 1 9 4a5 5 0 0 0 11 11z" /></svg>;
    case "sun":       return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" /></svg>;
    case "water":     return <svg {...p}><path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z" /></svg>;
    case "meds":      return <svg {...p}><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-30 12 12)" /><path d="M9 15l6-6" /></svg>;
    case "work":      return <svg {...p}><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
    case "family":    return <svg {...p}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="8" r="2" /><path d="M3 21v-1a5 5 0 0 1 10 0v1M14 21v-1a3 3 0 0 1 6 0v1" /></svg>;
    case "travel":    return <svg {...p}><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>;
    case "food_culture": return <svg {...p}><path d="M12 3l2 6 6 1-4.5 4 1.5 6L12 17l-5 3 1.5-6L4 10l6-1 2-6z" /></svg>;
    case "allergy":   return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M5 5l14 14" /></svg>;
    case "food_like": return <svg {...p}><path d="M12 21s-7-4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 5-9 9-9 9z" fill={color} fillOpacity="0.15" /></svg>;
    case "activity_style": return <svg {...p}><circle cx="6" cy="12" r="3" /><circle cx="18" cy="12" r="3" /><path d="M9 12h6" /></svg>;
    case "voice":     return <svg {...p}><path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2" fill={color} /></svg>;
    case "engage":    return <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    case "response":  return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v5l3 2" /></svg>;
    case "stress":    return <svg {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>;
    case "mood":      return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9 15c1 1 5 1 6 0M9 9h.01M15 9h.01" /></svg>;
    case "streak":    return <svg {...p}><path d="M14 3l-3 8h5l-3 10 8-12h-6l3-6z" /></svg>;
    case "coach":     return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 22a8 8 0 0 1 16 0" /></svg>;
    default:          return <svg {...p}><circle cx="12" cy="12" r="6" /></svg>;
  }
}
