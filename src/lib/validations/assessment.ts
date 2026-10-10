import { z } from "zod";

const whole = (min: number, max: number, label: string) =>
  z
    .string()
    .regex(/^\d+$/, `${label} must be a whole number`)
    .refine((value) => Number(value) >= min && Number(value) <= max, `${label} must be between ${min} and ${max}`);

/** Step 1 of the assessment wizard. */
export const assessmentDetailsSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120, "Title is too long"),
  description: z.string().trim().min(10, "Describe the assessment in at least 10 characters"),
  durationMin: whole(5, 360, "Duration"),
  passingScore: whole(0, 100, "Passing score"),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a price such as 0, 15 or 19.99"),
});

/** Step 2 of the assessment wizard. */
export const assessmentProblemsSchema = z.object({
  problems: z
    .array(
      z.object({
        problemId: z.uuid(),
        title: z.string(),
        points: whole(1, 100, "Points"),
      }),
    )
    .min(1, "Add at least one problem"),
});

export const assessmentWizardSchema = assessmentDetailsSchema.extend(assessmentProblemsSchema.shape);

export type AssessmentWizardValues = z.infer<typeof assessmentWizardSchema>;

/** Converts a dollar string such as "19.99" to integer cents. */
export function dollarsToCents(value: string): number {
  return Math.round(Number(value) * 100);
}

export const inviteSchema = z.object({
  candidateEmail: z.email("Enter a valid email address"),
  expiresInHours: whole(1, 720, "Expiry"),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;
