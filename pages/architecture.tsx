import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import {
  Database, Cpu, Brain, Layout as LayoutIcon, Plug, ShieldCheck, Cloud,
  GitBranch, Activity, Lock, Network, Server,
} from "lucide-react";

const RED = "#D52B1E";
const NAVY = "#1B2A4E";

const LAYERS = [
  {
    code: "L5", name: "Experience & Integration", icon: LayoutIcon,
    color: "bg-lilly-red text-white",
    items: ["Next.js dashboards", "Coach copilot", "Member app", "SMART-on-FHIR launch", "Payer reports", "Partner GraphQL"],
  },
  {
    code: "L4", name: "Intelligence Services", icon: Brain,
    color: "bg-lilly-redDark text-white",
    items: ["Scoring services (GES/PPS/OFS/RSS)", "Recommendation engine", "Look-alike retrieval", "GenAI orchestration", "Clinical guardrails"],
  },
  {
    code: "L3", name: "Feature & Model Store", icon: Cpu,
    color: "bg-lilly-navy text-white",
    items: ["Feast feature store", "MLflow model registry", "Online (Redis) + offline serving", "Point-in-time correctness"],
  },
  {
    code: "L2", name: "Data Platform", icon: Database,
    color: "bg-lilly-navyDark text-white",
    items: ["Kafka streaming ingest", "Spark Structured Streaming", "dbt transforms", "Snowflake / Databricks warehouse", "MPI + de-identification"],
  },
  {
    code: "L1", name: "Source Connectivity", icon: Plug,
    color: "bg-slate-700 text-white",
    items: ["FHIR R4 (Epic, Cerner, Athena)", "Claims X12 837/835", "NCPDP pharmacy", "HL7 v2 labs", "CGM, scale, activity wearables", "Member-reported (app, SMS)"],
  },
];

const STACK = [
  { layer: "Frontend", items: ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "Recharts / D3", "shadcn/ui"] },
  { layer: "API & Services", items: ["FastAPI / NestJS", "gRPC (internal)", "GraphQL gateway", "OAuth2 / OIDC", "SMART-on-FHIR"] },
  { layer: "Data", items: ["PostgreSQL (transactional)", "Snowflake / Databricks", "Kafka / Redpanda", "Redis (cache + online features)", "pgvector / Pinecone"] },
  { layer: "ML / AI", items: ["LightGBM / XGBoost", "PyTorch", "MLflow", "Feast", "Bedrock / OpenAI / Anthropic", "Guardrails AI"] },
  { layer: "Infra", items: ["AWS (primary) / Azure", "EKS / GKE", "Terraform", "ArgoCD", "Datadog + OpenTelemetry"] },
  { layer: "Compliance", items: ["HIPAA", "HITRUST CSF r2", "SOC 2 Type II", "GDPR (EU)", "Per-tenant KMS", "WORM audit log"] },
];

const ROADMAP = [
  { phase: "P0", label: "Discovery & assessment", weeks: "2–3 wk", color: "bg-slate-200 text-slate-800" },
  { phase: "P1", label: "POC dashboard", weeks: "4–6 wk", color: "bg-amber-100 text-amber-800" },
  { phase: "P2", label: "Pilot deployment", weeks: "8–12 wk", color: "bg-lilly-redLight text-lilly-redDark" },
  { phase: "P3", label: "Scale & integrate", weeks: "12–16 wk", color: "bg-lilly-navy text-white" },
  { phase: "P4", label: "Intelligence layer", weeks: "Continuous", color: "bg-lilly-red text-white" },
  { phase: "P5", label: "Platform expansion", weeks: "Continuous", color: "bg-lilly-navyDark text-white" },
];

export default function Architecture() {
  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Enterprise Architecture & Production Stack"
        title="The platform under the hood"
        subtitle="A 5-layer reference architecture, a production technology stack, and the staged roadmap from POC to platform. Built FHIR-native, payer-friendly, and multi-tenant from day one."
      />

      {/* Layered architecture diagram */}
      <div className="px-8 mb-8">
        <Card>
          <CardTitle title="Reference architecture — 5 layers" subtitle="Each layer is independently deployable with a defined contract to the layer above" />
          <div className="space-y-2.5">
            {LAYERS.map(l => {
              const Icon = l.icon;
              return (
                <div key={l.code} className="flex items-stretch gap-3">
                  <div className={`w-32 shrink-0 rounded-xl ${l.color} flex flex-col items-center justify-center py-3`}>
                    <Icon className="w-6 h-6 mb-1" />
                    <div className="text-[11px] font-bold tracking-wider opacity-70">{l.code}</div>
                    <div className="text-[12px] font-bold leading-tight text-center px-2">{l.name}</div>
                  </div>
                  <div className="flex-1 bg-lilly-mist border border-lilly-line rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-[12px]">
                    {l.items.map(it => (
                      <div key={it} className="bg-white border border-lilly-line rounded-md px-2.5 py-1.5 text-lilly-navy font-medium">
                        {it}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-lilly-line/70 grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
            {[
              { label: "Cross-cutting", value: "Identity resolution · de-identification · audit · lineage", icon: GitBranch },
              { label: "Tenancy", value: "Logical default; hard isolation (VPC + KMS) for enterprise", icon: Network },
              { label: "Resilience", value: "Active-active read · RPO < 15min · RTO < 60min", icon: Activity },
              { label: "Compliance", value: "HIPAA · HITRUST · SOC 2 · GDPR · BAA on every subprocessor", icon: ShieldCheck },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-lilly-red shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10.5px] font-bold tracking-wider text-lilly-grey uppercase">{c.label}</div>
                    <div className="text-lilly-navy font-medium">{c.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Production tech stack */}
      <div className="px-8 mb-8">
        <Card>
          <CardTitle title="Production technology stack" subtitle="What ships in v1.0 — chosen for healthcare-grade reliability and engineering velocity" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STACK.map(s => (
              <div key={s.layer} className="bg-lilly-mist border border-lilly-line rounded-xl p-4">
                <div className="text-[11px] font-bold tracking-wider text-lilly-red uppercase">{s.layer}</div>
                <ul className="mt-2 space-y-1.5">
                  {s.items.map(it => (
                    <li key={it} className="flex items-center gap-2 text-[13px] text-lilly-navy">
                      <span className="w-1.5 h-1.5 rounded-full bg-lilly-red shrink-0" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Roadmap */}
      <div className="px-8 mb-8">
        <Card>
          <CardTitle title="Implementation roadmap" subtitle="Each phase produces a billable, demonstrable artifact — staged for fundable revenue" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {ROADMAP.map(p => (
              <div key={p.phase} className="border border-lilly-line rounded-xl overflow-hidden">
                <div className={`px-3 py-2 ${p.color} flex items-center justify-between`}>
                  <span className="text-[11px] font-bold tracking-wider">{p.phase}</span>
                  <span className="text-[10px] font-bold opacity-80">{p.weeks}</span>
                </div>
                <div className="p-3 bg-white">
                  <div className="text-[12.5px] font-bold text-lilly-navy leading-tight">{p.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-lilly-mist border border-lilly-line rounded-xl p-4">
              <div className="text-[11px] font-bold tracking-wider text-lilly-red uppercase">90-day execution sprint</div>
              <ol className="mt-2 space-y-2 text-[13px] text-lilly-navy">
                <li><b>Wk 1–2:</b> Lock matrix definitions with clinical advisor; freeze score input contracts.</li>
                <li><b>Wk 3–6:</b> Stand up the POC (this dashboard) on simulated 1k patients; eligibility scorer; candidate ranker; coach reference module.</li>
                <li><b>Wk 7–9:</b> Wire one real data source (pharmacy claims or one EHR) end-to-end; produce real eligibility report.</li>
                <li><b>Wk 10–12:</b> First paid pilot live; coach console; weekly executive report published.</li>
              </ol>
            </div>
            <div className="bg-lilly-navy text-white rounded-xl p-4">
              <div className="text-[11px] font-bold tracking-wider text-white/60 uppercase">What we deliberately do NOT use GenAI for</div>
              <ul className="mt-2 space-y-1.5 text-[13px]">
                <li className="flex items-start gap-2"><Lock className="w-3.5 h-3.5 text-lilly-red shrink-0 mt-1" /><span>Final clinical recommendations without human approval</span></li>
                <li className="flex items-start gap-2"><Lock className="w-3.5 h-3.5 text-lilly-red shrink-0 mt-1" /><span>Drug interaction / contraindication checks (deterministic only)</span></li>
                <li className="flex items-start gap-2"><Lock className="w-3.5 h-3.5 text-lilly-red shrink-0 mt-1" /><span>Score calculation (tabular models, calibrated, explainable)</span></li>
                <li className="flex items-start gap-2"><Lock className="w-3.5 h-3.5 text-lilly-red shrink-0 mt-1" /><span>Audit / billing / compliance summaries that must be reproducible</span></li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Security & compliance */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <CardTitle title="Security posture" />
          <ul className="space-y-2.5 text-[12.5px]">
            {[
              ["TLS 1.3 + AES-256-GCM", "All transit and rest encrypted; per-tenant KMS"],
              ["OIDC SSO + SCIM + MFA", "Least-privilege roles; just-in-time elevation"],
              ["Immutable audit log", "Hash-chained, tamper-evident, 7-year retention"],
              ["WAF + private VPC", "PrivateLink to data sources; egress allowlist"],
              ["SAST + DAST + SBOM", "Signed images; secrets scanning in CI"],
            ].map(([t, d]) => (
              <li key={t} className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-lilly-navy">{t}</div>
                  <div className="text-lilly-grey">{d}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle title="Data lifecycle" />
          <ul className="space-y-2.5 text-[12.5px]">
            {[
              ["Consent-scoped access", "Every read gated by active consent + scope match"],
              ["Identified ↔ de-identified", "Two parallel stores; analytics queries the de-id mirror"],
              ["Right to erasure", "Cryptographic tombstone preserves audit integrity"],
              ["Lineage by default", "Every score traces to source records + model version"],
              ["Reproducible replay", "Point-in-time replay supported for any audit"],
            ].map(([t, d]) => (
              <li key={t} className="flex items-start gap-2.5">
                <Database className="w-4 h-4 text-lilly-red shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-lilly-navy">{t}</div>
                  <div className="text-lilly-grey">{d}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle title="GenAI safeguards" />
          <ul className="space-y-2.5 text-[12.5px]">
            {[
              ["Model allowlist per tenant", "PHI never sent to a model the customer hasn't approved"],
              ["Output safety classifier", "Hallucination, contraindication, scope checks pre-surface"],
              ["Decision-support framing", "Every output requires explicit human action"],
              ["Redactable prompt logs", "Per-tenant retention; consent-withdrawal removes"],
              ["Quarterly red-team", "Findings flow to standard vulnerability program"],
            ].map(([t, d]) => (
              <li key={t} className="flex items-start gap-2.5">
                <Brain className="w-4 h-4 text-lilly-redDark shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-lilly-navy">{t}</div>
                  <div className="text-lilly-grey">{d}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
