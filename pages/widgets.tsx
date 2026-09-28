import { useMemo, useState, useCallback } from "react";
import Head from "next/head";
import {
  WIDGETS,
  WidgetId,
  WidgetEvent,
  DEMO_PATIENTS,
  LILLY_THEME,
  NOVO_THEME,
  HABITNU_THEME,
  HostSurface,
  HostTheme,
} from "../lib/widgetContract";

import BestDayMirrorWidget from "../components/widgets/BestDayMirrorWidget";
import SideEffectCheckinWidget from "../components/widgets/SideEffectCheckinWidget";
import EngagementNudgeWidget from "../components/widgets/EngagementNudgeWidget";
import RefillFrictionWidget from "../components/widgets/RefillFrictionWidget";
import GlucoseSpikeWidget from "../components/widgets/GlucoseSpikeWidget";
import ContextPlayground from "../components/widgets/ContextPlayground";
import RemoteSDUI from "../components/widgets/RemoteSDUI";

type ViewMode = "catalog" | "context" | "remote";

/**
 * /widgets — Habitnu Widget Catalog
 * -----------------------------------------------------------------------------
 * Preview each widget inside a mock React Native <View> host frame, alongside
 * a live event stream showing what the host app receives. Includes copy-ready
 * integration snippets so a client engineer can drop the widget into their
 * React Native / Flutter / native iOS/Android app.
 */
export default function WidgetsPage() {
  const [mode, setMode] = useState<ViewMode>("catalog");
  const [activeId, setActiveId] = useState<WidgetId>("best-day-mirror");
  const [host, setHost] = useState<HostSurface>("react-native");
  const [theme, setTheme] = useState<HostTheme>(LILLY_THEME);
  const [events, setEvents] = useState<WidgetEvent[]>([]);

  const active = WIDGETS.find(w => w.id === activeId)!;
  const patient = DEMO_PATIENTS[active.demoPatientId];

  const onEvent = useCallback((e: WidgetEvent) => {
    setEvents(prev => [e, ...prev].slice(0, 40));
  }, []);

  const props = { host, theme, patient, onEvent };

  const widget = useMemo(() => {
    switch (activeId) {
      case "best-day-mirror":     return <BestDayMirrorWidget {...props} />;
      case "side-effect-checkin": return <SideEffectCheckinWidget {...props} />;
      case "engagement-nudge":    return <EngagementNudgeWidget {...props} />;
      case "refill-friction":     return <RefillFrictionWidget {...props} />;
      case "glucose-spike":       return <GlucoseSpikeWidget {...props} />;
    }
  }, [activeId, host, theme, patient, onEvent]);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head>
        <title>Habitnu Widget Catalog</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40"
           style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>
        <TopNav host={host} setHost={setHost} theme={theme} setTheme={setTheme} mode={mode} setMode={setMode} />

        {mode === "context" ? (
          <main className="max-w-[1600px] mx-auto px-6 py-8">
            <ContextPlayground host={host} theme={theme} onEvent={onEvent} />
          </main>
        ) : mode === "remote" ? (
          <main className="max-w-[1600px] mx-auto px-6 py-8">
            <RemoteSDUI host={host} theme={theme} onEvent={onEvent} />
          </main>
        ) : (
        <main className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-6">
          {/* Left rail — widget list */}
          <aside className="space-y-2">
            <SectionLabel>Widget library · {WIDGETS.length}</SectionLabel>
            {WIDGETS.map(w => (
              <button
                key={w.id}
                onClick={() => { setActiveId(w.id); setEvents([]); }}
                className={"w-full text-left p-3 rounded-xl border transition " +
                  (w.id === activeId
                    ? "border-indigo-400 bg-indigo-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CategoryDot category={w.category} />
                  <span className="text-[13px] font-black text-slate-900 leading-tight">{w.name}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium leading-snug">{w.useCase}</div>
                <div className="mt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <span>{w.category}</span>
                  <span className="text-slate-300">·</span>
                  <span>{DEMO_PATIENTS[w.demoPatientId].firstName}</span>
                </div>
              </button>
            ))}

            <div className="mt-6 rounded-xl p-4 border border-indigo-100 bg-white">
              <SectionLabel>How this works</SectionLabel>
              <ul className="mt-2 space-y-1.5 text-[11.5px] text-slate-600 font-medium leading-snug">
                <li>1. Host app renders the widget inside a <code className="text-indigo-700">&lt;View&gt;</code>.</li>
                <li>2. Widget collects data, routes it through Nu rules, and responds.</li>
                <li>3. Every meaningful moment fires a typed <code className="text-indigo-700">onEvent</code>.</li>
                <li>4. Host owns navigation and persistence.</li>
              </ul>
            </div>
          </aside>

          {/* Center — host frame with the widget */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <SectionLabel>Preview · {host === "react-native" ? "React Native <View>" : host}</SectionLabel>
                <div className="text-[22px] font-black text-slate-900 leading-tight mt-1">{active.name}</div>
                <div className="text-[13px] text-slate-600 font-medium">{active.useCase}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Patient</span>
                <span className="text-[11px] font-black px-2 py-1 rounded-md bg-slate-900 text-white">{patient.firstName}</span>
              </div>
            </div>

            <HostFrame host={host} theme={theme}>
              {widget}
            </HostFrame>

            <IntegrationSnippet id={activeId} host={host} patient={patient.patientId} theme={theme} />
          </section>

          {/* Right rail — event stream */}
          <aside>
            <SectionLabel>Event stream · what the host receives</SectionLabel>
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-950 text-slate-100 shadow-inner overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  onEvent(event) · {events.length} received
                </span>
                <button
                  onClick={() => setEvents([])}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-[520px] overflow-y-auto" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
                {events.length === 0 && (
                  <div className="p-4 text-[11px] text-slate-500 italic">
                    Interact with the widget to see events fire here.
                  </div>
                )}
                {events.map((e, i) => (
                  <EventRow key={i} event={e} />
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <SectionLabel>Widget manifest</SectionLabel>
              <dl className="mt-2 text-[11.5px] text-slate-700 space-y-1.5">
                <ManifestRow k="id"           v={active.id} />
                <ManifestRow k="category"     v={active.category} />
                <ManifestRow k="minHeight"    v={`${active.minHeightPx}px`} />
                <ManifestRow k="primaryEvent" v={active.primaryEvent} />
                <ManifestRow k="host"         v={host} />
                <ManifestRow k="theme"        v={
                  theme === LILLY_THEME ? "Lilly" : theme === NOVO_THEME ? "Novo Nordisk" : "Habitnu"
                } />
              </dl>
            </div>
          </aside>
        </main>
        )}
      </div>
    </>
  );
}

// -----------------------------------------------------------------------------

function TopNav({ host, setHost, theme, setTheme, mode, setMode }: {
  host: HostSurface; setHost: (h: HostSurface) => void;
  theme: HostTheme; setTheme: (t: HostTheme) => void;
  mode: ViewMode; setMode: (m: ViewMode) => void;
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/85 border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Habitnu Widget SDK</div>
          <div className="text-[16px] font-black text-slate-900 leading-none">Nu, embedded.</div>
        </div>

        <div className="ml-4 flex items-center gap-1 bg-indigo-100 rounded-lg p-1">
          {(["catalog", "context", "remote"] as ViewMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={"px-3 py-1.5 rounded-md text-[11px] font-black transition " +
                (mode === m ? "bg-indigo-600 text-white shadow" : "text-indigo-700 hover:text-indigo-900")}
            >
              {m === "catalog" ? "Widget catalog" : m === "context" ? "Context playground" : "Remote SDUI"}
            </button>
          ))}
        </div>

        <div className="ml-2 flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(["react-native", "flutter", "ios-native", "android-native"] as HostSurface[]).map(h => (
            <button
              key={h}
              onClick={() => setHost(h)}
              className={"px-3 py-1.5 rounded-md text-[11px] font-black transition " +
                (host === h ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-800")}
            >
              {h === "react-native" ? "React Native" : h === "flutter" ? "Flutter" : h === "ios-native" ? "iOS" : "Android"}
            </button>
          ))}
        </div>

        <div className="ml-2 flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Host theme</span>
          <ThemeSwatch label="Lilly"    color={LILLY_THEME.primary}   active={theme === LILLY_THEME}   onClick={() => setTheme(LILLY_THEME)} />
          <ThemeSwatch label="Novo"     color={NOVO_THEME.primary}    active={theme === NOVO_THEME}    onClick={() => setTheme(NOVO_THEME)} />
          <ThemeSwatch label="Habitnu"  color={HABITNU_THEME.primary} active={theme === HABITNU_THEME} onClick={() => setTheme(HABITNU_THEME)} />
        </div>

        <div className="ml-auto text-[11px] text-slate-500 font-medium">
          Props in · events out · one widget = one use case
        </div>
      </div>
    </header>
  );
}

function ThemeSwatch({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={"flex items-center gap-1.5 px-2 py-1 rounded-md transition " + (active ? "bg-slate-900 text-white" : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700")}
    >
      <span className="w-3 h-3 rounded-full" style={{ background: color }} />
      <span className="text-[11px] font-black">{label}</span>
    </button>
  );
}

function HostFrame({ host, theme, children }: { host: HostSurface; theme: HostTheme; children: React.ReactNode }) {
  // Mock mobile-phone frame: shows the host app chrome + a "widget slot" where our widget renders.
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
      {/* Phone frame */}
      <div className="mx-auto" style={{ maxWidth: 460 }}>
        <div className="rounded-t-[36px] pt-3 pb-1 flex items-center justify-center"
             style={{ background: theme.primary }}>
          <span className="w-16 h-1 rounded-full bg-white/40" />
        </div>
        <div className="px-3 py-3 flex items-center justify-between bg-white border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg grid place-items-center text-white font-black text-[11px]" style={{ background: theme.primary }}>
              {theme === LILLY_THEME ? "L" : theme === NOVO_THEME ? "N" : "H"}
            </span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {theme === LILLY_THEME ? "Lilly Health" : theme === NOVO_THEME ? "Novo Companion" : "Habitnu"}
              </div>
              <div className="text-[13px] font-black text-slate-900 leading-none">My Program</div>
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Host: {host}
          </div>
        </div>
        <div className="px-4 pt-4 pb-2 bg-slate-50/60 text-[10px] font-black uppercase tracking-widest text-slate-500">
          ↓ Widget slot ↓
        </div>
        <div className="px-4 pb-6 bg-slate-50/60">
          <div className="rounded-xl border-2 border-dashed border-indigo-200 p-1">
            {children}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 font-medium text-center">
            &lt;View style={"{"}{"styles.widgetSlot"}{"}"}&gt; · {theme === LILLY_THEME ? "Lilly Health" : theme === NOVO_THEME ? "Novo Companion" : "Habitnu"} app frame (mock)
          </div>
        </div>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: WidgetEvent }) {
  const t = event.type;
  const tone = t.startsWith("nu:escalate") || t === "coach:handoff" ? "text-rose-300"
    : t.startsWith("nu:") ? "text-emerald-300"
    : t.startsWith("data:") ? "text-amber-300"
    : t.startsWith("navigation:") ? "text-sky-300"
    : "text-indigo-300";
  return (
    <div className="px-3 py-2 border-b border-slate-800 hover:bg-slate-900">
      <div className="flex items-center gap-2 mb-1">
        <span className={"text-[10px] font-black uppercase tracking-widest " + tone}>{t}</span>
        <span className="text-[10px] text-slate-500 ml-auto">{new Date(event.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      </div>
      {event.payload && Object.keys(event.payload).length > 0 && (
        <pre className="text-[10.5px] text-slate-300 whitespace-pre-wrap break-words leading-snug">
{JSON.stringify(event.payload, null, 2)}
        </pre>
      )}
    </div>
  );
}

function IntegrationSnippet({ id, host, patient, theme }: { id: WidgetId; host: HostSurface; patient: string; theme: HostTheme }) {
  const themeName = theme === LILLY_THEME ? "LILLY_THEME" : theme === NOVO_THEME ? "NOVO_THEME" : "HABITNU_THEME";
  const componentName = id.split("-").map(s => s[0].toUpperCase() + s.slice(1)).join("") + "Widget";

  const rnCode = `// React Native
import { View } from "react-native";
import { ${componentName} } from "@habitnu/widgets";
import { ${themeName} } from "@habitnu/widgets/theme";

<View style={styles.widgetSlot}>
  <${componentName}
    host="react-native"
    theme={${themeName}}
    patient={{ patientId: "${patient}", firstName: "…" }}
    onEvent={(e) => analytics.track(e.type, e.payload)}
  />
</View>`;

  const flutterCode = `// Flutter (via WebView bridge)
final widget = HabitnuWidget(
  id: WidgetId.${id.replace(/-/g, "_")},
  theme: HabitnuTheme.${themeName.split("_")[0].toLowerCase()},
  patient: PatientContext(patientId: "${patient}", firstName: "…"),
  onEvent: (event) => analytics.track(event.type, event.payload),
);`;

  const iosCode = `// iOS (SwiftUI wrapper)
HabitnuWidgetView(
  id: .${id.replace(/-/g, "")},
  theme: .${themeName.split("_")[0].toLowerCase()},
  patient: PatientContext(id: "${patient}", firstName: "…"),
  onEvent: { event in Analytics.track(event.type, event.payload) }
)`;

  const androidCode = `// Android (Compose wrapper)
HabitnuWidget(
  id = WidgetId.${id.replace(/-/g, "_")},
  theme = ${themeName.split("_")[0]}Theme,
  patient = PatientContext(id = "${patient}", firstName = "…"),
  onEvent = { event -> analytics.track(event.type, event.payload) }
)`;

  const code =
    host === "react-native"   ? rnCode :
    host === "flutter"        ? flutterCode :
    host === "ios-native"     ? iosCode : androidCode;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Integration snippet</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{host}</span>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 text-[11.5px] text-slate-100 overflow-x-auto leading-relaxed" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>{code}</pre>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
      {children}
    </div>
  );
}

function CategoryDot({ category }: { category: string }) {
  const tint: Record<string, string> = {
    behavior:   "#8B5CF6",
    treatment:  "#F59E0B",
    engagement: "#0EA5E9",
    access:     "#EC4899",
    clinical:   "#10B981",
  };
  return <span className="w-2 h-2 rounded-full" style={{ background: tint[category] ?? "#94A3B8" }} />;
}

function ManifestRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24 shrink-0">{k}</dt>
      <dd className="text-[11.5px] font-black text-slate-800 truncate">{v}</dd>
    </div>
  );
}
