import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className }: Props) {
  return (
    <header className={cn("flex flex-col gap-6 mb-8", className)}>
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          {eyebrow && (
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
              {eyebrow}
            </div>
          )}
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 leading-[1.1]">
            {title}
          </h1>
          {description && (
            <p className="text-[15px] text-zinc-500 max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
