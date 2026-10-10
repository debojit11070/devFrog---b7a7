import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/error";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: typeof Inbox;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-indigo-100 text-primary ring-1 ring-inset ring-primary/10">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="max-w-sm">
        <p className="font-medium text-foreground">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Inline error with a retry button, used when a query fails. */
export function ErrorState({ error, onRetry, title = "We couldn't load this" }: { error: unknown; onRetry?: () => void; title?: string }) {
  return (
    <Card className="border-rose-200/70 bg-rose-50/40">
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-rose-100 text-destructive">
          <AlertTriangle className="size-6" aria-hidden />
        </div>
        <div className="max-w-md">
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground" role="alert">
            {getErrorMessage(error)}
          </p>
        </div>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw aria-hidden />
            Try again
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

/** Generic skeleton for a card list or content block while data loads. */
export function ContentSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}
