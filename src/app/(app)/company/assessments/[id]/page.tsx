import type { Metadata } from "next";
import { AssessmentDetail } from "@/components/company/assessment-detail";

export const metadata: Metadata = {
  title: "Assessment details",
};

export default async function CompanyAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssessmentDetail id={id} />;
}
