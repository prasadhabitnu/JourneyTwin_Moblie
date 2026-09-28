import { Home, TrendingUp, Compass, Users, User } from "lucide-react";
import HabitnuLogo from "./HabitnuLogo";

interface Props {
  muted?: boolean;
  speaking?: boolean;
  onToggleMute?: () => void;
  onOpenSettings?: () => void;
}

/**
 * Top nav bar for the /journey web view.
 * Mirrors the mobile app's bottom-tab pattern but placed at top for web (per Prasad).
 * 5 tabs: Home, Dashboard, Path, Community, Profile - Path is active.
 * The chat bubble icon opens the Talk to Nu drawer.
 */
export default function JourneyTopNav({ muted = true, speaking = false, onToggleMute, onOpenSettings }: Props) {
  const items = [
    { key: "home",       label: "Home",       Icon: Home,        href: "/" },
    { key: "dashboard",  label: "Dashboard",  Icon: TrendingUp,  href: "https://app-dashboard.habitnu.net/app", external: true },
    { key: "path",       label: "Path",       Icon: Compass,     href: "/journey", active: true },
    { key: "community",  label: "Community",  Icon: Users,       href: "/" },
    { key: "profile",    label: "Profile",    Icon: User,        href: "/" },
  ];

  return (
    <div className="w-full bg-white/90 backdrop-blur border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2">
        {/* Brand mark on the left */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-100 mr-2">
          <HabitnuLogo />
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1 flex-1 justify-center">
          {items.map(it => (
            <a
              key={it.key}
              href={it.href}
              className={
                "flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-black transition " +
                (it.active
                  ? "bg-indigo-100 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")
              }
            >
              {it.active ? (
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                  <it.Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
              ) : (
                <it.Icon className="w-4 h-4" strokeWidth={2} />
              )}
              <span>{it.label}</span>
            </a>
          ))}
        </nav>

        {/* Right side: chat + avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          {/* Chat entry point moved to the floating Nu mascot (bottom-right). */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-black flex items-center justify-center shadow">
            S
          </div>
          {onOpenSettings && (
            <button onClick={onOpenSettings}
                    title="Customize your day"
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
