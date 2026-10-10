"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, UserRoundCog } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select } from "@/components/ui/form-controls";
import { useAdminUsers, useDeleteAdminUser, useUpdateAdminUser } from "@/hooks/api/admin-profile";
import { useUrlState } from "@/hooks/use-url-state";
import { useCurrentUser } from "@/providers/user-provider";
import { ROLE_LABEL, USER_STATUS_LABEL } from "@/lib/constants";
import type { Role, User, UserStatus } from "@/lib/api/types";
import { adminUserSchema, type AdminUserFormValues } from "@/lib/validations/admin";
import { formatDate } from "@/lib/utils";

const ROLES: Role[] = ["CANDIDATE", "COMPANY", "ADMIN"];
const STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED", "PENDING"];

function isRole(value: string): value is Role {
  return (ROLES as string[]).includes(value);
}

function isUserStatus(value: string): value is UserStatus {
  return (STATUSES as string[]).includes(value);
}

export function AdminUsers() {
  const me = useCurrentUser();
  const { get, update, page, limit } = useUrlState();
  const roleFilter = get("role");
  const statusFilter = get("status");

  const query = useAdminUsers({
    page,
    limit,
    search: get("q") || undefined,
    role: isRole(roleFilter) ? roleFilter : undefined,
    status: isUserStatus(statusFilter) ? statusFilter : undefined,
  });

  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const deleteUser = useDeleteAdminUser();

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "User",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (row) => <StatusBadge value={row.role} label={ROLE_LABEL[row.role]} /> },
    { key: "status", header: "Status", cell: (row) => <StatusBadge value={row.status} label={USER_STATUS_LABEL[row.status]} /> },
    { key: "joined", header: "Joined", hideOnMobile: true, cell: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => {
        const isSelf = row.id === me.id;
        return (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(row)} disabled={isSelf} aria-label={`Edit ${row.fullName}`}>
              <Pencil aria-hidden />
              <span className="hidden xl:inline">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleting(row)}
              disabled={isSelf}
              aria-label={`Delete ${row.fullName}`}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users" description="Change roles and account status, or remove accounts. Deletions are soft and reversible by the database." />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput label="Search users" placeholder="Search name or email" value={get("q")} onValueChange={(value) => update({ q: value })} />
        <div className="grid grid-cols-2 gap-3 sm:ml-auto sm:flex">
          <Select aria-label="Filter by role" value={roleFilter} onChange={(event) => update({ role: event.target.value })} className="sm:w-40">
            <option value="">All roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>{ROLE_LABEL[role]}</option>
            ))}
          </Select>
          <Select aria-label="Filter by status" value={statusFilter} onChange={(event) => update({ status: event.target.value })} className="sm:w-40">
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{USER_STATUS_LABEL[status]}</option>
            ))}
          </Select>
        </div>
      </div>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} title="Users couldn't be loaded" />
      ) : (
        <>
          <DataTable
            caption="Platform users"
            columns={columns}
            rows={query.data?.items ?? []}
            rowKey={(row) => row.id}
            isLoading={query.isPending}
            empty={
              <EmptyState
                icon={UserRoundCog}
                title="No users match these filters"
                description="Clear the search or change the role and status filters."
              />
            }
          />
          <Pagination meta={query.data?.meta} onPageChange={(next) => update({ page: next })} />
        </>
      )}

      {editing ? <EditUserDialog user={editing} onClose={() => setEditing(null)} /> : null}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this user?"
        description={`${deleting?.fullName ?? "This user"} will be soft-deleted and can no longer sign in. This is recorded in the audit log.`}
        confirmLabel="Delete user"
        destructive
        loading={deleteUser.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteUser.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}

function EditUserDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const updateUser = useUpdateAdminUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: { role: user.role, status: user.status },
  });

  const onSubmit = handleSubmit((values) =>
    updateUser
      .mutateAsync({ id: user.id, ...values })
      .then(onClose)
      .catch(() => undefined),
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {user.fullName}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <FormField id="role" label="Role" error={errors.role}>
            <Select {...fieldAria("role", errors.role)} {...register("role")}>
              {ROLES.map((role) => (
                <option key={role} value={role}>{ROLE_LABEL[role]}</option>
              ))}
            </Select>
          </FormField>
          <FormField id="status" label="Account status" error={errors.status} hint="Suspended users cannot sign in.">
            <Select {...fieldAria("status", errors.status, true)} {...register("status")}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{USER_STATUS_LABEL[status]}</option>
              ))}
            </Select>
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!isDirty} loading={updateUser.isPending}>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
