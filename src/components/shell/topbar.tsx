"use client";

import { useCompanyProfile, STAGE_LABELS } from "@/components/providers/company-profile-provider";
import { initials } from "@/lib/utils";
import { Menu, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { TourTrigger } from "@/components/tour/tour-trigger";

export function Topbar({
  onOpenDrawer,
  onOpenPalette,
}: {
  onOpenDrawer: () => void;
  onOpenPalette: () => void;
}) {
  const { profile, hydrated } = useCompanyProfile();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b divider bg-white/80 backdrop-blur px-4 sm:px-5">
      {/* Mobile hamburger */}
      <button
        onClick={onOpenDrawer}
        className="md:hidden grid h-9 w-9 place-items-center rounded-md hover:bg-zinc-100 text-zinc-600 -ml-2"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-zinc-900 text-white text-[11px] font-semibold shrink-0">
          {hydrated ? initials(profile.name) : "—"}
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate">
            {hydrated ? profile.name : " "}
          </div>
          <div className="text-[11px] text-zinc-500 truncate hidden sm:block">
            {hydrated ? `${STAGE_LABELS[profile.stage]} · ${profile.teamSize} people · ${profile.hq}` : " "}
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Desktop search trigger */}
        <button
          onClick={onOpenPalette}
          className="hidden md:flex items-center gap-2 rounded-lg border border-zinc-200 bg-white pl-2.5 pr-1 h-9 w-[200px] lg:w-[280px] hover:border-zinc-300 transition-colors text-left"
          aria-label="Open search"
        >
          <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span className="flex-1 text-sm text-zinc-400 truncate">
            Search OS state…
          </span>
          <span className="kbd shrink-0">⌘K</span>
        </button>

        {/* Mobile search button */}
        <button
          onClick={onOpenPalette}
          className="md:hidden grid h-9 w-9 place-items-center rounded-md hover:bg-zinc-100 text-zinc-600"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        <TourTrigger />

        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-gradient-brand text-white text-sm font-medium shadow-elevated hover:opacity-95"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ask the OS</span>
        </Link>
      </div>
    </header>
  );
}
