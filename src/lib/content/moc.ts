export const MOC_FRAMEWORK = {
  title: "Mission · Outcomes · Competencies",
  source: "a16z — How to Hire a Chief of Staff",
  why: "Define a role by what it must accomplish in 12–18 months, not by a job title. The MOC becomes the JD, the interview rubric, the 30/60/90 plan, and the eventual performance review. One artifact, four uses.",
  sections: [
    {
      label: "Mission",
      prompt: "What does success look like in 12–18 months? Write one paragraph in plain English — what state will the org be in because this person did the job well?",
      example:
        "By the end of FY+1, we have a documented, repeatable enterprise sales motion that any new AE can ramp into in 60 days, evidenced by ≥25% win rate and ≤60-day sales cycle in the defined ICP.",
    },
    {
      label: "Outcomes",
      prompt: "List 3–5 measurable outcomes the role will be judged on. Each must be observable and time-bound.",
      example:
        "1) Win rate in defined ICP reaches 25% by Q+2.\n2) Sales cycle for ICP ≤ 60 days, sustained for two quarters.\n3) Onboarding playbook + first-90-day plan in production by end of Q+1.\n4) Two new AEs hired and ramped to full quota within 90 days of start.",
    },
    {
      label: "Competencies",
      prompt: "What capabilities are required to deliver those outcomes? Distinguish must-haves from nice-to-haves. Use behaviors, not adjectives.",
      example:
        "Must-have: has built an ICP definition + qualification framework that survived a leadership change. Must-have: has run deal-by-deal pipeline reviews where the next buyer action and date were the only acceptable output. Nice-to-have: has hired and ramped 5+ AEs in a high-velocity SaaS context.",
    },
  ],
};

export const SCORECARD_TEMPLATE = {
  title: "Interview Scorecard",
  source: "Built directly from the role's Outcomes — every interviewer scores against the same rubric.",
  scoreScale: [
    { score: 1, label: "No evidence" },
    { score: 2, label: "Partial / inconclusive" },
    { score: 3, label: "Meets bar" },
    { score: 4, label: "Strong evidence" },
    { score: 5, label: "Exceptional, would hire again" },
  ],
  rubricItems: [
    "Outcome 1 — concrete past evidence of having delivered an equivalent result",
    "Outcome 2 — concrete past evidence of having delivered an equivalent result",
    "Outcome 3 — concrete past evidence of having delivered an equivalent result",
    "Competency must-have #1 — behavioral evidence",
    "Competency must-have #2 — behavioral evidence",
    "Culture fit — would I want this person leading my function in 18 months?",
  ],
};

export const RAMP_PLAN_30_60_90 = [
  {
    window: "First 30 days",
    purpose: "Listen. Map. Build trust.",
    expectations: [
      "Meets every direct report 1:1 and every peer leader 1:1.",
      "Reviews the last two quarters of OKRs, board packs, all-hands, and customer feedback themes.",
      "Submits a written 'first 30 days observations' memo to the manager.",
    ],
    danger: "Premature changes. The first 30 days is for understanding, not action.",
  },
  {
    window: "Days 30–60",
    purpose: "Land one visible win. Define the 90-day plan.",
    expectations: [
      "Identifies and executes one quick-win that demonstrates judgment without disrupting the org.",
      "Drafts a written 60-day plan covering the next 90 days, with explicit outcomes.",
      "Has built peer credibility — asked for help by 2+ peer leaders.",
    ],
    danger: "Boiling the ocean. One visible win > five half-built initiatives.",
  },
  {
    window: "Day 90 — written review",
    purpose: "Convert impression into decision.",
    expectations: [
      "Manager writes a substantive review (1+ page) covering: outcomes delivered, behaviors observed, gaps, the 'would I hire again' question.",
      "Report writes a self-assessment against the same rubric.",
      "Both meet to align. Material misfires are surfaced now, not at Day 180.",
    ],
    danger: "Verbal-only feedback. Unwritten reviews compound hiring mistakes silently.",
  },
];
