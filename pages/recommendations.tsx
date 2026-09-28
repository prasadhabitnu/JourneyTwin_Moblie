import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import { PATIENTS, BUCKET_LABELS } from "../lib/patientData";
import { Sparkles, FileCheck, MessageSquareText, Stethoscope, ChevronRight, ShieldCheck } from "lucide-react";

type Intent = "clinical_nba" | "coaching_play" | "member_nudge";

interface Recommendation {
  id: string;
  patientId: string;
  patientName: string;
  intent: Intent;
  title: string;
  body: string;
  confidence: number;
  evidence: { label: string; source: string }[];
  status: "pending" | "approved" | "overridden";
}

const INTENT_META: Record<Intent, { label: string; icon: any; color: string }> = {
  clinical_nba: { label: "Clinical NBA", icon: Stethoscope, color: "text-lilly-navy bg-lilly-navy/10" },
  coaching_play: { label: "Coaching play", icon: MessageSquareText, color: "text-lilly-redDark bg-lilly-redLight" },
  member_nudge: { label: "Member nudge", icon: Sparkles, color: "text-emerald-700 bg-emerald-50" },
};

function generateRecs(): Recommendation[] {
  const out: Recommendation[] = [];
  const candidates = PATIENTS.slice(0, 30);
  let n = 0;
  for (const p of candidates) {
    if (p.gesTier === "T1" || p.gesTier === "T2") {
      out.push({
        id: `R${1000 + n++}`,
        patientId: p.id, patientName: p.name,
        intent: "clinical_nba",
        title: `Initiate semaglutide 0.25 mg weekly`,
        body: `${p.name} (BMI ${p.bmi.toFixed(0)}, HbA1c ${p.hba1c.toFixed(1)}) meets on-label criteria. Baseline labs current. PA packet auto-generated for ${p.payerPosture}.`,
        confidence: 0.85 + (p.ges - 60) * 0.003,
        evidence: [
          { label: "Eligibility check", source: "GES = " + p.ges },
          { label: "Payer guideline", source: p.payerPosture },
          { label: "Look-alike outcome", source: `n=128 similar — avg 14.2% loss at 26w` },
        ],
        status: "pending",
      });
    }
    if (p.weeksOnProgram >= 4 && p.weeksOnProgram <= 8 && p.pps < 0.55) {
      out.push({
        id: `R${1000 + n++}`,
        patientId: p.id, patientName: p.name,
        intent: "coaching_play",
        title: `Run plateau script #4 — share Maria R. reference`,
        body: `${p.name} entering week-${p.weeksOnProgram} plateau. PPS ${(p.pps * 100).toFixed(0)}% (band ${p.ppsBand}). Suggest 10-min check-in + look-alike success story from ${BUCKET_LABELS[p.bucket]} cohort.`,
        confidence: 0.78,
        evidence: [
          { label: "Behavioral signal", source: `Portal logins down 35% wk-over-wk` },
          { label: "Cohort plateau model", source: `32% of similar profiles drop here` },
          { label: "Peer reference available", source: `Maria R. — 12% loss in 6 mo` },
        ],
        status: "pending",
      });
    }
    if (p.status === "Active" && p.appOptIn && p.weeksOnProgram > 0) {
      out.push({
        id: `R${1000 + n++}`,
        patientId: p.id, patientName: p.name,
        intent: "member_nudge",
        title: `Refill reminder + dose-change validation`,
        body: `${p.name} is 3 days from refill; recent dose change is showing results (week-${p.weeksOnProgram} loss: ${p.pctBwLoss.toFixed(1)}%). Send positive reinforcement + 1-tap refill confirmation.`,
        confidence: 0.92,
        evidence: [
          { label: "Refill calendar", source: "Pharmacy fill model" },
          { label: "Outcome trajectory", source: `Above-forecast progress` },
        ],
        status: "pending",
      });
    }
    if (out.length >= 9) break;
  }
  return out;
}

export default function Recommendations() {
  const recs = useMemo(generateRecs, []);
  const [filter, setFilter] = useState<Intent | "all">("all");
  const filtered = filter === "all" ? recs : recs.filter(r => r.intent === filter);

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="AI Recommendation Engine"
        title="Decision-support recommendations"
        subtitle="Every recommendation carries a confidence score, a citable evidence trail, and a one-click clinician/coach override path. Layered design: rules + retrieval + LLM reasoning + safety guardrails."
        actions={
          <div className="flex items-center gap-2 text-[12px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-semibold border border-emerald-100">
            <ShieldCheck className="w-4 h-4" /> Clinical safety classifier · active
          </div>
        }
      />

      <div className="px-8 grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        {(["clinical_nba", "coaching_play", "member_nudge"] as const).map(intent => {
          const meta = INTENT_META[intent];
          const Icon = meta.icon;
          const count = recs.filter(r => r.intent === intent).length;
          return (
            <button
              key={intent}
              onClick={() => setFilter(filter === intent ? "all" : intent)}
              className={`bg-white border rounded-xl shadow-card p-4 flex items-center gap-4 text-left transition ${filter === intent ? "border-lilly-red ring-2 ring-lilly-red/20" : "border-lilly-line hover:border-lilly-navy/30"}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${meta.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">{meta.label}</div>
                <div className="text-2xl font-bold text-lilly-navy leading-none mt-1">{count}</div>
                <div className="text-[11px] text-lilly-grey mt-0.5">recommendations pending</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {filtered.map(r => {
            const meta = INTENT_META[r.intent];
            const Icon = meta.icon;
            return (
              <Card key={r.id} padding="p-0">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge color="navy" size="xs">{meta.label}</Badge>
                            <span className="text-[11px] text-lilly-grey">{r.id}</span>
                          </div>
                          <div className="text-[15px] font-bold text-lilly-navy leading-tight">{r.title}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] uppercase tracking-wider text-lilly-grey font-bold">Confidence</div>
                          <div className="text-lg font-bold text-lilly-navy leading-none">{(r.confidence * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      <div className="text-[12.5px] text-lilly-grey mt-1.5 leading-relaxed">{r.body}</div>

                      <div className="mt-3 pt-3 border-t border-lilly-line/70">
                        <div className="text-[10px] font-bold tracking-wider text-lilly-grey uppercase mb-2">Evidence trail</div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.evidence.map((e, i) => (
                            <span key={i} className="text-[11px] bg-lilly-mist border border-lilly-line px-2 py-0.5 rounded-md text-lilly-navy">
                              <span className="font-semibold">{e.label}:</span> <span className="text-lilly-grey">{e.source}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 bg-lilly-mist/60 border-t border-lilly-line flex items-center justify-between">
                  <div className="text-[11px] text-lilly-grey">
                    For <span className="font-semibold text-lilly-navy">{r.patientName}</span> · {r.patientId}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-[11.5px] font-semibold text-lilly-grey px-2.5 py-1 rounded-md hover:bg-white border border-transparent hover:border-lilly-line">Override</button>
                    <button className="text-[11.5px] font-semibold text-white bg-lilly-red px-3 py-1 rounded-md hover:bg-lilly-redDark">Approve</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card>
            <CardTitle title="Recommendation pipeline" subtitle="Layered architecture, audit-friendly" />
            <ol className="space-y-3 text-[13px]">
              {[
                ["1. Rule layer", "Eligibility + contraindication gates (deterministic)", "navy"],
                ["2. Retrieval", "Lab trends + look-alike cohort + payer rules", "red"],
                ["3. Reasoning", "LLM with retrieval-augmented prompt", "navy"],
                ["4. Reranker", "Score-aware reranking against patient profile", "red"],
                ["5. Guardrails", "Clinical-safety classifier (block / flag)", "navy"],
                ["6. Surface", "Confidence + evidence + override path", "red"],
              ].map(([title, desc, color], i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${color === "red" ? "bg-lilly-red text-white" : "bg-lilly-navy text-white"} text-[11px] font-bold`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-lilly-navy text-[13px] leading-tight">{title}</div>
                    <div className="text-[11.5px] text-lilly-grey leading-snug">{desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardTitle title="Acceptance metrics" subtitle="Last 30 days" />
            <div className="space-y-3">
              {[
                ["Clinical NBA", 84, "approved without override"],
                ["Coaching plays", 91, "run as suggested"],
                ["Member nudges", 78, "delivered & engaged"],
              ].map(([label, val, sub]: any) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="font-semibold text-lilly-navy">{label}</span>
                    <span className="font-bold text-lilly-red">{val}%</span>
                  </div>
                  <div className="h-2 bg-lilly-line rounded-full overflow-hidden">
                    <div className="h-full bg-lilly-red rounded-full" style={{ width: `${val}%` }} />
                  </div>
                  <div className="text-[11px] text-lilly-grey mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
