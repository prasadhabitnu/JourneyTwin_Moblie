import { ReactNode } from "react";
import { HostTheme } from "../../lib/widgetContract";

/**
 * WidgetShell — shared visual chrome every widget renders inside.
 * Enforces the host theme (border radius, surface color, font-family) and
 * gives the /widgets catalog a consistent frame around each widget.
 *
 * On production RN/native, only the *inside* of the shell renders — the shell
 * itself becomes the host <View>.
 */
export function WidgetShell({
  theme,
  gradient,
  eyebrow,
  eyebrowColor,
  title,
  subtitle,
  headerRight,
  footerNote,
  children,
}: {
  theme: HostTheme;
  gradient?: string;
  eyebrow?: string;
  eyebrowColor?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  headerRight?: ReactNode;
  footerNote?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="shadow-lg overflow-hidden"
      style={{
        background: gradient ?? theme.primary,
        borderRadius: theme.radius + 2,
        padding: 2,
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        className="overflow-hidden"
        style={{
          background: theme.surface,
          borderRadius: theme.radius,
        }}
      >
        {(title || eyebrow) && (
          <div className="px-5 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {eyebrow && (
                  <div
                    className="text-[10px] font-black uppercase tracking-[0.14em] mb-1"
                    style={{ color: eyebrowColor ?? theme.primary }}
                  >
                    {eyebrow}
                  </div>
                )}
                {title && (
                  <div
                    className="text-[20px] font-black leading-tight"
                    style={{ color: theme.text }}
                  >
                    {title}
                  </div>
                )}
                {subtitle && (
                  <div className="text-[12px] text-slate-500 font-medium mt-0.5">{subtitle}</div>
                )}
              </div>
              {headerRight && <div className="shrink-0">{headerRight}</div>}
            </div>
          </div>
        )}

        <div className="p-5">{children}</div>

        {footerNote && (
          <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-500 font-medium uppercase tracking-widest">
            {footerNote}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ChoiceRow — the three-choice CTA primitive used across widgets.
 * Enforces the anti-shame pattern (primary + secondary + tertiary "Not now").
 */
export function ChoiceRow({
  primary,
  secondary,
  tertiary,
  theme,
  onPrimary,
  onSecondary,
  onTertiary,
}: {
  primary: string;
  secondary?: string;
  tertiary: string;
  theme: HostTheme;
  onPrimary: () => void;
  onSecondary?: () => void;
  onTertiary: () => void;
}) {
  return (
    <div className={`grid grid-cols-1 ${secondary ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-2`}>
      <button
        onClick={onPrimary}
        className="px-4 py-3 rounded-xl text-white text-[13px] font-black tracking-wide shadow-md hover:brightness-110 transition"
        style={{
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${adjustHex(theme.primary, -18)} 100%)`,
        }}
      >
        {primary}
      </button>
      {secondary && (
        <button
          onClick={onSecondary}
          className="px-4 py-3 rounded-xl text-[13px] font-black tracking-wide border-2 bg-white transition"
          style={{
            color: theme.primary,
            borderColor: `${theme.primary}55`,
          }}
        >
          {secondary}
        </button>
      )}
      <button
        onClick={onTertiary}
        className="px-4 py-3 rounded-xl text-[13px] font-black tracking-wide border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition"
      >
        {tertiary}
      </button>
    </div>
  );
}

/** Small helper — dim/brighten a hex color by delta (%). */
function adjustHex(hex: string, delta: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const t = (v: number) => Math.max(0, Math.min(255, v + Math.round((delta / 100) * 255)));
  const h = (v: number) => t(v).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Small tinted chip used across widgets for status pills. */
export function Chip({
  label,
  tone = "indigo",
}: {
  label: string;
  tone?: "indigo" | "emerald" | "amber" | "rose" | "slate";
}) {
  const t: Record<string, { bg: string; fg: string; bd: string }> = {
    indigo:  { bg: "#EEF2FF", fg: "#4338CA", bd: "#C7D2FE" },
    emerald: { bg: "#ECFDF5", fg: "#047857", bd: "#A7F3D0" },
    amber:   { bg: "#FEF3C7", fg: "#92400E", bd: "#FDE68A" },
    rose:    { bg: "#FEF2F2", fg: "#B91C1C", bd: "#FECACA" },
    slate:   { bg: "#F1F5F9", fg: "#334155", bd: "#CBD5E1" },
  };
  const c = t[tone];
  return (
    <span
      className="inline-flex items-center text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border"
      style={{ background: c.bg, color: c.fg, borderColor: c.bd }}
    >
      {label}
    </span>
  );
}
