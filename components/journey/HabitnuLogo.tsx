/**
 * HabitnuLogo — approximation of the brand wordmark until the real PNG lands.
 * "h" + "u" in coral red, "abitn" in indigo blue, small green sprout on the "n".
 *
 * To swap in a real logo file:
 *   1. Drop the PNG at glp1-dashboard/public/habitnu-logo.png
 *   2. Replace this component's body with:
 *        return <img src="/habitnu-logo.png" alt="habitnu" className={`h-6 w-auto ${className}`} />;
 */

interface Props {
  className?: string;
  height?: number;
}

export default function HabitnuLogo({ className = "", height = 22 }: Props) {
  // Wordmark drawn as SVG text so it stays crisp and color-consistent.
  return (
    <svg
      viewBox="0 0 130 32"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height, width: "auto" }}
      className={className}
      aria-label="habitnu"
    >
      {/* "h" in coral red */}
      <text x="0"  y="24" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight={900} fontSize="26" fill="#E63C4E">h</text>
      {/* "abit" in indigo blue */}
      <text x="14" y="24" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight={900} fontSize="26" fill="#3A48B8">abit</text>
      {/* "n" in coral red - the stem for the sprout */}
      <text x="66" y="24" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight={900} fontSize="26" fill="#E63C4E">n</text>
      {/* "u" in indigo blue */}
      <text x="82" y="24" fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif" fontWeight={900} fontSize="26" fill="#3A48B8">u</text>

      {/* Green sprout sitting on top of the "n" */}
      <g transform="translate(70,-3)">
        {/* Left leaf */}
        <path d="M0 10 C -2 5, 3 3, 5 5 C 4 8, 2 10, 0 10 Z" fill="#4FC66C" />
        {/* Right leaf */}
        <path d="M5 5 C 8 2, 12 4, 11 8 C 9 9, 6 8, 5 5 Z" fill="#4FC66C" />
        {/* Stem */}
        <path d="M5 5 L 5 11" stroke="#2FA84B" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
