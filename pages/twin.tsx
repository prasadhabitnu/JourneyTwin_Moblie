import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { TWIN_LAYERS, SALLY_TWIN, TOUCHPOINTS, Touchpoint, JourneyMarker } from "../lib/twinData";
import JourneyTwinRing from "../components/twin/JourneyTwinRing";
import TouchpointIcon from "../components/twin/TouchpointIcon";

import { ChatProvider } from "../contexts/ChatContext";
import { UpdateMeProvider } from "../contexts/UpdateMeContext";
import { JourneyConfigProvider } from "../contexts/JourneyConfigContext";
import ChatDrawer from "../components/journey/ChatDrawer";
import NuChatFAB from "../components/journey/NuChatFAB";

/**
 * /twin — "Meet Your Journey Twin" landing.
 * Standalone page. Center: the living ring. Around it: framing, layer legend,
 * touchpoint drill-down sheet. Nu chat is available via the mascot FAB.
 */
export default function TwinPage() {
  return (
    <JourneyConfigProvider>
      <UpdateMeProvider>
        <ChatProvider>
          <TwinPageInner />
          <ChatDrawer />
          <NuChatFAB />
        </ChatProvider>
      </UpdateMeProvider>
    </JourneyConfigProvider>
  );
}

function TwinPageInner() {
  const [selectedTp, setSelectedTp] = useState<Touchpoint | null>(null);
  const [selectedMk, setSelectedMk] = useState<JourneyMarker | null>(null);

  return (
    <>
      <Head>
        <title>Meet Your Journey Twin — Habitnu</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />
      </Head>

      <div className="min-h-screen"
           style={{
             fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
             background: "linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 40%, #EEF2FF 100%)",
           }}>
        {/* --- Slim top bar --- */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b border-white/60 backdrop-blur bg-white/40 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center shadow"
                  style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" />
              </svg>
            </span>
            <div className="text-[13px] font-black text-slate-800">Journey Twin</div>
            <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
              Patent-pending
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/journey" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">
              Sally's day →
            </Link>
            <Link href="/coach" className="px-3 py-1.5 rounded-lg text-[12px] font-black text-slate-600 hover:text-slate-900 hover:bg-white/60 transition">
              Maya's day →
            </Link>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* --- Hero framing --- */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-600 mb-3">
              Meet your Journey Twin
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
              Six small rings. One picture of you, {SALLY_TWIN.name.split(" ")[0]}.
            </h1>
            <p className="text-[15px] md:text-[17px] text-slate-600 leading-relaxed">
              Each ring watches a part of your day — glucose, vitals, movement, meals, life, and mood. The dotted lines between them are the connections I've learned: sleep changes fasting, meds change glucose, work changes stress. Tap any dot to see what I know.
            </p>
          </div>

          {/* --- Ring + summary strip --- */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <JourneyTwinRing
                size={640}
                onSelectTouchpoint={setSelectedTp}
                onSelectMarker={setSelectedMk}
              />
            </div>

            {/* Twin stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl mt-4">
              <StatChip label="Rings" value={6} sub="areas I watch" />
              <StatChip label="Data streams" value={SALLY_TWIN.totalTouchpoints} sub="touchpoints" />
              <StatChip label="Connections" value={6} sub="between rings" />
              <StatChip label="Days you've had me" value={SALLY_TWIN.daysWithTwin} sub="and counting" />
            </div>
          </div>

          {/* --- Layer legend --- */}
          <div className="mt-10 rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-4">The five twin layers</div>
            <div className="grid md:grid-cols-5 gap-3">
              {TWIN_LAYERS.map(l => {
                const count = TOUCHPOINTS.filter(t => t.layer === l.id).length;
                return (
                  <div key={l.id} className="rounded-xl p-3 border" style={{ background: l.tint, borderColor: l.arcColor }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: l.color }} />
                      <span className="text-[11px] font-black" style={{ color: l.color }}>{l.label}</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-700 leading-snug">{l.short}</div>
                    <div className="text-[10px] text-slate-500 font-black mt-1.5 tabular-nums">{count} touchpoints</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- Footer explainer / CTA --- */}
          <div className="mt-8 rounded-2xl p-6 border border-indigo-100"
               style={{ background: "linear-gradient(90deg, #EEF2FF 0%, #F5F1FF 100%)" }}>
            <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-1">
                  Nu explains the ring
                </div>
                <p className="text-[14px] text-slate-800 font-medium leading-relaxed">
                  <span className="font-black">The bigger the ring, the more I know.</span>{" "}
                  Every touchpoint is a stream I watch continuously. When one lights up, I saw something new.
                  When two connect, I noticed they move together. You never have to tell me twice.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href="/journey"
                      className="px-4 py-2 rounded-xl text-white text-[13px] font-black shadow hover:brightness-110 transition"
                      style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
                  Start your day →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* --- Touchpoint drill-down sheet --- */}
        {selectedTp && (
          <TouchpointSheet touchpoint={selectedTp} onClose={() => setSelectedTp(null)} />
        )}
        {/* --- Marker drill-down (lightweight) --- */}
        {selectedMk && (
          <MarkerSheet marker={selectedMk} onClose={() => setSelectedMk(null)} />
        )}
      </div>
    </>
  );
}

function StatChip({ label, value, sub }: { label: string; value: number | string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/85 backdrop-blur border border-white shadow-sm px-4 py-3 text-center">
      <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-2xl font-black tabular-nums text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-500 font-medium">{sub}</div>
    </div>
  );
}

// ============================================================================
// Touchpoint drill-down sheet
// ============================================================================
function TouchpointSheet({ touchpoint: t, onClose }: { touchpoint: Touchpoint; onClose: () => void }) {
  const layer = TWIN_LAYERS.find(l => l.id === t.layer)!;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="p-5 border-b flex items-start gap-3" style={{ borderColor: layer.arcColor, background: layer.tint }}>
          <span className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm border" style={{ borderColor: layer.arcColor }}>
            <TouchpointIcon kind={t.icon} color={layer.color} size={22} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: layer.color }}>
              {layer.label} · {t.cadence}
            </div>
            <div className="text-lg font-black text-slate-900 leading-tight">{t.label}</div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700 font-black leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-1">What I observe</div>
            <div className="text-[13.5px] text-slate-700 font-medium leading-relaxed">{t.observation}</div>
          </div>
          <div className="rounded-xl p-3.5" style={{ background: layer.tint, border: `1px solid ${layer.arcColor}` }}>
            <div className="text-[10px] font-black uppercase tracking-[0.14em] mb-1" style={{ color: layer.color }}>What I've learned about you</div>
            <div className="text-[13.5px] text-slate-800 font-bold leading-relaxed">{t.learned}</div>
          </div>
          {t.contributesTo.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-2">Connects to</div>
              <div className="flex flex-wrap gap-1.5">
                {t.contributesTo.map(id => {
                  const other = TOUCHPOINTS.find(o => o.id === id);
                  if (!other) return null;
                  const ol = TWIN_LAYERS.find(l => l.id === other.layer)!;
                  return (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-black" style={{ background: ol.tint, color: ol.color, border: `1px solid ${ol.arcColor}` }}>
                      <TouchpointIcon kind={other.icon} color={ol.color} size={11} />
                      {other.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Marker drill-down (small)
// ============================================================================
function MarkerSheet({ marker: m, onClose }: { marker: JourneyMarker; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="p-5 flex items-center gap-4">
          <span className="text-4xl">{m.emoji}</span>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Journey moment</div>
            <div className="text-lg font-black text-slate-900 leading-tight">{m.label}</div>
            <div className="text-[11px] text-slate-500 font-medium">Typically around {formatHour(m.hour)}</div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700 font-black leading-none">×</button>
        </div>
        <div className="px-5 pb-5">
          <Link href="/journey"
                className="w-full inline-flex justify-center px-4 py-2.5 rounded-xl text-white text-[13px] font-black shadow hover:brightness-110 transition"
                style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
            Open in Sally's day →
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatHour(h: number) {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  const period = hr >= 12 ? "PM" : "AM";
  const h12 = ((hr + 11) % 12) + 1;
  return `${h12}:${min.toString().padStart(2, "0")} ${period}`;
}
