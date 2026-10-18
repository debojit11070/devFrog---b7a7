"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { NAV_BY_ROLE } from "@/components/layout/nav-config";
import { authRequest } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/error";
import type { User } from "@/lib/api/types";
import { ROLE_LABEL } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";

export function AppShell({ user, children }: { user: User; children: ReactNode }) {
  const navItems = NAV_BY_ROLE[user.role];
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  // Escape closes the mobile drawer, as keyboard users expect.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen, setMobileNavOpen]);

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <SidebarHeader />
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav items={navItems} />
        </div>
        <UserCard user={user} />
      </aside>

      {/* Mobile drawer: always mounted so the slide-in/out transitions can play in both directions. */}
      <div className={cn("fixed inset-0 z-40 lg:hidden", mobileNavOpen ? "" : "pointer-events-none")} inert={!mobileNavOpen}>
        <button
          type="button"
          aria-label="Close navigation"
          className={cn(
            "absolute inset-0 bg-slate-900/40 transition-opacity duration-200",
            mobileNavOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileNavOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          aria-hidden={!mobileNavOpen}
          className={cn(
            "glass absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-y-0 border-l-0 transition-transform duration-200 ease-out",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between pr-3">
            <SidebarHeader />
            <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}>
              <X />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <SidebarNav items={navItems} onNavigate={() => setMobileNavOpen(false)} />
          </div>
          <UserCard user={user} />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between gap-3 rounded-none border-x-0 border-t-0 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Open navigation" className="lg:hidden" onClick={() => setMobileNavOpen(true)}>
              <Menu />
            </Button>
            <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden">
              <BrandMark />
              DevForge
            </Link>
            <p className="hidden text-sm text-muted-foreground lg:block">
              {ROLE_LABEL[user.role]} dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div key={pathname} className="mx-auto w-full max-w-6xl animate-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground shadow-soft">
      <Sparkles className="size-4" aria-hidden />
    </span>
  );
}

function SidebarHeader() {
  return (
    <Link href="/" className="flex h-16 items-center gap-2.5 px-5 font-semibold tracking-tight">
      <BrandMark />
      DevForge
    </Link>
  );
}

function UserCard({ user }: { user: User }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function logout() {
    try {
      await authRequest("/api/auth/logout");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
    // Clear cached per-user data before leaving, so the next account starts clean.
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-lg p-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-sm font-semibold text-secondary-foreground ring-1 ring-inset ring-primary/10">
          {getInitials(user.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
        </div>
      </div>
      <Button variant="ghost" className="mt-1 w-full justify-start text-muted-foreground" onClick={logout}>
        <LogOut aria-hidden />
        Sign out
      </Button>
    </div>
  );
}
