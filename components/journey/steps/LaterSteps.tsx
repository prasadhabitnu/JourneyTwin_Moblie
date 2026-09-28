import { useEffect, useState } from "react";
import type React from "react";
import ShadedCard from "../ShadedCard";
import ForecastDetailSheet, { ForecastVariant } from "../ForecastDetailSheet";

// ============================================================================
//  Step 5 - Nu the Kindred Connector
// ============================================================================

export function KindredConnector() {
  const [count, setCount] = useState({ members: 0, pct: 0, delta: 0 });
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setCount({
        members: Math.min(1248, Math.round((1248 * i) / 30)),
        pct:     Math.min(72,   Math.round((72   * i) / 30)),
        delta:   Math.min(18,   Math.round((18   * i) / 30)),
      });
      if (i >= 30) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero row: friends illustration + community headline */}
      <div className="rounded-2xl border shadow-sm bg-white overflow-hidden">
        <div className="grid md:grid-cols-[1.15fr_1fr] gap-0 items-stretch">
          <div className="relative min-h-[280px] bg-gradient-to-br from-rose-50 via-white to-indigo-50">
            <img src="/journey/ppt/friends.png" alt="Members walking together" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="p-6 md:p-8">
            <div className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight mb-3">
              Walks after dinner are working for you.
            </div>
            <div className="text-[14px] text-slate-600 font-medium leading-relaxed mb-5">
              You&apos;re part of a community taking simple steps toward better health.
            </div>
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3" /><circle cx="17" cy="8" r="2.5" /><path d="M2 21c0-4 4-7 7-7s7 3 7 7" /><path d="M14 20c0-3 3-5 6-5" /></svg>
              </div>
              <div>
                <div className="text-3xl font-black text-indigo-700 tabular-nums leading-none">{count.members.toLocaleString()}</div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mt-1">members are walking after dinner</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* People like you */}
      <ShadedCard tone="indigo" padding="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3" /><circle cx="17" cy="8" r="2.5" /><path d="M2 21c0-4 4-7 7-7s7 3 7 7" /><path d="M14 20c0-3 3-5 6-5" /></svg>
          </div>
          <div className="text-xl font-black text-slate-900">People like you</div>
        </div>
        <div className="space-y-3">
          <KindredBullet>
            <span className="font-black text-indigo-700 tabular-nums">{count.pct}%</span> completed a dinner walk yesterday.
          </KindredBullet>
          <KindredBullet>
            Average glucose after dinner was <span className="font-black text-indigo-700 tabular-nums">{count.delta} mg/dL</span> lower.
          </KindredBullet>
          <KindredBullet>
            Most successful members walked within <span className="font-black text-indigo-700">45 minutes</span> of dinner.
          </KindredBullet>
        </div>
      </ShadedCard>

      {/* Nu says */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 flex items-center gap-4">
        <img src="/journey/ppt/nu_avatar.png" alt="Nu" className="w-16 h-16 rounded-full object-cover shrink-0 border border-slate-100 shadow-sm" />
        <div className="flex-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 mb-0.5">Nu says</div>
          <div className="text-[14px] font-bold text-slate-800 leading-snug">
            You&apos;re following a path that has helped thousands of members succeed. Let&apos;s keep building on it.
          </div>
        </div>
        <img src="/journey/ppt/walker_silhouette.png" alt="" className="hidden md:block w-20 h-16 object-contain opacity-90" />
      </div>

      {/* CTA */}
      <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white text-lg font-black tracking-wide shadow-lg shadow-indigo-200 transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13" cy="4" r="2" fill="currentColor" />
          <path d="M4 22l5-8 4 5 4-4 3 6" />
          <path d="M13 6l-3 4 3 3 3-2" />
        </svg>
        Keep walking today!
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
      </button>
    </div>
  );
}

function KindredBullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[14px] text-slate-800 leading-snug">
      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 shrink-0 flex items-center justify-center mt-0.5">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
      </span>
      <span>{children}</span>
    </div>
  );
}

function BigStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <div className={`text-4xl md:text-5xl font-black tabular-nums ${color}`}>{value}</div>
      <div className="text-xs font-black uppercase tracking-wider text-slate-500 mt-1">{label}</div>
    </div>
  );
}

// ============================================================================
//  Step 6 - Nu the Trend Watcher
// ============================================================================

export function TrendWatcher() {
  const observed = [62, 64, 66, 67, 66, 70, 72, 68, 70, 74, 75, 76, 77, 78];
  const predicted = [78, 79, 80, 81, 83, 84, 85, 86];
  const w = 640, h = 260, padL = 40, padR = 20, padT = 20, padB = 30;
  const total = observed.length + predicted.length - 1;
  const xAt = (i: number) => padL + (i / (total - 1)) * (w - padL - padR);
  const yAt = (v: number) => padT + (1 - (v - 40) / 60) * (h - padT - padB);
  const obsPts = observed.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  const predPts = predicted.map((v, i) => `${xAt(observed.length - 1 + i)},${yAt(v)}`).join(" ");

  return (
    <div className="space-y-6">
    <div className="grid md:grid-cols-5 gap-8 items-start">
      <div className="md:col-span-2 space-y-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-1">Momentum</div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-slate-900 tabular-nums">78</span>
            <span className="text-2xl text-slate-400">&rarr;</span>
            <span className="text-6xl font-black text-emerald-600 tabular-nums">86</span>
          </div>
          <div className="text-[13px] font-bold text-slate-500 mt-1">in 7 days &middot; 82% confidence</div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-1">Weight</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tabular-nums">178</span>
            <span className="text-lg text-slate-400">lbs</span>
          </div>
          <div className="text-[13px] font-bold text-slate-500 leading-relaxed">
            Goal 170 &middot; 8 lbs to go
            <br />
            <span className="text-slate-500">5 weeks at current pace</span>
          </div>
        </div>
      </div>

      <div className="md:col-span-3">
        <ShadedCard tone="indigo" padding="p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-3">MOMENTUM &middot; LAST 14 DAYS + NEXT 7</div>
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
            {[40, 60, 80, 100].map(v => (
              <g key={v}>
                <line x1={padL} y1={yAt(v)} x2={w - padR} y2={yAt(v)} stroke="#E5E7EB" strokeWidth={1} />
                <text x={padL - 6} y={yAt(v) + 3} fontSize={10} textAnchor="end" fill="#6B7280" fontWeight={700}>{v}</text>
              </g>
            ))}
            <rect
              x={xAt(observed.length - 1)}
              y={padT}
              width={xAt(total - 1) - xAt(observed.length - 1)}
              height={h - padT - padB}
              fill="#EEF2FF"
            />
            <text x={xAt(observed.length - 1) + 8} y={padT + 14} fill="#4338CA" fontSize={10} fontWeight={900} letterSpacing={1}>NU PREDICTS &rarr;</text>

            <polyline points={obsPts} fill="none" stroke="#4F5FE5" strokeWidth={2.5} strokeLinejoin="round" />
            <polyline points={predPts} fill="none" stroke="#4F5FE5" strokeWidth={2.5} strokeDasharray="6 4" />

            {observed.map((v, i) => (
              <circle key={"o" + i} cx={xAt(i)} cy={yAt(v)} r={3} fill="#4F5FE5" />
            ))}
            {predicted.map((v, i) => (
              <circle key={"p" + i} cx={xAt(observed.length - 1 + i)} cy={yAt(v)} r={3}
                      fill={i === predicted.length - 1 ? "#10B981" : "#A5B4FC"} />
            ))}
            <text x={xAt(total - 1)} y={yAt(predicted[predicted.length - 1]) - 10}
                  textAnchor="end" fill="#10B981" fontSize={12} fontWeight={900}>86</text>
          </svg>
        </ShadedCard>
      </div>
    </div>

    {/* Explanation cards - the "why" behind the forecast */}
    <TrendForecastCards />
    </div>
  );
}

// ============================================================================
// Forecast explanation cards - matches the mobile mockup provided by Prasad.
// Three cards below the chart: Nu Noticed, Nu Predicts, What Could Slow You Down.
// ============================================================================

function TrendForecastCards() {
  const [open, setOpen] = useState<ForecastVariant | null>(null);
  return (
    <div className="space-y-3">
      <ForecastCard
        eyebrow="Nu Noticed" eyebrowColor="#4338CA"
        badgeIcon={<NuFaceIcon />}
        badgeBg="linear-gradient(135deg, #DBEAFE 0%, #EEF2FF 100%)"
        onClick={() => setOpen("noticed")}
      >
        <span>Evening walks are becoming a habit. Your momentum has increased for <span className="font-black text-slate-900">five straight days</span>.</span>
      </ForecastCard>

      <ForecastCard
        eyebrow="Nu Predicts" eyebrowColor="#4338CA"
        badgeIcon={<CrystalBallIcon />}
        badgeBg="linear-gradient(135deg, #EDE9FE 0%, #F5F1FF 100%)"
        onClick={() => setOpen("predicts")}
      >
        <span>Stay consistent this week and you&apos;re likely to reach Momentum <span className="font-black text-emerald-600">86</span>.</span>
      </ForecastCard>

      <ForecastCard
        eyebrow="What Could Slow You Down?" eyebrowColor="#4338CA"
        badgeIcon={<WarningIcon />}
        badgeBg="linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)"
        onClick={() => setOpen("warning")}
      >
        <span>Missing <span className="font-black text-amber-600">two evening walks</span> or several late-night snacks could slow your progress.</span>
      </ForecastCard>

      {open === "noticed" && (
        <ForecastDetailSheet
          variant="noticed"
          eyebrow="Nu Noticed"
          title="Your 5-day walking streak"
          intro="Here's what Nu tracked. Every one of these walks pulled your evening glucose curve back into range within an hour."
          bullets={[
            { label: "Fri, Jun 27 · 22-minute walk at 9:12 PM",    sub: "Post-dinner peak recovered to 118 by 10:15 PM", accent: "#047857" },
            { label: "Sat, Jun 28 · 25-minute walk at 9:04 PM",    sub: "Post-dinner peak recovered to 108 by 9:55 PM",  accent: "#047857" },
            { label: "Sun, Jun 29 · 20-minute walk at 9:20 PM",    sub: "Post-dinner peak recovered to 122 by 10:20 PM", accent: "#047857" },
            { label: "Mon, Jun 30 · 30-minute walk at 8:55 PM",    sub: "Post-dinner peak recovered to 104 by 9:45 PM",  accent: "#047857" },
            { label: "Tue, Jul 1 · 22-minute walk at 9:15 PM",     sub: "Post-dinner peak recovered to 118 by 10:12 PM", accent: "#047857" },
          ]}
          footnote="Five consecutive days is the threshold where Nu treats behavior as a habit — not a streak."
          onClose={() => setOpen(null)}
        />
      )}

      {open === "predicts" && (
        <ForecastDetailSheet
          variant="predicts"
          eyebrow="Nu Predicts"
          title="How Nu forecasts Momentum 86"
          intro="Nu ran your 14-day trend against thousands of similar cohorts. Two scenarios explain the range:"
          scenarios={[
            { name: "If you stay consistent",  endPoint: "86", endLabel: "Best case (65%)",
              color: "#10B981", points: [78, 79, 80, 81, 83, 84, 85, 86],
              caption: "Keep 5 of 7 evening walks + hydration target." },
            { name: "If evenings slip",         endPoint: "80", endLabel: "Slip case (25%)",
              color: "#F59E0B", points: [78, 78, 79, 78, 79, 80, 80, 80],
              caption: "Miss 2 evening walks and one late-night snack." },
          ]}
          footnote="Nu updates this forecast daily based on what you actually do — not what you planned."
          onClose={() => setOpen(null)}
        />
      )}

      {open === "warning" && (
        <ForecastDetailSheet
          variant="warning"
          eyebrow="What Could Slow You Down?"
          title="Risks to your Momentum 86"
          intro="Three things Nu watches. If any of them show up, expect the forecast to drop:"
          bullets={[
            { label: "Missing 2 evening walks",           sub: "-6 momentum points · biggest single risk",    accent: "#B45309" },
            { label: "Late-night snacking (2+ nights)",   sub: "-3 momentum points · disrupts overnight recovery", accent: "#B45309" },
            { label: "Sleep under 6 hours",               sub: "-4 momentum points · raises fasting glucose", accent: "#B45309" },
            { label: "Missed medication dose",            sub: "-5 momentum points · Nu will send a soft reminder", accent: "#B45309" },
          ]}
          footnote="Nu will nudge you before any of these become a problem. You'll see a soft ping — never a scold."
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function ForecastCard({ eyebrow, eyebrowColor, badgeIcon, badgeBg, onClick, children }:
  { eyebrow: string; eyebrowColor: string; badgeIcon: React.ReactNode; badgeBg: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-slate-100 bg-white shadow-sm p-4 md:p-5 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition"
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: badgeBg }}>
        {badgeIcon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-black uppercase tracking-[0.14em] mb-1" style={{ color: eyebrowColor }}>
          {eyebrow}
        </div>
        <div className="text-[14px] md:text-[15px] font-medium text-slate-700 leading-snug">
          {children}
        </div>
      </div>
      <svg className="w-5 h-5 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 6 15 12 9 18" />
      </svg>
    </button>
  );
}

// Nu character face (indigo/blue sprout with cheerful eyes) matching the mockup
function NuFaceIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <defs>
        <radialGradient id="nuBody" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="60%" stopColor="#4F5FE5" />
          <stop offset="100%" stopColor="#3730A3" />
        </radialGradient>
      </defs>
      {/* Sprout on top */}
      <ellipse cx="14" cy="5" rx="2.5" ry="1.8" fill="#10B981" transform="rotate(-20 14 5)" />
      <path d="M14 6 Q15 3 17 4" stroke="#065F46" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="16" cy="18" rx="10" ry="10" fill="url(#nuBody)" />
      {/* Eyes */}
      <ellipse cx="12" cy="17" rx="1.6" ry="2" fill="#FFFFFF" />
      <ellipse cx="20" cy="17" rx="1.6" ry="2" fill="#FFFFFF" />
      <circle cx="12" cy="17.5" r="0.8" fill="#0F172A" />
      <circle cx="20" cy="17.5" r="0.8" fill="#0F172A" />
      {/* Smile */}
      <path d="M13 21 Q16 23 19 21" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function CrystalBallIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <defs>
        <radialGradient id="ballGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#5B21B6" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="14" r="9" fill="url(#ballGrad)" />
      <ellipse cx="12.5" cy="10.5" rx="2" ry="1.4" fill="#FFFFFF" opacity="0.7" />
      <path d="M10 22 L22 22 L20 26 L12 26 Z" fill="#4C1D95" />
      <path d="M11 22 L21 22" stroke="#7C3AED" strokeWidth="0.6" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32">
      <path d="M16 5 L28 26 L4 26 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="15" y="12" width="2" height="7" fill="#78350F" rx="1" />
      <circle cx="16" cy="22" r="1.3" fill="#78350F" />
    </svg>
  );
}

// ============================================================================
//  Step 9 - Tonight (Nu the Evening Companion)
// ============================================================================

export function EveningCompanion() {
  return (
    <div className="grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <svg className="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="#5B4CE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 15A8 8 0 1 1 9 4a7 7 0 0 0 11 11z" fill="#FCD34D" fillOpacity="0.3" />
            <circle cx="19" cy="4" r="1" fill="#5B4CE0" /><circle cx="21" cy="7" r="0.8" fill="#5B4CE0" />
          </svg>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-5">
          One walk. That&apos;s it.
        </h1>
        <p className="text-lg text-slate-700 leading-relaxed mb-3">
          Tonight at <span className="font-black text-slate-900">7:30 PM</span>, take a twenty-minute walk after dinner.
        </p>
        <p className="text-[14px] text-slate-600 leading-relaxed max-w-md">
          That&apos;s the one commitment. Small win extends tomorrow&apos;s momentum. Nu will pick this up in the morning.
        </p>
      </div>

      <div className="rounded-3xl border-2 shadow-lg p-6 md:p-7" style={{ borderColor: "#10B981", background: "linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)" }}>
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 mb-4">
          Tonight&apos;s commitment
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13" cy="4" r="2" fill="currentColor" />
              <path d="M4 22l5-8 4 5 4-4 3 6" />
              <path d="M13 6l-3 4 3 3 3-2" />
            </svg>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-black text-slate-900 leading-tight">Walk 20 min after dinner</div>
            <div className="text-[13px] text-slate-500 font-medium">Target time &middot; 9:15 PM</div>
          </div>
        </div>
        <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-lg font-black tracking-wide shadow-lg transition hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #10B981 0%, #047857 100%)" }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
          I&apos;m In
        </button>
        <div className="text-center text-[12px] font-bold text-slate-500 mt-4">
          Small steps today. Big wins tomorrow.
        </div>
      </div>
    </div>
  );
}
