"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_KPIS, formatKpiAxis, formatKpiValue } from "@/lib/content/kpi-defaults";
import { useCompanyProfile } from "@/components/providers/company-profile-provider";
import { useLocalStorage } from "@/lib/storage";
import type { KpiSnapshot as KpiSnap } from "@/lib/cos-persona";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

export function KpiSnapshot() {
  const { profile } = useCompanyProfile();
  const [kpis] = useLocalStorage<KpiSnap[]>("kpis", DEFAULT_KPIS);

  const arr = kpis.find((k) => k.id === "arr") || DEFAULT_KPIS[0];
  const burn = kpis.find((k) => k.id === "burn") || DEFAULT_KPIS[2];
  const runway = kpis.find((k) => k.id === "runway") || DEFAULT_KPIS[3];
  const northStar = kpis.find((k) => k.id === "north-star") || DEFAULT_KPIS[1];

  return (
    <div className="space-y-5">
      {/* Hero KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((s) => (
          <KpiCard key={s.id} series={s} />
        ))}
      </div>

      {/* Detail charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardEyebrow>Trailing 12 months</CardEyebrow>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-zinc-900">
                ARR trajectory
              </h3>
            </div>
            {arr.target !== undefined && (
              <Badge tone="indigo">Target {formatKpiValue(arr.target, arr.unit)}</Badge>
            )}
          </div>
          <div className="mt-5 h-[220px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={arr.series}>
                <defs>
                  <linearGradient id="arrFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <YAxis
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  stroke="#e4e4e7"
                  tickFormatter={(v) => formatKpiAxis(v, arr.unit)}
                />
                <Tooltip content={<ChartTooltip unit={arr.unit} />} />
                {arr.target !== undefined && (
                  <ReferenceLine y={arr.target} stroke="#a1a1aa" strokeDasharray="4 4" />
                )}
                <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#arrFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardEyebrow>North star</CardEyebrow>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-zinc-900">
                {profile.northStarMetric || northStar.label}
              </h3>
            </div>
            {northStar.target !== undefined && (
              <Badge tone="fuchsia">Target {formatKpiValue(northStar.target, northStar.unit)}</Badge>
            )}
          </div>
          <div className="mt-5 h-[220px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={northStar.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <YAxis
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  stroke="#e4e4e7"
                  tickFormatter={(v) => formatKpiAxis(v, northStar.unit)}
                />
                <Tooltip content={<ChartTooltip unit={northStar.unit} />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#d946ef"
                  strokeWidth={2.5}
                  dot={{ fill: "#d946ef", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardEyebrow>Cash discipline</CardEyebrow>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-zinc-900">
                Net monthly burn
              </h3>
            </div>
            <Badge tone="cyan">Trending flat</Badge>
          </div>
          <div className="mt-5 h-[220px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={burn.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <YAxis
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  stroke="#e4e4e7"
                  tickFormatter={(v) => formatKpiAxis(v, burn.unit)}
                />
                <Tooltip content={<ChartTooltip unit={burn.unit} />} />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardEyebrow>Time we have</CardEyebrow>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-zinc-900">
                Runway (months)
              </h3>
            </div>
            {runway.target !== undefined && (
              <Badge tone="emerald">Threshold {runway.target} mo</Badge>
            )}
          </div>
          <div className="mt-5 h-[220px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={runway.series}>
                <defs>
                  <linearGradient id="runwayFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <YAxis tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <Tooltip content={<ChartTooltip unit={runway.unit} />} />
                {runway.target !== undefined && (
                  <ReferenceLine y={runway.target} stroke="#f59e0b" strokeDasharray="4 4" />
                )}
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#runwayFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ series }: { series: KpiSnap }) {
  const last = series.latest;
  const prev = series.prev;
  const delta = prev !== 0 ? ((last - prev) / Math.abs(prev)) * 100 : 0;
  const onTarget =
    series.target !== undefined
      ? series.id === "burn"
        ? last <= series.target
        : last >= series.target
      : true;
  const trendUp = delta >= 0;
  const tone =
    series.target === undefined
      ? "neutral"
      : onTarget
        ? "emerald"
        : Math.abs((last - (series.target || 0)) / (series.target || 1)) < 0.2
          ? "amber"
          : "rose";

  const toneText: Record<string, string> = {
    neutral: "text-zinc-500",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500 truncate">
          {series.label}
        </div>
        <span
          className={cn(
            "text-[11px] font-medium inline-flex items-center gap-0.5 shrink-0",
            toneText[tone]
          )}
        >
          {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
      <div className="mt-2.5 text-[24px] font-semibold tracking-tight text-zinc-900 leading-none">
        {formatKpiValue(last, series.unit)}
      </div>
      <div className="mt-3 -mx-1 h-[42px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series.series}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={
                tone === "emerald"
                  ? "#10b981"
                  : tone === "amber"
                    ? "#f59e0b"
                    : tone === "rose"
                      ? "#ef4444"
                      : "#a1a1aa"
              }
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {series.target !== undefined && (
        <div className="mt-2 text-[10.5px] text-zinc-400">
          Target: {formatKpiValue(series.target, series.unit)}
        </div>
      )}
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: KpiSnap["unit"];
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border divider bg-white shadow-elevated px-3 py-2">
      <div className="text-[10.5px] uppercase tracking-[0.1em] text-zinc-500">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold text-zinc-900">
        {formatKpiValue(payload[0].value, unit)}
      </div>
    </div>
  );
}
