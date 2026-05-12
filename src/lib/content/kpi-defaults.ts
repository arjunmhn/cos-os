import type { CompanyProfile } from "@/lib/types";
import type { KpiSnapshot } from "@/lib/cos-persona";

// 12-month month labels ending at the current month.
function months12(): string[] {
  const out: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    out.push(d.toLocaleDateString("en-US", { month: "short" }));
  }
  return out;
}

/* -------------------- Formatters -------------------- */

export function formatKpiValue(n: number, unit: KpiSnapshot["unit"]): string {
  if (unit === "$") {
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}k`;
    return `$${n.toFixed(0)}`;
  }
  if (unit === "%") return `${n.toFixed(1)}%`;
  if (unit === "mo") return `${n.toFixed(1)} mo`;
  // # (count)
  if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
  return Math.round(n).toString();
}

export function formatKpiAxis(n: number, unit: KpiSnapshot["unit"]): string {
  if (unit === "$") {
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `$${Math.round(n / 1e3)}k`;
    return `$${Math.round(n)}`;
  }
  if (unit === "%") return `${n.toFixed(0)}%`;
  if (unit === "mo") return `${n.toFixed(0)}mo`;
  return Math.round(n).toLocaleString();
}

/* -------------------- Defaults (series-A-ish baseline) -------------------- */

function buildDefault(): KpiSnapshot[] {
  const m = months12();
  return [
    {
      id: "arr",
      label: "ARR",
      unit: "$",
      latest: 3.4e6,
      prev: 3.2e6,
      target: 4e6,
      series: m.map((mo, i) => ({ month: mo, value: 1.2e6 + i * 0.2e6 + (i % 3) * 0.04e6 })),
    },
    {
      id: "north-star",
      label: "Weekly Active Sellers",
      unit: "#",
      latest: 528,
      prev: 480,
      target: 600,
      series: m.map((mo, i) => ({ month: mo, value: 220 + i * 28 + (i % 4) * 8 })),
    },
    {
      id: "burn",
      label: "Net monthly burn",
      unit: "$",
      latest: 460000,
      prev: 472000,
      target: undefined,
      series: m.map((mo, i) => ({ month: mo, value: 460000 + (i % 5) * 12000 - i * 2000 })),
    },
    {
      id: "runway",
      label: "Runway",
      unit: "mo",
      latest: 22,
      prev: 23,
      target: 18,
      series: m.map((mo, i) => ({ month: mo, value: 28 - i * 0.4 + (i % 3) * 0.2 })),
    },
    {
      id: "headcount",
      label: "Headcount",
      unit: "#",
      latest: 32,
      prev: 31,
      target: 60,
      series: m.map((mo, i) => ({ month: mo, value: 18 + i * 1.2 })),
    },
    {
      id: "win-rate",
      label: "Win rate (ICP)",
      unit: "%",
      latest: 21,
      prev: 20,
      target: 25,
      series: m.map((mo, i) => ({ month: mo, value: 18 + i * 0.4 + (i % 4) * 0.6 })),
    },
  ];
}

export const DEFAULT_KPIS: KpiSnapshot[] = buildDefault();

/* -------------------- Scale to a company profile -------------------- */

type StageMultipliers = {
  arr: number;
  burn: number;
  runway: number; // adjusts the runway delta vs baseline
  headcountFactor: number; // overrides headcount with profile.teamSize but adjusts target reach
  northStarFactor: number; // multiplies north-star magnitudes
  winRateAdj: number; // points to add/subtract from win rate
  arrTarget: number; // absolute target ARR in $
  northStarTarget: number; // absolute target north-star count
  headcountTarget: number; // absolute target headcount
};

const STAGE_MULT: Record<CompanyProfile["stage"], StageMultipliers> = {
  "pre-seed": {
    arr: 0.05,
    burn: 0.15,
    runway: 1.0,
    headcountFactor: 1,
    northStarFactor: 0.05,
    winRateAdj: -3,
    arrTarget: 0.3e6,
    northStarTarget: 50,
    headcountTarget: 10,
  },
  seed: {
    arr: 0.25,
    burn: 0.4,
    runway: 1.05,
    headcountFactor: 1,
    northStarFactor: 0.2,
    winRateAdj: -1,
    arrTarget: 1.2e6,
    northStarTarget: 200,
    headcountTarget: 25,
  },
  "series-a": {
    arr: 1.0,
    burn: 1.0,
    runway: 1.0,
    headcountFactor: 1,
    northStarFactor: 1.0,
    winRateAdj: 0,
    arrTarget: 5e6,
    northStarTarget: 800,
    headcountTarget: 60,
  },
  "series-b": {
    arr: 3.5,
    burn: 2.5,
    runway: 1.1,
    headcountFactor: 1,
    northStarFactor: 3.0,
    winRateAdj: 2,
    arrTarget: 18e6,
    northStarTarget: 3000,
    headcountTarget: 150,
  },
  "series-c-plus": {
    arr: 10,
    burn: 5,
    runway: 1.15,
    headcountFactor: 1,
    northStarFactor: 8,
    winRateAdj: 4,
    arrTarget: 50e6,
    northStarTarget: 12000,
    headcountTarget: 300,
  },
};

export function scaleKpisForProfile(profile: CompanyProfile): KpiSnapshot[] {
  const m = months12();
  const s = STAGE_MULT[profile.stage] ?? STAGE_MULT["series-a"];

  // Headcount: anchor latest to profile.teamSize, project ramp backwards.
  const hc = profile.teamSize;
  const hcStart = Math.max(2, Math.round(hc * 0.55));
  const hcGrowthPerMonth = Math.max(0.5, (hc - hcStart) / 11);

  return [
    {
      id: "arr",
      label: "ARR",
      unit: "$",
      latest: 3.4e6 * s.arr,
      prev: 3.2e6 * s.arr,
      target: s.arrTarget,
      series: m.map((mo, i) => ({
        month: mo,
        value: (1.2e6 + i * 0.2e6 + (i % 3) * 0.04e6) * s.arr,
      })),
    },
    {
      id: "north-star",
      label: profile.northStarMetric || "Weekly Active Users",
      unit: "#",
      latest: Math.round(528 * s.northStarFactor),
      prev: Math.round(480 * s.northStarFactor),
      target: s.northStarTarget,
      series: m.map((mo, i) => ({
        month: mo,
        value: Math.round((220 + i * 28 + (i % 4) * 8) * s.northStarFactor),
      })),
    },
    {
      id: "burn",
      label: "Net monthly burn",
      unit: "$",
      latest: 460000 * s.burn,
      prev: 472000 * s.burn,
      target: undefined,
      series: m.map((mo, i) => ({
        month: mo,
        value: (460000 + (i % 5) * 12000 - i * 2000) * s.burn,
      })),
    },
    {
      id: "runway",
      label: "Runway",
      unit: "mo",
      latest: 22 * s.runway,
      prev: 23 * s.runway,
      target: 18,
      series: m.map((mo, i) => ({
        month: mo,
        value: (28 - i * 0.4 + (i % 3) * 0.2) * s.runway,
      })),
    },
    {
      id: "headcount",
      label: "Headcount",
      unit: "#",
      latest: hc,
      prev: Math.max(hcStart, hc - 1),
      target: s.headcountTarget,
      series: m.map((mo, i) => ({
        month: mo,
        value: Math.round(hcStart + i * hcGrowthPerMonth),
      })),
    },
    {
      id: "win-rate",
      label: "Win rate (ICP)",
      unit: "%",
      latest: 21 + s.winRateAdj,
      prev: 20 + s.winRateAdj,
      target: 25 + s.winRateAdj,
      series: m.map((mo, i) => ({
        month: mo,
        value: 18 + i * 0.4 + (i % 4) * 0.6 + s.winRateAdj,
      })),
    },
  ];
}
