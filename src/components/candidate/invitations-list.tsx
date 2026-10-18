"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Clock, Mail, Play, X, Check } from "lucide-react";
import { PayButton } from "@/components/payments/pay-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/form-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcceptInvitation, useDeclineInvitation, useMyInvitations, useMyPayments } from "@/hooks/api/invitations-payments";
import { Pagination } from "@/components/shared/pagination";
import { usePagedRows } from "@/hooks/use-paged-rows";
import { useUrlState } from "@/hooks/use-url-state";
import type { InvitationStatus } from "@/lib/api/types";
import { effectiveInvitationStatus } from "@/lib/domain/invitation-status";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const FILTERS: Array<{ value: InvitationStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All invitations" },
  { value: "PENDING", label: "Waiting for you" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DECLINED", label: "Declined" },
  { value: "EXPIRED", label: "Expired" },
];

function isFilter(value: string): value is InvitationStatus | "ALL" {
  return FILTERS.some((filter) => filter.value === value);
}

export function InvitationsList() {
  const { get, update } = useUrlState();
  const invitations = useMyInvitations();
  const payments = useMyPayments();
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  const filterParam = get("status");
  const filter = isFilter(filterParam) ? filterParam : "ALL";

  // Assessments the candidate has paid for, so the take button is gated on payment.
  const paidAssessmentIds = useMemo(
    () => new Set((payments.data ?? []).filter((payment) => payment.status === "SUCCEEDED" && payment.assessmentId).map((payment) => payment.assessmentId)),
    [payments.data],
  );

  const rows = useMemo(() => {
    const all = invitations.data ?? [];
    return filter === "ALL" ? all : all.filter((invitation) => effectiveInvitationStatus(invitation) === filter);
  }, [invitations.data, filter]);

  const paged = usePagedRows(rows, 6);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invitations"
        description="Companies invite you to assessments here. Accept to unlock the test, then start when you are ready."
        actions={
          <Select aria-label="Filter invitations" value={filter} onChange={(event) => update({ status: event.target.value === "ALL" ? null : event.target.value })} className="w-full sm:w-56">
            {FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        }
      />

      {invitations.isError ? (
        <ErrorState error={invitations.error} onRetry={() => invitations.refetch()} title="Invitations couldn't be loaded" />
      ) : invitations.isPending ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading invitations">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Mail}
            title={filter === "ALL" ? "No invitations yet" : "Nothing in this view"}
            description="When a company invites you to an assessment, it will appear here."
            action={
              filter !== "ALL" ? (
                <Button variant="outline" onClick={() => update({ status: null })}>Show all invitations</Button>
              ) : (
                <Link href="/assessments" className={buttonVariants({ variant: "outline" })}>Browse public assessments</Link>
              )
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {paged.rows.map((invitation) => {
            const status = effectiveInvitationStatus(invitation);
            const { assessment } = invitation;
            const isPaid = assessment.priceCents === 0 || paidAssessmentIds.has(invitation.assessmentId);
            const busy = (accept.isPending && accept.variables === invitation.id) || (decline.isPending && decline.variables === invitation.id);

            return (
              <li key={invitation.id}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-4 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">{assessment.title}</h2>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{assessment.description}</p>
                      </div>
                      <StatusBadge value={status} />
                    </div>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-xs text-muted-foreground">Duration</dt>
                        <dd className="font-medium">{assessment.durationMin} min</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Pass mark</dt>
                        <dd className="font-medium">{assessment.passingScore}%</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Price</dt>
                        <dd className="font-medium">{assessment.priceCents === 0 ? "Free" : formatCurrency(assessment.priceCents, assessment.currency)}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" aria-hidden />Expires</dt>
                        <dd className="font-medium">{formatDate(invitation.expiresAt)}</dd>
                      </div>
                    </dl>

                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-4">
                      {status === "PENDING" ? (
                        <>
                          <Button size="sm" onClick={() => accept.mutate(invitation.id)} loading={accept.isPending && accept.variables === invitation.id} disabled={busy}>
                            <Check aria-hidden />
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => decline.mutate(invitation.id)} loading={decline.isPending && decline.variables === invitation.id} disabled={busy}>
                            <X aria-hidden />
                            Decline
                          </Button>
                        </>
                      ) : null}

                      {status === "ACCEPTED" && isPaid ? (
                        <Link href={`/candidate/attempts/${invitation.id}`} className={cn(buttonVariants({ size: "sm" }))}>
                          <Play aria-hidden />
                          Start or continue
                        </Link>
                      ) : null}

                      {status === "ACCEPTED" && !isPaid ? (
                        <PayButton assessmentId={invitation.assessmentId} priceCents={assessment.priceCents} currency={assessment.currency} size="sm" />
                      ) : null}

                      {status === "DECLINED" || status === "EXPIRED" ? (
                        <p className="text-sm text-muted-foreground">
                          {status === "DECLINED" ? "You declined this invitation." : "This invitation has expired. Ask the company to send a new one."}
                        </p>
                      ) : null}

                      <Link href={`/assessments/${invitation.assessmentId}`} className="ml-auto text-sm font-medium text-primary hover:underline">
                        View details
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      {rows.length > 0 ? <Pagination meta={paged.meta} onPageChange={paged.setPage} /> : null}
    </div>
  );
}
