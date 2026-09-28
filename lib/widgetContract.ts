/**
 * Habitnu Widget Contract
 * -----------------------------------------------------------------------------
 * Every Fathom/Nu widget follows this contract so it can be dropped into any
 * host mobile app (React Native, Flutter, native iOS/Android) as a self-
 * contained card. The host provides context (patient, theme, tenant) as props
 * and receives typed events (data logged, Nu response ready, escalation).
 *
 * Design principles:
 *   - One widget = one use case (Best Day Mirror ≠ Side Effect Check)
 *   - Widget owns its full loop: collect → route through Nu → respond
 *   - Widget does NOT own navigation (host app does — via events)
 *   - Widget does NOT own storage (host app persists via events)
 *   - Widget renders inside a host-provided container (a <View> in RN, a
 *     UIView in iOS, a WebView shell for legacy hybrid apps)
 *
 * The web POC at /widgets renders each widget inside a mock RN <View> frame
 * so PM/UX/client teams can see the embedded appearance before wire-up.
 */

// -----------------------------------------------------------------------------
// Host context — passed in as props from the client app
// -----------------------------------------------------------------------------

export type HostSurface =
  | "react-native"
  | "flutter"
  | "ios-native"
  | "android-native"
  | "web-embed";

export interface HostTheme {
  /** Primary brand color hex (e.g. Lilly red, Novo Nordisk blue) */
  primary: string;
  /** Text/foreground color */
  text: string;
  /** Card surface color */
  surface: string;
  /** Corner radius token — matches host app's design system */
  radius: number;
  /** Font family override (host-provided) */
  fontFamily?: string;
}

export interface PatientContext {
  /** Opaque patient id issued by the host tenant (no PII) */
  patientId: string;
  /** Display first name only, for greetings — never last name */
  firstName: string;
  /** GLP-1 drug + dose for guardrail routing */
  medication?: { name: string; dose: string; week: number };
  /** Signals Fathom already has for this patient — informs default state */
  signals?: {
    lastTIR?: number;
    lastMood?: 1 | 2 | 3 | 4 | 5;
    lastLogAt?: string;        // ISO
    daysSinceLastLog?: number;
    activeSymptoms?: string[]; // e.g. ["nausea", "fatigue"]
  };
}

export interface WidgetHostProps {
  host: HostSurface;
  theme: HostTheme;
  patient: PatientContext;
  /** Locale for i18n (widget still renders default English if unrecognized) */
  locale?: string;
  /** If true, widget emits events but does not call server (for demos) */
  offline?: boolean;
}

// -----------------------------------------------------------------------------
// Widget event contract — everything the widget wants the host to know
// -----------------------------------------------------------------------------

export type WidgetEventType =
  | "widget:mount"
  | "widget:dismiss"
  | "data:collected"
  | "nu:response"
  | "nu:escalate"
  | "coach:handoff"
  | "action:taken"
  | "navigation:request";

export interface WidgetEvent {
  type: WidgetEventType;
  widgetId: WidgetId;
  at: string;                            // ISO timestamp
  patientId: string;
  payload?: Record<string, unknown>;
}

export type WidgetEventHandler = (event: WidgetEvent) => void;

// -----------------------------------------------------------------------------
// Nu response areas (mirrors Lilly Sandbox rule router)
// -----------------------------------------------------------------------------

export type NuResponseArea =
  | "behavior"
  | "treatment-experience"
  | "clinical"
  | "safety"
  | "access";

export interface NuResponse {
  area: NuResponseArea;
  message: string;
  confidence: "high" | "medium" | "low";
  suggestedActions?: NuAction[];
  requiresEscalation?: boolean;
  ruleId?: string;
}

export interface NuAction {
  id: string;
  label: string;
  tone: "primary" | "secondary" | "tertiary" | "danger";
  emits?: WidgetEventType;
}

// -----------------------------------------------------------------------------
// Widget registry — one entry per shipping widget
// -----------------------------------------------------------------------------

export type WidgetId =
  | "best-day-mirror"
  | "side-effect-checkin"
  | "engagement-nudge"
  | "refill-friction"
  | "glucose-spike";

export interface WidgetManifest {
  id: WidgetId;
  name: string;
  useCase: string;                    // one-line
  category: "behavior" | "treatment" | "engagement" | "access" | "clinical";
  minHeightPx: number;                // for host layout planning
  primaryEvent: WidgetEventType;      // what the host most cares about
  demoPatientId: string;              // for /widgets catalog preview
}

export const WIDGETS: WidgetManifest[] = [
  {
    id: "best-day-mirror",
    name: "Best Day Mirror",
    useCase: "Weekly reflection: replay the member's best-scored day with a 3-choice CTA.",
    category: "behavior",
    minHeightPx: 520,
    primaryEvent: "action:taken",
    demoPatientId: "sarah-reeves",
  },
  {
    id: "side-effect-checkin",
    name: "Side-Effect Check-in",
    useCase: "Log a GLP-1 symptom; route through Nu treatment-experience rules; escalate if severe.",
    category: "treatment",
    minHeightPx: 480,
    primaryEvent: "nu:response",
    demoPatientId: "sarah-reeves",
  },
  {
    id: "engagement-nudge",
    name: "Engagement Nudge",
    useCase: "Detect drift; offer a low-friction 3-choice re-engagement without shame.",
    category: "engagement",
    minHeightPx: 420,
    primaryEvent: "action:taken",
    demoPatientId: "diane-wright",
  },
  {
    id: "refill-friction",
    name: "Refill Friction",
    useCase: "Detect pending refill/PA; offer pharmacy nav, coupon, or coach handoff.",
    category: "access",
    minHeightPx: 460,
    primaryEvent: "action:taken",
    demoPatientId: "adam-kelly",
  },
  {
    id: "glucose-spike",
    name: "Glucose Spike Insight",
    useCase: "Explain a post-meal spike; suggest a lever the member can try next time.",
    category: "clinical",
    minHeightPx: 500,
    primaryEvent: "action:taken",
    demoPatientId: "sarah-reeves",
  },
];

export function getWidget(id: WidgetId): WidgetManifest | undefined {
  return WIDGETS.find(w => w.id === id);
}

// -----------------------------------------------------------------------------
// Default theme + demo patients (used only by /widgets catalog)
// -----------------------------------------------------------------------------

export const LILLY_THEME: HostTheme = {
  primary: "#E11D48",
  text: "#0F172A",
  surface: "#FFFFFF",
  radius: 20,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
};

export const NOVO_THEME: HostTheme = {
  primary: "#005AD2",
  text: "#0F172A",
  surface: "#FFFFFF",
  radius: 16,
};

export const HABITNU_THEME: HostTheme = {
  primary: "#5B4CE0",
  text: "#0F172A",
  surface: "#FFFFFF",
  radius: 22,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
};

export const DEMO_PATIENTS: Record<string, PatientContext> = {
  "sarah-reeves": {
    patientId: "sarah-reeves",
    firstName: "Sarah",
    medication: { name: "Mounjaro", dose: "5 mg", week: 14 },
    signals: {
      lastTIR: 78,
      lastMood: 3,
      lastLogAt: new Date(Date.now() - 6 * 3600e3).toISOString(),
      daysSinceLastLog: 0,
      activeSymptoms: ["nausea"],
    },
  },
  "diane-wright": {
    patientId: "diane-wright",
    firstName: "Diane",
    medication: { name: "Zepbound", dose: "7.5 mg", week: 22 },
    signals: {
      lastTIR: 71,
      lastMood: 2,
      lastLogAt: new Date(Date.now() - 9 * 24 * 3600e3).toISOString(),
      daysSinceLastLog: 9,
    },
  },
  "adam-kelly": {
    patientId: "adam-kelly",
    firstName: "Adam",
    medication: { name: "Wegovy", dose: "2.4 mg", week: 8 },
    signals: {
      lastTIR: 82,
      lastLogAt: new Date(Date.now() - 2 * 24 * 3600e3).toISOString(),
      daysSinceLastLog: 2,
    },
  },
};
