import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
          <FileQuestion className="size-8" aria-hidden />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">We can&apos;t find that page</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The link may be broken, or the page may have moved. Head back and try another route.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/assessments">Browse assessments</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
