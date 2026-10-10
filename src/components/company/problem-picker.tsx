"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { useProblems } from "@/hooks/api/problems";
import type { Problem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export interface SelectedProblem {
  problemId: string;
  title: string;
  points: string;
}

/**
 * Two-column picker: search the question bank on the left, review and order the
 * selection on the right. Points default to each question's own value and can be overridden.
 */
export function ProblemPicker({
  selected,
  onChange,
  error,
}: {
  selected: SelectedProblem[];
  onChange: (next: SelectedProblem[]) => void;
  error?: string;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useProblems({ page, limit: 6, search: search || undefined });
  const selectedIds = new Set(selected.map((item) => item.problemId));

  function add(problem: Problem) {
    if (selectedIds.has(problem.id)) return;
    onChange([...selected, { problemId: problem.id, title: problem.title, points: String(problem.points) }]);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= selected.length) return;
    const next = [...selected];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function updatePoints(index: number, points: string) {
    onChange(selected.map((item, position) => (position === index ? { ...item, points } : item)));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="bank-heading" className="flex min-w-0 flex-col gap-3">
        <h3 id="bank-heading" className="text-sm font-semibold">Question bank</h3>
        <SearchInput
          label="Search questions to add"
          placeholder="Search questions"
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        {query.isPending ? (
          <div className="flex flex-col gap-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : (query.data?.items.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No questions match. Add some in the question bank first.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(query.data?.items ?? []).map((problem) => {
              const isAdded = selectedIds.has(problem.id);
              return (
                <li key={problem.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{problem.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <StatusBadge value={problem.type} />
                      <StatusBadge value={problem.difficulty} />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isAdded ? "secondary" : "outline"}
                    onClick={() => add(problem)}
                    disabled={isAdded}
                    aria-label={isAdded ? `${problem.title} already added` : `Add ${problem.title}`}
                  >
                    {isAdded ? <Check aria-hidden /> : <Plus aria-hidden />}
                    {isAdded ? "Added" : "Add"}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
        {query.data && query.data.meta.totalPages > 1 ? (
          <div className="flex items-center justify-between text-sm">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-muted-foreground">Page {page} of {query.data.meta.totalPages}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= query.data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="selected-heading" className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 id="selected-heading" className="text-sm font-semibold">Assessment questions</h3>
          <span className="text-xs text-muted-foreground" aria-live="polite">{selected.length} selected</span>
        </div>
        {selected.length === 0 ? (
          <p className={cn("rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground", error ? "border-destructive/50" : "border-border")}>
            Add at least one question from the bank.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {selected.map((item, index) => (
              <li key={item.problemId} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {index + 1}
                  </span>
                  <p className="truncate text-sm font-medium">{item.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`points-${item.problemId}`}>Points for {item.title}</label>
                  <Input
                    id={`points-${item.problemId}`}
                    inputMode="numeric"
                    value={item.points}
                    onChange={(event) => updatePoints(index, event.target.value)}
                    className="h-9 w-20 text-center"
                    aria-label={`Points for ${item.title}`}
                  />
                  <span className="text-xs text-muted-foreground">pts</span>
                  <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                    <ArrowUp aria-hidden />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => move(index, 1)} disabled={index === selected.length - 1} aria-label="Move down">
                    <ArrowDown aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-destructive hover:text-destructive"
                    onClick={() => onChange(selected.filter((_, position) => position !== index))}
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
        {error ? (
          <p role="alert" className="text-xs font-medium text-destructive">{error}</p>
        ) : null}
      </section>
    </div>
  );
}
