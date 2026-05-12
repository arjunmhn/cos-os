"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea, FormRow } from "@/components/ui/input";
import { useState, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { parseCsv } from "@/lib/csv";
import {
  buildPreview,
  SAMPLE_CSVS,
  TARGET_META,
  type ImportPreview,
  type ImportTarget,
} from "@/lib/importers";
import { useLocalStorage, writeStorage } from "@/lib/storage";
import { DEFAULT_ROLES, type RoleMoc } from "@/lib/content/people";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ClipboardCopy,
  Clock,
  Download,
  Sparkles,
  Table,
  Upload,
} from "lucide-react";
import Link from "next/link";

type Source = {
  id: string;
  name: string;
  category: string;
  status: "available" | "planned";
  description: string;
  initial: string;
  bg: string;
  fg?: string;
};

const SOURCES: Source[] = [
  {
    id: "csv",
    name: "CSV upload",
    category: "Files",
    status: "available",
    description: "Paste or upload a file. Headers auto-detect.",
    initial: "C",
    bg: "#10b981",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    status: "planned",
    description: "Live deals + contacts into the GTM module.",
    initial: "H",
    bg: "#ff7a59",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    status: "planned",
    description: "Pipeline, accounts, and opportunities into GTM.",
    initial: "S",
    bg: "#00a1e0",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Comms",
    status: "planned",
    description: "Decisions and announcements from key channels.",
    initial: "S",
    bg: "#4a154b",
  },
  {
    id: "notion",
    name: "Notion",
    category: "Docs",
    status: "planned",
    description: "OKRs, decision logs, MOC drafts.",
    initial: "N",
    bg: "#000000",
  },
  {
    id: "linear",
    name: "Linear",
    category: "Engineering",
    status: "planned",
    description: "Sprint velocity, shipping cadence.",
    initial: "L",
    bg: "#5e6ad2",
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    category: "Hiring",
    status: "planned",
    description: "Pipeline, candidates, scorecards into People.",
    initial: "G",
    bg: "#24a47f",
  },
  {
    id: "ramp",
    name: "Ramp",
    category: "Finance",
    status: "planned",
    description: "Burn, runway, category spend into KPIs.",
    initial: "R",
    bg: "#ffcc00",
    fg: "#1a1a1a",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Finance",
    status: "planned",
    description: "ARR, MRR, revenue trends into KPIs.",
    initial: "S",
    bg: "#635bff",
  },
];

const TARGETS: ImportTarget[] = ["okrs", "decisions", "deals", "candidates", "roles"];

export default function ImportPage() {
  const [target, setTarget] = useState<ImportTarget>("okrs");
  const [csv, setCsv] = useState("");
  const [imported, setImported] = useState<{ target: ImportTarget; count: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [roles] = useLocalStorage<RoleMoc[]>("roles", DEFAULT_ROLES);

  const preview = useMemo<ImportPreview | null>(() => {
    if (!csv.trim()) return null;
    const { headers, rows } = parseCsv(csv);
    if (headers.length === 0) return null;
    return buildPreview(target, headers, rows, roles);
  }, [csv, target, roles]);

  const meta = TARGET_META[target];

  const loadSample = () => {
    setCsv(SAMPLE_CSVS[target]);
    setImported(null);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    setCsv(text);
    setImported(null);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSVS[target]], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${target}-sample.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = (mode: "replace" | "append") => {
    if (!preview) return;
    if (mode === "replace") {
      writeStorage(meta.storageKey, preview.mapped);
    } else {
      const existing = JSON.parse(
        localStorage.getItem(`cos-os:v1:${meta.storageKey}`) || "[]"
      ) as unknown[];
      writeStorage(meta.storageKey, [...preview.mapped, ...existing]);
    }
    setImported({ target, count: preview.mapped.length });
    setCsv("");
  };

  const targetLink: Record<ImportTarget, string> = {
    okrs: "/cadence",
    decisions: "/cadence#decisions",
    deals: "/gtm",
    candidates: "/people",
    roles: "/people",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Data sources"
        title="Bring your data in."
        description="CSV today. Live integrations next."
      />

      {/* SOURCES GRID */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-zinc-500 mb-3">
          Sources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SOURCES.map((s) => (
            <SourceCard
              key={s.id}
              source={s}
              onClick={() => {
                if (s.status === "available") {
                  document.getElementById("csv-importer")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
          ))}
        </div>
        <div className="mt-3 text-[11.5px] text-zinc-500 flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          Planned integrations land in upcoming releases. CSV works today.
        </div>
      </section>

      {imported && (
        <Card className="p-5 bg-emerald-50 border-emerald-200">
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-emerald-100 text-emerald-700 shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-emerald-900">
                Imported {imported.count} {TARGET_META[imported.target].label.toLowerCase()}.
              </div>
              <div className="mt-1 text-[12px] text-emerald-800">
                The {TARGET_META[imported.target].label} module now reflects this data.
              </div>
            </div>
            <Link
              href={targetLink[imported.target]}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-800 hover:text-emerald-900"
            >
              Open module <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      )}

      {/* CSV IMPORTER */}
      <section id="csv-importer" className="space-y-4 scroll-mt-20">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-zinc-500">
              CSV upload
            </h2>
            <p className="mt-1 text-[13px] text-zinc-600">Pick a module, then paste or upload.</p>
          </div>
          <Badge tone="emerald" dot>
            Available
          </Badge>
        </div>

        {/* Target picker */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {TARGETS.map((t) => {
            const m = TARGET_META[t];
            const active = t === target;
            return (
              <button
                key={t}
                onClick={() => {
                  setTarget(t);
                  setCsv("");
                  setImported(null);
                }}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-elevated"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                )}
              >
                <div className={cn("text-[13px] font-semibold", active ? "text-white" : "text-zinc-900")}>
                  {m.label}
                </div>
                <div
                  className={cn(
                    "mt-0.5 text-[10.5px]",
                    active ? "text-zinc-300" : "text-zinc-500"
                  )}
                >
                  {m.storageKey}
                </div>
              </button>
            );
          })}
        </div>

        {/* Composer + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <CardEyebrow>Source</CardEyebrow>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={loadSample}>
                  <Sparkles className="h-3 w-3" /> Sample
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadSample}>
                  <Download className="h-3 w-3" /> .csv
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3 w-3" /> Upload
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={onFile}
                  className="hidden"
                />
              </div>
            </div>

            <div className="rounded-md bg-amber-50/60 border border-amber-200/60 px-3 py-2 mb-3">
              <div className="text-[11px] text-amber-800 leading-relaxed">{meta.description}</div>
            </div>

            <FormRow label="Expected headers (auto-detected)">
              <div className="flex flex-wrap gap-1.5">
                {meta.sampleHeaders.map((h) => (
                  <Badge key={h} tone="neutral">
                    <span className="font-mono text-[10.5px]">{h}</span>
                  </Badge>
                ))}
              </div>
            </FormRow>

            <div className="mt-4">
              <FormRow label="Paste CSV" hint="First row is headers.">
                <Textarea
                  value={csv}
                  onChange={(e) => {
                    setCsv(e.target.value);
                    setImported(null);
                  }}
                  rows={14}
                  className="font-mono text-[11.5px]"
                  placeholder={`${meta.sampleHeaders.join(",")}\n…`}
                />
              </FormRow>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden flex flex-col max-h-[700px]">
            <div className="px-5 py-4 border-b divider flex items-center justify-between bg-zinc-50/60">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4 text-indigo-600" />
                <span className="text-[13px] font-semibold text-zinc-900">Preview</span>
                {preview && (
                  <Badge tone="indigo">
                    {preview.mapped.length} {meta.label.toLowerCase()} ready
                  </Badge>
                )}
              </div>
              {preview && (
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => doImport("append")}>
                    Append
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => doImport("replace")}>
                    <Check className="h-3 w-3" /> Replace
                  </Button>
                </div>
              )}
            </div>

            {preview ? (
              <>
                {preview.warnings.length > 0 && (
                  <div className="px-5 py-3 bg-amber-50/60 border-b border-amber-200/60">
                    <div className="flex items-start gap-2 text-[12px] text-amber-900">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">Warnings</div>
                        <ul className="space-y-0.5">
                          {preview.warnings.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-auto scroll-dim p-5">
                  <pre className="text-[11px] font-mono text-zinc-800 leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(preview.mapped.slice(0, 6), null, 2)}
                    {preview.mapped.length > 6
                      ? `\n\n… ${preview.mapped.length - 6} more rows`
                      : ""}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 grid place-items-center px-6 py-16 text-center">
                <div>
                  <ClipboardCopy className="h-5 w-5 text-zinc-300 mx-auto" />
                  <div className="mt-3 text-[13px] font-semibold text-zinc-700">
                    Paste, upload, or load a sample
                  </div>
                  <div className="mt-1 text-[11.5px] text-zinc-500 max-w-xs">
                    Replace overwrites; Append adds to existing data.
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

function SourceCard({ source, onClick }: { source: Source; onClick: () => void }) {
  const isAvailable = source.status === "available";
  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={cn(
        "group rounded-xl border bg-white p-4 text-left transition-all",
        isAvailable
          ? "border-zinc-200 hover:border-zinc-300 hover:shadow-card cursor-pointer"
          : "border-zinc-200 opacity-90 cursor-default"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-9 w-9 rounded-md grid place-items-center text-[14px] font-bold shrink-0 shadow-card"
          style={{ background: source.bg, color: source.fg || "white" }}
        >
          {source.initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13.5px] font-semibold tracking-tight text-zinc-900">
              {source.name}
            </span>
            {isAvailable ? (
              <Badge tone="emerald">Available</Badge>
            ) : (
              <Badge tone="neutral">Planned</Badge>
            )}
          </div>
          <p className="mt-0.5 text-[12px] text-zinc-500 leading-relaxed break-words">
            {source.description}
          </p>
          <div className="mt-1.5 text-[10.5px] uppercase tracking-[0.1em] font-semibold text-zinc-400">
            {source.category}
          </div>
        </div>
      </div>
    </button>
  );
}
