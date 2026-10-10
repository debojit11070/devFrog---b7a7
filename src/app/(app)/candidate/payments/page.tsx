import type { Metadata } from "next";
import { PaymentsTable } from "@/components/candidate/payments-table";

export const metadata: Metadata = {
  title: "Payments",
};

export default function PaymentsPage() {
  return <PaymentsTable />;
}
