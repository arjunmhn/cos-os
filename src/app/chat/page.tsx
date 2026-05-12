"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUp,
  Bot,
  ChevronDown,
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
import { DEFAULT_KPIS } from "@/lib/content/kpi-defaults";
import type { Decision, Objective } from "@/lib/types";
import type { KpiSnapshot } from "@/lib/cos-persona";
import { MarkdownContent } from "@/components/ui/markdown-view";

type Turn = { role: "user" | "assistant"; body: string };

type QABlock = {
  id: string;
  user: string;
  assistant?: string;
};

const SUGGESTIONS: { label: string; prompt: string }[] = [
  {
    label: "Quarter at risk?",
    prompt:
      "Walk me through what's at risk this quarter. Look across OKRs, pipeline coverage, hiring funnel, and recent decisions. Tell me the top 3 risks and what to do about each.",
  },
  {
    label: "Top 3 priorities for next week",
    prompt:
      "Based on the live OS state, what should be my top 3 priorities for next week as Chief of Staff? Be specific — name the OKR, deal, or hire each priority maps to.",
  },
  {
    label: "Pipeline health",
    prompt:
      "Diagnose pipeline health. Use coverage ratio, segment mix, slipped deals, and ICP composition. What action would most improve the quarter forecast?",
  },
  {
    label: "Hiring funnel velocity",
    prompt:
      "How is hiring velocity trending? Identify the slowest stage in the funnel and propose a fix. Reference candidate names and days-in-stage where relevant.",
  },
  {
    label: "What changed in 30 days",
    prompt:
      "Summarize what materially changed in the last 30 days across decisions, OKR status, deal movement, and KPI trends. What deserves the CEO's attention this week?",
  },
  {
    label: "OKR retrospective",
    prompt:
      "Run a mid-quarter OKR retrospective. For each objective, name what's on track, what's at risk, and the specific action that would change the trajectory.",
  },
  {
    label: "Forecast the quarter",
    prompt:
      "Forecast where we land this quarter on ARR, win rate, and headcount. Anchor on KPI trends and pipeline composition. Use KPI tiles for headlines and a chart for the ARR trajectory + forecast. State the assumptions you're making.",
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
  const [kpis] = useLocalStorage<KpiSnapshot[]>("kpis", DEFAULT_KPIS);

  const [transcript, setTranscript] = useLocalStorage<Turn[]>("chat-transcript", []);
  const [usedCount, setUsedCount] = useLocalStorage<number>("chat-used-count", 0);

  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const prevBlockCount = useRef(0);

  const remaining = Math.max(0, SESSION_LIMIT - usedCount);
  const limitReached = remaining <= 0;

  const blocks = useMemo<QABlock[]>(() => {
    const out: QABlock[] = [];
    for (let i = 0; i < transcript.length; i++) {
      if (transcript[i].role === "user") {
        const user = transcript[i].body;
        const next = transcript[i + 1];
        const assistant = next?.role === "assistant" ? next.body : undefined;
        out.push({ id: `b${i}`, user, assistant });
        if (assistant) i++;
      }
    }
    return out;
  }, [transcript]);

  const ordered = useMemo(() => [...blocks].reverse(), [blocks]);

  // Auto-expand the newest question whenever a new one is added.
  // (Doesn't fight the user once they've explicitly toggled it.)
  useEffect(() => {
    if (blocks.length > prevBlockCount.current && blocks.length > 0) {
      const newestId = blocks[blocks.length - 1].id;
      setExpanded((prev) => {
        if (prev.has(newestId)) return prev;
        const next = new Set(prev);
        next.add(newestId);
        return next;
      });
    }
    prevBlockCount.current = blocks.length;
  }, [blocks]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
          osState: { profile, okrs, decisions, roles, candidates, deals, kpis },
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
    setExpanded(new Set());
    setError(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ask the OS"
        title="Query your company. Backward, current, and forward."
        description="Natural-language analyst over your live OS state. Ask about a metric, a deal, a hire, or what to do this week — answers come grounded in your data with a recommendation, not just a recap."
        actions={
          <Badge tone={limitReached ? "rose" : remaining <= 2 ? "amber" : "indigo"} dot>
            {remaining}/{SESSION_LIMIT} remaining
          </Badge>
        }
      />

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5">
        <div className="space-y-5 min-w-0">
          {/* COMPOSER */}
          <Card className="p-0 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b divider flex items-center justify-between gap-3 bg-zinc-50/40">
              <div className="min-w-0">
                <CardEyebrow>Question</CardEyebrow>
                <h3 className="mt-0.5 text-[14px] font-semibold tracking-tight text-zinc-900 truncate">
                  What do you want to know?
                </h3>
              </div>
              <Badge tone="neutral" className="shrink-0">
                <Cpu className="h-3 w-3" /> sonnet-4-6
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
                      : "e.g. Where am I most behind on OKRs? What deals are at risk this quarter? What changed in the last 30 days?"
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
                      <span>{pending ? "Thinking" : "Ask"}</span>
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
                    onClick={() => setPrompt(s.prompt)}
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

          {/* TRANSCRIPT */}
          <Card className="p-0 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b divider flex items-center justify-between gap-3 bg-zinc-50/40">
              <CardEyebrow>Conversation</CardEyebrow>
              <div className="flex items-center gap-1.5">
                <Badge tone="neutral" className="shrink-0">
                  {blocks.length === 0
                    ? "No questions yet"
                    : `${blocks.length} question${blocks.length === 1 ? "" : "s"}`}
                </Badge>
                {blocks.length > 1 && (
                  <span className="text-[10px] text-zinc-400 hidden sm:inline">
                    newest first
                  </span>
                )}
              </div>
            </div>

            {blocks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Sparkles className="h-5 w-5 text-zinc-300 mx-auto" />
                <div className="mt-3 text-[14px] font-semibold text-zinc-700">No conversation yet</div>
                <div className="mt-1 text-[12px] text-zinc-500 max-w-md mx-auto">
                  Ask anything about your company. Answers come grounded in your live state with a forward-looking
                  recommendation — not just a recap.
                </div>
                <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap text-[10.5px] text-zinc-400">
                  <span className="font-mono">Visible to chat:</span>
                  <Badge tone="neutral">{okrs.length} objectives</Badge>
                  <Badge tone="neutral">{okrs.reduce((s, o) => s + o.keyResults.length, 0)} KRs</Badge>
                  <Badge tone="neutral">{decisions.length} decisions</Badge>
                  <Badge tone="neutral">{roles.length} roles</Badge>
                  <Badge tone="neutral">{candidates.length} candidates</Badge>
                  <Badge tone="neutral">{deals.length} deals</Badge>
                  <Badge tone="neutral">{kpis.length} KPI series</Badge>
                </div>
              </div>
            ) : (
              <div className="divide-y divider">
                {ordered.map((b, i) => {
                  const isNewest = i === 0;
                  const isOpen = expanded.has(b.id);
                  const isPending = isNewest && pending && !b.assistant;
                  return (
                    <QACard
                      key={b.id}
                      block={b}
                      isNewest={isNewest}
                      isOpen={isOpen}
                      isPending={isPending}
                      indexFromNewest={i}
                      onToggle={() => toggle(b.id)}
                    />
                  );
                })}
              </div>
            )}

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
                  <div className="text-[13px] font-semibold text-zinc-900">Two halves to every answer</div>
                  <div className="text-[11.5px] text-zinc-500 leading-relaxed break-words">
                    Observation grounded in your data, then a forward-looking recommendation.
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Code2 className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-900">Reads your live state</div>
                  <div className="text-[11.5px] text-zinc-500 leading-relaxed break-words">
                    Profile, OKRs, decisions, roles, candidates, deals, and 12 months of KPI trends.
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-fuchsia-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-900">CEO-readable output</div>
                  <div className="text-[11.5px] text-zinc-500 leading-relaxed break-words">
                    Renders KPI tiles, charts, and tables when the data benefits from visualization.
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

function QACard({
  block,
  isNewest,
  isOpen,
  isPending,
  indexFromNewest,
  onToggle,
}: {
  block: QABlock;
  isNewest: boolean;
  isOpen: boolean;
  isPending: boolean;
  indexFromNewest: number;
  onToggle: () => void;
}) {
  return (
    <div className={cn("px-4 sm:px-6 py-5", isNewest ? "bg-white" : "bg-zinc-50/30")}>
      <div className="flex items-start gap-3">
        <div className="h-7 w-7 rounded-md grid place-items-center shrink-0 bg-zinc-900 text-white">
          <User className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
                {isNewest ? "Latest question" : `Question · ${indexFromNewest} ago`}
              </div>
              {isNewest && (
                <Badge tone="indigo" dot>
                  now
                </Badge>
              )}
            </div>
            <button
              onClick={onToggle}
              className="text-[11px] text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-zinc-100 transition-colors"
              aria-label={isOpen ? "Collapse answer" : "Expand answer"}
              aria-expanded={isOpen}
            >
              {isOpen ? "Collapse" : "Expand"}
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
              />
            </button>
          </div>

          <button
            onClick={() => !isOpen && onToggle()}
            className={cn(
              "block w-full text-left text-[14px] text-zinc-900 font-medium leading-snug break-words",
              !isOpen && "line-clamp-2 cursor-pointer hover:text-zinc-700"
            )}
            disabled={isOpen}
          >
            {block.user}
          </button>

          {isOpen && (
            <div className="mt-4 pt-4 border-t divider">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-6 w-6 rounded-md grid place-items-center bg-gradient-brand text-white shrink-0">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
                  Chief of Staff OS
                </div>
              </div>
              {block.assistant && <MarkdownContent body={block.assistant} density="compact" />}
              {isPending && (
                <div className="flex items-center gap-1.5 text-[13px] text-zinc-500">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:120ms]" />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:240ms]" />
                  <span className="ml-1">Reading your OS state…</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
