import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { replyTo, openingMessage } from "../lib/nuChatResponses";
import { ChatAction } from "../lib/nuChatActions";
import { useUpdateMe } from "./UpdateMeContext";
import { useJourneyConfig } from "./JourneyConfigContext";

/**
 * Chat state for the Talk to Nu drawer.
 * Message history is in-memory only (cleared on refresh) - fine for demo.
 * Nu replies come from lib/nuChatResponses.ts (curated stub).
 */

export interface ChatMessage {
  id: string;
  role: "user" | "nu";
  text: string;
  ts: number;
  suggestions?: string[];        // follow-up prompt chips (only on Nu messages)
  appliedActions?: ChatAction[]; // green confirmation pills under Nu's message
  typing?: boolean;              // Nu's message is still revealing character-by-character
}

export type ChatPersona = "member" | "coach";

interface Ctx {
  isOpen: boolean;
  messages: ChatMessage[];
  isThinking: boolean;     // Nu is composing a reply
  persona: ChatPersona;
  setPersona: (p: ChatPersona) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  sendMessage: (text: string) => void;
  clear: () => void;
}

const ChatContext = createContext<Ctx | null>(null);

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [persona, setPersonaState] = useState<ChatPersona>("member");
  const updateMe = useUpdateMe();
  const cfg = useJourneyConfig();

  const setPersona = useCallback((p: ChatPersona) => setPersonaState(p), []);

  /**
   * Apply a single ChatAction to the shared state.
   * Called after Nu's reply is added to the message list.
   */
  const applyAction = useCallback((a: ChatAction) => {
    switch (a.type) {
      case "log":
        updateMe.setValue(a.key, a.value as never);
        break;
      case "hideStep":
        cfg.hideStep(a.stepId);
        break;
      case "addStep":
        if (cfg.suggestedStepIds.includes(a.stepId))       cfg.acceptSuggestion(a.stepId);
        else if (cfg.hiddenStepIds.includes(a.stepId))     cfg.restoreStep(a.stepId);
        // else already enabled - no-op.
        break;
      case "resetJourney":
        cfg.resetToDefault();
        break;
      case "navigate":
        try {
          window.dispatchEvent(new CustomEvent("journey:jump", { detail: { stepId: a.stepId } }));
        } catch { /* ignore */ }
        break;
    }
  }, [updateMe, cfg]);

  const open = useCallback(() => {
    setIsOpen(true);
    if (!hasOpenedOnce) {
      const opener = openingMessage(persona);
      setMessages([{
        id: makeId(),
        role: "nu",
        text: opener.text,
        ts: Date.now(),
        suggestions: opener.suggestions,
      }]);
      setHasOpenedOnce(true);
    }
  }, [hasOpenedOnce, persona]);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  const clear = useCallback(() => {
    setMessages([]);
    setHasOpenedOnce(false);
  }, []);

  const sendMessage = useCallback((text: string) => {
    const clean = text.trim();
    if (!clean) return;

    // Push the user message immediately.
    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      text: clean,
      ts: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Simulate Nu thinking, then respond + apply any actions.
    setIsThinking(true);
    const thinkDelay = 350 + Math.random() * 250;
    window.setTimeout(() => {
      const reply = replyTo(clean, persona);
      setMessages(prev => [...prev, {
        id: makeId(),
        role: "nu",
        text: reply.text,
        ts: Date.now(),
        suggestions: reply.suggestions,
        appliedActions: reply.actions,
      }]);
      setIsThinking(false);
      if (reply.actions) {
        for (const a of reply.actions) applyAction(a);
      }
    }, thinkDelay);
  }, [applyAction, persona]);

  return (
    <ChatContext.Provider value={{ isOpen, messages, isThinking, persona, setPersona, open, close, toggle, sendMessage, clear }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): Ctx {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
