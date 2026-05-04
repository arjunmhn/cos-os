export type MonthlyMetric = { month: string; value: number };

export type KpiSeries = {
  id: string;
  label: string;
  unit: "$" | "#" | "%" | "mo";
  data: MonthlyMetric[];
  target?: number;
  formatter?: (n: number) => string;
};

const months12 = (start: number) =>
  Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return {
      month: d.toLocaleDateString("en-US", { month: "short" }),
      value: 0,
    } as MonthlyMetric;
  }).map((m, i, arr) => ({ ...m, value: 0 }));

export const KPI_SERIES: KpiSeries[] = [
  {
    id: "arr",
    label: "ARR",
    unit: "$",
    data: months12(0).map((m, i) => ({ ...m, value: 1.2e6 + i * 0.18e6 + (i % 3) * 0.04e6 })),
    target: 4e6,
    formatter: (n) => `$${(n / 1e6).toFixed(2)}M`,
  },
  {
    id: "north-star",
    label: "Weekly Active Sellers",
    unit: "#",
    data: months12(0).map((m, i) => ({ ...m, value: 220 + i * 28 + (i % 4) * 8 })),
    target: 600,
    formatter: (n) => Math.round(n).toLocaleString(),
  },
  {
    id: "burn",
    label: "Net monthly burn",
    unit: "$",
    data: months12(0).map((m, i) => ({ ...m, value: 460000 + (i % 5) * 12000 - i * 2000 })),
    formatter: (n) => `$${(n / 1000).toFixed(0)}k`,
  },
  {
    id: "runway",
    label: "Runway",
    unit: "mo",
    data: months12(0).map((m, i) => ({ ...m, value: 28 - i * 0.4 + (i % 3) * 0.2 })),
    target: 18,
    formatter: (n) => `${n.toFixed(1)} mo`,
  },
  {
    id: "headcount",
    label: "Headcount",
    unit: "#",
    data: months12(0).map((m, i) => ({ ...m, value: 18 + i * 1.2 })),
    target: 60,
    formatter: (n) => Math.round(n).toString(),
  },
  {
    id: "win-rate",
    label: "Win rate (ICP)",
    unit: "%",
    data: months12(0).map((m, i) => ({ ...m, value: 18 + i * 0.4 + (i % 4) * 0.6 })),
    target: 25,
    formatter: (n) => `${n.toFixed(1)}%`,
  },
];

export type BoardSection = {
  id: string;
  title: string;
  pages: string;
  prompt: string;
  bullets: string[];
};

export const BOARD_SECTIONS: BoardSection[] = [
  {
    id: "tldr",
    title: "TL;DR + the ask",
    pages: "1 page",
    prompt:
      "What's the one thing the board needs to leave with? What specific input do you want from them?",
    bullets: [
      "Three sentences: where we are, where we're headed, what we're asking.",
      "Specific asks (intros, hires, follow-on signals) listed with names where relevant.",
      "No hedging in this section. Hedge in the body, not the cover.",
    ],
  },
  {
    id: "metrics",
    title: "KPI snapshot",
    pages: "1 page",
    prompt:
      "Same metrics every quarter. Trend lines, not point-in-time. Variance vs. plan called out, not buried.",
    bullets: [
      "ARR, net new ARR, growth rate, cash, burn, runway.",
      "North-star metric with explicit definition.",
      "Variance vs. plan in basis points where relevant.",
    ],
  },
  {
    id: "wins-losses",
    title: "Wins & losses since last meeting",
    pages: "2–3 pages",
    prompt:
      "What broke our way and why? What broke against us and why? Boards are tuned for honesty more than for spin.",
    bullets: [
      "3–5 wins (logo, product, hire, narrative).",
      "2–3 losses or misses with the lesson, not the excuse.",
      "Open competitive questions you're holding.",
    ],
  },
  {
    id: "strategy",
    title: "Strategy — what changed in our thinking",
    pages: "2–4 pages",
    prompt:
      "If your strategy hasn't changed in 90 days, you're either right or asleep. Show your updated map.",
    bullets: [
      "What we believed last quarter vs. what we believe now.",
      "The #1 bet for the next 90 days, in one sentence.",
      "What we're explicitly not doing and why.",
    ],
  },
  {
    id: "ops",
    title: "Operating performance",
    pages: "3–5 pages",
    prompt:
      "GTM, Product, People — narrative + numbers per function. Board members read the table; the discussion is on the narrative.",
    bullets: [
      "GTM: pipeline coverage, win rate, sales cycle, net retention.",
      "Product: roadmap status, customer feedback themes, escape rates.",
      "People: hires, attrition, key open roles, eNPS or proxy.",
    ],
  },
  {
    id: "risks",
    title: "Risks the board should be tracking",
    pages: "1 page",
    prompt:
      "Better the risk a board sees than the surprise it discovers. List the top 3.",
    bullets: [
      "Risk · Likelihood · Impact · What we're doing.",
      "Distinguish controllable from market-driven risks.",
      "Flag any risk that became a surprise this quarter.",
    ],
  },
];

export type DataRoomFolder = {
  name: string;
  files: { name: string; status: "fresh" | "stale" | "missing" }[];
};

export const DATA_ROOM: DataRoomFolder[] = [
  {
    name: "Corporate",
    files: [
      { name: "Certificate of Incorporation", status: "fresh" },
      { name: "Bylaws", status: "fresh" },
      { name: "409A valuation (current)", status: "stale" },
      { name: "Cap table (latest)", status: "fresh" },
      { name: "Board minutes (last 8 quarters)", status: "fresh" },
    ],
  },
  {
    name: "Financial",
    files: [
      { name: "P&L (last 24 months)", status: "fresh" },
      { name: "Balance sheet (latest)", status: "fresh" },
      { name: "Cash flow + 18-month forecast", status: "fresh" },
      { name: "Customer cohort analysis", status: "stale" },
      { name: "Unit economics by segment", status: "missing" },
    ],
  },
  {
    name: "Commercial",
    files: [
      { name: "Top 20 customers + ARR", status: "fresh" },
      { name: "Pipeline coverage (current)", status: "fresh" },
      { name: "Win/loss reasons (last 4 quarters)", status: "fresh" },
      { name: "Net retention by cohort", status: "stale" },
      { name: "Customer references (3 logos cleared)", status: "missing" },
    ],
  },
  {
    name: "Product & Tech",
    files: [
      { name: "Architecture overview", status: "fresh" },
      { name: "Security audit report", status: "stale" },
      { name: "Roadmap (next 4 quarters)", status: "fresh" },
      { name: "IP / patent filings", status: "missing" },
    ],
  },
  {
    name: "People",
    files: [
      { name: "Org chart (current)", status: "fresh" },
      { name: "Comp bands by level", status: "fresh" },
      { name: "Key person resumes", status: "fresh" },
      { name: "Employee handbook", status: "stale" },
    ],
  },
  {
    name: "Legal & Compliance",
    files: [
      { name: "Material contracts (top 10)", status: "fresh" },
      { name: "IP assignment agreements", status: "fresh" },
      { name: "Privacy policy + DPA", status: "fresh" },
      { name: "Pending litigation (none)", status: "fresh" },
    ],
  },
];
