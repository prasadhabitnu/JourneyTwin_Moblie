import { useEffect, useState } from "react";
import Head from "next/head";

import { COACH_STEPS, MAYA, CoachStepId } from "../lib/coachData";
import CoachTopNav from "../components/coach/CoachTopNav";
import CoachRail from "../components/coach/CoachRail";
import { useChat } from "../contexts/ChatContext";

import MorningBrief from "../components/coach/steps/MorningBrief";
import SessionCalendar from "../components/coach/steps/SessionCalendar";
import PriorityQueue from "../components/coach/steps/PriorityQueue";
import NhiTriage from "../components/coach/steps/NhiTriage";
import PatientRingDrill from "../components/coach/steps/PatientRingDrill";
import CohortRingPatterns from "../components/coach/steps/CohortRingPatterns";
import SessionPrep from "../components/coach/steps/SessionPrep";
import BehavioralPlaybook from "../components/coach/steps/BehavioralPlaybook";
import EndOfDayRecap from "../components/coach/steps/EndOfDayRecap";
import { CohortPulse, BroadcastDesign, PhysicianHandoff, PanelInsights, Documentation } from "../components/coach/steps/CoachStubs";

import { ChatProvider } from "../contexts/ChatContext";
import { UpdateMeProvider } from "../contexts/UpdateMeContext";
import { JourneyConfigProvider } from "../contexts/JourneyConfigContext";
import { CoachSelectionProvider } from "../contexts/CoachSelectionContext";
import ChatDrawer from "../components/journey/ChatDrawer";
import NuChatFAB from "../components/journey/NuChatFAB";

/**
 * /coach — Maya's day journey. Parallel to /journey but coach-flavored.
 * Wrapped in the same providers so the Nu chat drawer and FAB work identically.
 */
export default function CoachPage() {
  return (
    <JourneyConfigProvider>
      <UpdateMeProvider>
        <ChatProvider>
          <CoachSelectionProvider>
            <CoachPageInner />
            <ChatDrawer />
            <NuChatFAB />
          </CoachSelectionProvider>
        </ChatProvider>
      </UpdateMeProvider>
    </JourneyConfigProvider>
  );
}

function CoachPageInner() {
  const [stepIndex, setStepIndex] = useState(0);
  const [doneIndices, setDoneIndices] = useState<Set<number>>(new Set());
  const chat = useChat();

  // Set Nu's persona to "coach" once, so the chat drawer uses coach-flavored
  // opener + intents (Maya greeting, panel-scoped answers, coach-step navigation).
  useEffect(() => {
    chat.setPersona("coach");
    // Reset so the next drawer-open re-seeds with the coach opener.
    chat.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for journey:jump events (chat "Open Session Prep" etc.) with a
  // stepId that matches a coach step id. Reuses the same event bus as /journey.
  useEffect(() => {
    function onJump(e: Event) {
      const detail = (e as CustomEvent<{ step?: number; stepId?: string }>).detail;
      if (detail?.stepId) {
        const idx = COACH_STEPS.findIndex(s => s.id === detail.stepId);
        if (idx >= 0) setStepIndex(idx);
        return;
      }
      if (typeof detail?.step === "number") setStepIndex(detail.step);
    }
    window.addEventListener("journey:jump", onJump as EventListener);
    return () => window.removeEventListener("journey:jump", onJump as EventListener);
  }, []);

  const total = COACH_STEPS.length;
  const idx = Math.max(0, Math.min(stepIndex, total - 1));
  const step = COACH_STEPS[idx];
  const nextStep = idx < total - 1 ? COACH_STEPS[idx + 1] : null;

  function next() {
    setDoneIndices(prev => new Set([...Array.from(prev), idx]));
    if (idx >= total - 1) return;
    setStepIndex(i => i + 1);
  }
  function back() { if (idx === 0) return; setStepIndex(i => i - 1); }
  function jumpTo(i: number) { setStepIndex(i); }

  return (
    <>
      <Head>
        <title>Maya's Day - Habitnu Coach</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-orange-50/40"
           style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>
        <CoachTopNav />

        <CoachRail
          currentIndex={idx}
          doneIndices={doneIndices}
          onJump={jumpTo}
        />

        <main className="lg:pl-[280px] pt-2">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Step frame */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{step.emoji}</span>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
                    Step {idx + 1} of {total} · {step.eyebrow}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{step.headline}</h2>
                </div>
              </div>
            </div>

            {/* Step content */}
            <div className="animate-fadein">
              {renderStep(step.id)}
            </div>

            {/* Nav footer */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={back}
                disabled={idx === 0}
                className={"px-4 py-2 rounded-xl text-[13px] font-black transition " +
                  (idx === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")}
              >
                ← Back
              </button>

              <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {MAYA.name} · {step.subtitle}
              </div>

              {nextStep ? (
                <button
                  onClick={next}
                  className="px-5 py-2 rounded-xl text-white text-[13px] font-black shadow hover:brightness-110 transition flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #EF5C3E 0%, #B91C1C 100%)" }}
                >
                  Next: {nextStep.name}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setDoneIndices(prev => new Set([...Array.from(prev), idx]))}
                  className="px-5 py-2 rounded-xl text-white text-[13px] font-black shadow hover:brightness-110 transition"
                  style={{ background: "linear-gradient(135deg, #6B5CE0 0%, #4C3EC0 100%)" }}
                >
                  Sign out for the day
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .animate-fadein { animation: fadein 220ms ease-out; }
        @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}

function renderStep(id: string) {
  switch (id) {
    case "morning-brief":         return <MorningBrief />;
    case "session-calendar":      return <SessionCalendar />;
    case "priority-queue":        return <PriorityQueue />;
    case "nhi-triage":            return <NhiTriage />;
    case "patient-ring-drill":    return <PatientRingDrill />;
    case "cohort-pulse":          return <CohortPulse />;
    case "cohort-ring-patterns":  return <CohortRingPatterns />;
    case "mi-playbook":           return <BehavioralPlaybook />;
    case "session-prep":      return <SessionPrep />;
    case "broadcast-design":  return <BroadcastDesign />;
    case "physician-handoff": return <PhysicianHandoff />;
    case "panel-insights":    return <PanelInsights />;
    case "documentation":     return <Documentation />;
    case "end-of-day":        return <EndOfDayRecap />;
    default:                  return null;
  }
}
