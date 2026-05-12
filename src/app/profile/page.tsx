"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, FormRow } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_PROFILE,
  STAGE_LABELS,
  useCompanyProfile,
} from "@/components/providers/company-profile-provider";
import type { CompanyProfile, Decision, Objective } from "@/lib/types";
import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  Database,
  RotateCcw,
  Save,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoleMoc, Candidate } from "@/lib/content/people";
import type { Deal } from "@/lib/content/gtm";
import { writeStorage } from "@/lib/storage";
import { scaleKpisForProfile } from "@/lib/content/kpi-defaults";

type AdaptResult = {
  profile: {
    name: string;
    stage: CompanyProfile["stage"];
    hq: string;
    teamSize: number;
    founded: string;
    oneLiner: string;
    northStarMetric: string;
    fiscalYearStart: number;
  };
  context: {
    sector: string;
    strategicMoment: string;
    keyHires: string[];
    suggestedOkrThemes: string[];
    ceoName: string;
  };
  seed: {
    okrs: Objective[];
    deals: Deal[];
    candidates: Candidate[];
    roles: RoleMoc[];
    decisions: Decision[];
  } | null;
};

export default function ProfilePage() {
  const { profile, setProfile, hydrated } = useCompanyProfile();
  const [draft, setDraft] = useState<CompanyProfile>(profile);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Adapt state
  const [source, setSource] = useState("");
  const [adapting, setAdapting] = useState(false);
  const [adaptError, setAdaptError] = useState<string | null>(null);
  const [adaptResult, setAdaptResult] = useState<AdaptResult | null>(null);

  if (!hydrated) {
    return <div className="text-sm text-zinc-400">Loading profile…</div>;
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const adapt = async () => {
    const text = source.trim();
    if (!text || adapting) return;
    setAdaptError(null);
    setAdaptResult(null);
    setAdapting(true);
    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdaptError(data.error || "Adaptation failed.");
      } else {
        setAdaptResult({ profile: data.profile, context: data.context, seed: data.seed ?? null });
      }
    } catch {
      setAdaptError("Network error. Try again.");
    } finally {
      setAdapting(false);
    }
  };

  const applyAdapt = () => {
    if (!adaptResult) return;
    const newProfile: CompanyProfile = {
      ...draft,
      name: adaptResult.profile.name,
      stage: adaptResult.profile.stage,
      hq: adaptResult.profile.hq,
      teamSize: adaptResult.profile.teamSize,
      founded: adaptResult.profile.founded,
      oneLiner: adaptResult.profile.oneLiner,
      northStarMetric: adaptResult.profile.northStarMetric,
      fiscalYearStart: adaptResult.profile.fiscalYearStart,
      ceoName: adaptResult.context.ceoName || draft.ceoName,
    };
    setDraft(newProfile);
    setProfile(newProfile);

    // Reseed module data if the API returned seed
    if (adaptResult.seed) {
      writeStorage("okrs", adaptResult.seed.okrs);
      writeStorage("deals", adaptResult.seed.deals);
      writeStorage("candidates", adaptResult.seed.candidates);
      writeStorage("roles", adaptResult.seed.roles);
      writeStorage("decisions", adaptResult.seed.decisions);
    }

    // Scale KPI series to the new profile (stage + team size + north-star label)
    writeStorage("kpis", scaleKpisForProfile(newProfile));

    setSavedAt(Date.now());
    setAdaptResult(null);
    setSource("");
  };

  const discardAdapt = () => {
    setAdaptResult(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Company Profile"
        title="Tell the OS about your company."
        description="These propagate everywhere. Stored in your browser."
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDraft(DEFAULT_PROFILE);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
            </Button>
            <Button
              variant="primary"
              disabled={!dirty}
              onClick={() => {
                setProfile(draft);
                setSavedAt(Date.now());
              }}
            >
              <Save className="h-3.5 w-3.5" /> Save changes
            </Button>
          </>
        }
      />

      {savedAt && !dirty && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-[13px] text-emerald-800 inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" /> Saved. The shell, the dashboard, and every template just updated.
        </div>
      )}

      {/* ADAPT TO A COMPANY */}
      <Card className="p-0 overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/30 border-indigo-100/60">
        <div className="px-5 py-4 border-b divider flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-white shadow-elevated shrink-0">
            <Wand2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <CardEyebrow className="text-indigo-600">Adapt to a company</CardEyebrow>
            <h3 className="mt-0.5 text-[15px] font-semibold tracking-tight text-zinc-900">
              Reframe the OS around a specific company in one shot
            </h3>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-[12.5px] text-zinc-600 leading-relaxed">
            Paste a job description, careers page, or just a company name. The OS infers profile, stage, sector,
            strategic moment, key hires, and likely OKR themes — then propagates that company everywhere.
          </p>

          <Textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Paste the JD you're applying to. Or just type a company name like 'Linear' or 'Ramp'."
            rows={5}
            className="font-mono text-[12px]"
            disabled={adapting}
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[11px] text-zinc-400">
              {source.length > 0 && (
                <span>
                  {source.length.toLocaleString()} chars · {source.split(/\s+/).filter(Boolean).length}{" "}
                  words
                </span>
              )}
            </div>
            <Button
              variant="gradient"
              onClick={adapt}
              disabled={adapting || source.trim().length < 3}
            >
              {adapting ? (
                <>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
                  <span>Adapting · 30–60s</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5" /> Adapt the OS
                </>
              )}
            </Button>
          </div>

          {adapting && (
            <div className="rounded-lg bg-indigo-50/60 border border-indigo-200/60 px-4 py-3 text-[12.5px] text-indigo-900 leading-relaxed">
              Generating profile, sector, strategic moment, OKRs, deals, candidates, roles, and decisions
              for this company. Takes 30–60 seconds — the model produces ~4k tokens of company-specific content.
            </div>
          )}

          {adaptError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-[12.5px] text-rose-800 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="min-w-0 break-words">{adaptError}</span>
            </div>
          )}
        </div>

        {adaptResult && (
          <AdaptPreview
            result={adaptResult}
            currentProfile={profile}
            onApply={applyAdapt}
            onDiscard={discardAdapt}
          />
        )}
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6">
          <CardEyebrow>The basics</CardEyebrow>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">Company identity</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <FormRow label="Company name">
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </FormRow>
            <FormRow label="Stage">
              <Select
                value={draft.stage}
                onChange={(e) =>
                  setDraft({ ...draft, stage: e.target.value as CompanyProfile["stage"] })
                }
              >
                {Object.entries(STAGE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </FormRow>
            <FormRow label="Founded">
              <Input
                value={draft.founded}
                onChange={(e) => setDraft({ ...draft, founded: e.target.value })}
              />
            </FormRow>
            <FormRow label="HQ">
              <Input
                value={draft.hq}
                onChange={(e) => setDraft({ ...draft, hq: e.target.value })}
              />
            </FormRow>
            <FormRow label="Team size" hint="Determines which CoS archetype the OS leans into.">
              <Input
                type="number"
                value={draft.teamSize}
                onChange={(e) => setDraft({ ...draft, teamSize: Number(e.target.value) || 0 })}
              />
            </FormRow>
            <FormRow label="Fiscal year start month" hint="1–12 (1 = January)">
              <Input
                type="number"
                min={1}
                max={12}
                value={draft.fiscalYearStart}
                onChange={(e) =>
                  setDraft({ ...draft, fiscalYearStart: Math.min(12, Math.max(1, Number(e.target.value) || 1)) })
                }
              />
            </FormRow>
            <FormRow label="One-liner" className="sm:col-span-2" hint="Used in board pack covers and investor updates.">
              <Textarea
                value={draft.oneLiner}
                onChange={(e) => setDraft({ ...draft, oneLiner: e.target.value })}
              />
            </FormRow>
            <FormRow
              label="North-star metric"
              className="sm:col-span-2"
              hint="The one number every team line-of-sights to. Shown on every dashboard."
            >
              <Input
                value={draft.northStarMetric}
                onChange={(e) => setDraft({ ...draft, northStarMetric: e.target.value })}
              />
            </FormRow>
          </div>
        </Card>

        <Card className="p-6">
          <CardEyebrow>The principals</CardEyebrow>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">Who you are</h3>
          <p className="mt-2 text-[12.5px] text-zinc-500 leading-relaxed">
            The OS uses these names so the dashboard greets you and so meeting kits address the right person.
          </p>

          <div className="space-y-4 mt-5">
            <FormRow label="CEO name">
              <Input
                value={draft.ceoName}
                onChange={(e) => setDraft({ ...draft, ceoName: e.target.value })}
              />
            </FormRow>
            <FormRow label="Chief of Staff name">
              <Input
                value={draft.cosName}
                onChange={(e) => setDraft({ ...draft, cosName: e.target.value })}
              />
            </FormRow>
          </div>

          <div className="mt-6 pt-5 border-t divider">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-zinc-400" />
              <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
                Stored in
              </span>
            </div>
            <div className="mt-2 text-[13px] text-zinc-700 font-mono">
              localStorage / cos-os:v1:company-profile
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 leading-relaxed">
              Clear your browser storage to reset. Nothing leaves your machine.
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PreviewTile label="Company" value={draft.name} />
        <PreviewTile label="Stage" value={STAGE_LABELS[draft.stage]} />
        <PreviewTile label="Team" value={`${draft.teamSize} people`} />
        <PreviewTile label="North star" value={draft.northStarMetric} />
      </section>
    </div>
  );
}

function PreviewTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-muted px-4 py-3.5">
      <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-[15px] font-semibold text-zinc-900 truncate">{value}</div>
      <Badge tone="indigo" className="mt-2">
        Live preview
      </Badge>
    </div>
  );
}

function AdaptPreview({
  result,
  currentProfile,
  onApply,
  onDiscard,
}: {
  result: AdaptResult;
  currentProfile: CompanyProfile;
  onApply: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="border-t divider bg-white">
      <div className="px-5 py-4 border-b divider bg-indigo-50/40 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span className="text-[13px] font-semibold text-zinc-900">
            Adapted to{" "}
            <span className="text-indigo-700">{result.profile.name || "this company"}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={onDiscard}>
            <X className="h-3 w-3" /> Discard
          </Button>
          <Button variant="primary" size="sm" onClick={onApply}>
            <Check className="h-3 w-3" /> Apply changes
          </Button>
        </div>
      </div>

      <div className="px-5 py-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">
        {/* Profile diff */}
        <div className="space-y-2.5 min-w-0">
          <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
            Profile changes
          </div>
          <DiffRow label="Name" oldValue={currentProfile.name} newValue={result.profile.name} />
          <DiffRow
            label="Stage"
            oldValue={currentProfile.stage}
            newValue={result.profile.stage}
          />
          <DiffRow label="HQ" oldValue={currentProfile.hq} newValue={result.profile.hq} />
          <DiffRow
            label="Team size"
            oldValue={String(currentProfile.teamSize)}
            newValue={String(result.profile.teamSize)}
          />
          <DiffRow
            label="Founded"
            oldValue={currentProfile.founded}
            newValue={result.profile.founded}
          />
          <DiffRow
            label="One-liner"
            oldValue={currentProfile.oneLiner}
            newValue={result.profile.oneLiner}
          />
          <DiffRow
            label="North-star metric"
            oldValue={currentProfile.northStarMetric}
            newValue={result.profile.northStarMetric}
          />
          {result.context.ceoName && (
            <DiffRow
              label="CEO"
              oldValue={currentProfile.ceoName}
              newValue={result.context.ceoName}
            />
          )}
        </div>

        {/* Context */}
        <div className="space-y-3 min-w-0">
          <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
            Strategic context (read-only)
          </div>

          {result.context.sector && (
            <div className="rounded-lg border divider px-3.5 py-2.5 bg-zinc-50/60">
              <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500">
                Sector
              </div>
              <div className="mt-0.5 text-[13px] text-zinc-800 break-words">
                {result.context.sector}
              </div>
            </div>
          )}

          {result.context.strategicMoment && (
            <div className="rounded-lg border divider px-3.5 py-2.5 bg-zinc-50/60">
              <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500">
                Strategic moment
              </div>
              <div className="mt-0.5 text-[13px] text-zinc-800 leading-relaxed break-words">
                {result.context.strategicMoment}
              </div>
            </div>
          )}

          {result.context.keyHires.length > 0 && (
            <div className="rounded-lg border divider px-3.5 py-2.5 bg-zinc-50/60">
              <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500">
                Key hires this stage
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.context.keyHires.map((h, i) => (
                  <Badge key={i} tone="indigo">
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.context.suggestedOkrThemes.length > 0 && (
            <div className="rounded-lg border divider px-3.5 py-2.5 bg-zinc-50/60">
              <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500">
                Likely OKR themes
              </div>
              <div className="mt-1.5 flex flex-col gap-1">
                {result.context.suggestedOkrThemes.map((t, i) => (
                  <div
                    key={i}
                    className="text-[12.5px] text-zinc-700 leading-relaxed flex items-start gap-1.5"
                  >
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-zinc-400 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seed data preview */}
      {result.seed && (
        <div className="px-5 py-5 border-t divider bg-zinc-50/40">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-4 w-4 text-fuchsia-600" />
            <span className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
              Sample data to reseed
            </span>
            <Badge tone="fuchsia">applies on click</Badge>
          </div>

          <p className="text-[12px] text-zinc-600 leading-relaxed mb-4 max-w-3xl">
            On <span className="font-semibold text-zinc-900">Apply</span>, every module&apos;s sample data
            will be replaced with company-specific OKRs, deals, candidates, roles, and decisions. The OS
            will look like it was built for this company on day one.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <SeedCountTile
              label="OKRs"
              count={result.seed.okrs.length}
              detail={`${result.seed.okrs.reduce((s, o) => s + o.keyResults.length, 0)} KRs`}
            />
            <SeedCountTile
              label="Deals"
              count={result.seed.deals.length}
              detail={`$${(
                result.seed.deals.reduce((s, d) => s + (d.acv || 0), 0) / 1e6
              ).toFixed(1)}M pipe`}
            />
            <SeedCountTile
              label="Candidates"
              count={result.seed.candidates.length}
              detail={`${result.seed.roles.length} roles`}
            />
            <SeedCountTile
              label="Roles (MOC)"
              count={result.seed.roles.length}
              detail="full specs"
            />
            <SeedCountTile
              label="Decisions"
              count={result.seed.decisions.length}
              detail="recent"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {result.seed.okrs.length > 0 && (
              <div className="rounded-lg border divider px-3.5 py-2.5 bg-white">
                <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500 mb-1.5">
                  Objectives
                </div>
                <ul className="space-y-1">
                  {result.seed.okrs.map((o) => (
                    <li
                      key={o.id}
                      className="text-[12.5px] text-zinc-800 leading-snug flex items-start gap-1.5"
                    >
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-indigo-500 shrink-0" />
                      <span>
                        <span className="font-medium">{o.title}</span>{" "}
                        <span className="text-zinc-400">· {o.owner}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.seed.deals.length > 0 && (
              <div className="rounded-lg border divider px-3.5 py-2.5 bg-white">
                <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500 mb-1.5">
                  Pipeline
                </div>
                <ul className="space-y-1">
                  {result.seed.deals.slice(0, 5).map((d) => (
                    <li
                      key={d.id}
                      className="text-[12.5px] text-zinc-800 leading-snug flex items-start gap-1.5"
                    >
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                      <span>
                        <span className="font-medium">{d.name}</span>{" "}
                        <span className="text-zinc-400">
                          · {d.segment} · ${(d.acv / 1000).toFixed(0)}k
                        </span>
                      </span>
                    </li>
                  ))}
                  {result.seed.deals.length > 5 && (
                    <li className="text-[11px] text-zinc-400 pl-3">
                      + {result.seed.deals.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {result.seed.roles.length > 0 && (
              <div className="rounded-lg border divider px-3.5 py-2.5 bg-white">
                <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500 mb-1.5">
                  Roles (MOC drafted)
                </div>
                <ul className="space-y-1">
                  {result.seed.roles.map((r) => (
                    <li
                      key={r.id}
                      className="text-[12.5px] text-zinc-800 leading-snug flex items-start gap-1.5"
                    >
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-fuchsia-500 shrink-0" />
                      <span>
                        <span className="font-medium">{r.title}</span>{" "}
                        <span className="text-zinc-400">· {r.status}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.seed.decisions.length > 0 && (
              <div className="rounded-lg border divider px-3.5 py-2.5 bg-white">
                <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500 mb-1.5">
                  Recent decisions
                </div>
                <ul className="space-y-1">
                  {result.seed.decisions.map((d) => (
                    <li
                      key={d.id}
                      className="text-[12.5px] text-zinc-800 leading-snug flex items-start gap-1.5"
                    >
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-500 shrink-0" />
                      <span>
                        <span className="font-medium">{d.title}</span>{" "}
                        <span className="text-zinc-400">· {d.owner}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SeedCountTile({ label, count, detail }: { label: string; count: number; detail: string }) {
  return (
    <div className="rounded-lg border divider bg-white px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500">
        {label}
      </div>
      <div className="mt-0.5 text-[20px] font-semibold tracking-tight text-zinc-900 leading-none">
        {count}
      </div>
      <div className="mt-0.5 text-[10.5px] text-zinc-500 truncate">{detail}</div>
    </div>
  );
}

function DiffRow({
  label,
  oldValue,
  newValue,
}: {
  label: string;
  oldValue: string;
  newValue: string;
}) {
  const changed = oldValue.trim() !== newValue.trim();
  return (
    <div className="rounded-lg border divider px-3.5 py-2.5 min-w-0">
      <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500 mb-1">
        {label}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3 min-w-0">
        <div
          className={cn(
            "text-[12.5px] line-through min-w-0 break-words",
            changed ? "text-zinc-400" : "hidden sm:block text-zinc-400 line-through-0"
          )}
          style={!changed ? { textDecoration: "none" } : undefined}
        >
          {oldValue || "—"}
        </div>
        {changed && <span className="text-zinc-300 shrink-0">→</span>}
        <div
          className={cn(
            "text-[13px] min-w-0 break-words",
            changed ? "text-zinc-900 font-medium" : "text-zinc-500"
          )}
        >
          {newValue || "—"}
        </div>
      </div>
    </div>
  );
}
