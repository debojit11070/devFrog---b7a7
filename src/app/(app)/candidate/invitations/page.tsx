import type { Metadata } from "next";
import { Suspense } from "react";
import { InvitationsList } from "@/components/candidate/invitations-list";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Invitations",
};

export default function InvitationsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <InvitationsList />
    </Suspense>
  );
}
