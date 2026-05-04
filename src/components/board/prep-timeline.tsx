"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const STEPS = [
  { day: -14, title: "Kickoff", body: "CoS sends pre-read template + asks to function owners.", owner: "CoS" },
  { day: -10, title: "Inputs back", body: "All function inputs received; CoS drafts the narrative.", owner: "CoS" },
  { day: -7, title: "Narrative lock", body: "CEO + CoS review draft and lock the strategic narrative.", owner: "CEO + CoS" },
  { day: -5, title: "Pre-read sent", body: "Pre-read sent to the board. No new content after this point.", owner: "CoS" },
  { day: -2, title: "Pre-meetings", body: "1:1s with key board members for previews. No surprises live.", owner: "CEO" },
  { day: 0, title: "Board meeting", body: "60% discussion, 40% review. Decisions are logged inline.", owner: "CEO + Board" },
  { day: 2, title: "Decisions memo", body: "Post-meeting decisions memo within 48 hours. Owners + dates.", owner: "CoS" },
];

export function PrepTimeline() {
  // Default board day = end of current quarter
  const boardDate = useMemo(() => {
    const d = new Date();
    const q = Math.floor(d.getMonth() / 3);
    return new Date(d.getFullYear(), q * 3 + 3, 0);
  }, []);

  const today = new Date();
  const daysToBoard = Math.ceil((boardDate.getTime() - today.getTime()) / 86400000);

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardEyebrow>Next board meeting</CardEyebrow>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
              {boardDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            <div className="mt-1 text-[13px] text-zinc-500">
              {daysToBoard > 0 ? `In ${daysToBoard} days` : daysToBoard === 0 ? "Today" : `${Math.abs(daysToBoard)} days ago`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={daysToBoard > 14 ? "emerald" : daysToBoard > 5 ? "amber" : "rose"} dot>
              {daysToBoard > 14
                ? "Plenty of runway"
                : daysToBoard > 5
                  ? "In the prep window"
                  : daysToBoard >= 0
                    ? "Pre-read should be out"
                    : "Post-meeting follow-up"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <CardEyebrow>The 2-week prep cadence</CardEyebrow>
        <div className="relative mt-6">
          {/* Vertical line */}
          <div className="absolute left-[28px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-200 via-fuchsia-200 to-emerald-200" />
          <ul className="space-y-5">
            {STEPS.map((s) => {
              const stepDate = new Date(boardDate);
              stepDate.setDate(stepDate.getDate() + s.day);
              const stepDays = Math.ceil((stepDate.getTime() - today.getTime()) / 86400000);
              const past = stepDays < 0;
              const next = stepDays >= 0 && stepDays < 3;
              return (
                <li key={s.day} className="relative pl-16">
                  <div
                    className={cn(
                      "absolute left-3 top-1 grid h-12 w-12 place-items-center rounded-full border-2 bg-white shadow-card text-[10.5px] font-mono font-semibold",
                      past
                        ? "border-emerald-300 text-emerald-700"
                        : next
                          ? "border-indigo-500 text-indigo-700 shadow-elevated"
                          : "border-zinc-200 text-zinc-500"
                    )}
                  >
                    {past ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : s.day === 0 ? (
                      <Flag className="h-4 w-4 text-indigo-600" />
                    ) : (
                      `T${s.day > 0 ? "+" : ""}${s.day}`
                    )}
                  </div>
                  <div className={cn(
                    "rounded-lg border p-4",
                    past ? "border-zinc-200 bg-zinc-50/40 opacity-70"
                      : next ? "border-indigo-300 bg-indigo-50/40"
                      : "border-zinc-200 bg-white"
                  )}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-zinc-900">{s.title}</span>
                        <Badge tone="neutral">{s.owner}</Badge>
                      </div>
                      <div className="text-[11px] text-zinc-500 inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stepDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div className="mt-1.5 text-[12.5px] text-zinc-600 leading-relaxed">{s.body}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>
    </div>
  );
}
