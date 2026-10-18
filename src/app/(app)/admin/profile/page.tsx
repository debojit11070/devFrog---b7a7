import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountForm } from "@/components/profile/profile-forms";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "My profile",
};

export default async function AdminProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My profile" description="Update how your name and details appear across the platform." />
      <div className="max-w-3xl">
        <AccountForm user={user} />
      </div>
    </div>
  );
}
