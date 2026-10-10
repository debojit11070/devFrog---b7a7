import type { Metadata } from "next";
import { EditProblemView } from "@/components/company/edit-problem-view";

export const metadata: Metadata = {
  title: "Edit question",
};

export default async function EditProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProblemView id={id} />;
}
