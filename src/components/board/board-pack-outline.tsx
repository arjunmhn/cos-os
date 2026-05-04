"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BOARD_SECTIONS } from "@/lib/content/board";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BoardPackOutline() {
  const [openId, setOpenId] = useState<string>(BOARD_SECTIONS[0].id);
  return (
    <div className="space-y-3">
      <Card className="p-5 bg-gradient-to-br from-white to-indigo-50/40 border-indigo-100/60">
        <CardEyebrow className="text-indigo-700">The standard pack</CardEyebrow>
        <h3 className="mt-1 text-base font-semibold text-zinc-900">
          Six sections. Same six every quarter.
        </h3>
        <p className="mt-2 text-[13px] text-zinc-600 leading-relaxed max-w-3xl">
          A consistent outline removes the &ldquo;what should I include?&rdquo; conversation forever. Boards learn the
          shape, you draft against muscle memory, and quarter-over-quarter comparison becomes trivial.
        </p>
      </Card>

      {BOARD_SECTIONS.map((s, i) => {
        const open = openId === s.id;
        return (
          <Card key={s.id} className={cn("p-0 overflow-hidden", open && "shadow-elevated")}>
            <button
              onClick={() => setOpenId(open ? "" : s.id)}
              className="w-full text-left flex items-center gap-4 px-6 py-4 hover:bg-zinc-50/60 transition-colors"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-900 text-white text-[12px] font-mono shrink-0">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[14px] font-semibold tracking-tight text-zinc-900">
                    {s.title}
                  </h3>
                  <Badge tone="neutral">{s.pages}</Badge>
                </div>
                <p className="mt-1 text-[12.5px] text-zinc-500 leading-relaxed line-clamp-1">
                  {s.prompt}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-zinc-400 transition-transform shrink-0",
                  open && "rotate-180"
                )}
              />
            </button>
            {open && (
              <div className="px-6 pb-5 border-t divider">
                <div className="mt-4 rounded-lg bg-amber-50/60 border border-amber-200/60 px-4 py-3">
                  <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-amber-700">
                    Drafting prompt
                  </div>
                  <div className="mt-1 text-[13px] text-zinc-800 leading-relaxed">{s.prompt}</div>
                </div>
                <div className="mt-4">
                  <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-2">
                    What this section must contain
                  </div>
                  <ul className="space-y-1.5">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="text-[13px] text-zinc-700 flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
