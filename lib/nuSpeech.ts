/**
 * Nu voice for the web /journey experience.
 * Wraps window.speechSynthesis with a subtitle-friendly interface.
 *
 * Speaks a string, tracks which word is currently being spoken (for subtitle
 * highlighting if we want it), and fires onStart / onEnd callbacks.
 *
 * Falls back gracefully in server-side rendering (no window).
 */

export interface NuSpeakHandle {
  cancel: () => void;
  isSpeaking: () => boolean;
}

export interface NuSpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (charIndex: number, word: string) => void;
  rate?: number;   // 0.5 .. 2.0
  pitch?: number;  // 0 .. 2
  voice?: string;  // preferred voice name
}

// Global kill-switch for Nu voice across the whole app.
// Flip to `true` to re-enable narration. While false, nuSpeak() no-ops
// and any direct window.speechSynthesis calls that check this flag are skipped.
export const NU_VOICE_ENABLED = false;

let _mutedByUser = true;  // Default to muted while voice is disabled

export function isMuted() {
  return _mutedByUser || !NU_VOICE_ENABLED;
}

export function setMuted(v: boolean) {
  _mutedByUser = v;
  if ((v || !NU_VOICE_ENABLED) && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isNuVoiceEnabled() {
  return NU_VOICE_ENABLED && !_mutedByUser;
}

export function isSpeechAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(preferred?: string): SpeechSynthesisVoice | undefined {
  if (!isSpeechAvailable()) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;

  // Preferred voice name match (case-insensitive substring)
  if (preferred) {
    const p = preferred.toLowerCase();
    const hit = voices.find(v => v.name.toLowerCase().includes(p));
    if (hit) return hit;
  }

  // Look for warm US English female-sounding voices first.
  const preferences = [
    "google us english",
    "microsoft aria",
    "microsoft jenny",
    "samantha",
    "en-us-standard-f",
    "en-us",
  ];
  for (const p of preferences) {
    const hit = voices.find(v =>
      v.name.toLowerCase().includes(p) || v.lang.toLowerCase().includes(p));
    if (hit) return hit;
  }
  // Fall back to any en-US voice.
  return voices.find(v => v.lang.startsWith("en")) ?? voices[0];
}

export function nuSpeak(text: string, opts: NuSpeakOptions = {}): NuSpeakHandle {
  // Global kill-switch: skip speech entirely when disabled for demo.
  if (!NU_VOICE_ENABLED || !isSpeechAvailable() || _mutedByUser) {
    // Fire onEnd on next tick so callers still transition state.
    if (opts.onStart) opts.onStart();
    setTimeout(() => opts.onEnd?.(), Math.min(400, text.length * 30));
    return {
      cancel: () => opts.onEnd?.(),
      isSpeaking: () => false,
    };
  }
  const synth = window.speechSynthesis;
  // Kill any in-flight utterance so subtitles don't overlap.
  synth.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.rate = opts.rate ?? 0.98;
  u.pitch = opts.pitch ?? 1.05;
  u.lang = "en-US";
  const v = pickVoice(opts.voice);
  if (v) u.voice = v;

  u.onstart = () => opts.onStart?.();
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  u.onboundary = (ev) => {
    if (ev.name !== "word") return;
    const idx = ev.charIndex;
    // Extract the word starting at charIndex
    const rest = text.slice(idx);
    const m = rest.match(/\S+/);
    if (m) opts.onBoundary?.(idx, m[0]);
  };

  synth.speak(u);
  return {
    cancel: () => synth.cancel(),
    isSpeaking: () => synth.speaking,
  };
}

/**
 * Ensures window.speechSynthesis has loaded its voice list before we try to
 * pick a preferred voice. In Chrome the voice list is populated asynchronously.
 */
export function warmupSpeech(): Promise<void> {
  return new Promise(resolve => {
    if (!isSpeechAvailable()) return resolve();
    const synth = window.speechSynthesis;
    if (synth.getVoices().length > 0) return resolve();
    const t = setTimeout(() => resolve(), 1200);
    synth.onvoiceschanged = () => {
      clearTimeout(t);
      resolve();
    };
  });
}
