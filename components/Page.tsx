import { ReactNode } from "react";
import clsx from "clsx";

export function PageHeader({
  eyebrow, title, subtitle, actions,
}: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="px-8 pt-7 pb-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          {eyebrow && (
            <div className="text-[11px] font-bold tracking-widest text-lilly-red mb-1">{eyebrow}</div>
          )}
          <h1 className="text-2xl md:text-[28px] font-bold text-lilly-navy leading-tight">{title}</h1>
          {subtitle && <p className="text-[13.5px] text-lilly-grey mt-1.5 max-w-3xl leading-relaxed">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({
  children, className, padding = "p-5",
}: { children: ReactNode; className?: string; padding?: string }) {
  return (
    <div className={clsx("bg-white border border-lilly-line rounded-xl shadow-card", padding, className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="text-sm font-bold text-lilly-navy">{title}</div>
        {subtitle && <div className="text-[12px] text-lilly-grey mt-0.5">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label, value, delta, deltaTone = "up", sub, accent,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "up" | "down" | "flat";
  sub?: string;
  accent?: "red" | "navy" | "green" | "amber";
}) {
  const deltaColor =
    deltaTone === "up" ? "text-emerald-600 bg-emerald-50"
      : deltaTone === "down" ? "text-rose-600 bg-rose-50"
        : "text-slate-600 bg-slate-100";
  const stripeColor = accent === "red" ? "bg-lilly-red"
    : accent === "navy" ? "bg-lilly-navy"
      : accent === "green" ? "bg-emerald-500"
        : accent === "amber" ? "bg-amber-500"
          : "bg-lilly-line";
  return (
    <div className="relative bg-white border border-lilly-line rounded-xl shadow-card overflow-hidden">
      {accent && <span className={clsx("absolute top-0 left-0 right-0 h-1", stripeColor)} />}
      <div className="p-5 pt-6">
        <div className="text-[11px] font-semibold tracking-wider text-lilly-grey uppercase">{label}</div>
        <div className="mt-2 flex items-end gap-3">
          <div className="text-[28px] font-bold text-lilly-navy leading-none">{value}</div>
          {delta && (
            <span className={clsx("text-[11px] font-semibold px-2 py-0.5 rounded-md", deltaColor)}>
              {delta}
            </span>
          )}
        </div>
        {sub && <div className="text-[12px] text-lilly-grey mt-2">{sub}</div>}
      </div>
    </div>
  );
}

export function Badge({ children, color = "navy", size = "sm" }: { children: ReactNode; color?: "navy" | "red" | "green" | "amber" | "rose" | "slate" | string; size?: "sm" | "xs" }) {
  const map: Record<string, string> = {
    navy: "bg-lilly-navy/10 text-lilly-navy",
    red: "bg-lilly-redLight text-lilly-redDark",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };
  const cls = map[color as string] ?? color;
  const pad = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]";
  return <span className={clsx("inline-flex items-center font-semibold rounded-md", cls, pad)}>{children}</span>;
}

export function Section({ title, subtitle, children, action }: { title: string; subtitle?: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div>
      <div className="flex items-end justify-between mb-3 px-1">
        <div>
          <div className="text-[15px] font-bold text-lilly-navy">{title}</div>
          {subtitle && <div className="text-[12px] text-lilly-grey">{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
