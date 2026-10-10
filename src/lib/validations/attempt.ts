import { z } from "zod";

export interface ManualScoreTarget {
  problemId: string;
  title: string;
  maxPoints: number;
}

/**
 * Builds the evaluation schema for one attempt. The max score per question is
 * only known at runtime, so the schema is created from the assessment's problems.
 */
export function buildEvaluateSchema(targets: ManualScoreTarget[]) {
  return z.object({
    scores: z.array(
      z.object({
        problemId: z.string(),
        points: z.string().regex(/^\d+$/, "Enter a whole number"),
        feedback: z.string().trim().max(500, "Feedback must be 500 characters or fewer"),
      }),
    ).superRefine((scores, ctx) => {
      scores.forEach((score, index) => {
        const target = targets.find((item) => item.problemId === score.problemId);
        if (!target) return;
        const value = Number(score.points);
        if (value > target.maxPoints) {
          ctx.addIssue({
            code: "custom",
            path: [index, "points"],
            message: `Maximum for this question is ${target.maxPoints}`,
          });
        }
      });
    }),
  });
}

export type EvaluateFormValues = z.infer<ReturnType<typeof buildEvaluateSchema>>;
