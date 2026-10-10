"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Archive, Clock, Layers, Pencil, Send, Trophy, UserPlus, Wallet } from "lucide-react";
import { AttemptsTable } from "@/components/company/attempts-table";
import { EditAssessmentDialog, InviteCandidateDialog } from "@/components/company/assessment-dialogs";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/states";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssessment, useSetAssessmentStatus } from "@/hooks/api/assessments";
import { formatCurrency } from "@/lib/utils";
import { useCurrentUser } from "@/providers/user-provider";

type OpenDialog = "edit" | "invite" | null;

export function AssessmentDetail({ id }: { id: string }) {
  const me = useCurrentUser();
  const query = useAssessment(id);
  const setStatus = useSetAssessmentStatus();
  const [dialog, setDialog] = useState<OpenDialog>(null);

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} title="This assessment couldn't be loaded" />;
  }

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading assessment">
        <Skeleton className="h-10 w-2/3" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const assessment = query.data;
  const isOwner = assessment.createdById === me.id || me.role === "ADMIN";
  const totalPoints = assessment.problems.reduce((sum, item) => sum + item.points, 0);

  function changeStatus(status: "PUBLISHED" | "ARCHIVED" | "DRAFT", message: string) {
    setStatus.mutate({ id: assessment.id, status }, { onSuccess: () => toast.success(message) });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link href="/company/assessments" className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          All assessments
        </Link>
        <PageHeader
          title={assessment.title}
          description={assessment.description}
          actions={
            <>
              <StatusBadge value={assessment.status} />
              {isOwner && assessment.status !== "ARCHIVED" ? (
                <Button variant="outline" onClick={() => setDialog("edit")}>
                  <Pencil aria-hidden />
                  Edit
                </Button>
              ) : null}
              {isOwner && assessment.status === "DRAFT" ? (
                <Button onClick={() => changeStatus("PUBLISHED", "Assessment published")} loading={setStatus.isPending}>
                  <Send aria-hidden />
                  Publish
                </Button>
              ) : null}
              {isOwner && assessment.status === "PUBLISHED" ? (
                <>
                  <Button variant="outline" onClick={() => changeStatus("ARCHIVED", "Assessment archived")} loading={setStatus.isPending}>
                    <Archive aria-hidden />
                    Archive
                  </Button>
                  <Button onClick={() => setDialog("invite")}>
                    <UserPlus aria-hidden />
                    Invite candidate
                  </Button>
                </>
              ) : null}
            </>
          }
        />
      </div>

      <section aria-label="Assessment summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Duration" value={`${assessment.durationMin} min`} icon={Clock} />
        <StatCard label="Pass mark" value={`${assessment.passingScore}%`} icon={Trophy} tone="success" />
        <StatCard label="Questions" value={`${assessment.problems.length}`} hint={`${totalPoints} points in total`} icon={Layers} tone="info" />
        <StatCard
          label="Price"
          value={assessment.priceCents === 0 ? "Free" : formatCurrency(assessment.priceCents, assessment.currency)}
          hint={assessment.priceCents === 0 ? "No payment required" : "Paid via Stripe Checkout"}
          icon={Wallet}
          tone="warning"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>In the order candidates see them.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ol className="divide-y divide-border">
              {assessment.problems
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((item, index) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3 sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                        {item.problem.title}
                      </p>
                      <div className="mt-1 flex gap-1.5">
                        <StatusBadge value={item.problem.type} />
                        <StatusBadge value={item.problem.difficulty} />
                      </div>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{item.points} pts</span>
                  </li>
                ))}
            </ol>
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-4 xl:col-span-2">
          <div>
            <h2 className="text-lg font-semibold">Attempts</h2>
            <p className="text-sm text-muted-foreground">Score open-ended answers and review results for each candidate.</p>
          </div>
          <AttemptsTable assessment={assessment} />
        </div>
      </div>

      {dialog === "edit" ? <EditAssessmentDialog assessment={assessment} onClose={() => setDialog(null)} /> : null}
      {dialog === "invite" ? <InviteCandidateDialog assessmentId={assessment.id} onClose={() => setDialog(null)} /> : null}
    </div>
  );
}
