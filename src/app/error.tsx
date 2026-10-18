"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/error";

/** Catches crashes in any route segment below the root layout. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div role="alert" className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" aria-hidden />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{getErrorMessage(error)}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button onClick={reset}>
            <RotateCw aria-hidden />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
