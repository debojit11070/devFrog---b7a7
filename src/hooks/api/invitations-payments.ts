"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { Invitation, Payment, PaymentActionResult } from "@/lib/api/types";

export const invitationKeys = {
  mine: ["invitations", "mine"] as const,
};

export const paymentKeys = {
  mine: ["payments", "mine"] as const,
};

export function useMyInvitations() {
  return useQuery({
    queryKey: invitationKeys.mine,
    queryFn: () => apiRequest<{ items: Invitation[] }>("/invitations/me"),
    select: (data) => data.items,
  });
}

function useInvitationAction(action: "accept" | "decline") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiRequest<Invitation>(`/invitations/${action}`, { method: "POST", body: { invitationId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invitationKeys.mine }),
  });
}

export function useAcceptInvitation() {
  return useInvitationAction("accept");
}

export function useDeclineInvitation() {
  return useInvitationAction("decline");
}

export function useMyPayments() {
  return useQuery({
    queryKey: paymentKeys.mine,
    queryFn: () => apiRequest<{ items: Payment[] }>("/payments/me/list"),
    select: (data) => data.items,
    placeholderData: keepPreviousData,
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) =>
      apiRequest<PaymentActionResult>("/payments/initiate", {
        method: "POST",
        body: { assessmentId, purpose: "ASSESSMENT_FEE" },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: paymentKeys.mine }),
  });
}
