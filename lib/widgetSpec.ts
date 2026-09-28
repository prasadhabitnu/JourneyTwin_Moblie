/**
 * WidgetSpec — declarative JSON that describes any widget's UI + behavior.
 *
 * The spec is what lives in the database (widget_templates + widget_variants
 * rows). Fathom's API returns a fully-hydrated spec per patient + context. The
 * client (React Native WebView, iOS, Android, or the web /widgets playground)
 * renders it with a small set of primitive components.
 *
 * Design principles:
 *   - No HTML, no JS code in the spec — pure JSON.
 *   - Every interactive primitive names an actionId; the client emits an
 *     event of that id when the user activates it.
 *   - Theme tokens (primary, radius, font) come from the host, not the spec.
 *   - Spec is versioned; renderer can refuse mismatched majors.
 */

import { WidgetId } from "./widgetContract";
import { WidgetVariantId } from "./widgetSelector";

// -----------------------------------------------------------------------------
// Primitives — every layout node the renderer can understand
// -----------------------------------------------------------------------------

export type ToneKey = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

export type SpecNode =
  | ShellNode
  | ColumnNode
  | RowNode
  | GridNode
  | TextNode
  | ChipNode
  | DividerNode
  | TimelineNode
  | StatGridNode
  | QuoteNode
  | MessageNode
  | ChoiceRowNode
  | ContextTilesNode
  | FactRowsNode
  | ChartNode;

// Root frame — always the outer container.
export interface ShellNode {
  type: "Shell";
  eyebrow?: string;
  eyebrowTone?: ToneKey;
  title?: string;
  subtitle?: string;
  gradient?: "primary" | "mirror" | "warning" | "danger";
  headerRight?: { chip?: { label: string; tone: ToneKey } };
  footerNote?: string;
  child: SpecNode;
}

export interface ColumnNode { type: "Column"; gap?: 2 | 3 | 4; children: SpecNode[]; }
export interface RowNode    { type: "Row";    gap?: 2 | 3 | 4; children: SpecNode[]; }
export interface GridNode   { type: "Grid";   cols: 2 | 3 | 4; children: SpecNode[]; }

export interface TextNode {
  type: "Text";
  body: string;
  size?: "xs" | "sm" | "md" | "lg";
  tone?: ToneKey;
  bold?: boolean;
  italic?: boolean;
}

export interface ChipNode { type: "Chip"; label: string; tone: ToneKey; }
export interface DividerNode { type: "Divider"; }

export interface TimelineNode {
  type: "Timeline";
  eyebrow?: string;
  items: { time: string; icon?: string; label: string }[];
}

export interface StatGridNode {
  type: "StatGrid";
  eyebrow?: string;
  tone?: ToneKey;
  items: { label: string; value: string; tone?: ToneKey }[];
}

export interface QuoteNode {
  type: "Quote";
  eyebrow?: string;
  body: string;
  tone?: ToneKey;
}

export interface MessageNode {
  type: "Message";
  from: "nu" | "coach";
  body: string;
  tone?: ToneKey;
  meta?: { ruleId?: string; area?: string; confidence?: string };
}

export interface ChoiceRowNode {
  type: "ChoiceRow";
  primary:   { label: string; actionId: string };
  secondary?:{ label: string; actionId: string };
  tertiary:  { label: string; actionId: string };
}

export interface ContextTilesNode {
  type: "ContextTiles";
  eyebrow?: string;
  items: { eyebrow: string; body: string; tone: ToneKey }[];
}

export interface FactRowsNode {
  type: "FactRows";
  items: { icon?: string; label: string; value: string; tone?: ToneKey }[];
}

export interface ChartNode {
  type: "Chart";
  eyebrow?: string;
  series: {
    label: string;
    color: ToneKey;
    values: number[];
    dashed?: boolean;
    marker?: { at: number; label: string };
  }[];
  yMin: number;
  yMax: number;
  targetBand?: { min: number; max: number; label?: string };
  xLabels: string[];
}

// -----------------------------------------------------------------------------
// Root spec — what the API returns
// -----------------------------------------------------------------------------

export interface WidgetSpec {
  specVersion: "1.0";
  widgetId: WidgetId;
  variant: WidgetVariantId;
  layout: SpecNode;

  /** Optional theme overrides. Client merges with host theme. */
  themeOverrides?: {
    accent?: string;             // hex, replaces primary in this widget only
    radius?: number;
  };

  /**
   * Every actionId referenced in the layout must appear here with metadata.
   * Client emits an event of `emit` type when the user activates it.
   */
  actions: Record<string, {
    emit: "action:taken" | "coach:handoff" | "nu:escalate" | "navigation:request" | "data:collected";
    payload?: Record<string, unknown>;
  }>;

  meta: {
    renderedAtIso: string;
    ttlSec: number;                // client caches this long before re-fetching
    ruleId?: string;               // which selector rule chose this widget
    reasons?: string[];            // top scoring reasons (for debug/audit)
    tenant: string;
    patientId: string;
  };
}
