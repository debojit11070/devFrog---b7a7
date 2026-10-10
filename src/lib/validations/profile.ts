import { z } from "zod";

/** An optional URL field: empty string means "not set". */
const optionalUrl = z.union([z.literal(""), z.url("Enter a full URL, e.g. https://example.com")]);

export const accountSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  bio: z.string().trim().max(500, "Bio must be 500 characters or fewer"),
  avatarUrl: optionalUrl,
});

export type AccountFormValues = z.infer<typeof accountSchema>;

export const candidateProfileSchema = z.object({
  headline: z.string().trim().max(120, "Headline must be 120 characters or fewer"),
  skills: z.string().max(300, "Keep the skills list under 300 characters"),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  resumeUrl: optionalUrl,
});

export type CandidateProfileFormValues = z.infer<typeof candidateProfileSchema>;

export const companyProfileSchema = z.object({
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters").max(120),
  website: optionalUrl,
  logoUrl: optionalUrl,
  industry: z.string().trim().max(80, "Keep industry under 80 characters"),
  size: z.string().trim().max(30, "Keep size under 30 characters"),
  about: z.string().trim().max(1000, "About must be 1000 characters or fewer"),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

/** Splits "a, b, c" into trimmed, non-empty values. */
export function parseSkills(input: string): string[] {
  return input
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

/** Empty URL fields are sent as null so the API clears them. */
export function optionalUrlValue(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}
