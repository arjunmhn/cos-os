"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, FormRow, Select } from "@/components/ui/input";
import { RAMP_PLAN_30_60_90 } from "@/lib/content/moc";
import { useLocalStorage } from "@/lib/storage";
import { DEFAULT_ROLES, type RoleMoc } from "@/lib/content/people";
import { useMemo } from "react";
import { AlertTriangle, CalendarCheck2, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownDocument } from "@/components/ui/markdown-view";

type Day90Review = {
  hireName: string;
  roleId: string;
  startDate: string;
  outcomesProgress: string;
  behaviorsObserved: string;
  gaps: string;
  hireAgain: "yes" | "no" | "with-coaching";
  selfAssessmentReceived: boolean;
};

const blankReview: Day90Review = {
  hireName: "",
  roleId: "",
  startDate: "",
  outcomesProgress: "",
  behaviorsObserved: "",
  gaps: "",
  hireAgain: "yes",
  selfAssessmentReceived: false,
};

export function OnboardingTab() {
  const [roles] = useLocalStorage<RoleMoc[]>("roles", DEFAULT_ROLES);
  const [review, setReview] = useLocalStorage<Day90Review>("day90-draft", blankReview);

  const role = useMemo(
    () => roles.find((r) => r.id === review.roleId) || roles[0],
    [roles, review.roleId]
  );

  const markdown = useMemo(() => toMarkdown(review, role), [review, role]);
  const filename = `day90-review-${(review.hireName || "untitled").toLowerCase().replace(/\s+/g, "-")}.md`;

  return (
    <div className="space-y-8">
      {/* Visual 30/60/90 timeline */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardEyebrow>The ramp</CardEyebrow>
            <h3 className="mt-1 text-lg font-semibold text-zinc-900">30 / 60 / 90 plan</h3>
            <p className="mt-1 text-[13px] text-zinc-500 max-w-2xl">
              Day-90 must be written. Verbal-only feedback compounds hiring mistakes silently. Three windows,
              three written checkpoints, one decision.
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-7 left-6 right-6 h-0.5 bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-emerald-300 hidden md:block" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {RAMP_PLAN_30_60_90.map((window, i) => {
              const tones = ["bg-indigo-500", "bg-fuchsia-500", "bg-emerald-500"];
              const cardTones = [
                "from-indigo-50/50 to-white border-indigo-100",
                "from-fuchsia-50/50 to-white border-fuchsia-100",
                "from-emerald-50/50 to-white border-emerald-100",
              ];
              return (
                <Card key={window.window} className={cn("p-5 bg-gradient-to-br", cardTones[i])}>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full grid place-items-center text-white font-bold text-[15px] shadow-elevated relative z-10",
                        tones[i]
                      )}
                    >
                      {(i + 1) * 30}
                    </div>
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
                        {window.window}
                      </div>
                      <div className="text-[14px] font-semibold text-zinc-900">{window.purpose}</div>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mt-4">
                    {window.expectations.map((e, j) => (
                      <li key={j} className="text-[12.5px] text-zinc-700 flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t divider flex items-start gap-2 text-[11.5px] text-rose-700/80">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{window.danger}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Day-90 written review form */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardEyebrow className="text-rose-600">Non-negotiable</CardEyebrow>
            <h3 className="mt-1 text-lg font-semibold text-zinc-900">Day-90 written review template</h3>
            <p className="mt-1 text-[13px] text-zinc-500 max-w-2xl">
              The outcomes the role was hired against are the rubric. Self-assessment from the report on the same
              fields. Both signed before the meeting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Card className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Hire name">
                <Input
                  value={review.hireName}
                  onChange={(e) => setReview({ ...review, hireName: e.target.value })}
                />
              </FormRow>
              <FormRow label="Start date">
                <Input
                  type="date"
                  value={review.startDate}
                  onChange={(e) => setReview({ ...review, startDate: e.target.value })}
                />
              </FormRow>
              <FormRow label="Role" className="col-span-2">
                <Select
                  value={review.roleId}
                  onChange={(e) => setReview({ ...review, roleId: e.target.value })}
                >
                  <option value="">— Select role —</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </Select>
              </FormRow>
            </div>

            {role && role.outcomes.filter(Boolean).length > 0 && (
              <div className="rounded-lg bg-zinc-50 border divider p-4">
                <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-2">
                  Outcomes from the MOC (the rubric)
                </div>
                <ol className="space-y-1">
                  {role.outcomes.filter(Boolean).map((o, i) => (
                    <li key={i} className="text-[12px] text-zinc-700 flex items-start gap-2">
                      <span className="text-zinc-400 font-mono text-[10px] mt-0.5 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <FormRow label="Outcomes progress" hint="For each outcome, what's the evidence after 90 days?">
              <Textarea
                value={review.outcomesProgress}
                onChange={(e) => setReview({ ...review, outcomesProgress: e.target.value })}
                rows={5}
              />
            </FormRow>
            <FormRow label="Behaviors observed">
              <Textarea
                value={review.behaviorsObserved}
                onChange={(e) => setReview({ ...review, behaviorsObserved: e.target.value })}
                rows={3}
              />
            </FormRow>
            <FormRow label="Gaps + plan to close them">
              <Textarea
                value={review.gaps}
                onChange={(e) => setReview({ ...review, gaps: e.target.value })}
                rows={3}
              />
            </FormRow>

            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Would you hire again?">
                <Select
                  value={review.hireAgain}
                  onChange={(e) =>
                    setReview({ ...review, hireAgain: e.target.value as Day90Review["hireAgain"] })
                  }
                >
                  <option value="yes">Yes, no hesitation</option>
                  <option value="with-coaching">Yes, with coaching</option>
                  <option value="no">No</option>
                </Select>
              </FormRow>
              <FormRow label="Self-assessment received">
                <button
                  onClick={() =>
                    setReview({ ...review, selfAssessmentReceived: !review.selfAssessmentReceived })
                  }
                  className={cn(
                    "h-10 rounded-lg border text-[13px] font-medium transition-colors",
                    review.selfAssessmentReceived
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  )}
                >
                  {review.selfAssessmentReceived ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> Received
                    </span>
                  ) : (
                    "Mark received"
                  )}
                </button>
              </FormRow>
            </div>
          </Card>

          <MarkdownDocument
            body={markdown}
            eyebrow="Day-90 written review"
            title={review.hireName || "Untitled hire"}
            filename={filename}
            className="max-h-[800px]"
          />
        </div>
      </section>

      {/* Performance cadence card */}
      <section>
        <Card className="p-6 bg-gradient-to-br from-white to-amber-50/40 border-amber-100/60">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/10 text-amber-700 shrink-0">
              <CalendarCheck2 className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <CardEyebrow className="text-amber-700">After Day-90</CardEyebrow>
              <h3 className="mt-1 text-base font-semibold text-zinc-900">
                Performance cadence — quarterly written, no surprises in the annual.
              </h3>
              <p className="mt-2 text-[13px] text-zinc-600 leading-relaxed max-w-3xl">
                Every quarter, a 1-page written check against the same outcomes from the MOC. Same rubric,
                same scoring, same self-assessment from the report. Annual reviews become summaries of four
                quarterlies, not surprises.
              </p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Badge tone="amber" dot>Q1 review · April 30</Badge>
                <Badge tone="neutral">Q2 · July 31</Badge>
                <Badge tone="neutral">Q3 · October 31</Badge>
                <Badge tone="neutral">Q4 + Annual · January 31</Badge>
              </div>
            </div>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </div>
        </Card>
      </section>
    </div>
  );
}

function toMarkdown(r: Day90Review, role?: RoleMoc): string {
  return `# Day-90 Written Review — ${r.hireName || "—"}
**Role:** ${role?.title || "—"}  ·  **Start date:** ${r.startDate || "—"}  ·  **Reviewed:** ${new Date().toLocaleDateString()}

## Outcomes from the MOC
${role ? role.outcomes.filter(Boolean).map((o, i) => `${i + 1}. ${o}`).join("\n") : "—"}

## Outcomes progress (after 90 days)
${r.outcomesProgress || "—"}

## Behaviors observed
${r.behaviorsObserved || "—"}

## Gaps + plan to close them
${r.gaps || "—"}

## Would you hire again?
**${
    r.hireAgain === "yes" ? "Yes, no hesitation" : r.hireAgain === "with-coaching" ? "Yes, with coaching" : "No"
  }**

## Self-assessment from report
${r.selfAssessmentReceived ? "✓ Received" : "✗ Not yet received"}

---
_Day-90 review must be written. Generated by Chief of Staff OS._
`;
}
