import { useState, DragEvent } from "react";

/**
 * DayPlanEditor - drag/drop editor for Sally's day plan.
 *
 * First-pass scope per Prasad:
 *   - today only (no weekly template)
 *   - Sally only (no coach edits)
 *   - 3 buckets: Morning / Afternoon / Evening (no precise times)
 *   - 4-5 Nu suggestion tiles that can be added with one tap
 *   - Anchor cards (wake, meals, sleep, weekly semaglutide) are locked in place
 *   - Movable cards can be dragged between buckets or removed
 *   - Native HTML5 drag/drop (no external DnD library)
 */

type Bucket = "morning" | "afternoon" | "evening";
type Category = "meals" | "movement" | "meds" | "hydration" | "mood" | "social" | "reflect";

interface DayCard {
  id: string;
  label: string;
  duration: string;
  emoji: string;
  category: Category;
  anchor?: boolean;  // locked in place - can't be removed
  fromNu?: boolean;  // true if added from Nu suggestions
  bucket: Bucket;
}

const CATEGORY_STYLE: Record<Category, { bg: string; border: string; fg: string; label: string }> = {
  meals:     { bg: "#FEF3C7", border: "#FDE68A", fg: "#B45309", label: "Meal"      },
  movement:  { bg: "#DBEAFE", border: "#BFDBFE", fg: "#1D4ED8", label: "Movement"  },
  meds:      { bg: "#EDE9FE", border: "#DDD6FE", fg: "#6D28D9", label: "Meds"      },
  hydration: { bg: "#E0F2FE", border: "#BAE6FD", fg: "#0369A1", label: "Water"     },
  mood:      { bg: "#DCFCE7", border: "#A7F3D0", fg: "#047857", label: "Mood"      },
  social:    { bg: "#FCE7F3", border: "#FBCFE8", fg: "#BE185D", label: "Social"    },
  reflect:   { bg: "#EEF2FF", border: "#C7D2FE", fg: "#4338CA", label: "Reflect"   },
};

// Starter plan seeded from Sally's Long Walker Best Path.
const INITIAL_PLAN: DayCard[] = [
  // Morning
  { id: "wake",         label: "Wake + fasting CGM",         duration: "5 min",  emoji: "\u{1F305}", category: "meds",       anchor: true,  bucket: "morning"   },
  { id: "water-am",     label: "Water: 8 oz first thing",    duration: "1 min",  emoji: "\u{1F4A7}", category: "hydration",                 bucket: "morning"   },
  { id: "mood",         label: "Morning mood check",         duration: "1 min",  emoji: "\u{1F60A}", category: "mood",                      bucket: "morning"   },
  { id: "breakfast",    label: "Protein-first breakfast",    duration: "20 min", emoji: "\u{1F373}", category: "meals",      anchor: true,  bucket: "morning"   },
  { id: "metformin-am", label: "Metformin (AM)",             duration: "1 min",  emoji: "\u{1F48A}", category: "meds",                      bucket: "morning"   },
  { id: "walk-am",      label: "10-min post-breakfast walk", duration: "10 min", emoji: "\u{1F6B6}", category: "movement",                  bucket: "morning"   },
  // Afternoon
  { id: "lunch",        label: "Protein-first lunch",        duration: "25 min", emoji: "\u{1F957}", category: "meals",      anchor: true,  bucket: "afternoon" },
  { id: "walk-lunch",   label: "10-min post-lunch walk",     duration: "10 min", emoji: "\u{1F6B6}", category: "movement",                  bucket: "afternoon" },
  { id: "water-mid",    label: "Water refill",               duration: "1 min",  emoji: "\u{1F4A7}", category: "hydration",                 bucket: "afternoon" },
  // Evening
  { id: "dinner",       label: "Protein-first dinner",       duration: "30 min", emoji: "\u{1F37D}", category: "meals",      anchor: true,  bucket: "evening"   },
  { id: "metformin-pm", label: "Metformin (PM)",             duration: "1 min",  emoji: "\u{1F48A}", category: "meds",                      bucket: "evening"   },
  { id: "walk-pm",      label: "20-min post-dinner walk",    duration: "20 min", emoji: "\u{1F6B6}", category: "movement",                  bucket: "evening"   },
  { id: "sleep",        label: "Sleep window - 7+ hrs",      duration: "7h+",    emoji: "\u{1F319}", category: "mood",       anchor: true,  bucket: "evening"   },
];

// Nu's context-aware suggestions for today.
const NU_SUGGESTIONS: DayCard[] = [
  { id: "electrolyte", label: "Electrolyte at 3 PM",         duration: "1 min",  emoji: "\u{1F9C2}", category: "hydration", fromNu: true, bucket: "afternoon" },
  { id: "protein-snack", label: "Protein snack at 4 PM",     duration: "5 min",  emoji: "\u{1F95C}", category: "meals",     fromNu: true, bucket: "afternoon" },
  { id: "coach-check",  label: "Coach Maya check-in",         duration: "3 min",  emoji: "\u{1F4AC}", category: "social",    fromNu: true, bucket: "afternoon" },
  { id: "stretch",      label: "5-min stretch before bed",    duration: "5 min",  emoji: "\u{1F9D8}", category: "movement",  fromNu: true, bucket: "evening"   },
  { id: "gratitude",    label: "Journal 1 gratitude",         duration: "2 min",  emoji: "\u{1F4D3}", category: "reflect",   fromNu: true, bucket: "evening"   },
];

const NU_RATIONALE: Record<string, string> = {
  electrolyte:  "Your afternoon dip is smaller on days you take one - GLP-1 flushes sodium faster than baseline.",
  "protein-snack": "Hunger risk climbs after 3 PM on Rest & Reset days. A 15g protein bite closes the gap.",
  "coach-check": "Maya sent feedback on your challenge this morning - a 3-min ping keeps the loop tight.",
  stretch:      "Your best deep-sleep nights all followed a short stretch. Helps overnight recovery.",
  gratitude:    "You haven't logged one in 3 days. Positive-affect mornings correlate with your flattest curves.",
};

export default function DayPlanEditor() {
  const [plan, setPlan]   = useState<DayCard[]>(INITIAL_PLAN);
  const [suggested, setSuggested] = useState<DayCard[]>(NU_SUGGESTIONS);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function moveToBucket(id: string, bucket: Bucket) {
    setPlan(prev => prev.map(c => c.id === id ? { ...c, bucket } : c));
  }

  function addSuggestion(id: string) {
    const s = suggested.find(x => x.id === id);
    if (!s) return;
    setPlan(prev => [...prev, s]);
    setSuggested(prev => prev.filter(x => x.id !== id));
  }

  function dismissSuggestion(id: string) {
    setSuggested(prev => prev.filter(x => x.id !== id));
  }

  function removeCard(id: string) {
    setPlan(prev => prev.filter(c => c.id !== id));
  }

  function onDragStart(e: DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  }
  function onDragEnd() { setDraggingId(null); }
  function onDragOver(e: DragEvent) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }
  function onDrop(e: DragEvent, bucket: Bucket) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) moveToBucket(id, bucket);
    setDraggingId(null);
  }

  const totalActive = plan.reduce((n, c) => {
    // Sum only "active time" — walks, stretch, etc; not sleep or meals or the standing anchors.
    if (c.anchor) return n;
    const m = parseInt(c.duration);
    return Number.isFinite(m) ? n + m : n;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-[3px] shadow-lg"
           style={{ background: "linear-gradient(135deg, #A78BFA 0%, #EC4A83 45%, #F59E0B 100%)" }}>
        <div className="rounded-[15px] bg-white p-5 md:p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700">My day</div>
            <div className="text-[11px] font-black text-slate-500">Monday, July 6</div>
          </div>
          <div className="text-xl font-black text-slate-900 mb-1">Drag between buckets. Tap Nu&apos;s suggestions to add.</div>
          <div className="text-[12px] text-slate-500 font-medium">
            {plan.length} steps &middot; {totalActive} min active &middot; {plan.filter(c => c.anchor).length} anchors locked
          </div>
        </div>
      </div>

      {/* Three buckets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <BucketColumn label="Morning"   sub="Wake - Lunch"   bucket="morning"
                      cards={plan.filter(c => c.bucket === "morning")}
                      draggingId={draggingId}
                      onDragStart={onDragStart} onDragEnd={onDragEnd}
                      onDragOver={onDragOver} onDrop={(e) => onDrop(e, "morning")}
                      onRemove={removeCard} />
        <BucketColumn label="Afternoon" sub="Lunch - Dinner" bucket="afternoon"
                      cards={plan.filter(c => c.bucket === "afternoon")}
                      draggingId={draggingId}
                      onDragStart={onDragStart} onDragEnd={onDragEnd}
                      onDragOver={onDragOver} onDrop={(e) => onDrop(e, "afternoon")}
                      onRemove={removeCard} />
        <BucketColumn label="Evening"   sub="Dinner - Sleep" bucket="evening"
                      cards={plan.filter(c => c.bucket === "evening")}
                      draggingId={draggingId}
                      onDragStart={onDragStart} onDragEnd={onDragEnd}
                      onDragOver={onDragOver} onDrop={(e) => onDrop(e, "evening")}
                      onRemove={removeCard} />
      </div>

      {/* Nu's suggestions */}
      {suggested.length > 0 && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7C6BFF 0%, #5B4CE0 100%)" }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.5 4L18 8l-4 3 1 5-3-2.5L9 16l1-5-4-3 4.5-1z" />
              </svg>
            </span>
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700">Nu suggests today</div>
            <span className="ml-auto text-[10px] font-black text-slate-400">Based on yesterday + last 14 days</span>
          </div>
          <div className="space-y-2">
            {suggested.map(s => (
              <SuggestionRow key={s.id} card={s}
                             rationale={NU_RATIONALE[s.id]}
                             onAdd={() => addSuggestion(s.id)}
                             onDismiss={() => dismissSuggestion(s.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Bucket column
// ============================================================================

function BucketColumn({ label, sub, bucket, cards, draggingId, onDragStart, onDragEnd, onDragOver, onDrop, onRemove }:
  { label: string; sub: string; bucket: Bucket; cards: DayCard[]; draggingId: string | null;
    onDragStart: (e: DragEvent, id: string) => void; onDragEnd: () => void;
    onDragOver: (e: DragEvent) => void; onDrop: (e: DragEvent) => void;
    onRemove: (id: string) => void }) {
  const isDropTarget = draggingId !== null;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 min-h-[280px]"
         onDragOver={onDragOver} onDrop={onDrop}
         style={isDropTarget ? { outline: "2px dashed #C7D2FE", outlineOffset: 4 } : {}}>
      <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="text-[13px] font-black text-slate-900">{label}</div>
        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{sub}</div>
      </div>
      <div className="space-y-2">
        {cards.length === 0 && (
          <div className="text-[12px] text-slate-400 italic py-4 text-center">Drop a step here</div>
        )}
        {cards.map(c => (
          <PlanCard key={c.id} card={c}
                    onDragStart={(e) => onDragStart(e, c.id)}
                    onDragEnd={onDragEnd}
                    onRemove={c.anchor ? undefined : () => onRemove(c.id)} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Individual plan card
// ============================================================================

function PlanCard({ card, onDragStart, onDragEnd, onRemove }:
  { card: DayCard; onDragStart: (e: DragEvent) => void; onDragEnd: () => void; onRemove?: () => void }) {
  const cs = CATEGORY_STYLE[card.category];
  return (
    <div
      draggable={!card.anchor}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={"group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition " +
        (card.anchor ? "" : "cursor-grab active:cursor-grabbing hover:shadow-md")}
      style={{ background: cs.bg, borderColor: cs.border }}
    >
      <span className="text-lg leading-none shrink-0">{card.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-black text-slate-800 leading-tight truncate">{card.label}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: cs.fg }}>{cs.label}</span>
          <span className="text-[10px] text-slate-500 font-medium">&middot; {card.duration}</span>
          {card.fromNu && (
            <span className="text-[9px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-indigo-100 text-indigo-700">From Nu</span>
          )}
        </div>
      </div>
      {card.anchor && (
        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      )}
      {onRemove && (
        <button onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 shrink-0 text-slate-400 hover:text-rose-600 transition"
                title="Remove">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Nu suggestion row
// ============================================================================

function SuggestionRow({ card, rationale, onAdd, onDismiss }:
  { card: DayCard; rationale?: string; onAdd: () => void; onDismiss: () => void }) {
  const cs = CATEGORY_STYLE[card.category];
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3 shadow-sm">
      <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg"
            style={{ background: cs.bg, border: `1px solid ${cs.border}` }}>
        {card.emoji}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-black text-slate-800 truncate">{card.label}</span>
          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: cs.bg, color: cs.fg }}>{cs.label}</span>
        </div>
        {rationale && (
          <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{rationale}</div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onAdd}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
          Add
        </button>
        <button onClick={onDismiss}
                className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-700 text-[10px] font-black uppercase tracking-wider">
          Not today
        </button>
      </div>
    </div>
  );
}
