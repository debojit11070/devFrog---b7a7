import type { Metadata } from "next";
import { Suspense } from "react";
import { AssessmentsTable } from "@/components/company/assessments-table";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Assessments",
};

export default function CompanyAssessmentsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <AssessmentsTable />
    </Suspense>
  );
}
