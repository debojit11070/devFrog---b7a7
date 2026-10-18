import { AssessmentCardSkeleton } from "@/components/marketing/assessment-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16" aria-busy="true" aria-label="Loading assessments">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <Skeleton className="mt-8 h-36 w-full rounded-xl" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <AssessmentCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
