import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

import { NowLens, PatternsLens, BestDayLens, WhatChangedLens, AheadLens } from "../components/cgm/InsightLenses";
import HabitnuLogo from "../components/journey/HabitnuLogo";

import { ChatProvider } from "../contexts/ChatContext";
import { UpdateMeProvider } from "../contexts/UpdateMeContext";
import { JourneyConfigProvider } from "../contexts/JourneyConfigContext";
import ChatDrawer from "../components/journey/ChatDrawer";
import NuChatFAB from "../components/journey/NuChatFAB";

type TabKey = "now" | "patterns" | "best" | "changed" | "ahead";

interface TabDef {
  key: TabKey;
  label: string;
  sub: string;
  emoji: string;
}

const TABS: TabDef[] = [
  { key: "now",       label: "Now",             sub: "Live state + 3h forecast",   emoji: "⏱" },
  { key: "patterns",  label: "Patterns",        sub: "Dawn, meals, walks, sleep",  emoji: "🧬" },
  { key: "best",      label: "Best Day",        sub: "Your Jul 1 reference",       emoji: "⭐" },
  { key: "changed",   label: "What Changed",    sub: "This week vs. last week",    emoji: "📊" },
  { key: "ahead",     label: "Ahead",           sub: "Next-7-day scenarios",       emoji: "🔮" },
];

/**
 * /cgm-explorer — CGM Insights explorer with 5 switchable lenses.
 * Sally (or Maya) can move between: Now, Patterns, Best Day, What Changed, Ahead.
 */
export default function CGMExplorerPage() {
  return (
    <JourneyConfigProvider>
      <UpdateMeProvider>
        <ChatProvider>
          <CGMExplorerInner />
          <ChatDrawer />
          <NuChatFAB />
        </ChatProvider>
      </UpdateMeProvider>
    </JourneyConfigProvider>
  );
}

function CGMExplorerInner() {
  const [tab, setTab] = useState<TabKey>("now");
  const [detailMode, setDetailMode] = useState(false);

  return (
    <>
      <Head>
        <title>CGM Insights Explorer — Habitnu Journey Twin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />
      </Head>

      <div className="min-h-screen"
           style={{
             fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
             background: "linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 40%, #EEF2FF 100%)",
           }}>
        {/* Top bar */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b border-white/60 backdrop-blur bg-white/40 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <HabitnuLogo />
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
              CGM Insights Explorer
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/journey" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">
              Sally's day →
            </Link>
            <Link href="/twin" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">
              Journey Twin →
            </Link>
            <Link href="/coach" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">
              Maya's day →
            </Link>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Hero */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-600 mb-2">CGM Insights Explorer</div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">
                Sally's numbers, in plain English.
              </h1>
              <p className="text-[14.5px] text-slate-600 leading-relaxed max-w-3xl">
                Every insight leads with the number, not the chart. Tap <span className="font-black text-indigo-600">See the chart</span> on any card if you want the evidence — or flip Detail mode to show every chart at once.
              </p>
            </div>
            {/* Simple / Detail mode toggle */}
            <div className="inline-flex rounded-xl bg-white border border-slate-200 shadow-sm p-1 shrink-0">
              <button
                onClick={() => setDetailMode(false)}
                className={"px-4 py-2 rounded-lg text-[12px] font-black transition " +
                  (!detailMode ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900")}
              >
                Simple
              </button>
              <button
                onClick={() => setDetailMode(true)}
                className={"px-4 py-2 rounded-lg text-[12px] font-black transition " +
                  (detailMode ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900")}
              >
                Detail
              </button>
            </div>
          </div>

          {/* Tab strip */}
          <div className="flex items-stretch gap-2 overflow-x-auto mb-6 -mx-1 px-1 pb-1">
            {TABS.map(t => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={"flex-1 min-w-[150px] text-left px-4 py-3 rounded-xl border transition " +
                    (active
                      ? "bg-white shadow-md border-indigo-200"
                      : "bg-white/50 border-transparent hover:bg-white hover:border-indigo-100")}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{t.emoji}</span>
                    <span className={"text-[13px] font-black " + (active ? "text-indigo-700" : "text-slate-700")}>
                      {t.label}
                    </span>
                  </div>
                  <div className={"text-[10.5px] font-medium mt-1 leading-tight " + (active ? "text-indigo-600" : "text-slate-500")}>
                    {t.sub}
                  </div>
                  {active && (
                    <div className="mt-1.5 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #7C6BFF, #5B4CE0)" }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active lens */}
          <div className="animate-fadein">
            {tab === "now"      && <NowLens      detailMode={detailMode} />}
            {tab === "patterns" && <PatternsLens detailMode={detailMode} />}
            {tab === "best"     && <BestDayLens  detailMode={detailMode} />}
            {tab === "changed"  && <WhatChangedLens detailMode={detailMode} />}
            {tab === "ahead"    && <AheadLens    detailMode={detailMode} />}
          </div>

          {/* Nu footer note */}
          <div className="mt-10 rounded-2xl border border-indigo-100 p-5 flex items-start gap-3"
               style={{ background: "linear-gradient(90deg, #EEF2FF 0%, #F5F1FF 100%)" }}>
            <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow"
                  style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
              <span className="text-[11px] font-black text-white">Nu</span>
            </span>
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">Numbers first, evidence on tap</div>
              <div className="text-[13px] text-slate-700 font-medium leading-relaxed">
                Most people don't read charts easily — they read numbers and sentences. Nu leads with the answer, in words you can act on. The chart is always one tap away for anyone who wants to see the evidence, or your coach if she wants the detail during a session.
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
