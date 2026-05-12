"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, FileText, FolderLock, Mail, Timer } from "lucide-react";
import { KpiSnapshot } from "@/components/board/kpi-snapshot";
import { BoardPackOutline } from "@/components/board/board-pack-outline";
import { InvestorUpdate } from "@/components/board/investor-update";
import { PrepTimeline } from "@/components/board/prep-timeline";
import { DataRoom } from "@/components/board/data-room";

type Tab = "kpi" | "pack" | "update" | "prep" | "room";

export default function BoardPage() {
  const [tab, setTab] = useState<Tab>("kpi");
  const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
    { id: "kpi", label: "KPI snapshot", icon: BarChart3 },
    { id: "pack", label: "Board pack", icon: FileText },
    { id: "update", label: "Investor update", icon: Mail },
    { id: "prep", label: "Prep timeline", icon: Timer },
    { id: "room", label: "Data room", icon: FolderLock },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Board & IR"
        title="Board prep is a 2-week project, not a panic."
        description="Board pack, investor update, KPI charts, prep timeline, data room."
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

      {tab === "kpi" && <KpiSnapshot />}
      {tab === "pack" && <BoardPackOutline />}
      {tab === "update" && <InvestorUpdate />}
      {tab === "prep" && <PrepTimeline />}
      {tab === "room" && <DataRoom />}
    </div>
  );
}
