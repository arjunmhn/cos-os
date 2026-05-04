export type CadenceTemplate = {
  id: string;
  cadence: "Weekly" | "Bi-weekly" | "Monthly" | "Quarterly" | "Annual";
  title: string;
  purpose: string;
  attendees: string;
  duration: string;
  prepLeadTime: string;
  agenda: { item: string; minutes: number; owner: string }[];
  artifacts: string[];
  pitfalls: string[];
};

export const CADENCE_TEMPLATES: CadenceTemplate[] = [
  {
    id: "weekly-leadership",
    cadence: "Weekly",
    title: "Weekly Leadership Review",
    purpose:
      "Surface leading-indicator misses while there's still time to act. Re-resource against this week's #1 risk, not last week's wins.",
    attendees: "CEO, COO/CRO, CPO/CTO, CoS, CFO",
    duration: "60 minutes",
    prepLeadTime: "Dashboard locked by EOD Friday; prep doc circulated by Sunday 6pm",
    agenda: [
      { item: "Leading-indicator dashboard walk-through (no narrative, just deltas)", minutes: 10, owner: "CoS" },
      { item: "Status changes since last week (on-track → at-risk)", minutes: 10, owner: "Function owners" },
      { item: "This week's #1 risk and resource ask", minutes: 15, owner: "CEO" },
      { item: "Cross-functional unblocks", minutes: 10, owner: "CoS" },
      { item: "Decisions to log + owners + by-when", minutes: 10, owner: "CoS" },
      { item: "One thing nobody's saying", minutes: 5, owner: "CEO" },
    ],
    artifacts: [
      "Pre-read: leading-indicator dashboard (pipeline coverage, customer health flags, hiring funnel velocity, escalation rate)",
      "Decision log entries from the meeting (with reversibility flag)",
      "Updated workstream tracker",
    ],
    pitfalls: [
      "Walking through every team's update — collapses into status theater. Cut it.",
      "Discussing lagging indicators (revenue, churn). Move those to the monthly.",
      "Letting decisions go un-logged. The decision log is the meeting's only durable artifact.",
    ],
  },
  {
    id: "monthly-business",
    cadence: "Monthly",
    title: "Monthly Business Review",
    purpose:
      "Step back from the weekly noise. Review actuals vs. plan, refresh the forecast, decide on resource shifts that need more than a week to land.",
    attendees: "Leadership team + invited functional leads",
    duration: "90 minutes",
    prepLeadTime: "Financial close T+5; pre-read circulated 48 hours before",
    agenda: [
      { item: "Financials: actuals vs. plan, burn, runway", minutes: 15, owner: "CFO" },
      { item: "GTM: bookings, pipeline, win rate, sales cycle", minutes: 20, owner: "CRO" },
      { item: "Product: shipping velocity, key launches, customer feedback themes", minutes: 20, owner: "CPO" },
      { item: "People: headcount vs. plan, attrition, key open roles", minutes: 10, owner: "CPeo" },
      { item: "Top 3 risks + decisions needed", minutes: 20, owner: "CEO/CoS" },
      { item: "Forecast revision (if needed)", minutes: 5, owner: "CFO" },
    ],
    artifacts: [
      "Monthly Business Review deck (lives in the OS, versioned)",
      "Updated forecast",
      "Investor update first draft (this is the source — write it once)",
    ],
    pitfalls: [
      "Treating it as a longer weekly. The MBR is for trends, not events.",
      "Skipping the forecast revision when reality has diverged. The plan is a hypothesis, not a promise.",
    ],
  },
  {
    id: "quarterly-planning",
    cadence: "Quarterly",
    title: "Quarterly Planning",
    purpose:
      "Set the next quarter's OKRs, kill the ones that no longer matter, and re-allocate effort against the company's #1 bet.",
    attendees: "Full leadership team + 1-2 individual contributors per function for ground truth",
    duration: "Full-day offsite (or two half-days)",
    prepLeadTime: "Pre-reads from each leader 1 week prior; CoS synthesizes themes 3 days prior",
    agenda: [
      { item: "What changed this quarter — market, customers, ourselves", minutes: 30, owner: "CEO" },
      { item: "OKR retrospective: what hit, what missed, why", minutes: 45, owner: "Function owners" },
      { item: "The #1 bet for next quarter (one slide, no more)", minutes: 60, owner: "CEO" },
      { item: "Function OKR drafts + cross-functional dependencies", minutes: 90, owner: "Function owners" },
      { item: "Resource trade-offs: what gets less so the #1 bet gets more", minutes: 45, owner: "Leadership" },
      { item: "Final OKRs locked + owners + ship date for first draft of board pack", minutes: 30, owner: "CoS" },
    ],
    artifacts: [
      "OKRs for the new quarter (3–5 objectives, 2–4 KRs each, every KR has a metric)",
      "The #1 bet memo (one page, narrative)",
      "Board pre-read draft outline",
    ],
    pitfalls: [
      "OKRs that are activity, not outcome (e.g. 'launch X' instead of 'X drives Y measurable change')",
      "Keeping last quarter's OKRs alive on inertia. Kill what doesn't earn its place.",
      "Skipping the trade-off conversation. Without it, every team gets a green light and nothing gets focus.",
    ],
  },
  {
    id: "mid-quarter-pipeline",
    cadence: "Quarterly",
    title: "Mid-Quarter Pipeline Inspection",
    purpose:
      "Catch the quarter miss six weeks early — not at quarter close. Deal-by-deal review of every committed and best-case opportunity, plus a pass on the partnership pipeline.",
    attendees: "CEO, CRO, CoS, top reps for committed deals",
    duration: "2 hours",
    prepLeadTime: "Pipeline frozen and pre-read sent 24 hours prior",
    agenda: [
      { item: "Coverage check: committed + best-case vs. quarter target", minutes: 15, owner: "CRO" },
      { item: "Deal-by-deal: every committed deal (5 min each)", minutes: 60, owner: "Reps" },
      { item: "Slipped deals: where did they go and why", minutes: 20, owner: "CRO" },
      { item: "Partnership pipeline: signed, in-motion, dead", minutes: 15, owner: "Partnerships" },
      { item: "Re-forecast + actions", minutes: 10, owner: "CEO" },
    ],
    artifacts: [
      "Updated forecast for the quarter",
      "Action list per deal — what specifically needs to happen by when",
    ],
    pitfalls: [
      "Letting reps tell stories instead of showing the next concrete buyer action with a date",
      "Not separating committed from best-case. Mixing them anchors the forecast to optimism.",
    ],
  },
  {
    id: "board-prep",
    cadence: "Quarterly",
    title: "Board Meeting Prep Cycle",
    purpose:
      "Treat board prep as a 2-week project, not a panic. Pre-reads land 5 days before so the meeting itself is for discussion, not narration.",
    attendees: "CEO, CoS, CFO, function owners providing inputs",
    duration: "2-week recurring project",
    prepLeadTime: "Kick off 2 weeks before; lock pre-read 5 days before",
    agenda: [
      { item: "Day -14: CoS sends pre-read template + asks to function owners", minutes: 0, owner: "CoS" },
      { item: "Day -10: All function inputs back; CoS drafts narrative", minutes: 0, owner: "CoS" },
      { item: "Day -7: CEO + CoS review draft, lock the strategic narrative", minutes: 0, owner: "CEO/CoS" },
      { item: "Day -5: Pre-read sent to board", minutes: 0, owner: "CoS" },
      { item: "Day -2: 1:1s with key board members for previews", minutes: 0, owner: "CEO" },
      { item: "Day 0: Meeting — 60% discussion, 40% review", minutes: 0, owner: "CEO" },
    ],
    artifacts: [
      "Board pack PDF (versioned, with a public and confidential section)",
      "Post-meeting decisions memo within 48 hours",
    ],
    pitfalls: [
      "Drafting at T-3. The board meeting becomes a presentation instead of a working session.",
      "No 1:1s before the meeting. You learn surprises live, in front of everyone.",
    ],
  },
];

export const DEFAULT_DECISIONS = [
  {
    id: "d1",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    title: "Hold mid-market hiring at 4 AEs through Q+1",
    context:
      "Pipeline coverage in mid-market sits at 2.4x — below the 3x bar. Adding capacity ahead of pipeline would dilute quota attainment and lengthen ramp.",
    decision:
      "Pause AE backfills until coverage hits 3x for two consecutive weeks. Redirect the open headcount budget to one Sales Engineer.",
    owner: "CRO",
    reversible: true,
  },
  {
    id: "d2",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    title: "Adopt MOC (Mission/Outcomes/Competencies) for every new role",
    context:
      "Three of the last five hires misfired in the first 90 days. Pattern: fuzzy outcomes, JD written from a title rather than the work.",
    decision:
      "Every open role requires a one-page MOC signed off by the hiring manager and reviewed by CoS before the JD goes live.",
    owner: "CoS",
    reversible: true,
  },
  {
    id: "d3",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    title: "Move investor update from quarterly to monthly",
    context:
      "Last fundraise feedback: investors felt out of the loop between quarters. Forced narrative cadence sharpens our internal thinking too.",
    decision:
      "Investor update ships by the 5th of every month — same metrics, brief commentary, asks. Even months with no news.",
    owner: "CEO + CoS",
    reversible: false,
  },
];

export const DEFAULT_OKRS = [
  {
    id: "o1",
    title: "Prove repeatable mid-market motion",
    owner: "CRO",
    quarter: "Q1",
    why: "Repeatability — not raw bookings — is the unlock for the Series B story. Until we can show win rate >25% and cycle <60 days for a defined ICP, every dollar of growth is one-off.",
    keyResults: [
      { id: "kr1", title: "Win rate ≥ 25% in the defined ICP", metric: "%", start: 18, current: 21, target: 25, status: "at-risk" as const },
      { id: "kr2", title: "Sales cycle ≤ 60 days for ICP deals", metric: "days", start: 84, current: 71, target: 60, status: "at-risk" as const },
      { id: "kr3", title: "5 new ICP logos closed", metric: "logos", start: 0, current: 3, target: 5, status: "on-track" as const },
    ],
  },
  {
    id: "o2",
    title: "Ship the v2 platform GA",
    owner: "CPO",
    quarter: "Q1",
    why: "v1 has hit its product-market-fit ceiling on segment B. v2 is the first release that addresses the core jobs in segments A + C. Without it, ARR per logo stays flat.",
    keyResults: [
      { id: "kr4", title: "GA on March 15", metric: "date", start: 0, current: 1, target: 1, status: "on-track" as const },
      { id: "kr5", title: "10 design partners migrated", metric: "partners", start: 0, current: 6, target: 10, status: "on-track" as const },
      { id: "kr6", title: "P0/P1 escape rate < 2 in first 30 days post-GA", metric: "issues", start: 0, current: 0, target: 2, status: "on-track" as const },
    ],
  },
  {
    id: "o3",
    title: "Codify how we hire",
    owner: "CoS",
    quarter: "Q1",
    why: "Going from 32 → 60+ this year. Without rubrics anyone can run, our hiring bar walks out the door with the founders' attention.",
    keyResults: [
      { id: "kr7", title: "MOC + scorecard for every open role", metric: "%", start: 30, current: 70, target: 100, status: "on-track" as const },
      { id: "kr8", title: "Day-90 written reviews completed", metric: "%", start: 0, current: 40, target: 100, status: "at-risk" as const },
      { id: "kr9", title: "Time-to-decision after onsite ≤ 5 days", metric: "days", start: 11, current: 7, target: 5, status: "on-track" as const },
    ],
  },
];
