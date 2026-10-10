import type { Metadata } from "next";
import { PaymentReturn } from "@/components/payments/payment-return";

export const metadata: Metadata = {
  title: "Payment successful",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; payment_id?: string }>;
}) {
  const { session_id, payment_id } = await searchParams;
  return (
    <div className="px-4 py-12 sm:px-6">
      <PaymentReturn kind="success" sessionId={session_id} paymentId={payment_id} />
    </div>
  );
}
