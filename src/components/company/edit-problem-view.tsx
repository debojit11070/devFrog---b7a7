"use client";

import { ProblemForm } from "@/components/company/problem-form";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useProblem } from "@/hooks/api/problems";

/** Loads the question first, then mounts the form so its defaults are populated. */
export function EditProblemView({ id }: { id: string }) {
  const query = useProblem(id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit question" description="Changes apply to future assessments. Existing attempts keep the version they were taken with." />
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} title="This question couldn't be loaded" />
      ) : query.isPending ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading question">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        <ProblemForm problem={query.data} />
      )}
    </div>
  );
}
