"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, type QueryValue } from "@/lib/api/client";
import type { Assessment, AssessmentStatus, Invitation, Paginated } from "@/lib/api/types";

export interface AssessmentListParams {
  [key: string]: QueryValue;
  page?: number;
  limit?: number;
  status?: AssessmentStatus;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface AssessmentPayload {
  title: string;
  description: string;
  durationMin: number;
  passingScore: number;
  priceCents: number;
  currency: string;
  problems: Array<{ problemId: string; order: number; points: number }>;
}

export const assessmentKeys = {
  all: ["assessments"] as const,
  list: (params: AssessmentListParams) => ["assessments", "list", params] as const,
  detail: (id: string) => ["assessments", "detail", id] as const,
};

export function useAssessments(params: AssessmentListParams) {
  return useQuery({
    queryKey: assessmentKeys.list(params),
    queryFn: () =>
      apiRequest<Paginated<Assessment>>("/assessments", {
        query: { sortBy: "createdAt", order: "desc", ...params },
      }),
    placeholderData: keepPreviousData,
  });
}

export function useAssessment(id: string | undefined) {
  return useQuery({
    queryKey: assessmentKeys.detail(id ?? ""),
    queryFn: () => apiRequest<Assessment>(`/assessments/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssessmentPayload) => apiRequest<Assessment>("/assessments", { method: "POST", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assessmentKeys.all }),
  });
}

export function useUpdateAssessment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AssessmentPayload>) =>
      apiRequest<Assessment>(`/assessments/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assessmentKeys.all }),
  });
}

/** Publish, archive or revert an assessment. Takes the id per call so one hook serves a whole list. */
export function useSetAssessmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AssessmentStatus }) =>
      apiRequest<Assessment>(`/assessments/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: (_assessment, variables) => {
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
      void queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(variables.id) });
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest<unknown>(`/assessments/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assessmentKeys.all }),
  });
}

export function useInviteCandidate(assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { candidateEmail: string; expiresInHours: number }) =>
      apiRequest<Invitation>("/invitations", { method: "POST", body: { assessmentId, ...input } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(assessmentId) }),
  });
}
