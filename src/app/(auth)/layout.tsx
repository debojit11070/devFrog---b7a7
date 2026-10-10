import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-indigo-900 p-12 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-dot-grid opacity-20" aria-hidden />
        <Link href="/" className="relative flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <Sparkles className="size-4" aria-hidden />
          </span>
          DevForge
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">Structured assessments, from invitation to evaluation.</h2>
          <p className="mt-4 text-indigo-100">
            Companies publish real coding, written and multiple-choice tests. Candidates take them in a timed, auto-saved
            workspace, and every attempt is scored.
          </p>
        </div>
        <p className="relative text-sm text-indigo-200">Trusted by teams hiring junior to senior engineers.</p>
      </aside>
      <main id="main" className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md animate-in-up">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 font-semibold lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground shadow-soft">
              <Sparkles className="size-4" aria-hidden />
            </span>
            DevForge
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
