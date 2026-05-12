"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TourCard } from "./tour-card";

export type TourStep = {
  id: string;
  href: string;
  label: string;
  body: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "command-center",
    href: "/",
    label: "Command Center",
    body: "Your morning view — today's #1 risk, live KPIs, and the cadence on deck this week.",
  },
  {
    id: "adapt",
    href: "/profile",
    label: "Adapt to a company",
    body: "Paste any job description into the top box. The OS reframes itself around that company in ~45 seconds — profile, OKRs, deals, candidates, roles.",
  },
  {
    id: "cadence",
    href: "/cadence",
    label: "Cadence Calendar",
    body: "Every leadership ritual for the quarter on one screen. Swim-lane and month views. Click 'Meeting kits' for the agendas.",
  },
  {
    id: "people",
    href: "/people",
    label: "MOC + Pipeline",
    body: "Roles defined by Mission · Outcomes · Competencies. Below that: a kanban for the hiring pipeline and a written Day-90 review template.",
  },
  {
    id: "chat",
    href: "/chat",
    label: "Ask the OS",
    body: "Natural-language analyst over your live state. Try a starter suggestion — answers come with KPI tiles, charts, and a recommendation, not just text.",
  },
  {
    id: "plan",
    href: "/plan",
    label: "30-Day Plan",
    body: "Generate a deliverable you can attach to applications. Copy, download as markdown, or save as PDF.",
  },
];

type TourContextValue = {
  active: boolean;
  step: number;
  start: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  close: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

const STORAGE_KEY = "cos-os:v1:tour-state";

export function TourProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(-1);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const navigate = (s: number) => {
    if (s < 0 || s >= TOUR_STEPS.length) return;
    setStep(s);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(s));
    }
    const target = TOUR_STEPS[s].href;
    if (target !== pathname) {
      router.push(target);
    }
  };

  const start = () => navigate(0);
  const next = () => {
    if (step >= TOUR_STEPS.length - 1) {
      close();
    } else {
      navigate(step + 1);
    }
  };
  const prev = () => {
    if (step > 0) navigate(step - 1);
  };
  const goTo = (index: number) => navigate(index);
  const close = () => {
    setStep(-1);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "-1");
    }
  };

  const value: TourContextValue = {
    active: step >= 0,
    step,
    start,
    next,
    prev,
    goTo,
    close,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      {hydrated && step >= 0 && (
        <TourCard
          step={TOUR_STEPS[step]}
          stepIndex={step}
          totalSteps={TOUR_STEPS.length}
          onNext={next}
          onPrev={prev}
          onClose={close}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}
