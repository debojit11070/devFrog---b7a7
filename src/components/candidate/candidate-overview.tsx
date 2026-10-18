"use client";

import { BarChartCard } from "@/components/charts/bar-chart-card";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CheckCircle2, CreditCard, Mail, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyInvitations, useMyPayments } from "@/hooks/api/invitations-payments";
import { effectiveInvitationStatus } from "@/lib/domain/invitation-status";
import { formatCurrency, formatDate, formatNumber, humanize } from "@/lib/utils";
import { useCurrentUser } from "@/providers/user-provider";

export function CandidateOverview() {
  const user = useCurrentUser();
  const invitations = useMyInvitations();
  const payments = useMyPayments();

  const stats = useMemo(() => {
    const list = invitations.data ?? [];
    const statuses = list.map(effectiveInvitationStatus);
    return {
      waiting: statuses.filter((status) => status === "PENDING").length,
      accepted: statuses.filter((status) => status === "ACCEPTED").length,
      completedPayments: (payments.data ?? []).filter((payment) => payment.status === "SUCCEEDED").length,
      recent: [...list].sort((a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()).slice(0, 5),
    };
  }, [invitations.data, payments.data]);

  const failed = invitations.isError || payments.isError;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Hi ${user.fullName.split(" ")[0]}`}
        description="Here is what needs your attention: invitations to respond to and assessments ready to take."
        actions={
          <Link href="/candidate/invitations" className={buttonVariants({})}>
            View invitations
          </Link>
        }
      />

      {failed ? (
        <ErrorState error={invitations.error ?? payments.error} title="Your dashboard couldn't be loaded" onRetry={() => { void invitations.refetch(); void payments.refetch(); }} />
      ) : (
        <section aria-label="Your activity" className="grid gap-4 sm:grid-cols-3">
          {invitations.isPending || payments.isPending ? (
            Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)
          ) : (
            <>
              <StatCard label="Waiting for your reply" value={formatNumber(stats.waiting)} hint="Accept or decline" icon={Mail} tone="warning" />
              <StatCard label="Ready to take" value={formatNumber(stats.accepted)} hint="Accepted invitations" icon={PlayCircle} tone="info" />
              <StatCard label="Successful payments" value={formatNumber(stats.completedPayments)} hint="Premium assessments unlocked" icon={CreditCard} tone="success" />
            </>
          )}
        </section>
      )}

      {invitations.isPending || invitations.isError ? null : (
        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartCard
            title="Invitations by status"
            description="Where each of your invitations stands"
            data={(["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"] as const).map((status) => ({
              label: humanize(status),
              value: (invitations.data ?? []).filter((item) => effectiveInvitationStatus(item) === status).length,
            }))}
            valueLabel="Invitations"
            kind="pie"
          />
          <BarChartCard
            title="Payments by status"
            description="Your payment history at a glance"
            data={(["SUCCEEDED", "PENDING", "FAILED", "CANCELLED"] as const).map((status) => ({
              label: humanize(status),
              value: (payments.data ?? []).filter((item) => item.status === status).length,
            }))}
            valueLabel="Payments"
          />
        </div>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent invitations</CardTitle>
          <Link href="/candidate/invitations" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            See all <ArrowRight className="size-4" aria-hidden />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {invitations.isPending ? (
            <div className="flex flex-col gap-2 p-5" aria-busy="true">
              {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
            </div>
          ) : stats.recent.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No invitations yet"
              description="Companies invite you to assessments. Browse what is available in the meantime."
              action={
                <Link href="/assessments" className={buttonVariants({ variant: "outline" })}>
                  Browse assessments
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {stats.recent.map((invitation) => (
                <li key={invitation.id} className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{invitation.assessment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {invitation.assessment.priceCents === 0 ? "Free" : formatCurrency(invitation.assessment.priceCents, invitation.assessment.currency)} · invited {formatDate(invitation.invitedAt)}
                    </p>
                  </div>
                  <StatusBadge value={effectiveInvitationStatus(invitation)} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
