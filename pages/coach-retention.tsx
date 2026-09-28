import { useMemo, useState } from "react";
import { PageHeader, Card, CardTitle, Badge, Section } from "../components/Page";
import {
  PATIENTS, BUCKET_LABELS, bucketStats, cohortRetention, findLookAlikes,
  readinessMeta, tierMeta,
} from "../lib/patientData";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell,
} from "recharts";
import { Heart, Sparkles, MessageCircle, TrendingUp, Quote, Users, Award } from "lucide-react";

const RED = "#D52B1E";
const NAVY = "#1B2A4E";
const GREEN = "#10B981";

export default function CoachRetention() {
  const buckets = useMemo(bucketStats, []);

  // Pick an active "at-risk" participant by default
  const initial = PATIENTS.find(p => p.status === "Active" && p.weeksOnProgram >= 4 && p.weeksOnProgram <= 8 && p.pps < 0.55) ?? PATIENTS[0];
  const [participantId, setParticipantId] = useState<string>(initial.id);
  const participant = PATIENTS.find(p => p.id === participantId)!;
  const lookAlikes = useMemo(() => findLookAlikes(participant, 6), [participant]);

  const [bucketKey, setBucketKey] = useState<string>(participant.bucket);
  const retention = useMemo(() => cohortRetention(bucketKey), [bucketKey]);

  const platformBenchmark = retention.map(r => ({ week: r.week, baseline: Math.max(0.18, 0.95 - r.week * 0.011) }));
  const merged = retention.map((r, i) => ({
    week: r.week,
    "Platform cohort": r.retention,
    "Industry baseline": platformBenchmark[i].baseline,
  }));

  const atRiskCount = PATIENTS.filter(p => p.status === "Active" && p.pps < 0.55).length;
  const referenceMatchedCount = PATIENTS.filter(p => p.status === "Persistent" || p.status === "Completed").length;
  const aiBriefRetentionLift = 18; // pp lift attributed to module

  const aiBrief = `${participant.name} is at week ${participant.weeksOnProgram} — the canonical plateau where ${Math.round(32)}% of similar profiles in the ${BUCKET_LABELS[participant.bucket]} cohort drop off. Recommended play: book a 10-minute video check-in, validate the plateau as expected (not failure), and share ${lookAlikes[0]?.name ?? "a peer"} reference (${lookAlikes[0]?.pctBwLoss.toFixed(1)}% loss at week ${lookAlikes[0]?.weeksOnProgram}). Reinforce with a single SMS at 18:00 local time within 24 hours.`;

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Coach Retention & Success Reference Intelligence"
        title="Behavioral outcome optimization, made personal"
        subtitle="The differentiated module: surface relatable, evidence-backed peer success stories at the exact moment of risk. Coaches stop being statisticians; the platform remembers who succeeded for whom."
        actions={
          <div className="flex items-center gap-2 text-[12px] bg-lilly-redLight text-lilly-redDark px-3 py-1.5 rounded-lg font-semibold border border-lilly-red/20">
            <Heart className="w-4 h-4" /> Reference inventory: {referenceMatchedCount} verified outcomes
          </div>
        }
      />

      <div className="px-8 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <div className="bg-white border border-lilly-line rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-lilly-red" /><div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">At-risk active</div></div>
          <div className="text-[26px] font-bold text-lilly-navy mt-1.5 leading-none">{atRiskCount}</div>
          <div className="text-[11px] text-lilly-grey mt-1">PPS &lt; 55% — needs reference</div>
        </div>
        <div className="bg-white border border-lilly-line rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2"><Award className="w-4 h-4 text-lilly-red" /><div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">Reference outcomes</div></div>
          <div className="text-[26px] font-bold text-lilly-navy mt-1.5 leading-none">{referenceMatchedCount}</div>
          <div className="text-[11px] text-lilly-grey mt-1">verified, anonymized</div>
        </div>
        <div className="bg-white border border-lilly-line rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-600" /><div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">Reference lift</div></div>
          <div className="text-[26px] font-bold text-emerald-600 mt-1.5 leading-none">+{aiBriefRetentionLift} pp</div>
          <div className="text-[11px] text-lilly-grey mt-1">week-4 retention vs. control</div>
        </div>
        <div className="bg-white border border-lilly-line rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-lilly-red" /><div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">Coach span</div></div>
          <div className="text-[26px] font-bold text-lilly-navy mt-1.5 leading-none">1:285</div>
          <div className="text-[11px] text-lilly-grey mt-1">vs. 1:120 baseline</div>
        </div>
      </div>

      {/* Reference buckets bar */}
      <div className="px-8 mb-7">
        <Section title="Pre-built reference buckets" subtitle="Click a bucket to load its retention curve and outcome stats">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {buckets.map(b => (
              <button
                key={b.bucket}
                onClick={() => setBucketKey(b.bucket)}
                className={`text-left p-4 rounded-xl border shadow-card transition ${bucketKey === b.bucket ? "bg-lilly-redLight border-lilly-red" : "bg-white border-lilly-line hover:border-lilly-navy/40"}`}
              >
                <div className={`text-[11.5px] font-bold leading-tight ${bucketKey === b.bucket ? "text-lilly-redDark" : "text-lilly-navy"}`}>{b.label}</div>
                <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10.5px]">
                  <div>
                    <div className="text-lilly-grey">N</div>
                    <div className="font-bold text-lilly-navy">{b.n}</div>
                  </div>
                  <div>
                    <div className="text-lilly-grey">Success</div>
                    <div className="font-bold text-lilly-navy">{b.successN}</div>
                  </div>
                  <div>
                    <div className="text-lilly-grey">Avg loss</div>
                    <div className="font-bold text-emerald-700">{b.successAvgLoss.toFixed(1)}%</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* Retention curve + bucket stats */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <Card className="lg:col-span-2">
          <CardTitle
            title={`Cohort retention — ${BUCKET_LABELS[bucketKey]}`}
            subtitle="Platform cohort (this bucket) vs. industry baseline"
            action={<Badge color="green">live cohort</Badge>}
          />
          <ResponsiveContainer width="100%" height={290}>
            <LineChart data={merged} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#4A4A4A" }} label={{ value: "Weeks", position: "insideBottom", offset: -2, fill: "#4A4A4A", fontSize: 11 }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: "#4A4A4A" }} tickFormatter={v => `${Math.round(v * 100)}%`} />
              <Tooltip formatter={(v: any) => `${(v * 100).toFixed(1)}%`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Platform cohort" stroke={RED} strokeWidth={3} dot={{ r: 3, fill: RED }} />
              <Line type="monotone" dataKey="Industry baseline" stroke={NAVY} strokeWidth={2} strokeDasharray="6 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="Bucket success rates" subtitle="% reaching ≥7% BW loss" />
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={buckets.map(b => ({ ...b, successPct: b.n > 0 ? (b.successN / b.n) * 100 : 0 }))} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#4A4A4A" }} />
              <YAxis dataKey="bucket" type="category" tick={{ fontSize: 10, fill: "#1B2A4E" }} width={120} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => `${(+v).toFixed(1)}%`} />
              <Bar dataKey="successPct" radius={[0, 4, 4, 0]}>
                {buckets.map((b, i) => (
                  <Cell key={i} fill={b.bucket === bucketKey ? RED : NAVY} fillOpacity={b.bucket === bucketKey ? 1 : 0.65} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Look-alike participant view */}
      <div className="px-8 mb-7">
        <Section
          title="Live participant — coach copilot view"
          subtitle="Open any participant's record and instantly see the right peer references"
          action={
            <select
              value={participantId}
              onChange={e => setParticipantId(e.target.value)}
              className="text-[12px] border border-lilly-line rounded-md px-2 py-1 bg-white text-lilly-navy font-semibold focus:outline-none focus:ring-2 focus:ring-lilly-red/30"
            >
              {PATIENTS.filter(p => p.status === "Active").slice(0, 24).map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.id}</option>
              ))}
            </select>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Participant card */}
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">Participant</div>
                  <div className="text-[20px] font-bold text-lilly-navy mt-0.5">{participant.name}</div>
                  <div className="text-[12px] text-lilly-grey">{participant.id} · {participant.age}{participant.sex} · {participant.state}</div>
                </div>
                <Badge color="red" size="sm">Week {participant.weeksOnProgram}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-lilly-mist rounded-lg p-2">
                  <div className="text-[10px] text-lilly-grey font-bold uppercase">GES</div>
                  <div className="text-lg font-bold text-lilly-navy">{participant.ges}</div>
                </div>
                <div className="bg-lilly-mist rounded-lg p-2">
                  <div className="text-[10px] text-lilly-grey font-bold uppercase">PPS</div>
                  <div className="text-lg font-bold text-lilly-red">{(participant.pps * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-lilly-mist rounded-lg p-2">
                  <div className="text-[10px] text-lilly-grey font-bold uppercase">% Loss</div>
                  <div className="text-lg font-bold text-emerald-600">{participant.pctBwLoss.toFixed(1)}%</div>
                </div>
              </div>
              <div className="mt-3 text-[12px]">
                <div className="text-lilly-grey">Cohort bucket</div>
                <div className="font-semibold text-lilly-navy">{BUCKET_LABELS[participant.bucket]}</div>
              </div>
              <div className="mt-3 text-[12px]">
                <div className="text-lilly-grey">Comorbidities</div>
                <div className="text-lilly-navy">{participant.comorbidities.join(", ") || "—"}</div>
              </div>
            </Card>

            {/* AI brief */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-lilly-redLight via-white to-white border-lilly-red/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-lilly-red text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10.5px] font-bold tracking-wider text-lilly-redDark uppercase">AI coaching brief · ready in &lt; 1s</div>
                  <div className="text-[14px] font-bold text-lilly-navy mt-0.5 leading-tight">Today's recommended play</div>
                </div>
              </div>
              <div className="mt-3 text-[13.5px] text-lilly-navy leading-relaxed">
                {aiBrief}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button className="text-[12px] font-semibold text-white bg-lilly-red px-3 py-1.5 rounded-md hover:bg-lilly-redDark flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" /> Share reference + book check-in
                </button>
                <button className="text-[12px] font-semibold text-lilly-grey bg-white border border-lilly-line px-3 py-1.5 rounded-md hover:bg-lilly-mist">
                  See full play
                </button>
              </div>
            </Card>
          </div>

          {/* Look-alikes */}
          <div className="mt-5">
            <div className="text-[14px] font-bold text-lilly-navy mb-2">Look-alike successful participants</div>
            <div className="text-[12px] text-lilly-grey mb-3">k=6 nearest by demographics, baseline clinical state, and behavioral profile · all completed program with verified outcomes</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lookAlikes.map(p => (
                <div key={p.id} className="bg-white border border-lilly-line rounded-xl p-4 shadow-card hover:shadow-cardHover transition">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-[14px] font-bold text-lilly-navy">{p.name}</div>
                      <div className="text-[11px] text-lilly-grey">{p.age}{p.sex} · BMI {p.bmi.toFixed(0)} · HbA1c {p.hba1c.toFixed(1)}</div>
                    </div>
                    <Badge color="green" size="xs">verified</Badge>
                  </div>
                  <div className="flex items-start gap-2 text-[12.5px] text-lilly-navy bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 mb-2">
                    <Quote className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      Lost <b>{p.pctBwLoss.toFixed(1)}%</b> in {p.weeksOnProgram} weeks. {BUCKET_LABELS[p.bucket]}.
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-lilly-grey">
                    <span>HbA1c → {(p.hba1c - 0.8).toFixed(1)}</span>
                    <span>Adherence: {(p.pdc * 100).toFixed(0)}%</span>
                    <button className="text-lilly-red font-semibold">View story →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <div className="px-8">
        <Card className="bg-lilly-navy text-white border-lilly-navy">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-lilly-red flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-white/60 uppercase">Why this module is the moat</div>
              <div className="text-[16px] font-bold mt-1 leading-tight">It shifts the platform from analytics to behavioral outcome optimization &amp; engagement intelligence.</div>
              <div className="text-[13px] text-white/80 mt-2 leading-relaxed max-w-4xl">
                Generic statistics underperform identified individual stories by 2–4× in persistence trials. Every cohort
                that completes the program adds reference inventory; the more inventory, the better the matches; the better
                the matches, the higher the retention. The flywheel compounds with every customer. Coaches stop guessing
                which past participant was similar; the platform remembers, with verified outcome data, and surfaces it
                at the exact moment of risk.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
