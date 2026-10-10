import type { Metadata } from "next";
import { PaymentReturn } from "@/components/payments/payment-return";

export const metadata: Metadata = {
  title: "Payment cancelled",
};

export default async function PaymentCancelPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  return (
    <div className="px-4 py-12 sm:px-6">
      <PaymentReturn kind="cancel" sessionId={session_id} />
    </div>
  );
}
