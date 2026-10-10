"use client";

import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useInitiatePayment } from "@/hooks/api/invitations-payments";
import { formatCurrency } from "@/lib/utils";

/**
 * Starts a Stripe Checkout session for an assessment and redirects to Stripe.
 * When the API runs without Stripe keys it simulates the payment, so the
 * success page is reached directly.
 */
export function PayButton({
  assessmentId,
  priceCents,
  currency,
  size = "default",
  variant = "default",
}: {
  assessmentId: string;
  priceCents: number;
  currency: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}) {
  const router = useRouter();
  const initiate = useInitiatePayment();

  async function pay() {
    try {
      const result = await initiate.mutateAsync(assessmentId);
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      if (result.payment) {
        toast.success("Payment simulated for local testing");
        router.push(`/payment/success?payment_id=${result.payment.id}`);
        return;
      }
      toast.error("The payment provider did not return a checkout link. Please try again.");
    } catch {
      // The global mutation handler has already shown the error.
    }
  }

  return (
    <Button onClick={pay} loading={initiate.isPending} size={size} variant={variant}>
      <CreditCard aria-hidden />
      Pay {formatCurrency(priceCents, currency)}
    </Button>
  );
}
