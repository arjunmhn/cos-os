import { findCol, toBool, toNumber, type CsvRow } from "./csv";
import type { Decision, Objective } from "./types";
import type { Candidate, RoleMoc } from "./content/people";
import type { Deal, DealSegment, DealStage } from "./content/gtm";

export type ImportTarget = "okrs" | "decisions" | "deals" | "candidates" | "roles";

export type ImportPreview = {
  target: ImportTarget;
  storageKey: string;
  storageLabel: string;
  headers: string[];
  rows: CsvRow[];
  mapped: unknown[];
  warnings: string[];
  sampleHeaders: string[];
};

export const TARGET_META: Record<
  ImportTarget,
  { label: string; storageKey: string; sampleHeaders: string[]; description: string }
> = {
  okrs: {
    label: "OKRs",
    storageKey: "okrs",
    sampleHeaders: [
      "objective",
      "owner",
      "quarter",
      "why",
      "kr_title",
      "kr_metric",
      "kr_start",
      "kr_current",
      "kr_target",
      "kr_status",
    ],
    description: "Objectives + key results. One row per key result; objective fields repeat for each KR.",
  },
  decisions: {
    label: "Decisions",
    storageKey: "decisions",
    sampleHeaders: ["title", "context", "decision", "owner", "reversible", "date"],
    description: "Decision log entries. Reversible accepts true/false/yes/no/one-way.",
  },
  deals: {
    label: "Deals",
    storageKey: "deals",
    sampleHeaders: [
      "name",
      "segment",
      "stage",
      "acv",
      "owner",
      "next_action",
      "next_action_date",
      "in_icp",
      "slipped",
    ],
    description: "Sales pipeline. Segment: smb / mid-market / enterprise. Stage: discovery, evaluation, proposal, commit, best-case.",
  },
  candidates: {
    label: "Candidates",
    storageKey: "candidates",
    sampleHeaders: ["name", "role", "stage", "days_in_stage", "source"],
    description: "Hiring pipeline. Stage: sourcing, screen, onsite, offer, hired. Role can be a role title or ID.",
  },
  roles: {
    label: "Roles (MOC)",
    storageKey: "roles",
    sampleHeaders: ["title", "function", "hiring_manager", "status", "mission", "outcomes", "must_haves"],
    description: "MOC role specs. Outcomes / must-haves / nice-to-haves can be pipe-separated for multi-line.",
  },
};

export function buildPreview(
  target: ImportTarget,
  headers: string[],
  rows: CsvRow[],
  existingRoles: RoleMoc[] = []
): ImportPreview {
  const meta = TARGET_META[target];
  const warnings: string[] = [];
  let mapped: unknown[] = [];

  if (target === "okrs") {
    mapped = mapOkrs(headers, rows, warnings);
  } else if (target === "decisions") {
    mapped = mapDecisions(headers, rows, warnings);
  } else if (target === "deals") {
    mapped = mapDeals(headers, rows, warnings);
  } else if (target === "candidates") {
    mapped = mapCandidates(headers, rows, warnings, existingRoles);
  } else if (target === "roles") {
    mapped = mapRoles(headers, rows, warnings);
  }

  return {
    target,
    storageKey: meta.storageKey,
    storageLabel: meta.label,
    headers,
    rows,
    mapped,
    warnings,
    sampleHeaders: meta.sampleHeaders,
  };
}

function mapOkrs(headers: string[], rows: CsvRow[], warnings: string[]): Objective[] {
  const objectiveCol = findCol(headers, ["objective", "objective title", "obj"]);
  const ownerCol = findCol(headers, ["owner"]);
  const quarterCol = findCol(headers, ["quarter", "q"]);
  const whyCol = findCol(headers, ["why"]);
  const krTitleCol = findCol(headers, ["kr_title", "key result", "key_result", "kr"]);
  const krMetricCol = findCol(headers, ["kr_metric", "metric"]);
  const krStartCol = findCol(headers, ["kr_start", "start"]);
  const krCurrentCol = findCol(headers, ["kr_current", "current"]);
  const krTargetCol = findCol(headers, ["kr_target", "target"]);
  const krStatusCol = findCol(headers, ["kr_status", "status"]);

  if (!objectiveCol) warnings.push("No 'objective' column found.");
  if (!krTitleCol) warnings.push("No 'kr_title' column found — every row should be a key result.");

  // Group rows by objective title
  const groups = new Map<string, { obj: Partial<Objective>; krs: CsvRow[] }>();
  rows.forEach((r) => {
    const title = objectiveCol ? r[objectiveCol] : "Untitled";
    if (!title) return;
    if (!groups.has(title)) {
      groups.set(title, {
        obj: {
          id: `o-${slug(title)}`,
          title,
          owner: ownerCol ? r[ownerCol] || "—" : "—",
          quarter: quarterCol ? r[quarterCol] || "Current" : "Current",
          why: whyCol ? r[whyCol] || "" : "",
          keyResults: [],
        },
        krs: [],
      });
    }
    groups.get(title)!.krs.push(r);
  });

  return Array.from(groups.values()).map(({ obj, krs }, oi) => ({
    ...(obj as Objective),
    keyResults: krs.map((r, i) => {
      const status = (krStatusCol ? r[krStatusCol] : "on-track").toLowerCase().replace(" ", "-");
      const validStatus = ["on-track", "at-risk", "off-track", "completed"].includes(status)
        ? (status as "on-track" | "at-risk" | "off-track" | "completed")
        : "on-track";
      return {
        id: `kr-${oi}-${i}`,
        title: krTitleCol ? r[krTitleCol] : `KR ${i + 1}`,
        metric: krMetricCol ? r[krMetricCol] : "",
        start: toNumber(krStartCol ? r[krStartCol] : "0"),
        current: toNumber(krCurrentCol ? r[krCurrentCol] : "0"),
        target: toNumber(krTargetCol ? r[krTargetCol] : "1", 1),
        status: validStatus,
      };
    }),
  }));
}

function mapDecisions(headers: string[], rows: CsvRow[], warnings: string[]): Decision[] {
  const titleCol = findCol(headers, ["title"]);
  const contextCol = findCol(headers, ["context"]);
  const decisionCol = findCol(headers, ["decision"]);
  const ownerCol = findCol(headers, ["owner"]);
  const reversibleCol = findCol(headers, ["reversible"]);
  const dateCol = findCol(headers, ["date"]);

  if (!titleCol) warnings.push("No 'title' column found.");

  return rows
    .filter((r) => titleCol && r[titleCol])
    .map((r, i) => ({
      id: `d-${Date.now()}-${i}`,
      title: titleCol ? r[titleCol] : `Decision ${i + 1}`,
      context: contextCol ? r[contextCol] : "",
      decision: decisionCol ? r[decisionCol] : "",
      owner: ownerCol ? r[ownerCol] || "—" : "—",
      reversible: toBool(reversibleCol ? r[reversibleCol] : "true", true),
      date: parseDateOrNow(dateCol ? r[dateCol] : ""),
    }));
}

function mapDeals(headers: string[], rows: CsvRow[], warnings: string[]): Deal[] {
  const nameCol = findCol(headers, ["name", "deal", "account"]);
  const segmentCol = findCol(headers, ["segment"]);
  const stageCol = findCol(headers, ["stage"]);
  const acvCol = findCol(headers, ["acv", "value", "amount"]);
  const ownerCol = findCol(headers, ["owner", "rep"]);
  const nextActionCol = findCol(headers, ["next_action", "next action", "action"]);
  const nextActionDateCol = findCol(headers, ["next_action_date", "next date", "due"]);
  const inIcpCol = findCol(headers, ["in_icp", "icp"]);
  const slippedCol = findCol(headers, ["slipped"]);

  if (!nameCol) warnings.push("No 'name' column found.");

  const validSegments: DealSegment[] = ["smb", "mid-market", "enterprise"];
  const validStages: DealStage[] = [
    "discovery",
    "evaluation",
    "proposal",
    "commit",
    "best-case",
    "closed-won",
    "closed-lost",
  ];

  return rows
    .filter((r) => nameCol && r[nameCol])
    .map((r, i) => {
      const segRaw = (segmentCol ? r[segmentCol] : "mid-market").toLowerCase().replace("midmarket", "mid-market");
      const segment = validSegments.includes(segRaw as DealSegment) ? (segRaw as DealSegment) : "mid-market";
      const stageRaw = (stageCol ? r[stageCol] : "evaluation").toLowerCase().replace(" ", "-").replace("bestcase", "best-case");
      const stage = validStages.includes(stageRaw as DealStage) ? (stageRaw as DealStage) : "evaluation";
      return {
        id: `deal-${Date.now()}-${i}`,
        name: nameCol ? r[nameCol] : `Deal ${i + 1}`,
        segment,
        stage,
        acv: toNumber(acvCol ? r[acvCol] : "0"),
        owner: ownerCol ? r[ownerCol] || "—" : "—",
        nextAction: nextActionCol ? r[nextActionCol] : "",
        nextActionDate: parseDateOrNow(nextActionDateCol ? r[nextActionDateCol] : ""),
        slipped: toBool(slippedCol ? r[slippedCol] : "false", false),
        inIcp: toBool(inIcpCol ? r[inIcpCol] : "true", true),
      };
    });
}

function mapCandidates(
  headers: string[],
  rows: CsvRow[],
  warnings: string[],
  existingRoles: RoleMoc[]
): Candidate[] {
  const nameCol = findCol(headers, ["name", "candidate"]);
  const roleCol = findCol(headers, ["role", "role_id", "position"]);
  const stageCol = findCol(headers, ["stage"]);
  const daysCol = findCol(headers, ["days_in_stage", "days"]);
  const sourceCol = findCol(headers, ["source"]);

  if (!nameCol) warnings.push("No 'name' column found.");

  const validStages: Candidate["stage"][] = ["sourcing", "screen", "onsite", "offer", "hired"];

  return rows
    .filter((r) => nameCol && r[nameCol])
    .map((r, i) => {
      const roleVal = roleCol ? r[roleCol] : "";
      const matched = existingRoles.find(
        (rr) =>
          rr.id === roleVal ||
          rr.title.toLowerCase() === roleVal.toLowerCase() ||
          rr.title.toLowerCase().includes(roleVal.toLowerCase())
      );
      const stageRaw = (stageCol ? r[stageCol] : "sourcing").toLowerCase().trim();
      const stage = validStages.includes(stageRaw as Candidate["stage"])
        ? (stageRaw as Candidate["stage"])
        : "sourcing";
      return {
        id: `c-${Date.now()}-${i}`,
        name: nameCol ? r[nameCol] : `Candidate ${i + 1}`,
        roleId: matched?.id || existingRoles[0]?.id || "",
        stage,
        daysInStage: toNumber(daysCol ? r[daysCol] : "0"),
        source: sourceCol ? r[sourceCol] || "—" : "—",
        scorecard: [],
      };
    });
}

function mapRoles(headers: string[], rows: CsvRow[], warnings: string[]): RoleMoc[] {
  const titleCol = findCol(headers, ["title", "role"]);
  const functionCol = findCol(headers, ["function"]);
  const hmCol = findCol(headers, ["hiring_manager", "hiring manager", "manager"]);
  const statusCol = findCol(headers, ["status"]);
  const missionCol = findCol(headers, ["mission"]);
  const outcomesCol = findCol(headers, ["outcomes"]);
  const mustCol = findCol(headers, ["must_haves", "must haves", "musthaves"]);
  const niceCol = findCol(headers, ["nice_to_haves", "nice to haves", "nicetohaves"]);

  if (!titleCol) warnings.push("No 'title' column found.");

  const splitMulti = (s: string) =>
    s
      .split(/[|\n;]/)
      .map((x) => x.trim())
      .filter(Boolean);

  const validStatus: RoleMoc["status"][] = ["drafting", "open", "in-loop", "filled"];

  return rows
    .filter((r) => titleCol && r[titleCol])
    .map((r, i) => {
      const statusRaw = (statusCol ? r[statusCol] : "drafting").toLowerCase().replace(" ", "-");
      const status = validStatus.includes(statusRaw as RoleMoc["status"])
        ? (statusRaw as RoleMoc["status"])
        : "drafting";
      return {
        id: `r-${Date.now()}-${i}`,
        title: titleCol ? r[titleCol] : `Role ${i + 1}`,
        function: functionCol ? r[functionCol] || "—" : "—",
        hiringManager: hmCol ? r[hmCol] || "—" : "—",
        status,
        mission: missionCol ? r[missionCol] : "",
        outcomes: outcomesCol ? splitMulti(r[outcomesCol]) : [""],
        mustHaves: mustCol ? splitMulti(r[mustCol]) : [""],
        niceToHaves: niceCol ? splitMulti(r[niceCol]) : [""],
        createdAt: new Date().toISOString(),
      };
    });
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 24);
}

function parseDateOrNow(s: string): string {
  if (!s) return new Date().toISOString();
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

// Sample CSVs for the user to download / preview
export const SAMPLE_CSVS: Record<ImportTarget, string> = {
  okrs: `objective,owner,quarter,why,kr_title,kr_metric,kr_start,kr_current,kr_target,kr_status
"Prove repeatable mid-market motion",CRO,Q1,"Repeatability is the unlock for the Series B story.","Win rate >= 25% in ICP",%,18,22,25,at-risk
"Prove repeatable mid-market motion",CRO,Q1,"","Sales cycle <= 60 days for ICP deals",days,84,71,60,at-risk
"Ship v2 platform GA",CPO,Q1,"v1 hit its PMF ceiling on segment B.","GA on March 15",date,0,1,1,on-track
"Ship v2 platform GA",CPO,Q1,"","10 design partners migrated",partners,0,6,10,on-track
`,
  decisions: `title,context,decision,owner,reversible,date
"Hold mid-market hiring at 4 AEs through Q+1","Pipeline coverage at 2.4x — below 3x bar.","Pause AE backfills until coverage hits 3x for two consecutive weeks.",CRO,true,2026-04-29
"Adopt MOC for every new role","Three of last five hires misfired in the first 90 days.","Every open role requires a one-page MOC.",CoS,true,2026-04-22
"Move investor update to monthly","Investors felt out of the loop between quarters.","Investor update ships by the 5th of every month.",CEO,false,2026-04-12
`,
  deals: `name,segment,stage,acv,owner,next_action,next_action_date,in_icp,slipped
Atlas Robotics,mid-market,commit,180000,Devon Park,"Security review with their CISO",2026-05-06,true,false
Sentry Labs,enterprise,commit,420000,Naomi Schwartz,"Final paper redlines back to legal",2026-05-08,true,false
Quanta Bio,enterprise,evaluation,380000,Naomi Schwartz,"Procurement intro",2026-05-15,true,false
Helio Aerospace,enterprise,best-case,540000,Naomi Schwartz,"Sponsor leaving — re-anchor",2026-05-07,true,true
`,
  candidates: `name,role,stage,days_in_stage,source
Priya Iyer,VP Engineering,onsite,4,Referral
Marcus Wei,VP Engineering,offer,2,Inbound
Lena Kowalski,VP Engineering,screen,6,Outbound
Devon Park,CRO,onsite,9,Recruiter
`,
  roles: `title,function,hiring_manager,status,mission,outcomes,must_haves
"VP Engineering",Engineering,CEO,in-loop,"By the end of FY+1, ship v2 on a 2-week cadence with sub-2 P0/P1 escapes.","Ship v2 GA on March 15|Hire 8 engineers ramped by Day 90|Sprint commit-to-ship rate >= 85%","Has scaled an org from sub-20 to 50+ engineers|Has owned a release process where escapes were measured weekly"
`,
};
