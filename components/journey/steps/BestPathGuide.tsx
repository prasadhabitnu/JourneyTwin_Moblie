import { useEffect, useState } from "react";
import ShadedCard from "../ShadedCard";
import { JOURNEY_PATHS, JourneyPath, CohortStats, adaptPathForMember, SALLY_PROFILE, cohortCompatibility, AdaptedPath, AdaptedItem } from "../../../lib/journeyData";
import { useUpdateMe } from "../../../contexts/UpdateMeContext";
import { useBehavioralMode } from "../../../contexts/BehavioralModeContext";
// DayPlanEditor moved to Coach Daily Activities (per Prasad).
// The component file at ../DayPlanEditor stays for reuse there.

/**
 * Best Path Guide (Step 2)
 *
 *   Row 1 - hero path card + evidence column
 *   Row 2 - Cohort adoption card (social proof)
 *   Row 3 - Active challenges (member-vs-member accountability)
 *   Row 4 - Improvisations (community twists + Nu's personalized suggestion)
 *   Row 5 - 5 selectable mini-path cards
 */
export default function BestPathGuide() {
  const { log, suggestedPathId, suggestionReason } = useUpdateMe();
  const { mode } = useBehavioralMode();
  const [pathId, setPathId] = useState<string>("long-walker");
  const [autoNoticed, setAutoNoticed] = useState<string | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);

  // Auto-adjust path when Update Me values shift the recommendation.
  useEffect(() => {
    if (Object.keys(log).length === 0) return;
    if (suggestedPathId !== pathId) {
      setPathId(suggestedPathId);
      setAutoNoticed(suggestionReason);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedPathId]);

  const path = JOURNEY_PATHS.find(p => p.id === pathId) ?? JOURNEY_PATHS[0];

  const [tab, setTab] = useState<TabKey>("today");

  return (
    <div className="space-y-6">
      {mode === "behavioral" && <BehavioralModeReframe />}
      {autoNoticed && (
        <div className="rounded-2xl p-[2px] shadow-md"
             style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #EC4A83 100%)" }}>
          <div className="rounded-[14px] bg-white p-4 flex items-center gap-4">
            <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.5 4L18 8l-4 3 1 5-3-2.5L9 16l1-5-4-3 4.5-1z" />
              </svg>
            </span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-0.5">Nu adjusted your Best Path</div>
              <div className="text-[13px] font-bold text-slate-800 leading-snug">{autoNoticed}</div>
            </div>
            <button onClick={() => setAutoNoticed(null)}
                    className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">
              Got it
            </button>
          </div>
        </div>
      )}
      <LongWalkerHero path={path} />

      <BestDayMirrorCard />

      <div className="grid md:grid-cols-2 gap-6">
        <TodaysCommitmentCard path={path} />
        <WhyNuChoseCard path={path} onOpenChooser={() => setChooserOpen(true)} />
      </div>

      {chooserOpen && (
        <ChoosePathModal
          currentPathId={pathId}
          onSelect={(id) => { setPathId(id); setChooserOpen(false); }}
          onClose={() => setChooserOpen(false)}
        />
      )}

      <BestPathTabs active={tab} onChange={setTab} />

      {tab === "today" && (
        <div className="space-y-6 animate-fadein">
          <NuTipStrip />
        </div>
      )}
      {tab === "community" && (
        <div className="space-y-6 animate-fadein">
          <CohortActivity path={path} />
          <ActiveChallenges pathId={path.id} pathName={path.name} />
          <Improvisations pathId={path.id} pathName={path.name} />
        </div>
      )}
      {tab === "coach" && (
        <div className="animate-fadein">
          <CoachBroadcast pathId={path.id} pathName={path.name} />
        </div>
      )}

      <style jsx>{`
        .animate-fadein { animation: fadein 220ms ease-out; }
        @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ============================================================================
// Tab strip + Nu tip strip
// ============================================================================

type TabKey = "today" | "community" | "coach";

interface TabDef { key: TabKey; label: string; count?: number; }
const TABS: TabDef[] = [
  { key: "today",     label: "Today" },
  { key: "community", label: "Community", count: 3 },
  { key: "coach",     label: "Coach view" },
];

function BestPathTabs({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto -mx-1 px-1">
      {TABS.map(t => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={
              "px-4 py-2.5 text-[13px] font-black tracking-wide whitespace-nowrap transition border-b-2 " +
              (isActive
                ? "text-indigo-700 border-indigo-600"
                : "text-slate-500 hover:text-slate-800 border-transparent")
            }
          >
            {t.label}
            {t.count !== undefined && (
              <span className={"ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black " +
                (isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500")}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function NuTipStrip() {
  return (
    <div className="rounded-2xl p-5 border shadow-sm flex items-center gap-4"
         style={{ background: "linear-gradient(90deg, #EEF2FF 0%, #F5F1FF 100%)", borderColor: "#E5DEFF" }}>
      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow"
           style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Nu&apos;s tip for today</div>
        <div className="text-[14px] font-bold text-slate-800 leading-snug">
          Aim to start your walk within 30 minutes of finishing dinner - your best glucose recoveries all began in that window.
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// Hero card + Evidence column (unchanged from earlier)
// ============================================================================

function PathHeroCard({ path }: { path: JourneyPath }) {
  return (
    <ShadedCard tone={path.tone} padding="p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Today's Best Path</div>
        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {path.matchStrength}% match
        </div>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-3xl">{path.emoji}</div>
        <div>
          <div className="text-2xl font-black text-slate-900">{path.name}</div>
          <div className="text-xs text-slate-500 font-medium">Focus: {path.focus}</div>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        {path.items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <span className="text-lg">{it.icon}</span>
            <span className="text-sm font-bold text-slate-800">{it.label}</span>
            <span className="ml-auto w-5 h-5 rounded-full border-2 border-slate-300" />
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium leading-relaxed">
        <span className="font-black text-slate-700">Why this plan - </span>{path.why}
      </div>
    </ShadedCard>
  );
}

function PathEvidenceColumn({ path }: { path: JourneyPath }) {
  return (
    <div className="pl-2">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-3">Days that already fit</div>
      <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-6">
        Three days from your last 14 already followed the {path.name} pattern. Same shape. Same result.
      </p>
      <div className="space-y-3">
        {path.evidence.map((e, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border shadow-sm"
               style={{ borderColor: "rgba(16, 185, 129, 0.25)", background: "linear-gradient(90deg, rgba(236,253,245,0.9) 0%, rgba(255,255,255,0.8) 100%)" }}>
            <div className="text-2xl font-black text-emerald-700 tabular-nums">{e.tir}%</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 shrink-0">TIR</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-slate-800">{e.day}</div>
              <div className="text-[11px] text-slate-600 leading-tight truncate">{e.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Cohort activity
// ============================================================================

function CohortActivity({ path }: { path: JourneyPath }) {
  const c = path.cohort;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let i = 0; setDisplay(0);
    const steps = 22;
    const id = setInterval(() => {
      i++;
      const t = Math.min(1, i / steps);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(c.todayCount * eased));
      if (i >= steps) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [c.todayCount]);

  const delta = c.todayCount - c.yesterdayCount;
  const deltaPct = c.yesterdayCount === 0 ? 0 : Math.round((delta / c.yesterdayCount) * 100);
  const trendUp = delta >= 0;

  return (
    <div className="rounded-2xl p-6 border border-slate-200 shadow-sm"
         style={{ background: "linear-gradient(135deg, rgba(238,242,255,0.65) 0%, rgba(255,255,255,0.9) 60%, rgba(240,253,244,0.55) 100%)" }}>
      <div className="flex flex-wrap items-start gap-4 mb-5">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
            Your cohort today - Age 50-55 + GLP-1 + similar starts
          </div>
          <div className="text-lg font-black text-slate-900">
            You're not the only one taking on {path.name}.
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition">
            🎯 Challenge a member
          </button>
          <button className="px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition">
            🏆 Leaderboard
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Chose this today</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-slate-900 tabular-nums">{display}</span>
            <span className="text-xs font-black uppercase text-slate-400">members</span>
          </div>
          <div className={`mt-1 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${trendUp ? "text-emerald-600" : "text-rose-600"}`}>
            <span>{trendUp ? "↑" : "↓"}</span>
            <span>{trendUp ? "+" : ""}{deltaPct}% vs yesterday</span>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">Yesterday</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 tabular-nums">{c.yesterdayCount}</span>
            <span className="text-xs font-black uppercase text-slate-400">members</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">Same cohort - one day back</div>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">This week</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 tabular-nums">{c.weeklyCount.toLocaleString()}</span>
            <span className="text-xs font-black uppercase text-slate-400">total</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">7-day rolling adoption</div>
        </div>
        <div className="rounded-xl p-4 border shadow-sm"
             style={{ borderColor: "rgba(16,185,129,0.30)", background: "linear-gradient(135deg, rgba(236,253,245,0.7), rgba(255,255,255,0.9))" }}>
          <div className="text-[9px] font-black uppercase tracking-wider text-emerald-700 mb-1">Success rate</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-700 tabular-nums">{c.successRatePct}%</span>
            <span className="text-xs font-black uppercase text-emerald-700">hit 80% TIR</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Cohort avg TIR yesterday: <span className="font-black text-slate-700">{c.avgTirYesterday}%</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] font-medium text-slate-600">
        <span className="text-lg leading-none">🌱</span>
        <span>
          <span className="font-black text-slate-800">Sally, you sat 3 points above your cohort yesterday</span>
          {" "}(87% vs {c.avgTirYesterday}%). Small wins compound - keep the pattern going.
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Active challenges (member-vs-member)
// ============================================================================

interface Challenge {
  id: string;
  direction: "sent" | "received";
  memberName: string;
  memberInitials: string;
  memberTint: string;
  pathName: string;
  status: "active" | "pending";
  dayNumber?: number;   // if active
  totalDays?: number;   // if active
  theirTir?: number;    // active only
  yourTir?: number;     // active only
  cheer?: string;       // active flavor line
}

// Compact per-path curated demo state.
function challengesForPath(pathId: string): Challenge[] {
  if (pathId === "long-walker") {
    return [
      {
        id: "c1", direction: "sent", memberName: "Rachel R.", memberInitials: "RR", memberTint: "#F59E0B",
        pathName: "The Long Walker", status: "active", dayNumber: 3, totalDays: 7,
        theirTir: 85, yourTir: 87, cheer: "Neck and neck - keep it up!",
      },
      {
        id: "c2", direction: "received", memberName: "Priya M.", memberInitials: "PM", memberTint: "#8B5CF6",
        pathName: "The Splitter", status: "pending",
      },
    ];
  }
  if (pathId === "splitter") {
    return [
      {
        id: "c3", direction: "sent", memberName: "Marcus T.", memberInitials: "MT", memberTint: "#10B981",
        pathName: "The Splitter", status: "active", dayNumber: 5, totalDays: 7,
        theirTir: 82, yourTir: 84, cheer: "You're 2 points ahead - hold your split routine.",
      },
    ];
  }
  return [
    {
      id: "c9", direction: "received", memberName: "Nina K.", memberInitials: "NK", memberTint: "#38BDF8",
      pathName: "The Hydration Champion", status: "pending",
    },
  ];
}

function ActiveChallenges({ pathId, pathName }: { pathId: string; pathName: string }) {
  const items = challengesForPath(pathId);
  return (
    <div className="rounded-2xl p-6 border border-slate-200 shadow-sm bg-white">
      <div className="flex flex-wrap items-start gap-3 mb-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Active challenges</div>
          <div className="text-lg font-black text-slate-900">Push each other, cheer each other.</div>
          <div className="text-[11.5px] text-slate-500 font-medium mt-0.5">
            Challenges are member-to-member. Accepting sends a cheer. Finishing exchanges positive feedback.
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-slate-500 italic">
          No active challenges yet. Tap <span className="font-black text-indigo-700">Challenge a member</span> above to start one.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(ch => <ChallengeRow key={ch.id} ch={ch} />)}
        </div>
      )}
    </div>
  );
}

function ChallengeRow({ ch }: { ch: Challenge }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  if (ch.status === "pending") {
    // Map member's pathName to a canonical pathId for adaptation demo.
    const pathIdForChallenge =
      ch.pathName === "The Splitter" ? "splitter" :
      ch.pathName === "The Hydration Champion" ? "hydration-champion" :
      "long-walker";

    if (accepted) {
      return (
        <div className="p-4 rounded-xl border shadow-sm"
             style={{ borderColor: "rgba(16,185,129,0.30)", background: "linear-gradient(90deg, rgba(236,253,245,0.95), rgba(255,255,255,0.9))" }}>
          <div className="flex items-center gap-3">
            <Avatar name={ch.memberInitials} tint={ch.memberTint} />
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                CHECK Accepted with your adapted plan
              </div>
              <div className="text-sm font-black text-slate-800">
                {ch.memberName}&apos;s {ch.pathName} pattern - your ingredients - Day 1 of 7
              </div>
            </div>
            <button onClick={() => setAccepted(false)}
                    className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">
              Undo
            </button>
          </div>
          <div className="mt-2 h-2 rounded-full bg-emerald-100 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: "14%" }} />
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center gap-4 p-4 rounded-xl border shadow-sm"
             style={{ borderColor: "rgba(139,92,246,0.30)", background: "linear-gradient(90deg, rgba(250,245,255,0.9), rgba(255,255,255,0.9))" }}>
          <Avatar name={ch.memberInitials} tint={ch.memberTint} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-violet-700">
              {ch.memberName} sent you a challenge
            </div>
            <div className="text-sm font-bold text-slate-800">{ch.pathName} - 7 day streak</div>
            <div className="text-[11px] text-slate-500">
              Accepting sends a cheer back and pairs your daily commitments.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              Review &amp; Accept
            </button>
            <button className="px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              Decline
            </button>
          </div>
        </div>
        {modalOpen && (
          <AdaptAcceptModal
            pathId={pathIdForChallenge}
            challengerName={ch.memberName}
            challengerInitials={ch.memberInitials}
            challengerTint={ch.memberTint}
            onCancel={() => setModalOpen(false)}
            onConfirm={() => { setModalOpen(false); setAccepted(true); }}
          />
        )}
      </>
    );
  }
  // active
  const you = ch.yourTir ?? 0;
  const them = ch.theirTir ?? 0;
  const youAhead = you > them;
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border shadow-sm"
         style={{ borderColor: "rgba(79,95,229,0.30)", background: "linear-gradient(90deg, rgba(238,242,255,0.9), rgba(255,255,255,0.9))" }}>
      <Avatar name={ch.memberInitials} tint={ch.memberTint} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
            Sally vs {ch.memberName}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Day {ch.dayNumber} of {ch.totalDays} - {ch.pathName}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <TinyScore label="You" value={you}      big={youAhead}   />
          <TinyScore label={ch.memberInitials} value={them} big={!youAhead} />
          <div className="text-[11px] text-slate-600 italic ml-2">{ch.cheer}</div>
        </div>
        {/* progress bar */}
        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: `${((ch.dayNumber! / ch.totalDays!) * 100).toFixed(0)}%` }} />
        </div>
      </div>
      <button className="px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
        Send cheer
      </button>
    </div>
  );
}

function TinyScore({ label, value, big }: { label: string; value: number; big: boolean }) {
  return (
    <div className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1
      ${big ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
      <span className="uppercase tracking-wider">{label}</span>
      <span className="tabular-nums">{value}%</span>
    </div>
  );
}

function Avatar({ name, tint }: { name: string; tint: string }) {
  return (
    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white font-black text-xs shadow-sm"
         style={{ background: tint }}>
      {name}
    </div>
  );
}

// ============================================================================
// Improvisations - community twists + Nu's personalized suggestion
// ============================================================================

interface Twist {
  id: string;
  label: string;
  desc: string;
  members: number;
  effectLabel: string;   // e.g. "+3 TIR pts" or "+8% stick rate"
  effectTone: "green" | "indigo" | "amber";
}

interface NuTwist {
  headline: string;
  detail: string;
  estimatedLift: string;
}

function improvisationsForPath(pathId: string): { twists: Twist[]; nu: NuTwist } {
  if (pathId === "long-walker") {
    return {
      twists: [
        { id: "t1", label: "Walk with a family member", desc: "Members report higher stick rate when a partner joins.",
          members: 68, effectLabel: "+8% stick rate", effectTone: "indigo" },
        { id: "t2", label: "Post-lunch 5-min mini-walk", desc: "Small stroll after lunch cuts afternoon spikes.",
          members: 42, effectLabel: "+3 TIR pts", effectTone: "green" },
        { id: "t3", label: "Podcast during the walk", desc: "Higher completion rate on rainy days.",
          members: 91, effectLabel: "+12% completion", effectTone: "green" },
      ],
      nu: {
        headline: "Push your walk from 22 to 30 minutes",
        detail:
          "Sally, your walks average 22 minutes. Members who stretched the same walk to 30 saw a bigger evening TIR gain. Small delta, meaningful effect.",
        estimatedLift: "+3-5 TIR pts on nights you walk",
      },
    };
  }
  if (pathId === "splitter") {
    return {
      twists: [
        { id: "t4", label: "Set a 12:30 phone timer", desc: "Reminder locks the post-lunch mini-walk in.",
          members: 34, effectLabel: "+15% completion", effectTone: "indigo" },
        { id: "t5", label: "Take stairs at the office", desc: "Counts toward the split - members trade the second walk for stairs.",
          members: 22, effectLabel: "same TIR", effectTone: "amber" },
      ],
      nu: {
        headline: "Anchor the second walk to a fixed cue",
        detail: "You skip the second walk more than the first. Members who pin it to a recurring event (dinner, TV show) stick 40% better.",
        estimatedLift: "+2 stick-rate points",
      },
    };
  }
  return {
    twists: [
      { id: "tX", label: "Log twists in the app", desc: "As you tweak, Nu learns what works for you.",
        members: 156, effectLabel: "personalization", effectTone: "indigo" },
    ],
    nu: {
      headline: "Try a small variation this week",
      detail: "Every path has room for a personal twist. Log yours - Nu measures the effect against your baseline.",
      estimatedLift: "learn what fits you",
    },
  };
}

function Improvisations({ pathId, pathName }: { pathId: string; pathName: string }) {
  const { twists, nu } = improvisationsForPath(pathId);
  const toneTint: Record<Twist["effectTone"], { bg: string; fg: string }> = {
    green:  { bg: "#ECFDF5", fg: "#047857" },
    indigo: { bg: "#EEF2FF", fg: "#4338CA" },
    amber:  { bg: "#FEF3C7", fg: "#92400E" },
  };
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Community twists — spans 2 cols */}
      <div className="md:col-span-2 rounded-2xl p-6 border border-slate-200 shadow-sm bg-white">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
              Community twists on {pathName}
            </div>
            <div className="text-lg font-black text-slate-900">What other members are doing differently.</div>
            <div className="text-[11.5px] text-slate-500 font-medium mt-0.5">
              Every twist is member-suggested. Nu measures the effect on TIR and stick-rate, and surfaces the ones that actually work.
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {twists.map(t => {
            const tone = toneTint[t.effectTone];
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border shadow-sm"
                   style={{ borderColor: "rgba(15,23,42,0.08)" }}>
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                  {t.members}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-900 leading-tight">{t.label}</div>
                  <div className="text-[11px] text-slate-500 leading-tight">{t.desc}</div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg"
                     style={{ background: tone.bg, color: tone.fg }}>
                  {t.effectLabel}
                </div>
                <button className="text-[11px] font-black uppercase tracking-wider text-indigo-700 hover:text-indigo-900 shrink-0">
                  Try this twist →
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-[11px] text-slate-500 font-medium">
          💡 Log your own twist and Nu will measure the effect. If it helps your cohort, it gets shared.
        </div>
      </div>

      {/* Nu's personalized suggestion — 1 col */}
      <ShadedCard tone="violet" padding="p-6">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-700 mb-2">
          Nu's twist for you
        </div>
        <div className="text-base font-black text-slate-900 leading-tight mb-2">{nu.headline}</div>
        <p className="text-[13px] text-slate-700 leading-relaxed">{nu.detail}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Estimated lift</span>
          <span className="text-sm font-black text-emerald-700">{nu.estimatedLift}</span>
        </div>
        <button className="mt-5 w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-black uppercase tracking-wider transition">
          Add this twist to my week
        </button>
      </ShadedCard>
    </div>
  );
}

// ============================================================================
// Mini path cards
// ============================================================================

function MiniPathCard({ path, selected, onClick }: {
  path: JourneyPath; selected: boolean; onClick: () => void;
}) {
  const toneBorder: Record<string, string> = {
    gold:    "linear-gradient(135deg, #F6D77E, #C89A3B)",
    indigo:  "linear-gradient(135deg, #A5B4FC, #4F5FE5)",
    emerald: "linear-gradient(135deg, #6EE7B7, #059669)",
    violet:  "linear-gradient(135deg, #C4B5FD, #6D28D9)",
    rose:    "linear-gradient(135deg, #FDA4AF, #BE123C)",
    sky:     "linear-gradient(135deg, #7DD3FC, #0369A1)",
  };
  return (
    <button
      onClick={onClick}
      className={`text-left transition ${selected ? "scale-[1.03]" : "hover:scale-[1.02] opacity-90"}`}
      style={{ borderRadius: 16, padding: selected ? 2.5 : 1.5, background: toneBorder[path.tone] }}
    >
      <div style={{ borderRadius: selected ? 13.5 : 14.5, background: "#FFFFFF" }} className="p-3 h-full">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-base">{path.emoji}</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 ml-auto">{path.matchStrength}%</span>
        </div>
        <div className="text-sm font-black text-slate-900 leading-tight">{path.name}</div>
        <div className="text-[10px] text-slate-500 mt-1 leading-tight line-clamp-2">{path.focus}</div>
        <div className="mt-2 text-[10px] font-black tabular-nums text-indigo-600">
          {path.cohort.todayCount} today
        </div>
        {selected && (
          <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-indigo-600">● Now viewing</div>
        )}
      </div>
    </button>
  );
}


// ============================================================================
// Coach broadcast challenge - top-down accountability
// ============================================================================

interface CoachChallenge {
  coachName: string;
  coachInitials: string;
  coachTint: string;
  headline: string;
  message: string;
  pathName: string;
  totalCohort: number;
  accepted: number;
  declined: number;
  noResponse: number;
  avgTirDay1: number;
  completionByDay: number[];  // Day 1..7 (% still active)
  topDeclineReason: string;
}

const COACH_BY_PATH: Record<string, CoachChallenge> = {
  "long-walker": {
    coachName: "Maya Patel", coachInitials: "MP", coachTint: "#EF5C3E",
    headline: "This week's cohort challenge",
    message: "Team, one plan for the week: The Long Walker. Twenty minutes after dinner, protein-first mornings. Let's do it together.",
    pathName: "The Long Walker",
    totalCohort: 428, accepted: 312, declined: 43, noResponse: 73,
    avgTirDay1: 82,
    completionByDay: [98, 94, 89, 85, 82, 80, 78],
    topDeclineReason: "Travel this week (18 of 43)",
  },
  "splitter":  { coachName: "Maya Patel", coachInitials: "MP", coachTint: "#EF5C3E",
    headline: "Alternate challenge", message: "For those who can't lock in one long walk, try the Splitter this week - two shorter walks.",
    pathName: "The Splitter", totalCohort: 428, accepted: 118, declined: 22, noResponse: 288,
    avgTirDay1: 79, completionByDay: [95, 89, 84, 80, 76, 74, 72],
    topDeclineReason: "Prefer one long session (14 of 22)",
  },
};

function coachChallengeFor(pathId: string): CoachChallenge {
  return COACH_BY_PATH[pathId] ?? COACH_BY_PATH["long-walker"];
}

type CoachRespState = "pending" | "accepted" | "declined";

function CoachBroadcast({ pathId, pathName }: { pathId: string; pathName: string }) {
  const ch = coachChallengeFor(pathId);
  const [resp, setResp] = useState<CoachRespState>("pending");
  const acceptedPct = Math.round((ch.accepted / ch.totalCohort) * 100);

  return (
    <div className="rounded-2xl p-[3px] shadow-xl"
         style={{ background: "linear-gradient(135deg, #F87171 0%, #EC4A83 45%, #A855F7 100%)" }}>
      <div className="rounded-[15px] bg-white p-6">
        <div className="flex flex-wrap items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white font-black text-sm shadow"
               style={{ background: ch.coachTint }}>
            {ch.coachInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-600 mb-0.5">
              📣 Coach {ch.coachName} - {ch.headline}
            </div>
            <div className="text-lg font-black text-slate-900 leading-tight mb-1">
              &ldquo;{ch.message}&rdquo;
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Path: <span className="font-black text-slate-700">{ch.pathName}</span> - 7-day cohort challenge
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Cohort so far</div>
            <div className="text-2xl font-black text-emerald-700 tabular-nums">{acceptedPct}%</div>
            <div className="text-[10px] font-black text-slate-500">
              {ch.accepted} of {ch.totalCohort} said yes
            </div>
          </div>
        </div>

        {/* Response state */}
        {resp === "pending" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setResp("accepted")}
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black uppercase tracking-wider shadow-sm transition">
              ✓ I'm in
            </button>
            <button
              onClick={() => setResp("declined")}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-black uppercase tracking-wider transition">
              Not this week
            </button>
          </div>
        )}
        {resp === "accepted" && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">You are in.</div>
                <div className="text-sm font-black text-emerald-900">Day 1 of 7 - {ch.pathName} cohort challenge</div>
                <div className="mt-2 h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: "14%" }} />
                </div>
              </div>
              <button onClick={() => setResp("pending")}
                      className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">
                Undo
              </button>
            </div>
          </div>
        )}
        {resp === "declined" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👋</span>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Not this week</div>
                <div className="text-sm font-black text-slate-800">Maya will follow up. You can join anytime.</div>
              </div>
              <button onClick={() => setResp("pending")}
                      className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">
                Change my mind
              </button>
            </div>
          </div>
        )}

        {/* Coach's insights preview */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-2">
            👁 What Maya sees
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniInsight label="Acceptance" value={`${acceptedPct}%`} sub={`${ch.accepted} of ${ch.totalCohort}`} tone="emerald" />
            <MiniInsight label="Declined"   value={`${ch.declined}`}  sub={ch.topDeclineReason} tone="slate" />
            <MiniInsight label="No response yet" value={`${ch.noResponse}`} sub="Nu will nudge at 4 PM" tone="amber" />
            <MiniInsight label="Day 1 avg TIR" value={`${ch.avgTirDay1}%`} sub="Accepters vs 74% baseline" tone="indigo" />
          </div>
          <CompletionCurve days={ch.completionByDay} />
          <CompatibilityBar pathId={pathId} />
        </div>
      </div>
    </div>
  );
}

function MiniInsight({ label, value, sub, tone }:
  { label: string; value: string; sub: string; tone: "emerald" | "slate" | "amber" | "indigo" }) {
  const tint: Record<string, { bg: string; fg: string }> = {
    emerald: { bg: "#ECFDF5", fg: "#047857" },
    slate:   { bg: "#F8FAFC", fg: "#334155" },
    amber:   { bg: "#FEF3C7", fg: "#92400E" },
    indigo:  { bg: "#EEF2FF", fg: "#4338CA" },
  };
  const t = tint[tone];
  return (
    <div className="rounded-lg p-3 border shadow-sm"
         style={{ background: t.bg, borderColor: t.fg + "22" }}>
      <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: t.fg }}>{label}</div>
      <div className="text-xl font-black tabular-nums" style={{ color: t.fg }}>{value}</div>
      <div className="text-[10px] text-slate-500 font-medium leading-tight">{sub}</div>
    </div>
  );
}

function CompletionCurve({ days }: { days: number[] }) {
  // Small sparkline showing accepter drop-off through the 7-day challenge.
  const w = 640, h = 60, padL = 30, padR = 10, padT = 6, padB = 20;
  const xAt = (i: number) => padL + (i / (days.length - 1)) * (w - padL - padR);
  const yAt = (v: number) => padT + (1 - (v - 60) / 40) * (h - padT - padB);
  const pts = days.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  return (
    <div className="mt-4">
      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
        Completion curve - % of accepters still active by day
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {[60, 80, 100].map(v => (
          <g key={v}>
            <line x1={padL} y1={yAt(v)} x2={w - padR} y2={yAt(v)} stroke="#E5E7EB" strokeWidth={1} />
            <text x={padL - 4} y={yAt(v) + 3} textAnchor="end" fontSize={8} fill="#6B7280" fontWeight={700}>{v}</text>
          </g>
        ))}
        <polyline points={pts} fill="none" stroke="#4F5FE5" strokeWidth={2} />
        {days.map((v, i) => (
          <g key={i}>
            <circle cx={xAt(i)} cy={yAt(v)} r={2.5} fill="#4F5FE5" />
            <text x={xAt(i)} y={h - 4} textAnchor="middle" fontSize={8} fill="#6B7280" fontWeight={700}>D{i + 1}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}


// ============================================================================
// Adapt-on-accept modal - the two-layer accept pattern
// Shows Rachel's pattern (transferable) + Sally's adapted ingredients (personal).
// This is the safety pattern for peer-to-peer challenges that include meals.
// ============================================================================

function AdaptAcceptModal({
  pathId, challengerName, challengerInitials, challengerTint,
  onCancel, onConfirm,
}: {
  pathId: string;
  challengerName: string;
  challengerInitials: string;
  challengerTint: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [understood, setUnderstood] = useState(false);
  const adapted: AdaptedPath = adaptPathForMember(pathId, SALLY_PROFILE);

  const compatTint: Record<string, { label: string; bg: string; fg: string }> = {
    fits: { label: "Fits you as-is",         bg: "#ECFDF5", fg: "#047857" },
    swap: { label: "Adapted to your plan",   bg: "#FEF3C7", fg: "#92400E" },
    skip: { label: "Not recommended for you",bg: "#FEF2F2", fg: "#B91C1C" },
  };
  const cTint = compatTint[adapted.overallCompatibility];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
         style={{ background: "rgba(15,23,42,0.55)" }}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shadow"
                 style={{ background: challengerTint }}>
              {challengerInitials}
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">
                {challengerName}&apos;s pattern - adapted for you
              </div>
              <div className="text-xl font-black text-slate-900">Before you accept</div>
              <div className="text-sm text-slate-600">
                The <span className="font-black">pattern</span> is what transfers between members.
                The <span className="font-black">ingredients</span> are personalized to your plan.
              </div>
            </div>
            <button onClick={onCancel}
                    className="text-2xl text-slate-400 hover:text-slate-700 font-black">×</button>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full"
               style={{ background: cTint.bg, color: cTint.fg }}>
            <span className="text-[10px] font-black uppercase tracking-wider">{cTint.label}</span>
          </div>
          <div className="mt-2 text-sm text-slate-700 font-medium">
            {adapted.memberSummary}
          </div>
        </div>

        {/* Pattern layer - shared with challenger */}
        <div className="p-6 border-b border-slate-100 bg-indigo-50/40">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-2">
            The pattern - same as {challengerName}&apos;s
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <PatternTile label="Movement" value={adapted.pattern.movement} />
            <PatternTile label="Timing"   value={adapted.pattern.timing} />
            <PatternTile label="Shape"    value={adapted.pattern.shape} />
          </div>
        </div>

        {/* Ingredients layer - personalized */}
        <div className="p-6 border-b border-slate-100">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-600 mb-2">
            Your ingredients - adapted for your plan
          </div>
          <div className="space-y-2">
            <MealDiffRow label="Breakfast" item={adapted.breakfast} />
            <MealDiffRow label="Lunch"     item={adapted.lunch} />
            <MealDiffRow label="Dinner"    item={adapted.dinner} />
            {adapted.snack && <MealDiffRow label="Snack" item={adapted.snack} />}
          </div>
          {adapted.cohortReference && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 font-medium">
              👥 {adapted.cohortReference}
            </div>
          )}
        </div>

        {/* Consent gate + confirm */}
        <div className="p-6 space-y-4">
          <label className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
            <input type="checkbox" checked={understood} onChange={e => setUnderstood(e.target.checked)}
                   className="mt-1 w-4 h-4 accent-indigo-600" />
            <span className="text-[12px] text-slate-700 leading-relaxed font-medium">
              I understand this is a <span className="font-black">behavior challenge</span>, not a meal prescription.
              My personalized version replaces {challengerName}&apos;s meals with foods that fit my plan.
              I&apos;ll talk to my coach if anything doesn&apos;t feel right.
            </span>
          </label>
          <div className="flex items-center gap-3">
            <button
              disabled={!understood}
              onClick={onConfirm}
              className={"flex-1 px-4 py-3 rounded-xl text-white text-sm font-black uppercase tracking-wider shadow-sm transition " +
                (understood ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300 cursor-not-allowed")}>
              Accept with my adapted plan
            </button>
            <button onClick={onCancel}
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-black uppercase tracking-wider">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatternTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-white border border-indigo-100 shadow-sm">
      <div className="text-[9px] font-black uppercase tracking-wider text-indigo-500">{label}</div>
      <div className="text-[13px] font-black text-slate-800 leading-snug">{value}</div>
    </div>
  );
}

function MealDiffRow({ label, item }: { label: string; item: AdaptedItem }) {
  const flag = item.flag;
  const changed = flag === "changed";
  const asIs = flag === "as-is";
  const bg = changed ? "#FFFBEB" : asIs ? "#F0FDF4" : "#FEF2F2";
  const border = changed ? "#F59E0B33" : asIs ? "#10B98133" : "#EF444433";
  const fg = changed ? "#92400E" : asIs ? "#047857" : "#B91C1C";
  const chip = changed ? "SWAP" : asIs ? "AS-IS" : "WARN";
  return (
    <div className="p-3 rounded-lg border" style={{ background: bg, borderColor: border }}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: fg }}>{label}</div>
        <div className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: fg + "22", color: fg }}>{chip}</div>
      </div>
      {changed ? (
        <div className="text-[12px] text-slate-700 leading-snug">
          <span className="line-through text-slate-400">{item.original}</span>
          {" -> "}
          <span className="font-black text-slate-900">{item.adapted}</span>
          <div className="text-[10px] mt-1 font-medium" style={{ color: fg }}>{item.reason}</div>
        </div>
      ) : (
        <div className="text-[12px] text-slate-800 font-medium">
          {item.adapted}
          <span className="ml-2 text-[10px] font-medium" style={{ color: fg }}>({item.reason})</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Cohort compatibility bar - what Maya sees for the coach-broadcast case
// ============================================================================

function CompatibilityBar({ pathId }: { pathId: string }) {
  const c = cohortCompatibility(pathId);
  const pctClean = Math.round((c.adaptsClean / c.totalCohort) * 100);
  const pctSwap  = Math.round((c.needsSwap   / c.totalCohort) * 100);
  const pctSkip  = 100 - pctClean - pctSwap;

  return (
    <div className="mt-4 p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-600">
          Cohort fit - who can adopt this path
        </div>
        <div className="text-[10px] font-black text-slate-500">
          Total {c.totalCohort} members
        </div>
      </div>
      <div className="flex w-full h-3 rounded-full overflow-hidden border border-slate-200">
        <div style={{ width: `${pctClean}%`, background: "#10B981" }} title={`Fits as-is: ${c.adaptsClean}`} />
        <div style={{ width: `${pctSwap}%`,  background: "#F59E0B" }} title={`Needs swap: ${c.needsSwap}`} />
        <div style={{ width: `${pctSkip}%`,  background: "#EF4444" }} title={`Should skip: ${c.shouldSkip}`} />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <CompatLegend color="#10B981" label="Fits as-is" count={c.adaptsClean} pct={pctClean} />
        <CompatLegend color="#F59E0B" label="Auto-adapted" count={c.needsSwap} pct={pctSwap} />
        <CompatLegend color="#EF4444" label="Should skip" count={c.shouldSkip} pct={pctSkip} />
      </div>
      {c.skipReasonBreakdown.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">
            Skip reasons (Maya can outreach)
          </div>
          <div className="flex flex-wrap gap-1">
            {c.skipReasonBreakdown.map(r => (
              <span key={r.reason} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                {r.reason} - {r.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompatLegend({ color, label, count, pct }:
  { color: string; label: string; count: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</div>
        <div className="text-[11px] font-black text-slate-800 tabular-nums">{count} <span className="text-slate-400 font-medium">({pct}%)</span></div>
      </div>
    </div>
  );
}


// ============================================================================
// LONG WALKER HERO - matches slide 3 of the Long Walker deck
// Lavender rounded card with left-side headline stack + right-side walking figure.
// ============================================================================

function LongWalkerHero({ path }: { path: JourneyPath }) {
  return (
    <div className="rounded-2xl overflow-hidden border shadow-sm"
         style={{ borderColor: "#E5DEFF", background: "linear-gradient(135deg, #F5F1FF 0%, #EDE7FF 100%)" }}>
      <div className="grid md:grid-cols-[1.35fr_1fr] gap-6 p-6 md:p-8 items-center">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-md"
                 style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
              <WalkerIcon />
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-600">
              Today&apos;s Best Path
            </div>
          </div>
          <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-3">
            {path.name}
          </div>
          <div className="text-[15px] text-slate-700 font-medium leading-relaxed mb-5 max-w-md">
            A walk after dinner gives you the best chance to stay on track today.
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 border border-indigo-100 shadow-sm">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EEF2FF" }}>
              <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" />
              </svg>
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Expected outcome</div>
              <div className="text-[12px] font-black text-slate-800">Smaller after-dinner glucose rise</div>
            </div>
          </div>
        </div>
        {/* Right-side walking figure illustration (inline SVG) */}
        <div className="flex justify-center md:justify-end">
          <WalkerScene />
        </div>
      </div>
    </div>
  );
}

function WalkerIcon() {
  return (
    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4" r="2" />
      <path d="M4 22l5-8 4 5 4-4 3 6" />
      <path d="M13 6l-3 4 3 3 3-2" />
    </svg>
  );
}

function WalkerScene() {
  // PPT walker illustration with a subtle bob animation.
  return (
    <div className="relative w-[280px] h-[210px] rounded-2xl overflow-hidden shadow-inner"
         style={{ background: "linear-gradient(180deg, #FFE9EE 0%, #EFE6FF 55%, #DCE7C7 100%)" }}>
      {/* Direction indicator */}
      <div className="absolute z-10" style={{ top: 10, left: 12 }}>
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/85 backdrop-blur border border-white/60 shadow-sm text-[10px] font-black tracking-wider text-indigo-700">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 6 13 12 7 18" /><polyline points="13 6 19 12 13 18" /></svg>
          WALKING
        </div>
      </div>
      {/* PPT walker illustration */}
      <img
        src="/journey/ppt/walker.png"
        alt="Sally taking a walk"
        className="absolute inset-0 w-full h-full object-cover walker-bob"
      />
      <style jsx>{`
        @keyframes walkerBob {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-3px); }
        }
        :global(.walker-bob) {
          animation: walkerBob 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}



// ============================================================================
// TODAY'S COMMITMENT CARD - matches slide 3's checklist card
// ============================================================================

interface Commitment { emoji: string; tint: string; label: string; }

const COMMITMENTS_BY_PATH: Record<string, Commitment[]> = {
  "long-walker":       [
    { emoji: "SHOE",  tint: "#EEF2FF", label: "Walk 30 minutes after dinner" },
    { emoji: "WATER", tint: "#DBEAFE", label: "Drink a glass of water before your walk" },
    { emoji: "PLATE", tint: "#DCFCE7", label: "Keep dinner balanced" },
  ],
  "splitter":          [
    { emoji: "SHOE",  tint: "#EEF2FF", label: "Two 12-minute walks - after lunch, after dinner" },
    { emoji: "WATER", tint: "#DBEAFE", label: "Water before each walk" },
    { emoji: "PLATE", tint: "#DCFCE7", label: "Half-veggies at both meals" },
  ],
  "fiber-forward":     [
    { emoji: "PLATE", tint: "#DCFCE7", label: "Fiber before starch at every meal" },
    { emoji: "SHOE",  tint: "#EEF2FF", label: "10-min walk after every meal" },
    { emoji: "WATER", tint: "#DBEAFE", label: "3 glasses of water with meals" },
  ],
  "protein-anchored":  [
    { emoji: "PLATE", tint: "#DCFCE7", label: "30g protein at breakfast" },
    { emoji: "SHOE",  tint: "#EEF2FF", label: "15-min walk after breakfast + dinner" },
    { emoji: "PLATE", tint: "#DCFCE7", label: "40g protein at dinner" },
  ],
  "hydration-champion":[
    { emoji: "WATER", tint: "#DBEAFE", label: "3L water spread across the day" },
    { emoji: "SHOE",  tint: "#EEF2FF", label: "Walk after each glass" },
    { emoji: "WATER", tint: "#DBEAFE", label: "Electrolyte drink at 3 PM" },
  ],
  "mindful-meals": [
    { emoji: "PLATE", tint: "#DCFCE7", label: "Half the plate is non-starchy vegetables" },
    { emoji: "PLATE", tint: "#DCFCE7", label: "Protein and fiber before carbs" },
    { emoji: "PLATE", tint: "#DCFCE7", label: "Stop at 80% full - last bites spike the most" },
  ],
  "steady-simple": [
    { emoji: "SHOE",  tint: "#EEF2FF", label: "Same meal times every day (8, 12, 7)" },
    { emoji: "PLATE", tint: "#DCFCE7", label: "Rotate 3 breakfasts, 3 lunches, 3 dinners" },
    { emoji: "WATER", tint: "#DBEAFE", label: "One habit at a time - master, then add" },
  ],
  "move-more": [
    { emoji: "SHOE",  tint: "#EEF2FF", label: "10-min walk right after breakfast" },
    { emoji: "SHOE",  tint: "#EEF2FF", label: "Take the stairs whenever possible" },
    { emoji: "SHOE",  tint: "#EEF2FF", label: "Hit 7,000+ steps by noon" },
  ],
  "rest-reset": [
    { emoji: "WATER", tint: "#DBEAFE", label: "Screens off 60 min before bed" },
    { emoji: "PLATE", tint: "#DCFCE7", label: "Cool the room to 65-68F" },
    { emoji: "SHOE",  tint: "#EEF2FF", label: "Same wake time every day - weekends included" },
  ],
};

function commitmentsFor(pathId: string): Commitment[] {
  return COMMITMENTS_BY_PATH[pathId] ?? COMMITMENTS_BY_PATH["long-walker"];
}

function TodaysCommitmentCard({ path }: { path: JourneyPath }) {
  const items = commitmentsFor(path.id);
  const [checked, setChecked] = useState<boolean[]>(items.map(() => false));
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
      <div className="text-lg font-black text-slate-900 mb-4">Today&apos;s Commitment</div>
      <div className="space-y-2">
        {items.map((c, i) => (
          <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition">
            <span
              className={"w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition " +
                (checked[i] ? "bg-indigo-600 border-indigo-600" : "border-slate-300 bg-white")}
              onClick={e => { e.preventDefault(); setChecked(v => v.map((x, j) => j === i ? !x : x)); }}
            >
              {checked[i] && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>}
            </span>
            <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xl"
                  style={{ background: c.tint }}>
              <CommitmentIcon kind={c.emoji} />
            </span>
            <span className="text-[14px] font-bold text-slate-800 leading-tight">{c.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CommitmentIcon({ kind }: { kind: string }) {
  if (kind === "SHOE") return (
    <svg className="w-5 h-5 text-indigo-700" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 17c0-3 3-5 6-5s5 2 6 3l4 1c2 0 4 1 4 3v1H2v-3z" />
      <circle cx="6" cy="19" r="1.2" fill="#fff" /><circle cx="12" cy="19" r="1.2" fill="#fff" /><circle cx="18" cy="19" r="1.2" fill="#fff" />
    </svg>
  );
  if (kind === "WATER") return (
    <svg className="w-5 h-5 text-sky-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h12l-1 16H7L6 4z" opacity="0.5" />
      <path d="M6 4h12l-.4 6H6.4L6 4z" />
    </svg>
  );
  // PLATE
  return (
    <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" opacity="0.5" />
      <path d="M10 10c1-1 3-1 4 0" /><path d="M10 14c1 1 3 1 4 0" />
    </svg>
  );
}

// ============================================================================
// WHY NU CHOSE THIS PATH CARD - matches slide 3's evidence + CTA card
// ============================================================================

const WHY_BY_PATH: Record<string, string[]> = {
  "long-walker": [
    "You walked after dinner 4 of the last 6 successful days.",
    "Your glucose stayed in range longer on walking days.",
    "Tomorrow is usually easier when you walk tonight.",
  ],
  "splitter": [
    "Your best TIR weeks had two shorter walks, not one long one.",
    "Splitting works better on your busy days.",
    "12 minutes twice fits your calendar this week.",
  ],
  "fiber-forward": [
    "Fiber-first mornings gave you the flattest curves.",
    "35g fiber days had 12% higher TIR on average.",
    "Your body responds well to legume-heavy lunches.",
  ],
  "protein-anchored": [
    "Protein at breakfast keeps you full through mid-morning.",
    "Your 3 best days all had 30g+ breakfast protein.",
    "Fewer 3 PM cravings on protein-anchored days.",
  ],
  "hydration-champion": [
    "You spike less on well-hydrated days.",
    "3L water days had 15% higher TIR.",
    "Water before meals cuts your post-meal peak.",
  ],
  "mindful-meals": [
    "Veggies-first days had the flattest curves in your history.",
    "Your 80%-full days all landed in the top TIR quartile.",
    "Order of eating cuts your peaks by 18 mg/dL on average.",
  ],
  "steady-simple": [
    "Predictable meal times cut your glucose variability by 20%.",
    "Rotating a small cookbook removes decision fatigue.",
    "Cohort members who kept it simple saw the highest consistency.",
  ],
  "move-more": [
    "Morning-anchored movement primes your metabolism for the day.",
    "Your active mornings had 22 mg/dL lower afternoon peaks.",
    "Sub-noon 7K+ steps days had 15% higher TIR.",
  ],
  "rest-reset": [
    "7.5+ hours of sleep gives you 12% lower fasting glucose.",
    "A cool room and screens-off boosted your deep-sleep minutes.",
    "Wake-time consistency is your #1 sleep-quality lever.",
  ],
};

function WhyNuChoseCard({ path, onOpenChooser }: { path: JourneyPath; onOpenChooser: () => void }) {
  const reasons = WHY_BY_PATH[path.id] ?? WHY_BY_PATH["long-walker"];
  const [committed, setCommitted] = useState(false);
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 flex flex-col">
      <div className="text-lg font-black text-slate-900 mb-4">Why Nu chose this path</div>
      <div className="space-y-3 mb-5 flex-1">
        {reasons.map((r, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
            </span>
            <span className="text-[13px] text-slate-700 font-medium leading-relaxed">{r}</span>
          </div>
        ))}
      </div>
      {committed ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
            </span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">You&apos;re doing it</div>
              <div className="text-sm font-black text-emerald-900">Nu will check in tonight at 9:15 PM</div>
            </div>
            <button onClick={() => setCommitted(false)} className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">
              Undo
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCommitted(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white text-base font-black tracking-wide shadow-lg shadow-indigo-200 transition hover:brightness-110"
          style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
          I&apos;m doing it
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
        </button>
      )}
      <button
        onClick={onOpenChooser}
        className="mt-3 flex items-center justify-center gap-1.5 text-[13px] font-black text-indigo-600 hover:text-indigo-800">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8M12 8v8" />
        </svg>
        Choose another path
      </button>
    </div>
  );
}

// ============================================================================
// Choose-another-path modal — all 9 paths with short "best for" explanations.
// ============================================================================

// Short 2-line "best for" copy per path. Keeps each card scannable in the modal.
const PATH_DESCRIPTIONS: Record<string, string> = {
  "long-walker":
    "Best when you can commit to one 20-minute walk after dinner. Simple, high-impact, most cohort members' favorite.",
  "splitter":
    "Best when your schedule is unpredictable. Two 10-minute walks (post-lunch + post-dinner) beat one long one on busy days.",
  "fiber-forward":
    "Best when digestion feels slow on GLP-1. Veggies + fiber first at each meal pace your glucose curve gently.",
  "protein-anchored":
    "Best when hunger between meals is your challenge. 25-30 g of protein per meal keeps you steady and full.",
  "hydration-champion":
    "Best when you feel fatigued or foggy on GLP-1. 8+ glasses a day flattens your curve and lifts energy.",
  "mindful-meals":
    "Best when you cook most meals at home. Balanced plates and slower eating do the heavy lifting.",
  "steady-simple":
    "Best when decision fatigue is real. Predictable meals and routines cut variability by ~20%.",
  "move-more":
    "Best when evenings are unpredictable. Activity earlier in the day primes your metabolism through dinner.",
  "rest-reset":
    "Best when sleep is your weakest link. 7.5+ hours of consistent sleep drops fasting glucose by ~12%.",
};

function ChoosePathModal({
  currentPathId,
  onSelect,
  onClose,
}: {
  currentPathId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toneBorder: Record<string, string> = {
    gold:    "linear-gradient(135deg, #F6D77E, #C89A3B)",
    indigo:  "linear-gradient(135deg, #A5B4FC, #4F5FE5)",
    emerald: "linear-gradient(135deg, #6EE7B7, #059669)",
    violet:  "linear-gradient(135deg, #C4B5FD, #6D28D9)",
    rose:    "linear-gradient(135deg, #FDA4AF, #BE123C)",
    sky:     "linear-gradient(135deg, #7DD3FC, #0369A1)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose another path"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 px-7 py-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-1">
              Your path library · {JOURNEY_PATHS.length} paths
            </div>
            <div className="text-xl font-black text-slate-900 leading-tight">Choose another path</div>
            <div className="text-[13px] text-slate-500 font-medium mt-1">
              Tap a path to make it today&apos;s Best Path. Nu will re-tune every screen to match.
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cards grid */}
        <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNEY_PATHS.map(p => {
            const isCurrent = p.id === currentPathId;
            const desc = PATH_DESCRIPTIONS[p.id] ?? p.focus;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`text-left transition group ${isCurrent ? "" : "hover:-translate-y-0.5"}`}
                style={{
                  borderRadius: 18,
                  padding: isCurrent ? 2.5 : 1.5,
                  background: toneBorder[p.tone] ?? toneBorder.indigo,
                }}
              >
                <div
                  className="p-5 h-full flex flex-col"
                  style={{
                    borderRadius: isCurrent ? 15.5 : 16.5,
                    background: "#FFFFFF",
                    minHeight: 210,
                  }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-2xl leading-none">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-black text-slate-900 leading-tight">{p.name}</div>
                      <div className="text-[11px] font-bold text-slate-500 mt-0.5 leading-tight">{p.focus}</div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 tabular-nums shrink-0">
                      {p.matchStrength}%
                    </span>
                  </div>

                  <div className="text-[12.5px] text-slate-700 font-medium leading-relaxed flex-1">
                    {desc}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] font-black tabular-nums text-indigo-600">
                      {p.cohort.todayCount} doing this today
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                        Now viewing
                      </span>
                    ) : (
                      <span className="text-[11px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                        Choose &rarr;
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-7 py-4 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500 font-medium flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
          </svg>
          Nu will keep an eye on your CGM + Update Me and can auto-adjust the path mid-day if your day changes.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BestDayMirrorCard — the "Best Path is a mirror, not a plan" UX mockup
// -----------------------------------------------------------------------------
// Companion to the Best_Path_UX_Case.docx. Renders on /journey Best Path step
// so the UX team can see the argument running, not just described. Uses Sarah's
// (Sally's) real Tuesday data: timeline + physiology + felt quote + 3-choice
// CTA where "Not today" is the anti-shame primitive.
// ============================================================================

function BestDayMirrorCard() {
  const [state, setState] = useState<"idle" | "trying" | "adjusting" | "dismissed">("idle");
  const [expanded, setExpanded] = useState(false);

  const timeline = [
    { time: "7:14 AM",  label: "Sunlight walk, 12 min",                 icon: "🌤" },
    { time: "12:30 PM", label: "Protein-first lunch (chicken salad)",   icon: "🥗" },
    { time: "6:15 PM",  label: "Early dinner",                          icon: "🍽" },
    { time: "6:45 PM",  label: "15-min walk",                           icon: "🚶🏻‍♀️" },
    { time: "10:30 PM", label: "Lights out",                            icon: "🌙" },
  ];

  return (
    <div className="rounded-3xl p-[2px] shadow-lg"
         style={{ background: "linear-gradient(135deg, #6366F1 0%, #A855F7 55%, #EC4899 100%)" }}>
      <div className="rounded-[22px] bg-white overflow-hidden">
        {/* Header — the mirror framing */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100"
             style={{ background: "linear-gradient(135deg, rgba(238,242,255,0.9) 0%, rgba(245,243,255,0.9) 100%)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                      style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
                  </svg>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">
                  Your best day last week · Nu-scored
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                  Reliability 3 of 14
                </span>
              </div>
              <div className="text-[26px] leading-tight font-black text-slate-900"
                   style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 500 }}>
                Tuesday, Sept 12
              </div>
              <div className="text-[12px] text-slate-600 font-medium mt-0.5">
                A mirror, not a plan. You already lived this shape — repeat it if it fits today.
              </div>
            </div>
            <button
              onClick={() => setExpanded(e => !e)}
              className="shrink-0 text-[10px] font-black uppercase tracking-widest text-indigo-700 hover:text-indigo-900 px-2 py-1 rounded-md border border-indigo-100 bg-white/70">
              {expanded ? "Hide context" : "Show context"}
            </button>
          </div>
        </div>

        {/* Body — timeline + results + quote */}
        <div className="p-6 grid md:grid-cols-[1.15fr_1fr] gap-6">
          {/* Timeline — what she did */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">What you did</div>
            <div className="relative pl-5">
              <span className="absolute left-1.5 top-1 bottom-1 w-[2px] rounded"
                    style={{ background: "linear-gradient(180deg, #A5B4FC, #C4B5FD 50%, #F9A8D4)" }} />
              {timeline.map((t, i) => (
                <div key={i} className="relative flex items-start gap-3 pb-3 last:pb-0">
                  <span className="absolute top-1.5 w-3 h-3 rounded-full ring-2 ring-white"
                        style={{ left: -15, background: i === 0 ? "#6366F1" : i === timeline.length - 1 ? "#EC4899" : "#8B5CF6" }} />
                  <span className="text-xs font-black text-indigo-700 tabular-nums shrink-0 pt-0.5 whitespace-nowrap" style={{ minWidth: 72 }}>{t.time}</span>
                  <span className="text-base leading-none shrink-0 pt-0.5">{t.icon}</span>
                  <span className="text-[13px] text-slate-800 font-bold leading-snug">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Physiology + quote */}
          <div className="space-y-3">
            <div className="rounded-2xl p-4 border shadow-sm"
                 style={{ borderColor: "#A7F3D0", background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDFA 100%)" }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-2">How it went</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <ResultTile label="TIR"   value="91%"    tone="#047857" />
                <ResultTile label="HRV"   value="51 ms"  tone="#047857" />
                <ResultTile label="Sleep" value="7h 42m" tone="#047857" />
                <ResultTile label="Mood"  value="5/5"    tone="#047857" />
              </div>
            </div>

            <div className="rounded-2xl p-4 border shadow-sm"
                 style={{ borderColor: "#FED7AA", background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)" }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1.5">You wrote at 9 PM</div>
              <div className="text-[15px] leading-snug text-slate-800"
                   style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
                &ldquo;Felt like myself again.&rdquo;
              </div>
            </div>
          </div>
        </div>

        {/* Optional context strip — the 6 elements the doc calls out */}
        {expanded && (
          <div className="px-6 pb-6 -mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadein">
            <ContextTile
              eyebrow="Where it broke last time"
              tone="#B45309" bg="#FFFBEB" border="#FDE68A"
              body="Last Tuesday-shape day, dinner slipped to 8:30 and TIR dropped to 74%."
            />
            <ContextTile
              eyebrow="What's different today"
              tone="#4338CA" bg="#EEF2FF" border="#C7D2FE"
              body="You're traveling — swap the 6:45 walk for stairs at the airport concourse."
            />
            <ContextTile
              eyebrow="Ingredients you already have"
              tone="#065F46" bg="#ECFDF5" border="#A7F3D0"
              body="Chicken + greens are in the fridge. Sunrise is 6:52 — walk window opens with your coffee."
            />
          </div>
        )}

        {/* Three-choice CTA — the anti-shame primitive */}
        <div className="px-6 pb-6 pt-2">
          {state === "idle" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setState("trying")}
                className="px-4 py-3 rounded-xl text-white text-[13px] font-black tracking-wide shadow-md hover:brightness-110 transition"
                style={{ background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)" }}>
                Try this shape today →
              </button>
              <button
                onClick={() => setState("adjusting")}
                className="px-4 py-3 rounded-xl text-[13px] font-black tracking-wide border-2 border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 transition">
                Adjust one thing
              </button>
              <button
                onClick={() => setState("dismissed")}
                className="px-4 py-3 rounded-xl text-[13px] font-black tracking-wide border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition">
                Not today
              </button>
            </div>
          )}
          {state === "trying" && (
            <div className="rounded-xl p-4 border shadow-sm flex items-center gap-3"
                 style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}>
              <span className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
              </span>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">You're shaping today like Tuesday</div>
                <div className="text-[13px] font-black text-emerald-900">Nu will check the walk window at 6:30 PM and cheer you on.</div>
              </div>
              <button onClick={() => setState("idle")} className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">Undo</button>
            </div>
          )}
          {state === "adjusting" && (
            <div className="rounded-xl p-4 border shadow-sm"
                 style={{ background: "#EEF2FF", borderColor: "#C7D2FE" }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-2">Which element do you want to adjust?</div>
              <div className="flex flex-wrap gap-2">
                {["Skip morning walk", "Later lunch", "Swap dinner", "Later lights-out"].map(o => (
                  <button key={o}
                          onClick={() => setState("trying")}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-black text-indigo-800 bg-white border border-indigo-200 hover:bg-indigo-50">
                    {o}
                  </button>
                ))}
              </div>
              <button onClick={() => setState("idle")} className="mt-3 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">Cancel</button>
            </div>
          )}
          {state === "dismissed" && (
            <div className="rounded-xl p-4 border shadow-sm flex items-center gap-3"
                 style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
              <span className="text-xl">👋</span>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">Understood</div>
                <div className="text-[13px] font-black text-slate-800">Nu won't push. Your mirror stays here whenever you want it.</div>
              </div>
              <button onClick={() => setState("idle")} className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800">Show again</button>
            </div>
          )}
        </div>

        {/* Footer meta — reinforces the framing */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-medium">
          <span>Weekly, not daily.</span>
          <span className="text-slate-300">·</span>
          <span>Your voice, not Nu's.</span>
          <span className="text-slate-300">·</span>
          <span>Three choices always.</span>
          <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-indigo-600">
            Mirror mode
          </span>
        </div>
      </div>
    </div>
  );
}

function ResultTile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: tone }}>{label}</span>
      <span className="text-lg font-black tabular-nums" style={{ color: tone }}>{value}</span>
    </div>
  );
}

function ContextTile({ eyebrow, body, tone, bg, border }: {
  eyebrow: string; body: string; tone: string; bg: string; border: string;
}) {
  return (
    <div className="rounded-xl p-3 border shadow-sm" style={{ background: bg, borderColor: border }}>
      <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: tone }}>{eyebrow}</div>
      <div className="text-[12px] font-medium text-slate-700 leading-snug">{body}</div>
    </div>
  );
}

// ============================================================================
// BehavioralModeReframe — inserted at top of Best Path when journey mode = "behavioral"
// Reframes the whole step: no meal plans, no directive language, habit ladder + IF-THEN
// ============================================================================
function BehavioralModeReframe() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md" style={{ border: "2px solid #C7D2FE" }}>
      <div className="px-4 py-3" style={{ background: "linear-gradient(90deg,#4F5FE5,#7C3AED)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/85">Behavioral variant · Best Path reframed</span>
          <span className="ml-auto text-[9px] font-black text-white/70 uppercase tracking-widest">GLP-1 does the physiology</span>
        </div>
        <div className="text-[20px] font-black text-white leading-tight" style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
          Your Habits Today.
        </div>
        <div className="text-[12px] text-indigo-100 mt-0.5">
          No meal plan. No calorie target. Just the 4 tiny habits that make everything else easier.
        </div>
      </div>
      <div className="p-4 bg-white">
        {/* Habit ladder */}
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Your habit ladder · this week</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {[
            { habit: "Walk after dinner", anchor: "Right after you finish dinner", stage: "sticky", days: "day 11" },
            { habit: "Phone off by 9 PM", anchor: "Before you brush your teeth", stage: "trying", days: "day 4" },
            { habit: "Morning weigh-in", anchor: "After coffee, before breakfast", stage: "stable", days: "day 47" },
            { habit: "Two glasses of water before 9 AM", anchor: "Next to your kettle", stage: "trying", days: "day 2" },
          ].map((h, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                      style={{ background: h.stage === "stable" ? "#DCFCE7" : h.stage === "sticky" ? "#CCFBF1" : "#FEF3C7",
                               color:      h.stage === "stable" ? "#065F46" : h.stage === "sticky" ? "#0F766E" : "#92400E" }}>
                  {h.stage.toUpperCase()}
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h.days}</span>
              </div>
              <div className="text-[13px] font-black text-slate-900 leading-tight">{h.habit}</div>
              <div className="text-[10px] text-slate-600 mt-1">
                <span className="font-black text-indigo-700">If</span> {h.anchor.toLowerCase()}, <span className="font-black text-indigo-700">then</span> do it.
              </div>
            </div>
          ))}
        </div>

        {/* Autonomy-supportive Nu voice card */}
        <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
          <div className="w-8 h-8 rounded-full grid place-items-center shrink-0"
               style={{ background: "radial-gradient(circle at 35% 30%, #FDE68A, #F59E0B 50%, #B45309)" }}>
            <span className="text-[10px] font-black text-slate-900">Nu</span>
          </div>
          <div className="flex-1 text-[12px] text-slate-800 leading-relaxed">
            <span className="italic">
              "Members like you at week 13 usually try one small thing this week — a walk after dinner is where most start.
              What do you want to try? I'll help you shape it into an IF-THEN so it sticks."
            </span>
            <div className="mt-1.5 text-[10px] font-black text-indigo-700 uppercase tracking-widest">
              No prescription · you choose · Nu supports
            </div>
          </div>
        </div>

        {/* Bottom explainer */}
        <div className="mt-3 text-[10px] text-slate-500 italic leading-snug">
          The full bundle below (paths, meals, medication coaching) is HIDDEN in Behavioral mode. Toggle back to
          Standard at the top of the page to see the classic Best Path experience.
        </div>
      </div>
    </div>
  );
}
