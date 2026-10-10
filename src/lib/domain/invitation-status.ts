import type { Invitation, InvitationStatus } from "@/lib/api/types";

/**
 * An invitation counts as expired when the server says so, or when a pending
 * invitation's expiry time has already passed (the server updates it lazily).
 */
export function effectiveInvitationStatus(invitation: Invitation): InvitationStatus {
  if (invitation.status === "PENDING" && new Date(invitation.expiresAt).getTime() < Date.now()) return "EXPIRED";
  return invitation.status;
}
