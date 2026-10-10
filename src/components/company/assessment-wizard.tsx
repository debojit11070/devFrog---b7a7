"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { ProblemPicker, type SelectedProblem } from "@/components/company/problem-picker";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { apiRequest } from "@/lib/api/client";
import { useCreateAssessment } from "@/hooks/api/assessments";
import { assessmentWizardSchema, dollarsToCents, type AssessmentWizardValues } from "@/lib/validations/assessment";
import { cn, formatCurrency } from "@/lib/utils";

const STEPS = [
  { key: "details", label: "Details" },
  { key: "questions", label: "Questions" },
  { key: "review", label: "Review" },
] as const;

const STEP_FIELDS: Array<Array<FieldPath<AssessmentWizardValues>>> = [
  ["title", "description", "durationMin", "passingScore", "price"],
  ["problems"],
  [],
];

/** Three-step assessment builder. Each step validates before moving on. */
export function AssessmentWizard() {
  const router = useRouter();
  const createAssessment = useCreateAssessment();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);

  const form = useForm<AssessmentWizardValues>({
    resolver: zodResolver(assessmentWizardSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      durationMin: "60",
      passingScore: "60",
      price: "0",
      problems: [],
    },
  });

  const {
    register,
    control,
    trigger,
    watch,
    getValues,
    formState: { errors },
  } = form;

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function save(publish: boolean) {
    const valid = await trigger();
    if (!valid) {
      // Jump to the first step that has a problem so the user can see it.
      const firstInvalid = STEP_FIELDS.findIndex((fields) => fields.some((field) => form.getFieldState(field).error));
      if (firstInvalid >= 0) setStep(firstInvalid);
      return;
    }

    const values = getValues();
    setSubmitting(publish ? "publish" : "draft");
    try {
      const created = await createAssessment.mutateAsync({
        title: values.title.trim(),
        description: values.description.trim(),
        durationMin: Number(values.durationMin),
        passingScore: Number(values.passingScore),
        priceCents: dollarsToCents(values.price),
        currency: "usd",
        problems: values.problems.map((item, index) => ({
          problemId: item.problemId,
          order: index,
          points: Number(item.points),
        })),
      });

      if (publish) {
        await apiRequest(`/assessments/${created.id}/status`, { method: "PATCH", body: { status: "PUBLISHED" } });
        toast.success("Assessment published. Candidates can now be invited.");
      } else {
        toast.success("Draft saved");
      }
      router.push(`/company/assessments/${created.id}`);
      router.refresh();
    } catch {
      // The global mutation handler has already shown the error.
    } finally {
      setSubmitting(null);
    }
  }

  const values = watch();
  const priceCents = values.price && /^\d+(\.\d{1,2})?$/.test(values.price) ? dollarsToCents(values.price) : 0;
  // Array-level rules (such as "at least one question") surface as root or message errors.
  const problemsError = errors.problems as { message?: string; root?: { message?: string } } | undefined;

  return (
    <div className="flex flex-col gap-6">
      <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
        {STEPS.map((item, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <li key={item.key} className="flex flex-col gap-2" aria-current={current ? "step" : undefined}>
              <div className={cn("h-1.5 rounded-full transition-colors", done || current ? "bg-primary" : "bg-muted")} />
              <span className={cn("flex items-center gap-2 text-xs font-medium sm:text-sm", current ? "text-foreground" : "text-muted-foreground")}>
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[11px]",
                    done ? "bg-primary text-primary-foreground" : current ? "bg-secondary text-primary" : "bg-muted",
                  )}
                >
                  {done ? <Check className="size-3" aria-hidden /> : index + 1}
                </span>
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>

      <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-6">
        {step === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Assessment details</CardTitle>
              <CardDescription>What the assessment is for, how long it runs and what it costs candidates.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField id="title" label="Title" error={errors.title} className="sm:col-span-2">
                <Input placeholder="e.g. Junior Backend Engineer" {...fieldAria("title", errors.title)} {...register("title")} />
              </FormField>
              <FormField id="description" label="Description" error={errors.description} className="sm:col-span-2">
                <Textarea rows={4} placeholder="What skills does this test? What should candidates expect?" {...fieldAria("description", errors.description)} {...register("description")} />
              </FormField>
              <FormField id="durationMin" label="Duration (minutes)" error={errors.durationMin} hint="5 to 360">
                <Input inputMode="numeric" {...fieldAria("durationMin", errors.durationMin, true)} {...register("durationMin")} />
              </FormField>
              <FormField id="passingScore" label="Passing score (%)" error={errors.passingScore} hint="0 to 100">
                <Input inputMode="numeric" {...fieldAria("passingScore", errors.passingScore, true)} {...register("passingScore")} />
              </FormField>
              <FormField id="price" label="Price (USD)" error={errors.price} hint="Use 0 for a free assessment" className="sm:col-span-2">
                <Input inputMode="decimal" {...fieldAria("price", errors.price, true)} {...register("price")} />
              </FormField>
            </CardContent>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Choose questions</CardTitle>
              <CardDescription>Pick questions from your bank and set how many points each is worth.</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="problems"
                render={({ field }) => (
                  <ProblemPicker
                    selected={field.value as SelectedProblem[]}
                    onChange={field.onChange}
                    error={problemsError?.root?.message ?? problemsError?.message}
                  />
                )}
              />
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>Review</CardTitle>
              <CardDescription>Save as a draft to keep editing, or publish now to start inviting candidates.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Title</dt>
                  <dd className="mt-1 font-medium">{values.title || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Duration</dt>
                  <dd className="mt-1">{values.durationMin} minutes</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Passing score</dt>
                  <dd className="mt-1">{values.passingScore}%</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Price</dt>
                  <dd className="mt-1">{priceCents === 0 ? "Free" : formatCurrency(priceCents)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Questions</dt>
                  <dd className="mt-1">
                    {values.problems.length} · {values.problems.reduce((sum, item) => sum + (Number(item.points) || 0), 0)} points
                  </dd>
                </div>
              </dl>
              <ol className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {values.problems.map((item, index) => (
                  <li key={item.problemId} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="truncate"><span className="mr-2 text-muted-foreground">{index + 1}.</span>{item.title}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{item.points} pts</span>
                  </li>
                ))}
              </ol>
              <Select aria-label="Currency" value="usd" disabled className="sm:w-40">
                <option value="usd">USD</option>
              </Select>
            </CardContent>
          </Card>
        ) : null}

        <CardFooter className="sticky bottom-0 -mx-4 flex-col-reverse gap-2 border-t border-border bg-card/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex w-full gap-2 sm:w-auto">
            <Button type="button" variant="outline" asChild className="flex-1 sm:flex-none">
              <Link href="/company/assessments">Cancel</Link>
            </Button>
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)} className="flex-1 sm:flex-none">
                <ChevronLeft aria-hidden />
                Back
              </Button>
            ) : null}
          </div>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} className="w-full sm:w-auto">
              Continue
              <ChevronRight aria-hidden />
            </Button>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button type="button" variant="outline" onClick={() => save(false)} loading={submitting === "draft"} disabled={submitting !== null}>
                <Save aria-hidden />
                Save draft
              </Button>
              <Button type="button" onClick={() => save(true)} loading={submitting === "publish"} disabled={submitting !== null}>
                <Send aria-hidden />
                Publish now
              </Button>
            </div>
          )}
        </CardFooter>
      </form>
    </div>
  );
}
