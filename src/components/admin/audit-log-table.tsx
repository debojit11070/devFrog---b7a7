"use client";

import { ScrollText } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Badge } from "@/components/ui/card";
import { Select } from "@/components/ui/form-controls";
import { useAuditLogs } from "@/hooks/api/admin-profile";
import { useUrlState } from "@/hooks/use-url-state";
import type { AuditLog } from "@/lib/api/types";
import { formatDateTime, humanize } from "@/lib/utils";

function describeMeta(meta: unknown): string {
  if (!meta || typeof meta !== "object") return "";
  return Object.entries(meta as Record<string, unknown>)
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== "object")
    .map(([key, value]) => `${humanize(key)}: ${String(value)}`)
    .join(" · ");
}

export function AuditLogTable() {
  const { get, update, page, limit } = useUrlState();
  const resource = get("resource");
  const query = useAuditLogs({ page, limit, resource: resource || undefined });

  const columns: Column<AuditLog>[] = [
    {
      key: "when",
      header: "When",
      cell: (row) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(row.createdAt)}</span>,
    },
    {
      key: "actor",
      header: "Actor",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.actor?.fullName ?? "System"}</p>
          {row.actor?.email ? <p className="truncate text-xs text-muted-foreground">{row.actor.email}</p> : null}
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      cell: (row) => (
        <div className="flex flex-col items-start gap-1">
          <Badge tone="brand">{row.action}</Badge>
          <span className="text-xs text-muted-foreground">
            {humanize(row.resource)}
            {row.resourceId ? ` · ${row.resourceId.slice(0, 8)}…` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "details",
      header: "Details",
      hideOnMobile: true,
      cell: (row) => <span className="text-xs text-muted-foreground">{describeMeta(row.meta) || "—"}</span>,
    },
    {
      key: "ip",
      header: "IP",
      hideOnMobile: true,
      cell: (row) => <span className="font-mono text-xs text-muted-foreground">{row.ip ?? "—"}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Audit logs" description="Every sensitive change on the platform, newest first." />
      <Select aria-label="Filter by resource" value={resource} onChange={(event) => update({ resource: event.target.value })} className="sm:w-56">
        <option value="">All resources</option>
        <option value="user">Users</option>
        <option value="assessment">Assessments</option>
        <option value="problem">Questions</option>
        <option value="invitation">Invitations</option>
        <option value="attempt">Attempts</option>
        <option value="payment">Payments</option>
      </Select>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} title="Audit logs couldn't be loaded" />
      ) : (
        <>
          <DataTable
            caption="Audit log entries"
            columns={columns}
            rows={query.data?.items ?? []}
            rowKey={(row) => row.id}
            isLoading={query.isPending}
            empty={<EmptyState icon={ScrollText} title="No audit entries yet" description="Actions such as role changes and deletions will be recorded here." />}
          />
          <Pagination meta={query.data?.meta} onPageChange={(next) => update({ page: next })} />
        </>
      )}
    </div>
  );
}
