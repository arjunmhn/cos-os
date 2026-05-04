"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Input, Textarea, Select, FormRow } from "@/components/ui/input";
import { useLocalStorage } from "@/lib/storage";
import { DEFAULT_RETROSTUDY, type Retrostudy } from "@/lib/content/gtm";
import { useMemo } from "react";
import { MarkdownDocument } from "@/components/ui/markdown-view";

export function RetrostudyBuilder() {
  const [study, setStudy] = useLocalStorage<Retrostudy>("retrostudy-draft", DEFAULT_RETROSTUDY);

  const calcs = useMemo(() => {
    const noShowReduction = study.preNoShowRate - study.postNoShowRate; // pp
    // Estimate visits per month (approx) — we use a stable factor for demo.
    const visitsPerMonth = 1200;
    const recoveredVisits = (noShowReduction / 100) * visitsPerMonth;
    const noShowDollars = recoveredVisits * study.avgVisitRevenue;
    const fteHoursSaved = study.preFteHours - study.postFteHours;
    const fteDollars = fteHoursSaved * study.fullyLoadedHourlyCost;
    const monthly = noShowDollars + fteDollars;
    const annual = monthly * 12;
    return { noShowReduction, recoveredVisits, noShowDollars, fteHoursSaved, fteDollars, monthly, annual };
  }, [study]);

  const markdown = useMemo(() => render(study, calcs), [study, calcs]);
  const filename = `retrostudy-${(study.customer || "customer").toLowerCase().replace(/\s+/g, "-")}.md`;

  return (
    <div className="space-y-5">
      <Card className="p-5 bg-gradient-to-br from-white to-fuchsia-50/30 border-fuchsia-100/60">
        <CardEyebrow className="text-fuchsia-700">Per-customer retrostudy</CardEyebrow>
        <h3 className="mt-1 text-base font-semibold text-zinc-900">
          The narrative for each customer of how it has been vs. how it would have been.
        </h3>
        <p className="mt-2 text-[13px] text-zinc-600 leading-relaxed max-w-3xl">
          Lever-by-lever attribution turned into a per-account artifact. Sales pulls this into proposals.
          CS pulls this into renewal conversations. The customer reads the dollar number aloud back to you.
        </p>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-6 space-y-4">
          <div>
            <CardEyebrow>Inputs</CardEyebrow>
            <h3 className="mt-1 text-base font-semibold text-zinc-900">Baseline + post-Valerie deltas</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Customer">
              <Input
                value={study.customer}
                onChange={(e) => setStudy({ ...study, customer: e.target.value })}
              />
            </FormRow>
            <FormRow label="Segment">
              <Select
                value={study.segment}
                onChange={(e) => setStudy({ ...study, segment: e.target.value as Retrostudy["segment"] })}
              >
                <option value="smb">SMB</option>
                <option value="mid-market">Mid-market</option>
                <option value="enterprise">Enterprise</option>
              </Select>
            </FormRow>
            <FormRow label="Baseline window (months)">
              <Input
                type="number"
                value={study.baselineMonths}
                onChange={(e) => setStudy({ ...study, baselineMonths: Number(e.target.value) || 0 })}
              />
            </FormRow>
            <FormRow label="Avg visit revenue ($)">
              <Input
                type="number"
                value={study.avgVisitRevenue}
                onChange={(e) => setStudy({ ...study, avgVisitRevenue: Number(e.target.value) || 0 })}
              />
            </FormRow>
            <FormRow label="Pre no-show rate (%)">
              <Input
                type="number"
                value={study.preNoShowRate}
                onChange={(e) => setStudy({ ...study, preNoShowRate: Number(e.target.value) || 0 })}
              />
            </FormRow>
            <FormRow label="Post no-show rate (%)">
              <Input
                type="number"
                value={study.postNoShowRate}
                onChange={(e) => setStudy({ ...study, postNoShowRate: Number(e.target.value) || 0 })}
              />
            </FormRow>
            <FormRow label="Pre FTE hours / month">
              <Input
                type="number"
                value={study.preFteHours}
                onChange={(e) => setStudy({ ...study, preFteHours: Number(e.target.value) || 0 })}
              />
            </FormRow>
            <FormRow label="Post FTE hours / month">
              <Input
                type="number"
                value={study.postFteHours}
                onChange={(e) => setStudy({ ...study, postFteHours: Number(e.target.value) || 0 })}
              />
            </FormRow>
            <FormRow label="Fully-loaded $/hour" className="col-span-2">
              <Input
                type="number"
                value={study.fullyLoadedHourlyCost}
                onChange={(e) =>
                  setStudy({ ...study, fullyLoadedHourlyCost: Number(e.target.value) || 0 })
                }
              />
            </FormRow>
          </div>

          <FormRow label="Notes / methodology">
            <Textarea
              value={study.notes}
              onChange={(e) => setStudy({ ...study, notes: e.target.value })}
              rows={3}
            />
          </FormRow>
        </Card>

        <div className="space-y-5">
          {/* Calculated headline */}
          <Card className="p-6 bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200">
            <CardEyebrow className="text-emerald-700">The number you put in the proposal</CardEyebrow>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-[42px] font-semibold tracking-tight text-emerald-700 leading-none">
                ${(calcs.annual / 1e6).toFixed(2)}M
              </div>
              <div className="text-[13px] text-zinc-500">/ year impact</div>
            </div>
            <div className="mt-3 text-[13px] text-zinc-700">
              ${(calcs.monthly / 1000).toFixed(0)}k per month, attributable to two levers below.
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border divider bg-white p-3.5">
                <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
                  No-show recovery
                </div>
                <div className="mt-1 text-[18px] font-semibold text-zinc-900">
                  ${(calcs.noShowDollars / 1000).toFixed(0)}k/mo
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  −{calcs.noShowReduction.toFixed(1)} pp · {Math.round(calcs.recoveredVisits)} visits recovered
                </div>
              </div>
              <div className="rounded-lg border divider bg-white p-3.5">
                <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
                  FTE hours saved
                </div>
                <div className="mt-1 text-[18px] font-semibold text-zinc-900">
                  ${(calcs.fteDollars / 1000).toFixed(0)}k/mo
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {calcs.fteHoursSaved} hours × ${study.fullyLoadedHourlyCost}/hr loaded
                </div>
              </div>
            </div>
          </Card>

          <MarkdownDocument
            body={markdown}
            eyebrow="Retrostudy artifact"
            title={study.customer || "Customer retrostudy"}
            filename={filename}
            className="max-h-[520px]"
          />
        </div>
      </div>
    </div>
  );
}

type Calcs = {
  noShowReduction: number;
  recoveredVisits: number;
  noShowDollars: number;
  fteHoursSaved: number;
  fteDollars: number;
  monthly: number;
  annual: number;
};

function render(s: Retrostudy, c: Calcs): string {
  return `# ${s.customer} — Retrostudy
**Segment:** ${s.segment}  ·  **Baseline window:** ${s.baselineMonths} months pre-Valerie

## How it has been
- No-show rate: ${s.preNoShowRate}%
- FTE hours per month on coordination: ${s.preFteHours}

## How it has been since Valerie
- No-show rate: ${s.postNoShowRate}%  (−${c.noShowReduction.toFixed(1)} pp)
- FTE hours per month on coordination: ${s.postFteHours}  (−${c.fteHoursSaved} hours)

## What that's worth, monthly
- No-show recovery: $${(c.noShowDollars / 1000).toFixed(0)}k  (≈ ${Math.round(c.recoveredVisits)} visits recovered × $${s.avgVisitRevenue})
- FTE hours saved: $${(c.fteDollars / 1000).toFixed(0)}k  (${c.fteHoursSaved} hours × $${s.fullyLoadedHourlyCost} fully-loaded)
- **Monthly total: $${(c.monthly / 1000).toFixed(0)}k**
- **Annualized: $${(c.annual / 1e6).toFixed(2)}M**

## Methodology
${s.notes}

---
_Per-customer retrostudy · Generated by Chief of Staff OS · Pulled into the proposal as a per-account tile in the CRM._
`;
}

