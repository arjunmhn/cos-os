"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClipboardList, GraduationCap, Layers3 } from "lucide-react";
import { MocBuilder } from "@/components/people/moc-builder";
import { PipelineKanban } from "@/components/people/pipeline-kanban";
import { OnboardingTab } from "@/components/people/onboarding-tab";

type Tab = "moc" | "pipeline" | "onboarding";

export default function PeoplePage() {
  const [tab, setTab] = useState<Tab>("moc");
  const tabs: { id: Tab; label: string; icon: typeof Layers3 }[] = [
    { id: "moc", label: "Roles & MOC", icon: Layers3 },
    { id: "pipeline", label: "Pipeline", icon: ClipboardList },
    { id: "onboarding", label: "Onboarding & Reviews", icon: GraduationCap },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="People & Hiring"
        title="A hiring rubric anyone can run."
        description="Define the role by outcomes, not titles. Track the pipeline with the only metric that matters at onsite — time-to-decision. End every hire with a written Day-90. The rubric is the same artifact, four times."
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

      {tab === "moc" && <MocBuilder />}
      {tab === "pipeline" && <PipelineKanban />}
      {tab === "onboarding" && <OnboardingTab />}
    </div>
  );
}
