"use client";

import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiRecommendations } from "@/hooks/api/ai";
import type { AiAssessmentItem } from "@/lib/api/types";
import { formatCurrency, humanize } from "@/lib/utils";

function RecommendationCard({ item }: { item: AiAssessmentItem }) {
  const isFree = item.priceCents === 0;
  return (
    <Link
      href={`/assessments/${item.id}`}
      className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-raised"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">{item.title}</h3>
        <Badge tone={isFree ? "success" : "brand"} className="shrink-0">
          {isFree ? "Free" : formatCurrency(item.priceCents, item.currency)}
        </Badge>
      </div>
      {item.reason ? <p className="text-xs font-medium text-primary">{item.reason}</p> : null}
      {item.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <li key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden /> {item.durationMin} min
        </span>
        {item.difficulty ? <span>{humanize(item.difficulty)}</span> : null}
      </div>
    </Link>
  );
}

/**
 * AI "similar assessments" grid. On a detail page pass `assessmentId`; for a signed-in
 * candidate the API personalizes results from their history. Renders nothing when
 * there is nothing to show, so the page falls back gracefully.
 */
export function RecommendedAssessments({
  assessmentId,
  limit = 4,
  title,
  className,
}: {
  assessmentId?: string;
  limit?: number;
  title?: string;
  className?: string;
}) {
  const query = useAiRecommendations({ assessmentId, limit });

  if (query.isError) return null;
  if (!query.isPending && (query.data?.items.length ?? 0) === 0) return null;

  const heading = title ?? (query.data?.personalized ? "Recommended for you" : "Similar assessments");

  return (
    <section aria-labelledby="ai-recommendations-heading" className={className}>
      <h2 id="ai-recommendations-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <Sparkles className="size-5 text-primary" aria-hidden />
        {heading}
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy={query.isPending}>
        {query.isPending
          ? Array.from({ length: limit }).map((_, index) => <Skeleton key={index} className="h-44 rounded-xl" />)
          : query.data.items.map((item) => <RecommendationCard key={item.id} item={item} />)}
      </div>
    </section>
  );
}
