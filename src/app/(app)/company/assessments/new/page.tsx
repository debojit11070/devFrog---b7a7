import type { Metadata } from "next";
import { AssessmentWizard } from "@/components/company/assessment-wizard";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "New assessment",
};

export default function NewAssessmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New assessment" description="Set the basics, pick questions from your bank, then save a draft or publish." />
      <AssessmentWizard />
    </div>
  );
}
