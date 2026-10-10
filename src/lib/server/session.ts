import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { backendJson } from "@/lib/server/backend";
import type { User } from "@/lib/api/types";

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

/**
 * The signed-in user, or null. Memoised per request so the layout and any
 * page that needs the user only make one API call.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await backendJson<User>("/users/me", { token });
  } catch {
    return null;
  }
});
