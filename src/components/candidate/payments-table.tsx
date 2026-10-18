"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Select } from "@/components/ui/form-controls";
import { usePagedRows } from "@/hooks/use-paged-rows";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { useMyPayments } from "@/hooks/api/invitations-payments";
import type { Payment } from "@/lib/api/types";
import { formatCurrency, formatDateTime, humanize } from "@/lib/utils";

export function PaymentsTable() {
  const query = useMyPayments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(
    () =>
      (query.data ?? []).filter(
        (row) =>
          (!status || row.status === status) &&
          (!search || (row.assessment?.title ?? "").toLowerCase().includes(search.toLowerCase())),
      ),
    [query.data, search, status],
  );
  const paged = usePagedRows(filtered);

  const columns: Column<Payment>[] = [
    {
      key: "assessment",
      header: "Assessment",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.assessment?.title ?? "Assessment"}</p>
          <p className="text-xs text-muted-foreground">{humanize(row.purpose)}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row) => <span className="font-medium tabular-nums">{formatCurrency(row.amountCents, row.currency)}</span>,
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge value={row.status} /> },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (row) => <span className="text-muted-foreground">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: "action",
      header: "",
      className: "text-right",
      cell: (row) =>
        row.status === "PENDING" && row.checkoutUrl ? (
          <Button variant="outline" size="sm" asChild>
            <a href={row.checkoutUrl}>Continue to pay</a>
          </Button>
        ) : row.assessmentId ? (
          <Link href="/candidate/invitations" className="text-sm font-medium text-primary hover:underline">
            View invitation
          </Link>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments" description="Every payment you have made for premium assessments, with its current status." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput label="Search payments" placeholder="Search by assessment" value={search} onValueChange={(value) => { setSearch(value); paged.setPage(1); }} />
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => { setStatus(event.target.value); paged.setPage(1); }}
          className="sm:ml-auto sm:w-48"
        >
          <option value="">All statuses</option>
          <option value="SUCCEEDED">Succeeded</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </Select>
      </div>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} title="Payments couldn't be loaded" />
      ) : (
        <>
        <DataTable
          caption="Payment history"
          columns={columns}
          rows={paged.rows}
          rowKey={(row) => row.id}
          isLoading={query.isPending}
          empty={
            <EmptyState
              icon={CreditCard}
              title="No payments yet"
              description="Paid assessments show a Pay button on your invitations. Your receipts will appear here."
              action={
                <Button variant="outline" asChild>
                  <Link href="/candidate/invitations">View invitations</Link>
                </Button>
              }
            />
          }
        />
        <Pagination meta={paged.meta} onPageChange={paged.setPage} />
        </>
      )}
    </div>
  );
}
