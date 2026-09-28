import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useChat, ChatMessage } from "../../contexts/ChatContext";

/**
 * Talk to Nu — right-side chat drawer.
 * 380px wide on desktop, full-width on mobile. Slides in from the right.
 * Opened via the top-nav message icon.
 */
export default function ChatDrawer() {
  const { isOpen, messages, isThinking, close, sendMessage } = useChat();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages / on open.
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isThinking, isOpen]);

  // Autofocus the input when drawer opens.
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 240);
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  function submit() {
    const t = draft.trim();
    if (!t) return;
    sendMessage(t);
    setDraft("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter to send, Shift+Enter for newline.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden={!isOpen}
        className={"fixed inset-0 z-40 transition-opacity " + (isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
        style={{ background: "rgba(15, 23, 42, 0.35)", backdropFilter: "blur(2px)" }}
      />

      {/* Drawer */}
      <aside
        aria-hidden={!isOpen}
        aria-label="Talk to Nu"
        className={"fixed top-0 right-0 h-screen w-full sm:w-[380px] bg-white z-50 flex flex-col shadow-2xl transition-transform " +
          (isOpen ? "translate-x-0" : "translate-x-full")}
        style={{ borderLeft: "1px solid #E2E8F0" }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Talk to Nu</div>
            <div className="text-[14px] font-black text-slate-900 leading-tight">Nu is here for you, Sally</div>
          </div>
          <button
            onClick={close}
            aria-label="Close chat"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message scroll area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && !isThinking && (
            <div className="text-center text-[12px] text-slate-400 font-medium py-8">
              Nu is ready. Say hi.
            </div>
          )}
          {messages.map(m => (
            <MessageBubble key={m.id} msg={m} onSuggest={(s) => sendMessage(s)} />
          ))}
          {isThinking && <ThinkingBubble />}
        </div>

        {/* Composer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Ask Nu anything..."
              className="flex-1 resize-none px-3 py-2 rounded-xl border border-slate-200 text-[14px] font-medium leading-snug focus:outline-none focus:border-indigo-500 max-h-32"
              style={{ minHeight: 40 }}
            />
            <button
              onClick={submit}
              disabled={!draft.trim()}
              aria-label="Send"
              className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition shadow " +
                (draft.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed")}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1.5 px-1">
            Nu is a companion, not a doctor. In an emergency, dial 911.
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// Message bubble
// ============================================================================

function MessageBubble({ msg, onSuggest }: { msg: ChatMessage; onSuggest: (s: string) => void }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-md text-white text-[13.5px] font-medium leading-snug shadow-sm"
             style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
          {msg.text}
        </div>
      </div>
    );
  }

  // Nu message
  return (
    <div className="flex items-start gap-2">
      <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
        <span className="text-[11px] font-black text-white">Nu</span>
      </span>
      <div className="flex-1 min-w-0">
        <div className="max-w-full px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-slate-100 text-slate-800 text-[13.5px] font-medium leading-relaxed shadow-sm whitespace-pre-line">
          {msg.text}
        </div>
        {msg.appliedActions && msg.appliedActions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.appliedActions.map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-black uppercase tracking-wider"
                style={{ background: "#DCFCE7", color: "#047857", border: "1px solid #A7F3D0" }}
                title={`Applied via chat: ${actionKind(a.type)}`}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 12 10 18 20 6" />
                </svg>
                {a.label}
              </span>
            ))}
          </div>
        )}
        {msg.suggestions && msg.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggest(s)}
                className="px-2.5 py-1 rounded-full text-[11.5px] font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function actionKind(t: string): string {
  switch (t) {
    case "log":          return "logged";
    case "hideStep":     return "hidden";
    case "addStep":      return "added";
    case "resetJourney": return "reset";
    case "navigate":     return "opened";
    default:             return t;
  }
}

// ============================================================================
// "Nu is thinking" bubble - three animated dots
// ============================================================================
function ThinkingBubble() {
  return (
    <div className="flex items-start gap-2">
      <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
        <span className="text-[11px] font-black text-white">Nu</span>
      </span>
      <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-slate-100 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
