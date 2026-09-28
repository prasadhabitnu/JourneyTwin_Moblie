import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

import { Level1Demo, Level2Demo, Level3Demo, Level4Demo } from "../components/lilly/LevelDemos";
import HabitnuLogo from "../components/journey/HabitnuLogo";

/**
 * /four-ways — Interactive POC of the "One Platform · Four Ways to Partner"
 * concept for Lilly Health. Each level shows a live mockup below the overview.
 */
export default function FourWaysPage() {
  const [active, setActive] = useState<1 | 2 | 3 | 4>(1);

  return (
    <>
      <Head>
        <title>One Platform. Four Ways to Partner. — Habitnu × Lilly Health</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap" />
      </Head>

      <div className="min-h-screen"
           style={{
             fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
             background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
           }}>
        {/* Top co-brand bar */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <HabitnuLogo />
            <span className="text-slate-300 text-xl font-black">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[18px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif" }}>Lilly</span>
              <span className="text-[14px] font-black text-slate-800">Health</span>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/lilly-sandbox" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-amber-800 bg-amber-100 border border-amber-300 hover:bg-amber-200 transition">Lilly Sandbox →</Link>
            <Link href="/scenarios"     className="px-3 py-1.5 rounded-lg text-[12px] font-black text-white shadow-sm transition" style={{ background: "#4F5FE5" }}>▶ Simulate all 4 →</Link>
            <Link href="/health-ring"   className="px-3 py-1.5 rounded-lg text-[12px] font-black text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition">Ring · Live →</Link>
            <Link href="/orchestration" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition">Under the hood →</Link>
            <Link href="/journey"       className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">Sally's day →</Link>
            <Link href="/stars"         className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">Star vitals →</Link>
            <Link href="/mirror"        className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">Nu's Mirror →</Link>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 mb-3">
              Four ways to partner
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4"
                style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
              One platform. Four ways to partner.
            </h1>
            <p className="text-[15px] md:text-[16px] text-slate-600 leading-relaxed">
              Choose the level of integration that fits Lilly Health today. Expand over time.
            </p>
          </div>

          {/* 4-level overview */}
          <div className="grid md:grid-cols-4 gap-3 mb-10">
            <LevelCard n={1} tint="#0EA5E9" onClick={() => setActive(1)} active={active === 1}
              icon={<IconMagnifier />} title="Persistence Intelligence" sub="Behind the scenes"
              bullets={[
                "Detect participants who may need support.",
                "Explain what changed.",
                "Recommend the next best action.",
              ]}
              visibility="Participant sees nothing new."
              visibilityIcon="hide"
            />
            <LevelCard n={2} tint="#4F5FE5" onClick={() => setActive(2)} active={active === 2}
              icon={<IconPlane />} title="Smart Popup" sub="Within Lilly Health"
              bullets={[
                "Send Lilly-approved messages.",
                "Personalize timing and content.",
                "Measure participant response.",
              ]}
              visibility="Participant experience changes very little."
              visibilityIcon="eye"
            />
            <LevelCard n={3} tint="#0EA5A4" onClick={() => setActive(3)} active={active === 3}
              icon={<IconBulb />} title="Insight Cards" sub="Inside Lilly Health"
              bullets={[
                "1–2 insight cards on the home screen.",
                "Fathom-branded, Lilly-hosted.",
                "Adapts daily to what the member needs.",
              ]}
              visibility="Insights surface in Lilly Health through 1–2 cards."
              visibilityIcon="eye"
            />
            <LevelCard n={4} tint="#7C3AED" onClick={() => setActive(4)} active={active === 4}
              icon={<IconDashboard />} title="HabitNu Companion" sub="Dedicated Insights Experience"
              bullets={[
                "Full insights dashboard.",
                "Accessed from the Insights tab.",
                "Deepest partnership tier.",
              ]}
              visibility="Deeper experience available in the Insights section."
              visibilityIcon="eye"
            />
          </div>

          {/* Integration comparison matrix */}
          <IntegrationMatrix />


          {/* Tabs to switch demo */}
          <div className="flex items-center gap-2 overflow-x-auto mb-4 border-b border-slate-200">
            {[1, 2, 3, 4].map(n => {
              const isActive = active === n;
              return (
                <button
                  key={n}
                  onClick={() => setActive(n as 1 | 2 | 3 | 4)}
                  className={"px-5 py-3 text-[13px] font-black transition whitespace-nowrap border-b-2 " +
                    (isActive
                      ? "text-indigo-700 border-indigo-600"
                      : "text-slate-500 border-transparent hover:text-slate-800")}
                >
                  Level {n} · Live mockup
                </button>
              );
            })}
          </div>

          {/* Active demo */}
          <div className="animate-fadein py-6">
            {active === 1 && <Level1Demo />}
            {active === 2 && <Level2Demo />}
            {active === 3 && <Level3Demo />}
            {active === 4 && <Level4Demo />}
          </div>

          {/* Nu framing footer */}
          <div className="mt-8 rounded-2xl p-6 border border-indigo-100"
               style={{ background: "linear-gradient(90deg, #EEF2FF 0%, #F5F1FF 100%)" }}>
            <div className="grid md:grid-cols-[auto_1fr] gap-4 items-center">
              <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow"
                    style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
                <span className="text-[12px] font-black text-white">Nu</span>
              </span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">
                  How to sequence a Lilly rollout
                </div>
                <div className="text-[13.5px] text-slate-800 font-medium leading-relaxed">
                  <span className="font-black">Weeks 1–4:</span> Level 1 pilot on a real cohort, invisible to participants. <span className="font-black">Weeks 5–12:</span> add Level 2 messaging. <span className="font-black">Q2:</span> introduce Level 3 cards to a sub-cohort. <span className="font-black">Q3–Q4:</span> graduate qualifying members to Level 4 Companion. Every step is opt-in for Lilly; every step is measurable.
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .animate-fadein { animation: fadein 220ms ease-out; }
          @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </>
  );
}

// ============================================================================
// LevelCard — the 4 overview tiles
// ============================================================================
function LevelCard({
  n, title, sub, tint, icon, bullets, visibility, visibilityIcon, onClick, active,
}: {
  n: number; title: string; sub: string; tint: string;
  icon: React.ReactNode; bullets: string[]; visibility: string; visibilityIcon: "eye" | "hide";
  onClick: () => void; active: boolean;
}) {
  return (
    <button onClick={onClick}
            className={"text-left rounded-2xl bg-white border shadow-sm hover:shadow-md transition p-4 " +
              (active ? "ring-2 ring-offset-2" : "border-slate-200")}
            style={active ? { boxShadow: `0 0 0 3px ${tint}22, 0 4px 12px rgba(15,23,42,0.06)`, borderColor: tint } : {}}>
      {/* Level pill */}
      <div className="flex justify-center mb-3">
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.14em] text-white"
              style={{ background: tint }}>
          Level {n}
        </span>
      </div>
      {/* Icon */}
      <div className="flex justify-center mb-2">
        <div className="w-14 h-14 rounded-full flex items-center justify-center"
             style={{ background: tint + "15" }}>
          {icon}
        </div>
      </div>
      {/* Title */}
      <div className="text-center">
        <div className="text-[15px] font-black text-slate-900 leading-tight">{title}</div>
        <div className="text-[11px] font-black uppercase tracking-wider mt-0.5" style={{ color: tint }}>{sub}</div>
      </div>
      {/* Bullets */}
      <ul className="mt-3 space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-slate-700 font-medium leading-snug">
            <svg className="w-3 h-3 shrink-0 mt-0.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 12 10 18 20 6" />
            </svg>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {/* Visibility strip */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-1.5">
        {visibilityIcon === "hide" ? (
          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-7 0-11-8-11-8a19.8 19.8 0 0 1 5.06-5.94M9.9 4.24A10 10 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-3.16 4.19M1 1l22 22" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: tint }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
        <span className="text-[10.5px] font-medium leading-snug" style={{ color: visibilityIcon === "hide" ? "#64748B" : tint }}>
          {visibility}
        </span>
      </div>
    </button>
  );
}

// ---- Icons for the 4 level cards ----
function IconMagnifier() {
  return (
    <svg className="w-7 h-7 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="M8 11h6M11 8v6" /><path d="M16 16l5 5" />
    </svg>
  );
}
function IconPlane() {
  return (
    <svg className="w-7 h-7 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
function IconBulb() {
  return (
    <svg className="w-7 h-7 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12v3h8v-3a7 7 0 0 0-4-12z" />
    </svg>
  );
}
function IconDashboard() {
  return (
    <svg className="w-7 h-7 text-pink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

// ============================================================================
// IntegrationMatrix — 7-row × 4-column comparison across the 4 tiers.
// ============================================================================

type CellKind = "text" | "yes" | "optional" | "not-required" | "level";
interface Cell {
  text: string;
  kind: CellKind;
  level?: "low" | "medium" | "medium-high" | "lowest";
  cellIcon?: React.ReactNode;
  footnote?: string;   // "*" or "**"
}
interface MatrixRow {
  label: string;
  rowIcon: React.ReactNode;
  cells: [Cell, Cell, Cell, Cell];
}

const COLS = [
  { n: 1, title: "Behind the Scenes",  tint: "#7DD3FC" },
  { n: 2, title: "Smart Popup",        tint: "#93C5FD" },
  { n: 3, title: "Insight Cards",      tint: "#5EEAD4" },
  { n: 4, title: "HabitNu Companion",  tint: "#C4B5FD" },
];

const ROWS: MatrixRow[] = [
  {
    label: "Participant experience", rowIcon: <RowIcon k="person" />,
    cells: [
      { kind: "text", text: "No change",                 cellIcon: <CI k="eye-off" c="#4F5FE5" /> },
      { kind: "text", text: "Popup message",             cellIcon: <CI k="chat"    c="#4F5FE5" /> },
      { kind: "text", text: "Insight cards in app",      cellIcon: <CI k="cards"   c="#0891B2" /> },
      { kind: "text", text: "HabitNu Companion experience", cellIcon: <CI k="phone" c="#7C3AED" /> },
    ],
  },
  {
    label: "Participant stays in Lilly Health", rowIcon: <RowIcon k="shield" />,
    cells: [
      { kind: "yes", text: "Yes" },
      { kind: "yes", text: "Yes" },
      { kind: "yes", text: "Yes" },
      { kind: "optional", text: "Optional" },
    ],
  },
  {
    label: "Participant opt-in", rowIcon: <RowIcon k="check-box" />,
    cells: [
      { kind: "not-required", text: "Not required" },
      { kind: "optional", text: "Optional*",  footnote: "*" },
      { kind: "optional", text: "Optional*",  footnote: "*" },
      { kind: "yes", text: "Required" },
    ],
  },
  {
    label: "Engineering effort", rowIcon: <RowIcon k="code" />,
    cells: [
      { kind: "level", text: "Low",         level: "low" },
      { kind: "level", text: "Low",         level: "low" },
      { kind: "level", text: "Medium",      level: "medium" },
      { kind: "level", text: "Medium-High", level: "medium-high" },
    ],
  },
  {
    label: "Regulatory impact", rowIcon: <RowIcon k="shield-check" />,
    cells: [
      { kind: "level", text: "Lowest",     level: "lowest" },
      { kind: "level", text: "Low-Medium", level: "medium" },
      { kind: "level", text: "Medium",     level: "medium-high" },
      { kind: "level", text: "Lowest**",   level: "lowest", footnote: "**" },
    ],
  },
  {
    label: "Coach escalation", rowIcon: <RowIcon k="coach" />,
    cells: [
      { kind: "optional", text: "Optional" },
      { kind: "yes", text: "Yes" },
      { kind: "yes", text: "Yes" },
      { kind: "yes", text: "Yes" },
    ],
  },
  {
    label: "Physician escalation", rowIcon: <RowIcon k="stethoscope" />,
    cells: [
      { kind: "optional", text: "Optional" },
      { kind: "yes", text: "Yes" },
      { kind: "yes", text: "Yes" },
      { kind: "yes", text: "Yes" },
    ],
  },
];

function IntegrationMatrix() {
  return (
    <div className="mb-10">
      {/* Section heading */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 mb-2">
          Integration options
        </div>
        <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2"
            style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
          Choose the right integration path.
        </h2>
        <p className="text-[14px] text-slate-600 leading-relaxed">
          Every level builds on the previous one. Lilly chooses the pace.
        </p>
      </div>

      {/* Matrix */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-[240px] px-4 py-3 bg-white" />
              {COLS.map(c => (
                <th key={c.n} className="text-center px-3 py-3"
                    style={{ background: c.tint + "40", borderBottom: `2px solid ${c.tint}` }}>
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">Level {c.n}</div>
                  <div className="text-[13px] font-black text-slate-900 mt-0.5">{c.title}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-slate-50/60" : "bg-white"}>
                <td className="px-4 py-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "#EEF2FF" }}>
                      {row.rowIcon}
                    </span>
                    <span className="text-[12.5px] font-black text-slate-800 leading-tight">{row.label}</span>
                  </div>
                </td>
                {row.cells.map((cell, j) => (
                  <td key={j} className="px-3 py-3 border-t border-slate-100 text-center">
                    <MatrixCell cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footnotes */}
      <div className="mt-4 space-y-1 text-[11px] text-slate-500 font-medium">
        <div><span className="font-black text-slate-700">*</span> Participant opt-in for Levels 2 and 3 can be added if Lilly prefers an additional layer of participant consent.</div>
        <div><span className="font-black text-slate-700">**</span> Level 4 uses a separate HabitNu experience with explicit participant enrollment.</div>
      </div>

      {/* Bottom tagline */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 flex items-center gap-3">
        <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#4F5FE5" }}>
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </span>
        <div className="text-[15px] font-black text-slate-900 flex-1">
          Lilly chooses how much of Fathom to introduce, and when.
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <HabitnuLogo height={22} />
        </div>
      </div>
    </div>
  );
}

function MatrixCell({ cell }: { cell: Cell }) {
  if (cell.kind === "yes") {
    return (
      <div className="inline-flex items-center gap-1.5">
        <IconYes />
        <span className="text-[12px] font-black text-slate-800">{cell.text}</span>
      </div>
    );
  }
  if (cell.kind === "optional") {
    return (
      <div className="inline-flex items-center gap-1.5">
        <IconRing color="#94A3B8" />
        <span className="text-[12px] font-black text-slate-600">{cell.text}</span>
      </div>
    );
  }
  if (cell.kind === "not-required") {
    return (
      <div className="inline-flex items-center gap-1.5">
        <IconX />
        <span className="text-[12px] font-black text-slate-500">{cell.text}</span>
      </div>
    );
  }
  if (cell.kind === "level") {
    const color =
      cell.level === "low"        ? "#10B981" :
      cell.level === "lowest"     ? "#10B981" :
      cell.level === "medium"     ? "#F59E0B" :
      cell.level === "medium-high"? "#EA580C" : "#94A3B8";
    return (
      <div className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-[12px] font-black text-slate-800">{cell.text}</span>
      </div>
    );
  }
  // text kind (with cellIcon)
  return (
    <div className="inline-flex items-center gap-1.5">
      {cell.cellIcon}
      <span className="text-[11.5px] font-medium text-slate-700 leading-tight text-left">{cell.text}</span>
    </div>
  );
}

function IconYes() {
  return (
    <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="7 12 11 16 17 8" />
    </svg>
  );
}
function IconX() {
  return (
    <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  );
}
function IconRing({ color }: { color: string }) {
  return (
    <svg className="w-4 h-4 shrink-0" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
function RowIcon({ k }: { k: string }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none",
              stroke: "#4F5FE5", strokeWidth: 2 as unknown as number,
              strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (k === "person")       return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 22a8 8 0 0 1 16 0" /></svg>;
  if (k === "shield")       return <svg {...p}><path d="M12 3l8 3v6c0 5-4 9-8 10-4-1-8-5-8-10V6z" /></svg>;
  if (k === "check-box")    return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><polyline points="8 12 11 15 16 9" /></svg>;
  if (k === "code")         return <svg {...p}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
  if (k === "shield-check") return <svg {...p}><path d="M12 3l8 3v6c0 5-4 9-8 10-4-1-8-5-8-10V6z" /><polyline points="8 12 11 15 16 9" /></svg>;
  if (k === "coach")        return <svg {...p}><circle cx="9" cy="7" r="3" /><path d="M3 22a6 6 0 0 1 12 0" /><path d="M17 11l2 2 4-4" /></svg>;
  if (k === "stethoscope")  return <svg {...p}><path d="M5 4v6a4 4 0 0 0 8 0V4" /><circle cx="18" cy="16" r="3" /><path d="M9 14v2a4 4 0 0 0 6 3.5" /></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="4" /></svg>;
}
function CI({ k, c }: { k: string; c: string }) {
  const p = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none",
              stroke: c, strokeWidth: 2 as unknown as number,
              strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (k === "eye-off") return <svg {...p}><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-7 0-11-8-11-8a19.8 19.8 0 0 1 5.06-5.94M9.9 4.24A10 10 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-3.16 4.19M1 1l22 22" /></svg>;
  if (k === "chat")    return <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
  if (k === "cards")   return <svg {...p}><rect x="3" y="4" width="18" height="6" rx="1" /><rect x="3" y="14" width="18" height="6" rx="1" /></svg>;
  if (k === "phone")   return <svg {...p}><rect x="6" y="2" width="12" height="20" rx="2" /><circle cx="12" cy="18" r="1" fill={c} /></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="4" /></svg>;
}
