"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authRequest } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { safeNextPath } from "@/lib/auth/redirect";
import { ROLE_HOME } from "@/lib/constants";

export interface Credentials {
  email: string;
  password: string;
}

/** Signs in through the Next.js auth route (which sets HTTP-only cookies) and routes by role. */
export function useSignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: (credentials: Credentials) =>
      authRequest<{ user: User }>("/api/auth/login", credentials),
    onSuccess: ({ user }) => {
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}`);
      const destination = safeNextPath(searchParams.get("next")) ?? ROLE_HOME[user.role];
      router.replace(destination);
      router.refresh();
    },
  });
}
