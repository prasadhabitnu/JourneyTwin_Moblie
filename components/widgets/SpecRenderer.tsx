import { WidgetShell, Chip as UIChip } from "./WidgetShell";
import { HostTheme, WidgetEventHandler } from "../../lib/widgetContract";
import {
  WidgetSpec, SpecNode, ToneKey,
  ShellNode, TextNode, ColumnNode, RowNode, GridNode, ChipNode,
  TimelineNode, StatGridNode, QuoteNode, MessageNode, ChoiceRowNode,
  ContextTilesNode, FactRowsNode, ChartNode,
} from "../../lib/widgetSpec";

/**
 * SpecRenderer — takes a WidgetSpec (JSON) and renders it using primitive
 * components. Never inspects widgetId; the same renderer handles every widget.
 * This is the client half of the SDUI loop.
 */
export default function SpecRenderer({
  spec,
  theme,
  onEvent,
  patientId,
}: {
  spec: WidgetSpec;
  theme: HostTheme;
  onEvent: WidgetEventHandler;
  patientId: string;
}) {
  const fire = (actionId: string) => {
    const meta = spec.actions[actionId];
    if (!meta) return;
    onEvent({
      type: meta.emit,
      widgetId: spec.widgetId,
      at: new Date().toISOString(),
      patientId,
      payload: { actionId, variant: spec.variant, ...(meta.payload ?? {}) },
    });
  };
  return renderNode(spec.layout, { theme, fire, actions: spec.actions });
}

interface RenderCtx {
  theme: HostTheme;
  fire: (actionId: string) => void;
  actions: WidgetSpec["actions"];
}

// -----------------------------------------------------------------------------

function renderNode(node: SpecNode, ctx: RenderCtx): JSX.Element {
  switch (node.type) {
    case "Shell":        return renderShell(node, ctx);
    case "Column":       return renderColumn(node, ctx);
    case "Row":          return renderRow(node, ctx);
    case "Grid":         return renderGrid(node, ctx);
    case "Text":         return renderText(node);
    case "Chip":         return renderChip(node);
    case "Divider":      return <div className="h-px bg-slate-100 my-1" />;
    case "Timeline":     return renderTimeline(node, ctx);
    case "StatGrid":     return renderStatGrid(node);
    case "Quote":        return renderQuote(node);
    case "Message":      return renderMessage(node, ctx);
    case "ChoiceRow":    return renderChoiceRow(node, ctx);
    case "ContextTiles": return renderContextTiles(node);
    case "FactRows":     return renderFactRows(node);
    case "Chart":        return renderChart(node, ctx);
  }
}

// -----------------------------------------------------------------------------
// Tone → color mapping (uses host theme.primary for "primary")
// -----------------------------------------------------------------------------

function toneColors(tone: ToneKey | undefined, theme: HostTheme): { bg: string; fg: string; bd: string } {
  switch (tone) {
    case "success": return { bg: "#ECFDF5", fg: "#047857", bd: "#A7F3D0" };
    case "warning": return { bg: "#FFFBEB", fg: "#B45309", bd: "#FDE68A" };
    case "danger":  return { bg: "#FEF2F2", fg: "#B91C1C", bd: "#FECACA" };
    case "info":    return { bg: "#EEF2FF", fg: "#4338CA", bd: "#C7D2FE" };
    case "neutral": return { bg: "#F1F5F9", fg: "#334155", bd: "#CBD5E1" };
    case "primary":
    default:        return { bg: hex(theme.primary, 0.10), fg: theme.primary, bd: hex(theme.primary, 0.30) };
  }
}
function hex(hex: string, alpha: number) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// -----------------------------------------------------------------------------
// Node renderers
// -----------------------------------------------------------------------------

function renderShell(n: ShellNode, ctx: RenderCtx) {
  const grad =
    n.gradient === "mirror"  ? `linear-gradient(135deg, ${ctx.theme.primary} 0%, #A855F7 55%, #EC4899 100%)` :
    n.gradient === "warning" ? `linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)` :
    n.gradient === "danger"  ? `linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)` :
    undefined;

  return (
    <WidgetShell
      theme={ctx.theme}
      gradient={grad}
      eyebrow={n.eyebrow}
      eyebrowColor={n.eyebrowTone ? toneColors(n.eyebrowTone, ctx.theme).fg : undefined}
      title={n.title}
      subtitle={n.subtitle}
      headerRight={n.headerRight?.chip ? <UIChip label={n.headerRight.chip.label} tone={mapChipTone(n.headerRight.chip.tone)} /> : undefined}
      footerNote={n.footerNote}
    >
      {renderNode(n.child, ctx)}
    </WidgetShell>
  );
}
function mapChipTone(t: ToneKey): "indigo" | "emerald" | "amber" | "rose" | "slate" {
  return t === "success" ? "emerald" : t === "warning" ? "amber" : t === "danger" ? "rose" : t === "neutral" ? "slate" : "indigo";
}

function renderColumn(n: ColumnNode, ctx: RenderCtx) {
  const gapClass = n.gap === 2 ? "space-y-2" : n.gap === 4 ? "space-y-4" : "space-y-3";
  return <div className={gapClass}>{n.children.map((c, i) => <div key={i}>{renderNode(c, ctx)}</div>)}</div>;
}
function renderRow(n: RowNode, ctx: RenderCtx) {
  const gapClass = n.gap === 2 ? "gap-2" : n.gap === 4 ? "gap-4" : "gap-3";
  return <div className={`flex flex-wrap items-start ${gapClass}`}>{n.children.map((c, i) => <div key={i} className="min-w-0 flex-1">{renderNode(c, ctx)}</div>)}</div>;
}
function renderGrid(n: GridNode, ctx: RenderCtx) {
  const cls = n.cols === 2 ? "md:grid-cols-2" : n.cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4";
  return <div className={`grid grid-cols-1 ${cls} gap-4`}>{n.children.map((c, i) => <div key={i}>{renderNode(c, ctx)}</div>)}</div>;
}

function renderText(n: TextNode) {
  const size = n.size === "xs" ? "text-[11px]" : n.size === "sm" ? "text-[12px]" : n.size === "lg" ? "text-[15px]" : "text-[13px]";
  const color = n.tone ? "" : "text-slate-800";
  const style = n.tone === "success" ? { color: "#047857" } :
                n.tone === "warning" ? { color: "#B45309" } :
                n.tone === "danger"  ? { color: "#B91C1C" } :
                n.tone === "info"    ? { color: "#4338CA" } :
                n.tone === "neutral" ? { color: "#334155" } : undefined;
  const weight = n.bold ? "font-black" : "font-medium";
  const italic = n.italic ? "italic" : "";
  return <div className={`${size} ${color} ${weight} ${italic} leading-snug`} style={style}>{n.body}</div>;
}

function renderChip(n: ChipNode) {
  return <UIChip label={n.label} tone={mapChipTone(n.tone)} />;
}

function renderTimeline(n: TimelineNode, ctx: RenderCtx) {
  return (
    <div>
      {n.eyebrow && <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">{n.eyebrow}</div>}
      <div className="relative pl-5">
        <span className="absolute left-1.5 top-1 bottom-1 w-[2px] rounded"
              style={{ background: `linear-gradient(180deg, ${ctx.theme.primary}66, #C4B5FD 50%, #F9A8D488)` }} />
        {n.items.map((t, i) => (
          <div key={i} className="relative flex items-start gap-3 pb-3 last:pb-0">
            <span className="absolute top-1.5 w-3 h-3 rounded-full ring-2 ring-white"
                  style={{ left: -15, background: i === 0 ? ctx.theme.primary : i === n.items.length - 1 ? "#EC4899" : "#8B5CF6" }} />
            <span className="text-xs font-black tabular-nums shrink-0 pt-0.5 whitespace-nowrap" style={{ color: ctx.theme.primary, minWidth: 72 }}>{t.time}</span>
            {t.icon && <span className="text-base leading-none shrink-0 pt-0.5">{t.icon}</span>}
            <span className="text-[13px] text-slate-800 font-bold leading-snug">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderStatGrid(n: StatGridNode) {
  const box = n.tone === "success"
    ? { bg: "linear-gradient(135deg, #ECFDF5 0%, #F0FDFA 100%)", bd: "#A7F3D0", fg: "#047857" }
    : n.tone === "warning"
    ? { bg: "#FFFBEB", bd: "#FDE68A", fg: "#B45309" }
    : n.tone === "danger"
    ? { bg: "#FEF2F2", bd: "#FECACA", fg: "#B91C1C" }
    : { bg: "#F8FAFC", bd: "#E2E8F0", fg: "#334155" };
  return (
    <div className="rounded-2xl p-3.5 border shadow-sm" style={{ borderColor: box.bd, background: box.bg }}>
      {n.eyebrow && <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: box.fg }}>{n.eyebrow}</div>}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {n.items.map((it, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: it.tone === "danger" ? "#B91C1C" : box.fg }}>{it.label}</span>
            <span className="text-lg font-black tabular-nums" style={{ color: it.tone === "danger" ? "#B91C1C" : box.fg }}>{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderQuote(n: QuoteNode) {
  const box = n.tone === "warning"
    ? { bg: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)", bd: "#FED7AA", fg: "#B45309" }
    : { bg: "#F8FAFC", bd: "#E2E8F0", fg: "#334155" };
  return (
    <div className="rounded-2xl p-3.5 border shadow-sm" style={{ borderColor: box.bd, background: box.bg }}>
      {n.eyebrow && <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: box.fg }}>{n.eyebrow}</div>}
      <div className="text-[14px] italic leading-snug text-slate-800">{n.body}</div>
    </div>
  );
}

function renderMessage(n: MessageNode, ctx: RenderCtx) {
  const t = toneColors(n.tone, ctx.theme);
  return (
    <div className="rounded-xl p-3 border shadow-sm" style={{ background: t.bg, borderColor: t.bd }}>
      <div className="flex items-start gap-2.5">
        <span className="w-8 h-8 rounded-full grid place-items-center shrink-0"
              style={{ background: n.from === "coach"
                ? "linear-gradient(135deg, #EF5C3E, #B91C1C)"
                : "radial-gradient(circle at 35% 30%, #FDE68A, #F59E0B 50%, #B45309)" }}>
          <span className="text-[10px] font-black text-slate-900">{n.from === "coach" ? "M" : "Nu"}</span>
        </span>
        <div className="flex-1 min-w-0">
          {n.meta && (
            <div className="flex flex-wrap items-center gap-1 mb-1">
              {n.meta.area       && <UIChip label={n.meta.area} tone="indigo" />}
              {n.meta.ruleId     && <UIChip label={`Rule ${n.meta.ruleId}`} tone="slate" />}
              {n.meta.confidence && <UIChip label={`${n.meta.confidence} conf`} tone="emerald" />}
            </div>
          )}
          <div className="text-[13px] text-slate-800 leading-snug font-medium">{n.body}</div>
        </div>
      </div>
    </div>
  );
}

function renderChoiceRow(n: ChoiceRowNode, ctx: RenderCtx) {
  const has3 = !!n.secondary;
  return (
    <div className={`grid grid-cols-1 ${has3 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-2`}>
      <button
        onClick={() => ctx.fire(n.primary.actionId)}
        className="px-4 py-3 rounded-xl text-white text-[13px] font-black tracking-wide shadow-md hover:brightness-110 transition"
        style={{ background: `linear-gradient(135deg, ${ctx.theme.primary} 0%, ${dim(ctx.theme.primary, -18)} 100%)` }}
      >
        {n.primary.label}
      </button>
      {n.secondary && (
        <button
          onClick={() => ctx.fire(n.secondary!.actionId)}
          className="px-4 py-3 rounded-xl text-[13px] font-black tracking-wide border-2 bg-white transition"
          style={{ color: ctx.theme.primary, borderColor: `${ctx.theme.primary}55` }}
        >
          {n.secondary.label}
        </button>
      )}
      <button
        onClick={() => ctx.fire(n.tertiary.actionId)}
        className="px-4 py-3 rounded-xl text-[13px] font-black tracking-wide border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition"
      >
        {n.tertiary.label}
      </button>
    </div>
  );
}
function dim(hex: string, delta: number) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  const t = (v: number) => Math.max(0, Math.min(255, v + Math.round((delta / 100) * 255)));
  const h = (v: number) => t(v).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function renderContextTiles(n: ContextTilesNode) {
  return (
    <div>
      {n.eyebrow && <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{n.eyebrow}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {n.items.map((it, i) => {
          const t = it.tone === "warning" ? { bg: "#FFFBEB", bd: "#FDE68A", fg: "#B45309" }
                  : it.tone === "info"    ? { bg: "#EEF2FF", bd: "#C7D2FE", fg: "#4338CA" }
                  : it.tone === "success" ? { bg: "#ECFDF5", bd: "#A7F3D0", fg: "#065F46" }
                  : { bg: "#F8FAFC", bd: "#E2E8F0", fg: "#334155" };
          return (
            <div key={i} className="rounded-xl p-3 border shadow-sm" style={{ background: t.bg, borderColor: t.bd }}>
              <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: t.fg }}>{it.eyebrow}</div>
              <div className="text-[12px] font-medium text-slate-700 leading-snug">{it.body}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderFactRows(n: FactRowsNode) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden">
      {n.items.map((f, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 last:border-b-0">
          {f.icon && <span className="text-lg leading-none shrink-0">{f.icon}</span>}
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 w-32 shrink-0">{f.label}</span>
          <span className="text-[13px] font-bold text-slate-800 flex-1 min-w-0"
                style={f.tone === "warning" ? { color: "#B45309" } : f.tone === "danger" ? { color: "#B91C1C" } : undefined}>
            {f.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function renderChart(n: ChartNode, ctx: RenderCtx) {
  const w = 640, h = 180, padL = 34, padR = 12, padT = 12, padB = 24;
  const len = n.series[0].values.length;
  const xAt = (i: number) => padL + (i / (len - 1)) * (w - padL - padR);
  const yAt = (v: number) => padT + (1 - (v - n.yMin) / (n.yMax - n.yMin)) * (h - padT - padB);
  const color = (c: ToneKey) => c === "success" ? "#10B981" : c === "danger" ? "#DC2626" : c === "warning" ? "#F59E0B" : c === "info" ? ctx.theme.primary : "#64748B";
  const path = (arr: number[]) => arr.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  const areaPath = (arr: number[]) => `M ${xAt(0)},${yAt(n.yMin)} L ${arr.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ")} L ${xAt(len - 1)},${yAt(n.yMin)} Z`;

  return (
    <div>
      {n.eyebrow && <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{n.eyebrow}</div>}
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {n.targetBand && (
          <>
            <rect x={padL} y={yAt(n.targetBand.max)} width={w - padL - padR} height={yAt(n.targetBand.min) - yAt(n.targetBand.max)} fill="#10B98118" />
            {n.targetBand.label && (
              <text x={padL + 6} y={yAt(n.targetBand.max) - 4} fontSize={9} fill="#065F46" fontWeight={800}>
                {n.targetBand.label} ({n.targetBand.min}-{n.targetBand.max})
              </text>
            )}
          </>
        )}
        {[100, 155, 200].filter(v => v >= n.yMin && v <= n.yMax).map(v => (
          <g key={v}>
            <line x1={padL} y1={yAt(v)} x2={w - padR} y2={yAt(v)} stroke="#E5E7EB" strokeDasharray="3 3" />
            <text x={padL - 4} y={yAt(v) + 3} textAnchor="end" fontSize={9} fill="#94A3B8" fontWeight={700}>{v}</text>
          </g>
        ))}
        {n.series.map((s, si) => (
          <g key={si}>
            <path d={areaPath(s.values)} fill={color(s.color)} opacity={0.12} />
            <polyline points={path(s.values)} fill="none" stroke={color(s.color)} strokeWidth={2.5} strokeDasharray={s.dashed ? "4 4" : undefined} />
            {s.marker && (
              <>
                <circle cx={xAt(s.marker.at)} cy={yAt(s.values[s.marker.at])} r={4.5} fill={color(s.color)} stroke="#FFF" strokeWidth={2} />
                <text x={xAt(s.marker.at) + 8} y={yAt(s.values[s.marker.at]) - 6} fontSize={11} fontWeight={800} fill={color(s.color)}>{s.marker.label}</text>
              </>
            )}
          </g>
        ))}
        {n.xLabels.map((t, i) => (
          <text key={t} x={padL + (i / (n.xLabels.length - 1)) * (w - padL - padR)} y={h - 6} textAnchor="middle" fontSize={9} fill="#6B7280" fontWeight={700}>{t}</text>
        ))}
      </svg>
    </div>
  );
}
