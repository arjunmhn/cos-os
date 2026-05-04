import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone =
  | "neutral"
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "fuchsia"
  | "cyan";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200/60",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200/60",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  amber: "bg-amber-50 text-amber-700 ring-amber-200/60",
  rose: "bg-rose-50 text-rose-700 ring-rose-200/60",
  fuchsia: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/60",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200/60",
};

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  dot?: boolean;
};

export function Badge({ tone = "neutral", dot, className, children, ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-zinc-400": tone === "neutral",
            "bg-indigo-500": tone === "indigo",
            "bg-emerald-500": tone === "emerald",
            "bg-amber-500": tone === "amber",
            "bg-rose-500": tone === "rose",
            "bg-fuchsia-500": tone === "fuchsia",
            "bg-cyan-500": tone === "cyan",
          })}
        />
      )}
      {children}
    </span>
  );
}
