export type DealStage = "discovery" | "evaluation" | "proposal" | "commit" | "best-case" | "closed-won" | "closed-lost";

export type DealSegment = "smb" | "mid-market" | "enterprise";

export type Deal = {
  id: string;
  name: string;
  segment: DealSegment;
  stage: DealStage;
  acv: number;
  owner: string;
  nextAction: string;
  nextActionDate: string;
  slipped: boolean;
  inIcp: boolean;
};

export const DEFAULT_DEALS: Deal[] = [
  { id: "d1", name: "Atlas Robotics", segment: "mid-market", stage: "commit", acv: 180000, owner: "Devon Park", nextAction: "Security review with their CISO", nextActionDate: addDays(2), slipped: false, inIcp: true },
  { id: "d2", name: "Sentry Labs", segment: "enterprise", stage: "commit", acv: 420000, owner: "Naomi Schwartz", nextAction: "Final paper redlines back to legal", nextActionDate: addDays(4), slipped: false, inIcp: true },
  { id: "d3", name: "Bramble Foods", segment: "mid-market", stage: "best-case", acv: 95000, owner: "Devon Park", nextAction: "Sponsor ROI walkthrough rescheduled", nextActionDate: addDays(7), slipped: true, inIcp: false },
  { id: "d4", name: "Quanta Bio", segment: "enterprise", stage: "evaluation", acv: 380000, owner: "Naomi Schwartz", nextAction: "Procurement intro", nextActionDate: addDays(11), slipped: false, inIcp: true },
  { id: "d5", name: "Helio Aerospace", segment: "enterprise", stage: "best-case", acv: 540000, owner: "Naomi Schwartz", nextAction: "Sponsor leaving — re-anchor", nextActionDate: addDays(3), slipped: true, inIcp: true },
  { id: "d6", name: "Coral Studios", segment: "smb", stage: "proposal", acv: 38000, owner: "Salim Rahimi", nextAction: "Verbal commit awaiting paper", nextActionDate: addDays(1), slipped: false, inIcp: false },
  { id: "d7", name: "Northstar Health", segment: "mid-market", stage: "commit", acv: 220000, owner: "Devon Park", nextAction: "Compliance team final review", nextActionDate: addDays(5), slipped: false, inIcp: true },
  { id: "d8", name: "Periscope Media", segment: "mid-market", stage: "discovery", acv: 130000, owner: "Salim Rahimi", nextAction: "Champion-only demo", nextActionDate: addDays(9), slipped: false, inIcp: true },
  { id: "d9", name: "Vault Logistics", segment: "enterprise", stage: "evaluation", acv: 460000, owner: "Naomi Schwartz", nextAction: "Reference call with two existing customers", nextActionDate: addDays(8), slipped: false, inIcp: true },
  { id: "d10", name: "Mercator Maps", segment: "smb", stage: "best-case", acv: 28000, owner: "Salim Rahimi", nextAction: "Awaiting renewal paperwork", nextActionDate: addDays(2), slipped: false, inIcp: false },
];

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export const STAGE_LABEL: Record<DealStage, string> = {
  discovery: "Discovery",
  evaluation: "Evaluation",
  proposal: "Proposal",
  commit: "Commit",
  "best-case": "Best case",
  "closed-won": "Closed won",
  "closed-lost": "Closed lost",
};

export const SEGMENT_LABEL: Record<DealSegment, string> = {
  smb: "SMB",
  "mid-market": "Mid-market",
  enterprise: "Enterprise",
};

export type VelocityRow = {
  segment: DealSegment | "all-icp";
  label: string;
  pipelineDollars: number;
  winRate: number;
  avgDealSize: number;
  cycleDays: number;
};

export const VELOCITY: VelocityRow[] = [
  { segment: "all-icp", label: "Defined ICP", pipelineDollars: 1.85e6, winRate: 21, avgDealSize: 175000, cycleDays: 71 },
  { segment: "mid-market", label: "Mid-market", pipelineDollars: 0.98e6, winRate: 24, avgDealSize: 152000, cycleDays: 64 },
  { segment: "enterprise", label: "Enterprise", pipelineDollars: 1.42e6, winRate: 17, avgDealSize: 410000, cycleDays: 102 },
  { segment: "smb", label: "SMB (non-ICP)", pipelineDollars: 0.21e6, winRate: 38, avgDealSize: 33000, cycleDays: 28 },
];

export type WinLossEntry = {
  id: string;
  date: string;
  customer: string;
  segment: DealSegment;
  outcome: "won" | "lost";
  reasonTheme: string;
  detail: string;
  competitor?: string;
};

export const WIN_LOSS: WinLossEntry[] = [
  { id: "wl1", date: addDays(-3), customer: "Atlas Robotics", segment: "mid-market", outcome: "won", reasonTheme: "ROI clarity", detail: "Retrostudy template in the proposal moved them. Sponsor quoted '$1.2M of FTE hours we'll get back' verbatim in the close call.", competitor: "in-house build" },
  { id: "wl2", date: addDays(-9), customer: "Sierra Health", segment: "enterprise", outcome: "lost", reasonTheme: "Product gap", detail: "Multi-tenant isolation requirement — v1 cannot meet it. Won't buy until v2 GA.", competitor: "in-house build" },
  { id: "wl3", date: addDays(-14), customer: "Pinecrest Bio", segment: "mid-market", outcome: "won", reasonTheme: "Implementation speed", detail: "Their previous vendor took 9 months to deploy; we promised 6 weeks and showed reference.", competitor: "Acme" },
  { id: "wl4", date: addDays(-21), customer: "Drift & Hover", segment: "smb", outcome: "lost", reasonTheme: "Price", detail: "Small team — couldn't justify mid-market pricing. ICP-out.", competitor: "Beta Co" },
  { id: "wl5", date: addDays(-26), customer: "Highline Robotics", segment: "enterprise", outcome: "lost", reasonTheme: "Champion left", detail: "Sponsor left for a new role two weeks before signature. New buyer reset evaluation.", competitor: "no-decision" },
];

export type Retrostudy = {
  customer: string;
  segment: DealSegment;
  baselineMonths: number;
  preNoShowRate: number;
  postNoShowRate: number;
  preFteHours: number;
  postFteHours: number;
  fullyLoadedHourlyCost: number;
  avgVisitRevenue: number;
  notes: string;
};

export const DEFAULT_RETROSTUDY: Retrostudy = {
  customer: "Atlas Robotics",
  segment: "mid-market",
  baselineMonths: 6,
  preNoShowRate: 14,
  postNoShowRate: 6,
  preFteHours: 280,
  postFteHours: 130,
  fullyLoadedHourlyCost: 75,
  avgVisitRevenue: 320,
  notes: "Baseline drawn from their Sept–Feb data. Excludes one outlier month (Dec) due to holiday closures.",
};
