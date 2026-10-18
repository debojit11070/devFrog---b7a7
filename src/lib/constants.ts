import type { Role, UserStatus } from "@/lib/api/types";

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  COMPANY: "/company",
  CANDIDATE: "/candidate",
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  COMPANY: "Company",
  CANDIDATE: "Candidate",
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  PENDING: "Pending",
};

/** Seeded accounts from the B7A6 README. Used by the one-click demo login buttons. */
export const DEMO_ACCOUNTS: Array<{
  role: Role;
  label: string;
  description: string;
  email: string;
  password: string;
}> = [
  {
    role: "ADMIN",
    label: "Admin",
    description: "Oversee users, platform stats and the audit trail.",
    email: "admin@assessment.dev",
    password: "Admin@12345",
  },
  {
    role: "COMPANY",
    label: "Company",
    description: "Build assessments, invite candidates and review attempts.",
    email: "company@assessment.dev",
    password: "Company@12345",
  },
  {
    role: "CANDIDATE",
    label: "Candidate",
    description: "Accept invitations, take assessments and pay for premium ones.",
    email: "candidate@assessment.dev",
    password: "Candidate@12345",
  },
];

export const PAGE_SIZE = 10;

export const ROLE_PROFILE: Record<Role, string> = {
  ADMIN: "/admin/profile",
  COMPANY: "/company/profile",
  CANDIDATE: "/candidate/profile",
};
