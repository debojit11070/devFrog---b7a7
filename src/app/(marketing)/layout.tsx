import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getCurrentUser } from "@/lib/server/session";

export default async function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader user={user ? { fullName: user.fullName, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : null} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
