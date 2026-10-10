import type { Metadata } from "next";
import { CandidateOverview } from "@/components/candidate/candidate-overview";

export const metadata: Metadata = {
  title: "Candidate overview",
};

export default function CandidatePage() {
  return <CandidateOverview />;
}
