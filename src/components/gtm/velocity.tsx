"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VELOCITY } from "@/lib/content/gtm";
import { useMemo } from "react";
import { Activity, Clock, DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

function calcVelocity(row: { pipelineDollars: number; winRate: number; avgDealSize: number; cycleDays: number }) {
  // Sales velocity = (# of opps × win rate × avg deal) / cycle length
  const opps = row.pipelineDollars / row.avgDealSize;
  return ((opps * (row.winRate / 100) * row.avgDealSize) / row.cycleDays) * 30;
}

export function VelocityScorecard() {
  const enriched = useMemo(
    () =>
      VELOCITY.map((r) => ({
        ...r,
        velocity: calcVelocity(r),
      })),
    []
  );

  const icp = enriched.find((r) => r.segment === "all-icp")!;

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <CardEyebrow>The formula</CardEyebrow>
        <h3 className="mt-1 text-base font-semibold text-zinc-900">
          Sales velocity = <span className="text-indigo-600">opps</span> ×{" "}
          <span className="text-emerald-600">win rate</span> ×{" "}
          <span className="text-amber-600">avg deal</span> /{" "}
          <span className="text-rose-600">cycle days</span>
        </h3>
        <p className="mt-2 text-[13px] text-zinc-600 leading-relaxed max-w-3xl">
          Four levers, separated. When growth slows, the question is which lever moved — not whether to push
          the team harder. Different segments need different lever strategies; mixing them blurs the signal.
        </p>
      </Card>

      {/* The 4 levers - shown for ICP */}
      <div>
        <CardEyebrow className="mb-3">ICP velocity — the four levers, separated</CardEyebrow>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <LeverCard
            icon={<DollarSign className="h-3.5 w-3.5" />}
            label="Pipeline $"
            value={`$${(icp.pipelineDollars / 1e6).toFixed(2)}M`}
            sub="Open in ICP"
            tone="indigo"
          />
          <LeverCard
            icon={<Percent className="h-3.5 w-3.5" />}
            label="Win rate"
            value={`${icp.winRate}%`}
            sub="Target ≥ 25%"
            tone={icp.winRate >= 25 ? "emerald" : "amber"}
          />
          <LeverCard
            icon={<DollarSign className="h-3.5 w-3.5" />}
            label="Avg deal"
            value={`$${(icp.avgDealSize / 1000).toFixed(0)}k`}
            sub="ACV in ICP"
            tone="amber"
          />
          <LeverCard
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Cycle"
            value={`${icp.cycleDays}d`}
            sub="Target ≤ 60 days"
            tone={icp.cycleDays <= 60 ? "emerald" : "amber"}
          />
        </div>
        <Card className="mt-4 p-5 bg-gradient-to-br from-white to-indigo-50/40 border-indigo-100/60">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-white shadow-elevated">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-indigo-700">
                Composite ICP velocity
              </div>
              <div className="text-[24px] font-semibold text-zinc-900 leading-none mt-1">
                ${(icp.velocity / 1000).toFixed(0)}k <span className="text-zinc-500 text-[14px] font-normal">/ month</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Segment table */}
      <div>
        <CardEyebrow className="mb-3">By segment</CardEyebrow>
        <Card className="p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50/60 border-b divider text-left">
              <tr>
                <Th>Segment</Th>
                <Th>Pipeline $</Th>
                <Th>Win rate</Th>
                <Th>Avg deal</Th>
                <Th>Cycle (days)</Th>
                <Th>Velocity / mo</Th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((r) => {
                const isHero = r.segment === "all-icp";
                return (
                  <tr
                    key={r.segment}
                    className={cn(
                      "border-b divider last:border-b-0",
                      isHero && "bg-indigo-50/40"
                    )}
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className={cn("font-semibold", isHero ? "text-indigo-900" : "text-zinc-900")}>
                          {r.label}
                        </span>
                        {isHero && <Badge tone="indigo">Headline</Badge>}
                      </div>
                    </Td>
                    <Td className="font-mono">${(r.pipelineDollars / 1e6).toFixed(2)}M</Td>
                    <Td className={cn(r.winRate >= 25 ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold")}>
                      {r.winRate}%
                    </Td>
                    <Td className="font-mono">${(r.avgDealSize / 1000).toFixed(0)}k</Td>
                    <Td className={cn(r.cycleDays <= 60 ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold")}>
                      {r.cycleDays}
                    </Td>
                    <Td className="font-mono font-semibold text-zinc-900">${(r.velocity / 1000).toFixed(0)}k</Td>
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

function LeverCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: "indigo" | "emerald" | "amber" | "rose";
}) {
  const toneText: Record<string, string> = {
    indigo: "text-indigo-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
  };
  return (
    <Card className="p-4">
      <div className={cn("flex items-center gap-1.5", toneText[tone])}>
        {icon}
        <span className="text-[10.5px] uppercase tracking-[0.12em] font-semibold">{label}</span>
      </div>
      <div className="mt-2 text-[22px] font-semibold tracking-tight text-zinc-900 leading-none">{value}</div>
      <div className="mt-1.5 text-[11px] text-zinc-400">{sub}</div>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-[10.5px] uppercase tracking-[0.1em] font-semibold text-zinc-500">
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-[13px] text-zinc-700", className)}>{children}</td>;
}
