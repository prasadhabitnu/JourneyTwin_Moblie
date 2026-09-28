/**
 * NuFrame — mobile-viewport shell for /nu pages.
 * Dark space bg, status bar, voice bar, live transcript overlay,
 * insecure-context warning when served over plain HTTP.
 */

import { ReactNode, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useNuVoice, ParsedIntent, PLANETS, isInsecureContext } from "../../lib/nuVoice";
import { X, Mic, MicOff, ArrowLeft } from "lucide-react";

interface NuFrameProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function NuFrame({ children, title, showBack, onBack }: NuFrameProps) {
  const router = useRouter();
  const voice = useNuVoice({ autoNavigate: true });

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else router.push("/nu");
  }, [onBack, router]);

  return (
    <>
      <style jsx global>{`body { background: #0B0E1F; color: #F8FAFC; }`}</style>

      <div className="min-h-screen w-full flex flex-col items-center px-4 pb-8 pt-6"
           style={{
             background: "radial-gradient(ellipse at top, #1E1B4B 0%, transparent 40%), radial-gradient(ellipse at bottom, #0F172A 0%, transparent 50%), #0B0E1F",
           }}>

        <div className="w-full max-w-[430px] flex flex-col min-h-[100vh]"
             style={{
               background: "linear-gradient(180deg, rgba(30,27,75,0.4) 0%, transparent 40%)",
               borderRadius: 24,
             }}>

          <div className="fixed inset-0 pointer-events-none z-0"
               style={{
                 background: "radial-gradient(1px 1px at 12% 8%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 68% 6%, rgba(255,255,255,0.35), transparent), radial-gradient(1px 1px at 8% 44%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 92% 52%, rgba(255,255,255,0.3), transparent), radial-gradient(1.5px 1.5px at 32% 28%, rgba(180,180,255,0.45), transparent), radial-gradient(1.5px 1.5px at 74% 44%, rgba(180,180,255,0.4), transparent)",
               }} />

          <div className="relative z-10 flex items-center justify-between px-6 py-3 text-[13px] font-bold text-white">
            <span>9:41</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.10em] uppercase text-violet-300">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Nu is listening
            </span>
            <div className="flex items-center gap-1.5 text-white">
              <svg width="15" height="10" viewBox="0 0 15 10" className="opacity-90">
                <rect x="1" y="1" width="13" height="7" rx="1" stroke="currentColor" fill="none"/>
                <rect x="2" y="2" width="10" height="5" rx="0.5" fill="currentColor"/>
              </svg>
            </div>
          </div>

          {(showBack || title) && (
            <div className="relative z-10 flex items-center gap-3 px-5 pb-2">
              {showBack && (
                <button
                  onClick={handleBack}
                  className="w-9 h-9 rounded-full flex items-center justify-center border border-white/12 bg-white/6 text-white hover:bg-white/10 transition"
                  aria-label="Back to Universe"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              {title && (
                <div className="text-white font-bold text-[15px] tracking-tight flex-1">{title}</div>
              )}
            </div>
          )}

          <div className="relative z-10 flex-1">{children}</div>

          <VoiceBar voice={voice} />
        </div>

        {voice.listening && (
          <VoiceOverlay transcript={voice.transcript} interim={voice.interim} onCancel={voice.stop} />
        )}
        {!voice.listening && voice.intent && (
          <ResultOverlay intent={voice.intent} onDismiss={voice.reset} />
        )}
        {voice.error && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 max-w-[400px] px-4 py-3 rounded-xl bg-rose-500/20 border border-rose-400/40 backdrop-blur-md text-rose-100 text-sm font-medium">
            {voice.error}
          </div>
        )}
      </div>
    </>
  );
}

function VoiceBar({ voice }: { voice: ReturnType<typeof useNuVoice> }) {
  const { supported, listening, start, stop } = voice;
  const [insecure, setInsecure] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setInsecure(isInsecureContext());
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);
  const disabled = !supported || insecure;

  return (
    <div className="sticky bottom-0 z-20 mt-4">
      {insecure && <InsecureBanner origin={origin} />}
      <div className="mx-3 mb-3 px-4 py-3 rounded-3xl flex items-center gap-3 backdrop-blur-lg"
           style={{
             background: "linear-gradient(180deg, rgba(11,14,31,0.8), rgba(11,14,31,0.95))",
             border: "1px solid rgba(167,139,250,0.20)",
           }}>
        <div className="flex-1">
          <div className="text-[9.5px] font-black uppercase tracking-[0.14em] text-violet-300">
            Say the wake phrase
          </div>
          <div className="text-[12px] text-white font-semibold mt-0.5">
            <span className="text-violet-300 font-black">&quot;Whatsup Nu&quot;</span> + a planet
          </div>
        </div>
        <button
          onClick={listening ? stop : start}
          disabled={disabled}
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0 transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: listening
              ? "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), transparent 55%), linear-gradient(135deg, #F87171, #DC2626)"
              : "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), transparent 55%), linear-gradient(135deg, #C4B5FD, #7C3AED 40%, #4C1D95 100%)",
            boxShadow: listening
              ? "0 10px 25px -6px rgba(220,38,38,0.55)"
              : "0 12px 28px -6px rgba(76,29,149,0.60), 0 0 0 6px rgba(124,58,237,0.10)",
          }}
        >
          {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          {listening && (
            <>
              <span className="absolute -inset-1 rounded-full border-2 border-rose-300/50 animate-ping" />
              <span className="absolute -inset-3 rounded-full border-2 border-rose-300/30 animate-ping" style={{ animationDelay: "0.5s" }} />
            </>
          )}
        </button>
      </div>
      {!supported && !insecure && (
        <div className="mx-3 mb-2 text-[10px] text-center text-rose-300/80 font-semibold">
          Voice recognition needs Chrome / Edge over HTTPS or localhost.
        </div>
      )}
    </div>
  );
}

function InsecureBanner({ origin }: { origin: string }) {
  const [copied, setCopied] = useState(false);
  const localhostUrl = "http://localhost:3000/nu";
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };
  return (
    <div className="mx-3 mb-2 p-3 rounded-2xl backdrop-blur-lg"
         style={{
           background: "linear-gradient(135deg, rgba(220,38,38,0.20), rgba(180,83,9,0.15))",
           border: "1.5px solid rgba(251,191,36,0.4)",
         }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-amber-300 text-[16px]">⚠</span>
        <div className="text-[10.5px] font-black uppercase tracking-[0.12em] text-amber-200">
          Mic blocked — this origin is not secure
        </div>
      </div>
      <div className="text-[11.5px] text-white/90 leading-relaxed mb-2">
        Browsers only allow microphone access on <b>HTTPS</b> or <b>localhost</b>.<br/>
        You&apos;re currently on <code className="text-amber-200 font-mono text-[10.5px]">{origin || "http://..."}</code>.
      </div>
      <div className="space-y-1.5 text-[11px] text-white/85">
        <div className="flex items-start gap-2">
          <span className="text-emerald-300 font-black shrink-0">1.</span>
          <div className="flex-1">
            <b className="text-white">Easiest:</b> open on this machine at{" "}
            <button onClick={() => copy(localhostUrl)} className="text-emerald-300 font-mono text-[10.5px] underline decoration-dotted">
              {localhostUrl}
            </button>
            {copied && <span className="text-emerald-300 ml-1 text-[10px]">✓ copied</span>}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-emerald-300 font-black shrink-0">2.</span>
          <div className="flex-1">
            <b className="text-white">On your phone:</b> tunnel your dev server —{" "}
            <code className="text-emerald-300 font-mono text-[10.5px]">ngrok http 3000</code>
            {" "}or{" "}
            <code className="text-emerald-300 font-mono text-[10.5px]">cloudflared tunnel --url http://localhost:3000</code>
            {" "}— then use the HTTPS URL it gives you.
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-emerald-300 font-black shrink-0">3.</span>
          <div className="flex-1">
            <b className="text-white">Deployed staging:</b> the staging URL needs a real TLS cert. Vercel / Netlify / Cloudflare Pages give free HTTPS out of the box.
          </div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-white/60">
        Everything else works — planet tap-navigation still functions. Just the mic is blocked.
      </div>
    </div>
  );
}

function VoiceOverlay({ transcript, interim, onCancel }: { transcript: string; interim: string; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pb-32 pointer-events-none">
      <div className="pointer-events-auto max-w-[400px] w-[90%] mx-auto rounded-2xl px-5 py-4 backdrop-blur-xl"
           style={{
             background: "linear-gradient(135deg, rgba(76,29,149,0.6), rgba(30,27,75,0.7))",
             border: "1.5px solid rgba(167,139,250,0.4)",
             boxShadow: "0 20px 60px -10px rgba(76,29,149,0.6)",
           }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.14em] uppercase text-violet-200">Listening…</span>
          <button onClick={onCancel} className="ml-auto w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20">
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="text-white text-[15px] leading-relaxed font-medium min-h-[24px]">
          {transcript && <span>{transcript} </span>}
          {interim && <span className="opacity-60 italic">{interim}</span>}
          {!transcript && !interim && <span className="text-violet-200/70 italic">Waiting for you to speak…</span>}
          <span className="inline-block w-[2px] h-4 bg-violet-300 align-middle ml-1 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ResultOverlay({ intent, onDismiss }: { intent: ParsedIntent; onDismiss: () => void }) {
  const target = intent.target ? PLANETS.find(p => p.slug === intent.target?.slug) : null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center pb-32 pointer-events-none">
      <div className="pointer-events-auto max-w-[400px] w-[90%] mx-auto rounded-2xl px-5 py-4 backdrop-blur-xl"
           style={{
             background: intent.matched
               ? "linear-gradient(135deg, rgba(16,185,129,0.35), rgba(4,120,87,0.30))"
               : "linear-gradient(135deg, rgba(245,158,11,0.30), rgba(180,83,9,0.25))",
             border: `1.5px solid ${intent.matched ? "rgba(52,211,153,0.5)" : "rgba(251,191,36,0.5)"}`,
           }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black tracking-[0.14em] uppercase" style={{ color: intent.matched ? "#A7F3D0" : "#FDE68A" }}>
            {intent.matched ? "Nu understood" : "Didn't catch that"}
          </span>
          <span className="text-[10px] text-white/60 ml-auto">
            {intent.matched ? `${Math.round(intent.confidence * 100)}% confidence` : intent.reason}
          </span>
          <button onClick={onDismiss} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20">
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="text-white text-[14px] font-medium leading-relaxed">
          <span className="opacity-70">You said:</span> &quot;{intent.transcript}&quot;
        </div>
        {intent.matched && target && (
          <div className="mt-2 text-[13px] text-white font-semibold flex items-center gap-2">
            <span className="text-xl">{target.emoji}</span>
            <span>Opening <b>{target.name}</b>…</span>
          </div>
        )}
        {!intent.matched && (
          <div className="mt-2 text-[12px] text-amber-200/80">
            Try: <i>&quot;Whatsup Nu, take me to CGM&quot;</i> or <i>&quot;show me my rewards&quot;</i>
          </div>
        )}
      </div>
    </div>
  );
}
