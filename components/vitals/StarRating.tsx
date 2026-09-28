import { useId } from "react";

/**
 * 5-star display with half-star precision.
 * Reused across /stars, /journey (Health Compass wedges), and anywhere else a
 * quick "how well is this doing" indicator is useful.
 */
export default function StarRating({
  rating,
  max = 5,
  size = 20,
  gap = 2,
}: {
  rating: number;
  max?: number;
  size?: number;
  gap?: number;
}) {
  return (
    <div className="inline-flex" style={{ gap }}>
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return <StarGlyph key={i} fillPct={fill} size={size} />;
      })}
    </div>
  );
}

export function StarGlyph({ fillPct, size }: { fillPct: number; size: number }) {
  // Stable id per instance so we don't collide across many stars on the page.
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `starfill-${rawId}`;
  const stopPct = `${fillPct * 100}%`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset={stopPct} stopColor="#F59E0B" />
          <stop offset={stopPct} stopColor="#E2E8F0" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L14.9 8.6 L22 9.3 L16.7 14.3 L18.2 22 L12 18.3 L5.8 22 L7.3 14.3 L2 9.3 L9.1 8.6 Z"
        fill={`url(#${gradId})`}
        stroke="#CBD5E1"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/** Map a 0-100 score (like Compass wedge scores) to a 0-5 star rating. */
export function starsFromScore(score: number): number {
  return Math.round((Math.max(0, Math.min(100, score)) / 100) * 5 * 2) / 2;
}
