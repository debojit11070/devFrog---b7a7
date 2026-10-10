import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16" aria-busy="true" aria-label="Loading assessments">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 w-full sm:max-w-xs" />
        <Skeleton className="h-10 w-full sm:ml-auto sm:w-44" />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
