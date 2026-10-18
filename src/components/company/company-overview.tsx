"use client";

import { BarChartCard } from "@/components/charts/bar-chart-card";
import Link from "next/link";
import { ClipboardList, Code2, FilePenLine, Globe, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssessments } from "@/hooks/api/assessments";
import { useProblems } from "@/hooks/api/problems";
import { formatDate, formatNumber } from "@/lib/utils";
import { useCurrentUser } from "@/providers/user-provider";

export function CompanyOverview() {
  const user = useCurrentUser();
  const drafts = useAssessments({ status: "DRAFT", limit: 5, sortBy: "updatedAt", order: "desc" });
  const archived = useAssessments({ status: "ARCHIVED", limit: 1 });
  const published = useAssessments({ status: "PUBLISHED", limit: 1 });
  const bank = useProblems({ limit: 1 });

  const failed = drafts.isError || archived.isError || published.isError || bank.isError;
  const loading = drafts.isPending || archived.isPending || published.isPending || bank.isPending;
  const error = drafts.error ?? archived.error ?? published.error ?? bank.error;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome, ${user.companyProfile?.companyName ?? user.fullName}`}
        description="Build assessments from your question bank, invite candidates and review their results."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/company/problems/new">
                <Code2 aria-hidden />
                New question
              </Link>
            </Button>
            <Button asChild>
              <Link href="/company/assessments/new">
                <Plus aria-hidden />
                New assessment
              </Link>
            </Button>
          </>
        }
      />

      {failed ? (
        <ErrorState error={error} title="Your dashboard couldn't be loaded" onRetry={() => { void drafts.refetch(); void bank.refetch(); }} />
      ) : (
        <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)
          ) : (
            <>
              <StatCard label="Drafts" value={formatNumber(drafts.data?.meta.total ?? 0)} hint="Still being built" icon={FilePenLine} tone="warning" />
              <StatCard label="Archived" value={formatNumber(archived.data?.meta.total ?? 0)} hint="Hidden from the catalog" icon={ClipboardList} />
              <StatCard label="Questions in bank" value={formatNumber(bank.data?.meta.total ?? 0)} hint="Reusable across assessments" icon={Code2} tone="info" />
              <StatCard label="Published on platform" value={formatNumber(published.data?.meta.total ?? 0)} hint="Open to candidates" icon={Globe} tone="success" />
            </>
          )}
        </section>
      )}

      {loading || failed ? null : (
        <div className="grid gap-6 lg:grid-cols-2">
          <BarChartCard
            title="Assessments by status"
            description="Your drafts and archive next to what is live on the platform"
            data={[
              { label: "Drafts", value: drafts.data?.meta.total ?? 0 },
              { label: "Archived", value: archived.data?.meta.total ?? 0 },
              { label: "Published", value: published.data?.meta.total ?? 0 },
            ]}
            valueLabel="Assessments"
          />
          <BarChartCard
            title="Content mix"
            description="Question bank size compared with assessments"
            data={[
              { label: "Questions", value: bank.data?.meta.total ?? 0 },
              { label: "Assessments", value: (drafts.data?.meta.total ?? 0) + (archived.data?.meta.total ?? 0) },
            ]}
            valueLabel="Items"
            kind="pie"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent drafts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {drafts.isPending ? (
            <div className="flex flex-col gap-2 p-5" aria-busy="true">
              {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
            </div>
          ) : drafts.isError ? null : drafts.data.items.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No drafts right now"
              description="Start a new assessment and it will appear here until you publish it."
              action={
                <Button asChild>
                  <Link href="/company/assessments/new">Create an assessment</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {drafts.data.items.map((assessment) => (
                <li key={assessment.id} className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                  <div className="min-w-0">
                    <Link href={`/company/assessments/${assessment.id}`} className="block truncate font-medium hover:text-primary hover:underline">
                      {assessment.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">Updated {formatDate(assessment.updatedAt)}</p>
                  </div>
                  <StatusBadge value={assessment.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
