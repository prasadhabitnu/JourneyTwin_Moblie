import React from "react";

/**
 * Four demo mockups showing how Lilly Health can integrate Fathom at
 * increasing levels of visibility to the patient.
 *   L1: invisible (analyst view only)
 *   L2: Lilly-branded messages, Fathom-drafted
 *   L3: Fathom cards inline inside Lilly Health
 *   L4: full Fathom Companion inside Lilly Health's Insights tab
 */

// ============================================================================
// Shared mini iPhone frame — reused by L2, L3, L4
// ============================================================================
function PhoneMini({ children, height = 620 }: { children: React.ReactNode; height?: number }) {
  return (
    <div style={{
      width: 320, height, borderRadius: 42, padding: 10,
      background: "linear-gradient(180deg, #1F1930 0%, #100D1E 100%)",
      boxShadow: "0 20px 50px -12px rgba(0,0,0,0.35), 0 0 0 2px #2E2846",
      margin: "0 auto",
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 32, overflow: "hidden",
        background: "#FFFFFF", position: "relative",
      }}>
        {/* Dynamic island */}
        <div style={{
          position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
          width: 96, height: 24, borderRadius: 16, background: "#000", zIndex: 20,
        }} />
        {children}
      </div>
    </div>
  );
}

// Lilly Health status/nav bar shell (used inside phone mockups)
function LillyHealthShell({ children, tab = "home" }: { children: React.ReactNode; tab?: "home" | "logbook" | "insights" | "tools" | "more" }) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Status bar */}
      <div className="px-6 pt-2 flex items-center justify-between text-black text-[11px] font-black">
        <span>9:41</span>
        <span className="text-[9px]">•••</span>
      </div>
      {/* Lilly Health header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif" }}>Lilly</span>
          <span className="text-[13px] font-black text-slate-800">Health</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-slate-200" />
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      {/* Bottom tab bar */}
      <div className="border-t border-slate-100 px-3 pt-2 pb-4 flex items-center justify-between">
        <TabIcon label="Home"     kind="home"     active={tab === "home"} />
        <TabIcon label="Logbook"  kind="logbook"  active={tab === "logbook"} />
        <TabIcon label="Insights" kind="insights" active={tab === "insights"} />
        <TabIcon label="Tools"    kind="tools"    active={tab === "tools"} />
        <TabIcon label="More"     kind="more"     active={tab === "more"} />
      </div>
    </div>
  );
}
function TabIcon({ label, kind, active }: { label: string; kind: string; active: boolean }) {
  const color = active ? "#5B4CE0" : "#94A3B8";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {kind === "home"     && <path d="M3 12l9-9 9 9M5 10v10h14V10" />}
        {kind === "logbook"  && <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>}
        {kind === "insights" && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
        {kind === "tools"    && <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.7-3.7a6 6 0 0 1-8 8L6.3 20.7A1 1 0 0 1 3.3 17.7l9.4-9.4a6 6 0 0 1 8-8z" /></>}
        {kind === "more"     && <><circle cx="5" cy="12" r="1.5" fill={color} /><circle cx="12" cy="12" r="1.5" fill={color} /><circle cx="19" cy="12" r="1.5" fill={color} /></>}
      </svg>
      <span className="text-[8px] font-black uppercase" style={{ color }}>{label}</span>
    </div>
  );
}

// A "Fathom noticed" style card — reused across L3 and L4
function FathomCard({
  eyebrow, title, sub, icon, accent = "#5B4CE0",
}: { eyebrow: string; title: string; sub?: string; icon?: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border p-3 flex items-start gap-3 bg-white shadow-sm"
         style={{ borderColor: accent + "40" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
           style={{ background: accent + "15" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-black uppercase tracking-[0.14em] mb-0.5" style={{ color: accent }}>
          {eyebrow}
        </div>
        <div className="text-[12.5px] font-black text-slate-900 leading-tight">{title}</div>
        {sub && <div className="text-[10.5px] text-slate-500 font-medium leading-snug mt-1">{sub}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// LEVEL 1 — Persistence Intelligence (behind-the-scenes Lilly analyst view)
// ============================================================================
export function Level1Demo() {
  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
      {/* Lilly analyst dashboard */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"
             style={{ background: "linear-gradient(90deg, #FFF5F5 0%, #FFFFFF 100%)" }}>
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-black italic" style={{ color: "#E63946", fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif" }}>Lilly</span>
            <span className="text-[13px] font-black text-slate-800">Insights Console</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Powered by Fathom
          </div>
        </div>

        <div className="p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-3">
            Priority queue · Fathom flagged 3 for your team today
          </div>
          <div className="space-y-2">
            <PriorityRow initials="SR" tint="#7C6BFF" name="Sandy R." context="Week 13 · Program A" flag="Missed Sun dose; fasting glucose +12 mg/dL" action="Send warm reminder + Saturday reschedule" />
            <PriorityRow initials="DW" tint="#F59E0B" name="Diane W." context="Week 22 · Program A" flag="TIR down 6 pts; app opens −40% WoW" action="Escalate to coach for warm call today" />
            <PriorityRow initials="AK" tint="#059669" name="Amit K."  context="Week 8 · Program B"  flag="Sensor MARD elevated — data quality, not clinical event" action="Text sensor swap; flag data for exclusion" />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>428 members monitored · Fathom re-runs scoring nightly</span>
          <span className="text-indigo-600 font-black">See all →</span>
        </div>
      </div>

      {/* Side note */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-2">
          What the patient sees
        </div>
        <div className="rounded-xl bg-white border border-slate-100 p-4 text-center">
          <div className="text-4xl mb-2">👁️‍🗨️</div>
          <div className="text-[13px] font-black text-slate-800">Nothing new.</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
            Level 1 is invisible. Fathom does the noticing behind the scenes; Lilly&apos;s team acts on it through their existing tools.
          </div>
        </div>
        <div className="mt-4 text-[11px] text-slate-600 font-medium leading-relaxed">
          <span className="font-black text-slate-800">Fastest path to value.</span> Zero UX changes for Lilly Health users. Fathom sits alongside Lilly&apos;s existing back-office and lifts the internal signal.
        </div>
      </div>
    </div>
  );
}

function PriorityRow({ initials, tint, name, context, flag, action }:
  { initials: string; tint: string; name: string; context: string; flag: string; action: string }) {
  return (
    <div className="rounded-xl border border-slate-100 hover:bg-slate-50 transition p-3 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full text-white font-black text-[11px] flex items-center justify-center shrink-0"
           style={{ background: tint }}>{initials}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-black text-slate-900">{name}</span>
          <span className="text-[10px] text-slate-500 font-medium">{context}</span>
        </div>
        <div className="text-[11.5px] text-slate-700 font-medium leading-snug mt-0.5">
          <span className="text-indigo-700 font-black">Fathom flagged: </span>{flag}
        </div>
        <div className="text-[11px] text-emerald-700 font-medium leading-snug mt-0.5">
          <span className="font-black">Next best action: </span>{action}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LEVEL 2 — Intelligent Messaging (Lilly-branded, Fathom-drafted)
// ============================================================================
export function Level2Demo() {
  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
      <PhoneMini height={620}>
        {/* Lock-screen style push notification */}
        <div className="w-full h-full relative"
             style={{ background: "linear-gradient(180deg, #FEE2E2 0%, #FFF1F2 50%, #FFF5F5 100%)" }}>
          <div className="px-6 pt-2 flex items-center justify-between text-slate-800 text-[11px] font-black">
            <span>9:41</span>
            <span className="text-[9px]">•••</span>
          </div>

          <div className="pt-14 text-center">
            <div className="text-4xl font-black text-slate-800 leading-none tracking-tight">Monday</div>
            <div className="text-[15px] font-medium text-slate-600 mt-1">Jul 6 · 9:41 AM</div>
          </div>

          {/* Push notification card */}
          <div className="mx-4 mt-8 rounded-2xl bg-white shadow-lg border border-slate-100 p-4"
               style={{ backdropFilter: "blur(6px)" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                   style={{ background: "#E63946" }}>
                <span className="text-white text-[10px] font-black italic" style={{ fontFamily: "'Fraunces', serif" }}>Lilly</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-black text-slate-900">Lilly Health</span>
                  <span className="text-[9px] text-slate-500 font-medium">now</span>
                </div>
                <div className="text-[12.5px] font-medium text-slate-800 leading-snug">
                  Hi Sandy, small steps lead to big progress. You&apos;ve got this!
                </div>
              </div>
            </div>
          </div>

          {/* Attribution note (only visible to us the reader — not the patient) */}
          <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/70 p-3">
            <div className="text-[9px] font-black uppercase tracking-[0.14em] text-indigo-700 mb-0.5">
              What Sandy sees: Lilly Health.
            </div>
            <div className="text-[10.5px] text-indigo-800 font-medium leading-snug">
              Fathom drafted this. Timing (9:41 AM ± Sandy&apos;s ack window), tone (warm-not-cheerleader), and content were personalized to her twin state. She never sees the word &ldquo;Fathom.&rdquo;
            </div>
          </div>
        </div>
      </PhoneMini>

      {/* Right-side callouts */}
      <div className="space-y-3">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-md p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-2">
            What Fathom does behind this message
          </div>
          <ul className="space-y-2">
            <FeatureLi>Selects Sandy from a Lilly-approved template library</FeatureLi>
            <FeatureLi>Picks the exact minute she&apos;ll most likely open it</FeatureLi>
            <FeatureLi>Chooses tone matched to her communication preference</FeatureLi>
            <FeatureLi>Measures response, feeds it back into future messages</FeatureLi>
            <FeatureLi>Escalates to Lilly&apos;s coach or physician if unresponsive</FeatureLi>
          </ul>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-2">
            Compliance
          </div>
          <div className="text-[12px] text-slate-700 font-medium leading-relaxed">
            Every dispatched message is drawn from Lilly&apos;s pre-approved template set. Fathom personalizes selection + timing, not the message text. Full audit trail on every send.
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureLi({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[12px] text-slate-700 font-medium leading-snug">
      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 12 10 18 20 6" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

// ============================================================================
// LEVEL 3 — Fathom Insights (cards inline inside Lilly Health home)
// ============================================================================
export function Level3Demo() {
  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
      <PhoneMini height={620}>
        <LillyHealthShell tab="home">
          <div className="p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-2">Home</div>
            <div className="text-lg font-black text-slate-900 mb-3">Good morning, Sandy</div>

            {/* Lilly's own card */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 mb-3">
              <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 mb-1">Today · Lilly</div>
              <div className="text-[12.5px] font-black text-slate-800">Log this morning&apos;s dose</div>
              <div className="text-[10.5px] text-slate-500 font-medium mt-0.5">You&apos;re on a 12-day streak.</div>
            </div>

            {/* Fathom-branded card 1 */}
            <div className="mb-2.5">
              <FathomCard
                eyebrow="Fathom noticed"
                title="Your activity went down this week."
                sub="Down 22% vs. last week. Nothing to worry about — just a heads up."
                accent="#5B4CE0"
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#5B4CE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8l-6-6-6 6M12 2v13M4 22h16" />
                  </svg>
                }
              />
            </div>
            {/* Fathom-branded card 2 */}
            <div className="mb-3">
              <FathomCard
                eyebrow="Today's recommendation"
                title="A 15-minute walk after dinner can help."
                sub="Based on your best days this month."
                accent="#059669"
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13" cy="4" r="2" fill="#059669" />
                    <path d="M5 22l4-8 4 5 4-4 3 6" />
                  </svg>
                }
              />
            </div>

            {/* More Lilly content below */}
            <div className="rounded-xl border border-slate-100 p-3">
              <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 mb-1">Learning</div>
              <div className="text-[12px] font-medium text-slate-700">Article: GLP-1 &amp; muscle mass</div>
            </div>
          </div>
        </LillyHealthShell>
      </PhoneMini>

      <div className="space-y-3">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-md p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-2">
            What Lilly Health looks like
          </div>
          <ul className="space-y-2">
            <FeatureLi>1–2 Fathom cards on the home feed, above the fold</FeatureLi>
            <FeatureLi>&ldquo;Fathom noticed&rdquo; branding — visible partnership</FeatureLi>
            <FeatureLi>Card content adapts daily to what Sandy needs</FeatureLi>
            <FeatureLi>Card tap opens either Lilly&apos;s existing screens or a Fathom mini-view</FeatureLi>
            <FeatureLi>Escalates to Lilly&apos;s coach when the pattern warrants</FeatureLi>
          </ul>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-2">
            Why participants like this
          </div>
          <div className="text-[12px] text-slate-700 font-medium leading-relaxed">
            The card format is familiar — same as the rest of Lilly Health. But the content is uniquely theirs: what Fathom noticed about them this week, phrased warmly. Participants stay inside Lilly Health; Lilly stays central.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LEVEL 4 — Fathom Companion (full Insights tab inside Lilly Health)
// ============================================================================
export function Level4Demo() {
  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
      <PhoneMini height={700}>
        <LillyHealthShell tab="insights">
          {/* Tabs strip */}
          <div className="px-4 pt-3 border-b border-slate-100">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-2">Insights</div>
            <div className="flex gap-4 -mb-px">
              {["Today", "Trends", "Journey"].map((t, i) => (
                <div key={t} className={"pb-2 text-[12px] font-black " +
                  (i === 0 ? "text-indigo-700 border-b-2 border-indigo-600" : "text-slate-500")}>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4">
            {/* Momentum gauge */}
            <div className="rounded-xl border border-slate-100 p-4 mb-3 bg-gradient-to-br from-white to-indigo-50/50">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Your Momentum</div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ★ On Track
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <MomentumArc value={78} />
                <div>
                  <div className="text-3xl font-black text-slate-900 tabular-nums">78</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Strong</div>
                </div>
              </div>
            </div>

            {/* Fathom noticed */}
            <div className="mb-2.5">
              <FathomCard
                eyebrow="Fathom noticed"
                title="Your glucose was higher than usual 2 times this week."
                sub="Both were Tuesday and Wednesday dinner windows."
                accent="#5B4CE0"
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#5B4CE0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                  </svg>
                }
              />
            </div>

            <div className="mb-2.5">
              <FathomCard
                eyebrow="This week's win"
                title="Five post-dinner walks — your best week since April."
                sub="Peer effect: 24% higher TIR when you walk."
                accent="#059669"
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3l-3 8h5l-3 10 8-12h-6l3-6z" />
                  </svg>
                }
              />
            </div>

            <div className="mb-2">
              <FathomCard
                eyebrow="Tomorrow"
                title="Same schedule as your best week last month."
                accent="#B45309"
                icon={
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                }
              />
            </div>
          </div>
        </LillyHealthShell>
      </PhoneMini>

      <div className="space-y-3">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-md p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600 mb-2">
            The dedicated Insights tab
          </div>
          <ul className="space-y-2">
            <FeatureLi>Sandy taps &ldquo;Insights&rdquo; in Lilly Health&apos;s bottom nav</FeatureLi>
            <FeatureLi>Full Fathom experience: Today, Trends, Journey</FeatureLi>
            <FeatureLi>Momentum gauge (78 Strong) — the star-rating idea, one number</FeatureLi>
            <FeatureLi>Stack of Fathom cards, each drilling down into evidence</FeatureLi>
            <FeatureLi>Coach + physician escalation still surfaces here</FeatureLi>
          </ul>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-2">
            Deepest partnership tier
          </div>
          <div className="text-[12px] text-slate-700 font-medium leading-relaxed">
            Level 4 gives Lilly a fully-formed insights experience without building it themselves. Sandy sees &ldquo;Powered by Fathom&rdquo; on this tab; Lilly maintains the surrounding app. Best fit when the partnership is public and both brands want the co-mark.
          </div>
        </div>
      </div>
    </div>
  );
}

function MomentumArc({ value }: { value: number }) {
  const size = 84, cx = size / 2, cy = size / 2, r = 34;
  const circ = 2 * Math.PI * r;
  const arc = (value / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF2FF" strokeWidth="9" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10B981" strokeWidth="9"
              strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`} />
    </svg>
  );
}
