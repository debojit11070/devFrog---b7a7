import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardCheck,
  ClipboardList,
  Code2,
  CreditCard,
  Layers,
  ShieldCheck,
  Timer,
  UserRound,
} from "lucide-react";
import { AssessmentCard } from "@/components/marketing/assessment-card";
import { HeroSlider } from "@/components/marketing/hero-slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/states";
import { POSTS } from "@/lib/blog";
import { FAQS } from "@/lib/faq";
import type { Assessment, Paginated } from "@/lib/api/types";
import { backendJson } from "@/lib/server/backend";
import { formatDate, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Developer assessments that show real skill",
  description:
    "DevForge helps companies run structured coding, written and multiple-choice assessments, and helps candidates prove what they can do.",
  openGraph: {
    title: "DevForge | Developer assessments that show real skill",
    description: "Structured coding, written and MCQ assessments for hiring teams and candidates.",
  },
};

const STEPS = [
  { icon: Building2, title: "Build", body: "Companies assemble assessments from a shared question bank, set timing, passing score and price." },
  { icon: UserRound, title: "Invite", body: "Candidates receive an invitation with an expiry. They accept or decline from their dashboard." },
  { icon: Timer, title: "Take", body: "A timed workspace saves every answer. MCQs are scored instantly on submit." },
  { icon: ClipboardCheck, title: "Evaluate", body: "Reviewers score coding and written answers, and every attempt ends with a clear pass or fail." },
];

const FEATURES = [
  { icon: Code2, title: "Coding challenges", body: "Starter code, test cases and per-language support for hands-on problems." },
  { icon: Layers, title: "Mixed question types", body: "MCQ, written and coding questions combined in a single attempt." },
  { icon: CreditCard, title: "Paid assessments", body: "Stripe Checkout for premium tests, with a full payment history." },
  { icon: BarChart3, title: "Clear reporting", body: "Scores, pass rates and revenue at a glance on every dashboard." },
  { icon: ShieldCheck, title: "Role-based access", body: "Admins, companies and candidates each see only what they need." },
  { icon: Timer, title: "Timed and saved", body: "A countdown timer with answers saved as the candidate goes." },
];

const COLLECTIONS = [
  { icon: Timer, key: "short", title: "Quick checks", body: "30 minutes or less. Good for a first screen.", href: "/assessments?duration=short" },
  { icon: ClipboardList, key: "medium", title: "Standard assessments", body: "31 to 60 minutes with a balanced mix of questions.", href: "/assessments?duration=medium" },
  { icon: Layers, key: "long", title: "Deep dives", body: "Over an hour for thorough, senior-level evaluation.", href: "/assessments?duration=long" },
] as const;

export default async function HomePage() {
  let all: Assessment[] = [];
  let total = 0;
  let loadFailed = false;

  try {
    const data = await backendJson<Paginated<Assessment>>("/assessments?limit=100&sortBy=createdAt&order=desc");
    all = data.items;
    total = data.meta.total;
  } catch {
    loadFailed = true;
  }

  const featured = all.slice(0, 4);
  const freeCount = all.filter((item) => item.priceCents === 0).length;
  const questionCount = all.reduce((sum, item) => sum + (item.problemCount ?? item.problems.length), 0);
  const avgDuration = all.length ? Math.round(all.reduce((sum, item) => sum + item.durationMin, 0) / all.length) : 0;
  const inRange: Record<string, (m: number) => boolean> = { short: (m) => m <= 30, medium: (m) => m > 30 && m <= 60, long: (m) => m > 60 };
  const typeCounts = COLLECTIONS.map((collection) => ({
    ...collection,
    count: all.filter((item) => inRange[collection.key](item.durationMin)).length,
  }));

  const stats = [
    { label: "Published assessments", value: formatNumber(total) },
    { label: "Free to take", value: formatNumber(freeCount) },
    { label: "Questions available", value: formatNumber(questionCount) },
    { label: "Average time limit", value: avgDuration ? `${avgDuration} min` : "—" },
  ];

  return (
    <>
      {/* 1. Hero */}
      <HeroSlider />

      {/* 2. Live statistics */}
      <section id="stats" aria-label="Platform statistics" className="border-b border-border">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dd className="text-3xl font-semibold tabular-nums tracking-tight text-primary sm:text-4xl">
                {loadFailed ? "—" : stat.value}
              </dd>
              <dt className="mt-1 text-sm text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* 3. How it works */}
      <section aria-labelledby="how-heading" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading id="how-heading" title="How it works" body="Four steps from the first invitation to a final score." />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="group h-full p-6 transition hover:-translate-y-1 hover:shadow-raised">
                <div className="flex items-center justify-between">
                  <IconTile icon={step.icon} />
                  <span className="text-sm font-medium text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Features */}
      <section aria-labelledby="features-heading" className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading id="features-heading" title="Everything an assessment needs" body="One platform for building, taking, paying for and reviewing developer tests." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="flex gap-4 p-6 transition hover:-translate-y-1 hover:shadow-raised">
                <IconTile icon={feature.icon} />
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Latest assessments */}
      <section aria-labelledby="featured-heading" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            id="featured-heading"
            title="Latest assessments"
            body={!loadFailed && total > 0 ? `${formatNumber(total)} published assessments are open right now.` : undefined}
          />
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Question types / categories */}
      <section aria-labelledby="types-heading" className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading id="types-heading" title="Explore by length" body="Pick an assessment that fits the time you have." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {typeCounts.map((type) => (
              <Link key={type.key} href={type.href} className="group block">
                <Card className="h-full p-6 transition group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-raised">
                  <IconTile icon={type.icon} />
                  <h3 className="mt-5 font-semibold">{type.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{type.body}</p>
                  <p className="mt-4 text-sm font-medium text-primary">
                    {loadFailed ? "Browse" : `${formatNumber(type.count)} assessment${type.count === 1 ? "" : "s"}`}
                    <ArrowRight className="ml-1 inline size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Audiences */}
      <section aria-labelledby="audience-heading" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading id="audience-heading" title="Built for both sides of hiring" />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Card className="p-6">
            <IconTile icon={Building2} />
            <h3 className="mt-5 text-lg font-semibold">For companies</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <li>Manage a reusable question bank of coding, written and MCQ problems.</li>
              <li>Publish assessments with a time limit, pass mark and optional price.</li>
              <li>Invite candidates by email and review every attempt in one place.</li>
            </ul>
            <Button className="mt-6" asChild>
              <Link href="/register">Create a company account</Link>
            </Button>
          </Card>
          <Card className="p-6">
            <IconTile icon={UserRound} />
            <h3 className="mt-5 text-lg font-semibold">For candidates</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <li>See every invitation with its expiry and accept or decline it.</li>
              <li>Work in a timed workspace where each answer is saved as you go.</li>
              <li>Track your results and payments from one dashboard.</li>
            </ul>
            <Button className="mt-6" variant="outline" asChild>
              <Link href="/register">Create a candidate account</Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* 8. Pricing model */}
      <section aria-labelledby="pricing-heading" className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading id="pricing-heading" title="Free and paid assessments" body="Companies choose the price. You only pay for the assessments you take." />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Free assessments</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No payment step. Accept the invitation and start straight away.
                {loadFailed ? "" : ` ${formatNumber(freeCount)} are available now.`}
              </p>
              <Link href="/assessments?pricing=free" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Browse free assessments <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Premium assessments</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Pay once with Stripe Checkout before the attempt. Receipts and status stay in your payment history.
              </p>
              <Link href="/assessments?pricing=paid" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Browse premium assessments <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 9. Blog */}
      <section aria-labelledby="blog-heading" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading id="blog-heading" title="From the blog" body="Practical notes on running and taking developer assessments." />
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            All articles <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {POSTS.slice(0, 3).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <Card className="flex h-full flex-col p-6 transition group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-raised">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">{post.category}</p>
                <h3 className="mt-2 font-semibold leading-snug">{post.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="mt-auto pt-4 text-xs text-muted-foreground">
                  {formatDate(post.date)} · {post.readMinutes} min read
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. FAQ */}
      <section aria-labelledby="faq-heading" className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <SectionHeading id="faq-heading" title="Frequently asked questions" />
          <div className="mt-8 flex flex-col gap-3">
            {FAQS.slice(0, 5).map((faq) => (
              <details key={faq.question} className="group rounded-xl border border-border bg-card p-5 shadow-soft">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="text-primary transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            More answers in the{" "}
            <Link href="/help" className="font-medium text-primary hover:underline">
              help centre
            </Link>
            .
          </p>
        </div>
      </section>

      {/* 11. Call to action */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-indigo-700 px-6 py-10 text-primary-foreground shadow-glow sm:flex-row sm:items-center sm:px-10">
          <div className="bg-dot-grid absolute inset-0 opacity-20" aria-hidden />
          <div className="relative">
            <h2 className="text-2xl font-semibold">Ready to run your first assessment?</h2>
            <p className="mt-2 text-indigo-100">Create an account in under a minute, or explore with a one-click demo login.</p>
          </div>
          <Button size="lg" variant="secondary" className="relative" asChild>
            <Link href="/login">Try a demo account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ id, title, body }: { id: string; title: string; body?: string }) {
  return (
    <div>
      <h2 id={id} className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {body ? <p className="mt-2 max-w-2xl text-muted-foreground">{body}</p> : null}
    </div>
  );
}

function IconTile({ icon: Icon }: { icon: typeof Code2 }) {
  return (
    <span className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-accent text-primary">
      <Icon className="size-5" aria-hidden />
    </span>
  );
}
