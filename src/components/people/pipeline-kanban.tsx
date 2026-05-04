"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/lib/storage";
import {
  DEFAULT_CANDIDATES,
  DEFAULT_ROLES,
  PIPELINE_STAGES,
  STAGE_LABELS,
  type Candidate,
  type RoleMoc,
} from "@/lib/content/people";
import { initials, cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Clock, Sparkles, TrendingDown, TrendingUp, Users2 } from "lucide-react";
import { useMemo } from "react";

export function PipelineKanban() {
  const [candidates, setCandidates] = useLocalStorage<Candidate[]>("candidates", DEFAULT_CANDIDATES);
  const [roles] = useLocalStorage<RoleMoc[]>("roles", DEFAULT_ROLES);

  const stats = useMemo(() => {
    const all = candidates;
    const onsiteOrLater = all.filter((c) => ["onsite", "offer", "hired"].includes(c.stage));
    const avgTimeToDecision =
      onsiteOrLater.length > 0
        ? Math.round(onsiteOrLater.reduce((s, c) => s + c.daysInStage, 0) / onsiteOrLater.length)
        : 0;
    const conversion = all.length > 0 ? Math.round((all.filter((c) => c.stage === "hired").length / all.length) * 100) : 0;
    return {
      total: all.length,
      avgTimeToDecision,
      conversion,
      activeRoles: roles.filter((r) => ["open", "in-loop"].includes(r.status)).length,
    };
  }, [candidates, roles]);

  const move = (id: string, dir: 1 | -1) => {
    setCandidates(
      candidates.map((c) => {
        if (c.id !== id) return c;
        const idx = PIPELINE_STAGES.indexOf(c.stage);
        const next = Math.max(0, Math.min(PIPELINE_STAGES.length - 1, idx + dir));
        return { ...c, stage: PIPELINE_STAGES[next], daysInStage: 0 };
      })
    );
  };

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FunnelStat
          icon={<Users2 className="h-3.5 w-3.5" />}
          label="Active candidates"
          value={String(stats.total)}
          delta={`${stats.activeRoles} open roles`}
          tone="neutral"
        />
        <FunnelStat
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Avg days at onsite+"
          value={`${stats.avgTimeToDecision}d`}
          delta="Target ≤ 5 days"
          tone={stats.avgTimeToDecision <= 5 ? "emerald" : "amber"}
          trend={stats.avgTimeToDecision <= 5 ? "up" : "down"}
        />
        <FunnelStat
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Hire rate"
          value={`${stats.conversion}%`}
          delta="Funnel conversion"
          tone="indigo"
        />
        <FunnelStat
          icon={<Sparkles className="h-3.5 w-3.5" />}
          label="Day-90 reviews due"
          value="2"
          delta="Within 14 days"
          tone="amber"
        />
      </section>

      {/* Kanban */}
      <div className="overflow-x-auto scroll-dim">
        <div className="grid grid-cols-5 gap-3 min-w-[1000px]">
          {PIPELINE_STAGES.map((stage) => {
            const items = candidates.filter((c) => c.stage === stage);
            return (
              <div key={stage} className="flex flex-col">
                <div className="px-3 py-2.5 mb-2 rounded-lg bg-zinc-50 border divider flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        stage === "sourcing" && "bg-zinc-400",
                        stage === "screen" && "bg-indigo-500",
                        stage === "onsite" && "bg-fuchsia-500",
                        stage === "offer" && "bg-amber-500",
                        stage === "hired" && "bg-emerald-500"
                      )}
                    />
                    <span className="text-[12px] font-semibold text-zinc-800">
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                  <Badge tone="neutral">{items.length}</Badge>
                </div>
                <div className="space-y-2 min-h-[160px]">
                  {items.map((c) => {
                    const role = roles.find((r) => r.id === c.roleId);
                    const stageIdx = PIPELINE_STAGES.indexOf(c.stage);
                    const isStaleOnsite = c.stage === "onsite" && c.daysInStage > 5;
                    return (
                      <div
                        key={c.id}
                        className={cn(
                          "rounded-lg border bg-white p-3 hover:shadow-card transition-all",
                          isStaleOnsite ? "border-amber-300" : "border-zinc-200"
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-white text-[10px] font-bold shrink-0">
                            {initials(c.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-zinc-900 truncate">
                              {c.name}
                            </div>
                            <div className="text-[11px] text-zinc-500 truncate">
                              {role?.title || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-zinc-500">
                          <span>{c.source}</span>
                          <span className={cn("flex items-center gap-1", isStaleOnsite && "text-amber-600 font-medium")}>
                            <Clock className="h-2.5 w-2.5" />
                            {c.daysInStage}d
                          </span>
                        </div>
                        {c.scorecard && c.scorecard.length > 0 && (
                          <div className="mt-2 flex items-center gap-1">
                            {c.scorecard.map((s, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "h-1.5 flex-1 rounded-full",
                                  s.score >= 4 ? "bg-emerald-400" : s.score >= 3 ? "bg-amber-400" : "bg-rose-400"
                                )}
                                title={`${s.interviewer}: ${s.score}/5`}
                              />
                            ))}
                          </div>
                        )}
                        <div className="mt-2.5 flex items-center justify-between">
                          <button
                            onClick={() => move(c.id, -1)}
                            disabled={stageIdx === 0}
                            className="text-zinc-300 hover:text-zinc-700 disabled:opacity-0"
                            aria-label="Move back"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => move(c.id, 1)}
                            disabled={stageIdx === PIPELINE_STAGES.length - 1}
                            className="text-indigo-500 hover:text-indigo-700 disabled:opacity-0 inline-flex items-center gap-0.5 text-[11px] font-medium"
                            aria-label="Move forward"
                          >
                            Advance <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="rounded-lg border border-dashed divider p-4 text-center text-[11px] text-zinc-400">
                      No one here.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setCandidates(DEFAULT_CANDIDATES)}
        className="text-[11px] text-zinc-400 hover:text-zinc-700 inline-flex items-center gap-1"
      >
        <Sparkles className="h-3 w-3" /> Reset sample pipeline
      </button>
    </div>
  );
}

function FunnelStat({
  icon,
  label,
  value,
  delta,
  tone,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  tone: "neutral" | "indigo" | "emerald" | "amber" | "rose";
  trend?: "up" | "down";
}) {
  const toneText: Record<string, string> = {
    neutral: "text-zinc-500",
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-1.5", toneText[tone])}>
          {icon}
          <span className="text-[10.5px] uppercase tracking-[0.12em] font-semibold">{label}</span>
        </div>
        {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-amber-500" />}
        {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
      </div>
      <div className="mt-3 text-[28px] font-semibold tracking-tight text-zinc-900 leading-none">
        {value}
      </div>
      <div className="mt-2 text-[11px] text-zinc-400">{delta}</div>
    </Card>
  );
}
