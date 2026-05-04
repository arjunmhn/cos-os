export type RoleMoc = {
  id: string;
  title: string;
  function: string;
  hiringManager: string;
  status: "drafting" | "open" | "in-loop" | "filled";
  mission: string;
  outcomes: string[];
  mustHaves: string[];
  niceToHaves: string[];
  createdAt: string;
};

export type Candidate = {
  id: string;
  name: string;
  roleId: string;
  stage: "sourcing" | "screen" | "onsite" | "offer" | "hired";
  daysInStage: number;
  source: string;
  scorecard?: { interviewer: string; score: number }[];
};

export const PIPELINE_STAGES: Candidate["stage"][] = [
  "sourcing",
  "screen",
  "onsite",
  "offer",
  "hired",
];

export const STAGE_LABELS: Record<Candidate["stage"], string> = {
  sourcing: "Sourcing",
  screen: "Screen",
  onsite: "Onsite",
  offer: "Offer",
  hired: "Hired",
};

export const STAGE_TONES: Record<Candidate["stage"], string> = {
  sourcing: "bg-zinc-100 text-zinc-700",
  screen: "bg-indigo-100 text-indigo-700",
  onsite: "bg-fuchsia-100 text-fuchsia-700",
  offer: "bg-amber-100 text-amber-700",
  hired: "bg-emerald-100 text-emerald-700",
};

export const DEFAULT_ROLES: RoleMoc[] = [
  {
    id: "r-vpe",
    title: "VP Engineering",
    function: "Engineering",
    hiringManager: "CEO",
    status: "in-loop",
    mission:
      "By the end of the next 12 months, our engineering org consistently ships the v2 platform on a 2-week release cadence with sub-2 P0/P1 escape rate per release, while growing from 14 → 28 engineers without a perceptible drop in velocity per engineer.",
    outcomes: [
      "Ship v2 platform GA on March 15 with ≤ 2 P0/P1 escapes in first 30 days.",
      "Hire and onboard 8 engineers in the first 6 months with full ramp by Day 90.",
      "Lift sprint commit-to-ship rate to ≥ 85%, sustained for two consecutive quarters.",
      "Establish on-call + incident-review system; zero repeat root-cause incidents within 90 days.",
    ],
    mustHaves: [
      "Has scaled an engineering org from sub-20 to 50+ engineers without losing per-engineer velocity.",
      "Has owned a release process where production escapes were measured weekly and trended down.",
      "Has been the deciding voice on at least one major architecture rewrite — and made the right call.",
    ],
    niceToHaves: [
      "Background in vertical SaaS or AI infrastructure.",
      "Experience operating across timezones (we have BLR + SFO).",
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
  {
    id: "r-cro",
    title: "Chief Revenue Officer",
    function: "GTM",
    hiringManager: "CEO",
    status: "open",
    mission:
      "By the end of the next 12 months, we have a documented, repeatable enterprise sales motion that any new AE can ramp into within 60 days, evidenced by ≥ 25% win rate and ≤ 60-day sales cycle in the defined ICP.",
    outcomes: [
      "Win rate in defined ICP reaches 25% by Q+2, sustained.",
      "Sales cycle for ICP ≤ 60 days for two consecutive quarters.",
      "Onboarding playbook + first-90-day plan in production by end of Q+1.",
      "Two new AEs hired and ramped to full quota within 90 days of start.",
    ],
    mustHaves: [
      "Has built an ICP definition + qualification framework that survived a leadership change.",
      "Has run deal-by-deal pipeline reviews where the next buyer action and date were the only acceptable output.",
    ],
    niceToHaves: ["Has hired and ramped 5+ AEs in a high-velocity SaaS context."],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "r-pmm",
    title: "Founding Product Marketing Manager",
    function: "Marketing",
    hiringManager: "CPO",
    status: "drafting",
    mission:
      "By the end of the next 12 months, every public-facing surface — website, sales collateral, launch motions — speaks one coherent story about the v2 platform that the sales team and the press both repeat back to us in our own words.",
    outcomes: [
      "v2 platform launch lands ≥ 3 tier-1 press hits and ≥ 1,000 qualified site visits in launch week.",
      "Sales collateral library reduces 'I need a new deck for X' asks to under 1 per week.",
      "Win rate in the defined ICP improves by ≥ 3 points attributable to messaging change.",
    ],
    mustHaves: [
      "Has owned a category-defining launch end-to-end (positioning → narrative → assets → execution).",
      "Has been the writer, not the editor, of at least one piece of sales collateral that shipped 100+ deals.",
    ],
    niceToHaves: ["Background as an analyst, journalist, or storyteller before marketing."],
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CANDIDATES: Candidate[] = [
  { id: "c1", name: "Priya Iyer", roleId: "r-vpe", stage: "onsite", daysInStage: 4, source: "Referral", scorecard: [{ interviewer: "CEO", score: 4 }, { interviewer: "CTO", score: 5 }] },
  { id: "c2", name: "Marcus Wei", roleId: "r-vpe", stage: "offer", daysInStage: 2, source: "Inbound", scorecard: [{ interviewer: "CEO", score: 5 }, { interviewer: "CTO", score: 4 }, { interviewer: "CoS", score: 4 }] },
  { id: "c3", name: "Lena Kowalski", roleId: "r-vpe", stage: "screen", daysInStage: 6, source: "Outbound", scorecard: [] },
  { id: "c4", name: "Devon Park", roleId: "r-cro", stage: "onsite", daysInStage: 9, source: "Recruiter", scorecard: [{ interviewer: "CEO", score: 4 }, { interviewer: "CFO", score: 3 }] },
  { id: "c5", name: "Salim Rahimi", roleId: "r-cro", stage: "screen", daysInStage: 3, source: "Referral", scorecard: [] },
  { id: "c6", name: "Tomás Beltrán", roleId: "r-cro", stage: "sourcing", daysInStage: 11, source: "Outbound", scorecard: [] },
  { id: "c7", name: "Naomi Schwartz", roleId: "r-cro", stage: "sourcing", daysInStage: 8, source: "Outbound", scorecard: [] },
  { id: "c8", name: "Jiwon Park", roleId: "r-pmm", stage: "screen", daysInStage: 2, source: "Inbound", scorecard: [] },
  { id: "c9", name: "Amaya Singh", roleId: "r-pmm", stage: "sourcing", daysInStage: 5, source: "Network", scorecard: [] },
  { id: "c10", name: "Ravi Menon", roleId: "r-vpe", stage: "hired", daysInStage: 0, source: "Referral", scorecard: [{ interviewer: "CEO", score: 4 }, { interviewer: "CTO", score: 5 }, { interviewer: "CoS", score: 5 }] },
];

export const ROLE_STATUS_TONE: Record<RoleMoc["status"], string> = {
  drafting: "neutral",
  open: "indigo",
  "in-loop": "fuchsia",
  filled: "emerald",
};
