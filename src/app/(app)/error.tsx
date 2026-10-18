"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/error";

/** Keeps the navigation visible when a dashboard page crashes. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card role="alert" className="mx-auto max-w-lg border-destructive/30 p-8 text-center">
      <AlertTriangle className="mx-auto size-8 text-destructive" aria-hidden />
      <h1 className="mt-4 text-lg font-semibold">This page hit a problem</h1>
      <p className="mt-2 text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      <Button className="mt-6" onClick={reset}>
        <RotateCw aria-hidden />
        Try again
      </Button>
    </Card>
  );
}
