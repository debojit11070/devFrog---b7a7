import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountForm, CandidateProfileForm } from "@/components/profile/profile-forms";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "My profile",
};

export default async function CandidateProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My profile" description="Keep your details current. Companies see this when reviewing your attempts." />
      <div className="grid gap-6 xl:grid-cols-2">
        <AccountForm user={user} />
        <CandidateProfileForm profile={user.candidateProfile} />
      </div>
    </div>
  );
}
