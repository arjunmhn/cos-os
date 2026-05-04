"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WIN_LOSS, SEGMENT_LABEL } from "@/lib/content/gtm";
import { CheckCircle2, Swords, XCircle } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useMemo } from "react";

export function IntelLog() {
  const themes = useMemo(() => {
    const counts: Record<string, { theme: string; won: number; lost: number }> = {};
    WIN_LOSS.forEach((w) => {
      if (!counts[w.reasonTheme]) counts[w.reasonTheme] = { theme: w.reasonTheme, won: 0, lost: 0 };
      if (w.outcome === "won") counts[w.reasonTheme].won++;
      else counts[w.reasonTheme].lost++;
    });
    return Object.values(counts).sort((a, b) => b.won + b.lost - (a.won + a.lost));
  }, []);

  const competitors = useMemo(() => {
    const counts: Record<string, number> = {};
    WIN_LOSS.forEach((w) => {
      if (w.competitor) counts[w.competitor] = (counts[w.competitor] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, []);

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <CardEyebrow>Why we win, why we lose</CardEyebrow>
        <h3 className="mt-1 text-base font-semibold text-zinc-900">
          Intel log — synthesized monthly, fed to EPD.
        </h3>
        <p className="mt-2 text-[13px] text-zinc-600 leading-relaxed max-w-3xl">
          Every closed deal — won or lost — gets a one-paragraph entry. Themes aggregate, competitor
          mentions surface, and a monthly synthesis goes to product. The roadmap should know what the
          field is hearing.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <CardEyebrow>Theme frequency</CardEyebrow>
          <ul className="mt-3 space-y-2.5">
            {themes.map((t) => {
              const total = t.won + t.lost;
              const wonPct = (t.won / total) * 100;
              return (
                <li key={t.theme}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-zinc-800">{t.theme}</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-emerald-700 font-semibold">{t.won}W</span>
                      <span className="text-zinc-400">·</span>
                      <span className="text-rose-700 font-semibold">{t.lost}L</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${wonPct}%` }} />
                    <div className="h-full bg-rose-400" style={{ width: `${100 - wonPct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="p-6">
          <CardEyebrow>Competitive mentions</CardEyebrow>
          <ul className="mt-3 space-y-2">
            {competitors.map(([name, count]) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-lg border divider px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Swords className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-[13px] font-medium text-zinc-800">{name}</span>
                </div>
                <Badge tone="neutral">{count} mention{count > 1 ? "s" : ""}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b divider bg-zinc-50/60">
          <CardEyebrow>Recent entries</CardEyebrow>
        </div>
        <ul className="divide-y divider">
          {WIN_LOSS.map((w) => (
            <li key={w.id} className="px-5 py-4 hover:bg-zinc-50/40 transition-colors">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "h-7 w-7 rounded-md grid place-items-center shrink-0",
                    w.outcome === "won" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  )}
                >
                  {w.outcome === "won" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13.5px] font-semibold text-zinc-900">{w.customer}</span>
                    <Badge tone={w.outcome === "won" ? "emerald" : "rose"}>{w.outcome.toUpperCase()}</Badge>
                    <Badge tone="neutral">{SEGMENT_LABEL[w.segment]}</Badge>
                    <Badge tone="indigo">{w.reasonTheme}</Badge>
                    {w.competitor && <Badge tone="amber">vs. {w.competitor}</Badge>}
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-zinc-600 leading-relaxed">{w.detail}</p>
                  <div className="mt-1 text-[11px] text-zinc-400">{formatDate(w.date)}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
