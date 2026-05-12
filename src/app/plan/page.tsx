"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { MarkdownDocument } from "@/components/ui/markdown-view";
import { useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import { useCompanyProfile } from "@/components/providers/company-profile-provider";
import { DEFAULT_OKRS, DEFAULT_DECISIONS } from "@/lib/content/cadence";
import {
  DEFAULT_ROLES,
  DEFAULT_CANDIDATES,
  type RoleMoc,
  type Candidate,
} from "@/lib/content/people";
import { DEFAULT_DEALS, type Deal } from "@/lib/content/gtm";
import { KPI_SERIES } from "@/lib/content/board";
import type { Decision, Objective } from "@/lib/types";
import type { KpiSnapshot } from "@/lib/cos-persona";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileText,
  RotateCw,
  Sparkles,
  Wand2,
} from "lucide-react";

export default function PlanPage() {
  const { profile } = useCompanyProfile();
  const [okrs] = useLocalStorage<Objective[]>("okrs", DEFAULT_OKRS as Objective[]);
  const [decisions] = useLocalStorage<Decision[]>("decisions", DEFAULT_DECISIONS as Decision[]);
  const [roles] = useLocalStorage<RoleMoc[]>("roles", DEFAULT_ROLES);
  const [candidates] = useLocalStorage<Candidate[]>("candidates", DEFAULT_CANDIDATES);
  const [deals] = useLocalStorage<Deal[]>("deals", DEFAULT_DEALS);

  const [plan, setPlan] = useLocalStorage<string>("plan-draft", "");
  const [extraContext, setExtraContext] = useState("");
  const [showExtra, setShowExtra] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (generating) return;
    setError(null);
    setGenerating(true);

    const kpis: KpiSnapshot[] = KPI_SERIES.map((k) => ({
      id: k.id,
      label: k.label,
      unit: k.unit,
      latest: k.data[k.data.length - 1].value,
      prev: k.data[k.data.length - 2].value,
      target: k.target,
      series: k.data.map((d) => ({ month: d.month, value: d.value })),
    }));

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          osState: { profile, okrs, decisions, roles, candidates, deals, kpis },
          extraContext: extraContext.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else if (typeof data.content === "string" && data.content.length > 0) {
        setPlan(data.content);
      } else {
        setError("Empty response.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const filename = `30-day-plan-${(profile.cosName || "candidate")
    .toLowerCase()
    .replace(/\s+/g, "-")}-at-${profile.name.toLowerCase().replace(/\s+/g, "-")}.md`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="30-Day Plan"
        title="A pre-read deliverable for your next CoS application."
        description="Generate a polished, opinionated first-30-days plan tied to the live OS state. Sized for a busy founder to skim in 90 seconds. Copy as markdown or download as .md to attach to applications."
        actions={
          plan ? (
            <Button variant="outline" onClick={generate} disabled={generating}>
              <RotateCw className="h-3.5 w-3.5" /> Regenerate
            </Button>
          ) : null
        }
      />

      {/* GENERATOR CARD */}
      <Card className="p-0 overflow-hidden bg-gradient-to-br from-white via-white to-fuchsia-50/30 border-fuchsia-100/60">
        <div className="px-5 py-4 border-b divider flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-white shadow-elevated shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <CardEyebrow className="text-fuchsia-600">Deliverable generator</CardEyebrow>
            <h3 className="mt-0.5 text-[15px] font-semibold tracking-tight text-zinc-900">
              First 30 Days @ {profile.name}
            </h3>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-[12.5px] text-zinc-600 leading-relaxed">
            The model reads <span className="font-semibold">{okrs.length}</span> objectives,{" "}
            <span className="font-semibold">{decisions.length}</span> decisions,{" "}
            <span className="font-semibold">{deals.length}</span> deals,{" "}
            <span className="font-semibold">{roles.length}</span> open roles, and your company profile — then
            drafts a structured Week 1 → Day 30 plan in {profile.cosName}&apos;s voice. Anchored in named
            OKRs, deal names, and the strategic moment.
          </p>

          <button
            type="button"
            onClick={() => setShowExtra((v) => !v)}
            className="text-[11.5px] text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
          >
            {showExtra ? (
              <>
                <ChevronUp className="h-3 w-3" /> Hide extra context
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Add extra context (optional)
              </>
            )}
          </button>

          {showExtra && (
            <Textarea
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Anything you want the model to factor in — specifics from the JD, a conversation you had with the founder, a constraint you want the plan to respect."
              rows={4}
              className="font-mono text-[12px]"
              disabled={generating}
            />
          )}

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-fuchsia-500" />
              <span>Sonnet 4.6 · ~20–40s generation</span>
            </div>
            <Button variant="gradient" onClick={generate} disabled={generating}>
              {generating ? (
                <>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
                  <span>Drafting · 20–40s</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>{plan ? "Regenerate plan" : "Generate the plan"}</span>
                </>
              )}
            </Button>
          </div>

          {generating && (
            <div className="rounded-lg bg-indigo-50/60 border border-indigo-200/60 px-4 py-3 text-[12.5px] text-indigo-900 leading-relaxed">
              Drafting a structured Week 1 → Day 30 plan grounded in your company&apos;s OKRs, deals, and
              strategic moment. Takes 20–40 seconds.
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-[12.5px] text-rose-800 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="min-w-0 break-words">{error}</span>
            </div>
          )}
        </div>
      </Card>

      {/* OUTPUT */}
      {plan && (
        <MarkdownDocument
          body={plan}
          eyebrow="30-Day Plan"
          title={`${profile.cosName || "Candidate"} @ ${profile.name}`}
          filename={filename}
        />
      )}

      {/* EMPTY-STATE TIPS */}
      {!plan && !generating && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="grid h-8 w-8 place-items-center rounded-md bg-indigo-50 text-indigo-700 mb-2">
                <ClipboardCheck className="h-4 w-4" />
              </div>
              <div className="text-[13px] font-semibold text-zinc-900">Adapt first</div>
              <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed">
                Run <span className="font-mono">/profile</span> &rarr; Adapt with the target company&apos;s
                JD. The plan then anchors in *their* OKRs and deals, not the generic sample data.
              </p>
            </div>
            <div>
              <div className="grid h-8 w-8 place-items-center rounded-md bg-fuchsia-50 text-fuchsia-700 mb-2">
                <Wand2 className="h-4 w-4" />
              </div>
              <div className="text-[13px] font-semibold text-zinc-900">Generate the plan</div>
              <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed">
                One click. The model reads your full OS state and produces a Week 1 / Week 2 /
                Weeks 3–4 / Day 30 deliverables / Watch-outs structure.
              </p>
            </div>
            <div>
              <div className="grid h-8 w-8 place-items-center rounded-md bg-emerald-50 text-emerald-700 mb-2">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="text-[13px] font-semibold text-zinc-900">Attach to applications</div>
              <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed">
                Copy as markdown or download .md. Use it as a pre-read for the next interview, or attach
                to your application as a deliverable that proves you&apos;ve done the work.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t divider">
            <Badge tone="indigo" dot>
              Bonus
            </Badge>
            <p className="mt-2 text-[12px] text-zinc-500 leading-relaxed">
              The output uses the OS&apos;s callout, markdown tables, and section-card primitives — so
              it renders as a polished document, not raw text.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
