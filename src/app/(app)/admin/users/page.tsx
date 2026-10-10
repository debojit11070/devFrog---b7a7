import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminUsers } from "@/components/admin/admin-users";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Manage users",
};

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <AdminUsers />
    </Suspense>
  );
}
