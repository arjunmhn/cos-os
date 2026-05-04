"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUp,
  Bot,
  Code2,
  Cpu,
  Lock,
  Sparkles,
  Trash2,
  User,
  Wrench,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/storage";
import { useCompanyProfile } from "@/components/providers/company-profile-provider";
import { DEFAULT_OKRS, DEFAULT_DECISIONS } from "@/lib/content/cadence";
import { DEFAULT_ROLES, DEFAULT_CANDIDATES, type RoleMoc, type Candidate } from "@/lib/content/people";
import { DEFAULT_DEALS, type Deal } from "@/lib/content/gtm";
import type { Decision, Objective } from "@/lib/types";
import { MarkdownContent } from "@/components/ui/markdown-view";

type Turn = { role: "user" | "assistant"; body: string };

const SUGGESTIONS: { label: string; prompt: string }[] = [
  {
    label: "Draft a VP Eng MOC",
    prompt: "Draft a Mission · Outcomes · Competencies spec for a VP Engineering hire focused on shipping the v2 platform.",
  },
  {
    label: "Quarterly planning agenda",
    prompt: "Generate the agenda for a quarterly planning offsite, anchored on our active OKRs and recent decisions.",
  },
  {
    label: "Retrostudy template",
    prompt: "Build a per-customer retrostudy template Sales can pull into proposals — baseline, lever attribution, dollar impact.",
  },
  {
    label: "April investor update",
    prompt: "Synthesize the last 4 weeks of decisions and active OKRs into a draft monthly investor update.",
  },
  {
    label: "Hiring system audit",
    prompt: "What's missing from our hiring system if we want to scale from our current team to 80 by year-end? Be specific about the gaps.",
  },
];

const SESSION_LIMIT = 8;

export default function ChatPage() {
  const { profile } = useCompanyProfile();
  const [okrs] = useLocalStorage<Objective[]>("okrs", DEFAULT_OKRS as Objective[]);
  const [decisions] = useLocalStorage<Decision[]>("decisions", DEFAULT_DECISIONS as Decision[]);
  const [roles] = useLocalStorage<RoleMoc[]>("roles", DEFAULT_ROLES);
  const [candidates] = useLocalStorage<Candidate[]>("candidates", DEFAULT_CANDIDATES);
  const [deals] = useLocalStorage<Deal[]>("deals", DEFAULT_DEALS);

  const [transcript, setTranscript] = useLocalStorage<Turn[]>("chat-transcript", []);
  const [usedCount, setUsedCount] = useLocalStorage<number>("chat-used-count", 0);

  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptEnd = useRef<HTMLDivElement>(null);

  const remaining = Math.max(0, SESSION_LIMIT - usedCount);
  const limitReached = remaining <= 0;

  useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, pending]);

  const send = async (overridePrompt?: string) => {
    const text = (overridePrompt ?? prompt).trim();
    if (!text || pending || limitReached) return;
    setError(null);
    setPending(true);

    const next: Turn[] = [...transcript, { role: "user", body: text }];
    setTranscript(next);
    setPrompt("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((t) => ({ role: t.role, content: t.body })),
          osState: { profile, okrs, decisions, roles, candidates, deals },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else if (typeof data.content === "string" && data.content.length > 0) {
        setTranscript([...next, { role: "assistant", body: data.content }]);
        setUsedCount(usedCount + 1);
      } else {
        setError("Empty response.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  };

  const clear = () => {
    setTranscript([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Build with AI"
        title="Ask the OS to build you a new system."
        description="Live chat with your OS state in context. Demo capped at 8 messages per browser — clear localStorage to reset."
        actions={
          <Badge tone={limitReached ? "rose" : remaining <= 2 ? "amber" : "indigo"} dot>
            {remaining}/{SESSION_LIMIT} remaining
          </Badge>
        }
      />

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5">
        <div className="space-y-5 min-w-0">
          {/* COMPOSER (now at the top) */}
          <Card className="p-0 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b divider flex items-center justify-between gap-3 bg-zinc-50/40">
              <div className="min-w-0">
                <CardEyebrow>Composer</CardEyebrow>
                <h3 className="mt-0.5 text-[14px] font-semibold tracking-tight text-zinc-900 truncate">
                  What do you want to build?
                </h3>
              </div>
              <Badge tone="neutral" className="shrink-0">
                <Cpu className="h-3 w-3" /> haiku-4-5
              </Badge>
            </div>

            <div className="p-4">
              <div
                className={cn(
                  "rounded-xl border bg-white p-2.5 transition-all",
                  "focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20",
                  limitReached ? "opacity-60" : ""
                )}
              >
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={
                    limitReached
                      ? "Demo limit reached — clear browser storage to reset"
                      : "e.g. Build me a customer health scoring framework that surfaces churn risk 60 days early…"
                  }
                  disabled={limitReached || pending}
                  className="border-0 shadow-none focus:ring-0 focus:border-0 min-h-[80px] p-1.5 resize-y"
                />
                <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
                  <div className="text-[10.5px] text-zinc-400 inline-flex items-center gap-1.5 min-w-0">
                    <span className="kbd shrink-0">⌘</span>
                    <span className="kbd shrink-0">↵</span>
                    <span className="truncate">to send</span>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {transcript.length > 0 && (
                      <button
                        onClick={clear}
                        className="text-[11px] text-zinc-400 hover:text-zinc-700 inline-flex items-center gap-1 px-2 py-1"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    )}
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => send()}
                      disabled={limitReached || pending || !prompt.trim()}
                    >
                      <span>{pending ? "Sending" : "Send"}</span>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* PERSISTENT SUGGESTIONS */}
            <div className="px-4 sm:px-5 py-3 border-t divider bg-zinc-50/40">
              <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-zinc-500 mb-2">
                Try one of these
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(s.prompt);
                    }}
                    disabled={limitReached || pending}
                    className="rounded-full border divider bg-white px-3 py-1 text-[12px] text-zinc-700 hover:border-zinc-400 hover:bg-white hover:text-zinc-900 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 max-w-full"
                  >
                    <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* TRANSCRIPT (below composer) */}
          <Card className="p-0 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b divider flex items-center justify-between gap-3 bg-zinc-50/40">
              <CardEyebrow>Conversation</CardEyebrow>
              <Badge tone="neutral" className="shrink-0">
                {transcript.length === 0
                  ? "No turns yet"
                  : `${transcript.length} turn${transcript.length === 1 ? "" : "s"}`}
              </Badge>
            </div>

            <div className="divide-y divider">
              {transcript.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Sparkles className="h-5 w-5 text-zinc-300 mx-auto" />
                  <div className="mt-3 text-[14px] font-semibold text-zinc-700">No conversation yet</div>
                  <div className="mt-1 text-[12px] text-zinc-500 max-w-sm mx-auto">
                    Send your first message above. The OS reads your live state — profile, OKRs, decisions, roles,
                    deals — into every prompt.
                  </div>
                </div>
              ) : (
                transcript.map((t, i) => (
                  <div
                    key={i}
                    className={cn("px-4 sm:px-6 py-5", t.role === "user" ? "bg-zinc-50/40" : "bg-white")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-7 w-7 rounded-md grid place-items-center shrink-0 text-white",
                          t.role === "user" ? "bg-zinc-900" : "bg-gradient-brand"
                        )}
                      >
                        {t.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500 mb-1.5">
                          {t.role === "user" ? "You" : "Chief of Staff OS"}
                        </div>
                        <MarkdownContent body={t.body} density="compact" />
                      </div>
                    </div>
                  </div>
                ))
              )}
              {pending && (
                <div className="px-4 sm:px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-md grid place-items-center shrink-0 bg-gradient-brand text-white">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[13px] text-zinc-500 inline-flex items-center gap-1.5 min-w-0">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:120ms] shrink-0" />
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:240ms] shrink-0" />
                      <span className="ml-1 truncate">Reading your OS state…</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={transcriptEnd} />
            </div>

            {error && (
              <div className="px-4 sm:px-6 py-3 border-t divider bg-rose-50 text-[12.5px] text-rose-800 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span className="min-w-0 break-words">{error}</span>
              </div>
            )}

            {limitReached && !error && (
              <div className="px-4 sm:px-6 py-3 border-t divider bg-amber-50 text-[12.5px] text-amber-800 flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span className="min-w-0 break-words">
                  Demo limit reached. Clear browser storage to reset, or self-host with your own API key.
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* SIDE PANEL */}
        <div className="space-y-4 min-w-0">
          <Card className="p-5">
            <CardEyebrow>How it works</CardEyebrow>
            <ul className="mt-3 space-y-3">
              <li className="flex items-start gap-2.5">
                <Wrench className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-900">Server-side</div>
                  <div className="text-[11.5px] text-zinc-500 leading-relaxed break-words">
                    Routed through{" "}
                    <code className="font-mono text-[10.5px] bg-zinc-100 rounded px-1 break-all">
                      /api/chat
                    </code>{" "}
                    with the OS persona prompt-cached.
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Code2 className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-900">Reads your state</div>
                  <div className="text-[11.5px] text-zinc-500 leading-relaxed break-words">
                    Profile, OKRs, decisions, roles, candidates, and deals attach to every request.
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-fuchsia-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-900">Rate-limited demo</div>
                  <div className="text-[11.5px] text-zinc-500 leading-relaxed break-words">
                    8 messages per browser, Haiku model, max-tokens capped at 1024.
                  </div>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-5">
            <CardEyebrow>Self-host</CardEyebrow>
            <p className="mt-3 text-[12px] text-zinc-600 leading-relaxed break-words">
              Fork the repo, set{" "}
              <code className="font-mono text-[10.5px] bg-zinc-100 rounded px-1 break-all">
                ANTHROPIC_API_KEY
              </code>{" "}
              locally, and run{" "}
              <code className="font-mono text-[10.5px] bg-zinc-100 rounded px-1 break-all">
                npm run dev
              </code>
              . Outputs persist in your browser&apos;s localStorage — nothing else leaves your machine.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

