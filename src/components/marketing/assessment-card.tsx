import Link from "next/link";
import { Clock, Layers, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/card";
import type { Assessment } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

/** Public summary card used by the catalog and the home page. */
export function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const problemCount = assessment.problemCount ?? assessment.problems.length;
  const isFree = assessment.priceCents === 0;

  return (
    <Link
      href={`/assessments/${assessment.id}`}
      className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-raised"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">{assessment.title}</h3>
        <Badge tone={isFree ? "success" : "brand"} className="shrink-0">
          {isFree ? "Free" : formatCurrency(assessment.priceCents, assessment.currency)}
        </Badge>
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{assessment.description}</p>
      <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <div className="flex flex-col gap-1">
          <dt className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden />Time</dt>
          <dd className="font-medium text-foreground">{assessment.durationMin} min</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="flex items-center gap-1"><Layers className="size-3.5" aria-hidden />Questions</dt>
          <dd className="font-medium text-foreground">{problemCount}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="flex items-center gap-1"><Trophy className="size-3.5" aria-hidden />Pass</dt>
          <dd className="font-medium text-foreground">{assessment.passingScore}%</dd>
        </div>
      </dl>
    </Link>
  );
}
