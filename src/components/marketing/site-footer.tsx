import Link from "next/link";
import { Mail, MessageSquare, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/shared/brand-icons";
import { SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/assessments", label: "Browse assessments" },
      { href: "/services", label: "Services" },
      { href: "/register", label: "Create an account" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/help", label: "Help centre & FAQ" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

const SOCIALS = [
  { href: SITE.social.github, label: "GitHub", icon: GithubIcon },
  { href: SITE.social.linkedin, label: "LinkedIn", icon: LinkedinIcon },
  { href: SITE.social.x, label: "X", icon: XIcon },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground">
              <Sparkles className="size-4" aria-hidden />
            </span>
            DevForge
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Structured coding, written and multiple-choice assessments that show what candidates can actually do.
          </p>
          <ul className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
            {SITE.email ? (
              <li>
                <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 hover:text-foreground">
                  <Mail className="size-4" aria-hidden /> {SITE.email}
                </a>
              </li>
            ) : null}
            <li>
              <Link href="/contact" className="inline-flex items-center gap-2 hover:text-foreground">
                <MessageSquare className="size-4" aria-hidden /> Send us a message
              </Link>
            </li>
          </ul>
          <ul className="mt-5 flex gap-2">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <social.icon className="size-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-semibold">{column.title}</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} DevForge. Payments are processed by Stripe in test mode.
      </div>
    </footer>
  );
}
