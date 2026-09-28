import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

import NuMirror, { MirrorPoint, POSITIVE, IMPROVEMENT } from "../components/twin/NuMirror";
import TouchpointIcon from "../components/twin/TouchpointIcon";
import HabitnuLogo from "../components/journey/HabitnuLogo";

import { ChatProvider } from "../contexts/ChatContext";
import { UpdateMeProvider } from "../contexts/UpdateMeContext";
import { JourneyConfigProvider } from "../contexts/JourneyConfigContext";
import ChatDrawer from "../components/journey/ChatDrawer";
import NuChatFAB from "../components/journey/NuChatFAB";

/**
 * /mirror — Nu's Mirror.
 * An eye-shaped ring that shows what Nu sees about Sally: strengths above,
 * areas to work on below. Never shaming — always balanced.
 */
export default function MirrorPage() {
  return (
    <JourneyConfigProvider>
      <UpdateMeProvider>
        <ChatProvider>
          <MirrorInner />
          <ChatDrawer />
          <NuChatFAB />
        </ChatProvider>
      </UpdateMeProvider>
    </JourneyConfigProvider>
  );
}

function MirrorInner() {
  const [selected, setSelected] = useState<MirrorPoint | null>(null);

  return (
    <>
      <Head>
        <title>Nu's Mirror — Habitnu Journey Twin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap" />
      </Head>

      <div className="min-h-screen"
           style={{
             fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
             background: "linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 45%, #EEF2FF 100%)",
           }}>
        {/* Top bar */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b border-white/60 backdrop-blur bg-white/40 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <HabitnuLogo />
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
              Nu's Mirror
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/journey" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">
              Sally's day →
            </Link>
            <Link href="/twin" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">
              Twin Ring →
            </Link>
            <Link href="/cgm-explorer" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">
              CGM Insights →
            </Link>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-600 mb-3">
              Nu's Mirror
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4"
                style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
              This is what I see when I look at you.
            </h1>
            <p className="text-[15px] md:text-[16px] text-slate-600 leading-relaxed">
              Above the line — {POSITIVE.length} things worth celebrating this fortnight. Below — {IMPROVEMENT.length} things worth watching. Never shaming, never sugar-coating. Tap any point for the story.
            </p>
          </div>

          {/* Mirror */}
          <div className="flex justify-center">
            <NuMirror size={860} onSelect={setSelected} />
          </div>

          {/* Balance strip */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 12 10 18 20 6" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">What Nu celebrates</div>
                  <div className="text-[13px] font-black text-slate-800">{POSITIVE.length} strengths this fortnight</div>
                </div>
              </div>
              <ul className="space-y-1.5">
                {POSITIVE.map(p => (
                  <li key={p.id} className="flex items-start gap-2 text-[12.5px] text-slate-700 leading-snug">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="flex-1"><span className="font-black text-slate-900">{p.label}</span> — {p.headline}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">What Nu is watching</div>
                  <div className="text-[13px] font-black text-slate-800">{IMPROVEMENT.length} things worth attention</div>
                </div>
              </div>
              <ul className="space-y-1.5">
                {IMPROVEMENT.map(p => (
                  <li key={p.id} className="flex items-start gap-2 text-[12.5px] text-slate-700 leading-snug">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="flex-1"><span className="font-black text-slate-900">{p.label}</span> — {p.headline}</span>
                  </li>
                ))}
              </ul>
            </div>
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
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">Why the mirror is shaped like an eye</div>
                <div className="text-[13.5px] text-slate-800 font-medium leading-relaxed">
                  Because I am always looking at you — honestly, and in balance. Above the line, I remember what's working. Below, I see what could be gentler on you. Both matter. Neither judges. The goal isn't perfection — it's that the top half stays bigger than the bottom, most days.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drill-down sheet */}
      {selected && <PointSheet point={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function PointSheet({ point, onClose }: { point: MirrorPoint; onClose: () => void }) {
  const isPositive = point.side === "positive";
  const accent = isPositive ? "#059669" : "#B45309";
  const bg     = isPositive ? "#ECFDF5" : "#FEF3C7";
  const border = isPositive ? "#A7F3D0" : "#FDE68A";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="p-5 border-b flex items-start gap-3" style={{ borderColor: border, background: bg }}>
          <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm border" style={{ borderColor: border }}>
            <TouchpointIcon kind={point.icon} color={accent} size={22} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: accent }}>
              {isPositive ? "Nu celebrates" : "Nu is watching"}{point.metric ? ` · ${point.metric}` : ""}
            </div>
            <div className="text-lg font-black text-slate-900 leading-tight">{point.label}</div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700 font-black leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-1">Headline</div>
            <div className="text-[14px] text-slate-800 font-bold leading-relaxed">{point.headline}</div>
          </div>
          <div className="rounded-xl p-3.5" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] mb-1" style={{ color: accent }}>
              What Nu suggests
            </div>
            <div className="text-[13.5px] text-slate-800 font-medium leading-relaxed">{point.detail}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
