import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import { PATIENTS, BUCKET_LABELS, tierMeta, readinessMeta } from "../lib/patientData";
import { Trophy, Filter, FileText, Send, Phone, Sparkles } from "lucide-react";

const PAYER_FRIENDLY = ["Commercial PA-friendly", "Self-pay / cash"];

export default function Candidates() {
  const [tier, setTier] = useState<"all" | "T1" | "T2">("all");
  const [payer, setPayer] = useState<"all" | "friendly">("all");

  const ranked = useMemo(() => {
    const natural = PATIENTS
      .filter(p => p.gesTier === "T1" || p.gesTier === "T2")
      .filter(p => p.status === "Identified" || p.status === "Outreach")
      .filter(p => p.id !== "P100967") // Sandy is force-injected below
      .filter(p => tier === "all" ? true : p.gesTier === tier)
      .filter(p => payer === "all" ? true : PAYER_FRIENDLY.includes(p.payerPosture))
      .map(p => ({
        ...p,
        compositeScore: p.ges * 0.55
          + p.pps * 100 * 0.30
          + (PAYER_FRIENDLY.includes(p.payerPosture) ? 15 : 0),
      }))
      .sort((a, b) => b.compositeScore - a.compositeScore);

    // ===== Demo override: pin Sandy R. (P100967) at the top of the candidate ranking =====
    // Her natural status is "Active" so she fails the candidate filter, but for the
    // continuous demo storyline we surface her at rank #1 so the viewer recognizes her
    // across pages. We respect the tier/payer filters so those buttons still work.
    const sandy = PATIENTS.find(p => p.id === "P100967");
    const sandyPassesTier  = sandy && (tier === "all" || sandy.gesTier === tier);
    const sandyPassesPayer = sandy && (payer === "all" || PAYER_FRIENDLY.includes(sandy.payerPosture));
    if (sandy && sandyPassesTier && sandyPassesPayer) {
      const topScore = natural[0]?.compositeScore ?? 80;
      const sandyEntry = {
        ...sandy,
        compositeScore: topScore + 2, // slightly above the natural top to lock rank #1
      };
      return [sandyEntry, ...natural];
    }
    return natural;
  }, [tier, payer]);

  const top = ranked.slice(0, 30);
  const summaryStats = {
    total: ranked.length,
    avgGes: ranked.length ? ranked.reduce((a, p) => a + p.ges, 0) / ranked.length : 0,
    avgOfs: ranked.length ? ranked.reduce((a, p) => a + p.ofs, 0) / ranked.length : 0,
    payerFriendly: ranked.filter(p => PAYER_FRIENDLY.includes(p.payerPosture)).length,
  };

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Candidate Patient Ranking"
        title="Top candidates ready for outreach"
        subtitle="Composite score = GES × eligibility weight + PPS × readiness weight + payer-friendliness bonus. The list every outreach team should start their day with."
        actions={
          <button className="text-sm font-semibold text-white bg-lilly-red px-3.5 py-2 rounded-lg hover:bg-lilly-redDark flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Generate PA packets
          </button>
        }
      />

      <div className="px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-lilly-line rounded-xl shadow-card p-4">
          <div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">Ready for outreach</div>
          <div className="text-[26px] font-bold text-lilly-navy mt-1 leading-none">{summaryStats.total}</div>
          <div className="text-[11px] text-lilly-grey mt-1">candidates in queue</div>
        </div>
        <div className="bg-white border border-lilly-line rounded-xl shadow-card p-4">
          <div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">Avg GES (queue)</div>
          <div className="text-[26px] font-bold text-lilly-navy mt-1 leading-none">{summaryStats.avgGes.toFixed(0)}</div>
          <div className="text-[11px] text-lilly-grey mt-1">eligibility score</div>
        </div>
        <div className="bg-white border border-lilly-line rounded-xl shadow-card p-4">
          <div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">Avg forecast loss</div>
          <div className="text-[26px] font-bold text-emerald-600 mt-1 leading-none">{summaryStats.avgOfs.toFixed(1)}%</div>
          <div className="text-[11px] text-lilly-grey mt-1">predicted at 52w</div>
        </div>
        <div className="bg-white border border-lilly-line rounded-xl shadow-card p-4">
          <div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">Payer-friendly share</div>
          <div className="text-[26px] font-bold text-lilly-red mt-1 leading-none">{summaryStats.total > 0 ? Math.round((summaryStats.payerFriendly / summaryStats.total) * 100) : 0}%</div>
          <div className="text-[11px] text-lilly-grey mt-1">PA-likely / cash-pay</div>
        </div>
      </div>

      <div className="px-8 mb-4 flex items-center gap-2">
        <Filter className="w-4 h-4 text-lilly-grey" />
        <span className="text-[12px] font-semibold text-lilly-grey mr-1">Filter:</span>
        <div className="flex gap-1.5">
          {["all", "T1", "T2"].map(t => (
            <button
              key={t}
              onClick={() => setTier(t as any)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${tier === t ? "bg-lilly-navy text-white" : "bg-white text-lilly-grey border border-lilly-line hover:bg-lilly-mist"}`}
            >
              Tier · {t.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-3">
          {(["all", "friendly"] as const).map(t => (
            <button
              key={t}
              onClick={() => setPayer(t)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${payer === t ? "bg-lilly-red text-white" : "bg-white text-lilly-grey border border-lilly-line hover:bg-lilly-mist"}`}
            >
              {t === "all" ? "All payers" : "Payer-friendly only"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8">
        <Card padding="p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-lilly-grey font-semibold border-b border-lilly-line bg-lilly-mist/50">
                <th className="text-left py-3 px-5">#</th>
                <th className="text-left">Patient</th>
                <th className="text-left">Cohort</th>
                <th className="text-left">Payer posture</th>
                <th className="text-right">GES</th>
                <th className="text-right">PPS</th>
                <th className="text-right">Forecast</th>
                <th className="text-right">Composite</th>
                <th className="text-right pr-5">Action</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p, idx) => {
                const tMeta = tierMeta(p.gesTier);
                const rMeta = readinessMeta(p.ppsBand);
                return (
                  <tr key={p.id} className="border-b border-lilly-line/60 hover:bg-lilly-mist/40">
                    <td className="py-2.5 px-5">
                      <div className="flex items-center gap-2">
                        {idx < 3 ? (
                          <Trophy className={`w-4 h-4 ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : "text-orange-700"}`} />
                        ) : <span className="w-4" />}
                        <span className="font-bold text-lilly-grey">{idx + 1}</span>
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-lilly-navy">{p.name}</div>
                      <div className="text-[11px] text-lilly-grey">{p.id} · {p.age}{p.sex} · BMI {p.bmi.toFixed(0)} · {p.state}</div>
                    </td>
                    <td className="text-[12px] text-lilly-grey">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tMeta.color}`}>{p.gesTier}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rMeta.color}`}>{p.ppsBand}</span>
                      </div>
                      <div className="mt-0.5">{BUCKET_LABELS[p.bucket]}</div>
                    </td>
                    <td>
                      <Badge color={PAYER_FRIENDLY.includes(p.payerPosture) ? "green" : "slate"} size="xs">
                        {p.payerPosture}
                      </Badge>
                    </td>
                    <td className="text-right font-bold text-lilly-navy">{p.ges}</td>
                    <td className="text-right font-mono text-lilly-grey">{(p.pps * 100).toFixed(0)}%</td>
                    <td className="text-right font-semibold text-emerald-700">{p.ofs.toFixed(1)}%</td>
                    <td className="text-right">
                      <span className="font-bold text-lilly-red">{p.compositeScore.toFixed(0)}</span>
                    </td>
                    <td className="text-right pr-5">
                      <div className="inline-flex items-center gap-1">
                        <button title="Call" className="w-7 h-7 rounded-md border border-lilly-line bg-white hover:bg-lilly-mist flex items-center justify-center text-lilly-navy"><Phone className="w-3.5 h-3.5" /></button>
                        <button title="SMS" className="w-7 h-7 rounded-md border border-lilly-line bg-white hover:bg-lilly-mist flex items-center justify-center text-lilly-navy"><Send className="w-3.5 h-3.5" /></button>
                        <button title="AI brief" className="w-7 h-7 rounded-md bg-lilly-red text-white hover:bg-lilly-redDark flex items-center justify-center"><Sparkles className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
