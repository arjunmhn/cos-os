"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLocalStorage } from "@/lib/storage";
import type { CompanyProfile } from "@/lib/types";

export const DEFAULT_PROFILE: CompanyProfile = {
  name: "Northwind",
  stage: "series-a",
  founded: "2023",
  hq: "San Francisco, CA",
  teamSize: 32,
  ceoName: "Your CEO",
  cosName: "You",
  oneLiner: "The agentic CRM for high-velocity GTM teams.",
  northStarMetric: "Weekly Active Sellers",
  fiscalYearStart: 1,
};

type Ctx = {
  profile: CompanyProfile;
  setProfile: (next: CompanyProfile | ((prev: CompanyProfile) => CompanyProfile)) => void;
  hydrated: boolean;
};

const CompanyProfileContext = createContext<Ctx | null>(null);

export function CompanyProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile, hydrated] = useLocalStorage<CompanyProfile>(
    "company-profile",
    DEFAULT_PROFILE
  );
  return (
    <CompanyProfileContext.Provider value={{ profile, setProfile, hydrated }}>
      {children}
    </CompanyProfileContext.Provider>
  );
}

export function useCompanyProfile() {
  const ctx = useContext(CompanyProfileContext);
  if (!ctx) throw new Error("useCompanyProfile must be used inside CompanyProfileProvider");
  return ctx;
}

export const STAGE_LABELS: Record<CompanyProfile["stage"], string> = {
  "pre-seed": "Pre-seed",
  seed: "Seed",
  "series-a": "Series A",
  "series-b": "Series B",
  "series-c-plus": "Series C+",
};
