"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, FormRow } from "@/components/ui/input";
import { useCompanyProfile } from "@/components/providers/company-profile-provider";
import { useLocalStorage } from "@/lib/storage";
import { useMemo, useState } from "react";
import { Users2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownDocument } from "@/components/ui/markdown-view";

type Audience = "lead" | "all" | "advisors";

type UpdateDraft = {
  month: string;
  arr: string;
  newARRThisMonth: string;
  netNewLogos: string;
  cashOnHand: string;
  monthlyBurn: string;
  runwayMonths: string;
  topWin: string;
  topLoss: string;
  bigBet: string;
  asks: string;
};

const blankDraft: UpdateDraft = {
  month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  arr: "$3.4M",
  newARRThisMonth: "$210k",
  netNewLogos: "4 (incl. one tier-1)",
  cashOnHand: "$11.8M",
  monthlyBurn: "$465k (flat MoM)",
  runwayMonths: "25",
  topWin: "Closed Atlas Robotics — first design partner from the v2 platform; $180k ACV.",
  topLoss: "Lost Sierra Health to in-house build — confirms our suspicion that the segment isn't ready until v2 ships.",
  bigBet: "Land v2 GA on March 15. Two design-partner migrations are the gating risk; both on track.",
  asks: "1) Intros to 3 mid-market sales leaders we're recruiting against. 2) Feedback on the v2 launch positioning (deck attached).",
};

export function InvestorUpdate() {
  const { profile } = useCompanyProfile();
  const [draft, setDraft] = useLocalStorage<UpdateDraft>("investor-update-draft", blankDraft);
  const [audience, setAudience] = useState<Audience>("all");

  const markdown = useMemo(() => render(profile.name, draft, audience), [profile.name, draft, audience]);
  const filename = `${profile.name.toLowerCase().replace(/\s+/g, "-")}-investor-update-${draft.month.toLowerCase().replace(/\s+/g, "-")}.md`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <Card className="p-6 space-y-5">
        <div>
          <CardEyebrow>Editor</CardEyebrow>
          <h3 className="mt-1 text-base font-semibold text-zinc-900">Monthly investor update</h3>
          <p className="mt-1 text-[12.5px] text-zinc-500 leading-relaxed">
            Same template. Every month. The 5th. Forced narrative cadence sharpens internal thinking and
            removes the surprise factor before any fundraise.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Month" className="col-span-2">
            <Input value={draft.month} onChange={(e) => setDraft({ ...draft, month: e.target.value })} />
          </FormRow>
          <FormRow label="ARR">
            <Input value={draft.arr} onChange={(e) => setDraft({ ...draft, arr: e.target.value })} />
          </FormRow>
          <FormRow label="Net new ARR this month">
            <Input
              value={draft.newARRThisMonth}
              onChange={(e) => setDraft({ ...draft, newARRThisMonth: e.target.value })}
            />
          </FormRow>
          <FormRow label="Net new logos">
            <Input
              value={draft.netNewLogos}
              onChange={(e) => setDraft({ ...draft, netNewLogos: e.target.value })}
            />
          </FormRow>
          <FormRow label="Cash on hand">
            <Input value={draft.cashOnHand} onChange={(e) => setDraft({ ...draft, cashOnHand: e.target.value })} />
          </FormRow>
          <FormRow label="Monthly burn">
            <Input value={draft.monthlyBurn} onChange={(e) => setDraft({ ...draft, monthlyBurn: e.target.value })} />
          </FormRow>
          <FormRow label="Runway (months)">
            <Input
              value={draft.runwayMonths}
              onChange={(e) => setDraft({ ...draft, runwayMonths: e.target.value })}
            />
          </FormRow>
        </div>

        <FormRow label="Top win">
          <Textarea value={draft.topWin} onChange={(e) => setDraft({ ...draft, topWin: e.target.value })} rows={2} />
        </FormRow>
        <FormRow label="Top loss / lesson">
          <Textarea
            value={draft.topLoss}
            onChange={(e) => setDraft({ ...draft, topLoss: e.target.value })}
            rows={2}
          />
        </FormRow>
        <FormRow label="The big bet" hint="One sentence. The thing that, if it lands, defines the quarter.">
          <Textarea value={draft.bigBet} onChange={(e) => setDraft({ ...draft, bigBet: e.target.value })} rows={2} />
        </FormRow>
        <FormRow label="Asks" hint="Specific. Named where possible. Investors can't help if you don't ask.">
          <Textarea value={draft.asks} onChange={(e) => setDraft({ ...draft, asks: e.target.value })} rows={3} />
        </FormRow>
      </Card>

      <div className="flex flex-col gap-2.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center rounded-lg border divider bg-white p-0.5">
            {(
              [
                { id: "lead", label: "Lead" },
                { id: "all", label: "All investors" },
                { id: "advisors", label: "Advisors" },
              ] as const
            ).map((a) => (
              <button
                key={a.id}
                onClick={() => setAudience(a.id as Audience)}
                className={cn(
                  "px-2.5 h-7 text-[11px] font-medium rounded-md transition-colors",
                  audience === a.id ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
          <Badge tone="neutral">
            <Users2 className="h-3 w-3" />
            {audience === "lead"
              ? "Lead · includes confidential asks"
              : audience === "all"
                ? "All investors · no confidential asks"
                : "Advisors · high-level only"}
          </Badge>
        </div>
        <MarkdownDocument
          body={markdown}
          eyebrow="Investor update"
          title={`${profile.name} — ${draft.month}`}
          filename={filename}
          className="max-h-[900px]"
        />
      </div>
    </div>
  );
}

function render(company: string, d: UpdateDraft, audience: Audience): string {
  const showFinancials = audience !== "advisors";
  const showAsks = audience !== "advisors";
  const confidential = audience === "lead";

  const parts = [
    `# ${company} — ${d.month}`,
    "",
    `## The big bet`,
    d.bigBet,
    "",
  ];

  if (showFinancials) {
    parts.push(
      "## By the numbers",
      `- ARR: **${d.arr}**`,
      `- Net new ARR this month: ${d.newARRThisMonth}`,
      `- Net new logos: ${d.netNewLogos}`,
      `- Cash: ${d.cashOnHand}`,
      `- Burn: ${d.monthlyBurn}`,
      `- Runway: ${d.runwayMonths} months`,
      ""
    );
  }

  parts.push(
    "## Top win",
    d.topWin,
    "",
    "## Top loss / lesson",
    d.topLoss,
    ""
  );

  if (showAsks) {
    parts.push("## Asks", d.asks, "");
  }

  if (confidential) {
    parts.push(
      "---",
      "_Confidential — for the lead investor only. Includes ask details and cap-table-adjacent notes not shared in the broader update._"
    );
  } else {
    parts.push("---", `_Sent to ${audience === "all" ? "all investors" : "advisors"} on the 5th, every month._`);
  }

  return parts.join("\n");
}
