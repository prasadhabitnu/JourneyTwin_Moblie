import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard, Users, ShieldAlert, Sparkles, Map, Trophy,
  LineChart, Heart, Bell, Search, ChevronRight, Megaphone, Brain, UserCog,
  ClipboardList, Sun, Activity, DollarSign, HeartPulse,
} from "lucide-react";
import clsx from "clsx";

type NavItem = { href: string; label: string; icon: any; section?: string };

const NAV: NavItem[] = [
  { href: "/", label: "Executive Overview", icon: LayoutDashboard, section: "OVERVIEW" },
  { href: "/eligibility", label: "GLP-1 Eligibility", icon: Users, section: "INTELLIGENCE" },
  { href: "/risk", label: "Persistence Risk", icon: ShieldAlert },
  { href: "/recommendations", label: "AI Recommendations", icon: Sparkles },
  { href: "/geographic", label: "Geographic Analytics", icon: Map },
  { href: "/candidates", label: "Candidate Ranking", icon: Trophy },
  { href: "/forecasting", label: "Outcome Forecasting", icon: LineChart },
  { href: "/campaigns", label: "Persistence Interventions", icon: Megaphone, section: "ENGAGEMENT" },
  { href: "/coach-dashboard", label: "Coach Dashboard", icon: ClipboardList },
  { href: "/coach-intelligence", label: "Coach Intelligence", icon: Brain },
  { href: "/daily-recap", label: "Daily Recap", icon: Sun },
  { href: "/cgm-insights", label: "CGM Insights", icon: Activity },
  { href: "/coach-retention", label: "Coach Retention & References", icon: Heart },
  { href: "/digital-twin", label: "Digital Twin", icon: UserCog },
  { href: "/insurance", label: "Claims Forecast", icon: DollarSign, section: "PAYER" },
  { href: "/claims", label: "Claims Reverse-Engine", icon: Search },
  { href: "/hrdashboard", label: "GCC Wellness (HR)", icon: HeartPulse, section: "WORKFORCE" },
  // PLATFORM section hidden from the sidebar - /architecture route still works directly.
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useRouter();
  const current = NAV.find(n => n.href === pathname) ?? NAV[0];

  let lastSection = "";

  return (
    <div className="flex h-screen bg-lilly-mist">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-lilly-navy text-white flex flex-col">
        <div className="px-6 py-5 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-lilly-red flex items-center justify-center font-bold text-lg shadow-lg">H</div>
          <div>
            <div className="text-sm font-bold tracking-wide">HABITNU</div>
            <div className="text-[11px] text-white/60 -mt-0.5">GLP-1 Population Intelligence</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map(item => {
            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <div key={item.href}>
                {showSection && (
                  <div className="px-6 pt-4 pb-1.5 text-[10px] font-bold tracking-widest text-white/40">
                    {item.section}
                  </div>
                )}
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-6 py-2.5 text-[13px] font-medium transition",
                    active
                      ? "bg-lilly-red/15 text-white border-r-2 border-lilly-red"
                      : "text-white/70 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-white/10 text-[11px] text-white/60">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-lilly-green live-dot" />
            <span>Live data · 1,000 patients</span>
          </div>
          <div>Habitnu × Lilly · POC v1.0</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-lilly-line flex items-center px-8 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lilly-grey">Dashboard</span>
            <ChevronRight className="w-4 h-4 text-lilly-grey/50" />
            <span className="font-semibold text-lilly-navy">{current.label}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/journey"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow hover:brightness-110 transition"
            >
              <span>🌱</span>
              <span>Sally's Journey</span>
            </Link>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-lilly-grey" />
              <input
                placeholder="Search patients, cohorts, recommendations..."
                className="pl-9 pr-3 py-2 text-sm rounded-lg border border-lilly-line bg-lilly-mist w-72 focus:outline-none focus:ring-2 focus:ring-lilly-red/30 focus:bg-white"
              />
            </div>
            <button className="relative w-9 h-9 rounded-lg border border-lilly-line bg-white hover:bg-lilly-mist flex items-center justify-center">
              <Bell className="w-4 h-4 text-lilly-grey" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-lilly-red" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-lilly-line">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lilly-red to-lilly-redDark flex items-center justify-center text-white font-semibold text-sm">P</div>
              <div className="hidden md:block text-sm">
                <div className="font-semibold text-lilly-navy leading-tight">Prasad T.</div>
                <div className="text-[11px] text-lilly-grey">Platform Admin</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
