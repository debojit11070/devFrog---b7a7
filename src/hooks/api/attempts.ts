"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/error";
import type { Attempt, Answer, Invitation } from "@/lib/api/types";

export const attemptKeys = {
  mine: (assessmentId: string) => ["attempts", "mine", assessmentId] as const,
  forAssessment: (assessmentId: string) => ["attempts", "assessment", assessmentId] as const,
};

export interface AnswerPayload {
  problemId: string;
  mcqOption?: string;
  writtenAnswer?: string;
  codeAnswer?: string;
  codeLanguage?: string;
}

/** The candidate's attempt for an assessment, or null before one is started. */
export function useMyAttempt(assessmentId: string | undefined) {
  return useQuery({
    queryKey: attemptKeys.mine(assessmentId ?? ""),
    queryFn: async () => {
      try {
        return await apiRequest<Attempt & { answers: Answer[] }>(`/attempts/assessment/${assessmentId}/me`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(assessmentId),
    // The timer runs on the client; refetch only when the candidate returns to the tab.
    refetchOnWindowFocus: true,
  });
}

export function useStartAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitation: Pick<Invitation, "id" | "assessmentId">) =>
      apiRequest<Attempt>(`/attempts/start/${invitation.id}`, { method: "POST" }),
    onSuccess: (_attempt, invitation) =>
      queryClient.invalidateQueries({ queryKey: attemptKeys.mine(invitation.assessmentId) }),
  });
}

export function useSaveAnswer(attemptId: string, assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AnswerPayload) =>
      apiRequest<Answer>(`/attempts/${attemptId}/answer`, { method: "POST", body: payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attemptKeys.mine(assessmentId) }),
  });
}

export function useSubmitAttempt(attemptId: string, assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<Attempt & { answers: Answer[] }>(`/attempts/${attemptId}/submit`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attemptKeys.mine(assessmentId) }),
  });
}

/** Attempts across all candidates for one assessment (company owner or admin). */
export function useAssessmentAttempts(assessmentId: string | undefined) {
  return useQuery({
    queryKey: attemptKeys.forAssessment(assessmentId ?? ""),
    queryFn: () => apiRequest<{ items: Attempt[] }>(`/attempts/assessment/${assessmentId}/all`),
    enabled: Boolean(assessmentId),
    select: (data) => data.items,
  });
}

export interface ManualScorePayload {
  problemId: string;
  pointsAwarded: number;
  feedback?: string;
}

export function useEvaluateAttempt(attemptId: string, assessmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manualScores: ManualScorePayload[]) =>
      apiRequest<Attempt>(`/attempts/${attemptId}/evaluate`, { method: "POST", body: { manualScores } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attemptKeys.forAssessment(assessmentId) }),
  });
}
