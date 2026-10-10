"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@/lib/api/types";

const UserContext = createContext<User | null>(null);

/** Receives the signed-in user from the server layout, so the client never refetches it on load. */
export function UserProvider({ user, children }: { user: User; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useCurrentUser(): User {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useCurrentUser must be used inside an authenticated layout");
  }
  return user;
}
