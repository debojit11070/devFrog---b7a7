/** Public contact details. Override per deployment with NEXT_PUBLIC_* variables (see .env.example). */
export const SITE = {
  name: "DevForge",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  social: {
    github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/Apollo-Level2-Web-Dev/B7A7",
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com",
    x: process.env.NEXT_PUBLIC_X_URL ?? "https://x.com",
  },
} as const;
