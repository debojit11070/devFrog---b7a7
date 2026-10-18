"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Select } from "@/components/ui/form-controls";
import { useAssessments } from "@/hooks/api/assessments";
import { useUrlState } from "@/hooks/use-url-state";
import type { Assessment, AssessmentStatus } from "@/lib/api/types";
import { formatCurrency, formatDate, humanize } from "@/lib/utils";

const STATUSES: AssessmentStatus[] = ["PUBLISHED", "DRAFT", "ARCHIVED"];

/** Every assessment on the platform, filterable by status and price. Admins can read all statuses. */
export function AdminAssessments() {
  const { get, update, page, limit } = useUrlState();
  const status = STATUSES.find((value) => value === get("status")) ?? "PUBLISHED";
  const pricing = get("pricing");

  const query = useAssessments({
    page,
    limit,
    status,
    search: get("q") || undefined,
    minPrice: pricing === "paid" ? 1 : undefined,
    maxPrice: pricing === "free" ? 0 : undefined,
  });

  const columns: Column<Assessment>[] = [
    {
      key: "title",
      header: "Assessment",
      cell: (row) => (
        <div className="min-w-0">
          <Link href={`/assessments/${row.id}`} className="block truncate font-medium hover:text-primary hover:underline">
            {row.title}
          </Link>
          <p className="truncate text-xs text-muted-foreground">By {row.createdBy?.fullName ?? "Unknown"}</p>
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
    { key: "created", header: "Created", hideOnMobile: true, cell: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Assessments" description="All assessments across companies, by status." />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput label="Search assessments" placeholder="Search title or description" value={get("q")} onValueChange={(value) => update({ q: value })} />
        <div className="grid grid-cols-2 gap-3 sm:ml-auto sm:flex">
          <Select aria-label="Filter by status" value={status} onChange={(event) => update({ status: event.target.value })} className="sm:w-40">
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ))}
          </Select>
          <Select aria-label="Filter by price" value={pricing} onChange={(event) => update({ pricing: event.target.value })} className="sm:w-40">
            <option value="">Any price</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </Select>
        </div>
      </div>
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} title="Assessments could not be loaded" />
      ) : (
        <>
          <DataTable
            caption="Assessments"
            columns={columns}
            rows={query.data?.items ?? []}
            rowKey={(row) => row.id}
            isLoading={query.isPending}
            empty={<EmptyState icon={ClipboardList} title="No assessments in this view" description="Change the status or clear the search." />}
          />
          <Pagination meta={query.data?.meta} onPageChange={(next) => update({ page: next })} />
        </>
      )}
    </div>
  );
}
