import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Layers, ShieldCheck, Trophy } from "lucide-react";
import { RecommendedAssessments } from "@/components/ai/recommended-assessments";
import { AssessmentCover } from "@/components/marketing/assessment-card";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ApiError } from "@/lib/api/error";
import type { Assessment, QuestionType } from "@/lib/api/types";
import { backendJson } from "@/lib/server/backend";
import { getCurrentUser } from "@/lib/server/session";
import { formatCurrency, formatDate, humanize } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadAssessment(id: string): Promise<Assessment | null> {
  try {
    return await backendJson<Assessment>(`/assessments/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const assessment = await loadAssessment(id).catch(() => null);
  if (!assessment) return { title: "Assessment not found" };
  return {
    title: assessment.title,
    description: assessment.description.slice(0, 160),
    openGraph: { title: `${assessment.title} | DevForge`, description: assessment.description.slice(0, 160) },
  };
}

export default async function AssessmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [assessment, user] = await Promise.all([loadAssessment(id), getCurrentUser()]);
  if (!assessment) notFound();

  const byType = assessment.problems.reduce<Record<string, { count: number; points: number }>>((acc, item) => {
    const entry = acc[item.problem.type] ?? { count: 0, points: 0 };
    entry.count += 1;
    entry.points += item.points;
    acc[item.problem.type] = entry;
    return acc;
  }, {});
  const languages = Array.from(new Set(assessment.problems.map((item) => item.problem.language).filter(Boolean)));

  const isFree = assessment.priceCents === 0;
  const totalPoints = assessment.problems.reduce((sum, item) => sum + item.points, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/assessments" className="hover:text-foreground">Assessments</Link>
          <span aria-hidden> / </span>
          <span className="text-foreground">{assessment.title}</span>
        </nav>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{assessment.title}</h1>
        {assessment.createdBy ? (
          <p className="mt-2 text-sm text-muted-foreground">Published by {assessment.createdBy.fullName}</p>
        ) : null}
        <AssessmentCover assessment={assessment} className="mt-6 h-56 rounded-xl sm:h-64" />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{assessment.description}</p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Key information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <Spec label="Time limit" value={`${assessment.durationMin} minutes`} />
              <Spec label="Passing score" value={`${assessment.passingScore}%`} />
              <Spec label="Questions" value={`${assessment.problems.length} (${totalPoints} points)`} />
              <Spec label="Price" value={isFree ? "Free" : formatCurrency(assessment.priceCents, assessment.currency)} />
              <Spec label="Published" value={formatDate(assessment.publishedAt ?? assessment.createdAt)} />
              <Spec label="Publisher" value={assessment.createdBy?.fullName ?? "DevForge company"} />
              {languages.length > 0 ? <Spec label="Languages" value={languages.join(", ")} /> : null}
              {(Object.keys(byType) as QuestionType[]).map((type) => (
                <Spec key={type} label={`${humanize(type)} questions`} value={`${byType[type].count} (${byType[type].points} pts)`} />
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What you will answer</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col divide-y divide-border">
              {assessment.problems.map((item, index) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                      {item.problem.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <StatusBadge value={item.problem.type} />
                      <StatusBadge value={item.problem.difficulty} />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{item.points} pts</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Price</p>
            {isFree ? <Badge tone="success">Free</Badge> : <p className="text-2xl font-semibold">{formatCurrency(assessment.priceCents, assessment.currency)}</p>}
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat icon={Clock} label="Duration" value={`${assessment.durationMin}m`} />
            <Stat icon={Layers} label="Questions" value={String(assessment.problems.length)} />
            <Stat icon={Trophy} label="Pass mark" value={`${assessment.passingScore}%`} />
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">Total available: {totalPoints} points.</p>

          <div className="mt-6 flex flex-col gap-3">
            {user?.role === "CANDIDATE" ? (
              <Button size="lg" asChild>
                <Link href="/candidate/invitations">Go to my invitations</Link>
              </Button>
            ) : user ? (
              <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Candidates take assessments. You are signed in as a {user.role.toLowerCase()}.
              </p>
            ) : (
              <Button size="lg" asChild>
                <Link href={`/login?next=${encodeURIComponent("/candidate/invitations")}`}>Sign in to take this</Link>
              </Button>
            )}
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              Invitations are sent by the company. Your answers are saved as you go.
            </p>
          </div>
        </Card>
      </aside>
    </div>

    <RecommendedAssessments assessmentId={assessment.id} className="mt-16" />
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <Icon className="mx-auto size-4 text-muted-foreground" aria-hidden />
      <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}
