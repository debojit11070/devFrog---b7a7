"use client";

import { ClipboardCheck } from "lucide-react";
import { AssessmentCard } from "@/components/marketing/assessment-card";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/form-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssessments, type AssessmentListParams } from "@/hooks/api/assessments";
import { useUrlState } from "@/hooks/use-url-state";

type Pricing = "all" | "free" | "paid";
type SortKey = "newest" | "oldest" | "price-low" | "price-high";

const SORT_MAP: Record<SortKey, Pick<AssessmentListParams, "sortBy" | "order">> = {
  newest: { sortBy: "createdAt", order: "desc" },
  oldest: { sortBy: "createdAt", order: "asc" },
  "price-low": { sortBy: "priceCents", order: "asc" },
  "price-high": { sortBy: "priceCents", order: "desc" },
};

function isSortKey(value: string): value is SortKey {
  return value in SORT_MAP;
}

/**
 * Public catalog. Search, pricing, sort and page are all stored in the URL,
 * so a filtered view can be bookmarked or shared.
 */
export function AssessmentCatalog() {
  const { get, update, page, limit } = useUrlState();

  const search = get("q");
  const pricing = (get("pricing") || "all") as Pricing;
  const sortValue = get("sort");
  const sort: SortKey = isSortKey(sortValue) ? sortValue : "newest";

  const query = useAssessments({
    page,
    limit,
    search: search || undefined,
    minPrice: pricing === "paid" ? 1 : undefined,
    maxPrice: pricing === "free" ? 0 : undefined,
    ...SORT_MAP[sort],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          label="Search assessments"
          placeholder="Search by title or topic"
          value={search}
          onValueChange={(value) => update({ q: value })}
        />
        <div className="grid grid-cols-2 gap-3 sm:ml-auto sm:flex">
          <Select
            aria-label="Filter by price"
            value={pricing}
            onChange={(event) => update({ pricing: event.target.value === "all" ? null : event.target.value })}
            className="sm:w-40"
          >
            <option value="all">All prices</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </Select>
          <Select
            aria-label="Sort assessments"
            value={sort}
            onChange={(event) => update({ sort: event.target.value === "newest" ? null : event.target.value })}
            className="sm:w-44"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </Select>
        </div>
      </div>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} title="Assessments couldn't be loaded" />
      ) : query.isPending ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading assessments">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : query.data.items.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardCheck}
            title="No assessments match these filters"
            description="Try a different search term or clear the filters."
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {query.data.items.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
          <Pagination meta={query.data.meta} onPageChange={(next) => update({ page: next })} />
        </>
      )}
    </div>
  );
}
