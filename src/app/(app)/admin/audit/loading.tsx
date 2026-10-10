import { ContentSkeleton } from "@/components/shared/states";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading audit logs">
      <Skeleton className="h-10 w-56" />
      <ContentSkeleton rows={8} />
    </div>
  );
}
