"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Activity, BarChart3, FileSearch, Search, Trophy } from "lucide-react";
import { CoverageDashboard } from "@/components/gtm/coverage-dashboard";
import { InspectionTable } from "@/components/gtm/inspection-table";
import { VelocityScorecard } from "@/components/gtm/velocity";
import { RetrostudyBuilder } from "@/components/gtm/retrostudy-builder";
import { IntelLog } from "@/components/gtm/intel-log";

type Tab = "coverage" | "inspection" | "velocity" | "retrostudy" | "intel";

export default function GtmPage() {
  const [tab, setTab] = useState<Tab>("coverage");
  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "coverage", label: "Coverage", icon: BarChart3 },
    { id: "inspection", label: "Mid-quarter inspection", icon: Search },
    { id: "velocity", label: "Velocity", icon: Activity },
    { id: "retrostudy", label: "Retrostudy", icon: Trophy },
    { id: "intel", label: "Win/loss intel", icon: FileSearch },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="GTM & Sales Ops"
        title="Catch the quarter miss six weeks early."
        description="Pipeline coverage as a leading indicator. Deal-by-deal mid-quarter inspection. Per-customer retrostudy artifacts Sales pulls into proposals. Repeatability over heroics."
      />

      <div className="flex items-center gap-1 border-b divider overflow-x-auto scroll-dim">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                active
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "coverage" && <CoverageDashboard />}
      {tab === "inspection" && <InspectionTable />}
      {tab === "velocity" && <VelocityScorecard />}
      {tab === "retrostudy" && <RetrostudyBuilder />}
      {tab === "intel" && <IntelLog />}
    </div>
  );
}
