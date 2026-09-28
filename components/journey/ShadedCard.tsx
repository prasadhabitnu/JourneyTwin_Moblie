import { ReactNode } from "react";

/**
 * Shared shaded card with a jewel-tone gradient border, subtle inner sheen,
 * and a soft outer glow. Use across the journey for premium hero cards.
 *
 *   <ShadedCard tone="gold">...</ShadedCard>
 *   <ShadedCard tone="indigo" borderWidth={2}>...</ShadedCard>
 */

export type ShadeTone = "gold" | "indigo" | "emerald" | "violet" | "rose" | "sky";

const PALETTES: Record<ShadeTone, {
  border: string;         // gradient for the border
  sheenTop: string;       // top-of-card highlight tint
  sheenBottom: string;    // bottom fade tint
  glow: string;           // outer shadow color
}> = {
  gold: {
    border: "linear-gradient(135deg, #F6D77E 0%, #C89A3B 45%, #E8C874 70%, #B07E28 100%)",
    sheenTop:    "rgba(246, 215, 126, 0.18)",
    sheenBottom: "rgba(253, 252, 246, 0.6)",
    glow:        "rgba(200, 154, 59, 0.18)",
  },
  indigo: {
    border: "linear-gradient(135deg, #A5B4FC 0%, #6366F1 45%, #4F5FE5 70%, #4338CA 100%)",
    sheenTop:    "rgba(99, 102, 241, 0.14)",
    sheenBottom: "rgba(245, 246, 255, 0.5)",
    glow:        "rgba(99, 102, 241, 0.20)",
  },
  emerald: {
    border: "linear-gradient(135deg, #6EE7B7 0%, #10B981 45%, #34D399 70%, #047857 100%)",
    sheenTop:    "rgba(52, 211, 153, 0.15)",
    sheenBottom: "rgba(240, 253, 244, 0.5)",
    glow:        "rgba(16, 185, 129, 0.18)",
  },
  violet: {
    border: "linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 45%, #A78BFA 70%, #6D28D9 100%)",
    sheenTop:    "rgba(139, 92, 246, 0.15)",
    sheenBottom: "rgba(250, 245, 255, 0.5)",
    glow:        "rgba(139, 92, 246, 0.20)",
  },
  rose: {
    border: "linear-gradient(135deg, #FDA4AF 0%, #F43F5E 45%, #FB7185 70%, #BE123C 100%)",
    sheenTop:    "rgba(244, 63, 94, 0.14)",
    sheenBottom: "rgba(255, 241, 242, 0.5)",
    glow:        "rgba(244, 63, 94, 0.16)",
  },
  sky: {
    border: "linear-gradient(135deg, #7DD3FC 0%, #0EA5E9 45%, #38BDF8 70%, #0369A1 100%)",
    sheenTop:    "rgba(14, 165, 233, 0.14)",
    sheenBottom: "rgba(240, 249, 255, 0.5)",
    glow:        "rgba(14, 165, 233, 0.18)",
  },
};

interface Props {
  tone: ShadeTone;
  children: ReactNode;
  className?: string;
  padding?: string;
  radius?: number;
  borderWidth?: number;
  glow?: boolean;
}

export default function ShadedCard({
  tone,
  children,
  className = "",
  padding = "p-8",
  radius = 22,
  borderWidth = 3,
  glow = true,
}: Props) {
  const p = PALETTES[tone];
  return (
    <div
      className={`shadow-xl ${className}`}
      style={{
        borderRadius: radius,
        padding: borderWidth,
        background: p.border,
        boxShadow: glow ? `0 20px 40px -12px ${p.glow}` : undefined,
      }}
    >
      <div
        style={{
          borderRadius: radius - borderWidth,
          background: "#FFFFFF",
        }}
        className="relative overflow-hidden"
      >
        {/* Top-left sheen */}
        <div
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${p.sheenTop} 0%, rgba(255,255,255,0) 100%)`,
          }}
        />
        {/* Bottom warm fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{
            background: `linear-gradient(0deg, ${p.sheenBottom} 0%, rgba(255,255,255,0) 100%)`,
          }}
        />
        <div className={`relative ${padding}`}>{children}</div>
      </div>
    </div>
  );
}
