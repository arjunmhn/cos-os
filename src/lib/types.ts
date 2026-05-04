export type CompanyStage =
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "series-c-plus";

export type CompanyProfile = {
  name: string;
  stage: CompanyStage;
  founded: string;
  hq: string;
  teamSize: number;
  ceoName: string;
  cosName: string;
  oneLiner: string;
  northStarMetric: string;
  fiscalYearStart: number;
};

export type OkrStatus = "on-track" | "at-risk" | "off-track" | "completed";

export type KeyResult = {
  id: string;
  title: string;
  metric: string;
  start: number;
  current: number;
  target: number;
  status: OkrStatus;
};

export type Objective = {
  id: string;
  title: string;
  owner: string;
  quarter: string;
  why: string;
  keyResults: KeyResult[];
};

export type Decision = {
  id: string;
  date: string;
  title: string;
  context: string;
  decision: string;
  owner: string;
  reversible: boolean;
};

export type Workstream = {
  id: string;
  title: string;
  module: "cadence" | "board" | "people" | "gtm" | "other";
  owner: string;
  dueDate?: string;
  status: "in-progress" | "blocked" | "done";
  notes?: string;
};

export type CadenceEventType = "weekly" | "monthly" | "quarterly" | "annual";

export type CadenceEvent = {
  id: string;
  type: CadenceEventType;
  title: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  duration: number;
  attendees: string[];
  agenda: string[];
  prepLeadDays: number;
};
