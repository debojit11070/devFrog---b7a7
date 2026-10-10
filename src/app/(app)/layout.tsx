import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { UserProvider } from "@/providers/user-provider";
import { getCurrentUser } from "@/lib/server/session";

/**
 * Shared shell for every signed-in area. The user is loaded once on the server,
 * so pages render with their identity and navigation without a client round trip.
 */
export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <UserProvider user={user}>
      <AppShell user={user}>{children}</AppShell>
    </UserProvider>
  );
}
