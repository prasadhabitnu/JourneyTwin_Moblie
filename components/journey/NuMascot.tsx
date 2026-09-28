import { useState } from "react";

/**
 * Nu's mascot — the blue starry little figure with "Nu" on its chest and a
 * green sprout on its head.
 *
 * Defaults to the SVG approximation so there is no /nu-mascot.png 404 noise
 * when the file hasn't been dropped in yet. To swap to the real PNG:
 *   1. Save the PNG at glp1-dashboard/public/nu-mascot.png
 *      (transparent background, roughly square, 512px+ recommended)
 *   2. Set USE_PNG below to `true` and reload.
 * If the PNG then 404s for any reason, the SVG still shows as a fallback.
 */
const USE_PNG = false;

export default function NuMascot({ size = 56 }: { size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!USE_PNG || failed) return <NuMascotSvg size={size} />;
  return (
    <img
      src="/nu-mascot.png"
      alt="Nu"
      width={size}
      height={size}
      draggable={false}
      onError={() => setFailed(true)}
      style={{ display: "block", pointerEvents: "none" }}
    />
  );
}

// ----------------------------------------------------------------------------
// SVG fallback — a stylized approximation. Kept simple; the real PNG replaces it.
// ----------------------------------------------------------------------------
function NuMascotSvg({ size = 56 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Nu mascot"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="nuHead" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#5B4CE0" />
          <stop offset="70%" stopColor="#2A1F9E" />
          <stop offset="100%" stopColor="#160E5C" />
        </radialGradient>
        <radialGradient id="nuBody" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4A3ECC" />
          <stop offset="100%" stopColor="#1B1275" />
        </radialGradient>
        <radialGradient id="nuGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Green sprout on top */}
      <g transform="translate(50, 8)">
        <ellipse cx="-3" cy="0" rx="4" ry="6" transform="rotate(-30 -3 0)" fill="#4FC66C" />
        <ellipse cx="3"  cy="0" rx="4" ry="6" transform="rotate(30 3 0)"   fill="#4FC66C" />
        <path d="M0 4 L0 12" stroke="#2FA84B" strokeWidth="1.6" strokeLinecap="round" />
      </g>

      {/* Head */}
      <ellipse cx="50" cy="34" rx="24" ry="24" fill="url(#nuHead)" />
      {/* Star sparkles on head */}
      <circle cx="38" cy="24" r="1"   fill="#C7D2FE" />
      <circle cx="60" cy="20" r="0.8" fill="#C7D2FE" />
      <circle cx="45" cy="42" r="0.6" fill="#C7D2FE" />
      <circle cx="58" cy="36" r="0.9" fill="#C7D2FE" />
      <circle cx="66" cy="30" r="0.7" fill="#C7D2FE" />
      <circle cx="34" cy="36" r="0.7" fill="#C7D2FE" />

      {/* Cheek glow */}
      <circle cx="38" cy="38" r="4" fill="url(#nuGlow)" />
      <circle cx="62" cy="38" r="4" fill="url(#nuGlow)" />

      {/* Eyes */}
      <ellipse cx="42" cy="34" rx="2.6" ry="3" fill="#B7E4FF" />
      <ellipse cx="58" cy="34" rx="2.6" ry="3" fill="#B7E4FF" />
      <circle cx="42" cy="34" r="1.3" fill="#0F172A" />
      <circle cx="58" cy="34" r="1.3" fill="#0F172A" />

      {/* Small smile */}
      <path d="M45 44 Q50 47 55 44" stroke="#A5B4FC" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* Body */}
      <path
        d="M28 68 Q28 58 40 56 L60 56 Q72 58 72 68 L72 96 Q72 106 60 106 L40 106 Q28 106 28 96 Z"
        fill="url(#nuBody)"
      />
      {/* Body sparkles */}
      <circle cx="36" cy="72" r="0.8" fill="#C7D2FE" />
      <circle cx="64" cy="76" r="0.7" fill="#C7D2FE" />
      <circle cx="42" cy="90" r="0.6" fill="#C7D2FE" />
      <circle cx="58" cy="94" r="0.8" fill="#C7D2FE" />

      {/* "Nu" chest badge */}
      <ellipse cx="50" cy="82" rx="11" ry="8" fill="#1B1275" opacity="0.6" />
      <text x="50" y="85"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="900"
            fontSize="10"
            fill="#E0E7FF">
        Nu
      </text>

      {/* Arms */}
      <ellipse cx="24" cy="76" rx="5" ry="7" fill="url(#nuBody)" />
      <ellipse cx="76" cy="76" rx="5" ry="7" fill="url(#nuBody)" />

      {/* Feet */}
      <ellipse cx="40" cy="112" rx="6" ry="4" fill="#1B1275" />
      <ellipse cx="60" cy="112" rx="6" ry="4" fill="#1B1275" />
    </svg>
  );
}
