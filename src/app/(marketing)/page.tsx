import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Building2, ClipboardCheck, Code2, CreditCard, ShieldCheck, Timer, UserRound } from "lucide-react";
import { AssessmentCard } from "@/components/marketing/assessment-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/states";
import type { Assessment, Paginated } from "@/lib/api/types";
import { backendJson } from "@/lib/server/backend";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Developer assessments that show real skill",
  description:
    "DevForge helps companies run structured coding, written and multiple-choice assessments, and helps candidates prove what they can do.",
  openGraph: {
    title: "DevForge | Developer assessments that show real skill",
    description: "Structured coding, written and MCQ assessments for hiring teams and candidates.",
  },
};

// The featured list is public data, so it can be cached for a minute.
export const revalidate = 60;

const STEPS = [
  { icon: Building2, title: "Build", body: "Companies assemble assessments from a shared question bank, set timing, passing score and price." },
  { icon: UserRound, title: "Invite", body: "Candidates receive an invitation with an expiry. They accept or decline from their dashboard." },
  { icon: Timer, title: "Take", body: "A timed workspace auto-saves every answer. MCQs are scored instantly on submit." },
  { icon: ClipboardCheck, title: "Evaluate", body: "Reviewers score coding and written answers, and every attempt ends with a clear pass or fail." },
];

export default async function HomePage() {
  let featured: Assessment[] = [];
  let total = 0;
  let loadFailed = false;

  try {
    const data = await backendJson<Paginated<Assessment>>("/assessments?limit=3&sortBy=createdAt&order=desc");
    featured = data.items;
    total = data.meta.total;
  } catch {
    loadFailed = true;
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 -z-0 bg-mesh" aria-hidden />
        <div className="absolute inset-0 -z-0 bg-dot-grid opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="animate-in-up">
            <p className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success" aria-hidden />
              Payments via Stripe test mode
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              <span className="text-gradient-brand">Hire on evidence,</span> not guesswork.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              DevForge runs structured developer assessments end to end. Companies publish coding, written and MCQ tests.
              Candidates take them in a timed workspace, and every attempt is scored.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get started free
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/assessments">Browse assessments</Link>
              </Button>
            </div>
          </div>

          <Card className="animate-in-up p-6 shadow-raised" style={{ animationDelay: "80ms" }}>
            <ul className="flex flex-col gap-4">
              {[
                { icon: Code2, label: "Coding challenges", text: "Test cases, starter code and per-language support." },
                { icon: ClipboardCheck, label: "Mixed question types", text: "MCQ, written and coding questions in one attempt." },
                { icon: CreditCard, label: "Paid assessments", text: "Stripe Checkout for premium tests, with a payment history." },
                { icon: BarChart3, label: "Clear reporting", text: "Scores, pass rates and revenue at a glance for admins." },
              ].map((feature) => (
                <li key={feature.label} className="group flex gap-4 rounded-lg p-1.5 transition-colors hover:bg-muted/60">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-indigo-100 text-primary transition-transform group-hover:scale-105">
                    <feature.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium">{feature.label}</p>
                    <p className="text-sm text-muted-foreground">{feature.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="how-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">Four steps from the first invitation to a final score.</p>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="animate-in-up group rounded-xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-raised"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-muted-foreground">0{index + 1}</span>
              </div>
              <h3 className="mt-5 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="featured-heading" className="border-t border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="featured-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Latest assessments</h2>
              {!loadFailed && total > 0 ? (
                <p className="mt-1 text-muted-foreground">{formatNumber(total)} published assessments are open right now.</p>
              ) : null}
            </div>
            <Link href="/assessments" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-8">
            {loadFailed ? (
              <EmptyState
                icon={Code2}
                title="Assessments are unavailable right now"
                description="We couldn't reach the assessment service. Please check back shortly."
              />
            ) : featured.length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title="No published assessments yet"
                description="Once a company publishes an assessment, it will appear here."
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((assessment, index) => (
                  <div key={assessment.id} className="animate-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                    <AssessmentCard assessment={assessment} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-indigo-700 px-6 py-10 text-primary-foreground shadow-glow sm:flex-row sm:items-center sm:px-10">
          <div className="absolute inset-0 bg-dot-grid opacity-20" aria-hidden />
          <div className="relative">
            <h2 className="text-2xl font-semibold">Ready to run your first assessment?</h2>
            <p className="mt-2 text-indigo-100">Create an account in under a minute and start with a demo login if you just want to explore.</p>
          </div>
          <Button size="lg" variant="secondary" className="relative" asChild>
            <Link href="/login">Try a demo account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
