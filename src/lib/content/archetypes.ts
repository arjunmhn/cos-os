export type Archetype = {
  id: "strategic" | "builder" | "exec-support";
  title: string;
  tagline: string;
  stage: string;
  teamRange: string;
  ownsPrimarily: string[];
  doesNotOwn: string[];
  example: string;
  signal: string;
};

export const ARCHETYPES: Archetype[] = [
  {
    id: "exec-support",
    title: "Executive Support",
    tagline: "Thought partner. Calendar architect. Communications air cover.",
    stage: "Pre-Series A",
    teamRange: "20–75 people",
    ownsPrimarily: [
      "CEO operating cadence and prep",
      "Inbox + calendar leverage",
      "Internal comms and all-hands",
      "Special projects with a clear deadline",
    ],
    doesNotOwn: [
      "GTM strategy or pipeline ownership",
      "Org design or headcount planning",
      "Board governance",
    ],
    example: "Drafts the weekly leadership review, owns the all-hands deck, runs special projects 1–2 weeks long.",
    signal: "Per a16z: this is Orientation 1 — the CoS is a force multiplier on the CEO's time, not yet on the org's structure.",
  },
  {
    id: "strategic",
    title: "Strategic CoS",
    tagline: "Command center. Cross-functional accountability. Board-grade synthesis.",
    stage: "Series A → Series C",
    teamRange: "75–150+ people",
    ownsPrimarily: [
      "Operating cadence across the leadership team",
      "OKR system and quarterly planning",
      "Board pack drafting and IR cadence",
      "GTM accountability — pipeline reviews, velocity inspection",
      "Cross-functional alignment between EPD and GTM",
    ],
    doesNotOwn: [
      "Functional leadership (no Head of Sales / Product hat)",
      "Day-to-day execution of any single function",
    ],
    example: "Per the Ema CoS spec: drives leadership reviews, board prep, OKR tracking, sales velocity analysis. Has a point of view in the room.",
    signal: "Per a16z: this is Orientation 2 — five pillars are Interact, Interface, Plan, Measure, Communicate.",
  },
  {
    id: "builder",
    title: "Builder-Orchestrator",
    tagline: "Ships internal tools. Designs automation. Configures the system.",
    stage: "Bootstrapped or capital-efficient at any stage",
    teamRange: "15–50 people",
    ownsPrimarily: [
      "Internal tooling and automation — when something is done manually 3x, build it",
      "Recruiting operations (pipeline, scheduling, trial logistics)",
      "Vendor and contract substrate (legal, insurance, office, services)",
      "Operating cadence as a designed system, not a process document",
    ],
    doesNotOwn: [
      "Recruiting strategy (founder-led)",
      "Board governance (often no board)",
    ],
    example: "Per the Product.ai CoS spec: codes or configures the system, does not just specify it. Daily user of Claude Code or Cursor.",
    signal: "Smaller team, higher per-person leverage. The CoS is the boundary between what the CEO does and what the system handles.",
  },
];
