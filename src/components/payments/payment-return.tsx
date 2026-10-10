"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api/client";
import type { Payment, PaymentActionResult } from "@/lib/api/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type ReturnKind = "success" | "cancel";

/** The API returns either { payment } or the payment itself, depending on the path. */
function unwrapPayment(result: PaymentActionResult | Payment): Payment | null {
  if ("payment" in result) return result.payment ?? null;
  return result as Payment;
}

/**
 * Shows the result of a Stripe return. The status comes from the API, which
 * reads the session from Stripe, so the page never trusts query parameters alone.
 */
export function PaymentReturn({ kind, sessionId, paymentId }: { kind: ReturnKind; sessionId?: string; paymentId?: string }) {
  const query = useQuery({
    queryKey: ["payments", "return", kind, sessionId ?? "", paymentId ?? ""],
    queryFn: async () => {
      if (sessionId) {
        const result = await apiRequest<PaymentActionResult | Payment>(`/payments/${kind}`, { query: { session_id: sessionId } });
        return unwrapPayment(result);
      }
      return apiRequest<Payment>(`/payments/${paymentId}`);
    },
    enabled: Boolean(sessionId || paymentId),
    retry: false,
  });

  if (!sessionId && !paymentId) {
    return <Outcome tone="warning" title="Nothing to confirm" body="This page is opened after a payment. Check your payment history for its status." />;
  }

  if (query.isPending) {
    return <Skeleton className="h-64 w-full rounded-xl" aria-label="Checking payment" />;
  }

  if (query.isError) {
    return <Outcome tone="warning" title="We couldn't confirm this payment" body="Check your payment history. If it shows as paid, your assessment is unlocked." />;
  }

  const payment = query.data;
  const succeeded = payment?.status === "SUCCEEDED";

  if (kind === "success" && payment && succeeded) {
    return (
      <Outcome
        tone="success"
        title="Payment successful"
        body={`Your payment of ${formatCurrency(payment.amountCents, payment.currency)} was received${payment.createdAt ? ` on ${formatDateTime(payment.createdAt)}` : ""}. You can now start the assessment.`}
        primary={{ href: "/candidate/invitations", label: "Go to invitations" }}
      />
    );
  }

  if (kind === "cancel" || payment?.status === "CANCELLED") {
    return (
      <Outcome
        tone="danger"
        title="Payment cancelled"
        body="No money was taken. Your invitation is still waiting for you, and you can try again at any time."
        primary={{ href: "/candidate/invitations", label: "Back to invitations" }}
      />
    );
  }

  return (
    <Outcome
      tone="warning"
      title="Payment is still processing"
      body="Stripe has not confirmed this payment yet. Refresh in a moment or check your payment history."
      primary={{ href: "/candidate/payments", label: "View payments" }}
    />
  );
}

function Outcome({
  tone,
  title,
  body,
  primary,
}: {
  tone: "success" | "danger" | "warning";
  title: string;
  body: string;
  primary?: { href: string; label: string };
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "danger" ? XCircle : AlertTriangle;
  const iconClass = tone === "success" ? "bg-emerald-50 text-success" : tone === "danger" ? "bg-rose-50 text-destructive" : "bg-amber-50 text-warning";

  return (
    <Card role="status" className="mx-auto w-full max-w-lg p-8 text-center">
      <div className={`mx-auto flex size-14 items-center justify-center rounded-full ${iconClass}`}>
        <Icon className="size-7" aria-hidden />
      </div>
      <h1 className="mt-5 text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
        <Button variant="outline" asChild>
          <Link href="/candidate/payments">Payment history</Link>
        </Button>
        {primary ? (
          <Link href={primary.href} className={buttonVariants({})}>
            {primary.label}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
