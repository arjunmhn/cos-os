"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV, NAV_GROUPS } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-16 lg:w-64 shrink-0 flex-col border-r divider bg-white/70 backdrop-blur-sm">
      {/* Header */}
      <div className="px-3 lg:px-5 pt-5 pb-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-white shadow-elevated mx-auto lg:mx-0 shrink-0">
            <span className="text-[13px] font-bold tracking-tight">C</span>
          </div>
          <div className="hidden lg:block leading-tight">
            <div className="text-sm font-semibold text-zinc-900">Chief of Staff OS</div>
            <div className="text-[10.5px] text-zinc-400 uppercase tracking-[0.12em]">
              v0.1 · Starter Kit
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scroll-dim px-2 lg:px-3 pb-5">
        {NAV_GROUPS.map((group) => {
          const items = NAV.filter((i) => i.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="mt-3">
              <div className="hidden lg:block px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                {group}
              </div>
              <div className="lg:hidden mx-2 mt-2 mb-1 h-px bg-zinc-200/70 first:hidden" />
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
                        title={item.label}
                        className={cn(
                          "group flex items-center lg:items-start gap-2.5 rounded-lg px-2 lg:px-3 py-2 text-sm transition-colors",
                          "justify-center lg:justify-start",
                          active
                            ? "bg-zinc-900 text-white shadow-card"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 lg:mt-0.5",
                            active ? "text-white" : "text-zinc-400 group-hover:text-zinc-700"
                          )}
                        />
                        <span className="hidden lg:flex flex-col leading-tight">
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

      {/* Footer */}
      <div className="hidden lg:block px-4 py-4 border-t divider">
        <div className="text-[10.5px] uppercase tracking-[0.12em] text-zinc-400 mb-2">
          Quick reference
        </div>
        <p className="text-[12px] text-zinc-500 leading-relaxed">
          Let computers do computer things.
          <span className="block text-zinc-400 mt-1">— Elise Kennedy, Your Chief of Staff</span>
        </p>
      </div>
    </aside>
  );
}
