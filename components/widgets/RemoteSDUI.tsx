import { useCallback, useEffect, useState } from "react";
import {
  DEMO_PATIENTS, HostSurface, HostTheme, LILLY_THEME, NOVO_THEME, HABITNU_THEME,
  WidgetEvent, WIDGETS, WidgetId,
} from "../../lib/widgetContract";
import { WidgetSpec } from "../../lib/widgetSpec";
import SpecRenderer from "./SpecRenderer";

/**
 * Remote SDUI mode — shows the full server-driven UI loop live:
 *   1. Client builds a query (patient + context signals + optional force)
 *   2. Fetches GET /api/widgets/next
 *   3. Displays the raw JSON WidgetSpec response
 *   4. SpecRenderer renders the spec inside a mock RN host frame
 *
 * This is the demo for Lilly's integration team: "here's the JSON that came
 * from Fathom's DB, here's how the phone rendered it, and it's the same
 * renderer for every widget."
 */
export default function RemoteSDUI({
  host, theme, onEvent,
}: {
  host: HostSurface; theme: HostTheme;
  onEvent: (e: WidgetEvent) => void;
}) {
  const [patientId, setPatientId] = useState("sarah-reeves");
  const [tenant, setTenant] = useState(themeToTenant(theme));
  const [force, setForce] = useState<WidgetId | "">("");
  const [preset, setPreset] = useState<PresetId>("nausea-morning");
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<WidgetSpec | null>(null);
  const [ranked, setRanked] = useState<any[]>([]);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState("");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => setTenant(themeToTenant(theme)), [theme]);

  const fetchSpec = useCallback(async () => {
    setLoading(true);
    setErrMsg(null);
    const q = new URLSearchParams();
    q.set("patientId", patientId);
    q.set("tenant", tenant);
    if (force) q.set("force", force);
    Object.entries(PRESETS[preset].query).forEach(([k, v]) => q.set(k, String(v)));

    const url = `/api/widgets/next?${q.toString()}`;
    setLastUrl(url);
    const t0 = performance.now();
    try {
      const r = await fetch(url);
      const j = await r.json();
      setLatencyMs(Math.round(performance.now() - t0));
      setSpec(j.spec);
      setRanked(j.ranked ?? []);
      if (!j.spec) setErrMsg(j.reason ?? "no spec returned");
    } catch (e: any) {
      setErrMsg(String(e?.message ?? e));
      setSpec(null);
    } finally {
      setLoading(false);
    }
  }, [patientId, tenant, force, preset]);

  useEffect(() => { fetchSpec(); }, [fetchSpec]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_420px] gap-6">
      {/* LEFT — request controls */}
      <aside className="space-y-3">
        <Section label="Request controls">
          <Row label="Patient">
            <select value={patientId} onChange={e => setPatientId(e.target.value)}
                    className="w-full text-[12px] font-black text-slate-800 border border-slate-200 rounded-md px-2 py-1.5 bg-white">
              {Object.values(DEMO_PATIENTS).map(p => (
                <option key={p.patientId} value={p.patientId}>{p.firstName} · {p.medication?.name}</option>
              ))}
            </select>
          </Row>
          <Row label="Tenant">
            <div className="text-[11px] font-black text-slate-700 px-2 py-1 rounded-md bg-slate-100 inline-block">
              {tenant}
            </div>
          </Row>
          <Row label="Context preset">
            <select value={preset} onChange={e => setPreset(e.target.value as PresetId)}
                    className="w-full text-[12px] font-black text-slate-800 border border-slate-200 rounded-md px-2 py-1.5 bg-white">
              {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Row>
          <Row label="Force widget (debug)">
            <select value={force} onChange={e => setForce(e.target.value as any)}
                    className="w-full text-[12px] font-black text-slate-800 border border-slate-200 rounded-md px-2 py-1.5 bg-white">
              <option value="">Let selector decide</option>
              {WIDGETS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </Row>
          <button onClick={fetchSpec} disabled={loading}
                  className="w-full mt-2 px-3 py-2 rounded-lg text-white text-[12px] font-black uppercase tracking-widest shadow"
                  style={{ background: theme.primary, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Fetching…" : "Refetch spec"}
          </button>
        </Section>

        <Section label="Ranked candidates">
          <div className="space-y-1.5">
            {ranked.map((r, i) => (
              <div key={r.widgetId} className={"rounded-lg border px-2 py-1.5 " +
                (i === 0 && r.score > 0 ? "border-emerald-400 bg-emerald-50" : r.score > 0 ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50/70 opacity-70")}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black tabular-nums w-6 text-slate-500">#{i + 1}</span>
                  <span className="text-[11px] font-black text-slate-800 flex-1 truncate">
                    {WIDGETS.find(w => w.id === r.widgetId)?.name ?? r.widgetId}
                  </span>
                  <span className="text-[10px] font-black tabular-nums text-slate-600">{r.score}</span>
                </div>
                {r.guardrails?.length > 0 && (
                  <div className="text-[9px] text-rose-700 mt-0.5 leading-snug">✕ {r.guardrails[0]}</div>
                )}
              </div>
            ))}
          </div>
        </Section>
      </aside>

      {/* CENTER — request URL + JSON response */}
      <section className="space-y-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
            REQUEST · GET
          </div>
          <div className="mt-1 rounded-lg bg-slate-950 text-emerald-300 px-3 py-2 text-[11.5px] font-mono overflow-x-auto whitespace-nowrap">
            {lastUrl || "(none yet)"}
          </div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
            <span>Response · <span className="text-emerald-600">200 OK</span></span>
            {latencyMs !== null && <span>{latencyMs} ms</span>}
            {spec && <span>ttl {spec.meta.ttlSec}s</span>}
            {spec && <span>{spec.widgetId} · {spec.variant}</span>}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-950 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">JSON spec (from DB)</span>
            <button onClick={() => spec && navigator.clipboard.writeText(JSON.stringify(spec, null, 2))}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">
              Copy
            </button>
          </div>
          <pre className="p-3 text-[10.5px] text-slate-100 max-h-[560px] overflow-auto leading-relaxed"
               style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
{spec ? JSON.stringify(spec, null, 2) : errMsg ? `// ${errMsg}` : "// waiting..."}
          </pre>
        </div>
      </section>

      {/* RIGHT — rendered widget in phone frame */}
      <aside className="space-y-3">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
          RENDERED · same spec, in a {host === "react-native" ? "React Native <View>" : host}
        </div>

        {spec ? (
          <PhoneFrame host={host} theme={theme}>
            <SpecRenderer spec={spec} theme={theme} onEvent={onEvent} patientId={patientId} />
          </PhoneFrame>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">No widget qualifies</div>
            <div className="text-[13px] text-slate-600 font-medium">{errMsg ?? "Waiting for spec"}</div>
          </div>
        )}

        {spec?.meta.reasons && (
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1.5">Selector reasons</div>
            <ul className="space-y-0.5">
              {spec.meta.reasons.map((r, i) => (
                <li key={i} className="text-[10.5px] text-slate-600 font-medium leading-snug">· {r}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

// -----------------------------------------------------------------------------

type PresetId = "healthy-monday" | "nausea-morning" | "post-spike" | "silent-9days" | "refill-critical";
const PRESETS: Record<PresetId, { label: string; query: Record<string, string | number> }> = {
  "nausea-morning":   { label: "Nausea morning · Sarah", query: { hour: 9,  dayOfWeek: 2, symptoms: "nausea,fatigue", severity: "moderate" } },
  "healthy-monday":   { label: "Fresh Monday AM",         query: { hour: 8,  dayOfWeek: 1, symptoms: "", severity: "none" } },
  "post-spike":       { label: "Post-lunch spike 214",    query: { hour: 14, dayOfWeek: 3, symptoms: "", severity: "none", lastGlucosePeak: 214 } },
  "silent-9days":     { label: "9 days silent · Diane",   query: { hour: 12, dayOfWeek: 4, daysSinceLog: 9, symptoms: "" } },
  "refill-critical":  { label: "Refill critical · 3 days",query: { hour: 11, dayOfWeek: 3, medDays: 3, paStatus: "pending", refillStatus: "blocked" } },
};

function themeToTenant(theme: HostTheme): string {
  return theme === LILLY_THEME ? "lilly-health" : theme === NOVO_THEME ? "novo-companion" : "habitnu";
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-2">{label}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      {children}
    </div>
  );
}

function PhoneFrame({ host, theme, children }: { host: HostSurface; theme: HostTheme; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
      <div className="mx-auto" style={{ maxWidth: 420 }}>
        <div className="rounded-t-[36px] pt-3 pb-1 flex items-center justify-center" style={{ background: theme.primary }}>
          <span className="w-16 h-1 rounded-full bg-white/40" />
        </div>
        <div className="px-3 py-2.5 flex items-center justify-between bg-white border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg grid place-items-center text-white font-black text-[10px]" style={{ background: theme.primary }}>
              {theme === LILLY_THEME ? "L" : theme === NOVO_THEME ? "N" : "H"}
            </span>
            <div className="text-[11px] font-black text-slate-800">{theme === LILLY_THEME ? "Lilly Health" : theme === NOVO_THEME ? "Novo Companion" : "Habitnu"}</div>
          </div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{host}</div>
        </div>
        <div className="px-3 pt-3 pb-4 bg-slate-50/60">
          <div className="rounded-xl border-2 border-dashed border-indigo-200 p-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
