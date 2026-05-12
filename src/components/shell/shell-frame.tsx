"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileDrawer } from "./mobile-drawer";
import { CommandPalette } from "./command-palette";
import { TourProvider } from "@/components/tour/tour-provider";

export function ShellFrame({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K / Ctrl+K opens the command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <TourProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            onOpenDrawer={() => setDrawerOpen(true)}
            onOpenPalette={() => setPaletteOpen(true)}
          />
          <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
          <footer className="px-4 sm:px-6 lg:px-10 py-6 text-[11px] text-zinc-400 border-t divider">
            Chief of Staff OS · Generic starter kit · Local-only · v0.1
          </footer>
        </div>
      </div>
    </TourProvider>
  );
}
