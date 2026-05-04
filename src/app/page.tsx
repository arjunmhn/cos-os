"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompanyProfile } from "@/components/providers/company-profile-provider";
import { PRINCIPLES } from "@/lib/content/principles";
import { CADENCE_TEMPLATES, DEFAULT_DECISIONS, DEFAULT_OKRS } from "@/lib/content/cadence";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Flame,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { relativeDate } from "@/lib/utils";
import { useMemo } from "react";

export default function CommandCenter() {
  const { profile, hydrated } = useCompanyProfile();

  const today = useMemo(() => new Date(), []);
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const quarterProgress = useMemo(() => {
    const month = today.getMonth();
    const dayOfMonth = today.getDate();
    const quarter = Math.floor(month / 3);
    const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
    const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0);
    const total = quarterEnd.getTime() - quarterStart.getTime();
    const elapsed = today.getTime() - quarterStart.getTime();
    return {
      pct: Math.round((elapsed / total) * 100),
      label: `Q${quarter + 1} ${today.getFullYear()}`,
      daysLeft: Math.max(0, Math.ceil((quarterEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
    };
  }, [today]);

  const principleOfDay = PRINCIPLES[today.getDate() % PRINCIPLES.length];
  const upcomingCadence = CADENCE_TEMPLATES.slice(0, 3);
  const openDecisions = DEFAULT_DECISIONS.slice(0, 2);

  const okrHealth = useMemo(() => {
    const all = DEFAULT_OKRS.flatMap((o) => o.keyResults);
    const onTrack = all.filter((kr) => kr.status === "on-track").length;
    const atRisk = all.filter((kr) => kr.status === "at-risk").length;
    return { onTrack, atRisk, total: all.length };
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border divider bg-white">
        <div className="absolute inset-0 opacity-[0.07] bg-gradient-brand" />
        <div className="relative px-7 py-7 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-zinc-500">
                {dayName} · {dateStr}
              </div>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900">
                Good morning, {hydrated ? profile.cosName : "—"}.
              </h1>
              <p className="mt-1 text-sm text-zinc-500 max-w-xl">
                {hydrated ? profile.name : "—"} is{" "}
                <span className="font-semibold text-zinc-700">
                  {quarterProgress.pct}% through {quarterProgress.label}
                </span>{" "}
                — {quarterProgress.daysLeft} days remaining. Here is what wants your attention today.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge tone="indigo" dot>
                Quarter cadence: {quarterProgress.pct < 50 ? "build" : quarterProgress.pct < 85 ? "inspect" : "land"}
              </Badge>
              <div className="text-[11px] text-zinc-400">
                Next mid-quarter inspection in {Math.max(0, 45 - quarterProgress.pct) + 1} days
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 flex items-start gap-3">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-white border border-amber-200 text-amber-600 shrink-0">
              <Flame className="h-3.5 w-3.5" />
            </div>
            <div className="text-[13px] leading-relaxed">
              <span className="font-semibold text-amber-900">This week's #1 risk:</span>{" "}
              <span className="text-amber-900/90">
                Mid-market pipeline coverage sits at 2.4× — below the 3× bar. Without 6 net-new oppties this week, Q
                lands soft.
              </span>{" "}
              <Link href="/gtm" className="text-amber-700 underline underline-offset-2 hover:text-amber-900">
                See pipeline →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Pipeline coverage"
          value="2.4×"
          delta="−0.4× WoW"
          trend="down"
          tone="amber"
          target="≥ 3×"
        />
        <KpiCard
          label="OKR health (KRs)"
          value={`${okrHealth.onTrack}/${okrHealth.total}`}
          delta={`${okrHealth.atRisk} at risk`}
          trend="flat"
          tone={okrHealth.atRisk > 2 ? "amber" : "emerald"}
          target="On track"
        />
        <KpiCard
          label="Hiring funnel velocity"
          value="11 days"
          delta="+3 days WoW"
          trend="down"
          tone="amber"
          target="≤ 5 days to decision"
        />
        <KpiCard label="Runway" value="22 mo." delta="net new burn flat" trend="flat" tone="emerald" target="≥ 18 mo." />
      </section>

      {/* Two-column: This week + Decisions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardEyebrow>This week</CardEyebrow>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
                Cadence on deck
              </h3>
            </div>
            <Link
              href="/cadence"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
            >
              All cadences <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divider -mx-2">
            {upcomingCadence.map((c, i) => (
              <li
                key={c.id}
                className="flex items-start gap-3 px-2 py-3 hover:bg-zinc-50 rounded-lg transition-colors"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-700 shrink-0">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900">{c.title}</span>
                    <Badge tone="neutral">{c.cadence}</Badge>
                  </div>
                  <div className="text-[12px] text-zinc-500 mt-0.5 line-clamp-1">{c.purpose}</div>
                  <div className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-3">
                    <span>{c.duration}</span>
                    <span>·</span>
                    <span>Prep: {c.prepLeadTime.split(";")[0]}</span>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 shrink-0 mt-2">
                  {i === 0 ? "Today" : i === 1 ? "Wed" : "Fri"}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardEyebrow>Awaiting CEO</CardEyebrow>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
                Open decisions
              </h3>
            </div>
            <Link
              href="/cadence#decisions"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
            >
              Log <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-3">
            {openDecisions.map((d) => (
              <li key={d.id} className="rounded-lg border divider p-3 hover:border-zinc-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[13px] font-semibold text-zinc-900 leading-snug">{d.title}</div>
                  <Badge tone={d.reversible ? "cyan" : "rose"}>
                    {d.reversible ? "Reversible" : "One-way"}
                  </Badge>
                </div>
                <div className="text-[11px] text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">{d.context}</div>
                <div className="text-[10.5px] text-zinc-400 mt-2 flex items-center gap-2">
                  <span>{d.owner}</span>
                  <span>·</span>
                  <span>{relativeDate(d.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Active workstreams + Principle */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardEyebrow>In motion</CardEyebrow>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
                Active workstreams
              </h3>
            </div>
          </div>
          <ul className="space-y-2.5">
            {WORKSTREAMS.map((w) => (
              <li
                key={w.id}
                className="flex items-center gap-3 rounded-lg border divider px-3.5 py-3 hover:border-zinc-300 transition-colors"
              >
                <div
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    w.status === "blocked" ? "bg-rose-500" : w.status === "done" ? "bg-emerald-500" : "bg-indigo-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-900 truncate">{w.title}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {w.module} · owner {w.owner}
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 shrink-0">{w.due}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-gradient-to-br from-white to-indigo-50/40 border-indigo-100/70">
          <CardEyebrow className="text-indigo-600">Principle for today</CardEyebrow>
          <Sparkles className="h-5 w-5 text-indigo-500 mt-3 mb-2" />
          <h3 className="text-base font-semibold tracking-tight text-zinc-900 leading-snug">
            {principleOfDay.title}
          </h3>
          <p className="mt-3 text-[13px] text-zinc-600 leading-relaxed">{principleOfDay.body}</p>
          <div className="mt-4 pt-3 border-t border-indigo-100 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>{principleOfDay.source}</span>
            <Link href="/library" className="text-indigo-700 hover:underline inline-flex items-center gap-1">
              All principles <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  trend,
  tone,
  target,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  tone: "emerald" | "amber" | "rose" | "indigo";
  target: string;
}) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : CheckCircle2;
  const toneColors = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    indigo: "text-indigo-600",
  } as const;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-zinc-500">{label}</div>
        {trend === "down" && tone === "amber" && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-[28px] font-semibold tracking-tight text-zinc-900 leading-none">{value}</div>
        <div className={`text-[11px] font-medium inline-flex items-center gap-0.5 ${toneColors[tone]}`}>
          <Icon className="h-3 w-3" />
          {delta}
        </div>
      </div>
      <div className="mt-3 text-[11px] text-zinc-400">Target: {target}</div>
    </Card>
  );
}

type WorkstreamRow = {
  id: string;
  title: string;
  module: string;
  owner: string;
  status: "in-progress" | "blocked" | "done";
  due: string;
};

const WORKSTREAMS: WorkstreamRow[] = [
  {
    id: "w1",
    title: "Q+1 board pack — outline lock",
    module: "Board & IR",
    owner: "CoS",
    status: "in-progress",
    due: "Friday",
  },
  {
    id: "w2",
    title: "VP Eng MOC + scorecard",
    module: "People & Hiring",
    owner: "CoS + CTO",
    status: "in-progress",
    due: "Wed",
  },
  {
    id: "w3",
    title: "Mid-market ICP retrostudy template",
    module: "GTM & Sales Ops",
    owner: "CoS + CRO",
    status: "blocked",
    due: "Slipped",
  },
  {
    id: "w4",
    title: "April investor update",
    module: "Board & IR",
    owner: "CoS",
    status: "in-progress",
    due: "May 5",
  },
  {
    id: "w5",
    title: "Decision log adoption — train function leads",
    module: "Cadence & OKRs",
    owner: "CoS",
    status: "in-progress",
    due: "Ongoing",
  },
];
