"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { useCreateProblem, useUpdateProblem } from "@/hooks/api/problems";
import type { Problem } from "@/lib/api/types";
import { formatTestCases, problemFormSchema, toProblemPayload, type ProblemFormValues } from "@/lib/validations/problem";

const MONO = "font-mono text-[13px] leading-relaxed";

function toFormValues(problem: Problem | undefined): ProblemFormValues {
  return {
    title: problem?.title ?? "",
    description: problem?.description ?? "",
    type: problem?.type ?? "CODING",
    difficulty: problem?.difficulty ?? "EASY",
    tags: problem?.tags.join(", ") ?? "",
    points: String(problem?.points ?? 10),
    options: problem?.options?.join("\n") ?? "",
    correctOption: "",
    language: problem?.language ?? "javascript",
    starterCode: problem?.starterCode ?? "",
    testCases: formatTestCases(problem?.testCases),
    referenceAnswer: problem?.referenceAnswer ?? "",
    timeLimitSec: problem?.timeLimitSec ? String(problem.timeLimitSec) : "",
    memoryLimitMb: problem?.memoryLimitMb ? String(problem.memoryLimitMb) : "",
  };
}

/** Create and edit share one form. Type-specific fields appear only when they apply. */
export function ProblemForm({ problem }: { problem?: Problem }) {
  const router = useRouter();
  const createProblem = useCreateProblem();
  const updateProblem = useUpdateProblem(problem?.id ?? "");
  const isEdit = Boolean(problem);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProblemFormValues>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: toFormValues(problem),
  });

  const type = watch("type");

  const onSubmit = handleSubmit(async (values) => {
    const payload = toProblemPayload(values);
    try {
      if (isEdit) await updateProblem.mutateAsync(payload);
      else await createProblem.mutateAsync(payload);
    } catch {
      return;
    }
    toast.success(isEdit ? "Question updated" : "Question added to the bank");
    router.push("/company/problems");
    router.refresh();
  });

  const saving = isSubmitting || createProblem.isPending || updateProblem.isPending;

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Question details</CardTitle>
          <CardDescription>Visible to companies building assessments. Be specific about expected behaviour.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="title" label="Title" error={errors.title} className="sm:col-span-2">
            <Input placeholder="e.g. Reverse a linked list" {...fieldAria("title", errors.title)} {...register("title")} />
          </FormField>
          <FormField id="description" label="Description" error={errors.description} className="sm:col-span-2">
            <Textarea rows={5} {...fieldAria("description", errors.description)} {...register("description")} />
          </FormField>
          <FormField id="type" label="Question type" error={errors.type}>
            <Select {...fieldAria("type", errors.type)} {...register("type")}>
              <option value="CODING">Coding</option>
              <option value="MCQ">Multiple choice</option>
              <option value="WRITTEN">Written</option>
            </Select>
          </FormField>
          <FormField id="difficulty" label="Difficulty" error={errors.difficulty}>
            <Select {...fieldAria("difficulty", errors.difficulty)} {...register("difficulty")}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </Select>
          </FormField>
          <FormField id="points" label="Points" error={errors.points} hint="1 to 100">
            <Input inputMode="numeric" {...fieldAria("points", errors.points, true)} {...register("points")} />
          </FormField>
          <FormField id="tags" label="Tags" error={errors.tags} hint="Comma separated">
            <Input placeholder="arrays, strings" {...fieldAria("tags", errors.tags, true)} {...register("tags")} />
          </FormField>
        </CardContent>
      </Card>

      {type === "MCQ" ? (
        <Card>
          <CardHeader>
            <CardTitle>Answer options</CardTitle>
            <CardDescription>One option per line. The correct answer must match one of them exactly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField id="options" label="Options" error={errors.options}>
              <Textarea rows={5} placeholder={"O(n)\nO(1)\nO(log n)"} {...fieldAria("options", errors.options)} {...register("options")} />
            </FormField>
            <FormField id="correctOption" label="Correct option" error={errors.correctOption}>
              <Input placeholder="Copy one option exactly" {...fieldAria("correctOption", errors.correctOption)} {...register("correctOption")} />
            </FormField>
          </CardContent>
        </Card>
      ) : null}

      {type === "CODING" ? (
        <Card>
          <CardHeader>
            <CardTitle>Coding setup</CardTitle>
            <CardDescription>Test cases are compared against candidate output. Add [hidden] to keep a case private until evaluation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField id="language" label="Language" error={errors.language}>
              <Input placeholder="javascript" {...fieldAria("language", errors.language)} {...register("language")} />
            </FormField>
            <FormField id="timeLimitSec" label="Time limit (seconds)" hint="Optional">
              <Input inputMode="numeric" {...register("timeLimitSec")} />
            </FormField>
            <FormField id="memoryLimitMb" label="Memory limit (MB)" hint="Optional">
              <Input inputMode="numeric" {...register("memoryLimitMb")} />
            </FormField>
            <FormField id="starterCode" label="Starter code" className="sm:col-span-2">
              <Textarea rows={6} className={MONO} {...register("starterCode")} />
            </FormField>
            <FormField id="testCases" label="Test cases" error={errors.testCases} className="sm:col-span-2" hint="One per line: input => expected output">
              <Textarea
                rows={5}
                className={MONO}
                placeholder={"abc => cba\nhidden => neddih [hidden]"}
                {...fieldAria("testCases", errors.testCases, true)}
                {...register("testCases")}
              />
            </FormField>
          </CardContent>
        </Card>
      ) : null}

      {type === "WRITTEN" ? (
        <Card>
          <CardHeader>
            <CardTitle>Reference answer</CardTitle>
            <CardDescription>Used by reviewers as a guide when scoring. Optional, but it makes evaluation consistent.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="referenceAnswer" label="Reference answer" error={errors.referenceAnswer}>
              <Textarea rows={5} {...fieldAria("referenceAnswer", errors.referenceAnswer)} {...register("referenceAnswer")} />
            </FormField>
          </CardContent>
        </Card>
      ) : null}

      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-border bg-card/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="button" variant="outline" onClick={() => router.push("/company/problems")}>Cancel</Button>
        <Button type="submit" loading={saving}>{isEdit ? "Save changes" : "Add question"}</Button>
      </div>
    </form>
  );
}
