import type { Metadata } from "next";
import { ProblemForm } from "@/components/company/problem-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "New question",
};

export default function NewProblemPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New question" description="Add a coding, multiple-choice or written question to your bank." />
      <ProblemForm />
    </div>
  );
}
