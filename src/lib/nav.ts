import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  CalendarClock,
  Database,
  LayoutDashboard,
  MessagesSquare,
  Presentation,
  Target,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "Daily" | "Modules" | "System";
};

export const NAV: NavItem[] = [
  {
    href: "/",
    label: "Command Center",
    description: "Today, this week, what to look at first",
    icon: LayoutDashboard,
    group: "Daily",
  },
  {
    href: "/chat",
    label: "Ask the OS",
    description: "Query your state, get forward-looking advice",
    icon: MessagesSquare,
    group: "Daily",
  },
  {
    href: "/cadence",
    label: "Cadence & OKRs",
    description: "Weekly / monthly / quarterly rhythms",
    icon: CalendarClock,
    group: "Modules",
  },
  {
    href: "/board",
    label: "Board & IR",
    description: "Board prep, investor updates, KPIs",
    icon: Presentation,
    group: "Modules",
  },
  {
    href: "/people",
    label: "People & Hiring",
    description: "Roles, scorecards, 30/60/90 ramp",
    icon: Users,
    group: "Modules",
  },
  {
    href: "/gtm",
    label: "GTM & Sales Ops",
    description: "Pipeline reviews, velocity, intel",
    icon: Target,
    group: "Modules",
  },
  {
    href: "/library",
    label: "Library",
    description: "The principles this OS is built on",
    icon: BookOpen,
    group: "System",
  },
  {
    href: "/import",
    label: "Import data",
    description: "CSV import for any module",
    icon: Database,
    group: "System",
  },
  {
    href: "/profile",
    label: "Company Profile",
    description: "Your company's settings",
    icon: Building2,
    group: "System",
  },
];

export const NAV_GROUPS = ["Daily", "Modules", "System"] as const;
