import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Scale, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "Why DevForge exists, how it evaluates candidates fairly, and who it is built for.",
};

const VALUES = [
  {
    icon: Target,
    title: "Measure the work",
    body: "Assessments use the same kinds of tasks engineers do: writing code against test cases, explaining concepts and answering targeted questions.",
  },
  {
    icon: Scale,
    title: "Fair by design",
    body: "Every candidate gets the same questions, the same time limit and the same scoring rules. Manual reviews carry written feedback.",
  },
  {
    icon: Eye,
    title: "Transparent to everyone",
    body: "Candidates see their invitation status and payment history. Admins see an audit trail of sensitive changes.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">About DevForge</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Assessments that reflect real engineering work.</h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Resumes and short interviews miss a lot. DevForge gives hiring teams a structured way to see how candidates reason
          about problems, write code and explain their thinking, and it gives candidates a fair, transparent process.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {VALUES.map((value) => (
          <Card key={value.title} className="p-6 transition hover:-translate-y-1 hover:shadow-raised">
            <span className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-indigo-100 text-primary">
              <value.icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-5 text-lg font-semibold">{value.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{value.body}</p>
          </Card>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">See it from both sides</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with a demo account to explore the company and candidate workflows.</p>
        </div>
        <Button asChild>
          <Link href="/login">Open demo login</Link>
        </Button>
      </div>
    </div>
  );
}
