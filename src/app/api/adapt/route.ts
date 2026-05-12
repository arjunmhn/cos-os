import Anthropic from "@anthropic-ai/sdk";
import { ADAPT_PERSONA } from "@/lib/cos-persona";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 8000;

const MIN_SOURCE_CHARS = 3;
const MAX_SOURCE_CHARS = 20000;

type Stage = "pre-seed" | "seed" | "series-a" | "series-b" | "series-c-plus";
type DealSegment = "smb" | "mid-market" | "enterprise";
type DealStage =
  | "discovery"
  | "evaluation"
  | "proposal"
  | "commit"
  | "best-case"
  | "closed-won"
  | "closed-lost";
type CandidateStage = "sourcing" | "screen" | "onsite" | "offer" | "hired";
type RoleStatus = "drafting" | "open" | "in-loop" | "filled";
type OkrStatus = "on-track" | "at-risk" | "off-track" | "completed";

type SeedRole = {
  id: string;
  title: string;
  function: string;
  hiringManager: string;
  status: RoleStatus;
  mission: string;
  outcomes: string[];
  mustHaves: string[];
  niceToHaves: string[];
  createdAt: string;
};

type SeedObjective = {
  id: string;
  title: string;
  owner: string;
  quarter: string;
  why: string;
  keyResults: {
    id: string;
    title: string;
    metric: string;
    start: number;
    current: number;
    target: number;
    status: OkrStatus;
  }[];
};

type SeedDeal = {
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

type SeedCandidate = {
  id: string;
  name: string;
  roleId: string;
  stage: CandidateStage;
  daysInStage: number;
  source: string;
  scorecard: { interviewer: string; score: number }[];
};

type SeedDecision = {
  id: string;
  date: string;
  title: string;
  context: string;
  decision: string;
  owner: string;
  reversible: boolean;
};

type AdaptResponse = {
  profile: {
    name: string;
    stage: Stage;
    hq: string;
    teamSize: number;
    founded: string;
    oneLiner: string;
    northStarMetric: string;
    fiscalYearStart: number;
  };
  context: {
    sector: string;
    strategicMoment: string;
    keyHires: string[];
    suggestedOkrThemes: string[];
    ceoName: string;
  };
  seed: {
    okrs: SeedObjective[];
    deals: SeedDeal[];
    candidates: SeedCandidate[];
    roles: SeedRole[];
    decisions: SeedDecision[];
  } | null;
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set on the server. Add it as an environment variable on Vercel and redeploy.",
        code: "missing_key",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { source } = body as { source?: string };
  if (typeof source !== "string" || source.trim().length < MIN_SOURCE_CHARS) {
    return Response.json(
      { error: "Provide a job description, careers page text, or a company name." },
      { status: 400 }
    );
  }
  if (source.length > MAX_SOURCE_CHARS) {
    return Response.json(
      { error: `Source too long (max ${MAX_SOURCE_CHARS} chars).` },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: ADAPT_PERSONA,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: source.trim() }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const parsed = safeExtractJson(text);
    if (!parsed) {
      return Response.json(
        { error: "Model returned non-JSON output. Try a longer or clearer source.", raw: text },
        { status: 502 }
      );
    }

    const validated = validateAdapt(parsed);
    if (!validated) {
      return Response.json(
        { error: "Model output didn't match the expected schema.", raw: parsed },
        { status: 502 }
      );
    }

    return Response.json({
      ...validated,
      usage: response.usage,
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "Demo is rate-limited. Try again in a minute.", code: "rate_limit" },
        { status: 429 }
      );
    }
    if (e instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "Server-side API key is invalid.", code: "auth" },
        { status: 401 }
      );
    }
    if (e instanceof Anthropic.APIError) {
      return Response.json(
        { error: `Model error: ${e.message}`, code: "api_error" },
        { status: e.status || 500 }
      );
    }
    return Response.json(
      { error: e instanceof Error ? e.message : "Unknown server error." },
      { status: 500 }
    );
  }
}

function safeExtractJson(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  const candidate = (fenced ? fenced[1] : text).trim();
  const firstBrace = candidate.indexOf("{");
  if (firstBrace < 0) return null;
  const lastBrace = candidate.lastIndexOf("}");

  // First try: take everything from { to the last }
  if (lastBrace > firstBrace) {
    const slice = candidate.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(slice);
    } catch {
      // fall through to repair
    }
  }

  // Repair attempt: assume the model got cut off. Close any open string,
  // arrays, and objects so we recover the partial structure.
  const fromStart = candidate.slice(firstBrace);
  const repaired = repairTruncatedJson(fromStart);
  try {
    return JSON.parse(repaired);
  } catch {
    return null;
  }
}

function repairTruncatedJson(text: string): string {
  let inString = false;
  let escape = false;
  const stack: string[] = []; // tracks "{" and "[" opens

  let lastSafeEnd = -1; // index of last char that left us at a stable state

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      if (inString) escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch === "}") {
      if (stack[stack.length - 1] === "{") stack.pop();
    } else if (ch === "]") {
      if (stack[stack.length - 1] === "[") stack.pop();
    }
    // Track positions where stack is non-empty but we've completed a value cleanly.
    if (!inString && (ch === "}" || ch === "]" || ch === ",")) {
      lastSafeEnd = i;
    }
  }

  // If we ended inside a string, drop back to the last safe boundary
  // and re-walk the stack to that point.
  let working = text;
  if (inString && lastSafeEnd >= 0) {
    working = text.slice(0, lastSafeEnd + 1);
    // Recompute stack for the trimmed view
    stack.length = 0;
    let s = false, e = false;
    for (let i = 0; i < working.length; i++) {
      const ch = working[i];
      if (e) { e = false; continue; }
      if (ch === "\\" && s) { e = true; continue; }
      if (ch === '"') { s = !s; continue; }
      if (s) continue;
      if (ch === "{" || ch === "[") stack.push(ch);
      else if (ch === "}" && stack[stack.length - 1] === "{") stack.pop();
      else if (ch === "]" && stack[stack.length - 1] === "[") stack.pop();
    }
  }

  // Trim a trailing comma that would leave an array/object syntactically wrong
  working = working.replace(/,\s*$/, "");

  // Close remaining structures
  while (stack.length > 0) {
    const top = stack.pop();
    working += top === "{" ? "}" : "]";
  }

  return working;
}

const VALID_STAGES: Stage[] = ["pre-seed", "seed", "series-a", "series-b", "series-c-plus"];
const VALID_SEGMENTS: DealSegment[] = ["smb", "mid-market", "enterprise"];
const VALID_DEAL_STAGES: DealStage[] = [
  "discovery",
  "evaluation",
  "proposal",
  "commit",
  "best-case",
  "closed-won",
  "closed-lost",
];
const VALID_CAND_STAGES: CandidateStage[] = ["sourcing", "screen", "onsite", "offer", "hired"];
const VALID_ROLE_STATUS: RoleStatus[] = ["drafting", "open", "in-loop", "filled"];
const VALID_OKR_STATUS: OkrStatus[] = ["on-track", "at-risk", "off-track", "completed"];

function asEnum<T extends string>(value: unknown, valid: readonly T[], fallback: T): T {
  const s = String(value ?? "").toLowerCase().replace(/\s+/g, "-");
  return (valid as readonly string[]).includes(s) ? (s as T) : fallback;
}

function asInt(value: unknown, fallback: number, min?: number, max?: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

function asNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((s): s is string => typeof s === "string").slice(0, max);
}

function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.toLowerCase();
    if (v === "true" || v === "yes" || v === "1") return true;
    if (v === "false" || v === "no" || v === "0") return false;
  }
  return fallback;
}

function isoDaysOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function slug(s: string, max = 16): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, max);
}

function validateAdapt(input: unknown): AdaptResponse | null {
  if (typeof input !== "object" || input === null) return null;
  const obj = input as Record<string, unknown>;
  const p = obj.profile as Record<string, unknown> | undefined;
  const c = obj.context as Record<string, unknown> | undefined;
  if (!p || !c) return null;

  const profile = {
    name: asString(p.name).trim() || "Unknown",
    stage: asEnum<Stage>(p.stage, VALID_STAGES, "series-a"),
    hq: asString(p.hq).trim() || "San Francisco, CA",
    teamSize: asInt(p.teamSize, 30, 1, 100000),
    founded: asString(p.founded).trim() || String(new Date().getFullYear() - 2),
    oneLiner: asString(p.oneLiner).trim(),
    northStarMetric: asString(p.northStarMetric).trim() || "Weekly Active Users",
    fiscalYearStart: asInt(p.fiscalYearStart, 1, 1, 12),
  };

  const context = {
    sector: asString(c.sector).trim(),
    strategicMoment: asString(c.strategicMoment).trim(),
    keyHires: asStringArray(c.keyHires, 6),
    suggestedOkrThemes: asStringArray(c.suggestedOkrThemes, 6),
    ceoName: asString(c.ceoName).trim(),
  };

  const seed = validateSeed(obj.seed);

  return { profile, context, seed };
}

function validateSeed(value: unknown): AdaptResponse["seed"] {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;

  // Roles first — candidates reference them
  const rolesIn = Array.isArray(v.roles) ? (v.roles as Record<string, unknown>[]).slice(0, 4) : [];
  const roles: SeedRole[] = rolesIn.map((r, i) => {
    const title = asString(r.title).trim() || `Role ${i + 1}`;
    return {
      id: `r-${slug(title)}-${i}`,
      title,
      function: asString(r.function).trim() || "—",
      hiringManager: asString(r.hiringManager).trim() || "CEO",
      status: asEnum<RoleStatus>(r.status, VALID_ROLE_STATUS, "drafting"),
      mission: asString(r.mission).trim(),
      outcomes: asStringArray(r.outcomes, 6),
      mustHaves: asStringArray(r.mustHaves, 6),
      niceToHaves: asStringArray(r.niceToHaves, 4),
      createdAt: new Date().toISOString(),
    };
  });

  const okrsIn = Array.isArray(v.okrs) ? (v.okrs as Record<string, unknown>[]).slice(0, 4) : [];
  const okrs: SeedObjective[] = okrsIn.map((o, i) => {
    const title = asString(o.title).trim() || `Objective ${i + 1}`;
    const krsIn = Array.isArray(o.keyResults) ? (o.keyResults as Record<string, unknown>[]).slice(0, 4) : [];
    return {
      id: `o-${slug(title)}-${i}`,
      title,
      owner: asString(o.owner).trim() || "CoS",
      quarter: asString(o.quarter).trim() || "Q1",
      why: asString(o.why).trim(),
      keyResults: krsIn.map((kr, ki) => ({
        id: `kr-${i}-${ki}`,
        title: asString(kr.title).trim() || `KR ${ki + 1}`,
        metric: asString(kr.metric).trim(),
        start: asNumber(kr.start, 0),
        current: asNumber(kr.current, 0),
        target: asNumber(kr.target, 1),
        status: asEnum<OkrStatus>(kr.status, VALID_OKR_STATUS, "on-track"),
      })),
    };
  });

  const dealsIn = Array.isArray(v.deals) ? (v.deals as Record<string, unknown>[]).slice(0, 10) : [];
  const deals: SeedDeal[] = dealsIn.map((d, i) => {
    const name = asString(d.name).trim() || `Deal ${i + 1}`;
    const daysOut = asInt(d.daysOut, 7, 1, 90);
    return {
      id: `deal-${slug(name)}-${i}`,
      name,
      segment: asEnum<DealSegment>(d.segment, VALID_SEGMENTS, "mid-market"),
      stage: asEnum<DealStage>(d.stage, VALID_DEAL_STAGES, "evaluation"),
      acv: asInt(d.acv, 100000, 1000, 5000000),
      owner: asString(d.owner).trim() || "—",
      nextAction: asString(d.nextAction).trim() || "Next-step TBD",
      nextActionDate: isoDaysOffset(daysOut),
      slipped: asBool(d.slipped, false),
      inIcp: asBool(d.inIcp, true),
    };
  });

  // Build a lookup from possible role names to role IDs
  const roleNameToId = new Map<string, string>();
  for (const r of roles) {
    roleNameToId.set(r.title.toLowerCase(), r.id);
    // Also map common shorthand variations
    const tokens = r.title.toLowerCase().split(/\s+/);
    if (tokens.length > 0) roleNameToId.set(tokens.slice(-1)[0], r.id);
  }
  const fallbackRoleId = roles[0]?.id || "";

  const candIn = Array.isArray(v.candidates)
    ? (v.candidates as Record<string, unknown>[]).slice(0, 8)
    : [];
  const candidates: SeedCandidate[] = candIn.map((c, i) => {
    const name = asString(c.name).trim() || `Candidate ${i + 1}`;
    const roleTitle = asString(c.roleTitle).trim();
    const roleKey = roleTitle.toLowerCase();
    let roleId = fallbackRoleId;
    if (roleNameToId.has(roleKey)) {
      roleId = roleNameToId.get(roleKey)!;
    } else {
      // Fuzzy: find any role whose title contains roleTitle or vice-versa
      for (const r of roles) {
        const t = r.title.toLowerCase();
        if (t.includes(roleKey) || roleKey.includes(t)) {
          roleId = r.id;
          break;
        }
      }
    }
    return {
      id: `c-${slug(name)}-${i}`,
      name,
      roleId,
      stage: asEnum<CandidateStage>(c.stage, VALID_CAND_STAGES, "sourcing"),
      daysInStage: asInt(c.daysInStage, 5, 0, 60),
      source: asString(c.source).trim() || "Outbound",
      scorecard: [],
    };
  });

  const decIn = Array.isArray(v.decisions) ? (v.decisions as Record<string, unknown>[]).slice(0, 5) : [];
  const decisions: SeedDecision[] = decIn.map((d, i) => {
    const title = asString(d.title).trim() || `Decision ${i + 1}`;
    const daysAgo = asInt(d.daysAgo, 7, 0, 365);
    return {
      id: `d-${slug(title)}-${i}`,
      date: isoDaysOffset(-daysAgo),
      title,
      context: asString(d.context).trim(),
      decision: asString(d.decision).trim(),
      owner: asString(d.owner).trim() || "CEO",
      reversible: asBool(d.reversible, true),
    };
  });

  // Only return seed if we got meaningful data across the modules
  const hasContent =
    okrs.length > 0 || deals.length > 0 || candidates.length > 0 || roles.length > 0 || decisions.length > 0;
  if (!hasContent) return null;

  return { okrs, deals, candidates, roles, decisions };
}
