"use client";

import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, FormRow } from "@/components/ui/input";
import { useLocalStorage } from "@/lib/storage";
import { DEFAULT_ROLES, ROLE_STATUS_TONE, type RoleMoc } from "@/lib/content/people";
import { useMemo, useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { MarkdownDocument } from "@/components/ui/markdown-view";

const blankRole: RoleMoc = {
  id: "",
  title: "",
  function: "",
  hiringManager: "",
  status: "drafting",
  mission: "",
  outcomes: [""],
  mustHaves: [""],
  niceToHaves: [""],
  createdAt: new Date().toISOString(),
};

export function MocBuilder() {
  const [roles, setRoles] = useLocalStorage<RoleMoc[]>("roles", DEFAULT_ROLES);
  const [selectedId, setSelectedId] = useState<string>(roles[0]?.id || "");

  const role = useMemo(() => roles.find((r) => r.id === selectedId), [roles, selectedId]);

  const update = (patch: Partial<RoleMoc>) => {
    if (!role) return;
    setRoles(roles.map((r) => (r.id === role.id ? { ...r, ...patch } : r)));
  };

  const addRole = () => {
    const id = `r-${Date.now()}`;
    const next: RoleMoc = { ...blankRole, id, createdAt: new Date().toISOString(), title: "New role" };
    setRoles([next, ...roles]);
    setSelectedId(id);
  };

  const deleteRole = (id: string) => {
    const next = roles.filter((r) => r.id !== id);
    setRoles(next);
    setSelectedId(next[0]?.id || "");
  };

  const markdown = useMemo(() => (role ? toMarkdown(role) : ""), [role]);
  const filename = role ? `moc-${role.title.toLowerCase().replace(/\s+/g, "-")}.md` : "moc.md";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-5">
      {/* Roles list */}
      <aside className="space-y-2">
        <Button variant="primary" onClick={addRole} className="w-full">
          <Plus className="h-3.5 w-3.5" /> New role
        </Button>
        <div className="space-y-1">
          {roles.map((r) => {
            const active = r.id === selectedId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors",
                  active
                    ? "border-zinc-900 bg-zinc-50 shadow-card"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-zinc-900 truncate">
                    {r.title || "Untitled role"}
                  </span>
                  <Badge tone={ROLE_STATUS_TONE[r.status] as never}>{r.status}</Badge>
                </div>
                <div className="mt-1 text-[11px] text-zinc-500 truncate">
                  {r.function || "—"} · {r.outcomes.filter(Boolean).length} outcomes
                </div>
                <div className="mt-1.5 text-[10px] text-zinc-400">{formatDate(r.createdAt)}</div>
              </button>
            );
          })}
          {roles.length === 0 && (
            <div className="text-[12px] text-zinc-400 text-center py-6">
              No roles yet. Hit "New role" to scaffold one.
            </div>
          )}
        </div>
        <button
          onClick={() => setRoles(DEFAULT_ROLES)}
          className="text-[11px] text-zinc-400 hover:text-zinc-700 inline-flex items-center gap-1 mt-3"
        >
          <Sparkles className="h-3 w-3" /> Reset to sample roles
        </button>
      </aside>

      {/* Editor + preview */}
      {role ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Card className="p-6 space-y-5">
            <div>
              <CardEyebrow>Editor</CardEyebrow>
              <h3 className="mt-1 text-base font-semibold text-zinc-900">
                Mission · Outcomes · Competencies
              </h3>
              <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed">
                Define the role by what it must accomplish in 12–18 months. The MOC becomes the JD,
                the interview rubric, the 30/60/90, and the eventual performance review.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Title">
                <Input value={role.title} onChange={(e) => update({ title: e.target.value })} />
              </FormRow>
              <FormRow label="Function">
                <Input
                  value={role.function}
                  onChange={(e) => update({ function: e.target.value })}
                />
              </FormRow>
              <FormRow label="Hiring manager">
                <Input
                  value={role.hiringManager}
                  onChange={(e) => update({ hiringManager: e.target.value })}
                />
              </FormRow>
              <FormRow label="Status">
                <Select
                  value={role.status}
                  onChange={(e) => update({ status: e.target.value as RoleMoc["status"] })}
                >
                  <option value="drafting">Drafting</option>
                  <option value="open">Open</option>
                  <option value="in-loop">In loop</option>
                  <option value="filled">Filled</option>
                </Select>
              </FormRow>
            </div>

            <FormRow
              label="Mission"
              hint="One paragraph. The state the org is in 12–18 months from now because this person did the job."
            >
              <Textarea
                value={role.mission}
                onChange={(e) => update({ mission: e.target.value })}
                rows={4}
              />
            </FormRow>

            <ListField
              label="Outcomes"
              hint="3–5 measurable outcomes. Observable + time-bound."
              items={role.outcomes}
              onChange={(items) => update({ outcomes: items })}
              placeholder="e.g. Win rate in ICP reaches 25% by Q+2"
            />

            <ListField
              label="Must-have competencies"
              hint="Behaviors, not adjectives."
              items={role.mustHaves}
              onChange={(items) => update({ mustHaves: items })}
              placeholder="e.g. Has scaled an org from sub-20 to 50+ engineers"
            />

            <ListField
              label="Nice-to-have competencies"
              hint="Tiebreakers, not requirements."
              items={role.niceToHaves}
              onChange={(items) => update({ niceToHaves: items })}
              placeholder="e.g. Background in vertical SaaS"
            />

            <div className="flex items-center justify-between pt-3 border-t divider">
              <button
                onClick={() => deleteRole(role.id)}
                className="text-[11px] text-zinc-400 hover:text-rose-500 inline-flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Delete role
              </button>
              <div className="text-[11px] text-zinc-400">
                Auto-saved · localStorage
              </div>
            </div>
          </Card>

          <MarkdownDocument
            body={markdown}
            eyebrow="MOC role spec"
            title={role.title || "Untitled role"}
            filename={filename}
            className="max-h-[800px]"
          />
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-[14px] font-semibold text-zinc-700">No role selected.</div>
          <div className="mt-1 text-[12px] text-zinc-500">
            Pick a role from the list, or add a new one.
          </div>
        </Card>
      )}
    </div>
  );
}

function ListField({
  label,
  hint,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <FormRow label={label} hint={hint}>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-zinc-100 text-[10px] font-mono text-zinc-500 mt-0.5 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Textarea
              value={it}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              rows={2}
              placeholder={placeholder}
              className="min-h-[44px]"
            />
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-zinc-300 hover:text-rose-500 mt-2 shrink-0"
              aria-label="Remove item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, ""])}
          className="text-[12px] text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add another
        </button>
      </div>
    </FormRow>
  );
}

function toMarkdown(r: RoleMoc): string {
  const outcomes = r.outcomes.filter(Boolean).map((o, i) => `${i + 1}. ${o}`).join("\n");
  const must = r.mustHaves.filter(Boolean).map((m) => `- ${m}`).join("\n");
  const nice = r.niceToHaves.filter(Boolean).map((m) => `- ${m}`).join("\n");
  return `# ${r.title || "Untitled role"}
**Function:** ${r.function || "—"}  ·  **Hiring manager:** ${r.hiringManager || "—"}  ·  **Status:** ${r.status}

## Mission
${r.mission || "_Define the 12–18 month mission._"}

## Outcomes
${outcomes || "_Add 3–5 measurable outcomes._"}

## Must-have competencies
${must || "_What capabilities are required to deliver the outcomes?_"}

## Nice-to-have competencies
${nice || "_Tiebreakers only._"}

---
_Generated by Chief of Staff OS · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}_
`;
}
