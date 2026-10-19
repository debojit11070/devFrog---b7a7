// Shapes returned by the B7A6 Express API (see B7A6/src/app/modules/**).
// Every response is wrapped in { success, message, data }.

export type Role = "CANDIDATE" | "COMPANY" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING";
export type QuestionType = "MCQ" | "WRITTEN" | "CODING";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EXPIRED" | "EVALUATED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "REFUNDED";
export type PaymentPurpose = "ASSESSMENT_FEE" | "PREMIUM_JOB_POSTING" | "OTHER";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CandidateProfile {
  headline: string | null;
  skills: string[];
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  resumeUrl: string | null;
}

export interface CompanyProfile {
  companyName: string;
  website: string | null;
  logoUrl: string | null;
  industry: string | null;
  size: string | null;
  about: string | null;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  candidateProfile?: CandidateProfile | null;
  companyProfile?: CompanyProfile | null;
}

export interface AuthPayload {
  user: User;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  difficulty: Difficulty;
  tags: string[];
  points: number;
  language: string | null;
  starterCode: string | null;
  timeLimitSec: number | null;
  memoryLimitMb: number | null;
  /** MCQ options (returned on single-problem reads). */
  options?: string[];
  /** Visible to owners and admins only. */
  testCases?: TestCase[] | null;
  referenceAnswer?: string | null;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface AssessmentProblem {
  id: string;
  assessmentId: string;
  problemId: string;
  order: number;
  points: number;
  problem: Pick<Problem, "id" | "title" | "type" | "difficulty" | "description" | "points" | "language"> & {
    timeLimitSec?: number | null;
  };
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  status: AssessmentStatus;
  durationMin: number;
  passingScore: number;
  priceCents: number;
  currency: string;
  createdById: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  problems: AssessmentProblem[];
  createdBy?: { id: string; fullName: string };
  problemCount?: number;
}

export interface Invitation {
  id: string;
  assessmentId: string;
  candidateId: string;
  status: InvitationStatus;
  invitedById: string;
  invitedAt: string;
  expiresAt: string;
  assessment: Pick<Assessment, "id" | "title" | "description" | "durationMin" | "priceCents" | "currency" | "passingScore" | "status"> & {
    problems?: AssessmentProblem[];
  };
}

export interface Answer {
  id: string;
  attemptId: string;
  problemId: string;
  mcqOption: string | null;
  writtenAnswer: string | null;
  codeAnswer: string | null;
  codeLanguage: string | null;
  isCorrect: boolean | null;
  pointsAwarded: number;
  feedback: string | null;
  submittedAt: string;
}

export interface Attempt {
  id: string;
  invitationId: string;
  candidateId: string;
  assessmentId: string;
  status: AttemptStatus;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  evaluatedAt: string | null;
  score: number | null;
  totalPoints: number | null;
  passed: boolean | null;
  answers?: Answer[];
  candidate?: { id: string; fullName: string; email: string };
}

export interface Payment {
  id: string;
  userId: string;
  assessmentId: string | null;
  purpose: PaymentPurpose;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  checkoutUrl: string | null;
  createdAt: string;
  assessment?: { id: string; title: string } | null;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  meta: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  actor?: { id: string; fullName: string; email: string } | null;
}

export interface AdminStats {
  users: { total: number; candidates: number; companies: number };
  assessments: { total: number };
  attempts: {
    total: number;
    byStatus: Array<{ status: AttemptStatus; _count: { _all: number } }>;
  };
  payments: { succeededCount: number; totalRevenueCents: number };
  recentSignups: Array<Pick<User, "id" | "email" | "fullName" | "role" | "createdAt">>;
}

export interface PaymentActionResult {
  payment?: Payment | null;
  mode?: string;
  checkoutUrl?: string | null;
  sessionId?: string;
}

/** Compact assessment returned by the /ai endpoints. */
export interface AiAssessmentItem {
  id: string;
  title: string;
  durationMin: number;
  priceCents: number;
  currency: string;
  tags: string[];
  difficulty: string | null;
  /** Only on recommendations, and only when topics overlap. */
  reason?: string;
}

export interface AiSuggestions {
  items: AiAssessmentItem[];
  reranked: boolean;
}

export interface AiRecommendations {
  items: AiAssessmentItem[];
  personalized: boolean;
}
