import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Building2, CreditCard, Shield, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Services",
  description: "What DevForge offers companies, candidates and platform administrators.",
};

const AUDIENCES = [
  {
    icon: Building2,
    title: "For companies",
    href: "/register",
    points: [
      "Build assessments from a shared question bank: MCQ, written and coding",
      "Set duration, passing score and optional price per assessment",
      "Invite candidates with an expiry and track each attempt",
      "Evaluate open-ended answers with per-question scores and feedback",
    ],
  },
  {
    icon: UserRound,
    title: "For candidates",
    href: "/register",
    points: [
      "Accept or decline invitations from one dashboard",
      "Take assessments in a timed workspace with auto-saved answers",
      "Pay for premium assessments through Stripe Checkout",
      "Track invitations, attempts and payment history",
    ],
  },
  {
    icon: Shield,
    title: "For administrators",
    href: "/login",
    points: [
      "Overview of users, assessments, attempts and revenue",
      "Manage roles and account status, with soft-delete for safety",
      "Searchable audit trail of sensitive platform actions",
      "Role-scoped access enforced on every route and API call",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Services</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">One platform for every side of the assessment.</h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Each role gets a focused workspace. The same data flows between them, so nothing is re-entered or lost.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {AUDIENCES.map((audience) => (
          <Card key={audience.title} className="flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-raised">
            <span className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-indigo-100 text-primary">
              <audience.icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-5 text-lg font-semibold">{audience.title}</h2>
            <ul className="mt-4 flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
              {audience.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-6" asChild>
              <Link href={audience.href}>Get started</Link>
            </Button>
          </Card>
        ))}
      </div>

      <Card className="mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-success">
          <CreditCard className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 className="font-semibold">Secure payments</h2>
          <p className="text-sm text-muted-foreground">Premium assessments are paid through Stripe Checkout. Card details never touch DevForge servers.</p>
        </div>
        <BarChart3 className="hidden size-8 text-muted-foreground/40 sm:block" aria-hidden />
      </Card>
    </div>
  );
}
