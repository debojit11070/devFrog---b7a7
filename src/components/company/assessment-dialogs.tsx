"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/form-controls";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { useInviteCandidate, useUpdateAssessment } from "@/hooks/api/assessments";
import type { Assessment } from "@/lib/api/types";
import {
  assessmentDetailsSchema,
  dollarsToCents,
  inviteSchema,
  type InviteFormValues,
} from "@/lib/validations/assessment";
import { z } from "zod";

type DetailsValues = z.infer<typeof assessmentDetailsSchema>;

/** Edit title, description, timing, passing score and price of an existing assessment. */
export function EditAssessmentDialog({ assessment, onClose }: { assessment: Assessment; onClose: () => void }) {
  const update = useUpdateAssessment(assessment.id);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<DetailsValues>({
    resolver: zodResolver(assessmentDetailsSchema),
    defaultValues: {
      title: assessment.title,
      description: assessment.description,
      durationMin: String(assessment.durationMin),
      passingScore: String(assessment.passingScore),
      price: (assessment.priceCents / 100).toFixed(2).replace(/\.00$/, ""),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync({
        title: values.title.trim(),
        description: values.description.trim(),
        durationMin: Number(values.durationMin),
        passingScore: Number(values.passingScore),
        priceCents: dollarsToCents(values.price),
      });
    } catch {
      return;
    }
    onClose();
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit assessment</DialogTitle>
          <DialogDescription>Changes apply to candidates who have not started yet.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void onSubmit(event)} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormField id="edit-title" label="Title" error={errors.title} className="sm:col-span-2">
            <Input {...fieldAria("edit-title", errors.title)} {...register("title")} />
          </FormField>
          <FormField id="edit-description" label="Description" error={errors.description} className="sm:col-span-2">
            <Textarea rows={3} {...fieldAria("edit-description", errors.description)} {...register("description")} />
          </FormField>
          <FormField id="edit-duration" label="Duration (minutes)" error={errors.durationMin}>
            <Input inputMode="numeric" {...fieldAria("edit-duration", errors.durationMin)} {...register("durationMin")} />
          </FormField>
          <FormField id="edit-passing" label="Passing score (%)" error={errors.passingScore}>
            <Input inputMode="numeric" {...fieldAria("edit-passing", errors.passingScore)} {...register("passingScore")} />
          </FormField>
          <FormField id="edit-price" label="Price (USD)" error={errors.price} className="sm:col-span-2">
            <Input inputMode="decimal" {...fieldAria("edit-price", errors.price)} {...register("price")} />
          </FormField>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!isDirty} loading={update.isPending}>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Invite a candidate by email. The API resolves the email to the candidate's account internally. */
export function InviteCandidateDialog({ assessmentId, onClose }: { assessmentId: string; onClose: () => void }) {
  const invite = useInviteCandidate(assessmentId);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { candidateEmail: "", expiresInHours: "72" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await invite.mutateAsync({ candidateEmail: values.candidateEmail.trim(), expiresInHours: Number(values.expiresInHours) });
    } catch (error) {
      // "No candidate account found for that email" is a field problem, so show it next to the input too.
      if (error instanceof Error && /no candidate account/i.test(error.message)) {
        setError("candidateEmail", { message: error.message });
      }
      return;
    }
    onClose();
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a candidate</DialogTitle>
          <DialogDescription>
            Enter the candidate&apos;s email address. They will see the invitation on their dashboard and can accept or decline it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void onSubmit(event)} noValidate className="flex flex-col gap-4">
          <FormField id="candidateEmail" label="Candidate email" error={errors.candidateEmail} hint="Must belong to a registered candidate account.">
            <Input
              type="email"
              placeholder="candidate@example.com"
              {...fieldAria("candidateEmail", errors.candidateEmail, true)}
              {...register("candidateEmail")}
            />
          </FormField>
          <FormField id="expiresInHours" label="Expires in (hours)" error={errors.expiresInHours} hint="1 to 720 hours">
            <Input inputMode="numeric" {...fieldAria("expiresInHours", errors.expiresInHours, true)} {...register("expiresInHours")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={invite.isPending}>Send invitation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
