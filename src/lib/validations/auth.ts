import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must include a letter")
      .regex(/\d/, "Password must include a number"),
    confirmPassword: z.string(),
    role: z.enum(["CANDIDATE", "COMPANY"], { message: "Choose an account type" }),
    companyName: z.string().trim().max(120, "Company name is too long"),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
    }
    if (values.role === "COMPANY" && values.companyName.length < 2) {
      ctx.addIssue({ code: "custom", path: ["companyName"], message: "Company name is required" });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
