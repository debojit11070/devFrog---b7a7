import { Badge, type BadgeProps } from "@/components/ui/card";
import { humanize } from "@/lib/utils";

type Tone = NonNullable<BadgeProps["tone"]>;

const TONES: Record<string, Tone> = {
  // Assessments
  DRAFT: "neutral",
  PUBLISHED: "success",
  ARCHIVED: "warning",
  // Invitations
  PENDING: "info",
  ACCEPTED: "success",
  DECLINED: "danger",
  EXPIRED: "warning",
  // Attempts
  IN_PROGRESS: "info",
  SUBMITTED: "brand",
  EVALUATED: "success",
  // Payments
  SUCCEEDED: "success",
  FAILED: "danger",
  CANCELLED: "warning",
  REFUNDED: "neutral",
  // Users
  ACTIVE: "success",
  SUSPENDED: "danger",
  // Roles
  ADMIN: "brand",
  COMPANY: "info",
  CANDIDATE: "neutral",
  // Difficulty
  EASY: "success",
  MEDIUM: "warning",
  HARD: "danger",
  // Question type
  MCQ: "brand",
  CODING: "info",
  WRITTEN: "neutral",
};

/** One badge for every status-like enum in the API. Unknown values fall back to neutral. */
export function StatusBadge({ value, label }: { value: string; label?: string }) {
  return <Badge tone={TONES[value] ?? "neutral"}>{label ?? humanize(value)}</Badge>;
}
