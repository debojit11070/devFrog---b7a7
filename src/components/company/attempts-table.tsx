"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, Users } from "lucide-react";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Select } from "@/components/ui/form-controls";
import { usePagedRows } from "@/hooks/use-paged-rows";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/form-controls";
import { useAssessmentAttempts, useEvaluateAttempt } from "@/hooks/api/attempts";
import type { Assessment, Attempt } from "@/lib/api/types";
import { buildEvaluateSchema, type EvaluateFormValues, type ManualScoreTarget } from "@/lib/validations/attempt";
import { formatDateTime } from "@/lib/utils";

/** Lists every attempt for one assessment and lets the owner score manual questions. */
export function AttemptsTable({ assessment }: { assessment: Assessment }) {
  const query = useAssessmentAttempts(assessment.id);
  const [evaluating, setEvaluating] = useState<Attempt | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(
    () =>
      (query.data ?? []).filter(
        (row) =>
          (!status || row.status === status) &&
          (!search ||
            `${row.candidate?.fullName ?? ""} ${row.candidate?.email ?? ""}`.toLowerCase().includes(search.toLowerCase())),
      ),
    [query.data, search, status],
  );
  const paged = usePagedRows(filtered);

  const manualTargets: ManualScoreTarget[] = useMemo(
    () =>
      assessment.problems
        .filter((item) => item.problem.type !== "MCQ")
        .map((item) => ({ problemId: item.problemId, title: item.problem.title, maxPoints: item.points })),
    [assessment.problems],
  );

  const columns: Column<Attempt>[] = [
    {
      key: "candidate",
      header: "Candidate",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.candidate?.fullName ?? "Candidate"}</p>
          <p className="truncate text-xs text-muted-foreground">{row.candidate?.email}</p>
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge value={row.status} /> },
    {
      key: "score",
      header: "Score",
      hideOnMobile: true,
      cell: (row) =>
        row.score === null || row.totalPoints === null ? (
          <span className="text-muted-foreground">Pending</span>
        ) : (
          <span className="tabular-nums">
            {row.score} / {row.totalPoints}
          </span>
        ),
    },
    {
      key: "result",
      header: "Result",
      cell: (row) =>
        row.passed === null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <Badge tone={row.passed ? "success" : "danger"}>{row.passed ? "Passed" : "Not passed"}</Badge>
        ),
    },
    {
      key: "submitted",
      header: "Submitted",
      hideOnMobile: true,
      cell: (row) => <span className="text-muted-foreground">{formatDateTime(row.submittedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) =>
        row.status === "SUBMITTED" && manualTargets.length > 0 ? (
          <Button variant="outline" size="sm" onClick={() => setEvaluating(row)} aria-label={`Score attempt by ${row.candidate?.fullName ?? "candidate"}`}>
            <ClipboardCheck aria-hidden />
            Score
          </Button>
        ) : null,
    },
  ];

  if (query.isError) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} title="Attempts couldn't be loaded" />;
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          label="Search candidates"
          placeholder="Search by name or email"
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            paged.setPage(1);
          }}
        />
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            paged.setPage(1);
          }}
          className="sm:ml-auto sm:w-48"
        >
          <option value="">All statuses</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="EVALUATED">Evaluated</option>
          <option value="EXPIRED">Expired</option>
        </Select>
      </div>
      <DataTable
        caption={`Attempts for ${assessment.title}`}
        columns={columns}
        rows={paged.rows}
        rowKey={(row) => row.id}
        isLoading={query.isPending}
        empty={<EmptyState icon={Users} title="No attempts yet" description="Attempts appear here after candidates accept an invitation and start." />}
      />
      <div className="mt-4">
        <Pagination meta={paged.meta} onPageChange={paged.setPage} />
      </div>
      {evaluating ? (
        <EvaluateDialog
          attempt={evaluating}
          assessmentId={assessment.id}
          targets={manualTargets}
          onClose={() => setEvaluating(null)}
        />
      ) : null}
    </>
  );
}

function EvaluateDialog({
  attempt,
  assessmentId,
  targets,
  onClose,
}: {
  attempt: Attempt;
  assessmentId: string;
  targets: ManualScoreTarget[];
  onClose: () => void;
}) {
  const evaluate = useEvaluateAttempt(attempt.id, assessmentId);
  const schema = useMemo(() => buildEvaluateSchema(targets), [targets]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EvaluateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { scores: targets.map((target) => ({ problemId: target.problemId, points: "0", feedback: "" })) },
  });

  const { fields } = useFieldArray({ control, name: "scores" });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await evaluate.mutateAsync(
        values.scores.map((score) => ({
          problemId: score.problemId,
          pointsAwarded: Number(score.points),
          feedback: score.feedback.trim() || undefined,
        })),
      );
    } catch {
      return;
    }
    onClose();
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Score {attempt.candidate?.fullName ?? "candidate"}&apos;s attempt</DialogTitle>
          <DialogDescription>
            Multiple-choice answers are already graded. Award points for each open question and leave feedback the candidate can read.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void onSubmit(event)} noValidate className="flex flex-col gap-5">
          {fields.map((field, index) => {
            const target = targets[index];
            const fieldError = errors.scores?.[index];
            const pointsId = `score-${index}-points`;
            return (
              <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                <p className="text-sm font-medium">{target?.title}</p>
                <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                  <FormField id={pointsId} label={`Points (max ${target?.maxPoints ?? 0})`} error={fieldError?.points}>
                    <Input inputMode="numeric" {...fieldAria(pointsId, fieldError?.points)} {...register(`scores.${index}.points`)} />
                  </FormField>
                  <FormField id={`score-${index}-feedback`} label="Feedback" error={fieldError?.feedback}>
                    <Textarea rows={2} {...fieldAria(`score-${index}-feedback`, fieldError?.feedback)} {...register(`scores.${index}.feedback`)} />
                  </FormField>
                </div>
              </div>
            );
          })}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={evaluate.isPending}>Save scores</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
