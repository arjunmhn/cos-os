import Anthropic from "@anthropic-ai/sdk";
import { COS_PERSONA, formatOsState } from "@/lib/cos-persona";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

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

  const { messages, osState } = body as {
    messages?: Anthropic.MessageParam[];
    osState?: Parameters<typeof formatOsState>[0];
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array required." }, { status: 400 });
  }
  if (messages.length > 32) {
    return Response.json({ error: "Conversation too long for the demo." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stateBlock = osState ? formatOsState(osState) : "";

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: COS_PERSONA,
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
      messages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return Response.json({
      content: text,
      stop_reason: response.stop_reason,
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
        { error: "Server-side API key is invalid. Replace ANTHROPIC_API_KEY on Vercel.", code: "auth" },
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
