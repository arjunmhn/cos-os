"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CADENCE_TEMPLATES, DEFAULT_DECISIONS, DEFAULT_OKRS } from "@/lib/content/cadence";
import { useLocalStorage } from "@/lib/storage";
import type { Decision, Objective } from "@/lib/types";
import { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Plus,
  ScrollText,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { CalendarView } from "@/components/cadence/calendar-view";

type Tab = "calendar" | "cadence" | "okrs" | "decisions";

export default function CadencePage() {
  const [tab, setTab] = useState<Tab>("calendar");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cadence & OKRs"
        title="The rhythms that make the CEO never have to ask."
        description="Quarter calendar, meeting kits, OKRs, decision log."
        actions={
          <Button variant="outline">
            <Calendar className="h-3.5 w-3.5" /> Sync to calendar
          </Button>
        }
      />

      <div className="flex items-center gap-1 border-b divider overflow-x-auto scroll-dim">
        {(
          [
            { id: "calendar", label: "Calendar", icon: CalendarDays, count: 13 },
            { id: "cadence", label: "Meeting kits", icon: Calendar, count: CADENCE_TEMPLATES.length },
            { id: "okrs", label: "OKRs", icon: Target, count: DEFAULT_OKRS.length },
            { id: "decisions", label: "Decision log", icon: ScrollText, count: DEFAULT_DECISIONS.length },
          ] as { id: Tab; label: string; icon: typeof Calendar; count: number }[]
        ).map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                active
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[10px] font-semibold",
                  active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
                )}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "calendar" && <CalendarView />}
      {tab === "cadence" && <CadenceTab />}
      {tab === "okrs" && <OkrsTab />}
      {tab === "decisions" && <DecisionsTab />}
    </div>
  );
}

function CadenceTab() {
  const [openId, setOpenId] = useState<string>(CADENCE_TEMPLATES[0].id);
  return (
    <div className="space-y-3" id="cadence">
      {CADENCE_TEMPLATES.map((c) => {
        const open = openId === c.id;
        return (
          <Card key={c.id} className={cn("p-0 overflow-hidden", open && "shadow-elevated")}>
            <button
              onClick={() => setOpenId(open ? "" : c.id)}
              className="w-full text-left flex items-center gap-4 px-6 py-5 hover:bg-zinc-50/60 transition-colors"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700 shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">
                    {c.title}
                  </h3>
                  <Badge tone="neutral">{c.cadence}</Badge>
                  <Badge tone="cyan">{c.duration}</Badge>
                </div>
                <p className="mt-1 text-[13px] text-zinc-500 leading-relaxed line-clamp-1">{c.purpose}</p>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-zinc-400 transition-transform shrink-0",
                  open && "rotate-180"
                )}
              />
            </button>
            {open && (
              <div className="px-6 pb-6 pt-0 space-y-5 border-t divider">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  <Meta label="Attendees" value={c.attendees} />
                  <Meta label="Prep lead time" value={c.prepLeadTime} />
                </div>
                <p className="text-[13.5px] text-zinc-700 leading-relaxed">{c.purpose}</p>

                <div>
                  <SectionHeader>Agenda</SectionHeader>
                  <ol className="space-y-1.5 mt-2">
                    {c.agenda.map((a, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-lg border divider px-3.5 py-2.5"
                      >
                        <div className="text-[11px] font-mono text-zinc-400 mt-0.5 w-4 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-zinc-800">{a.item}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">Owner: {a.owner}</div>
                        </div>
                        {a.minutes > 0 && (
                          <Badge tone="neutral">{a.minutes} min</Badge>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <SectionHeader>Artifacts that survive the meeting</SectionHeader>
                    <ul className="mt-2 space-y-1.5">
                      {c.artifacts.map((a, i) => (
                        <li key={i} className="text-[12.5px] text-zinc-700 flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <SectionHeader>Pitfalls to design out</SectionHeader>
                    <ul className="mt-2 space-y-1.5">
                      {c.pitfalls.map((p, i) => (
                        <li key={i} className="text-[12.5px] text-rose-700 flex items-start gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500 mt-0.5 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function OkrsTab() {
  const [okrs, setOkrs] = useLocalStorage<Objective[]>("okrs", DEFAULT_OKRS as Objective[]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[12.5px] text-zinc-500">
          OKRs are weekly. Status changes require a one-sentence why. Killed OKRs go to the decision log, not the bin.
        </div>
        <Button variant="outline">
          <Plus className="h-3.5 w-3.5" /> New objective
        </Button>
      </div>
      {okrs.map((o) => (
        <Card key={o.id} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone="indigo">{o.quarter}</Badge>
                <Badge tone="neutral">Owner · {o.owner}</Badge>
              </div>
              <h3 className="mt-3 text-[17px] font-semibold tracking-tight text-zinc-900 leading-tight">
                {o.title}
              </h3>
              <p className="mt-2 text-[13px] text-zinc-600 leading-relaxed">
                <span className="font-semibold text-zinc-700">Why this, why now:</span> {o.why}
              </p>
            </div>
            <button
              onClick={() => setOkrs(okrs.filter((x) => x.id !== o.id))}
              className="text-zinc-300 hover:text-rose-500 transition-colors"
              aria-label="Delete objective"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {o.keyResults.map((kr) => {
              const denom = kr.target - kr.start || 1;
              const num = kr.current - kr.start;
              const pct = Math.max(0, Math.min(100, Math.round((num / denom) * 100)));
              const tone =
                kr.status === "on-track"
                  ? "emerald"
                  : kr.status === "at-risk"
                    ? "amber"
                    : kr.status === "off-track"
                      ? "rose"
                      : "neutral";
              return (
                <div key={kr.id} className="rounded-xl border divider p-4">
                  <div className="flex items-center justify-between">
                    <Badge tone={tone} dot>
                      {kr.status.replace("-", " ")}
                    </Badge>
                    <span className="text-[11px] text-zinc-400">{pct}%</span>
                  </div>
                  <div className="mt-3 text-[13px] font-medium text-zinc-900 leading-snug">
                    {kr.title}
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        tone === "emerald" && "bg-emerald-500",
                        tone === "amber" && "bg-amber-500",
                        tone === "rose" && "bg-rose-500",
                        tone === "neutral" && "bg-zinc-400"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>
                      {kr.current} / {kr.target} {kr.metric}
                    </span>
                    <span className="text-zinc-400">from {kr.start}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      <button
        onClick={() => setOkrs(DEFAULT_OKRS as Objective[])}
        className="text-[11px] text-zinc-400 hover:text-zinc-700 inline-flex items-center gap-1"
      >
        <Sparkles className="h-3 w-3" /> Reset to sample OKRs
      </button>
    </div>
  );
}

function DecisionsTab() {
  const [decisions, setDecisions] = useLocalStorage<Decision[]>(
    "decisions",
    DEFAULT_DECISIONS as Decision[]
  );

  return (
    <div className="space-y-4" id="decisions">
      <div className="flex items-center justify-between">
        <div className="text-[12.5px] text-zinc-500">
          Decisions get logged with the why, the alternatives considered, and the reversibility flag. Reversible decisions
          are cheap to make wrong; one-way doors deserve a beat.
        </div>
        <Button variant="outline">
          <Plus className="h-3.5 w-3.5" /> Log decision
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <ul className="divide-y divider">
          {decisions.map((d) => (
            <li key={d.id} className="px-6 py-5 hover:bg-zinc-50/60 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CircleDot className="h-3.5 w-3.5 text-zinc-400" />
                    <h3 className="text-[14.5px] font-semibold tracking-tight text-zinc-900">
                      {d.title}
                    </h3>
                    <Badge tone={d.reversible ? "cyan" : "rose"}>
                      {d.reversible ? "Reversible" : "One-way door"}
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-zinc-500">
                        Context
                      </div>
                      <div className="mt-1 text-[13px] text-zinc-700 leading-relaxed">{d.context}</div>
                    </div>
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-zinc-500">
                        Decision
                      </div>
                      <div className="mt-1 text-[13px] text-zinc-700 leading-relaxed">{d.decision}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-zinc-500 flex items-center gap-3">
                    <span>Owner · {d.owner}</span>
                    <span>·</span>
                    <span>{formatDate(d.date)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setDecisions(decisions.filter((x) => x.id !== d.id))}
                  className="text-zinc-300 hover:text-rose-500 transition-colors shrink-0"
                  aria-label="Delete decision"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <button
        onClick={() => setDecisions(DEFAULT_DECISIONS as Decision[])}
        className="text-[11px] text-zinc-400 hover:text-zinc-700 inline-flex items-center gap-1"
      >
        <Sparkles className="h-3 w-3" /> Reset to sample decisions
      </button>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-muted px-3.5 py-2.5">
      <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-[13px] text-zinc-800">{value}</div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500 flex items-center gap-1.5">
      <ChevronRight className="h-3 w-3" />
      {children}
    </div>
  );
}
