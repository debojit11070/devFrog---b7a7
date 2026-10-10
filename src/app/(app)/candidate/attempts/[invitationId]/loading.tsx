import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading assessment">
      <Skeleton className="h-10 w-2/3" />
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}
