"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, type QueryValue } from "@/lib/api/client";
import type { Paginated, Problem } from "@/lib/api/types";
import type { ProblemPayload } from "@/lib/validations/problem";

export interface ProblemListParams {
  [key: string]: QueryValue;
  page?: number;
  limit?: number;
  type?: string;
  difficulty?: string;
  search?: string;
}

export const problemKeys = {
  all: ["problems"] as const,
  list: (params: ProblemListParams) => ["problems", "list", params] as const,
  detail: (id: string) => ["problems", "detail", id] as const,
};

export function useProblems(params: ProblemListParams) {
  return useQuery({
    queryKey: problemKeys.list(params),
    queryFn: () => apiRequest<Paginated<Problem>>("/problems", { query: { sortBy: "createdAt", order: "desc", ...params } }),
    placeholderData: keepPreviousData,
  });
}

export function useProblem(id: string | undefined) {
  return useQuery({
    queryKey: problemKeys.detail(id ?? ""),
    queryFn: () => apiRequest<Problem>(`/problems/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProblemPayload) => apiRequest<Problem>("/problems", { method: "POST", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: problemKeys.all }),
  });
}

export function useUpdateProblem(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProblemPayload>) =>
      apiRequest<Problem>(`/problems/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: problemKeys.all }),
  });
}

export function useDeleteProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest<unknown>(`/problems/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: problemKeys.all }),
  });
}
