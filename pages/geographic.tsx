import { useMemo } from "react";
import { PageHeader, Card, CardTitle, Badge } from "../components/Page";
import { PATIENTS, regionAggregates, stateAggregates } from "../lib/patientData";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter, ZAxis, Cell,
} from "recharts";

const RED = "#D52B1E";
const NAVY = "#1B2A4E";

export default function Geographic() {
  const regions = useMemo(regionAggregates, []);
  const states = useMemo(stateAggregates, []);
  const top10States = states.slice(0, 10);

  // Bubble chart: lat/lng with eligibility size
  const points = PATIENTS.map(p => ({
    lat: p.lat, lng: p.lng, ges: p.ges, name: p.name, state: p.state,
    color: p.gesTier === "T1" ? RED
      : p.gesTier === "T2" ? "#EE6055"
      : p.gesTier === "T3" ? "#F59E0B"
      : "#94A3B8",
  }));

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow="Geographic Analytics"
        title="Population distribution & regional opportunity"
        subtitle="Where the eligible population lives — and where the platform should prioritize coach pods, payer outreach, and pharmacy partnerships."
      />

      <div className="px-8 grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
        {regions.map(r => (
          <div key={r.region} className="bg-white border border-lilly-line rounded-xl shadow-card p-4">
            <div className="text-[11px] font-bold tracking-wider text-lilly-grey uppercase">{r.region}</div>
            <div className="text-[24px] font-bold text-lilly-navy mt-1 leading-none">{r.eligible}</div>
            <div className="text-[11px] text-lilly-grey mt-1">eligible · {r.total} total</div>
            <div className="mt-2 pt-2 border-t border-lilly-line/60 flex items-center justify-between text-[11px]">
              <span className="text-lilly-grey">Avg GES</span>
              <span className="font-bold text-lilly-red">{r.avgGes.toFixed(0)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        <Card className="lg:col-span-2">
          <CardTitle title="US-style density map" subtitle="Each dot is a patient. Color = eligibility tier. Size = GES." />
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" />
              <XAxis type="number" dataKey="lng" name="Longitude" domain={[-125, -65]} tick={{ fontSize: 10, fill: "#94A3B8" }} />
              <YAxis type="number" dataKey="lat" name="Latitude" domain={[24, 49]} tick={{ fontSize: 10, fill: "#94A3B8" }} />
              <ZAxis type="number" dataKey="ges" range={[10, 100]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={points} fillOpacity={0.6}>
                {points.map((p, i) => <Cell key={i} fill={p.color} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 text-[11px] mt-2">
            {[["T1", RED], ["T2", "#EE6055"], ["T3", "#F59E0B"], ["T4/T5", "#94A3B8"]].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c as string }} />
                <span className="text-lilly-grey">{l}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle title="Top states by eligible population" subtitle="Where to deploy capacity first" />
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={top10States} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E5E8EE" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#4A4A4A" }} />
              <YAxis dataKey="state" type="category" tick={{ fontSize: 12, fill: "#1B2A4E", fontWeight: 600 }} width={40} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="eligible" fill={RED} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="px-8">
        <Card padding="p-0">
          <div className="px-5 pt-4 pb-3 border-b border-lilly-line">
            <div className="text-sm font-bold text-lilly-navy">Regional opportunity ranking</div>
            <div className="text-[12px] text-lilly-grey mt-0.5">Sorted by net new eligible × payer-friendliness density</div>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-lilly-grey font-semibold border-b border-lilly-line bg-lilly-mist/50">
                <th className="text-left py-2.5 px-5">Region</th>
                <th className="text-right">Total</th>
                <th className="text-right">Eligible</th>
                <th className="text-right">% Eligible</th>
                <th className="text-right">Active</th>
                <th className="text-right">Avg GES</th>
                <th className="text-right">Avg loss</th>
                <th className="text-right pr-5">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {regions
                .slice()
                .sort((a, b) => b.eligible - a.eligible)
                .map(r => (
                  <tr key={r.region} className="border-b border-lilly-line/60 hover:bg-lilly-mist/40">
                    <td className="py-2.5 px-5 font-semibold text-lilly-navy">{r.region}</td>
                    <td className="text-right">{r.total}</td>
                    <td className="text-right font-bold text-lilly-navy">{r.eligible}</td>
                    <td className="text-right">{((r.eligible / r.total) * 100).toFixed(1)}%</td>
                    <td className="text-right">{r.active}</td>
                    <td className="text-right font-mono">{r.avgGes.toFixed(0)}</td>
                    <td className="text-right font-mono text-emerald-700">{r.avgLoss.toFixed(1)}%</td>
                    <td className="text-right pr-5">
                      <Badge color={r.eligible > 100 ? "red" : r.eligible > 50 ? "amber" : "slate"}>
                        {r.eligible > 100 ? "Expand coach pod" : r.eligible > 50 ? "Pilot deployment" : "Surveillance"}
                      </Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
