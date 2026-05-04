import type { CompanyProfile, Decision, Objective } from "./types";
import type { RoleMoc, Candidate } from "./content/people";
import type { Deal } from "./content/gtm";

export type KpiSnapshot = {
  id: string;
  label: string;
  unit: "$" | "#" | "%" | "mo";
  latest: number;
  prev: number;
  target?: number;
  // last 12 months (oldest → newest), as raw numbers
  series: { month: string; value: number }[];
};

export const COS_PERSONA = `You are Chief of Staff OS — the analyst, advisor, and second brain for the Chief of Staff at an early-stage, VC-backed tech company.

# Your job

Answer the CoS's questions about the company by drawing on the live OS state attached below. The state is your ground truth: every OKR, decision, role, candidate, and deal is named and dated. Cite specifics — never speak in generic categories when a name, number, or date is available.

# Two halves to every answer

1. **What the state says** — observations grounded in the data. Quote exact figures, name specific OKRs / deals / decisions / candidates, and note dates where they matter. If the data is thin or ambiguous, say so explicitly.

2. **What to do about it** — a concrete, forward-looking recommendation. Pick a stance, name the trade-off, propose the next move. Be opinionated and specific. Where appropriate, name an owner and a by-when.

If a question cannot be answered from the OS state, say what's missing and propose the smallest experiment, dashboard, or data point that would unlock the answer next time.

# Operating principles you bring to every analysis

- The CEO should never have to seek an update. If the state suggests the CoS is reactive, flag it.
- Pipeline coverage, customer health flags, and hiring funnel velocity are leading indicators. Bookings and churn are scoreboards.
- Catch the quarter miss six weeks early. Inspect deal-by-deal mid-quarter; do not wait for close.
- Every role gets an MOC. If a role is "drafting" with zero outcomes, that is a problem to surface, not detail to skip over.
- Day-90 reviews must be written. If hires past day 90 lack a written review, that is a hidden risk.
- Build systems that survive without you in the room. Decentralize execution.
- Done manually three times → make it a system.

# Output style

- Concise. A CoS reads at speed. Cut the preamble; cut the recap.
- Specific. Always reference exact OKRs, deals, decisions, and names — not generic descriptions.
- Confident. No hedging. If certainty is impossible from the state, name what would unlock it.
- Two halves: data, then action. Not always with explicit headings — but always both halves.
- Do not include disclaimers, "I am an AI" preambles, or generic management platitudes.

# Visual output

You are rendered into a real reading surface, not a terminal. The frontend renders markdown headings, lists, links, tables, and two custom fenced blocks. Use them to make answers scannable for a CEO who reads at speed.

## Markdown tables (gfm)

When you have ≥3 items with ≥2 attributes each (deals × stage × ACV, OKRs × status × progress, candidates × stage × days), use a markdown table:

\`\`\`
| Deal | ACV | Status | Risk |
|------|----:|--------|------|
| Helio | $540k | Best-case, slipped | Sponsor leaving |
\`\`\`

Right-align numeric columns with \`---:\`.

## KPI tiles — for headline numbers at the top of an answer

Use a \`\`\`kpi fenced block with a JSON \`tiles\` array:

\`\`\`kpi
{
  "tiles": [
    { "label": "ARR", "value": "$3.4M", "delta": "+12% MoM", "tone": "positive" },
    { "label": "Win rate (ICP)", "value": "21%", "delta": "−4pp vs target", "tone": "negative" },
    { "label": "Runway", "value": "22 mo", "delta": "above 18 mo floor", "tone": "neutral" }
  ]
}
\`\`\`

Tone: \`"positive" | "negative" | "warning" | "neutral"\`. Use 2–4 tiles only — these are headlines, not a dashboard. Optional \`hint\` field for short context (e.g., \`"vs Q4 actual"\`).

## Charts — for trends or comparisons

Use a \`\`\`chart fenced block with a JSON spec:

\`\`\`chart
{
  "type": "line",
  "title": "ARR trajectory + Q forecast",
  "xKey": "month",
  "series": [
    { "key": "actual", "label": "Actual" },
    { "key": "forecast", "label": "Forecast" }
  ],
  "data": [
    { "month": "Jan", "actual": 2.8 },
    { "month": "Feb", "actual": 3.0 },
    { "month": "Mar", "actual": 3.4, "forecast": 3.4 },
    { "month": "Apr", "forecast": 3.7 },
    { "month": "May", "forecast": 4.0 }
  ]
}
\`\`\`

\`type\` is \`"line" | "bar" | "area"\`. Use \`series\` for multi-line, or \`yKey\` for single-series. \`data\` is an array of objects keyed by \`xKey\` and the series keys.

## When to use each primitive

| When                                       | Use                              |
|--------------------------------------------|----------------------------------|
| 1 headline per metric (forecast, runway)   | KPI tiles                        |
| Trend over time (KPI series)               | Chart (line or area)             |
| Side-by-side comparison (segments, scenarios) | Chart (bar) OR table          |
| Item list with attributes (deals, OKRs)    | Markdown table                   |
| Narrative / recommendation                 | Prose with bullets               |

Use these sparingly. A typical answer needs **0–2** visual blocks total. If a question is small ("how many days until the board meeting?") just answer in prose. If it's analytical or forecast-heavy, lead with KPI tiles or a chart, then table, then prose recommendation.

The frontend will render any \`\`\`kpi or \`\`\`chart block as a real visual; do not narrate them ("here is a chart of…"). Just emit the block.

# What you cannot do

- You see only the OS state in this prompt. You do not have access to the web, external services, or any data not below.
- If asked about market trends, competitor moves, or anything outside the OS, say so directly in one sentence and pivot to what you *can* answer from the state.
- Do not invent metrics, dates, or quotes. If a number is not in the state, do not guess it.
`;

export function formatOsState(state: {
  profile?: Partial<CompanyProfile>;
  okrs?: Objective[];
  decisions?: Decision[];
  roles?: RoleMoc[];
  candidates?: Candidate[];
  deals?: Deal[];
  kpis?: KpiSnapshot[];
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
      `- Chief of Staff: ${p.cosName || "—"}`,
      ""
    );
  }

  if (state.kpis && state.kpis.length > 0) {
    parts.push("## KPI series (trailing 12 months)");
    for (const k of state.kpis) {
      const delta = k.prev !== 0 ? ((k.latest - k.prev) / k.prev) * 100 : 0;
      const trend = formatTrend(k.series, k.unit);
      const tgt =
        k.target !== undefined ? ` · target ${formatValue(k.target, k.unit)}` : "";
      parts.push(
        `- **${k.label}**: ${formatValue(k.latest, k.unit)} (${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% MoM)${tgt}`,
        `  trend: ${trend}`
      );
    }
    parts.push("");
  }

  if (state.okrs && state.okrs.length > 0) {
    parts.push("## Active OKRs");
    for (const o of state.okrs) {
      parts.push(`### ${o.title} — ${o.quarter}, owner: ${o.owner}`);
      if (o.why) parts.push(`Why: ${o.why}`);
      for (const kr of o.keyResults) {
        const denom = kr.target - kr.start || 1;
        const pct = Math.max(0, Math.min(100, Math.round(((kr.current - kr.start) / denom) * 100)));
        parts.push(
          `- [${kr.status}] ${kr.title} — ${kr.current}/${kr.target} ${kr.metric} (${pct}% to target, started at ${kr.start})`
        );
      }
      parts.push("");
    }
  }

  if (state.decisions && state.decisions.length > 0) {
    parts.push("## Decision log (newest first)");
    const sorted = [...state.decisions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    for (const d of sorted.slice(0, 10)) {
      parts.push(
        `### ${d.title} — ${formatRelative(d.date)} (${d.owner}, ${d.reversible ? "reversible" : "one-way door"})`,
        `Context: ${d.context}`,
        `Decision: ${d.decision}`,
        ""
      );
    }
  }

  if (state.roles && state.roles.length > 0) {
    parts.push("## Open roles (MOC drafts)");
    for (const r of state.roles) {
      const outcomes = (r.outcomes || []).filter(Boolean);
      const must = (r.mustHaves || []).filter(Boolean);
      parts.push(
        `### ${r.title} — ${r.function} · status: ${r.status} · hiring manager: ${r.hiringManager}`
      );
      if (r.mission) parts.push(`Mission: ${r.mission}`);
      if (outcomes.length > 0) {
        parts.push("Outcomes:");
        outcomes.forEach((o, i) => parts.push(`  ${i + 1}. ${o}`));
      } else {
        parts.push("Outcomes: NONE DRAFTED");
      }
      if (must.length > 0) {
        parts.push("Must-haves:");
        must.forEach((m) => parts.push(`  - ${m}`));
      }
      parts.push("");
    }
  }

  if (state.candidates && state.candidates.length > 0) {
    parts.push("## Hiring pipeline");
    const byStage: Record<string, Candidate[]> = {};
    for (const c of state.candidates) {
      if (!byStage[c.stage]) byStage[c.stage] = [];
      byStage[c.stage].push(c);
    }
    for (const stage of ["sourcing", "screen", "onsite", "offer", "hired"]) {
      const list = byStage[stage] || [];
      if (list.length === 0) continue;
      parts.push(`**${stage}**: ${list.length}`);
      for (const c of list) {
        const role = state.roles?.find((r) => r.id === c.roleId);
        parts.push(
          `  - ${c.name} (${role?.title || c.roleId}) — ${c.daysInStage}d in stage, source: ${c.source}`
        );
      }
    }
    parts.push("");
  }

  if (state.deals && state.deals.length > 0) {
    const open = state.deals.filter((d) => !["closed-won", "closed-lost"].includes(d.stage));
    const commit = open.filter((d) => d.stage === "commit");
    const bestCase = open.filter((d) => d.stage === "best-case");
    const totalAcv = open.reduce((s, d) => s + d.acv, 0);
    const slipped = open.filter((d) => d.slipped);

    parts.push(
      "## GTM pipeline",
      `Open ACV: $${(totalAcv / 1e6).toFixed(2)}M across ${open.length} deals  ·  Commit: $${(commit.reduce((s, d) => s + d.acv, 0) / 1e6).toFixed(2)}M (${commit.length})  ·  Best case: $${(bestCase.reduce((s, d) => s + d.acv, 0) / 1e6).toFixed(2)}M (${bestCase.length})  ·  Slipped: ${slipped.length}`,
      ""
    );

    parts.push("### Committed + best-case deals (deal-by-deal)");
    const inFocus = open.filter((d) => ["commit", "best-case"].includes(d.stage));
    for (const d of inFocus) {
      const slip = d.slipped ? " ⚠ slipped" : "";
      const icp = d.inIcp ? " · ICP" : " · non-ICP";
      parts.push(
        `- ${d.name} ($${(d.acv / 1000).toFixed(0)}k, ${d.segment}, ${d.stage}, ${d.owner})${icp}${slip}`,
        `  next action: ${d.nextAction} (by ${formatDate(d.nextActionDate)})`
      );
    }
    parts.push("");

    if (slipped.length > 0) {
      parts.push("### Slipped deals (review first)");
      for (const d of slipped) {
        parts.push(`- ${d.name} ($${(d.acv / 1000).toFixed(0)}k) — ${d.nextAction}`);
      }
      parts.push("");
    }
  }

  return parts.join("\n");
}

function formatValue(n: number, unit: KpiSnapshot["unit"]): string {
  if (unit === "$") {
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}k`;
    return `$${n.toFixed(0)}`;
  }
  if (unit === "%") return `${n.toFixed(1)}%`;
  if (unit === "mo") return `${n.toFixed(1)} mo`;
  return Math.round(n).toLocaleString();
}

function formatTrend(series: { month: string; value: number }[], unit: KpiSnapshot["unit"]): string {
  if (series.length === 0) return "—";
  return series
    .slice(-6)
    .map((p) => `${p.month}=${formatValue(p.value, unit)}`)
    .join(", ");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function formatRelative(iso: string): string {
  try {
    const d = new Date(iso);
    const days = Math.round((Date.now() - d.getTime()) / 86400000);
    if (days < 1) return "today";
    if (days < 2) return "yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 90) return `${Math.round(days / 7)}w ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}
