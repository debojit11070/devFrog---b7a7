"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Archive, ClipboardList, Eye, Plus, Send, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { useAssessments, useDeleteAssessment, useSetAssessmentStatus } from "@/hooks/api/assessments";
import { useUrlState } from "@/hooks/use-url-state";
import type { Assessment, AssessmentStatus } from "@/lib/api/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const STATUSES: AssessmentStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function isAssessmentStatus(value: string): value is AssessmentStatus {
  return (STATUSES as string[]).includes(value);
}

export function AssessmentsTable() {
  const { get, update, page, limit } = useUrlState();
  const statusParam = get("status");
  // Drafts are the working set, so they are the default view.
  const status: AssessmentStatus = isAssessmentStatus(statusParam) ? statusParam : "DRAFT";

  const query = useAssessments({ page, limit, status, search: get("q") || undefined });
  const setStatus = useSetAssessmentStatus();
  const deleteAssessment = useDeleteAssessment();

  const [deleting, setDeleting] = useState<Assessment | null>(null);
  const [archiving, setArchiving] = useState<Assessment | null>(null);

  function publish(assessment: Assessment) {
    setStatus.mutate(
      { id: assessment.id, status: "PUBLISHED" },
      { onSuccess: () => toast.success(`"${assessment.title}" is published`) },
    );
  }

  const columns: Column<Assessment>[] = [
    {
      key: "title",
      header: "Assessment",
      cell: (row) => (
        <div className="min-w-0">
          <Link href={`/company/assessments/${row.id}`} className="block truncate font-medium hover:text-primary hover:underline">
            {row.title}
          </Link>
          <p className="truncate text-xs text-muted-foreground">Updated {formatDate(row.updatedAt)}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge value={row.status} /> },
    {
      key: "questions",
      header: "Questions",
      hideOnMobile: true,
      cell: (row) => <span className="tabular-nums">{row.problemCount ?? row.problems.length}</span>,
    },
    {
      key: "price",
      header: "Price",
      hideOnMobile: true,
      cell: (row) => <span className="tabular-nums">{row.priceCents === 0 ? "Free" : formatCurrency(row.priceCents, row.currency)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Link href={`/company/assessments/${row.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))} aria-label={`Open ${row.title}`}>
            <Eye aria-hidden />
            <span className="hidden xl:inline">Open</span>
          </Link>
          {row.status === "DRAFT" ? (
            <Button
              variant="ghost"
              size="sm"
              loading={setStatus.isPending && setStatus.variables?.id === row.id}
              onClick={() => publish(row)}
              aria-label={`Publish ${row.title}`}
            >
              <Send aria-hidden />
              <span className="hidden xl:inline">Publish</span>
            </Button>
          ) : null}
          {row.status === "PUBLISHED" ? (
            <Button variant="ghost" size="sm" onClick={() => setArchiving(row)} aria-label={`Archive ${row.title}`}>
              <Archive aria-hidden />
              <span className="hidden xl:inline">Archive</span>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleting(row)}
            aria-label={`Delete ${row.title}`}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assessments"
        description="Drafts you are still building, published assessments candidates can take, and archived ones."
        actions={
          <Button asChild>
            <Link href="/company/assessments/new">
              <Plus aria-hidden />
              New assessment
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput label="Search assessments" placeholder="Search by title" value={get("q")} onValueChange={(value) => update({ q: value })} />
        <div className="sm:ml-auto">
          <Select aria-label="Filter by status" value={status} onChange={(event) => update({ status: event.target.value })} className="sm:w-44">
            <option value="DRAFT">Drafts</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>
      </div>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} title="Assessments couldn't be loaded" />
      ) : (
        <>
          <DataTable
            caption="Your assessments"
            columns={columns}
            rows={query.data?.items ?? []}
            rowKey={(row) => row.id}
            isLoading={query.isPending}
            empty={
              <EmptyState
                icon={ClipboardList}
                title={status === "DRAFT" ? "No drafts yet" : `No ${status.toLowerCase()} assessments`}
                description="Assessments are built from questions in your bank."
                action={
                  <Button asChild>
                    <Link href="/company/assessments/new">Create an assessment</Link>
                  </Button>
                }
              />
            }
          />
          <Pagination meta={query.data?.meta} onPageChange={(next) => update({ page: next })} />
        </>
      )}

      <ConfirmDialog
        open={archiving !== null}
        onOpenChange={(open) => !open && setArchiving(null)}
        title="Archive this assessment?"
        description="Archived assessments are hidden from the public catalog. Candidates already invited keep their access."
        confirmLabel="Archive"
        loading={setStatus.isPending}
        onConfirm={() => {
          if (!archiving) return;
          setStatus.mutate(
            { id: archiving.id, status: "ARCHIVED" },
            { onSuccess: () => { toast.success("Assessment archived"); setArchiving(null); } },
          );
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this assessment?"
        description={`"${deleting?.title ?? ""}" will be removed. Existing attempts are kept for records.`}
        confirmLabel="Delete assessment"
        destructive
        loading={deleteAssessment.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteAssessment.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
