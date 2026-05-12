import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarClock,
  Code2,
  Database,
  FileText,
  LayoutDashboard,
  Mail,
  MessagesSquare,
  Presentation,
  Target,
  Users,
  Wand2,
} from "lucide-react";

export const metadata = {
  title: "About — Chief of Staff OS",
  description: "Built by Arjun Mohan while interviewing for Chief of Staff roles.",
};

const MODULES = [
  { href: "/", label: "Command Center", body: "Today's risks, KPIs, upcoming cadence.", icon: LayoutDashboard },
  { href: "/chat", label: "Ask the OS", body: "Natural-language analyst over your state.", icon: MessagesSquare },
  { href: "/plan", label: "30-Day Plan", body: "A deliverable to attach to your applications.", icon: FileText },
  { href: "/cadence", label: "Cadence & OKRs", body: "Quarter calendar, meeting kits, OKRs, decisions.", icon: CalendarClock },
  { href: "/board", label: "Board & IR", body: "KPI charts, board pack, investor update.", icon: Presentation },
  { href: "/people", label: "People & Hiring", body: "MOC builder, pipeline kanban, Day-90 review.", icon: Users },
  { href: "/gtm", label: "GTM & Sales Ops", body: "Pipeline coverage, retrostudy, velocity.", icon: Target },
  { href: "/library", label: "Library", body: "Principles and frameworks this OS encodes.", icon: BookOpen },
  { href: "/import", label: "Import", body: "CSV import for any module.", icon: Database },
  { href: "/profile", label: "Company Profile", body: "Adapt to your company in 45 seconds.", icon: Building2 },
];

export default function AboutPage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <section>
        <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-indigo-600">About</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 leading-[1.1]">
          Built by <span className="text-gradient-brand">Arjun Mohan</span> while interviewing for Chief of Staff roles.
        </h1>
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <Badge tone="indigo" dot>Currently interviewing</Badge>
        </div>
      </section>

      {/* HOW TO USE */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-zinc-500">Try it in 60 seconds</h2>
        <ol className="mt-3 space-y-2.5">
          <li className="flex items-start gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-900 text-white text-[11px] font-semibold shrink-0">1</span>
            <span className="text-[14px] text-zinc-800 leading-relaxed">
              Open{" "}
              <Link href="/profile" className="text-indigo-600 hover:underline font-medium">
                Company Profile
              </Link>
              , paste a job description (or just a company name), hit <span className="font-semibold">Adapt</span>. Wait ~45s.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-900 text-white text-[11px] font-semibold shrink-0">2</span>
            <span className="text-[14px] text-zinc-800 leading-relaxed">
              Open{" "}
              <Link href="/chat" className="text-indigo-600 hover:underline font-medium">
                Ask the OS
              </Link>{" "}
              and try <em>&ldquo;What would I focus on in my first 90 days here?&rdquo;</em>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-900 text-white text-[11px] font-semibold shrink-0">3</span>
            <span className="text-[14px] text-zinc-800 leading-relaxed">
              Generate a deliverable at{" "}
              <Link href="/plan" className="text-indigo-600 hover:underline font-medium">
                30-Day Plan
              </Link>
              . Copy or download as PDF.
            </span>
          </li>
        </ol>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-gradient-brand text-white text-sm font-medium shadow-elevated hover:opacity-95"
          >
            <Wand2 className="h-3.5 w-3.5" /> Open the OS
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* MODULES */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-zinc-500 mb-3">What&apos;s inside</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="group rounded-xl border divider bg-white p-4 hover:border-zinc-300 hover:shadow-card transition-all"
              >
                <div className="flex items-start gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-md bg-zinc-100 text-zinc-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold tracking-tight text-zinc-900">
                      {m.label}
                    </div>
                    <div className="mt-0.5 text-[12px] text-zinc-500 leading-relaxed">{m.body}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CONTACT */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.14em] font-semibold text-zinc-500 mb-3">Get in touch</h2>
        <Card className="p-5">
          <ul className="space-y-2.5">
            <li>
              <a
                href="mailto:arjun_mohan@live.com"
                className="flex items-center gap-2.5 text-[13.5px] text-zinc-800 hover:text-indigo-700"
              >
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="break-all">arjun_mohan@live.com</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/arjun-mohan/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-[13.5px] text-zinc-800 hover:text-indigo-700"
              >
                <Briefcase className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>linkedin.com/in/arjun-mohan</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/arjunmhn"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-[13.5px] text-zinc-800 hover:text-indigo-700"
              >
                <Code2 className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>github.com/arjunmhn</span>
              </a>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
