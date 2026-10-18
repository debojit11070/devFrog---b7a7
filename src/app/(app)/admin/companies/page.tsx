import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminCompanies } from "@/components/admin/admin-companies";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Companies",
};

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <AdminCompanies />
    </Suspense>
  );
}
