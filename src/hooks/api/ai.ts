"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { AiAssessmentItem, AiRecommendations, AiSuggestions } from "@/lib/api/types";

export const aiKeys = {
  suggest: (q: string, limit: number) => ["ai", "suggest", q, limit] as const,
  recommendations: (assessmentId: string | undefined, limit: number) => ["ai", "recommendations", assessmentId ?? "none", limit] as const,
};

/** Search autocomplete. Only runs once the query is long enough for the API (2+ characters). */
export function useAiSuggestions(query: string, limit = 5) {
  const q = query.trim();
  return useQuery({
    queryKey: aiKeys.suggest(q, limit),
    queryFn: () => apiRequest<AiSuggestions>("/ai/suggest", { query: { q, limit } }),
    enabled: q.length >= 2 && q.length <= 100,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: false,
  });
}

/** "Similar assessments"; personalized for a signed-in candidate. */
export function useAiRecommendations(options: { assessmentId?: string; limit?: number; enabled?: boolean } = {}) {
  const { assessmentId, limit = 4, enabled = true } = options;
  return useQuery({
    queryKey: aiKeys.recommendations(assessmentId, limit),
    queryFn: () => apiRequest<AiRecommendations>("/ai/recommendations", { query: { assessmentId, limit } }),
    enabled,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export type { AiAssessmentItem };
