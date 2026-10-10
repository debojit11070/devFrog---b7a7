import type { Metadata } from "next";
import { Suspense } from "react";
import { ProblemsTable } from "@/components/company/problems-table";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Question bank",
};

export default function ProblemsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <ProblemsTable />
    </Suspense>
  );
}
