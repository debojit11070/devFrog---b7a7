"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Link2, Play } from "lucide-react";
import { toast } from "sonner";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { PayButton } from "@/components/payments/pay-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMyInvitations, useMyPayments } from "@/hooks/api/invitations-payments";
import type { Assessment, Role } from "@/lib/api/types";
import { effectiveInvitationStatus } from "@/lib/domain/invitation-status";

/** Call-to-action for the detail page. Reflects the candidate's real invitation and payment state. */
export function AssessmentActions({ assessment, role }: { assessment: Pick<Assessment, "id" | "title" | "priceCents" | "currency">; role: Role | null }) {
  return (
    <div className="flex flex-col gap-3">
      {role === "CANDIDATE" ? <CandidateAction assessment={assessment} /> : null}
      {role === null ? (
        <Link href={`/login?next=${encodeURIComponent(`/assessments/${assessment.id}`)}`} className={buttonVariants({ size: "lg" })}>
          Sign in to take this
        </Link>
      ) : null}
      {role !== null && role !== "CANDIDATE" ? (
        <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          Candidates take assessments. You are signed in as a {role.toLowerCase()}.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <ShareButton />
        <AskAiButton question={`What should I know before taking "${assessment.title}"?`}>Ask AI</AskAiButton>
      </div>
    </div>
  );
}

function CandidateAction({ assessment }: { assessment: Pick<Assessment, "id" | "priceCents" | "currency"> }) {
  const invitations = useMyInvitations();
  const payments = useMyPayments();

  const invitation = invitations.data?.find((item) => item.assessmentId === assessment.id);
  const status = invitation ? effectiveInvitationStatus(invitation) : null;
  const paid =
    assessment.priceCents === 0 ||
    (payments.data ?? []).some((payment) => payment.assessmentId === assessment.id && payment.status === "SUCCEEDED");

  if (invitations.isPending) return <Button size="lg" loading disabled>Checking your invitation…</Button>;

  if (status === "ACCEPTED" && paid && invitation) {
    return (
      <Link href={`/candidate/attempts/${invitation.id}`} className={buttonVariants({ size: "lg" })}>
        <Play aria-hidden /> Start or continue
      </Link>
    );
  }
  if (status === "ACCEPTED") {
    return <PayButton assessmentId={assessment.id} priceCents={assessment.priceCents} currency={assessment.currency} size="lg" />;
  }
  if (status === "PENDING") {
    return (
      <Link href="/candidate/invitations" className={buttonVariants({ size: "lg" })}>
        Respond to your invitation
      </Link>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        {status === "DECLINED" || status === "EXPIRED"
          ? "Your invitation is no longer active. Ask the company to send a new one."
          : "You haven't been invited to this assessment yet. Companies send invitations; they'll appear in your dashboard."}
      </p>
      <Link href="/candidate/invitations" className={buttonVariants({ variant: "secondary" })}>
        Go to my invitations
      </Link>
    </div>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Copy it from the address bar instead.");
    }
  }

  return (
    <Button type="button" variant="outline" onClick={copy}>
      {copied ? <Check aria-hidden /> : <Link2 aria-hidden />}
      {copied ? "Copied" : "Share"}
    </Button>
  );
}
