"use client";

import { Briefcase } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Select } from "@/components/ui/form-controls";
import { useAdminUsers } from "@/hooks/api/admin-profile";
import { useUrlState } from "@/hooks/use-url-state";
import type { User, UserStatus } from "@/lib/api/types";
import { USER_STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED", "PENDING"];

/** Company accounts only: the admin users list pinned to role=COMPANY, with company profile details. */
export function AdminCompanies() {
  const { get, update, page, limit } = useUrlState();
  const statusFilter = get("status");
  const status = STATUSES.find((value) => value === statusFilter);

  const query = useAdminUsers({ page, limit, role: "COMPANY", status, search: get("q") || undefined });

  const columns: Column<User>[] = [
    {
      key: "company",
      header: "Company",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.companyProfile?.companyName ?? row.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: "contact", header: "Contact", hideOnMobile: true, cell: (row) => row.fullName },
    {
      key: "industry",
      header: "Industry",
      hideOnMobile: true,
      cell: (row) => <span className="text-muted-foreground">{row.companyProfile?.industry ?? "—"}</span>,
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge value={row.status} label={USER_STATUS_LABEL[row.status]} /> },
    { key: "joined", header: "Joined", hideOnMobile: true, cell: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Companies" description="Employer accounts that can publish assessments." />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput label="Search companies" placeholder="Search name or email" value={get("q")} onValueChange={(value) => update({ q: value })} />
        <Select aria-label="Filter by status" value={statusFilter} onChange={(event) => update({ status: event.target.value })} className="sm:ml-auto sm:w-44">
          <option value="">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {USER_STATUS_LABEL[value]}
            </option>
          ))}
        </Select>
      </div>
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} title="Companies could not be loaded" />
      ) : (
        <>
          <DataTable
            caption="Company accounts"
            columns={columns}
            rows={query.data?.items ?? []}
            rowKey={(row) => row.id}
            isLoading={query.isPending}
            empty={<EmptyState icon={Briefcase} title="No companies found" description="Try a different search or status." />}
          />
          <Pagination meta={query.data?.meta} onPageChange={(next) => update({ page: next })} />
        </>
      )}
    </div>
  );
}
