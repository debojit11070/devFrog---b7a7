"use client";

import Link from "next/link";
import { useState } from "react";
import { Code2, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { useDeleteProblem, useProblems } from "@/hooks/api/problems";
import { useUrlState } from "@/hooks/use-url-state";
import type { Problem, QuestionType, Difficulty } from "@/lib/api/types";
import { cn, formatDate } from "@/lib/utils";

const TYPES: QuestionType[] = ["CODING", "MCQ", "WRITTEN"];
const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

function isQuestionType(value: string): value is QuestionType {
  return (TYPES as string[]).includes(value);
}

function isDifficulty(value: string): value is Difficulty {
  return (DIFFICULTIES as string[]).includes(value);
}

export function ProblemsTable() {
  const { get, update, page, limit } = useUrlState();
  const typeFilter = get("type");
  const difficultyFilter = get("difficulty");

  const query = useProblems({
    page,
    limit,
    search: get("q") || undefined,
    type: isQuestionType(typeFilter) ? typeFilter : undefined,
    difficulty: isDifficulty(difficultyFilter) ? difficultyFilter : undefined,
  });

  const [deleting, setDeleting] = useState<Problem | null>(null);
  const deleteProblem = useDeleteProblem();

  const columns: Column<Problem>[] = [
    {
      key: "title",
      header: "Question",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.title}</p>
          <p className="text-xs text-muted-foreground">Added {formatDate(row.createdAt)}</p>
        </div>
      ),
    },
    { key: "type", header: "Type", cell: (row) => <StatusBadge value={row.type} /> },
    { key: "difficulty", header: "Difficulty", hideOnMobile: true, cell: (row) => <StatusBadge value={row.difficulty} /> },
    { key: "points", header: "Points", hideOnMobile: true, cell: (row) => <span className="tabular-nums">{row.points}</span> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/company/problems/${row.id}`}
            aria-label={`Edit ${row.title}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <Pencil aria-hidden />
            <span className="hidden xl:inline">Edit</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            aria-label={`Delete ${row.title}`}
            onClick={() => setDeleting(row)}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Question bank"
        description="Reusable questions for your assessments. Add coding, multiple-choice and written questions once, then reuse them."
        actions={
          <Button asChild>
            <Link href="/company/problems/new">
              <Plus aria-hidden />
              New question
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput label="Search questions" placeholder="Search questions" value={get("q")} onValueChange={(value) => update({ q: value })} />
        <div className="grid grid-cols-2 gap-3 sm:ml-auto sm:flex">
          <Select aria-label="Filter by type" value={typeFilter} onChange={(event) => update({ type: event.target.value })} className="sm:w-40">
            <option value="">All types</option>
            <option value="CODING">Coding</option>
            <option value="MCQ">Multiple choice</option>
            <option value="WRITTEN">Written</option>
          </Select>
          <Select aria-label="Filter by difficulty" value={difficultyFilter} onChange={(event) => update({ difficulty: event.target.value })} className="sm:w-40">
            <option value="">All difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </Select>
        </div>
      </div>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} title="Questions couldn't be loaded" />
      ) : (
        <>
          <DataTable
            caption="Question bank"
            columns={columns}
            rows={query.data?.items ?? []}
            rowKey={(row) => row.id}
            isLoading={query.isPending}
            empty={
              <EmptyState
                icon={Code2}
                title="No questions match these filters"
                description="Adjust the filters, or add a new question to the bank."
                action={
                  <Button variant="outline" asChild>
                    <Link href="/company/problems/new">Add a question</Link>
                  </Button>
                }
              />
            }
          />
          <Pagination meta={query.data?.meta} onPageChange={(next) => update({ page: next })} />
        </>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this question?"
        description={`"${deleting?.title ?? ""}" will be removed from the bank. Assessments that already use it keep their copy until edited.`}
        confirmLabel="Delete question"
        destructive
        loading={deleteProblem.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteProblem.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
