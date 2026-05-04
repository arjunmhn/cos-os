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
import type { CompanyProfile } from "@/lib/types";
import { useState } from "react";
import { Save, RotateCcw, Building2, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const { profile, setProfile, hydrated } = useCompanyProfile();
  const [draft, setDraft] = useState<CompanyProfile>(profile);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  if (!hydrated) {
    return (
      <div className="text-sm text-zinc-400">Loading profile…</div>
    );
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Company Profile"
        title="Tell the OS about your company."
        description="These fields propagate through every template, dashboard, and meeting kit. Stored locally in your browser — nothing is sent anywhere."
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
