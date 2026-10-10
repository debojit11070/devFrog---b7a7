import type { Metadata } from "next";
import { CompanyOverview } from "@/components/company/company-overview";

export const metadata: Metadata = {
  title: "Company overview",
};

export default function CompanyPage() {
  return <CompanyOverview />;
}
