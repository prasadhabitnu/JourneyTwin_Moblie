import { PANEL_STATS } from "../../../lib/coachData";

/**
 * Coach step stubs — polished-enough placeholders for the 5 non-hero steps
 * so the /coach route feels complete. Ready to expand into full builds later.
 */

function StubShell({
  emoji, eyebrow, title, blurb, bullets, ctaPrimary, ctaSecondary,
}: {
  emoji: string; eyebrow: string; title: string; blurb: string;
  bullets: string[]; ctaPrimary: string; ctaSecondary?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
               style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
            {emoji}
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 mb-1">{eyebrow}</div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">{title}</h1>
            <p className="text-[14px] text-slate-600 leading-relaxed">{blurb}</p>
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded shrink-0">
            preview
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-3">What this will surface</div>
        <ul className="space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700 leading-relaxed font-medium">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex gap-2">
          <button className="px-4 py-2 rounded-xl text-white text-[12px] font-black shadow hover:brightness-110 transition"
                  style={{ background: "linear-gradient(135deg, #EF5C3E 0%, #B91C1C 100%)" }}>
            {ctaPrimary}
          </button>
          {ctaSecondary && (
            <button className="px-4 py-2 rounded-xl text-[12px] font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition">
              {ctaSecondary}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------- 3. Cohort Pulse ----------------
export function CohortPulse() {
  return (
    <StubShell
      emoji="📊"
      eyebrow={`${PANEL_STATS.total} members · week-in-review`}
      title="Your panel this week."
      blurb={`Cohort TIR ${PANEL_STATS.cohortAvgTir}% (up ${PANEL_STATS.cohortTirTrend} pts). ${PANEL_STATS.streakingMembers} members on walk streak, ${PANEL_STATS.atRiskMembers} trending down. Full drill-down coming.`}
      bullets={[
        "Cohort-wide TIR distribution with subgroup slices (weeks-in-therapy, medication class, age band).",
        "Adherence heatmap — who's slipping, who's improving, and by how much.",
        "Drift alerts across the panel — Nu-flagged model performance regressions per subgroup.",
        "Celebration queue — members Nu suggests you acknowledge this week.",
      ]}
      ctaPrimary="Open panel dashboard"
      ctaSecondary="Export weekly report"
    />
  );
}

// ---------------- 5. Broadcast Design ----------------
export function BroadcastDesign() {
  return (
    <StubShell
      emoji="📢"
      eyebrow="One message · 400+ personalized versions"
      title="Draft, adapt, send."
      blurb="Compose a cohort challenge once. Nu auto-adapts per member: allergies, cultural food preferences, GLP-1 tolerance, physical limits. You review the per-member preview and hit send."
      bullets={[
        "Template library — 40+ starter challenges (hydration, walking, protein-first mornings, etc.).",
        "Automatic per-member adaptation using each recipient's Journey Twin.",
        "Compatibility bar — fits / auto-adapted / should-skip counts, with reasons.",
        "Send-time scheduling — Nu picks the moment each member is most likely to act.",
      ]}
      ctaPrimary="Compose new broadcast"
      ctaSecondary="View last broadcast performance"
    />
  );
}

// ---------------- 6. Physician Handoff ----------------
export function PhysicianHandoff() {
  return (
    <StubShell
      emoji="🩺"
      eyebrow="2 escalations ready for physician review"
      title="Nu drafted the envelopes."
      blurb="Diane W. — knee-limited walking, TIR declining. Amit K. — flagged for dose adjustment review at week 12. Each handoff includes structured decision support: 14-day trend, adherence, drift attribution, and Nu's plain-English summary."
      bullets={[
        "Structured decision-support envelope per case — trends, adherence, drift, and Nu's plain summary.",
        "Suggested clinician actions with evidence links back to specific signals.",
        "Consent-gated routing — only fires for members who opted into physician handoff.",
        "Audit trail — every dispatched envelope is immutable and reviewable.",
      ]}
      ctaPrimary="Review Diane W.'s envelope"
      ctaSecondary="Review Amit K.'s envelope"
    />
  );
}

// ---------------- 7. Panel Insights ----------------
export function PanelInsights() {
  return (
    <StubShell
      emoji="🔬"
      eyebrow="What's shifting across your panel this week"
      title="Six patterns worth your attention."
      blurb="Nu watches your whole panel for cross-member patterns you'd miss looking at individuals. This week: hydration is quietly driving TIR gains, Sunday dose skips are cluster-forming, and the week-12 cohort is showing higher-than-expected fatigue."
      bullets={[
        "Cross-member patterns Nu found this week (with confidence scores).",
        "Emerging risks — subgroups drifting before individual members trigger alerts.",
        "New evidence Nu is learning — relationships that just crossed the significance threshold.",
        "Cohort comparison — your panel vs. matched panels across the platform.",
      ]}
      ctaPrimary="Explore all patterns"
      ctaSecondary="Publish an insight to your team"
    />
  );
}

// ---------------- 8. Documentation ----------------
export function Documentation() {
  return (
    <StubShell
      emoji="📝"
      eyebrow={`${PANEL_STATS.soapNotesToReview} SOAP notes drafted, awaiting your review`}
      title="Nu drafted; you refine."
      blurb="For every session you complete, Nu drafts a SOAP note from the transcript, the outcomes you confirmed, and the member's context. You review, edit, and one-tap approve. Notes flow to the EHR through the connector."
      bullets={[
        "Auto-generated SOAP notes from session transcripts + confirmed outcomes.",
        "Track-changes view — see Nu's draft vs. your edits before approval.",
        "One-tap approve pushes to EHR via connector (Redox / Athena / Epic).",
        "Compliance trail — every note is versioned with reasoning and evidence.",
      ]}
      ctaPrimary="Review Sally R.'s note"
      ctaSecondary="See all pending"
    />
  );
}
