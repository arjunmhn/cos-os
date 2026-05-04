"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPI_SERIES, type KpiSeries } from "@/lib/content/board";
import { useCompanyProfile } from "@/components/providers/company-profile-provider";
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

  const arr = KPI_SERIES.find((k) => k.id === "arr")!;
  const burn = KPI_SERIES.find((k) => k.id === "burn")!;
  const runway = KPI_SERIES.find((k) => k.id === "runway")!;
  const northStar = KPI_SERIES.find((k) => k.id === "north-star")!;

  return (
    <div className="space-y-5">
      {/* Hero KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_SERIES.map((s) => (
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
            <Badge tone="indigo">Target {arr.formatter!(arr.target!)}</Badge>
          </div>
          <div className="mt-5 h-[220px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={arr.data}>
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
                  tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`}
                />
                <Tooltip content={<ChartTooltip formatter={arr.formatter!} />} />
                <ReferenceLine y={arr.target} stroke="#a1a1aa" strokeDasharray="4 4" />
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
                {profile.northStarMetric}
              </h3>
            </div>
            <Badge tone="fuchsia">Target {northStar.formatter!(northStar.target!)}</Badge>
          </div>
          <div className="mt-5 h-[220px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={northStar.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <YAxis tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <Tooltip content={<ChartTooltip formatter={northStar.formatter!} />} />
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
              <BarChart data={burn.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <YAxis
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  stroke="#e4e4e7"
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip formatter={burn.formatter!} />} />
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
            <Badge tone="emerald">Threshold {runway.target} mo</Badge>
          </div>
          <div className="mt-5 h-[220px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={runway.data}>
                <defs>
                  <linearGradient id="runwayFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <YAxis tick={{ fontSize: 11, fill: "#71717a" }} stroke="#e4e4e7" />
                <Tooltip content={<ChartTooltip formatter={runway.formatter!} />} />
                <ReferenceLine y={runway.target} stroke="#f59e0b" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#runwayFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ series }: { series: KpiSeries }) {
  const last = series.data[series.data.length - 1].value;
  const prev = series.data[series.data.length - 2].value;
  const delta = ((last - prev) / prev) * 100;
  const onTarget = series.target ? (series.id === "burn" ? last <= series.target : last >= series.target) : true;
  const trendUp = delta >= 0;
  const tone = !series.target
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
        <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
          {series.label}
        </div>
        <span className={cn("text-[11px] font-medium inline-flex items-center gap-0.5", toneText[tone])}>
          {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
      <div className="mt-2.5 text-[24px] font-semibold tracking-tight text-zinc-900 leading-none">
        {series.formatter!(last)}
      </div>
      <div className="mt-3 -mx-1 h-[42px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series.data}>
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
      {series.target && (
        <div className="mt-2 text-[10.5px] text-zinc-400">
          Target: {series.formatter!(series.target)}
        </div>
      )}
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  formatter: (v: number) => string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border divider bg-white shadow-elevated px-3 py-2">
      <div className="text-[10.5px] uppercase tracking-[0.1em] text-zinc-500">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold text-zinc-900">{formatter(payload[0].value)}</div>
    </div>
  );
}
