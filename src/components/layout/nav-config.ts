import { Building2, Briefcase, ClipboardList, Settings, CreditCard, Code2, LayoutDashboard, Mail, ScrollText, UserRound, Users, type LucideIcon } from "lucide-react";
import type { Role } from "@/lib/api/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path, so the overview link is not active on every sub-page. */
  exact?: boolean;
}

/**
 * The only place that decides what each role can see in navigation.
 * Routes are still protected by proxy.ts; this controls what is shown.
 */
export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/companies", label: "Companies", icon: Briefcase },
    { href: "/admin/assessments", label: "Assessments", icon: ClipboardList },
    { href: "/admin/audit", label: "Audit logs", icon: ScrollText },
    { href: "/admin/profile", label: "My profile", icon: UserRound },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
  COMPANY: [
    { href: "/company", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/company/assessments", label: "Assessments", icon: ClipboardList },
    { href: "/company/problems", label: "Question bank", icon: Code2 },
    { href: "/company/profile", label: "Company profile", icon: Building2 },
  ],
  CANDIDATE: [
    { href: "/candidate", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/candidate/invitations", label: "Invitations", icon: Mail },
    { href: "/candidate/payments", label: "Payments", icon: CreditCard },
    { href: "/candidate/profile", label: "My profile", icon: UserRound },
  ],
};
