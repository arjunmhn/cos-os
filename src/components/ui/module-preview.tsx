import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Module = {
  eyebrow: string;
  title: string;
  description: string;
  philosophy: string;
  philosophySource: string;
  features: { icon: LucideIcon; title: string; body: string }[];
  artifacts: string[];
  templates: { title: string; cadence: string }[];
};

export function ModulePreview({ module }: { module: Module }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={module.eyebrow}
        title={module.title}
        description={module.description}
        actions={<Badge tone="indigo" dot>v0 preview · deepening next pass</Badge>}
      />

      <Card className="p-7 bg-gradient-to-br from-white to-indigo-50/40 border-indigo-100/70">
        <div className="flex items-start gap-4">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-white shadow-elevated shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardEyebrow className="text-indigo-600">Module philosophy</CardEyebrow>
            <p className="mt-2 text-[15px] text-zinc-800 leading-relaxed font-medium">
              {module.philosophy}
            </p>
            <p className="mt-3 text-[12px] text-zinc-500">— {module.philosophySource}</p>
          </div>
        </div>
      </Card>

      <section>
        <CardEyebrow className="mb-4">What this module will do</CardEyebrow>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {module.features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-5">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-zinc-100 text-zinc-700">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-3 text-[14px] font-semibold tracking-tight text-zinc-900">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] text-zinc-600 leading-relaxed">{f.body}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <CardEyebrow>Artifacts this module produces</CardEyebrow>
          <ul className="mt-3 space-y-2">
            {module.artifacts.map((a, i) => (
              <li key={i} className="text-[13px] text-zinc-700 flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <CardEyebrow>Templates included</CardEyebrow>
          <ul className="mt-3 space-y-2">
            {module.templates.map((t, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border divider px-3.5 py-2.5"
              >
                <div className="text-[13px] font-medium text-zinc-800">{t.title}</div>
                <Badge tone="neutral">{t.cadence}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

export type { Module };
