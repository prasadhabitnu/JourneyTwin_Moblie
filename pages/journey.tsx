import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import {
  NU_ROLES, MORNING_BRANCHES, GLUCOSE_CHECKPOINT_RESPONSE,
  JOURNEY_INTRO, JOURNEY_OUTRO, NuRoleId,
} from "../lib/journeyData";
import { nuSpeak, warmupSpeech, setMuted } from "../lib/nuSpeech";

import JourneyRail from "../components/journey/JourneyRail";
import JourneyTopNav from "../components/journey/JourneyTopNav";
import SubtitleBar from "../components/journey/SubtitleBar";
import StepFrame from "../components/journey/StepFrame";
import MorningFriend from "../components/journey/steps/MorningFriend";
import UpdateMe from "../components/journey/steps/UpdateMe";
import { UpdateMeProvider } from "../contexts/UpdateMeContext";
import BestPathGuide from "../components/journey/steps/BestPathGuide";
import CompassReader from "../components/journey/steps/CompassReader";
import VitalsReader from "../components/journey/steps/VitalsReader";
import RingCompanion from "../components/journey/steps/RingCompanion";
import GlucoseStoryteller from "../components/journey/steps/GlucoseStoryteller";
import { KindredConnector, TrendWatcher, EveningCompanion } from "../components/journey/steps/LaterSteps";
import CravingLog from "../components/journey/steps/CravingLog";
import { WeeklyReflection, MealPlanning, ProviderPrep, LearnOneThing } from "../components/journey/steps/SuggestedStubs";
import { JourneyConfigProvider, useJourneyConfig } from "../contexts/JourneyConfigContext";
import { BehavioralModeProvider, useBehavioralMode } from "../contexts/BehavioralModeContext";
import JourneyConfigEditor from "../components/journey/JourneyConfigEditor";
import { ChatProvider } from "../contexts/ChatContext";
import ChatDrawer from "../components/journey/ChatDrawer";
import NuChatFAB from "../components/journey/NuChatFAB";

type Mood = "good" | "okay" | "struggling";

export default function JourneyPage() {
  return (
    <JourneyConfigProvider>
      <BehavioralModeProvider>
        <UpdateMeProvider>
          <ChatProvider>
            <JourneyPageInner />
            <ChatDrawer />
            <NuChatFAB />
          </ChatProvider>
        </UpdateMeProvider>
      </BehavioralModeProvider>
    </JourneyConfigProvider>
  );
}

function JourneyPageInner() {
  const router = useRouter();
  const cfg = useJourneyConfig();
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [doneIndices, setDoneIndices] = useState<Set<number>>(new Set());
  const [mood, setMood] = useState<Mood | null>(null);
  const [tappedAnnotation, setTappedAnnotation] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [muted, setMutedState] = useState(true);  // Default to muted per Prasad
  const [editorOpen, setEditorOpen] = useState(false);

  const speechHandle = useRef<{ cancel: () => void } | null>(null);
  const stepRef = useRef<HTMLDivElement | null>(null);

  // Resolve current role from Sally's configured (enabled) journey stack.
  const enabled = cfg.enabledStepIds;
  const totalSteps = enabled.length;
  const safeIndex = Math.max(0, Math.min(stepIndex, totalSteps - 1));
  const currentRoleId = enabled[safeIndex];
  const role = NU_ROLES.find(r => r.id === currentRoleId) ?? NU_ROLES[0];
  const nextRoleId = safeIndex < totalSteps - 1 ? enabled[safeIndex + 1] : null;
  const nextRole = nextRoleId ? NU_ROLES.find(r => r.id === nextRoleId) ?? null : null;

  useEffect(() => { warmupSpeech(); setMuted(true); }, []);
  useEffect(() => {
    function onJump(e: Event) {
      const detail = (e as CustomEvent<{ step?: number; stepId?: NuRoleId }>).detail;
      if (detail?.stepId) {
        const idx = cfg.enabledStepIds.indexOf(detail.stepId);
        if (idx >= 0) setStepIndex(idx);
        return;
      }
      if (typeof detail?.step === "number") setStepIndex(detail.step);
    }
    window.addEventListener("journey:jump", onJump as EventListener);
    return () => window.removeEventListener("journey:jump", onJump as EventListener);
  }, [cfg.enabledStepIds]);

  useEffect(() => {
    if (!started || finished) return;
    if (speechHandle.current) speechHandle.current.cancel();
    let text = role.narration;
    if (role.id === "morning-friend" && mood) {
      const b = MORNING_BRANCHES.find(m => m.mood === mood);
      if (b) text = b.narration;
    }
    setSubtitle(text);
    speechHandle.current = nuSpeak(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
    setTimeout(() => stepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    return () => { speechHandle.current?.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, started, finished]);

  useEffect(() => {
    if (!started || role.id !== "morning-friend" || !mood) return;
    speechHandle.current?.cancel();
    const b = MORNING_BRANCHES.find(m => m.mood === mood);
    if (!b) return;
    setSubtitle(b.narration);
    speechHandle.current = nuSpeak(b.narration, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, started]);

  useEffect(() => {
    if (!tappedAnnotation) return;
    if (tappedAnnotation !== "Breakfast") return;
    speechHandle.current?.cancel();
    setSubtitle(GLUCOSE_CHECKPOINT_RESPONSE);
    speechHandle.current = nuSpeak(GLUCOSE_CHECKPOINT_RESPONSE, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, [tappedAnnotation]);

  function next() {
    setDoneIndices(prev => new Set([...Array.from(prev), safeIndex]));
    if (safeIndex >= totalSteps - 1) { finish(); return; }
    setStepIndex(i => i + 1);
  }
  function back() { if (safeIndex === 0) return; setStepIndex(i => i - 1); }
  function jumpTo(i: number) { setStepIndex(i); }
  function finish() {
    setDoneIndices(prev => new Set([...Array.from(prev), safeIndex]));
    speechHandle.current?.cancel();
    setSpeaking(false);
    setFinished(true);
  }

  function toggleMute() {
    const nowMuted = !muted;
    setMutedState(nowMuted);
    setMuted(nowMuted);
    if (nowMuted) {
      speechHandle.current?.cancel();
      setSpeaking(false);
    } else if (started && !finished) {
      const text = subtitle || role.narration;
      speechHandle.current = nuSpeak(text, {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      });
    }
  }

  if (!started) {
    return (
      <>
        <Head><title>Sally&apos;s Day - Habitnu x Lilly</title><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" /></Head>
        <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-indigo-50 flex items-center justify-center px-8" style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>
          <div className="max-w-3xl text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-600 mb-4">{JOURNEY_INTRO.eyebrow}</div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-slate-900 mb-6">{JOURNEY_INTRO.headline}</h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">{JOURNEY_INTRO.subheadline}</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={() => { setStarted(true); warmupSpeech(); }}
                className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-200"
              >
                {JOURNEY_INTRO.ctaLabel} &rarr;
              </button>
              <button onClick={() => router.push("/")}
                      className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800">
                Skip to dashboard
              </button>
            </div>
            <div className="mt-16 text-xs text-slate-400 font-medium">
              &#127793; Nu narrates. Voice comes on automatically - tap the badge to mute.
            </div>
          </div>
        </div>
      </>
    );
  }

  if (finished) {
    return (
      <>
        <Head><title>Sally&apos;s Day - Habitnu x Lilly</title><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" /></Head>
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-indigo-50 flex items-center justify-center px-8" style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>
          <div className="max-w-3xl text-center">
            <div className="text-6xl mb-6">&#127793;</div>
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-600 mb-4">{JOURNEY_OUTRO.eyebrow}</div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">{JOURNEY_OUTRO.headline}</h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">{JOURNEY_OUTRO.subheadline}</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button onClick={() => router.push("/")}
                      className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-200">
                {JOURNEY_OUTRO.primaryCta} &rarr;
              </button>
              <button
                onClick={() => {
                  setFinished(false); setStarted(true); setStepIndex(0);
                  setDoneIndices(new Set()); setMood(null); setTappedAnnotation(null);
                }}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800">
                &#8635; {JOURNEY_OUTRO.secondaryCta}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Sally&apos;s Day - Habitnu x Lilly</title><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" /></Head>
      <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>
        <JourneyTopNav muted={muted} onToggleMute={toggleMute} speaking={speaking && !muted} onOpenSettings={() => setEditorOpen(true)} />
        <BehavioralModeStrip />
        <JourneyRail currentIndex={safeIndex} doneIndices={doneIndices} onJump={jumpTo} onOpenSettings={() => setEditorOpen(true)} />

        <div ref={stepRef}>
          <StepFrame
            role={role}
            stepIndex={safeIndex}
            totalSteps={totalSteps}
            nextRole={nextRole}
            onNext={next}
            onBack={safeIndex === 0 ? undefined : back}
            onFinish={finish}
          >
            {renderStep(role.id, {
              mood, setMood,
              onAnnotationTap: (a: string) => setTappedAnnotation(a),
              speakingActive: speaking,
            })}
          </StepFrame>
        </div>

        <SubtitleBar text={subtitle} visible={speaking} />
      </div>
      {editorOpen && <JourneyConfigEditor onClose={() => setEditorOpen(false)} />}
    </>
  );
}

function renderStep(
  roleId: NuRoleId,
  ctx: { mood: Mood | null; setMood: (m: Mood) => void; onAnnotationTap: (a: string) => void; speakingActive: boolean; },
) {
  switch (roleId) {
    case "morning-friend":       return <MorningFriend onMood={ctx.setMood} selectedMood={ctx.mood} />;
    case "update-me":            return <UpdateMe />;
    case "best-path-guide":      return <BestPathGuide />;
    case "compass-reader":       return <CompassReader highlightSweep={ctx.speakingActive} />;
    case "vitals-reader":        return <VitalsReader />;
    case "ring-companion":       return <RingCompanion />;
    case "glucose-storyteller":  return <GlucoseStoryteller onAnnotationTapped={ctx.onAnnotationTap} />;
    case "kindred-connector":    return <KindredConnector />;
    case "trend-watcher":        return <TrendWatcher />;
    case "evening-companion":    return <EveningCompanion />;
    case "craving-log":          return <CravingLog />;
    case "weekly-reflection":    return <WeeklyReflection />;
    case "meal-planning":        return <MealPlanning />;
    case "provider-prep":        return <ProviderPrep />;
    case "learn-one-thing":
      return <LearnOneThing />;
    default:                     return null;
  }
}

// ============================================================================
// BehavioralModeStrip — top-of-page toggle + explainer banner when active
// ============================================================================
function BehavioralModeStrip() {
  const { mode, setMode } = useBehavioralMode();
  const isBehavioral = mode === "behavioral";
  return (
    <div className="w-full border-b" style={{ borderColor: isBehavioral ? "#C7D2FE" : "#E2E8F0",
                                              background: isBehavioral
                                                ? "linear-gradient(90deg,#EEF2FF,#F5F3FF)"
                                                : "linear-gradient(90deg,#F8FAFC,#FFFFFF)" }}>
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-3 flex-wrap">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Journey mode</span>
        <div className="inline-flex items-center rounded-full p-0.5" style={{ background: "white", border: "1px solid #E2E8F0" }}>
          {(["standard", "behavioral"] as const).map(m => {
            const active = mode === m;
            return (
              <button key={m}
                      onClick={() => setMode(m)}
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition"
                      style={active
                        ? m === "behavioral"
                          ? { background: "linear-gradient(90deg,#4F5FE5,#7C3AED)", color: "white", boxShadow: "0 2px 6px -2px rgba(124,58,237,0.4)" }
                          : { background: "#0F172A", color: "white" }
                        : { background: "transparent", color: "#64748B" }}>
                {m === "standard" ? "Standard" : "Behavioral"}
              </button>
            );
          })}
        </div>
        {isBehavioral && (
          <div className="flex-1 min-w-0 text-[11px] text-indigo-900 leading-snug">
            <span className="font-black">Behavioral variant.</span>{" "}
            No meal plans, no dietary directives, no medication management.
            Only the behavioral-science layer: habit architecture, autonomy-supportive language, environment design.
            <span className="text-slate-500 italic ml-1">Nu suggests · you design · GLP-1 does the physiology.</span>
          </div>
        )}
        {!isBehavioral && (
          <span className="text-[11px] text-slate-500 italic">
            Full bundle · meal path + habits + medication coaching. Toggle to see the pure-behavioral variant.
          </span>
        )}
      </div>
    </div>
  );
}
