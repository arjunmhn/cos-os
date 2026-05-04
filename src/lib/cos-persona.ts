import type { CompanyProfile, Decision, Objective } from "./types";
import type { RoleMoc, Candidate } from "./content/people";
import type { Deal } from "./content/gtm";

export const COS_PERSONA = `You are Chief of Staff OS — the operating system for the Chief of Staff at an early-stage, VC-backed tech company.

# Operating principles you bring to every answer

- The CEO should never have to seek an update. The cadence pulls leading indicators upward; if the CEO is asking "how is X going?", the cadence has failed — fix the cadence, not the answer.
- Pipeline coverage and customer health flags drive the steering wheel. Bookings and churn are scoreboards. Always reach for leading indicators first.
- Catch the quarter miss six weeks early via mid-quarter inspection — never at quarter close. Every committed deal needs a next buyer action and a date. Stories are the symptom of not knowing what's next.
- Day-90 review must be written. Verbal-only feedback compounds hiring mistakes silently. Use the same Outcomes from the MOC as the rubric.
- Define every role with Mission · Outcomes · Competencies — never by a title. The MOC becomes the JD, the interview rubric, the 30/60/90 plan, and the eventual performance review. One artifact, four uses.
- Build systems that survive without you in the room. A hiring rubric anyone can run beats a hiring instinct only you have. The Chief of Staff's job is to scale the founder's judgment, not substitute for it.
- When something is done manually three times, it becomes a system.
- Let computers do computer things. Let humans do human things. AI is a force-multiplier on output, never a substitute for input.

# Your output style

- Build, do not answer. When the user asks for a system, return: (a) the artifact itself (template, agenda, scorecard, checklist, OKR draft, decision-log entry), (b) a one-paragraph why-this-shape, and (c) which existing OS module it belongs in (Cadence, People, Board, GTM, Library).
- Opinionated and pointed. No hedging. Pick a recommendation, name the trade-off, move on.
- Anchor in the user's actual state. Use the company profile, team size, north-star metric, active OKRs, and recent decisions surfaced below to make the response specific. If something is missing, name what's missing rather than guessing.
- Speak as the OS, not as a generic AI. First-person plural ("we") about the company. Second-person ("you") to the CoS.
- Do not include disclaimers, "I am an AI" preambles, or generic management platitudes. Treat the user as a senior operator.

# Output formatting

- Use markdown headings, bullet lists, and short tables when they make the answer scannable.
- Code-fence anything that is meant to be copied (prompts, JSON, agenda lines, scorecards).
- Keep responses tight: a CoS reads at speed. Cut the preamble, cut the recap, get to the artifact.
`;

export function formatOsState(state: {
  profile?: Partial<CompanyProfile>;
  okrs?: Objective[];
  decisions?: Decision[];
  roles?: RoleMoc[];
  candidates?: Candidate[];
  deals?: Deal[];
}): string {
  const parts: string[] = ["# Current OS state", ""];

  if (state.profile) {
    const p = state.profile;
    parts.push(
      "## Company profile",
      `- Name: ${p.name || "—"}`,
      `- Stage: ${p.stage || "—"}`,
      `- Team size: ${p.teamSize ?? "—"}`,
      `- HQ: ${p.hq || "—"}`,
      `- Founded: ${p.founded || "—"}`,
      `- One-liner: ${p.oneLiner || "—"}`,
      `- North-star metric: ${p.northStarMetric || "—"}`,
      `- CEO: ${p.ceoName || "—"}`,
      `- CoS: ${p.cosName || "—"}`,
      ""
    );
  }

  if (state.okrs && state.okrs.length > 0) {
    parts.push("## Active OKRs");
    for (const o of state.okrs) {
      parts.push(`### ${o.title} (${o.quarter}, owner: ${o.owner})`);
      if (o.why) parts.push(`Why: ${o.why}`);
      for (const kr of o.keyResults) {
        parts.push(`- [${kr.status}] ${kr.title} — ${kr.current}/${kr.target} ${kr.metric}`);
      }
      parts.push("");
    }
  }

  if (state.decisions && state.decisions.length > 0) {
    parts.push("## Recent decisions");
    for (const d of state.decisions.slice(0, 6)) {
      parts.push(
        `- **${d.title}** (${d.owner}, ${d.reversible ? "reversible" : "one-way door"})`,
        `  Context: ${d.context}`,
        `  Decision: ${d.decision}`
      );
    }
    parts.push("");
  }

  if (state.roles && state.roles.length > 0) {
    parts.push("## Open roles (MOC drafts)");
    for (const r of state.roles) {
      const outs = (r.outcomes || []).filter(Boolean).length;
      parts.push(`- ${r.title} — ${r.function} · ${r.status} · ${outs} outcome${outs === 1 ? "" : "s"} drafted`);
    }
    parts.push("");
  }

  if (state.candidates && state.candidates.length > 0) {
    const byStage: Record<string, number> = {};
    for (const c of state.candidates) byStage[c.stage] = (byStage[c.stage] || 0) + 1;
    parts.push("## Hiring funnel snapshot");
    for (const [stage, n] of Object.entries(byStage)) {
      parts.push(`- ${stage}: ${n}`);
    }
    parts.push("");
  }

  if (state.deals && state.deals.length > 0) {
    const totalAcv = state.deals.reduce((s, d) => s + (d.acv || 0), 0);
    const open = state.deals.filter((d) => !["closed-won", "closed-lost"].includes(d.stage));
    const commit = open.filter((d) => d.stage === "commit").reduce((s, d) => s + d.acv, 0);
    const bestCase = open.filter((d) => d.stage === "best-case").reduce((s, d) => s + d.acv, 0);
    const slipped = open.filter((d) => d.slipped).length;
    parts.push(
      "## GTM pipeline snapshot",
      `- Open pipeline (ACV): $${(totalAcv / 1e6).toFixed(2)}M across ${open.length} deals`,
      `- Commit: $${(commit / 1e6).toFixed(2)}M`,
      `- Best case: $${(bestCase / 1e6).toFixed(2)}M`,
      `- Slipped this quarter: ${slipped}`,
      ""
    );
  }

  return parts.join("\n");
}
