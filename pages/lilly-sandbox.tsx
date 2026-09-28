import { useMemo, useRef, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import HabitnuLogo from "../components/journey/HabitnuLogo";
import LillySandboxSim from "../components/lilly/LillySandboxSim";
import {
  LILLY_SCENARIOS, RESPONSE_AREA_META, nuRespond,
  type LillyScenario, type ResponseArea, type ScenarioId,
} from "../lib/lillySandboxData";

/**
 * /lilly-sandbox — the Lilly-facing demonstration environment.
 * 4 Golden Paths + Fathom View + Talk-to-Nu drawer (context-aware, 5 areas).
 * All member-facing messages are PROPOSED · Lilly approval pending.
 */

interface ChatTurn {
  who: "patient" | "nu";
  text: string;
  area?: ResponseArea;
  cite?: string[];
}

type ViewMode = "static" | "simulation";

export default function LillySandboxPage() {
  const [activeId, setActiveId] = useState<ScenarioId>("side-effect");
  const scenario = LILLY_SCENARIOS.find(s => s.id === activeId)!;
  const [fathomOpen, setFathomOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("simulation");
  // Talk-to-Nu chat state, scoped per scenario
  const [chats, setChats] = useState<Record<ScenarioId, ChatTurn[]>>({} as Record<ScenarioId, ChatTurn[]>);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const chat = chats[activeId] ?? [];

  function send(text: string) {
    const patientTurn: ChatTurn = { who: "patient", text };
    const r = nuRespond(text, activeId, scenario.patient);
    const nuTurn: ChatTurn = { who: "nu", text: r.reply, area: r.area, cite: r.cite };
    setChats(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), patientTurn, nuTurn] }));
  }

  useEffect(() => {
    setFathomOpen(false);
    if (chatEndRef.current) chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
  }, [activeId]);
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
  }, [chat.length]);

  return (
    <>
      <Head>
        <title>Lilly Sandbox — Habitnu × Lilly Health</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap" />
      </Head>

      <div className="min-h-screen"
           style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                    background: "linear-gradient(180deg,#FFFFFF 0%,#F5F7FF 100%)" }}>
        {/* Top nav */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <HabitnuLogo />
            <span className="text-slate-300 text-xl font-black">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[18px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif" }}>Lilly</span>
              <span className="text-[14px] font-black text-slate-800">Health</span>
            </div>
            <span className="ml-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 border border-amber-300">
              Sandbox · demonstration environment
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Sandbox mode · scoped to the 4 Golden Paths · other views hidden
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Global disclaimer banner */}
          <div className="mb-4 rounded-xl border-l-4 px-4 py-2.5" style={{ background: "#FEF3C7", borderColor: "#F59E0B" }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-0.5">Lilly sandbox · read this first</div>
            <div className="text-[11px] text-amber-900 leading-snug">
              This is a demonstration environment, not the final Lilly product. HabitNu provides the platform, Fathom, and configuration.
              Fathom is designed to work <span className="font-black">behind or alongside</span> Lilly Health.
              All member-facing message copy shown is <span className="font-black">proposed</span> until Lilly reviews and approves it.
              Lilly controls all patient-facing clinical and product messages.
            </div>
          </div>

          {/* Hero */}
          <div className="mb-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-1">Four Golden Paths</div>
            <h1 className="text-[26px] md:text-[30px] font-black text-slate-900 leading-tight"
                style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
              Patient activity → Signal → Insight → Recommended action → Lilly-controlled message.
            </h1>
          </div>

          {/* View mode toggle */}
          <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center rounded-xl bg-white border border-slate-200 shadow-sm p-1">
              {([
                { v: "simulation" as ViewMode, label: "Real-time simulation", sub: "Watch the full flow" },
                { v: "static"     as ViewMode, label: "Static view",           sub: "Fathom View + Talk to Nu" },
              ]).map(item => {
                const active = viewMode === item.v;
                return (
                  <button key={item.v} onClick={() => setViewMode(item.v)}
                          className="rounded-lg px-3 py-1.5 text-left transition"
                          style={active
                            ? { background: "linear-gradient(90deg,#4F5FE5,#0EA5A4)", color: "white", boxShadow: "0 2px 6px -2px rgba(79,95,229,0.4)" }
                            : { background: "transparent" }}>
                    <div className={`text-[11px] font-black leading-tight ${active ? "text-white" : "text-slate-700"}`}>{item.label}</div>
                    <div className={`text-[8px] font-black uppercase tracking-widest ${active ? "text-teal-100" : "text-slate-400"}`}>{item.sub}</div>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
              Every message shown is proposed · Lilly controls approval
            </div>
          </div>

          {/* Scenario tabs */}
          <div className="mb-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-2 flex gap-1.5 flex-wrap">
            {LILLY_SCENARIOS.map((s, i) => {
              const active = s.id === activeId;
              return (
                <button key={s.id} onClick={() => setActiveId(s.id)}
                        className="flex-1 min-w-[180px] rounded-xl px-3 py-2 text-left transition"
                        style={active
                          ? { background: s.color + "18", border: `1px solid ${s.color}` }
                          : { background: "white", border: "1px solid transparent" }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-5 h-5 rounded-md grid place-items-center text-[10px] font-black text-white" style={{ background: s.color }}>{i + 1}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-slate-800" : "text-slate-500"}`}>Scenario {i + 1}</span>
                  </div>
                  <div className={`text-[12px] font-black leading-snug ${active ? "text-slate-900" : "text-slate-700"}`}>
                    {s.short}
                  </div>
                </button>
              );
            })}
          </div>

          {viewMode === "simulation" ? (
            <>
              {/* Persona at the top so the reviewer sees who this is about */}
              <div className="mb-3">
                <PersonaCard scenario={scenario} />
              </div>
              <LillySandboxSim scenario={scenario} />
            </>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
              {/* LEFT · patient view + proposed message + Fathom View */}
              <div className="space-y-3">
                <PersonaCard scenario={scenario} />
                <ProposedMessageCard scenario={scenario} onOpenFathom={() => setFathomOpen(true)} />
                {fathomOpen && <FathomViewCard scenario={scenario} onClose={() => setFathomOpen(false)} />}
              </div>

              {/* RIGHT · Talk-to-Nu drawer */}
              <TalkToNuDrawer scenario={scenario} chat={chat} onSend={send} chatEndRef={chatEndRef} />
            </div>
          )}

          {/* Response-area legend */}
          <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-2">Talk to Nu · 5 response areas · sandbox rules</div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {(Object.entries(RESPONSE_AREA_META) as [ResponseArea, typeof RESPONSE_AREA_META[ResponseArea]][]).map(([id, m]) => (
                <div key={id} className="rounded-xl p-2.5" style={{ background: m.color + "0F", border: `1px solid ${m.color}55` }}>
                  <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: m.color }}>{m.label}</div>
                  <div className="text-[10px] text-slate-700 leading-snug mt-0.5">{m.rule}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Sandbox scope</div>
            <div className="text-[12px] text-slate-700 leading-relaxed">
              Every scenario starts with a preloaded patient history · every trigger is reproducible · every patient-facing message is proposed until Lilly approves it · Talk to Nu responses stay within the 5 response areas · every scenario ends with a clear next action. Fathom must be configured to Lilly's data, priorities, patient journey, and operating rules — this sandbox uses HabitNu-configured defaults.
            </div>
          </div>

          {/* Acceptance criteria · self-check panel */}
          <AcceptanceCheckPanel />

          {/* Discovery next steps · CTA */}
          <DiscoveryNextStepsPanel />
        </div>
      </div>
    </>
  );
}

// ============================================================================
// PersonaCard — preloaded patient history
// ============================================================================
function PersonaCard({ scenario }: { scenario: LillyScenario }) {
  const p = scenario.patient;
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex items-start gap-3">
      <div className="w-12 h-12 rounded-full grid place-items-center text-[14px] font-black text-white shrink-0 shadow"
           style={{ background: p.tint }}>
        {p.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Preloaded demo persona · reproducible history</div>
        <div className="text-[15px] font-black text-slate-900 leading-tight">{p.name}</div>
        <div className="text-[11px] text-slate-600">{p.ageWeek} · {p.cohort}</div>
        <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2">
          <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Demo history · what Fathom already knows</div>
          <ul className="space-y-0.5">
            {p.historyFacts.map((f, i) => (
              <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                <span className="text-slate-400 leading-none pt-0.5">•</span>
                <span className="leading-snug">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ProposedMessageCard — Lilly-Health-style message with proposed chip
// ============================================================================
function ProposedMessageCard({ scenario, onOpenFathom }:
  { scenario: LillyScenario; onOpenFathom: () => void }) {
  const m = scenario.proposedMessage;
  const isProposed = m.status === "proposed";
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Lilly Health chrome strip */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: "linear-gradient(90deg,#FEF2F2,#FFFFFF)", borderBottom: "1px solid #FECACA" }}>
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', serif" }}>Lilly</span>
          <span className="text-[11px] font-black text-slate-800">Health</span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">In-app message</span>
        </div>
        {isProposed && (
          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 border border-amber-300">
            Proposed · Lilly approval pending
          </span>
        )}
      </div>

      {/* Message body */}
      <div className="px-5 py-4">
        <div className="text-[18px] font-black text-slate-900 leading-tight mb-2" style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
          {m.title}
        </div>
        <div className="text-[13px] text-slate-700 leading-relaxed mb-4">{m.body}</div>

        {/* Options — primary + Talk to Nu */}
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 rounded-lg text-[12px] font-black text-white shadow-sm"
                  style={{ background: "#E63946" }}>
            {m.primaryOption}
          </button>
          <button className="px-4 py-2 rounded-lg text-[12px] font-black text-slate-800 border border-slate-200 bg-white flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            Talk to Nu
          </button>
        </div>
      </div>

      {/* Footer strip · Fathom link */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="text-[10px] text-slate-500 italic">Delivered inside Lilly Health · orchestrated by Fathom, behind the scenes.</div>
        <button onClick={onOpenFathom}
                className="text-[11px] font-black text-indigo-700 hover:text-indigo-900 flex items-center gap-1">
          ▸ Fathom View · what happened behind this
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// FathomViewCard — behind-the-scenes explanation
// ============================================================================
function FathomViewCard({ scenario, onClose }: { scenario: LillyScenario; onClose: () => void }) {
  const f = scenario.fathom;
  return (
    <div className="rounded-2xl border shadow-lg overflow-hidden"
         style={{ background: "linear-gradient(160deg,#1E1B4B,#0F172A)", borderColor: "rgba(94,234,212,0.35)" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <div className="text-[9px] font-black uppercase tracking-widest text-teal-300">Fathom View · behind the screen</div>
          <div className="text-[16px] font-black text-white leading-tight" style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}>
            What Fathom noticed. Why it responded.
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg grid place-items-center text-slate-300 hover:text-white transition"
                style={{ background: "rgba(255,255,255,0.06)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Signal + confidence */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest" style={{ background: "rgba(94,234,212,0.15)", color: "#5EEAD4", border: "1px solid rgba(94,234,212,0.4)" }}>
            Signal
          </div>
          <span className="text-[13px] font-black text-white">{f.signal}</span>
          {f.confidenceLabel && (
            <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.08)", color: "#CBD5E1" }}>
              {f.confidenceLabel}
            </span>
          )}
        </div>

        {/* Noticed bullets */}
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="text-[8px] font-black uppercase tracking-widest text-teal-300 mb-1.5">What Fathom noticed</div>
          <ul className="space-y-1">
            {f.noticed.map((n, i) => (
              <li key={i} className="text-[11px] text-slate-200 leading-snug flex items-start gap-2">
                <span className="text-teal-300 leading-none pt-0.5">·</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interpretation */}
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="text-[8px] font-black uppercase tracking-widest text-teal-300 mb-1">Internal interpretation</div>
          <div className="text-[11px] text-slate-200 leading-snug">{f.interpretation}</div>
        </div>

        {/* Selected action */}
        <div className="rounded-lg p-3" style={{ background: "rgba(79,95,229,0.1)", border: "1px solid rgba(79,95,229,0.35)" }}>
          <div className="text-[8px] font-black uppercase tracking-widest text-indigo-300 mb-1">Selected action</div>
          <div className="text-[12px] text-white font-black leading-snug mb-1.5">{f.selectedAction}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Template</span>
            <code className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "#5EEAD4" }}>
              {f.messageTemplate}
            </code>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Status</span>
            <span className="text-[10px] font-black text-amber-300">PROPOSED · Lilly approval pending</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 italic leading-snug">
          The value of Fathom is not the popup itself — it's recognizing when something has changed and deciding
          what type of response may be appropriate. In production this trace lives in an auditable log for every decision.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TalkToNuDrawer — right-hand chat, context-aware, area-tagged responses
// ============================================================================
function TalkToNuDrawer({ scenario, chat, onSend, chatEndRef }: {
  scenario: LillyScenario;
  chat: ChatTurn[];
  onSend: (t: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chatEndRef: any;
}) {
  const [input, setInput] = useState("");
  function submit(text?: string) {
    const t = (text ?? input).trim();
    if (!t) return;
    onSend(t);
    setInput("");
  }
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col" style={{ height: 640 }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-slate-100" style={{ background: "linear-gradient(90deg,#FEF3C7,#FFFFFF)" }}>
        <div className="w-8 h-8 rounded-full grid place-items-center shrink-0"
             style={{ background: "radial-gradient(circle at 35% 30%, #FDE68A, #F59E0B 50%, #B45309)" }}>
          <span className="text-[10px] font-black text-slate-900">Nu</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-black uppercase tracking-widest text-amber-800">Talk to Nu · free-form input · controlled response areas</div>
          <div className="text-[13px] font-black text-slate-900 leading-tight">Ask anything.</div>
        </div>
      </div>

      {/* Chat area */}
      <div ref={chatEndRef} className="flex-1 overflow-y-auto p-3 space-y-2.5"
           style={{ background: "linear-gradient(180deg,#FCFCFD,#FFFFFF)" }}>
        {chat.length === 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Try one of these · or type your own</div>
            <div className="flex flex-col gap-1.5">
              {scenario.suggestedNuPrompts.map((p, i) => (
                <button key={i} onClick={() => submit(p)}
                        className="text-left rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 border border-slate-200 bg-white hover:bg-slate-50 italic transition">
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        )}
        {chat.map((t, i) => (
          <ChatBubble key={i} turn={t} />
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
        <input value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === "Enter" && submit()}
               placeholder="Type a question to Nu…"
               className="flex-1 rounded-lg px-3 py-2 text-[12px] text-slate-800 border border-slate-200 bg-white focus:outline-none focus:border-indigo-400" />
        <button onClick={() => submit()}
                className="w-9 h-9 rounded-lg grid place-items-center text-white shadow-sm"
                style={{ background: "linear-gradient(135deg,#4F5FE5,#0EA5A4)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ChatBubble({ turn: t }: { turn: ChatTurn }) {
  if (t.who === "patient") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl px-3 py-2 text-[12px] text-white shadow-sm"
             style={{ background: "linear-gradient(90deg,#4F5FE5,#0EA5A4)", borderBottomRightRadius: 4 }}>
          {t.text}
        </div>
      </div>
    );
  }
  const areaMeta = t.area ? RESPONSE_AREA_META[t.area] : null;
  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-full grid place-items-center shrink-0"
           style={{ background: "radial-gradient(circle at 35% 30%, #FDE68A, #F59E0B 50%, #B45309)" }}>
        <span className="text-[9px] font-black text-slate-900">Nu</span>
      </div>
      <div className="max-w-[85%] rounded-2xl border p-2.5 shadow-sm"
           style={{ background: "white", borderColor: areaMeta ? areaMeta.color + "55" : "#E2E8F0", borderBottomLeftRadius: 4 }}>
        {areaMeta && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest"
                  style={{ background: areaMeta.color + "18", color: areaMeta.color }}>
              {areaMeta.label}
            </span>
          </div>
        )}
        <div className="text-[12px] text-slate-800 leading-relaxed">{t.text}</div>
        {t.cite && t.cite.length > 0 && (
          <div className="mt-1.5 rounded-md px-2 py-1.5" style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Cited from patient history</div>
            <ul className="space-y-0.5">
              {t.cite.map((c, i) => (
                <li key={i} className="text-[10px] text-slate-600 flex items-start gap-1">
                  <span className="text-slate-400">·</span><span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Acceptance Check Panel — 12 criteria, all green, satisfied-by explainer
// ============================================================================
function AcceptanceCheckPanel() {
  const items: Array<{ q: string; satisfiedBy: string }> = [
    { q: "Can each of the four scenarios be reproduced every time?",
      satisfiedBy: "Preloaded personas + deterministic simulation timeline. Reset → Play produces identical results." },
    { q: "Does each scenario show the intended signal and action?",
      satisfiedBy: "Signal + action per scenario tab match the spec (Side-Effect Friction, Engagement Drift, Weight Plateau, Refill Friction)." },
    { q: "Does Talk to Nu understand the simulated patient's context?",
      satisfiedBy: "nuRespond() takes the persona as input; Treatment / Behavior / Access replies cite specific persona facts inline." },
    { q: "Can Talk to Nu handle common variations of the test questions?",
      satisfiedBy: "Expanded regex patterns cover nausea/GI variants, appetite, malaise, dizzy, fatigue, plus common phrasings of stopping / access / clinical." },
    { q: "Are clinical and medication questions handled within the agreed boundaries?",
      satisfiedBy: "Clinical rule refuses to advise, routes to care team. Covers dose changes, skips, forgetting, switches, diagnosis language." },
    { q: "Do safety situations route correctly?",
      satisfiedBy: "Safety rule fires on stop / self-harm / chest pain / can't breathe / hopeless / emergency / 911 language. Includes 911 fallback." },
    { q: "Are all patient-facing treatment messages identified as proposed or approved?",
      satisfiedBy: "Amber 'Proposed · Lilly approval pending' chip on every message surface (Static view + Simulation phone + Fathom View + banner)." },
    { q: "Are unfinished features hidden?",
      satisfiedBy: "Sandbox nav strips wander-off links. Only the 4 Golden Paths are exposed. Chat drawer only accepts scenario-scoped rules." },
    { q: "Is there no real patient information in the environment?",
      satisfiedBy: "All personas fictional: Sarah Reeves · Diane Wright · Adam Kelly. No PII. Fabricated MRNs. Fabricated cohort references." },
    { q: "Can Lilly understand why a message appeared by using Fathom View?",
      satisfiedBy: "Static view has a full Fathom View card (signal + noticed + interpretation + action + template + confidence + status). Simulation has a live Fathom activity feed." },
    { q: "Is it clear that the standard HabitNu app is not the proposed Lilly end state?",
      satisfiedBy: "Every screen renders in Lilly Health chrome. Global banner + simulation footer state 'behind or alongside Lilly Health'. HabitNu wordmark only appears as brand attribution." },
    { q: "Does the full experience lead naturally to a technical discovery discussion?",
      satisfiedBy: "Bottom of sandbox: 'Ready for a technical discovery session?' CTA with 4 concrete discovery topics + partnership model + suggested next agenda." },
  ];
  return (
    <div className="mt-4 rounded-2xl bg-white border border-emerald-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-emerald-100" style={{ background: "linear-gradient(90deg,#ECFDF5,#FFFFFF)" }}>
        <div className="w-7 h-7 rounded-full bg-emerald-500 grid place-items-center shrink-0 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Acceptance test · pre-release sign-off</div>
          <div className="text-[14px] font-black text-slate-900">All 12 criteria satisfied · sandbox ready for Lilly access</div>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-emerald-100 p-2.5 flex items-start gap-2" style={{ background: "#F0FDF4" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-black text-slate-900 leading-snug">{it.q}</div>
              <div className="text-[10px] text-slate-600 leading-snug mt-0.5"><span className="font-black text-emerald-700">Satisfied by</span> · {it.satisfiedBy}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Discovery Next Steps Panel — leads to technical discovery discussion
// ============================================================================
function DiscoveryNextStepsPanel() {
  const topics = [
    { title: "Integration surface",       body: "APIs for signal ingest, decision webhook, delivery ACK. Configuration model — what changes without code." },
    { title: "Data plane + residency",    body: "Where Fathom pulls data from Lilly Health. In-country hosting. Pseudonymization at the boundary. PII stays with Lilly." },
    { title: "Message approval workflow", body: "Template library, approval states, versioning, audit trace. Who edits what. Compliance sign-off flow." },
    { title: "Orchestration configuration", body: "Fathom must be configured to Lilly's data, priorities, patient journey, and operating rules — what does that look like operationally?" },
  ];
  return (
    <div className="mt-4 rounded-2xl overflow-hidden shadow-lg" style={{ border: "2px solid #4F5FE5" }}>
      <div className="px-5 py-4" style={{ background: "linear-gradient(90deg,#4F5FE5,#0EA5A4)" }}>
        <div className="text-[9px] font-black uppercase tracking-widest text-white/85 mb-0.5">What's next</div>
        <div className="text-[20px] font-black text-white leading-tight" style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", fontWeight: 400 }}>
          Ready for a technical discovery session?
        </div>
        <div className="text-[12px] text-indigo-100 mt-1">
          This sandbox demonstrated the shape of the value. The next conversation is about how Fathom configures into Lilly's actual data, journey, and operating rules.
        </div>
      </div>
      <div className="p-4 bg-white">
        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-2">Suggested discovery agenda</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          {topics.map((t, i) => (
            <div key={i} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded grid place-items-center text-[10px] font-black text-white shrink-0" style={{ background: "#4F5FE5" }}>{i + 1}</span>
                <span className="text-[12px] font-black text-slate-900">{t.title}</span>
              </div>
              <div className="text-[10px] text-slate-600 leading-snug">{t.body}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
          <div className="text-[9px] font-black uppercase tracking-widest text-indigo-700 mb-0.5">Partnership model</div>
          <div className="text-[11px] text-slate-700 leading-relaxed">
            HabitNu provides the operating platform, Fathom capabilities, and configuration work. Fathom works <span className="font-black">behind or alongside</span> Lilly Health.
            Lilly controls all patient-facing clinical and product messages and the participant relationship end-to-end.
            The standard HabitNu app is not the proposed Lilly end state — this sandbox demonstrates the operating pattern, not the final product.
          </div>
        </div>
      </div>
    </div>
  );
}
