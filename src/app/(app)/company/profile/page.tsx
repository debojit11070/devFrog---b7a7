import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountForm, CompanyProfileForm } from "@/components/profile/profile-forms";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Company profile",
};

export default async function CompanyProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Company profile" description="Your company's public details and your personal account settings." />
      <div className="grid gap-6 xl:grid-cols-2">
        <AccountForm user={user} />
        <CompanyProfileForm profile={user.companyProfile} />
      </div>
    </div>
  );
}
