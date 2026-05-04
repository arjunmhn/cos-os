"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { NAV, NAV_GROUPS } from "@/lib/nav";
import { X } from "lucide-react";

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "md:hidden fixed inset-0 z-50 transition-opacity duration-200",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={cn(
          "absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-elevated flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-white shadow-elevated">
              <span className="text-[13px] font-bold tracking-tight">C</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-zinc-900">Chief of Staff OS</div>
              <div className="text-[10.5px] text-zinc-400 uppercase tracking-[0.12em]">
                v0.1 · Starter Kit
              </div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md hover:bg-zinc-100 text-zinc-500"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scroll-dim px-3 pb-5">
          {NAV_GROUPS.map((group) => {
            const items = NAV.filter((i) => i.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="mt-3">
                <div className="px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                  {group}
                </div>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-zinc-900 text-white"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 mt-0.5 shrink-0",
                              active ? "text-white" : "text-zinc-400"
                            )}
                          />
                          <span className="flex flex-col leading-tight">
                            <span className="font-medium">{item.label}</span>
                            <span
                              className={cn(
                                "text-[11px] mt-0.5",
                                active ? "text-zinc-300" : "text-zinc-400"
                              )}
                            >
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
