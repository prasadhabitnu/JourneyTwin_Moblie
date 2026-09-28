/**
 * Nu voice — Web Speech API wrapper + intent parser + navigation glue.
 * Real voice → transcript → intent → Next.js route.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

// ------------- Intent catalog -------------

export interface PlanetSpec {
  slug: string;
  name: string;
  emoji: string;
  keywords: string[];
  route: string;
  toneColor: string;
  status: string;
}

export const PLANETS: PlanetSpec[] = [
  { slug: "today",       name: "Today",       emoji: "🌅", keywords: ["today", "playbook", "recipe", "plan", "long walker", "the walker"], route: "/nu/today",       toneColor: "#F59E0B", status: "Long Walker" },
  { slug: "cgm",         name: "CGM",         emoji: "💧", keywords: ["cgm", "glucose", "sugar", "tir", "time in range", "blood sugar"], route: "/nu/cgm",         toneColor: "#3B82F6", status: "TIR 99%" },
  { slug: "journey",     name: "Journey",     emoji: "🗺️", keywords: ["journey", "timeline", "history", "story", "week", "path"], route: "/nu/journey",     toneColor: "#A78BFA", status: "Week 13" },
  { slug: "coach",       name: "Coach",       emoji: "👥", keywords: ["coach", "message", "session", "chat", "call"], route: "/nu/coach",       toneColor: "#FB7185", status: "2 new" },
  { slug: "care-circle", name: "Care Circle", emoji: "💗", keywords: ["care", "family", "circle", "loved", "spouse", "kids"], route: "/nu/care-circle", toneColor: "#F472B6", status: "3 members" },
  { slug: "learn",       name: "Learn",       emoji: "📚", keywords: ["learn", "lesson", "mindful", "teach", "class", "eat"], route: "/nu/learn",       toneColor: "#22D3EE", status: "Mindful eating" },
  { slug: "rewards",     name: "Rewards",     emoji: "🏆", keywords: ["rewards", "badges", "credits", "achievement", "trophy", "streak"], route: "/nu/rewards",     toneColor: "#C89A3B", status: "Platinum" },
  { slug: "progress",    name: "Progress",    emoji: "📈", keywords: ["progress", "trend", "month", "improvement"], route: "/nu/progress",    toneColor: "#10B981", status: "+3 TIR pts" },
];

// ------------- Intent parser -------------

export interface ParsedIntent {
  transcript: string;
  target?: PlanetSpec;
  route: string;
  matched: boolean;
  reason: string;
  confidence: number;
}

export function parseIntent(transcript: string): ParsedIntent {
  const raw = transcript.toLowerCase().trim();
  const cleaned = raw
    .replace(/\b(wh?a?t'?s?\s+up\s+nu)\b/gi, "")
    .replace(/\b(hey\s+nu|ok\s+nu|hi\s+nu)\b/gi, "")
    .replace(/\bnu[,\s]+/gi, "")
    .replace(/[,.!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/\b(universe|home|back|main|start)\b/.test(cleaned)) {
    return { transcript, route: "/nu", matched: true, reason: "home", confidence: 0.95 };
  }

  let best: { planet: PlanetSpec; kw: string; score: number } | null = null;
  for (const p of PLANETS) {
    for (const kw of p.keywords) {
      if (cleaned.includes(kw)) {
        const score = kw.length;
        if (!best || score > best.score) best = { planet: p, kw, score };
      }
    }
  }

  if (best) {
    return {
      transcript,
      target: best.planet,
      route: best.planet.route,
      matched: true,
      reason: `matched "${best.kw}"`,
      confidence: Math.min(0.98, 0.7 + best.score / 30),
    };
  }
  return { transcript, route: "/nu", matched: false, reason: "no keyword matched", confidence: 0 };
}

// ------------- Web Speech API detection -------------

type BrowserSpeechRecognition = new () => SpeechRecognition;

function getSpeechRecognition(): BrowserSpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as {
    SpeechRecognition?: BrowserSpeechRecognition;
    webkitSpeechRecognition?: BrowserSpeechRecognition;
  };
  return W.SpeechRecognition ?? W.webkitSpeechRecognition ?? null;
}

export function isVoiceSupported(): boolean {
  return getSpeechRecognition() !== null;
}

/** True if we're on plain http:// with a non-localhost hostname. */
export function isInsecureContext(): boolean {
  if (typeof window === "undefined") return false;
  const secure = (window as unknown as { isSecureContext?: boolean }).isSecureContext;
  if (secure === true) return false;
  if (window.location.protocol === "https:") return false;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
  return true;
}

// ------------- React hook -------------

export interface UseNuVoiceOpts {
  autoNavigate?: boolean;
  onIntent?: (intent: ParsedIntent) => void;
}

export interface UseNuVoiceState {
  supported: boolean;
  listening: boolean;
  transcript: string;
  interim: string;
  error: string | null;
  intent: ParsedIntent | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useNuVoice(opts: UseNuVoiceOpts = {}): UseNuVoiceState {
  const { autoNavigate = true, onIntent } = opts;
  const router = useRouter();

  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<ParsedIntent | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setSupported(isVoiceSupported());
  }, []);

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterim("");
    setError(null);
    setIntent(null);
  }, []);

  const start = useCallback(() => {
    if (isInsecureContext()) {
      setError(
        "Voice needs HTTPS or localhost. Open http://localhost:3000/nu on this machine, " +
        "or expose your dev server with a tunnel (ngrok / cloudflared) to get an HTTPS URL."
      );
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) {
      setError("Voice recognition not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* noop */ }
    }

    reset();
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (interimText) setInterim(interimText);
      if (finalText) {
        setTranscript(prev => (prev ? prev + " " : "") + finalText.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = event.error;
      const map: Record<string, string> = {
        "no-speech": "I didn't hear anything. Try again?",
        "audio-capture": "Can't access the microphone. Check browser permissions.",
        "not-allowed": "Microphone permission was denied — check your browser's site settings.",
        "network": "Network error while recognizing speech.",
        "aborted": "",
      };
      const msg = map[code] ?? `Voice error: ${code}`;
      if (msg) setError(msg);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setTranscript(prev => {
        const finalText = prev.trim();
        if (finalText) {
          const parsed = parseIntent(finalText);
          setIntent(parsed);
          onIntent?.(parsed);
          if (autoNavigate && parsed.matched) {
            setTimeout(() => { router.push(parsed.route); }, 900);
          }
        }
        return prev;
      });
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError("Could not start listening. Try again.");
      setListening(false);
    }
  }, [reset, autoNavigate, onIntent, router]);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.abort(); } catch { /* noop */ }
    };
  }, []);

  return { supported, listening, transcript, interim, error, intent, start, stop, reset };
}
