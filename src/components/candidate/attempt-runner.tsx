"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Clock, Send, Trophy } from "lucide-react";
import { CountdownTimer } from "@/components/candidate/countdown-timer";
import { PayButton } from "@/components/payments/pay-button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/form-controls";
import { apiRequest } from "@/lib/api/client";
import type { Answer, Assessment, AssessmentProblem, Attempt, Invitation, Problem } from "@/lib/api/types";
import { effectiveInvitationStatus } from "@/lib/domain/invitation-status";
import { cn, formatDateTime } from "@/lib/utils";
import { useAcceptInvitation, useDeclineInvitation, useMyInvitations, useMyPayments } from "@/hooks/api/invitations-payments";
import { useAssessment } from "@/hooks/api/assessments";
import { problemKeys } from "@/hooks/api/problems";
import { useMyAttempt, useStartAttempt, useSaveAnswer, useSubmitAttempt, type AnswerPayload } from "@/hooks/api/attempts";

/** Local, editable copy of one candidate's answer. */
interface Draft {
  mcqOption?: string;
  codeAnswer?: string;
  writtenAnswer?: string;
  codeLanguage?: string;
}

/**
 * Entry point for /candidate/attempts/[invitationId]. Works through the states an
 * invitation can be in, in order: accept, pay, start, take, then view the result.
 */
export function AttemptRunner({ invitationId }: { invitationId: string }) {
  const invitations = useMyInvitations();

  if (invitations.isError) {
    return <ErrorState error={invitations.error} onRetry={() => invitations.refetch()} title="Your invitation couldn't be loaded" />;
  }
  if (invitations.isPending) return <RunnerSkeleton />;

  const invitation = invitations.data.find((item) => item.id === invitationId);
  if (!invitation) {
    return (
      <Card>
        <EmptyState
          icon={AlertCircle}
          title="We couldn't find this invitation"
          description="It may have been removed, or it belongs to a different account."
          action={
            <Link href="/candidate/invitations" className={buttonVariants({ variant: "outline" })}>
              Back to invitations
            </Link>
          }
        />
      </Card>
    );
  }

  return <InvitationGate invitation={invitation} />;
}

function InvitationGate({ invitation }: { invitation: Invitation }) {
  const status = effectiveInvitationStatus(invitation);
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  if (status === "PENDING") {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={invitation.assessment.title} description="Accept this invitation to unlock the assessment." />
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Do you want to take this assessment?</CardTitle>
            <CardDescription>
              You will have {invitation.assessment.durationMin} minutes once you start. The pass mark is {invitation.assessment.passingScore}%.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => accept.mutate(invitation.id)} loading={accept.isPending}>
              <Check aria-hidden />
              Accept invitation
            </Button>
            <Button variant="outline" onClick={() => decline.mutate(invitation.id)} loading={decline.isPending}>
              Decline
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status !== "ACCEPTED") {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={invitation.assessment.title} />
        <Card className="max-w-2xl">
          <EmptyState
            icon={AlertCircle}
            title={status === "DECLINED" ? "You declined this invitation" : "This invitation has expired"}
            description={status === "DECLINED" ? "You can no longer start this assessment." : "Ask the company to send a new invitation."}
            action={
              <Link href="/candidate/invitations" className={buttonVariants({ variant: "outline" })}>
                Back to invitations
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return <AcceptedAssessment invitation={invitation} />;
}

function AcceptedAssessment({ invitation }: { invitation: Invitation }) {
  const payments = useMyPayments();
  const assessment = useAssessment(invitation.assessmentId);
  const attempt = useMyAttempt(invitation.assessmentId);

  if (payments.isError || assessment.isError || attempt.isError) {
    const error = payments.error ?? assessment.error ?? attempt.error;
    return <ErrorState error={error} title="This assessment couldn't be loaded" onRetry={() => { void payments.refetch(); void assessment.refetch(); void attempt.refetch(); }} />;
  }
  if (payments.isPending || assessment.isPending || attempt.isPending) return <RunnerSkeleton />;

  const isPaid =
    invitation.assessment.priceCents === 0 ||
    payments.data.some((payment) => payment.status === "SUCCEEDED" && payment.assessmentId === invitation.assessmentId);

  if (!isPaid) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={assessment.data.title} description="This is a paid assessment. Complete payment to start." />
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Payment required</CardTitle>
            <CardDescription>Payment is processed securely by Stripe. You will return here once it is complete.</CardDescription>
          </CardHeader>
          <CardContent>
            <PayButton assessmentId={invitation.assessmentId} priceCents={invitation.assessment.priceCents} currency={invitation.assessment.currency} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attempt.data) {
    return <StartCard invitation={invitation} assessment={assessment.data} />;
  }

  if (attempt.data.status !== "IN_PROGRESS") {
    return <AttemptResult attempt={attempt.data} assessment={assessment.data} />;
  }

  return <Runner attempt={attempt.data} assessment={assessment.data} />;
}

function StartCard({ invitation, assessment }: { invitation: Invitation; assessment: Assessment }) {
  const start = useStartAttempt();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={assessment.title} description={assessment.description} />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Ready when you are</CardTitle>
          <CardDescription>
            The timer starts as soon as you begin. You have {assessment.durationMin} minutes for {assessment.problems.length} questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center gap-2"><Clock className="size-4" aria-hidden />{assessment.durationMin} minutes</li>
            <li className="flex items-center gap-2"><Trophy className="size-4" aria-hidden />Pass mark {assessment.passingScore}%</li>
          </ul>
          <Button size="lg" className="w-full sm:w-auto" onClick={() => start.mutate(invitation)} loading={start.isPending}>
            Start assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function buildDrafts(answers: Answer[]): Record<string, Draft> {
  return Object.fromEntries(
    answers.map((answer) => [
      answer.problemId,
      {
        mcqOption: answer.mcqOption ?? undefined,
        codeAnswer: answer.codeAnswer ?? undefined,
        writtenAnswer: answer.writtenAnswer ?? undefined,
        codeLanguage: answer.codeLanguage ?? undefined,
      },
    ]),
  );
}

function isAnswered(draft: Draft | undefined): boolean {
  if (!draft) return false;
  return Boolean(draft.mcqOption || draft.codeAnswer?.trim() || draft.writtenAnswer?.trim());
}

function Runner({ attempt, assessment }: { attempt: Attempt; assessment: Assessment }) {
  const problems = useMemo(() => [...assessment.problems].sort((a, b) => a.order - b.order), [assessment.problems]);

  const details = useQueries({
    queries: problems.map((item) => ({
      queryKey: problemKeys.detail(item.problemId),
      queryFn: () => apiRequest<Problem>(`/problems/${item.problemId}`),
    })),
  });

  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => buildDrafts(attempt.answers ?? []));
  const [savedAt, setSavedAt] = useState<Record<string, number>>({});
  const [confirming, setConfirming] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const saveAnswer = useSaveAnswer(attempt.id, attempt.assessmentId);
  const submit = useSubmitAttempt(attempt.id, attempt.assessmentId);

  const persist = useCallback(
    async (problemId: string, payload: Omit<AnswerPayload, "problemId">) => {
      try {
        await saveAnswer.mutateAsync({ problemId, ...payload });
        setSavedAt((previous) => ({ ...previous, [problemId]: Date.now() }));
      } catch {
        // The global mutation handler shows the error; the draft stays on screen so nothing is lost.
      }
    },
    [saveAnswer],
  );

  const updateDraft = useCallback((problemId: string, patch: Draft) => {
    setDrafts((previous) => ({ ...previous, [problemId]: { ...previous[problemId], ...patch } }));
  }, []);

  const submitAttempt = submit.mutate;
  const handleTimeUp = useCallback(() => {
    setTimeUp(true);
    submitAttempt(undefined, {
      onSuccess: () => toast.info("Time is up. Your answers were submitted automatically."),
    });
  }, [submitAttempt]);

  const answeredCount = problems.filter((item) => isAnswered(drafts[item.problemId])).length;
  const busy = submit.isPending || saveAnswer.isPending;
  const locked = timeUp || submit.isPending;
  const current = problems[index];
  const currentDetail = details[index];

  if (problems.length === 0) {
    return <EmptyState icon={AlertCircle} title="This assessment has no questions yet" description="Please contact the company." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Assessment in progress</p>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{assessment.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <CountdownTimer expiresAt={attempt.expiresAt} onExpire={handleTimeUp} />
          <Button onClick={() => setConfirming(true)} disabled={locked} loading={submit.isPending}>
            <Send aria-hidden />
            Submit
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {answeredCount} of {problems.length} answered
        {timeUp ? " · Time is up, submitting…" : ""}
      </p>

      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Questions" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <ol className="flex gap-2 lg:flex-col">
            {problems.map((item, position) => {
              const answered = isAnswered(drafts[item.problemId]);
              const active = position === index;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setIndex(position)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex min-w-[10rem] items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition lg:w-full",
                      active ? "border-primary bg-secondary" : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        answered ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {answered ? <Check className="size-3.5" aria-hidden /> : position + 1}
                    </span>
                    <span className="truncate">
                      <span className="sr-only">{answered ? "Answered: " : "Not answered: "}</span>
                      {item.problem.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section aria-label={`Question ${index + 1}`} className="flex min-w-0 flex-col gap-4">
          {currentDetail?.isError ? (
            <ErrorState error={currentDetail.error} onRetry={() => currentDetail.refetch()} title="This question couldn't be loaded" />
          ) : !currentDetail || currentDetail.isPending ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : (
            <QuestionPanel
              key={current.problemId}
              item={current}
              problem={currentDetail.data}
              number={index + 1}
              draft={drafts[current.problemId]}
              disabled={locked || busy}
              savedAt={savedAt[current.problemId]}
              onUpdate={(patch) => updateDraft(current.problemId, patch)}
              onPersist={(payload) => persist(current.problemId, payload)}
            />
          )}

          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
              <ChevronLeft aria-hidden />
              Previous
            </Button>
            <Button variant="outline" onClick={() => setIndex((value) => Math.min(problems.length - 1, value + 1))} disabled={index === problems.length - 1}>
              Next
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Submit your assessment?"
        description={
          answeredCount === problems.length
            ? "You have answered every question. Once submitted you cannot change your answers."
            : `${problems.length - answeredCount} question${problems.length - answeredCount === 1 ? " is" : "s are"} still unanswered. Once submitted you cannot change your answers.`
        }
        confirmLabel="Submit"
        loading={submit.isPending}
        onConfirm={() => {
          submit.mutate(undefined, { onSuccess: () => setConfirming(false) });
        }}
      />
    </div>
  );
}

function QuestionPanel({
  item,
  problem,
  number,
  draft,
  disabled,
  savedAt,
  onUpdate,
  onPersist,
}: {
  item: AssessmentProblem;
  problem: Problem;
  number: number;
  draft: Draft | undefined;
  disabled: boolean;
  savedAt: number | undefined;
  onUpdate: (patch: Draft) => void;
  onPersist: (payload: Omit<AnswerPayload, "problemId">) => Promise<void>;
}) {
  const [text, setText] = useState(() => {
    if (problem.type === "CODING") return draft?.codeAnswer ?? problem.starterCode ?? "";
    if (problem.type === "WRITTEN") return draft?.writtenAnswer ?? "";
    return "";
  });
  const [lastSaved, setLastSaved] = useState(text);
  const dirty = text !== lastSaved;

  async function saveText() {
    if (!dirty) return;
    if (problem.type === "CODING") {
      await onPersist({ codeAnswer: text, codeLanguage: problem.language ?? "javascript" });
      onUpdate({ codeAnswer: text, codeLanguage: problem.language ?? "javascript" });
    } else {
      await onPersist({ writtenAnswer: text });
      onUpdate({ writtenAnswer: text });
    }
    setLastSaved(text);
  }

  async function chooseOption(option: string) {
    onUpdate({ mcqOption: option });
    await onPersist({ mcqOption: option });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">Question {number}</Badge>
          <StatusBadge value={problem.type} />
          <StatusBadge value={problem.difficulty} />
          <Badge tone="neutral">{item.points} pts</Badge>
        </div>
        <CardTitle className="mt-2 text-lg">{problem.title}</CardTitle>
        <CardDescription className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{problem.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {problem.type === "MCQ" ? (
          <fieldset className="flex flex-col gap-2" disabled={disabled}>
            <legend className="sr-only">Choose one answer</legend>
            {(problem.options ?? []).map((option) => {
              const selected = draft?.mcqOption === option;
              return (
                <label
                  key={option}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 text-sm transition",
                    selected ? "border-primary bg-secondary/60" : "border-border hover:bg-muted/50",
                    disabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  <input
                    type="radio"
                    name={`mcq-${problem.id}`}
                    value={option}
                    checked={selected}
                    onChange={() => void chooseOption(option)}
                    className="size-4 accent-primary"
                  />
                  {option}
                </label>
              );
            })}
          </fieldset>
        ) : null}

        {problem.type === "CODING" ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={`code-${problem.id}`} className="text-sm font-medium">
              Your solution ({problem.language ?? "code"})
            </label>
            <Textarea
              id={`code-${problem.id}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onBlur={() => void saveText()}
              disabled={disabled}
              spellCheck={false}
              rows={14}
              className="min-h-72 font-mono text-[13px] leading-relaxed"
            />
          </div>
        ) : null}

        {problem.type === "WRITTEN" ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={`written-${problem.id}`} className="text-sm font-medium">Your answer</label>
            <Textarea
              id={`written-${problem.id}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onBlur={() => void saveText()}
              disabled={disabled}
              rows={8}
              placeholder="Explain your reasoning in your own words."
            />
          </div>
        ) : null}

        {problem.type !== "MCQ" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {savedAt ? `Saved at ${formatDateTime(new Date(savedAt).toISOString())}` : dirty ? "Unsaved changes" : "Answers save when you leave the box."}
            </p>
            <Button variant="outline" size="sm" onClick={() => void saveText()} disabled={disabled || !dirty}>
              Save answer
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {savedAt ? `Saved at ${formatDateTime(new Date(savedAt).toISOString())}` : "Selecting an option saves it immediately."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AttemptResult({ attempt, assessment }: { attempt: Attempt; assessment: Assessment }) {
  const titles = new Map(assessment.problems.map((item) => [item.problemId, item.problem.title]));
  const hasManual = (attempt.answers ?? []).some((answer) => answer.isCorrect === null);
  const percent = attempt.score !== null && attempt.totalPoints ? Math.round((attempt.score / attempt.totalPoints) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={assessment.title} description="Your attempt has been submitted." />
      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={attempt.status} />
            {attempt.passed !== null ? (
              <Badge tone={attempt.passed ? "success" : "danger"}>{attempt.passed ? "Passed" : "Not passed"}</Badge>
            ) : null}
          </div>
          <CardTitle className="mt-2 text-3xl tabular-nums">
            {attempt.score ?? "—"}
            <span className="text-lg font-medium text-muted-foreground"> / {attempt.totalPoints ?? "—"} pts{percent !== null ? ` · ${percent}%` : ""}</span>
          </CardTitle>
          <CardDescription>
            Submitted {formatDateTime(attempt.submittedAt)}.
            {hasManual ? " Coding and written answers are reviewed by the company, and the final score may change." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="divide-y divide-border rounded-lg border border-border">
            {(attempt.answers ?? []).map((answer, position) => (
              <li key={answer.id} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium">
                  <span className="mr-2 text-muted-foreground">{position + 1}.</span>
                  {titles.get(answer.problemId) ?? "Question"}
                </span>
                <span className="text-muted-foreground">
                  {answer.isCorrect === null ? "Awaiting review" : answer.isCorrect ? "Correct" : "Incorrect"}
                  {answer.pointsAwarded ? ` · ${answer.pointsAwarded} pts` : ""}
                </span>
                {answer.feedback ? <p className="text-xs text-muted-foreground sm:basis-full">Feedback: {answer.feedback}</p> : null}
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/candidate/invitations" className={buttonVariants({ variant: "outline" })}>Back to invitations</Link>
            <Link href="/candidate" className={buttonVariants({ variant: "ghost" })}>Go to overview</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RunnerSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading assessment">
      <Skeleton className="h-10 w-2/3" />
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}
