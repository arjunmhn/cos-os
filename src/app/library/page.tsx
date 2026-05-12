import { PageHeader } from "@/components/ui/page-header";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRINCIPLES, RULES_OF_THE_HOUSE } from "@/lib/content/principles";
import { ARCHETYPES } from "@/lib/content/archetypes";
import { MOC_FRAMEWORK, SCORECARD_TEMPLATE, RAMP_PLAN_30_60_90 } from "@/lib/content/moc";
import { BookOpen, ExternalLink, Quote, ScrollText, Users2 } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Library"
        title="The principles this OS is built on."
        description="The principles, frameworks, and source materials this OS encodes."
      />

      {/* Principles grid */}
      <section>
        <SectionTitle icon={Quote} eyebrow="Principles" title="Operating principles" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRINCIPLES.map((p) => (
            <Card key={p.id} className="p-6">
              <Badge tone={p.tone}>{p.source.split(" — ")[0]}</Badge>
              <h3 className="mt-3 text-base font-semibold tracking-tight text-zinc-900 leading-snug">
                {p.title}
              </h3>
              <p className="mt-2 text-[13px] text-zinc-600 leading-relaxed">{p.body}</p>
              <div className="mt-4 pt-3 border-t divider text-[11px] text-zinc-400">
                {p.source}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Rules of the House */}
      <section>
        <SectionTitle icon={ScrollText} eyebrow="Non-negotiables" title="Rules of the house" />
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divider">
            {RULES_OF_THE_HOUSE.map((r, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0" />
                <span className="text-[13.5px] text-zinc-800 leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* CoS Archetypes */}
      <section>
        <SectionTitle
          icon={Users2}
          eyebrow="Stage-aware"
          title="Three Chief of Staff archetypes"
          description="The shape of the role depends on stage. This OS leans into the Strategic CoS archetype."
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {ARCHETYPES.map((a, i) => (
            <Card
              key={a.id}
              className={`p-6 ${i === 1 ? "ring-1 ring-indigo-200 shadow-elevated" : ""}`}
            >
              <div className="flex items-center justify-between">
                <Badge tone={i === 1 ? "indigo" : "neutral"}>{a.stage}</Badge>
                {i === 1 && <Badge tone="indigo" dot>This OS</Badge>}
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900">{a.title}</h3>
              <p className="mt-1 text-[13px] text-zinc-500 leading-relaxed">{a.tagline}</p>
              <div className="mt-4 text-[10.5px] uppercase tracking-[0.12em] text-zinc-400 font-semibold">
                Team {a.teamRange}
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-emerald-700 mb-1.5">
                    Owns primarily
                  </div>
                  <ul className="space-y-1">
                    {a.ownsPrimarily.map((o, j) => (
                      <li key={j} className="text-[12.5px] text-zinc-700 flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.1em] font-semibold text-rose-700 mb-1.5">
                    Does not own
                  </div>
                  <ul className="space-y-1">
                    {a.doesNotOwn.map((o, j) => (
                      <li key={j} className="text-[12.5px] text-zinc-600 flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-rose-400 shrink-0" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t divider">
                <div className="text-[11px] text-zinc-500 leading-relaxed italic">
                  {a.example}
                </div>
                <div className="mt-2 text-[10.5px] text-zinc-400">{a.signal}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* MOC Framework */}
      <section>
        <SectionTitle
          icon={BookOpen}
          eyebrow="Hiring framework"
          title={MOC_FRAMEWORK.title}
          description={MOC_FRAMEWORK.why}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {MOC_FRAMEWORK.sections.map((s) => (
            <Card key={s.label} className="p-6">
              <CardEyebrow>{s.label}</CardEyebrow>
              <p className="mt-3 text-[13px] text-zinc-700 leading-relaxed">{s.prompt}</p>
              <div className="mt-4 rounded-lg bg-zinc-50 border divider p-3.5">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-zinc-500 mb-1.5">
                  Example
                </div>
                <div className="text-[12px] text-zinc-700 leading-relaxed whitespace-pre-line">
                  {s.example}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Scorecard + Ramp Plan */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <CardEyebrow>{SCORECARD_TEMPLATE.title}</CardEyebrow>
          <p className="mt-2 text-[12.5px] text-zinc-500 leading-relaxed">
            {SCORECARD_TEMPLATE.source}
          </p>
          <div className="mt-4 grid grid-cols-5 gap-1">
            {SCORECARD_TEMPLATE.scoreScale.map((s) => (
              <div
                key={s.score}
                className="rounded-md bg-zinc-50 border divider px-2 py-2 text-center"
              >
                <div className="text-[15px] font-semibold text-zinc-900">{s.score}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
          <ul className="mt-5 space-y-2">
            {SCORECARD_TEMPLATE.rubricItems.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] text-zinc-700">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-zinc-400 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <CardEyebrow>30 / 60 / 90 ramp plan</CardEyebrow>
          <p className="mt-2 text-[12.5px] text-zinc-500 leading-relaxed">
            Day-90 review must be written. Verbal-only feedback compounds hiring mistakes silently.
          </p>
          <div className="mt-4 space-y-3">
            {RAMP_PLAN_30_60_90.map((r) => (
              <div key={r.window} className="rounded-lg border divider p-3.5">
                <div className="flex items-baseline justify-between">
                  <div className="text-[13px] font-semibold text-zinc-900">{r.window}</div>
                  <div className="text-[11px] text-zinc-500">{r.purpose}</div>
                </div>
                <ul className="mt-2 space-y-1">
                  {r.expectations.map((e, i) => (
                    <li key={i} className="text-[12px] text-zinc-700 flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-zinc-400 shrink-0" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-[11px] text-rose-700/80">⚠ {r.danger}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Sources */}
      <section>
        <SectionTitle icon={ExternalLink} eyebrow="Provenance" title="Where these ideas come from" />
        <Card className="p-6">
          <ul className="space-y-3 text-[13px] leading-relaxed">
            <li>
              <a
                href="https://a16z.com/newsletter/how-to-hire-a-chief-of-staff/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-zinc-900 hover:underline"
              >
                a16z — How to Hire a Chief of Staff
              </a>
              <div className="text-zinc-500">
                Source for the MOC framework, the three-stage orientation model, and the archetype taxonomy.
              </div>
            </li>
            <li>
              <a
                href="https://yourchiefofstaff.substack.com/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-zinc-900 hover:underline"
              >
                Elise Kennedy — Your Chief of Staff (Substack)
              </a>
              <div className="text-zinc-500">
                Source for the AI-strategy framework and the &ldquo;let computers do computer things&rdquo; rule.
              </div>
            </li>
            <li>
              <span className="font-semibold text-zinc-900">Ema Chief of Staff JD</span>
              <div className="text-zinc-500">
                Source for the Strategic CoS archetype — board prep, GTM accountability, IR backbone, M&amp;A scaffolding.
              </div>
            </li>
            <li>
              <span className="font-semibold text-zinc-900">Product.ai Chief of Staff JD</span>
              <div className="text-zinc-500">
                Source for the Builder-Orchestrator archetype — internal tooling, automation-first, recruiting ops, vendor substrate.
              </div>
            </li>
            <li>
              <span className="font-semibold text-zinc-900">Arjun Mohan — 4 Things I&apos;d Focus On @ Valerie</span>
              <div className="text-zinc-500">
                Source for the operating signature this OS demonstrates: leading-indicator cadence, repeatable Sales artifacts, capacity modeling, codified hiring.
              </div>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded-md bg-indigo-50 text-indigo-600">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-indigo-600">
          {eyebrow}
        </div>
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-[14px] text-zinc-500 max-w-3xl leading-relaxed">{description}</p>
      )}
    </div>
  );
}
