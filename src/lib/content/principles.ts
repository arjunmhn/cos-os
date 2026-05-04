export type Principle = {
  id: string;
  title: string;
  body: string;
  source: string;
  tone: "indigo" | "fuchsia" | "cyan" | "emerald" | "amber";
  applies: string[];
};

export const PRINCIPLES: Principle[] = [
  {
    id: "computers-humans",
    title: "Let computers do computer things. Let humans do human things.",
    body: "Automate what is repetitive, structured, and judgment-light. Reserve your hours for trust, persuasion, hard 1:1s, and the writing that has to sound like you. AI is a force-multiplier on output — never a substitute for input.",
    source: "Elise Kennedy — Your Chief of Staff",
    tone: "indigo",
    applies: ["chat", "cadence", "people", "gtm"],
  },
  {
    id: "no-seeking",
    title: "The CEO should never have to seek an update.",
    body: "An organizational cadence systematically pulls leading indicators to the CEO so their focus stays on decisions. If you find them asking 'how is X going?', the cadence has failed — fix the cadence, not the answer.",
    source: "Arjun Mohan — 4 Things @ Valerie",
    tone: "fuchsia",
    applies: ["cadence", "board"],
  },
  {
    id: "leading-not-lagging",
    title: "Pipeline coverage and customer health flags. Not bookings.",
    body: "Run your weekly review on leading indicators — pipeline coverage, implementation milestones by customer, escalation rate, hiring funnel velocity. Lagging indicators (revenue, churn) are scoreboards, not steering wheels.",
    source: "Arjun Mohan — 4 Things @ Valerie",
    tone: "cyan",
    applies: ["cadence", "board", "gtm"],
  },
  {
    id: "mid-quarter",
    title: "Mid-quarter inspection catches misses six weeks early.",
    body: "Don't wait for the quarterly to discover the miss. A deal-by-deal pipeline pass at week 6 — paired with a partnership pipeline pass — exposes the gap while there's still time to act.",
    source: "Arjun Mohan — 4 Things @ Valerie",
    tone: "amber",
    applies: ["cadence", "gtm"],
  },
  {
    id: "moc",
    title: "Define the role with Mission, Outcomes, Competencies — not a title.",
    body: "Before hiring or onboarding, write the 12–18 month mission, the 3–5 outcomes that define success, and the competencies required. The MOC becomes the interview rubric, the 30/60/90 plan, and the eventual performance review. One artifact, three uses.",
    source: "a16z — How to Hire a Chief of Staff",
    tone: "indigo",
    applies: ["people", "library"],
  },
  {
    id: "ai-strategy",
    title: "AI goals must tie to organizational OKRs.",
    body: "Don't deploy AI because it's available. Tie every AI initiative to a measurable outcome the company already cares about. Build vs. buy, in-house vs. SaaS — decide based on time-to-impact, not novelty.",
    source: "Elise Kennedy — Building AI Strategy",
    tone: "emerald",
    applies: ["chat", "library"],
  },
  {
    id: "decentralize",
    title: "Build systems that survive without you in the room.",
    body: "A hiring rubric anyone can run beats a hiring instinct only you have. A retrostudy template Sales pulls into proposals beats a one-off deck you wrote. The job of the Chief of Staff is to scale the founder's judgment, not to substitute for it.",
    source: "Arjun Mohan — 4 Things @ Valerie",
    tone: "fuchsia",
    applies: ["people", "gtm", "library"],
  },
  {
    id: "written-feedback",
    title: "Day-90 review must be written.",
    body: "Unwritten manager feedback compounds hiring mistakes silently. A real, written 30/60/90 — surfaced to the manager and the report — converts a vague impression into a decision while the cost of a course-correct is still small.",
    source: "Arjun Mohan — 4 Things @ Valerie",
    tone: "amber",
    applies: ["people", "library"],
  },
];

export const RULES_OF_THE_HOUSE = [
  "Decisions get logged with the why, the alternatives considered, and the reversibility flag.",
  "Every recurring meeting has a written agenda the day before — or it gets cancelled.",
  "OKRs are tracked weekly. Status changes (on-track → at-risk) require a one-sentence why.",
  "Investor updates ship by the 5th of the month, every month, even when there's no news.",
  "Every role has a one-page MOC before the JD goes out.",
  "Day-90 review is written. No exceptions.",
  "When something is done manually three times, it becomes a system.",
];
