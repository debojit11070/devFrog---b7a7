import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList, Clock, Code2, Layers, PenLine, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Assessment, QuestionType } from "@/lib/api/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const TYPE_ICON = { CODING: Code2, MCQ: ClipboardList, WRITTEN: PenLine } as const;

// Cover palettes use only the three brand hues; the id picks one so every assessment keeps its look.
const COVERS = [
  "from-primary to-indigo-500",
  "from-emerald-600 to-teal-500",
  "from-rose-600 to-pink-500",
] as const;

/** The question type that appears most often, so the cover reflects what the test is actually about. */
export function dominantType(assessment: Assessment): QuestionType | null {
  const counts: Record<QuestionType, number> = { CODING: 0, MCQ: 0, WRITTEN: 0 };
  let known = 0;
  // List responses only carry problem ids, so details may be missing.
  for (const item of assessment.problems) {
    const type = item.problem?.type;
    if (type) {
      counts[type] += 1;
      known += 1;
    }
  }
  if (known === 0) return null;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as QuestionType;
}

function hashIndex(value: string, size: number): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % size;
}

export function AssessmentCover({ assessment, className }: { assessment: Assessment; className?: string }) {
  const type = dominantType(assessment);
  const Icon = type ? TYPE_ICON[type] : ClipboardList;
  const types = Array.from(new Set(assessment.problems.map((item) => item.problem?.type).filter((t): t is QuestionType => Boolean(t))));
  return (
    <div
      className={cn(
        "relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br text-white",
        COVERS[hashIndex(assessment.id, COVERS.length)],
        className,
      )}
      role="img"
      aria-label={`${type ? type.toLowerCase() : ""} assessment cover`.trim()}
    >
      <div className="bg-dot-grid absolute inset-0 opacity-30" aria-hidden />
      <Icon className="relative size-14 drop-shadow" strokeWidth={1.5} aria-hidden />
      <div className="absolute bottom-3 left-3 flex gap-1.5">
        {types.map((item) => (
          <span key={item} className="rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
            {item === "MCQ" ? "MCQ" : item === "CODING" ? "Coding" : "Written"}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Public summary card used by the catalog, the home page and related items. Fixed height so grids stay even. */
export function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const problemCount = assessment.problemCount ?? assessment.problems.length;
  const isFree = assessment.priceCents === 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-raised">
      <div className="relative">
        <AssessmentCover assessment={assessment} />
        <Badge tone={isFree ? "success" : "brand"} className="absolute right-3 top-3 bg-card">
          {isFree ? "Free" : formatCurrency(assessment.priceCents, assessment.currency)}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-1 text-base font-semibold leading-snug">{assessment.title}</h3>
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{assessment.description}</p>
        <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <Meta icon={Clock} label="Duration" value={`${assessment.durationMin} min`} />
          <Meta icon={Layers} label="Questions" value={String(problemCount)} />
          <Meta icon={Trophy} label="Pass mark" value={`${assessment.passingScore}%`} />
          <Meta icon={CalendarDays} label="Published" value={formatDate(assessment.publishedAt ?? assessment.createdAt)} />
        </dl>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/assessments/${assessment.id}`}>
            View details
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <dt className="sr-only">{label}</dt>
      <dd className="truncate font-medium text-foreground">{value}</dd>
    </div>
  );
}

/** Matches AssessmentCard's footprint so the loading state does not shift the layout. */
export function AssessmentCardSkeleton() {
  return (
    <div className="flex h-[26rem] flex-col overflow-hidden rounded-xl border border-border bg-card" aria-hidden>
      <div className="h-40 animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="mt-auto h-14 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
