import type { Metadata } from "next";
import { AttemptRunner } from "@/components/candidate/attempt-runner";

export const metadata: Metadata = {
  title: "Take assessment",
};

export default async function AttemptPage({ params }: { params: Promise<{ invitationId: string }> }) {
  const { invitationId } = await params;
  return <AttemptRunner invitationId={invitationId} />;
}
