import React from "react";

/**
 * ForecastDetailSheet - shared modal that drills into the Nu Noticed / Nu Predicts /
 * What Could Slow You Down cards. Same component is reused by Your Trend and CGM
 * Summary steps with variant-specific content passed in.
 */

export type ForecastVariant = "noticed" | "predicts" | "warning";

interface Bullet { label: string; sub?: string; accent?: string }

interface Scenario { name: string; endPoint: string; endLabel: string; color: string; points: number[]; caption: string }

interface Props {
  variant: ForecastVariant;
  eyebrow: string;
  title: string;
  intro: string;
  bullets?: Bullet[];
  scenarios?: Scenario[];    // used by "predicts" variant
  footnote?: string;
  onClose: () => void;
}

const CHROME: Record<ForecastVariant, { badgeBg: string; eyebrowColor: string; accent: string }> = {
  noticed:  { badgeBg: "linear-gradient(135deg, #DBEAFE 0%, #EEF2FF 100%)", eyebrowColor: "#4338CA", accent: "#4F5FE5" },
  predicts: { badgeBg: "linear-gradient(135deg, #EDE9FE 0%, #F5F1FF 100%)", eyebrowColor: "#5B21B6", accent: "#8B5CF6" },
  warning:  { badgeBg: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)", eyebrowColor: "#B45309", accent: "#F59E0B" },
};

export default function ForecastDetailSheet(props: Props) {
  const { variant, eyebrow, title, intro, bullets, scenarios, footnote, onClose } = props;
  const chrome = CHROME[variant];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
         style={{ background: "rgba(15,23,42,0.55)" }}>
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="p-6 flex items-center gap-4 border-b border-slate-100" style={{ background: chrome.badgeBg }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-white/70 shadow-sm">
            <VariantIcon variant={variant} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: chrome.eyebrowColor }}>
              {eyebrow}
            </div>
            <div className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{title}</div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-500 hover:text-slate-800 font-black leading-none">×</button>
        </div>

        {/* Intro */}
        <div className="px-6 pt-5 pb-2 text-[14px] text-slate-700 font-medium leading-relaxed">
          {intro}
        </div>

        {/* Scenarios (predicts variant) */}
        {scenarios && (
          <div className="px-6 pt-3 pb-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenarios.map((sc, i) => <ScenarioCard key={i} scenario={sc} accent={chrome.accent} />)}
          </div>
        )}

        {/* Bullets */}
        {bullets && bullets.length > 0 && (
          <div className="px-6 pt-3 pb-1 space-y-2">
            {bullets.map((b, i) => <BulletRow key={i} bullet={b} chrome={chrome} />)}
          </div>
        )}

        {/* Footnote */}
        {footnote && (
          <div className="px-6 pt-3 pb-6">
            <div className="text-[12px] italic text-slate-500 font-medium leading-snug">{footnote}</div>
          </div>
        )}

        <div className="px-6 pb-5">
          <button onClick={onClose}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-black uppercase tracking-wider">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Bullet row
// ============================================================================

function BulletRow({ bullet, chrome }: { bullet: Bullet; chrome: typeof CHROME[ForecastVariant] }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/40">
      <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: chrome.badgeBg }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: chrome.accent }} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-slate-800 leading-snug">{bullet.label}</div>
        {bullet.sub && (
          <div className="text-[11px] font-medium mt-0.5" style={{ color: bullet.accent ?? "#64748B" }}>
            {bullet.sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Scenario card with mini-chart
// ============================================================================

function ScenarioCard({ scenario, accent }: { scenario: Scenario; accent: string }) {
  const w = 220, h = 76, padL = 22, padR = 8, padT = 8, padB = 18;
  const min = Math.min(...scenario.points) - 4;
  const max = Math.max(...scenario.points) + 4;
  const xAt = (i: number) => padL + (i / (scenario.points.length - 1)) * (w - padL - padR);
  const yAt = (v: number) => padT + (1 - (v - min) / (max - min)) * (h - padT - padB);
  const path = scenario.points.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(v)}`).join(" ");
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">{scenario.name}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#E5E7EB" strokeWidth="1" />
        <path d={path} fill="none" stroke={scenario.color} strokeWidth="2.4" strokeLinejoin="round" />
        {scenario.points.map((v, i) => (
          <circle key={i} cx={xAt(i)} cy={yAt(v)} r={2}
                  fill={i === scenario.points.length - 1 ? scenario.color : accent + "88"} />
        ))}
        {(() => {
          const lastIdx = scenario.points.length - 1;
          const last = scenario.points[lastIdx];
          return (
            <>
              <text x={xAt(lastIdx) - 4} y={yAt(last) - 6} textAnchor="end"
                    fontSize={11} fontWeight={900} fill={scenario.color}>
                {scenario.endPoint}
              </text>
            </>
          );
        })()}
      </svg>
      <div className="text-[12px] font-bold text-slate-700 leading-snug">{scenario.caption}</div>
      <div className="text-[10px] font-black uppercase tracking-wider mt-1" style={{ color: scenario.color }}>{scenario.endLabel}</div>
    </div>
  );
}

// ============================================================================
// Variant icons
// ============================================================================

function VariantIcon({ variant }: { variant: ForecastVariant }) {
  if (variant === "noticed") return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <defs>
        <radialGradient id="nuBodyD" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="60%" stopColor="#4F5FE5" />
          <stop offset="100%" stopColor="#3730A3" />
        </radialGradient>
      </defs>
      <ellipse cx="14" cy="5" rx="2.5" ry="1.8" fill="#10B981" transform="rotate(-20 14 5)" />
      <ellipse cx="16" cy="18" rx="10" ry="10" fill="url(#nuBodyD)" />
      <ellipse cx="12" cy="17" rx="1.6" ry="2" fill="#FFFFFF" />
      <ellipse cx="20" cy="17" rx="1.6" ry="2" fill="#FFFFFF" />
      <circle cx="12" cy="17.5" r="0.8" fill="#0F172A" />
      <circle cx="20" cy="17.5" r="0.8" fill="#0F172A" />
      <path d="M13 21 Q16 23 19 21" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
  if (variant === "predicts") return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <defs>
        <radialGradient id="ballGradD" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="14" r="9" fill="url(#ballGradD)" />
      <ellipse cx="12.5" cy="10.5" rx="2" ry="1.4" fill="#FFFFFF" opacity="0.7" />
      <path d="M10 22 L22 22 L20 26 L12 26 Z" fill="#4C1D95" />
    </svg>
  );
  return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <path d="M16 5 L28 26 L4 26 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="15" y="12" width="2" height="7" fill="#78350F" rx="1" />
      <circle cx="16" cy="22" r="1.3" fill="#78350F" />
    </svg>
  );
}
