import { Home, Users, Compass, Radio, User } from "lucide-react";
import HabitnuLogo from "../journey/HabitnuLogo";
import OutboxButton from "./OutboxButton";

interface Props {
  onOpenSettings?: () => void;
}

/**
 * Top nav for /coach route. Mirrors the member nav shape but with coach-side tabs.
 * Tabs: Home · Panel · Journey · Broadcasts · Profile — Journey active.
 */
export default function CoachTopNav({ onOpenSettings }: Props) {
  const items = [
    { key: "home",       label: "Home",       Icon: Home,   href: "/" },
    { key: "panel",      label: "Panel",      Icon: Users,  href: "https://app-dashboard.habitnu.net/app/dashboard", external: true },
    { key: "journey",    label: "Journey",    Icon: Compass, href: "/coach", active: true },
    { key: "broadcasts", label: "Broadcasts", Icon: Radio,  href: "/coach" },
    { key: "profile",    label: "Profile",    Icon: User,   href: "/" },
  ];

  return (
    <div className="w-full bg-white/90 backdrop-blur border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2">
        <div className="flex items-center gap-2 pr-4 border-r border-slate-100 mr-2">
          <HabitnuLogo />
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
            Coach
          </span>
        </div>

        <nav className="flex items-center gap-1 flex-1 justify-center">
          {items.map(it => (
            <a
              key={it.key}
              href={it.href}
              className={
                "flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-black transition " +
                (it.active
                  ? "bg-orange-100 text-orange-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")
              }
            >
              {it.active ? (
                <span className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center shadow">
                  <it.Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
              ) : (
                <it.Icon className="w-4 h-4" strokeWidth={2} />
              )}
              <span>{it.label}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          <OutboxButton />
          <div className="text-right leading-tight">
            <div className="text-[11px] font-black text-slate-800">Maya Patel</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">CDCES · 428 in panel</div>
          </div>
          <div className="w-9 h-9 rounded-full text-white font-black flex items-center justify-center shadow"
               style={{ background: "linear-gradient(135deg, #EF5C3E 0%, #B91C1C 100%)" }}>
            MP
          </div>
          {onOpenSettings && (
            <button onClick={onOpenSettings}
                    title="Settings"
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
