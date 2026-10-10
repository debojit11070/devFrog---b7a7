"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, type QueryValue } from "@/lib/api/client";
import type {
  AdminStats,
  AuditLog,
  CandidateProfile,
  CompanyProfile,
  Paginated,
  Role,
  User,
  UserStatus,
} from "@/lib/api/types";

export const adminKeys = {
  stats: ["admin", "stats"] as const,
  users: ["admin", "users"] as const,
  audit: ["admin", "audit"] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => apiRequest<AdminStats>("/admin/dashboard-stats"),
  });
}

export interface AdminUserParams {
  [key: string]: QueryValue;
  page?: number;
  limit?: number;
  role?: Role;
  status?: UserStatus;
  search?: string;
}

export function useAdminUsers(params: AdminUserParams) {
  return useQuery({
    queryKey: [...adminKeys.users, params],
    queryFn: () => apiRequest<Paginated<User>>("/admin/users", { query: { sortBy: "createdAt", order: "desc", ...params } }),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; role?: Role; status?: UserStatus; fullName?: string }) =>
      apiRequest<User>(`/admin/users/${id}`, { method: "PATCH", body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users }),
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest<unknown>(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.users }),
  });
}

export interface AuditParams {
  [key: string]: QueryValue;
  page?: number;
  limit?: number;
}

export function useAuditLogs(params: AuditParams) {
  return useQuery({
    queryKey: [...adminKeys.audit, params],
    queryFn: () =>
      apiRequest<Paginated<AuditLog>>("/admin/audit-logs", { query: { sortBy: "createdAt", order: "desc", ...params } }),
    placeholderData: keepPreviousData,
  });
}

export type ProfileUpdate =
  | { kind: "account"; body: { fullName?: string; bio?: string | null; avatarUrl?: string | null } }
  | { kind: "candidate"; body: Partial<CandidateProfile> }
  | { kind: "company"; body: Partial<CompanyProfile> };

const PROFILE_PATHS = {
  account: "/users/me",
  candidate: "/users/candidates/me/profile",
  company: "/users/companies/me/profile",
} as const;

export function useUpdateProfile() {
  return useMutation({
    mutationFn: ({ kind, body }: ProfileUpdate) =>
      apiRequest<User | CandidateProfile | CompanyProfile>(PROFILE_PATHS[kind], { method: "PATCH", body }),
  });
}
