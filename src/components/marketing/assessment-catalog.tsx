"use client";

import { useMemo } from "react";
import { ClipboardCheck, FilterX } from "lucide-react";
import { AssessmentCard, AssessmentCardSkeleton } from "@/components/marketing/assessment-card";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/form-controls";
import { useAssessments } from "@/hooks/api/assessments";
import { useUrlState } from "@/hooks/use-url-state";
import type { Assessment } from "@/lib/api/types";

const PAGE_SIZE = 8; // two rows of four on desktop

type SortKey = "newest" | "oldest" | "price-low" | "price-high" | "title" | "duration";

const SORTERS: Record<SortKey, (a: Assessment, b: Assessment) => number> = {
  newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  oldest: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  "price-low": (a, b) => a.priceCents - b.priceCents,
  "price-high": (a, b) => b.priceCents - a.priceCents,
  title: (a, b) => a.title.localeCompare(b.title),
  duration: (a, b) => a.durationMin - b.durationMin,
};

const DURATION_RANGES: Record<string, (minutes: number) => boolean> = {
  short: (m) => m <= 30,
  medium: (m) => m > 30 && m <= 60,
  long: (m) => m > 60,
};

const SIZE_RANGES: Record<string, (count: number) => boolean> = {
  small: (n) => n <= 5,
  medium: (n) => n > 5 && n <= 10,
  large: (n) => n > 10,
};

const PASS_RANGES: Record<string, (score: number) => boolean> = {
  easy: (n) => n < 60,
  standard: (n) => n >= 60 && n < 75,
  strict: (n) => n >= 75,
};

function isSortKey(value: string): value is SortKey {
  return value in SORTERS;
}

/**
 * Public catalog. Search and price go to the API; question type, difficulty,
 * duration and sorting run on the fetched set. Everything lives in the URL,
 * so a filtered view can be bookmarked or shared.
 */
export function AssessmentCatalog() {
  const { get, update, getInt } = useUrlState();

  const search = get("q");
  const pricing = get("pricing") || "all";
  const size = get("size") || "all";
  const passMark = get("pass") || "all";
  const duration = get("duration") || "all";
  const sortValue = get("sort");
  const sort: SortKey = isSortKey(sortValue) ? sortValue : "newest";
  const page = getInt("page", 1);

  const query = useAssessments({
    page: 1,
    limit: 100,
    search: search || undefined,
    minPrice: pricing === "paid" ? 1 : undefined,
    maxPrice: pricing === "free" ? 0 : undefined,
  });

  const filtered = useMemo(() => {
    const items = query.data?.items ?? [];
    return items
      .filter((item) => size === "all" || (SIZE_RANGES[size]?.(item.problemCount ?? item.problems.length) ?? true))
      .filter((item) => passMark === "all" || (PASS_RANGES[passMark]?.(item.passingScore) ?? true))
      .filter((item) => duration === "all" || (DURATION_RANGES[duration]?.(item.durationMin) ?? true))
      .sort(SORTERS[sort]);
  }, [query.data, size, passMark, duration, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = Boolean(search) || [pricing, size, passMark, duration].some((value) => value !== "all") || sort !== "newest";

  const setFilter = (key: string) => (event: React.ChangeEvent<HTMLSelectElement>) =>
    update({ [key]: event.target.value === "all" ? null : event.target.value });

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-4 sm:p-5">
        <SearchInput
          label="Search assessments"
          placeholder="Search by title or topic"
          value={search}
          onValueChange={(value) => update({ q: value })}
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Select aria-label="Filter by price" value={pricing} onChange={setFilter("pricing")}>
            <option value="all">Any price</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </Select>
          <Select aria-label="Filter by number of questions" value={size} onChange={setFilter("size")}>
            <option value="all">Any length</option>
            <option value="small">Up to 5 questions</option>
            <option value="medium">6 – 10 questions</option>
            <option value="large">More than 10</option>
          </Select>
          <Select aria-label="Filter by pass mark" value={passMark} onChange={setFilter("pass")}>
            <option value="all">Any pass mark</option>
            <option value="easy">Under 60%</option>
            <option value="standard">60 – 74%</option>
            <option value="strict">75% or higher</option>
          </Select>
          <Select aria-label="Filter by duration" value={duration} onChange={setFilter("duration")}>
            <option value="all">Any duration</option>
            <option value="short">30 min or less</option>
            <option value="medium">31 – 60 min</option>
            <option value="long">Over 60 min</option>
          </Select>
          <Select aria-label="Sort assessments" value={sort} onChange={setFilter("sort")} className="md:col-span-1 xl:col-span-1">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="title">Title: A to Z</option>
            <option value="duration">Shortest first</option>
          </Select>
          <Button
            variant="outline"
            disabled={!hasFilters}
            onClick={() => update({ q: null, pricing: null, size: null, pass: null, duration: null, sort: null })}
          >
            <FilterX aria-hidden /> Clear
          </Button>
        </div>
      </Card>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} title="Assessments couldn't be loaded" />
      ) : query.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading assessments">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <AssessmentCardSkeleton key={index} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardCheck}
            title="No assessments match these filters"
            description="Try a different search term or clear the filters."
          />
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} assessment{filtered.length === 1 ? "" : "s"} found
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((assessment) => (
              <AssessmentCard key={assessment.id} assessment={assessment} />
            ))}
          </div>
          <Pagination
            meta={{ page: currentPage, limit: PAGE_SIZE, total: filtered.length, totalPages }}
            onPageChange={(next) => update({ page: next })}
          />
        </>
      )}
    </div>
  );
}
