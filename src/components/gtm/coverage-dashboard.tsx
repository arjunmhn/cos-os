"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_DEALS, SEGMENT_LABEL, type Deal } from "@/lib/content/gtm";
import { useLocalStorage } from "@/lib/storage";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { AlertTriangle, Target, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const QUARTER_QUOTA = 1.6e6;
const COVERAGE_TARGET = 3;

export function CoverageDashboard() {
  const [deals] = useLocalStorage<Deal[]>("deals", DEFAULT_DEALS);

  const stats = useMemo(() => {
    const open = deals.filter((d) => !["closed-won", "closed-lost"].includes(d.stage));
    const commit = open.filter((d) => d.stage === "commit");
    const bestCase = open.filter((d) => d.stage === "best-case");
    const earlier = open.filter((d) => !["commit", "best-case"].includes(d.stage));
    const total = open.reduce((s, d) => s + d.acv, 0);
    const coverage = total / QUARTER_QUOTA;
    const slipped = open.filter((d) => d.slipped).length;

    const bySegment: Record<string, { pipeline: number; commit: number; bestCase: number; segment: string }> = {};
    open.forEach((d) => {
      const k = SEGMENT_LABEL[d.segment];
      if (!bySegment[k]) bySegment[k] = { pipeline: 0, commit: 0, bestCase: 0, segment: k };
      bySegment[k].pipeline += d.acv;
      if (d.stage === "commit") bySegment[k].commit += d.acv;
      if (d.stage === "best-case") bySegment[k].bestCase += d.acv;
    });

    return {
      total,
      coverage,
      commit: commit.reduce((s, d) => s + d.acv, 0),
      bestCase: bestCase.reduce((s, d) => s + d.acv, 0),
      earlier: earlier.reduce((s, d) => s + d.acv, 0),
      commitCount: commit.length,
      bestCaseCount: bestCase.length,
      slipped,
      bySegment: Object.values(bySegment),
    };
  }, [deals]);

  const stackData = [
    {
      stage: "Pipeline",
      Commit: stats.commit,
      "Best case": stats.bestCase,
      Earlier: stats.earlier,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Coverage hero */}
      <Card className={cn(
        "p-6 border-2",
        stats.coverage >= COVERAGE_TARGET ? "border-emerald-200 bg-emerald-50/30" : "border-amber-300 bg-amber-50/40"
      )}>
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <CardEyebrow className={stats.coverage >= COVERAGE_TARGET ? "text-emerald-700" : "text-amber-700"}>
              Pipeline coverage this quarter
            </CardEyebrow>
            <div className="mt-2 flex items-baseline gap-3">
              <div className="text-[44px] font-semibold tracking-tight text-zinc-900 leading-none">
                {stats.coverage.toFixed(1)}×
              </div>
              <div className={cn(
                "text-[13px] font-medium inline-flex items-center gap-1",
                stats.coverage >= COVERAGE_TARGET ? "text-emerald-700" : "text-amber-700"
              )}>
                <Target className="h-3.5 w-3.5" /> Target {COVERAGE_TARGET}×
              </div>
            </div>
            <div className="mt-2 text-[13px] text-zinc-700">
              <span className="font-semibold">${(stats.total / 1e6).toFixed(2)}M</span> open pipeline against{" "}
              <span className="font-semibold">${(QUARTER_QUOTA / 1e6).toFixed(1)}M</span> quota.
            </div>
            {stats.coverage < COVERAGE_TARGET && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-amber-100/70 border border-amber-200 px-3 py-1.5 text-[12px] text-amber-900">
                <AlertTriangle className="h-3.5 w-3.5" />
                Below 3× — trigger the mid-quarter inspection before week 6.
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Commit</div>
              <div className="mt-1 text-[18px] font-semibold text-emerald-700">${(stats.commit / 1e6).toFixed(2)}M</div>
              <div className="text-[10.5px] text-zinc-500">{stats.commitCount} deals</div>
            </div>
            <div className="h-10 w-px bg-zinc-200" />
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Best case</div>
              <div className="mt-1 text-[18px] font-semibold text-amber-700">${(stats.bestCase / 1e6).toFixed(2)}M</div>
              <div className="text-[10.5px] text-zinc-500">{stats.bestCaseCount} deals</div>
            </div>
            <div className="h-10 w-px bg-zinc-200" />
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-zinc-500">Slipped</div>
              <div className="mt-1 text-[18px] font-semibold text-rose-600">{stats.slipped}</div>
              <div className="text-[10.5px] text-zinc-500">deals at risk</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stacked composition + segment bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <CardEyebrow>Composition</CardEyebrow>
          <h3 className="mt-1 text-base font-semibold text-zinc-900">Pipeline weighted by stage</h3>
          <div className="mt-5 h-[200px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  stroke="#e4e4e7"
                  tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`}
                />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <Tooltip content={<DollarTooltip />} />
                <ReferenceLine x={QUARTER_QUOTA} stroke="#71717a" strokeDasharray="4 4" label={{ value: "Quota", position: "top", fill: "#71717a", fontSize: 11 }} />
                <ReferenceLine x={QUARTER_QUOTA * COVERAGE_TARGET} stroke="#10b981" strokeDasharray="4 4" label={{ value: "3× target", position: "top", fill: "#10b981", fontSize: 11 }} />
                <Bar dataKey="Commit" stackId="a" fill="#10b981" radius={[4, 0, 0, 4]} />
                <Bar dataKey="Best case" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Earlier" stackId="a" fill="#a1a1aa" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px] mt-2">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> Commit</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-500" /> Best case</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-zinc-400" /> Earlier stages</span>
          </div>
        </Card>

        <Card className="p-6">
          <CardEyebrow>By segment</CardEyebrow>
          <h3 className="mt-1 text-base font-semibold text-zinc-900">Pipeline distribution</h3>
          <div className="mt-5 h-[200px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bySegment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="segment" tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <YAxis tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
                <Tooltip content={<DollarTooltip />} />
                <Bar dataKey="commit" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Commit" />
                <Bar dataKey="bestCase" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Best case" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {stats.bySegment.map((s) => (
              <div key={s.segment} className="rounded-md bg-zinc-50 border divider px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500">{s.segment}</div>
                <div className="mt-0.5 text-[14px] font-semibold text-zinc-900">${(s.pipeline / 1e6).toFixed(2)}M</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DollarTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border divider bg-white shadow-elevated px-3 py-2">
      <div className="text-[10.5px] uppercase tracking-[0.1em] text-zinc-500">{label}</div>
      <div className="mt-1 space-y-0.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: p.color }} />
            <span className="text-zinc-700">{p.name}:</span>
            <span className="font-semibold text-zinc-900">${(p.value / 1e6).toFixed(2)}M</span>
          </div>
        ))}
      </div>
    </div>
  );
}
