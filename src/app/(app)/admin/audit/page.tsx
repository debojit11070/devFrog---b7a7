import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Audit logs",
};

export default function AuditPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <AuditLogTable />
    </Suspense>
  );
}
