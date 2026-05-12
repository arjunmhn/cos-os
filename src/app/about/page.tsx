import Link from "next/link";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRINCIPLES } from "@/lib/content/principles";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Code2,
  Mail,
  MapPin,
  Sparkles,
  Wand2,
} from "lucide-react";

export const metadata = {
  title: "About — Chief of Staff OS",
  description:
    "Built by Arjun Mohan as a portfolio piece while interviewing for Chief of Staff roles.",
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border divider bg-white">
        <div className="absolute inset-0 opacity-[0.08] bg-gradient-brand" />
        <div className="relative px-7 py-9 sm:px-10 sm:py-12 max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-indigo-600">
            About
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 leading-[1.1]">
            Built by <span className="text-gradient-brand">Arjun Mohan</span> while interviewing for Chief
            of Staff roles.
          </h1>
          <p className="mt-4 text-[15px] text-zinc-600 leading-relaxed max-w-2xl">
            Chief of Staff OS is the operating system I&apos;d want on day one of a CoS role at an early-stage,
            VC-backed company. I built it as a portfolio piece — the bar I set was that a real CoS could
            clone it and use it, and that a founder reviewing it would see how I&apos;d actually operate.
          </p>
          <div className="mt-6 flex items-center gap-2 flex-wrap">
            <Badge tone="indigo" dot>
              Currently interviewing
            </Badge>
            <Badge tone="neutral">
              <MapPin className="h-3 w-3" /> Open to remote / SF / NYC / London
            </Badge>
          </div>
          <div className="mt-7 flex items-center gap-2 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-gradient-brand text-white text-sm font-medium shadow-elevated hover:opacity-95"
            >
              <Sparkles className="h-3.5 w-3.5" /> Try the OS
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-white text-zinc-900 border border-zinc-200 text-sm font-medium hover:border-zinc-300"
            >
              <Wand2 className="h-3.5 w-3.5" /> Adapt to your company
            </Link>
          </div>
        </div>
      </section>

      {/* WHY THIS EXISTS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <CardEyebrow>Why this exists</CardEyebrow>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
            A CoS portfolio piece you can actually run.
          </h2>
          <div className="mt-4 space-y-3 text-[14px] text-zinc-700 leading-relaxed">
            <p>
              Most Chief of Staff applications are read in 60 seconds. Founders are trying to figure out
              three things: <em>can this person think systematically</em>, <em>can they ship</em>, and
              <em> do they have a point of view I&apos;d want next to me on hard decisions</em>.
            </p>
            <p>
              A CV answers the first question imperfectly and the other two not at all. So I built the
              answer — a working operating system that encodes the way I&apos;d run a CoS function on day
              one. Eight modules, live AI chat, the artifacts I&apos;d build, the principles I&apos;d hold the
              line on.
            </p>
            <p>
              Paste your company&apos;s job description into{" "}
              <Link href="/profile" className="text-indigo-600 hover:underline">
                /profile &rarr; Adapt
              </Link>{" "}
              and the OS reframes itself around your business. Then ask{" "}
              <Link href="/chat" className="text-indigo-600 hover:underline">
                /chat
              </Link>{" "}
              what I&apos;d focus on in my first 90 days.
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-white to-indigo-50/40 border-indigo-100/60">
          <CardEyebrow className="text-indigo-700">Get in touch</CardEyebrow>
          <ul className="mt-3 space-y-2.5">
            <li>
              <a
                href="mailto:arjunmohan29@gmail.com"
                className="flex items-center gap-2.5 text-[13.5px] text-zinc-800 hover:text-indigo-700"
              >
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="break-all">arjunmohan29@gmail.com</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/arjun-mohan-cxo/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-[13.5px] text-zinc-800 hover:text-indigo-700"
              >
                <Briefcase className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>LinkedIn</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/dj-cxo/cos-os"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-[13.5px] text-zinc-800 hover:text-indigo-700"
              >
                <Code2 className="h-4 w-4 text-zinc-400 shrink-0" />
                <span>Source on GitHub</span>
              </a>
            </li>
          </ul>
          <div className="mt-5 pt-4 border-t divider">
            <p className="text-[11.5px] text-zinc-500 leading-relaxed">
              Best way to reach me: LinkedIn DM with a sentence on your company&apos;s current bet. I read
              everything.
            </p>
          </div>
        </Card>
      </section>

      {/* OPERATING SIGNATURE */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <CardEyebrow>Operating signature</CardEyebrow>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
              The principles this OS — and how I operate — is built on.
            </h2>
            <p className="mt-1.5 text-[13.5px] text-zinc-500 max-w-2xl">
              Each principle here is encoded somewhere in the OS as a template, dashboard, or default
              behavior. They aren&apos;t aspirations; they&apos;re the operating model.
            </p>
          </div>
          <Link
            href="/library"
            className="text-[12px] text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
          >
            All principles in Library <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRINCIPLES.slice(0, 6).map((p) => (
            <Card key={p.id} className="p-5">
              <Badge tone={p.tone}>{p.source.split(" — ")[0]}</Badge>
              <h3 className="mt-2.5 text-[14.5px] font-semibold tracking-tight text-zinc-900 leading-snug">
                {p.title}
              </h3>
              <p className="mt-1.5 text-[12.5px] text-zinc-600 leading-relaxed">{p.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* WHAT'S IN THE OS */}
      <section>
        <CardEyebrow className="mb-4">What you can do in here</CardEyebrow>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              icon: Wand2,
              title: "Adapt to your company",
              body: "Paste a JD or company name. The OS reframes itself — profile, OKRs, deals, decisions, roles, hires — around your business.",
              href: "/profile",
            },
            {
              icon: Sparkles,
              title: "Ask the OS",
              body: "Natural-language analyst over your OS state. Forward-looking recommendations, not just recaps. KPI tiles + charts where data benefits.",
              href: "/chat",
            },
            {
              icon: BookOpen,
              title: "30-Day Plan",
              body: "Generate a polished pre-read deliverable to attach to your applications — grounded in the company's actual OKRs and strategic moment.",
              href: "/plan",
            },
            {
              icon: Calendar,
              title: "Cadence + OKRs",
              body: "Quarter calendar, 5 meeting kits, OKR tracker, decision log. The rhythms that make the CEO never have to ask.",
              href: "/cadence",
            },
            {
              icon: Building2,
              title: "Board, People, GTM",
              body: "KPI dashboards, board pack outline, MOC role spec builder, 30/60/90 ramp, pipeline coverage, mid-quarter inspection.",
              href: "/board",
            },
            {
              icon: BookOpen,
              title: "Library",
              body: "Every principle, framework, archetype, and source this OS distills. The why behind every default.",
              href: "/library",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border divider bg-white p-5 hover:border-zinc-300 hover:shadow-card transition-all"
              >
                <div className="grid h-8 w-8 place-items-center rounded-md bg-zinc-100 text-zinc-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-3 text-[14px] font-semibold tracking-tight text-zinc-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] text-zinc-600 leading-relaxed">{item.body}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-indigo-600">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PROVENANCE */}
      <section>
        <Card className="p-6">
          <CardEyebrow>How this was built</CardEyebrow>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
            Honest disclosure
          </h2>
          <div className="mt-3 text-[13.5px] text-zinc-700 leading-relaxed space-y-2.5">
            <p>
              Built with Claude as a coding partner over a focused multi-week session. The system design,
              the principles, the voice, the modules, the artifacts each module produces, the decisions
              about what to build and what to leave out — those are mine.
            </p>
            <p>
              The implementation was AI-assisted. I&apos;m not pretending to have hand-typed 70+ files of
              Next.js. I am claiming that the *operating model* is mine. Designing the operating model is
              what a Chief of Staff is hired to do.
            </p>
            <p className="text-zinc-500">
              Source materials this OS distills:{" "}
              <a
                href="https://a16z.com/newsletter/how-to-hire-a-chief-of-staff/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline"
              >
                a16z — How to Hire a Chief of Staff
              </a>
              ;{" "}
              <a
                href="https://yourchiefofstaff.substack.com/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Elise Kennedy — Your Chief of Staff
              </a>
              ; the Ema and Product.ai CoS job descriptions; and my own &ldquo;4 Things I&apos;d Focus On&rdquo;
              pitch.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
