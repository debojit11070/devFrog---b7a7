"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import type { User } from "@/lib/api/types";
import { ROLE_HOME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { href: "/", label: "Home" },
  { href: "/assessments", label: "Assessments" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
];

type HeaderUser = Pick<User, "fullName" | "email" | "role" | "avatarUrl">;

/** Sticky, full-width header. Logged-out visitors see 7 routes; signed-in users get a Dashboard link and a profile menu. */
export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = user ? [...PUBLIC_LINKS, { href: ROLE_HOME[user.role], label: "Dashboard" }] : PUBLIC_LINKS;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="glass sticky top-0 z-40 w-full rounded-none border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground shadow-soft">
            <Sparkles className="size-4" aria-hidden />
          </span>
          DevForge
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground",
                isActive(link.href) ? "bg-secondary font-medium text-secondary-foreground" : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav aria-label="Mobile" className="animate-in-up border-t border-border bg-card lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm hover:bg-muted",
                  isActive(link.href) ? "bg-secondary font-medium text-secondary-foreground" : "",
                )}
              >
                {link.label}
              </Link>
            ))}
            {user ? null : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>Get started</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
