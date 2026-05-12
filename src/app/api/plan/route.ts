import Anthropic from "@anthropic-ai/sdk";
import { PLAN_PERSONA, formatOsState } from "@/lib/cos-persona";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4000;

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

  const { osState, extraContext } = body as {
    osState?: Parameters<typeof formatOsState>[0];
    extraContext?: string;
  };

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stateBlock = osState ? formatOsState(osState) : "";
  const userMessage = [
    "Draft the 30-Day Plan now. Anchor every action in the OS state attached.",
    "",
    extraContext && extraContext.trim().length > 0
      ? `Additional context from the candidate (factor in where relevant):\n\n${extraContext.trim()}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: PLAN_PERSONA,
          cache_control: { type: "ephemeral" },
        },
        ...(stateBlock
          ? [
              {
                type: "text" as const,
                text: stateBlock,
                cache_control: { type: "ephemeral" as const },
              },
            ]
          : []),
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return Response.json({
      content: text,
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
