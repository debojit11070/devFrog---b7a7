import type { Metadata } from "next";
import { AppearanceSettings } from "@/components/admin/appearance-settings";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Settings",
};

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Personal preferences for this device." />
      <div className="max-w-3xl">
        <AppearanceSettings />
      </div>
    </div>
  );
}
