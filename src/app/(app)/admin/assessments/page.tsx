import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAssessments } from "@/components/admin/admin-assessments";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Assessments",
};

export default function AdminAssessmentsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <AdminAssessments />
    </Suspense>
  );
}
