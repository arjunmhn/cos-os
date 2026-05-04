import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center px-6 py-14 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/40",
        className
      )}
    >
      {icon && (
        <div className="grid h-10 w-10 place-items-center rounded-full bg-white border border-zinc-200 text-zinc-400">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <div className="text-sm font-semibold text-zinc-800">{title}</div>
        {description && <div className="text-xs text-zinc-500 leading-relaxed">{description}</div>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
