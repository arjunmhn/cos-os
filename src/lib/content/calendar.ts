export type EventKind = "weekly" | "monthly" | "quarterly" | "milestone";

export type ScheduledEvent = {
  id: string;
  date: Date;
  title: string;
  kind: EventKind;
  cadenceId: string;
  durationLabel: string;
  owner: string;
};

const KIND_TONE: Record<EventKind, string> = {
  weekly: "indigo",
  monthly: "fuchsia",
  quarterly: "cyan",
  milestone: "amber",
};

export function getEventTone(kind: EventKind) {
  return KIND_TONE[kind];
}

function nextWeekday(from: Date, weekday: number): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3, 1);
}

function endOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3 + 3, 0);
}

export function generateQuarterEvents(reference: Date = new Date()): ScheduledEvent[] {
  const start = startOfQuarter(reference);
  const end = endOfQuarter(reference);
  const events: ScheduledEvent[] = [];

  // Weekly Leadership Review — every Monday in quarter
  let cursor = nextWeekday(start, 1);
  let i = 0;
  while (cursor <= end) {
    events.push({
      id: `wlr-${cursor.toISOString().slice(0, 10)}`,
      date: new Date(cursor),
      title: "Weekly Leadership Review",
      kind: "weekly",
      cadenceId: "weekly-leadership",
      durationLabel: "60 min",
      owner: "CoS",
    });
    cursor.setDate(cursor.getDate() + 7);
    i++;
  }

  // Monthly Business Review — 2nd Tuesday of each month in quarter
  for (let m = start.getMonth(); m <= end.getMonth(); m++) {
    const first = new Date(start.getFullYear(), m, 1);
    const firstTue = nextWeekday(first, 2);
    const second = new Date(firstTue);
    second.setDate(second.getDate() + 7);
    if (second >= start && second <= end) {
      events.push({
        id: `mbr-${second.toISOString().slice(0, 10)}`,
        date: second,
        title: "Monthly Business Review",
        kind: "monthly",
        cadenceId: "monthly-business",
        durationLabel: "90 min",
        owner: "Leadership",
      });
    }
    // Investor update due — 5th of each month
    const investor = new Date(start.getFullYear(), m, 5);
    if (investor >= start && investor <= end) {
      events.push({
        id: `inv-${investor.toISOString().slice(0, 10)}`,
        date: investor,
        title: "Monthly Investor Update due",
        kind: "monthly",
        cadenceId: "monthly-business",
        durationLabel: "Ship by EOD",
        owner: "CoS + CEO",
      });
    }
  }

  // Mid-Quarter Pipeline Inspection — week 6 of quarter (~day 42)
  const midQ = new Date(start);
  midQ.setDate(midQ.getDate() + 41);
  const midQAdjusted = nextWeekday(midQ, 3); // Wednesday
  events.push({
    id: `mqr-${midQAdjusted.toISOString().slice(0, 10)}`,
    date: midQAdjusted,
    title: "Mid-Quarter Pipeline Inspection",
    kind: "milestone",
    cadenceId: "mid-quarter-pipeline",
    durationLabel: "2 hours",
    owner: "CEO + CRO + CoS",
  });

  // Board Prep kickoff — T-14 days from quarter end
  const prepKickoff = new Date(end);
  prepKickoff.setDate(prepKickoff.getDate() - 14);
  events.push({
    id: `bprep-${prepKickoff.toISOString().slice(0, 10)}`,
    date: prepKickoff,
    title: "Board Prep — T-14 kickoff",
    kind: "milestone",
    cadenceId: "board-prep",
    durationLabel: "2-week project",
    owner: "CoS",
  });

  // Pre-read sent — T-5
  const preread = new Date(end);
  preread.setDate(preread.getDate() - 5);
  events.push({
    id: `pre-${preread.toISOString().slice(0, 10)}`,
    date: preread,
    title: "Board pre-read sent",
    kind: "milestone",
    cadenceId: "board-prep",
    durationLabel: "Send by 9am",
    owner: "CoS",
  });

  // Board Meeting — quarter end (or last business day)
  const boardDay = new Date(end);
  if (boardDay.getDay() === 0) boardDay.setDate(boardDay.getDate() - 2);
  if (boardDay.getDay() === 6) boardDay.setDate(boardDay.getDate() - 1);
  events.push({
    id: `board-${boardDay.toISOString().slice(0, 10)}`,
    date: boardDay,
    title: "Board Meeting",
    kind: "quarterly",
    cadenceId: "board-prep",
    durationLabel: "3 hours",
    owner: "CEO",
  });

  // Quarterly Planning — 1st week of next quarter, but within view if at quarter end
  const qPlan = new Date(end);
  qPlan.setDate(qPlan.getDate() + 5);
  if (qPlan <= end) {
    events.push({
      id: `qplan-${qPlan.toISOString().slice(0, 10)}`,
      date: qPlan,
      title: "Quarterly Planning offsite",
      kind: "quarterly",
      cadenceId: "quarterly-planning",
      durationLabel: "Full day",
      owner: "Leadership",
    });
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getQuarterMeta(reference: Date = new Date()) {
  const start = startOfQuarter(reference);
  const end = endOfQuarter(reference);
  const total = end.getTime() - start.getTime();
  const elapsed = reference.getTime() - start.getTime();
  return {
    start,
    end,
    quarter: Math.floor(reference.getMonth() / 3) + 1,
    year: reference.getFullYear(),
    pct: Math.max(0, Math.min(100, Math.round((elapsed / total) * 100))),
    weeksTotal: 13,
  };
}

export function weeksOfQuarter(reference: Date = new Date()): Date[] {
  const start = startOfQuarter(reference);
  const monday = nextWeekday(start, 1);
  // Back up to the Monday on or before the quarter start
  if (monday > start) monday.setDate(monday.getDate() - 7);
  const weeks: Date[] = [];
  for (let i = 0; i < 13; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i * 7);
    weeks.push(d);
  }
  return weeks;
}

export function isSameWeek(a: Date, b: Date): boolean {
  const aMon = nextWeekday(new Date(a.getFullYear(), a.getMonth(), a.getDate() - 6), 1);
  const bMon = nextWeekday(new Date(b.getFullYear(), b.getMonth(), b.getDate() - 6), 1);
  return aMon.toDateString() === bMon.toDateString();
}
