import { ContentSkeleton } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading users">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-10 w-full max-w-xs" />
      <ContentSkeleton rows={6} />
    </div>
  );
}
