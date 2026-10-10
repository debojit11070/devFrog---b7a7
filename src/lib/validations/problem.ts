import { z } from "zod";
import type { QuestionType, TestCase } from "@/lib/api/types";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
const TYPES = ["MCQ", "WRITTEN", "CODING"] as const;

/** Raw form state. Numbers and lists stay as text until they are submitted. */
export const problemFormSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(120, "Title is too long"),
    description: z.string().trim().min(10, "Describe the problem in at least 10 characters"),
    type: z.enum(TYPES, { message: "Choose a question type" }),
    difficulty: z.enum(DIFFICULTIES, { message: "Choose a difficulty" }),
    tags: z.string().max(200, "Keep tags under 200 characters"),
    points: z
      .string()
      .regex(/^\d+$/, "Points must be a whole number")
      .refine((value) => Number(value) >= 1 && Number(value) <= 100, "Points must be between 1 and 100"),
    options: z.string(),
    correctOption: z.string(),
    language: z.string().trim(),
    starterCode: z.string(),
    testCases: z.string(),
    referenceAnswer: z.string(),
    timeLimitSec: z.string(),
    memoryLimitMb: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.type === "MCQ") {
      const options = parseLines(values.options);
      if (options.length < 2) {
        ctx.addIssue({ code: "custom", path: ["options"], message: "Add at least two options, one per line" });
      }
      if (!values.correctOption.trim()) {
        ctx.addIssue({ code: "custom", path: ["correctOption"], message: "Choose the correct option" });
      } else if (!options.includes(values.correctOption.trim())) {
        ctx.addIssue({ code: "custom", path: ["correctOption"], message: "The correct answer must match one option" });
      }
    }

    if (values.type === "CODING") {
      if (!values.language.trim()) {
        ctx.addIssue({ code: "custom", path: ["language"], message: "Language is required for coding questions" });
      }
      const invalid = parseLines(values.testCases).filter((line) => !parseTestCaseLine(line));
      if (parseLines(values.testCases).length === 0) {
        ctx.addIssue({ code: "custom", path: ["testCases"], message: "Add at least one test case" });
      } else if (invalid.length > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["testCases"],
          message: 'Use "input => expected output" on each line (add "[hidden]" to hide it)',
        });
      }
    }
  });

export type ProblemFormValues = z.infer<typeof problemFormSchema>;

export function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Parses "input => expected [hidden]" into a test case, or null when malformed. */
export function parseTestCaseLine(line: string): TestCase | null {
  const isHidden = /\[hidden\]\s*$/i.test(line);
  const body = line.replace(/\[hidden\]\s*$/i, "").trim();
  const [input, expectedOutput, ...rest] = body.split("=>");
  if (rest.length > 0 || input === undefined || expectedOutput === undefined) return null;
  const trimmedInput = input.trim();
  const trimmedExpected = expectedOutput.trim();
  if (!trimmedExpected) return null;
  return { input: trimmedInput, expectedOutput: trimmedExpected, isHidden };
}

/** Formats stored test cases back into the editable text form. */
export function formatTestCases(testCases: TestCase[] | null | undefined): string {
  return (testCases ?? [])
    .map((testCase) => `${testCase.input} => ${testCase.expectedOutput}${testCase.isHidden ? " [hidden]" : ""}`)
    .join("\n");
}

export interface ProblemPayload {
  title: string;
  description: string;
  type: QuestionType;
  difficulty: ProblemFormValues["difficulty"];
  tags: string[];
  points: number;
  options?: string[];
  correctOption?: string;
  language?: string;
  starterCode?: string | null;
  testCases?: TestCase[];
  referenceAnswer?: string | null;
  timeLimitSec?: number | null;
  memoryLimitMb?: number | null;
}

/** Converts validated form state into the request body the API expects. */
export function toProblemPayload(values: ProblemFormValues): ProblemPayload {
  const base: ProblemPayload = {
    title: values.title.trim(),
    description: values.description.trim(),
    type: values.type,
    difficulty: values.difficulty,
    tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    points: Number(values.points),
  };

  if (values.type === "MCQ") {
    base.options = parseLines(values.options);
    base.correctOption = values.correctOption.trim();
  }

  if (values.type === "CODING") {
    base.language = values.language.trim();
    base.starterCode = values.starterCode.trim() || null;
    base.testCases = parseLines(values.testCases)
      .map(parseTestCaseLine)
      .filter((testCase): testCase is TestCase => testCase !== null);
    base.timeLimitSec = values.timeLimitSec ? Number(values.timeLimitSec) : null;
    base.memoryLimitMb = values.memoryLimitMb ? Number(values.memoryLimitMb) : null;
  }

  if (values.type === "WRITTEN") {
    base.referenceAnswer = values.referenceAnswer.trim() || null;
  }

  return base;
}
