"use client";

import Link from "next/link";
import { Activity, ClipboardList, CreditCard, UserPlus, Users, Wallet } from "lucide-react";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/api/admin-profile";
import { useAssessments } from "@/hooks/api/assessments";
import { formatCurrency, formatDate, formatNumber, humanize } from "@/lib/utils";

export function AdminOverview() {
  const stats = useAdminStats();
  const published = useAssessments({ status: "PUBLISHED", limit: 100, sortBy: "createdAt", order: "asc" });

  if (stats.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Platform overview" description="Users, assessments, attempts and revenue at a glance." />
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} title="Stats couldn't be loaded" />
      </div>
    );
  }

  if (stats.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <PageHeader title="Platform overview" description="Users, assessments, attempts and revenue at a glance." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const data = stats.data;
  // Assessments created per month, from the published list (oldest first).
  const monthly = new Map<string, number>();
  for (const item of published.data?.items ?? []) {
    const key = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(new Date(item.createdAt));
    monthly.set(key, (monthly.get(key) ?? 0) + 1);
  }
  const monthlyBars = Array.from(monthly, ([label, value]) => ({ label, value }));
  const attemptBars = data.attempts.byStatus.map((row) => ({
    label: humanize(row.status),
    value: row._count._all,
  }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Platform overview"
        description="Users, assessments, attempts and revenue at a glance."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/users">Manage users</Link>
          </Button>
        }
      />

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={formatNumber(data.users.total)} hint={`${formatNumber(data.users.candidates)} candidates`} icon={Users} />
        <StatCard label="Companies" value={formatNumber(data.users.companies)} hint="Registered employers" icon={UserPlus} tone="info" />
        <StatCard label="Assessments" value={formatNumber(data.assessments.total)} hint="Excluding deleted" icon={ClipboardList} tone="success" />
        <StatCard
          label="Revenue"
          value={formatCurrency(data.payments.totalRevenueCents)}
          hint={`${formatNumber(data.payments.succeededCount)} successful payments`}
          icon={Wallet}
          tone="warning"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Attempts by status"
          description={`${formatNumber(data.attempts.total)} attempts in total`}
          data={attemptBars}
          valueLabel="Attempts"
        />
        <BarChartCard
          title="Users by role"
          description="Accounts on the platform, grouped by role"
          data={[
            { label: "Candidates", value: data.users.candidates },
            { label: "Companies", value: data.users.companies },
            { label: "Other", value: Math.max(data.users.total - data.users.candidates - data.users.companies, 0) },
          ]}
          valueLabel="Users"
          kind="pie"
        />
      </div>

      <BarChartCard
        title="Assessments published over time"
        description="Published assessments grouped by the month they were created"
        data={monthlyBars}
        valueLabel="Assessments"
        kind="line"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent sign-ups</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentSignups.length === 0 ? (
              <EmptyState icon={UserPlus} title="No sign-ups yet" description="New accounts will show up here." />
            ) : (
              <ul className="divide-y divide-border">
                {data.recentSignups.map((user) => (
                  <li key={user.id} className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge value={user.role} />
                      <span className="hidden text-xs text-muted-foreground sm:inline">{formatDate(user.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <Activity className="size-4 text-success" aria-hidden />
              API connected and returning live data.
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="size-4 text-primary" aria-hidden />
              {formatNumber(data.payments.succeededCount)} payments have succeeded.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
