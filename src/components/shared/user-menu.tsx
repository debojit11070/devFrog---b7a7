"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authRequest } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/error";
import type { User } from "@/lib/api/types";
import { ROLE_HOME, ROLE_LABEL, ROLE_PROFILE } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

/** Profile icon + dropdown (dashboard, profile, sign out). Shared by the public header and the dashboard top bar. */
export function UserMenu({ user }: { user: Pick<User, "fullName" | "email" | "role" | "avatarUrl"> }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function logout() {
    try {
      await authRequest("/api/auth/logout");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open profile menu"
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:bg-muted"
      >
        <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            getInitials(user.fullName)
          )}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="truncate font-medium">{user.fullName}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs font-normal text-primary">{ROLE_LABEL[user.role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROLE_HOME[user.role]}>
            <LayoutDashboard aria-hidden /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROLE_PROFILE[user.role]}>
            <UserRound aria-hidden /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void logout()}>
          <LogOut aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
