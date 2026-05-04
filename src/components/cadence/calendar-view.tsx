"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  generateQuarterEvents,
  getQuarterMeta,
  weeksOfQuarter,
  type ScheduledEvent,
} from "@/lib/content/calendar";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useMemo, useState } from "react";

type Mode = "swimlane" | "month";

const SWIMLANES: { id: string; label: string; tone: string }[] = [
  { id: "weekly-leadership", label: "Weekly Leadership Review", tone: "bg-indigo-500" },
  { id: "monthly-business", label: "Monthly Business Review + Investor Update", tone: "bg-fuchsia-500" },
  { id: "mid-quarter-pipeline", label: "Mid-Quarter Inspection", tone: "bg-amber-500" },
  { id: "board-prep", label: "Board Prep + Meeting", tone: "bg-cyan-500" },
  { id: "quarterly-planning", label: "Quarterly Planning", tone: "bg-emerald-500" },
];

export function CalendarView() {
  const today = useMemo(() => new Date(), []);
  const [referenceDate, setReferenceDate] = useState<Date>(today);
  const [mode, setMode] = useState<Mode>("swimlane");

  const meta = useMemo(() => getQuarterMeta(referenceDate), [referenceDate]);
  const events = useMemo(() => generateQuarterEvents(referenceDate), [referenceDate]);
  const weeks = useMemo(() => weeksOfQuarter(referenceDate), [referenceDate]);

  const todayWeekIndex = useMemo(() => {
    if (today < weeks[0] || today > new Date(weeks[12].getTime() + 7 * 86400000)) return -1;
    return weeks.findIndex((w, i) => {
      const next = i < 12 ? weeks[i + 1] : new Date(w.getTime() + 7 * 86400000);
      return today >= w && today < next;
    });
  }, [today, weeks]);

  const prevQuarter = () => {
    const d = new Date(referenceDate);
    d.setMonth(d.getMonth() - 3);
    setReferenceDate(d);
  };
  const nextQuarter = () => {
    const d = new Date(referenceDate);
    d.setMonth(d.getMonth() + 3);
    setReferenceDate(d);
  };

  return (
    <div className="space-y-5">
      {/* Header strip */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardEyebrow>The 13-week shape of</CardEyebrow>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
              Q{meta.quarter} {meta.year}
            </h3>
            <div className="mt-1 text-[12px] text-zinc-500">
              {meta.start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} →{" "}
              {meta.end.toLocaleDateString("en-US", { month: "long", day: "numeric" })} · {meta.pct}%
              elapsed
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-lg border divider bg-white p-0.5">
              <button
                onClick={() => setMode("swimlane")}
                className={cn(
                  "px-3 h-7 text-xs font-medium rounded-md transition-colors",
                  mode === "swimlane" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                Swim lanes
              </button>
              <button
                onClick={() => setMode("month")}
                className={cn(
                  "px-3 h-7 text-xs font-medium rounded-md transition-colors",
                  mode === "month" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                Month grid
              </button>
            </div>
            <div className="inline-flex items-center gap-1">
              <button
                onClick={prevQuarter}
                className="h-8 w-8 grid place-items-center rounded-md border divider hover:bg-zinc-50"
                aria-label="Previous quarter"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-zinc-600" />
              </button>
              <button
                onClick={() => setReferenceDate(today)}
                className="px-3 h-8 text-xs font-medium rounded-md border divider hover:bg-zinc-50 inline-flex items-center gap-1"
              >
                <CalendarDays className="h-3 w-3" /> Today
              </button>
              <button
                onClick={nextQuarter}
                className="h-8 w-8 grid place-items-center rounded-md border divider hover:bg-zinc-50"
                aria-label="Next quarter"
              >
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Quarter progress bar */}
        <div className="mt-4 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-brand rounded-full"
            style={{ width: `${meta.pct}%` }}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          {SWIMLANES.map((l) => (
            <div key={l.id} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", l.tone)} />
              <span className="text-[11px] text-zinc-600">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-[11px] text-zinc-600">Key milestone</span>
          </div>
        </div>
      </Card>

      {mode === "swimlane" ? (
        <SwimlaneView events={events} weeks={weeks} todayWeekIndex={todayWeekIndex} />
      ) : (
        <MonthGridView events={events} reference={referenceDate} today={today} />
      )}

      {/* Upcoming list */}
      <Card>
        <CardEyebrow>Next 5 events</CardEyebrow>
        <ul className="mt-3 divide-y divider -mx-2">
          {events
            .filter((e) => e.date >= today)
            .slice(0, 5)
            .map((e) => {
              const days = Math.ceil((e.date.getTime() - today.getTime()) / 86400000);
              return (
                <li key={e.id} className="flex items-center gap-3 px-2 py-2.5">
                  <div className="grid h-8 w-12 place-items-center rounded-md bg-zinc-50 border divider shrink-0">
                    <div className="text-[10px] uppercase text-zinc-500 leading-none">
                      {e.date.toLocaleDateString("en-US", { month: "short" })}
                    </div>
                    <div className="text-[13px] font-semibold text-zinc-900 leading-none mt-0.5">
                      {e.date.getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-zinc-900 truncate">
                        {e.title}
                      </span>
                      {e.kind === "milestone" && (
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {e.durationLabel} · {e.owner}
                    </div>
                  </div>
                  <Badge tone="neutral">
                    {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `in ${days} days`}
                  </Badge>
                </li>
              );
            })}
          {events.filter((e) => e.date >= today).length === 0 && (
            <li className="px-2 py-6 text-center text-[12px] text-zinc-400">
              No upcoming events in this quarter.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}

function SwimlaneView({
  events,
  weeks,
  todayWeekIndex,
}: {
  events: ScheduledEvent[];
  weeks: Date[];
  todayWeekIndex: number;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto scroll-dim">
        <div className="min-w-[1000px]">
          {/* Header row: week numbers */}
          <div className="grid grid-cols-[200px_repeat(13,1fr)] border-b divider bg-zinc-50/60">
            <div className="px-4 py-3 text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
              Cadence
            </div>
            {weeks.map((w, i) => (
              <div
                key={i}
                className={cn(
                  "px-1.5 py-3 text-center text-[10px] border-l divider",
                  i === todayWeekIndex && "bg-indigo-50/80"
                )}
              >
                <div className="font-semibold text-zinc-700">W{i + 1}</div>
                <div className="text-zinc-400 mt-0.5">
                  {w.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                </div>
              </div>
            ))}
          </div>

          {/* Swim lanes */}
          {SWIMLANES.map((lane) => (
            <div
              key={lane.id}
              className="grid grid-cols-[200px_repeat(13,1fr)] border-b divider last:border-b-0 min-h-[58px]"
            >
              <div className="px-4 py-3 flex items-center gap-2 border-r divider">
                <span className={cn("h-2 w-2 rounded-full shrink-0", lane.tone)} />
                <span className="text-[12px] font-medium text-zinc-700 leading-tight">
                  {lane.label}
                </span>
              </div>
              {weeks.map((wStart, wi) => {
                const wEnd = new Date(wStart);
                wEnd.setDate(wEnd.getDate() + 7);
                const cellEvents = events.filter(
                  (e) => e.cadenceId === lane.id && e.date >= wStart && e.date < wEnd
                );
                return (
                  <div
                    key={wi}
                    className={cn(
                      "border-l divider p-1 flex items-center justify-center gap-1 flex-wrap relative",
                      wi === todayWeekIndex && "bg-indigo-50/40"
                    )}
                  >
                    {cellEvents.map((ev) => (
                      <EventDot key={ev.id} event={ev} laneTone={lane.tone} />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function EventDot({ event, laneTone }: { event: ScheduledEvent; laneTone: string }) {
  if (event.kind === "milestone") {
    return (
      <div
        className="group relative inline-flex items-center justify-center"
        title={`${event.title} · ${event.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
      >
        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
        <div className="absolute z-10 hidden group-hover:block bottom-full mb-1 whitespace-nowrap text-[11px] bg-zinc-900 text-white px-2 py-1 rounded shadow-elevated">
          {event.title}
        </div>
      </div>
    );
  }
  return (
    <div
      className="group relative inline-flex items-center"
      title={`${event.title} · ${event.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
    >
      <span className={cn("h-2 w-2 rounded-full", laneTone)} />
      <div className="absolute z-10 hidden group-hover:block bottom-full mb-1 whitespace-nowrap text-[11px] bg-zinc-900 text-white px-2 py-1 rounded shadow-elevated">
        {event.title}
      </div>
    </div>
  );
}

function MonthGridView({
  events,
  reference,
  today,
}: {
  events: ScheduledEvent[];
  reference: Date;
  today: Date;
}) {
  const startMonth = Math.floor(reference.getMonth() / 3) * 3;
  const months = [0, 1, 2].map((i) => new Date(reference.getFullYear(), startMonth + i, 1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {months.map((m) => (
        <MonthCard key={m.toISOString()} month={m} events={events} today={today} />
      ))}
    </div>
  );
}

function MonthCard({ month, events, today }: { month: Date; events: ScheduledEvent[]; today: Date }) {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const startDay = firstOfMonth.getDay(); // 0 = Sun
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const monthEvents = events.filter(
    (e) => e.date.getMonth() === month.getMonth() && e.date.getFullYear() === month.getFullYear()
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[14px] font-semibold tracking-tight text-zinc-900">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h4>
        <Badge tone="neutral">{monthEvents.length} events</Badge>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-zinc-400 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const isToday = d.toDateString() === today.toDateString();
          const dayEvents = monthEvents.filter((e) => e.date.toDateString() === d.toDateString());
          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-md border text-[11px] flex flex-col items-center justify-start p-1 relative transition-colors",
                isToday
                  ? "border-indigo-400 bg-indigo-50 text-indigo-900 font-semibold"
                  : dayEvents.length > 0
                    ? "border-zinc-300 bg-white text-zinc-800"
                    : "border-transparent text-zinc-400"
              )}
              title={dayEvents.map((e) => e.title).join(" · ")}
            >
              <span className="leading-none">{d.getDate()}</span>
              {dayEvents.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-0.5 justify-center items-center">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={cn(
                        "h-1 w-1 rounded-full",
                        e.kind === "weekly" && "bg-indigo-500",
                        e.kind === "monthly" && "bg-fuchsia-500",
                        e.kind === "milestone" && "bg-amber-500",
                        e.kind === "quarterly" && "bg-cyan-500"
                      )}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[9px] text-zinc-500">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
