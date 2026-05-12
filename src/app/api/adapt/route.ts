import Anthropic from "@anthropic-ai/sdk";
import { ADAPT_PERSONA } from "@/lib/cos-persona";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1024;

const MIN_SOURCE_CHARS = 3;
const MAX_SOURCE_CHARS = 20000;

type AdaptResponse = {
  profile: {
    name: string;
    stage: "pre-seed" | "seed" | "series-a" | "series-b" | "series-c-plus";
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
      profile: validated.profile,
      context: validated.context,
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
  // Strip optional ```json fences
  const fenced = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  const candidate = (fenced ? fenced[1] : text).trim();
  // Find the outermost JSON object
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace < firstBrace) return null;
  const slice = candidate.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

const VALID_STAGES = ["pre-seed", "seed", "series-a", "series-b", "series-c-plus"] as const;

function validateAdapt(input: unknown): AdaptResponse | null {
  if (typeof input !== "object" || input === null) return null;
  const obj = input as Record<string, unknown>;
  const p = obj.profile as Record<string, unknown> | undefined;
  const c = obj.context as Record<string, unknown> | undefined;
  if (!p || !c) return null;

  const stage = String(p.stage ?? "").toLowerCase();
  const validStage = VALID_STAGES.includes(stage as (typeof VALID_STAGES)[number])
    ? (stage as AdaptResponse["profile"]["stage"])
    : "series-a";

  const fiscalRaw = Number(p.fiscalYearStart);
  const fiscalYearStart =
    Number.isFinite(fiscalRaw) && fiscalRaw >= 1 && fiscalRaw <= 12 ? Math.floor(fiscalRaw) : 1;

  const teamSizeRaw = Number(p.teamSize);
  const teamSize = Number.isFinite(teamSizeRaw) && teamSizeRaw > 0 ? Math.floor(teamSizeRaw) : 30;

  const keyHires = Array.isArray(c.keyHires)
    ? c.keyHires.filter((s): s is string => typeof s === "string").slice(0, 6)
    : [];
  const suggestedOkrThemes = Array.isArray(c.suggestedOkrThemes)
    ? c.suggestedOkrThemes.filter((s): s is string => typeof s === "string").slice(0, 6)
    : [];

  return {
    profile: {
      name: String(p.name ?? "").trim() || "Unknown",
      stage: validStage,
      hq: String(p.hq ?? "").trim() || "San Francisco, CA",
      teamSize,
      founded: String(p.founded ?? "").trim() || String(new Date().getFullYear() - 2),
      oneLiner: String(p.oneLiner ?? "").trim(),
      northStarMetric: String(p.northStarMetric ?? "").trim() || "Weekly Active Users",
      fiscalYearStart,
    },
    context: {
      sector: String(c.sector ?? "").trim(),
      strategicMoment: String(c.strategicMoment ?? "").trim(),
      keyHires,
      suggestedOkrThemes,
      ceoName: String(c.ceoName ?? "").trim(),
    },
  };
}
