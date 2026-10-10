import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">DevForge</p>
          <p className="mt-1 text-sm text-muted-foreground">Developer assessments that show what candidates can actually do.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/assessments" className="hover:text-foreground">Assessments</Link>
          <Link href="/services" className="hover:text-foreground">Services</Link>
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
          <Link href="/login" className="hover:text-foreground">Sign in</Link>
        </nav>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} DevForge. Payments are processed by Stripe in test mode.
      </div>
    </footer>
  );
}
