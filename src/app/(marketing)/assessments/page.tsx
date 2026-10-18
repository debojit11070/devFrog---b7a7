import type { Metadata } from "next";
import { Suspense } from "react";
import { AssessmentCatalog } from "@/components/marketing/assessment-catalog";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Browse assessments",
  description: "Explore published developer assessments: coding, written and MCQ tests with clear timing and passing scores.",
  openGraph: {
    title: "Browse developer assessments | DevForge",
    description: "Find a structured developer assessment and see its timing, price and passing score.",
  },
};

export default function AssessmentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Assessments</h1>
        <p className="mt-2 text-muted-foreground">Published tests from companies on DevForge. Sign in to accept an invitation and take one.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <AssessmentCatalog />
      </Suspense>
    </div>
  );
}
