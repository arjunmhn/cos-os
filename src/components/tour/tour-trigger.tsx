"use client";

import { Compass } from "lucide-react";
import { useTour } from "./tour-provider";
import { cn } from "@/lib/utils";

export function TourTrigger({ className }: { className?: string }) {
  const { start, active } = useTour();
  return (
    <button
      onClick={start}
      className={cn(
        "inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md text-[12.5px] font-medium transition-colors",
        active
          ? "text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100",
        className
      )}
      title="Take a 90-second tour"
    >
      <Compass className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Tour</span>
    </button>
  );
}
