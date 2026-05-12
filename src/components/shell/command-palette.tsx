"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NAV } from "@/lib/nav";
import { useLocalStorage } from "@/lib/storage";
import { DEFAULT_OKRS, DEFAULT_DECISIONS } from "@/lib/content/cadence";
import { DEFAULT_ROLES, DEFAULT_CANDIDATES, type RoleMoc, type Candidate } from "@/lib/content/people";
import { DEFAULT_DEALS, SEGMENT_LABEL, STAGE_LABEL, type Deal } from "@/lib/content/gtm";
import type { Decision, Objective } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Building2,
  CalendarClock,
  ClipboardList,
  CornerDownLeft,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Presentation,
  ScrollText,
  Search,
  Target,
  TrendingUp,
  User,
  Users2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SearchItem = {
  id: string;
  group: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  href: string;
  hash?: string;
};

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [okrs] = useLocalStorage<Objective[]>("okrs", DEFAULT_OKRS as Objective[]);
  const [decisions] = useLocalStorage<Decision[]>("decisions", DEFAULT_DECISIONS as Decision[]);
  const [roles] = useLocalStorage<RoleMoc[]>("roles", DEFAULT_ROLES);
  const [candidates] = useLocalStorage<Candidate[]>("candidates", DEFAULT_CANDIDATES);
  const [deals] = useLocalStorage<Deal[]>("deals", DEFAULT_DEALS);

  const items = useMemo<SearchItem[]>(() => {
    const navItems: SearchItem[] = NAV.map((n) => ({
      id: `nav-${n.href}`,
      group: "Pages",
      label: n.label,
      sublabel: n.description,
      icon: n.icon,
      href: n.href,
    }));
    const okrItems: SearchItem[] = okrs.flatMap((o) => [
      {
        id: `okr-${o.id}`,
        group: "Objectives",
        label: o.title,
        sublabel: `${o.quarter} · ${o.owner}`,
        icon: Target,
        href: "/cadence",
      },
      ...o.keyResults.map((kr) => ({
        id: `kr-${kr.id}`,
        group: "Key results",
        label: kr.title,
        sublabel: `${o.title} · ${kr.current}/${kr.target} ${kr.metric} · ${kr.status}`,
        icon: TrendingUp,
        href: "/cadence",
      })),
    ]);
    const decisionItems: SearchItem[] = decisions.map((d) => ({
      id: `dec-${d.id}`,
      group: "Decisions",
      label: d.title,
      sublabel: `${d.owner} · ${d.reversible ? "Reversible" : "One-way door"}`,
      icon: ScrollText,
      href: "/cadence",
      hash: "decisions",
    }));
    const roleItems: SearchItem[] = roles.map((r) => ({
      id: `role-${r.id}`,
      group: "Roles",
      label: r.title,
      sublabel: `${r.function} · ${r.status} · ${r.outcomes.filter(Boolean).length} outcomes`,
      icon: ClipboardList,
      href: "/people",
    }));
    const candidateItems: SearchItem[] = candidates.map((c) => {
      const role = roles.find((r) => r.id === c.roleId);
      return {
        id: `cand-${c.id}`,
        group: "Candidates",
        label: c.name,
        sublabel: `${role?.title || "—"} · ${c.stage} · ${c.daysInStage}d in stage`,
        icon: User,
        href: "/people",
      };
    });
    const dealItems: SearchItem[] = deals.map((d) => ({
      id: `deal-${d.id}`,
      group: "Deals",
      label: d.name,
      sublabel: `${SEGMENT_LABEL[d.segment]} · ${STAGE_LABEL[d.stage]} · $${(d.acv / 1000).toFixed(0)}k`,
      icon: TrendingUp,
      href: "/gtm",
    }));
    return [
      ...navItems,
      ...okrItems,
      ...decisionItems,
      ...roleItems,
      ...candidateItems,
      ...dealItems,
    ];
  }, [okrs, decisions, roles, candidates, deals]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 24);
    return items
      .filter((i) => (i.label + " " + (i.sublabel || "")).toLowerCase().includes(q))
      .slice(0, 30);
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchItem[]>();
    filtered.forEach((it) => {
      if (!map.has(it.group)) map.set(it.group, []);
      map.get(it.group)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelected(0);
  }, [query, open]);

  // Focus input + body scroll lock
  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 10);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(filtered.length - 1, s + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(0, s - 1));
      } else if (e.key === "Enter") {
        const item = filtered[selected];
        if (item) {
          e.preventDefault();
          go(item);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected]);

  const go = (item: SearchItem) => {
    const target = item.hash ? `${item.href}#${item.hash}` : item.href;
    router.push(target);
    onClose();
    setQuery("");
  };

  if (!open) return null;

  // Build flat index map so we can highlight the right row across grouped output
  const flatIndex = new Map<string, number>();
  filtered.forEach((it, i) => flatIndex.set(it.id, i));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-elevated border divider overflow-hidden flex flex-col max-h-[70vh]">
        <div className="flex items-center gap-3 px-4 py-3 border-b divider">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search OKRs, decisions, roles, candidates, deals…"
            className="flex-1 bg-transparent text-[14px] placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md hover:bg-zinc-100 text-zinc-400"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-dim">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-[13px] text-zinc-400">
              No matches. The OS is searching {items.length} items across pages, OKRs, decisions, roles,
              candidates, deals, and principles.
            </div>
          ) : (
            grouped.map(([group, list]) => (
              <div key={group} className="py-1.5">
                <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.14em] font-semibold text-zinc-400">
                  {group}
                </div>
                <ul>
                  {list.map((item) => {
                    const idx = flatIndex.get(item.id) ?? -1;
                    const active = idx === selected;
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => go(item)}
                          onMouseEnter={() => setSelected(idx)}
                          className={cn(
                            "w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors",
                            active ? "bg-indigo-50" : "hover:bg-zinc-50"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active ? "text-indigo-600" : "text-zinc-400"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "text-[13px] font-medium truncate",
                                active ? "text-indigo-900" : "text-zinc-900"
                              )}
                            >
                              {item.label}
                            </div>
                            {item.sublabel && (
                              <div className="text-[11px] text-zinc-500 truncate">{item.sublabel}</div>
                            )}
                          </div>
                          {active && (
                            <CornerDownLeft className="h-3 w-3 text-indigo-600 shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t divider bg-zinc-50/60 text-[10.5px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="kbd">↑</span>
              <span className="kbd">↓</span>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="kbd">↵</span>
              open
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="kbd">esc</span>
              close
            </span>
          </div>
          <span>{filtered.length} of {items.length}</span>
        </div>
      </div>
    </div>
  );
}
