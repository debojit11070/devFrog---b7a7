import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/assessments", label: "Assessments" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Server-rendered header. The mobile menu uses <details>, so it works without client JavaScript. */
export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground shadow-soft">
            <Sparkles className="size-4" aria-hidden />
          </span>
          DevForge
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>

        <details className="group relative md:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md border border-border bg-card text-sm font-medium [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <div className="glass animate-in-up absolute right-0 top-12 flex w-56 flex-col gap-1 rounded-xl p-2">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                {link.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-border" />
            <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              Sign in
            </Link>
            <Link href="/register" className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">
              Get started
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
