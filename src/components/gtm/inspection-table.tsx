"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEFAULT_DEALS, SEGMENT_LABEL, STAGE_LABEL, type Deal, type DealStage } from "@/lib/content/gtm";
import { useLocalStorage } from "@/lib/storage";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpDown, Filter, Search } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export function InspectionTable() {
  const [deals] = useLocalStorage<Deal[]>("deals", DEFAULT_DEALS);
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");
  const [icpOnly, setIcpOnly] = useState(false);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return deals
      .filter((d) => !["closed-won", "closed-lost"].includes(d.stage))
      .filter((d) => stageFilter === "all" || d.stage === stageFilter)
      .filter((d) => !icpOnly || d.inIcp)
      .filter((d) =>
        query.length === 0
          ? true
          : (d.name + d.owner + d.nextAction).toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.acv - a.acv);
  }, [deals, stageFilter, icpOnly, query]);

  const totalAcv = rows.reduce((s, d) => s + d.acv, 0);

  return (
    <div className="space-y-5">
      <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30 border-amber-100/60">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <CardEyebrow className="text-amber-700">Catch the miss six weeks early</CardEyebrow>
            <h3 className="mt-1 text-base font-semibold text-zinc-900">
              Mid-quarter inspection — deal-by-deal.
            </h3>
            <p className="mt-2 text-[13px] text-zinc-600 leading-relaxed max-w-3xl">
              Every committed and best-case deal gets one row. Each row must show a <span className="font-semibold">next buyer action</span>
              {" "}and a <span className="font-semibold">date</span>. Stories don&apos;t qualify. Reps tell stories
              when they don&apos;t know the next move — those are the deals to slow down on.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">In view</div>
            <div className="text-[24px] font-semibold text-zinc-900">${(totalAcv / 1e6).toFixed(2)}M</div>
            <div className="text-[11px] text-zinc-500">{rows.length} deals</div>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-3.5 border-b divider flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border divider bg-white pl-2.5 pr-1 h-9 w-[260px]">
            <Search className="h-3.5 w-3.5 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deals, owners, actions…"
              className="flex-1 bg-transparent text-sm placeholder:text-zinc-400 focus:outline-none"
            />
          </div>
          <div className="inline-flex items-center rounded-lg border divider bg-white p-0.5">
            {(["all", "commit", "best-case", "evaluation", "discovery"] as (DealStage | "all")[]).map((s) => (
              <button
                key={s}
                onClick={() => setStageFilter(s)}
                className={cn(
                  "px-3 h-7 text-[11px] font-medium rounded-md transition-colors",
                  stageFilter === s ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {s === "all" ? "All stages" : STAGE_LABEL[s as DealStage]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIcpOnly(!icpOnly)}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-[12px] font-medium transition-colors",
              icpOnly ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
            )}
          >
            <Filter className="h-3 w-3" /> ICP only
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scroll-dim">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50/60 border-b divider text-left">
                <Th>Deal</Th>
                <Th>Segment</Th>
                <Th>Stage</Th>
                <Th>Owner</Th>
                <Th>ACV</Th>
                <Th>Next buyer action</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b divider last:border-b-0 hover:bg-zinc-50/40 transition-colors">
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900">{d.name}</span>
                      {d.slipped && (
                        <span className="inline-flex items-center gap-1 text-[10.5px] text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-1.5 py-0.5">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          slipped
                        </span>
                      )}
                      {d.inIcp && <Badge tone="indigo">ICP</Badge>}
                    </div>
                  </Td>
                  <Td className="text-zinc-600">{SEGMENT_LABEL[d.segment]}</Td>
                  <Td>
                    <StagePill stage={d.stage} />
                  </Td>
                  <Td className="text-zinc-600">{d.owner}</Td>
                  <Td className="font-mono text-zinc-900 font-semibold">${(d.acv / 1000).toFixed(0)}k</Td>
                  <Td className="text-zinc-700 max-w-[260px]">{d.nextAction}</Td>
                  <Td className="text-zinc-500 whitespace-nowrap">{formatDate(d.nextActionDate)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-[10.5px] uppercase tracking-[0.1em] font-semibold text-zinc-500">
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-2.5 w-2.5 opacity-50" />
      </span>
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-[13px]", className)}>{children}</td>;
}

function StagePill({ stage }: { stage: DealStage }) {
  const tone =
    stage === "commit"
      ? "emerald"
      : stage === "best-case"
        ? "amber"
        : stage === "evaluation"
          ? "indigo"
          : stage === "proposal"
            ? "fuchsia"
            : "neutral";
  return <Badge tone={tone as never}>{STAGE_LABEL[stage]}</Badge>;
}
