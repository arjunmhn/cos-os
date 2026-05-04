"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DATA_ROOM } from "@/lib/content/board";
import { CheckCircle2, FolderOpen, FolderLock, AlertCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const STATUS_META = {
  fresh: { tone: "emerald", icon: CheckCircle2, label: "Fresh" },
  stale: { tone: "amber", icon: AlertCircle, label: "Stale" },
  missing: { tone: "rose", icon: Circle, label: "Missing" },
} as const;

export function DataRoom() {
  const stats = useMemo(() => {
    const all = DATA_ROOM.flatMap((f) => f.files);
    return {
      fresh: all.filter((f) => f.status === "fresh").length,
      stale: all.filter((f) => f.status === "stale").length,
      missing: all.filter((f) => f.status === "missing").length,
      total: all.length,
    };
  }, []);

  return (
    <div className="space-y-5">
      <Card className="p-6 bg-gradient-to-br from-white to-cyan-50/30 border-cyan-100/60">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-500/10 text-cyan-700 shrink-0">
            <FolderLock className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <CardEyebrow className="text-cyan-700">Always-ready</CardEyebrow>
            <h3 className="mt-1 text-base font-semibold text-zinc-900">
              The data room is a system, not a fundraise project.
            </h3>
            <p className="mt-2 text-[13px] text-zinc-600 leading-relaxed max-w-3xl">
              Keep the room fresh between rounds. When the next process opens, the only work is access
              control — not assembly. Stale and missing artifacts are surfaced here so they get fixed when
              the cost is low.
            </p>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Badge tone="emerald" dot>{stats.fresh} fresh</Badge>
              <Badge tone="amber" dot>{stats.stale} stale</Badge>
              <Badge tone="rose" dot>{stats.missing} missing</Badge>
              <span className="text-[11px] text-zinc-500 ml-2">
                {Math.round((stats.fresh / stats.total) * 100)}% ready
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {DATA_ROOM.map((folder) => {
          const folderStats = {
            fresh: folder.files.filter((f) => f.status === "fresh").length,
            total: folder.files.length,
          };
          const allFresh = folderStats.fresh === folderStats.total;
          return (
            <Card key={folder.name} className="p-0 overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b divider bg-zinc-50/60">
                <div className="flex items-center gap-2.5">
                  <FolderOpen
                    className={cn("h-4 w-4", allFresh ? "text-emerald-600" : "text-amber-600")}
                  />
                  <span className="text-[13px] font-semibold text-zinc-900">{folder.name}</span>
                </div>
                <Badge tone={allFresh ? "emerald" : "amber"}>
                  {folderStats.fresh}/{folderStats.total} ready
                </Badge>
              </div>
              <ul className="divide-y divider">
                {folder.files.map((file, i) => {
                  const meta = STATUS_META[file.status];
                  const Icon = meta.icon;
                  return (
                    <li key={i} className="flex items-center gap-3 px-5 py-2.5 hover:bg-zinc-50/40">
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          file.status === "fresh" && "text-emerald-600",
                          file.status === "stale" && "text-amber-600",
                          file.status === "missing" && "text-rose-500"
                        )}
                      />
                      <span
                        className={cn(
                          "flex-1 text-[12.5px] truncate",
                          file.status === "missing" && "text-zinc-400 line-through",
                          file.status !== "missing" && "text-zinc-700"
                        )}
                      >
                        {file.name}
                      </span>
                      <Badge tone={meta.tone as never}>{meta.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
